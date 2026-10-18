# Frontend upgrades and immutable release retention

MacroMate serves an entire frontend graph at
`/macromate-assets/releases/<sha256>/`. The loader, card, editor, split JavaScript
chunks, styles, images, scanner/decoder and license files belong to that graph.
The current entry is recorded in `frontend/delivery-manifest.json` and its
installable counterpart under `custom_components/macromate/frontend/`.

## Why complete history must ship

An already open Home Assistant document retains its registered custom elements
and imported ESM modules. Opening the visual card editor later calls the **old
card's** relative `import('./macromate-card-editor.js')`. Updating the current
entry URL does not change that import. If the update removed the old release
folder, the import returns 404 even though a fresh browser can load the new
editor. The same applies to unrequested locale chunks and decoder modules.

Do not fix this with a root query parameter, a copied editor alone, a redirect,
or new bytes under an old digest. Old and new complete graphs must coexist.

## Retention policy: keep all published graphs

`frontend/retained-releases.json` is the checked-in inventory of **every file and
SHA-256 in every retained release**. It is mirrored in the installable component.
The delivery builder validates the exact directory inventory and bytes before
publication. It fails on a missing graph/file, changed bytes, extra files,
unrecorded directories or missing inventory. It never repairs history by
rebuilding old URLs from current sources, and a no-op build does not rewrite
immutable files.

Publication is append-only. There is **no age-based, count-based or disk-based
automatic eviction**. Repeated builds, clean checkouts, release archives and
clean HACS/component replacements must carry the entire retained graph set,
not just the latest manifest's files. Build inputs must include the checked-in
history. A clean build is not permission to delete `frontend/releases/`.

This intentionally grows the distributable with each distinct graph. Browsers
can remain open indefinitely, and neither HTTP cache expiry nor time since
publication proves that no client still references an old graph. There is no
safe automatic deletion threshold. Any future removal requires an explicit
breaking support-policy decision, release notes and an agreed client migration;
it is not part of this builder. A security issue in a historical asset may
require such an explicit decision rather than retaining it silently forever.

For the first retention-aware release, the complete preceding published graph
was recovered from its original Git revision and each file checked against its
original delivery manifest. This is exact historical input, not an alias of the
current build. Future releases accumulate automatically.

## Build and package gates

Use the pinned Node/build/test dependencies documented for the unified frontend:

```sh
node tests/frontend/macromate-unified-build.mjs
node --test tests/frontend/macromate-delivery*.test.mjs
node --test tests/frontend/macromate-unified-build.test.mjs
```

After rebuilding, mirror the **complete** development `frontend/` into
`custom_components/macromate/frontend/`, retaining all release directories and
copying the inventory and both manifests. Never regenerate an old release from
the mutable source tree. The build intentionally leaves package synchronization
as a separate gate; successful development compilation is not an installable
artifact. Before publication, run:

```sh
python -m unittest discover -s tests -p test_unified_packaging.py -v
node --test tests/frontend/macromate-artifact.test.mjs tests/frontend/macromate-delivery.test.mjs
python tests/ha/native_unified_browser.py
```

The warm-browser regression is included in the CI `*.test.mjs` command. It loads
the original published A card without requesting its editor, runs the real
builder to publish B, replaces the served component asset directory, and then
opens and changes A's editor in Chromium. It repeats B → C with another
unrequested editor; old/new delayed modules and every graph file are checked
over HTTP, including JavaScript MIME and hashes. It also checks that builds
never rewrite historical files. Set `HA_PYTHON` to the pinned HA interpreter to
run this regression against Home Assistant's real `HomeAssistantHTTP` static
server (CI does this). Without it, the test uses a small Node HTTP fallback.
Both use ephemeral loopback listeners and no credentials or screenshots. This
native-static harness is not an integration lifecycle or authenticated-app
test. The separate native HA acceptance checks every
installed asset through the integration's actual static route and exercises the
current app through native transport. Packaging equality covers every file in
both directions, not just the root card.

Reproducibility tests compare retained graphs, inventory, loaders and current
output across relocated checkouts and clean dependency installations.

## Publication ordering and interruption

The delivery builder serializes publication with an exclusive local lock,
constructs a new graph in a sibling staging directory, and renames the complete
graph into place before atomically replacing inventory and current pointers.
Existing release directories never move. Individual pointers are atomic;
there is no cross-file transaction or zero-downtime live build guarantee.
Build in an isolated checkout and package only a completed, verified snapshot,
not a directory being actively built or served.

If the process is killed, inspect the lock/staging directory and compare disk
history with the last committed inventory. A rename may have completed before
inventory publication. The next build refuses unknown/missing history rather
than deleting it. Recover the exact complete graph/inventory from verified
build output or Git; only remove a task-owned abandoned lock/staging directory
after establishing no publisher is active. Do not delete history or weaken
hash checks just to make a build pass.

## Safe installation

Publish and install the **whole verified component**, including retained graphs
and `retained-releases.json`. Before updating production, verify the installable
archive contains the same complete asset inventory and hashes as the reviewed
checkout. Use the normal integration/HACS update and full Home Assistant restart
when Python changed; do not delete/re-add the integration or edit stored data.
After installation, read back both the old and current editor URLs: each must
return 200 with a JavaScript MIME type and its recorded hash. Verify other graph
files too, not only the editor.

Already open clients can continue using their complete old graph. New documents
use the current graph. Loading competing releases in a single document still
triggers the existing visible registration-conflict message; reloading that
page selects the new release. The loader does not replace custom-element
constructors in place. If an old editor import already failed before the fixed
update, a page reload may still be necessary because browsers retain failed
module state. This is not an alternative to retaining old assets.

This delivery policy does not guarantee indefinite old-frontend/new-backend API
compatibility, offline availability, third-party proxy behavior or physical
camera/scanner behavior. It guarantees that retained immutable asset URLs are
not silently removed or changed by normal frontend builds and packaging.
