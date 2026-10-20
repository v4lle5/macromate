// Actual rendered text contrast, including translucent surfaces across shadow roots.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {measureTextContrast} from './macromate-contrast-helpers.mjs';

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
  await page.waitForFunction(() => card.application._recipes?.length > 0 && !card.application._loading);
  for (const [darkMode, system, appearance, backdrop] of [
    ['off', 'dark', 'light', '#000'],
    ['on', 'light', 'dark', '#fff'],
    ['system', 'light', 'light', '#fff'],
    ['system', 'dark', 'dark', '#000'],
  ]) {
    await page.emulateMedia({colorScheme: system});
    await page.evaluate(({darkMode, backdrop}) => {
      document.body.style.background = backdrop;
      card.application._settings = {...card.application._settings, darkMode};
      card.application._selectedRecipe = card.application._recipes[0];
    }, {darkMode, backdrop});
    await page.waitForFunction(appearance => card.application.getAttribute('data-appearance') === appearance, appearance);
    const measure = async (host, selectors, view) => {
      await page.waitForTimeout(200); // Wait for final tab/surface transition colors.
      const measurements = await measureTextContrast(host, selectors);
      assert.ok(measurements.length >= 3, `${view}: real text and controls are rendered`);
      for (const row of measurements) {
        rows.push({theme:'glass-wave', darkMode, system, appearance, view, ...row});
        assert.ok(row.contrast >= 4.5, `${appearance}/${view}: ${JSON.stringify(row)}`);
        assert.ok(row.fontSize >= 12, `${appearance}/${view}: text smaller than 12px: ${JSON.stringify(row)}`);
      }
    };
    for (const [view, host, selectors] of [
      ['grid', 'rm-recipe-grid', '.recipe-name,.meta-chip,.filter-tab,.search-input'],
      ['detail', 'rm-recipe-detail', '.wide-title,.recipe-title,.wide-desc,.detail-desc,.step-text,.ing-name,.meta-chip,.servings-val'],
      ['planner', 'rm-meal-planner', '.week-month,.day-name,.day-num,.meal-label,.today-badge'],
      ['timers', 'mm-unified-app', '.timer-empty p,.timer-empty-hint,.timer-add-title,.timer-add-group-label,.timer-input'],
      ['settings', 'rm-settings-view', '.setting-name,.section-label,.theme-name,.seg-btn'],
      ['nutrition', 'mm-nutrition', 'h2,h3,.metric-label,.metric-value,.muted,.toolbar button,input[type=search]'],
    ]) {
      await page.evaluate(view => {card.application._view = view;}, view);
      await page.locator(host).waitFor();
      if (view === 'nutrition') await page.locator('mm-nutrition .calorie-ring').waitFor();
      await measure(page.locator(host), selectors, view);
    }
    await page.evaluate(() => {card.application._view = 'add';});
    const importer = page.locator('rm-add-recipe-dialog');
    await importer.waitFor();
    for (const [mode, selectors] of [
      [2, '.mode-btn,.import-info,.import-info strong,.file-label,.toggle-row'],
      [0, '.mode-btn,.url-hint,.url-input'],
      [1, '.mode-btn,.field label,.field input,.field textarea'],
    ]) {
      await importer.locator('.mode-btn').nth(mode).click();
      await measure(importer, selectors, `import-${mode}`);
    }
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({width, height:850});
      await importer.locator('.mode-btn').nth(2).click();
      await page.waitForTimeout(200);
      assert.equal(await importer.evaluate(node => node.scrollWidth <= node.clientWidth + 1), true, 'import form fits the viewport');
      if (process.env.EVIDENCE_DIR) {
        await mkdir(process.env.EVIDENCE_DIR, {recursive:true});
        await page.screenshot({path:resolve(process.env.EVIDENCE_DIR, `glasswave-import-${darkMode}-${system}-${width}.png`)});
      }
    }
  }
  assert.deepEqual(errors, []);
  if (process.env.EVIDENCE_DIR) await writeFile(resolve(process.env.EVIDENCE_DIR,'contrast.json'),JSON.stringify(rows,null,2));
  console.log(`PASS: ${rows.length} rendered labels, placeholders and controls have at least 4.5:1 contrast across Glass Wave light/dark/system; import forms fit 320px phones and desktops.`);
} finally {
  await browser.close();
  await new Promise(r => server.close(r));
}
