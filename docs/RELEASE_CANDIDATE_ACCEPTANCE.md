# Combined release-candidate acceptance

This is source/build acceptance, not a production deployment or credential
activation. No real Home Assistant instance or production token was used.
The published commit and its GitHub Validate run identify the exact candidate;
this document does not claim a tagged release.

## Current local execution

Environment: Python 3.14.2, Home Assistant 2026.10.1, frontend 20260930.3,
Node 24.11.1, Chromium on Linux. Data, users and credentials were synthetic;
HTTP listeners used loopback and ephemeral ports.

| Gate | Actual result |
| --- | --- |
| Pure suite, Python 3.11 with Pillow | 284 collected, 47 optional HA/provider skips, no failures |
| Full top-level suite with pinned HA environment | 284 passed, no skips |
| Native HA suite (`unittest discover -s tests/ha -v`) | 176 passed |
| Frontend `node --test tests/frontend/*.test.mjs` | 87 passed, no skips |
| Unified verification driver | All 12 commands exited 0 |
| Installable frontend browser/card/artifact rerun | 76 passed, no skips |
| Installed native full dashboard and shipped-client acceptance | 16 browser scenarios passed; native report `ok=true` |
| Compilation | `compileall` succeeded |

Counts overlap and must not be added as unique scenarios. The native count
changed because retired shopping behavior tests were replaced by denial and
historical-preservation tests, rather than kept as operational shopping tests.
The unified driver's preliminary equality omission is not the final gate:
unfiltered asset equality and installed-package checks passed separately.
Build tests compare clean dependency installations and relocated checkout roots,
including generated filenames, bytes, notices and manifests.

## Verified boundaries

- Shopping descriptors, native services, WS commands, recipe/plan transfers,
  configuration/catalog and legacy-shopping upload paths are retired. The SDK
  refuses retired names before HTTP. There is no Bring! adapter.
- Historical shopping records, IDs, ACLs, preferences, legacy metadata and media
  remain in private full backups. Native load, unrelated mutation, restore and
  independent restart readback preserve them. Dormant schemas/catalog decoders
  remain compatibility code, not a callable shopping subsystem.
- The old standalone sidebar entry and diary-only panel module are absent.
  Static assets, automatic loading, visual picker/editor and the actual native
  Lovelace Panel view remain functional.
- Nutrition wheel/touch scrolling reaches the last diary edit and final barcode
  controls at desktop, phone portrait and landscape sizes. Pending-write banners
  share the bounded viewport. German ampersands render as text.
- Glass Wave retains its exact optional palette, translucent card surfaces and
  transparent application background. No blur or added decorative gradients.
  Existing photo-caption and functional calorie-ring gradients remain.
- Native RED probes measured retry at 35px high and planner add at 18px high.
  After their separate fixes, installed-panel assertions require both target
  dimensions to be at least 44px; explicit interaction also passes.
- Scoped credentials are registered by production lifecycle hooks, without
  implicit minting. Fresh processes prove acceptance, reload/revocation, then
  continued denial after another restart. Restricted credentials cannot
  authenticate to ordinary HA REST, services or WebSocket authentication.
- Default scopes cover recipe/plan/diary read/create/update; deletes are separate
  opt-ins. This delegates the issuer's **global MacroMate dataset**, not a
  person-private partition. Shopping, HA administration, import and backup/restore
  are outside the scoped facade.

The independently focused auth remediation approval applies to these unchanged
module bytes, not to an independent whole-product security approval:

- `agent_api.py`: `97279cbfa1c81ae6684d0750c04d4df999dc317026e7cf6acd01be14182a721d`
- `agent_auth.py`: `e54155348eacb11889b2720f6b95c7d93dd8f03a04c5530a4b87be4b65c369e1`

## Settings limitation and remaining gates

Ordinary native language/unit/theme saves, definitive rejection with unchanged
Store, and deliberate loss of a genuinely committed reply all pass. Explicit
replay uses the identical request ID and payload without duplicate persistence;
there is no automatic write retry. **The originally reported spontaneous
settings warning was not reproduced; its root cause remains unconfirmed.**
Do not describe controlled reply-loss acceptance as fixing that original cause.

Native teardown verified zero remaining/persisted refresh tokens and connection
refusal after stop. HA/aiohttp warnings and intentional storage fault-injection
tracebacks occur in successful tests; this is not a warning-free HA-shell claim.
Screenshots are synthetic local evidence, not physical-device or Safari testing.
Production installation, activation and a tagged release remain separate,
unauthorized steps. Final publication acceptance also requires all five GitHub
Validate checks on the exact pushed commit to complete successfully.
