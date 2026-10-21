// Actual search controller with a controlled transport; no browser or live OFF.
import assert from 'node:assert/strict';
import {FoodBrowser} from '../../frontend/foods-ui.js';

const banana = {food_id:'bls4:F503100',name:'Banane roh',base_unit:'g'};
const apple = {food_id:'local:apple',name:'Apfel',base_unit:'g'};
const remote = {food_id:'off:banana',name:'Banane aus Open Food Facts',base_unit:'g'};
const calls = [], shown = [], errors = [], requests = [];
let query = 'Banane', filter = 'all';
const panel = {
  hass:{language:'de',connection:{},user:{id:'food-search-test'}},
  authorized:true,isConnected:true,
  message:{replaceChildren(){}},
  client:{async read(action,payload){
    calls.push({action,payload});
    if(payload.online) return new Promise(resolve=>requests.push({query:payload.query,resolve}));
    return {foods:[payload.query==='Banane'?banana:apple],source:'local',warnings:[]};
  }},
  showError(error){errors.push(error);},
};
const browser = new FoodBrowser(panel);
browser.query={querySelector:()=>({value:query})};
browser.filter={querySelector:()=>({value:filter})};
browser.results={setAttribute(){},removeAttribute(){}};
browser.showResults=result=>shown.push(result);

const first = browser.search();
await Promise.resolve();
assert.deepEqual(calls.map(call=>call.payload.online),[false,true],
  'Submitting Banane immediately displays local foods and automatically queries OFF');
assert.equal(shown.at(-1).foods[0].food_id,banana.food_id,
  'Local food is selectable while OFF is pending');
assert.equal(requests[0].query,'Banane');
requests[0].resolve({foods:[banana,remote],source:'local + Open Food Facts',warnings:[]});
await first;
assert.deepEqual(shown.at(-1).foods,[banana,remote],'OFF results appear automatically');

const outage = browser.search();
await Promise.resolve();
assert.equal(requests.length,2,'Every submitted general name search requests OFF');
requests[1].resolve({foods:[banana],source:'local',warnings:['provider_unavailable']});
await outage;
assert.deepEqual(shown.at(-1).warnings,['provider_unavailable'],'Provider failures stay visible');
assert.equal(shown.at(-1).foods[0],banana);

const stale = browser.search();
await Promise.resolve();
assert.deepEqual(shown.at(-1).warnings,[],'New local results clear the previous warning while searching');
query='Apfel';
const latest = browser.search();
await Promise.resolve();
assert.equal(shown.at(-1).foods[0],apple);
const current = shown.at(-1);
requests[2].resolve({foods:[],warnings:['provider_unavailable']});
await stale;
assert.equal(shown.at(-1),current,'A late remote result cannot replace a newer search');
requests[3].resolve({foods:[apple],source:'local + Open Food Facts',warnings:[]});
await latest;
assert.deepEqual(shown.at(-1).warnings,[]);

for(filter of ['favorites','recent','custom']){
  const before=requests.length;
  await browser.search();
  assert.equal(requests.length,before,`The ${filter} filter stays scoped to the user's foods`);
}
assert.deepEqual(errors,[]);
console.log('PASS: automatic OFF search, immediate Banane result, provider warning and stale-response protection');
