// Task-private reports only. Native HA and packaged equality remain parent gates.
import {spawnSync} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(new URL('../..',import.meta.url).pathname);
const evidence=process.env.EVIDENCE_DIR;
if(!evidence)throw Error('Set task-private EVIDENCE_DIR.');
await mkdir(evidence,{recursive:true});
const scripts=['build','adapter','amounts','shopping','wake','browser','domain-browser','nutrition-browser','workflows','refresh-browser','manifests'];
const jobs=scripts.map(name=>['tests/frontend/macromate-unified-'+name+'.mjs']);
jobs.push(['tests/frontend/macromate-upgrade-browser.mjs']);
jobs.push(['--test','--test-skip-pattern=installable card assets','tests/frontend/macromate-card.test.mjs','tests/frontend/macromate-barcode.test.mjs','tests/frontend/macromate-client.test.mjs','tests/frontend/macromate-browser.test.mjs']);
const rows=[];
for(const [index,args]of jobs.entries()){
 const result=spawnSync(process.execPath,args,{cwd:root,env:{...process.env,MACROMATE_EVIDENCE_DIR:evidence},encoding:'utf8',timeout:240000,maxBuffer:8*1024*1024});
 const log=(result.stdout||'')+(result.stderr||'');const file=`verification-${String(index+1).padStart(2,'0')}.log`;
 await writeFile(resolve(evidence,file),log);rows.push({command:'node '+args.join(' '),exitCode:result.status,log:file,sha256:createHash('sha256').update(log).digest('hex'),error:result.error?.message||null});
 console.log(log.trim());
 if(result.status!==0){process.exitCode=1;break;}
}
const inputs=[];
for(const file of ['frontend/unified/build-manifest.json','frontend/unified-src/source-manifest.json','frontend/unified-src/feature-support.json'])inputs.push({path:file,sha256:createHash('sha256').update(await readFile(resolve(root,file))).digest('hex')});
await writeFile(resolve(evidence,'verification.json'),JSON.stringify({node:process.version,jobs:rows,inputs,nativeHA:false,physicalDevices:false,packagedEquality:'Not run here; one pre-mirror card equality test is explicitly skipped. Parent must mirror the complete frontend and run all equality gates.'},null,2)+'\n');
console.log('Evidence: verification.json and per-command logs.');
