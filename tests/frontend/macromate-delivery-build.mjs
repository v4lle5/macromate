// Freeze every runtime file under one digest. Published graphs are append-only:
// cached custom elements can request a lazy module long after a new publication.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,mkdir,rm,rename,mkdtemp,open} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(new URL('../../frontend/',import.meta.url).pathname);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sorted=map=>Object.fromEntries([...map].sort(([a],[b])=>a.localeCompare(b)));
const json=value=>JSON.stringify(value,null,2)+'\n';
const inventoryPath=resolve(root,'retained-releases.json');
const lockPath=resolve(root,'../.macromate-delivery-build.lock');
// Serialize publishers. An interrupted lock requires explicit operator inspection;
// never guess that a publisher is dead and silently discard its lock/history.
const lock=await open(lockPath,'wx');
let staging;
try{
 const files=new Map();
 async function visit(directory,collect,path=''){
  for(const row of await readdir(resolve(directory,path),{withFileTypes:true})){
   const name=path+row.name;
   if(row.isDirectory())await visit(directory,collect,name+'/');
   else {assert.ok(row.isFile(),`Non-regular immutable input: ${name}`);collect.set(name,await readFile(resolve(directory,name)));}
  }
 }
 // Mutable source tree: exclude generated pointers/history from graph identity.
 async function source(path=''){
  for(const row of await readdir(resolve(root,path),{withFileTypes:true})){
   const name=path+row.name;
   if(row.isDirectory()){if(!['releases','node_modules'].includes(row.name))await source(name+'/');}
   else if(!['macromate-card.js','build-info.js','delivery-manifest.json','retained-releases.json','source-manifest.json'].includes(row.name)){
    assert.ok(row.isFile(),`Non-regular frontend input: ${name}`);files.set(name,await readFile(resolve(root,name)));
   }
  }
 }
 await source();
 const loader=await readFile(new URL('./macromate-loader.js',import.meta.url),'utf8');
 const revision=hash(JSON.stringify([...files].sort(([a],[b])=>a.localeCompare(b)).map(([name,bytes])=>[name,hash(bytes)]))+loader);
 const info=`export const BUILD_REVISION=${JSON.stringify(revision)};\n`;
 files.set('build-info.js',Buffer.from(info));
 const makeLoader=prefix=>loader.replaceAll('__REVISION__',revision).replaceAll('__RUNTIME__',prefix+'card-runtime.js');
 files.set('loader.js',Buffer.from(makeLoader('./')));
 const digests=sorted(new Map([...files].map(([name,bytes])=>[name,hash(bytes)])));
 await mkdir(resolve(root,'releases'),{recursive:true});
 const directories=await readdir(resolve(root,'releases'),{withFileTypes:true});
 let inventory;
 try{inventory=JSON.parse(await readFile(inventoryPath,'utf8'));}
 catch(error){
  // Bootstrap only an empty history, never silently adopt or forget published URLs.
  if(error.code!=='ENOENT'||directories.length)throw new Error('Missing or invalid retained release inventory; recover exact published history before building.',{cause:error});
  inventory={schema_version:1,retention:'keep-all-published',releases:{}};
 }
 assert.equal(inventory.schema_version,1,'Unsupported retained release inventory');
 assert.equal(inventory.retention,'keep-all-published','Unsafe immutable retention policy');
 assert.ok(inventory.releases&&typeof inventory.releases==='object'&&!Array.isArray(inventory.releases),'Invalid retained inventory');
 assert.deepEqual(directories.map(row=>row.name).sort(),Object.keys(inventory.releases).sort(),'Immutable release inventory differs (missing or unrecorded graph)');
 for(const row of directories){
  assert.ok(row.isDirectory()&&/^[a-f0-9]{64}$/.test(row.name),'Invalid immutable release directory');
  const graph=new Map();await visit(resolve(root,'releases',row.name),graph);
  assert.deepEqual(sorted(new Map([...graph].map(([name,bytes])=>[name,hash(bytes)]))),inventory.releases[row.name],`Immutable release changed: ${row.name}`);
 }
 if(Object.hasOwn(inventory.releases,revision)){
  // A no-op rebuild checks every byte but does not rewrite any immutable file.
  assert.deepEqual(inventory.releases[revision],digests,`Immutable digest collision: ${revision}`);
 }else{
  staging=await mkdtemp(resolve(root,'../.macromate-release-'));
  for(const [name,bytes]of files){const target=resolve(staging,name);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes);}
  // Publish a complete graph before exposing its pointer. Existing graphs never move.
  await rename(staging,resolve(root,'releases',revision));staging=undefined;
  inventory.releases[revision]=digests;
 }
 inventory.releases=sorted(new Map(Object.entries(inventory.releases)));
 async function replace(name,bytes){
  // Task-owned staging file, same filesystem; readers see old or complete new bytes.
  const temporary=resolve(root,`.${name}.next`);
  await writeFile(temporary,bytes);await rename(temporary,resolve(root,name));
 }
 await replace('retained-releases.json',json(inventory));
 await replace('build-info.js',info);
 await replace('macromate-card.js',makeLoader(`./releases/${revision}/`));
 await replace('delivery-manifest.json',json({schema_version:1,revision,entry:`/macromate-assets/releases/${revision}/loader.js`,files:digests}));
 console.log(`Complete frontend delivery revision ${revision}; retained ${Object.keys(inventory.releases).length} immutable graphs (no automatic eviction)`);
}finally{
 if(staging)await rm(staging,{recursive:true,force:true});
 await lock.close();await rm(lockPath);
}
