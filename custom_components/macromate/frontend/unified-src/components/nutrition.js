import { MacroMateNutritionBase } from "../../nutrition-base.js";
export class NutritionPane extends MacroMateNutritionBase {
  get profilesEnabled() {
    return true;
  }
  initialize() {
    super.initialize();
    const theme = document.createElement("style");
    theme.textContent =
      ":host{flex:1;overflow-y:auto;overscroll-behavior-y:contain;background:var(--rm-bg-main);color:var(--rm-text);min-height:0;color-scheme:inherit;--primary-text-color:var(--rm-text);--secondary-text-color:var(--rm-text-secondary);--ha-card-background:var(--rm-bg-surface);--jade:var(--rm-success,#26936d);--amber:var(--rm-warning,#d0a34c);--coral:var(--rm-error,#d88b79);--violet:var(--rm-primary,#a18bcc);--divider-color:var(--rm-border)}.card,.metric,.date-nav,dialog{background:var(--rm-bg-surface);border-color:var(--rm-border);color:var(--rm-text)}.metric.calories{background:var(--rm-accent-soft)}dialog{background:var(--rm-dialog-bg,var(--rm-bg-surface))}.card{border-radius:var(--rm-radius,12px);box-shadow:var(--rm-shadow)}.eyebrow,.muted,small{color:var(--rm-text-secondary)}input,select,textarea,button{background:var(--rm-bg-elevated);color:var(--rm-text);border-color:var(--rm-border)}button:hover{background:var(--rm-accent-soft)}button.primary{background:var(--rm-primary,#20633f);color:white}button,select,input{min-height:var(--rm-touch-target,44px)}.dialog-status{color:var(--rm-text,#443700)}";
    this.shadowRoot.append(theme);
  }
  renderDiary() {
    super.renderDiary();
    const summary = document.createElement("mm-summary");
    summary._hass = this.hass;
    summary.data = this.data;
    const ring = summary.renderEnergy();
    const macros = summary.renderMacros();
    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = new URL("../macromate-card.css", import.meta.url).href;
    this.diaryNode.prepend(styles, ring, macros);
    const recommendation = this.data.recommendation;
    if (recommendation?.fallback_reasons?.includes("weight_unavailable")) {
      const warning = document.createElement("p");
      warning.className = "weight-fallback";
      warning.setAttribute("role", "status");
      warning.textContent =
        this.hass.language === "de"
          ? `Gewichtssensor nicht verfügbar. Gespeichertes Profilgewicht: ${recommendation.weight_kg} kg (kein Live-Messwert).`
          : `Weight sensor unavailable. Saved profile weight: ${recommendation.weight_kg} kg (not live).`;
      this.diaryNode.prepend(warning);
    }
  }
}
customElements.define("mm-nutrition", NutritionPane);
