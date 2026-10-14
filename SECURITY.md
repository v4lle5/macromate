# Security Policy

## Trust boundary

MacroMate opens no extra network listener. The panel and private WebSocket commands use Home Assistant's existing authentication and require an administrator. Private service actions also require an administrator when a user context exists; HA's admin-service helper treats userless internal automations as trusted. Never expose these actions through untrusted scripts or public webhooks.

Detailed diary names, entries and label snapshots are not placed in sensor attributes. Summary/goal/weight sensors remain ordinary HA entities visible under HA's permissions. Administrators, local storage/backups and trusted automations can read the dataset. MacroMate is not a separate encrypted medical vault inside a shared HA instance.

- Supply HA_TOKEN through a secret/protected environment, never prompts, logs, issues or URLs.
- Use HTTPS. The companion client's trusted-LAN HTTP override is explicit; all redirects are refused.
- Online Open Food Facts reads are opt-in, fixed-origin HTTPS, GET-only, bounded and timed out. Only submitted search terms/barcodes leave HA, not profile/diary data. Scanner images remain local.
- Database records and UI strings are untrusted input. Validation, missing-nutrient semantics and text rendering apply equally to online and custom foods.
- Mutations use staged atomic persistence and a 1000-record FIFO idempotency ledger. Retained request IDs must not be reused for another payload/operation. Inspect the diary after uncertain writes; keep the original ID for retries.
- Bulk clear requires explicit date and confirm true. Removing the integration deletes its local dataset.

## Reporting

Use synthetic examples in reports. Do not publish health data, tokens, proprietary APK/decompilation evidence or exploit details in public issues. Contact the repository operator privately until a dedicated private reporting channel exists.

Publishing source to main does not create a release or establish production readiness. Runtime verification is pinned to HA 2026.10.1/Python 3.14.2; physical mobile cameras and Safari remain outside verified coverage.
