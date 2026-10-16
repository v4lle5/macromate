// Real Chromium module-cache upgrade; synthetic read-only backend, not production.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const root=resolve(new URL('../..',import.meta.url).pathname);
const {chromium}=createRequire(resolve(process.env.PLAYWRIGHT_DIR,'package.json'))('playwright');
const scratch=await mkdtemp(resolve(tmpdir(),'macromate-upgrade-'));
const pin='e7cb3f1';
const archive=spawnSync('git',['archive',pin,'frontend'],{cwd:root,maxBuffer:16*1024*1024});assert.equal(archive.status,0);
const extracted=spawnSync('tar',['-xf','-','-C',scratch],{input:archive.stdout});assert.equal(extracted.status,0);
let upgraded=false;const requests=[];
const server=createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://local').pathname;
 if(path==='/'){res.setHeader('Content-Type','text/html');return res.end('<!doctype html><html><body></body></html>');}
 const base=upgraded?root:scratch;if(req.url.endsWith('?root-only-probe')){res.setHeader('Content-Type','text/javascript');return res.end(spawnSync('git',['show','37f3e73:frontend/macromate-card.js'],{cwd:root}).stdout);}const file=resolve(base,'.'+path.replace('/macromate-assets/','/frontend/'));
 if(!file.startsWith(base+'/'))throw Error();
 requests.push({path,revision:upgraded?'current':pin});res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':extname(file)==='.css'?'text/css':'application/octet-stream');
 // No fabricated cache headers: module reuse within one document is browser-native.
 res.end(await readFile(file));
 }catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const evidence={scope:'Real Chromium same-document module cache, pinned published frontend; synthetic read-only current-shaped backend',production:false,checks:[]};
const setup=()=>{
 window.calls=[];
 window.hass={user:{id:'synthetic-upgrade',is_admin:true},language:'de',connection:{subscribeMessage:async()=>()=>{}},callWS:async m=>{calls.push(m);if(m.action.startsWith('shopping_'))throw {code:'invalid_request'};switch(m.action){case 'describe':return {actions:{}};case 'preferences_get':return {preferences:{}};case 'recipes_get_all':return {recipes:[]};case 'tags_get_all':return {tags:[]};case 'global_timers_get':return {timers:[]};case 'timer_presets_get':return {presets:[]};case 'diary':throw {code:'read_failed'};default:throw {code:'invalid_request'};}}};
 window.card=document.createElement('macromate-card');card.setConfig({});card.hass=hass;document.body.append(card);
};
try{
 const context=await browser.newContext();const page=await context.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.evaluate(async()=>{await import('/macromate-assets/macromate-card.js?v=unified1');window.oldClass=customElements.get('macromate-card');});
 await page.evaluate(setup);await page.waitForFunction(()=>card.application&&!card.application._loading);
 evidence.old=await page.evaluate(()=>({shopping:/Einkaufsliste|Shopping List/.test(card.application.shadowRoot.textContent),startError:card.application._error,shoppingCalls:calls.filter(m=>m.action.startsWith('shopping_')).map(m=>m.action)}));
 assert.equal(evidence.old.shopping,true);assert.ok(evidence.old.shoppingCalls.length);assert.equal(evidence.old.startError,null,'Retired shopping read alone is swallowed by the historical frontend; it does NOT establish the reported Start cause');
 upgraded=true;
 // Previous release root-query-only strategy does not reload its dependencies
 // and its customElements guard silently retains the existing old constructor.
 await page.evaluate(async()=>{await import('/macromate-assets/macromate-card.js?root-only-probe');});
 assert.equal(await page.evaluate(()=>customElements.get('macromate-card')===oldClass),true);
 const manifest=JSON.parse(await readFile(resolve(root,'frontend/delivery-manifest.json')));
 const before=requests.length;
 await page.evaluate(async url=>{await import(url);},manifest.entry);
 assert.equal(await page.evaluate(()=>customElements.get('macromate-card')===oldClass),true);
 assert.ok((await page.locator('#macromate-delivery-status').innerText()).includes('registration_conflict'));
 assert.ok(!requests.slice(before).some(r=>r.path.endsWith('/card-runtime.js')),'Conflict detected before evaluating a second dependency graph');
 evidence.checks.push('old shopping persists; retired shopping failure alone does NOT reproduce Start error','first-definition retention is native browser behavior','new loader refuses mixed graph with explicit revision diagnostic');
 await page.reload();await page.evaluate(async()=>{await import('/macromate-assets/macromate-card.js?v=unified1');});await page.evaluate(setup);
 await page.waitForFunction(()=>card.application&&!card.application._loading);
 assert.equal(await page.evaluate(()=>calls.some(m=>m.action.startsWith('shopping_'))),false);
 assert.equal(await page.evaluate(()=>card.application._error),null);
 assert.equal(await page.getByRole('button',{name:'Alle Aktionen',exact:true}).count(),0);
 const count=requests.length;await page.evaluate(async url=>{await import(url);},manifest.entry);
 assert.equal(await page.locator('#macromate-delivery-status').count(),0);
 assert.ok(!requests.slice(count).some(r=>r.path.endsWith('/card-runtime.js')),'Manual and automatic registrations share one promise and constructor');
 evidence.checks.push('same browser cache after page reload loads current revision and nonshopping Start','manual resource legacy query and canonical automatic loader coalesce');
 evidence.revision=manifest.revision;console.log(JSON.stringify(evidence,null,2));
 if(process.env.EVIDENCE_DIR)await writeFile(resolve(process.env.EVIDENCE_DIR,'upgrade-evidence.json'),JSON.stringify(evidence,null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));await rm(scratch,{recursive:true,force:true});}
