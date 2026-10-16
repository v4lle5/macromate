import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdtemp,rm,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire((process.env.FRONTEND_DEPS || '/home/valentin/.hermes/profiles/darlene/cache/scratch/macromate-frontend-deps')+'/package.json');
const {chromium,firefox,webkit}=require('playwright');
let server,browser,base;
const pageErrors=[];
before(async()=>{
 server=createServer(async(req,res)=>{try{
  let path=decodeURIComponent(req.url.split('?')[0]);
  if(path==='/') path='/tests/frontend/macromate-fixture.html';
  path=path.replace('/macromate-assets/',process.env.MACROMATE_PACKAGED==='1'?'/custom_components/macromate/frontend/':'/frontend/');
  if(!/^\/(frontend|custom_components\/macromate\/frontend|tests\/frontend)\//.test(path)||path.includes('..')){res.writeHead(404).end();return;}
  const data=await readFile(resolve('.'+path));
  res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png'})[extname(path)]||'text/plain');res.end(data);
 }catch{res.writeHead(404).end();}}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;
 browser=process.env.MACROMATE_BROWSER==='firefox'?await firefox.launch({headless:true}):process.env.MACROMATE_BROWSER==='webkit'?await webkit.launch({headless:true}):await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
});
after(async()=>{await browser?.close();await new Promise(r=>server?.close(r));assert.deepEqual(pageErrors,[],'no unhandled browser JavaScript errors');});
async function open(){const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',error=>pageErrors.push(error.message));await page.goto(base);await page.waitForFunction(()=>document.querySelector('test-nutrition-pane')?.shadowRoot?.querySelector('[data-testid="diary"]'));return page;}
const panel=page=>page.locator('test-nutrition-pane');
async function calls(page){return page.evaluate(()=>window.calls);}
function backend(data){
 const python=process.env.HA_PYTHON || '/home/valentin/.hermes/profiles/darlene/cache/scratch/macromate-runtime/venv/bin/python';
 const run=spawnSync(python,['-B','tests/ha/ui_contract.py'],{input:JSON.stringify(data),encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);return JSON.parse(run.stdout);
}

test('diary loads HA-local today, shows unknown nutrients and dated goals, and navigates without timezone shifts',async()=>{
 const page=await open();
 assert.match(await panel(page).locator('main').innerText(),/MacroMate/);
 assert.match(await panel(page).locator('main').innerText(),/300/);
 await panel(page).getByText('Alle Tagesnährwerte',{exact:true}).click();
 assert.match(await panel(page).locator('main').innerText(),/Unbekannt/);
 assert.equal((await calls(page))[0].action,'diary');
 assert.deepEqual((await calls(page))[0].payload,{});
 await panel(page).getByRole('button',{name:'Vorheriger Tag'}).click();
 await page.waitForFunction(()=>window.calls.at(-1).payload.date==='2026-10-13');
 assert.match(await panel(page).locator('main').innerText(),/Kein gespeichertes Tagesziel/);
 await panel(page).getByRole('button',{name:'Heute',exact:true}).click();
 await page.waitForFunction(()=>window.calls.at(-1).payload.date==='2026-10-14');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.close();
});

test('manual local search escapes product text, fetches detail, logs ml portions and saves favorite templates',async()=>{
 const page=await open();
 await panel(page).getByLabel('Lebensmittel suchen',{exact:true}).fill('Hafer');
 assert.equal((await calls(page)).filter(c=>c.action==='search_foods').length,0);
 await panel(page).getByRole('button',{name:'Suchen',exact:true}).click();
 await panel(page).getByRole('button',{name:/Haferdrink/}).click();
 await page.waitForFunction(()=>window.calls.at(-1).action==='food');
 assert.equal(await panel(page).locator('.food-detail img').count(),0);
 await panel(page).getByLabel('Portion',{exact:true}).selectOption('cup');
 await panel(page).getByLabel('Anzahl',{exact:true}).fill('2');
 await panel(page).getByRole('button',{name:'Portion als Favorit speichern'}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='favorite'));
 const favorite=(await calls(page)).find(c=>c.action==='favorite');
 assert.equal(favorite.payload.serving_id,'cup');assert.equal(favorite.payload.quantity,2);assert.equal(favorite.payload.enabled,true);
 await panel(page).getByRole('button',{name:'Favorit entfernen',exact:true}).click();
 await panel(page).getByRole('button',{name:'Portion als Favorit speichern',exact:true}).waitFor();
 const real=backend({seed_food:await page.evaluate(()=>window.product),calls:(await calls(page)).filter(c=>c.action==='favorite')});
 assert.equal(real.results[0].food.is_favorite,true);assert.equal(real.results[1].food.is_favorite,false);
 assert.deepEqual(real.state.favorites,{});
 await panel(page).getByRole('button',{name:'Lebensmittel eintragen'}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='log_food'));
 const log=(await calls(page)).find(c=>c.action==='log_food');
 assert.equal(log.payload.serving_id,'cup');assert.equal(log.payload.quantity,2);assert.equal(log.payload.date,'2026-10-14');assert.equal(log.payload.amount,undefined);
 for(const filter of ['favorites','recent','custom']){
  await panel(page).getByLabel('Filter',{exact:true}).selectOption(filter);
  await panel(page).getByRole('button',{name:'Suchen',exact:true}).click();
  await page.waitForFunction(f=>window.calls.some(c=>c.action==='search_foods'&&c.payload.filter===f),filter);
 }
 await panel(page).getByLabel('Online-Suche (Open Food Facts)').check();
 await panel(page).getByRole('button',{name:'Suchen',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='search_foods'&&c.payload.online===true));
 await page.close();
});

test('quick entry stores total nutrients and edit/copy/delete target entry IDs',async()=>{
 const page=await open();
 await panel(page).getByRole('button',{name:'Schnelleintrag',exact:true}).click();
 const dialog=panel(page).getByRole('dialog');
 await dialog.getByLabel('Name',{exact:true}).fill('Kantine');
 await dialog.getByLabel('Energie (kcal)',{exact:true}).fill('600');
 await dialog.getByLabel('Protein (g)',{exact:true}).fill('25');
 await dialog.getByRole('button',{name:'Speichern',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='log_meal'));
 const log=(await calls(page)).find(c=>c.action==='log_meal').payload;
 assert.equal(log.calories,600);assert.equal(log.protein,25);assert.equal(log.carbs,undefined);assert.equal(log.date,'2026-10-14');
 await panel(page).getByRole('button',{name:'Haferfrühstück bearbeiten'}).click();
 await dialog.getByLabel('Energie (kcal)',{exact:true}).fill('350');
 await dialog.getByRole('button',{name:'Speichern',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='update_meal'));
 assert.equal((await calls(page)).find(c=>c.action==='update_meal').payload.entry_id,'quick1');
 await panel(page).getByRole('button',{name:'Haferfrühstück kopieren'}).click();
 await dialog.getByLabel('Zieldatum',{exact:true}).fill('2026-10-13');
 await dialog.getByRole('button',{name:'Kopieren',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='copy_meal'));
 assert.equal((await calls(page)).find(c=>c.action==='copy_meal').payload.date,'2026-10-13');
 await panel(page).getByRole('button',{name:'Haferfrühstück löschen'}).click();
 assert.equal((await calls(page)).filter(c=>c.action==='delete_meal').length,0);
 await dialog.getByRole('button',{name:'Endgültig löschen'}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='delete_meal'));
 assert.equal((await calls(page)).find(c=>c.action==='delete_meal').payload.entry_id,'quick1');
 await page.close();
});

test('quick blank macros remain unknown through the actual command boundary',async()=>{
 const page=await open();
 await panel(page).getByRole('button',{name:'Schnelleintrag',exact:true}).click();
 const dialog=panel(page).getByRole('dialog');
 await dialog.getByLabel('Name',{exact:true}).fill('Energy only');
 await dialog.getByLabel('Energie (kcal)',{exact:true}).fill('250');
 await dialog.getByLabel('Protein (g)',{exact:true}).fill('0');
 await dialog.getByRole('button',{name:'Speichern',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='log_meal'));
 const real=backend({date:'2026-10-14',calls:(await calls(page)).filter(c=>c.action==='log_meal')});
 assert.deepEqual(real.results[0].entry.nutrients,{calories:250,protein:0});
 assert.equal(real.state.entries[0].protein,0);
 assert.equal(real.diary.nutrition_missing.includes('protein'),false);
 assert.equal(real.diary.nutrition_missing.includes('carbs'),true);
 await page.close();
});

test('quick edit blanks clear declared macros and roundtrip unknown instead of zero',async()=>{
 const page=await open();
 const seed=backend({calls:[{action:'log_meal',payload:{name:'Clearable',meal_type:'snack',calories:250,protein:25}}]}).results[0].entry;
 await page.evaluate(entry=>{window.entries=[entry];return document.querySelector('test-nutrition-pane').loadDiary();},seed);
 await panel(page).getByRole('button',{name:'Clearable bearbeiten',exact:true}).click();
 const dialog=panel(page).getByRole('dialog');
 assert.equal(await dialog.getByLabel('Kohlenhydrate (g)',{exact:true}).inputValue(),'');
 await dialog.getByLabel('Protein (g)',{exact:true}).fill('');
 await dialog.getByRole('button',{name:'Speichern',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='update_meal'));
 const captured=(await calls(page)).find(c=>c.action==='update_meal');
 const real=backend({seed_entries:[seed],calls:[captured,{...captured,payload:{...captured.payload,request_id:captured.payload.request_id}}]});
 assert.deepEqual(real.results[0].entry.nutrients,{calories:250});
 assert.deepEqual(real.results[0],real.results[1]);
 assert.equal(real.results[0].entry.entry_id,seed.entry_id);
 assert.ok(['protein','carbs','fat'].every(key=>real.diary.nutrition_missing.includes(key)));
 await page.close();
});

test('primary aggregates label actual backend partial nutrition and suppress exact progress',async()=>{
 const page=await open();
 const real=backend({calls:[{action:'log_meal',payload:{name:'Only energy',meal_type:'snack',calories:250}}]});
 await page.evaluate(data=>{const original=window.hass.callWS;window.hass.callWS=msg=>msg.action==='diary'?Promise.resolve({...data,recommendation:{calorie_target:2000,protein:100,carbs:250,fat:60}}):original(msg);return document.querySelector('test-nutrition-pane').loadDiary();},real.diary);
 assert.match(await panel(page).locator('.metric.protein').innerText(),/Unvollständig.*bekannt/s);
 assert.equal(await panel(page).locator('.metric.protein progress').count(),0);
 assert.equal(await panel(page).locator('.metric.calories progress').count(),1);
 await panel(page).getByText('Alle Tagesnährwerte',{exact:true}).click();
 assert.match(await panel(page).locator('main').innerText(),/Unbekannt/);
 const seed={food_id:'fixture',name:'Only food energy',base_unit:'g',nutrients_per_100:{calories:100},servings:[],barcodes:[]};
 const food=backend({seed_food:seed,calls:[{action:'log_food',payload:{food_id:'fixture',amount:100,meal_type:'snack'}}]});
 await page.evaluate(data=>{window.hass.callWS=async()=>data;return document.querySelector('test-nutrition-pane').loadDiary();},food.diary);
 assert.match(await panel(page).locator('.metric.protein').innerText(),/Unvollständig/);
 await page.close();
});

test('food entry editing scales immutable entry snapshot without fetching current food',async()=>{
 const page=await open();
 await page.evaluate(()=>{window.entries=[{entry_id:'foodentry1',food_id:'milk1',name:'Historischer Drink',base_unit:'ml',amount:250,meal_type:'snack',calories:125,protein:5,nutrients:{calories:125,protein:5}}];return document.querySelector('test-nutrition-pane').loadDiary();});
 await panel(page).getByRole('button',{name:'Historischer Drink bearbeiten'}).click();
 const dialog=panel(page).getByRole('dialog');
 await dialog.getByLabel('Menge (ml)',{exact:true}).fill('500');
 await dialog.getByRole('button',{name:'Speichern',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='update_food_entry'));
 const update=(await calls(page)).find(c=>c.action==='update_food_entry');
 assert.equal(update.payload.entry_id,'foodentry1');assert.equal(update.payload.amount,500);assert.equal(update.payload.calories,undefined);
 assert.equal((await calls(page)).filter(c=>c.action==='food').length,0);
 await panel(page).getByRole('button',{name:'Historischer Drink kopieren'}).click();
 await dialog.getByLabel('Zieldatum',{exact:true}).fill('2026-10-15');
 await dialog.getByRole('button',{name:'Kopieren',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='copy_meal'));
 const copy=(await calls(page)).find(c=>c.action==='copy_meal').payload;
 assert.equal(copy.entry_id,'foodentry1');assert.equal(copy.date,'2026-10-15');assert.equal(copy.nutrients,undefined);
 await panel(page).getByRole('button',{name:'Historischer Drink löschen'}).click();
 await dialog.getByRole('button',{name:'Endgültig löschen'}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='delete_meal'));
 assert.equal((await calls(page)).find(c=>c.action==='delete_meal').payload.entry_id,'foodentry1');
 await page.close();
});

test('custom food form keeps per100 ml values, omits unknown nutrients and saves a named serving',async()=>{
 const page=await open();
 await panel(page).getByRole('button',{name:'Eigenes Lebensmittel',exact:true}).click();
 const dialog=panel(page).getByRole('dialog');
 await dialog.getByLabel('Name',{exact:true}).fill('Eigener Drink');
 await dialog.getByLabel('Basiseinheit',{exact:true}).selectOption('ml');
 await dialog.getByLabel('Energie (kcal)',{exact:true}).fill('43');
 await dialog.getByLabel('Ballaststoffe (g)',{exact:true}).fill('1.2');
 await dialog.getByLabel('Portionsname',{exact:true}).fill('Flasche');
 await dialog.getByLabel('Portionsgröße (g oder ml)',{exact:true}).fill('330');
 await dialog.getByRole('button',{name:'Speichern',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='save_food'));
 const capture=(await calls(page)).find(c=>c.action==='save_food');
 const real=backend({calls:[capture]});
 assert.equal(real.results[0].food.producer,null);
 assert.equal(real.state.foods[real.results[0].food.food_id].name,'Eigener Drink');
 const food=capture.payload.food;
 assert.equal(food.name,'Eigener Drink');assert.equal(food.base_unit,'ml');assert.equal(food.nutrients_per_100.calories,43);assert.equal(food.nutrients_per_100.protein,undefined);assert.equal(food.nutrients_per_100.fiber,1.2);assert.equal(food.servings[0].amount,330);assert.equal(food.servings[0].label,'Flasche');
 assert.ok(await panel(page).getByLabel('Menge (ml)',{exact:true}).count());
 await page.close();
});

test('extended nutrients use explicit mg and microgram units without treating missing nutrients as zero',async()=>{
 const page=await open();
 await panel(page).getByRole('button',{name:'Eigenes Lebensmittel',exact:true}).click();
 const dialog=panel(page).getByRole('dialog');
 await dialog.getByLabel('Name',{exact:true}).fill('Vitamine');
 await dialog.getByLabel('Energie (kcal)',{exact:true}).fill('100');
 await dialog.getByText('Weitere Nährstoffe',{exact:true}).click();
 await dialog.getByLabel('Vitamin C (mg)',{exact:true}).fill('12');
 await dialog.getByLabel('Vitamin B12 (µg)',{exact:true}).fill('2.4');
 await dialog.getByRole('button',{name:'Speichern',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='save_food'));
 const food=(await calls(page)).find(c=>c.action==='save_food').payload.food;
 assert.equal(food.nutrients_per_100.vitamin_c,12);assert.equal(food.nutrients_per_100.vitamin_b12,2.4);
 assert.match(await panel(page).locator('.food-detail').innerText(),/12 mg/);
 assert.match(await panel(page).locator('.food-detail').innerText(),/2,4 µg/);
 assert.match(await panel(page).locator('.food-detail').innerText(),/Unbekannt/);
 await page.close();
});

test('phone controls keep readable unbroken labels and compact adjacent online checkbox',async()=>{
 const page=await open();
 assert.ok((await panel(page).getByRole('button',{name:'Haferfrühstück bearbeiten'}).boundingBox()).height<=50);
 assert.ok((await panel(page).getByRole('heading',{name:'Dein Tagebuch'}).boundingBox()).height<=40);
 assert.ok((await panel(page).getByLabel('Online-Suche (Open Food Facts)').boundingBox()).width<=32);
 await panel(page).getByRole('button',{name:'Suchen',exact:true}).click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'long external product labels must wrap');
 await page.close();
});

test('real bundled ZXing decodes generated EAN13 pixels without BarcodeDetector',async()=>{
 const page=await open();
 const png=await require('bwip-js').toBuffer({bcid:'ean13',text:'4006381333931',scale:3,height:25,includetext:false,paddingwidth:12,paddingheight:12,backgroundcolor:'FFFFFF'});
 const decoded=await page.evaluate(async b64=>{
  window.BarcodeDetector=undefined;
  const {decodeSource}=await import('/macromate-assets/scanner.js');
  const image=new Image();image.src='data:image/png;base64,'+b64;await image.decode();
  return decodeSource(image);
 },png.toString('base64'));
 assert.equal(decoded,'4006381333931');
 for(const [bcid,text] of [['ean13','0012345678905'],['ean8','96385074']]){
  const png=await require('bwip-js').toBuffer({bcid,text,scale:3,height:25,paddingwidth:12,paddingheight:12,backgroundcolor:'FFFFFF'});
  const value=await page.evaluate(async b64=>{const {decodeSource}=await import('/macromate-assets/scanner.js');const image=new Image();image.src='data:image/png;base64,'+b64;await image.decode();return decodeSource(image);},png.toString('base64'));
  assert.equal(value,text,'preserve decoded EAN token including leading zero');
 }
 await page.close();
});

test('barcode manual input preserves leading zeros and scanner image input decodes pixels before lookup',async()=>{
 const page=await open();
 await page.evaluate(()=>{window.BarcodeDetector=undefined;});
 await panel(page).getByLabel('Barcode / EAN',{exact:true}).fill('012345678905');
 await panel(page).getByRole('button',{name:'Barcode suchen',exact:true}).click();
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='barcode'));
 assert.equal((await calls(page)).find(c=>c.action==='barcode').payload.barcode,'012345678905');
 assert.equal((await calls(page)).find(c=>c.action==='barcode').payload.online,false);
 await panel(page).getByLabel('Barcode / EAN',{exact:true}).fill('4006381333932');
 await panel(page).getByRole('button',{name:'Barcode suchen',exact:true}).click();
 assert.equal((await calls(page)).filter(c=>c.action==='barcode').length,1);
 assert.match(await panel(page).locator('main').innerText(),/Prüfziffer/);
 await panel(page).getByRole('button',{name:'EAN scannen',exact:true}).click();
 const png=await require('bwip-js').toBuffer({bcid:'ean13',text:'4006381333931',scale:3,height:25,includetext:false,paddingwidth:12,paddingheight:12,backgroundcolor:'FFFFFF'});
 await panel(page).getByLabel('Barcode-Bild auswählen',{exact:true}).setInputFiles({name:'synthetic-ean.png',mimeType:'image/png',buffer:png});
 await page.waitForFunction(()=>window.calls.some(c=>c.action==='barcode'&&c.payload.barcode==='4006381333931'));
 assert.equal(await panel(page).getByRole('dialog').count(),0);
 await page.close();
});

test('disconnecting the panel releases camera tracks and closes scanner even without a decoded result',async()=>{
 const page=await open();
 await page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;canvas.getContext('2d').fillRect(0,0,640,480);
  window.syntheticStream=canvas.captureStream(10);
  navigator.mediaDevices.getUserMedia=async()=>window.syntheticStream;
  window.BarcodeDetector=undefined;
 });
 await panel(page).getByRole('button',{name:'EAN scannen',exact:true}).click();
 await panel(page).getByRole('button',{name:'Kamera starten',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('test-nutrition-pane').shadowRoot.querySelector('video').srcObject!==null);
 await page.evaluate(()=>document.querySelector('test-nutrition-pane').remove());
 assert.equal(await page.evaluate(()=>window.syntheticStream.getTracks()[0].readyState),'ended');
 await page.close();
});

test('uncertain writes show a modal-safe explicit retry, retain request ID, and unlock only after success',async()=>{
 const page=await open();
 await page.evaluate(()=>{const original=window.hass.callWS;let fail=true;window.hass.callWS=async msg=>{if(msg.action==='log_meal'&&fail){fail=false;window.calls.push(structuredClone(msg));throw new Error('RAW PRIVATE LOG');}return original(msg);};});
 await panel(page).getByRole('button',{name:'Schnelleintrag',exact:true}).click();
 const dialog=panel(page).getByRole('dialog');
 await dialog.getByLabel('Name',{exact:true}).fill('Unsicher');await dialog.getByLabel('Energie (kcal)',{exact:true}).fill('42');
 await dialog.getByRole('button',{name:'Speichern',exact:true}).click();
 const retry=dialog.getByRole('button',{name:'Gleiche Anfrage erneut senden'});
 await retry.waitFor({state:'visible'});
 assert.equal((await calls(page)).filter(c=>c.action==='log_meal').length,1);
 assert.equal(await dialog.getByRole('button',{name:'Speichern',exact:true}).isDisabled(),true);
 assert.doesNotMatch(await dialog.innerText(),/RAW PRIVATE LOG/);
 const readsBefore=(await calls(page)).filter(c=>c.action==='diary').length;
 await page.evaluate(()=>{for(let n=0;n<10;n++)window.emitUpdate();});await page.waitForTimeout(250);
 assert.equal((await calls(page)).filter(c=>c.action==='diary').length,readsBefore,'background refresh cannot overlap an uncertain write');
 assert.equal((await calls(page)).filter(c=>c.action==='log_meal').length,1,'no automatic writer retry');
 await retry.click();
 await page.waitForFunction(()=>document.querySelector('test-nutrition-pane').client.pending===null);
 const writes=(await calls(page)).filter(c=>c.action==='log_meal');assert.equal(writes.length,2);assert.deepEqual(writes[1],writes[0]);
 assert.equal(await panel(page).getByRole('dialog').count(),0);
 assert.equal(await panel(page).getByRole('button',{name:'Schnelleintrag',exact:true}).isEnabled(),true);
 await page.evaluate(()=>{window.permissionError=true;return document.querySelector('test-nutrition-pane').loadDiary();});
 assert.match(await panel(page).locator('.message').innerText(),/Administratoren/);
 assert.doesNotMatch(await panel(page).locator('.message').innerText(),/SECRET/);
 await page.close();
});

test('actual getUserMedia video frames from Chromium virtual camera decode EAN and stop on result',async()=>{
 assert.ok(process.env.TMPDIR,'set TMPDIR to private scratch');
 const directory=await mkdtemp(process.env.TMPDIR+'/macromate-camera-');let cameraBrowser;
 try{
  const png=await require('bwip-js').toBuffer({bcid:'ean13',text:'4006381333931',scale:4,height:25,includetext:false,paddingwidth:18,paddingheight:18,backgroundcolor:'FFFFFF'});
  await writeFile(directory+'/ean.png',png);
  const video=spawnSync('ffmpeg',['-v','error','-loop','1','-i',directory+'/ean.png','-vf','scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p','-t','2','-r','10','-f','yuv4mpegpipe',directory+'/ean.y4m'],{encoding:'utf8'});
  assert.equal(video.status,0,video.stderr);
  cameraBrowser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-file-for-fake-video-capture='+directory+'/ean.y4m']});
  const page=await cameraBrowser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.BarcodeDetector=undefined;const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=async constraints=>{window.actualStream=await original(constraints);return window.actualStream;};});
  await page.goto(base);
  await panel(page).getByRole('button',{name:'EAN scannen',exact:true}).click();
  await panel(page).getByRole('button',{name:'Kamera starten',exact:true}).click();
  await page.waitForFunction(()=>window.calls.some(c=>c.action==='barcode'&&c.payload.barcode==='4006381333931'),{},{timeout:15000});
  assert.equal(await page.evaluate(()=>window.actualStream.getTracks().every(t=>t.readyState==='ended')),true);
  assert.deepEqual(errors,[]);
  await mkdir('tests/frontend/evidence',{recursive:true});
  await page.screenshot({path:'tests/frontend/evidence/macromate-mobile.png',fullPage:true});
  await page.setViewportSize({width:1280,height:900});
  await page.screenshot({path:'tests/frontend/evidence/macromate-desktop.png',fullPage:true});
 }finally{await cameraBrowser?.close();await rm(directory,{recursive:true,force:true});}
});

test('live events coalesce external updates without overlapping reads and clean up on disconnect',async()=>{
 const page=await open();
 await page.evaluate(()=>{const original=window.hass.callWS;window.release=null;window.hass.callWS=msg=>msg.action==='diary'?new Promise(resolve=>{window.calls.push(structuredClone(msg));window.release=()=>resolve({date:'2026-10-14',today:'2026-10-14',entries:[],totals:{calories:123},meals:{},nutrition_missing:[]});}):original(msg);for(let n=0;n<20;n++)window.emitUpdate();});
 await page.waitForFunction(()=>window.release!==null,{},{timeout:2000});
 assert.equal((await calls(page)).filter(c=>c.action==='diary').length,2);
 await page.evaluate(()=>{for(let n=0;n<20;n++)window.emitUpdate();});
 await page.waitForTimeout(250);
 assert.equal((await calls(page)).filter(c=>c.action==='diary').length,2);
 await page.evaluate(()=>{window.release();window.release=null;});
 await page.waitForFunction(()=>window.release!==null);
 assert.equal((await calls(page)).filter(c=>c.action==='diary').length,3);
 await page.evaluate(()=>{window.release();document.querySelector('test-nutrition-pane').remove();window.emitUpdate();});
 assert.equal(await page.evaluate(()=>window.unsubscribed),1);
 const count=(await calls(page)).length;await page.waitForTimeout(250);assert.equal((await calls(page)).length,count);
 await page.close();
});

test('live connection replacement discards stale reads and unsubscribes late subscriptions',async()=>{
 const page=await open();
 await page.evaluate(()=>{
  const app=document.querySelector('test-nutrition-pane');
  const original=window.hass.callWS;
  window.lateUnsub=0;
  app.hass={...window.hass,connection:{subscribeEvents:()=>new Promise(resolve=>window.finishSubscribe=()=>resolve(()=>window.lateUnsub++))},callWS:msg=>msg.action==='diary'?new Promise(resolve=>{window.finishOldRead=()=>resolve({date:'OLD',today:'OLD',entries:[],totals:{},meals:{}});}):original(msg)};
 });
 await page.waitForFunction(()=>!!window.finishOldRead&&!!window.finishSubscribe,{},{timeout:2000});
 await page.evaluate(()=>{const app=document.querySelector('test-nutrition-pane');app.hass=window.hass;window.finishSubscribe();window.finishOldRead();});
 await page.waitForFunction(()=>document.querySelector('test-nutrition-pane').date==='2026-10-14');
 assert.equal(await page.evaluate(()=>window.lateUnsub),1);
 assert.equal(await page.evaluate(()=>window.unsubscribed),1);
 await page.close();
});

test('nonadmins make no reads or subscriptions and downgrade clears private panel state',async()=>{
 const page=await open();
 await page.evaluate(()=>{const app=document.querySelector('test-nutrition-pane');app.hass={...window.hass,user:{id:'reader',is_admin:false}};window.emitUpdate();});
 assert.equal(await page.evaluate(()=>window.updateListeners.size),0);
 assert.doesNotMatch(await panel(page).locator('main').innerText(),/Haferfrühstück/);
 const count=(await calls(page)).length;
 await page.evaluate(()=>document.querySelector('test-nutrition-pane').loadDiary());
 await page.waitForTimeout(250);assert.equal((await calls(page)).length,count);
 await page.close();
 const guest=await browser.newPage();await guest.addInitScript(()=>window.testAdmin=false);await guest.goto(base);
 await guest.waitForTimeout(250);
 assert.deepEqual(await calls(guest),[]);assert.equal(await guest.evaluate(()=>window.updateListeners.size),0);
 await guest.close();
});

async function delayedFoodContext(page,action,change,{reject=false}={}){
 return page.evaluate(async({action,change,reject})=>{
  const app=document.querySelector('test-nutrition-pane');
  const original=window.hass.callWS;
  let resolve,rejectRead;
  app.hass={...window.hass,callWS:msg=>{
   if(msg.action!==action)return original(msg);
   window.calls.push(structuredClone(msg));
   return new Promise((yes,no)=>{resolve=yes;rejectRead=no;});
  }};
  app.foodBrowser.showResults({foods:[window.product],source:'old context'});
  app.foodBrowser.showFood(window.product);
  const read=action==='food'?app.foodBrowser.pick('milk1'):action==='barcode'?app.barcode.lookup('4006381333931'):app.foodBrowser.search();
  const pending={action:'log_meal',payload:{name:'Uncertain',request_id:'keep-logical-write'}};
  app.client.pending=pending;
  const replacement={...window.hass};
  if(change==='downgrade')replacement.user={id:'reader',is_admin:false};
  if(change==='identity'||change==='both')replacement.user={id:'replacement-admin',is_admin:true};
  if(change==='connection'||change==='both')replacement.connection={subscribeEvents:async()=>()=>{}};
  app.hass=replacement;
  const snapshot=()=>({results:app.foodBrowser.results.textContent,detail:app.foodBrowser.detail.textContent,food:app.foodBrowser.food??null,hidden:app.workspace.hidden,message:app.message.textContent});
  const before=snapshot();
  if(reject)rejectRead({code:'not_found'});
  else {const food={...window.product,name:'STALE PRIVATE FOOD'};resolve(action==='food'?{food}:{foods:[food],source:'stale private'});}
  await read;
  const after=snapshot();
  const pendingIntact=app.client.pending===pending;
  const writes=window.calls.filter(c=>c.action==='log_meal').length;
  app.client.pending=null;
  if(change!=='downgrade'){
   if(action==='food')await app.foodBrowser.pick('milk1');
   else if(action==='barcode')await app.barcode.lookup('4006381333931');
   else await app.foodBrowser.search();
  }
  return {before,after,pendingIntact,writes,fresh:snapshot()};
 },{action,change,reject});
}
function assertFoodContextCleared(result,downgrade){
 for(const [phase,state] of Object.entries({before:result.before,after:result.after})){
  assert.equal(state.results,'',phase+' results must remain cleared');
  assert.equal(state.detail,'',phase+' detail must remain cleared');
  assert.equal(state.food,null,phase+' food model must remain cleared');
  assert.equal(state.hidden,downgrade);
 }
 assert.equal(result.after.message,result.before.message,'stale completion must not replace current context status');
 assert.equal(result.pendingIntact,true,'logical write must remain untouched');
 assert.equal(result.writes,0,'context replacement must not retry logical writes');
 if(!downgrade)assert.match(result.fresh.results+result.fresh.detail,/Haferdrink/,'new context food reads still work');
}

test('delayed food search cannot restore DOM or model after admin downgrade',async()=>{
 const page=await open();
 try{assertFoodContextCleared(await delayedFoodContext(page,'search_foods','downgrade'),true);}finally{await page.close();}
});

test('delayed food detail cannot restore DOM or model after authorized context replacement',async()=>{
 const page=await open();
 try{assertFoodContextCleared(await delayedFoodContext(page,'food','both'),false);}finally{await page.close();}
});

test('delayed food detail failure cannot replace status after admin downgrade',async()=>{
 const page=await open();
 try{assertFoodContextCleared(await delayedFoodContext(page,'food','downgrade',{reject:true}),true);}finally{await page.close();}
});

test('delayed barcode food failure cannot replace status after admin downgrade',async()=>{
 const page=await open();
 try{assertFoodContextCleared(await delayedFoodContext(page,'barcode','downgrade',{reject:true}),true);}finally{await page.close();}
});

for(const action of ['search_foods','food','barcode']){
 for(const change of ['downgrade','identity','connection','both']){
  for(const reject of [false,true]){
   // The initial tracer bullets above cover these exact cases.
   if((action==='search_foods'&&change==='downgrade'&&!reject)||(action==='food'&&change==='both'&&!reject)||(['food','barcode'].includes(action)&&change==='downgrade'&&reject))continue;
   test(`delayed ${action} ${reject?'failure':'response'} stays cleared after ${change}`,async()=>{
    const page=await open();
    try{assertFoodContextCleared(await delayedFoodContext(page,action,change,{reject}),change==='downgrade');}finally{await page.close();}
   });
  }
 }
 test(`delayed ${action} completion checks captured authorization, identity and connection`,async()=>{
  const page=await open();
  try{
   for(const change of ['authorization','identity','connection','disconnect']){
    const state=await page.evaluate(async({action,change})=>{
     const app=document.querySelector('test-nutrition-pane');app.hass={...window.hass,user:{id:'admin',is_admin:true}};
     const original=window.hass.callWS;let resolve;
     app.hass={...app.hass,callWS:msg=>msg.action===action?new Promise(yes=>resolve=yes):original(msg)};
     const browser=app.foodBrowser;browser.invalidate();
     const pending=action==='food'?browser.pick('milk1'):action==='barcode'?app.barcode.lookup('4006381333931'):browser.search();
     const generation=browser.sequence;
     // Mutate in place to prove the captured context guard independently of setter invalidation.
     if(change==='authorization')app.hass.user.is_admin=false;
     if(change==='identity')app.hass.user.id='other-admin';
     if(change==='connection')app.hass.connection={};
     if(change==='disconnect')app.remove();
     const food={...window.product,name:'STALE PRIVATE FOOD'};resolve(action==='food'?{food}:{foods:[food]});await pending;
     const state={results:browser.results.textContent,detail:browser.detail.textContent,food:browser.food,generationUnchanged:browser.sequence===generation};
     if(change==='disconnect')document.body.append(app);
     return state;
    },{action,change});
    assert.equal(state.results,'',change);assert.equal(state.detail,'',change);assert.equal(state.food,null,change);
    assert.equal(state.generationUnchanged,change!=='disconnect','guard must check context, not only generation');
   }
  }finally{await page.close();}
 });
}

test('ordinary hass state updates preserve pending food reads in the same authorized context',async()=>{
 const page=await open();
 try{
  const state=await page.evaluate(async()=>{
   const app=document.querySelector('test-nutrition-pane');const original=window.hass.callWS;let resolve;
   app.hass={...window.hass,callWS:msg=>msg.action==='food'?new Promise(yes=>resolve=yes):original(msg)};
   const read=app.foodBrowser.pick('milk1');const sequence=app.foodBrowser.sequence;
   app.hass={...app.hass,states:{}};resolve({food:window.product});await read;
   return {name:app.foodBrowser.food?.name,sequenceUnchanged:sequence===app.foodBrowser.sequence};
  });
  assert.match(state.name,/Haferdrink/);assert.equal(state.sequenceUnchanged,true);
 }finally{await page.close();}
});

test('bounded fallback follows HA-local today but preserves explicitly selected history',async()=>{
 const page=await open();await page.clock.install();
 await page.evaluate(()=>{const app=document.querySelector('test-nutrition-pane');const original=window.hass.callWS;window.backendToday='2026-10-14';window.fallbackCalls=0;app.hass={...window.hass,connection:null,callWS:async msg=>{if(msg.action!=='diary')return original(msg);window.fallbackCalls++;return {date:msg.payload.date||window.backendToday,today:window.backendToday,entries:[],totals:{calories:987},nutrition_missing:[],meals:{}};}};});
 await page.waitForFunction(()=>window.fallbackCalls===1);
 await page.evaluate(()=>window.backendToday='2026-10-15');
 await page.clock.runFor(60200);
 assert.equal(await page.evaluate(()=>document.querySelector('test-nutrition-pane').date),'2026-10-15');
 assert.equal(await page.evaluate(()=>window.fallbackCalls),2);
 await page.evaluate(()=>document.querySelector('test-nutrition-pane').loadDiary('2026-10-12'));
 await page.evaluate(()=>window.backendToday='2026-10-16');
 await page.clock.runFor(60200);
 assert.equal(await page.evaluate(()=>document.querySelector('test-nutrition-pane').date),'2026-10-12');
 assert.equal(await page.evaluate(()=>document.querySelector('test-nutrition-pane').today),'2026-10-16');
 await page.evaluate(()=>document.querySelector('test-nutrition-pane').remove());
 const count=await page.evaluate(()=>window.fallbackCalls);await page.clock.runFor(180000);
 assert.equal(await page.evaluate(()=>window.fallbackCalls),count);
 await page.close();
});

test('subscription setup failure falls back without uncaught browser errors',async()=>{
 const page=await open();await page.clock.install();
 await page.evaluate(()=>{const app=document.querySelector('test-nutrition-pane');app.hass={...window.hass,connection:{subscribeEvents(){throw Error('subscription unavailable');}}};});
 const count=(await calls(page)).filter(c=>c.action==='diary').length;
 await page.clock.runFor(60200);
 assert.equal((await calls(page)).filter(c=>c.action==='diary').length,count+1);
 await page.close();
});

test('live refresh waits for an open edit dialog to close before disabling write controls',async()=>{
 const page=await open();
 await panel(page).getByRole('button',{name:'Schnelleintrag',exact:true}).click();
 const count=(await calls(page)).filter(c=>c.action==='diary').length;
 await page.evaluate(()=>window.emitUpdate());await page.waitForTimeout(250);
 assert.equal((await calls(page)).filter(c=>c.action==='diary').length,count);
 await panel(page).getByRole('dialog').getByRole('button',{name:'Abbrechen',exact:true}).click();
 await page.waitForFunction(n=>window.calls.filter(c=>c.action==='diary').length===n+1,count);
 await page.close();
});

test('pending diary date changes block writes and ignore late stale responses',async()=>{
 const page=await open();
 await page.evaluate(()=>{const original=window.hass.callWS;window.waiting=[];window.hass.callWS=msg=>msg.action==='diary'?new Promise(resolve=>window.waiting.push(()=>original(msg).then(resolve))):original(msg);const app=document.querySelector('test-nutrition-pane');window.firstLoad=app.loadDiary('2026-10-12');window.secondLoad=app.loadDiary('2026-10-13');});
 assert.equal(await panel(page).getByRole('button',{name:'Schnelleintrag',exact:true}).isDisabled(),true);
 await page.evaluate(async()=>{window.waiting[1]();await window.secondLoad;});
 assert.equal(await page.evaluate(()=>document.querySelector('test-nutrition-pane').date),'2026-10-13');
 await page.evaluate(async()=>{window.waiting[0]();await window.firstLoad;});
 assert.equal(await page.evaluate(()=>document.querySelector('test-nutrition-pane').date),'2026-10-13');
 assert.equal(await panel(page).getByRole('button',{name:'Schnelleintrag',exact:true}).isEnabled(),true);
 await page.close();
});
