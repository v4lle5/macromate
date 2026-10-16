> **Scope update:** Internal shopping and recipe/plan transfers are retired in
> both frontend and backend. Historical shopping descriptions below document
> provenance/compatibility only, not supported actions. No shopping services,
> WebSocket commands, discovery or standalone imports are registered. Stored
> records/media remain in complete administrative backup/restore; no Bring!
> adapter is provided. Current API: [AGENT_API.md](../../docs/AGENT_API.md).

# Unified MacroMate frontend

The installed resource remains `/macromate-assets/macromate-card.js` (JavaScript
module), with card type `custom:macromate-card`. The default is the combined
application. The original compact nutrition overview is available explicitly:

```yaml
type: custom:macromate-card
mode: summary
```

Add the module in **Settings → Dashboards → Resources** (advanced mode may be
needed), then add a manual card with `type: custom:macromate-card`. This source
handoff does not install, deploy or register the resource in a live dashboard.

## Source and runtime

The recipe shell, recipe library/detail/editor, weekly planner, timer UI,
settings, eight theme palettes and seven locale modules adapt the MIT
Recipe-Manager-Card revision `e25f96663538fb148b25ccbe51982b7ba6c6681d`.
The original full notice is in `RECIPE-MANAGER-CARD-LICENSE.txt` and in the built
`../unified/THIRD-PARTY-NOTICES.txt`. Disabled Cookbook, Sync and Help navigation
placeholders remain disabled; they are not implemented upstream workflows.

The shopping workspace is native to MacroMate: lists/items, catalog search,
custom products, categories, price/currency totals, loyalty cards with local
Code128/QR rendering, regions, membership/access, and schema-driven import,
export and administrative operations. No separate shopping-card element or
external recipe/shopping integration is required. **All actions** exposes
forms from `describe` for the full canonical API, including less-common CRUD
and metadata fields. Object/array inputs are explicit JSON; nullable fields
have explicit Clear controls. Some advanced workflows therefore use schema
forms rather than a dedicated graphical editor.

The nutrition pane reuses the existing diary, food, custom-food, entry, barcode
and camera modules, with the original calorie ring and macro display. It uses
the same centralized transport. English/German labels are supplied for the
reused forms; upstream recipe locales are English, German, Spanish, French,
Portuguese, Dutch and Italian. New advanced schema field names remain the
canonical API's English identifiers.

`services/adapter.js` maps the original recipe/shopping action names to the
single `macromate/command` API. Mutation requests retain one UUID and immutable
payload until a definitive result or an explicit same-request retry. It never
automatically retries writes. Account, connection or permission replacement
removes the old application and releases subscriptions, camera/form state and
private object URLs. Private photos are fetched only with `hass.fetchWithAuth`
from `/api/macromate/media/{id}`. Remote photo references may be retained as
metadata but are not fetched directly by image tags. Custom alarm/preview audio
accepts only bounded local `data:audio/...;base64,...` values, never remote URLs.
Markdown is rendered as
Lit templates, never raw HTML. Remote imports require an explicit consent
control. Default archive imports send the bounded archive to the backend;
photo-free HTML extraction is bounded before browser decompression and checks
both JSZip's sanitized member name and `unsafeOriginalName`.

### Exact recipe → shopping selection

The review sends one canonical `recipe_to_shopping` mutation:

```json
{
  "recipe_id": "recipe-id",
  "list_id": "list-id",
  "servings": 2,
  "ingredient_indexes": [2],
  "ingredient_matches": [{"ingredient_index": 2, "product_id": "catalog:GB:product-id"}]
}
```

Indexes refer to **original** recipe positions, not filtered review positions.
Manual rows omit a product match. Only the exact selected ID is sent; trusted
catalog names/categories are resolved server-side. Amounts and units remain
recipe-derived, never replaced with catalog default quantities/units. Matching
is blocked with a visible safe error if discovery does not advertise
`ingredient_matches`. The central adapter adds and retains one request UUID.
The planner similarly uses one `plan_to_shopping` request for its displayed week.
Legacy ingredient callers without a recipe ID create separate items rather
than read/modify/write name-only merges. Ambiguous measured quantities are
rejected before writes, and an uncertain write stops the batch immediately.
Mass display converts only to mass and volume only to volume; no density is
invented, and ambiguous ranges remain unchanged.

## Controlled build

Use a new task-private dependency directory, not the upstream repository's
tracked `node_modules`. Copy `package.json` and `package-lock.json` there, then:

```sh
npm ci --ignore-scripts --prefix "$MACROMATE_BUILD_DEPS"
MACROMATE_BUILD_DEPS="$MACROMATE_BUILD_DEPS" node tests/frontend/macromate-unified-build.mjs
```

No upstream install, build or postbuild hooks are used. The esbuild invocation
is controlled by the test/build script. The manifest pins direct and transitive
dependencies. JSZip uses its MIT alternative. Full runtime notices include
transitive code embedded in its browser distribution, JsBarcode and the QR
code generator; the latter's npm distribution has only a license pointer, so
its full matching MIT/copyright notice is supplied locally with provenance.

Ship the root card/CSS, `unified/`, `unified-src/services/adapter.js`,
`unified-src/summary.js`, all existing nutrition modules/CSS/brand asset and the
existing `vendor/` scanner assets/notices. Do not mirror only `unified/app.js`:
the root resource intentionally imports the pure adapter and summary modules.
`source-manifest.json` and the generated `../unified/build-manifest.json`
identify source/build inputs and hashes.

## Executable evidence and its limits

From the repository root, with a clean Playwright directory, Chromium, and a
task-private screenshot directory:

```sh
node tests/frontend/macromate-unified-adapter.mjs
node tests/frontend/macromate-unified-amounts.mjs
PLAYWRIGHT_DIR="$PLAYWRIGHT_DIR" EVIDENCE_DIR="$EVIDENCE_DIR" node tests/frontend/macromate-unified-browser.mjs
PLAYWRIGHT_DIR="$PLAYWRIGHT_DIR" EVIDENCE_DIR="$EVIDENCE_DIR" node tests/frontend/macromate-unified-domain-browser.mjs
HA_PYTHON="$HA_PYTHON" PLAYWRIGHT_DIR="$PLAYWRIGHT_DIR" EVIDENCE_DIR="$EVIDENCE_DIR" node tests/frontend/macromate-unified-nutrition-browser.mjs
node tests/frontend/macromate-unified-shopping.mjs
HA_PYTHON="$HA_PYTHON" PLAYWRIGHT_DIR="$PLAYWRIGHT_DIR" EVIDENCE_DIR="$EVIDENCE_DIR" node tests/frontend/macromate-unified-refresh-browser.mjs
node tests/frontend/macromate-unified-wake.mjs
PLAYWRIGHT_DIR="$PLAYWRIGHT_DIR" EVIDENCE_DIR="$EVIDENCE_DIR" node tests/frontend/macromate-unified-workflows.mjs
node tests/frontend/macromate-unified-manifests.mjs
```

Or run the complete local handoff checks, including rebuild, source/output
hashes and the original nutrition/scanner/card suites:

```sh
MACROMATE_BUILD_DEPS="$MACROMATE_BUILD_DEPS" \
FRONTEND_DEPS="$FRONTEND_DEPS" PLAYWRIGHT_DIR="$FRONTEND_DEPS/node_modules" \
HA_PYTHON="$HA_PYTHON" EVIDENCE_DIR="$EVIDENCE_DIR" \
node tests/frontend/macromate-unified-verify.mjs
```

`FRONTEND_DEPS` is the isolated directory installed from the pinned
`tests/frontend/deps.package.json` / `deps.package-lock.json`, not an upstream
checkout's dependencies. The runner records exact commands, exit codes and log
hashes in task-private `verification.json`. Before the parent mirrors assets,
one existing packaged-card equality assertion is explicitly skipped; the
unfiltered equality suites **must** run after the complete frontend is mirrored.
The controlled build removes obsolete generated chunks only after successful
compilation and notice discovery; it regenerates the source manifest and hashes
all output files, including notices.

- The first browser fixture is explicitly synthetic. It renders actual source
  components, all palettes/locales, forms, consent and rejection states; it
  does not fabricate successful backend mutations.
- The domain browser uses the actual recipe/shopping commands and schemas with
  a task-local kitchen dictionary. It exercises CRUD and independent exact
  readback, but not HA transport, Store persistence or server ACL provisioning.
- The nutrition browser runs actual Home Assistant 2026.10.1 coordinator code
  and a new private atomic Store. Create/edit/copy/delete and a response lost
  **after durable acceptance** are exercised through the real Chromium forms;
  identical-ID replay is checked against independently read Store contents.
  Its bridge/authentication are still synthetic, not native HA WebSocket or
  service registration evidence.
- The refresh regression browser uses a real coordinator and atomic Store. Its
  listener checks durable publication before delivering the event through a
  synthetic bridge **before the mutation response**, while the transport still
  holds its pending request. Accepted mutations notify subscribers only after
  pending/busy clear; coalesced reads update list selectors without replacing
  open recipe contexts, schema drafts, focus or planner dates. Uncertain writes
  retain their UUID/payload until explicit same-request retry. Its task-private
  `refresh-regression-evidence.json` records the checks and command captures;
  this is not native WebSocket/dashboard acceptance. The complete handoff
  runner includes this targeted check.
- Original summary behavior is checked by the existing card suite with the
  fixture selecting `mode: summary`. Packaged byte equality is a separate gate
  for the packaging owner after the complete asset handoff is mirrored.

`feature-support.json` retains all 43 standalone-card and 25 bundled-recipe UI
rows, with implementation paths and named executable checks. Every row is
**partial local evidence**, not full production acceptance: an assertion about a
rejection, rendering or one field does not prove successful native mutations or
all advanced sub-workflows. `workflow-evidence.json` records actual values,
viewport/breakpoint and contrast measurements, authenticated media pixel
sizes, archive/audio security rejections and context-reset results.
`recipe-workflow-readback.json` and captured command/Store files provide exact
domain readbacks rather than screenshots alone. The schema-form evidence covers
every field of the current 81 pure-domain descriptors without automatic writes.

Native HA dashboard/editor acceptance, server ACL/media/network/import and
accepted backup-download/content checks, atomic recipe/plan → shopping Store
readback, recipe → diary native transport, physical camera/audio/wake-lock and
cross-device timer testing, packaged asset equality after the parent mirror,
full advanced sub-workflows and independent review remain separate gates.
Local media tests use genuine rendered image bytes via a synthetic
`fetchWithAuth` bridge; they do not prove the native endpoint's authorization.
The virtual-camera tests decode actual Chromium video frames, not a physical
phone camera. Do not interpret source reuse, screenshots, schema rendering or
capability discovery as proof that these remaining gates passed.
