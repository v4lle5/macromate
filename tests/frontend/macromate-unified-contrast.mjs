// Actual rendered text contrast, including translucent surfaces across shadow roots.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';

const root = resolve(new URL('../..', import.meta.url).pathname);
const {chromium} = await import(resolve(process.env.PLAYWRIGHT_DIR, 'playwright/index.mjs'));
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + req.url.split('?')[0]);
    if (!path.startsWith(root + '/')) throw Error('outside fixture');
    res.setHeader('Content-Type', ({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json'})[extname(path)] || 'application/octet-stream');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH, headless:true, args:['--no-sandbox']});
const rows = [];
try {
  const page = await browser.newPage({viewport:{width:1280,height:850}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/tests/frontend/macromate-unified-fixture.html`);
  await page.waitForFunction(() => window.card?.application?._api);
  for (const [theme, darkMode, backdrop] of [
    ['glass-wave','off','#fff'], ['glass-wave','on','#000'],
    ['soft','off','#fff'], ['soft','on','#000'],
  ]) {
    await page.evaluate(({theme,darkMode,backdrop}) => {
      document.body.style.background = backdrop;
      card.application._settings = {...card.application._settings, theme, darkMode};
      card.application._view = 'add';
    }, {theme,darkMode,backdrop});
    const importer = page.locator('rm-add-recipe-dialog');
    await importer.waitFor();
    for (const [mode, selectors] of [
      [2,'.mode-btn,.import-info,.import-info strong,.file-label,.toggle-row'],
      [0,'.mode-btn,.url-hint,.url-input'],
      [1,'.mode-btn,.field label,.field input,.field textarea'],
    ]) {
      await importer.locator('.mode-btn').nth(mode).click();
      await page.waitForTimeout(200); // Measure final colors after the 150 ms tab transition.
      const measurements = await importer.evaluate((host, selectors) => {
        const parent = node => node.parentElement || node.getRootNode().host;
        const rgba = text => {
          const values = text.match(/[\d.]+/g).map(Number);
          return [...values.slice(0,3), values[3] ?? 1];
        };
        const over = (top, base) => top.slice(0,3).map((c,i) => c*top[3] + base[i]*(1-top[3]));
        const luminance = rgb => rgb.map(c => c/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4).reduce((sum,c,i) => sum+c*[.2126,.7152,.0722][i],0);
        return [...host.shadowRoot.querySelectorAll(selectors)].filter(node => node.getClientRects().length && !node.disabled).map(node => {
          const ancestors = [];
          for (let p=node; p; p=parent(p)) ancestors.unshift(p);
          let background = [255,255,255];
          for (const ancestor of ancestors) background = over(rgba(getComputedStyle(ancestor).backgroundColor), background);
          const style = getComputedStyle(node);
          const foreground = over(rgba(style.color), background);
          const a=luminance(foreground), b=luminance(background);
          return {tag:node.tagName, class:node.className, contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05), foreground:style.color, background};
        });
      }, selectors);
      assert.ok(measurements.length >= 4, 'the real form is rendered');
      for (const row of measurements) {
        rows.push({theme,darkMode,mode,...row});
        assert.ok(row.contrast >= 4.5, `${theme}/${darkMode} mode ${mode}: ${JSON.stringify(row)}`);
      }
    }
    if (theme === 'glass-wave') {
      for (const width of [390,1280]) {
        await page.setViewportSize({width,height:850});
        await importer.locator('.mode-btn').nth(2).click();
        await page.waitForTimeout(200);
        assert.equal(await importer.evaluate(node => node.scrollWidth <= node.clientWidth), true, 'import form fits the viewport');
        if (process.env.EVIDENCE_DIR) {
          await mkdir(process.env.EVIDENCE_DIR,{recursive:true});
          await page.screenshot({path:resolve(process.env.EVIDENCE_DIR,`glasswave-import-${darkMode}-${width}.png`)});
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  if (process.env.EVIDENCE_DIR) await writeFile(resolve(process.env.EVIDENCE_DIR,'contrast.json'),JSON.stringify(rows,null,2));
  console.log(`PASS: ${rows.length} rendered form labels/controls have at least 4.5:1 contrast; GlassWave fits mobile/desktop over light/dark backdrops.`);
} finally {
  await browser.close();
  await new Promise(r => server.close(r));
}
