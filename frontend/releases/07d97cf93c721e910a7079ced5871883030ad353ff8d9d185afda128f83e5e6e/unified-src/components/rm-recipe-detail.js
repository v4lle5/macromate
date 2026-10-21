/**
 * Recipe detail view — full recipe with ingredients, directions, nutrition, photos and actions.
 */
import { LitElement, html, nothing } from "lit";
import { msg, str } from "@lit/localize";
import { scaleAmount, numericAmount } from "../services/amounts.js";
import { markdown } from "../services/markdown.js";
import "./recipe-log.js";
import { RecipeDetailEditing } from "./recipe-detail-editing.js";
import { recipeDetailStyles } from "./recipe-detail-styles.js";
import {
  acquire as acquireWakeLock,
  release as releaseWakeLock,
  isWakeLockSupported,
  onChange as onWakeLockChange,
} from "../services/wake-lock.js";

const WAKE_LOCK_REASON = "recipe-detail";

// ---------------------------------------------------------------------------
// Minimal Markdown renderer (bold, italic, headers, lists, links, code)
// ---------------------------------------------------------------------------
const NUTRITION_FIELDS = [
  { key: "calories", label: msg("Calories"), unit: "kcal", bold: true },
  { key: "fat", label: msg("Total Fat"), unit: "g" },
  {
    key: "saturated_fat",
    label: msg("Saturated Fat"),
    unit: "g",
    indent: true,
  },
  { key: "cholesterol", label: msg("Cholesterol"), unit: "mg" },
  { key: "sodium", label: msg("Sodium"), unit: "mg" },
  { key: "carbohydrates", label: msg("Total Carbohydrate"), unit: "g" },
  { key: "fiber", label: msg("Dietary Fiber"), unit: "g", indent: true },
  { key: "sugar", label: msg("Total Sugars"), unit: "g", indent: true },
  { key: "protein", label: msg("Protein"), unit: "g" },
];

// Regex to find time mentions in directions text
// Matches: "10 minutes", "1 hour", "30 mins", "2 hrs", "45 seconds", "1 hour 30 minutes"
const TIME_RE =
  /(\d+\s*(?:hours?|hrs?)\s*(?:and\s*)?\d*\s*(?:minutes?|mins?)?|\d+\s*(?:minutes?|mins?|seconds?|secs?|hours?|hrs?))/gi;

function parseTimeToSeconds(text) {
  const t = text.toLowerCase();
  let total = 0;
  const hourM = t.match(/(\d+)\s*h(?:ours?|rs?)?/);
  if (hourM) total += parseInt(hourM[1]) * 3600;
  const minM = t.match(/(\d+)\s*m(?:in(?:utes?)?)?(?!\s*l)/);
  if (minM) total += parseInt(minM[1]) * 60;
  const secM = t.match(/(\d+)\s*s(?:ec(?:onds?)?)?/);
  if (secM) total += parseInt(secM[1]);
  if (!total) {
    const bare = t.match(/^(\d+)$/);
    if (bare) total = parseInt(bare[1]) * 60;
  }
  return total || 0;
}

// Daily Reference Values (FDA / EU)
const RDA = {
  calories: { label: msg("Calories"), val: 2000, unit: "kcal" },
  fat: { label: msg("Total Fat"), val: 65, unit: "g" },
  saturated_fat: { label: msg("Saturated Fat"), val: 20, unit: "g" },
  cholesterol: { label: msg("Cholesterol"), val: 300, unit: "mg" },
  sodium: { label: msg("Sodium"), val: 2300, unit: "mg" },
  carbohydrates: { label: msg("Total Carbohydrate"), val: 300, unit: "g" },
  fiber: { label: msg("Dietary Fiber"), val: 28, unit: "g" },
  sugar: { label: msg("Added Sugars"), val: 50, unit: "g" },
  protein: { label: msg("Protein"), val: 50, unit: "g" },
};

// Imperial → metric conversion factors
const IMPERIAL_TO_METRIC = {
  oz: { factor: 28.3495, to: "g", toFull: "g" },
  lb: { factor: 453.592, to: "g", toFull: "g", thresholdKg: 500 },
  cup: { factor: 250, to: "ml", toFull: "ml" },
  cups: { factor: 250, to: "ml", toFull: "ml" },
  "fl oz": { factor: 29.5735, to: "ml", toFull: "ml" },
  pt: { factor: 473.176, to: "ml", toFull: "ml" },
  qt: { factor: 946.353, to: "ml", toFull: "ml" },
};

function convertToMetric(amount, unit) {
  if (!amount || !unit) return null;
  const num = numericAmount(amount);
  if (num === null) return null;
  const key = unit.toLowerCase().trim();
  const conv = IMPERIAL_TO_METRIC[key];
  if (!conv) return null;
  let result = num * conv.factor;
  let resultUnit = conv.to;
  // For lb → use kg if ≥ 500g
  if (key === "lb" && result >= 500) {
    result = result / 1000;
    resultUnit = "kg";
  }
  // For ml → use L if ≥ 1000ml
  if (resultUnit === "ml" && result >= 1000) {
    result = result / 1000;
    resultUnit = "L";
  }
  // Round sensibly
  const rounded =
    result >= 10 ? Math.round(result) : Math.round(result * 10) / 10;
  return { amount: String(rounded), unit: resultUnit };
}

class RmRecipeDetail extends RecipeDetailEditing(LitElement) {
  static properties = {
    recipe: { type: Object },
    api: { type: Object },
    settings: { type: Object },
    wide: { type: Boolean },
    _editing: { type: Boolean },
    _editData: { type: Object },
    _servingMult: { type: Number },
    _activeTab: { type: String }, // 'ingredients'|'directions'|'notes'|'nutrition'|'photos'
    _confirmDelete: { type: Boolean },
    _downloading: { type: Boolean },
    _photoUrlInput: { type: String },
    _addingPhotoUrl: { type: Boolean },
    _wakeActive: { type: Boolean },
    _completedSteps: { type: Object }, // Set of completed step indices
    _editIngInput: { type: String },
    _editStepInput: { type: String },
    _nutritionExpanded: { type: Boolean },
    _dragIngOver: { type: Number },
    _dragStepOver: { type: Number },
    _editImageUploading: { type: Boolean },
    _slideIdx: { type: Number },
    // List picker (tags/courses/categories/collections)
    allTags: { type: Array },
    allCourses: { type: Array },
    allCategories: { type: Array },
    allCollections: { type: Array },
    _tagPickerField: { type: String },
    _tagPickerInput: { type: String },
    // Inline ingredient editing
    _editIngEdit: { type: Object },
  };

  constructor() {
    super();
    this.recipe = null;
    this.api = null;
    this.settings = {};
    this.wide = false;
    this._editing = false;
    this._editData = {};
    this._servingMult = 1;
    this._activeTab = "ingredients";
    this._confirmDelete = false;
    this._downloading = false;
    this._photoUrlInput = "";
    this._addingPhotoUrl = false;
    this._wakeActive = false;
    this._completedSteps = new Set();
    this._editIngInput = "";
    this._editStepInput = "";
    this._nutritionExpanded = false;
    this._dragIngOver = -1;
    this._dragStepOver = -1;
    this._dragIngFrom = -1;
    this._dragStepFrom = -1;
    this._editImageUploading = false;
    this._slideIdx = 0;
    this.allTags = [];
    this.allCourses = [];
    this.allCategories = [];
    this.allCollections = [];
    this._tagPickerField = null;
    this._tagPickerInput = "";
    this._editIngEdit = null;
    this._slideTimer = null;
    this._slideTouchStartX = null;
    this._wakeLockTimeout = null;
    this._wakeLockUnsubscribeFn = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // Keep _wakeActive in sync even if the lock is released by the browser
    // itself (e.g. another tab/component reason changed) rather than by us.
    this._wakeLockUnsubscribeFn = onWakeLockChange((active) => {
      this._wakeActive = active;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._releaseWakeLock();
    this._wakeLockUnsubscribeFn?.();
    this._wakeLockUnsubscribeFn = null;
    this._stopSlideTimer();
  }

  // -- Wake Lock -------------------------------------------------------------
  // Auto-engages whenever a recipe is open and "keep screen on" is enabled
  // in settings (see updated() below) — the button is a manual override on
  // top of that, e.g. to release it early or to engage it once even when
  // the setting is off.

  async _requestWakeLock() {
    if (this._wakeLockTimeout) {
      clearTimeout(this._wakeLockTimeout);
      this._wakeLockTimeout = null;
    }
    await acquireWakeLock(WAKE_LOCK_REASON);
    const durationMin = this.settings?.wakeLockDuration ?? 60;
    this._wakeLockTimeout = setTimeout(
      () => this._releaseWakeLock(),
      durationMin * 60_000,
    );
  }

  async _releaseWakeLock() {
    if (this._wakeLockTimeout) {
      clearTimeout(this._wakeLockTimeout);
      this._wakeLockTimeout = null;
    }
    await releaseWakeLock(WAKE_LOCK_REASON);
  }

  updated(changedProps) {
    if (changedProps.has("recipe") && this.recipe) {
      const prev = changedProps.get("recipe");
      const differentRecipe = !prev || prev.id !== this.recipe.id;
      this._servingMult = 1;
      if (differentRecipe) {
        this._editing = false;
        this._confirmDelete = false;
        this._photoUrlInput = "";
        this._completedSteps = new Set();
      }
      this._slideIdx = 0;
      this._startSlideTimer();
    }
    if (changedProps.has("settings")) {
      this._startSlideTimer();
    }
    if (
      (changedProps.has("recipe") || changedProps.has("settings")) &&
      this.recipe
    ) {
      if (this.settings?.keepScreenOn) this._requestWakeLock();
      else this._releaseWakeLock();
    }
    if (changedProps.has("recipe") && !this.recipe) {
      this._releaseWakeLock();
    }
  }

  _formatTime(minutes) {
    if (!minutes) return null;
    if (minutes < 60) return msg(str`${minutes} min`);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? msg(str`${h}h ${m}m`) : msg(str`${h}h`);
  }

  _scaleAmount(amount) {
    return scaleAmount(amount, this._servingMult);
  }

  // -- Actions ------------------------------------------------------------------

  _handleToggleFav() {
    this.dispatchEvent(
      new CustomEvent("rm-toggle-favourite", {
        detail: { recipeId: this.recipe.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  async _handleDownloadImage() {
    if (!this.recipe.image_url) return;
    this._downloading = true;
    try {
      const result = await this.api.downloadRecipeImage(
        this.recipe.id,
        this.recipe.image_url,
      );
      if (result?.local_url) {
        this.dispatchEvent(
          new CustomEvent("rm-update-recipe", {
            detail: {
              recipeId: this.recipe.id,
              data: { image_url: result.local_url },
            },
            bubbles: true,
            composed: true,
          }),
        );
      }
    } catch (err) {
      console.warn("Image download failed:", err);
    } finally {
      this._downloading = false;
    }
  }

  _handleDeleteRecipe() {
    if (!this._confirmDelete) {
      this._confirmDelete = true;
      setTimeout(() => {
        this._confirmDelete = false;
      }, 3000);
      return;
    }
    this.dispatchEvent(
      new CustomEvent("rm-delete-recipe", {
        detail: { recipeId: this.recipe.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleQuickRate(n) {
    const newRating = this.recipe.rating === n ? null : n;
    this.dispatchEvent(
      new CustomEvent("rm-update-recipe", {
        detail: { recipeId: this.recipe.id, data: { rating: newRating } },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleShowPlanner() {
    this.dispatchEvent(
      new CustomEvent("rm-show-planner", { bubbles: true, composed: true }),
    );
  }

  _handleChipNav(filterMode, value) {
    this.dispatchEvent(
      new CustomEvent("rm-chip-nav", {
        detail: { filterMode, value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // -- Timer helpers ----------------------------------------------------------

  _fireTimer(seconds, label) {
    const recipeName = this.recipe?.name;
    const fullLabel = recipeName ? msg(str`${recipeName} — ${label}`) : label;
    this.dispatchEvent(
      new CustomEvent("rm-start-timer", {
        detail: { seconds, label: fullLabel },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // -- Photos -----------------------------------------------------------------

  async _handleAddPhotoUrl() {
    const url = this._photoUrlInput.trim();
    if (!url) return;
    this._addingPhotoUrl = true;
    try {
      // For now, set it as the main image_url (first photo sets main image)
      const existingPhotos = this.recipe.photos || [];
      const newPhotos = [...existingPhotos, url];
      const updateData = { photos: newPhotos };
      // If no main image, also set it as image_url
      if (!this.recipe.image_url) updateData.image_url = url;
      this.dispatchEvent(
        new CustomEvent("rm-update-recipe", {
          detail: { recipeId: this.recipe.id, data: updateData },
          bubbles: true,
          composed: true,
        }),
      );
      this._photoUrlInput = "";
    } finally {
      this._addingPhotoUrl = false;
    }
  }

  _handleCameraCapture(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target.result.split(",")[1];
      try {
        // Backend handles appending to photos list and firing recipe_updated event
        await this.api.uploadRecipeImage(this.recipe.id, b64);
      } catch (err) {
        console.warn("Camera upload failed:", err);
      }
    };
    reader.readAsDataURL(file);
  }

  _setMainPhoto(url) {
    this.dispatchEvent(
      new CustomEvent("rm-update-recipe", {
        detail: { recipeId: this.recipe.id, data: { image_url: url } },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _removePhoto(url) {
    const newPhotos = (this.recipe.photos || []).filter((p) => p !== url);
    const updateData = { photos: newPhotos };
    if (this.recipe.image_url === url) {
      updateData.image_url = newPhotos[0] || null;
    }
    this.dispatchEvent(
      new CustomEvent("rm-update-recipe", {
        detail: { recipeId: this.recipe.id, data: updateData },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // -- Slideshow ----------------------------------------------------------

  _getSlideImages() {
    const r = this.recipe;
    if (!r) return [];
    const all = [r.image_url, ...(r.photos || [])].filter(Boolean);
    return [...new Set(all)];
  }

  _prevSlide() {
    const imgs = this._getSlideImages();
    if (imgs.length < 2) return;
    this._slideIdx = (this._slideIdx - 1 + imgs.length) % imgs.length;
    this._startSlideTimer();
  }

  _nextSlide() {
    const imgs = this._getSlideImages();
    if (imgs.length < 2) return;
    this._slideIdx = (this._slideIdx + 1) % imgs.length;
    this._startSlideTimer();
  }

  _startSlideTimer() {
    this._stopSlideTimer();
    const interval = this.settings?.slideshowInterval ?? 5;
    if (interval <= 0) return;
    const imgs = this._getSlideImages();
    if (imgs.length < 2) return;
    this._slideTimer = setInterval(() => {
      this._slideIdx = (this._slideIdx + 1) % this._getSlideImages().length;
    }, interval * 1000);
  }

  _stopSlideTimer() {
    if (this._slideTimer) {
      clearInterval(this._slideTimer);
      this._slideTimer = null;
    }
  }

  _slideTouchStart(e) {
    this._slideTouchStartX = e.touches[0]?.clientX ?? null;
  }

  _slideTouchEnd(e) {
    if (this._slideTouchStartX == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - this._slideTouchStartX;
    this._slideTouchStartX = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) this._nextSlide();
    else this._prevSlide();
  }

  // -- Render -------------------------------------------------------------------

  _renderSlideshow(r) {
    const imgs = this._getSlideImages();
    const idx = Math.min(this._slideIdx, imgs.length - 1);
    const multi = imgs.length > 1;
    const src = imgs[idx] || null;
    return html`
      <div
        class="wide-image-square"
        @touchstart=${multi ? this._slideTouchStart : null}
        @touchend=${multi ? this._slideTouchEnd : null}
      >
        ${src
          ? html`<img
              src="${this.api.transport.previewURL(src) || nothing}"
              alt="${r.name}"
            />`
          : html`
              <div class="hero-placeholder">
                <ha-icon icon="mdi:food"></ha-icon>
              </div>
            `}
        ${multi
          ? html`
              <button
                class="slide-btn slide-prev"
                @click=${this._prevSlide}
                title="${msg("Previous")}"
              >
                <ha-icon icon="mdi:chevron-left"></ha-icon>
              </button>
              <button
                class="slide-btn slide-next"
                @click=${this._nextSlide}
                title="${msg("Next")}"
              >
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </button>
              <div class="slide-dots">
                ${imgs.map(
                  (_, i) =>
                    html`<span
                      class="slide-dot ${i === idx ? "active" : ""}"
                    ></span>`,
                )}
              </div>
            `
          : ""}
      </div>
    `;
  }

  _renderChipGroup(label, items, cssClass) {
    if (!items?.length) return "";
    return html`
      <div class="chip-group">
        <span class="chip-group-label">${label}:</span>
        ${items.map((t) => html`<span class="chip ${cssClass}">${t}</span>`)}
      </div>
    `;
  }

  _renderChipGroups(r) {
    const courses = r.courses || [];
    const categories = r.categories || [];
    const collections = r.collections || [];
    if (!courses.length && !categories.length && !collections.length) return "";
    return html`
      <div class="chips-area">
        ${courses.length
          ? html` <div class="chip-group-row">
              <span class="chip chip-label">${msg("Course:")}</span>
              ${courses.map(
                (t) =>
                  html`<button
                    class="chip chip-course chip-nav"
                    @click=${() => this._handleChipNav("courses", t)}
                    title="${msg(str`Filter by course: ${t}`)}"
                  >
                    ${t}
                  </button>`,
              )}
            </div>`
          : ""}
        ${categories.length
          ? html` <div class="chip-group-row">
              <span class="chip chip-label">${msg("Category:")}</span>
              ${categories.map(
                (t) =>
                  html`<button
                    class="chip chip-category chip-nav"
                    @click=${() => this._handleChipNav("categories", t)}
                    title="${msg(str`Filter by category: ${t}`)}"
                  >
                    ${t}
                  </button>`,
              )}
            </div>`
          : ""}
        ${collections.length
          ? html` <div class="chip-group-row">
              <span class="chip chip-label">${msg("Collection:")}</span>
              ${collections.map(
                (t) =>
                  html`<button
                    class="chip chip-collection chip-nav"
                    @click=${() => this._handleChipNav("collections", t)}
                    title="${msg(str`Filter by collection: ${t}`)}"
                  >
                    ${t}
                  </button>`,
              )}
            </div>`
          : ""}
      </div>
    `;
  }

  _renderMetaRow(r) {
    const hasAny = r.servings || r.prep_time || r.cook_time || r.total_time;
    if (!hasAny) return "";
    const totalTime =
      r.total_time || (r.prep_time || 0) + (r.cook_time || 0) || null;
    const calcTotal = (r.prep_time || 0) + (r.cook_time || 0);
    const showTotal = totalTime && totalTime !== calcTotal;
    return html`
      <div class="meta-chips">
        ${r.servings
          ? html`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:silverware-fork-knife"></ha-icon>
                ${r.servings_text || r.servings}
              </span>
            `
          : ""}
        ${r.prep_time
          ? html`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:pencil-outline"></ha-icon>
                ${this._formatTime(r.prep_time)}
              </span>
            `
          : ""}
        ${r.cook_time
          ? html`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:pot-steam-outline"></ha-icon>
                ${this._formatTime(r.cook_time)}
              </span>
            `
          : ""}
        ${showTotal
          ? html`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:clock-outline"></ha-icon>
                ${this._formatTime(totalTime)}
              </span>
            `
          : ""}
      </div>
    `;
  }

  _renderQuickRating(r) {
    const rating = r.rating || 0;
    return html`
      <div class="quick-rating">
        ${[1, 2, 3, 4, 5].map(
          (n) => html`
            <span
              class="qr-star ${n <= rating ? "filled" : ""}"
              @click=${() => this._handleQuickRate(n)}
              >★</span
            >
          `,
        )}
      </div>
    `;
  }

  _renderActionButtons(r) {
    return html`
      <div class="action-btns-row">
        <button
          class="action-icon-btn ${r.is_favourite ? "fav-active" : ""}"
          @click=${this._handleToggleFav}
          title="${r.is_favourite
            ? msg("Remove from favourites")
            : msg("Add to favourites")}"
        >
          <span class="btn-icon"
            ><ha-icon
              icon="${r.is_favourite ? "mdi:heart" : "mdi:heart-outline"}"
            ></ha-icon
          ></span>
          <span>${msg("Favourite")}</span>
        </button>
        <button
          class="action-icon-btn"
          @click=${this._handleShowPlanner}
          title="${msg("Add to meal plan")}"
        >
          <span class="btn-icon"
            ><ha-icon icon="mdi:calendar-plus"></ha-icon
          ></span>
          <span>${msg("Plan")}</span>
        </button>
        ${r.source_url
          ? html`
              <a
                class="action-icon-btn"
                href="${r.source_url}"
                target="_blank"
                rel="noopener"
                title="${msg("Open source")}"
              >
                <span class="btn-icon"
                  ><ha-icon icon="mdi:open-in-new"></ha-icon
                ></span>
                <span>${msg("Source")}</span>
              </a>
            `
          : ""}
        <button
          class="action-icon-btn"
          @click=${this._startEdit}
          title="${msg("Edit recipe")}"
        >
          <span class="btn-icon"
            ><ha-icon icon="mdi:pencil-outline"></ha-icon
          ></span>
          <span>${msg("Edit")}</span>
        </button>
      </div>
    `;
  }

  _renderScaler() {
    const r = this.recipe;
    if (!r?.servings) return "";
    return html`
      <div class="scaler-row">
        <ha-icon class="scaler-icon" icon="mdi:silverware-fork-knife"></ha-icon>
        <div class="scaler-ctrl">
          <button
            class="scaler-btn"
            @click=${() => {
              if (this._servingMult > 0.25)
                this._servingMult =
                  Math.round((this._servingMult - 0.25) * 4) / 4;
            }}
          >
            <ha-icon icon="mdi:minus"></ha-icon>
          </button>
          <span class="scaler-val">×${this._servingMult}</span>
          <button
            class="scaler-btn"
            @click=${() => {
              this._servingMult =
                Math.round((this._servingMult + 0.25) * 4) / 4;
            }}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderWakeLock() {
    if (!this.settings?.keepScreenOn) return "";
    if (!isWakeLockSupported()) {
      return html`
        <div class="wakelock-row">
          <span
            class="wakelock-unsupported"
            title="${msg(
              "Requires a secure (HTTPS) connection and a browser that supports the Wake Lock API",
            )}"
          >
            <ha-icon icon="mdi:eye-off-outline"></ha-icon>
            ${msg("Screen lock unavailable")}
          </span>
        </div>
      `;
    }
    return html`
      <div class="wakelock-row">
        <button
          class="wakelock-btn ${this._wakeActive ? "active" : ""}"
          @click=${() =>
            this._wakeActive
              ? this._releaseWakeLock()
              : this._requestWakeLock()}
          title="${this._wakeActive
            ? msg("Release screen lock")
            : msg("Keep screen on")}"
        >
          <ha-icon
            icon="${this._wakeActive ? "mdi:eye" : "mdi:eye-off-outline"}"
          ></ha-icon>
          ${this._wakeActive ? msg("Screen on") : msg("Keep screen on")}
        </button>
      </div>
    `;
  }

  render() {
    if (!this.recipe) return html``;
    const r = this.recipe;
    return this.wide ? this._renderWide(r) : this._renderNarrow(r);
  }

  _renderWide(r) {
    const groups = this._groupIngredients(r.ingredients);

    return html`
      <div class="detail-container wide">
        <!--
          CSS grid: 2 cols (1fr 2fr) × auto rows
          [image]   [info card]
          [ings]    [directions]
          Whole card scrolls — no independent column scrolling
        -->
        <div class="wide-layout">
          <!-- row 1: image (1/3) + info card (2/3) -->
          <div class="wide-row">
            <!-- col 1: square image card (padding-top:100% inner wrapper forces square) -->
            <div class="wide-image-card">${this._renderSlideshow(r)}</div>

            <!-- col 2: info card -->
            <div class="wide-info-card">
              <h1 class="wide-title">${r.name}</h1>
              ${this._renderActionButtons(r)}
              <mm-recipe-log
                .api=${this.api.transport}
                .recipe=${r}
                .servings=${(r.servings || 1) * this._servingMult}
              ></mm-recipe-log>
              ${r.description
                ? html`<div class="wide-desc md-content">
                    ${markdown(r.description)}
                  </div>`
                : ""}
              ${this._renderMetaRow(r)} ${this._renderChipGroups(r)}
            </div>
          </div>
          <!-- end wide-row 1 -->

          <!-- row 2: ingredients (1/3) + directions (2/3) -->
          <div class="wide-row">
            <!-- col 1: ingredients column -->
            <div class="wide-ing-col">
              <!-- Ingredient serving controls -->
              <div class="wide-ing-controls">${this._renderScaler()}</div>

              ${groups.map(
                (g) => html`
                  <div class="wide-section-card">
                    ${g.header
                      ? html`<div class="wide-section-title">${g.header}</div>`
                      : ""}
                    ${g.items.length
                      ? html`
                          <ul class="ingredient-list">
                            ${g.items.map((ing) => {
                              const { amount, unit } =
                                this._getDisplayAmount(ing);
                              return html`
                                <li class="ingredient-item">
                                  <span class="ing-amount"
                                    >${amount} ${unit}</span
                                  >
                                  <span class="ing-name"
                                    >${ing.name}${ing.notes
                                      ? html` <em class="ing-notes"
                                          >(${ing.notes})</em
                                        >`
                                      : ""}</span
                                  >
                                </li>
                              `;
                            })}
                          </ul>
                        `
                      : ""}
                  </div>
                `,
              )}

              <div class="wide-section-card">
                ${this._renderNutritionRing(r)}
              </div>
            </div>

            <!-- col 2: directions column, each step its own card -->
            <div class="wide-dir-col">
              <div class="wide-dir-spacer"></div>
              ${this._renderWakeLock()}
              ${(r.instructions || []).length
                ? (r.instructions || []).map((step, i) => {
                    const done = this._completedSteps.has(i);
                    return html`
                      <div
                        class="wide-section-card wide-step-card ${done
                          ? "step-done"
                          : ""}"
                      >
                        <span
                          class="step-num ${done ? "done" : ""}"
                          @click=${(e) => {
                            e.stopPropagation();
                            this._toggleStepComplete(i);
                          }}
                          title="${done
                            ? msg("Mark incomplete")
                            : msg("Mark complete")}"
                          >${done
                            ? html`<ha-icon icon="mdi:check"></ha-icon>`
                            : i + 1}</span
                        >
                        <span class="step-text"
                          >${this._renderStepWithTimers(step)}</span
                        >
                      </div>
                    `;
                  })
                : html`<p class="empty-tab">
                    ${msg("No directions listed.")}
                  </p>`}
              ${r.notes
                ? html`
                    <div class="wide-section-card">
                      <div class="wide-section-title">${msg("Notes")}</div>
                      <div class="notes-text md-content">
                        ${markdown(r.notes)}
                      </div>
                    </div>
                  `
                : ""}
            </div>
          </div>
          <!-- end wide-row 2 -->
        </div>

        <!-- Edit overlay -->
        ${this._editing ? this._renderEditPanel() : ""}
      </div>
    `;
  }

  _renderNarrow(r) {
    const totalTime =
      r.total_time || (r.prep_time || 0) + (r.cook_time || 0) || null;

    return html`
      <div class="detail-container">
        <!-- Hero image -->
        <div class="hero ${r.image_url ? "" : "no-image"}">
          ${r.image_url
            ? html`
                <img
                  src="${this.api.transport.previewURL(r.image_url) || nothing}"
                  alt="${r.name}"
                />
                <div class="hero-overlay"></div>
              `
            : html`
                <div class="hero-placeholder">
                  <ha-icon icon="mdi:food"></ha-icon>
                </div>
              `}
          <div class="hero-actions">
            <button
              class="hero-btn ${r.is_favourite ? "fav-active" : ""}"
              @click=${this._handleToggleFav}
              title="${r.is_favourite
                ? msg("Remove from favourites")
                : msg("Add to favourites")}"
            >
              <ha-icon
                icon="${r.is_favourite ? "mdi:heart" : "mdi:heart-outline"}"
              ></ha-icon>
            </button>
            ${r.source_url
              ? html`
                  <a
                    class="hero-btn"
                    href="${r.source_url}"
                    target="_blank"
                    rel="noopener"
                    title="${msg("Open source")}"
                  >
                    <ha-icon icon="mdi:open-in-new"></ha-icon>
                  </a>
                `
              : ""}
          </div>
        </div>

        <div class="detail-scroll">
          <!-- Recipe meta -->
          <div class="detail-head">
            <h2 class="recipe-title">${r.name}</h2>
            ${this._renderActionButtons(r)}
            <mm-recipe-log
              .api=${this.api.transport}
              .recipe=${r}
              .servings=${(r.servings || 1) * this._servingMult}
            ></mm-recipe-log>
            ${r.description
              ? html`<div class="detail-desc md-content">
                  ${markdown(r.description)}
                </div>`
              : ""}

            <div class="meta-row">
              ${r.prep_time
                ? html`
                    <div class="meta-item">
                      <span class="meta-label">${msg("Prep")}</span>
                      <span class="meta-val"
                        >${this._formatTime(r.prep_time)}</span
                      >
                    </div>
                  `
                : ""}
              ${r.cook_time
                ? html`
                    <div class="meta-item">
                      <span class="meta-label">${msg("Cook")}</span>
                      <span class="meta-val"
                        >${this._formatTime(r.cook_time)}</span
                      >
                    </div>
                  `
                : ""}
              ${totalTime
                ? html`
                    <div class="meta-item">
                      <span class="meta-label">${msg("Total")}</span>
                      <span class="meta-val"
                        >${this._formatTime(totalTime)}</span
                      >
                    </div>
                  `
                : ""}
              ${r.servings
                ? html`
                    <div class="meta-item">
                      <span class="meta-label">${msg("Serves")}</span>
                      <span class="meta-val"
                        >${r.servings_text || r.servings}</span
                      >
                    </div>
                  `
                : ""}
            </div>

            ${this._renderChipGroups(r)}
          </div>

          <!-- Serving scaler -->
          ${this._renderScaler()}

          <!-- Tabs -->
          <div class="tabs-row">
            ${[
              ["ingredients", msg("Ingredients")],
              ["directions", msg("Directions")],
              ["notes", msg("Notes")],
              ["nutrition", msg("Nutrition")],
              ["photos", msg("Photos")],
            ].map(
              ([val, lbl]) => html`
                <button
                  class="tab-btn ${this._activeTab === val ? "active" : ""}"
                  @click=${() => {
                    this._activeTab = val;
                  }}
                >
                  ${lbl}
                </button>
              `,
            )}
          </div>

          <!-- Wake lock button (shown when setting enabled) -->
          ${this._renderWakeLock()}

          <!-- Tab content -->
          <div class="tab-content">
            ${this._activeTab === "ingredients"
              ? this._renderIngredients(r)
              : ""}
            ${this._activeTab === "directions" ? this._renderDirections(r) : ""}
            ${this._activeTab === "notes" ? this._renderNotes(r) : ""}
            ${this._activeTab === "nutrition"
              ? this._renderNutritionRing(r)
              : ""}
            ${this._activeTab === "photos" ? this._renderPhotos(r) : ""}
          </div>
        </div>

        <!-- Edit panel (inline overlay) -->
        ${this._editing ? this._renderEditPanel() : ""}
      </div>
    `;
  }

  _getDisplayAmount(ing) {
    const conv = convertToMetric(this._scaleAmount(ing.amount), ing.unit);
    if (conv) return conv;
    return {
      amount: this._scaleAmount(ing.amount) || "",
      unit: ing.unit || "",
    };
  }

  _groupIngredients(ingredients) {
    const groups = [];
    let current = { header: null, items: [] };
    for (const ing of ingredients || []) {
      if (ing.is_heading || ing.name?.startsWith("#")) {
        if (current.items.length > 0 || current.header !== null)
          groups.push(current);
        const label = ing.name?.startsWith("#")
          ? ing.name.slice(1).trim()
          : ing.name;
        current = { header: label || "", items: [] };
      } else {
        current.items.push(ing);
      }
    }
    if (current.items.length > 0 || current.header !== null)
      groups.push(current);
    return groups.length
      ? groups
      : [{ header: null, items: ingredients || [] }];
  }

  _renderIngredients(r) {
    return html`
      ${r.ingredients?.length
        ? html`
            <ul class="ingredient-list">
              ${r.ingredients.map((ing, i) => {
                if (ing.is_heading || ing.name?.startsWith("#")) {
                  const headingText = ing.name?.startsWith("#")
                    ? ing.name.slice(1).trim()
                    : ing.name;
                  return html`<li class="ing-heading">${headingText}</li>`;
                }
                const { amount, unit } = this._getDisplayAmount(ing);
                return html`
                  <li class="ingredient-item">
                    <span class="ing-amount">${amount} ${unit}</span>
                    <span class="ing-name"
                      >${ing.name}${ing.notes
                        ? html` <em class="ing-notes">(${ing.notes})</em>`
                        : ""}</span
                    >
                  </li>
                `;
              })}
            </ul>
          `
        : html`<p class="empty-tab">${msg("No ingredients listed.")}</p>`}
    `;
  }

  _toggleStepComplete(i) {
    const next = new Set(this._completedSteps);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    this._completedSteps = next;
  }

  _renderDirections(r) {
    if (!r.instructions?.length) {
      return html`<p class="empty-tab">${msg("No directions listed.")}</p>`;
    }
    return html`
      <ol class="steps-list">
        ${r.instructions.map((step, i) => {
          const done = this._completedSteps.has(i);
          return html`
            <li class="step-item ${done ? "step-done" : ""}">
              <span
                class="step-num ${done ? "done" : ""}"
                @click=${(e) => {
                  e.stopPropagation();
                  this._toggleStepComplete(i);
                }}
                title="${done ? msg("Mark incomplete") : msg("Mark complete")}"
                >${done
                  ? html`<ha-icon icon="mdi:check"></ha-icon>`
                  : i + 1}</span
              >
              <span class="step-text">${this._renderStepWithTimers(step)}</span>
            </li>
          `;
        })}
      </ol>
    `;
  }

  _renderStepWithTimers(text) {
    // Split text by time mentions and wrap them in clickable timer chips
    const parts = [];
    let lastIndex = 0;
    let match;
    TIME_RE.lastIndex = 0;
    while ((match = TIME_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const timeText = match[0];
      const seconds = parseTimeToSeconds(timeText);
      if (seconds > 0) {
        parts.push(
          html`<button
            class="time-chip"
            @click=${(e) => {
              e.stopPropagation();
              this._fireTimer(seconds, timeText);
            }}
            title="${msg(str`Start timer for ${timeText}`)}"
          >
            <ha-icon icon="mdi:timer-outline"></ha-icon>${timeText}
          </button>`,
        );
      } else {
        parts.push(timeText);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  }

  _renderNotes(r) {
    return html`
      ${r.notes
        ? html`<div class="notes-text md-content">${markdown(r.notes)}</div>`
        : html`<p class="empty-tab">${msg("No notes.")}</p>`}
    `;
  }

  _renderNutrition(r) {
    const n = r.nutrition || {};
    const hasAny = NUTRITION_FIELDS.some(
      (f) => n[f.key] != null && n[f.key] !== "",
    );
    if (!hasAny) {
      return html`
        <div class="empty-tab">
          <p>${msg("No nutrition info. Add it via the edit panel.")}</p>
        </div>
      `;
    }
    const perServing = r.servings
      ? msg(str`Per serving (${r.servings_text || r.servings})`)
      : msg("Per serving");
    return html`
      <div class="nutrition-panel">
        <div class="nutr-header">${msg("Nutrition Facts")}</div>
        <div class="nutr-sub">${perServing}</div>
        <div class="nutr-divider thick"></div>
        ${NUTRITION_FIELDS.map((f) => {
          const val = n[f.key];
          if (val == null || val === "") return "";
          return html`
            <div
              class="nutr-row ${f.bold ? "nutr-bold" : ""} ${f.indent
                ? "nutr-indent"
                : ""}"
            >
              <span class="nutr-label">${f.label}</span>
              <span class="nutr-val"
                >${val}${f.unit !== "kcal"
                  ? html`<em> ${f.unit}</em>`
                  : ""}</span
              >
            </div>
            <div class="nutr-divider"></div>
          `;
        })}
      </div>
    `;
  }

  _renderNutritionRing(r) {
    const n = r?.declared_nutrition || {};
    const numeric = (value) =>
      typeof value === "number" && Number.isFinite(value) && value >= 0
        ? value
        : null;
    const cal = numeric(n.calories),
      fat = numeric(n.fat),
      carb = numeric(n.carbs),
      prot = numeric(n.protein);
    const complete = [fat, carb, prot].every((v) => v !== null);

    const fatCal = fat * 9;
    const carbCal = carb * 4;
    const protCal = prot * 4;
    const total = complete ? fatCal + carbCal + protCal : 0;
    const hasData = [cal, fat, carb, prot].some((v) => v !== null);

    if (!hasData) {
      return html` <div class="nutr-card">
          <p class="empty-tab" style="margin:0;padding:8px 0;text-align:center">
            ${msg("No nutritional information available.")}
          </p>
        </div>
        ${this._renderOriginalNutrition(r)}`;
    }

    const MACROS = [
      {
        label: msg("Carbs"),
        val: carb,
        cal: carbCal,
        color: "var(--rm-ochre)",
      },
      {
        label: msg("Total fat"),
        val: fat,
        cal: fatCal,
        color: "var(--rm-terracotta)",
      },
      {
        label: msg("Protein"),
        val: prot,
        cal: protCal,
        color: "var(--rm-sage)",
      },
    ];

    // SVG stroke-dasharray arcs using svg`` template tag (correct SVG namespace)
    const rad = 42,
      cx = 50,
      cy = 50;
    const strokeW = 7;
    const circ = 2 * Math.PI * rad;
    // With stroke-linecap="round", each end cap extends strokeW/2 beyond the arc endpoint.
    // gapLen must exceed strokeW (both caps combined) to leave a visible gap between rounded ends.
    const gapLen = strokeW + (circ * 4) / 360; // stroke-width + 4° of visible separation

    const carbArc =
      total > 0 ? Math.max(0, (carbCal / total) * circ - gapLen) : 0;
    const fatArc =
      total > 0 ? Math.max(0, (fatCal / total) * circ - gapLen) : 0;
    const protArc =
      total > 0 ? Math.max(0, (protCal / total) * circ - gapLen) : 0;
    const carbStartDeg = -90;
    const fatStartDeg =
      carbStartDeg + (total > 0 ? (carbCal / total) * 360 : 0);
    const protStartDeg = fatStartDeg + (total > 0 ? (fatCal / total) * 360 : 0);

    const displayCal = cal !== null ? Math.round(cal) : null;

    // RDA progress data
    const rdaRows = Object.entries(RDA)
      .filter(([k]) => {
        const v = numeric(n[k === "carbohydrates" ? "carbs" : k]);
        return v !== null && r.nutrition_basis === "per_serving";
      })
      .map(([k, rda]) => {
        const v = numeric(n[k === "carbohydrates" ? "carbs" : k]);
        const pct = Math.min(Math.round((v / rda.val) * 100), 999);
        return { key: k, label: rda.label, val: v, unit: rda.unit, pct };
      });

    return html`
      <div class="nutr-card">
        <!-- Top row: donut ring + macro columns -->
        <div class="nutr-top">
          <div class="nutr-ring-wrap">
            <svg
              width="90"
              height="90"
              viewBox="0 0 100 100"
              style="display:block"
            >
              <!-- Background track — always visible -->
              <circle
                cx="${cx}"
                cy="${cy}"
                r="${rad}"
                fill="none"
                stroke="var(--rm-border)"
                stroke-width="7"
              />
              <!-- Colored arcs: all 3 inline in the same html template so they
                   inherit SVG namespace from the parser. Hidden via opacity when
                   there's no data. Dynamic values are attributes, not new elements. -->
              <circle
                cx="${cx}"
                cy="${cy}"
                r="${rad}"
                fill="none"
                stroke="var(--rm-ochre)"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${carbArc} ${circ}"
                transform="rotate(${carbStartDeg} ${cx} ${cy})"
                opacity="${total > 0 && carbArc > 0 ? 0.95 : 0}"
              />
              <circle
                cx="${cx}"
                cy="${cy}"
                r="${rad}"
                fill="none"
                stroke="var(--rm-terracotta)"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${fatArc} ${circ}"
                transform="rotate(${fatStartDeg} ${cx} ${cy})"
                opacity="${total > 0 && fatArc > 0 ? 0.95 : 0}"
              />
              <circle
                cx="${cx}"
                cy="${cy}"
                r="${rad}"
                fill="none"
                stroke="var(--rm-sage)"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${protArc} ${circ}"
                transform="rotate(${protStartDeg} ${cx} ${cy})"
                opacity="${total > 0 && protArc > 0 ? 0.95 : 0}"
              />
              <text
                x="${cx}"
                y="${cy - 2}"
                text-anchor="middle"
                fill="var(--rm-text)"
                font-size="16"
                font-weight="700"
                font-family="inherit"
              >
                ${displayCal ?? "–"}
              </text>
              <text
                x="${cx}"
                y="${cy + 12}"
                text-anchor="middle"
                fill="var(--rm-text-secondary)"
                font-size="9"
                font-family="inherit"
              >
                ${msg("cals")}
              </text>
            </svg>
          </div>

          <div class="nutr-macro-cols">
            ${MACROS.map((m) => {
              const pct = total > 0 ? Math.round((m.cal / total) * 100) : 0;
              return html`
                <div class="nutr-macro-col" style="--macro-color:${m.color}">
                  <span class="nutr-mcol-num"
                    >${m.val !== null ? `${m.val} g` : "\u2014"}</span
                  >
                  <span class="nutr-mcol-label">${m.label}</span>
                  ${pct > 0
                    ? html`<span class="nutr-mcol-pct">${pct}% cals</span>`
                    : ""}
                </div>
              `;
            })}
          </div>
        </div>

        ${r?.servings
          ? html`
              <div class="nutr-serving-note">
                ${r.nutrition_basis === "per_serving"
                  ? msg("Per serving")
                  : r.nutrition_basis === "per_recipe"
                    ? "Per recipe"
                    : "Unknown nutrition basis"}
              </div>
            `
          : ""}

        <!-- Daily RDA collapsible -->
        ${rdaRows.length
          ? html`
              <button
                class="nutr-rda-toggle"
                @click=${() => {
                  this._nutritionExpanded = !this._nutritionExpanded;
                }}
              >
                <span class="nutr-rda-title"
                  >${msg("Daily RDA Nutrition")}</span
                >
                <span class="nutr-rda-count">${rdaRows.length}</span>
                <ha-icon
                  icon="${this._nutritionExpanded
                    ? "mdi:chevron-up"
                    : "mdi:chevron-down"}"
                ></ha-icon>
              </button>
              ${this._nutritionExpanded
                ? html`
                    <div class="nutr-rda-rows">
                      ${rdaRows.map(
                        (row) => html`
                          <div class="nutr-rda-row">
                            <span class="nutr-rda-label">${row.label}</span>
                            <span class="nutr-rda-val"
                              >${row.val} ${row.unit}</span
                            >
                            <span class="nutr-rda-pct">${row.pct}%</span>
                            <div class="nutr-rda-bar-wrap">
                              <div
                                class="nutr-rda-bar ${row.pct > 100
                                  ? "over"
                                  : ""}"
                                style="width:${Math.min(row.pct, 100)}%"
                              ></div>
                            </div>
                          </div>
                        `,
                      )}
                    </div>
                  `
                : ""}
            `
          : ""}
      </div>
      ${this._renderOriginalNutrition(r)}
    `;
  }

  _renderOriginalNutrition(r) {
    const values = Object.entries(r.nutrition || {}).filter(
      ([, v]) => v !== null && v !== "",
    );
    return values.length
      ? html`<details class="nutr-original" open>
          <summary>Original nutrition text</summary>
          ${values.map(
            ([key, value]) =>
              html`<p>
                <strong>${key}</strong>
                <span
                  >${typeof value === "object"
                    ? JSON.stringify(value)
                    : value}</span
                >
              </p>`,
          )}
        </details>`
      : "";
  }

  _renderPhotos(r) {
    const photos = r.photos || [];
    const mainImage = r.image_url;
    // Combine main image with extra photos (deduplicated)
    const allPhotos = mainImage
      ? [mainImage, ...photos.filter((p) => p !== mainImage)]
      : photos;

    return html`
      <div class="photos-tab">
        ${allPhotos.length
          ? html`
              <div class="photos-grid">
                ${allPhotos.map(
                  (url) => html`
                    <div
                      class="photo-item ${url === mainImage
                        ? "main-photo"
                        : ""}"
                    >
                      <img
                        src="${this.api.transport.previewURL(url) || nothing}"
                        alt="${msg("Recipe photo")}"
                        loading="lazy"
                      />
                      ${url === mainImage
                        ? html`<span class="photo-badge">${msg("Main")}</span>`
                        : html`
                            <button
                              class="photo-action set-main"
                              @click=${() => this._setMainPhoto(url)}
                              title="${msg("Set as main photo")}"
                            >
                              <ha-icon icon="mdi:star-outline"></ha-icon>
                            </button>
                          `}
                      <button
                        class="photo-action remove-photo"
                        @click=${() => this._removePhoto(url)}
                        title="${msg("Remove photo")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                  `,
                )}
              </div>
            `
          : html`
              <div class="empty-tab">
                <ha-icon icon="mdi:image-off-outline"></ha-icon>
                <p>${msg("No photos yet.")}</p>
              </div>
            `}

        <div class="photo-add-section">
          <div class="photo-add-label">${msg("Add a photo")}</div>
          <div class="photo-url-row">
            <input
              type="url"
              class="photo-url-input"
              placeholder="${msg("Paste image URL…")}"
              .value=${this._photoUrlInput}
              @input=${(e) => {
                this._photoUrlInput = e.target.value;
              }}
              @keydown=${(e) => {
                if (e.key === "Enter") this._handleAddPhotoUrl();
              }}
            />
            <button
              class="action-btn primary"
              ?disabled=${!this._photoUrlInput.trim() || this._addingPhotoUrl}
              @click=${this._handleAddPhotoUrl}
            >
              ${msg("Add")}
            </button>
          </div>
          <div class="camera-btns">
            <label class="camera-btn-split">
              <ha-icon icon="mdi:camera"></ha-icon>
              <span>${msg("Take Photo")}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                class="camera-input"
                @change=${this._handleCameraCapture}
              />
            </label>
            <label class="camera-btn-split">
              <ha-icon icon="mdi:image-multiple-outline"></ha-icon>
              <span>${msg("Choose from Library")}</span>
              <input
                type="file"
                accept="image/*"
                class="camera-input"
                @change=${this._handleCameraCapture}
              />
            </label>
          </div>
        </div>
      </div>
    `;
  }

  static styles = recipeDetailStyles;
}

try {
  customElements.define("rm-recipe-detail", RmRecipeDetail);
} catch {}
