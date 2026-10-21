import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const moduleURL=new URL('../../frontend/unified-src/services/adapter.js',import.meta.url);
assert.ok(existsSync(moduleURL),'Unified authenticated adapter is implemented');
const {MacroMateAPI,canonicalAction}=await import(moduleURL);
assert.equal(canonicalAction('recipe_manager/recipes/get_all'),'recipes_get_all');
assert.equal(canonicalAction('recipe_manager/import/recipe_keeper'),'recipe_keeper_import');
assert.equal(canonicalAction('shopping_list_manager/items/check'),'shopping_items_check');
let sent=[],fail=true;
const hass={user:{id:'admin',is_admin:true},connection:{},callWS:async m=>{sent.push(structuredClone(m));if(m.action==='recipes_add'&&fail)throw new Error('private diagnostic');if(m.action==='preferences_get')return {preferences:{}};return {recipes:[],recipe:{id:'r'}};}};
const api=new MacroMateAPI(hass);
await api.call('recipe_manager/recipes/get_all');
await assert.rejects(api.call('recipe_manager/recipes/add',{name:'Soup'}),e=>e.code==='uncertain'&&!e.message.includes('private'));
assert.ok(api.pending.payload.request_id);
const first=structuredClone(sent.at(-1));
await assert.rejects(api.call('recipes_add',{name:'Other'}),e=>e.code==='pending');
fail=false;await api.retry();assert.deepEqual(sent.at(-1),first);assert.equal(api.pending,null);
api.dispose();await assert.rejects(api.call('diary'),e=>e.code==='context_changed');
const member=new MacroMateAPI({...hass,user:{id:'member',is_admin:false}});
await assert.rejects(member.call('diary'),e=>e.code==='unauthorized');
await assert.rejects(member.call('shopping_lists_get_all'),e=>e.code==='unauthorized');await member.call('preferences_get');await member.call('diary',{profile_id:'explicit-profile'});
await assert.rejects(member.call('recipes_get_all'),e=>e.code==='unauthorized');
const descriptions=new MacroMateAPI({...hass,callWS:async()=>({actions:{recipes_update:{schema:{properties:{image_url:{type:['string','null']}}},read_only:false,admin_only:true}}})});const discovery=await descriptions.call('describe');assert.deepEqual(discovery.actions.recipes_update.schema.properties.image_url,{type:['string','null']},'Capability discovery preserves schemas instead of treating media field definitions as photos');
const legacy=new MacroMateAPI(hass);const facade=legacy.facade();fail=true;const legacyPayload={name:'Legacy nutrition',request_id:crypto.randomUUID()};await assert.rejects(facade.callWS({type:'macromate/command',action:'recipes_add',payload:legacyPayload}));fail=false;await facade.callWS({type:'macromate/command',action:'recipes_add',payload:legacyPayload});assert.equal(legacy.pending,null,'Existing nutrition client explicit retry reuses the centralized pending mutation');
const nutrition=new MacroMateAPI(hass);for(const action of ['search_foods','food','barcode']){await nutrition.call(action,{});assert.equal(sent.at(-1).payload.request_id,undefined,'Nutrition reads never turn into UUID-bearing writes');}
let resolveRead;const late=new MacroMateAPI({...hass,callWS:()=>new Promise(resolve=>{resolveRead=resolve;})});const inFlight=late.call('recipes_get_all');late.dispose();resolveRead({recipes:[{name:'private'}]});await assert.rejects(inFlight,e=>e.code==='context_changed');
let mediaCalls=[];const revoked=[];const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;URL.createObjectURL=()=> 'blob:private-test';URL.revokeObjectURL=url=>revoked.push(url);
const media=new MacroMateAPI({...hass,fetchWithAuth:async url=>{mediaCalls.push(url);return {ok:true,blob:async()=>new Blob(['image'],{type:'image/webp'})};}});
assert.equal(await media.media('https://remote.invalid/photo'),null);assert.equal(await media.media('m1'),'blob:private-test');assert.equal(await media.media('/api/macromate/media/m1'),'blob:private-test');assert.deepEqual(mediaCalls,['/api/macromate/media/m1']);media.dispose();assert.deepEqual(revoked,['blob:private-test']);URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;
assert.equal((await media.normalize({source_url:'javascript:alert(1)'})).source_url,null);
const imageWrite=new MacroMateAPI({...hass,fetchWithAuth:async()=>({ok:true,blob:async()=>new Blob(['image'],{type:'image/webp'})})});const displayURL=await imageWrite.media('m2');await imageWrite.call('recipes_update',{recipe_id:'r',image_url:displayURL,photos:[displayURL]});assert.equal(sent.at(-1).payload.image_url,'/api/macromate/media/m2');assert.deepEqual(sent.at(-1).payload.photos,['/api/macromate/media/m2']);imageWrite.dispose();
const benign=new MacroMateAPI(hass);await benign.call('recipes_add',{name:'blob:this is a recipe title',notes:'blob:ordinary text'});assert.equal(sent.at(-1).payload.name,'blob:this is a recipe title');
const references=await imageWrite.normalize({id:'r-media',image_url:'https://remote.invalid/reference.jpg',photos:['https://remote.invalid/photo.jpg']});assert.equal(references.image_url,null);assert.equal(references.media_refs.image_url,'https://remote.invalid/reference.jpg');
let mediaFetches=0;const concurrent=new MacroMateAPI({...hass,fetchWithAuth:async()=>{mediaFetches++;await new Promise(r=>setTimeout(r,5));return {ok:true,blob:async()=>new Blob(['image'],{type:'image/webp'})};}});const urls=await Promise.all([concurrent.media('same'),concurrent.media('same')]);assert.equal(mediaFetches,1);assert.equal(urls[0],urls[1]);concurrent.dispose();
let deliver;const unhandled=[];const onUnhandled=e=>unhandled.push(e.message);process.on('unhandledRejection',onUnhandled);const subscriptions=new MacroMateAPI({...hass,connection:{subscribeMessage:async callback=>{deliver=callback;return ()=>{};}}});await subscriptions.subscribe(async()=>{throw new Error('synthetic private callback error');});deliver();await new Promise(r=>setTimeout(r,15));process.off('unhandledRejection',onUnhandled);assert.deepEqual(unhandled,[],'Subscription refresh rejection is handled without leaking raw callback errors');subscriptions.dispose();
const failureAPI=new MacroMateAPI({...hass,callWS:async()=>{throw {code:'storage_unavailable',message:'secret provider body'};}});
await assert.rejects(failureAPI.call('preferences_update',{preferences:{recipe_settings:{theme:'soft'}}}),e=>e.code==='uncertain');
assert.deepEqual(failureAPI.lastFailure,{action:'preferences_update',code:'storage_unavailable',outcome:'uncertain'});
assert.ok(!JSON.stringify(failureAPI.lastFailure).includes('secret'));
const refused=new MacroMateAPI({...hass,callWS:async()=>{throw {code:'invalid_request',message:'secret'};}});
await assert.rejects(refused.call('preferences_update',{preferences:{}}),e=>e.code==='invalid_request');
assert.equal(refused.pending,null);assert.equal(refused.lastFailure.outcome,'rejected');
for(const response of [null,{}, {preferences:null},{preferences:[]}]){
 const malformed=new MacroMateAPI({...hass,callWS:async()=>response});
 await assert.rejects(malformed.call('preferences_update',{preferences:{theme:'soft'}}),e=>e.code==='uncertain','A malformed success response cannot establish settings acceptance');
 assert.ok(malformed.pending.payload.request_id);
}
console.log('PASS: canonical transport, stable uncertain retry, disposal, scoped member permissions, read-only nutrition, stale reads, private media lifecycle');

const isolated=new MacroMateAPI(hass),optional=isolated.facade();const beforeOptional=sent.length;
await assert.rejects(optional.callWS({type:'hacs/repositories/list'}),e=>e.code==='invalid_request');
assert.equal(sent.length,beforeOptional,'An unrelated HA lookup never reaches the MacroMate backend');
assert.equal(isolated.pending,null,'An optional HACS read never blocks diary writes');
assert.equal(isolated.lastFailure,undefined,'An optional HACS read never raises an uncertain-save banner');
for(const code of ['invalid_format','unknown_command']){
 const rejected=new MacroMateAPI({...hass,callWS:async()=>{throw {code};}});
 await assert.rejects(rejected.call('recipes_add',{name:'Rejected before execution'}),e=>e.code===code);
 assert.equal(rejected.pending,null,'HA schema/command rejection establishes that no write was executed');
}
await isolated.call('recipes_add',{name:'After optional lookup'});assert.equal(isolated.pending,null);
await assert.rejects(isolated.call(null),e=>e.code==='invalid_request');
const retained=failureAPI.pending;const previousFailure=failureAPI.lastFailure;
await assert.rejects(failureAPI.facade().callWS({type:'hacs/repositories/list'}),e=>e.code==='invalid_request');
assert.equal(failureAPI.pending,retained,'An unrelated lookup must preserve an actual uncertain write');assert.equal(failureAPI.lastFailure,previousFailure);
console.log('PASS: unrelated HACS queries and definitive HA command/schema errors never become uncertain MacroMate writes');

// The Settings credential boundary uses the authenticated HA session without
// placing one-time agent secrets in the ordinary mutation/replay state.
const recipeScopes=['recipes.read','recipes.create','recipes.update'];
const credentialId='a'.repeat(32),credentialToken=`mm1.${credentialId}.${'b'.repeat(43)}`;
const credentialMetadata={id:credentialId,user_id:'admin',label:'Recipe assistant',scopes:recipeScopes,created_at:1730000000,expires_at:null,revoked:false};
const credentialCalls=[];
const credentialAPI=new MacroMateAPI({...hass,callWS:async()=>{throw new Error('Credential management must not reach WebSocket commands');},fetchWithAuth:async(url,options={})=>{
 credentialCalls.push({url,options:structuredClone(options)});
 const response=options.method==='POST'?{...credentialMetadata,token:credentialToken}:options.method==='DELETE'?{...credentialMetadata,revoked:true}:{credentials:[credentialMetadata]};
 return {ok:true,status:200,json:async()=>structuredClone(response)};
}});
const credentialFacade=credentialAPI.facade();
assert.deepEqual(await credentialFacade.credentials('list'),{credentials:[credentialMetadata]});
assert.equal((await credentialFacade.credentials('create',{label:credentialMetadata.label})).token,credentialToken);
assert.equal((await credentialFacade.credentials('revoke',{id:credentialId})).revoked,true);
assert.deepEqual(credentialCalls.map(({url})=>url),['/api/macromate/agent/credentials','/api/macromate/agent/credentials',`/api/macromate/agent/credentials/${credentialId}`]);
assert.equal(credentialCalls[1].options.method,'POST');
assert.equal(credentialCalls[2].options.method,'DELETE');
assert.deepEqual(JSON.parse(credentialCalls[1].options.body),{label:credentialMetadata.label,scopes:recipeScopes});
assert.equal(credentialAPI.pending,null);
assert.equal(credentialAPI.lastFailure,undefined);
assert.ok(!JSON.stringify(credentialAPI).includes(credentialToken),'The one-time secret must not be retained in adapter state');
const beforeInvalidCredentialRequests=credentialCalls.length;
for(const [method,payload] of [['unknown',{}],['revoke',{id:'../other-resource'}],['revoke',{id:`${credentialId}?token=secret`}],['revoke',{id:''}],['revoke',{id:{toString:()=>credentialId}}]]){
 await assert.rejects(credentialFacade.credentials(method,payload),e=>e.code==='invalid_request');
}
assert.equal(credentialCalls.length,beforeInvalidCredentialRequests,'The facade cannot send arbitrary authenticated paths');
const beforeScopeEscalation=credentialCalls.length;
try{
 await credentialFacade.credentials('create',{label:'Narrow grant',scopes:['diary.delete'],url:'https://unrelated.invalid/credentials'});
}catch(error){
 assert.equal(error.code,'invalid_request');
}
for(const request of credentialCalls.slice(beforeScopeEscalation)){
 assert.equal(request.url,'/api/macromate/agent/credentials');
 assert.deepEqual(JSON.parse(request.options.body),{label:'Narrow grant',scopes:recipeScopes},'Caller-supplied scopes and destinations cannot broaden recipe delegation');
}

for(const operation of ['list','create','revoke']){
 let calls=0;
 const nonAdmin=new MacroMateAPI({...hass,user:{id:'member',is_admin:false},fetchWithAuth:async()=>{calls++;}});
 await assert.rejects(nonAdmin.credentials(operation,{label:'Denied',id:credentialId}),e=>e.code==='unauthorized');
 assert.equal(calls,0,'Credential reads and writes require an administrator before transport');
}
for(const change of [a=>{a.hass.user={id:'other-admin',is_admin:true};},a=>{a.hass.user={id:'admin',is_admin:false};},a=>{a.hass.connection={};},a=>a.dispose()]){
 let calls=0;
 const stale=new MacroMateAPI({...hass,user:{...hass.user},fetchWithAuth:async()=>{calls++;}});
 change(stale);
 await assert.rejects(stale.credentials('create',{label:'Stale'}),e=>e.code==='context_changed');
 assert.equal(calls,0,'A changed session cannot issue credential requests');
}

for(const phase of ['fetch','json']){
 let release,entered;
 const reached=new Promise(resolve=>{entered=resolve;});
 const held=new Promise(resolve=>{release=resolve;});
 const response={ok:true,status:200,json:async()=>{
  if(phase==='json'){entered();await held;}
  return {...credentialMetadata,token:credentialToken};
 }};
 const lateCredential=new MacroMateAPI({...hass,user:{...hass.user},fetchWithAuth:async()=>{
  if(phase==='fetch'){entered();await held;}
  return response;
 }});
 const pending=lateCredential.credentials('create',{label:'Late response'});
 await reached;
 lateCredential.hass.user={id:'different-admin',is_admin:true};
 release();
 await assert.rejects(pending,e=>e.code==='context_changed'&&!e.message.includes(credentialToken));
 assert.equal(lateCredential.pending,null);
 assert.ok(!JSON.stringify(lateCredential).includes(credentialToken),'Late secrets cannot enter retained adapter state');
}

for(const operation of ['list','create','revoke']){
 const failingCredentials=new MacroMateAPI({...hass,fetchWithAuth:async()=>{throw new Error(`private backend diagnostic ${credentialToken}`);}});
 await assert.rejects(failingCredentials.credentials(operation,{label:'Uncertain',id:credentialId}),e=>e.code===(operation==='list'?'read_failed':'uncertain')&&!e.message.includes('private')&&!e.message.includes(credentialToken));
 assert.equal(failingCredentials.pending,null,'Credential failure must not create a WebSocket replayable mutation');
 assert.equal(failingCredentials.lastFailure,undefined,'Credential failures do not become unrelated app save banners');
}
for(const [status,code] of [[400,'invalid_request'],[401,'unauthorized'],[403,'unauthorized']]){
 let bodyRead=false;
 const refusedCredentials=new MacroMateAPI({...hass,fetchWithAuth:async()=>({ok:false,status,json:async()=>{bodyRead=true;return {error:credentialToken};}})});
 await assert.rejects(refusedCredentials.credentials('create',{label:'Refused'}),e=>e.code===code&&!e.message.includes(credentialToken));
 assert.equal(bodyRead,false,'Error response bodies cannot supply credential UI messages');
 assert.equal(refusedCredentials.pending,null);
}
for(const response of [{},{id:credentialId,revoked:false},{id:'c'.repeat(32),revoked:true}]){
 const unconfirmedRevoke=new MacroMateAPI({...hass,fetchWithAuth:async()=>({ok:true,status:200,json:async()=>response})});
 await assert.rejects(unconfirmedRevoke.credentials('revoke',{id:credentialId}),e=>e.code==='uncertain','Only a matching confirmed revocation can report success');
 assert.equal(unconfirmedRevoke.pending,null,'An unconfirmed credential revocation does not enter ordinary mutation replay');
}
failureAPI.hass.fetchWithAuth=async()=>({ok:true,status:200,json:async()=>({credentials:[]})});
assert.deepEqual(await failureAPI.credentials('list'),{credentials:[]});
assert.equal(failureAPI.pending,retained,'Credential management preserves an unrelated unresolved recipe/settings mutation');
assert.equal(failureAPI.lastFailure,previousFailure);
console.log('PASS: administrator credential management, fixed same-origin endpoints, recipe-only grants, transient secrets, stale-session rejection and sanitized nonreplaying failures');
