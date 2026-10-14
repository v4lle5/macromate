# MacroMate local Home Assistant panel

## Integration hand-off

Serve this directory at `/macromate-assets/` and import `/macromate-assets/panel.js` as a JavaScript module. The module registers **`macromate-panel`**. Home Assistant supplies its existing `hass` property; the panel uses only `hass.callWS({type: 'macromate/command', action, payload})`. No bearer token is read, stored or requested. The parent integration owns static-file and custom-panel registration and packaging of this directory; this frontend does not change backend files.

All CSS, fonts (system stack), brand image and scanner code are local. No runtime build, npm, CDN, external script, image upload or analytics is required. `brand-icon.png` is an unchanged copy of the canonical integration icon; the original brand directories are untouched.

## Included

- HA-local diary today, previous/next day and date picker; persisted historical goal snapshots only; calorie/macro progress and four meal groups.
- Explicit-submit text search, favorites/recent/custom filters and separate barcode lookup. Online search defaults **off**, including barcode lookup. The checkbox expresses the current request's consent; the backend still enforces the integration's provider opt-in. Provider/permission errors are visible and sanitized.
- Product detail fetch, base g/ml amount or named serving + quantity, scaled known nutrients, favorite portion templates and food logging.
- Quick entries with total nutrients, editing quick entries, immutable-snapshot food-entry amount editing, copy to selected date/meal and confirmed single-entry deletion. Food-entry editing never fetches current product nutrition.
- Local reusable food creation with per-100 g/ml nutrition, optional named portion and extended nutrient inputs. Blank nutrients are omitted, not zero-filled. Known nutrient units match the wire domain, including mg and µg; unknown extension keys are displayed as escaped labels without inventing a unit.
- Camera EAN-8/EAN-13 scanning, local barcode-photo decoding, permission/secure-context errors, explicit stop/cancel and disconnect cleanup. Manual lookup also accepts valid UPC-A and GTIN-14 tokens. ASCII syntax and check digit are validated without trimming or coercion.

No AI, recipes, fasting or bulk day deletion UI is present.

## Writes and safety

Every write gets a `crypto.randomUUID()` request ID. Only a definitive response releases the logical operation. Unknown transport failures retain the original payload and ID in panel memory, block further mutations, and offer **Gleiche Anfrage erneut senden**. There are no automatic write retries. The retry button replays the original operation even if form fields were changed; successful retry closes the form. In-flight date navigation blocks mutation controls and stale read results are ignored. Pending operations are intentionally not persisted across browser reloads; if a page is closed during an uncertain write, inspect the diary before submitting another entry.

Known non-admin HA users are denied locally; actual authorization must also be enforced by the server for every command. Arbitrary food names, attribution and diary strings are rendered as text nodes, never raw HTML.

## Scanner dependencies

The fallback is the checked-in `vendor/zxing-0.21.3.js`, built from **@zxing/library 0.21.3** using only EAN-13/EAN-8 readers. Explicit readers deliberately avoid the generic ZXing reader's automatic EAN-13-to-UPC-A leading-zero removal. BarcodeDetector is used when EAN support is available; a native failure or non-result falls back to this local JS decoder. Images/frames are only processed locally. Camera access requires HTTPS or localhost and browser permission.

`vendor/README.md`, bundled legal comments and upstream license files document provenance and rebuild inputs. Test-only dependencies live outside the repository in private scratch. `tests/frontend/deps.package.json` and `deps.package-lock.json` pin their versions/integrities.

## Reproduce checks

From the repository root, with Node 24 and a private writable scratch directory:

```sh
export FRONTEND_DEPS="$TMPDIR/macromate-frontend-deps"
mkdir -p "$FRONTEND_DEPS"
cp tests/frontend/deps.package.json "$FRONTEND_DEPS/package.json"
cp tests/frontend/deps.package-lock.json "$FRONTEND_DEPS/package-lock.json"
npm ci --prefix "$FRONTEND_DEPS" --ignore-scripts --no-fund
node --test tests/frontend/*.test.mjs
```

The browser tests use `CHROMIUM_PATH` (default `/usr/bin/chromium`) and FFmpeg for the virtual-camera test. The isolated fixture is explicitly marked synthetic and has no real HA connection. The test HTTP server binds only loopback and shuts down on completion. The virtual-camera test generates EAN pixels with pinned bwip-js, converts them to Y4M using FFmpeg, and feeds actual Chromium `getUserMedia` video frames to the real bundled decoder with BarcodeDetector disabled. Decode output is not mocked. Hardware camera performance is a separate unverified acceptance step.

Optional Firefox check:

```sh
export PLAYWRIGHT_BROWSERS_PATH="$FRONTEND_DEPS/browsers"
node "$FRONTEND_DEPS/node_modules/playwright/cli.js" install firefox
MACROMATE_BROWSER=firefox node --test tests/frontend/macromate-browser.test.mjs
```

The virtual-camera case remains Chromium-specific even when the rest of the suite uses Firefox. `MACROMATE_BROWSER=webkit` selects Playwright WebKit if its host libraries are available; this environment currently lacks required WebKit libraries. No system packages were installed.

To rebuild the checked-in decoder deliberately:

```sh
node tests/frontend/macromate-build-vendor.mjs
```

This is not needed at runtime. Keep `vendor/ZXING-LICENSE.txt`, `TS-CUSTOM-ERROR-LICENSE.txt`, the generated `.LEGAL.txt` and module-scope inventory with the bundle.
