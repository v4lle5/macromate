---
name: macromate
description: Manage MacroMate recipes, weekly plans and nutrition through validated local actions.
---

# MacroMate local agent

Use [scoped agent instructions](../docs/SCOPED_AGENT_INSTRUCTIONS.md) for the
restricted local agent client. Default authority is recipe, plan and diary
read/create/update only; deletion requires a separately enabled scope and user
approval. Do not use an HA administrator token as a substitute for scoped access.

For an explicitly authorized full HA administrative workflow, use
`tools/macromate_client.py describe` to discover the current schemas and
`call ACTION --json-file PATH` to submit JSON. `HA_URL` and `HA_TOKEN` come from
protected environment management; never ask for credentials in chat or log them.
HTTPS is required unless the operator explicitly opts into trusted LAN HTTP.
HA credentials retain broader Home Assistant permissions.

Supported families: `recipes_*`, `meal_plan_*`, declared recipe portion logging
(`recipe_log`, `recipe_entry_update`), food/diary actions, cooking timers and
preferences. Planning does not log calories. Preserve unknown nutrients versus
explicit zero; use recorded snapshots for portion edits.

For mutations, keep one stable `request_id`, read back the exact returned record
ID and verify the intended fields. Do not retry an uncertain write with a new ID.
Never delete or bulk-clear without explicit authorization. Administrative full
backup/restore and standalone recipe migration use the bounded transfer SDK;
restore needs confirmation and is not granted to scoped agents.

Internal shopping actions and recipe/plan transfers are retired and rejected.
Bring! is separate; no connector is provided. Historical stored records and media
remain inert compatibility data in administrator-only full backups, not agent
capabilities. Do not attempt old action names or request shopping scopes.
