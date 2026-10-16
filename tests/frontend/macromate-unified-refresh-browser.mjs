// Real Chromium -> actual HA coordinator/atomic Store. Event delivery bridge is
// synthetic: the coordinator's real durable-publication callback is delivered
// before resolving callWS, deterministically reproducing native HA ordering.
// This is not full native HA transport/dashboard acceptance.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
if(!process.env.HA_PYTHON||!process.env.EVIDENCE_DIR||!process.env.PLAYWRIGHT_DIR)throw Error('Set HA_PYTHON, PLAYWRIGHT_DIR and task-private EVIDENCE_DIR.');
const root=resolve(new URL('../..',import.meta.url).pathname);
const {chromium}=await import(resolve(process.env.PLAYWRIGHT_DIR,'playwright/index.mjs'));
const python=`
import sys,json,types,importlib,pathlib,asyncio,tempfile
from homeassistant.core import HomeAssistant
root=pathlib.Path(sys.argv[1]);evidence=pathlib.Path(sys.argv[2]);evidence.mkdir(parents=True,exist_ok=True)
pkg=types.ModuleType('refresh_fixture');pkg.__path__=[str(root/'custom_components/macromate')];sys.modules['refresh_fixture']=pkg
p=importlib.import_module('refresh_fixture.platform_support');r=importlib.import_module('refresh_fixture.recipes');s=importlib.import_module('refresh_fixture.shopping');c=importlib.import_module('refresh_fixture.coordinator')
async def main():
 with tempfile.TemporaryDirectory(prefix='refresh-coordinator-',dir=str(evidence))as directory:
  hass=HomeAssistant(directory);hass.config.time_zone='Europe/Berlin';coordinator=c.MealTrackerCoordinator(hass,{'weight_entity':'','active_calories_entity':''});await coordinator.async_load();actor=p.Actor('refresh-admin',True);events=[]
  def published():
   raw=json.loads((pathlib.Path(directory)/'.storage/macromate.meals').read_text())
   assert raw['data']==coordinator._state(),'Event must follow durable acceptance'
   events.append({'event':'refresh','durable':True,'recipe_ids':list(raw['data']['kitchen']['recipes'])})
  release=coordinator.async_add_listener(published)
  while True:
   line=await asyncio.to_thread(sys.stdin.readline)
   if not line:break
   events.clear()
   try:
    m=json.loads(line);a=m['action'];payload=m.get('payload',{});now='2026-10-14T12:00:00+00:00'
    if a=='STORE_READ':result=json.loads((pathlib.Path(directory)/'.storage/macromate.meals').read_text())
    elif a=='describe':result={'actions':dict(r.RECIPE_ACTIONS,**s.SHOPPING_ACTIONS)}
    elif a=='preferences_get':result={'preferences':coordinator.kitchen['preferences'].get(actor.owner_id,{})}
    elif a in r.RECIPE_ACTIONS and r.RECIPE_ACTIONS[a]['read_only']:result=r.recipe_command(coordinator.kitchen,a,payload,actor,now)
    elif a in s.SHOPPING_ACTIONS and s.SHOPPING_ACTIONS[a]['read_only']:result=s.shopping_command(coordinator.kitchen,a,payload,actor,now)
    else:result=await coordinator.async_command(a,payload,actor=actor)
    print(json.dumps({'result':result,'events':events}),flush=True)
   except Exception as error:print(json.dumps({'error':{'code':'invalid_request','message':str(error)}}),flush=True)
  release();await hass.async_stop()
asyncio.run(main())
`;
await mkdir(process.env.EVIDENCE_DIR,{recursive:true});
const broker=spawn(process.env.HA_PYTHON,['-u','-c',python,root,process.env.EVIDENCE_DIR],{stdio:['pipe','pipe','pipe']});
const waiting=[];let diagnostics='';
broker.stderr.on('data',v=>diagnostics+=v);
createInterface({input:broker.stdout}).on('line',line=>waiting.shift()?.(JSON.parse(line)));
broker.on('exit',code=>{for(const done of waiting.splice(0))done({error:{code:'broker_failed',message:diagnostics||String(code)}});});
const domain=m=>new Promise(done=>{waiting.push(done);broker.stdin.write(JSON.stringify(m)+'\n');});
const captured=[];
const server=createServer(async(req,res)=>{try{
 if(req.url==='/refresh-command'){let text='';for await(const chunk of req)text+=chunk;const command=JSON.parse(text);captured.push(command);const output=await domain(command);res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(output));}
 const path=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]).replace('/macromate-assets/','/frontend/'));
 if(!path.startsWith(root+'/'))throw Error();
 res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));
}catch{res.writeHead(404).end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
let page;const evidence={scope:'Real Chromium and HA coordinator Store; synthetic event delivery before native-shaped mutation response',nativeTransport:false,checks:[]};
try{
 const seed=await domain({action:'recipes_add',payload:{request_id:'refresh-seed-recipe',name:'Refresh soup',servings:2,ingredients:[{name:'Carrots',amount:'2',unit:'g'}]}});
 assert.ok(!seed.error,JSON.stringify(seed));
 page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/tests/frontend/macromate-unified-fixture.html`);
 await page.waitForFunction(()=>window.ready);
 await page.evaluate(()=>{
  window.refreshTrace=[];window.refreshCallbacks=new Set();
  window.emitRefresh=event=>{for(const callback of window.refreshCallbacks){window.refreshTrace.push({phase:'event-before-response',pending:!!card.api.pending,busy:card.api.busy,durable:event.durable});callback(event);}};
  card.hass={...hass,user:{id:'refresh-admin',is_admin:true},connection:{subscribeMessage:async callback=>{window.refreshCallbacks.add(callback);return()=>window.refreshCallbacks.delete(callback);}},callWS:async message=>{
   const response=await fetch('/refresh-command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(message)});const output=await response.json();if(output.error)throw output.error;
   for(const event of output.events||[])window.emitRefresh(event);
   if(window.holdListRead&&message.action==='recipes_get_all'){window.listReadHeld=true;await new Promise(done=>window.releaseListRead=done);window.listReadHeld=false;}
   if(window.holdResponse&&message.action==='recipes_add'){window.responseHeld=true;await new Promise(done=>window.releaseResponse=done);window.responseHeld=false;}
   if(window.loseResponse&&message.action==='recipes_add'){window.loseResponse=false;throw Error('Genuine durable response deliberately lost');}
   return output.result;
  }};
 });
 await page.waitForFunction(()=>card.api.actions.recipes_add&&window.refreshCallbacks.size>0&&!card.application._loading);
 await page.evaluate(()=>{window.acceptedTrace=[];card.api.addEventListener('accepted',()=>window.acceptedTrace.push({pending:!!card.api.pending,busy:card.api.busy,current:card.api.current()}));});
 // Explicit API mutation; dedicated recipe editor and planner draft tests follow.
 await page.evaluate(()=>{window.holdResponse=true;window.writeResult=card.api.call('recipes_add',{name:'Event before response'});});
 await page.waitForFunction(()=>window.responseHeld);
 const store=(await domain({action:'STORE_READ'})).result;
 const created=Object.values(store.data.kitchen.recipes).find(list=>list.name==='Event before response');
 assert.ok(created,'Created recipe exists in independent atomic Store before response');
 const trace=await page.evaluate(()=>window.refreshTrace);
 assert.ok(trace.some(row=>row.pending&&row.busy&&row.durable),'Real durable event callback arrives with mutation pending');
 assert.equal(await page.evaluate(()=>card.application._recipes.some(list=>list.name==='Event before response')),false,'Refresh reads remain deferred while response is pending');
 const readsBefore=captured.filter(m=>m.action==='recipes_get_all').length;
 await page.evaluate(()=>{card.application._searchQuery='Unsubmitted follow-up draft';});
 await page.evaluate(()=>{window.holdResponse=false;window.releaseResponse();});
 await page.waitForFunction(()=>!card.api.pending&&!card.api.busy);
 await page.waitForFunction(()=>card.application._recipes.some(list=>list.name==='Event before response'),{},{timeout:3000});
 assert.equal(captured.filter(m=>m.action==='recipes_get_all').length-readsBefore,1,'One post-acceptance recipe read, not an event/response read storm');
 evidence.acceptedTrace=await page.evaluate(()=>window.acceptedTrace);
 assert.deepEqual(evidence.acceptedTrace,[{pending:false,busy:false,current:true}],'Accepted notification occurs exactly once after both pending and busy clear');
 assert.equal(await page.evaluate(()=>card.application._searchQuery),'Unsubmitted follow-up draft');
 await page.evaluate(()=>{card.application._searchQuery='';});
 await page.getByRole('button',{name:'Home',exact:true}).click();
 await page.getByText('Refresh soup',{exact:true}).first().click();
 const detail=page.locator('rm-recipe-detail');
 assert.equal(await detail.locator('.shopping-section').count(),0);
 evidence.checks.push('durable event-before-response -> one accepted read -> recipe library, schema draft/focus retained');
 // An open recipe editor must not suppress deferred recipe reads or lose typed data.
 await detail.evaluate(d=>d._startEdit());
 const calories=detail.getByLabel('Declared calories (kcal)',{exact:true});
 await calories.fill('321');await calories.focus();
 const externalList=await domain({action:'recipes_add',payload:{request_id:'refresh-external-list',name:'Published while editing'}});
 assert.ok(externalList.events[0].durable);
 const readsWhileEditing=captured.filter(m=>m.action==='recipes_get_all').length;
 await page.evaluate(events=>{for(let i=0;i<20;i++)for(const event of events)window.emitRefresh(event);},externalList.events);
 await page.waitForFunction(()=>!card.application._refreshRunning&&!card.application._refreshScheduled);
 assert.equal(captured.filter(m=>m.action==='recipes_get_all').length,readsWhileEditing,'Dirty recipe context defers replacement reads even during event bursts');
 assert.equal(await calories.inputValue(),'321');
 assert.equal(await calories.evaluate(n=>n.getRootNode().activeElement===n),true);
 assert.equal(await detail.evaluate(d=>d._editing),true);
 evidence.checks.push('event burst coalesces while recipe editor remains dirty and focused');
 const recipeId=await detail.evaluate(d=>d.recipe.id);
 const recipeUpdate=await domain({action:'recipes_update',payload:{request_id:'refresh-external-recipe',recipe_id:recipeId,name:'Published recipe rename'}});
 const recipeReads=captured.filter(m=>m.action==='recipes_get_all').length;
 await page.evaluate(events=>{for(const event of events)window.emitRefresh(event);},recipeUpdate.events);
 await page.waitForFunction(()=>!card.application._refreshRunning&&!card.application._refreshScheduled);
 assert.equal(captured.filter(m=>m.action==='recipes_get_all').length,recipeReads,'Recipe replacement reads defer during editing');
 assert.equal(await calories.inputValue(),'321');
 await page.getByRole('button',{name:'Home',exact:true}).click();
 await page.getByText('Published recipe rename',{exact:true}).first().waitFor({timeout:3000});
 assert.equal(captured.filter(m=>m.action==='recipes_get_all').length-recipeReads,1,'Deferred recipe read resumes once the protected context closes');
 evidence.checks.push('recipe refresh deferred while editing and resumed after leaving the recipe context');
 await page.getByRole('button',{name:'Meal Planner',exact:true}).click();
 const planner=page.locator('rm-meal-planner');
 await planner.evaluate(async p=>{p._weekStart='2026-09-07';await p.updateComplete;p._openPicker('2026-09-09','lunch');p._pickerSearch='typed planner query';p._pickerServings=1.5;});
 await page.evaluate(events=>{for(let i=0;i<10;i++)for(const event of events)window.emitRefresh(event);},externalList.events);
 await page.waitForFunction(()=>!card.application._refreshRunning&&!card.application._refreshScheduled);
 assert.deepEqual(await planner.evaluate(p=>({week:p._weekStart,target:p._pickerTarget,query:p._pickerSearch,servings:p._pickerServings})),{week:'2026-09-07',target:{date:'2026-09-09',mealType:'lunch'},query:'typed planner query',servings:1.5});
 evidence.checks.push('safe refresh preserves planner date, open picker, query and servings');
 // Ambiguous acceptance is still held until one explicit same-request retry.
 await page.getByRole('button',{name:'Home',exact:true}).click();
 await page.evaluate(()=>window.loseResponse=true);
 const uncertainReads=captured.filter(m=>m.action==='recipes_get_all').length;
 await page.evaluate(()=>{window.writeResult=card.api.call('recipes_add',{name:'Lost accepted response'}).catch(()=>null);});
 const retry=page.locator('macromate-card .status').getByRole('button',{name:'Retry same request',exact:true});
 await retry.waitFor();
 const pending=await page.evaluate(()=>structuredClone(card.api.pending));
 assert.ok(pending.payload.request_id);
 assert.ok(Object.values((await domain({action:'STORE_READ'})).result.data.kitchen.recipes).some(list=>list.name==='Lost accepted response'));
 await page.evaluate(events=>{for(let i=0;i<10;i++)for(const event of events)window.emitRefresh(event);},externalList.events);
 await page.waitForTimeout(200);
 assert.deepEqual(await page.evaluate(()=>card.api.pending),pending);
 assert.equal(captured.filter(m=>m.action==='recipes_get_all').length,uncertainReads,'Uncertain pending blocks refresh reads');
 assert.equal(captured.filter(m=>m.action==='recipes_add'&&m.payload.name==='Lost accepted response').length,1,'No automatic write replay');
 await retry.click();
 await page.waitForFunction(()=>!card.api.pending&&!card.application._loading&&card.application._recipes.some(list=>list.name==='Lost accepted response'));
 const replay=captured.filter(m=>m.action==='recipes_add'&&m.payload.name==='Lost accepted response');
 assert.equal(replay.length,2);assert.deepEqual(replay[0],replay[1]);
 assert.equal(Object.values((await domain({action:'STORE_READ'})).result.data.kitchen.recipes).filter(list=>list.name==='Lost accepted response').length,1);
 assert.equal(await page.evaluate(()=>card.application._view),'grid','Explicit accepted recipe creation returns to the library');
 evidence.checks.push('uncertain accepted write retains stable UUID/payload, blocks automatic reads/writes and replays only by explicit retry without duplication');
 // Hold a read after it has reached the real coordinator, then invalidate the
 // account in-place. The captured old model must never commit or notify locally.
 await page.evaluate(()=>{
  window.acceptedStates=[];card.api.addEventListener('accepted',()=>window.acceptedStates.push({pending:!!card.api.pending,busy:card.api.busy}));
  const call=card.api.hass.callWS;card.api.hass.callWS=async message=>{
   const output=await call(message);
   if(window.holdRead&&message.action==='recipes_get_all'){window.readHeld=true;await new Promise(done=>window.releaseRead=done);window.readHeld=false;}
   return output;
  };window.holdRead=true;window.oldApp=card.application;window.oldLists=card.application._recipes;window.emitRefresh({event:'refresh',durable:true});
 });
 await page.waitForFunction(()=>window.readHeld);
 await page.evaluate(()=>{card.api.hass.user.id='revoked-in-place';window.holdRead=false;window.releaseRead();});
 await page.waitForFunction(()=>!window.oldApp._refreshRunning);
 assert.equal(await page.evaluate(()=>window.oldApp._recipes===window.oldLists),true,'Old-context read response never commits');
 assert.deepEqual(await page.evaluate(()=>window.acceptedStates),[],'Reads and context-invalid completions never announce accepted writes');
 await page.evaluate(()=>card.remove());
 assert.equal(await page.evaluate(()=>window.refreshCallbacks.size),0,'Native and local refresh callbacks are released on removal');
 evidence.checks.push('in-place account invalidation rejects late read adoption and removal releases subscriptions');
 assert.deepEqual(errors,[]);
 evidence.trace=trace;evidence.recipe_id=created.id;evidence.postAcceptanceRecipeReads=1;
 console.log('PASS: durable event-before-response race refreshes recipe library with one deferred read; dedicated recipe/planner drafts and explicit retry remain safe');
}finally{
 evidence.commands=captured;
 await writeFile(resolve(process.env.EVIDENCE_DIR,'refresh-regression-evidence.json'),JSON.stringify(evidence,null,2)+'\n');
 await browser.close();await new Promise(done=>server.close(done));broker.stdin.end();
 await new Promise(done=>{broker.once('exit',done);setTimeout(()=>{broker.kill();done();},5000).unref();});
 if(diagnostics)console.error(diagnostics);
}
