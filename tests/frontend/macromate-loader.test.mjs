import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createContext, Script} from 'node:vm';

// Run the actual loader with only its dynamic runtime-graph import injected.
// The fake registry replacement reproduces HA's scoped-registry bootstrap
// without network access, a browser, or timing-dependent real-time sleeps.
const source=await readFile(new URL('./macromate-loader.js',import.meta.url),'utf8');
function registry(){
 const definitions=new Map();
 return {get:name=>definitions.get(name),define(name,value){
  assert.ok(!definitions.has(name),`Duplicate definition: ${name}`);
  definitions.set(name,value);
 },whenDefined(){throw Error('Cannot wait on a registry that HA may replace');}};
}
function fixture({shell=true,ready=false,fail=false}={}){
 const timers=[],events=[],nodes=new Map();
 let now=0,imports=0;
 const window={customElements:registry(),dispatchEvent:event=>events.push(event)};
 if(ready)window.customElements.define('home-assistant',class{});
 const context=createContext({window,Date:{now:()=>now},Symbol,
  CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail;}},
  document:{querySelector:name=>shell&&name==='home-assistant'?{}:null,
   getElementById:id=>nodes.get(id),
   createElement:()=>({style:{},setAttribute(){}}),
   body:{append:node=>nodes.set(node.id,node)}},
  setTimeout:(callback,delay)=>timers.push({callback,delay}),
  loadRuntime:async()=>{
   imports++;
   if(fail)throw Error('Missing runtime graph');
   class MacroMateCard{}
   window.customElements.define('macromate-card',MacroMateCard);
   return {MacroMateCard};
  },
 });
 Object.defineProperty(context,'customElements',{get:()=>window.customElements});
 return {window,events,timers,nodes,get imports(){return imports;},
  run(revision='current'){
   const script=source.replaceAll('__REVISION__',revision).replace("import('__RUNTIME__')",'loadRuntime()');
   return new Script(`(async()=>{${script}\n})()`).runInContext(context);
  },
  async tick(elapsed){
   const timer=timers.shift();assert.ok(timer,'Expected a pending bootstrap check');
   now+=elapsed??timer.delay;timer.callback();
   // Flush promise jobs in the context before inspecting its next timer/import.
   await new Promise(resolve=>setImmediate(resolve));
  },
 };
}

test('cold HA bootstrap registers the card only after the active registry is ready',async()=>{
 const f=fixture(),native=f.window.customElements;
 const first=f.run(),duplicate=f.run();
 assert.equal(f.imports,0,'No runtime dependency may execute before HA replaces the registry');
 await f.tick();
 f.window.customElements=registry();
 await f.tick();
 assert.equal(f.imports,0,'Registry replacement alone is not frontend readiness');
 f.window.customElements.define('home-assistant',class{});
 while(f.timers.length)await f.tick();
 await Promise.all([first,duplicate]);
 assert.equal(native.get('macromate-card'),undefined);
 assert.equal(f.window.customElements.get('macromate-card').buildRevision,'current');
 assert.equal(f.imports,1,'Concurrent manual and automatic URLs share one graph');
 assert.equal(f.events.length,0);
});

test('warm HA pages and standalone fixtures load without a bootstrap timer',async()=>{
 for(const options of [{ready:true},{shell:false}]){
  const f=fixture(options);
  await f.run();await f.run();
  assert.equal(f.imports,1);
  assert.equal(f.timers.length,0);
  assert.equal(f.window.customElements.get('macromate-card').buildRevision,'current');
 }
});

test('a failed HA bootstrap is bounded and reports its own cause without importing a graph',async()=>{
 const f=fixture();
 const pending=f.run().then(()=>null,error=>error);
 await f.tick(60000);
 assert.match((await pending)?.message??'',/Home Assistant frontend did not initialize/);
 assert.equal(f.imports,0);assert.equal(f.timers.length,0);
 assert.equal(f.events[0].detail.code,'frontend_not_ready');
 assert.match(f.nodes.get('macromate-delivery-status').textContent,/frontend_not_ready/);
});

test('a different build is refused before its runtime graph can register elements',async()=>{
 const f=fixture({ready:true});
 await f.run('old');await f.run('new');
 assert.equal(f.imports,1);
 assert.equal(f.window.customElements.get('macromate-card').buildRevision,'old');
 assert.equal(f.events[0].detail.code,'registration_conflict');
});

test('repeated imports preserve the original rejected runtime promise and diagnostic',async()=>{
 const f=fixture({ready:true,fail:true});
 await assert.rejects(f.run(),/Missing runtime graph/);
 await assert.rejects(f.run(),/Missing runtime graph/);
 assert.equal(f.imports,1);
 assert.deepEqual(f.events.map(event=>event.detail.code),['asset_load_failed']);
});
