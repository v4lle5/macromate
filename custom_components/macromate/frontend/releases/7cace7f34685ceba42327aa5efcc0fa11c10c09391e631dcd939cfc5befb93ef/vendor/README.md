# Pinned local EAN decoder

- Upstream: https://github.com/zxing-js/library
- Package: `@zxing/library@0.21.3` (npm integrity pinned in `tests/frontend/deps.package-lock.json`).
- Bundled transitive dependency: `ts-custom-error@3.3.1`.
- Build tool: `esbuild@0.25.11`, used only in private scratch with lifecycle scripts disabled.
- Runtime entry: `zxing-0.21.3.js`; SHA-256 `420c369125f7ce622f12cd623b72c6fcdf00357f8d7e43af272e45fe2ee980bd`; 53,719 bytes for this checked-in build.
- Build input: `zxing-entry.js`; build command from repo root: `node tests/frontend/macromate-build-vendor.mjs` with `FRONTEND_DEPS` pointing at the installed scratch dependency directory.
- Scope: 41 source modules listed in `bundle-inputs.json`, limited to ZXing's EAN readers/core image processing, ts-custom-error and our adapter. No QR, generic RSS/Code128 readers, text-encoding optional dependency, browser camera controller, npm loader or external network transport is included.

License handling: upstream npm package metadata says MIT, but the distributed `LICENSE` and the imported ZXing source headers specify Apache-2.0 (the upstream license also contains a third-party BSD notice). The complete upstream license is preserved as `ZXING-LICENSE.txt`; original source copyright/license headers remain in `zxing-0.21.3.js.LEGAL.txt`. The ts-custom-error MIT license is included separately. These are unmodified upstream library sources bundled with our separate adapter; no proprietary reference-app code or data is included.

The full scratch install was checked with `npm audit`: no known vulnerabilities returned. Package-intelligence wrapper lookups timed out during install; that is incomplete third-party intelligence, not proof of package safety. npm lockfile integrities, exact package pins and bundled-module inventory are retained. Test-only Playwright/bwip-js and build-tool binaries are not frontend runtime dependencies.
