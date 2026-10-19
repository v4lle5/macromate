import { MacroMateNutritionBase } from "../../nutrition-base.js";
export class NutritionPane extends MacroMateNutritionBase {
  get profilesEnabled() {
    return true;
  }
  initialize() {
    super.initialize();
    const theme = document.createElement("style");
    theme.textContent = `
      :host{flex:1;overflow-y:auto;overscroll-behavior-y:contain;background:var(--rm-bg-main);color:var(--rm-text);min-height:0;color-scheme:inherit;font-family:inherit;font-size:var(--rm-font-size-base,14px);line-height:1.4;--primary-text-color:var(--rm-text);--secondary-text-color:var(--rm-text-secondary);--ha-card-background:var(--rm-bg-surface);--surface:var(--rm-bg-surface);--muted:var(--rm-text-secondary);--line:var(--rm-border);--jade:var(--rm-success,#26936d);--amber:var(--rm-warning,#d0a34c);--coral:var(--rm-error,#d88b79);--violet:var(--rm-primary,#a18bcc);--divider-color:var(--rm-border)}
      .card,.metric,.diary-entries,dialog{background:var(--rm-bg-surface);border-color:var(--rm-border);color:var(--rm-text);border-radius:var(--rm-radius,12px);box-shadow:var(--rm-shadow)}
      dialog{background:var(--rm-dialog-bg,var(--rm-bg-surface))}
      .muted,small,.entry-meta{color:var(--rm-text-secondary)}
      input,select,textarea,button{background:var(--rm-bg-elevated);color:var(--rm-text);border-color:var(--rm-border)}
      button:hover{background:var(--rm-accent-soft)}
      button.primary{background:var(--rm-primary,var(--rm-accent,#20633f));color:var(--rm-accent-text,#fff);border-color:transparent}
      button:disabled{background:var(--rm-disabled-bg,var(--rm-bg-elevated));color:var(--rm-disabled-text,var(--rm-text-secondary));opacity:var(--rm-disabled-opacity,.65)}
      button.danger{color:var(--rm-error,#a12b20)}
      button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline-color:var(--rm-primary,var(--rm-accent))}
      .meal-card{background:transparent;border:0;border-bottom:1px solid var(--rm-border);border-radius:0;box-shadow:none}
      .entry-actions button,.food-secondary>button{background:transparent}
      .food-results>button{border-color:var(--rm-border)}
      .meal-choice label{border-color:var(--rm-border);background:var(--rm-bg-elevated)}
      .meal-choice label:has(input:checked){background:var(--rm-accent-soft);border-color:var(--rm-primary,var(--rm-accent))}
      .message,.dialog-status:not(:empty){background:var(--rm-accent-soft);color:var(--rm-text)}
      .dialog-status{color:var(--rm-text)}
      .nutrition-overview{display:grid;grid-template-columns:minmax(260px,1fr) minmax(0,1fr);gap:20px;align-items:center;border:1px solid var(--rm-border);border-radius:var(--rm-radius,12px);background:var(--rm-bg-surface);padding:12px}
      .energy{display:flex;align-items:center;gap:14px;min-width:0}
      .calorie-ring{width:104px;height:104px;flex:0 0 104px;border-radius:50%;padding:6px;background:conic-gradient(var(--jade) var(--progress),color-mix(in srgb,var(--jade) 14%,var(--rm-bg-surface)) 0)}
      .calorie-ring.unknown{background:color-mix(in srgb,var(--rm-text-secondary) 16%,var(--rm-bg-surface))}
      .ring-center{height:100%;border-radius:50%;background:var(--rm-bg-surface);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4px}
      .ring-label,.ring-unit{font-size:10px;color:var(--rm-text-secondary)}
      .remaining{font-size:27px;line-height:1.2;font-weight:650;font-variant-numeric:tabular-nums}
      .ring-state{font-size:12px;line-height:1.2;margin:3px 0}
      .energy-detail{display:grid;gap:5px;min-width:0;flex:1}
      .energy-detail>div{display:flex;justify-content:space-between;gap:8px;font-size:11px;align-items:baseline}
      .energy-detail span{color:var(--rm-text-secondary)}
      .energy-detail strong{font-size:12px;text-align:right;overflow-wrap:anywhere}
      .detail-divider{display:none}
      .macros{display:grid;gap:9px;min-width:0}
      .macro-line{display:flex;justify-content:space-between;gap:8px;font-size:12px}
      .macro-values{font-size:11px;color:var(--rm-text-secondary);text-align:right}
      .macro-values strong{color:var(--rm-text)}
      .macro small{font-size:10px;margin:3px 0 0}
      .macro progress{display:block;width:100%;height:5px;margin:4px 0 0;accent-color:var(--jade)}
      .macro.protein progress{accent-color:var(--amber)}
      .macro.fat progress{accent-color:var(--coral)}
      .weight-fallback{font-size:11px;color:var(--rm-text-secondary);margin:6px 0 0}
      @container(max-width:650px){
        .nutrition-overview{grid-template-columns:1fr;gap:10px;padding:10px}
        .energy{gap:12px}
        .calorie-ring{width:94px;height:94px;flex-basis:94px}
        .energy-detail{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
        .energy-detail>div{display:block;min-width:0}
        .energy-detail strong{display:block;text-align:left;font-size:11px;margin-top:3px}
        .energy-detail span{font-size:10px}
        .macros{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
        .macro-line{display:block;font-size:11px}
        .macro-values{display:block;text-align:left;margin-top:2px}
      }
    `;
    this.shadowRoot.append(theme);
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
