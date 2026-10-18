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

Recipes, plans, the existing default diary and administrative operations require
native HA administrator authority. Named nutrition profiles have an owner and an
explicit sharing list. An authenticated owner or shared user can use nutrition
commands with that profile's `profile_id`; HA read-only accounts cannot mutate
them. Administrators can access all profiles. Native service Context and
authenticated WebSocket users determine identity; never supply actor flags in
action payloads. Userless internal automations are trusted, so do not expose them
through untrusted hooks.

## People and reports

`profiles_list` returns only accessible profiles; `default` identifies the
unchanged administrator diary. Omit `profile_id` for default nutrition commands.
For named profiles, supply the returned ID to diary, food and report actions.
Entries, local foods, favorite portions, replay receipts and captured goals are
separate for each person. Recipe definitions remain shared administrator data.

Administrators create profiles with `profiles_create`, change ownership/sharing
with `profiles_update`, and delete one with `profiles_delete` plus `confirm:true`.
An owner can update their profile's name and settings. Profile mutations require
a stable `request_id`; no existing diary is moved on creation. Native user IDs
come from the administrator-only `profiles_users` action, never display names.

`nutrition_report` accepts `period:"week"` or `period:"month"`, a selected ISO
`date`, and optional `profile_id`. Weeks run Monday through Sunday; months use
the calendar, including leap days. Responses distinguish days without entries,
unknown nutrients and missing historical goals. Averages use logged days only;
incomplete-day counts accompany known nutrient totals. Reports do not reconstruct
past targets from today's settings.

Cooking timers now create a native HA persistent notification after their
deadline without an open browser. `macromate_timer_finished` carries `timer_id`
and a deterministic `event_id` for automations. A durable outbox survives reloads;
the notification ID is stable when replaying an unacknowledged delivery. Event
consumers should deduplicate by `event_id` because a crash between delivery and
acknowledgement can replay the event.

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
Full backup contains all profiles, persisted history, timer delivery receipts,
dormant compatibility records and media; it is never an ordinary agent export.
Legacy recipe diary `sugars` values are upgraded to canonical `sugar` only when
they match the captured recipe portion exactly. Contradictory history is rejected.

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
