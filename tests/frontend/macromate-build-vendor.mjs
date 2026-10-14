// Build tooling only. Dependencies must live in private scratch, not the repository.
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
const deps=process.env.FRONTEND_DEPS||'/home/valentin/.hermes/profiles/darlene/cache/scratch/macromate-frontend-deps';
const require=createRequire(deps+'/package.json');
const moduleName=path=>path.includes('node_modules/')?path.split('node_modules/').at(-1):path;
const result=await require('esbuild').build({
 entryPoints:['frontend/vendor/zxing-entry.js'],outfile:'frontend/vendor/zxing-0.21.3.js',
 bundle:true,format:'esm',target:['safari15','firefox115','chrome100'],minify:true,
 legalComments:'none',metafile:true,nodePaths:[deps+'/node_modules'],
 footer:{js:'/*! Copyright/license notices: zxing-0.21.3.js.LEGAL.txt; ZXING-LICENSE.txt; TS-CUSTOM-ERROR-LICENSE.txt */'},
});
const inputs=Object.entries(result.metafile.inputs);
await writeFile('frontend/vendor/bundle-inputs.json',JSON.stringify(Object.fromEntries(inputs.map(([path,data])=>[moduleName(path),{bytes:data.bytes}])),null,2)+'\n');
// Upstream uses ordinary /* comments, which esbuild does NOT recognize as legal comments.
// Retain every original leading copyright/license header explicitly in a distributed sidecar.
const notices=[];
for(const [path] of inputs){
 const source=await readFile(path,'utf8');
 const header=source.match(/^\s*(\/\*[\s\S]*?\*\/)/)?.[1];
 if(header&&/copyright|licen[sc]e/i.test(header))notices.push(moduleName(path)+'\n'+header);
}
await writeFile('frontend/vendor/zxing-0.21.3.js.LEGAL.txt',notices.join('\n\n')+'\n\nAdditional full licenses: ZXING-LICENSE.txt; TS-CUSTOM-ERROR-LICENSE.txt\n');
console.log('Bundled '+inputs.length+' source modules with '+notices.length+' retained notice headers; no runtime npm or CDN.');
