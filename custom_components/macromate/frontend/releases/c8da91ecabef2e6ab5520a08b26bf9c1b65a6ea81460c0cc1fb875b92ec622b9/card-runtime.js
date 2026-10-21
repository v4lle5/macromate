import { BUILD_REVISION } from "./build-info.js";
import { MacroMateSummary } from "./unified-src/summary.js";
import { MacroMateAPI } from "./unified-src/services/adapter.js";
import { clearUI } from "./unified-src/services/context-cache.js";
import { applyGlassWaveTheme } from "./unified-src/services/theme.js";
import { navigationPath } from "./navigation.js";
import "./unified/app.js";

// The installed identity stays stable. Summary mode preserves the compact card.
export class MacroMateCard extends MacroMateSummary {
  constructor() {
    super();
    this.mode = "app";
    this.application = null;
    this.api = null;
    this.addEventListener("macromate-appearance", (event) => {
      if (event.composedPath()[0] !== this.application) return;
      applyGlassWaveTheme(
        this,
        event.detail.settings,
        this._hass?.themes?.darkMode ?? this.appearanceQuery.matches,
      );
    });
    this.addEventListener("macromate-open-app", () => {
      this.mode = "app";
      this.cleanup();
      this.render();
    });
  }
  setConfig(config) {
    if (
      !config ||
      typeof config !== "object" ||
      Array.isArray(config) ||
      (config.title !== undefined && typeof config.title !== "string") ||
      (config.mode !== undefined && !["summary", "app"].includes(config.mode))
    )
      throw new Error("Invalid MacroMate card configuration.");
    navigationPath(config.navigation_path);
    const changed = this.mode !== (config.mode || this.mode);
    this.mode = config.mode || this.mode;
    this.config = { ...config };
    if (changed) this.cleanup();
    if (this.isConnected) {
      if (changed && this.mode === "summary") super.connectedCallback();
      else this.render();
    }
  }
  set hass(hass) {
    if (this.mode === "summary") {
      super.hass = hass;
      return;
    }
    const previous = this.context;
    const context = {
      connection: hass?.connection,
      userId: hass?.user?.id,
      admin: hass?.user?.is_admin === true,
    };
    const changed =
      this.context?.connection !== context.connection ||
      this.context?.userId !== context.userId ||
      this.context?.admin !== context.admin;
    this._hass = hass;
    this.context = context;
    if (changed) {
      if (
        previous &&
        (previous.userId !== context.userId || previous.admin !== context.admin)
      )
        clearUI(previous.userId);
      this.cleanup();
    }
    if (this.application) this.application.systemDark = hass?.themes?.darkMode;
    if (this.isConnected) this.render();
  }
  get hass() {
    return this._hass;
  }
  connectedCallback() {
    if (this.mode === "summary") super.connectedCallback();
    else this.render();
  }
  disconnectedCallback() {
    this.cleanup();
    super.disconnectedCallback();
  }
  cleanup() {
    this.stopAppearance();
    this.api?.dispose();
    this.api = null;
    this.application = null;
    this.shadowRoot.replaceChildren();
    super.invalidate();
  }
  render() {
    if (this.mode === "summary") {
      super.render();
      return;
    }
    if (!this.isConnected) return;
    if (!this._hass?.user?.id || !this._hass.connection) {
      this.shadowRoot.textContent = "Connecting to Home Assistant…";
      return;
    }
    if (this.application) return;
    this.api = new MacroMateAPI(this._hass);
    const api = this.api;
    const stylesheet = document.createElement("style");
    stylesheet.textContent =
      ":host{display:block;min-width:0;min-height:0;height:100%}.workspace{display:flex;flex-direction:column;height:100%;min-height:0}mm-unified-app{flex:none;height:100%;min-height:0}.status:empty{display:none}.status{flex-shrink:0;padding:12px;background:var(--rm-warning-soft,#f4ebd0);color:var(--rm-text,#263B47);font:var(--rm-font-size-sm,14px)/1.55 var(--rm-font-family,system-ui)}.status button{min-width:44px;min-height:44px;padding:8px;margin-left:12px;border:1px solid var(--rm-border-strong,#576C65);border-radius:var(--rm-radius-sm,12px);background:var(--rm-bg-elevated,#FDF8EF);color:inherit;font:inherit}.status button:focus-visible{outline:3px solid var(--rm-focus,#DCCDB8);outline-offset:2px}";
    const status = document.createElement("div");
    status.className = "status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const app = document.createElement("mm-unified-app");
    this.application = app;
    app.transport = api;
    app.hass = api.facade();
    app.systemDark = this._hass?.themes?.darkMode;
    app.setConfig(this.config);
    const state = () => {
      if (this.api !== api || !api.current()) return;
      status.replaceChildren();
      if (!api.pending && api.lastReadFailure) {
        const read = document.createElement("span");
        read.textContent = `${(api.locale || this._hass.language) === "de" ? "Lesen fehlgeschlagen. Verbindung prüfen." : "Reading failed. Check the connection."} (${api.lastReadFailure.action}: ${api.lastReadFailure.code})`;
        status.append(read);
      }
      if (api.pending) {
        const text = document.createElement("span");
        text.textContent = api.busy
          ? (api.locale || this._hass.language) === "de"
            ? "Wird gespeichert…"
            : "Saving…"
          : (api.locale || this._hass.language) === "de"
            ? "Speicherstatus unklar. Keine neue Anfrage erstellen."
            : "Write status uncertain. Do not create another request.";
        status.append(text);
        if (!api.busy && api.lastFailure) {
          const diagnostic = document.createElement("small");
          diagnostic.textContent = ` (${api.lastFailure.action}: ${api.lastFailure.code})`;
          status.append(diagnostic);
        }
        if (!api.busy) {
          const retry = document.createElement("button");
          retry.textContent =
            (api.locale || this._hass.language) === "de"
              ? "Gleiche Anfrage erneut senden"
              : "Retry same request";
          retry.addEventListener("click", async () => {
            try {
              const request = api.pending;
              const result = await api.retry();
              if (this.api !== api || !api.current()) return;
              const pane = app.shadowRoot.querySelector("mm-nutrition");
              if (
                pane?.client?.pending?.payload?.request_id ===
                request.payload.request_id
              ) {
                pane.client.pending = null;
                pane.dialog?.close();
                pane.message.textContent = "Saved.";
                await pane.loadDiary(pane.date);
              }
              if (request.action === "recipes_add") app._view = "grid";
              await app._init();
            } catch {}
            state();
          });
          status.append(retry);
        }
      }
      app._updateHeight();
    };
    api.addEventListener("state", state);
    const workspace = document.createElement("div");
    workspace.className = "workspace";
    this.dataset.buildRevision = BUILD_REVISION;
    workspace.append(status, app);
    this.shadowRoot.replaceChildren(stylesheet, workspace);
    api
      .call("describe")
      .then(() => {
        if (this.api === api && api.current()) app.requestUpdate();
      })
      .catch(() => {});
  }
  getCardSize() {
    return this.mode === "summary" ? super.getCardSize() : 16;
  }
  getGridOptions() {
    return this.mode === "summary"
      ? super.getGridOptions()
      : { columns: 12, min_columns: 6 };
  }
  static async getConfigElement() {
    await import("./macromate-card-editor.js");
    return document.createElement("macromate-card-editor");
  }
  static getStubConfig() {
    return { type: "custom:macromate-card" };
  }
}
if (!customElements.get("macromate-card"))
  customElements.define("macromate-card", MacroMateCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "macromate-card"))
  window.customCards.push({
    type: "macromate-card",
    name: "MacroMate",
    description: "Recipes, planning, timers and nutrition in one application",
    preview: true,
  });
