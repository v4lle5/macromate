# Dashboard behavior and troubleshooting

MacroMate is a full dashboard card in Home Assistant's **Panel (single card)** view, not a new sidebar application. The nutrition pane owns its vertical scrolling inside the bounded application body. The status banner and application share the same available height, including short landscape viewports.

## Appearance

**Glass Wave** is the application's only theme. Settings → Appearance offers
Light, Auto (system preference) and Dark, plus small, medium and large text.
Saved choices from removed palettes become Glass Wave when account preferences
are loaded; language, units, text size and unrelated preferences remain intact.
This normalization does not write settings until the user saves a change.
Obsolete shared browser-local settings are not imported across accounts.

The interface shares typography, color, spacing, focus and control tokens.
Warm light surfaces and deep blue dark surfaces provide an opaque reading
background independent of the Home Assistant dashboard. Translucency is used
on supporting surfaces; labels and secondary text retain readable contrast.
Primary controls have 44-pixel touch targets and visible keyboard focus;
recipe tiles open with Enter or Space. The planner can scroll horizontally on
narrow screens to keep day columns readable. Text sizes are 14, 16 and 18 pixels,
with the same setting applied to nutrition forms and recipe components.

`tests/frontend/macromate-unified-contrast.mjs` measures rendered labels,
placeholders and controls across recipes, planning, timers, nutrition, settings
and import forms in light, dark and automatic appearance. These checks require
at least 4.5:1 text contrast and include alpha-composited surfaces across shadow
roots. Image captions and gradients are outside these solid-color measurements.
Responsive checks include 320-pixel phones with large text.

Locale strings are plain text, not HTML entity fragments. Rendering continues to use Lit text bindings and DOM text nodes; no general HTML decoding or unsafe HTML insertion is needed for ampersands.

## Settings save outcomes

Settings use the authenticated native Home Assistant WebSocket command and the shared durable preferences transaction. A successful reply clears pending state. A definitive validation or authorization rejection is not presented as uncertain acceptance.

A missing/failed response after a mutation can still mean the write committed. In that case, do **not** submit a new request. The banner is localized in German and English. It exposes only the operation and an allowlisted diagnostic category (for example `preferences_update: storage_unavailable` or `transport_or_response`), never raw server messages, credentials or preference contents. Read back settings first when possible. The explicit same-request retry preserves the original UUID and payload; no automatic write retry is performed.

Ordinary language, units and theme changes were exercised on disposable native Home Assistant with independent Store and HTTP readback. The originally reported spontaneous settings warning could not be reproduced on that runtime; it must not be described as a confirmed transport/payload root-cause fix. The native acceptance additionally deliberately loses a genuine committed reply to prove the distinction and the replay guarantee.

## Shopping removal

The internal shopping component, navigation, recipe/weekly-plan transfer controls and frontend transfer bridges are removed. Shopping operations are not offered by the generic card action forms, and the backend no longer advertises or accepts their retired descriptors. The dashboard neither loads shopping records nor writes them. Bring! remains a separate integration; no new Bring! connection is implemented.

This frontend retirement does not delete or migrate historical shopping data. The backend registry and transports are retired too; only inert backup/restore and historical decoder compatibility remain. Historical feature-inventory rows explicitly mark the retired UI rather than claiming it still works.

## Reproducible acceptance

`tests/ha/native_unified_browser.py` installs the packaged component into an isolated, ephemeral Home Assistant 2026.10.1 runtime. Synthetic users/data and loopback HTTP/WebSocket listeners are used; no production credentials or live instance is involved. The browser uses the actual Lovelace panel view and editor. It checks desktop, mobile portrait and mobile landscape, wheel and Chromium touch gestures, access to the last diary edit control, scrolling to the final barcode controls, native settings success/refusal/lost-response replay, Glass Wave persistence and absence of shopping navigation/actions/requests. Desktop/mobile captures are private test artifacts, not evidence of a physical-device run.

`tests/frontend/macromate-unified-verify.mjs` retains nutrition, recipe, planner, timer, editor, context-invalidating read, event-before-response and idempotency regressions. Tests of retired shopping UI have been replaced with removal contracts; backend retention/security tests remain separate. After any rebuild, mirror the complete frontend (removing obsolete generated chunks) and run the unfiltered installable-asset equality tests before native acceptance.
