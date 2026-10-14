---
name: macromate
description: "Use when managing MacroMate food portions and diary via authenticated Home Assistant actions. Preserve IDs, labels and privacy."
---

# MacroMate through Home Assistant

Use `tools/macromate_client.py` from the installed project. `HA_URL` must be a credential-free HTTPS origin and `HA_TOKEN` must come from protected secret/environment management. Never print a token or put it in a prompt, command argument, URL or file. The private actions require an appropriate HA administrator identity; tokens are not MacroMate-only scopes. All redirects are refused. Use `--trusted-lan-http` before the command only with explicit authorization for a trusted plaintext LAN.

## Operator workflow

1. Read the selected date with `list` before editing/deleting, and obtain the real `entry_id`. Do not guess from names or confuse product/request IDs with entry IDs.
2. Use stable request IDs for every mutation, including update/delete/clear. After an uncertain response keep the exact operation, payload and ID; inspect the current diary first. No automatic retries or new IDs to hide unknown status.
3. Read back the exact date/entry after each accepted change. An exit code 0 alone does not prove the requested state.
4. Log declared product calories and quantities, not invented missing nutrients. Treat unknown nutrition as unknown and disclose estimates. Use a product's own g/ml basis and serving definition; never silently equate volume and mass.
5. Food-entry edits scale the original saved snapshot via `macromate.update_food_entry`; quick entry edits use `macromate.update_meal`. Product changes do not rewrite old entries.
6. Online search requires integration consent and an explicit submitted lookup. Do not send diary/profile data to the provider; preserve OFF attribution even on cached products.
7. Delete a whole day only on direct user request, with explicit date and confirmation. Keep existing data during migrations.
8. Goals are profile/wearable estimates, not medical advice. Historical dates without snapshots have unknown goals. Do not count daily active energy plus PAL/workouts twice.

## CLI

```sh
python3 tools/macromate_client.py list --date YYYY-MM-DD
python3 tools/macromate_client.py add --name NAME --meal-type lunch --calories KCAL --request-id ID
python3 tools/macromate_client.py update ENTRY_ID --calories KCAL --request-id ID
python3 tools/macromate_client.py delete ENTRY_ID --request-id ID
python3 tools/macromate_client.py clear-day --date YYYY-MM-DD --confirm --request-id ID
```

Food actions are available through the client's `call_service` function: `search_foods`, `get_food`, `lookup_barcode`, `save_food`, `set_favorite`, `log_food`, `update_food_entry`, `copy_meal`. Read `custom_components/macromate/services.yaml` for exact fields. Query responses expose `entry_id`. The FIFO ledger retains 1000 accepted operations; evicted IDs no longer have retry guarantees. Do not publish APKs/private analysis evidence with the implementation.
