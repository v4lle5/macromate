import test from 'node:test';
import assert from 'node:assert/strict';

test('commands use existing hass auth and preserve a write ID across uncertain explicit retry', async () => {
  const {CommandClient} = await import('../../frontend/client.js');
  const calls=[]; let fail=true;
  const client=new CommandClient({callWS:async msg=>{calls.push(msg); if(fail) throw new Error('network'); return {entry_id:'e1'};}});
  await assert.rejects(client.write('log_meal',{name:'Lunch',calories:500,date:'2026-10-13'}));
  assert.equal(calls.length,1);
  assert.ok(calls[0].payload.request_id);
  await assert.rejects(client.write('delete_meal',{entry_id:'other'}),/ungeklärt/);
  fail=false;
  assert.deepEqual(await client.retry(),{entry_id:'e1'});
  assert.deepEqual(calls[1],calls[0]);
  assert.equal(client.pending,null);
  await client.read('diary',{date:'2026-10-13'});
  assert.deepEqual(calls[2],{type:'macromate/command',action:'diary',payload:{date:'2026-10-13'}});
});

test('known HA non-admin users are denied locally without sending private nutrition commands',async()=>{
 const {CommandClient}=await import('../../frontend/client.js');let sent=0;
 const client=new CommandClient({user:{is_admin:false},callWS:()=>{sent++;return Promise.resolve({});}});
 await assert.rejects(client.read('diary'),error=>error.code==='unauthorized');
 await assert.rejects(client.write('log_meal',{name:'Denied',calories:10}),error=>error.code==='unauthorized');
 assert.equal(sent,0);assert.equal(client.pending,null);
});

test('definitive validation failure clears pending write so corrected input receives a new logical ID',async()=>{
 const {CommandClient}=await import('../../frontend/client.js');const calls=[];
 const client=new CommandClient({callWS:async msg=>{calls.push(msg);if(calls.length===1)throw {code:'invalid_request'};return {};}});
 await assert.rejects(client.write('log_meal',{name:'Invalid',calories:-1}));assert.equal(client.pending,null);
 await client.write('log_meal',{name:'Fixed',calories:1});assert.notEqual(calls[0].payload.request_id,calls[1].payload.request_id);
});

test('native HA schema and unknown-command rejections never retain an uncertain nutrition write',async()=>{
 const {CommandClient}=await import('../../frontend/client.js');
 for(const code of ['invalid_format','unknown_command']){
  const client=new CommandClient({callWS:async()=>{throw {code};}});
  await assert.rejects(client.write('log_food',{food_id:'food',amount:100,meal_type:'snack'}),e=>e.code===code);
  assert.equal(client.pending,null);
 }
});
