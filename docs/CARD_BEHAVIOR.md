# Dashboard behavior and troubleshooting

MacroMate is a full dashboard card in Home Assistant's **Panel (single card)** view, not a new sidebar application. The nutrition pane owns its vertical scrolling inside the bounded application body. The status banner and application share the same available height, including short landscape viewports.

## Appearance

**Glass Wave** is an optional light theme in Settings → Appearance → Colour theme. Existing themes and saved preferences are unchanged unless explicitly selected. The main application background is transparent so the dashboard background remains visible. Cards use `rgba(253, 248, 239, 0.72)`; dialogs use warm paper `#F9EFDA`. Accent, text and secondary text are `#416F8F`, `#263B47` and `#53666E`; semantic success, warning and error colors are `#576C65`, `#C19A3F` and `#B46F52`. There is no new gradient, blur or backdrop filter. Active segmented controls use white text and touch-sized targets. The explicit
retry button and nested planner add buttons have at least 44 × 44 CSS-pixel
targets, verified through the installed native panel. Existing photo-caption
legibility and functional calorie-ring gradients are retained; no additional
decorative gradient is introduced.

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
