// Freeze every runtime file under one digest, including CSS, images and lazy modules.
import {readFile,writeFile,readdir,mkdir,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(new URL('../../frontend/',import.meta.url).pathname);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=new Map();
async function visit(path=''){
 for(const row of await readdir(resolve(root,path),{withFileTypes:true})){
  const name=path+row.name;
  if(row.isDirectory()){if(!['releases','node_modules'].includes(row.name))await visit(name+'/');}
  else if(!['macromate-card.js','build-info.js','delivery-manifest.json','source-manifest.json'].includes(row.name))files.set(name,await readFile(resolve(root,name)));
 }
}
await visit();
// Include loader implementation in identity, so delivery fixes also change URL.
const loader=await readFile(new URL('./macromate-loader.js',import.meta.url),'utf8');
const revision=hash(JSON.stringify([...files].sort(([a],[b])=>a.localeCompare(b)).map(([name,bytes])=>[name,hash(bytes)]))+loader);
const info=`export const BUILD_REVISION=${JSON.stringify(revision)};\n`;
files.set('build-info.js',Buffer.from(info));
const makeLoader=prefix=>loader.replaceAll('__REVISION__',revision).replaceAll('__RUNTIME__',prefix+'card-runtime.js');
files.set('loader.js',Buffer.from(makeLoader('./')));
await rm(resolve(root,'releases'),{recursive:true,force:true});
for(const [name,bytes]of files){const target=resolve(root,'releases',revision,name);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes);}
await writeFile(resolve(root,'build-info.js'),info);
await writeFile(resolve(root,'macromate-card.js'),makeLoader(`./releases/${revision}/`));
await writeFile(resolve(root,'delivery-manifest.json'),JSON.stringify({schema_version:1,revision,entry:`/macromate-assets/releases/${revision}/loader.js`,files:Object.fromEntries([...files].sort(([a],[b])=>a.localeCompare(b)).map(([name,bytes])=>[name,hash(bytes)]))},null,2)+'\n');
console.log('Complete frontend delivery revision '+revision);
