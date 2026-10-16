import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(resolve(process.env.FRONTEND_DEPS,'package.json'));
const {chromium}=require('playwright');
test('card picker exposes a visual editor and preserves unrelated configuration',async()=>{
 const server=createServer(async(req,res)=>{try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!path.startsWith('/frontend/')||path.includes('..'))return res.writeHead(404).end();
  const bytes=await readFile(resolve('.'+path));res.setHeader('Content-Type',extname(path)==='.js'?'text/javascript':'text/plain');res.end(bytes);
 }catch{res.writeHead(404).end();}}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/frontend/macromate-card.js`);
  const result=await page.evaluate(async()=>{
   await import('/frontend/macromate-card.js');
   const Card=customElements.get('macromate-card');
   await import('/frontend/macromate-card.js?v=existing-resource');
   if(Card!==customElements.get('macromate-card')||window.customCards.filter(c=>c.type==='macromate-card').length!==1)throw Error('Duplicate registration');
   if(typeof Card.getConfigElement!=='function')return {visual:false};
   const editor=await Card.getConfigElement();editor.hass={language:'de'};
   editor.setConfig({type:'custom:macromate-card',title:'Existing',mode:'app',test_unknown:true});
   const events=[];editor.addEventListener('config-changed',e=>events.push(e.detail.config));document.body.replaceChildren(editor);
   const mode=editor.shadowRoot.querySelector('select');mode.value='summary';mode.dispatchEvent(new Event('change'));
   return {visual:true,label:editor.shadowRoot.textContent,events};
  });
  assert.equal(result.visual,true,'MacroMate must provide a visual editor, not a YAML-only card');
  assert.match(result.label,/Vollständige App/);
  assert.deepEqual(result.events,[{type:'custom:macromate-card',title:'Existing',mode:'summary',test_unknown:true}]);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
});
