// One authenticated MacroMate transport; provider errors never enter the DOM.
const DEFINITIVE = new Set([
  "invalid_request",
  "not_found",
  "not_ready",
  "unauthorized",
  "provider_unavailable",
  "invalid_payload",
  "forbidden",
  "conflict",
  "invalid_format",
  "unknown_command",
]);
const READS = new Set([
  "profiles_list",
  "profiles_get",
  "profiles_users",
  "nutrition_report",
  "search_foods",
  "food",
  "barcode",
  "recipes_scrape",
  "describe",
  "diary",
  "profile",
  "food_get",
  "food_search",
  "food_favorites",
  "platform_info",
  "platform_backup",
  "preferences_get",
  "shopping_export_data",
  "shopping_get_integration_settings",
]);
export function canonicalAction(type) {
  if (type === "recipe_manager/import/recipe_keeper")
    return "recipe_keeper_import";
  if (type === "recipe_manager/get_info") return "platform_info";
  if (type === "recipe_manager/backup") return "platform_backup";
  if (type.startsWith("recipe_manager/"))
    return type.slice(15).replaceAll("/", "_");
  if (type.startsWith("shopping_list_manager/"))
    return "shopping_" + type.slice(22).replaceAll("/", "_");
  return type;
}
export function safeError(code) {
  const messages = {
    read_failed: "Reading failed. Check the connection and reload.",
    unauthorized: "This account cannot access this workspace.",
    invalid_request: "Check the submitted fields.",
    invalid_format: "Check the submitted fields.",
    unknown_command: "Update MacroMate and reload the workspace.",
    not_found: "The selected record no longer exists.",
    context_changed: "Account or connection changed. Reopen the workspace.",
    pending: "Resolve the uncertain request before another change.",
    uncertain:
      "Connection interrupted. The write may have succeeded. Retry the same request explicitly.",
    not_ready: "MacroMate is not ready.",
    provider_unavailable: "Remote provider unavailable.",
  };
  return Object.assign(
    new Error(messages[code] || "The operation could not be completed."),
    { code },
  );
}
export class MacroMateAPI extends EventTarget {
  constructor(hass) {
    super();
    this.hass = hass;
    this.context = {
      user: hass?.user?.id,
      admin: hass?.user?.is_admin === true,
      connection: hass?.connection,
    };
    this.active = true;
    this.pending = null;
    this.busy = false;
    this.actions = {};
    this.urls = new Map();
    this.mediaPromises = new Map();
    this.unsubscribers = new Set();
    this.credentials = this.credentials.bind(this);
  }
  current() {
    return (
      this.active &&
      this.context.user === this.hass?.user?.id &&
      this.context.admin === (this.hass?.user?.is_admin === true) &&
      this.context.connection === this.hass?.connection
    );
  }
  guard() {
    if (!this.current()) throw safeError("context_changed");
  }
  readOnly(action) {
    return (
      this.actions[action]?.read_only ??
      (READS.has(action) ||
        /(?:_get|_get_all|_get_by_ids|_search|_suggestions|_get_total)$/.test(
          action,
        ))
    );
  }
  authorize(action, payload = {}) {
    this.guard();
    const privateNutrition = [
      "diary",
      "log_meal",
      "update_meal",
      "delete_meal",
      "clear_day",
      "copy_meal",
      "food",
      "search_foods",
      "barcode",
      "favorite",
      "save_food",
      "log_food",
      "update_food_entry",
      "food_delete",
      "recipe_entry_update",
      "nutrition_report",
    ];
    if (
      !this.context.admin &&
      privateNutrition.includes(action) &&
      !payload.profile_id
    )
      throw safeError("unauthorized");
    if (
      !this.context.admin &&
      !(
        action.startsWith("profiles_") ||
        [
          "diary",
          "log_meal",
          "update_meal",
          "delete_meal",
          "clear_day",
          "copy_meal",
          "food",
          "search_foods",
          "barcode",
          "favorite",
          "save_food",
          "log_food",
          "update_food_entry",
          "food_delete",
          "recipe_entry_update",
          "nutrition_report",
          "describe",
          "platform_info",
          "preferences_get",
          "preferences_update",
        ].includes(action)
      )
    )
      throw safeError("unauthorized");
    if (!this.context.admin && this.actions[action]?.admin_only)
      throw safeError("unauthorized");
  }
  notify() {
    this.dispatchEvent(new Event("state"));
  }
  async call(type, payload = {}) {
    if (typeof type !== "string") throw safeError("invalid_request");
    const action = canonicalAction(type);
    // Native/third-party HA requests must never become MacroMate mutations.
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(action))
      throw safeError("invalid_request");
    this.authorize(action, payload);
    if (this.readOnly(action))
      return this.send(action, structuredClone(payload));
    if (this.pending) throw safeError("pending");
    this.pending = {
      action,
      payload: structuredClone({
        ...payload,
        request_id: payload.request_id || crypto.randomUUID(),
      }),
    };
    this.notify();
    return this.retry();
  }
  read(action, payload = {}) {
    return this.call(action, payload);
  }
  write(action, payload = {}) {
    return this.call(action, payload);
  }
  async retry() {
    this.guard();
    if (!this.pending) return;
    if (this.busy) throw safeError("pending");
    this.authorize(this.pending.action, this.pending.payload);
    this.busy = true;
    this.notify();
    let accepted = false;
    try {
      const result = await this.send(this.pending.action, this.pending.payload);
      this.guard();
      this.pending = null;
      accepted = true;
      return result;
    } catch (e) {
      if (this.current() && DEFINITIVE.has(e.code)) this.pending = null;
      throw e;
    } finally {
      this.busy = false;
      this.notify();
      if (accepted && this.current()) this.dispatchEvent(new Event("accepted"));
    }
  }
  async send(action, payload) {
    this.authorize(action, payload);
    payload = this.denormalize(payload);
    try {
      const result = await this.hass.callWS({
        type: "macromate/command",
        action,
        payload,
      });
      this.guard();
      if (this.lastReadFailure?.action === action) {
        this.lastReadFailure = null;
        this.notify();
      }
      if (
        ["preferences_get", "preferences_update"].includes(action) &&
        (!result ||
          typeof result.preferences !== "object" ||
          result.preferences === null ||
          Array.isArray(result.preferences))
      )
        throw new Error("Invalid preferences response");
      if (action === "describe") {
        this.actions = result.actions || {};
        return structuredClone(result);
      }
      if (["platform_backup", "shopping_export_data"].includes(action))
        return structuredClone(result);
      const normalized = await this.normalize(result);
      this.guard();
      return normalized;
    } catch (e) {
      if (!this.current()) throw safeError("context_changed");
      const code = DEFINITIVE.has(e?.code)
        ? e.code
        : this.readOnly(action)
          ? "read_failed"
          : "uncertain";
      if (this.readOnly(action)) {
        this.lastReadFailure = {
          action: /^[a-z_]{1,64}$/.test(action) ? action : "read",
          code,
        };
        this.notify();
      }
      if (!this.readOnly(action)) {
        this.lastFailure = {
          action,
          code:
            DEFINITIVE.has(e?.code) || e?.code === "storage_unavailable"
              ? e.code
              : "transport_or_response",
          outcome: code === "uncertain" ? "uncertain" : "rejected",
        };
      }
      throw safeError(code);
    }
  }
  denormalize(value, key = "") {
    if (
      ["image_url", "photos", "local_url"].includes(key) &&
      typeof value === "string" &&
      value.startsWith("blob:")
    ) {
      for (const [id, url] of this.urls)
        if (url === value) return `/api/macromate/media/${id}`;
      throw safeError("invalid_request");
    }
    if (Array.isArray(value)) return value.map((v) => this.denormalize(v, key));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, this.denormalize(v, k)]),
      );
    return value;
  }
  async normalize(data) {
    if (Array.isArray(data))
      return Promise.all(data.map((v) => this.normalize(v)));
    if (!data || typeof data !== "object") return data;
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      if (k === "source_url") {
        try {
          const u = new URL(v);
          out[k] =
            ["https:", "http:"].includes(u.protocol) &&
            !u.username &&
            !u.password
              ? u.href
              : null;
        } catch {
          out[k] = null;
        }
      } else if (["image_url", "local_url", "photos"].includes(k)) {
        if (Array.isArray(v))
          out[k] = (await Promise.all(v.map((x) => this.media(x)))).filter(
            Boolean,
          );
        else out[k] = await this.media(v);
      } else out[k] = await this.normalize(v);
    }
    if (data.media_id) out.image_url = await this.media(data.media_id);
    if (
      data.id &&
      (Object.hasOwn(data, "image_url") || Object.hasOwn(data, "photos"))
    )
      out.media_refs = {
        image_url: data.image_url,
        photos: structuredClone(data.photos || []),
      };
    return out;
  }
  previewURL(value) {
    if (typeof value !== "string") return null;
    if ([...this.urls.values()].includes(value)) return value;
    const id = value.replace(/^\/api\/macromate\/media\//, "");
    return this.urls.get(id) || null;
  }
  async media(value) {
    if (!value) return null;
    const id = String(value).replace(/^\/api\/macromate\/media\//, "");
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
    if (this.urls.has(id)) return this.urls.get(id);
    if (this.mediaPromises.has(id)) return this.mediaPromises.get(id);
    this.guard();
    const operation = (async () => {
      try {
        const response = await this.hass.fetchWithAuth(
          `/api/macromate/media/${encodeURIComponent(id)}`,
        );
        this.guard();
        if (!response.ok) return null;
        const blob = await response.blob();
        this.guard();
        if (
          !["image/webp", "image/png", "image/jpeg"].includes(blob.type) ||
          blob.size > 8 * 1024 * 1024
        )
          return null;
        const url = URL.createObjectURL(blob);
        this.urls.set(id, url);
        return url;
      } catch {
        return null;
      }
    })();
    this.mediaPromises.set(id, operation);
    try {
      return await operation;
    } finally {
      this.mediaPromises.delete(id);
    }
  }
  async subscribe(callback) {
    this.guard();
    const refresh = () => {
      if (this.current()) {
        try {
          Promise.resolve(callback({ event: "refresh" })).catch(() => {});
        } catch {}
      }
    };
    const release = await this.hass.connection.subscribeMessage(refresh, {
      type: "macromate/subscribe",
    });
    if (!this.current()) {
      try {
        await release();
      } catch {}
      throw safeError("context_changed");
    }
    this.addEventListener("accepted", refresh);
    let active = true;
    const unsubscribe = () => {
      if (!active) return;
      active = false;
      this.removeEventListener("accepted", refresh);
      this.unsubscribers.delete(unsubscribe);
      try {
        return Promise.resolve(release()).catch(() => {});
      } catch {}
    };
    this.unsubscribers.add(unsubscribe);
    return unsubscribe;
  }
  facade() {
    const api = this;
    return {
      user: { ...this.hass.user },
      language: this.locale || this.hass.language,
      credentials: this.credentials,
      connection: {
        subscribeMessage: (callback) => api.subscribe(callback),
        subscribeEvents: (callback) => api.subscribe(callback),
      },
      callWS: (message) => {
        if (message.type === "macromate/command") {
          if (
            api.pending &&
            message.action === api.pending.action &&
            message.payload?.request_id === api.pending.payload.request_id &&
            JSON.stringify(message.payload) ===
              JSON.stringify(api.pending.payload)
          )
            return api.retry();
          return api.call(message.action, message.payload);
        }
        const { type, ...payload } = message;
        return api.call(type, payload);
      },
    };
  }
  async credentials(operation, payload = {}) {
    const guard = () => {
      this.guard();
      if (!this.context.admin) throw safeError("unauthorized");
    };
    guard();
    let path = "/api/macromate/agent/credentials";
    const options = { method: "GET" };
    if (operation === "create") {
      if (typeof payload.label !== "string") throw safeError("invalid_request");
      options.method = "POST";
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify({
        label: payload.label,
        scopes: ["recipes.read", "recipes.create", "recipes.update"],
      });
    } else if (operation === "revoke") {
      if (typeof payload.id !== "string" || !/^[a-f0-9]{32}$/.test(payload.id))
        throw safeError("invalid_request");
      path += "/" + payload.id;
      options.method = "DELETE";
    } else if (operation !== "list") throw safeError("invalid_request");
    // Credentials have no replay mechanism. Never retain a bearer token in the
    // shared transport, and never retry creation after an uncertain response.
    try {
      const response = await this.hass.fetchWithAuth(path, options);
      guard();
      if (!response.ok) {
        const code =
          response.status === 401 || response.status === 403
            ? "unauthorized"
            : response.status === 400
              ? "invalid_request"
              : response.status === 404
                ? "not_found"
                : operation === "list"
                  ? "read_failed"
                  : "uncertain";
        throw safeError(code);
      }
      const result = await response.json();
      guard();
      if (!result || typeof result !== "object" || Array.isArray(result))
        throw safeError(operation === "list" ? "read_failed" : "uncertain");
      if (
        operation === "revoke" &&
        (result.id !== payload.id || result.revoked !== true)
      )
        throw safeError("uncertain");
      return result;
    } catch (error) {
      guard();
      throw safeError(
        ["unauthorized", "invalid_request", "not_found"].includes(error?.code)
          ? error.code
          : operation === "list"
            ? "read_failed"
            : "uncertain",
      );
    }
  }
  dispose() {
    this.active = false;
    this.pending = null;
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
    this.mediaPromises.clear();
    for (const release of this.unsubscribers) {
      try {
        Promise.resolve(release()).catch(() => {});
      } catch {}
    }
    this.unsubscribers.clear();
  }
}
