import { translator } from "./i18n.js";
import { el, button, field, nutrients, display, MEALS } from "./dom.js";
import { quickEntry } from "./entry-ui.js";
export function selectField(label, name, options, value) {
  const input = el(
    "select",
    { name, "aria-label": label },
    ...options.map(([id, text]) => el("option", { value: id }, text)),
  );
  if (value != null) input.value = value;
  return el("label", {}, el("span", {}, label), input);
}
export function positive(input) {
  const n = Number(input.value);
  if (!input.value.trim() || !Number.isFinite(n) || n <= 0)
    throw { code: "invalid_request" };
  return n;
}
export class FoodBrowser {
  relocalize() {
    const old = this.node;
    if (!old) return;
    const active = this.panel.shadowRoot.activeElement;
    const inputs = [...old.querySelectorAll("input,select")];
    const focus = inputs.indexOf(active);
    const values = inputs.map((input) => ({
      value: input.value,
      checked: input.checked,
    }));
    const food = this.food;
    const next = this.render();
    old.replaceWith(next);
    if (food) this.showFood(food);
    const current = [...next.querySelectorAll("input,select")];
    current.forEach((input, index) => {
      if (values[index] && input.type !== "file") {
        input.value = values[index].value;
        input.checked = values[index].checked;
      }
    });
    current.forEach((input) => input.dispatchEvent(new Event("input")));
    if (focus >= 0) current[focus]?.focus({ preventScroll: true });
  }
  display(value, unit) {
    return display(value, unit, this.panel.hass.language || "de");
  }
  renderNutrients(values) {
    return nutrients(values, this.panel.hass.language || "de");
  }

  constructor(panel) {
    this.t = translator(panel);
    this.panel = panel;
    this.sequence = 0;
  }
  render() {
    this.query = field(this.t("Name or barcode"), {
      type: "search",
      "aria-label": this.t("Search foods"),
      placeholder: this.t("Food name or EAN"),
      maxlength: 200,
      autocomplete: "off",
    });
    this.filter = selectField(
      this.t("Filter"),
      "filter",
      [
        ["all", this.t("All")],
        ["favorites", this.t("Favorites")],
        ["recent", this.t("Recently logged")],
        ["custom", this.t("Custom foods")],
      ],
      "all",
    );
    this.online = field(this.t("Online search (Open Food Facts)"), {
      type: "checkbox",
    });
    this.results = el("div", { class: "results", "aria-live": "polite" });
    this.detail = el("div", { class: "food-detail" });
    this.node = el(
      "div",
      { class: "card" },
      el("h2", {}, this.t("Log food")),
      el(
        "form",
        {
          onsubmit: (event) => {
            event.preventDefault();
            this.search();
          },
        },
        el(
          "div",
          { class: "toolbar" },
          this.query,
          this.filter,
          el("button", { type: "submit", class: "primary" }, this.t("Search")),
          button(this.t("Quick entry"), () => quickEntry(this.panel), {
            "data-write": true,
          }),
          this.panel.barcode.render(),
        ),
        this.online,
        el(
          "small",
          {},
          this.t(
            "Search by name or barcode. Choose Quick entry for your own nutrients. Local only by default; online requires submission and consent in integration settings.",
          ),
        ),
      ),
      this.results,
      this.detail,
    );
    return this.node;
  }
  invalidate() {
    this.sequence++;
    this.results.replaceChildren();
    this.detail.replaceChildren();
    this.food = null;
  }
  readContext() {
    return {
      sequence: ++this.sequence,
      connection: this.panel.hass.connection,
      userId: this.panel.hass.user?.id,
      authorized: this.panel.authorized,
    };
  }
  current(context) {
    return (
      context.sequence === this.sequence &&
      context.connection === this.panel.hass.connection &&
      context.userId === this.panel.hass.user?.id &&
      context.authorized &&
      this.panel.authorized &&
      this.panel.isConnected
    );
  }
  async search() {
    const context = this.readContext();
    try {
      const query = this.query.querySelector("input").value;
      this.detail.replaceChildren();
      if (
        /^[\p{Decimal_Number}\s]+$/u.test(query) &&
        /\p{Decimal_Number}/u.test(query)
      ) {
        await this.panel.barcode.lookup(query);
        return;
      }
      if (
        !query.trim() &&
        this.filter.querySelector("select").value === "all"
      ) {
        this.results.replaceChildren(
          el(
            "p",
            {},
            this.t(
              "Enter a name or barcode. For your own nutrients, enter a name and choose Quick entry.",
            ),
          ),
        );
        this.query.querySelector("input").focus();
        return;
      }
      const result = await this.panel.client.read("search_foods", {
        query: this.query.querySelector("input").value,
        online: this.online.querySelector("input").checked,
        filter: this.filter.querySelector("select").value,
      });
      if (!this.current(context)) return;
      this.panel.message.replaceChildren();
      this.showResults(result);
    } catch (e) {
      if (this.current(context)) this.panel.showError(e);
    }
  }
  showResults(result) {
    const warnings = {
      provider_unavailable: this.t(
        "Open Food Facts is currently unavailable. Local foods remain available. Try again later or use Quick entry.",
      ),
      provider_consent_required: this.t(
        "Online search is disabled. Enable Open Food Facts in the integration options, or use local foods and Quick entry.",
      ),
      provider_rate_limited: this.t(
        "Open Food Facts has reached its request limit. Wait before searching online again. Local foods and Quick entry remain available.",
      ),
    };
    const notices = (result.warnings || []).filter((code) =>
      Object.hasOwn(warnings, code),
    );
    this.results.replaceChildren(
      ...notices.map((code) =>
        el("p", { role: "status", class: "provider-warning" }, warnings[code]),
      ),
      el(
        "small",
        {},
        [result.source, result.attribution].filter(Boolean).join(" · "),
      ),
      ...(result.foods?.length
        ? result.foods.map((food) =>
            button(
              `${food.name}${food.producer ? " · " + food.producer : ""}`,
              () => this.pick(food.food_id),
            ),
          )
        : [
            el(
              "p",
              {},
              this.t(
                notices.length
                  ? "No locally saved foods found. Use Quick entry or create a custom food."
                  : "No foods found. Try another search or create a custom food.",
              ),
            ),
          ]),
    );
  }
  async pick(food_id) {
    const context = this.readContext();
    try {
      const result = await this.panel.client.read("food", { food_id });
      if (!this.current(context)) return;
      this.showFood(result.food);
    } catch (e) {
      if (this.current(context)) this.panel.showError(e);
    }
  }
  showFood(food) {
    this.food = food;
    const serving = selectField(
      this.t("Serving"),
      "serving",
      [
        ["", food.base_unit],
        ...(food.servings || []).map((s) => [
          s.serving_id,
          `${s.label} (${this.display(s.amount, food.base_unit)})`,
        ]),
      ],
      food.favorite?.serving_id || "",
    );
    const amount = field(this.t("Amount") + " (" + food.base_unit + ")", {
      type: "number",
      min: "0.001",
      step: "any",
      required: true,
      value: food.favorite?.amount || 100,
    });
    const quantity = field(this.t("Quantity"), {
      type: "number",
      min: "0.001",
      step: "any",
      required: true,
      value: food.favorite?.quantity || 1,
    });
    const meal = selectField(
      this.t("Meal"),
      "meal",
      Object.entries(MEALS).map(([id, label]) => [id, this.t(label)]),
      "snack",
    );
    const preview = el("div", { "aria-live": "polite" });
    const portion = () =>
      serving.querySelector("select").value
        ? {
            serving_id: serving.querySelector("select").value,
            quantity: positive(quantity.querySelector("input")),
          }
        : { amount: positive(amount.querySelector("input")) };
    const refresh = () => {
      const id = serving.querySelector("select").value;
      amount.hidden = !!id;
      quantity.hidden = !id;
      amount.querySelector("input").disabled = !!id;
      quantity.querySelector("input").disabled = !id;
      try {
        const p = portion();
        const size =
          p.amount ??
          food.servings.find((s) => s.serving_id === p.serving_id).amount *
            p.quantity;
        const per =
          food.nutrients_per_100 ||
          Object.fromEntries(
            Object.entries(food.nutrients || {}).map(([k, v]) => [
              k,
              v == null ? null : v * 100,
            ]),
          );
        preview.replaceChildren(
          el(
            "p",
            {},
            `${this.t("Selected:")} ${this.display(size, food.base_unit)}`,
          ),
          this.renderNutrients(
            Object.fromEntries(
              Object.entries(per).map(([k, v]) => [
                k,
                v == null ? null : (v * size) / 100,
              ]),
            ),
          ),
        );
      } catch {
        preview.replaceChildren(
          el("p", {}, this.t("Enter a positive amount.")),
        );
      }
    };
    serving.addEventListener("change", refresh);
    amount.addEventListener("input", refresh);
    quantity.addEventListener("input", refresh);
    refresh();
    const favorite = button(
      food.is_favorite
        ? this.t("Remove favorite")
        : this.t("Save portion as favorite"),
      async () => {
        try {
          const result = await this.panel.write(
            "favorite",
            {
              food_id: food.food_id,
              enabled: !food.is_favorite,
              ...(!food.is_favorite ? portion() : {}),
            },
            false,
          );
          if (result) {
            food = result.food;
            this.food = food;
            favorite.textContent = food.is_favorite
              ? this.t("Remove favorite")
              : this.t("Save portion as favorite");
          }
        } catch (e) {
          this.panel.showError(e);
        }
      },
      { "data-write": true },
    );
    this.detail.replaceChildren(
      el("h3", {}, food.name),
      el(
        "p",
        { class: "muted" },
        [
          food.producer,
          food.source === "usda" ? "USDA FoodData Central" : food.source,
          food.license,
        ]
          .filter(Boolean)
          .join(" · "),
      ),
      ...(food.source === "usda"
        ? [
            el(
              "small",
              {},
              this.t(
                "USDA FoodData Central reference averages. Weigh the edible portion; check whether the food is raw or cooked.",
              ),
            ),
          ]
        : []),
      el(
        "form",
        {
          onsubmit: async (event) => {
            event.preventDefault();
            try {
              await this.panel.write("log_food", {
                food_id: food.food_id,
                ...portion(),
                meal_type: meal.querySelector("select").value,
                date: this.panel.date,
              });
            } catch (e) {
              this.panel.showError(e);
            }
          },
        },
        el("div", { class: "form-grid" }, serving, amount, quantity, meal),
        el(
          "details",
          { open: true },
          el("summary", {}, this.t("Selected portion nutrients")),
          preview,
        ),
        el(
          "div",
          { class: "actions" },
          el(
            "button",
            { type: "submit", class: "primary", "data-write": true },
            this.t("Log food"),
          ),
          favorite,
        ),
      ),
    );
  }
}
