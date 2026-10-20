/**
 * Recipe Manager Card — main entry point.
 */
import { LitElement, html, css } from "lit";
import { msg, str } from "@lit/localize";
import { RecipeManagerAPI } from "./services/api.js";
import { loadUI, saveUI } from "./services/context-cache.js";
import { normalizeSettings, applyGlassWaveTheme } from "./services/theme.js";
import { setActiveLocale, allLocales } from "./services/localize.js";
import {
  acquire as acquireWakeLock,
  release as releaseWakeLock,
  isWakeLockSupported,
} from "./services/wake-lock.js";

const GLOBAL_WAKE_LOCK_REASON = "manual-toggle";

import "./components/rm-recipe-grid.js";
import "./components/rm-recipe-detail.js";
import "./components/rm-add-recipe-dialog.js";
import "./components/rm-meal-planner.js";
import "./components/rm-settings-view.js";
import "./components/nutrition.js";
import { componentStyles } from "./components/component-styles.js";

// ---------------------------------------------------------------------------
// Settings helpers
// ---------------------------------------------------------------------------

// Views worth restoring after a reload, excluding transient import/timer views.
const RESTORABLE_VIEWS = ["grid", "detail", "settings", "planner"];

// ---------------------------------------------------------------------------
// Timer helpers
// ---------------------------------------------------------------------------

function formatTimerDisplay(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Timer sound via Web Audio API
// ---------------------------------------------------------------------------

function playTimerSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const play = (freq, start, dur, vol = 0.6) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };

    if (type === "beep") {
      play(880, 0, 0.15);
      play(880, 0.2, 0.15);
      play(880, 0.4, 0.15);
    } else if (type === "ding") {
      play(1318, 0, 0.8, 0.5);
      play(1047, 0.1, 0.6, 0.3);
    } else if (type === "alarm") {
      for (let i = 0; i < 5; i++) {
        play(880, i * 0.25, 0.12);
        play(660, i * 0.25 + 0.13, 0.1);
      }
    }
    // 'none' → no sound
  } catch {
    /* AudioContext not available */
  }
}

// ---------------------------------------------------------------------------
// Card element
// ---------------------------------------------------------------------------

export class UnifiedApp extends LitElement {
  static properties = {
    hass: { type: Object },
    _config: { type: Object },
    _view: { type: String },
    _recipes: { type: Array },
    _tags: { type: Array },
    _selectedRecipe: { type: Object },
    _loading: { type: Boolean },
    _error: { type: String },
    _searchQuery: { type: String },
    _activeTag: { type: String },
    _settings: { type: Object },
    _wide: { type: Boolean },
    _sidebarCollapsed: { type: Boolean },
    _gridScrollPos: { type: Number },
    _recentRecipeIds: { type: Array },
    _timers: { type: Array },
    _timerAlarm: { type: Object },
    _timerAlarmQueue: { type: Array },
    _timersPrevView: { type: String },
    _customTimerInput: { type: String },
    _hdrStarHover: { type: Number },
    _mobileMenuOpen: { type: Boolean },
    _navDirection: { type: String },
    _closingDetail: { type: Boolean },
    _gridFilterPreset: { type: Object },
    _timerPresets: { type: Array },
    _presetNameInput: { type: String },
    _presetMinsInput: { type: String },
    _alarmAddInput: { type: String },
    _plannerFromRecipe: { type: Object },
    _globalMode: { type: Boolean },
    _quickTimerLabel: { type: String },
    _globalWakeActive: { type: Boolean },
  };

  constructor() {
    super();
    // Restore actor-scoped view state only after the authenticated transport
    // is ready; defaults must never overwrite a pending restore.
    this._pendingViewRestore = null;
    this._view = "grid";
    this._recipes = [];
    this._tags = [];
    this._selectedRecipe = null;
    this._loading = false;
    this._error = null;
    this._searchQuery = "";
    this._activeTag = null;
    this._settings = normalizeSettings();
    this._languageAutoDetectPending = true;
    setActiveLocale(this._settings.language);
    this._wide = false;
    this._sidebarCollapsed = false;
    this._gridScrollPos = 0;
    this._recentRecipeIds = [];
    this._timers = [];
    this._timerAlarm = null;
    this._timerAlarmQueue = [];
    this._timersPrevView = null;
    this._customTimerInput = "";
    this._hdrStarHover = 0;
    this._mobileMenuOpen = false;
    this._navDirection = "forward";
    this._closingDetail = false;
    this._gridFilterPreset = null;
    this._timerPresets = [];
    this._presetNameInput = "";
    this._presetMinsInput = "";
    this._alarmAddInput = "";
    this._plannerFromRecipe = null;
    this._globalMode = false;
    this._quickTimerLabel = "";
    this._alarmLoopActive = false;
    this._alarmInterval = null;
    this._alarmTimeout = null;
    this._alarmAudio = null;
    this._unsubscribe = null;
    this._refreshGeneration = 0;
    this._refreshRequested = false;
    this._refreshScheduled = false;
    this._refreshRunning = false;
    this._recipeRefreshDeferred = false;
    this._darkModeQuery = null;
    this._resizeObserver = null;
    this._timerTick = null;
    this._globalWakeActive = false;
    this._globalWakeUnsubscribeFn = null;
  }

  setConfig(config) {
    this._config = config;
  }
  static getStubConfig() {
    return {};
  }
  getCardSize() {
    return 6;
  }

  _updateHeight() {
    // Double RAF: first frame lets HA's layout engine position the card,
    // second frame reads the accurate getBoundingClientRect().top.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const top = this.getBoundingClientRect().top;
        const available = window.innerHeight - Math.max(top, 0);
        if (available > 100) this.style.height = `${available}px`;
      }),
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this._darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this._darkModeQuery.addEventListener("change", this._onSystemDark);
    this._applyTheme();
    this._resizeObserver = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      this._wide = w >= 620;
      // Height is only updated on window/visualViewport resize to avoid
      // a feedback loop (changing style.height triggers the observer again).
    });
    this._resizeObserver.observe(this);
    this._onViewportResize = () => this._updateHeight();
    window.visualViewport?.addEventListener("resize", this._onViewportResize);
    window.addEventListener("resize", this._onViewportResize);
    this._updateHeight();
    this._timerTick = setInterval(() => this._tickTimers(), 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._refreshGeneration++;
    this._refreshRequested = false;
    this._refreshScheduled = false;
    this._refreshRunning = false;
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    this._darkModeQuery?.removeEventListener("change", this._onSystemDark);
    this._resizeObserver?.disconnect();
    window.visualViewport?.removeEventListener(
      "resize",
      this._onViewportResize,
    );
    window.removeEventListener("resize", this._onViewportResize);
    if (this._timerTick) {
      clearInterval(this._timerTick);
      this._timerTick = null;
    }
    if (this._timerAlarm) {
      this._stopAlarmLoop();
      this._timerAlarm = null;
    }
    this._timerAlarmQueue = [];
    if (this._globalWakeActive) releaseWakeLock(GLOBAL_WAKE_LOCK_REASON);
  }

  _onSystemDark = () => {
    if (this._settings.darkMode === "system") this._applyTheme();
  };

  updated(changedProps) {
    if (changedProps.has("hass") && this.hass && !this._api) {
      this._api = new RecipeManagerAPI(this.hass);
      this._api.transport = this.transport;
      this._init();
    }
    if (
      changedProps.has("hass") &&
      this.hass &&
      this._languageAutoDetectPending
    ) {
      this._languageAutoDetectPending = false;
      const detected = (this.hass.language || "").split("-")[0].toLowerCase();
      const resolved = allLocales.includes(detected)
        ? detected
        : this._settings.language;
      this._settings = { ...this._settings, language: resolved };
      setActiveLocale(resolved);
    }
    if (changedProps.has("hass") && this._api) this._api.hass = this.hass;
    if (changedProps.has("_settings")) this._applyTheme();
    if (
      changedProps.has("_view") ||
      changedProps.has("_selectedRecipe") ||
      changedProps.has("_timers") ||
      changedProps.has("_recentRecipeIds")
    )
      this._saveViewState();
    if (
      (changedProps.has("_view") || changedProps.has("_closingDetail")) &&
      this._recipeRefreshDeferred &&
      !this.shadowRoot.querySelector("rm-add-recipe-dialog, rm-recipe-detail")
    )
      this._queueRefresh();
  }

  // -- View-state persistence -------------------------------------------------
  // Mobile browsers commonly discard a backgrounded tab's JS state (e.g.
  // after the screen locks) and reload it fresh when it comes back into
  // view. Without this, that reload always dumps the user back on the grid
  // — this restores whatever they were last looking at.

  _saveViewState() {
    if (!this._cacheBootstrapped || !this.transport?.current()) return;
    const view = RESTORABLE_VIEWS.includes(this._view) ? this._view : "grid";
    saveUI(
      this.transport,
      {
        view,
        recipeId: view === "detail" ? this._selectedRecipe?.id || null : null,
        recentIds: this._recentRecipeIds,
      },
      this._timers,
    );
  }

  _restoreViewState() {
    const state = this._pendingViewRestore;
    this._pendingViewRestore = null;
    if (!state || !RESTORABLE_VIEWS.includes(state.view)) return;
    if (state.view === "detail" && state.recipeId) {
      const recipe = this._recipes.find((r) => r.id === state.recipeId);
      if (recipe) {
        this._selectedRecipe = recipe;
        this._view = "detail";
      }
      // If the recipe no longer exists, fall through and stay on the default grid.
    } else if (state.view !== "detail") {
      this._view = state.view;
    }
  }

  _applyTheme() {
    applyGlassWaveTheme(
      this,
      this._settings,
      this._darkModeQuery?.matches ?? false,
    );
  }

  // -- Data -----------------------------------------------------------------

  async _init() {
    this._loading = true;
    this._error = null;
    if (!this._cacheBootstrapped && this.hass.user.is_admin) {
      const cache = loadUI(this.transport);
      this._pendingViewRestore = cache;
      this._recentRecipeIds = cache.recentIds || [];
      this._timers = cache.timers || [];
      this._cacheBootstrapped = true;
    }
    try {
      const p = await this.transport.call("preferences_get");
      if (p.preferences?.recipe_settings) {
        this._settings = normalizeSettings({
          ...this._settings,
          ...p.preferences.recipe_settings,
        });
        await setActiveLocale(this._settings.language);
        this.transport.locale = this._settings.language;
        this.hass = this.transport.facade();
      }
      if (!this.hass.user.is_admin) {
        this._view = "nutrition";
        return;
      }
      await Promise.all([
        this._loadRecipes(),
        this._loadTags(),
        this._loadGlobalTimers(),
      ]);
      this._restoreViewState();
      await this._loadPresets();
      await this._subscribe();
    } catch (e) {
      this._error = e.message || msg("Failed to load recipes");
    } finally {
      this._loading = false;
    }
  }

  async _loadGlobalTimers() {
    try {
      const { timers } = await this._api.getGlobalTimers();
      const now = Date.now() / 1000;
      // Remove any stale global timers from _timers (e.g. from a previous session), then add fresh ones
      this._timers = [
        ...this._timers.filter((t) => !t.global),
        ...(timers || []).map((t) => this._globalTimerToLocal(t, now)),
      ];
    } catch {
      /* global timers unavailable */
    }
  }

  _globalTimerToLocal(t, now = Date.now() / 1000) {
    const remaining = t.running
      ? Math.max(0, t.duration - (now - t.start_time))
      : (t.paused_remaining ?? t.duration);
    return {
      id: t.id,
      label: t.label,
      total: t.duration,
      remaining: Math.round(remaining),
      running: t.running && remaining > 0,
      alarming: t.running && remaining <= 0,
      presetId: t.preset_id || null,
      global: true,
      duration: t.duration,
      start_time: t.start_time,
      paused_remaining: t.paused_remaining,
    };
  }

  async _loadRecipes() {
    const r = await this._api.getAllRecipes();
    this._recipes = r?.recipes ?? [];
  }

  async _loadTags() {
    const r = await this._api.getTags();
    this._tags = r?.tags ?? [];
  }

  async _subscribe() {
    if (this._unsubscribe) return;
    const generation = this._refreshGeneration;
    const unsubscribe = await this._api.subscribe(() => this._queueRefresh());
    if (
      !this.isConnected ||
      generation !== this._refreshGeneration ||
      !this.transport.current()
    ) {
      unsubscribe();
    } else this._unsubscribe = unsubscribe;
  }

  _queueRefresh() {
    this._refreshRequested = true;
    if (this._refreshScheduled || this._refreshRunning) return;
    this._refreshScheduled = true;
    const generation = this._refreshGeneration;
    queueMicrotask(() => {
      if (generation !== this._refreshGeneration) return;
      this._refreshScheduled = false;
      this._refreshLive();
    });
  }

  async _refreshLive() {
    const transport = this.transport;
    if (
      !this._refreshRequested ||
      !this.isConnected ||
      !transport?.current() ||
      transport.pending
    )
      return;
    this._refreshRequested = false;
    this._refreshRunning = true;
    const generation = this._refreshGeneration;
    // Only list metadata is safe to replace while a recipe context is open.
    // Rebinding the selected recipe resets servings, picker and editor state.
    const recipeContextOpen = () =>
      !!this.shadowRoot.querySelector("rm-add-recipe-dialog, rm-recipe-detail");
    const deferRecipes = recipeContextOpen();
    try {
      const [recipes, tags, timers] = await Promise.all([
        deferRecipes ? null : this._api.getAllRecipes(),
        deferRecipes ? null : this._api.getTags(),
        deferRecipes ? null : this._api.getGlobalTimers(),
      ]);
      if (
        !this.isConnected ||
        generation !== this._refreshGeneration ||
        this.transport !== transport ||
        !transport.current()
      )
        return;
      if (transport.pending) {
        this._refreshRequested = true;
        return;
      }
      this._recipeRefreshDeferred = deferRecipes || recipeContextOpen();
      if (deferRecipes && !recipeContextOpen()) this._refreshRequested = true;
      if (!this._recipeRefreshDeferred) {
        this._recipes = recipes?.recipes ?? [];
        this._tags = tags?.tags ?? [];
        this._timers = [
          ...this._timers.filter((t) => !t.global),
          ...(timers?.timers || []).map((t) => this._globalTimerToLocal(t)),
        ];
      }
    } catch {
      /* Keep the last safe model on a failed read; never retry writes. */
    } finally {
      if (generation === this._refreshGeneration) {
        this._refreshRunning = false;
        if (this._refreshRequested && !transport.pending && transport.current())
          this._queueRefresh();
      }
    }
  }

  get _filteredRecipes() {
    let list = this._recipes;
    if (this._activeTag)
      list = list.filter(
        (r) =>
          r.tags?.includes(this._activeTag) ||
          r.courses?.includes(this._activeTag) ||
          r.categories?.includes(this._activeTag) ||
          r.collections?.includes(this._activeTag),
      );
    if (this._searchQuery.trim()) {
      const q = this._searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }

  get _recentRecipes() {
    const count = this._settings.recentCount ?? 12;
    return this._recentRecipeIds
      .slice(0, count)
      .map((id) => this._recipes.find((r) => r.id === id))
      .filter(Boolean);
  }

  // -- Settings -------------------------------------------------------------

  async _handleSettingsChange(e) {
    const prevLanguage = this._settings.language;
    this._settings = normalizeSettings(e.detail.settings);
    if (this._settings.language !== prevLanguage) {
      await setActiveLocale(this._settings.language);
      this.transport.locale = this._settings.language;
      this.hass = this.transport.facade();
      this.requestUpdate();
      for (const element of this.shadowRoot.querySelectorAll("*"))
        element.requestUpdate?.();
    }
    try {
      await this.transport.call("preferences_update", {
        preferences: { recipe_settings: this._settings },
      });
      this._error = null;
    } catch (error) {
      this._error =
        this._settings.language === "de"
          ? error.code === "uncertain"
            ? "Speicherstatus unklar. Gleiche Anfrage nur ausdrücklich erneut senden."
            : error.code === "pending"
              ? "Zuerst die unklare Anfrage klären."
              : "Einstellungen konnten nicht gespeichert werden. Felder und Berechtigungen prüfen."
          : error.message;
    }
  }

  // -- Screen wake lock -------------------------------------------------------
  // Manual, global override — independent of rm-recipe-detail's automatic
  // per-recipe lock, and with no auto-release timeout: stays on until the
  // user turns it off (or navigates away from the card entirely).

  async _toggleGlobalWakeLock() {
    if (!isWakeLockSupported()) return;
    if (this._globalWakeActive) {
      await releaseWakeLock(GLOBAL_WAKE_LOCK_REASON);
      this._globalWakeActive = false;
    } else {
      await acquireWakeLock(GLOBAL_WAKE_LOCK_REASON);
      this._globalWakeActive = true;
    }
  }

  // -- Timer management -----------------------------------------------------

  _tickTimers() {
    if (!this._timers.length) return;
    let changed = false;
    const newAlarms = [];
    const now = Date.now() / 1000;
    const updated = this._timers.map((t) => {
      if (t.alarming || !t.running) return t;
      // Global timers: compute remaining from wall-clock start_time for accuracy
      const newRemaining = t.global
        ? Math.max(0, t.duration - (now - t.start_time))
        : t.remaining - 1;
      changed = true;
      if (newRemaining <= 0) {
        if (t.presetId) {
          return { ...t, remaining: 0, running: false, alarming: true };
        }
        newAlarms.push({ id: t.id, label: t.label });
      }
      return {
        ...t,
        remaining: Math.round(newRemaining),
        running: newRemaining > 0,
      };
    });
    if (changed) this._timers = updated;
    if (newAlarms.length) {
      if (!this._timerAlarm) {
        this._timerAlarm = newAlarms.shift();
        this._startAlarmLoop(
          this._settings.timerSound ?? "beep",
          this._settings.timerSoundFile,
        );
      }
      if (newAlarms.length) {
        this._timerAlarmQueue = [...this._timerAlarmQueue, ...newAlarms];
      }
    }
  }

  async _startTimer(seconds, label, presetId = null, global = false) {
    if (
      !Number.isFinite(seconds) ||
      seconds <= 0 ||
      seconds > 604800 ||
      (label && String(label).length > 300)
    )
      return;
    const resolvedLabel =
      label || msg(str`${Math.floor(seconds / 60)} min timer`);
    if (global && this._api) {
      try {
        const now = Date.now() / 1000;
        await this._api.addGlobalTimer({
          label: resolvedLabel,
          duration: seconds,
          start_time: now,
          running: true,
          paused_remaining: null,
          ...(presetId ? { preset_id: presetId } : {}),
        });
        await this._loadGlobalTimers();
        return;
      } catch (e) {
        this._error = e.message;
        return;
      }
    }
    const id = crypto.randomUUID();
    this._timers = [
      ...this._timers,
      {
        id,
        label: resolvedLabel,
        total: seconds,
        remaining: seconds,
        running: true,
        presetId: presetId || null,
      },
    ];
  }

  async _stopTimer(id) {
    const timer = this._timers.find((t) => t.id === id);
    if (timer?.global) {
      try {
        await this._api.deleteGlobalTimer(id);
        await this._loadGlobalTimers();
      } catch (error) {
        this._error = error.message;
      }
      return;
    }
    this._timers = this._timers.filter((t) => t.id !== id);
  }

  async _pauseTimer(id) {
    const t = this._timers.find((t) => t.id === id);
    if (!t) return;
    if (t.global) {
      try {
        await this._api.updateGlobalTimer(
          id,
          t.running
            ? { running: false, paused_remaining: t.remaining }
            : {
                running: true,
                start_time: Date.now() / 1000 - (t.duration - t.remaining),
                paused_remaining: null,
              },
        );
        await this._loadGlobalTimers();
      } catch (error) {
        this._error = error.message;
      }
      return;
    }
    this._timers = this._timers.map((t) =>
      t.id === id ? { ...t, running: !t.running } : t,
    );
  }

  async _addTimeToTimer(id, seconds) {
    const t = this._timers.find((t) => t.id === id);
    if (!t) return;
    if (t.global) {
      try {
        await this._api.updateGlobalTimer(id, {
          duration: t.duration + seconds,
          running: true,
          start_time: Date.now() / 1000 - (t.duration - t.remaining),
          paused_remaining: null,
        });
        await this._loadGlobalTimers();
      } catch (error) {
        this._error = error.message;
      }
      return;
    }
    this._timers = this._timers.map((t) =>
      t.id === id
        ? {
            ...t,
            total: t.total + seconds,
            remaining: t.remaining + seconds,
            running: true,
            alarming: false,
          }
        : t,
    );
  }

  _dismissAlarm() {
    if (this._timerAlarm) {
      this._stopAlarmLoop();
      this._stopTimer(this._timerAlarm.id);
      this._timerAlarm = this._timerAlarmQueue.length
        ? this._timerAlarmQueue.shift()
        : null;
      if (this._timerAlarm)
        this._startAlarmLoop(
          this._settings.timerSound ?? "beep",
          this._settings.timerSoundFile,
        );
    }
  }

  async _loadPresets() {
    const response = await this.transport.call("timer_presets_get");
    this._timerPresets = response.presets || [];
  }
  async _addPresetTimer() {
    const name = this._presetNameInput.trim(),
      minutes = Number(this._presetMinsInput);
    if (!name || !Number.isFinite(minutes) || minutes <= 0) return;
    try {
      await this.transport.call("timer_presets_add", {
        name,
        seconds: Math.round(minutes * 60),
      });
      await this._loadPresets();
      this._presetNameInput = "";
      this._presetMinsInput = "";
    } catch (error) {
      this._error = error.message;
    }
  }
  async _removePreset(id) {
    try {
      await this.transport.call("timer_presets_delete", { preset_id: id });
      await this._loadPresets();
    } catch (error) {
      this._error = error.message;
    }
  }

  _startAlarmLoop(type, fileUrl) {
    this._stopAlarmLoop();
    if (type === "none") return;
    if (
      type === "file" &&
      (typeof fileUrl !== "string" ||
        fileUrl.length > 2000000 ||
        !/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(fileUrl))
    )
      return;
    if (type === "file" && fileUrl) {
      this._alarmLoopActive = true;
      const playNext = () => {
        if (!this._alarmLoopActive) return;
        this._alarmAudio = new Audio(fileUrl);
        this._alarmAudio.onended = () => {
          if (this._alarmLoopActive)
            this._alarmTimeout = setTimeout(playNext, 2000);
        };
        this._alarmAudio.onerror = () => {
          if (this._alarmLoopActive)
            this._alarmTimeout = setTimeout(() => playTimerSound("beep"), 2000);
        };
        this._alarmAudio.play().catch(() => {});
      };
      playNext();
    } else {
      playTimerSound(type);
      this._alarmInterval = setInterval(() => playTimerSound(type), 4000);
    }
  }

  _stopAlarmLoop() {
    this._alarmLoopActive = false;
    if (this._alarmInterval) {
      clearInterval(this._alarmInterval);
      this._alarmInterval = null;
    }
    if (this._alarmTimeout) {
      clearTimeout(this._alarmTimeout);
      this._alarmTimeout = null;
    }
    if (this._alarmAudio) {
      this._alarmAudio.pause();
      this._alarmAudio.onended = null;
      this._alarmAudio.onerror = null;
      this._alarmAudio = null;
    }
  }

  _handleStartTimer(e) {
    const { seconds, label } = e.detail;
    this._startTimer(seconds, label, null, this._globalMode);
  }

  // -- Event handlers -------------------------------------------------------

  _handleSearch(e) {
    this._searchQuery = e.detail?.query ?? "";
  }
  _handleTagFilter(e) {
    const t = e.detail?.tag;
    this._activeTag = this._activeTag === t ? null : t;
  }

  _handleChipNav(e) {
    const { filterMode, value } = e.detail;
    this._navDirection = "back";
    if (filterMode === "tags") {
      // Tags use the parent _activeTag mechanism
      this._activeTag = value;
      this._gridFilterPreset = null;
    } else {
      this._activeTag = null;
      // Use a new object each time so the grid always sees a change
      this._gridFilterPreset = { filterMode, selectedValues: [value] };
    }
    this._view = "grid";
  }

  _handleBack() {
    if (this._closingDetail) return;
    if (
      this._view === "detail" &&
      this._selectedRecipe &&
      !this._closingDetail
    ) {
      // Set _view to grid immediately so the track CSS class is removed and
      // the transition plays in reverse. Keep _closingDetail=true so the
      // detail pane stays mounted and the header stays correct during the slide.
      this._closingDetail = true;
      this._view = "grid";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this._closingDetail = false;
        this._selectedRecipe = null;
      }
    } else {
      this._navDirection = "back";
      this._view = "grid";
      this._selectedRecipe = null;
      this._closingDetail = false;
    }
  }

  _onDetailTransitionEnd(e) {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "transform") return;
    if (this._closingDetail) {
      this._closingDetail = false;
      this._selectedRecipe = null;
    }
  }

  _handleShowGrid() {
    if (!this.hass.user.is_admin) {
      this._view = "nutrition";
      return;
    }
    this._navDirection = "back";
    this._view = "grid";
    this._selectedRecipe = null;
  }
  _handleShowPlanner() {
    this._plannerFromRecipe = this._selectedRecipe || null;
    this._navDirection = "forward";
    this._view = "planner";
  }
  _handleBackToRecipe() {
    if (this._plannerFromRecipe) {
      this._selectedRecipe = this._plannerFromRecipe;
      this._plannerFromRecipe = null;
      this._navDirection = "back";
      this._view = "detail";
    }
  }

  _handleOpenRecipe(e) {
    const grid = this.shadowRoot?.querySelector("rm-recipe-grid");
    if (grid) {
      const scrollEl = grid.shadowRoot?.querySelector(".grid-scroll");
      this._gridScrollPos = scrollEl?.scrollTop ?? 0;
    }
    const recipe = e.detail?.recipe;
    this._closingDetail = false;
    this._navDirection = "forward";
    this._selectedRecipe = recipe;
    this._view = "detail";

    if (recipe?.id) {
      const ids = [
        recipe.id,
        ...this._recentRecipeIds.filter((id) => id !== recipe.id),
      ].slice(0, 50);
      this._recentRecipeIds = ids;
    }
  }

  async _handleToggleFavourite(e) {
    try {
      const { recipeId } = e.detail;
      await this._api.toggleFavourite(recipeId);
      await this._loadRecipes();
      if (this._selectedRecipe?.id === recipeId)
        this._selectedRecipe =
          this._recipes.find((r) => r.id === recipeId) ?? this._selectedRecipe;
    } catch {}
  }

  async _handleDeleteRecipe(e) {
    try {
      await this._api.deleteRecipe(e.detail.recipeId);
      await this._loadRecipes();
      await this._loadTags();
      this._navDirection = "back";
      this._view = "grid";
      this._selectedRecipe = null;
    } catch {}
  }

  async _handleUpdateRecipe(e) {
    try {
      const { recipeId, data } = e.detail;
      await this._api.updateRecipe(recipeId, data);
      await this._loadRecipes();
      await this._loadTags();
      if (this._selectedRecipe?.id === recipeId)
        this._selectedRecipe =
          this._recipes.find((r) => r.id === recipeId) ?? null;
    } catch {}
  }

  async _handleAddRecipe(e) {
    try {
      await this._api.addRecipe(e.detail.data);
      this._navDirection = "back";
      this._view = "grid";
      await this._loadRecipes();
      await this._loadTags();
    } catch (err) {
      console.error("[Recipe Manager] Failed to save recipe:", err);
    }
  }

  async _handleImportDone() {
    this._navDirection = "back";
    this._view = "grid";
    await this._loadRecipes();
    await this._loadTags();
  }

  // -- Render ---------------------------------------------------------------

  _renderStars(rating) {
    const r = rating || 0;
    const hover = this._hdrStarHover;
    const display = hover > 0 ? hover : r;
    return html`
      <div
        class="header-stars"
        @mouseleave=${() => {
          this._hdrStarHover = 0;
        }}
        title="${hover > 0
          ? msg(str`Set rating: ${hover}★`)
          : r > 0
            ? msg(str`Rating: ${r}★ — click to change`)
            : msg("Click to rate")}"
      >
        ${[1, 2, 3, 4, 5].map(
          (n) => html`
            <span
              class="hdr-star ${n <= display ? "filled" : ""}"
              @mouseover=${() => {
                this._hdrStarHover = n;
              }}
              @click=${() => this._handleRateRecipe(n)}
              >★</span
            >
          `,
        )}
      </div>
    `;
  }

  async _handleRateRecipe(n) {
    try {
      if (!this._selectedRecipe) return;
      // Clicking the current rating clears it
      const newRating = this._selectedRecipe.rating === n ? null : n;
      this._hdrStarHover = 0;
      await this._handleUpdateRecipe({
        detail: {
          recipeId: this._selectedRecipe.id,
          data: { rating: newRating },
        },
      });
    } catch {}
  }

  _renderSidebar() {
    if (!this.hass?.user?.is_admin)
      return html`<nav class="rm-sidebar">
        <div class="sb-nav">
          <button
            class="sb-item"
            @click=${() => {
              this._view = "nutrition";
            }}
          >
            ${this.hass.language === "de" ? "Ernährung" : "Nutrition"}</button
          ><button
            class="sb-item"
            @click=${() => {
              this._view = "settings";
            }}
          >
            ${msg("Settings")}
          </button>
        </div>
      </nav>`;
    const v = this._view;
    const collapsed = this._sidebarCollapsed;

    const navItem = (
      icon,
      label,
      view,
      placeholder = false,
      clickFn = null,
    ) => html`
      <button
        class="sb-item ${v === view ? "active" : ""} ${placeholder
          ? "placeholder"
          : ""}"
        title="${placeholder ? msg(str`${label} — coming soon`) : label}"
        @click=${placeholder
          ? undefined
          : clickFn ||
            (() => {
              this._navDirection = "forward";
              this._view = view;
              this._selectedRecipe = null;
            })}
        ?disabled=${placeholder}
      >
        <ha-icon icon="${icon}"></ha-icon>
        ${!collapsed ? html`<span>${label}</span>` : ""}
      </button>
    `;

    return html`
      <nav class="rm-sidebar ${collapsed ? "collapsed" : ""}">
        <div class="sb-top">
          <div class="sb-logo-row">
            <button
              class="sb-collapse-btn"
              @click=${() => {
                this._sidebarCollapsed = !this._sidebarCollapsed;
              }}
              title="${collapsed
                ? msg("Expand sidebar")
                : msg("Collapse sidebar")}"
            >
              <ha-icon
                icon="${collapsed ? "mdi:menu-close" : "mdi:menu-open"}"
              ></ha-icon>
            </button>
          </div>

          ${!collapsed
            ? html`
                <div class="sb-search">
                  <ha-icon icon="mdi:magnify" class="sb-search-icon"></ha-icon>
                  <input
                    class="sb-search-input"
                    type="text"
                    placeholder="${msg("Search…")}"
                    .value=${this._searchQuery}
                    @input=${(e) => {
                      this._searchQuery = e.target.value;
                      this._navDirection = "back";
                      this._view = "grid";
                    }}
                  />
                  ${this._searchQuery
                    ? html`
                        <button
                          class="sb-search-clear"
                          @click=${() => {
                            this._searchQuery = "";
                          }}
                        >
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      `
                    : ""}
                </div>

                <button
                  class="sb-new-btn"
                  @click=${() => {
                    this._view = "add";
                  }}
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                  <span>${msg("New Recipe")}</span>
                </button>
              `
            : html`
                <button
                  class="sb-icon-only-btn"
                  @click=${() => {
                    this._view = "add";
                  }}
                  title="${msg("New Recipe")}"
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                </button>
              `}
        </div>

        <div class="sb-nav">
          ${navItem("mdi:home", msg("Home"), "grid")}
          ${navItem(
            "mdi:heart-pulse",
            this._settings.language === "de" ? "Ernährung" : "Nutrition",
            "nutrition",
          )}
          ${this._settings.showPlanner
            ? navItem(
                "mdi:calendar-week",
                msg("Meal Planner"),
                "planner",
                false,
                () => {
                  this._plannerFromRecipe = null;
                  this._navDirection = "forward";
                  this._view = "planner";
                  this._selectedRecipe = null;
                },
              )
            : ""}
          ${navItem("mdi:book-open-variant", msg("Cookbook"), "cookbook", true)}
          <button
            class="sb-item ${v === "timers" ? "active" : ""}"
            title="${msg("Timers")}"
            @click=${() => {
              this._timersPrevView = this._view;
              this._view = "timers";
            }}
          >
            <ha-icon icon="mdi:timer-outline"></ha-icon>
            ${!collapsed ? html`<span>${msg("Timers")}</span>` : ""}
            ${this._timers.length
              ? html`<span class="sb-timer-badge">${this._timers.length}</span>`
              : ""}
          </button>
        </div>

        <div class="sb-bottom">
          <button
            class="sb-item placeholder"
            disabled
            title="${msg("Sync — coming soon")}"
          >
            <ha-icon icon="mdi:cloud-sync-outline"></ha-icon>${!collapsed
              ? html`<span>${msg("Sync")}</span>`
              : ""}
          </button>
          <button
            class="sb-item placeholder"
            disabled
            title="${msg("Help — coming soon")}"
          >
            <ha-icon icon="mdi:help-circle-outline"></ha-icon>${!collapsed
              ? html`<span>${msg("Help")}</span>`
              : ""}
          </button>
          <button
            class="sb-item ${v === "settings" ? "active" : ""}"
            @click=${() => {
              this._view = "settings";
            }}
          >
            <ha-icon icon="mdi:cog-outline"></ha-icon>${!collapsed
              ? html`<span>${msg("Settings")}</span>`
              : ""}
          </button>
        </div>
      </nav>
    `;
  }

  _renderHeader() {
    const inDetail =
      (this._view === "detail" || this._closingDetail) && this._selectedRecipe;
    const inSettings = this._view === "settings";
    const inAdd = this._view === "add";
    const inTimers = this._view === "timers";
    const wide = this._wide;

    const title = inSettings
      ? msg("Settings")
      : inAdd
        ? msg("New Recipe")
        : inTimers
          ? msg("Timers")
          : inDetail
            ? ""
            : this._view === "planner"
              ? msg("Meal Planner")
              : this._view === "nutrition"
                ? this._settings.language === "de"
                  ? "Ernährung"
                  : "Nutrition"
                : msg("Recipes");

    return html`
      <div class="rm-header">
        <div class="rm-header-left">
          ${inDetail || inAdd
            ? html`
                <button
                  class="icon-btn"
                  @click=${this._handleBack}
                  title="${msg("Back")}"
                >
                  <ha-icon icon="mdi:arrow-left"></ha-icon>
                </button>
              `
            : inTimers && this._timersPrevView === "detail"
              ? html`
                  <button
                    class="icon-btn"
                    @click=${() => {
                      this._navDirection = "back";
                      this._view = "detail";
                      this._timersPrevView = null;
                    }}
                    title="${msg("Back to recipe")}"
                  >
                    <ha-icon icon="mdi:arrow-left"></ha-icon>
                  </button>
                `
              : !wide && this._view !== "grid" && !inSettings && !inTimers
                ? html`
                    <button
                      class="icon-btn"
                      aria-label=${msg("Back")}
                      @click=${this._handleShowGrid}
                    >
                      <ha-icon icon="mdi:arrow-left"></ha-icon>
                    </button>
                  `
                : ""}
          <div class="rm-title">
            <ha-icon icon="mdi:chef-hat"></ha-icon>
            <span>${title}</span>
          </div>
        </div>

        <div class="rm-header-right">
          <!-- Timer pills (compact, shown when timers are running, not in timer view) -->
          ${this._timers.length && this._view !== "timers"
            ? html`
                <button
                  class="timer-pills"
                  aria-label=${msg("Timers")}
                  @click=${() => {
                    this._navDirection = "forward";
                    this._timersPrevView = this._view;
                    this._view = "timers";
                  }}
                >
                  ${this._timers.slice(0, 3).map(
                    (t) => html`
                      <div class="timer-pill ${!t.running ? "paused" : ""}">
                        <ha-icon icon="mdi:timer-outline"></ha-icon>
                        <span>${formatTimerDisplay(t.remaining)}</span>
                      </div>
                    `,
                  )}
                  ${this._timers.length > 3
                    ? html`<span class="timer-more"
                        >+${this._timers.length - 3}</span
                      >`
                    : ""}
                </button>
              `
            : ""}
          ${inDetail ? this._renderStars(this._selectedRecipe.rating) : ""}

          <button
            class="icon-btn wake-toggle-btn ${this._globalWakeActive
              ? "active"
              : ""}"
            @click=${this._toggleGlobalWakeLock}
            ?disabled=${!isWakeLockSupported()}
            title="${!isWakeLockSupported()
              ? msg(
                  "Keep screen awake — requires a secure (HTTPS) connection and a supported browser",
                )
              : this._globalWakeActive
                ? msg("Screen awake — click to allow sleep")
                : msg("Keep screen awake")}"
          >
            <ha-icon
              icon="${this._globalWakeActive
                ? "mdi:eye"
                : "mdi:eye-off-outline"}"
            ></ha-icon>
          </button>

          ${inSettings || inAdd || inTimers
            ? html`
                <button
                  class="icon-btn"
                  aria-label=${msg("Close")}
                  @click=${this._handleShowGrid}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `
            : !wide
              ? html`
                  <button
                    class="icon-btn"
                    @click=${() => {
                      this._mobileMenuOpen = !this._mobileMenuOpen;
                    }}
                    title="${this._mobileMenuOpen
                      ? msg("Close menu")
                      : msg("Menu")}"
                  >
                    <ha-icon
                      icon="${this._mobileMenuOpen ? "mdi:close" : "mdi:menu"}"
                    ></ha-icon>
                  </button>
                `
              : ""}
        </div>
      </div>
    `;
  }

  _renderBody() {
    const s = this._settings;

    // ── Full-screen views (replace everything, use directional slide) ──────
    if (this._view === "nutrition")
      return html`<mm-nutrition .hass=${this.hass}></mm-nutrition>`;

    if (this._view === "settings")
      return html`
        <rm-settings-view
          .hass=${this.hass}
          .settings=${s}
          @rm-settings-change=${this._handleSettingsChange}
        ></rm-settings-view>
      `;
    if (this._view === "add")
      return html`
        <rm-add-recipe-dialog
          .api=${this._api}
          .asPanel=${true}
          .inlineMode=${true}
          @rm-add-recipe=${this._handleAddRecipe}
          @rm-import-done=${this._handleImportDone}
          @rm-close=${() => {
            this._navDirection = "back";
            this._view = "grid";
          }}
        ></rm-add-recipe-dialog>
      `;
    if (this._view === "timers") return this._renderTimersView();
    if (this._view === "planner")
      return html`
        <rm-meal-planner
          .api=${this._api}
          .recipes=${this._recipes}
          .fromRecipe=${this._plannerFromRecipe}
          .settings=${s}
          @rm-open-recipe=${this._handleOpenRecipe}
          @rm-back-to-recipe=${this._handleBackToRecipe}
        ></rm-meal-planner>
      `;

    // ── Loading / error ────────────────────────────────────────────────────
    if (this._loading)
      return html`
        <div class="rm-loading">
          <ha-circular-progress active size="large"></ha-circular-progress>
        </div>
      `;
    if (this._error)
      return html`
        <div class="rm-error">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <p>${this._error}</p>
          <button class="text-btn" @click=${this._init.bind(this)}>
            ${msg("Retry")}
          </button>
        </div>
      `;

    // ── Grid + detail (sliding track — grid and detail sit side by side,
    //    the track translates left to reveal the detail pane) ───────────────
    const keepDetail =
      (this._view === "detail" || this._closingDetail) && this._selectedRecipe;
    return html`
      <div
        class="rm-slide-track ${this._view === "detail" ? "show-detail" : ""}"
        @transitionend=${this._onDetailTransitionEnd}
      >
        <div class="rm-slide-pane">
          <rm-recipe-grid
            .recipes=${this._filteredRecipes}
            .allRecipes=${this._recipes}
            .tags=${this._tags}
            .searchQuery=${this._searchQuery}
            .activeTag=${this._activeTag}
            .columns=${s.columns}
            .showFavourites=${s.showFavourites}
            .hideSidebar=${this._wide}
            .scrollPos=${this._gridScrollPos}
            .recentRecipes=${this._recentRecipes}
            .recentCount=${s.recentCount ?? 12}
            .filterPreset=${this._gridFilterPreset}
            @rm-search=${this._handleSearch}
            @rm-tag-filter=${this._handleTagFilter}
            @rm-open-recipe=${this._handleOpenRecipe}
            @rm-toggle-favourite=${this._handleToggleFavourite}
          ></rm-recipe-grid>
        </div>
        <div class="rm-slide-pane">
          ${keepDetail
            ? html`
                <rm-recipe-detail
                  .recipe=${this._selectedRecipe}
                  .api=${this._api}
                  .settings=${s}
                  .wide=${this._wide}
                  .allTags=${this._tags || []}
                  .allCourses=${[
                    ...new Set(this._recipes.flatMap((r) => r.courses || [])),
                  ].sort()}
                  .allCategories=${[
                    ...new Set(
                      this._recipes.flatMap((r) => r.categories || []),
                    ),
                  ].sort()}
                  .allCollections=${[
                    ...new Set(
                      this._recipes.flatMap((r) => r.collections || []),
                    ),
                  ].sort()}
                  @rm-back=${this._handleBack}
                  @rm-toggle-favourite=${this._handleToggleFavourite}
                  @rm-delete-recipe=${this._handleDeleteRecipe}
                  @rm-update-recipe=${this._handleUpdateRecipe}
                  @rm-recipe-saved=${async () => {
                    await this._loadRecipes();
                    this._selectedRecipe =
                      this._recipes.find(
                        (r) => r.id === this._selectedRecipe?.id,
                      ) || null;
                  }}
                  @rm-start-timer=${this._handleStartTimer}
                  @rm-show-planner=${this._handleShowPlanner}
                  @rm-chip-nav=${this._handleChipNav}
                ></rm-recipe-detail>
              `
            : ""}
        </div>
      </div>
    `;
  }

  _renderTimersView() {
    const hasCustom = this._customTimerInput.trim();
    const hasPreset =
      this._presetNameInput.trim() && this._presetMinsInput.trim();
    const quickAdd = [
      { label: "+30s", secs: 30 },
      { label: "+1m", secs: 60 },
      { label: "+5m", secs: 300 },
      { label: "+10m", secs: 600 },
    ];
    const nonPresetTimers = this._timers.filter((t) => !t.presetId);
    const circ = 263.9;
    return html`
      <div class="timers-view">
        <!-- Active timers (non-preset): horizontal wrap of square arc tiles -->
        ${nonPresetTimers.length
          ? html`
              <div class="timer-list">
                ${nonPresetTimers.map((t) => {
                  const tArcColor =
                    t.remaining < 60 ? "#f59e0b" : "var(--rm-accent)";
                  const tOffset = circ * (1 - t.remaining / t.total);
                  return html`
                    <div class="timer-card">
                      <button
                        class="preset-remove"
                        @click=${() => this._stopTimer(t.id)}
                        title="${msg("Remove")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                      ${t.global
                        ? html`<ha-icon
                            class="timer-global-badge"
                            icon="mdi:earth"
                            title="${msg("Global timer")}"
                          ></ha-icon>`
                        : ""}
                      <span class="timer-card-name">${t.label}</span>
                      <div class="preset-arc-wrap">
                        <svg viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="var(--rm-border)"
                            stroke-width="6"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="${tArcColor}"
                            stroke-width="6"
                            stroke-linecap="round"
                            stroke-dasharray="${circ}"
                            stroke-dashoffset="${tOffset}"
                            transform="rotate(-90 50 50)"
                            style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"
                          />
                        </svg>
                        <div class="preset-arc-center">
                          <span class="preset-arc-time"
                            >${formatTimerDisplay(t.remaining)}</span
                          >
                        </div>
                      </div>
                      <div class="preset-arc-btns">
                        <button
                          class="timer-ctrl-btn"
                          @click=${() => this._pauseTimer(t.id)}
                          title="${t.running ? msg("Pause") : msg("Resume")}"
                        >
                          <ha-icon
                            icon="${t.running ? "mdi:pause" : "mdi:play"}"
                          ></ha-icon>
                        </button>
                        <button
                          class="timer-ctrl-btn danger"
                          @click=${() => this._stopTimer(t.id)}
                          title="${msg("Stop")}"
                        >
                          <ha-icon icon="mdi:stop"></ha-icon>
                        </button>
                      </div>
                    </div>
                  `;
                })}
              </div>
            `
          : html`
              <div class="timer-empty">
                <ha-icon icon="mdi:timer-off-outline"></ha-icon>
                <p>${msg("No active timers.")}</p>
                <p class="timer-empty-hint">
                  ${msg(
                    "Tap a highlighted time in a recipe's directions to start one.",
                  )}
                </p>
              </div>
            `}

        <!-- Spacer pushes add+presets to bottom -->
        <div style="flex:1"></div>

        <!-- Add timer section -->
        <div class="timer-add-section">
          <div class="timer-add-header">
            <span class="timer-add-title">${msg("Add Timer")}</span>
            <label
              class="timer-global-toggle ${this._globalMode ? "active" : ""}"
              title="${msg("Sync timer across all devices via Home Assistant")}"
            >
              <input
                type="checkbox"
                .checked=${this._globalMode}
                @change=${(e) => {
                  this._globalMode = e.target.checked;
                }}
              />
              <ha-icon icon="mdi:earth"></ha-icon>
              ${msg("Global")}
            </label>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${msg("Quick start")}</div>
            <div class="timer-add-row">
              <input
                type="text"
                class="timer-input"
                placeholder="${msg("Label (optional)")}"
                .value=${this._quickTimerLabel}
                @input=${(e) => {
                  this._quickTimerLabel = e.target.value;
                }}
                @keydown=${(e) => {
                  if (e.key === "Enter" && hasCustom) {
                    this._startTimer(
                      Math.round(parseFloat(this._customTimerInput) * 60),
                      this._quickTimerLabel.trim() || null,
                      null,
                      this._globalMode,
                    );
                    this._customTimerInput = "";
                    this._quickTimerLabel = "";
                  }
                }}
              />
              <input
                type="number"
                class="timer-input timer-mins-input"
                placeholder="${msg("min")}"
                min="0.5"
                step="0.5"
                .value=${this._customTimerInput}
                @input=${(e) => {
                  this._customTimerInput = e.target.value;
                }}
                @keydown=${(e) => {
                  if (e.key === "Enter" && hasCustom) {
                    this._startTimer(
                      Math.round(parseFloat(this._customTimerInput) * 60),
                      this._quickTimerLabel.trim() || null,
                      null,
                      this._globalMode,
                    );
                    this._customTimerInput = "";
                    this._quickTimerLabel = "";
                  }
                }}
              />
              <button
                class="action-btn primary"
                ?disabled=${!hasCustom}
                @click=${() => {
                  this._startTimer(
                    Math.round(parseFloat(this._customTimerInput) * 60),
                    this._quickTimerLabel.trim() || null,
                    null,
                    this._globalMode,
                  );
                  this._customTimerInput = "";
                  this._quickTimerLabel = "";
                }}
              >
                <ha-icon icon="mdi:play" style="--mdc-icon-size:14px"></ha-icon>
                ${msg("Start")}
              </button>
            </div>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${msg("Save preset")}</div>
            <div class="timer-add-row">
              <input
                type="text"
                class="timer-input"
                placeholder="${msg("Preset name")}"
                .value=${this._presetNameInput}
                @input=${(e) => {
                  this._presetNameInput = e.target.value;
                }}
                @keydown=${(e) => {
                  if (e.key === "Enter") this._addPresetTimer();
                }}
              />
              <input
                type="number"
                class="timer-input timer-mins-input"
                placeholder="${msg("min")}"
                min="0.5"
                step="0.5"
                .value=${this._presetMinsInput}
                @input=${(e) => {
                  this._presetMinsInput = e.target.value;
                }}
                @keydown=${(e) => {
                  if (e.key === "Enter") this._addPresetTimer();
                }}
              />
              <button
                class="action-btn"
                ?disabled=${!hasPreset}
                @click=${this._addPresetTimer}
              >
                ${msg("+ Preset")}
              </button>
            </div>
          </div>
        </div>

        <!-- Preset timers grid (bottom) -->
        ${this._timerPresets.length
          ? html`
              <div class="timer-presets-grid">
                ${this._timerPresets.map((p) => {
                  const activeTimer = this._timers.find(
                    (t) => t.presetId === p.id,
                  );
                  const isRunning = activeTimer && activeTimer.running;
                  const isAlarming = activeTimer && activeTimer.alarming;
                  const remaining = activeTimer
                    ? activeTimer.remaining
                    : p.seconds;
                  const total = activeTimer ? activeTimer.total : p.seconds;
                  const arcColor = isAlarming
                    ? "var(--rm-error)"
                    : remaining < 60 && activeTimer
                      ? "#f59e0b"
                      : "var(--rm-accent)";
                  const offset = isAlarming
                    ? 0
                    : !activeTimer
                      ? circ
                      : circ * (1 - remaining / total);
                  return html`
                    <div
                      class="timer-preset-card ${isAlarming ? "alarming" : ""}"
                    >
                      <button
                        class="preset-remove"
                        @click=${() => {
                          if (activeTimer) this._stopTimer(activeTimer.id);
                          this._removePreset(p.id);
                        }}
                        title="${msg("Remove")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                      <span class="preset-arc-name">${p.name}</span>
                      <div class="preset-arc-wrap">
                        <svg viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="var(--rm-border)"
                            stroke-width="7"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="${arcColor}"
                            stroke-width="7"
                            stroke-linecap="round"
                            stroke-dasharray="${circ}"
                            stroke-dashoffset="${offset}"
                            transform="rotate(-90 50 50)"
                            style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"
                          />
                        </svg>
                        <div class="preset-arc-center">
                          ${isAlarming
                            ? html`
                                <span
                                  class="preset-arc-time"
                                  style="color:var(--rm-error)"
                                  >${msg("Done!")}</span
                                >
                              `
                            : html`
                                <span class="preset-arc-time"
                                  >${formatTimerDisplay(remaining)}</span
                                >
                              `}
                        </div>
                      </div>
                      <div class="preset-arc-btns">
                        ${isAlarming
                          ? html`
                              <button
                                class="preset-arc-btn"
                                @click=${() =>
                                  this._addTimeToTimer(activeTimer.id, 30)}
                              >
                                ${msg("+30s")}
                              </button>
                              <button
                                class="preset-arc-btn"
                                @click=${() =>
                                  this._addTimeToTimer(activeTimer.id, 60)}
                              >
                                ${msg("+1m")}
                              </button>
                              <button
                                class="preset-arc-btn"
                                @click=${() =>
                                  this._addTimeToTimer(activeTimer.id, 300)}
                              >
                                ${msg("+5m")}
                              </button>
                              <button
                                class="preset-arc-btn stop"
                                @click=${() => this._stopTimer(activeTimer.id)}
                              >
                                ${msg("Stop")}
                              </button>
                            `
                          : isRunning
                            ? html`
                                <button
                                  class="preset-arc-btn"
                                  @click=${() =>
                                    this._addTimeToTimer(activeTimer.id, 30)}
                                >
                                  ${msg("+30s")}
                                </button>
                                <button
                                  class="preset-arc-btn"
                                  @click=${() =>
                                    this._addTimeToTimer(activeTimer.id, 60)}
                                >
                                  ${msg("+1m")}
                                </button>
                                <button
                                  class="preset-arc-btn"
                                  @click=${() =>
                                    this._pauseTimer(activeTimer.id)}
                                >
                                  <ha-icon
                                    icon="mdi:pause"
                                    style="--mdc-icon-size:12px;vertical-align:middle"
                                  ></ha-icon>
                                </button>
                                <button
                                  class="preset-arc-btn stop"
                                  @click=${() =>
                                    this._stopTimer(activeTimer.id)}
                                >
                                  ${msg("Stop")}
                                </button>
                              `
                            : activeTimer
                              ? html`
                                  <button
                                    class="preset-arc-btn"
                                    @click=${() =>
                                      this._pauseTimer(activeTimer.id)}
                                  >
                                    ${msg("Resume")}
                                  </button>
                                  <button
                                    class="preset-arc-btn stop"
                                    @click=${() =>
                                      this._stopTimer(activeTimer.id)}
                                  >
                                    ${msg("Stop")}
                                  </button>
                                `
                              : html`
                                  <button
                                    class="preset-arc-btn play"
                                    @click=${() =>
                                      this._startTimer(p.seconds, p.name, p.id)}
                                  >
                                    <ha-icon
                                      icon="mdi:play"
                                      style="--mdc-icon-size:14px;vertical-align:middle"
                                    ></ha-icon>
                                    ${msg("Start")}
                                  </button>
                                `}
                      </div>
                    </div>
                  `;
                })}
              </div>
            `
          : ""}
      </div>
    `;
  }

  _renderTimerAlarm() {
    const alarm = this._timerAlarm;
    if (!alarm) return "";
    return html`
      <div class="alarm-overlay">
        <div class="alarm-bubble">
          <ha-icon icon="mdi:alarm" class="alarm-icon"></ha-icon>
          <div class="alarm-label">${alarm.label}</div>
          <div class="alarm-sub">${msg("Timer complete!")}</div>
          <div class="alarm-btns">
            <button
              class="alarm-btn"
              @click=${() => this._addTimeToTimer(alarm.id, 30)}
            >
              ${msg("+30s")}
            </button>
            <button
              class="alarm-btn"
              @click=${() => this._addTimeToTimer(alarm.id, 60)}
            >
              ${msg("+1 min")}
            </button>
            <button
              class="alarm-btn"
              @click=${() => this._addTimeToTimer(alarm.id, 300)}
            >
              ${msg("+5 min")}
            </button>
            <button
              class="alarm-btn"
              @click=${() => this._addTimeToTimer(alarm.id, 600)}
            >
              ${msg("+10 min")}
            </button>
            <div class="alarm-custom-row">
              <input
                type="number"
                class="alarm-custom-input"
                placeholder="${msg("min")}"
                min="1"
                .value=${this._alarmAddInput}
                @input=${(e) => {
                  this._alarmAddInput = e.target.value;
                }}
                @keydown=${(e) => {
                  if (e.key === "Enter" && this._alarmAddInput) {
                    const m = parseInt(this._alarmAddInput);
                    if (m > 0) this._addTimeToTimer(alarm.id, m * 60);
                    this._alarmAddInput = "";
                  }
                }}
              />
              <button
                class="alarm-btn accent"
                ?disabled=${!this._alarmAddInput}
                @click=${() => {
                  const m = parseInt(this._alarmAddInput);
                  if (m > 0) this._addTimeToTimer(alarm.id, m * 60);
                  this._alarmAddInput = "";
                }}
              >
                ${msg("+min")}
              </button>
            </div>
            <button class="alarm-btn stop" @click=${this._dismissAlarm}>
              ${msg("Stop")}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _renderBottomNav() {
    if (!this.hass?.user?.is_admin)
      return html`<nav class="rm-bottom-nav">
        <button
          class="rm-bn-btn"
          @click=${() => {
            this._view = "nutrition";
          }}
        >
          ${this.hass.language === "de" ? "Ernährung" : "Nutrition"}</button
        ><button
          class="rm-bn-btn"
          @click=${() => {
            this._view = "settings";
          }}
        >
          ${msg("Settings")}
        </button>
      </nav>`;
    const v = this._view;
    const btn = (icon, label, view, clickFn) => html`
      <button
        class="rm-bn-btn ${v === view ? "active" : ""}"
        @click=${clickFn ||
        (() => {
          this._navDirection = "forward";
          this._view = view;
          this._selectedRecipe = null;
        })}
        title="${label}"
      >
        <ha-icon icon="${icon}"></ha-icon>
        <span>${label}</span>
      </button>
    `;
    return html`
      <nav class="rm-bottom-nav">
        ${btn("mdi:home", msg("Home"), "grid", () => {
          this._navDirection = "back";
          this._view = "grid";
          this._selectedRecipe = null;
        })}
        ${btn(
          "mdi:heart-pulse",
          this._settings.language === "de" ? "Ernährung" : "Nutrition",
          "nutrition",
        )}
        <button
          class="rm-bn-btn rm-bn-add"
          @click=${() => {
            this._navDirection = "forward";
            this._view = "add";
          }}
          title="${msg("New Recipe")}"
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        ${btn("mdi:calendar-week", msg("Planner"), "planner", () => {
          this._plannerFromRecipe = null;
          this._navDirection = "forward";
          this._view = "planner";
          this._selectedRecipe = null;
        })}
        <button
          class="rm-bn-btn ${v === "timers" ? "active" : ""}"
          @click=${() => {
            this._navDirection = "forward";
            this._timersPrevView = this._view;
            this._view = "timers";
          }}
          title="${msg("Timers")}"
        >
          <ha-icon icon="mdi:timer-outline"></ha-icon>
          <span>${msg("Timers")}</span>
          ${this._timers.length
            ? html`<span class="rm-bn-badge">${this._timers.length}</span>`
            : ""}
        </button>
      </nav>
    `;
  }

  _renderMobileMenu() {
    return html`
      <div
        class="rm-mobile-overlay"
        @click=${() => {
          this._mobileMenuOpen = false;
        }}
      >
        <nav class="rm-mobile-menu" @click=${(e) => e.stopPropagation()}>
          <div class="rm-mm-header">
            <ha-icon icon="mdi:chef-hat" class="rm-mm-logo"></ha-icon>
            <span class="rm-mm-title">${msg("Recipes")}</span>
            <button
              class="icon-btn"
              @click=${() => {
                this._mobileMenuOpen = false;
              }}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="rm-mm-items">
            <button
              class="rm-mm-item"
              @click=${() => {
                this._view = "settings";
                this._mobileMenuOpen = false;
              }}
            >
              <ha-icon icon="mdi:cog-outline"></ha-icon>
              <span>${msg("Settings")}</span>
            </button>
            <button class="rm-mm-item" disabled>
              <ha-icon icon="mdi:help-circle-outline"></ha-icon>
              <span>${msg("Help")}</span>
              <span class="rm-mm-soon">${msg("Soon")}</span>
            </button>
          </div>
        </nav>
      </div>
    `;
  }

  render() {
    const wide = this._wide;
    return html`
      <ha-card class="rm-card ${wide ? "rm-wide" : ""}">
        ${wide ? this._renderSidebar() : ""}
        <div class="rm-main">
          ${this._renderHeader()}
          <div class="rm-body" data-nav="${this._navDirection}">
            ${this._renderBody()}
          </div>
          ${!wide ? this._renderBottomNav() : ""}
        </div>

        ${!wide && this._mobileMenuOpen ? this._renderMobileMenu() : ""}

        <!-- Timer alarm modal -->
        ${this._timerAlarm ? this._renderTimerAlarm() : ""}
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
      max-height: -webkit-fill-available;
      --rm-bg-main: #f7f4ed;
      --rm-bg-surface: rgba(255, 252, 246, 0.96);
      --rm-bg-elevated: #fffdf8;
      --rm-text: #233b47;
      --rm-text-secondary: #4c626c;
      --rm-text-muted: #536873;
      --rm-accent: #326382;
      --rm-accent-soft: #e2edf1;
      --rm-border: #c6d1d0;
      --rm-shadow: 0 8px 28px rgba(35, 59, 71, 0.08);
      --rm-radius: 18px;
      --rm-radius-sm: 12px;
      --rm-font-size-base: 16px;
      --rm-grid-columns: repeat(3, minmax(0, 1fr));
      font-size: var(--rm-font-size-base);
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    button,
    select {
      min-height: var(--rm-touch-target, 44px);
    }

    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0;
      margin: 0;
      overflow: hidden;
      position: relative;
      background: var(--rm-bg-surface);
    }
    ha-card.rm-card {
      background: var(--rm-bg-main);
      border: 1px solid var(--rm-border);
      border-radius: var(--rm-radius-lg, 24px);
      box-shadow: var(--rm-shadow);
      overflow: hidden;
      display: flex;
      flex-direction: row;
      height: 100%;
      margin: 0;
      color: var(--rm-text);
      position: relative;
    }

    /* ── Sidebar ─────────────────────────────── */

    .rm-sidebar {
      width: 216px;
      min-width: 216px;
      display: flex;
      flex-direction: column;
      background:
        linear-gradient(var(--rm-glass-highlight), transparent),
        var(--rm-bg-surface);
      border-right: 1px solid var(--rm-border);
      overflow: hidden;
      transition:
        width 0.2s ease,
        min-width 0.2s ease;
    }

    .rm-sidebar.collapsed {
      width: 56px;
      min-width: 56px;
    }

    ha-card:not(.rm-wide) .rm-sidebar {
      display: none;
    }

    .sb-top {
      padding: 20px 12px 12px;
      flex-shrink: 0;
    }

    .sb-logo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2px 8px;
    }

    .sb-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 1em;
      color: var(--rm-text);
      letter-spacing: -0.025em;
      overflow: hidden;
    }
    .sb-logo ha-icon {
      --mdc-icon-size: 22px;
      flex-shrink: 0;
    }

    .sb-collapse-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition:
        background 0.15s,
        color 0.15s;
    }
    .sb-collapse-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .sb-collapse-btn ha-icon {
      --mdc-icon-size: 20px;
    }

    .sb-search {
      display: flex;
      align-items: center;
      background: var(--rm-bg-main);
      border-radius: 8px;
      padding: 0 8px;
      gap: 6px;
      margin-bottom: 8px;
      border: 1px solid var(--rm-border);
    }
    .sb-search-icon {
      --mdc-icon-size: 16px;
      color: var(--rm-text-muted);
      flex-shrink: 0;
    }
    .sb-search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--rm-text);
      font-size: var(--rm-font-size-sm);
      padding: 7px 0;
    }
    .sb-search-input::placeholder {
      color: var(--rm-text-muted);
    }
    .sb-search-clear {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      padding: 2px;
      display: flex;
      align-items: center;
    }
    .sb-search-clear ha-icon {
      --mdc-icon-size: 14px;
    }

    .sb-new-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 10px;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border: none;
      border-radius: var(--rm-radius-sm);
      font-size: var(--rm-font-size-sm);
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .sb-new-btn:hover {
      opacity: 0.88;
    }
    .sb-new-btn ha-icon {
      --mdc-icon-size: 18px;
    }

    .sb-icon-only-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      margin: 0 auto;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .sb-icon-only-btn:hover {
      opacity: 0.88;
    }
    .sb-icon-only-btn ha-icon {
      --mdc-icon-size: 20px;
    }

    .sb-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 10px 12px;
      scrollbar-width: none;
    }
    .sb-nav::-webkit-scrollbar {
      display: none;
    }

    .sb-bottom {
      padding: 12px 10px 16px;
      border-top: 1px solid var(--rm-border);
    }

    .sb-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      background: none;
      border: none;
      border-radius: var(--rm-radius-sm);
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text-secondary);
      cursor: pointer;
      text-align: left;
      transition:
        background 0.12s,
        color 0.12s;
      position: relative;
    }
    .rm-sidebar.collapsed .sb-item {
      justify-content: center;
      padding: 10px 6px;
    }
    .sb-item ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }
    .sb-item:hover:not(:disabled) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .sb-item.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      font-weight: 600;
    }
    .sb-item.placeholder {
      opacity: 0.4;
      cursor: default;
    }

    .sb-timer-badge {
      margin-left: auto;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-radius: 10px;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
    }
    .rm-sidebar.collapsed .sb-timer-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      margin-left: 0;
      font-size: var(--rm-font-size-xs);
      padding: 1px 4px;
    }

    /* ── Main content ────────────────────────── */

    .rm-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .rm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--rm-border);
      background: var(--rm-bg-surface);
      flex-shrink: 0;
      gap: 8px;
    }

    .rm-header-left,
    .rm-header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .rm-header-left {
      flex: 1;
      min-width: 0;
    }
    .rm-header-right {
      flex-shrink: 0;
    }

    .rm-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125em;
      font-weight: 700;
      color: var(--rm-text);
      overflow: hidden;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }
    .rm-title ha-icon {
      --mdc-icon-size: 22px;
      color: var(--rm-accent);
      flex-shrink: 0;
    }
    .rm-title span {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Star rating in header */
    .header-stars {
      display: flex;
      gap: 1px;
      align-items: center;
    }
    .hdr-star {
      font-size: 18px;
      color: var(--rm-border, rgba(0, 0, 0, 0.2));
      line-height: 1;
      cursor: pointer;
      transition:
        color 0.1s,
        transform 0.1s;
      -webkit-text-stroke: 1px rgba(200, 150, 0, 0.3);
    }
    .hdr-star:hover {
      transform: scale(1.2);
      color: #f5a623;
    }
    .hdr-star.filled {
      color: #f5a623;
      -webkit-text-stroke: 1px #c47f0a;
    }

    /* Timer pills */
    .timer-pills {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 2px;
      background: transparent;
      border: none;
      border-radius: var(--rm-radius-sm);
      min-width: 0;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .timer-pill {
      display: flex;
      align-items: center;
      gap: 3px;
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      border-radius: 10px;
      padding: 3px 8px;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      white-space: nowrap;
    }
    .timer-pill.paused {
      background: var(--rm-bg-elevated);
      color: var(--rm-text-secondary);
      border: 1px dashed var(--rm-border-strong);
    }
    .timer-pill ha-icon {
      --mdc-icon-size: 12px;
    }
    .timer-more {
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-secondary);
      padding: 0 4px;
    }

    .rm-body {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary);
      width: var(--rm-touch-target, 44px);
      height: var(--rm-touch-target, 44px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background 0.15s,
        color 0.15s;
      padding: 0;
      flex-shrink: 0;
    }
    .icon-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .icon-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .icon-btn:disabled:hover {
      background: none;
    }
    .wake-toggle-btn.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
    }

    .text-btn {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border: none;
      border-radius: var(--rm-radius-sm);
      padding: 8px 16px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
    }

    .rm-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .rm-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 12px;
      color: var(--rm-text-secondary);
      text-align: center;
    }
    .rm-error ha-icon {
      --mdc-icon-size: 48px;
      color: var(--rm-error);
    }
    .rm-error p {
      margin: 0;
      font-size: var(--rm-font-size-sm);
    }

    /* ── Timers view ─────────────────────────── */

    .timers-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      padding: 12px 16px 16px;
      gap: 12px;
    }

    .timer-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px 0 24px;
      color: var(--rm-text-secondary);
      text-align: center;
      font-size: var(--rm-font-size-sm);
    }
    .timer-empty ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.35;
    }
    .timer-empty p {
      margin: 0;
    }
    .timer-empty-hint {
      font-size: var(--rm-font-size-xs) !important;
      color: var(--rm-text-muted) !important;
    }

    /* Active timer list: horizontal wrap of square arc tiles */
    .timer-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .timer-card {
      position: relative;
      width: 180px;
      height: 180px;
      background: var(--rm-bg-elevated);
      border-radius: 16px;
      border: 1px solid var(--rm-border);
      padding: 10px 8px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-sizing: border-box;
    }
    .timer-card-name {
      font-size: var(--rm-font-size-xs);
      font-weight: 600;
      color: var(--rm-text);
      text-align: center;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .timer-ctrl-btn {
      background: none;
      border: 1px solid var(--rm-border);
      border-radius: 50%;
      width: var(--rm-touch-target, 44px);
      height: var(--rm-touch-target, 44px);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary);
      padding: 0;
      transition:
        background 0.15s,
        color 0.15s;
    }
    .timer-ctrl-btn ha-icon {
      --mdc-icon-size: 14px;
    }
    .timer-ctrl-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
    }
    .timer-ctrl-btn.danger:hover {
      background: var(--rm-error-soft);
      color: var(--rm-error);
      border-color: var(--rm-error);
    }

    /* Preset timer grid: square arc tiles */
    .timer-presets-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .timer-preset-card {
      position: relative;
      width: 160px;
      height: 160px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 16px;
      padding: 8px 8px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-sizing: border-box;
    }
    .timer-preset-card.alarming {
      border-color: var(--rm-error);
      animation: alarm-pulse-border 0.8s ease-in-out infinite alternate;
    }
    @keyframes alarm-pulse-border {
      from {
        box-shadow: 0 0 0 0 rgba(207, 102, 121, 0);
      }
      to {
        box-shadow: 0 0 0 6px rgba(207, 102, 121, 0.3);
      }
    }
    /* Arc wrap fills available vertical space in the square tile */
    .preset-arc-wrap {
      position: relative;
      flex: 1;
      width: 100%;
      min-height: 0;
    }
    .preset-arc-wrap svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .preset-arc-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .preset-arc-time {
      font-size: 17px;
      font-weight: 700;
      color: var(--rm-text);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .preset-arc-name {
      font-size: var(--rm-font-size-xs);
      font-weight: 600;
      color: var(--rm-text);
      text-align: center;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .preset-arc-btns {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .preset-arc-btn {
      background: var(--rm-bg-main);
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      padding: 2px 6px;
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }
    .preset-arc-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      border-color: var(--rm-accent);
    }
    .preset-arc-btn.stop {
      color: var(--rm-error);
      border-color: var(--rm-error);
    }
    .preset-arc-btn.stop:hover {
      background: var(--rm-error-soft);
    }
    .preset-arc-btn.play {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-color: var(--rm-accent);
      padding: 3px 12px;
      font-size: var(--rm-font-size-xs);
      border-radius: 12px;
    }
    .preset-arc-btn.play:hover {
      opacity: 0.85;
    }
    .preset-remove {
      position: absolute;
      top: 4px;
      right: 4px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      opacity: 0;
      padding: 2px;
      border-radius: 50%;
      transition: opacity 0.15s;
      z-index: 1;
    }
    .timer-preset-card:hover .preset-remove,
    .timer-card:hover .preset-remove,
    .preset-remove:focus-visible {
      opacity: 1;
    }
    .preset-remove ha-icon {
      --mdc-icon-size: 13px;
    }

    /* Timer add section */
    .timer-add-section {
      border-top: 1px solid var(--rm-border);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .timer-add-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .timer-add-title {
      font-size: var(--rm-font-size-xs);
      font-weight: 600;
      color: var(--rm-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .timer-global-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--rm-border);
      cursor: pointer;
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-muted);
      transition: all 0.15s;
      user-select: none;
    }
    .timer-global-toggle input {
      width: 16px;
      height: 16px;
      accent-color: var(--rm-accent);
    }
    .timer-global-toggle:focus-within {
      outline: 3px solid var(--rm-focus);
      outline-offset: 2px;
    }
    .timer-global-toggle ha-icon {
      --mdc-icon-size: 14px;
    }
    .timer-global-toggle.active {
      border-color: var(--rm-accent);
      color: var(--rm-accent);
      background: var(--rm-accent-soft);
    }
    .timer-add-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .timer-add-group-label {
      font-size: var(--rm-font-size-xs);
      font-weight: 500;
      color: var(--rm-text-muted);
    }
    .timer-add-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .timer-input {
      flex: 1;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 6px 9px;
      font-size: var(--rm-font-size-sm);
      font-family: inherit;
      min-width: 0;
    }
    .timer-mins-input {
      max-width: 72px;
      flex: 0 0 72px;
    }
    .timer-input:focus {
      outline: none;
      border-color: var(--rm-accent);
    }
    .timer-global-badge {
      position: absolute;
      top: 4px;
      right: 22px;
      --mdc-icon-size: 11px;
      color: var(--rm-accent);
      opacity: 0.75;
    }

    .action-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 8px 14px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .action-btn.primary {
      background: var(--rm-accent);
      border-color: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
    }
    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ── Timer alarm bubble ──────────────────── */

    .alarm-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alarm-bubble {
      background: var(--rm-bg-surface);
      border-radius: 20px;
      padding: 28px 24px;
      text-align: center;
      max-width: 300px;
      width: calc(100% - 48px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .alarm-icon {
      --mdc-icon-size: 52px;
      color: var(--rm-accent);
      animation: alarm-pulse 0.8s ease-in-out infinite alternate;
    }

    @keyframes alarm-pulse {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(1.15);
        opacity: 0.8;
      }
    }

    .alarm-label {
      font-size: 18px;
      font-weight: 700;
      color: var(--rm-text);
    }

    .alarm-sub {
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text-secondary);
      margin-bottom: 8px;
    }

    .alarm-btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      width: 100%;
    }

    .alarm-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      color: var(--rm-text);
      padding: 10px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      transition: background 0.15s;
    }
    .alarm-btn:hover {
      background: var(--rm-accent-soft);
    }
    .alarm-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .alarm-btn.accent {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-color: var(--rm-accent);
    }
    .alarm-btn.stop {
      background: var(--rm-error);
      color: var(--rm-error-text);
      border-color: var(--rm-error);
      grid-column: 1 / -1;
    }
    .alarm-btn.stop:hover {
      opacity: 0.85;
    }
    .alarm-custom-row {
      display: flex;
      gap: 6px;
      grid-column: 1 / -1;
    }
    .alarm-custom-input {
      flex: 1;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 8px 10px;
      font-size: var(--rm-font-size-sm);
      font-family: inherit;
    }
    .alarm-custom-input:focus {
      outline: none;
      border-color: var(--rm-accent);
    }

    /* ── View transitions ───────────────────────────────────── */

    /* Generic directional slide for full-screen views (settings, add, planner, etc.) */
    @keyframes rm-slide-forward {
      from {
        opacity: 0;
        transform: translateX(48px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes rm-slide-back {
      from {
        opacity: 0;
        transform: translateX(-48px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .rm-body[data-nav="forward"] > *:not(.rm-detail-overlay) {
      animation: rm-slide-forward 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .rm-body[data-nav="back"] > *:not(.rm-detail-overlay) {
      animation: rm-slide-back 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /* Recipe detail — sliding track (grid left pane, detail right pane) */
    .rm-slide-track {
      display: flex;
      flex-direction: row;
      width: 200%;
      height: 100%;
      transform: translateX(0);
      transition: transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform;
    }
    .rm-slide-track.show-detail {
      transform: translateX(-50%);
    }
    .rm-slide-pane {
      flex: 0 0 50%;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .rm-slide-pane > * {
      flex: 1;
      min-height: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
    }

    /* ── Mobile bottom nav ───────────────── */

    .rm-bottom-nav {
      display: flex;
      justify-content: space-around;
      background: var(--rm-bg-surface);
      border-top: 1px solid var(--rm-border);
      padding: 6px 0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
      z-index: 10;
      flex-shrink: 0;
    }

    .rm-bn-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      font-size: var(--rm-font-size-xs);
      font-weight: 500;
      padding: 6px 4px;
      position: relative;
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
      outline: none;
    }
    .rm-bn-btn ha-icon {
      --mdc-icon-size: 22px;
    }
    .rm-bn-btn.active {
      color: var(--rm-accent);
    }
    .rm-bn-btn:not(.rm-bn-add):hover {
      color: var(--rm-text);
    }

    .rm-bn-add {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff) !important;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      flex: none;
      align-self: center;
      margin: 0 8px;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .rm-bn-add ha-icon {
      --mdc-icon-size: 26px;
    }

    .rm-bn-badge {
      position: absolute;
      top: 2px;
      right: calc(50% - 20px);
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-radius: var(--rm-radius-sm);
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      padding: 1px 4px;
      min-width: 14px;
      text-align: center;
    }

    /* ── Mobile slide-in menu ────────────── */

    .rm-mobile-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 100;
      display: flex;
      justify-content: flex-end;
    }

    .rm-mobile-menu {
      width: min(280px, 80%);
      height: 100%;
      background: var(--rm-bg-surface);
      border-left: 1px solid var(--rm-border);
      display: flex;
      flex-direction: column;
      animation: rm-menu-slide-in 0.22s ease;
      overflow: hidden;
    }

    @keyframes rm-menu-slide-in {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .rm-mm-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 12px 14px 16px;
      border-bottom: 1px solid var(--rm-border);
      flex-shrink: 0;
    }
    .rm-mm-logo {
      color: var(--rm-accent);
      --mdc-icon-size: 22px;
    }
    .rm-mm-title {
      flex: 1;
      font-weight: 700;
      font-size: 1em;
      color: var(--rm-text);
    }

    .rm-mm-items {
      padding: 8px 0;
      flex: 1;
      overflow-y: auto;
    }

    .rm-mm-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary);
      font-size: var(--rm-font-size-sm);
      text-align: left;
      transition:
        background 0.12s,
        color 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .rm-mm-item ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }
    .rm-mm-item:hover:not(:disabled) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .rm-mm-item:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .rm-mm-soon {
      margin-left: auto;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      border-radius: 6px;
      padding: 2px 6px;
    }
    @media (hover: none) {
      .preset-remove {
        opacity: 1;
      }
    }
    @media (max-width: 480px) {
      .rm-header {
        padding: 10px 12px;
        flex-wrap: wrap;
      }
      .rm-header-right {
        max-width: 100%;
        flex-wrap: wrap;
        margin-left: auto;
      }
      .rm-title {
        font-size: 1em;
      }
      .rm-title ha-icon {
        display: none;
      }
    }

    ${componentStyles}
  `;
}

try {
  customElements.define("mm-unified-app", UnifiedApp);
} catch {}
