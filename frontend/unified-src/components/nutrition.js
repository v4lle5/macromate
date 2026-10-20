import { MacroMateNutritionBase } from "../../nutrition-base.js";
export class NutritionPane extends MacroMateNutritionBase {
  get profilesEnabled() {
    return true;
  }
  renderOverview() {
    const summary = document.createElement("mm-summary");
    summary._hass = this.hass;
    summary.data = this.data;
    const overview = document.createElement("div");
    overview.className = "nutrition-overview";
    overview.append(summary.renderEnergy(), summary.renderMacros());
    return overview;
  }
  renderDiary() {
    super.renderDiary();
    const recommendation = this.data.recommendation;
    if (recommendation?.fallback_reasons?.includes("weight_unavailable")) {
      const warning = document.createElement("p");
      warning.className = "weight-fallback";
      warning.setAttribute("role", "status");
      warning.textContent =
        this.hass.language === "de"
          ? `Gewichtssensor nicht verfügbar. Gespeichertes Profilgewicht: ${recommendation.weight_kg} kg (kein Live-Messwert).`
          : `Weight sensor unavailable. Saved profile weight: ${recommendation.weight_kg} kg (not live).`;
      this.diaryNode.append(warning);
    }
  }
}
customElements.define("mm-nutrition", NutritionPane);
