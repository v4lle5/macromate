import { Message, translator } from "./i18n.js";
import {
  el,
  button,
  field,
  nutrients,
  display,
  MEALS,
  NUTRIENTS,
} from "./dom.js";
import { selectField, positive } from "./foods-ui.js";
export function openDialog(panel, title, children) {
  panel.dialog?.close();
  panel.dialog?.remove();
  const dialog = el(
    "dialog",
    { "aria-label": title },
    el("h2", {}, title),
    el("div", {
      class: "dialog-status",
      role: "status",
      "aria-live": "polite",
    }),
    ...children,
  );
  dialog.addEventListener("close", () => {
    dialog.remove();
    if (panel.dialog === dialog) panel.dialog = null;
    if (panel.pendingLocaleRefresh) panel.relocalize?.();
    panel.drainRefresh?.();
  });
  panel.shadowRoot.append(dialog);
  panel.dialog = dialog;
  dialog.showModal();
  return dialog;
}
export function numericFields(keys, values = {}, locale = "de") {
  return keys.map((key) => {
    const [label, unit] = NUTRIENTS[key];
    return field(el("span", {}, new Message(label, locale), ` (${unit})`), {
      name: key,
      type: "number",
      min: 0,
      step: "any",
      required: key === "calories",
      value: values[key] ?? "",
    });
  });
}
export function readNumbers(form, keys) {
  const result = {};
  for (const key of keys) {
    const input = form.elements.namedItem(key);
    if (input.value === "") continue;
    const n = Number(input.value);
    if (!Number.isFinite(n) || n < 0) throw { code: "invalid_request" };
    result[key] = n;
  }
  return result;
}
export function quickEntry(panel, entry) {
  const t = translator(panel, true);
  const query = panel.foodBrowser.query.querySelector("input");
  if (!entry && !query.value.trim()) {
    query.focus();
    panel.foodBrowser.results.replaceChildren(
      el("p", {}, t("Enter a name first, then choose Quick entry.")),
    );
    return;
  }
  const title = entry ? t("Edit entry") : t("Quick entry");
  const name = entry
    ? field(t("Name"), {
        name: "name",
        required: true,
        maxlength: 200,
        value: entry.name,
      })
    : el(
        "div",
        {},
        el("p", { "data-user-content": true }, query.value),
        el("input", { type: "hidden", name: "name", value: query.value }),
      );
  const meal = selectField(
    t("Meal"),
    "meal_type",
    Object.entries(MEALS).map(([id, label]) => [id, t(label)]),
    entry?.meal_type || "snack",
  );
  const keys = ["calories", "protein", "carbs", "fat"];
  let dialog;
  const form = el(
    "form",
    {
      onsubmit: async (event) => {
        event.preventDefault();
        try {
          const payload = {
            name: form.elements.name.value,
            meal_type: form.elements.meal_type.value,
            ...readNumbers(form, keys),
            ...(entry
              ? {
                  entry_id: entry.entry_id,
                  ...Object.fromEntries(
                    keys
                      .slice(1)
                      .filter((key) => form.elements[key].value === "")
                      .map((key) => [key, null]),
                  ),
                }
              : { date: panel.date }),
          };
          if (await panel.write(entry ? "update_meal" : "log_meal", payload))
            dialog.close();
        } catch (e) {
          panel.showError(e);
        }
      },
    },
    name,
    meal,
    el(
      "p",
      { class: "muted" },
      t(
        "Total nutrients of this entry. Empty optional fields remain unknown. When editing, an empty field clears its previous value.",
      ),
    ),
    el(
      "div",
      { class: "form-grid" },
      numericFields(keys, entry?.nutrients ?? entry, panel.hass.language),
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
  dialog = openDialog(panel, title, [form]);
}
export function editFoodEntry(panel, entry) {
  const t = translator(panel, true);
  const amount = field(`${t("Amount")} (${entry.base_unit})`, {
    name: "amount",
    type: "number",
    required: true,
    min: "0.001",
    step: "any",
    value: entry.amount,
  });
  const meal = selectField(
    t("Meal"),
    "meal_type",
    Object.entries(MEALS).map(([id, label]) => [id, t(label)]),
    entry.meal_type,
  );
  const mode = entry.serving_id
    ? selectField(
        t("Quantity mode"),
        "mode",
        [
          ["amount", entry.base_unit],
          ["serving", t("Previous serving")],
        ],
        "amount",
      )
    : null;
  const quantity = entry.serving_id
    ? field(t("Quantity"), {
        name: "quantity",
        type: "number",
        min: "0.001",
        step: "any",
        value: entry.quantity || 1,
      })
    : null;
  if (quantity) quantity.hidden = true;
  const preview = el("div", {});
  const refresh = () => {
    const byServing = mode?.querySelector("select").value === "serving";
    amount.hidden = byServing;
    amount.querySelector("input").disabled = byServing;
    if (quantity) {
      quantity.hidden = !byServing;
      quantity.querySelector("input").disabled = !byServing;
    }
    const size = byServing
      ? (entry.amount / (entry.quantity || 1)) *
        Number(quantity.querySelector("input").value)
      : Number(amount.querySelector("input").value);
    const source =
      entry.nutrients ||
      Object.fromEntries(
        ["calories", "protein", "carbs", "fat"].map((key) => [key, entry[key]]),
      );
    preview.replaceChildren(
      nutrients(
        Object.fromEntries(
          Object.entries(source).map(([k, v]) => [
            k,
            v == null ? null : (v * size) / entry.amount,
          ]),
        ),
        panel.hass.language,
      ),
    );
  };
  [amount, mode, quantity]
    .filter(Boolean)
    .forEach((node) => node.addEventListener("input", refresh));
  refresh();
  let dialog;
  const form = el(
    "form",
    {
      onsubmit: async (event) => {
        event.preventDefault();
        try {
          const p =
            mode?.querySelector("select").value === "serving"
              ? {
                  serving_id: entry.serving_id,
                  quantity: positive(quantity.querySelector("input")),
                }
              : { amount: positive(amount.querySelector("input")) };
          if (
            await panel.write("update_food_entry", {
              entry_id: entry.entry_id,
              ...p,
              meal_type: meal.querySelector("select").value,
            })
          )
            dialog.close();
        } catch (e) {
          panel.showError(e);
        }
      },
    },
    el(
      "p",
      {},
      t(
        "Nutrients are scaled from the recorded entry snapshot, not the current product.",
      ),
    ),
    mode,
    amount,
    quantity,
    meal,
    preview,
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
  dialog = openDialog(panel, t("Edit food entry"), [form]);
}
export function copyEntry(panel, entry) {
  const t = translator(panel, true);
  const date = field(t("Target date"), {
    type: "date",
    name: "date",
    required: true,
    value: panel.date,
  });
  const meal = selectField(
    t("Meal"),
    "meal_type",
    Object.entries(MEALS).map(([id, label]) => [id, t(label)]),
    entry.meal_type,
  );
  let dialog;
  dialog = openDialog(panel, t("Copy entry"), [
    el(
      "form",
      {
        onsubmit: async (event) => {
          event.preventDefault();
          if (
            await panel.write("copy_meal", {
              entry_id: entry.entry_id,
              date: date.querySelector("input").value,
              meal_type: meal.querySelector("select").value,
            })
          )
            dialog.close();
        },
      },
      el("p", {}, entry.name),
      date,
      meal,
      el(
        "div",
        { class: "actions" },
        el(
          "button",
          { type: "submit", class: "primary", "data-write": true },
          t("Copy"),
        ),
        button(t("Cancel"), () => dialog.close()),
      ),
    ),
  ]);
}
export function deleteEntry(panel, entry) {
  const t = translator(panel, true);
  let dialog;
  dialog = openDialog(panel, t("Delete entry"), [
    el("p", {}, t("Delete “{name}”?", { name: entry.name })),
    el(
      "div",
      { class: "actions" },
      button(
        t("Confirm deletion"),
        async () => {
          if (await panel.write("delete_meal", { entry_id: entry.entry_id }))
            dialog.close();
        },
        { class: "danger", "data-write": true },
      ),
      button(t("Cancel"), () => dialog.close()),
    ),
  ]);
}
