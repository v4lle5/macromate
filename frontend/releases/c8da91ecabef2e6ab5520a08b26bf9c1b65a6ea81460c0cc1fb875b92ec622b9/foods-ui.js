import { translator } from "./i18n.js";
import { el, button, field, nutrients, display, MEALS } from "./dom.js";
import { quickEntry, openDialog } from "./entry-ui.js";
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
    this.results = el("div", { class: "results", "aria-live": "polite" });
    this.detail = el("div", { class: "food-detail" });
    this.node = el(
      "div",
      { class: "card food-search" },
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
          el("button", { type: "submit", class: "primary" }, this.t("Search")),
        ),
        el(
          "div",
          { class: "toolbar search-tools" },
          this.filter,
          button(this.t("Quick entry"), () => quickEntry(this.panel), {
            "data-write": true,
          }),
          this.panel.barcode.render(),
          button(this.t("Custom food"), () => this.panel.createCustomFood(), {
            "data-custom-food": true,
            "data-write": true,
            "aria-label": this.t("Custom food"),
            title: this.t("Custom food"),
          }),
        ),
      ),
      this.results,
    );
    return this.node;
  }
  invalidate() {
    this.sequence++;
    this.results.replaceChildren();
    this.results.removeAttribute("aria-busy");
    this.detail.replaceChildren();
    this.food = null;
    this.dialog?.close();
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
      this.dialog?.close();
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
      const payload = {
        query: this.query.querySelector("input").value,
        filter: this.filter.querySelector("select").value,
      };
      const result = await this.panel.client.read("search_foods", {
        ...payload,
        online: false,
      });
      if (!this.current(context)) return;
      this.panel.message.replaceChildren();
      this.showResults(result);
      if (payload.filter === "all" && payload.query.trim()) {
        this.results.setAttribute("aria-busy", "true");
        const online = await this.panel.client.read("search_foods", {
          ...payload,
          online: true,
        });
        if (this.current(context)) this.showResults(online);
      }
    } catch (e) {
      if (this.current(context)) this.panel.showError(e);
    } finally {
      if (this.current(context)) this.results.removeAttribute("aria-busy");
    }
  }
  showResults(result) {
    const warnings = {
      provider_unavailable: this.t(
        "Open Food Facts is currently unavailable. Local foods remain available. Try again later or use Quick entry.",
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
        "div",
        { class: "food-results" },
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
      ),
      ...(result.attribution
        ? [
            el(
              "details",
              { class: "result-sources" },
              el("summary", {}, this.t("Sources")),
              el("small", {}, result.attribution),
            ),
          ]
        : []),
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
    this.results.removeAttribute("aria-busy");
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
    serving.hidden = !food.servings?.length;
    const amount = field(`${this.t("Amount")} (${food.base_unit})`, {
      name: "amount",
      type: "number",
      min: "0.001",
      step: "any",
      required: true,
      value: food.favorite?.amount || 100,
    });
    const quantity = field(this.t("Quantity"), {
      name: "quantity",
      type: "number",
      min: "0.001",
      step: "any",
      required: true,
      value: food.favorite?.quantity || 1,
    });
    const meal = el(
      "fieldset",
      { class: "meal-choice" },
      el("legend", {}, this.t("Which meal?")),
      ...Object.entries(MEALS).map(([value, label]) =>
        el(
          "label",
          {},
          el("input", {
            type: "radio",
            name: "meal_type",
            value,
            required: true,
          }),
          el("span", {}, this.t(label)),
        ),
      ),
    );
    const preview = el("div", {
      class: "portion-preview",
      "aria-live": "polite",
    });
    const fullNutrients = el("div");
    const portion = () =>
      serving.querySelector("select").value
        ? {
            serving_id: serving.querySelector("select").value,
            quantity: positive(quantity.querySelector("input")),
          }
        : { amount: positive(amount.querySelector("input")) };
    let validPortion = true;
    const log = el(
      "button",
      {
        type: "submit",
        class: "primary",
        "data-write": true,
        "data-needs-selection": "true",
      },
      this.t("Log food"),
    );
    const refresh = () => {
      const id = serving.querySelector("select").value;
      amount.hidden = !!id;
      quantity.hidden = !id;
      amount.querySelector("input").disabled = !!id;
      quantity.querySelector("input").disabled = !id;
      try {
        const selected = portion();
        const size =
          selected.amount ??
          food.servings.find((s) => s.serving_id === selected.serving_id)
            .amount * selected.quantity;
        const per =
          food.nutrients_per_100 ||
          Object.fromEntries(
            Object.entries(food.nutrients || {}).map(([key, value]) => [
              key,
              value == null ? null : value * 100,
            ]),
          );
        const values = Object.fromEntries(
          Object.entries(per).map(([key, value]) => [
            key,
            value == null ? null : (value * size) / 100,
          ]),
        );
        preview.replaceChildren(
          el("strong", {}, this.display(values.calories, "kcal")),
          ...["protein", "carbs", "fat"].map((key) =>
            el(
              "span",
              {},
              `${this.t({ protein: "Protein", carbs: "Carbohydrates", fat: "Fat" }[key])} ${this.display(values[key], "g")}`,
            ),
          ),
        );
        fullNutrients.replaceChildren(this.renderNutrients(values));
        validPortion = true;
      } catch {
        preview.replaceChildren(
          el("p", {}, this.t("Enter a positive amount.")),
        );
        validPortion = false;
      }
      log.dataset.needsSelection = String(
        !validPortion || !meal.querySelector("input:checked"),
      );
      this.panel.syncControls();
    };
    for (const node of [serving, amount, quantity, meal]) {
      node.addEventListener("input", refresh);
      node.addEventListener("change", refresh);
    }
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
        } catch (error) {
          this.panel.showError(error);
        }
      },
      { "data-write": true },
    );
    const source =
      food.source === "bls"
        ? `BLS 4.0 · Max Rubner-Institut · ${food.food_id.replace(/^bls4:/, "")}`
        : food.source === "usda"
          ? "USDA FoodData Central"
          : food.source;
    const sourceDetails = el(
      "details",
      { class: "food-source-details" },
      el("summary", {}, this.t("Source")),
      el(
        "small",
        {},
        [food.producer, source, food.license].filter(Boolean).join(" · "),
        " ",
        food.source === "bls"
          ? this.t(
              "BLS 4.0 reference averages per 100 g edible portion. Weigh the edible portion and check the preparation. Adapted for MacroMate: nutrient selection and unit conversion.",
            )
          : food.source === "usda"
            ? this.t(
                "USDA FoodData Central reference averages. Weigh the edible portion; check whether the food is raw or cooked.",
              )
            : "",
        ...(/^https:\/\/[^\s]+$/.test(food.source_url || "")
          ? [
              " ",
              el(
                "a",
                {
                  href: food.source_url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: "color:inherit",
                },
                this.t("Source"),
              ),
            ]
          : []),
        ...(food.source === "bls"
          ? [
              " · ",
              el(
                "a",
                {
                  href: "https://creativecommons.org/licenses/by/4.0/",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: "color:inherit",
                },
                "CC BY 4.0",
              ),
            ]
          : []),
      ),
    );
    let dialog;
    const form = el(
      "form",
      {
        onsubmit: async (event) => {
          event.preventDefault();
          const selected = meal.querySelector("input:checked");
          if (!selected || !validPortion) return;
          const result = await this.panel.write("log_food", {
            food_id: food.food_id,
            ...portion(),
            meal_type: selected.value,
            date: this.panel.date,
          });
          if (result) {
            dialog.close();
            this.invalidate();
            this.query.querySelector("input").value = "";
            this.query.querySelector("input").focus();
          }
        },
      },
      meal,
      el(
        "div",
        { class: "form-grid portion-fields" },
        serving,
        amount,
        quantity,
      ),
      preview,
      el(
        "details",
        {},
        el("summary", {}, this.t("Selected portion nutrients")),
        fullNutrients,
      ),
      el(
        "div",
        { class: "actions log-actions" },
        log,
        button(this.t("Cancel"), () => dialog.close()),
      ),
      el(
        "div",
        { class: "food-secondary" },
        favorite,
        el("small", {}, [source, food.license].filter(Boolean).join(" · ")),
        sourceDetails,
      ),
    );
    this.detail.replaceChildren(form);
    dialog = openDialog(this.panel, food.name, [this.detail]);
    dialog.classList.add("food-log-dialog");
    this.dialog = dialog;
    dialog.addEventListener(
      "close",
      () => {
        if (this.dialog === dialog) {
          this.dialog = null;
          this.food = null;
        }
      },
      { capture: true },
    );
    refresh();
  }
}
