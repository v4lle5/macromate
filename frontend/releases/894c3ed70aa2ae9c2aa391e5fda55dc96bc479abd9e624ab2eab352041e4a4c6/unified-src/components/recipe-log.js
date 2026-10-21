import { LitElement, html } from "lit";
import { workspaceStyles } from "./workspace-styles.js";
export class RecipeLog extends LitElement {
  static properties = {
    api: { attribute: false },
    recipe: { attribute: false },
    servings: { type: Number },
    open: { state: true },
    error: { state: true },
    result: { state: true },
  };
  static styles = workspaceStyles;
  constructor() {
    super();
    this.servings = 1;
    this.open = false;
    this.error = "";
    this.result = null;
  }
  get de() {
    return this.api?.hass?.language?.startsWith("de");
  }
  async submit(event) {
    event.preventDefault();
    const form = event.target;
    const payload = {
      recipe_id: this.recipe.id,
      servings: Number(form.elements.servings.value),
      meal_type: form.elements.meal_type.value,
    };
    if (form.elements.date.value) payload.date = form.elements.date.value;
    try {
      this.result = await this.api.call("recipe_log", payload);
      this.error = "";
      this.open = false;
    } catch (e) {
      this.error = e.message;
    }
  }
  render() {
    const known =
      ["per_serving", "per_recipe"].includes(this.recipe?.nutrition_basis) &&
      Number.isFinite(this.recipe?.declared_nutrition?.calories);
    return html`<section style="padding:8px">
      <button
        @click=${() => {
          this.open = !this.open;
        }}
        ?disabled=${!known || !!this.api?.pending}
      >
        ${this.de ? "Portionen eintragen" : "Log servings"}</button
      >${!known
        ? html`<small>
            ${this.de
              ? "Deklarierte Kalorien und bekannte Nährwertbasis erforderlich."
              : "Declared calories and a known nutrition basis are required."}</small
          >`
        : ""}${this.open
        ? html`<form @submit=${this.submit}>
            <label
              >${this.de ? "Rezeptportionen" : "Recipe servings"}<input
                aria-label="Recipe servings"
                name="servings"
                type="number"
                required
                min="0.001"
                max="10000"
                step="any"
                .value=${this.servings} /></label
            ><label
              >${this.de ? "Mahlzeit" : "Meal"}<select name="meal_type">
                <option value="breakfast">
                  ${this.de ? "Frühstück" : "Breakfast"}
                </option>
                <option value="lunch">
                  ${this.de ? "Mittagessen" : "Lunch"}
                </option>
                <option value="dinner" selected>
                  ${this.de ? "Abendessen" : "Dinner"}
                </option>
                <option value="snack">${this.de ? "Snack" : "Snack"}</option>
              </select></label
            ><label
              >${this.de
                ? "Datum (leer = heute in Home Assistant)"
                : "Date (empty = Home Assistant today)"}<input
                name="date"
                type="date"
            /></label>
            <p class="muted">
              ${this.de
                ? "Speichert einen unveränderlichen Rezept-Nährwert-Snapshot im Tagebuch."
                : "Saves an immutable snapshot of declared recipe nutrition in the diary."}
            </p>
            <button type="submit" ?disabled=${!!this.api?.pending}>
              ${this.de ? "Bestätigen und eintragen" : "Confirm and log"}
            </button>
          </form>`
        : ""}${this.error ? html`<p role="alert">${this.error}</p>` : ""}${this
        .result
        ? html`<p role="status">
            ${this.de ? "Tagebucheintrag gespeichert." : "Diary entry saved."}
          </p>`
        : ""}
    </section>`;
  }
}
customElements.define("mm-recipe-log", RecipeLog);
