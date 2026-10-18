import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../frontend/',import.meta.url);
test('installed registration pins the entire runtime graph, not only a root query',async()=>{
 const manifest=JSON.parse(await readFile(new URL('delivery-manifest.json',root)));
 assert.match(manifest.revision,/^[a-f0-9]{64}$/);
 const files=[];const visit=async(path='')=>{for(const row of await readdir(new URL(`releases/${manifest.revision}/${path}`,root),{withFileTypes:true})){if(row.isDirectory())await visit(path+row.name+'/');else files.push(path+row.name);}};await visit();
 assert.deepEqual(files.sort(),Object.keys(manifest.files).sort());
 for(const [name,hash]of Object.entries(manifest.files))assert.equal(createHash('sha256').update(await readFile(new URL(`releases/${manifest.revision}/${name}`,root))).digest('hex'),hash,name);
 const entry=await readFile(new URL('macromate-card.js',root),'utf8');
 assert.ok(entry.includes(`releases/${manifest.revision}/card-runtime.js`));
 assert.ok(entry.includes('registration_conflict'),'Never silently retain a first-defined obsolete card');
});

test('every retained graph is complete, byte-verified and included in the installable component',async()=>{
 const inventory=JSON.parse(await readFile(new URL('retained-releases.json',root)));
 assert.equal(inventory.schema_version,1);
 assert.equal(inventory.retention,'keep-all-published');
 const current=JSON.parse(await readFile(new URL('delivery-manifest.json',root)));
 assert.deepEqual(inventory.releases[current.revision],current.files);
 for(const prefix of ['../../frontend/','../../custom_components/macromate/frontend/']){
  const base=new URL(prefix,import.meta.url);
  assert.deepEqual((await readdir(new URL('releases/',base))).sort(),Object.keys(inventory.releases).sort());
  for(const [revision,files]of Object.entries(inventory.releases)){
   const found=[];async function visit(path=''){for(const row of await readdir(new URL(`releases/${revision}/${path}`,base),{withFileTypes:true})){if(row.isDirectory())await visit(path+row.name+'/');else {assert.ok(row.isFile());found.push(path+row.name);}}}await visit();
   assert.deepEqual(found.sort(),Object.keys(files).sort());
   for(const [name,digest]of Object.entries(files))assert.equal(createHash('sha256').update(await readFile(new URL(`releases/${revision}/${name}`,base))).digest('hex'),digest,`${revision}/${name}`);
  }
 }
});
