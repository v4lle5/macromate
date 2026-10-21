import { LitElement, html, css } from "lit";
import { componentStyles } from "./component-styles.js";

// The secret lives only in this mounted panel. Requests always use HA's own
// authenticated transport; the editable address is used only for the handoff.
export class AgentAccess extends LitElement {
  static properties = {
    hass: { type: Object },
    language: { type: String },
    _label: { state: true },
    _origin: { state: true },
    _rows: { state: true },
    _created: { state: true },
    _busy: { state: true },
    _message: { state: true },
    _manual: { state: true },
    _copied: { state: true },
  };

  constructor() {
    super();
    this._epoch = 0;
    this._rows = [];
    this._label = "";
    this._origin = globalThis.location?.origin || "";
    this._created = null;
    this._busy = false;
    this._message = "";
    this._manual = false;
    this._copied = false;
  }

  t(de, en) {
    return (this.language || this.hass?.language || "en").startsWith("de")
      ? de
      : en;
  }

  willUpdate(changed) {
    if (changed.has("hass")) {
      const identity = `${this.hass?.user?.id}:${this.hass?.user?.is_admin === true}`;
      if (
        this._transport !== this.hass?.credentials ||
        this._identity !== identity
      ) {
        this._epoch++;
        this._forget();
        this._rows = [];
        this._busy = false;
        this._message = "";
        this._transport = this.hass?.credentials;
        this._identity = identity;
        if (this.hass?.user?.is_admin === true && this._transport)
          queueMicrotask(() => this._load());
      }
    }
  }

  disconnectedCallback() {
    this._epoch++;
    this._forget();
    this._rows = [];
    this._busy = false;
    super.disconnectedCallback();
  }

  _forget() {
    this._created = null;
    this._manual = false;
    this._copied = false;
    this._message = "";
    const field = this.shadowRoot?.querySelector("textarea");
    if (field) field.value = "";
  }

  _live(epoch) {
    return (
      this.isConnected &&
      epoch === this._epoch &&
      this.hass?.user?.is_admin === true &&
      this._identity ===
        `${this.hass?.user?.id}:${this.hass?.user?.is_admin === true}` &&
      this._transport === this.hass?.credentials
    );
  }

  _address() {
    const url = new URL(this._origin.trim());
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !["", "/"].includes(url.pathname)
    )
      throw new Error("Invalid origin");
    return url.origin;
  }

  _connection() {
    if (!this._created) return "";
    return JSON.stringify(
      {
        service: "MacroMate",
        base_url: this._address(),
        headers: {
          Authorization: `Bearer ${this._created.token}`,
          "Content-Type": "application/json",
        },
        discovery: {
          method: "POST",
          url: this._address() + "/api/macromate/agent/action/describe",
          body: {},
        },
        instructions: [
          "Store this credential privately; never repeat it in replies or logs.",
          "Call discovery first. Use the returned actions and schemas via POST /api/macromate/agent/action/{action} with the supplied headers and JSON body. No Python client or repository checkout is required.",
          "For each mutation generate a unique stable request_id. After a timeout retain the same request_id and identical payload, and inspect readback before retrying. Never duplicate a write with a new ID.",
          "Create recipes with recipes_add, then read recipes_get using the exact returned recipe.id. Use metric quantities and only known nutrition values. Existing recipes may be read and updated; other permissions are not granted by this connection.",
        ],
      },
      null,
      2,
    );
  }

  async _load() {
    if (this._busy || !this.hass?.credentials) return;
    const epoch = this._epoch;
    if (!this._live(epoch)) return;
    this._busy = true;
    this._message = "";
    try {
      const result = await this.hass.credentials("list");
      if (!this._live(epoch)) return;
      if (!Array.isArray(result.credentials))
        throw new Error("Invalid response");
      this._rows = result.credentials.filter(
        (row) =>
          /^[a-f0-9]{32}$/.test(row?.id || "") &&
          typeof row.label === "string" &&
          !row.revoked &&
          (!row.expires_at || row.expires_at * 1000 > Date.now()),
      );
      if (
        this._created &&
        !this._rows.some((row) => row.id === this._created.id)
      )
        this._forget();
    } catch {
      if (this._live(epoch))
        this._message = this.t(
          "Zugänge konnten nicht geladen werden. Bitte aktualisieren.",
          "Could not load access. Please refresh.",
        );
    } finally {
      if (this._live(epoch)) this._busy = false;
    }
  }

  async _create() {
    if (this._busy) return;
    const epoch = this._epoch;
    if (!this._live(epoch)) return;
    try {
      this._address();
    } catch {
      this._message = this.t(
        "Bitte eine gültige Home-Assistant-Adresse eingeben.",
        "Enter a valid Home Assistant address.",
      );
      return;
    }
    const label = this._label.trim() || this.t("Mein Agent", "My agent");
    if (label.length > 100 || /[\x00-\x1f]/.test(label)) return;
    this._forget();
    this._busy = true;
    this._message = "";
    try {
      const result = await this.hass.credentials("create", { label });
      if (!this._live(epoch)) return;
      if (
        !/^[a-f0-9]{32}$/.test(result.id || "") ||
        !/^mm1\.[a-f0-9]{32}\.[A-Za-z0-9_-]{43}$/.test(result.token || "") ||
        result.token.split(".")[1] !== result.id
      )
        throw new Error("Invalid response");
      this._created = { id: result.id, token: result.token };
      this._rows = [...this._rows, { id: result.id, label }];
    } catch (error) {
      if (this._live(epoch))
        this._message =
          error?.code === "unauthorized"
            ? this.t(
                "Bitte als Home-Assistant-Administrator anmelden.",
                "Sign in as a Home Assistant administrator.",
              )
            : this.t(
                "Zugang nicht bestätigt. Liste aktualisieren und einen neu angelegten Zugang ohne Schlüssel trennen, bevor du es erneut versuchst.",
                "Access was not confirmed. Refresh the list and disconnect any newly created access without a key before trying again.",
              );
    } finally {
      if (this._live(epoch)) this._busy = false;
    }
  }

  async _revoke(id) {
    if (this._busy) return;
    const epoch = this._epoch;
    if (!this._live(epoch)) return;
    this._busy = true;
    this._message = "";
    try {
      await this.hass.credentials("revoke", { id });
      if (!this._live(epoch)) return;
      if (this._created?.id === id) this._forget();
      this._rows = this._rows.filter((row) => row.id !== id);
    } catch {
      if (this._live(epoch))
        this._message = this.t(
          "Trennen nicht bestätigt. Bitte die Liste aktualisieren.",
          "Disconnect was not confirmed. Please refresh the list.",
        );
    } finally {
      if (this._live(epoch)) this._busy = false;
    }
  }

  async _copy() {
    const epoch = this._epoch;
    if (!this._live(epoch) || !this._created) return;
    let value;
    try {
      value = this._connection();
    } catch {
      this._message = this.t(
        "Bitte die Home-Assistant-Adresse prüfen.",
        "Check the Home Assistant address.",
      );
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      if (this._live(epoch)) this._copied = true;
    } catch {
      if (!this._live(epoch)) return;
      this._manual = true;
      this._message = this.t(
        "Bitte die markierten Verbindungsdaten kopieren.",
        "Copy the selected connection details.",
      );
      await this.updateComplete;
      if (this._live(epoch)) {
        const field = this.shadowRoot.querySelector("textarea");
        field?.focus();
        field?.select();
      }
    }
  }

  render() {
    if (this.hass?.user?.is_admin !== true) return html``;
    let connection = "";
    try {
      connection = this._connection();
    } catch {
      /* Editable origin may be incomplete. */
    }
    return html`
      <section>
        <h3>${this.t("Agent verbinden", "Connect agent")}</h3>
        <p>
          ${this.t(
            "Dein Agent darf Rezepte lesen, anlegen und bearbeiten.",
            "Your agent can read, create and edit recipes.",
          )}
        </p>
        <label
          >${this.t("Name des Agenten", "Agent name")}
          <input
            aria-label=${this.t("Name des Agenten", "Agent name")}
            maxlength="100"
            .value=${this._label}
            placeholder=${this.t("Mein Agent", "My agent")}
            ?disabled=${this._busy || !!this._created}
            @input=${(e) => {
              this._label = e.target.value;
            }}
          />
        </label>
        <label
          >${this.t("Home-Assistant-Adresse", "Home Assistant address")}
          <input
            aria-label=${this.t(
              "Home-Assistant-Adresse",
              "Home Assistant address",
            )}
            type="url"
            .value=${this._origin}
            @input=${(e) => {
              this._origin = e.target.value;
              this._copied = false;
            }}
          />
        </label>
        <p class="hint">
          ${this.t(
            "Im selben Netz kann dein Agent diese Adresse direkt nutzen.",
            "On the same network your agent can use this address directly.",
          )}
        </p>
        ${this._created
          ? html`
              <div class="handoff">
                <p>
                  ${this.t(
                    "Zugang erstellt. Kopiere die Verbindung und übergib sie deinem Agenten. Der Schlüssel wird nur jetzt angezeigt.",
                    "Access created. Copy the connection and give it to your agent. The key is only shown now.",
                  )}
                </p>
                <div class="actions">
                  <button @click=${this._copy} ?disabled=${!connection}>
                    ${this.t("Verbindung kopieren", "Copy connection")}
                  </button>
                  <button class="secondary" @click=${this._forget}>
                    ${this.t("Fertig", "Done")}
                  </button>
                </div>
                ${this._copied
                  ? html`<p role="status">
                      ${this.t("Verbindung kopiert.", "Connection copied.")}
                    </p>`
                  : ""}
                <details .open=${this._manual}>
                  <summary>
                    ${this.t(
                      "Verbindungsdaten anzeigen",
                      "Show connection details",
                    )}
                  </summary>
                  <textarea
                    aria-label=${this.t(
                      "Verbindungsdaten",
                      "Connection details",
                    )}
                    readonly
                    spellcheck="false"
                    .value=${connection}
                  ></textarea>
                </details>
              </div>
            `
          : html`<button @click=${this._create} ?disabled=${this._busy}>
              ${this.t("Agent verbinden", "Connect agent")}
            </button>`}
        ${this._message ? html`<p role="status">${this._message}</p>` : ""}
      </section>
      <section>
        <div class="heading">
          <h3>${this.t("Aktive Zugänge", "Active access")}</h3>
          <button
            class="secondary"
            @click=${this._load}
            ?disabled=${this._busy}
          >
            ${this.t("Zugänge aktualisieren", "Refresh access")}
          </button>
        </div>
        ${this._rows.length
          ? html`<ul>
              ${this._rows.map(
                (row) =>
                  html` <li data-credential-id=${row.id}>
                    <span>${row.label}</span>
                    <button
                      class="secondary"
                      @click=${() => this._revoke(row.id)}
                      ?disabled=${this._busy}
                    >
                      ${this.t("Trennen", "Disconnect")}
                    </button>
                  </li>`,
              )}
            </ul>`
          : html`<p class="hint">
              ${this.t("Noch kein aktiver Zugang.", "No active access yet.")}
            </p>`}
      </section>
    `;
  }

  static styles = [
    componentStyles,
    css`
      :host {
        display: block;
        color: var(--rm-text);
      }
      section {
        padding: 16px 0;
        border-bottom: 1px solid var(--rm-border);
      }
      h3 {
        margin: 0 0 10px;
        font-size: 1rem;
      }
      p {
        line-height: 1.5;
      }
      .hint {
        color: var(--rm-text-secondary);
        font-size: 0.85rem;
      }
      label {
        display: grid;
        gap: 6px;
        margin: 14px 0;
        font-size: 0.9rem;
      }
      input,
      textarea {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        padding: 12px;
        border: 1px solid var(--rm-border);
        border-radius: var(--rm-radius-sm, 8px);
        background: var(--rm-bg-input, var(--rm-bg-surface));
        color: var(--rm-text);
        font: inherit;
      }
      textarea {
        margin-top: 12px;
        min-height: 180px;
        resize: vertical;
        font: 0.8rem monospace;
      }
      button {
        min-height: 44px;
        padding: 10px 14px;
        border: 1px solid var(--rm-border);
        border-radius: var(--rm-radius-sm, 8px);
        background: var(--rm-accent);
        color: var(--rm-accent-text);
        cursor: pointer;
        font: inherit;
      }
      button.secondary {
        background: var(--rm-bg-surface);
        color: var(--rm-text);
      }
      button:disabled {
        opacity: 0.6;
        cursor: default;
      }
      button:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      summary:focus-visible {
        outline: 2px solid var(--rm-text);
        outline-offset: 2px;
      }
      .actions,
      .heading {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .heading {
        justify-content: space-between;
      }
      .heading h3 {
        margin: 0;
      }
      details {
        margin-top: 14px;
      }
      summary {
        min-height: 44px;
        display: list-item;
        align-content: center;
        cursor: pointer;
      }
      ul {
        list-style: none;
        padding: 0;
        margin-bottom: 0;
      }
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0;
      }
      li span {
        min-width: 0;
        overflow-wrap: anywhere;
      }
    `,
  ];
}

customElements.define("mm-agent-access", AgentAccess);
