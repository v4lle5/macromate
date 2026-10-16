import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawnSync} from 'node:child_process';
import {cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {encoding: 'utf8', timeout: 120000,
    env: {...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH}`}, ...options});
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.error || ''}\n${result.stdout}\n${result.stderr}`);
  return result;
}
async function checkout(destination) {
  await mkdir(join(destination, 'tests'), {recursive: true});
  await cp(join(root, 'frontend'), join(destination, 'frontend'), {recursive: true});
  await cp(join(root, 'tests/frontend'), join(destination, 'tests/frontend'), {recursive: true});
}
async function inventory(checkoutRoot) {
  const files = {};
  async function visit(directory) {
    for (const entry of await readdir(join(checkoutRoot, directory), {withFileTypes: true})) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await visit(path);
      else {
        assert.ok(entry.isFile(), `Unexpected artifact type: ${path}`);
        const bytes = await readFile(join(checkoutRoot, path));
        files[path] = createHash('sha256').update(bytes).digest('hex');
      }
    }
  }
  await visit('frontend/unified');
  const path = 'frontend/unified-src/source-manifest.json';
  files[path] = createHash('sha256').update(await readFile(join(checkoutRoot, path))).digest('hex');
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
}

test('unified outputs and both manifests are identical across clean dependency and checkout paths', {timeout: 300000}, async t => {
  const scratch = await mkdtemp(join(tmpdir(), 'macromate-build-repro-'));
  try {
    const checkouts = [join(scratch, 'checkout-a'), join(scratch, 'different/deep/checkout-b')];
    const dependencies = [join(scratch, 'deps-a'), join(scratch, 'different/deps-b')];
    for (const target of checkouts) await checkout(target);
    for (const target of dependencies) {
      await mkdir(target, {recursive: true});
      for (const name of ['package.json', 'package-lock.json']) {
        await cp(join(root, 'frontend/unified-src', name), join(target, name));
      }
      run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--prefix', target]);
    }
    const results = [];
    for (const [checkoutIndex, depsIndex] of [[0, 0], [0, 1], [1, 1]]) {
      const cwd = checkouts[checkoutIndex];
      run(process.execPath, [join(cwd, 'tests/frontend/macromate-unified-build.mjs')], {
        cwd, env: {...process.env, MACROMATE_BUILD_DEPS: dependencies[depsIndex]},
      });
      results.push(await inventory(cwd));
    }
    assert.deepEqual(results[1], results[0], 'Changing only the clean dependency directory must not change any output byte or filename');
    assert.deepEqual(results[2], results[1], 'Changing only the checkout directory must not change any output byte or filename');
    const cwd = checkouts[0];
    const env = {...process.env, MACROMATE_BUILD_DEPS: dependencies[1]};
    const builder = join(cwd, 'tests/frontend/macromate-unified-build.mjs');
    const manifest = JSON.parse(await readFile(join(cwd, 'frontend/unified/build-manifest.json')));
    const lock = JSON.parse(await readFile(join(root, 'frontend/unified-src/package-lock.json')));
    const notices = await readFile(join(cwd, 'frontend/unified/THIRD-PARTY-NOTICES.txt'), 'utf8');
    assert.equal(manifest.runtimeDependencies.length, 18, 'Keep the full bundled runtime notice closure after retiring the two shopping barcode generators');
    for (const record of manifest.runtimeDependencies) {
      assert.equal(record.version, lock.packages[`node_modules/${record.name}`].version);
      assert.ok(notices.includes(`===== ${record.name} ${record.version} =====`), record.name);
    }
    for (const name of Object.keys(results[0])) {
      assert.ok(!(await readFile(join(cwd, name))).includes(Buffer.from(scratch)), `Private path leaked in ${name}`);
    }
    await t.test('missing full runtime notices fail before replacing the last complete output', async () => {
      const files = ['LICENSE.markdown'].map(name => join(dependencies[1], 'node_modules/jszip', name));
      const original = await Promise.all(files.map(path => readFile(path)));
      try {
        for (const path of files) await rm(path);
        const failed = spawnSync(process.execPath, [builder], {cwd, env, encoding: 'utf8'});
        assert.notEqual(failed.status, 0);
        assert.match(failed.stderr, /Missing full runtime notice: jszip/);
        assert.deepEqual(await inventory(cwd), results[1]);
      } finally {
        for (const [index, path] of files.entries()) await writeFile(path, original[index]);
      }
    });
    await t.test('missing dependencies fail without replacing the last complete output', async () => {
      await rm(join(dependencies[1], 'node_modules/jszip'), {recursive: true});
      const failed = spawnSync(process.execPath, [builder], {cwd, env, encoding: 'utf8'});
      assert.notEqual(failed.status, 0);
      assert.match(failed.stderr, /Could not resolve "jszip"/);
      assert.deepEqual(await inventory(cwd), results[1]);
    });
    await t.test('canonical identities retain native exports, browser, require, nested, suffix and sideEffects semantics', async () => {
      const fixture = join(dependencies[1], 'node_modules/resolution-fixture');
      async function put(name, content) {
        await mkdir(dirname(join(fixture, name)), {recursive: true});
        await writeFile(join(fixture, name), content);
      }
      await put('package.json', JSON.stringify({name: 'resolution-fixture', version: '1.0.0', license: 'MIT', type: 'module', sideEffects: false,
        exports: {'.': {import: {browser: './import.js', default: './wrong.js'}, require: './require.cjs'}, './effect': './effect.js'},
        browser: {'./mapped.js': './browser.js', './disabled.js': false}}));
      await put('LICENSE', 'Synthetic test fixture license.\n');
      await put('import.js', "import mapped from './mapped.js'; import * as disabled from './disabled.js'; import data from './data.json?probe'; import nested from 'nested-fixture'; export default ['import-browser',mapped,Object.keys(disabled),data,nested];");
      await put('require.cjs', "module.exports='require-branch';");
      await put('wrong.js', "throw Error('wrong exports condition');");
      await put('mapped.js', "export default 'wrong-browser-map';");
      await put('browser.js', "export default 'browser-map';");
      await put('disabled.js', "throw Error('browser:false ignored');");
      await put('data.json', '{"value":42}');
      await put('effect.js', "throw Error('sideEffects:false ignored');");
      await put('node_modules/nested-fixture/package.json', JSON.stringify({name:'nested-fixture',version:'1.0.0',license:'MIT',main:'index.cjs'}));
      await put('node_modules/nested-fixture/index.cjs', "module.exports='nested-dependency';");
      await put('node_modules/nested-fixture/LICENSE', 'Synthetic nested fixture license.\n');
      const entry = "import imported from 'resolution-fixture'; import 'resolution-fixture/effect'; export const result=[imported,require('resolution-fixture')];";
      await writeFile(join(cwd, 'frontend/unified-src/recipe-manager-card.js'), entry);
      run(process.execPath, [builder], {cwd, env});
      // Independent native esbuild build, with no canonicalization plugin.
      const native = join(cwd, 'native-output/app.js');
      const nativeScript = `const {build}=require(${JSON.stringify(join(dependencies[1], 'node_modules/esbuild'))});build({absWorkingDir:${JSON.stringify(cwd)},entryPoints:['frontend/unified-src/recipe-manager-card.js'],outfile:${JSON.stringify(native)},bundle:true,format:'esm',minify:true,target:'es2022',nodePaths:[${JSON.stringify(join(dependencies[1], 'node_modules'))}]});`;
      run(process.execPath, ['-e', nativeScript], {cwd});
      const probe = async path => JSON.parse(run(process.execPath, ['--input-type=module', '-e', `console.log(JSON.stringify((await import(${JSON.stringify(pathToFileURL(path).href)})).result))`], {cwd}).stdout);
      const expected = [["import-browser", "browser-map", ['default'], {value:42}, "nested-dependency"], "require-branch"];
      assert.deepEqual(await probe(native), expected);
      assert.deepEqual(await probe(join(cwd, 'frontend/unified/app.js')), expected);
    });
  } finally {
    await rm(scratch, {recursive: true, force: true});
  }
});
