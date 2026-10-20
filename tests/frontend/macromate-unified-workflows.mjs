// Real Chromium, synthetic read transport. No fabricated accepted mutations.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {measureTextContrast} from './macromate-contrast-helpers.mjs';
const root=resolve(new URL('../..',import.meta.url).pathname);
const {chromium}=await import(resolve(process.env.PLAYWRIGHT_DIR,'playwright/index.mjs'));
const evidence=process.env.EVIDENCE_DIR;const rows=[];
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+req.url.split('?')[0]);if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const test=async(id,run)=>{try{const actual=await run();rows.push({id,status:'passed',evidenceTier:'chromium-synthetic-read-transport',actual:actual??null});console.log('PASS: '+id);}catch(error){rows.push({id,status:'failed',message:error.message});throw error;}};
try {
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!/^(http:\/\/127\.0\.0\.1:|blob:|data:)/.test(r.url()))external.push(r.url());});
 await page.goto(`http://127.0.0.1:${server.address().port}/tests/frontend/macromate-unified-fixture.html`);await page.waitForFunction(()=>window.card?.application?._recipes?.length>0);
 const view=async(name)=>{await page.evaluate(name=>{card.application._error=null;card.application._view=name;},name);await page.waitForTimeout(120);};
 const open=async()=>{await view('grid');await page.getByText('Garden Bowl',{exact:true}).first().click();await page.locator('rm-recipe-detail').waitFor();};
 await open();const detail=page.locator('rm-recipe-detail');
 await test('unit-dimension-and-ambiguous-preservation',async()=>{
  const actual=await detail.evaluate(d=>{d._metricMode=true;return ['cup','tbsp','oz','fl oz'].map(unit=>({unit,...d._getDisplayAmount({amount:'1/2',unit})})).concat([{source:'ambiguous',...d._getDisplayAmount({amount:'2-3',unit:'cups'})}]);});
  assert.equal(actual[0].unit,'ml');assert.equal(actual[0].amount,'125');assert.equal(actual[1].unit,'tbsp');assert.equal(actual[2].unit,'g');assert.equal(actual[3].unit,'ml');assert.deepEqual(actual[4],{source:'ambiguous',amount:'2-3',unit:'cups'},'Ambiguous ranges must not be guessed by parseFloat');return actual;
 });
 await test('recipe-declared-original-zero-basis',async()=>{
  await detail.evaluate(d=>{d.recipe={...d.recipe,declared_nutrition:{calories:0,protein:0},nutrition_basis:'per_recipe',nutrition:{calories:'About 200 kcal',protein:'trace <img src=x onerror=window.xss=1>'}};});await page.waitForTimeout(100);
  assert.equal((await detail.locator('.nutr-ring-wrap text').first().textContent()).trim(),'0');assert.equal(await detail.locator('.nutr-mcol-pct').count(),0);assert.equal(await detail.locator('.nutr-rda-toggle').count(),0);assert.ok((await detail.locator('.nutr-original').innerText()).includes('About 200 kcal'));assert.equal(await detail.locator('.nutr-original img').count(),0);
  await detail.evaluate(d=>{d.recipe={...d.recipe,declared_nutrition:{},nutrition_basis:'unknown'};});await page.waitForTimeout(80);assert.equal(await detail.locator('.nutr-ring-wrap').count(),0);assert.ok((await detail.locator('.nutr-original').innerText()).includes('About 200 kcal'));return {declaredZero:'0',missing:'no numeric ring',originalText:'retained as text',rdaForWholeRecipe:0};
 });
 await test('formatted-notes-and-step-completion',async()=>{
  await detail.evaluate(d=>{d.recipe={...d.recipe,description:'**Fresh** vegetables',notes:'<script>window.xss=1</script> [unsafe](javascript:alert(1))',instructions:['Cook for 1 minute']};});await page.waitForTimeout(80);
  assert.equal(await detail.locator('.md-content script').count(),0);assert.equal(await detail.locator('a[href^="javascript:"]').count(),0);const toggle=detail.locator('.step-num-btn,.step-badge,.step-number').first();
  // The numbered button is the actual upstream interaction, not a backend write.
  if(await toggle.count())await toggle.click();else await detail.evaluate(d=>d._toggleStepComplete(0));
  assert.equal(await detail.evaluate(d=>d._completedSteps.has(0)),true);return {scriptNodes:0,javascriptLinks:0,stepCompleted:true};
 });
 await test('view-cache-tiles-ingredients-inline-timer',async()=>{
  await page.evaluate(()=>{card.application._saveViewState();card.remove();document.body.append(card);});await page.waitForFunction(()=>card.application?._view==='detail'&&card.application?._selectedRecipe?.id==='r1');
  assert.ok(await detail.getByText('Carrots',{exact:true}).count());await detail.locator('.time-chip').click();await page.waitForTimeout(80);const timer=await page.evaluate(()=>card.application._timers.find(t=>t.label.includes('Garden Bowl')));assert.equal(timer.total,60);await page.evaluate(id=>card.application._stopTimer(id),timer.id);await view('grid');assert.ok(await page.getByText('Garden Bowl',{exact:true}).count());await open();return {restoredView:'detail',recipe:'r1',ingredient:'Carrots',inlineSeconds:timer.total,tile:'Garden Bowl'};
 });
 await test('local-timer-pause-extend-alarm-queue',async()=>{
  const actual=await page.evaluate(async()=>{const app=card.application;app._settings={...app._settings,timerSound:'none'};await app._startTimer(10,'Pause and extend');const id=app._timers.at(-1).id;await app._pauseTimer(id);const paused=app._timers.find(t=>t.id===id).running;await app._addTimeToTimer(id,30);const extended={total:app._timers.find(t=>t.id===id).total,remaining:app._timers.find(t=>t.id===id).remaining};await app._stopTimer(id);await app._startTimer(1,'Alarm A');await app._startTimer(1,'Alarm B');app._tickTimers();const alarm=app._timerAlarm.label,queued=app._timerAlarmQueue.map(t=>t.label);app._dismissAlarm();const next=app._timerAlarm.label;app._dismissAlarm();return {paused,extended,alarm,queued,next,dismissed:app._timerAlarm===null};});
  assert.deepEqual(actual,{paused:false,extended:{total:40,remaining:40},alarm:'Alarm A',queued:['Alarm B'],next:'Alarm B',dismissed:true});return actual;
 });
 await test('authenticated-media-pixels-and-slideshow',async()=>{
  await detail.evaluate(async d=>{window.mediaPaths=[];d.api.transport.hass.fetchWithAuth=async path=>{window.mediaPaths.push(path);return fetch('/frontend/brand-icon.png');};const urls=await Promise.all([d.api.transport.media('private-one'),d.api.transport.media('private-one'),d.api.transport.media('private-two')]);d.recipe={...d.recipe,image_url:urls[0],photos:[urls[2]]};});
  const photo=detail.locator('.wide-image-square img');await photo.waitFor();await page.waitForFunction(()=>{const img=card.application.shadowRoot.querySelector('rm-recipe-detail')?.shadowRoot.querySelector('.wide-image-square img');return img?.naturalWidth>0;});
  const pixels=await photo.evaluate(n=>({width:n.naturalWidth,height:n.naturalHeight,source:n.src}));assert.ok(pixels.width>0);assert.ok(pixels.source.startsWith('blob:'));assert.deepEqual(await page.evaluate(()=>window.mediaPaths),['/api/macromate/media/private-one','/api/macromate/media/private-two']);
  const before=await photo.getAttribute('src');await detail.locator('.slide-next').click();assert.notEqual(await photo.getAttribute('src'),before);await detail.locator('.slide-prev').click();assert.equal(await photo.getAttribute('src'),before);return {pixels,authenticatedPaths:await page.evaluate(()=>window.mediaPaths),slideshow:'next and previous changed and restored the rendered image'};
 });
 await test('hostile-photo-free-archive-preflight',async()=>{
  await view('add');const importer=page.locator('rm-add-recipe-dialog');
  const result=spawnSync('python3',['-c',"import io,zipfile,base64; b=io.BytesIO(); z=zipfile.ZipFile(b,'w'); z.writestr('../recipes.html','<html>Unsafe path</html>'); z.close(); print(base64.b64encode(b.getvalue()).decode())"],{encoding:'utf8'});assert.equal(result.status,0);
  const actual=await importer.evaluate(async(d,encoded)=>{const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));d._importFile=new File([bytes],'unsafe.zip');d._importDownloadImages=false;const before=window.calls.length;await d._handleImport();return {writes:window.calls.slice(before),error:d._importError};},result.stdout.trim());
  assert.deepEqual(actual.writes,[],'JSZip sanitized traversal names must be checked against unsafeOriginalName before sending HTML');assert.ok(actual.error);return actual;
 });
 await test('library-search-taxonomy-rating-favorite-recent',async()=>{
  await view('grid');const grid=page.locator('rm-recipe-grid');const actual=await grid.evaluate(g=>{const sample=[{id:'a',name:'Apple soup',tags:['Fruit'],courses:['Lunch'],categories:['Soup'],collections:['Quick'],rating:5,is_favourite:true},{id:'b',name:'Bread',tags:['Baking'],courses:['Dinner'],categories:['Baked'],collections:['Quick'],rating:2,is_favourite:true}];g.allRecipes=sample;g.recipes=sample;g.recentRecipes=sample;g.searchQuery='Apple';g._filterMode='favourites';const favorites=g._getFilteredList().map(r=>r.id);g._filterMode='recent';const recent=g._getFilteredList().map(r=>r.id);g.searchQuery='';g._filterMode='all';g._selectedCourses=new Set(['Lunch']);g._selectedCategories=new Set(['Soup']);const taxonomy=g._getFilteredList().map(r=>r.id);g._selectedCourses=new Set();g._selectedCategories=new Set();g._starFilter=3;g._sortByRating=true;return {favorites,recent,taxonomy,rating:g._getFilteredList().map(r=>r.id)};});
  assert.deepEqual(actual,{favorites:['a'],recent:['a'],taxonomy:['a'],rating:['a']},'Search applies in favorites/recent as well as AND-across taxonomy and rating modes');await grid.evaluate(g=>{g.allRecipes=card.application._recipes;g.recipes=card.application._recipes;g.searchQuery='';g._filterMode='all';g._starFilter=0;g._sortByRating=false;});return actual;
 });
 await test('recipe-card-keyboard-navigation',async()=>{
  await view('grid');
  const recipe=page.locator('rm-recipe-grid .recipe-card').filter({hasText:'Garden Bowl'}).first();
  await recipe.locator('.recipe-open').focus();await page.keyboard.press('Enter');
  await page.locator('rm-recipe-detail').waitFor();
  assert.equal(await page.evaluate(()=>card.application._selectedRecipe.id),'r1');
  return {keyboard:'Enter',recipe:'r1'};
 });
 await test('reduced-motion-navigation',async()=>{
  await open();const motion=await page.evaluate(()=>{const style=getComputedStyle(card.application.shadowRoot.querySelector('.rm-slide-track'));return {transitionDuration:style.transitionDuration,transitionProperty:style.transitionProperty,animationName:style.animationName};});assert.equal(motion.transitionDuration,'0s','Reduced-motion preference disables the slide transition, not just hides document overflow');
  assert.equal(motion.transitionProperty,'none','Reduced-motion navigation does not schedule a transform transition');assert.equal(motion.animationName,'none','Reduced-motion navigation disables directional view animations');
  await page.evaluate(async()=>{card.application._handleBack();await card.application.updateComplete;});assert.equal(await page.locator('rm-recipe-detail').count(),0,'Instant back navigation releases the retained detail without relying on transitionend');await open();return {...motion,detailReleased:true};
 });
 await test('responsive-core-views',async()=>{
  const layouts=[];
  for(const darkMode of ['off','on'])for(const width of [320,390,768,1280]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(darkMode=>{card.application._settings={...card.application._settings,darkMode,fontSize:'large'};},darkMode);
   for(const name of ['grid','detail','planner','timers','nutrition','add','settings']){
    await view(name);
    const metrics=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,cardWidth:card.getBoundingClientRect().width,appWidth:card.application.scrollWidth,wide:card.application._wide}));
    assert.ok(metrics.documentWidth<=width+1&&metrics.appWidth<=metrics.cardWidth+1,`${name}/${darkMode} overflows ${width}px: ${JSON.stringify(metrics)}`);
    assert.equal(metrics.wide,width>=620);layouts.push({width,view:name,darkMode,fontSize:'large',...metrics});
    if(evidence&&width===320&&name==='detail')await page.screenshot({path:resolve(evidence,`workflow-mobile-detail-${darkMode}.png`)});
   }
  }
  await page.evaluate(()=>{card.application._settings={...card.application._settings,fontSize:'medium'};});
  if(evidence)await page.screenshot({path:resolve(evidence,'workflow-desktop.png'),fullPage:true});return layouts;
 });
 await test('glass-wave-rendered-settings-contrast',async()=>{
  const actual=[];
  await view('settings');
  for(const darkMode of ['off','on']){
   await page.evaluate(darkMode=>{card.application._settings={...card.application._settings,darkMode};},darkMode);
   await page.waitForTimeout(200);
   const measurements=await measureTextContrast(page.locator('rm-settings-view'),'.setting-name,.section-label,.seg-btn,.theme-name');
   assert.ok(measurements.length>=12,'Settings labels and selected/unselected controls are rendered');
   for(const measurement of measurements)assert.ok(measurement.contrast>=4.5,`${darkMode}: ${JSON.stringify(measurement)}`);
   actual.push({theme:'glass-wave',darkMode,measurements});
  }
  return actual;
 });
 await test('custom-audio-rejects-remote-references',async()=>{
  await page.route('https://example.invalid/**',route=>route.abort());const before=external.length;
  await page.evaluate(()=>{card.application._startAlarmLoop('file','https://example.invalid/private-audio.mp3');card.application.shadowRoot.querySelector('rm-settings-view')._testSound('file','https://example.invalid/preview.mp3');});await page.waitForTimeout(200);await page.evaluate(()=>card.application._stopAlarmLoop());
  assert.equal(external.length,before,'Persisted custom alarm references must never trigger automatic remote fetches');return {remoteRequests:external.length-before};
 });
 await test('settings-help-version-and-rejected-backup',async()=>{
  await view('settings');const settings=page.locator('rm-settings-view');await settings.getByRole('button',{name:'Help',exact:true}).click();assert.equal(await settings.evaluate(s=>s._rmVersion),'fixture');assert.equal(await settings.locator('a[href^="https://github.com/"]').count(),3);await settings.getByRole('button',{name:'Sync',exact:true}).click();await settings.getByRole('button',{name:'Download backup',exact:true}).click();await page.waitForTimeout(70);assert.equal(await settings.evaluate(s=>s._backupState),'error');assert.equal(await settings.getByRole('button',{name:'Failed ✗',exact:true}).count(),1);return {version:'fixture',links:3,backup:'real fixture rejection shown, no synthetic success'};
 });
 await test('nutrition-shared-entry-and-active-energy-mobile',async()=>{
  await view('nutrition');const pane=page.locator('mm-nutrition');await pane.locator('.calorie-ring').waitFor();
  assert.equal(await pane.locator('input[type=search],input[inputmode=numeric]').count(),1);
  const layouts=[];for(const width of [320,390,844,1280]){await page.setViewportSize({width,height:700});await page.waitForTimeout(150);
   for(const active of [321,0,null]){await pane.evaluate((n,active)=>{n.data={...n.data,date:n.data.today,recommendation:{...n.data.recommendation,active_calories:active??0,budget_source:active===null?'profile_pal':'bmr_plus_active'}};n.renderDiary();},active);const metric=pane.locator('[data-metric=active-calories]');assert.match(await metric.innerText(),active===null?/Unavailable/:new RegExp(`${active} kcal`));const box=await metric.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width,'active metric fits viewport');}
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);for(const name of ['Search','Quick entry','Scan barcode']){const box=await pane.getByRole('button',{name,exact:true}).boundingBox();assert.ok(box.width>=44&&box.height>=44,`${name} mobile touch target`);}layouts.push(width);
  }
  await pane.evaluate(n=>n.loadDiary(n.date));return {widths:layouts,active:[321,0,'unavailable'],oneSharedInput:true};
 });
 await test('nutrition-reversible-labels-preserve-data',async()=>{
  await view('nutrition');const pane=page.locator('mm-nutrition');await pane.getByRole('button',{name:'Quick entry',exact:true}).waitFor();await pane.locator('input[type=search]').fill('Speichern');await pane.getByRole('button',{name:'Quick entry',exact:true}).click();const dialog=pane.getByRole('dialog');
  await pane.evaluate(n=>{n.hass={...n.hass,language:'de'};});assert.equal(await dialog.getByRole('button',{name:'Speichern',exact:true}).count(),1);assert.equal(await dialog.locator('input[name=name]').inputValue(),'Speichern');
  await pane.evaluate(n=>{n.hass={...n.hass,language:'en'};});assert.equal(await dialog.getByRole('button',{name:'Save',exact:true}).count(),1);assert.equal(await dialog.locator('input[name=name]').inputValue(),'Speichern');await dialog.getByRole('button',{name:'Cancel',exact:true}).click();return {en:'Save',de:'Speichern',userText:'Speichern'};
 });
 await test('keyboard-focus-and-member-context-reset',async()=>{
  await view('grid');await page.keyboard.press('Tab');const focus=await page.evaluate(()=>{let n=document.activeElement;while(n?.shadowRoot?.activeElement)n=n.shadowRoot.activeElement;return {tag:n?.tagName,text:n?.textContent?.trim(),outline:n?getComputedStyle(n).outlineStyle:null};});assert.ok(focus.tag);assert.notEqual(focus.tag,'BODY');
  await page.evaluate(()=>{hass.user.is_admin=false;card.hass=hass;});await page.waitForTimeout(150);assert.equal(await page.getByText('Garden Bowl',{exact:true}).count(),0);assert.equal(await page.locator('mm-nutrition').count(),1);assert.equal(await page.locator('mm-nutrition .entry').count(),0);await page.locator('mm-nutrition').getByText('No nutrition profile is shared with this account.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'New Recipe',exact:true}).count(),0);return {focus,inPlacePermissionChange:'private DOM removed'};
 });
 await test('no-unhandled-errors-external-requests-or-xss',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.equal(await page.evaluate(()=>window.xss),undefined);return {errors,external,xss:false};});
} finally {
 if(evidence){await mkdir(evidence,{recursive:true});await writeFile(resolve(evidence,'workflow-evidence.json'),JSON.stringify({rows,nativeHA:false,physicalDevices:false},null,2)+'\n');}
 await browser.close();await new Promise(r=>server.close(r));
}
