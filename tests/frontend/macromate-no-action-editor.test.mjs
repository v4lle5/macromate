import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('generic action editor is not imported or navigable; dedicated domains remain',async()=>{
 const source=await readFile(new URL('../../frontend/unified-src/recipe-manager-card.js',import.meta.url),'utf8');
 for(const text of ['components/commands.js','mm-commands','Alle Aktionen','All actions'])assert.ok(!source.includes(text),text);
 for(const text of ['mm-nutrition','rm-meal-planner','rm-settings-view','_renderTimersView'])assert.ok(source.includes(text),text);
});
