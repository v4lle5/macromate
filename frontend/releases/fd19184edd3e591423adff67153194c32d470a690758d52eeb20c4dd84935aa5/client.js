// Transport only: authentication stays entirely in Home Assistant's hass object.
const DEFINITIVE = new Set([
  "invalid_request",
  "invalid_payload",
  "forbidden",
  "conflict",
  "context_changed",
  "not_found",
  "not_ready",
  "unauthorized",
  "provider_unavailable",
]);
export function publicError(error) {
  return (
    {
      read_failed: "Lesen fehlgeschlagen. Verbindung prüfen und erneut laden.",
      uncertain: "Verbindung unterbrochen. Schreibstatus eventuell ungeklärt.",
      unauthorized:
        "Nur Home-Assistant-Administratoren dürfen MacroMate verwenden.",
      invalid_request: "Bitte Eingaben prüfen.",
      not_found: "Eintrag oder Lebensmittel nicht gefunden.",
      not_ready: "MacroMate ist noch nicht bereit.",
      provider_unavailable:
        "Online-Anbieter nicht verfügbar. Konfigurationsfreigabe und Verbindung prüfen.",
    }[error?.code] || "Verbindung unterbrochen. Bitte erneut laden."
  );
}
export class CommandClient {
  constructor(hass) {
    this.hass = hass;
    this.pending = null;
    this.busy = false;
  }
  read(action, payload = {}) {
    if (this.profileId && !action.startsWith("profiles_"))
      payload = { profile_id: this.profileId, ...payload };
    if (
      this.hass.user?.is_admin === false &&
      !payload.profile_id &&
      !action.startsWith("profiles_")
    )
      return Promise.reject({ code: "unauthorized" });
    return this.hass.callWS({ type: "macromate/command", action, payload });
  }
  write(action, payload) {
    if (this.pending)
      return Promise.reject(
        new Error(
          "Vorheriger Schreibstatus ungeklärt. Erst explizit erneut senden.",
        ),
      );
    this.pending = {
      action,
      payload: structuredClone({
        ...(this.profileId && !action.startsWith("profiles_")
          ? { profile_id: this.profileId }
          : {}),
        ...payload,
        request_id: crypto.randomUUID(),
      }),
    };
    return this.retry();
  }
  async retry() {
    if (this.busy) throw new Error("Anfrage läuft bereits.");
    if (!this.pending) return;
    this.busy = true;
    try {
      const { action, payload } = this.pending;
      const result = await this.read(action, payload);
      this.pending = null;
      return result;
    } catch (error) {
      if (DEFINITIVE.has(error?.code)) {
        this.pending = null;
        throw error;
      }
      throw Object.assign(new Error("Write status uncertain."), {
        code: "uncertain",
      });
    } finally {
      this.busy = false;
    }
  }
}
