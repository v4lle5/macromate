# MacroMate for Home Assistant

<p align="center"><img src="brand/macromate-logo.png" alt="MacroMate — Track Eat Progress" width="420"></p>

Local nutrition, recipes, weekly planning and cooking timers inside one Home Assistant integration. MacroMate keeps its food/portion/diary model, automatic nutrition goals, local storage and optional Open Food Facts lookup, with one connected dashboard and authenticated local agent API.

Development build, not a medical tool. Physical mobile cameras and iOS/Safari remain unverified; read the limits below before installing on a live instance.

## Features

- One responsive local MacroMate dashboard card, using Home Assistant's existing authenticated connection.
- Automatic calorie and macro goals from a readable profile; no technical kcal/kg or protein/fat multipliers in normal onboarding.
- Date navigation, signed calorie balance and breakfast/lunch/dinner/snack groups with daily nutrient totals.
- Reusable foods: stable product ID, name, producer, explicit g/ml basis, declared nutrients, product-specific servings, exact barcode strings, source/licensing metadata and favorite portion templates.
- Per-100-g/ml label entry, normalized per-one-g/ml storage and portion conversion. No silent g↔ml conversion.
- Local text search, favorites, recent foods, custom foods and persistent offline product cache.
- Optional read-only Open Food Facts search and barcode lookup; disabled by default.
- Camera EAN-8/EAN-13 scanning, locally decoded barcode photos and bundled ZXing fallback. Manual lookup supports valid GTIN12/GTIN14 too.
- Quick entries store total nutrients; food entries store immutable label snapshots. Edit, delete and copy entries without later product changes rewriting their nutrition history.
- Extended nutrients with explicit kcal/g/mg/µg/ml units. Missing values remain unknown; declared zero remains zero.
- Local private storage, bounded persistent retry history, summary/goal sensors and authenticated actions for automations/agent clients.
- Recipe library, taxonomy, ratings/favorites, manual editing, consented imports and private normalized images.
- Weekly planning; logging recipe portions to the diary is a separate action with an immutable nutrition snapshot.
- Internal shopping UI, backend services/WebSocket actions, discovery, settings and recipe/plan transfers have been removed. Use Bring! separately; MacroMate does not connect to it. Existing shopping data is retained, not deleted or migrated.
- Cooking timers/presets and complete local agent CRUD through the same authenticated, validated command model as the card.

No bundled inference model, fasting tracker, photo-based food recognition or analytics. Agents need no cloud model, browser automation or extra MCP server to use the API. See the [local agent guide](docs/AGENT_API.md) and [unified contract](docs/UNIFIED_CONTRACT.md). This development branch is not automatically published or installed.

## Installation

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=v4lle5&repository=macromate&category=integration)

HACS requires a public repository and a published revision containing this build. Local working-tree changes are not automatically available through HACS. The button opens the repository flow; it does not publish or automatically install this version.

For a local development installation:

1. Back up HA and its existing MacroMate config/storage.
2. Copy the entire `custom_components/macromate` directory to `/config/custom_components/macromate`, including `frontend/` and `brand/`. No npm build or extra server is needed at runtime.
3. Restart Home Assistant.
4. Add MacroMate under **Settings → Devices & services**, or open the existing entry's options.
5. Complete the profile, then add the MacroMate dashboard card as described below. No separate MacroMate sidebar menu is registered.

The isolated runtime is HA Core 2026.10.1 / Python 3.14.2. Pure model/client tests also run on Python 3.11; that does not establish older HA compatibility. Local branding is supported by HA 2026.3+; HACS pre-install listings may still show a placeholder.

## Dashboard card

The local dashboard card opens the combined recipe, planner, timer and nutrition workspace. The optional **Glass Wave** theme is available in Settings → Appearance → Colour theme; existing themes and saved choices stay unchanged. It uses translucent warm cards without blur, with paper-colored dialogs and touch-sized controls. The nutrition pane retains the calorie-balance ring, macros, meal groups, food database and scanner. It uses Home Assistant's existing authentication without guessed entity IDs or extra credentials. Missing nutrients and goals remain explicitly unknown.

The integration loads the card module automatically, just like Recipe Manager. No manual resource URL or YAML is needed for a normal storage dashboard:

1. Open your dashboard → **Edit dashboard** → add/edit a view.
2. Set its **Layout** to **Panel (single card)** (German: **Panel (einzelne Karte)**).
3. **Add card → By card → MacroMate → Save**, as the only card in that view. Leave **Full application** selected in its visual editor.

The view URL is a simple view name, **not a JavaScript URL**. This is the complete dashboard app, with no separate legacy diary-only sidebar item. Recipes, Meal Planner, Timers and Nutrition stay together in one responsive, full-width card.

The visual editor also offers the original read-only **Compact summary**. Existing `type: custom:macromate-card` / `mode: summary` configurations remain supported. The default combined card is editable according to server-side permissions.

Full setup and troubleshooting: [Dashboard card](docs/DASHBOARD_CARD.md). Optional advanced YAML: [example](examples/macromate-dashboard.yaml).

## Profile, goals and Garmin

Setup collects birth date, physiological formula sex, height, current/target weight, loss/maintenance/gain intent, weekly pace, activity category and a named macro plan. Enter birth dates directly as `DD.MM.YYYY` (`TT.MM.JJJJ` in German), for example `23.07.1990`; ISO `1990-07-23` remains accepted, and persisted dates remain ISO. Weekly pace is a **positive magnitude**, e.g. `0,5` or `0.5` kg/week; loss/gain chooses the direction and maintenance uses `0`. MacroMate supports adults and bounded values only; support bounds are not medical recommendations.

Manual weight is optional when a selected weight sensor supplies a finite 30–350 kg-equivalent reading in kg/lb/stone, non-restored and at most 7 days old (including a declared measurement date). If it cannot, setup asks for a manual fallback instead of inventing a weight. A sensor-only setup saves the accepted real reading as the profile fallback. If the sensor later fails, Nutrition visibly labels that saved weight as **not live**, while recommendations report `weight_source: profile` and `weight_unavailable`. Clearing a source in options remains authoritative; no migration or formula coefficients change.

Nutrition goal rules:

- BMR: `10 × kg + 6.25 × cm − 5 × age + offset`; complete calendar months / 12 for age, offsets −161/+5.
- PAL: 1.25 / 1.38 / 1.52 / 1.65.
- Signed weekly change: `750 × kg/week`, with target-weight BMR as a floor in the adjusting branch.
- Named macro shares use 4.1 kcal/g for protein/carbohydrates and 9.3 kcal/g for fat. Food-label energy is kept separately, not reconstructed from those goals.
- MacroMate stops the weight adjustment at or beyond the target weight.

Garmin entities are optional. Valid measured weight overrides profile weight; usable Garmin BMR overrides the formula. A current, explicitly selected **daily active energy** reading uses `BMR + active energy` instead of a PAL budget. Without it, PAL-based estimation is labeled fallback/estimated. Unknown activity is not a measured zero. Incorrect units, yesterday-dated activity, restored readings and explicitly total-energy readings are rejected for the active path.

The operator must choose a sensor that truly represents daily active energy: a kcal unit alone cannot establish semantics. Do not add total energy, overlapping workouts or steps again. MacroMate does not log into Garmin or poll wearables directly.

Goals are snapshotted by HA local date on setup/source updates and at local midnight. Historical dates without snapshots report unknown goals, never today's profile goal. Existing v1 config entries migrate without invented demographics; old entity IDs/internal factors and meals remain intact until the profile is completed in options.

## Food source, license and scanner

Enable the database in integration options, then explicitly enable online lookup for a submitted search/scan. Only that query/barcode goes to Open Food Facts, not profile/diary data. No per-keystroke network search. Camera frames and barcode photos are decoded locally and never uploaded. Camera access needs HTTPS or localhost plus browser permission.

OFF product reads use v3.6; text search uses documented legacy CGI because v2 structured search is not full-text search. GET-only requests have timeouts, response-size bounds, no redirects, rolling quotas, cooldowns and memory caches. Other applications behind the same IP still share upstream limits. Imported products persist locally for offline use.

Food data: **Open Food Facts contributors**, https://world.openfoodfacts.org — database **ODbL 1.0**, contents **DbCL 1.0**. Cached products retain attribution; it is displayed with results. Redistributing a derived database may invoke ODbL share-alike requirements. The integration's code license does not replace data licensing. Product images are not fetched. Community data can be incomplete or wrong: verify the label.

Barcodes are preserved as strings, including leading zeros. MacroMate requires ASCII GTIN8/12/13/14 syntax and a valid mod-10 checksum; no trimming, repair or integer normalization. A food without declared calories cannot be logged until a separate local product is completed. Unknown macros/micronutrients remain marked missing, and incomplete totals are partial known totals.

## Home Assistant actions

Private nutrition, recipes/planning and administrative actions require an administrator when a user context is present. Retired shopping records are inaccessible through the command API; read-only HA users cannot mutate current domains. Actors come from native authenticated service/WebSocket contexts, never payload role flags. Userless internal automations are trusted: do not expose them through untrusted scripts/webhooks. Discover the current canonical registry with `macromate.describe`; the legacy nutrition services below remain supported aliases.

Read actions require response data:

- `macromate.list_meals`
- `macromate.search_foods`
- `macromate.get_food`
- `macromate.lookup_barcode`

Mutations optionally return a response:

- `macromate.log_meal`, `macromate.update_meal`, `macromate.delete_meal`
- `macromate.clear_day`, `macromate.copy_meal`
- `macromate.save_food`, `macromate.set_favorite`
- `macromate.log_food`, `macromate.update_food_entry`

Full fields are in `services.yaml`. Listed entries expose `entry_id`, matching update/delete. Product, diary-entry and request IDs are distinct.

For new quick entries, omitted optional macros are unknown, not zero. The `nutrients` map persists only declared values, while legacy numeric compatibility fields remain present. Explicit numeric zero is known. `update_meal` is a patch: omit a macro to retain it, or send `protein: null`, `carbs: null` or `fat: null` to clear its declaration. Energy cannot be cleared. The edit dialog sends null for blank optional macros; old records without declaration metadata retain their explicitly stored values as known.

Diary/meal-group `totals` sum declared values only. Always consult `nutrition_missing`: a listed nutrient is unknown in at least one contributing entry. Primary UI tiles label partial values **Unvollständig** and show only an explicitly labeled known sum, without an exact progress bar. Incomplete consumed/balance sensors publish **unavailable**, not zero or an exact remaining target. Automations must check state availability; HA can suppress custom attributes on unavailable entities. An empty day and explicitly declared zeros are complete.

Example label and serving (illustrative data; check your actual label):

```yaml
action: macromate.save_food
data:
  food:
    name: My oats
    base_unit: g
    nutrients_per_100:
      calories: 370
      protein: 13
      carbs: 60
      fat: 7
      fiber: 10
    servings:
      - serving_id: bowl
        label: Bowl
        amount: 60
  request_id: create-oats-1
response_variable: food
```

```yaml
action: macromate.log_food
data:
  food_id: "{{ food.food.food_id }}"
  serving_id: bowl
  quantity: 1.5
  meal_type: breakfast
  request_id: breakfast-oats-1
response_variable: meal
```

Choose a positive base `amount` OR `serving_id` plus `quantity`. `date` is HA-local YYYY-MM-DD; an explicitly selected date without a timestamp is placed at local noon. `eaten_at` must include a timezone and agree with an accompanying date. Copy creates a new ID and preserves the original snapshot.

Bulk deletion requires explicit date and confirmation:

```yaml
action: macromate.clear_day
data:
  date: "2026-10-14"
  confirm: true
  request_id: clear-20261014-1
```

This intentionally breaks v0.2's implicit today deletion. The panel has no bulk-clear UI.

## Safe retries and local storage

Meals, products, favorites, dated goals and ledger share an atomically written Store with an internal versioned schema. Mutation order is serialized replay → validation/staged change → durable save → publication. Failed saves do not publish changed in-memory state.

A stable `request_id` replays the original result only for identical retained operation/payload. Changed data or another operation with that ID is rejected. Create retries after deletion do not resurrect entries. The FIFO ledger retains **1000 accepted operations**; evicted IDs have no retry guarantee. Direct ledger hashes distinguish JSON `1` from `1.0`; normal API numeric fields are normalized.

The panel never automatically retries writes. Unclear transport/storage status keeps the original payload/ID for explicit retry. Pending requests exist only in panel memory: after closing/reloading during an uncertain write, inspect the diary before submitting again. Removing MacroMate through HA deletes its local dataset.

Authorized views subscribe to filtered native refresh events and coalesce bursts. Refresh preserves selected dates, draft/focused forms and uncertain writes; safe list metadata can refresh without replacing a dirty recipe editor. The nutrition view retains its bounded fallback for missed events and HA-local date changes. Removal or identity changes release subscriptions and private state. No background provider search or automatic write retry is performed.

## Agent client

`tools/macromate_client.py` uses HA's authenticated REST service API. Supply `HA_URL` as a credential-free HTTPS origin and `HA_TOKEN` through a protected environment/secret manager. Never paste tokens into chat, files, skills, logs or URLs. These private actions need an appropriate HA administrator identity; HA tokens are not fine-grained MacroMate-only scopes.

Redirects are always refused. Plain HTTP requires `--trusted-lan-http` before the subcommand and does not make an untrusted network safe.

```sh
python3 tools/macromate_client.py list --date 2026-10-14
python3 tools/macromate_client.py add --name Lunch --meal-type lunch --calories 500 --request-id lunch-1
python3 tools/macromate_client.py update ENTRY_ID --calories 450 --request-id correction-1
python3 tools/macromate_client.py delete ENTRY_ID --request-id delete-1
python3 tools/macromate_client.py clear-day --date 2026-10-14 --confirm --request-id clear-1
```

The legacy conveniences cover diary CRUD; `describe`, generic `call ACTION` and Python `call_service` cover every advertised domain. Bounded Python helpers in `tools/macromate_transfer.py` handle large private backup/restore transfers and administrator-confirmed [standalone legacy Store/image migrations](docs/LEGACY_MIGRATION.md) separately. HTTP/protocol errors are sanitized and HA response envelopes unwrapped. Full recipe/planner/diary CRUD, exact readbacks, destructive confirmation and retry rules are documented in [AGENT_API.md](docs/AGENT_API.md).

## Privacy boundary and verification limits

Detailed diary entries are not exposed in sensor attributes. Daily intake, goal and weight summaries remain normal HA entities governed by HA permissions. This is not a separately encrypted medical vault in a shared HA instance. HA administrators, local storage/backups and trusted automations can access the dataset.

- Physical cameras, autofocus/lighting, Android/iOS hardware and Safari remain unverified. Generated EAN images and actual Chromium virtual-camera frames were tested, not substituted decode results.
- Firefox checks exist; WebKit was blocked by missing host libraries.
- OFF mapping/HTTP behavior was tested with offline synthetic TLS fixtures, not a promise of live product coverage or availability.

- No live HA instance was changed; no local build is automatically published. HACS/hassfest CI is distinct from local runtime acceptance.

## Development checks

```sh
python3 -m unittest discover -s tests -v
```

Framework/provider tests can skip without HA/aiohttp. Use HA 2026.10.1 / Python 3.14.2 for those and coordinator/runtime boundary tests:

```sh
python -m unittest discover -s tests -v
python -m unittest discover -s tests/ha -v
python -m compileall -q custom_components tests tools
```

Browser/decoder commands and dependency pins: `frontend/README.md`; combined build/workflows: `frontend/unified-src/README.md`. HACS installs the mirrored `custom_components/macromate/frontend` copy. Builds must be reproducible across clean dependency and checkout directories. After a deliberate rebuild, mirror the complete frontend, including **all immutable release graphs** and `retained-releases.json`. Only obsolete chunks in the mutable `frontend/unified/` output may be replaced; published `releases/<digest>/` graphs are append-only and never automatically pruned. See [frontend upgrade delivery and retention](docs/frontend-upgrade-delivery.md) for the warm-browser regression, publication recovery and safe installation gates. The bidirectional `test_unified_packaging.py` and Node artifact gate reject missing, stale, extra or mismatched assets before native acceptance.

Browser contract tests now replay captured form submissions through the actual HA coordinator. Set `HA_PYTHON` to a Python 3.14.2 interpreter with `homeassistant==2026.10.1` installed before running the Node suite; the CI frontend job installs that pinned runtime rather than skipping those assertions.

## License

MacroMate's original code is available under the [MIT License](LICENSE). Adapted Recipe-Manager, shopping-list-manager and Recipe-Manager-Card code retains the original MIT notices, including `Copyright (c) 2026 thekiwismarthome`. Bundled runtime notices are in `frontend/unified/THIRD-PARTY-NOTICES.txt` and `frontend/vendor/`. Open Food Facts data retains its separate data licenses and attribution; the MIT license does not replace them.
