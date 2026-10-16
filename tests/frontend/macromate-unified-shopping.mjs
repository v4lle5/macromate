// Shopping is deliberately retired from the UI; backend retention is separate.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {RecipeManagerAPI} from '../../frontend/unified-src/services/api.js';
const api=new RecipeManagerAPI({});
for(const name of ['getShoppingLists','addIngredientsToShoppingList','recipeToShopping','searchSlmProducts'])assert.equal(typeof api[name],'undefined');
const source=await readFile(new URL('../../frontend/unified-src/recipe-manager-card.js',import.meta.url),'utf8');
assert.ok(!source.includes('components/shopping.js'));
assert.ok(!source.includes('_loadShoppingLists'));
console.log('PASS: retired shopping UI and transfer bridges are physically absent; no stored data is modified');
