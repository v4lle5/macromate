// Child of tests/ha/native_unified_browser.py. No fixture RPC or mock success.
// Native HA auth arrives only via stdin/page memory. JSON stdout is the private
// control protocol; report/capture files contain only synthetic, non-auth data.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createInterface} from 'node:readline';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const deps=process.env.PLAYWRIGHT_DIR||resolve(process.env.FRONTEND_DEPS||'', 'node_modules');
const require=createRequire(resolve(deps,'package.json'));
const {chromium}=require('playwright');
const input=createInterface({input:process.stdin,crlfDelay:Infinity});
const lines=input[Symbol.asyncIterator]();
const cfg=JSON.parse((await lines.next()).value);
const control=async message=>{process.stdout.write(JSON.stringify(message)+'\n');const line=await lines.next();assert.ok(!line.done,'Controller disconnected');return JSON.parse(line.value).result;};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const rows=[],failures=[],screenshots=[],errors=[],external=[],consoleErrors=[];
let page;
const test=async(name,fn)=>{try{const actual=await fn();rows.push({name,status:'passed',actual:actual??null});return true;}catch(error){const path=resolve(cfg.output,'failure-'+name+'.png');if(page)await page.screenshot({path}).catch(()=>{});failures.push({name,error:error.message,stack:error.stack,screenshot:path});rows.push({name,status:'failed'});return false;}};
let recipeId,planId,listId,itemId,recipeDiaryId,quickId;
try{
 page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce',acceptDownloads:true});
 page.setDefaultTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 page.on('request',r=>{if(!/^(blob:|data:)/.test(r.url())&&new URL(r.url()).origin!==cfg.url)external.push(r.url());});
 await page.goto(cfg.url+'/native-card/');await page.waitForFunction(()=>window.ready);
 const connect=async index=>{await page.evaluate(options=>window.connectBackend(options),cfg.accounts[index]);await page.waitForFunction(()=>window.card?.api?.actions?.shopping_lists_get_all);};
 await connect(0);
 const view=async name=>{await page.getByRole('button',{name,exact:true}).click();};
 const store=async label=>control({op:'store',label});
 const agent=async(action,payload={},actor=0)=>control({op:'cli',action,payload,actor});
 const native=async(action,payload={})=>page.evaluate(({action,payload})=>window.nativeSend({type:'macromate/command',action,payload}),{action,payload});
 const command=async(action,payload={})=>{
  if(!await page.locator('mm-unified-app mm-commands').count())await view('All actions');
  const form=page.locator('mm-unified-app mm-commands');
  await form.getByLabel('Action',{exact:true}).selectOption(action);
  await form.evaluate(async(c,action)=>{await c.updateComplete;if(c.selected!==action)throw Error('Action selection changed');},action);
  for(const [key,value]of Object.entries(payload)){
   const label=key.replaceAll('_',' '),field=form.locator(`[aria-label="${label}"]`);
   if(value===null)await form.getByRole('button',{name:'Clear '+label,exact:true}).click();
   else if(typeof value==='boolean')await field.setChecked(value);
   else if(await field.evaluate(n=>n.tagName)==='SELECT')await field.selectOption(String(value));
   else await field.fill(typeof value==='object'?JSON.stringify(value):String(value));
  }
  await form.getByRole('button',{name:/^(Save|Read)$/,exact:true}).click();
  await form.evaluate(async c=>{const until=Date.now()+15000;while(Date.now()<until&&(c.busy||c.result===null&&!c.error))await new Promise(r=>setTimeout(r,30));if(c.error)throw Error(c.error);if(c.result===null)throw Error('No native result from '+c.selected);});
  return JSON.parse(await form.locator('pre').innerText());
 };
 await test('native-discovery-and-subscription',async()=>{
  await page.waitForFunction(()=>window.wire.some(m=>m.type==='macromate/subscribe'));
  const wire=await page.evaluate(()=>window.wire);
  assert.ok(wire.some(m=>m.type==='macromate/subscribe'));
  assert.ok(wire.some(m=>m.action==='describe'));
  return {actions:await page.evaluate(()=>Object.keys(card.api.actions).length),subscription:'macromate/subscribe'};
 });
 await test('manual-recipe-editor-create-edit-readback',async()=>{
  await view('New Recipe');await page.getByRole('button',{name:'Manual',exact:true}).click();
  const editor=page.locator('rm-add-recipe-dialog');
  await editor.getByPlaceholder('e.g. Spaghetti Bolognese').fill('Native browser soup');
  await editor.getByPlaceholder('4',{exact:true}).fill('2');
  await editor.getByLabel('Nutrition basis',{exact:true}).selectOption('per_serving');
  await editor.getByLabel('Declared calories (kcal)',{exact:true}).fill('240');
  await editor.getByLabel('Declared protein (g)',{exact:true}).fill('0');
  const ingredient=editor.getByPlaceholder('e.g. "2 cups flour", "salt", or "# Section"');
  await ingredient.fill('# Sauce');await ingredient.press('Enter');
  await ingredient.fill('40 g Oats');await ingredient.press('Enter');
  await editor.getByRole('button',{name:'Save Recipe',exact:true}).click();
  await page.waitForFunction(()=>card.application._view==='grid');
  const created=(await agent('recipes_get_all',{})).recipes.find(r=>r.name==='Native browser soup');
  assert.ok(created,'Manual form actually created a recipe');recipeId=created.id;
  assert.equal(created.declared_nutrition.calories,240);assert.equal(created.declared_nutrition.protein,0);
  assert.equal(created.servings,2);assert.equal(created.ingredients[0].is_heading,true);
  assert.equal(created.ingredients[1].amount,'40');
  const raw=(await store('ui-recipe-created')).kitchen.recipes[recipeId];assert.deepEqual(raw,created);
  await page.getByText('Native browser soup',{exact:true}).first().click();
  const detail=page.locator('rm-recipe-detail');await detail.getByRole('button',{name:'Edit',exact:true}).click();
  await detail.getByLabel('Declared calories (kcal)',{exact:true}).fill('260');
  await detail.getByRole('button',{name:'Save',exact:true}).click();
  await page.waitForFunction(()=>!card.application.shadowRoot.querySelector('rm-recipe-detail')?._editing);
  const edited=(await agent('recipes_get',{recipe_id:recipeId})).recipe;
  assert.equal(edited.declared_nutrition.calories,260);
  assert.deepEqual((await store('ui-recipe-edited')).kitchen.recipes[recipeId],edited);
  return {recipe_id:recipeId,calories:260,original_indexes:[0,1]};
 });
 await test('recipe-log-dedicated-form-native-store',async()=>{
  assert.ok(recipeId);
  const log=page.locator('mm-recipe-log');await log.getByRole('button',{name:'Log servings',exact:true}).click();
  await log.getByLabel('Recipe servings',{exact:true}).fill('1.5');
  await log.locator('select[name=meal_type]').selectOption('lunch');
  await log.locator('input[name=date]').fill('2026-10-14');
  await log.getByRole('button',{name:'Confirm and log',exact:true}).click();
  await log.getByRole('status').waitFor();
  const state=await store('ui-recipe-logged'),entry=state.entries.find(e=>e.recipe_id===recipeId);
  assert.ok(entry);recipeDiaryId=entry.id;assert.equal(entry.calories,390);assert.equal(entry.recipe_servings,1.5);
  assert.equal(entry.nutrients.protein,0);assert.equal(Object.hasOwn(entry.nutrients,'carbs'),false);
  assert.equal(entry.recipe_snapshot.id,recipeId);
  const {id,...storedFields}=entry;
  assert.deepEqual((await agent('diary',{date:'2026-10-14'})).entries.find(e=>e.entry_id===id),{...storedFields,entry_id:id});
  return {entry_id:entry.id,calories:390,unknown_carbs_preserved:true};
 });
 await test('schema-list-item-crud-native-readback',async()=>{
  const list=(await command('shopping_lists_create',{name:'Native UI groceries',private:true})).list;listId=list.id;
  await command('shopping_lists_update',{list_id:listId,name:'Native updated groceries'});
  assert.equal((await command('shopping_lists_get',{list_id:listId})).list.name,'Native updated groceries');
  itemId=(await command('shopping_items_add',{list_id:listId,name:'Native apples',quantity:2,price:1.5,currency:'EUR'})).item.id;
  await command('shopping_items_update',{item_id:itemId,quantity:3,price:null});
  const item=(await command('shopping_items_get_one',{item_id:itemId})).item;
  assert.equal(item.quantity,3);assert.equal(item.price,null);
  const {media_refs,...persistedItem}=item;
  assert.deepEqual(media_refs,{image_url:null,photos:[]},'Adapter-only media projection is explicit');
  const nativeItem=(await native('shopping_items_get_one',{item_id:itemId})).item;
  assert.deepEqual(nativeItem,persistedItem);
  assert.deepEqual((await store('ui-item-edited')).kitchen.shopping_items[itemId],nativeItem);
  await command('shopping_items_check',{item_id:itemId,checked:true});
  assert.equal((await store('ui-item-checked')).kitchen.shopping_items[itemId].checked,true);
  await command('shopping_items_check',{item_id:itemId,checked:false});
  return {list_id:listId,item_id:itemId,quantity:3,price:null,check_uncheck:true};
 });
 await test('schema-plan-crud-and-atomic-plan-shopping',async()=>{
  assert.ok(recipeId&&listId);
  planId=(await command('meal_plan_add',{recipe_id:recipeId,date:'2026-10-14',meal_type:'lunch',servings:1})).entry.id;
  await command('meal_plan_update',{entry_id:planId,servings:2,date:'2026-10-15'});
  const plan=(await command('meal_plan_get',{entry_id:planId})).entry;
  assert.equal(plan.servings,2);assert.equal(plan.date,'2026-10-15');
  const {recipe_name,recipe_image,...persistedPlan}=plan;
  assert.equal(recipe_name,'Native browser soup');assert.equal(recipe_image,null);
  assert.deepEqual((await store('ui-plan-edited')).kitchen.meal_plan[planId],persistedPlan);
  const before=(await store('ui-before-plan-shopping')).entries;
  const added=await command('plan_to_shopping',{week_start:'2026-10-12',list_id:listId});
  assert.deepEqual(added.plan_entry_ids,[planId]);
  const state=await store('ui-plan-shopping');assert.deepEqual(state.entries,before);
  assert.equal(state.kitchen.shopping_items[added.item_ids[0]].quantity,40);
  return {entry_id:planId,transfer:added,diary_unchanged:true};
 });
 await test('new-list-immediately-available-in-recipe-picker',async()=>{
  assert.ok(recipeId&&listId);
  await view('Home');await page.getByText('Native browser soup',{exact:true}).first().click();
  const detail=page.locator('rm-recipe-detail');
  await detail.getByRole('button',{name:'Add to shopping list',exact:true}).click();
  await detail.locator('.list-select').waitFor();
  const available=await detail.locator('.list-select option').evaluateAll(nodes=>nodes.map(n=>({id:n.value,name:n.textContent})));
  await writeFile(resolve(cfg.output,'recipe-picker-available-lists.json'),JSON.stringify({expected_list_id:listId,available},null,2));
  assert.ok(available.some(row=>row.id===listId),'Accepted schema-created list is missing from recipe picker: '+JSON.stringify({expected:listId,available}));
  return {expected:listId,available};
 });
 await test('dedicated-recipe-shopping-review-exact-index-catalog',async()=>{
  assert.ok(recipeId);
  // Use the original synthetic list so stale-new-list failure does not hide
  // independent proof of the real review/atomic transfer. No backend overrides.
  await view('Home');await page.getByText('Native browser soup',{exact:true}).first().click();
  const detail=page.locator('rm-recipe-detail');
  await detail.getByRole('button',{name:'Add to shopping list',exact:true}).click();
  await detail.getByRole('button',{name:'Select All',exact:true}).click();
  await detail.locator('.list-select').selectOption(cfg.shared_list_id);
  await detail.locator('.picker-btns button.primary').click();
  await detail.locator('.shopping-review-panel').waitFor();
  const matching=detail.locator('.review-chip:not(.manual)').first();
  assert.ok(await matching.count(),'Real product search offers a catalog match');await matching.click();
  const selection=await detail.evaluate(d=>{const row=d._shoppingReview[0];return {id:row.selectedId,product:row.products.find(p=>p.id===row.selectedId)};});
  const chosen=selection.id;
  assert.equal(selection.product.source,'catalog');
  assert.ok(chosen.startsWith(selection.product.region+':'),'Preserve exact region-qualified returned catalog ID');
  const before=(await store('ui-before-recipe-shopping')).entries;
  await detail.locator('.review-btns button.primary').click();
  await page.waitForFunction(()=>card.application.shadowRoot.querySelector('rm-recipe-detail')?._shoppingResult==='success');
  const sent=await page.evaluate(()=>window.wire.findLast(m=>m.action==='recipe_to_shopping'));
  assert.deepEqual(sent.payload.ingredient_indexes,[1]);
  assert.deepEqual(sent.payload.ingredient_matches,[{ingredient_index:1,product_id:chosen}]);
  const read=(await agent('shopping_items_get',{list_id:cfg.shared_list_id})).items.find(i=>i.product_id===chosen);
  assert.ok(read);assert.equal(read.quantity,40);assert.equal(read.unit,'g');
  const state=await store('ui-exact-recipe-shopping');assert.deepEqual(state.kitchen.shopping_items[read.id],read);
  assert.deepEqual(state.entries,before);
  return {request:sent,item:read,diary_unchanged:true};
 });
 await test('native-diary-quick-create-edit-copy-and-omission',async()=>{
  await view('Nutrition');const pane=page.locator('mm-nutrition');
  await pane.getByRole('button',{name:'Quick entry',exact:true}).click();
  const dialog=pane.getByRole('dialog');await dialog.locator('input[name=name]').fill('Native quick diary');
  await dialog.locator('input[name=calories]').fill('100');
  await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await pane.getByRole('button',{name:'Native quick diary edit',exact:true}).waitFor();
  let entry=(await store('ui-diary-created')).entries.find(e=>e.name==='Native quick diary');quickId=entry.id;
  assert.equal(entry.calories,100);assert.equal(Object.hasOwn(entry.nutrients,'protein'),false);
  await pane.getByRole('button',{name:'Native quick diary edit',exact:true}).click();
  await dialog.locator('input[name=calories]').fill('125');await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await page.waitForFunction(()=>!card.application.shadowRoot.querySelector('mm-nutrition').dialog?.open);
  entry=(await store('ui-diary-edited')).entries.find(e=>e.id===quickId);assert.equal(entry.calories,125);
  await pane.getByRole('button',{name:'Native quick diary copy',exact:true}).click();
  await dialog.getByRole('button',{name:'Copy',exact:true}).click();
  await page.waitForFunction(()=>!card.application.shadowRoot.querySelector('mm-nutrition').dialog?.open);
  const copies=(await store('ui-diary-copied')).entries.filter(e=>e.name==='Native quick diary');assert.equal(copies.length,2);
  assert.notEqual(copies[0].id,copies[1].id);
  return {entry_id:quickId,calories:125,copied_ids:copies.map(e=>e.id),omitted_protein:true};
 });
 await test('accepted-native-result-loss-explicit-stable-retry',async()=>{
  await view('Nutrition');const pane=page.locator('mm-nutrition');
  await page.evaluate(()=>window.dropNextAction='log_meal');
  await pane.getByRole('button',{name:'Quick entry',exact:true}).click();
  const dialog=pane.getByRole('dialog');await dialog.locator('input[name=name]').fill('Native uncertain diary');
  await dialog.locator('input[name=calories]').fill('73');await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await dialog.getByRole('button',{name:'Retry same request',exact:true}).waitFor();
  const committed=(await store('ui-native-lost-result')).entries.filter(e=>e.name==='Native uncertain diary');
  assert.equal(committed.length,1);const id=committed[0].id;
  await page.waitForTimeout(600);
  let writes=await page.evaluate(()=>window.wire.filter(m=>m.action==='log_meal'&&m.payload.name==='Native uncertain diary'));
  assert.equal(writes.length,1,'No automatic mutation retry');
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.locator('macromate-card').locator('.status').getByRole('button',{name:'Retry same request',exact:true}).click();
  await page.waitForFunction(()=>card.api.pending===null);
  const after=(await store('ui-native-stable-replay')).entries.filter(e=>e.name==='Native uncertain diary');
  assert.equal(after.length,1);assert.equal(after[0].id,id);
  writes=await page.evaluate(()=>window.wire.filter(m=>m.action==='log_meal'&&m.payload.name==='Native uncertain diary'));
  assert.equal(writes.length,2);assert.deepEqual(writes[0],writes[1]);assert.notEqual(id,writes[0].payload.request_id);
  return {entry_id:id,requests:writes,no_automatic_retry:true,accepted_result_loss:true};
 });
 await test('native-generic-event-live-agent-update',async()=>{
  await view('Nutrition');const before=await page.evaluate(()=>window.received.filter(m=>m.type==='event').length);
  const result=await agent('log_meal',{name:'Native agent live snack',meal_type:'snack',calories:37,request_id:'agent-live-update'});
  await page.locator('mm-nutrition').getByText('Native agent live snack',{exact:true}).waitFor();
  const events=await page.evaluate(before=>window.received.filter(m=>m.type==='event').slice(before),before);
  assert.ok(events.length);assert.ok(events.every(m=>JSON.stringify(m.event)==='{"event":"refresh"}'));
  assert.equal((await store('agent-live-store')).entries.find(e=>e.id===result.entry_id).calories,37);
  return {entry_id:result.entry_id,events,rendered_without_reload:true};
 });
 await test('private-native-media-rendered-owner-pixels',async()=>{
  await view('Home');await page.getByText('Synthetic private photo',{exact:true}).first().click();
  const img=page.locator('rm-recipe-detail img').first();await img.waitFor();
  await img.evaluate(async n=>{await n.decode();});const actual=await img.evaluate(n=>({src:n.src,width:n.naturalWidth,height:n.naturalHeight}));
  assert.ok(actual.src.startsWith('blob:'));assert.equal(actual.width,4);assert.equal(actual.height,4);
  return {...actual,authenticated_paths:await page.evaluate(()=>window.mediaRequests)};
 });
 await test('native-backup-ui-download-and-http-store-equality',async()=>{
  await view('Settings');const settings=page.locator('rm-settings-view');await settings.getByRole('button',{name:'Sync',exact:true}).click();
  const download=page.waitForEvent('download');await settings.getByRole('button',{name:'Download backup',exact:true}).click();
  const file=await download;const path=resolve(cfg.output,'downloaded-native-backup.json');await file.saveAs(path);
  const backup=JSON.parse(await readFile(path,'utf8')),state=await store('ui-download-backup');
  assert.deepEqual(backup.data,state);assert.equal(await settings.evaluate(s=>s._backupState),'done');
  const http=await control({op:'backup'});assert.deepEqual(http.data,state);
  return {path,filename:file.suggestedFilename(),data_equal_store:true,http_equal_store:true};
 });
 await test('native-http-restore-disposable-backup-roundtrip',async()=>{const result=await control({op:'restore_roundtrip'});assert.equal(result.status,200,JSON.stringify(result));assert.equal(result.stable_same_id_retry,true);return result;});
 await test('light-dark-desktop-mobile-ring-at-top',async()=>{
  const metrics=[];
  for(const [theme,mode]of [['soft','light'],['midnight','dark']]){
   await page.evaluate(theme=>{card.application._settings={...card.application._settings,theme};card.application._applyTheme();},theme);
   for(const width of [390,1280]){
    await page.setViewportSize({width,height:1000});await view('Nutrition');
    const pane=page.locator('mm-nutrition');await pane.locator('.calorie-ring').waitFor();
    await pane.evaluate(n=>{n.scrollTop=0;for(const el of n.shadowRoot.querySelectorAll('*'))if(el.scrollTop)el.scrollTop=0;});
    await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
    const actual=await pane.evaluate(n=>{const ring=n.shadowRoot.querySelector('.calorie-ring').getBoundingClientRect(),entry=n.shadowRoot.querySelector('.entry')?.getBoundingClientRect();return {ring_top:ring.top,ring_bottom:ring.bottom,first_entry_top:entry?.top,document_width:document.documentElement.scrollWidth,viewport:innerWidth};});
    assert.ok(actual.ring_top>=0&&actual.ring_bottom<1000,'Ring visible at top without scrolling');
    assert.ok(actual.ring_top<actual.first_entry_top,'Ring precedes meal entries');
    assert.ok(actual.document_width<=width+1,'No horizontal viewport overflow');
    const path=resolve(cfg.output,`native-combined-${mode}-${width}.png`);await page.screenshot({path});screenshots.push(path);metrics.push({theme,width,...actual});
   }
  }
  return metrics;
 });
 await test('ui-delete-exact-targets-and-recipe-snapshot',async()=>{
  assert.ok(recipeId&&planId&&itemId&&listId&&recipeDiaryId);
  await command('recipe_entry_update',{entry_id:recipeDiaryId,servings:2});
  assert.equal((await store('ui-recipe-diary-scale')).entries.find(e=>e.id===recipeDiaryId).calories,520);
  await command('meal_plan_remove',{entry_id:planId});
  assert.equal((await store('ui-plan-deleted')).kitchen.meal_plan[planId],undefined);
  await command('recipes_delete',{recipe_id:recipeId});
  let state=await store('ui-recipe-deleted');assert.equal(state.kitchen.recipes[recipeId],undefined);
  assert.equal(state.entries.find(e=>e.id===recipeDiaryId).recipe_snapshot.id,recipeId);
  await command('shopping_items_delete',{item_id:itemId});assert.equal((await store('ui-item-deleted')).kitchen.shopping_items[itemId],undefined);
  await command('shopping_lists_delete',{list_id:listId,confirm:true});state=await store('ui-list-deleted');assert.equal(state.kitchen.shopping_lists[listId],undefined);
  await view('Nutrition');const pane=page.locator('mm-nutrition');
  await pane.getByRole('button',{name:'Native uncertain diary delete',exact:true}).click();
  await pane.getByRole('dialog').getByRole('button',{name:'Confirm deletion',exact:true}).click();
  await page.waitForFunction(()=>!card.application.shadowRoot.querySelector('mm-nutrition').dialog?.open);
  assert.ok(!(await store('ui-diary-deleted')).entries.some(e=>e.name==='Native uncertain diary'));
  return {recipe_deleted:recipeId,plan_deleted:planId,item_deleted:itemId,list_deleted:listId,snapshot_retained:recipeDiaryId};
 });
 await test('native-member-shared-list-and-private-denial-context-clear',async()=>{
  await connect(1);
  await page.waitForFunction(()=>!document.querySelector('macromate-card').shadowRoot.textContent.includes('Native quick diary'));
  assert.equal(await page.locator('mm-nutrition').count(),0);assert.equal(await page.getByRole('button',{name:'New Recipe',exact:true}).count(),0);
  assert.equal(await page.getByText('Synthetic private photo',{exact:true}).count(),0);
  const list=await native('shopping_lists_get',{list_id:cfg.shared_list_id});assert.equal(list.list.id,cfg.shared_list_id);
  await assert.rejects(()=>native('diary',{}));await assert.rejects(()=>native('recipes_get_all',{}));
  const added=await native('shopping_items_add',{list_id:cfg.shared_list_id,name:'Native browser member pear',request_id:'browser-member-add'});
  assert.equal((await store('member-item')).kitchen.shopping_items[added.item.id].name,'Native browser member pear');
  const old=await page.evaluate(()=>window.received.filter(m=>m.type==='event').length);
  await agent('shopping_items_update',{item_id:added.item.id,name:'Native shared live pear',request_id:'owner-shared-edit'});
  await page.waitForFunction(old=>window.received.filter(m=>m.type==='event').length>old,old);
  const events=await page.evaluate(old=>window.received.filter(m=>m.type==='event').slice(old),old);assert.ok(events.every(m=>JSON.stringify(m.event)==='{"event":"refresh"}'));
  const privateBefore=await page.evaluate(()=>window.received.filter(m=>m.type==='event').length);
  await agent('recipes_add',{name:'Synthetic invisible private event',request_id:'private-event-owner'});
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(()=>window.received.filter(m=>m.type==='event').length),privateBefore,'Private owner write sends no member event');
  await assert.rejects(()=>native('shopping_lists_update_members',{list_id:cfg.shared_list_id,allowed_users:[],request_id:'forged-member-owner'}));
  await agent('shopping_lists_update_members',{list_id:cfg.shared_list_id,allowed_users:[],request_id:'owner-membership-revoke'});
  await assert.rejects(()=>native('shopping_items_add',{list_id:cfg.shared_list_id,name:'Native browser member pear',request_id:'browser-member-add'}));
  await assert.rejects(()=>native('shopping_lists_get',{list_id:cfg.shared_list_id}));
  return {member_item_id:added.item.id,private_dom_cleared:true,private_backend_denied:true,generic_events:events,private_event_count:0,revoked_access_and_replay_denied:true};
 });
 await test('native-reader-denials',async()=>{
  await connect(2);await assert.rejects(()=>native('diary',{}));await assert.rejects(()=>native('recipes_get_all',{}));
  await assert.rejects(()=>native('shopping_lists_get',{list_id:cfg.shared_list_id}));
  assert.equal(await page.locator('mm-nutrition').count(),0);return {reader_not_admin:true,private_denied:true};
 });
 await test('no-unhandled-errors-external-network',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);return {errors,external,console_errors:consoleErrors};});
} catch(error){failures.push({name:'browser-setup',error:error.message,stack:error.stack});}
finally{
 if(page){
  const wire=await page.evaluate(()=>({sent:window.wire,received:window.received,deliberately_dropped:window.dropped,media_paths:window.mediaRequests})).catch(()=>({}));
  await writeFile(resolve(cfg.output,'browser-native-captured.json'),JSON.stringify(wire,null,2));
  await page.evaluate(async()=>{card?.remove();await window.closeBackend?.();}).catch(()=>{});
 }
 cfg.accounts=[];
 await browser.close();input.close();
 const report={ok:failures.length===0,rows,failures,screenshots,page_errors:errors,external_requests:external,
               console_errors:consoleErrors,evidence_tier:'native-authenticated-HA-synthetic-isolated',lovelace_editor:false,physical_devices:false};
 await writeFile(resolve(cfg.output,'browser-report.json'),JSON.stringify(report,null,2));
 process.stdout.write(JSON.stringify({op:'done',report})+'\n');
}
