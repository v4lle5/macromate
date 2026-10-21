// Real Lit components using Lit's Node DOM shim. This is not rendered-browser QA.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {normalizeSettings,getGlassWaveTokens} from '../../frontend/unified-src/services/theme.js';

const require=createRequire(resolve(process.env.MACROMATE_BUILD_DEPS,'package.json'));
const scratch=await mkdtemp(resolve(tmpdir(),'macromate-settings-'));
const text=value=>Array.isArray(value)?value.map(text).join(' '):value?.strings?
  value.strings.map((part,index)=>part+text(value.values[index])).join(''):
  ['string','number'].includes(typeof value)?String(value):'';
try {
  const output=resolve(scratch,'components.mjs');
  await require('esbuild').build({
    stdin:{contents:`import './frontend/unified-src/components/rm-settings-view.js';
      import './frontend/unified-src/components/rm-recipe-detail.js';
      export {AgentAccess} from './frontend/unified-src/components/agent-access.js';
      export const Settings=customElements.get('rm-settings-view');
      export const Detail=customElements.get('rm-recipe-detail');`,resolveDir:process.cwd()},
    bundle:true,platform:'node',format:'esm',nodePaths:[resolve(process.env.MACROMATE_BUILD_DEPS,'node_modules')],outfile:output,
  });
  const {Settings,Detail,AgentAccess}=await import(pathToFileURL(output));
  const settings=new Settings();
  const markup=text(settings.render());
  assert.match(markup,/Language/);
  assert.match(markup,/Alarm sound/);
  assert.doesNotMatch(markup,/Appearance|Glass Wave|Preferred units|Imperial|Show metric conversion button/);
  assert.equal(settings._activeTab,'advanced');
  const migrated=normalizeSettings({unitSystem:'imperial',showUnitConversion:true,language:'de',timerSound:'ding'});
  assert.equal(migrated.unitSystem,'metric');
  assert.equal(migrated.showUnitConversion,false);
  assert.equal(migrated.language,'de');
  assert.equal(migrated.timerSound,'ding');
  const detail=new Detail();
  detail.settings={unitSystem:'imperial',showUnitConversion:true};
  assert.equal(detail._getDisplayAmount({amount:'1',unit:'oz'}).unit,'g');
  assert.equal(detail._getDisplayAmount({amount:'1',unit:'fl oz'}).unit,'ml');
  assert.deepEqual(detail._getDisplayAmount({amount:'2-3',unit:'cups'}),{amount:'2-3',unit:'cups'});
  assert.doesNotMatch(text(detail._renderIngredients({ingredients:[]})),/metric-btn|Convert to metric/);

  // Exercise real lifecycle/action methods without claiming DOM/browser coverage.
  // Lit's Node shim does not attach the element, so identity changes are delivered
  // explicitly; browser tests own the rendered controls and actual attachment.
  const flush=()=>new Promise(done=>setImmediate(done));
  const deferred=()=>{let resolve,reject;const promise=new Promise((ok,no)=>{resolve=ok;reject=no;});return {promise,resolve,reject};};
  const credential={id:'a'.repeat(32),token:`mm1.${'a'.repeat(32)}.${'b'.repeat(43)}`};
  const metadata={id:credential.id,label:'Mein Agent',revoked:false,expires_at:null};
  const user={id:'admin-one',is_admin:true};
  const attach=async(credentials,identity=user)=>{
    const panel=new AgentAccess();
    Object.defineProperty(panel,'isConnected',{value:true,writable:true});
    panel.language='de';
    panel._origin='http://192.168.1.42:8123';
    panel.hass={user:identity,credentials};
    panel.willUpdate(new Map([['hass',undefined]]));
    await flush();
    return panel;
  };
  const secretField=panel=>{
    const field={value:panel._connection()};
    Object.defineProperty(panel,'shadowRoot',{value:{querySelector:()=>field},configurable:true});
    return field;
  };
  const expectForgotten=panel=>{
    assert.equal(panel._created,null);
    assert.equal(panel._connection(),'');
    assert.equal(panel._manual,false);
    assert.equal(panel._copied,false);
  };

  {
    const calls=[];
    const transport=async(action,payload)=>{
      calls.push({action,payload});
      return action==='list'?{credentials:[]}:credential;
    };
    const untouched=new AgentAccess();
    untouched.render();
    assert.deepEqual(calls,[],'constructing/rendering a panel never creates access');
    const panel=await attach(transport);
    panel.render();
    panel.willUpdate(new Map([['hass',panel.hass]]));
    await panel._load();
    assert.deepEqual(calls.map(call=>call.action),['list','list'],'opening/refreshing only lists metadata');
    for(const origin of ['', 'ftp://ha.invalid', 'https://user:secret@ha.invalid',
      'https://ha.invalid/lovelace', 'https://ha.invalid?token=secret', 'https://ha.invalid/#view']){
      panel._origin=origin;
      await panel._create();
    }
    assert.ok(calls.every(call=>call.action==='list'),'invalid export origins never mint credentials');
    panel._origin='http://192.168.1.42:8123';
    await panel._create();
    assert.deepEqual(calls.at(-1),{action:'create',payload:{label:'Mein Agent'}});
    assert.equal(panel._connection().includes(credential.token),true);
    const before=calls.length;
    panel._origin='https://lan-ha.example:8123/';
    const exported=JSON.parse(panel._connection());
    assert.equal(exported.base_url,'https://lan-ha.example:8123');
    assert.equal(exported.discovery.url,'https://lan-ha.example:8123/api/macromate/agent/action/describe');
    assert.equal(exported.headers.Authorization,`Bearer ${credential.token}`);
    assert.equal(calls.length,before,'editing export address performs no request or remint');
    panel._manual=true;panel._copied=true;
    const field=secretField(panel);
    panel.isConnected=false;
    panel.disconnectedCallback();
    expectForgotten(panel);
    assert.equal(field.value,'','disconnect immediately clears an already-rendered secret');
    assert.deepEqual(panel._rows,[]);
  }

  for(const change of ['identity','transport','demotion']){
    const transport=async action=>action==='list'?{credentials:[]}:credential;
    const panel=await attach(transport);
    await panel._create();
    panel._manual=true;panel._copied=true;
    const field=secretField(panel);
    const old=panel.hass;
    panel.hass=change==='transport'?{...old,credentials:async()=>({credentials:[]})}:
      {...old,user:{id:change==='identity'?'admin-two':user.id,is_admin:change!=='demotion'}};
    panel.willUpdate(new Map([['hass',old]]));
    expectForgotten(panel);
    assert.equal(field.value,'',`${change} clears the rendered secret before another response`);
    await flush();
  }

  for(const change of ['disconnect','identity','transport']){
    const pending=deferred();
    const calls=[];
    const panel=await attach(async action=>{
      calls.push(action);
      return action==='list'?{credentials:[]}:pending.promise;
    });
    const create=panel._create();
    await panel._create();
    assert.equal(calls.filter(action=>action==='create').length,1,'busy create cannot duplicate a request');
    if(change==='disconnect'){
      panel.isConnected=false;panel.disconnectedCallback();
    }else{
      const old=panel.hass;
      panel.hass=change==='identity'?{...old,user:{id:'admin-two',is_admin:true}}:
        {...old,credentials:async()=>({credentials:[]})};
      panel.willUpdate(new Map([['hass',old]]));
    }
    pending.resolve(credential);
    await create;await flush();
    expectForgotten(panel);
    assert.deepEqual(panel._rows,[],`late mint response cannot restore access after ${change}`);
  }

  {
    const calls=[];
    let rows=[];
    const panel=await attach(async(action,payload)=>{
      calls.push({action,payload});
      if(action==='create'){
        rows=[metadata];
        throw new Error(`Response lost; ${credential.token}`);
      }
      if(action==='revoke'){
        rows=[];
        return {revoked:true};
      }
      return {credentials:rows};
    });
    await panel._create();await flush();
    expectForgotten(panel);
    assert.equal(panel._message.includes(credential.token),false,'transport errors never expose credential content');
    assert.deepEqual(calls.map(call=>call.action),['list','create'],'uncertain mint has no automatic retry');
    await panel._load();
    assert.deepEqual(panel._rows,[metadata],'explicit refresh recovers an issued credential without its lost token');
    await panel._revoke(credential.id);
    assert.deepEqual(panel._rows,[]);
    assert.equal(calls.filter(call=>call.action==='create').length,1);
    assert.deepEqual(calls.at(-1),{action:'revoke',payload:{id:credential.id}});
  }

  {
    let rows=[];
    let revokes=0;
    const panel=await attach(async action=>{
      if(action==='create'){rows=[metadata];return credential;}
      if(action==='revoke'){rows=[];revokes++;throw new Error('Response lost');}
      return {credentials:rows};
    });
    await panel._create();
    const field=secretField(panel);
    await panel._revoke(credential.id);await flush();
    assert.equal(revokes,1,'uncertain revoke is never retried automatically');
    await panel._load();
    assert.deepEqual(panel._rows,[]);
    expectForgotten(panel);
    assert.equal(field.value,'','metadata confirms revocation and clears the unusable handoff');
  }

  {
    const calls=[];
    const panel=await attach(async action=>{calls.push(action);return {credentials:[]};},
      {id:'member',is_admin:false});
    await panel._load();await panel._create();await panel._revoke(credential.id);
    assert.deepEqual(calls,[],'a nonadministrator never sends credential operations');
  }

  const light=getGlassWaveTokens({darkMode:'off'});
  assert.equal(light['--rm-bg-main'],'#F9EFDA');
  assert.equal(light['--rm-accent'],'#DCCDB8');
  assert.equal(light['--rm-bg-surface'],'rgba(253, 248, 239, 0.72)');
  const luminance=hex=>hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255)
    .map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4)
    .reduce((sum,n,index)=>sum+n*[.2126,.7152,.0722][index],0);
  for(const darkMode of ['off','on']){
    const palette=getGlassWaveTokens({darkMode});
    for(const [foreground,background] of [
      ['--rm-text','--rm-bg-main'],['--rm-text-secondary','--rm-bg-main'],
      ['--rm-text-muted','--rm-bg-elevated'],['--rm-accent-text','--rm-accent'],
      ['--rm-accent-ink','--rm-accent-soft'],['--rm-disabled-text','--rm-disabled-bg'],
      ['--rm-success-ink','--rm-success-soft'],['--rm-error-ink','--rm-error-soft'],
    ]){
      const a=luminance(palette[foreground]),b=luminance(palette[background]);
      assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${darkMode}: ${foreground} on ${background}`);
    }
  }
  console.log('PASS: retained settings, metric display, Wave Glass Echo contrast, explicit agent access and transient-secret lifecycle');
} finally {await rm(scratch,{recursive:true,force:true});}
