// Real pure-shopping-domain readback. No native HA, persistence or transport claim.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {resolve} from 'node:path';
import {RecipeManagerAPI} from '../../frontend/unified-src/services/api.js';
import {MacroMateAPI} from '../../frontend/unified-src/services/adapter.js';
const root=resolve(new URL('../..',import.meta.url).pathname);
const python=`import sys,json,types,importlib,pathlib
pkg=types.ModuleType('fixture');pkg.__path__=[str(pathlib.Path(sys.argv[1])/'custom_components/macromate')];sys.modules['fixture']=pkg
s=importlib.import_module('fixture.shopping');p=importlib.import_module('fixture.platform_support');k=p.empty_kitchen();a=p.Actor('test-admin',True)
for line in sys.stdin:
 try:
  m=json.loads(line);result=s.shopping_command(k,m['action'],m.get('payload',{}),a,'2026-10-14T12:00:00+00:00');print(json.dumps({'result':result}),flush=True)
 except Exception as e:print(json.dumps({'error':{'code':'invalid_request','message':str(e)}}),flush=True)
`;
const broker=spawn(process.env.PYTHON||'python3',['-u','-c',python,root],{stdio:['pipe','pipe','inherit']});const pending=[];
createInterface({input:broker.stdout}).on('line',line=>pending.shift()(JSON.parse(line)));
const domain=(action,payload={})=>new Promise((ok,bad)=>{pending.push(m=>m.error?bad(m.error):ok(m.result));broker.stdin.write(JSON.stringify({action,payload})+'\n');});
try {
 const list=(await domain('shopping_lists_create',{name:'Safety readback',private:true})).list;
 const old=(await domain('shopping_items_add',{list_id:list.id,name:'Flour',quantity:2,unit:'g',note:'Original'})).item;
 const api=new MacroMateAPI({user:{id:'test-admin',is_admin:true},connection:{},callWS:m=>domain(m.action,m.payload)});
 const legacy=new RecipeManagerAPI(api.facade());legacy.transport=api;
 await legacy.addIngredientsToShoppingList(list.id,[{name:'Flour',amount:'3',unit:'g'}],'Bread');
 const after=(await domain('shopping_items_get',{list_id:list.id})).items;
 assert.equal(after.filter(i=>i.name==='Flour'&&i.unit==='g').reduce((sum,i)=>sum+i.quantity,0),5,'Adding recipe ingredients preserves added quantities, never a note-only name merge');
 assert.equal((await domain('shopping_items_get_one',{item_id:old.id})).item.note,'Original','Fallback does not overwrite an existing shopping snapshot');
 await legacy.addIngredientsToShoppingList(list.id,[{name:'Flour',amount:'1½',unit:'kg'}],'Bread');
 assert.equal((await domain('shopping_items_get',{list_id:list.id})).items.find(i=>i.unit==='kg').quantity,1.5,'Mass units remain separate and mixed Unicode quantities are exact');
 const product=(await domain('shopping_products_add',{name:'Selected catalog flour',category_id:'produce'})).product;
 await legacy.addIngredientsToShoppingList(list.id,[{name:'Flour',amount:'1/2',unit:'cup',product_id:product.id,product_name:product.name,category_id:product.category_id}],'Bread');
 const chosen=(await domain('shopping_items_get',{list_id:list.id})).items.find(i=>i.product_id===product.id);
 assert.equal(chosen.name,product.name);assert.equal(chosen.category_id,product.category_id);assert.equal(chosen.quantity,0.5);assert.equal(chosen.unit,'cup');
 const before=(await domain('shopping_items_get',{list_id:list.id})).items.length;
 await assert.rejects(legacy.addIngredientsToShoppingList(list.id,[{name:'Salt',amount:'to taste',unit:'g'}]),/quantity/i);
 await assert.rejects(legacy.addIngredientsToShoppingList(list.id,[{name:'Salt',unit:'g'}]),/quantity/i,'Missing measured amount never becomes one gram');
 assert.equal((await domain('shopping_items_get',{list_id:list.id})).items.length,before,'Ambiguous quantities do not become one gram');
 let sends=0;const uncertain=new RecipeManagerAPI({callWS:async()=>{sends++;throw Object.assign(new Error('Uncertain write'),{code:'uncertain'});}});
 await assert.rejects(uncertain.addIngredientsToShoppingList('l',[{name:'A',amount:'1'},{name:'B',amount:'1'}]),/Uncertain/);assert.equal(sends,1,'Uncertain batch stops immediately, never retries or proceeds to the next write');
 console.log('PASS: actual domain readback proves quantity preservation, separate incompatible units, selected product snapshots, ambiguous rejection and no uncertain retry');
} finally {broker.stdin.end();}
