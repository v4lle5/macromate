import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const {chromium}=await import(resolve(process.env.PLAYWRIGHT_DIR,'playwright/index.mjs'));
const root=resolve(new URL('../..',import.meta.url).pathname);const evidence=process.env.EVIDENCE_DIR;
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage({viewport:{width:1280,height:850}});const errors=[],external=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('rm_settings',JSON.stringify({theme:'neon',language:'de'})));await page.goto(`http://127.0.0.1:${server.address().port}/tests/frontend/macromate-unified-fixture.html`);await page.waitForFunction(()=>window.ready);await page.waitForTimeout(400);
assert.equal(await page.locator('macromate-card mm-unified-app').count(),1,'default card mounts the actual combined recipe application');
await page.getByRole('button',{name:'Nutrition',exact:true}).click();await page.waitForTimeout(300);if(!await page.locator('.calorie-ring').count())console.log(await page.evaluate(()=>({calls:window.calls,html:card.shadowRoot.querySelector('mm-unified-app').shadowRoot.querySelector('mm-nutrition')?.shadowRoot.innerHTML})),errors);assert.equal(await page.locator('.calorie-ring').count(),1);assert.ok(await page.getByRole('button',{name:'Quick entry',exact:true}).count());
await page.getByRole('button',{name:'Home',exact:true}).click();await page.waitForTimeout(200);assert.ok(await page.getByText('Garden Bowl',{exact:true}).count());
assert.deepEqual(errors,[]);if(evidence){await mkdir(evidence,{recursive:true});await page.screenshot({path:resolve(evidence,'library-desktop.png'),fullPage:true});}
assert.equal(await page.evaluate(()=>card.application._settings.theme),'glass-wave','New sessions default to Glass Wave');
assert.equal(await page.evaluate(()=>card.application._settings.language),'en','Unscoped legacy localStorage cannot override account preferences');
const retiredThemes=['soft','blossom','arctic','meadow','ocean','midnight','ember','neon','unknown-theme'];
for(const theme of retiredThemes){
 await page.evaluate(theme=>{window.preferences={recipe_settings:{theme,language:'en',darkMode:'on',fontSize:'large',unitSystem:'imperial'}};card.remove();document.body.append(card);},theme);
 await page.waitForFunction(()=>card.application?._loading===false&&card.application?._settings.fontSize==='large');
 assert.deepEqual(await page.evaluate(()=>({theme:card.application._settings.theme,darkMode:card.application._settings.darkMode,fontSize:card.application._settings.fontSize,unitSystem:card.application._settings.unitSystem})),{theme:'glass-wave',darkMode:'on',fontSize:'large',unitSystem:'metric'},`${theme} is migrated without discarding the remaining preferences`);
}
assert.equal(await page.evaluate(()=>window.calls.filter(c=>c.action==='preferences_update').length),0,'Loading legacy settings does not silently write preferences');
await page.evaluate(()=>{window.preferences={};card.remove();document.body.append(card);});
await page.waitForFunction(()=>card.application?._loading===false&&card.application?._settings.fontSize==='medium');
await page.getByRole('button',{name:'Settings',exact:true}).click();const settings=page.locator('rm-settings-view');
assert.equal(await settings.locator('.theme-name,.theme-identity').count(),0);
assert.equal(await settings.getByRole('button',{name:'Appearance',exact:true}).count(),0);
assert.equal(await settings.getByRole('button',{name:/^(Imperial|Metric)$/}).count(),0);
assert.equal(await settings.getByLabel('Show metric conversion button',{exact:true}).count(),0);
assert.equal(await settings.locator('option[value="soft"],option[value="blossom"],option[value="arctic"],option[value="meadow"],option[value="ocean"],option[value="midnight"],option[value="ember"],option[value="neon"]').count(),0,'Retired palettes cannot be selected');
for(const [darkMode,label,appearance] of [['off','Light','light'],['on','Dark','dark'],['system','Auto','light']]){
 await page.emulateMedia({colorScheme:'light'});
 await page.evaluate(darkMode=>{card.application._settings={...card.application._settings,darkMode};},darkMode);
 await page.waitForFunction(expected=>card.application.getAttribute('data-appearance')===expected,appearance);
 assert.equal(await page.evaluate(()=>card.application._settings.darkMode),darkMode);
 if(evidence)await page.screenshot({path:resolve(evidence,`glass-wave-${darkMode}.png`)});
}
await page.emulateMedia({colorScheme:'dark'});
await page.waitForFunction(()=>card.application.getAttribute('data-appearance')==='dark');
await page.emulateMedia({colorScheme:'light'});
await page.waitForFunction(()=>card.application.getAttribute('data-appearance')==='light');
await page.evaluate(()=>{card.hass={...card.hass,themes:{darkMode:true}};});
await page.waitForFunction(()=>card.application.getAttribute('data-appearance')==='dark');
assert.equal(await page.locator('macromate-card').getAttribute('data-appearance'),'dark','Outer status surfaces follow the app appearance');
await page.evaluate(()=>{card.hass={...card.hass,themes:{darkMode:false}};});
await page.waitForFunction(()=>card.application.getAttribute('data-appearance')==='light');
await page.evaluate(()=>{card.hass={...card.hass,themes:undefined};});
for(const [label,size] of [['S',14],['L',18],['M',16]]){
 await page.evaluate(fontSize=>{card.application._settings={...card.application._settings,fontSize};},{S:'small',M:'medium',L:'large'}[label]);
 await page.waitForFunction(size=>parseFloat(getComputedStyle(card.application).getPropertyValue('--rm-font-size-base'))===size,size);
 assert.equal(await settings.locator('.setting-name').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)),size,'Text-size preference changes the rendered settings labels');
}
for(const locale of ['en','de','es','fr','pt','nl','it']){await settings.locator('select').nth(0).selectOption(locale);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>card.application._settings.language),locale);if(locale==='de'){assert.ok(await settings.getByText('Sprache',{exact:true}).count(),'German locale re-renders loaded templates');assert.equal(await page.getByRole('button',{name:'Ernährung',exact:true}).count(),1,'New nutrition navigation follows the selected app locale');}if(evidence)await page.screenshot({path:resolve(evidence,`locale-${locale}.png`)});}assert.deepEqual(errors,[],'Appearance/locale changes never leak unhandled errors when persistence rejects');
console.log('PASS: Glass Wave only, legacy preference migration, light/dark/system appearance and seven locales');
console.log('PASS: synthetic Chromium default combined shell, nutrition ring/forms, recipe library, shopping removal');
await page.evaluate(()=>{card.application._view='grid';card.application._error=null;});await page.waitForTimeout(150);await page.getByText('Garden Bowl',{exact:true}).first().click();await page.waitForTimeout(200);assert.equal(await page.getByRole('button',{name:'Log servings',exact:true}).count(),1,'Recipe detail exposes confirmed recipe-to-diary logging');
const detail=page.locator('rm-recipe-detail');assert.equal(await detail.locator('.ing-shop-btn,.shopping-section').count(),0);assert.equal(await detail.evaluate(d=>typeof d._dispatchShoppingAdd),'undefined');assert.equal(await detail.locator('.nutr-mcol-pct').count(),0,'Incomplete declared macros never imply exact energy percentages');assert.ok(await detail.getByText('200 kcal',{exact:true}).count(),'Original nutrition text remains separately visible');await detail.getByRole('button',{name:'Log servings',exact:true}).click();assert.equal(await detail.getByLabel('Recipe servings',{exact:true}).count(),1);await detail.locator('.action-btns-row button').nth(2).click();await detail.locator('input[type=url]').nth(1).fill('https://example.invalid/untrusted-image.svg');await page.waitForTimeout(120);assert.deepEqual(external,[],'Typing an untrusted image reference never fetches it directly');
await page.evaluate(()=>{card.application._view='add';card.application._error=null;});const importer=page.locator('rm-add-recipe-dialog');await importer.getByPlaceholder('https://www.example.com/recipe/...').fill('https://example.invalid/recipe');assert.equal(await importer.getByRole('button',{name:/Fetch|Recupera|Abrufen/,exact:true}).isDisabled(),true,'Remote URL fetch is disabled until explicit consent');assert.equal(await importer.getByLabel('Allow remote import',{exact:true}).count(),1);await importer.getByLabel('Allow remote import',{exact:true}).check();await importer.getByRole('button',{name:/Fetch|Recupera|Abrufen/,exact:true}).click();await page.waitForTimeout(100);const preview=await page.evaluate(()=>window.calls.findLast(c=>c.action==='recipes_scrape'));assert.equal(preview.payload.enabled,true);assert.equal(preview.payload.request_id,undefined);assert.ok(await importer.locator('.error-msg').count());
const zip=spawnSync('python3',['-c',"import io,zipfile,base64; b=io.BytesIO(); z=zipfile.ZipFile(b,'w'); z.writestr('recipes.html','<html><body><h2>Synthetic recipe</h2></body></html>'); z.close(); print(base64.b64encode(b.getvalue()).decode())"],{encoding:'utf8'});assert.equal(zip.status,0);const archive=zip.stdout.trim();await importer.locator('.mode-btn').nth(2).click();await importer.locator('input[type=file]').setInputFiles({name:'synthetic-recipes.zip',mimeType:'application/zip',buffer:Buffer.from(archive,'base64')});await importer.locator('.import-btn').click();await page.waitForTimeout(150);const imported=await page.evaluate(()=>window.calls.findLast(c=>c.action==='recipe_keeper_import'));assert.equal(imported.payload.base64_data,archive,'Archive parsing and photo normalization happen on the bounded backend, not unbounded browser extraction');assert.ok(imported.payload.request_id);assert.ok(await importer.locator('.import-result.error').count(),'Rejected fixture import must not show accepted success');
await page.evaluate(()=>{card.application._view='planner';card.application._error=null;});assert.equal(await page.getByLabel('Planner shopping list',{exact:true}).count(),0);assert.equal(await page.evaluate(()=>window.xss),undefined);assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
await page.evaluate(()=>{card.application._view='timers';card.application._error=null;});await page.locator('.timer-add-group').first().locator('input[type=text]').fill('Scoped local timer');await page.locator('.timer-mins-input').first().fill('1');await page.locator('.timer-add-group').first().locator('button').click();await page.waitForTimeout(100);await page.evaluate(()=>{card.remove();document.body.append(card);});await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>card.application._timers.some(t=>t.label==='Scoped local timer')),true,'User-scoped local timers survive a card reload without a backend write');
await page.evaluate(()=>{window.calls=[];window.preferences={recipe_settings:{theme:'ember',darkMode:'on',fontSize:'large',language:'en'}};card.hass={...hass,user:{id:'scoped-member',is_admin:false},connection:{subscribeMessage:async()=>()=>{}}};});await page.waitForFunction(()=>card.application?._loading===false&&card.application?._settings.fontSize==='large');assert.deepEqual(await page.evaluate(()=>({theme:card.application._settings.theme,darkMode:card.application._settings.darkMode,fontSize:card.application._settings.fontSize})),{theme:'glass-wave',darkMode:'on',fontSize:'large'},'Members restore their own appearance preferences without recipe access');assert.ok(await page.getByRole('button',{name:'Nutrition',exact:true}).count(),'A member can open only explicitly shared nutrition profiles');assert.equal(await page.locator('.calorie-ring').count(),0,'No shared profile means no private diary data');assert.equal(await page.getByRole('button',{name:'New Recipe',exact:true}).count(),0);assert.equal(await page.getByText('Garden Bowl',{exact:true}).count(),0);assert.ok((await page.evaluate(()=>window.calls)).every(c=>['describe','preferences_get','platform_info','profiles_list'].includes(c.action)));assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
await page.evaluate(()=>{const read=window.hass.callWS;window.calls=[];card.hass={...window.hass,user:{id:'offline-preferences-member',is_admin:false},connection:{subscribeMessage:async()=>()=>{}},callWS:message=>{if(message.action==='preferences_get')throw {code:'not_ready'};return read(message);}};});
await page.waitForFunction(()=>card.application?._loading===false&&card.application?._view==='nutrition');
await page.locator('mm-nutrition').waitFor();
assert.equal(await page.evaluate(()=>card.application._error),null,'Unavailable appearance preferences do not block member nutrition');
assert.ok((await page.evaluate(()=>window.calls)).every(c=>['describe','preferences_get','platform_info','profiles_list'].includes(c.action)));
}finally{await browser.close();await new Promise(r=>server.close(r));}
