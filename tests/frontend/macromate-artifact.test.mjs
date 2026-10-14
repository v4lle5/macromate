import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';

test('shipped decoder has pinned identity, legal files and a scoped reproducible input inventory',async()=>{
 const bundle=await readFile('frontend/vendor/zxing-0.21.3.js');
 assert.deepEqual(await readFile('frontend/brand-icon.png'),await readFile('custom_components/macromate/brand/icon@2x.png'),'reuse the unchanged canonical brand icon');
 assert.equal(createHash('sha256').update(bundle).digest('hex'),'420c369125f7ce622f12cd623b72c6fcdf00357f8d7e43af272e45fe2ee980bd');
 const inputs=JSON.parse(await readFile('frontend/vendor/bundle-inputs.json'));
 assert.equal(Object.keys(inputs).length,41);
 assert.ok(Object.keys(inputs).every(p=>p.startsWith('@zxing/library/')||p.startsWith('ts-custom-error/')||p==='frontend/vendor/zxing-entry.js'));
 for(const name of ['ZXING-LICENSE.txt','TS-CUSTOM-ERROR-LICENSE.txt','zxing-0.21.3.js.LEGAL.txt'])assert.ok((await readFile('frontend/vendor/'+name)).length>100);
 const deps=JSON.parse(await readFile('tests/frontend/deps.package.json'));
 assert.deepEqual(deps.dependencies,{'@zxing/library':'0.21.3','bwip-js':'4.7.0',esbuild:'0.25.11',playwright:'1.56.1'});
 const lock=JSON.parse(await readFile('tests/frontend/deps.package-lock.json'));
 assert.equal(lock.packages['node_modules/@zxing/library'].version,'0.21.3');
 assert.ok(lock.packages['node_modules/@zxing/library'].integrity.startsWith('sha512-'));
});

test('installable frontend byte-matches every development asset including food context guards',async()=>{
 const development='frontend',packaged='custom_components/macromate/frontend';
 const files=async root=>(await readdir(root,{recursive:true,withFileTypes:true})).filter(entry=>entry.isFile()).map(entry=>(entry.parentPath+'/'+entry.name).slice(root.length+1)).sort();
 const names=await files(development);
 assert.deepEqual(await files(packaged),names,'same complete frontend asset inventory');
 for(const name of names)assert.deepEqual(await readFile(packaged+'/'+name),await readFile(development+'/'+name),'distributed asset mismatch: '+name);
});

test('frontend runtime source has no raw HTML, token access, browser credential storage or remote module imports',async()=>{
 for(const name of (await readdir('frontend')).filter(name=>name.endsWith('.js'))){
  const source=await readFile('frontend/'+name,'utf8');
  assert.doesNotMatch(source,/innerHTML|insertAdjacentHTML|localStorage|sessionStorage|access_token|auth\.data|Bearer\s/,'unsafe API in '+name);
  assert.doesNotMatch(source,/(?:from\s+|import\()['"](?:https?:|\/\/)/,'remote module in '+name);
 }
});

test('extended nutrient vocabulary has all 54 wire-domain keys and explicit mass/volume units',async()=>{
 const {NUTRIENTS}=await import('../../frontend/dom.js');
 assert.equal(Object.keys(NUTRIENTS).length,54);
 assert.deepEqual(NUTRIENTS.vitamin_b12,['Vitamin B12','µg']);assert.deepEqual(NUTRIENTS.water,['Wasser','ml']);assert.deepEqual(NUTRIENTS.sodium,['Natrium','mg']);
});
