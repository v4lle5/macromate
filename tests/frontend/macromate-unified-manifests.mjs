import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const build=JSON.parse(await readFile('frontend/unified/build-manifest.json'));
const names=(await readdir('frontend/unified',{recursive:true,withFileTypes:true})).filter(e=>e.isFile()).map(e=>'frontend/unified/'+(e.parentPath+'/').slice('frontend/unified/'.length)+e.name).sort();
assert.deepEqual(names,[...build.artifacts.map(a=>a.path),'frontend/unified/build-manifest.json'].sort(),'Output contains only the current build and complete notices, not stale chunks');
const source=JSON.parse(await readFile('frontend/unified-src/source-manifest.json'));
for(const file of [...build.artifacts,...source.files]){const bytes=await readFile(file.path);assert.equal(bytes.length,file.bytes,file.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);}
const support=JSON.parse(await readFile('frontend/unified-src/feature-support.json'));
assert.equal(support.rows.filter(r=>r.inventory==='standalone-card').length,43);
assert.equal(support.rows.filter(r=>r.inventory==='bundled-recipe-ui').length,25);
assert.equal(new Set(support.rows.map(r=>r.inventory+':'+r.id)).size,68);
for(const row of support.rows){assert.ok(row.implementation.length>0,row.id);assert.ok(row.verification.status,row.id);assert.ok(row.remainingGates.length>0,row.id);}
for(const manifest of [source,build,support])assert.doesNotMatch(JSON.stringify(manifest),/\/home\/valentin|cache\/scratch|access_token|Bearer /,'No private machine paths or credentials in public manifests');
console.log('PASS: exact clean build inventory, complete 43+25 feature rows, current source/output hashes and portable manifests');
