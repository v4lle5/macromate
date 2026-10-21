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
  await page.setContent('<div id="contrast-probe"></div>');
  await page.locator('#contrast-probe').evaluate(host => {
    const root = host.attachShadow({mode:'open'});
    const style = document.createElement('style');
    style.textContent = `
      button { color:#000; background:#fff; font-size:0; }
      .before::before { content:'+'; font-size:22px; }
      .after::after { content:'+'; font-size:22px; color:#fff; }
      .small { font-size:8px; }
    `;
    root.append(style);
    for (const name of ['before', 'after', 'hidden', 'small']) {
      const button = document.createElement('button');
      button.className = name;
      button.textContent = name === 'small' ? 'Small visible text' : 'Accessible icon label';
      root.append(button);
    }
  });
  const probe = await measureTextContrast(page.locator('#contrast-probe'), 'button');
  assert.equal(probe.length, 3, 'Only rendered text and generated glyphs are measured');
  assert.deepEqual(probe.map(row => [row.class, row.pseudo, row.fontSize]), [
    ['before', '::before', 22], ['after', '::after', 22], ['small', null, 8],
  ]);
  assert.ok(probe[0].contrast >= 4.5, 'Visible generated glyphs retain their actual contrast');
  assert.ok(probe[1].contrast < 4.5, 'A low-contrast glyph is still detected despite its hidden label');
  assert.ok(probe[2].fontSize < 12, 'Small visible text is still detected');
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
      if (view === 'nutrition') {
        for (const glyph of ['▥', '+']) assert.ok(measurements.some(row => row.pseudo === '::before' && row.text === glyph && row.fontSize === 22), 'Nutrition icon buttons remain covered by contrast and size checks');
      }
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
    await page.evaluate(() => {card.application._view = 'detail';});
    const editor = page.locator('rm-recipe-detail');
    await editor.waitFor();
    await editor.getByTitle('Edit recipe', {exact:true}).click();
    await editor.locator('.edit-panel').waitFor();
    await measure(editor, '.edit-field label,.edit-field input,.edit-field textarea,.edit-section-label,.edit-footer button', 'recipe-edit');
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({width, height:850});
      await page.waitForTimeout(200);
      assert.equal(await page.getByRole('button', {name:'New Recipe', exact:true}).count(), 0);
      assert.equal(await page.locator('.sb-new-btn,.rm-bn-add,[title="New Recipe"],rm-add-recipe-dialog').count(), 0);
      assert.equal(await editor.locator('.edit-panel').evaluate(node => node.scrollWidth <= node.clientWidth + 1), true, 'existing recipe editor fits the viewport');
      if (process.env.EVIDENCE_DIR) {
        await mkdir(process.env.EVIDENCE_DIR, {recursive:true});
        await page.screenshot({path:resolve(process.env.EVIDENCE_DIR, `glasswave-recipe-edit-${darkMode}-${system}-${width}.png`)});
      }
    }
    await editor.getByRole('button', {name:'Cancel', exact:true}).click();
  }
  assert.deepEqual(errors, []);
  if (process.env.EVIDENCE_DIR) await writeFile(resolve(process.env.EVIDENCE_DIR,'contrast.json'),JSON.stringify(rows,null,2));
  console.log(`PASS: ${rows.length} rendered labels, placeholders and controls have at least 4.5:1 contrast across Glass Wave light/dark/system; existing recipe editors fit 320px phones and desktops; recipe creation controls are absent.`);
} finally {
  await browser.close();
  await new Promise(r => server.close(r));
}
