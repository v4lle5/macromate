// Check mutable source only. Published graphs, generated bundles and vendor
// bytes keep their exact identities and are verified by the packaging gates.
import { createRequire } from 'node:module';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

if (!process.env.FRONTEND_DEPS) throw Error('Set FRONTEND_DEPS to the pinned test dependencies.');
const require = createRequire(resolve(process.env.FRONTEND_DEPS, 'package.json'));
const prettier = require('prettier');
const write = process.argv.includes('--write');
let checked = 0, failed = 0;
async function visit(directory) {
  for (const row of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, row.name);
    if (row.isDirectory()) {
      if (!['releases', 'unified', 'vendor', 'node_modules'].includes(row.name)) await visit(path);
    } else if (/\.(js|css)$/.test(row.name) && !['macromate-card.js', 'build-info.js'].includes(row.name)) {
      const source = await readFile(path, 'utf8');
      const formatted = await prettier.format(source, { filepath: path });
      checked++;
      if (source !== formatted) {
        if (write) await writeFile(path, formatted);
        else { console.error('Format required: ' + path); failed++; }
      }
    }
  }
}
await visit(resolve(new URL('../frontend/', import.meta.url).pathname));
console.log(`${checked} mutable frontend sources checked; ${failed} formatting failures.`);
if (failed) process.exitCode = 1;
