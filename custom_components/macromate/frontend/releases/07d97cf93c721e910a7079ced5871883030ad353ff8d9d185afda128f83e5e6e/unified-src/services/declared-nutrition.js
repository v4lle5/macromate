import { html } from "lit";
export function declarationFields(data, change) {
  return html`<fieldset>
    <legend>Declared nutrition for diary logging</legend>
    <p>
      Original nutrition text is retained separately. Enter numeric values only
      when declared by the recipe. Missing values stay unknown.
    </p>
    <label
      >Nutrition basis<select
        aria-label="Nutrition basis"
        .value=${data.nutrition_basis || "unknown"}
        @change=${(e) => change("nutrition_basis", e.target.value)}
      >
        <option value="unknown">Unknown</option>
        <option value="per_serving">Per serving</option>
        <option value="per_recipe">Whole recipe</option>
      </select></label
    >${[
      "calories",
      "protein",
      "carbs",
      "fat",
      "fiber",
      "sugar",
      "sodium",
      "saturated_fat",
    ].map(
      (key) =>
        html`<label
          >Declared ${key.replaceAll("_", " ")}
          (${key === "calories" ? "kcal" : key === "sodium" ? "mg" : "g"})<input
            aria-label=${`Declared ${key.replaceAll("_", " ")} (${key === "calories" ? "kcal" : key === "sodium" ? "mg" : "g"})`}
            type="number"
            min="0"
            step="any"
            .value=${data.declared_nutrition?.[key] ?? ""}
            @input=${(e) =>
              change("declared_nutrition", {
                ...data.declared_nutrition,
                [key]: e.target.value,
              })}
        /></label>`,
    )}
  </fieldset>`;
}
export function declaredValues(data) {
  return Object.fromEntries(
    Object.entries(data || {})
      .filter(([, v]) => v !== "" && v !== undefined)
      .map(([k, v]) => [k, v === null ? null : Number(v)]),
  );
}
