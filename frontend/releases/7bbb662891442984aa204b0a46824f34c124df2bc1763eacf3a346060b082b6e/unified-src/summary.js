import { translate } from "../i18n.js";
import { navigationPath } from "../navigation.js";
import { applyGlassWaveTheme } from "./services/theme.js";

const element = (tag, attributes = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes))
    node.setAttribute(key, String(value));
  for (const child of children.flat())
    if (child != null)
      node.append(
        child instanceof Node ? child : document.createTextNode(String(child)),
      );
  return node;
};

const known = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const meals = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export class MacroMateSummary extends HTMLElement {
  format(value) {
    return known(value)
      ? new Intl.NumberFormat(this.hass?.language || "de", {
          maximumFractionDigits: 1,
        }).format(value)
      : this.t("Unknown");
  }
  amount(value, unit) {
    return known(value) ? `${this.format(value)} ${unit}` : this.t("Unknown");
  }
  t(key, values) {
    return translate(key, this.hass?.language || "de", values);
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.generation = 0;
    this.appearanceQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.onAppearanceChange = () => this.applyTheme();
    this.stylesheet = element("link", {
      rel: "stylesheet",
      href: new URL("../macromate-card.css", import.meta.url).href,
    });
  }
  setConfig(config) {
    if (
      !config ||
      typeof config !== "object" ||
      Array.isArray(config) ||
      (config.title !== undefined && typeof config.title !== "string")
    ) {
      throw new Error("Ungültige Kartenkonfiguration: title muss Text sein.");
    }
    this.config = {
      title: config.title,
      navigation_path: navigationPath(config.navigation_path),
    };
    if (this.isConnected) this.render();
  }
  set hass(hass) {
    const context = {
      connection: hass?.connection,
      userId: hass?.user?.id,
      admin: hass?.user?.is_admin,
    };
    const changed =
      this.context?.connection !== context.connection ||
      this.context?.userId !== context.userId ||
      this.context?.admin !== context.admin;
    this.context = context;
    this._hass = hass;
    this.applyTheme();
    if (changed) {
      this.invalidate();
      if (this.isConnected) {
        this.render();
        this.startLive();
        this.loadDiary();
      }
    }
  }
  get hass() {
    return this._hass;
  }
  get authorized() {
    return this._hass?.user?.is_admin === true;
  }
  connectedCallback() {
    this.appearanceQuery.addEventListener("change", this.onAppearanceChange);
    this.applyTheme();
    this.render();
    this.startLive();
    this.loadDiary();
  }
  disconnectedCallback() {
    this.appearanceQuery.removeEventListener("change", this.onAppearanceChange);
    this.invalidate();
  }
  applyTheme() {
    applyGlassWaveTheme(
      this,
      {},
      this._hass?.themes?.darkMode ?? this.appearanceQuery.matches,
    );
  }
  invalidate() {
    this.generation++;
    this.data = null;
    this.busy = false;
    this.error = false;
    this.queued = false;
    clearInterval(this.liveTimer);
    clearTimeout(this.refreshTimer);
    this.liveTimer = null;
    this.refreshTimer = null;
    const unsubscribe = this.unsubscribe;
    this.unsubscribe = null;
    this.releaseSubscription(unsubscribe);
  }
  releaseSubscription(unsubscribe) {
    if (typeof unsubscribe !== "function") return;
    try {
      Promise.resolve(unsubscribe()).catch(() => {});
    } catch {}
  }
  startLive() {
    if (!this.isConnected || !this.authorized) return;
    const generation = this.generation;
    this.liveTimer = setInterval(() => this.queueRefresh(), 60000);
    const connection = this._hass.connection;
    if (connection?.subscribeEvents)
      Promise.resolve()
        .then(() => {
          if (
            generation !== this.generation ||
            !this.isConnected ||
            !this.authorized
          )
            return null;
          return connection.subscribeEvents(() => {
            if (generation === this.generation) this.queueRefresh();
          }, "macromate_updated");
        })
        .then((unsubscribe) => {
          if (!unsubscribe) return;
          if (
            generation !== this.generation ||
            !this.isConnected ||
            !this.authorized
          )
            this.releaseSubscription(unsubscribe);
          else this.unsubscribe = unsubscribe;
        })
        .catch(() => {});
  }
  queueRefresh() {
    if (!this.isConnected || !this.authorized) return;
    this.queued = true;
    this.drainRefresh();
  }
  drainRefresh() {
    if (
      !this.queued ||
      this.busy ||
      this.refreshTimer ||
      !this.isConnected ||
      !this.authorized
    )
      return;
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      if (this.busy) return;
      this.queued = false;
      this.loadDiary();
    }, 150);
  }
  getCardSize() {
    const height = this.shadowRoot
      .querySelector("ha-card")
      ?.getBoundingClientRect().height;
    return height ? Math.ceil(height / 50) : 15;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 12 };
  }
  static getStubConfig() {
    return { type: "custom:macromate-card" };
  }
  isCurrent(generation, context) {
    return (
      generation === this.generation &&
      this.isConnected &&
      this.authorized &&
      context?.userId === this._hass.user?.id &&
      context?.connection === this._hass.connection
    );
  }
  async loadDiary() {
    if (!this.isConnected || !this.authorized || this.busy) return;
    const generation = this.generation;
    const context = this.context;
    this.busy = true;
    this.error = false;
    this.render();
    try {
      const data = await this._hass.callWS({
        type: "macromate/command",
        action: "diary",
        payload: {},
      });
      if (!this.isCurrent(generation, context)) return;
      this.data = data;
    } catch {
      if (!this.isCurrent(generation, context)) return;
      this.data = null;
      this.error = true;
    } finally {
      if (this.isCurrent(generation, context)) {
        this.busy = false;
        this.render();
        this.drainRefresh();
      }
    }
  }
  renderEnergy() {
    const value = this.data.totals?.calories;
    const target = this.data.recommendation?.calorie_target;
    const incomplete =
      this.data.nutrition_missing?.includes("calories") === true;
    const goalKnown = known(target) && target > 0;
    const exact = known(value) && !incomplete && goalKnown;
    const remaining = exact ? target - value : null;
    const over = exact && remaining < 0;
    const label = over ? this.t("Over target") : this.t("Remaining");
    const percent = exact ? Math.min(100, (value / target) * 100) : null;
    const state = incomplete
      ? this.t("Incomplete")
      : !known(value)
        ? this.t("Unknown")
        : this.t("Unknown target");
    const ring = element(
      "div",
      {
        class: `calorie-ring${exact ? "" : " unknown"}${over ? " over-budget" : ""}`,
        role: "img",
        "aria-label": exact
          ? `${this.amount(Math.abs(remaining), "kcal")} ${label}`
          : `Kalorien: ${state}`,
        ...(exact
          ? { "data-progress": percent, style: `--progress:${percent}%` }
          : {}),
      },
      element(
        "div",
        { class: "ring-center" },
        element(
          "span",
          { class: "ring-label" },
          exact ? label : this.t("Calories"),
        ),
        element(
          "strong",
          { class: exact ? "remaining" : "ring-state" },
          exact ? this.format(Math.abs(remaining)) : state,
        ),
        element(
          "span",
          { class: "ring-unit" },
          exact
            ? "kcal"
            : incomplete
              ? this.t("Values missing")
              : !this.data.recommendation
                ? this.t("Set up profile")
                : this.t("No reliable balance"),
        ),
      ),
    );
    const consumed = known(value)
      ? `${this.amount(value, "kcal")}${incomplete ? " " + this.t("known") : ""}`
      : this.t("Unknown");
    const recommendation = this.data.recommendation;
    const activeKnown =
      typeof this.data.date === "string" &&
      this.data.date.length > 0 &&
      this.data.date === this.data.today &&
      recommendation?.budget_source === "bmr_plus_active" &&
      !recommendation.fallback_reasons?.includes(
        "active_calories_unavailable",
      ) &&
      known(recommendation.active_calories);
    return element(
      "section",
      { class: "energy", "aria-label": this.t("Calories") },
      ring,
      element(
        "div",
        { class: "energy-detail" },
        element(
          "div",
          {},
          element("span", {}, this.t("Consumed")),
          element("strong", {}, consumed),
        ),
        element("span", { class: "detail-divider", "aria-hidden": "true" }),
        element(
          "div",
          {},
          element("span", {}, this.t("Daily target")),
          element(
            "strong",
            {},
            goalKnown ? this.amount(target, "kcal") : this.t("Unknown target"),
          ),
        ),
        element("span", { class: "detail-divider", "aria-hidden": "true" }),
        element(
          "div",
          { "data-metric": "active-calories" },
          element("span", {}, this.t("Active calories")),
          element(
            "strong",
            {},
            activeKnown
              ? this.amount(recommendation.active_calories, "kcal")
              : this.t("Unavailable"),
          ),
        ),
      ),
    );
  }
  renderMacros() {
    const section = element("section", {
      class: "macros",
      "aria-label": this.t("Macronutrients"),
    });
    for (const [key, label] of [
      ["carbs", this.t("Carbohydrates")],
      ["protein", this.t("Protein")],
      ["fat", this.t("Fat")],
    ]) {
      const value = this.data.totals?.[key];
      const target = this.data.recommendation?.[key];
      const incomplete = this.data.nutrition_missing?.includes(key) === true;
      const goalKnown = known(target) && target > 0;
      const row = element(
        "div",
        { class: `macro ${key}`, "data-nutrient": key },
        element(
          "div",
          { class: "macro-line" },
          element("span", { class: "macro-label" }, label),
          element(
            "span",
            { class: "macro-values" },
            element(
              "strong",
              {},
              incomplete
                ? this.t("Incomplete")
                : goalKnown && known(value)
                  ? this.format(value)
                  : this.amount(value, "g"),
            ),
            incomplete
              ? null
              : goalKnown
                ? ` / ${this.format(target)} g`
                : element(
                    "span",
                    { class: "unknown-goal" },
                    " · " + this.t("Unknown target"),
                  ),
          ),
        ),
      );
      if (incomplete)
        row.append(
          element(
            "small",
            {},
            known(value)
              ? `${this.amount(value, "g")} ${this.t("known")} · ${this.t("more values are missing")}`
              : this.t("Values missing"),
          ),
        );
      else if (goalKnown && known(value))
        row.append(
          element("progress", {
            max: target,
            value: Math.min(value, target),
            "aria-label": label,
          }),
        );
      section.append(row);
    }
    return section;
  }
  renderMeals() {
    const section = element(
      "section",
      { class: "meals", "aria-label": this.t("Meals") },
      element("h3", {}, this.t("Meals")),
    );
    for (const [key, label] of Object.entries(meals)) {
      const meal = this.data.meals?.[key];
      const count = Array.isArray(meal?.entries) ? meal.entries.length : null;
      const incomplete = meal?.nutrition_missing?.includes("calories") === true;
      section.append(
        element(
          "div",
          { class: "meal", "data-meal": key },
          element(
            "div",
            {},
            element("span", { class: "meal-name" }, this.t(label)),
            element(
              "span",
              { class: "meal-count" },
              count === null
                ? this.t("Entries unknown")
                : `${count} ${count === 1 ? this.t("entry") : this.t("entries")}`,
            ),
          ),
          element(
            "strong",
            {},
            incomplete
              ? this.t("Incomplete")
              : this.amount(meal?.totals?.calories, "kcal"),
          ),
        ),
      );
    }
    return section;
  }
  render() {
    const restoreFocus =
      this.shadowRoot.activeElement?.classList.contains("diary-link");
    const date = this.data?.today;
    const content = element(
      "ha-card",
      {
        "data-state": this.error ? "error" : this.data ? "ready" : "loading",
        "aria-busy": this.busy ? "true" : "false",
      },
      element(
        "header",
        {},
        element(
          "div",
          { class: "brand" },
          element("h2", {}, this.config?.title || "MacroMate"),
          element("span", { class: "subtitle" }, this.t("Nutrition today")),
        ),
        element(
          "time",
          {},
          date ? date.split("-").reverse().join(".") : this.t("Today"),
        ),
      ),
    );
    if (this.data) {
      content.append(
        this.renderEnergy(),
        this.renderMacros(),
        this.renderMeals(),
      );
    } else if (this.error) {
      const retry = element(
        "button",
        { type: "button", class: "retry" },
        this.t("Try again"),
      );
      retry.addEventListener("click", () => this.loadDiary());
      content.append(
        element(
          "div",
          { class: "notice", role: "status", "aria-live": "polite" },
          element("p", {}, this.t("Could not load the daily summary.")),
          retry,
        ),
      );
    } else
      content.append(
        element(
          "p",
          { class: "notice", role: "status", "aria-live": "polite" },
          !this._hass
            ? this.t("Connecting to Home Assistant…")
            : !this.authorized
              ? this.t("Available to administrators only.")
              : this.t("Loading daily summary…"),
        ),
      );
    const path = navigationPath(this.config?.navigation_path);
    const open = element(
      path ? "a" : "button",
      { class: "diary-link", ...(path ? { href: path } : { type: "button" }) },
      this.t("Open diary"),
      element("span", { "aria-hidden": "true" }, "↗"),
    );
    if (!path)
      open.addEventListener("click", () =>
        this.dispatchEvent(
          new CustomEvent("macromate-open-app", {
            bubbles: true,
            composed: true,
          }),
        ),
      );
    content.append(open);
    this.shadowRoot.replaceChildren(this.stylesheet, content);
    if (restoreFocus)
      content.querySelector(".diary-link").focus({ preventScroll: true });
  }
}
if (!customElements.get("mm-summary"))
  customElements.define("mm-summary", MacroMateSummary);
