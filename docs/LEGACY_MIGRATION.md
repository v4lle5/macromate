# Import standalone Recipe Manager and Shopping List Manager data

MacroMate imports explicitly supplied JSON and image bytes. It does not scan, open, delete or rewrite another integration's Store files, read server-side image paths, or download referenced URLs. Keep the originals and a private MacroMate backup before importing. This is an additive migration, not a replacement restore: existing record/media IDs cause rejection rather than overwrites or newly invented IDs.

## Authorization and atomicity

`macromate.legacy_import` is an administrator-only canonical action available through native services and `macromate/command` WebSocket messages. Its discoverable schema requires `source`, `stores`, explicit boolean `preserve_permissions`, literal `confirm: true`, and a stable `request_id`. `images` is optional only when no local images are referenced. Shopping imports require an explicit `country`; recipe imports forbid that field.

The entire import is converted in a detached stage, checked against the complete persisted model, and committed together with its operation receipt in one atomic Home Assistant Store write. Validation failure saves nothing. Successful exact replay returns the retained result without another write; reusing the ID with a different payload is rejected. After a timeout or uncertain response, retain the exact payload and ID; do not automatically retry or invent a new ID. Confirm the result with exact-record reads and a private backup.

Default `preserve_permissions: false` assigns imported owned records to the importing administrator with no shared members. An administrator's explicit `true` retains verified legacy ACL fields and historical missing-owner public semantics where that source actually supports them. Recipe records retain MacroMate's administrator-only access; their migrated media belongs privately to the importer. Shopping media access is derived from all referencing records, including the parent list for item images. Personal catalog overrides belong privately to the importer. The result reports the permission policy, imported IDs and image mapping; shopping also reports catalog ID and item-order mappings. Review the permission report before distributing imported records.

## Accepted source formats

Only the following exact Store keys are accepted. Values may be the decoded raw Store data or an exact Home Assistant envelope containing only `version`, `minor_version`, `key` (matching the supplied Store key), and `data`. Unsupported versions, unknown keys/fields, map-key/record-ID mismatches, conflicting aliases, dangling references, collisions, and unused images reject the whole bundle. Missing optional Stores are allowed; malformed supplied Stores are not ignored.

### Recipe Manager

Pinned source: Recipe Manager `3c6dcba4b84872ac432e1198f6e855d437cfa294`. Store envelope version **1**, minor version **1**.

- `recipe_manager.recipes`: literal ID-keyed recipe map.
- `recipe_manager.meal_plans`: literal ID-keyed plan map.
- `recipe_manager.global_timers`: literal ID-keyed timer map, or the explicit transfer extension `{ "timers": <ID-keyed map>, "timer_presets": <array> }`.
- `recipe_manager.tags`: optional string array retained as inert private importer preferences. The pinned source declares this key but does not persist it.

Timer presets in that transfer extension are explicitly supplied browser `rm_timer_presets` records, not a fabricated upstream Store. The adapter preserves recipe fields, dates, ingredient headings/order, plans, timer state and raw nutrition. It does not infer a nutrition basis from old text or turn unknown/null nutrients into zero. Such recipes cannot be logged as nutritional portions until actual numeric declarations and a known basis are provided separately. Equal `title`/`name` and `favourite`/`is_favourite` aliases are accepted; conflicts, including an explicit false conflicting with true, are rejected.

### Shopping List Manager

Pinned source: `c55e90d`. Store envelope version **2**, minor version **1**, for every supported Store, including regions and categories.

- `shopping_list_manager.lists`: literal list-ID map.
- `shopping_list_manager.items`: list-ID map of item arrays.
- `shopping_list_manager.products`: literal product-ID map.
- `shopping_list_manager.categories`: category array, not an ID-keyed map.
- `shopping_list_manager.loyalty_cards`: literal card-ID map.
- `shopping_list_manager.custom_regions`: `{ "regions": { "CODE": "Literal name" } }`, also supporting validated typed region values.

Country/catalog identities are explicit, never guessed by product name. Verified legacy catalog IDs become region-qualified IDs and are reported in `id_map`; custom record IDs remain literal. Existing packaged system categories cannot be shadowed. Leading-zero barcodes, quantities, units, prices, snapshots and literal custom region names are retained. Legacy partial item order is supported: the supplied ordered IDs come first, followed by the remaining items in their original Store order, with the original and resulting order reported in `order_map`. Unknown ordered IDs are rejected, not repaired.

## Local image bytes

Supply `images` as exact referenced URL → base64 encoded image bytes. Both old local prefixes are supported for each source:

- `/local/recipe_manager/images/` and `/local/images/recipe_manager/`
- `/local/shopping_list_manager/images/` and `/local/images/shopping_list_manager/`

Every local reference must have supplied bytes, and every supplied asset must be used. Unsafe filenames, malformed paths, unsupported local prefixes, invalid images and ID collisions reject the import. Images retain the existing 8 MiB raw-byte and decoded image safety bounds, are normalized to WebP with metadata stripped, and are stored under authenticated `/api/macromate/media/…` references. Remote HTTP(S) references are inert metadata only; import does not fetch them. Original files remain untouched.

## Large private transfers

The standalone SDK provides `import_legacy` using authenticated `POST /api/macromate/legacy-import`, avoiding smaller generic client and WebSocket frame limits. It preserves HTTPS by default, redirect refusal, finite/duplicate-key JSON validation and no automatic retries. It reads no local files and returns private data; applications must explicitly supply already decoded Store data and image bytes.

```python
import os
from tools.macromate_transfer import import_legacy

# supplied_stores and supplied_images were explicitly loaded by your application.
# Invoke only after the operator approved migration and the ACL policy.
result = import_legacy(
    os.environ["HA_URL"], os.environ["HA_TOKEN"],
    source="shopping_list_manager",
    stores=supplied_stores,
    images=supplied_images,
    country="GB",
    preserve_permissions=False,
    confirm=True,
    request_id="operator-chosen-stable-migration-id",
)
```

Recipe imports use `source="recipe_manager"` and omit `country`. Explicitly authorized plaintext LAN clients may opt into `trusted_lan_http=True`. The finite transfer cap is **71,311,360 bytes**, shared with backup/restore transfers. This does not increase the ordinary **67,108,864-byte** dataset budget, generic **8 MiB** command budget, generic client's **1 MiB** request/**4 MiB** response budgets, native HA generic HTTP limit, or root nesting bound. Only narrowly classified administrative restore receipts use the separate reserve; legacy-import data and receipts remain charged ordinary data. A bundle fitting the wire cap can therefore still be rejected before Save if its fully converted persisted root and receipt exceed the dataset budget. See [AGENT_API.md](AGENT_API.md) for exact storage/transfer accounting.

## Verification scope

Automated tests cover pure conversion, pinned envelopes and actual full-root validation, plus native authenticated service/HTTP SDK imports, one-save persistence, independent disk readback, Store reload, exact replay, large recipes, authenticated normalized-image reads, parent-list sharing, malformed bundle rollback, authorization denial and failed-save nonpublication. These use synthetic records and disposable loopback Home Assistant, not a production migration or a guarantee that every historical third-party variant is supported. Unsupported variants fail closed; do not edit originals merely to make them pass.
