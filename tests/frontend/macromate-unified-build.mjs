import {resolve,relative,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {readFile,writeFile,mkdir,readdir,rm,mkdtemp,symlink,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const deps=process.env.MACROMATE_BUILD_DEPS;
if(!deps)throw new Error('Set MACROMATE_BUILD_DEPS to the clean dependency directory. Install the pinned manifest with npm --ignore-scripts.');
const require=createRequire(resolve(deps,'package.json'));const {build}=require('esbuild');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');const output=resolve(root,'frontend/unified');
const dependencyRoot=await realpath(resolve(deps,'node_modules'));
// esbuild hashes module identities as well as emitted code. Give its native
// resolver the same logical layout for every checkout/dependency location.
// Preserve the two directory links so IDs stay frontend/... and node_modules/...
// instead of real absolute paths. No dependency files are copied into the repo.
// Unlike an onResolve/build.resolve round trip, this also preserves esbuild's
// internal browser:false (disabled-module) state and all normal export conditions.
const resolverRoot=await mkdtemp(resolve(tmpdir(),'macromate-canonical-build-'));
let result;
const dependencyFiles=new Map();
try{
  await symlink(resolve(root,'frontend'),resolve(resolverRoot,'frontend'),'dir');
  await symlink(dependencyRoot,resolve(resolverRoot,'node_modules'),'dir');
  result=await build({absWorkingDir:resolverRoot,preserveSymlinks:true,entryPoints:['frontend/unified-src/recipe-manager-card.js'],outdir:resolve(resolverRoot,'frontend/unified'),entryNames:'app',chunkNames:'chunks/[name]-[hash]',bundle:true,format:'esm',splitting:true,minify:true,target:['es2022'],metafile:true,write:false,legalComments:'external',plugins:[{name:'existing-nutrition-runtime',setup(b){b.onResolve({filter:/^\.\.\/\.\.\/nutrition-base\.js$/},()=>({path:'../nutrition-base.js',external:true}));}}]});
  for(const name of Object.keys(result.metafile.inputs)){
    if(name.startsWith('(disabled):'))continue;
    if(!name.startsWith('node_modules/')){
      if(name.split('/').includes('node_modules'))throw Error('Dependency resolved outside the controlled installation: '+name);
      continue;
    }
    const full=await realpath(resolve(resolverRoot,name.replace(/[?#].*$/,'')));
    if(!full.startsWith(dependencyRoot+sep))throw Error('Dependency resolved outside the controlled installation: '+name);
    dependencyFiles.set(name,full);
  }
  for(const file of result.outputFiles)file.path=resolve(root,relative(resolverRoot,file.path));
}finally{
  await rm(resolverRoot,{recursive:true,force:true});
}
const records=[];const notices=[];const packages=new Set();
for(const full of dependencyFiles.values()){let dir=dirname(full);while(dir!==dependencyRoot&&dir!==dirname(dir)){try{const p=JSON.parse(await readFile(resolve(dir,'package.json'),'utf8'));if(p.name){packages.add(dir);break;}}catch{}dir=dirname(dir);}}
const visit=async dir=>{if(packages.has(dir)&&records.some(p=>p.directory===dir))return;const p=JSON.parse(await readFile(resolve(dir,'package.json'),'utf8'));for(const name of Object.keys(p.dependencies||{})){const dependency=resolve(deps,'node_modules',name);if(!packages.has(dependency)){packages.add(dependency);await visit(dependency);}}};for(const dir of [...packages])if(JSON.parse(await readFile(resolve(dir,'package.json'),'utf8')).name==='jszip')await visit(dir);
for(const dir of [...packages].sort((a,b)=>relative(dependencyRoot,a).localeCompare(relative(dependencyRoot,b)))){const p=JSON.parse(await readFile(resolve(dir,'package.json'),'utf8'));let license='';for(const name of (await readdir(dir)).sort()){if(/(^|[-_.])(LICENSE|LICENCE|COPYING)(\.|$)/i.test(name))license+=await readFile(resolve(dir,name),'utf8')+'\n';}if(!license){try{const readme=await readFile(resolve(dir,'README.md'),'utf8');if(readme.includes('## License'))license=readme.slice(readme.indexOf('## License'));}catch{}}if(!license){try{license=await readFile(resolve(root,'frontend/unified-src/licenses',`${p.name.replaceAll('/','-')}-${p.version}.txt`),'utf8');}catch{}}if(!license)throw new Error('Missing full runtime notice: '+p.name);records.push({name:p.name,version:p.version,license:p.license});notices.push(`===== ${p.name} ${p.version} =====\n${license}`);}
records.sort((a,b)=>a.name.localeCompare(b.name));notices.unshift(await readFile(resolve(root,'frontend/unified-src/RECIPE-MANAGER-CARD-LICENSE.txt'),'utf8'));
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const file of result.outputFiles){await mkdir(resolve(file.path,'..'),{recursive:true});await writeFile(file.path,file.contents);}
await writeFile(resolve(output,'THIRD-PARTY-NOTICES.txt'),notices.join('\n'));
const artifacts=[];for(const path of [...Object.keys(result.metafile.outputs),relative(root,resolve(output,'THIRD-PARTY-NOTICES.txt'))]){const full=resolve(root,path);const data=await readFile(full);artifacts.push({path:relative(root,full),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
const manifest={source:{project:'Recipe-Manager-Card',revision:'e25f96663538fb148b25ccbe51982b7ba6c6681d',license:'MIT'},build:{bundler:'esbuild',version:require('esbuild/package.json').version,target:'es2022',scriptsExecuted:false},runtimeDependencies:records,artifacts};
await writeFile(resolve(output,'build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const sourcePaths=[];const visitSource=async dir=>{for(const entry of await readdir(dir,{withFileTypes:true})){const full=resolve(dir,entry.name);if(entry.isDirectory()){if(entry.name!=='unified'&&entry.name!=='node_modules')await visitSource(full);}else if(entry.name!=='source-manifest.json')sourcePaths.push(full);}};await visitSource(resolve(root,'frontend'));
for(const entry of await readdir(resolve(root,'tests/frontend')))if(entry.startsWith('macromate-unified-'))sourcePaths.push(resolve(root,'tests/frontend',entry));
const files=[];for(const full of sourcePaths.sort()){const data=await readFile(full);files.push({path:relative(root,full),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
const sourceManifest={schema_version:1,scope:'Complete development frontend and unified test/build inputs; generated outputs are in unified/build-manifest.json',upstream:manifest.source,files};
await writeFile(resolve(root,'frontend/unified-src/source-manifest.json'),JSON.stringify(sourceManifest,null,2)+'\n');
console.log(JSON.stringify({artifacts:artifacts.length,runtimeDependencies:records.length,sourceFiles:files.length},null,2));
