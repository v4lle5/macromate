# MacroMate frontend verification

## Result

- Full Node/Chromium suite: **22 passed, 0 failed** (`macromate-chromium.xml`).
- Firefox-selected browser suite: **13 passed, 0 failed** (`macromate-firefox.xml`). Twelve cases run in Firefox; the explicitly named virtual-camera case deliberately launches Chromium. Both suites assert no unhandled browser JavaScript errors.
- Real bundled decoder output from generated image pixels: EAN-13 `4006381333931`, leading-zero EAN-13 `0012345678905`, EAN-8 `96385074`.
- Actual Chromium `getUserMedia` virtual-camera video frames decoded to `4006381333931` with `BarcodeDetector` disabled; captured stream tracks were `ended` after the result. Image-upload UI also decoded real pixels before making the synthetic HA barcode request. Decode results were not stubbed.
- Scoped runtime/source/dependency/license checks pass; full scratch npm audit returned no known vulnerabilities. Dependencies were installed with scripts disabled and exact pins/lockfile integrity; package-intelligence wrapper lookups timed out and are not claimed as completed verification.
- Screenshots `macromate-mobile.png` (390 px viewport) and `macromate-desktop.png` (1280 px viewport) are actual browser captures, visually inspected. Long escaped external product text wraps, controls remain readable, and search/checkbox layout was corrected.

## UI coverage

HA-local today and historical date navigation, no invented historical goal; unknown nutrient display; manual local/online text search and favorites/recent/custom filters; detail fetching and XSS escaping; ml serving quantity and favorite template; quick logging with total nutrition; edit/copy/confirmed-delete for both quick and food entries; snapshot-based food editing without fetching current food; per100 custom food form and named portion; extended mg/µg nutrients; exact-token GTIN validation; scanner image input; camera permission/insecure-context errors; late permission cleanup; panel disconnect cleanup; uncertain-write explicit retry with original payload/request ID and sanitized modal errors; admin denial; in-flight date mutation lock and stale response suppression.

The yellow fixture banner and `<img ...>` product name are deliberate synthetic QA data, not a real HA user diary or unescaped HTML.

## RED → GREEN evidence

Vertical slices were executed test-first, not implemented as a single untested batch. Observed RED failures included missing client module, missing diary element, missing search/portion controls, missing quick/edit controls, missing custom-food button, missing scanner module/class, unreleased live camera track on disconnect, modal retry button absent, missing extended-nutrient inputs and wrapped mobile action labels. The leading-zero pixel regression specifically returned **`012345678905` instead of `0012345678905`** before replacing the generic ZXing reader with explicit EAN readers. A later artifact test found the missing `.LEGAL.txt`; the build now explicitly preserves ordinary upstream license headers which esbuild does not automatically treat as legal comments. Each failing slice was rerun GREEN; XML files are the final executable verification, not reconstructed historical logs.

## Limits / blockers

- No physical camera, Android/iOS hardware, or mobile Safari execution was available. Virtual camera and generated images do not establish hardware autofocus, lighting or physical-device performance.
- Playwright WebKit downloaded but could not launch because host shared libraries are missing (including GTK4, Graphene and GStreamer/WebKit dependencies). No system packages were installed. Therefore there is no Safari/WebKit pass claim.
- The HA transport in these browser tests is an explicit isolated synthetic `hass.callWS` fixture. End-to-end against the parent's actual HA runtime/static registration remains the integration owner's acceptance check. No live deployment was performed.
- Pending logical writes are kept only in panel memory, not across reloads; inspect the diary before re-submitting after closing a page with an uncertain write.

Only `frontend/*` and `tests/frontend/*` were changed in the repository by this worker. Canonical brand directories and backend code were not edited; there were no commits, pushes or deployments.
