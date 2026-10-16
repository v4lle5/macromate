import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
const module=await import('data:text/javascript;base64,'+Buffer.from(await readFile(new URL('../../frontend/client.js',import.meta.url))).toString('base64'));
test('read failures do not claim a potentially committed write',()=>{
 assert.equal(module.publicError({code:'read_failed'}),'Lesen fehlgeschlagen. Verbindung prüfen und erneut laden.');
 assert.ok(!module.publicError(new Error('private provider message')).includes('Schreibstatus'));
 assert.ok(module.publicError({code:'uncertain'}).includes('Schreibstatus'));
});
