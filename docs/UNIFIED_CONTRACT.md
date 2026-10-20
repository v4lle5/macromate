> **Scope update:** Internal shopping and recipe/plan transfers are retired in
> both frontend and backend. Historical shopping descriptions below document
> provenance/compatibility only, not supported actions. No shopping services,
> WebSocket commands, discovery or standalone imports are registered. Stored
> records/media remain in complete administrative backup/restore; no Bring!
> adapter is provided. Current API: [AGENT_API.md](AGENT_API.md).

# MacroMate unified implementation contract

Status: implementation and acceptance contract, not a claim of completion.

The complete source feature inventory is `UNIFIED_FEATURE_MATRIX.json`: 17 MacroMate, 67 recipe-backend, 68 shopping-backend and 43 card rows. Every row starts as pending acceptance. Source features marked inert/unimplemented remain explicitly identified; no row becomes covered merely because a worker reports completion.

## Required result

One `macromate` integration, one `custom:macromate-card` dashboard resource and one shared authenticated API. Merge the functional recipe, planner, timer, shopping and settings surfaces from the pinned MIT projects; retain MacroMate's nutrition model, scanner, diary CRUD, calorie ring, macro display and existing data. The local agent client must support full CRUD, not only a read-only summary.

Reference revisions:

- MacroMate: `fbd6b18934e3f3e6672442d6f48f53681bf03972`.
- Recipe-Manager: `3c6dcba4b84872ac432e1198f6e855d437cfa294`.
- shopping-list-manager: `c55e90d74f5efd39f5c083b3020fbfe48a19f267`.
- Recipe-Manager-Card: `e25f96663538fb148b25ccbe51982b7ba6c6681d`.

Original MIT copyright and full notices must accompany adapted source. Do not copy committed node_modules, bytecode, private analysis, unsafe permission behavior or upstream build hooks.

## Shared pure domain interface

`custom_components/macromate/platform_support.py` supplies:

- Frozen `Actor(user_id: str | None, is_admin: bool = False, trusted_internal: bool = False)` and `.owner_id` (`user_id` or `internal`).
- `require_admin(actor)`, `can_access(record, actor)` and `require_access(record, actor, owner_only=False)`. Records use `owner_id` and `allowed_users`. Trusted internal execution has HA's existing automation trust; payloads can never set the transport actor.
- Bounded helpers for text, identifiers, finite numbers and JSON-compatible data, plus `utc_timestamp()`.
- Preserve literal identifiers. A missing `owner_id` is not public access; public ownership must be explicit, and shared membership does not grant owner-only operations.
- `empty_kitchen()` returns dictionaries for `recipes`, `meal_plan`, `timers`, `timer_presets`, `shopping_lists`, `shopping_items`, `products`, `categories`, `loyalty_cards`, `regions`, `active_lists`, `preferences` and `media`.

Domain modules must not import Home Assistant. They mutate only a staged kitchen dictionary, never a Store or production file.

`recipes.py` exports:

- `RECIPE_ACTIONS: dict[str, dict]` descriptors.
- `recipe_command(kitchen, action, payload, actor, now: str) -> dict`.
- `recipe_authorize(kitchen, action, payload, actor, *, allow_missing=False)`.

`shopping.py` exports the same shape as `SHOPPING_ACTIONS`, `shopping_command`, `shopping_authorize`. It may load bundled immutable catalog JSON through package-local paths, but never arbitrary paths supplied by callers.

Every descriptor contains `description` (English), `read_only` (boolean), `admin_only` (boolean), and `schema` (JSON Schema object including properties/required/additionalProperties=false). Use `network: true` for actions whose preprocessing is owned by the parent transport. Descriptors are the source for capability discovery, named HA actions, WebSocket allowlists, local clients and documentation. Mutations include optional `request_id`; the local agent workflow requires a stable request ID for safe retries. Destructive collection operations include `confirm: true` and an explicit target/range. Do not accept an actor/user identity override as payload authorization.

Responses preserve the upstream recipe/shopping response shapes wherever practical (recipe, recipes, lists, items, etc.), and return stable object IDs. Root result `id` fields belong to the object; WebSocket envelope IDs belong only to HA transport.

## Canonical actions

For Recipe-Manager actions, remove `recipe_manager/` and replace `/` with `_`: e.g. `recipes_get_all`, `recipes_get`, `recipes_add`, `recipes_update`, `recipes_delete`, `recipes_toggle_favourite`, `tags_get_all`, `meal_plan_get/add/remove/clear`, `global_timers_get/add/update/delete`. Map `import/recipe_keeper` to `recipe_keeper_import`, `get_info` to `platform_info`, and `backup` to `platform_backup`. Source `subscribe` is replaced by MacroMate's subscription, not a second integration. Add the missing true `meal_plan_update` and timer-preset CRUD. `recipes_upload_image` and `recipes_download_image` are parent-owned network/media preprocessors; keep their descriptors in the recipe registry.

For shopping actions, remove `shopping_list_manager/`, replace `/` with `_`, and prepend `shopping_`: e.g. `shopping_lists_get_all/create/update/delete/set_active/update_members`, `shopping_items_get/add/update/check/delete/increment/reorder/bulk_check/clear_checked/get_total`, product/category/loyalty/region commands and integration settings/import/export. Add actual category reordering, missing custom-product operations and explicit item/list readback where needed. Source subscribe is replaced by MacroMate's filtered subscription. `shopping_users_get_all`, `shopping_openfoodfacts_fetch` and `shopping_products_download_image` need parent preprocessing; their domain descriptors remain discoverable.

Existing thirteen nutrition action names and HA service aliases remain supported. No diary mutation should be triggered by merely scheduling a recipe or adding ingredients to a shopping list.

Parent-owned cross-domain actions:

- `describe`: returns `{version, actions: {name: descriptor}, legacy_services, limits}`.
- `recipe_log`: `{recipe_id, servings, meal_type, date?, request_id}` -> immutable diary entry from declared recipe nutrition.
- `recipe_entry_update`: `{entry_id, servings?, meal_type?, request_id}` -> scale its recorded recipe snapshot.
- `recipe_to_shopping`: `{recipe_id, list_id, servings?, ingredient_indexes?, ingredient_matches?, request_id}` -> confirmed user-selected ingredient rows. `ingredient_matches` is an optional array of `{ingredient_index, product_id}` for original recipe indexes. Resolve catalog name/category from that exact accessible product ID server-side; reject duplicate or unselected indexes and invalid products. Preserve ingredient quantities/units rather than replacing them with product defaults. Do not merge solely by name, discard added quantities, or overwrite a selected catalog identity. Return actual item IDs and use one atomic operation for the complete selection.
- `plan_to_shopping`: `{week_start, list_id, request_id}` -> exact seven-day plan range, never unrelated weeks.
- `platform_restore`: `{data, confirm:true, request_id}` -> validated administrative restore; no automatic production restore.
- `preferences_get/update`: settings scoped to the authenticated user, persisted locally and available to agents.
- `food_delete`: explicit cached/local food deletion without rewriting diary snapshots.

## Persistence and migration

Keep HA Store key `macromate.meals` and Store envelope version 1. Add `kitchen` to the root state and use internal schema 3. Load old internal schema 1/2 additively without changing existing entries, foods, favorites, dated goals, IDs or retained ledger results. Reject future schemas without writing.

All accepted changes use the same coordinator lock and ledger: authorization under lock, replay check, staged mutation, durable atomic save, then model adoption/event publication. New shared-domain fingerprints include the server-derived actor identity so another user cannot replay a private result by guessing its request ID. Validate current access before returning retained results where the object still exists. Same-actor deletion retries may use retained tombstones. Failed writes must not publish staged kitchen or diary changes.

The charged dataset budget remains 64 MiB, including ordinary ledger history. Only tightly classified administrative restore receipts may use a separate finite 4 MiB reserve in the same root/atomic Store/backup. Total root bytes are bounded at 71,303,168 and dedicated transfer bytes at 71,311,360. Receipts retain exact results, have an empty access-target list because administrative authorization is rechecked, and are limited to 4 KiB each within the same 1,000-entry FIFO ledger. Removing them from the charged projection does not remove them from persistence or export. Unrecognized restore-like records are charged normally; over-retention input is rejected. Ordinary data cannot borrow the reserve. The root remains depth 32 independently of a bounded restore envelope. Generic client, command, WS and framework HTTP limits remain unchanged.

Historical restoration validates captured snapshot → recorded portion → exact canonical nutrient keyset/values and all four primary compatibility fields. It uses the native unrounded food calculation and native six-decimal recipe calculation, with relative tolerance `1e-12` / absolute `1e-9` in the nutrient's own unit. Equivalent recipe aliases denote one declaration; contradictory aliases, invented zeroes, missing known nutrients and boolean numerics fail before Save. Unknown primary compatibility fields may contain only zero placeholders, not new declarations. Authentic legacy quick entries without maps remain valid after migration; the pinned historical food creator already emitted complete maps, so snapshot entries cannot discard their map by claiming an old schema. Current source objects need not exist or match; no source lookup or implicit repair occurs.

An event proxy may notify permitted non-admin list members, but sends only a generic refresh signal and must not broadcast private recipe/diary/list contents. Shared-list membership is not permission to read nutrition history. Existing private nutrition and recipe/planner/global data remain administrator-only unless a separately defined object ACL allows access.

Keep catalog products separate from nutrient-tracked foods; do not invent nutrition for shopping catalog records. Region-qualify catalog IDs to avoid collisions across the six datasets. Persist user overrides, custom products, usage, categories, list order, pricing/currency, loyalty-card ACLs and custom regions. Price totals with mixed currencies return a breakdown, not a fictitious combined currency.

## Nutrition and units

Recipes retain all original metadata, ingredient groups, notes, taxonomy, photos, rating and serving information. Store declared numeric nutrient values independently from original imported text. Use `nutrition_basis` (`per_serving`, `per_recipe`, or `unknown`) and preserve provenance. Missing values are not zero. Recipe logging requires declared calories and a known basis; a missing value is not grounds to fabricate a label.

A recipe diary entry stores `recipe_id`, `recipe_servings`, `recipe_snapshot` and explicit declared nutrients. Later recipe edits/deletion must not alter its history. Mass and volume conversions remain separate. Serving scaling and known unit conversion can be displayed; cups of an ingredient are not grams without an explicit ingredient-specific density. Shopping merges only compatible quantities/units; ambiguous rows remain separate.

## Safe imports and media

`kitchen_network.py` is a separately tested helper, with no HA imports. Provide asynchronous `fetch_recipe(url, *, enabled: bool)` / `fetch_image(url, *, enabled: bool)` using a dedicated cookie-free client, and synchronous `parse_recipe_keeper(html_content)`, `parse_recipe_archive(base64_data)`, `normalize_image(base64_data)` helpers. Return pure recipe dictionaries or `{data: base64 WebP, content_type:'image/webp'}` records. Do not execute HTML/scripts, extract archive paths, accept arbitrary filesystem destinations, or forward HA authorization to remote sites.

Require explicit remote-import consent; constrain HTTPS hosts/destination IPs at actual connect time, redirects, bytes, decompression/pixels, archive members, timeouts and request rates. Block private/loopback/link-local/metadata destinations, credentials and non-HTTP schemes. Tests must demonstrate blocked DNS rebinding/redirect/private targets and hostile HTML/archive/image inputs. Do not claim compatibility with every blocked or login-only site.

Recipe upload/download, Recipe Keeper import and product images stay local after accepted explicit operations. Parent stores bounded normalized media in the private kitchen state initially, delivers it only through an authenticated media endpoint, and enforces record/list access. Frontend fetches local media through the existing HA authenticated connection and releases object URLs on context change. No public `/local/` directory is used for private food photos or loyalty information.

## Frontend contract

Preserve the MIT reference's sidebar/mobile navigation, cards, recipe tiles/detail, taxonomy, serving controls, editing, planner, cooking timers, settings and locale surfaces. Use the shared Glass Wave theme in light, dark or system mode, with consistent readable typography and keyboard focus. Migrate removed palette preferences without discarding unrelated settings. Keep runtime dependencies local and notices complete. Backend dependencies become a single MacroMate adapter; no required Recipe Manager or Shopping List Manager integration/card remains.

Keep `custom:macromate-card` and `/macromate-assets/macromate-card.js` as the installed identity/resource. A summary-mode compatibility option may preserve the prior compact nutrition card, but the default combined card must contain the requested full application. Nutrition can reuse existing modules/forms/scanner and the original ring; it must support actual entry CRUD, not merely link to a separate app.

Frontend must capture user ID, admin permission and connection for every request/subscription and clear old private DOM/model on replacement. Sanitized errors, explicit uncertain-write retry with the same payload/ID, no automatic mutations, keyboard/touch accessibility and mobile/dark states are acceptance requirements. Imports/HTML/notes/recipe titles are data, never executable markup or instructions.

## Local agent contract

A generic CLI `call SERVICE` accepts bounded JSON from stdin/file, preserves all payload fields including null, and can access every named HA action. `describe` retrieves machine-readable schemas. Retain the existing diary CLI while adding explicit date/copy and generic complete-domain access. Do not default omitted macros to zero.

Provide a Python client/API guide and shipped agent skill with complete create/read/update/delete examples for recipes, weekly planning, shopping lists/items and diary entries. All mutations use a stable request ID and exact-target readback; uncertain responses never trigger a new ID. Credentials are supplied only through protected environment/secret management, never arguments, fixtures, URLs or stdout logs. HA bearer scopes are not claimed to be fine-grained MacroMate-only scopes. No mandatory browser, remote LLM or cloud server is required.

## Acceptance

Maintain a row-level upstream feature matrix. Mark implemented upstream features covered only with implementation and executable evidence. Explicitly label upstream placeholders/inert metadata instead of pretending they already work. Verify both inventories and shared interfaces before adopting worker changes. Tests must cover full local API CRUD, schema-2 migration, persistence/restart/retry, failed-write rollback, cross-domain flows, ACL and private events, hostile inputs, actual supported HA services/HTTP/WS plus browser UI forms, complete assets/licensing, independent review and exact-revision CI.
