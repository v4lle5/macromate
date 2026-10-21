/**
 * Recipe Manager — Settings panel.
 * Tabs: Advanced (language, sound, wake lock) | Sync | Help
 */
import { LitElement, html, css } from "lit";
import { msg, str } from "@lit/localize";
const CARD_VERSION = "unified";
import { isWakeLockSupported } from "../services/wake-lock.js";
import { normalizeSettings } from "../services/theme.js";
import { componentStyles } from "./component-styles.js";

const LANGUAGES = [
  ["en", "English"],
  ["es", "Español"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["pt", "Português"],
  ["nl", "Nederlands"],
  ["it", "Italiano"],
];

class RmSettingsView extends LitElement {
  static properties = {
    hass: { type: Object },
    settings: { type: Object },
    _activeTab: { type: String },
    _rmVersion: { type: String },
    _rmcVersion: { type: String },
    _backupState: { type: String },
  };

  constructor() {
    super();
    this.settings = {};
    this._activeTab = "advanced";
    this._rmVersion = "…";
    this._rmcVersion = "…";
    this._backupState = null;
  }

  updated(changedProps) {
    if (changedProps.has("hass") && this.hass && this._rmVersion === "…") {
      this._fetchVersionsFromHacs();
    }
  }

  async _backup() {
    if (this._backupState === "loading") return;
    this._backupState = "loading";
    try {
      const data = await this.hass.callWS({ type: "recipe_manager/backup" });
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `macromate-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this._backupState = "done";
    } catch (err) {
      console.error("[RM] Backup failed:", err);
      this._backupState = "error";
    }
    setTimeout(() => {
      this._backupState = null;
    }, 3000);
  }

  _fetchVersionsFromHacs() {
    if (!this.hass) return;
    this._rmVersion = "…";
    this._rmcVersion = "…";
    this.hass
      .callWS({ type: "recipe_manager/get_info" })
      .then((info) => {
        this._rmVersion = info.version || "—";
        this._rmcVersion = CARD_VERSION;
      })
      .catch(() => {
        this._rmVersion = "—";
        this._rmcVersion = CARD_VERSION;
      });
  }

  _update(patch) {
    const next = normalizeSettings({ ...this.settings, ...patch });
    this.dispatchEvent(
      new CustomEvent("rm-settings-change", {
        detail: { settings: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const s = normalizeSettings(this.settings);
    return html`
      <div class="settings-root">
        <div class="tab-bar">
          ${[
            ["advanced", "mdi:tune-variant", msg("Advanced")],
            ["sync", "mdi:cloud-sync-outline", msg("Sync")],
            ["help", "mdi:help-circle-outline", msg("Help")],
          ].map(
            ([id, icon, label]) => html`
              <button
                class="tab-item ${this._activeTab === id ? "active" : ""}"
                aria-pressed=${this._activeTab === id}
                @click=${() => {
                  this._activeTab = id;
                }}
              >
                <ha-icon icon="${icon}"></ha-icon>
                <span>${label}</span>
              </button>
            `,
          )}
        </div>
        <div class="settings-body">
          ${this._activeTab === "advanced" ? this._renderAdvanced(s) : ""}
          ${this._activeTab === "sync" ? this._renderSync() : ""}
          ${this._activeTab === "help" ? this._renderHelp() : ""}
        </div>
      </div>
    `;
  }

  _renderAdvanced(s) {
    return html`
      <div class="section">
        <div class="setting-row">
          <span class="setting-name">${msg("Language")}</span>
          <select
            class="setting-select"
            aria-label=${msg("Language")}
            @change=${(e) => this._update({ language: e.target.value })}
          >
            ${LANGUAGES.map(
              ([code, label]) => html`
                <option
                  value="${code}"
                  ?selected=${(s.language ?? "en") === code}
                >
                  ${label}
                </option>
              `,
            )}
          </select>
        </div>
      </div>
      <!-- ── Timer Sound ── -->
      <div class="section">
        <div class="section-label">${msg("Timer Sound")}</div>

        <div class="setting-row">
          <span class="setting-name">${msg("Alarm sound")}</span>
          <select
            class="setting-select"
            aria-label=${msg("Alarm sound")}
            @change=${(e) => this._update({ timerSound: e.target.value })}
          >
            <option
              value="beep"
              ?selected=${(s.timerSound ?? "beep") === "beep"}
            >
              ${msg("Beep")}
            </option>
            <option value="ding" ?selected=${s.timerSound === "ding"}>
              ${msg("Ding")}
            </option>
            <option value="alarm" ?selected=${s.timerSound === "alarm"}>
              ${msg("Alarm (3 beeps)")}
            </option>
            <option value="none" ?selected=${s.timerSound === "none"}>
              ${msg("Silent")}
            </option>
            <option value="file" ?selected=${s.timerSound === "file"}>
              ${msg("Custom file…")}
            </option>
          </select>
        </div>

        ${s.timerSound === "file"
          ? html`
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">${msg("Sound file")}</span>
                  <span class="setting-hint"
                    >${s.timerSoundFileName || msg("No file selected")}</span
                  >
                </div>
                <label class="file-label">
                  <input
                    type="file"
                    accept="audio/*"
                    class="file-input"
                    @change=${this._handleSoundFileChange}
                  />
                  <ha-icon icon="mdi:folder-music-outline"></ha-icon>
                  ${s.timerSoundFile ? msg("Change") : msg("Choose file")}
                </label>
              </div>
            `
          : ""}

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${msg("Test sound")}</span>
            <span class="setting-hint"
              >${msg("Play a preview of the selected alarm")}</span
            >
          </div>
          <button
            class="seg-btn active"
            @click=${() =>
              this._testSound(s.timerSound ?? "beep", s.timerSoundFile)}
          >
            <ha-icon icon="mdi:volume-high"></ha-icon> ${msg("Play")}
          </button>
        </div>
      </div>

      <!-- ── Keep Screen On ── -->
      <div class="section">
        <div class="section-label">${msg("Keep Screen On")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name"
              >${msg("Keep screen on while viewing a recipe")}</span
            >
            <span class="setting-hint"
              >${msg(
                "Uses the Wake Lock API — engages automatically while a recipe is open",
              )}</span
            >
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              aria-label=${msg("Keep screen on while viewing a recipe")}
              ?checked=${s.keepScreenOn}
              @change=${(e) => this._update({ keepScreenOn: e.target.checked })}
            />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>

        ${s.keepScreenOn && !isWakeLockSupported()
          ? html`
              <div class="setting-row muted-row">
                <span class="setting-hint"
                  >${msg(
                    'Not available in this browser/connection — the Wake Lock API requires a secure (HTTPS) connection to Home Assistant. This is the most common reason "keep screen on" doesn\'t work.',
                  )}</span
                >
              </div>
            `
          : ""}
        ${s.keepScreenOn
          ? html`
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">${msg("Auto-release after")}</span>
                  <span class="setting-hint"
                    >${msg(
                      "Screen lock released after this many minutes",
                    )}</span
                  >
                </div>
                <div class="btn-group">
                  ${[15, 30, 45, 60].map(
                    (n) => html`
                      <button
                        class="seg-btn ${(s.wakeLockDuration ?? 60) === n
                          ? "active"
                          : ""}"
                        aria-pressed=${(s.wakeLockDuration ?? 60) === n}
                        @click=${() => this._update({ wakeLockDuration: n })}
                      >
                        ${n}m
                      </button>
                    `,
                  )}
                </div>
              </div>
            `
          : ""}
      </div>

      <!-- ── Image Slideshow ── -->
      <div class="section">
        <div class="section-label">${msg("Image Slideshow")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${msg("Auto-advance interval")}</span>
            <span class="setting-hint"
              >${msg(
                "Seconds between slides when a recipe has multiple images (0 = off)",
              )}</span
            >
          </div>
          <div class="btn-group">
            ${[0, 3, 5, 10, 15].map(
              (n) => html`
                <button
                  class="seg-btn ${(s.slideshowInterval ?? 5) === n
                    ? "active"
                    : ""}"
                  aria-pressed=${(s.slideshowInterval ?? 5) === n}
                  @click=${() => this._update({ slideshowInterval: n })}
                >
                  ${n === 0 ? msg("Off") : `${n}s`}
                </button>
              `,
            )}
          </div>
        </div>
      </div>
    `;
  }

  _handleSoundFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      this._update({
        timerSoundFile: evt.target.result,
        timerSoundFileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  _testSound(type, fileUrl) {
    if (type === "file") {
      if (
        typeof fileUrl === "string" &&
        fileUrl.length <= 2000000 &&
        /^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(fileUrl)
      ) {
        const audio = new Audio(fileUrl);
        audio.play().catch((err) => console.warn("Could not play file:", err));
      }
      return;
    }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (type === "ding") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046, ctx.currentTime);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.0);
      } else if (type === "alarm") {
        for (let i = 0; i < 3; i++) {
          const t = ctx.currentTime + i * 0.35;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "square";
          osc.frequency.setValueAtTime(660, t);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
        }
      } else if (type !== "none") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio test failed:", e);
    }
  }

  _renderSync() {
    const btnLabel =
      this._backupState === "loading"
        ? msg("Backing up…")
        : this._backupState === "done"
          ? msg("Downloaded ✓")
          : this._backupState === "error"
            ? msg("Failed ✗")
            : msg("Download backup");

    return html`
      <div class="section">
        <div class="section-label">${msg("Backup")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${msg("Export recipes")}</span>
            <span class="setting-hint"
              >${msg(
                "Download all recipes and meal plans as a JSON file",
              )}</span
            >
          </div>
          <button
            class="seg-btn backup-btn ${this._backupState || ""}"
            ?disabled=${this._backupState === "loading"}
            @click=${() => this._backup()}
          >
            ${btnLabel}
          </button>
        </div>
      </div>
    `;
  }

  _renderHelp() {
    return html`
      <div class="section">
        <div class="section-label">${msg("FAQ & Support")}</div>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate#readme"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:help-circle-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${msg("FAQ")}</span>
            <span class="setting-hint"
              >${msg("Frequently asked questions")}</span
            >
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:bug-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${msg("Report a Problem")}</span>
            <span class="setting-hint"
              >${msg("Submit an issue on GitHub")}</span
            >
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:github"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${msg("GitHub Repository")}</span>
            <span class="setting-hint">${msg("View source code")}</span>
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>
      </div>

      <div class="section">
        <div class="section-label">${msg("About")}</div>

        <div class="setting-row">
          <span class="setting-name">MacroMate</span>
          <span class="muted-note"
            >${msg(str`Integration version ${this._rmVersion}`)}</span
          >
        </div>

        <div class="setting-row">
          <span class="setting-name">MacroMate UI</span>
          <span class="muted-note"
            >${msg(str`Card version ${this._rmcVersion}`)}</span
          >
        </div>

        <div class="setting-row">
          <span class="setting-name">${msg("Refresh versions")}</span>
          <button
            class="seg-btn"
            aria-label=${msg("Refresh versions")}
            @click=${() => this._fetchVersionsFromHacs()}
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderPlaceholder(title, icon, message) {
    return html`
      <div class="placeholder-tab">
        <ha-icon icon="${icon}"></ha-icon>
        <div class="placeholder-title">${title}</div>
        <div class="placeholder-msg">${message}</div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }

    .settings-root {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .tab-bar {
      display: flex;
      border-bottom: 1px solid var(--rm-border, rgba(0, 0, 0, 0.08));
      background: var(--rm-bg-surface, #fff);
      flex-shrink: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tab-bar::-webkit-scrollbar {
      display: none;
    }

    .tab-item {
      display: flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 10px 14px;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      color: var(--rm-text-secondary, #6b5c4a);
      cursor: pointer;
      white-space: nowrap;
      transition:
        color 0.15s,
        border-color 0.15s;
      flex-shrink: 0;
    }
    .tab-item ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
    }
    .tab-item:hover {
      color: var(--rm-text, #2d2016);
    }
    .tab-item.active {
      color: var(--rm-accent-ink, var(--rm-text));
      border-bottom-color: var(--rm-accent);
    }

    .settings-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px 20px 32px;
      background: var(--rm-bg-main);
    }

    .section {
      max-width: 880px;
      margin: 16px auto;
      border: 1px solid var(--rm-border);
      border-radius: var(--rm-radius);
      background: var(--rm-bg-surface);
      overflow: hidden;
    }

    .section-label {
      font-size: var(--rm-font-size-sm);
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--rm-text-muted, #a08060);
      padding: 16px 20px 6px;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--rm-border-subtle);
      gap: 16px;
    }
    .setting-row:last-child {
      border-bottom: none;
    }
    .setting-row.muted-row {
      background: var(--rm-accent-soft);
    }

    .setting-name {
      font-size: 1em;
      font-weight: 600;
      flex-shrink: 1;
      overflow-wrap: anywhere;
      color: var(--rm-text);
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .setting-hint {
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-muted, #a08060);
    }

    .muted-note {
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text-muted, #a08060);
    }

    .backup-btn {
      min-width: 140px;
      white-space: nowrap;
    }
    .backup-btn.done {
      background: var(--rm-success, #4caf50);
      color: var(--rm-success-text);
    }
    .backup-btn.error {
      background: var(--rm-danger, #e53935);
      color: var(--rm-danger-text);
    }
    .backup-btn.loading {
      opacity: 0.7;
      cursor: wait;
    }

    .help-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--rm-border, rgba(0, 0, 0, 0.06));
      text-decoration: none;
      color: inherit;
    }
    .help-link:last-of-type {
      border-bottom: none;
    }
    .help-link ha-icon {
      color: var(--rm-accent-ink, var(--rm-text));
      flex-shrink: 0;
    }
    .help-link-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .help-link-ext {
      --mdc-icon-size: 16px;
      color: var(--rm-text-secondary);
    }

    .setting-select {
      background: var(--rm-bg-surface, #fff);
      color: var(--rm-text, #2d2016);
      border: 1px solid var(--rm-border-strong);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: var(--rm-font-size-sm);
      cursor: pointer;
      min-width: 160px;
      max-width: 100%;
      flex-shrink: 1;
    }

    .btn-group {
      display: flex;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--rm-border-strong);
      flex-shrink: 1;
    }
    .seg-btn {
      background: transparent;
      border: none;
      padding: 8px 14px;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      color: var(--rm-text-secondary, #6b5c4a);
      border-right: 1px solid var(--rm-border, rgba(0, 0, 0, 0.1));
      transition:
        background 0.12s,
        color 0.12s;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .seg-btn ha-icon {
      --mdc-icon-size: 16px;
    }
    .seg-btn:last-child {
      border-right: none;
    }
    .seg-btn.active {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #111);
    }
    .tab-item,
    .setting-select,
    .seg-btn,
    .file-label,
    .toggle {
      min-height: var(--rm-touch-target, 44px);
    }
    @media (max-width: 480px) {
      .settings-body {
        padding: 4px 12px 24px;
      }
      .setting-row {
        flex-wrap: wrap;
      }
      .btn-group {
        max-width: 100%;
        flex-wrap: wrap;
      }
      .seg-btn {
        flex: 1;
        justify-content: center;
      }
    }
    .seg-btn:hover:not(.active) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }

    .toggle {
      display: flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .toggle input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
    .toggle input:focus-visible + .toggle-track {
      outline: 3px solid var(--rm-focus);
      outline-offset: 3px;
    }
    .toggle-track {
      width: 44px;
      height: 24px;
      background: var(--rm-border-strong);
      border-radius: 12px;
      position: relative;
      transition: background 0.2s;
    }
    .toggle input:checked + .toggle-track {
      background: var(--rm-accent);
    }
    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: var(--rm-bg-elevated);
      border-radius: 50%;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .toggle input:checked ~ .toggle-track .toggle-thumb {
      transform: translateX(20px);
    }

    .file-label {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text);
      cursor: pointer;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .file-label:hover {
      background: var(--rm-accent-soft);
    }
    .file-label ha-icon {
      --mdc-icon-size: 18px;
      color: var(--rm-accent-ink, var(--rm-text));
    }
    .file-input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
    .file-label:focus-within {
      outline: 3px solid var(--rm-focus);
      outline-offset: 3px;
    }

    .placeholder-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      gap: 12px;
      color: var(--rm-text-secondary);
      text-align: center;
    }
    .placeholder-tab ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.3;
    }
    .placeholder-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--rm-text);
    }
    .placeholder-msg {
      font-size: var(--rm-font-size-sm);
      max-width: 280px;
      line-height: 1.5;
    }
    ${componentStyles}
  `;
}

try {
  customElements.define("rm-settings-view", RmSettingsView);
} catch {}
