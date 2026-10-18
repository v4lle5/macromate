// Real HTTP + Chromium: keep A loaded with its editor still unrequested, publish B,
// then use A's lazy editor. No production HA, credentials, screenshots or mocks.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {cp, readFile, mkdtemp, mkdir, writeFile, rm, stat, rename} from 'node:fs/promises';
import {resolve, dirname, extname} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=resolve(new URL('../..',import.meta.url).pathname);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pinned='077a11b';
const run=(command,args,cwd)=>{const result=spawnSync(command,args,{cwd,encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(result.status,0,result.stderr);return result.stdout;};

test('published immutable graphs survive successive builds and package replacement for a warm browser', {timeout:120000}, async()=>{
 const scratch=await mkdtemp(resolve(tmpdir(),'macromate-delivery-upgrade-'));
 let browser,server,native,nativeDone;
 let nativeLog='';
 try{
  await cp(resolve(root,'frontend'),resolve(scratch,'frontend'),{recursive:true});
  await mkdir(resolve(scratch,'tests/frontend'),{recursive:true});
  // A test-only baseline override allows replaying the historical destructive
  // publisher against the same native server without editing the working tree.
  for(const name of ['macromate-delivery-build.mjs','macromate-loader.js'])await cp(name==='macromate-delivery-build.mjs'&&process.env.MACROMATE_TEST_DELIVERY_BUILDER?process.env.MACROMATE_TEST_DELIVERY_BUILDER:resolve(root,'tests/frontend',name),resolve(scratch,'tests/frontend',name));
  const old=JSON.parse(run('git',['show',`${pinned}:frontend/delivery-manifest.json`],root));
  // Use the whole original graph, not a hand-maintained editor fixture.
  for(const [name,digest] of Object.entries(old.files)){
   const bytes=spawnSync('git',['show',`${pinned}:frontend/releases/${old.revision}/${name}`],{cwd:root,maxBuffer:8*1024*1024});
   assert.equal(bytes.status,0);assert.equal(sha(bytes.stdout),digest);
   const target=resolve(scratch,'frontend/releases',old.revision,name);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes.stdout);
  }
  const install=resolve(scratch,'install/custom_components/macromate/frontend');
  await cp(resolve(scratch,'frontend'),install,{recursive:true});
  const base=install;const requests=[];
  let origin;
  if(process.env.HA_PYTHON){
   native=spawn(process.env.HA_PYTHON,[resolve(root,'tests/ha/native_delivery_server.py'),base],{stdio:['pipe','pipe','pipe']});
   native.stderr.on('data',bytes=>{nativeLog+=bytes;});
   nativeDone=new Promise(resolve=>native.once('exit',(code,signal)=>resolve({code,signal})));
   origin=await new Promise((done,fail)=>{
    const timer=setTimeout(()=>fail(Error('Native HA static server startup timed out: '+nativeLog)),30000);
    native.once('error',error=>{clearTimeout(timer);fail(error);});
    native.once('exit',code=>{clearTimeout(timer);fail(Error('Native HA server exited '+code+': '+nativeLog));});
    const lines=createInterface({input:native.stdout});lines.on('line',line=>{try{const value=JSON.parse(line);if(value.url){clearTimeout(timer);done(value.url);}}catch{}});
   });
  }else{
  server=createServer(async(req,res)=>{try{
   const path=new URL(req.url,'http://local').pathname;
   if(path==='/favicon.ico'){res.writeHead(204);return res.end();}
   if(path==='/'){res.setHeader('Content-Type','text/html');return res.end('<!doctype html><body></body>');}
   assert.ok(path.startsWith('/macromate-assets/'));
   const file=resolve(base,path.slice('/macromate-assets/'.length));assert.ok(file.startsWith(base+'/'));
   const bytes=await readFile(file);requests.push({path,status:200});
   res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':extname(file)==='.css'?'text/css':'application/octet-stream');res.end(bytes);
  }catch{requests.push({path:req.url,status:404});res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  origin=`http://127.0.0.1:${server.address().port}`;
  }
  const deps=process.env.PLAYWRIGHT_DIR||resolve(process.env.FRONTEND_DEPS,'node_modules');
  const {chromium}=createRequire(resolve(deps,'package.json'))('playwright');
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||process.env.CHROMIUM||chromium.executablePath(),headless:true,args:['--no-sandbox']});
  async function load(manifest){const page=await browser.newPage();page.on('response',response=>{const path=new URL(response.url()).pathname;if(path.startsWith('/macromate-assets/'))requests.push({path,status:response.status()});});await page.goto(origin+(native?'/native-delivery/':'/'));await page.evaluate(async entry=>{await import(entry);window.loadedCard=customElements.get('macromate-card');document.body.append(document.createElement('macromate-card'));},manifest.entry);return page;}
  async function editor(page,manifest){
   try{await page.evaluate(async()=>{const editor=await loadedCard.getConfigElement();editor.setConfig({type:'custom:macromate-card'});window.changes=[];editor.addEventListener('config-changed',event=>changes.push(event.detail.config));document.body.append(editor);});}
   catch(error){error.message+='\nAsset HTTP failures: '+JSON.stringify(requests.filter(row=>row.status!==200));throw error;}
   await page.locator('macromate-card-editor select').selectOption('summary');
   assert.equal(await page.evaluate(()=>changes.at(-1).mode),'summary');
   assert.ok(requests.some(row=>row.path===`/macromate-assets/releases/${manifest.revision}/macromate-card-editor.js`&&row.status===200));
   // Exercise another delayed module and its relative graph, beyond the editor.
   await page.evaluate(async revision=>{await import(`/macromate-assets/releases/${revision}/scanner.js`);await import(`/macromate-assets/releases/${revision}/vendor/zxing-0.21.3.js`);},manifest.revision);
  }
  const immutableTimes=async manifest=>Object.fromEntries(await Promise.all(Object.keys(manifest.files).map(async name=>[name,(await stat(resolve(scratch,'frontend/releases',manifest.revision,name))).mtimeMs])));
  const oldTimes=await immutableTimes(old);
  const warm=await load(old);
  assert.ok(!requests.some(row=>row.path.endsWith('/macromate-card-editor.js')),'A editor must not be cached before replacement');
  run(process.execPath,['tests/frontend/macromate-delivery-build.mjs'],scratch);
  const current=JSON.parse(await readFile(resolve(scratch,'frontend/delivery-manifest.json')));
  assert.notEqual(current.revision,old.revision);
  // Replace the whole directory, not an overlay that could hide missing history.
  async function replaceInstall(){
   await cp(resolve(scratch,'frontend'),install+'.next',{recursive:true});
   await rename(install,install+'.previous');await rename(install+'.next',install);
   await rm(install+'.previous',{recursive:true});
  }
  await replaceInstall();
  await editor(warm,old); // RED on the destructive builder: actual Chromium import 404.
  const fresh=await load(current);
  const currentTimes=await immutableTimes(current);
  async function verify(manifest){
   for(const [name,digest] of Object.entries(manifest.files)){
    const response=await fetch(`${origin}/macromate-assets/releases/${manifest.revision}/${name}`);
    assert.equal(response.status,200,`${manifest.revision}/${name}`);
    if(name.endsWith('.js'))assert.match(response.headers.get('content-type'),/javascript/);
    assert.equal(sha(Buffer.from(await response.arrayBuffer())),digest,name);
   }
  }
  await verify(old);await verify(current);
  await writeFile(resolve(scratch,'frontend/macromate-card-editor.js'),(await readFile(resolve(scratch,'frontend/macromate-card-editor.js'),'utf8'))+'\n// next synthetic publication\n');
  run(process.execPath,['tests/frontend/macromate-delivery-build.mjs'],scratch);
  const next=JSON.parse(await readFile(resolve(scratch,'frontend/delivery-manifest.json')));
  assert.notEqual(next.revision,current.revision);
  await replaceInstall();
  await verify(old);await verify(current);await verify(next);
  await editor(fresh,current); // B's editor was also unrequested until C replaced it.
  const newest=await load(next);await editor(newest,next);
  assert.deepEqual(await immutableTimes(old),oldTimes,'Never rewrite any old immutable file');
  assert.deepEqual(await immutableTimes(current),currentTimes,'Successive publications leave B untouched');
  assert.deepEqual(requests.filter(row=>row.status!==200),[],'No missing graph asset requests');
  // A no-op build must not touch any immutable file, even its mtime.
  const probe=resolve(scratch,'frontend/releases',next.revision,'macromate-card-editor.js');
  const before=await stat(probe);run(process.execPath,['tests/frontend/macromate-delivery-build.mjs'],scratch);assert.equal((await stat(probe)).mtimeMs,before.mtimeMs);
  console.log(JSON.stringify({server:native?'native Home Assistant static paths':'Node HTTP static fallback',old:old.revision,current:current.revision,next:next.revision,verifiedGraphs:3,oldFiles:Object.keys(old.files).length,currentFiles:Object.keys(current.files).length,failedRequests:requests.filter(row=>row.status!==200)},null,2));
 }finally{
  await browser?.close();if(server)await new Promise(r=>server.close(r));
  if(native){
   native.stdin.end();
   const timer=setTimeout(()=>native.kill('SIGKILL'),15000);
   const result=await nativeDone;clearTimeout(timer);assert.equal(result.code,0,nativeLog);
  }
  await rm(scratch,{recursive:true,force:true});
 }
});
