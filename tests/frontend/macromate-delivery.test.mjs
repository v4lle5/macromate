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
