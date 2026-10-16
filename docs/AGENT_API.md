# MacroMate local API

The canonical `describe` action exposes the exact current action names, JSON
schemas, administrator requirements and finite transport limits. Native Home
Assistant services and `macromate/command` WebSocket messages share that registry
and transactional coordinator. No browser, cloud service or MCP server is needed.

## Credentials and clients

Prefer [integration-scoped agent access](SCOPED_AGENT_ACCESS.md) and its
[instructions](SCOPED_AGENT_INSTRUCTIONS.md) for delegated recipes, weekly plans
and diary read/create/update. Deletion is separately opt-in. Scoped credentials
cannot authenticate to ordinary HA services, REST or WebSocket APIs.

The administrative standard-library client `tools/macromate_client.py` uses
protected `HA_URL` and `HA_TOKEN` environment variables. Never send credentials in
chat, arguments, URLs or logs. An HA token is not a MacroMate-only credential.
Use HTTPS; `--trusted-lan-http` is an explicit operator override, not a network
security guarantee. Redirects and automatic retries are disabled. Errors are
sanitized. Requests are capped at 1 MiB, responses at 4 MiB.

```sh
python3 tools/macromate_client.py describe
python3 tools/macromate_client.py call recipes_get_all --json-file query.json
python3 tools/macromate_client.py call recipes_add --json-file recipe.json
```

An administrative caller can also supply a non-secret payload on stdin:

```sh
printf '%s' '{"name":"Example soup","ingredients":[{"name":"Carrot","amount":"100","unit":"g"}],"servings":2,"request_id":"documented-recipe-1"}' | python3 tools/macromate_client.py call recipes_add
```

JSON files contain only non-secret action payloads. Generic `call` preserves
nested values and nulls; duplicate keys, non-finite numbers and oversized data
are refused. CLI returns 0 on success, 1 on validation/transport failure and 2 on
usage/missing environment. No request ID is generated automatically.

## Operational domains

- Recipes: create, exact read, update, delete, search, favorites, tags, declared
  nutrients, consented remote imports and authenticated local photos.
- Weekly plan: add/update/exact read/remove or explicitly confirmed week clear.
- Recipe diary: `recipe_log` with explicit recipe ID, positive servings and meal
  type; `recipe_entry_update` scales the saved nutrition snapshot, not live data.
- Food and diary: quick meal CRUD, food database/barcode lookup, local food CRUD,
  favorite portions and immutable food snapshots. Missing nutrients are unknown,
  not zero. Creating a plan never silently logs a meal.
- Cooking timers/presets, private UI preferences and administrative platform info.

All private nutrition, recipe, plan and administrative operations require native
HA administrator authority. Native service Context and authenticated WebSocket
users determine identity; never supply actor flags in action payloads. Userless
internal automations are trusted, so do not expose them through untrusted hooks.

Every mutation should use a stable `request_id`. Use the returned record ID for
subsequent edits and exact-target readback. Reusing a request ID with a different
operation/payload is rejected. After an uncertain response preserve that ID and
identical payload; do not invent a replacement or automatically retry. Explicit
confirmation and user authority are required for destructive bulk operations.

## Full private backup and restore

`tools.macromate_transfer.download_backup` and `restore_backup` use separate
administrator-authenticated `/api/macromate/backup` and `/api/macromate/restore`
routes for datasets larger than generic service/client limits. Restore requires
`confirm=True`, a stable `request_id` and a complete validated root. Generic
limits are not raised. Root data retains its 64 MiB budget plus the bounded
administrative restore-receipt reserve; `describe.limits` is authoritative.
Full backup contains all persisted history, including dormant compatibility
records and media; it is never an ordinary agent export.

Standalone `legacy_import` now accepts **only `recipe_manager`**, supplied Store
JSON and supplied local-image bytes. It never reads source files or fetches
images. See [legacy migration](LEGACY_MIGRATION.md).

## Retired subsystem

Internal shopping, catalog/configuration/region/member/import/export actions and
recipe/plan transfers are absent from discovery, services and WebSocket schemas.
The shared client rejects their names before HTTP. Old standalone shopping
imports are rejected, including on the private legacy transfer route. There is
no Bring! adapter. Existing historical records, ACLs, legacy metadata and media
remain unchanged across load, unrelated mutations, restart and full backup/
restore. Dormant decoders are compatibility code, not a callable shopping API.
