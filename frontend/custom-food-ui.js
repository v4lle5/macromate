import { translator, translate } from "./i18n.js";
import { el, button, field, NUTRIENTS } from "./dom.js";
import { selectField, positive } from "./foods-ui.js";
import { openDialog, numericFields, readNumbers } from "./entry-ui.js";
export function customFood(panel) {
  const t = translator(panel, true);
  const name = field(t("Name"), {
    name: "name",
    required: true,
    maxlength: 200,
  });
  const producer = field(t("Producer"), { name: "producer", maxlength: 200 });
  const unit = selectField(
    t("Base unit"),
    "base_unit",
    [
      ["g", "g"],
      ["ml", "ml"],
    ],
    "g",
  );
  const servingLabel = field(t("Serving name"), {
    name: "serving_label",
    maxlength: 100,
  });
  const servingAmount = field(t("Serving size (g or ml)"), {
    name: "serving_amount",
    type: "number",
    min: "0.001",
    step: "any",
  });
  const keys = Object.keys(NUTRIENTS);
  let dialog;
  const form = el(
    "form",
    {
      onsubmit: async (event) => {
        event.preventDefault();
        try {
          const label = form.elements.serving_label.value;
          const size = form.elements.serving_amount;
          if ((label && !size.value) || (!label && size.value))
            throw { code: "invalid_request" };
          const food = {
            name: form.elements.name.value,
            ...(form.elements.producer.value.trim()
              ? { producer: form.elements.producer.value.trim() }
              : {}),
            base_unit: form.elements.base_unit.value,
            nutrients_per_100: readNumbers(form, keys),
            servings: label
              ? [
                  {
                    serving_id: crypto.randomUUID(),
                    label,
                    amount: positive(size),
                  },
                ]
              : [],
            barcodes: [],
          };
          const result = await panel.write("save_food", { food }, false);
          if (result) {
            panel.foodBrowser.showFood(result.food);
            dialog.close();
          }
        } catch (e) {
          panel.showError(e);
        }
      },
    },
    name,
    producer,
    unit,
    el(
      "p",
      {},
      t("Nutrients per 100 g or 100 ml. Leave undeclared values blank."),
    ),
    el(
      "div",
      { class: "form-grid" },
      numericFields(keys.slice(0, 8), {}, panel.hass.language),
    ),
    el(
      "details",
      {},
      el("summary", {}, t("More nutrients")),
      el(
        "div",
        { class: "form-grid" },
        numericFields(keys.slice(8), {}, panel.hass.language),
      ),
    ),
    el(
      "fieldset",
      {},
      el("legend", {}, t("Optional serving")),
      servingLabel,
      servingAmount,
    ),
    el(
      "div",
      { class: "actions" },
      el(
        "button",
        { type: "submit", class: "primary", "data-write": true },
        t("Save"),
      ),
      button(t("Cancel"), () => dialog.close()),
    ),
  );
  dialog = openDialog(panel, t("Custom food"), [form]);
}
