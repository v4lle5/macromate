import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

if (!process.env.FRONTEND_DEPS) throw new Error('Set FRONTEND_DEPS to the directory containing Playwright.');
const require=createRequire(resolve(process.env.FRONTEND_DEPS,'package.json'));
const {chromium}=require('playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
let server,browser,base;
const pageErrors=[];
const externalRequests=[];
before(async()=>{
  server=createServer(async(req,res)=>{
    try {
      let path=decodeURIComponent(req.url.split('?')[0]);
      if(path==='/')path='/tests/frontend/macromate-card-fixture.html';
      path=path.replace('/macromate-assets/',process.env.MACROMATE_PACKAGED==='1'?'/custom_components/macromate/frontend/':'/frontend/');
      if(!/^\/(frontend|custom_components\/macromate\/frontend|tests\/frontend)\//.test(path)||path.includes('..'))return res.writeHead(404).end();
      const data=await readFile(resolve(root,'.'+path));
      res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png'})[extname(path)]||'text/plain');res.end(data);
    }catch{res.writeHead(404).end();}
  }).listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
});
after(async()=>{
  await browser?.close();await new Promise(r=>server?.close(r));
  assert.deepEqual(pageErrors,[],'no unhandled browser errors');
  assert.deepEqual(externalRequests,[],'no external network');
});
async function open(width=390){
  const page=await browser.newPage({viewport:{width,height:900}});
  page.on('pageerror',e=>pageErrors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(base+'/'))externalRequests.push(r.url());});
  await page.goto(base);await page.waitForFunction(()=>window.ready);
  assert.equal(await page.evaluate(()=>!!customElements.get('macromate-card')),true,'card module registers custom element');
  return page;
}
const card=page=>page.locator('macromate-card');
const text=page=>card(page).locator('ha-card').innerText();
async function loaded(page){await card(page).locator('[data-state="ready"]').waitFor();}
async function reload(page){await page.evaluate(()=>{window.card.remove();window.mount();});await loaded(page);}
async function screenshot(page,name){
  const evidence=process.env.MACROMATE_EVIDENCE_DIR||process.env.TMPDIR;
  assert.ok(evidence,'Set TMPDIR or MACROMATE_EVIDENCE_DIR for screenshots.');
  await mkdir(evidence,{recursive:true});
  await page.waitForFunction(()=>!!window.card.shadowRoot.querySelector('link')?.sheet);
  await page.evaluate(()=>window.card.shadowRoot.activeElement?.blur());
  await page.screenshot({path:resolve(evidence,`card-${process.env.MACROMATE_PACKAGED==='1'?'packaged':'dev'}-${name}.png`),fullPage:true});
}

test('missing profile keeps goals unknown while explicit zero consumption remains known',async()=>{
  const page=await open();await page.evaluate(()=>{
    window.data.recommendation=null;window.data.totals={calories:0,carbs:0,protein:0,fat:0};window.data.entries=[];
    for(const meal of Object.values(window.data.meals)){meal.entries=[];meal.totals.calories=0;}window.mount();
  });
  await page.waitForFunction(()=>window.card.shadowRoot.textContent.includes('Ziel unbekannt'),null,{timeout:1500});
  assert.match(await text(page),/Profil einrichten/);
  assert.match(await card(page).locator('.energy-detail').innerText(),/0 kcal.*Ziel unbekannt/s);
  assert.equal(await card(page).locator('.calorie-ring').getAttribute('data-progress'),null);
  assert.equal(await card(page).locator('progress').count(),0);
  assert.doesNotMatch(await text(page),/NaN|undefined|von 0/);
  await screenshot(page,'no-profile');
  await page.close();
});

test('over-budget intake is explicit absolute overage with capped ring; empty diary stays zero',async()=>{
  const page=await open();await page.evaluate(()=>{window.data.totals.calories=2350;window.data.meals.lunch.totals.calories=2010;window.mount();});await loaded(page);
  assert.match(await card(page).locator('.calorie-ring').innerText(),/Über dem Ziel.*250.*kcal/s);
  assert.equal(await card(page).locator('.calorie-ring').getAttribute('data-progress'),'100');
  assert.doesNotMatch(await card(page).locator('.calorie-ring').innerText(),/-250|Übrig/);
  await screenshot(page,'over-budget');
  await page.evaluate(()=>{window.data.totals={calories:0,carbs:0,protein:0,fat:0};window.data.entries=[];});await reload(page);
  assert.match(await card(page).locator('.calorie-ring').innerText(),/Übrig.*2\.100/s);
  assert.equal(await card(page).locator('.calorie-ring').getAttribute('data-progress'),'0');
  assert.match(await card(page).locator('[data-nutrient="protein"]').innerText(),/0.*120/s);
  await page.close();
});

test('auth downgrade immediately clears private data and ignores delayed reads without duplicate hass fetches',async()=>{
  const page=await open();await page.evaluate(()=>window.mount({},window.makeHass('reader',false)));
  assert.equal(await page.evaluate(()=>window.calls.length),0);
  assert.match(await text(page),/Administrator/);
  await page.evaluate(()=>{window.card.hass=window.makeHass();});await loaded(page);
  await page.evaluate(()=>{for(let i=0;i<10;i++)window.card.hass={...window.card.hass};});
  assert.equal(await page.evaluate(()=>window.calls.length),1);
  await page.evaluate(()=>{window.deferReads=true;window.card.hass=window.makeHass('next-admin');});
  assert.match(await text(page),/geladen/);
  assert.doesNotMatch(await text(page),/840 kcal/);
  await page.evaluate(()=>{window.card.hass=window.makeHass('reader',false);});
  assert.match(await text(page),/Administrator/);
  await page.evaluate(()=>{window.pending[0].resolve({...window.data,totals:{...window.data.totals,calories:999}});});
  await page.waitForTimeout(30);
  assert.doesNotMatch(await text(page),/999|840|1\.260/);
  assert.equal(await page.evaluate(()=>window.calls.length),2);
  await page.close();
});

test('failed reads show sanitized error and manual retry recovers without exposing server messages',async()=>{
  const page=await open();await page.evaluate(()=>{window.failReads='SECRET <img src=x onerror=alert(1)>';window.mount();});
  await card(page).locator('[data-state="error"]').waitFor({timeout:1500});
  assert.match(await text(page),/nicht geladen/);
  assert.doesNotMatch(await text(page),/SECRET|onerror/);
  assert.equal(await card(page).locator('img').count(),0);
  await screenshot(page,'error');
  await page.evaluate(()=>{window.failReads=null;});
  await card(page).getByRole('button',{name:'Erneut versuchen'}).click();await loaded(page);
  assert.equal(await page.evaluate(()=>window.calls.length),2);
  await page.close();
});

test('live updates coalesce in-flight reads, minute fallback follows HA day, disconnect stops all work',async()=>{
  const page=await open();await page.clock.install({time:new Date('2040-01-01T01:00:00Z')});
  await page.evaluate(()=>window.mount());await loaded(page);
  assert.deepEqual(await page.evaluate(()=>window.subscriptions.map(s=>s.type)),['macromate_updated']);
  await page.evaluate(()=>{for(let i=0;i<20;i++)window.emit();});await page.clock.fastForward(200);
  assert.equal(await page.evaluate(()=>window.calls.length),2);
  await page.evaluate(()=>{window.deferReads=true;window.emit();});await page.clock.fastForward(200);
  assert.equal(await page.evaluate(()=>window.pending.length),1);
  await page.evaluate(()=>{for(let i=0;i<20;i++)window.emit();});await page.clock.fastForward(200);
  assert.equal(await page.evaluate(()=>window.calls.length),3);
  await page.evaluate(()=>{window.deferReads=false;window.pending[0].resolve(window.data);});await page.clock.fastForward(200);
  assert.equal(await page.evaluate(()=>window.calls.length),4);
  await page.evaluate(()=>{window.data.today='2026-10-15';window.data.date='2026-10-15';});
  await page.clock.fastForward(60000);await page.clock.fastForward(200);
  assert.match(await text(page),/15\.10\.2026/);
  assert.ok(await page.evaluate(()=>window.calls.every(c=>Object.keys(c.payload).length===0)));
  const count=await page.evaluate(()=>{window.card.remove();window.emit();return window.calls.length;});
  await page.clock.fastForward(120000);
  assert.equal(await page.evaluate(()=>window.calls.length),count);
  assert.equal(await page.evaluate(()=>window.unsubscribeCount),1);
  assert.equal(await page.evaluate(()=>window.subscriptions.filter(s=>s.active).length),0);
  await page.close();
});

test('late subscription completion after disconnect unsubscribes instead of leaking across reconnect',async()=>{
  const page=await open();await page.evaluate(()=>{window.deferSubscription=true;window.mount();});await loaded(page);
  await page.evaluate(()=>{window.card.remove();window.resolveSubscription();});await page.waitForTimeout(30);
  assert.equal(await page.evaluate(()=>window.unsubscribeCount),1);
  assert.equal(await page.evaluate(()=>window.subscriptions.filter(s=>s.active).length),0);
  await page.evaluate(()=>{window.deferSubscription=false;document.querySelector('#mount').append(window.card);});await loaded(page);
  assert.equal(await page.evaluate(()=>window.subscriptions.filter(s=>s.active).length),1);
  await page.evaluate(()=>window.card.remove());
  assert.equal(await page.evaluate(()=>window.unsubscribeCount),2);
  await page.close();
});

test('in-place authorization changes clear immediately and replacement context wins delayed successes and errors',async()=>{
  const page=await open();await page.evaluate(()=>window.mount());await loaded(page);
  await page.evaluate(()=>{window.card.hass.user.is_admin=false;window.card.hass=window.card.hass;});
  assert.match(await text(page),/Administrator/);
  assert.doesNotMatch(await text(page),/840 kcal/);
  assert.equal(await page.evaluate(()=>window.unsubscribeCount),1);
  await page.evaluate(()=>{window.deferReads=true;window.card.hass=window.makeHass('alpha');});
  await page.evaluate(()=>{window.card.hass={...window.card.hass,user:{id:'beta',is_admin:true}};});
  assert.equal(await page.evaluate(()=>window.pending.length),2);
  await page.evaluate(()=>{window.pending[1].resolve({...window.data,totals:{...window.data.totals,calories:700}});});await loaded(page);
  await page.evaluate(()=>{window.pending[0].resolve({...window.data,totals:{...window.data.totals,calories:999}});});await page.waitForTimeout(30);
  assert.match(await text(page),/700 kcal/);assert.doesNotMatch(await text(page),/999/);
  await page.evaluate(()=>{window.card.hass={...window.card.hass,connection:window.connection()};});
  await page.evaluate(()=>{window.deferReads=false;window.card.hass={...window.card.hass,connection:window.connection()};});await loaded(page);
  await page.evaluate(()=>{window.pending[2].reject(new Error('private stale failure'));});await page.waitForTimeout(30);
  assert.match(await text(page),/840 kcal/);assert.doesNotMatch(await text(page),/private|nicht geladen/);
  await page.close();
});

test('omitted or non-numeric totals and invalid goals never become zero or progress',async()=>{
  const page=await open();await page.evaluate(()=>{
    window.data.totals={calories:null,protein:null,carbs:'0',fat:0};
    window.data.recommendation={calorie_target:0,protein:120,carbs:Infinity,fat:0};
    delete window.data.meals.snack;window.mount();
  });
  await card(page).locator('.energy').waitFor({timeout:1500});
  assert.match(await card(page).locator('.calorie-ring').innerText(),/Unbekannt/);
  assert.equal(await card(page).locator('.calorie-ring').getAttribute('data-progress'),null);
  assert.equal(await card(page).locator('progress').count(),0);
  assert.match(await card(page).locator('[data-nutrient="protein"]').innerText(),/Unbekannt/);
  assert.match(await card(page).locator('[data-nutrient="fat"]').innerText(),/0 g/);
  assert.match(await card(page).locator('[data-meal="snack"]').innerText(),/unbekannt|Unbekannt/);
  assert.doesNotMatch(await text(page),/NaN|Infinity|undefined/);
  assert.doesNotMatch(await card(page).locator('.energy-detail').innerText(),/0 kcal/);
  await page.close();
});

test('responsive themed styling provides a central jade ring and keyboard targets without overflow',async()=>{
  const page=await open(320);await page.evaluate(()=>window.mount());await loaded(page);
  await page.waitForFunction(()=>!!window.card.shadowRoot.querySelector('link')?.sheet,null,{timeout:1500});
  for(const width of [320,390,768,1280]){
    await page.setViewportSize({width,height:900});
    const layout=await page.evaluate(()=>{
      const root=window.card.shadowRoot;const host=window.card.getBoundingClientRect();const ring=root.querySelector('.calorie-ring').getBoundingClientRect();const link=root.querySelector('a');const box=link.getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth>innerWidth,ringWidth:ring.width,ringCenter:ring.x+ring.width/2,hostCenter:host.x+host.width/2,targetHeight:box.height,targetWidth:box.width,bg:getComputedStyle(root.querySelector('ha-card')).backgroundColor};
    });
    assert.equal(layout.overflow,false);assert.ok(layout.ringWidth>=170);assert.ok(Math.abs(layout.ringCenter-layout.hostCenter)<2);
    assert.ok(layout.targetHeight>=44&&layout.targetWidth>=44);assert.equal(layout.bg,'rgb(255, 254, 251)');
    if(width===320||width===1280)await screenshot(page,String(width));
  }
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>window.card.shadowRoot.activeElement?.tagName),'A');
  assert.notEqual(await card(page).getByRole('link').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  await page.evaluate(()=>document.body.classList.add('dark'));
  assert.equal(await card(page).locator('ha-card').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(27, 39, 33)');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await card(page).getByRole('link').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.setViewportSize({width:390,height:900});await screenshot(page,'dark');
  await page.evaluate(()=>document.body.classList.remove('dark'));await screenshot(page,'light');
  await page.close();
});

test('diary link remains readable when a dark theme supplies a low-contrast accent',async()=>{
  const page=await open(320);await page.evaluate(()=>{window.mount();document.body.classList.add('dark');document.body.style.setProperty('--primary-color','#187957');});await loaded(page);
  await page.waitForFunction(()=>!!window.card.shadowRoot.querySelector('link')?.sheet);
  const ratio=await card(page).getByRole('link').evaluate(link=>{
    const luminance=color=>{const channels=color.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4;});return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;};
    const a=luminance(getComputedStyle(link).color),b=luminance(getComputedStyle(link.closest('ha-card')).backgroundColor);
    return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
  });
  assert.ok(ratio>=4.5,`link contrast ${ratio} must meet normal-text AA`);
  await page.close();
});

test('subscription cleanup failures cannot leave private DOM visible or reject unhandled',async()=>{
  const page=await open();await page.evaluate(()=>window.mount());await loaded(page);
  await page.evaluate(()=>{window.card.unsubscribe=()=>{throw new Error('synthetic closed connection');};window.card.hass=window.makeHass('reader',false);});
  assert.match(await text(page),/Administrator/);assert.doesNotMatch(await text(page),/840|1\.260/);
  await page.evaluate(()=>{window.card.hass=window.makeHass();});await loaded(page);
  await page.evaluate(()=>{window.card.unsubscribe=()=>Promise.reject(new Error('synthetic async unsubscribe failure'));window.card.hass=window.makeHass('reader',false);});
  await page.waitForTimeout(30);assert.match(await text(page),/Administrator/);
  assert.doesNotMatch(await text(page),/840|1\.260/);
  await page.close();
});

test('background refresh preserves keyboard focus on the diary anchor',async()=>{
  const page=await open();await page.clock.install();await page.evaluate(()=>window.mount());await loaded(page);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>window.card.shadowRoot.activeElement?.tagName),'A');
  await page.evaluate(()=>window.emit());await page.clock.fastForward(200);
  assert.equal(await page.evaluate(()=>window.card.shadowRoot.activeElement?.tagName),'A');
  await page.close();
});

test('configuration validates title type and renders arbitrary text safely without changing the read contract',async()=>{
  const page=await open(320);
  assert.equal(await page.evaluate(()=>{
    for(const invalid of [null,[],{title:{html:'bad'}},{title:42}]){
      try{document.createElement('macromate-card').setConfig(invalid);return false;}catch{}
    }return true;
  }),true);
  const title='<img src="https://example.invalid/card.png" onerror="window.injected=true">';
  await page.evaluate(title=>{
    window.data.entries[0].name='<svg onload="window.injected=true">';
    window.mount({type:'custom:macromate-card',title});
  },title);await loaded(page);
  assert.equal(await card(page).locator('h2').textContent(),title);
  assert.equal(await card(page).locator('img,svg,script').count(),0);
  assert.equal(await page.evaluate(()=>window.injected),undefined);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.evaluate(()=>window.card.setConfig({title:'Mein Tagesstand'}));
  assert.equal(await card(page).locator('h2').innerText(),'Mein Tagesstand');
  assert.equal(await page.evaluate(()=>window.calls.length),1);
  await page.close();
});

test('HA sizing reflects rendered card height and leaves sections rows unconstrained',async()=>{
  const page=await open();await page.evaluate(()=>window.mount());await loaded(page);
  await page.waitForFunction(()=>!!window.card.shadowRoot.querySelector('link')?.sheet);
  const sizing=await page.evaluate(()=>({size:window.card.getCardSize(),height:window.card.shadowRoot.querySelector('ha-card').getBoundingClientRect().height,grid:window.card.getGridOptions()}));
  assert.ok(sizing.size*50>=sizing.height);
  assert.ok(sizing.size*50<sizing.height+50);
  assert.equal(sizing.grid.rows,undefined);
  assert.equal(sizing.grid.min_columns,12);
  await page.close();
});

test('summary navigation accepts a local dashboard and defaults to an inline open event',async()=>{
  const page=await open();
  await page.evaluate(()=>window.mount());await loaded(page);
  assert.equal(await card(page).locator('.diary-link').getAttribute('href'),'/lovelace/nutrition');
  assert.equal(await page.evaluate(()=>{
    for(const navigation_path of ['https://example.invalid/','//example.invalid/','/dashboard/../private','/dashboard?token=secret',42]){
      try{document.createElement('macromate-card').setConfig({navigation_path});return false;}catch{}
    }return true;
  }),true);
  await page.evaluate(()=>{
    window.card.setConfig({mode:'summary'});
    window.openEvents=0;
    window.card.addEventListener('macromate-open-app',event=>{window.openEvents++;event.stopImmediatePropagation();},{capture:true});
  });
  assert.equal(await card(page).locator('.diary-link').evaluate(node=>node.tagName),'BUTTON');
  await card(page).locator('.diary-link').click();
  assert.equal(await page.evaluate(()=>window.openEvents),1);
  assert.equal(new URL(page.url()).pathname,'/');
  await page.close();
});

test('synchronous disconnect before subscription microtask prevents starting a detached subscription',async()=>{
  const page=await open();await page.evaluate(()=>{window.deferReads=true;window.mount();window.card.remove();});
  await page.waitForTimeout(30);
  assert.equal(await page.evaluate(()=>window.subscriptions.length),0);
  await page.evaluate(()=>window.pending[0].resolve(window.data));await page.waitForTimeout(30);
  assert.equal(await page.evaluate(()=>window.card.data),null);
  await page.close();
});

test('read completion checks captured identity even if the supplied hass object is mutated before another setter',async()=>{
  const page=await open();await page.evaluate(()=>{window.deferReads=true;window.mount();window.card.hass.user.id='different-admin';});
  await page.evaluate(()=>window.pending[0].resolve(window.data));await page.waitForTimeout(30);
  assert.equal(await page.evaluate(()=>window.card.data),null);
  assert.doesNotMatch(await text(page),/840 kcal/);
  await page.evaluate(()=>{window.deferReads=false;window.card.hass=window.card.hass;});await loaded(page);
  assert.match(await text(page),/840 kcal/);
  await page.close();
});

test('background read failure removes stale metrics and minute fallback recovers even when subscription fails',async()=>{
  const page=await open();await page.clock.install();
  await page.evaluate(()=>{const hass=window.makeHass();hass.connection.subscribeEvents=()=>Promise.reject(new Error('private subscription'));window.mount({},hass);});await loaded(page);
  await page.evaluate(()=>{window.failReads='private background error';});await page.clock.fastForward(60000);await page.clock.fastForward(200);
  assert.equal(await card(page).locator('ha-card').getAttribute('data-state'),'error');
  assert.doesNotMatch(await text(page),/840|1\.260|private/);
  assert.equal(await page.evaluate(()=>window.card.data),null);
  await page.evaluate(()=>{window.failReads=null;window.data.today='2026-10-16';});await page.clock.fastForward(60000);await page.clock.fastForward(200);
  assert.match(await text(page),/16\.10\.2026/);
  await page.close();
});

test('native diary anchor is keyboard navigable and the full interaction issues only diary reads',async()=>{
  const page=await open();await page.clock.install();
  await page.route(base+'/lovelace/nutrition',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Diary destination</title>'}));
  await page.evaluate(()=>{
    const hass=window.makeHass();const read=hass.callWS;
    hass.callService=()=>{throw new Error('Unexpected mutation');};
    hass.callWS=message=>{if(message.type!=='macromate/command'||message.action!=='diary'||Object.keys(message.payload).length)throw new Error('Unexpected command');return read(message);};
    window.mount({},hass);
  });await loaded(page);
  await page.evaluate(()=>{window.emit();window.emit();});await page.clock.fastForward(200);
  assert.deepEqual(await page.evaluate(()=>window.calls),Array(2).fill({type:'macromate/command',action:'diary',payload:{}}));
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');await page.waitForURL(base+'/lovelace/nutrition');
  assert.equal(await page.title(),'Diary destination');
  await page.close();
});

test('installable card assets are byte-identical to the development assets',async()=>{
  for(const name of ['macromate-card.js','macromate-card.css']){
    assert.deepEqual(await readFile(resolve(root,'custom_components/macromate/frontend',name)),await readFile(resolve(root,'frontend',name)));
  }
});

 test('HA card registration loads the authorized read-only diary with server-local date',async()=>{
  const page=await open();
  await page.evaluate(()=>window.mount());await loaded(page);
  const result=await page.evaluate(()=>({calls:window.calls,size:window.card.getCardSize(),grid:window.card.getGridOptions(),registration:window.customCards,stub:customElements.get('macromate-card').getStubConfig()}));
  assert.deepEqual(result.calls,[{type:'macromate/command',action:'diary',payload:{}}]);
  assert.ok(result.size>0);assert.ok(result.grid.columns>=6);
  assert.ok(result.registration.some(c=>c.type==='macromate-card'&&c.name==='MacroMate'));
  assert.equal(result.stub.type,'custom:macromate-card');
  assert.match(await card(page).locator('ha-card').innerText(),/14\.10\.2026/);
  await page.close();
});

test('glanceable overview renders remaining calories, macro progress, meal summaries and diary anchor',async()=>{
  const page=await open();await page.evaluate(()=>window.mount());await loaded(page);
  assert.match(await text(page),/1\.260/);
  assert.match(await text(page),/Übrig/);
  assert.match(await text(page),/840 kcal/);
  assert.match(await text(page),/2\.100 kcal/);
  assert.equal(await card(page).locator('.calorie-ring').getAttribute('data-progress'),'40');
  for(const [key,value,target] of [['carbs','92','260'],['protein','48','120'],['fat','28','70']]){
    const row=card(page).locator(`[data-nutrient="${key}"]`);
    assert.match(await row.innerText(),new RegExp(`${value}.*${target}`,'s'));
    assert.equal(await row.locator('progress').getAttribute('value'),value);
  }
  assert.equal(await card(page).locator('.meal').count(),4);
  assert.match(await card(page).locator('[data-meal="breakfast"]').innerText(),/Frühstück.*1 Eintrag.*340 kcal/s);
  assert.match(await card(page).locator('[data-meal="dinner"]').innerText(),/Abendessen.*0 Einträge.*0 kcal/s);
  assert.equal(await card(page).getByRole('link',{name:/Tagebuch öffnen/}).getAttribute('href'),'/lovelace/nutrition');
  await page.close();
});

test('incomplete nutrition suppresses exact remaining and progress including meal subtotals',async()=>{
  const page=await open();await page.evaluate(()=>{
    window.data.nutrition_missing=['calories','protein'];
    window.data.meals.breakfast.nutrition_missing=['calories'];window.mount();
  });await loaded(page);
  const ring=card(page).locator('.calorie-ring');
  assert.match(await ring.innerText(),/Unvollständig/);
  assert.equal(await ring.getAttribute('data-progress'),null);
  assert.doesNotMatch(await ring.innerText(),/1\.260|Übrig/);
  assert.match(await card(page).locator('.energy-detail').innerText(),/840 kcal bekannt/);
  const protein=card(page).locator('[data-nutrient="protein"]');
  assert.match(await protein.innerText(),/Unvollständig.*48 g bekannt/s);
  assert.equal(await protein.locator('progress').count(),0);
  assert.equal(await card(page).locator('[data-nutrient="carbs"] progress').count(),1);
  assert.match(await card(page).locator('[data-meal="breakfast"]').innerText(),/Unvollständig/);
  await screenshot(page,'incomplete');
  await page.close();
});
