# MacroMate 0.4.0 acceptance

Validated on 2026-10-18 against the changes based on `5145c6b`.
Runtime: Python 3.14.2, Home Assistant Core 2026.10.1, frontend 20260930.3,
Node 24.19.0 and Playwright 1.56.1 Chromium headless shell. CI pins Node 24.11.1.
All data, accounts, camera frames and HTTP servers were disposable test fixtures.

| Check | Result |
| --- | --- |
| Ruff lint and Python formatting | Pass |
| Pinned Prettier, 45 mutable JS/CSS sources | Pass |
| General Python suite | 287 passed |
| Native HA Python suite | 192 passed |
| Branch coverage, all integration Python and tools | 88%; required minimum 85% |
| Complete Node test glob | 100 passed |
| Unified build, adapters, connected workflows and upgrade suite | Pass |
| Installed integration with actual HA/Lovelace and browser | 18 scenarios passed |
| Development/installable frontend inventories and bytes | Equal |
| Previously published immutable release graphs | Preserved byte for byte |

Native acceptance includes profile creation through the UI, an owner's private
write, calendar reports, removal of private DOM after access revocation, default
diary isolation, read-only account refusals, exact uncertain-write replay,
backup/restore, native settings, desktop/mobile/landscape layout and published
frontend upgrades. No unhandled page errors or unexpected external requests were
observed. Cleanup removed all temporary refresh tokens and stopped the HA server.

Additional regression tests exercise low-level credential disk failures,
read-only/stopping storage, credential deletion, legacy recipe sugar migration,
unavailable wearable readings, source freshness, concurrent default/person
writes, profile reload/restore validation, and server timer scheduling, outbox
replay, retry and unload cancellation without an open browser.

## Synthetic storage comparison

One transaction over 10,000 entries plus 8 MiB of inert media on the same host:

| Revision | Transaction | Maximum heartbeat delay |
| --- | --- | --- |
| Original `5145c6b` | 216 ms | 202.70 ms |
| Updated implementation | 227 ms | 50.20 ms |

This is a reproducible diagnostic workload, not a throughput guarantee or a
measurement on Raspberry Pi hardware. Atomic whole-dataset storage remains in
use; staging, validation and JSON serialization now run outside the HA loop.
Diary local-day indexes also avoid repeated full scans within one loaded log.

## Reproduction and limits

Follow [CONTRIBUTING.md](../CONTRIBUTING.md), then run `python tools/check.py`.
Use `python tools/benchmark_storage.py --entries 10000 --media-mib 8` for the
synthetic comparison. Checks write captures to private temporary directories.

This acceptance does not establish physical camera, Safari/iOS, mobile push or
older Home Assistant compatibility. Server timers use HA persistent
notifications; automation events carry a stable ID for consumer deduplication.
Named profiles do not create profile-bound delegated agent credentials; see
[scoped access](SCOPED_AGENT_ACCESS.md). No production installation or deployment
was changed by these checks.
