import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const root=resolve(new URL('../..',import.meta.url).pathname);
async function fixture(t){
 const scratch=await mkdtemp(resolve(tmpdir(),'macromate-retention-'));t.after(()=>rm(scratch,{recursive:true,force:true}));
 await mkdir(resolve(scratch,'frontend'),{recursive:true});await mkdir(resolve(scratch,'tests/frontend'),{recursive:true});
 for(const name of ['macromate-delivery-build.mjs','macromate-loader.js'])await cp(resolve(root,'tests/frontend',name),resolve(scratch,'tests/frontend',name));
 await writeFile(resolve(scratch,'frontend/card-runtime.js'),'export const version=1;\n');
 const build=()=>spawnSync(process.execPath,['tests/frontend/macromate-delivery-build.mjs'],{cwd:scratch,encoding:'utf8'});
 assert.equal(build().status,0);
 const manifest=JSON.parse(await readFile(resolve(scratch,'frontend/delivery-manifest.json')));
 return {scratch,manifest,build};
}
for(const kind of ['changed bytes','missing graph','extra file','missing inventory'])test(`publication refuses ${kind} without repairing history or advancing pointers`,async t=>{
 const {scratch,manifest,build}=await fixture(t);
 const pointer=await readFile(resolve(scratch,'frontend/delivery-manifest.json'));
 const graph=resolve(scratch,'frontend/releases',manifest.revision);
 if(kind==='changed bytes')await writeFile(resolve(graph,'card-runtime.js'),'corrupted');
 if(kind==='missing graph')await rm(graph,{recursive:true});
 if(kind==='extra file')await writeFile(resolve(graph,'unexpected.js'),'extra');
 if(kind==='missing inventory')await rm(resolve(scratch,'frontend/retained-releases.json'),{force:true});
 await writeFile(resolve(scratch,'frontend/card-runtime.js'),'export const version=2;\n');
 const failed=build();assert.notEqual(failed.status,0,failed.stdout);assert.match(failed.stderr,/immutable|inventory|retained/i);
 assert.deepEqual(await readFile(resolve(scratch,'frontend/delivery-manifest.json')),pointer);
 if(kind==='changed bytes')assert.equal(await readFile(resolve(graph,'card-runtime.js'),'utf8'),'corrupted');
});
