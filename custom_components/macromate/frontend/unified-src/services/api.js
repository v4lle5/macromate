/**
 * Recipe Manager WebSocket API service.
 */

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
