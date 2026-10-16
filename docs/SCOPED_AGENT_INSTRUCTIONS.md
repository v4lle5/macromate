# Scoped-only local agent instructions

Use this guide for an agent authorized only to manage MacroMate recipes, meal
plans and diary records. The broader HA client/agent guide is **not** applicable.

## Credentials and transport

- The operator separately approves activation, mints a restricted credential and
  provides an owner-only local secret-file path plus the HA origin. Building or
  installing this integration is not approval to mint or distribute credentials.
- Never request, read, store or use the operator's HA administrator token. Never
  use `tools/macromate_client.py`, HA services, WebSocket authentication or other
  HA routes as a fallback. A scoped MacroMate credential cannot authenticate to HA.
- Use only `tools/macromate_scoped_client.py ... call ACTION --json-file FILE`.
  Keep the credential in the supplied protected file, not a prompt, command-line
  literal, URL, chat, screenshot or log. The client reads it itself.
- HTTPS is required by default. Use `--trusted-lan-http` only for an explicitly
  operator-approved trusted local network, never automatically after TLS failure.
- The agent must not run the operator-only `mint`, `list` or `revoke` commands.
  Credential administration is outside the delegated scope.

## Discovery and commands

Create an ordinary JSON file containing `{}` and invoke:

```sh
python tools/macromate_scoped_client.py --origin https://ha.example.invalid \
  --secret-file /secure/macromate-agent.secret call describe \
  --json-file empty-object.json
```

Use only the returned action descriptors and exact payload fields. The endpoint
returns ordinary results, not HA's `service_response` envelope. Missing actions
are not authorized; never try another transport to bypass their absence.

Permitted domains are recipes, meal plans and diary only, subject to the
credential's explicit scopes. Read is not implied by update: recipe updates need
`recipes.read`; plan updates need `mealplan.read` and `recipes.read`; diary updates
need `diary.read`, and `recipe_entry_update` also needs `recipes.read`. These
requirements include no-op writes and retained replays. A diary read grant
includes historical recipe snapshots but does not authorize live recipe reads.
Create/delete receipts follow the exact matrix in SCOPED_AGENT_ACCESS.md.
Delete operations need separate opt-in scopes;
recipe deletion also needs meal-plan deletion permission because it cascades.
These records use MacroMate's existing **global administrator datasets**, not
private per-person partitions. Do not promise person-private recipes or diaries.

**Shopping is not supported.** Bring is the user's shopping application. Do not
create shopping lists/items, try recipe-to-shopping actions, or request shopping
scopes. Backup/restore, imports/exports, files, SQL/shell, configuration, users,
permissions, media acquisition and generic HA service control are also forbidden.

## Safe writes and readback

1. Use the literal record ID returned by create/read. Do not guess an ID or use a
   request ID as a record ID.
2. Every mutation requires an explicit, stable `request_id`. Save it with the
   exact action/payload until the outcome is resolved. Each logical operation gets
   a distinct ID; repeated identical delivery retains the original ID.
3. Never automatically retry an uncertain write. Read the exact target first;
   if an explicitly authorized retry is needed, keep the same action, payload and
   request ID. Never change an ID merely to bypass a replay conflict.
4. Read back the exact recipe/plan entry or locate the diary entry by its returned
   `entry_id`. A successful mutation response alone does not establish completion.
5. Respect HTTP 403 as a scope refusal, 401 as invalid/expired/revoked access,
   429 as a rate limit and 503 as unavailable/uncertain state. Stop and report the
   boundary rather than requesting administrator credentials or bypassing it.
6. Keep destructive operations within the user's explicit requested scope. Never
   infer approval for bulk deletion, credential changes or integration deployment.

The client does not retry or generate request IDs. Full scope, endpoint and
operator instructions are in [SCOPED_AGENT_ACCESS.md](SCOPED_AGENT_ACCESS.md).
