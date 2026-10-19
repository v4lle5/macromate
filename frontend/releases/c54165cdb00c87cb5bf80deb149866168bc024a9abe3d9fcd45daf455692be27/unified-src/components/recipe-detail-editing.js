import { html, nothing } from "lit";
import { msg, str } from "@lit/localize";
import {
  declarationFields,
  declaredValues,
} from "../services/declared-nutrition.js";

export const RecipeDetailEditing = (Base) =>
  class extends Base {
    _startEdit() {
      const n = this.recipe.nutrition || {};
      this._editData = {
        nutrition_basis: this.recipe.nutrition_basis || "unknown",
        declared_nutrition: { ...(this.recipe.declared_nutrition || {}) },
        name: this.recipe.name || "",
        description: this.recipe.description || "",
        source_url: this.recipe.source_url || "",
        servings: this.recipe.servings || "",
        prep_time: this.recipe.prep_time || "",
        cook_time: this.recipe.cook_time || "",
        tags: [...(this.recipe.tags || [])],
        courses: [...(this.recipe.courses || [])],
        categories: [...(this.recipe.categories || [])],
        collections: [...(this.recipe.collections || [])],
        notes: this.recipe.notes || "",
        rating: this.recipe.rating || 0,
        image_url:
          this.recipe.media_refs?.image_url ?? this.recipe.image_url ?? "",
        photos: [
          ...(this.recipe.media_refs?.photos ?? this.recipe.photos ?? []),
        ],
        ingredients: [...(this.recipe.ingredients || [])],
        instructions: [...(this.recipe.instructions || [])],
        // Nutrition
        cal: n.calories ?? "",
        fat: n.fat ?? "",
        satf: n.saturated_fat ?? "",
        chol: n.cholesterol ?? "",
        sod: n.sodium ?? "",
        carb: n.carbohydrates ?? "",
        fib: n.fiber ?? "",
        sug: n.sugar ?? "",
        prot: n.protein ?? "",
      };
      this._editing = true;
    }

    _cancelEdit() {
      this._editing = false;
      this._editData = {};
    }

    _handleEditField(field, value) {
      this._editData = { ...this._editData, [field]: value };
    }

    // -- List picker (tags / courses / categories / collections) ---------------

    _renderListPicker(field, label, allValues) {
      const current = this._editData[field] || [];
      const open = this._tagPickerField === field;
      const available = (allValues || []).filter((v) => !current.includes(v));
      const inputVal = open ? this._tagPickerInput : "";
      return html`
        <div class="edit-field list-picker-field">
          <label>${label}</label>
          <div class="list-picker-wrap">
            <!-- Selected chips -->
            <div class="list-picker-chips">
              ${current.map(
                (v) => html`
                  <span class="list-chip selected">
                    ${v}
                    <button
                      class="list-chip-remove"
                      @click=${() => this._toggleListValue(field, v)}
                      title="${msg("Remove")}"
                    >
                      ×
                    </button>
                  </span>
                `,
              )}
              <button
                class="list-chip-add-btn"
                @click=${() => {
                  this._tagPickerField = open ? null : field;
                  this._tagPickerInput = "";
                }}
                title="${msg(str`Add ${label.toLowerCase()}`)}"
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>
            <!-- Picker dropdown -->
            ${open
              ? html`
                  <div class="list-picker-dropdown">
                    ${available.length
                      ? html`
                          <div class="list-picker-existing">
                            ${available.map(
                              (v) => html`
                                <span
                                  class="list-chip available"
                                  @click=${() => {
                                    this._toggleListValue(field, v);
                                  }}
                                >
                                  ${v}
                                </span>
                              `,
                            )}
                          </div>
                        `
                      : ""}
                    <div class="list-picker-new-row">
                      <input
                        class="list-picker-input"
                        type="text"
                        placeholder="${msg(str`New ${label.toLowerCase()}…`)}"
                        .value=${inputVal}
                        @input=${(e) => {
                          this._tagPickerInput = e.target.value;
                        }}
                        @keydown=${(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            this._addListValue(field, this._tagPickerInput);
                          }
                          if (e.key === "Escape") {
                            this._tagPickerField = null;
                          }
                        }}
                      />
                      <button
                        class="list-picker-new-btn"
                        @click=${() =>
                          this._addListValue(field, this._tagPickerInput)}
                        ?disabled=${!this._tagPickerInput.trim()}
                      >
                        ${msg("Add")}
                      </button>
                    </div>
                  </div>
                `
              : ""}
          </div>
        </div>
      `;
    }

    _toggleListValue(field, value) {
      const cur = this._editData[field] || [];
      const updated = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      this._editData = { ...this._editData, [field]: updated };
    }

    _addListValue(field, rawValue) {
      const value = (rawValue || "").trim();
      if (!value) return;
      const cur = this._editData[field] || [];
      if (!cur.includes(value)) {
        this._editData = { ...this._editData, [field]: [...cur, value] };
      }
      this._tagPickerInput = "";
      this._tagPickerField = null;
    }

    // -- Inline ingredient editing --------------------------------------------

    _startEditIngredient(idx) {
      const ing = (this._editData.ingredients || [])[idx];
      if (!ing) return;
      if (ing.is_heading || ing.name?.startsWith("#")) {
        const name = ing.name?.startsWith("#")
          ? ing.name.slice(1).trim()
          : ing.name;
        this._editIngEdit = { idx, heading: true, name };
      } else {
        this._editIngEdit = {
          idx,
          heading: false,
          amount: ing.amount || "",
          unit: ing.unit || "",
          name: ing.name || "",
        };
      }
    }

    _saveEditIngredient() {
      const e = this._editIngEdit;
      if (!e) return;
      const ings = [...(this._editData.ingredients || [])];
      if (e.heading) {
        ings[e.idx] = { name: `# ${e.name}`, is_heading: true };
      } else {
        ings[e.idx] = { amount: e.amount, unit: e.unit, name: e.name };
      }
      this._editData = { ...this._editData, ingredients: ings };
      this._editIngEdit = null;
    }

    _cancelEditIngredient() {
      this._editIngEdit = null;
    }

    _editAddIngredient() {
      const raw = this._editIngInput.trim();
      if (!raw) return;
      let newIng;
      if (raw.startsWith("#")) {
        newIng = { name: raw, is_heading: true };
      } else {
        const parts = raw.split(/\s+/);
        let amount = "",
          unit = "",
          name = "";
        if (parts.length >= 3 && !isNaN(parseFloat(parts[0]))) {
          amount = parts[0];
          unit = parts[1];
          name = parts.slice(2).join(" ");
        } else if (parts.length === 2 && !isNaN(parseFloat(parts[0]))) {
          amount = parts[0];
          name = parts[1];
        } else {
          name = raw;
        }
        newIng = { amount, unit, name };
      }
      this._editData = {
        ...this._editData,
        ingredients: [...(this._editData.ingredients || []), newIng],
      };
      this._editIngInput = "";
    }

    _editRemoveIngredient(idx) {
      this._editData = {
        ...this._editData,
        ingredients: (this._editData.ingredients || []).filter(
          (_, i) => i !== idx,
        ),
      };
    }

    _editMoveIngredient(idx, dir) {
      const arr = [...(this._editData.ingredients || [])];
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      this._editData = { ...this._editData, ingredients: arr };
    }

    _editMoveStep(idx, dir) {
      const arr = [...(this._editData.instructions || [])];
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      this._editData = { ...this._editData, instructions: arr };
    }

    _editDropIngredient(from, to) {
      if (from === to || from < 0 || to < 0) return;
      const arr = [...(this._editData.ingredients || [])];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      this._editData = { ...this._editData, ingredients: arr };
      this._dragIngOver = -1;
      this._dragIngFrom = -1;
    }

    _editDropStep(from, to) {
      if (from === to || from < 0 || to < 0) return;
      const arr = [...(this._editData.instructions || [])];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      this._editData = { ...this._editData, instructions: arr };
      this._dragStepOver = -1;
      this._dragStepFrom = -1;
    }

    _editAddStep(text) {
      if (!text.trim()) return;
      this._editData = {
        ...this._editData,
        instructions: [...(this._editData.instructions || []), text.trim()],
      };
    }

    _editRemoveStep(idx) {
      this._editData = {
        ...this._editData,
        instructions: (this._editData.instructions || []).filter(
          (_, i) => i !== idx,
        ),
      };
    }

    async _editUploadImage(file) {
      if (!file || !this.recipe?.id) return;
      this._editImageUploading = true;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const b64 = ev.target.result.split(",")[1];
        try {
          const result = await this.api.uploadRecipeImage(this.recipe.id, b64);
          const url = result?.image_url || result?.local_url;
          if (url) {
            this._editData = {
              ...this._editData,
              image_url: this._editData.image_url || url,
              photos: [...new Set([...(this._editData.photos || []), url])],
            };
          }
        } catch (err) {
          console.warn("Image upload failed:", err);
        } finally {
          this._editImageUploading = false;
        }
      };
      reader.readAsDataURL(file);
    }

    async _saveEdit() {
      const d = this._editData;

      const nutrition = {};
      const nMap = {
        cal: "calories",
        fat: "fat",
        satf: "saturated_fat",
        chol: "cholesterol",
        sod: "sodium",
        carb: "carbohydrates",
        fib: "fiber",
        sug: "sugar",
        prot: "protein",
      };
      let hasNutrition = false;
      for (const [k, nk] of Object.entries(nMap)) {
        if (d[k] !== "" && d[k] != null) {
          nutrition[nk] = d[k];
          hasNutrition = true;
        }
      }

      const data = {
        name: d.name,
        description: d.description,
        source_url: d.source_url,
        image_url: d.image_url || null,
        servings: d.servings === "" ? null : Number(d.servings),
        prep_time: d.prep_time === "" ? null : Number(d.prep_time),
        cook_time: d.cook_time === "" ? null : Number(d.cook_time),
        tags: Array.isArray(d.tags) ? d.tags : [],
        courses: Array.isArray(d.courses) ? d.courses : [],
        categories: Array.isArray(d.categories) ? d.categories : [],
        collections: Array.isArray(d.collections) ? d.collections : [],
        notes: d.notes,
        rating: d.rating || null,
        photos: d.photos || [],
        ingredients: d.ingredients || [],
        instructions: d.instructions || [],
        nutrition: hasNutrition ? nutrition : null,
        nutrition_basis: d.nutrition_basis || "unknown",
        declared_nutrition: declaredValues(d.declared_nutrition),
      };
      try {
        await this.api.updateRecipe(this.recipe.id, data);
        this._editing = false;
        this.dispatchEvent(
          new CustomEvent("rm-recipe-saved", { bubbles: true, composed: true }),
        );
      } catch (error) {
        this._saveError = error.message;
        this.requestUpdate();
      }
    }

    _renderEditPanel() {
      const d = this._editData;
      return html`
        <div
          class="edit-overlay"
          @click=${(e) => {
            if (e.target === e.currentTarget) this._cancelEdit();
          }}
        >
          <div class="edit-panel">
            <div class="edit-header">
              <span>${msg("Edit Recipe")}</span>
              <button class="icon-btn" @click=${this._cancelEdit}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
            <div class="edit-body">
              ${this._renderField(msg("Name"), "name", "text")}

              <!-- Image section -->
              <div class="edit-section-label">${msg("Image")}</div>
              <div class="edit-photo-row">
                ${(() => {
                  const allUrls = [
                    ...new Set(
                      [d.image_url, ...(d.photos || [])].filter(Boolean),
                    ),
                  ];
                  return html`
                    ${allUrls.map(
                      (url) => html`
                        <div
                          class="edit-photo-thumb ${url === d.image_url
                            ? "selected"
                            : ""}"
                          @click=${() =>
                            this._handleEditField("image_url", url)}
                          title="${msg("Set as main image")}"
                        >
                          <img
                            src="${this.api.transport.previewURL(url) ||
                            nothing}"
                            alt=""
                          />
                          ${url === d.image_url
                            ? html`<span class="edit-thumb-badge"
                                ><ha-icon icon="mdi:check"></ha-icon
                              ></span>`
                            : ""}
                        </div>
                      `,
                    )}
                    <label
                      class="edit-photo-add ${this._editImageUploading
                        ? "loading"
                        : ""}"
                      title="${msg("Upload photo")}"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style="display:none"
                        @change=${(e) => {
                          const f = e.target.files?.[0];
                          if (f) this._editUploadImage(f);
                          e.target.value = "";
                        }}
                      />
                      <ha-icon
                        icon="${this._editImageUploading
                          ? "mdi:loading"
                          : "mdi:plus"}"
                      ></ha-icon>
                    </label>
                  `;
                })()}
              </div>
              <div class="edit-field">
                <label>${msg("Or paste image URL")}</label>
                <input
                  type="url"
                  .value=${d.image_url ?? ""}
                  @input=${(e) =>
                    this._handleEditField("image_url", e.target.value)}
                  placeholder="https://…"
                />
              </div>

              ${this._renderField(
                msg("Description"),
                "description",
                "textarea",
              )}
              ${this._renderField(msg("Source URL"), "source_url", "url")}
              ${this._saveError
                ? html`<p role="alert">${this._saveError}</p>`
                : ""}
              ${declarationFields(d, (key, value) =>
                this._handleEditField(key, value),
              )}

              <div class="edit-row-3">
                ${this._renderField(msg("Prep (min)"), "prep_time", "number")}
                ${this._renderField(msg("Cook (min)"), "cook_time", "number")}
                ${this._renderField(msg("Servings"), "servings", "number")}
              </div>

              <!-- Star rating picker -->
              <div class="edit-field">
                <label>${msg("Rating")}</label>
                <div class="edit-stars">
                  ${[1, 2, 3, 4, 5].map(
                    (n) => html`
                      <span
                        class="edit-star ${n <= (d.rating || 0)
                          ? "filled"
                          : ""}"
                        @click=${() =>
                          this._handleEditField(
                            "rating",
                            d.rating === n ? 0 : n,
                          )}
                        >★</span
                      >
                    `,
                  )}
                </div>
              </div>

              ${this._renderListPicker("tags", msg("Tags"), this.allTags)}
              ${this._renderListPicker(
                "courses",
                msg("Courses"),
                this.allCourses,
              )}
              ${this._renderListPicker(
                "categories",
                msg("Categories"),
                this.allCategories,
              )}
              ${this._renderListPicker(
                "collections",
                msg("Collections"),
                this.allCollections,
              )}
              ${this._renderField(msg("Notes"), "notes", "textarea")}

              <!-- Ingredients editor -->
              <div class="edit-section-label">
                ${msg(str`Ingredients (${(d.ingredients || []).length})`)}
              </div>
              ${(d.ingredients || []).length
                ? html`
                    <ul class="edit-ing-list">
                      ${(d.ingredients || []).map((ing, i) => {
                        const isEditing = this._editIngEdit?.idx === i;
                        const isHeading =
                          ing.is_heading || ing.name?.startsWith("#");
                        if (isEditing) {
                          const ee = this._editIngEdit;
                          return html`
                            <li
                              class="edit-ing-inline-edit ${isHeading
                                ? "edit-ing-heading"
                                : ""}"
                            >
                              ${ee.heading
                                ? html`
                                    <input
                                      class="ing-inline-input ing-inline-name"
                                      type="text"
                                      placeholder="${msg("Section header")}"
                                      .value=${ee.name}
                                      @input=${(e) => {
                                        this._editIngEdit = {
                                          ...ee,
                                          name: e.target.value,
                                        };
                                      }}
                                      @keydown=${(e) => {
                                        if (e.key === "Enter")
                                          this._saveEditIngredient();
                                        if (e.key === "Escape")
                                          this._cancelEditIngredient();
                                      }}
                                    />
                                  `
                                : html`
                                    <input
                                      class="ing-inline-input ing-inline-amt"
                                      type="text"
                                      placeholder="${msg("Amt")}"
                                      .value=${ee.amount}
                                      @input=${(e) => {
                                        this._editIngEdit = {
                                          ...ee,
                                          amount: e.target.value,
                                        };
                                      }}
                                      @keydown=${(e) => {
                                        if (e.key === "Enter")
                                          this._saveEditIngredient();
                                        if (e.key === "Escape")
                                          this._cancelEditIngredient();
                                      }}
                                    />
                                    <input
                                      class="ing-inline-input ing-inline-unit"
                                      type="text"
                                      placeholder="${msg("Unit")}"
                                      .value=${ee.unit}
                                      @input=${(e) => {
                                        this._editIngEdit = {
                                          ...ee,
                                          unit: e.target.value,
                                        };
                                      }}
                                      @keydown=${(e) => {
                                        if (e.key === "Enter")
                                          this._saveEditIngredient();
                                        if (e.key === "Escape")
                                          this._cancelEditIngredient();
                                      }}
                                    />
                                    <input
                                      class="ing-inline-input ing-inline-name"
                                      type="text"
                                      placeholder="${msg("Ingredient")}"
                                      .value=${ee.name}
                                      @input=${(e) => {
                                        this._editIngEdit = {
                                          ...ee,
                                          name: e.target.value,
                                        };
                                      }}
                                      @keydown=${(e) => {
                                        if (e.key === "Enter")
                                          this._saveEditIngredient();
                                        if (e.key === "Escape")
                                          this._cancelEditIngredient();
                                      }}
                                    />
                                  `}
                              <button
                                class="ing-inline-save"
                                @click=${this._saveEditIngredient}
                                title="${msg("Save")}"
                              >
                                <ha-icon icon="mdi:check"></ha-icon>
                              </button>
                              <button
                                class="ing-inline-cancel"
                                @click=${this._cancelEditIngredient}
                                title="${msg("Cancel")}"
                              >
                                <ha-icon icon="mdi:close"></ha-icon>
                              </button>
                            </li>
                          `;
                        }
                        return html`
                          <li
                            draggable="true"
                            class="${isHeading ? "edit-ing-heading" : ""} ${this
                              ._dragIngOver === i
                              ? "drag-over"
                              : ""}"
                            @dragstart=${(e) => {
                              this._dragIngFrom = i;
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", String(i));
                            }}
                            @dragover=${(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                              if (this._dragIngOver !== i)
                                this._dragIngOver = i;
                            }}
                            @dragleave=${() => {
                              if (this._dragIngOver === i)
                                this._dragIngOver = -1;
                            }}
                            @drop=${(e) => {
                              e.preventDefault();
                              this._editDropIngredient(this._dragIngFrom, i);
                            }}
                            @dragend=${() => {
                              this._dragIngOver = -1;
                              this._dragIngFrom = -1;
                            }}
                          >
                            <ha-icon
                              icon="mdi:drag-vertical"
                              class="drag-handle"
                            ></ha-icon>
                            <span
                              class="edit-ing-text"
                              @click=${() => this._startEditIngredient(i)}
                              title="${msg("Click to edit")}"
                            >
                              ${isHeading
                                ? html`<strong
                                    >${ing.name?.startsWith("#")
                                      ? ing.name.slice(1).trim()
                                      : ing.name}</strong
                                  >`
                                : html`${ing.amount
                                    ? `${ing.amount}${ing.unit ? " " + ing.unit : ""} `
                                    : ""}${ing.name}`}
                            </span>
                            <div class="edit-reorder-btns">
                              <button
                                class="edit-move-btn"
                                ?disabled=${i === 0}
                                @click=${() => this._editMoveIngredient(i, -1)}
                                title="${msg("Move up")}"
                              >
                                <ha-icon icon="mdi:chevron-up"></ha-icon>
                              </button>
                              <button
                                class="edit-move-btn"
                                ?disabled=${i === d.ingredients.length - 1}
                                @click=${() => this._editMoveIngredient(i, 1)}
                                title="${msg("Move down")}"
                              >
                                <ha-icon icon="mdi:chevron-down"></ha-icon>
                              </button>
                            </div>
                            <button
                              class="edit-remove-btn"
                              @click=${() => this._editRemoveIngredient(i)}
                            >
                              <ha-icon icon="mdi:close"></ha-icon>
                            </button>
                          </li>
                        `;
                      })}
                    </ul>
                  `
                : ""}
              <div class="edit-add-row">
                <input
                  type="text"
                  .value=${this._editIngInput}
                  @input=${(e) => {
                    this._editIngInput = e.target.value;
                  }}
                  @keydown=${(e) => {
                    if (e.key === "Enter") this._editAddIngredient();
                  }}
                  placeholder="${msg(
                    'e.g. "2 cups flour" or "# Section Header"',
                  )}"
                />
                <button class="edit-add-btn" @click=${this._editAddIngredient}>
                  ${msg("Add")}
                </button>
              </div>

              <!-- Instructions editor -->
              <div class="edit-section-label">
                ${msg(str`Directions (${(d.instructions || []).length} steps)`)}
              </div>
              ${(d.instructions || []).length
                ? html`
                    <ol class="edit-steps-list">
                      ${(d.instructions || []).map(
                        (step, i) => html`
                          <li
                            draggable="true"
                            class="${this._dragStepOver === i
                              ? "drag-over"
                              : ""}"
                            @dragstart=${(e) => {
                              this._dragStepFrom = i;
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", String(i));
                            }}
                            @dragover=${(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                              if (this._dragStepOver !== i)
                                this._dragStepOver = i;
                            }}
                            @dragleave=${() => {
                              if (this._dragStepOver === i)
                                this._dragStepOver = -1;
                            }}
                            @drop=${(e) => {
                              e.preventDefault();
                              this._editDropStep(this._dragStepFrom, i);
                            }}
                            @dragend=${() => {
                              this._dragStepOver = -1;
                              this._dragStepFrom = -1;
                            }}
                          >
                            <ha-icon
                              icon="mdi:drag-vertical"
                              class="drag-handle"
                            ></ha-icon>
                            <span class="edit-ing-text">${step}</span>
                            <div class="edit-reorder-btns">
                              <button
                                class="edit-move-btn"
                                ?disabled=${i === 0}
                                @click=${() => this._editMoveStep(i, -1)}
                                title="${msg("Move up")}"
                              >
                                <ha-icon icon="mdi:chevron-up"></ha-icon>
                              </button>
                              <button
                                class="edit-move-btn"
                                ?disabled=${i === d.instructions.length - 1}
                                @click=${() => this._editMoveStep(i, 1)}
                                title="${msg("Move down")}"
                              >
                                <ha-icon icon="mdi:chevron-down"></ha-icon>
                              </button>
                            </div>
                            <button
                              class="edit-remove-btn"
                              @click=${() => this._editRemoveStep(i)}
                            >
                              <ha-icon icon="mdi:close"></ha-icon>
                            </button>
                          </li>
                        `,
                      )}
                    </ol>
                  `
                : ""}
              <div class="edit-add-row">
                <textarea
                  rows="2"
                  .value=${this._editStepInput}
                  @input=${(e) => {
                    this._editStepInput = e.target.value;
                  }}
                  @keydown=${(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      this._editAddStep(this._editStepInput);
                      this._editStepInput = "";
                    }
                  }}
                  placeholder="${msg("Type a step, press Enter to add…")}"
                ></textarea>
                <button
                  class="edit-add-btn"
                  @click=${() => {
                    this._editAddStep(this._editStepInput);
                    this._editStepInput = "";
                  }}
                >
                  ${msg("Add")}
                </button>
              </div>

              <!-- Nutrition section -->
              <div class="edit-section-label">
                ${msg("Nutrition Facts (per serving)")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(msg("Calories (kcal)"), "cal", "number")}
                ${this._renderField(msg("Protein (g)"), "prot", "number")}
                ${this._renderField(msg("Fat (g)"), "fat", "number")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(msg("Saturated Fat (g)"), "satf", "number")}
                ${this._renderField(msg("Carbs (g)"), "carb", "number")}
                ${this._renderField(msg("Fiber (g)"), "fib", "number")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(msg("Sugar (g)"), "sug", "number")}
                ${this._renderField(msg("Sodium (mg)"), "sod", "number")}
                ${this._renderField(msg("Cholesterol (mg)"), "chol", "number")}
              </div>
            </div>
            <div class="edit-footer">
              <button
                class="action-btn danger-outline"
                @click=${this._handleDeleteRecipe}
                title="${this._confirmDelete
                  ? msg("Click again to confirm delete")
                  : msg("Delete recipe")}"
              >
                <ha-icon
                  icon="${this._confirmDelete
                    ? "mdi:alert"
                    : "mdi:trash-can-outline"}"
                ></ha-icon>
                ${this._confirmDelete ? msg("Confirm?") : msg("Delete")}
              </button>
              <div class="edit-footer-right">
                <button class="action-btn" @click=${this._cancelEdit}>
                  ${msg("Cancel")}
                </button>
                <button class="action-btn primary" @click=${this._saveEdit}>
                  ${msg("Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    _renderField(label, field, type) {
      const val = this._editData[field] ?? "";
      if (type === "textarea") {
        return html`
          <div class="edit-field">
            <label>${label}</label>
            <textarea
              .value=${val}
              @input=${(e) => this._handleEditField(field, e.target.value)}
              rows="3"
            ></textarea>
          </div>
        `;
      }
      return html`
        <div class="edit-field">
          <label>${label}</label>
          <input
            type="${type}"
            .value=${String(val)}
            @input=${(e) => this._handleEditField(field, e.target.value)}
          />
        </div>
      `;
    }
  };
