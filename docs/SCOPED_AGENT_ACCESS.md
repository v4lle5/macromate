# Restricted native MacroMate agent access

## Integration lifecycle and credential activation gate

The integration registers the three native HTTP views in `async_setup` when
native HTTP is available, and retries idempotently during `async_setup_entry`.
Deliberately headless runtimes skip registration. Concurrent registration calls
serialize the complete private Store load and route registration. Importing the
module alone registers nothing.

Registration adds no HA services, authentication providers, WebSocket commands,
users, refresh tokens or administrator credentials. It creates **no scoped
credential**: an operator must separately approve and perform minting. No
production token has been generated or distributed by this implementation/test
handoff. Source publication is separate from deployment and credential activation.

Every action dynamically resolves exactly one loaded MacroMate coordinator.
Entry unload fails closed with HTTP 503 for valid scoped data actions; reloading
reuses the registered views and credential manager without creating credentials.
Persisted revocations survive process restart. Independent review of the final
combined source remains required before production activation.

## Data and identity boundary — important

Recipes and meal plans remain shared administrator data. Native nutrition now
also supports separate named profiles with owner/sharing ACLs, alongside the
existing administrator-only default diary. This facade acts with the issuing
administrator's authority. A `diary.read` grant includes accessible profile
metadata and, when `profile_id` is supplied, that person's diary and reports;
diary write scopes can similarly target named profiles. Omitting `profile_id`
continues to address the default diary. These credentials are **not restricted
to one person**. Do not issue an administrator's diary grant to an agent that
should see only one household member. Profile-bound delegated credentials are
not part of this release.

A credential records its issuing administrator's literal HA user ID. Every
request freshly resolves that user and requires an active, non-system HA
administrator. Role removal, deactivation or deletion disables access. Restoring
the issuing user's role can restore a non-revoked credential; explicit credential
revocation is permanent. Deleting an HA refresh/access token does not revoke the
independent MacroMate credential: revoke it separately. Authentication is
rechecked after reading the request body. A request already admitted into the
coordinator may complete if an unrelated HA role change occurs during its atomic
commit, matching the native command boundary.

Only after the exact action/scope gate passes is `Actor(issuer_id, is_admin=True)`
passed to the existing coordinator. `trusted_internal` is never enabled. This
preserves administrator authority without bypassing native command checks.
No caller-supplied actor, role, owner, allowed-user or scope field is
accepted. Shopping data, including private other-user records, is entirely
outside this facade. The internal shopping subsystem is retired from native
actions and clients too; dormant historical data is retained for full private
backup/restore, not made available to agents.

## Endpoints

| Method and path | Authentication | Purpose |
| --- | --- | --- |
| `POST /api/macromate/agent/credentials` | Native HA administrator | Mint, return token once |
| `GET /api/macromate/agent/credentials` | Native HA administrator | Metadata only, no salt/hash/token |
| `DELETE /api/macromate/agent/credentials/{id}` | Native HA administrator | Durable revoke; idempotent |
| `POST /api/macromate/agent/action/{action}` | Independent MacroMate bearer only | Exact allowlist below |

Mint body: `{"label":"Local nutrition agent"}`. Optional `scopes` is an explicit
nonempty array of supported scopes; omission uses read/create/update for each of
`recipes`, `mealplan`, `diary`. Optional `expires_at` is a UTC Unix integer in the
future, at most 366 days away. No expiry is the explicit default. The issuing HA
user cannot be supplied in the body. Labels are bounded to 100 characters.

Mint returns metadata plus `token` exactly once. Store only that token in the
agent's protected local secret file, never in chat, prompts, URLs or logs. Metadata
contains `id`, `user_id`, `label`, `scopes`, `created_at`, `expires_at`, `revoked`.
Native HA administrators can list and revoke all delegated credentials. Every
list, mint and revoke freshly resolves the native request user inside the
credential lock immediately before its operation, after body/queue waits.
Demotion, deactivation, deletion or a system-generated identity yields 403 with
no credential Store change. Mint binds to that freshly validated issuer ID;
restoring a rejected issuer cannot activate a latent grant. An already admitted
durable commit is joined to completion, not rolled back on later role changes.

The action endpoint has `requires_auth=False` solely because it enforces its own
independent cryptographic bearer check; an HA token alone is rejected there.
It does not forward requests and has no generic dispatch fallback. Standard HA
services, states, config, backup/restore, control-plane routes and WebSocket auth
reject a MacroMate credential.

## Exact reviewed allowlist

All listed requirements must be present; these are not prefix/wildcard grants.

| Actions | Required scopes |
| --- | --- |
| `recipes_get`, `recipes_get_all`, `recipes_search`, `tags_get_all` | `recipes.read` |
| `recipes_add` | `recipes.create` |
| `recipes_update`, `recipes_set_favourite` | `recipes.update` and `recipes.read` |
| `recipes_delete` | `recipes.delete` **and** `mealplan.delete` (native cascade) |
| `meal_plan_get` | `mealplan.read` |
| `meal_plan_add` | `mealplan.create` and `recipes.read` |
| `meal_plan_update` | `mealplan.update`, `mealplan.read` and `recipes.read` |
| `meal_plan_remove` | `mealplan.delete` |
| `diary`, `nutrition_report`, `profiles_list` | `diary.read` |
| `log_meal` | `diary.create` |
| `copy_meal` | `diary.create` and `diary.read` |
| `update_meal` | `diary.update` and `diary.read` |
| `recipe_entry_update` | `diary.update`, `diary.read` and `recipes.read` |
| `recipe_log` | `diary.create` and `recipes.read` |
| `delete_meal` | `diary.delete` |
| `describe` | Valid credential; returns only currently permitted action descriptors |

Read scopes are independent capabilities, not implied by update scopes. Updates
return complete existing records, so their listed read requirements apply even
to no-op updates and exact retained replays, before entering the coordinator or
returning ledger results. `recipe_entry_update` additionally requires
`recipes.read` because its result includes a recipe snapshot. Ordinary `diary`
reads (and `copy_meal`) require only their listed diary read grant: that grant
explicitly includes recorded historical snapshots, not live recipe access.

Response audit: `recipes_add` and `log_meal` return only their newly constructed
records; `meal_plan_add` returns its newly constructed plan and requires recipe
read authority for the referenced source; `recipe_log` copies an existing recipe
and requires `recipes.read`. `copy_meal` copies an existing diary entry and
requires `diary.read`. Deletes return identifier/status receipts, not record
contents; recipe deletion also reports the IDs of cascaded plan deletions under
the explicit `mealplan.delete` grant. No-op and replay responses obey the same
matrix as first writes. Discovery omits actions missing any required scope.

Delete scopes are separate opt-ins, never defaults. `recipes_delete` needs plan
delete permission even if the recipe currently has no planned entries. Bulk
`clear_day` and `meal_plan_clear` remain denied even with delete scopes.

**Everything else is denied**: all shopping operations/scopes (including imports
and recipe/plan-to-shopping), HA service control, other HA integrations, admin,
configuration, profile creation/settings/sharing/deletion, user/permission
changes, raw files, SQL/shell, backup, restore,
export, imports, scraping, media upload/download, online food access, food catalog
management, timers and preferences. `download_image=true` is refused on recipe
creation. Inert image/source URLs are not fetched by the allowed commands.

`describe` uses the existing schemas, so `admin_only` describes the underlying
native command, not a requirement to provide an HA token to the scoped endpoint.
Clients must use this endpoint's scope-filtered action list, not native service
registration, for agent discovery.

## Validation, persistence and replay

- A credential has a random 128-bit public ID and a separate random 256-bit
  bearer secret. Only a random salt plus HMAC-SHA256 verifier and metadata are
  persisted in private `.storage/macromate.agent_credentials`; comparisons use
  constant-time `compare_digest`. This Store is separate from data exports.
- All credential operations share a lock with the complete delegated command.
  Revocation waits for admitted commands; after revoke is durably acknowledged,
  even an exact retained replay is rejected before consulting the data ledger.
- Commands use the existing coordinator validation, atomic Store transaction,
  persistence-before-publication and idempotency behavior. Every mutation needs
  an explicit stable `request_id`. The server namespaces/hashes it by credential
  ID before calling the coordinator, preventing cross-token replay collisions.
  Never auto-retry an uncertain write with a new ID.
- Cancellation joins started credential writes and delegated commands before
  releasing the credential lock. Failed credential saves do not publish their
  new in-memory authorization state.
- Credential persistence observes low-level HA write failures. Read-only or
  stopping storage cannot acknowledge a grant or revocation as durable. Removing
  the integration entry removes its independent credential Store as well.
- Strict JSON rejects duplicate keys, nonfinite numbers, excessive nesting,
  non-object bodies and unknown schema fields. Body limit is 256 KiB, independent
  of HA's generic limit. Query strings, encoded bodies and wrong content types
  are rejected. URLs are not passed through to any other handler.
- Every authenticated request (including refusals) counts against a per-token
  in-memory 60-request/minute fixed window. HA restart resets this rate counter,
  not token revocation/expiry. A maximum of 100 credential records, including
  revocations, bounds persistence. Administrative pruning/rotation beyond that
  lifetime capacity is deliberately not an agent capability.

Residual availability limits: the credential lock is global, so a slow or large
admitted command/body can delay other credentials and revocation; there is no
custom per-body timeout beyond HA/aiohttp transport limits. The per-token limiter
is not a network DDoS defense or a cross-restart quota. Apply normal HTTPS,
firewall/rate-limit and access-log hygiene at the HA boundary. MacroMate's rate
limit cannot protect unrelated native HA endpoints. HA auth/IP-ban behavior still
applies if callers misuse scoped credentials against those endpoints. Do not
record request bodies or Authorization headers in reverse-proxy diagnostics.
Raw server mint responses contain the new token; use the local output helper,
not browser screenshots, verbose curl, shared terminals or chat.

## Protected local client

`tools/macromate_scoped_client.py` is separate from the older broad HA client.
It requires HTTPS unless `--trusted-lan-http` is explicitly supplied. It rejects
redirects and environment proxies; the origin must have no credentials/path/query.
Secret files must be bounded regular files, owned by the invoking OS user,
without group/world permission bits; symlinks are refused. Errors are sanitized.

An **operator**, not the agent, can mint using an existing protected HA admin
secret file; only metadata is printed and the new token is written once to a
new mode-0600 file (existing output files are never overwritten):

```sh
python tools/macromate_scoped_client.py --origin https://ha.example.invalid \
  --secret-file /secure/operator-ha.secret mint --label 'Local nutrition agent' \
  --output-file /secure/macromate-agent.secret
```

The agent gets **only** `/secure/macromate-agent.secret`, never the operator file.
An explicit delete grant uses repeated `--scope`; supplying any scopes replaces
the default set, it does not extend it implicitly. `list` and `revoke ID` require
the operator file. Mint failures can leave an empty/partial protected output file
and/or an issued credential after an ambiguous response: inspect operator metadata
and revoke that credential before trying again; do not blindly repeat mint.

Prepare `request.json` locally with an ordinary action payload (for example a
stable request ID and recipe name), then:

```sh
python tools/macromate_scoped_client.py --origin https://ha.example.invalid \
  --secret-file /secure/macromate-agent.secret call recipes_add \
  --json-file request.json
```

For discovery use `call describe --json-file empty-object.json`, where the file
contains `{}`. All action results are ordinary scoped action responses, not HA's
`service_response` envelope. No automatic retries/request-ID generation occur.

## Verification and integration handoff

Pinned acceptance runtime: real HA 2026.10.1 with Python 3.14. Tests instantiate
HA's real `HomeAssistantHTTP`, auth middleware, native API and WebSocket modules,
loopback ephemeral sockets, real coordinator and private Store. Native HTTP
acceptance uses the production lifecycle, not a manually installed agent hook.
The restart fixture loads a real config entry in three fresh Python processes on
one disposable configuration; every identity, credential and record is synthetic.

```sh
PYTHONPATH=.:tests/ha \
/home/valentin/.hermes/profiles/darlene/cache/scratch/macromate-runtime/venv/bin/python \
  -B -m unittest test_agent_credentials_native test_agent_security_native test_agent_restart -v
```

Tests exercise the allowlist, exact target reads and disk persistence, all current
non-allowlisted registry actions, missing/default delete scopes, private shopping
refusals, direct HA API/service/config/WS misuse, duplicate JSON/body caps,
escalation fields, filtered discovery, wrong/expired credentials, issuer
role/deactivation, durable revocation including retained replay, failed save and
repeated cancellation, real 60/61-request limiting, and the protected-file client.
The three-process acceptance uses the actual CLI subprocess to mint to a 0600
file (metadata-only stdout), create recipe/plan/diary records, authenticate after
restart, replay a retained write, update/read/delete each domain, revoke, and
verify HTTP 401 for both reads and retained mutation replay after another restart.
Native entry unload/reload checks HTTP 503 while unloaded and reuses registration.
Independent Store readback matches the coordinator; no persisted HA Store contains
the bearer secret. A separate concurrent registration test asserts exactly three
views, one manager, no minted credential and unchanged native users/services.

Local acceptance on HA 2026.10.1 / Python 3.14.2: **14 scoped tests pass**;
`python -B -m unittest discover -s tests/ha -p 'test_*.py' -v` passes **183 native
framework regressions**. Security regressions additionally prove body/lock-wait
administrator demotion, deactivation and deletion reject list/mint/revoke without
Store changes or latent grants, and full-record no-op/replay responses require
the listed read scopes. Evidence logs are local scratch artifacts, not published
credentials or deployment artifacts.

Before production activation the parent must independently review the final
combined lifecycle/auth/client changes and global-domain delegation assumption,
add these test commands to CI, and grant credential activation explicitly. This
handoff does not modify the frontend/native coordinator ACLs or replace the
existing broad client's semantics. Agents should follow the separate
[scoped-only instructions](SCOPED_AGENT_INSTRUCTIONS.md), not broad HA-token guides.
