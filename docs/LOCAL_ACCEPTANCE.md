# Local acceptance: recovered unified MacroMate

This note supplements the earlier feature-discovery matrix; that matrix records historical, per-feature evidence and is not a current production acceptance claim. The recovered worktree is the local candidate, not a published release or an installed production integration.

## Previously blocking slices

| Slice | Implemented path | Executable evidence |
|---|---|---|
| Full-budget backup/restore with operation history | `storage_budget.py`, platform restore and bounded SDK transfer; only exact small administrative restore receipts receive the finite reserve | `tests/test_storage_budget.py`, `tests/ha/test_restore_capacity.py`, `tests/ha/test_agent_transfer_native.py` |
| Historical snapshot/portion nutrient consistency | Full-root validation before persistence; immutable food/recipe history and declared zero versus unknown preserved | `tests/test_history_consistency.py`, `tests/test_recipe_snapshots.py`, `tests/ha/test_historical_restore.py`, `tests/ha/test_restore_consistency.py`, `tests/ha/test_restore_integrity.py` |
| Standalone recipe/planner/timer import | Pinned exact-key Store conversion, server-derived admin identity, atomic native action and SDK route | `tests/test_legacy_recipes.py`, `tests/ha/test_legacy_import_native.py` |
| Standalone shopping/image import | Pinned Store conversion, explicit ACL policy, parent-list-derived media ACLs, authenticated normalized media | `tests/test_legacy_shopping.py`, `tests/ha/test_legacy_import_native.py` |
| Legacy custom region wrappers | Literal code/name conversion with explicit country, supported version-2 envelopes, complete staged validation | `tests/test_legacy_shopping.py`, `tests/ha/test_legacy_import_native.py` |

The SDK transfer bound is 71,311,360 bytes: the unchanged 64 MiB charged dataset budget plus the separately bounded 4 MiB restore-receipt reserve and 8 KiB wire-envelope allowance. Generic command, client, native transport and JSON nesting limits are not raised. Tests reject the first excess ordinary-data byte before Save and exercise exact-budget data, receipts, disk equality, fresh-process loading, SDK maximum-depth round trips and byte-identical replay.

## Executed verification

Pinned Python 3.14.2 / Home Assistant 2026.10.1:

- `PYTHONPATH=.:tests/ha "$HA_PYTHON" -B -m unittest discover -s tests -p 'test_*.py'`: 267 passing tests.
- `PYTHONPATH=.:tests/ha "$HA_PYTHON" -B -m unittest discover -s tests/ha -p 'test_*.py'`: 157 passing native/framework tests.
- The legacy native module includes cross-transport WebSocket replay, conflicting-declaration rejection, exact media readback and single-save import assertions.
- `node --test tests/frontend/*.test.mjs`: 86 passing tests, no skips, including cross-checkout/dependency build reproducibility and complete development/installable frontend byte equality.
- `node tests/frontend/macromate-unified-verify.mjs`: all 12 verification jobs passed, covering build, adapters, domain workflows, actual Chromium forms, themes, hostile archive preflight, media, refresh ordering and existing card/client/scanner tests.
- `"$HA_PYTHON" tests/ha/native_unified_browser.py`: passed on disposable loopback HA with the installable frontend, 104 canonical registered actions, 16 sensors, native authenticated HTTP/WebSocket, shipped-client cross-domain CRUD, browser forms and independent Store readback. Backup/restore and uncertain-response explicit replay passed. Cleanup verified zero persisted refresh tokens and listener connection refusal.
- Compilation and `git diff --check` passed.

Native light desktop and dark mobile screenshots were inspected: the calorie ring, incomplete-nutrient labels and navigation are readable and fit their viewports. This is synthetic isolated acceptance, not full Lovelace editor acceptance or physical-device testing. Some inherited English UI text still contains German partial-nutrient fallback phrases; it is a localization polish limitation, not lost nutrition data.

The recovered native tests initially caught missing `legacy_import` service metadata and a mistaken version-1 shopping fixture; service metadata was added and the fixture corrected to the actual pinned version 2 without broadening supported versions. A browser regression fixture queried the host's current date for a fixed October-14 mutation; explicit matching-date readback fixed that test without changing runtime behavior. The previous transfer-budget expectation was already reconciled in the recovered worktree and is verified against both server constants and unchanged generic bounds.

## Independent review corrections

The independent read-only review found two additional correctness defects despite its selected tests passing. Both were reproduced RED through authenticated native transports and corrected with GREEN regressions:

- Conflicting non-null `carbs`/`carbohydrates` declarations were formerly accepted by recipe creation/update and legacy import, but the resulting historical snapshot was rejected by restore. A shared declaration check now rejects conflicts before normal writes, legacy conversion, scaling and full restore; equal aliases remain accepted. Native tests assert zero Saves and unchanged disk for refusal, then create → log → backup → restore for equal declarations.
- A sparse root at the ordinary-data cap could omit default collections that adoption/export later added without charging their bytes. Restore now materializes the complete canonical root and serializes validated decoded entries/ledger before its final budget check and Save. This also charges integer-to-float nutrient serialization and timestamp normalization before adoption; nested historical snapshots remain unchanged. Real 64 MiB native regressions cover both sparse empty roots and populated integer-valued history, reject overflow without a Save, accept exact-cap canonical forms, compare serialized disk/model/export equality rather than int/float-insensitive dictionary equality, restore downloaded backups, reload Store and check byte-identical replay.

## Remaining limits

No production Home Assistant changes, installation, publication, commit or push were performed. No CI-provider hassfest/HACS result is claimed by these local checks. No historical third-party formats beyond the pinned contracts are silently accepted. Raw private/synthetic backups, auth storage and runtime configuration are not distributable evidence; keep them out of packages. Independent review status is recorded separately with the exact candidate hashes.
