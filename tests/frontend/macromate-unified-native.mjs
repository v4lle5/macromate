// Child of tests/ha/native_unified_browser.py. No fixture RPC or mock success.
// Native HA auth arrives only via stdin/page memory. JSON stdout is the private
// control protocol; report/capture files contain only synthetic, non-auth data.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createInterface} from 'node:readline';
import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
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
const test=async(name,fn)=>{try{const actual=await fn();rows.push({name,status:'passed',actual:actual??null});return true;}catch(error){const path=resolve(cfg.output,'failure-'+name+'.png');if(page)await (browser.contexts().flatMap(c=>c.pages()).at(-1)||page).screenshot({path}).catch(()=>{});failures.push({name,error:error.message,stack:error.stack,screenshot:path});rows.push({name,status:'failed'});return false;}};
let recipeId,planId,listId,itemId,recipeDiaryId,quickId;
try{
 page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce',acceptDownloads:true});
 page.setDefaultTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 page.on('request',r=>{if(!/^(blob:|data:)/.test(r.url())&&new URL(r.url()).origin!==cfg.url)external.push(r.url());});
 await page.goto(cfg.url+'/native-card/');await page.waitForFunction(()=>window.ready);
 const connect=async index=>{await page.evaluate(options=>window.connectBackend(options),cfg.accounts[index]);await page.waitForFunction(()=>window.card?.api?.actions?.describe);};
 await connect(0);
 const view=async name=>{await page.getByRole('button',{name,exact:true}).click();};
 const store=async label=>control({op:'store',label});
 const agent=async(action,payload={},actor=0)=>control({op:'cli',action,payload,actor});
 const native=async(action,payload={})=>page.evaluate(({action,payload})=>window.nativeSend({type:'macromate/command',action,payload}),{action,payload});
 // API coverage stays explicit; mutations here are not attributed to removed UI forms.
 const command=async(action,payload={})=>page.evaluate(({action,payload})=>card.api.call(action,payload),{action,payload});
 await test('native-published-frontend-upgrade-same-browser',async()=>{
  const upgrade=await browser.newPage({viewport:{width:1280,height:850},reducedMotion:'reduce'});
  let old=true;const loaded=[];
  await upgrade.route('**/macromate-assets/**',async route=>{
   if(!old)return route.continue();
   const path=new URL(route.request().url()).pathname.replace('/macromate-assets/','frontend/');
   const result=spawnSync('git',['show','e7cb3f1:'+path],{maxBuffer:8*1024*1024});
   if(result.status!==0)return route.abort();loaded.push(path);
   await route.fulfill({status:200,contentType:path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'application/octet-stream',body:result.stdout});
  });
  await upgrade.goto(cfg.url+'/native-card/');await upgrade.waitForFunction(()=>window.ready);
  await upgrade.evaluate(options=>window.connectBackend(options),cfg.accounts[0]);
  await upgrade.waitForFunction(()=>card.application&&!card.application._loading);
  const stale=await upgrade.evaluate(()=>({error:card.application._error,shopping:wire.filter(m=>m.action?.startsWith('shopping_')).map(m=>m.action),pending:card.api.pending}));
  assert.equal(stale.error,null,'Historical shopping read failure is swallowed, not the Start error root cause');assert.ok(stale.shopping.length);assert.equal(stale.pending,null);
  await upgrade.evaluate(async()=>{window.dropNextAction='recipes_get_all';await card.application._init();});
  const forcedStart=await upgrade.evaluate(()=>card.application._error);
  assert.equal(forcedStart,'The operation could not be completed.');
  await upgrade.evaluate(()=>{card.application._error=null;});
  // Deliberately lose only a native READ reply: historical UI incorrectly says write status uncertain.
  await upgrade.evaluate(()=>{window.dropNextAction='diary';card.application._view='nutrition';});
  await upgrade.waitForFunction(()=>card.application.shadowRoot.querySelector('mm-nutrition')?.message?.textContent);
  const oldRead=await upgrade.evaluate(()=>card.application.shadowRoot.querySelector('mm-nutrition').message.textContent);
  assert.equal(await upgrade.evaluate(()=>card.api.pending),null);
  old=false;
  const delivery=JSON.parse(await readFile(resolve('frontend/delivery-manifest.json')));
  await upgrade.evaluate(async url=>{await import(url);},delivery.entry);
  assert.ok((await upgrade.locator('#macromate-delivery-status').innerText()).includes('registration_conflict'));
  await upgrade.evaluate(()=>window.closeBackend());await upgrade.reload();await upgrade.waitForFunction(()=>window.ready);
  await upgrade.evaluate(options=>window.connectBackend(options),cfg.accounts[0]);
  await upgrade.waitForFunction(()=>card.application&&!card.application._loading);
  assert.equal(await upgrade.evaluate(()=>card.application._error),null);
  assert.equal(await upgrade.evaluate(()=>wire.some(m=>m.action?.startsWith('shopping_'))),false);
  assert.equal(await upgrade.getByRole('button',{name:'All actions',exact:true}).count(),0);
  await upgrade.evaluate(()=>{window.dropNextAction='diary';card.application._view='nutrition';});
  await upgrade.waitForFunction(()=>card.application.shadowRoot.querySelector('mm-nutrition')?.message?.textContent);
  const currentRead=await upgrade.evaluate(()=>card.application.shadowRoot.querySelector('mm-nutrition').message.textContent);
  assert.ok(!/Schreibstatus|write.*uncertain/i.test(currentRead));assert.equal(await upgrade.evaluate(()=>card.api.pending),null);
  await upgrade.evaluate(()=>window.closeBackend());await upgrade.close();
  return {published:'e7cb3f1',transport:'native HA WS',assetDelivery:'pinned old assets delivered by Playwright route; module cache retained until reload',stale,forcedStart,oldRead,currentRead,revision:delivery.revision,loaded:loaded.length};
 });
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
 await test('native-diary-quick-create-edit-copy-and-omission',async()=>{
  await view('Nutrition');const pane=page.locator('mm-nutrition');
  await pane.locator('input[type=search]').fill('Native quick diary');
  await pane.getByRole('button',{name:'Quick entry',exact:true}).click();
  const dialog=pane.getByRole('dialog');
  await dialog.locator('input[name=calories]').fill('100');
  await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await pane.getByRole('button',{name:'Native quick diary edit',exact:true}).waitFor();
  let entry=(await store('ui-diary-created')).entries.find(e=>e.name==='Native quick diary');quickId=entry.id;
  assert.equal(entry.calories,100);assert.equal(Object.hasOwn(entry.nutrients,'protein'),false);
  await pane.getByRole('button',{name:'Native quick diary edit',exact:true}).click();
  await dialog.locator('input[name=calories]').fill('125');await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await page.waitForFunction(()=>!card.application.shadowRoot.querySelector('mm-nutrition').dialog?.open);
  entry=(await store('ui-diary-edited')).entries.find(e=>e.id===quickId);assert.equal(entry.calories,125);
  await page.waitForFunction(()=>{const pane=card.application.shadowRoot.querySelector('mm-nutrition');return !pane.diaryBusy&&!pane.refreshTimer&&!pane.refreshQueued;});
  await pane.getByRole('button',{name:'Native quick diary copy',exact:true}).click();
  if(!await dialog.isVisible())await pane.getByRole('button',{name:'Native quick diary copy',exact:true}).click(); // Re-open only; never repeat the mutation submit.
  await dialog.getByRole('button',{name:'Copy',exact:true}).click();
  await page.waitForFunction(()=>!card.application.shadowRoot.querySelector('mm-nutrition').dialog?.open);
  const copies=(await store('ui-diary-copied')).entries.filter(e=>e.name==='Native quick diary');assert.equal(copies.length,2);
  assert.notEqual(copies[0].id,copies[1].id);
  return {entry_id:quickId,calories:125,copied_ids:copies.map(e=>e.id),omitted_protein:true};
 });
 await test('accepted-native-result-loss-explicit-stable-retry',async()=>{
  await view('Nutrition');const pane=page.locator('mm-nutrition');
  await page.evaluate(()=>window.dropNextAction='log_meal');
  await pane.locator('input[type=search]').fill('Native uncertain diary');
  await pane.getByRole('button',{name:'Quick entry',exact:true}).click();
  const dialog=pane.getByRole('dialog');
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
  assert.ok(recipeId&&recipeDiaryId);
  await command('recipe_entry_update',{entry_id:recipeDiaryId,servings:2});
  assert.equal((await store('ui-recipe-diary-scale')).entries.find(e=>e.id===recipeDiaryId).calories,520);
  await command('recipes_delete',{recipe_id:recipeId});
  let state=await store('ui-recipe-deleted');assert.equal(state.kitchen.recipes[recipeId],undefined);
  assert.equal(state.entries.find(e=>e.id===recipeDiaryId).recipe_snapshot.id,recipeId);
  await view('Nutrition');const pane=page.locator('mm-nutrition');
  await pane.getByRole('button',{name:'Native uncertain diary delete',exact:true}).click();
  await pane.getByRole('dialog').getByRole('button',{name:'Confirm deletion',exact:true}).click();
  await page.waitForFunction(()=>!card.application.shadowRoot.querySelector('mm-nutrition').dialog?.open);
  assert.ok(!(await store('ui-diary-deleted')).entries.some(e=>e.name==='Native uncertain diary'));
  return {recipe_deleted:recipeId,snapshot_retained:recipeDiaryId};
 });
 await test('native-weight-sensor-fallback-visible-not-live',async()=>{
  await view('Nutrition');
  const result=await control({op:'weight_source',state:'unavailable'});
  assert.equal(result.weight_source,'profile');assert.equal(result.weight_kg,80);
  await page.locator('mm-nutrition').getByText(/Weight sensor unavailable.*Saved profile weight.*80.*not live/).waitFor();
  await control({op:'weight_source',state:'80'});
  await page.locator('mm-nutrition .weight-fallback').waitFor({state:'detached'});
  return {fallback_kg:80,labelled_not_live:true};
 });
 await test('native-member-private-denial-context-clear',async()=>{
  await connect(1);
  await page.waitForFunction(()=>!document.querySelector('macromate-card').shadowRoot.textContent.includes('Native quick diary'));
  assert.equal(await page.locator('mm-nutrition .calorie-ring').count(),0);assert.equal(await page.getByRole('button',{name:'New Recipe',exact:true}).count(),0);
  assert.equal(await page.getByText('Synthetic private photo',{exact:true}).count(),0);
  return {private_dom_cleared:true,shopping_ui_removed:true,private_backend_denied:true};
 });
 await test('native-reader-denials',async()=>{
  await connect(2);await assert.rejects(()=>native('diary',{}));await assert.rejects(()=>native('recipes_get_all',{}));
  await assert.rejects(()=>native('shopping_lists_get_all',{}));
  assert.equal(await page.locator('mm-nutrition .calorie-ring').count(),0);return {reader_not_admin:true,private_denied:true};
 });
 await test('native-household-profile-ui-owner-report-and-revocation',async()=>{
  await connect(0);
  await view('Nutrition');
  let pane=page.locator('mm-nutrition');
  await pane.getByRole('button',{name:'Nutrition options',exact:true}).click();
  await pane.getByRole('button',{name:'Add person',exact:true}).click();
  const dialog=pane.getByRole('dialog');
  await dialog.locator('input[name=profile_name]').fill('Synthetic household person');
  await dialog.getByLabel('Owner',{exact:true}).selectOption(cfg.accounts[1].user.id);
  await dialog.locator('input[name=birthday]').fill('1990-07-23');
  await dialog.locator('input[name=height_cm]').fill('180');
  await dialog.locator('input[name=weight_kg]').fill('80');
  await dialog.locator('input[name=target_weight_kg]').fill('80');
  await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await dialog.waitFor({state:'detached'});
  const profileId=await pane.locator('select[name=nutrition_profile]').inputValue();
  assert.notEqual(profileId,'default');
  await connect(1);pane=page.locator('mm-nutrition');
  await pane.locator('[data-testid=diary]').waitFor();
  assert.equal(await pane.locator('select[name=nutrition_profile]').inputValue(),profileId);
  await pane.locator('input[type=search]').fill('Person-specific diary entry');
  await pane.getByRole('button',{name:'Quick entry',exact:true}).click();
  await pane.getByRole('dialog').locator('input[name=calories]').fill('321');
  await pane.getByRole('dialog').getByRole('button',{name:'Save',exact:true}).click();
  await pane.locator('.entry').getByText('Person-specific diary entry',{exact:true}).waitFor();
  await pane.getByText('Reports',{exact:true}).click();
  await pane.getByRole('button',{name:'Week',exact:true}).click();
  await pane.locator('[data-testid=nutrition-report] table').waitFor();
  assert.match(await pane.locator('[data-testid=nutrition-report]').innerText(),/321/);
  const stored=await store('household-person-entry');
  assert.ok(stored.profiles[profileId].data.entries.some(row=>row.name==='Person-specific diary entry'));
  assert.ok(!stored.entries.some(row=>row.name==='Person-specific diary entry'));
  const outsider=await agent('profiles_list',{},2);
  assert.equal(outsider.profiles.length,0);
  await agent('profiles_update',{profile_id:profileId,owner_id:cfg.accounts[0].user.id,allowed_users:[],request_id:'household-revoke'});
  await pane.locator('.entry').getByText('Person-specific diary entry',{exact:true}).waitFor({state:'hidden'});
  await assert.rejects(()=>native('diary',{profile_id:profileId}));
  await connect(0);
  return {profile_created_in_ui:true,owner_native_ui_write:true,calendar_report:true,default_diary_unchanged:true,revocation_clears_private_dom:true};
 });
 await test('native-lovelace-panel-view-auto-module-layout-and-cleanup',async()=>{
  const dashboard=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const dashboardErrors=[],dashboardExternal=[],dashboardActions=[],scrollMetrics=[];
  dashboard.on('request',r=>{if(!/^(blob:|data:)/.test(r.url())&&new URL(r.url()).origin!==cfg.url)dashboardExternal.push(r.url());});
  await dashboard.route('**/*',async route=>{
   const request=route.request(),url=request.url();
   if(!/^(blob:|data:)/.test(url)&&new URL(url).origin!==cfg.url){
    assert.equal(request.headers().authorization,undefined,'Never forward HA credentials outside loopback');
    return route.abort(); // HA's built-in picker previews include public demo images.
   }
   return route.continue();
  });
  dashboard.on('pageerror',e=>dashboardErrors.push({message:e.message,stack:e.stack}));
  dashboard.on('websocket',socket=>{const sent=new Map();socket.on('framesent',({payload})=>{try{const m=JSON.parse(payload);if(m.id)sent.set(m.id,m.type);if(m.action)dashboardActions.push(m.action);}catch{}});socket.on('framereceived',({payload})=>{try{const m=JSON.parse(payload);if(m.success===false)dashboardErrors.push({type:sent.get(m.id),error:m.error});}catch{}});});
  await dashboard.addInitScript(({url,token})=>localStorage.setItem('hassTokens',JSON.stringify({
   access_token:token,token_type:'Bearer',expires_in:1800,expires:Date.now()+1800000,
   hassUrl:url,clientId:url+'/',refresh_token:'unused-synthetic-test-refresh'
  })),{url:cfg.url,token:cfg.accounts[0].token});
  await dashboard.goto(cfg.url+'/dashboard-native/macromate');
  try{await dashboard.locator('hui-panel-view macromate-card mm-unified-app').waitFor();}catch(error){
   await dashboard.screenshot({path:resolve(cfg.output,'native-dashboard-failure.png')});
   await writeFile(resolve(cfg.output,'native-dashboard-errors.json'),JSON.stringify({errors:dashboardErrors,text:await dashboard.locator('body').innerText()},null,2));
   throw error;
  }
  assert.equal(await dashboard.locator('macromate-card').getByRole('button',{name:'Shopping List',exact:true}).count(),0,'Internal shopping UI has been removed, not replaced with Bring');
  await dashboard.locator('macromate-card').getByRole('button',{name:'Settings',exact:true}).click();
  const settingsPane=dashboard.locator('rm-settings-view');
  await settingsPane.locator('select').first().selectOption('de');
  await dashboard.waitForTimeout(700);
  const settingsDiagnostic=await dashboard.locator('macromate-card').evaluate(c=>({pending:c.api.pending,error:c.application._error,settings:c.application._settings}));
  await writeFile(resolve(cfg.output,'settings-diagnostic.json'),JSON.stringify({state:settingsDiagnostic,errors:dashboardErrors},null,2));
  assert.equal(settingsDiagnostic.pending,null,'Native settings save must be acknowledged: '+JSON.stringify(settingsDiagnostic));
  assert.equal((await settingsPane.locator('option[value=neon]').textContent()).trim(),'🍇 Lila & Cyan');
  assert.equal((await settingsPane.locator('.section-label').first().textContent()).trim(),'Sprache & Einheiten');
  await settingsPane.getByRole('button',{name:'Metrisch',exact:true}).click();
  await dashboard.waitForTimeout(500);
  await settingsPane.locator('select').nth(1).selectOption('neon');
  await dashboard.waitForTimeout(500);
  const preferences=(await agent('preferences_get')).preferences.recipe_settings;
  assert.equal(preferences.language,'de');assert.equal(preferences.theme,'neon');assert.equal(preferences.unitSystem,'metric');
  assert.deepEqual((await store('native-settings-saved')).kitchen.preferences[cfg.accounts[0].user.id].ui.recipe_settings,preferences);
  assert.equal(await dashboard.locator('macromate-card').evaluate(c=>c.api.pending),null);
  const beforeRefusal=await store('before-invalid-settings');
  const refusedSettings=await dashboard.locator('macromate-card').evaluate(async c=>{try{await c.api.call('preferences_update',{preferences:'invalid-synthetic-shape'});}catch(e){return {code:e.code,pending:c.api.pending,diagnostic:c.api.lastFailure};}throw Error('Invalid settings accepted');});
  assert.equal(refusedSettings.code,'invalid_request');assert.equal(refusedSettings.pending,null);
  assert.deepEqual(await store('after-invalid-settings'),beforeRefusal,'Definitive native refusal performs no mutation');
  await dashboard.locator('macromate-card').evaluate(c=>{
   const original=c.api.hass.callWS.bind(c.api.hass);window.settingsWire=[];window.settingsLose=true;
   c.api.hass.callWS=async message=>{if(message.action==='preferences_update')window.settingsWire.push(structuredClone(message));const result=await original(message);if(message.action==='preferences_update'&&window.settingsLose){window.settingsLose=false;throw Error('Synthetic loss after actual native commit');}return result;};
  });
  await settingsPane.locator('select').nth(1).selectOption('ocean');
  const banner=dashboard.locator('macromate-card .status');
  await banner.getByText('Speicherstatus unklar. Keine neue Anfrage erstellen.',{exact:true}).waitFor();
  assert.equal(await dashboard.locator('mm-unified-app').evaluate(c=>c._error),'Speicherstatus unklar. Gleiche Anfrage nur ausdrücklich erneut senden.');
  await dashboard.waitForTimeout(150); // The card measures its new top after two animation frames.
  const uncertainBounds=await dashboard.locator('mm-unified-app').boundingBox();const layoutDiagnostic=await dashboard.locator('mm-unified-app').evaluate(el=>{const out=[];for(let n=el;n;n=n.parentElement||n.getRootNode().host){const s=getComputedStyle(n),r=n.getBoundingClientRect();out.push({tag:n.tagName,classes:n.className,top:r.top,height:r.height,inline:n.getAttribute('style'),heightStyle:s.height,minHeight:s.minHeight,maxHeight:s.maxHeight,flex:s.flex,display:s.display,box:s.boxSizing,padding:s.padding,border:s.borderWidth});}return out;});await writeFile(resolve(cfg.output,'pending-layout.json'),JSON.stringify(layoutDiagnostic,null,2));assert.ok(uncertainBounds.y+uncertainBounds.height<=900,'Pending-write banner must share, not extend, the panel viewport: '+JSON.stringify(uncertainBounds));
  assert.equal((await agent('preferences_get')).preferences.recipe_settings.theme,'ocean','Lost response really committed through native WS');
  await dashboard.waitForTimeout(300);
  assert.equal(await dashboard.evaluate(()=>settingsWire.length),1,'No automatic retries');
  const retryTarget=await banner.getByRole('button',{name:'Gleiche Anfrage erneut senden',exact:true}).boundingBox();
  assert.ok(retryTarget.height>=44&&retryTarget.width>=44,'Retry target must be at least 44px: '+JSON.stringify(retryTarget));
  await banner.getByRole('button',{name:'Gleiche Anfrage erneut senden',exact:true}).click();
  await dashboard.locator('macromate-card').evaluate(async c=>{const end=Date.now()+10000;while(c.api.pending&&Date.now()<end)await new Promise(r=>setTimeout(r,20));if(c.api.pending)throw Error('Replay did not clear pending');});
  const settingsWire=await dashboard.evaluate(()=>window.settingsWire);assert.equal(settingsWire.length,2);assert.deepEqual(settingsWire[0],settingsWire[1]);
  assert.equal((await store('native-settings-explicit-replay')).kitchen.preferences[cfg.accounts[0].user.id].ui.recipe_settings.theme,'ocean');
  assert.equal(await settingsPane.locator('option[value=glass-wave]').count(),1,'Glass Wave is an opt-in choice alongside the existing themes');
  assert.equal((await settingsPane.locator('option[value=glass-wave]').textContent()).trim(),'Glass Wave');
  await settingsPane.locator('select').nth(1).selectOption('glass-wave');
  await dashboard.waitForTimeout(400);
  assert.equal((await agent('preferences_get')).preferences.recipe_settings.theme,'glass-wave');
  const glassState=await store('glass-wave-native');
  assert.equal(glassState.kitchen.preferences[cfg.accounts[0].user.id].ui.recipe_settings.theme,'glass-wave');
  const glassRequest=await dashboard.evaluate(()=>settingsWire.findLast(m=>m.payload.preferences?.recipe_settings?.theme==='glass-wave'));
  await agent('preferences_update',glassRequest.payload);
  assert.deepEqual(await store('glass-wave-explicit-http-replay'),glassState,'Exact UUID replay across native WS and HTTP leaves Store unchanged');
  const glass=await dashboard.locator('mm-unified-app').evaluate(el=>{const s=getComputedStyle(el);return {accent:s.getPropertyValue('--rm-accent').trim(),text:s.getPropertyValue('--rm-text').trim(),main:s.getPropertyValue('--rm-bg-main').trim(),surface:s.getPropertyValue('--rm-bg-surface').trim()};});
  const glassControl=await settingsPane.locator('.seg-btn.active').first().evaluate(el=>({color:getComputedStyle(el).color,height:el.getBoundingClientRect().height}));
  assert.equal(glassControl.color,'rgb(255, 255, 255)');assert.ok(glassControl.height>=44,'Glass Wave segmented controls need touch-sized targets');
  assert.deepEqual(glass,{accent:'#416F8F',text:'#263B47',main:'rgba(253, 248, 239, 0.90)',surface:'rgba(253, 248, 239, 0.94)'});
  for(const width of [1280,390]){await dashboard.setViewportSize({width,height:900});await dashboard.screenshot({path:resolve(cfg.output,`glass-wave-settings-${width}.png`)});}
  await dashboard.setViewportSize({width:1280,height:900});
  await settingsPane.locator('select').first().selectOption('en');
  await dashboard.waitForTimeout(700);
  for(const name of ['Meal Planner','Timers','Nutrition','Home']){
   const button=dashboard.locator('macromate-card').getByRole('button',{name,exact:true});
   await button.click();
   if(name==='Meal Planner'){
    await dashboard.setViewportSize({width:390,height:844});
    const add=dashboard.locator('rm-meal-planner .add-slot-btn').first();
    const target=await add.boundingBox();
    assert.ok(target.height>=44&&target.width>=44,'Planner add target must be at least 44px: '+JSON.stringify(target));
    await add.click();
    await dashboard.locator('rm-meal-planner').evaluate(el=>{el._pickerOpen=false;el.requestUpdate();});
    await dashboard.setViewportSize({width:1280,height:900});
   }
  }
  await dashboard.screenshot({path:resolve(cfg.output,'native-lovelace-panel-desktop.png')});
  for(let i=0;i<16;i++)await agent('log_meal',{name:`Panel scroll meal ${i}`,calories:10,meal_type:'snack',request_id:`panel-scroll-${i}`});
  for(const [width,height] of [[1280,900],[390,844],[844,390]]){
   await dashboard.setViewportSize({width,height});await dashboard.waitForTimeout(400);
   const bounds=await dashboard.locator('macromate-card mm-unified-app').evaluate(el=>{
    const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:r.height,viewport:innerHeight};
   });
   assert.ok(bounds.bottom<=bounds.viewport+2,'Panel card must fit the available HA viewport: '+JSON.stringify(bounds));
   assert.ok(bounds.width<=width,'No horizontal clipping');
   await dashboard.locator('macromate-card').getByRole('button',{name:'Nutrition',exact:true}).click();
   await dashboard.locator('mm-nutrition [data-testid="diary"]').waitFor();
   await dashboard.locator('mm-nutrition').getByText('Panel scroll meal 15',{exact:true}).waitFor();
   const paneBounds=await dashboard.locator('mm-nutrition').boundingBox();
   await dashboard.screenshot({path:resolve(cfg.output,`glass-wave-nutrition-top-${width}.png`)});
   const metric={width,height,pane:paneBounds};scrollMetrics.push(metric);
   await dashboard.mouse.move(paneBounds.x+paneBounds.width/2,Math.min(height-40,paneBounds.y+150));
   const bottom=dashboard.locator('mm-nutrition .entry').last().getByRole('button',{name:/ edit$/});
   for(let i=0;i<50;i++){const r=await bottom.boundingBox();if(r.y>=paneBounds.y&&r.y+r.height<=Math.min(height,paneBounds.y+paneBounds.height)-20)break;await dashboard.mouse.wheel(0,160);await dashboard.waitForTimeout(35);}
   await dashboard.waitForTimeout(200);
   const bottomBounds=await bottom.boundingBox();metric.wheelDiaryControl=bottomBounds;
   assert.ok(bottomBounds.y>=paneBounds.y&&bottomBounds.y+bottomBounds.height<=paneBounds.y+paneBounds.height,`Wheel must expose bottom diary controls, not just change a hidden scrollTop: ${JSON.stringify(bottomBounds)}`);
   await bottom.click({position:{x:10,y:10},timeout:2000});
   await dashboard.locator('mm-nutrition').getByRole('dialog').waitFor();
   await dashboard.locator('mm-nutrition').getByRole('button',{name:'Cancel',exact:true}).click();
   if(width<1000){
    await dashboard.mouse.move(paneBounds.x+paneBounds.width/2,Math.min(height-40,paneBounds.y+150));
    for(let i=0;i<10;i++)await dashboard.mouse.wheel(0,-800);
    await dashboard.waitForTimeout(300);
    assert.ok((await bottom.boundingBox()).y>height,'Touch test starts with last control below viewport');
    const touch=await dashboard.context().newCDPSession(dashboard);
    await touch.send('Emulation.setTouchEmulationEnabled',{enabled:true});
    const x=Math.min(width-25,paneBounds.x+paneBounds.width/2),y=height-100;
    for(let i=0;i<60;i++){
     const r=await bottom.boundingBox();if(r.y>=paneBounds.y&&r.y+r.height<=Math.min(height,paneBounds.y+paneBounds.height)-20)break;
     await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
     for(let step=1;step<=6;step++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-step*18}]});await dashboard.waitForTimeout(15);}
     await dashboard.waitForTimeout(180);
     await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     await dashboard.waitForTimeout(40);
    }
    await dashboard.waitForTimeout(400);
    const touched=await bottom.boundingBox();metric.touchDiaryControl=touched;assert.ok(touched.y>=paneBounds.y&&touched.y+touched.height<=paneBounds.y+paneBounds.height,'Touch swipe must expose last diary control');
    await touch.detach();
   }
   await dashboard.screenshot({path:resolve(cfg.output,`native-nutrition-bottom-${width}.png`)});
   await bottom.click({position:{x:10,y:10},timeout:2000});
   await dashboard.locator('mm-nutrition').getByRole('dialog').waitFor();
   await dashboard.locator('mm-nutrition').getByRole('button',{name:'Cancel',exact:true}).click();
   for(let i=0;i<8;i++)await dashboard.mouse.wheel(0,700);
   await dashboard.waitForTimeout(200);
   const details=await dashboard.locator('mm-nutrition').getByText('Reports',{exact:true}).boundingBox();
   metric.finalDiaryDetails=details;
   assert.ok(details.y>=paneBounds.y&&details.y+details.height<=paneBounds.y+paneBounds.height,'The entire diary reaches its expandable reports');
   await dashboard.screenshot({path:resolve(cfg.output,`native-nutrition-end-${width}.png`)});
   const scan=dashboard.locator('mm-nutrition').getByRole('button',{name:'Scan barcode',exact:true});
   for(let i=0;i<60;i++){
    const r=await scan.boundingBox();if(r.y>=paneBounds.y&&r.y+r.height<=Math.min(height,paneBounds.y+paneBounds.height))break;
    await dashboard.mouse.wheel(0,r.y<paneBounds.y?-160:160);await dashboard.waitForTimeout(35);
   }
   const barcode=await scan.boundingBox();metric.searchBarcodeControl=barcode;
   assert.ok(barcode.y>=paneBounds.y&&barcode.y+barcode.height<=Math.min(height,paneBounds.y+paneBounds.height),'Scrolling returns to the compact search and barcode toolbar');
   await dashboard.locator('macromate-card').getByRole('button',{name:'Timers',exact:true}).click();
   await dashboard.locator('macromate-card').getByRole('button',{name:'Home',exact:true}).click();
   await dashboard.screenshot({path:resolve(cfg.output,`native-lovelace-panel-${width}.png`)});
  }
  assert.ok(!dashboardActions.some(a=>a.startsWith('shopping_')||['recipe_to_shopping','plan_to_shopping'].includes(a)),'Installed dashboard never invokes the retired shopping subsystem');
  assert.equal(await dashboard.locator('macromate-card').getByRole('button',{name:'All actions',exact:true}).count(),0);
  assert.equal(await dashboard.locator('mm-commands').count(),0);
  await dashboard.locator('macromate-card').evaluate(c=>{window.retired={api:c.api,app:c.application};});
  await dashboard.getByRole('tab',{name:'Other',exact:true}).click();
  await dashboard.locator('macromate-card').waitFor({state:'detached'});
  assert.equal(await dashboard.evaluate(()=>!retired.api.active&&retired.app._timerTick===null),true,'Leaving the view releases transport and cooking interval');
  await dashboard.setViewportSize({width:1280,height:900});
  await dashboard.getByRole('button',{name:'Edit dashboard',exact:true}).press('Enter');
  await dashboard.getByRole('button',{name:'Add card',exact:true}).click();
  await dashboard.getByRole('tab',{name:'By card',exact:true}).click();
  await dashboard.getByPlaceholder('Search cards').fill('MacroMate');
  await dashboard.locator('hui-card-picker .card').filter({has:dashboard.getByText('MacroMate',{exact:true})}).locator('.overlay').click();
  await dashboard.locator('macromate-card-editor').waitFor();
  await dashboard.screenshot({path:resolve(cfg.output,'native-card-picker.png')});
  await dashboard.getByRole('button',{name:'Save',exact:true}).click();
  await dashboard.getByRole('button',{name:'Done',exact:true}).click();
  await dashboard.locator('macromate-card mm-unified-app').first().waitFor();
  await dashboard.locator('macromate-card').first().evaluate(c=>{window.nativeHass=c.hass;window.profileHost=c;});
  const formErrorsBefore=dashboardErrors.length;
  const profileResults=[];
  for(const pace of ['0,5','0.5']){
   const profile=await control({op:'profile_form'});
   await dashboard.evaluate(async schema=>{
    await customElements.whenDefined('ha-form');
    const form=document.createElement('ha-form');window.profileForm=form;
    form.style.cssText='position:fixed;inset:0;z-index:10000;background:white;overflow:auto;padding:24px';
    form.hass={...window.nativeHass,language:'de'};
    if(typeof form.hass.localize!=='function'||!form.hass.connection)throw Error('Native HA form must receive the actual authenticated hass context');
    form.computeLabel=s=>({birthday:'Geburtsdatum (TT.MM.JJJJ)',weekly_pace_kg:'Gewichtsänderung pro Woche (kg/Woche)'}[s.name]||s.name);form.schema=schema;
    form.data={formula_sex:'male',birthday:'01.01.1990',height_cm:180,target_weight_kg:70,goal:'lose',weekly_pace_kg:'0',activity_level:'low',macro_plan:'balanced',enable_food_database:false,weight_entity:'sensor.synthetic_weight'};
    window.profilePayload=form.data;
    form.addEventListener('value-changed',e=>{window.profilePayload=e.detail.value;form.data=e.detail.value;});window.profileHost.shadowRoot.append(form);
   },profile.schema);
   await dashboard.locator('ha-form').getByRole('textbox',{name:/^Geburtsdatum/}).fill('23.07.1992');
   await dashboard.locator('ha-form').getByRole('textbox',{name:/^Gewichtsänderung/}).fill(pace);
   const payload=await dashboard.evaluate(()=>JSON.parse(JSON.stringify(window.profilePayload)));
   assert.equal(payload.weekly_pace_kg,pace,'Native HA selector preserves the exact decimal input');
   assert.equal(Object.hasOwn(payload,'weight_kg'),false,'Manual weight remains blank in the real HA form');
   const saved=await control({op:'profile_submit',flow_id:profile.flow_id,payload});
   assert.equal(saved.weekly_pace_kg,.5);assert.equal(saved.birthday,'1992-07-23');assert.equal(saved.weight_kg,80);
   assert.equal(saved.modules.filter(url=>url.startsWith('/macromate-assets/releases/')&&url.endsWith('/loader.js')).length,1,'Options reload must not duplicate module registration');
   profileResults.push({input:pace,...saved});
   await dashboard.evaluate(()=>profileForm.remove());
  }
  assert.deepEqual(dashboardErrors.slice(formErrorsBefore).filter(d=>d.message),[],'Native profile form must retain HA context without render errors');
  assert.ok(dashboardErrors.every(d=>!d.stack?.includes('/macromate-assets/')),'No MacroMate exception in native Lovelace');
  assert.ok(dashboardExternal.every(url=>/^https:\/\/demo\.home-assistant\.io\/stub_config\/(t-shirt-promo|floorplan|kitchen)\.png$/.test(url)),'Only native HA picker demo images may attempt an external request; every attempt is blocked');
  await dashboard.close();
  return {native_lovelace:true,automatic_module:true,view_type:'panel',mobile_and_landscape:true,scroll_metrics:scrollMetrics,settings:{native_language_units_theme_saved:true,definitive_refusal_unchanged_store:true,deliberately_lost_committed_response:true,same_uuid_explicit_replay:true,glass_wave_http_ws_store_replay:true,spontaneous_user_warning_reproduced:false},shopping_ui_removed:true,visual_picker_saved:true,native_ha_form:profileResults,shell_diagnostics:dashboardErrors,blocked_native_picker_demo_images:dashboardExternal};
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
               console_errors:consoleErrors,evidence_tier:'native-authenticated-HA-synthetic-isolated',lovelace_editor:rows.some(row=>row.name==='native-lovelace-panel-view-auto-module-layout-and-cleanup'&&row.status==='passed'),physical_devices:false};
 await writeFile(resolve(cfg.output,'browser-report.json'),JSON.stringify(report,null,2));
 process.stdout.write(JSON.stringify({op:'done',report})+'\n');
}
