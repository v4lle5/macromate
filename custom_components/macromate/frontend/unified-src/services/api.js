/**
 * Recipe Manager WebSocket API service.
 * Mirrors the pattern from Shopping List Manager's api.js.
 */

import {numericAmount} from './amounts.js';

// ---------------------------------------------------------------------------
// SLM ingredient helpers
// ---------------------------------------------------------------------------

const _SLM_UNIT_RE = /^[½¼¾⅓⅔⅛⅜⅝⅞\d][\d.,/½¼¾⅓⅔⅛⅜⅝⅞\s]*\s*(?:tsp|tbsp|tablespoons?|teaspoons?|cups?|oz|lbs?|g|kg|ml|cl|dl|L|(?:milli|centi|deci)?lit(?:re|er)s?|kilo(?:gramme|gram)s?|(?:gramme|gram)s?|pints?|quarts?|gallons?|fl\.?\s*oz|cans?|bunches?|heads?|cloves?|slices?|pieces?|sheets?|pinch(?:es)?|dash(?:es)?|handfuls?|sprigs?|stalks?)\s*/i;

/**
 * Return a clean ingredient name suitable for an SLM item title.
 * When the Python parser failed to split a Unicode fraction (e.g. "½ tsp baking powder"
 * ended up as the full name), this strips the leading measurement so SLM gets
 * "Baking Powder" rather than "½ tsp baking powder".
 */
function _slmCleanName(ing) {
  // If the parser captured amount/unit separately, ing.name is already clean.
  if (ing.amount || ing.unit) return ing.name;
  // Otherwise try to strip an embedded measurement prefix.
  const cleaned = ing.name.replace(_SLM_UNIT_RE, '').trim();
  return cleaned || ing.name;
}

/**
 * Build the full ingredient string for the recipe note (amount + unit + name).
 * e.g. "1/2 tsp baking powder"
 */
function _slmIngString(ing, cleanName) {
  if (!ing.amount && !ing.unit) {
    // Name may already contain the measurement (malformed parse) — use as-is.
    return ing.name;
  }
  return [ing.amount, ing.unit, cleanName].filter(Boolean).join(' ');
}

/**
 * Build the "[RM] RecipeName — ½ tsp baking powder" note string.
 */
function _slmBuildNote(recipeName, ing, cleanName) {
  return `[RM] ${recipeName} \u2014 ${_slmIngString(ing, cleanName)}`;
}

export class RecipeManagerAPI {
  constructor(hass) {
    this.hass = hass;
  }

  // -- Subscription ---------------------------------------------------------

  subscribe(callback) {
    return this.hass.connection.subscribeMessage(callback, {
      type: 'recipe_manager/subscribe',
    });
  }

  // -- Recipes --------------------------------------------------------------

  async getAllRecipes() {
    return this.hass.callWS({ type: 'recipe_manager/recipes/get_all' });
  }

  async getRecipe(recipeId) {
    return this.hass.callWS({ type: 'recipe_manager/recipes/get', recipe_id: recipeId });
  }

  async scrapeRecipe(url, enabled = false) {
    return this.hass.callWS({ type: 'recipe_manager/recipes/scrape', url, enabled });
  }

  async addRecipe(data) {
    return this.hass.callWS({ type: 'recipe_manager/recipes/add', ...data });
  }

  async updateRecipe(recipeId, data) {
    return this.hass.callWS({ type: 'recipe_manager/recipes/update', recipe_id: recipeId, ...data });
  }

  async deleteRecipe(recipeId) {
    return this.hass.callWS({ type: 'recipe_manager/recipes/delete', recipe_id: recipeId });
  }

  async toggleFavourite(recipeId) {
    return this.hass.callWS({ type: 'recipe_manager/recipes/toggle_favourite', recipe_id: recipeId });
  }

  async downloadRecipeImage(recipeId, imageUrl) {
    if(!window.confirm('Allow MacroMate to download and privately normalize this remote image?'))throw {code:'invalid_request'};
    return this.hass.callWS({
      type: 'recipe_manager/recipes/download_image',
      recipe_id: recipeId,
      image_url: imageUrl,
      enabled: true,
    });
  }

  // -- Tags -----------------------------------------------------------------

  async getTags() {
    return this.hass.callWS({ type: 'recipe_manager/tags/get_all' });
  }

  // -- Meal Plan ------------------------------------------------------------

  async getMealPlan(weekStart) {
    const msg = { type: 'recipe_manager/meal_plan/get' };
    if (weekStart) msg.week_start = weekStart;
    return this.hass.callWS(msg);
  }

  async addToMealPlan(recipeId, date, mealType, servings = 1, notes = null) {
    const msg = {
      type: 'recipe_manager/meal_plan/add',
      recipe_id: recipeId,
      date,
      meal_type: mealType,
      servings,
    };
    if (notes) msg.notes = notes;
    return this.hass.callWS(msg);
  }

  async removeFromMealPlan(entryId) {
    return this.hass.callWS({ type: 'recipe_manager/meal_plan/remove', entry_id: entryId });
  }

  async clearMealPlanWeek(weekStart) {
    return this.hass.callWS({ type: 'recipe_manager/meal_plan/clear', week_start: weekStart, confirm: true });
  }

  // -- Shopping Manager cross-integration -----------------------------------

  /**
   * Legacy callers without a recipe ID use separate items, never name-only
   * read/modify/write merges. Atomic recipe/plan transfers are preferred.
   * Preflight the whole batch; an uncertain write stops it immediately.
   */
  async addIngredientsToShoppingList(listId, ingredients, recipeName = null) {
    const payloads = ingredients.map(ing => {
      const missing = ing.amount === null || ing.amount === undefined || ing.amount === '';
      const quantity = missing && (!ing.unit || ing.unit === 'units') ? 1 : numericAmount(ing.amount);
      if (quantity === null || quantity <= 0) throw new Error('Ingredient quantity is ambiguous or invalid. Use the atomic recipe transfer or an explicit quantity.');
      const name = ing.product_name ?? _slmCleanName(ing);
      const payload = {type: 'shopping_list_manager/items/add', list_id: listId,
        name, quantity, unit: ing.unit || 'units'};
      if (ing.product_id) payload.product_id = ing.product_id;
      if (ing.category_id) payload.category_id = ing.category_id;
      if (recipeName) payload.note = _slmBuildNote(recipeName, ing, _slmCleanName(ing));
      return payload;
    });
    const results = [];
    for (const payload of payloads) {
      const result = await this.hass.callWS(payload);
      results.push({success: true, name: payload.name, result});
    }
    return results;
  }

  async recipeToShopping(recipeId, listId, servings, ingredientIndexes, ingredientMatches = []) {
    if (ingredientMatches.length && !this.transport.actions.recipe_to_shopping?.schema?.properties?.ingredient_matches) {
      throw new Error('The server does not support exact catalog matching. Update MacroMate before transferring matched ingredients.');
    }
    const payload = {recipe_id:recipeId,list_id:listId,servings,ingredient_indexes:ingredientIndexes};
    if (ingredientMatches.length) payload.ingredient_matches = ingredientMatches;
    return this.transport.call('recipe_to_shopping',payload);
  }

  async updateSlmItem(itemId, data) {
    return this.hass.callWS({ type: 'shopping_list_manager/items/update', item_id: itemId, ...data });
  }

  async getShoppingLists() {
    return this.hass.callWS({ type: 'shopping_list_manager/lists/get_all' });
  }

  async getSlmItems(listId) {
    return this.hass.callWS({ type: 'shopping_list_manager/items/get', list_id: listId });
  }

  async checkSlmItem(itemId, checked) {
    return this.hass.callWS({ type: 'shopping_list_manager/items/check', item_id: itemId, checked });
  }

  async clearSlmChecked(listId) {
    return this.hass.callWS({ type: 'shopping_list_manager/items/clear_checked', list_id: listId });
  }

  async deleteSlmItem(itemId) {
    return this.hass.callWS({ type: 'shopping_list_manager/items/delete', item_id: itemId });
  }

  async addSlmItem(listId, data) {
    return this.hass.callWS({ type: 'shopping_list_manager/items/add', list_id: listId, ...data });
  }

  async getSlmCategories() {
    return this.hass.callWS({ type: 'shopping_list_manager/categories/get_all' });
  }

  async getSlmProductsByIds(ids) {
    return this.hass.callWS({ type: 'shopping_list_manager/products/get_by_ids', product_ids: ids });
  }

  async getSlmProductSuggestions(limit = 20) {
    return this.hass.callWS({ type: 'shopping_list_manager/products/suggestions', limit });
  }

  async searchSlmProducts(query, limit = 5) {
    return this.hass.callWS({ type: 'shopping_list_manager/products/search', query, limit });
  }

  // -- Global Timers --------------------------------------------------------

  async getGlobalTimers() {
    return this.hass.callWS({ type: 'recipe_manager/global_timers/get' });
  }

  async addGlobalTimer(data) {
    return this.hass.callWS({ type: 'recipe_manager/global_timers/add', ...data });
  }

  async updateGlobalTimer(timerId, data) {
    return this.hass.callWS({ type: 'recipe_manager/global_timers/update', timer_id: timerId, ...data });
  }

  async deleteGlobalTimer(timerId) {
    return this.hass.callWS({ type: 'recipe_manager/global_timers/delete', timer_id: timerId });
  }

  // -- Import ---------------------------------------------------------------

  /**
   * Import recipes from Recipe Keeper HTML content.
   * The caller extracts the HTML from the ZIP in the browser (via JSZip) and
   * sends only the text here to stay under the WebSocket message size limit.
   * Returns { imported, failed, recipe_images: [{recipe_id, image_filename}] }
   */
  async importRecipeKeeper(htmlContent) {
    return this.hass.callWS({
      type: 'recipe_manager/import/recipe_keeper',
      html_content: htmlContent,
    });
  }

  /**
   * Upload a single recipe image (base64-encoded) and save it locally.
   * Returns { image_url }
   */
  async uploadRecipeImage(recipeId, imageData) {
    return this.hass.callWS({
      type: 'recipe_manager/recipes/upload_image',
      recipe_id: recipeId,
      image_data: imageData,
    });
  }
}
