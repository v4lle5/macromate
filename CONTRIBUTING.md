# Contributing

Use Python **3.14.2**, Node **24.11.1**, and a full Git checkout. Historical
compatibility tests read pinned commits; a shallow clone needs
`git fetch --unshallow` first.

```sh
python3.14 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python tools/check.py --python-only
```

The check command creates private temporary directories, runs Ruff and format
checks, both Python suites, and branch coverage with the configured **85%**
minimum. CI runs the same command. Optional framework-independent checks still
work on Python 3.11 with Pillow installed; that does not establish older HA
compatibility.

For browser/build checks, create dependency directories outside the checkout
and install the pinned manifests without package install hooks:

```sh
export FRONTEND_DEPS=$(mktemp -d)
cp tests/frontend/deps.package.json "$FRONTEND_DEPS/package.json"
cp tests/frontend/deps.package-lock.json "$FRONTEND_DEPS/package-lock.json"
npm ci --prefix "$FRONTEND_DEPS" --ignore-scripts --no-fund
node "$FRONTEND_DEPS/node_modules/playwright/cli.js" install --with-deps chromium

export MACROMATE_BUILD_DEPS=$(mktemp -d)
cp frontend/unified-src/package.json "$MACROMATE_BUILD_DEPS/package.json"
cp frontend/unified-src/package-lock.json "$MACROMATE_BUILD_DEPS/package-lock.json"
npm ci --prefix "$MACROMATE_BUILD_DEPS" --ignore-scripts --no-fund
export CHROMIUM_PATH=$(node -e "console.log(require(process.env.FRONTEND_DEPS+'/node_modules/playwright').chromium.executablePath())")
.venv/bin/python tools/check.py
```

Install FFmpeg for virtual-camera barcode scenarios. `CHROMIUM_PATH` may point
to a matching headless-shell installation. The complete check uses native HA
with synthetic users/data and local HTTP/WebSocket connections. It does not
connect to a household installation.

The full command also checks mutable frontend JS/CSS with pinned Prettier.
Use `node tools/check_frontend.mjs --write` to format those sources; generated
bundles, vendor files and retained releases are excluded.

After a frontend edit, run the controlled build and synchronize the complete
`frontend/` tree into `custom_components/macromate/frontend/` before checking.
Keep every published immutable graph; see
[frontend delivery](docs/frontend-upgrade-delivery.md). Never format or replace
bytes inside a published `releases/<digest>/` directory.

`python tools/benchmark_storage.py --entries 10000 --media-mib 8` measures a
synthetic transaction and heartbeat lag. Compare revisions on the same host.
No real diary or photo is required.

Keep changes reviewable, preserve existing identifiers/history, and test the
observable behavior of calculation, permissions, migration and retry changes.
Do not put credentials or real health data in tests, logs or screenshots.
