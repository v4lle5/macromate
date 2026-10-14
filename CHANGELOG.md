# Changelog

## Unreleased

- Added an optional local dashboard card with a calorie-balance ring, macro progress, meal-group summaries and a link to the existing diary.
- Dashboard resource setup is explicit; the card uses the existing administrator-only diary API without additional credentials or fixed entity IDs.

## [0.3.0] — local development build

- Added automatic calorie/macro goals and MacroMate's food, portion and diary model. No proprietary food database is included.
- Profile-based onboarding and safe v1 config migration; Garmin sources optional, explicit fallback/source policy and dated goals.
- Local reusable foods, extensive typed nutrients, per100 labels, named servings, favorites/recent/custom search and optional read-only Open Food Facts lookup with license metadata.
- Local responsive sidebar panel, camera/image EAN decoding and bundled ZXing fallback. Physical mobile cameras and Safari remain unverified.
- Immutable food-entry label snapshots, diary CRUD/copy, exact barcode preservation and separate product/entry/request IDs.
- Persistent bounded idempotency ledger, staged atomic persistence, private admin-only WS/actions and no detailed diary sensor attributes.
- HTTPS-default agent client, no redirects, sanitized transport errors and retry IDs for all mutations.
- Breaking safety change: clear_day now requires explicit date and confirm true; CLI clear-day requires --date and --confirm.
- Domain, existing meal IDs/storage, entity unique IDs and canonical branding retained. Local frontend is bundled with the HACS-shaped component.
- Unit, real HA boundary and browser/decoder verification added. No automatic publication or production deployment.

## [0.2.0]

- Garmin weight, active calories and optional BMR sources, weight-based fallback and local diary actions.
- Authenticated agent CLI and initial HACS-shaped packaging.
- Earlier retry guarantees were incomplete; v0.3 introduces a durable operation ledger.

## [0.1.0]

- Local meal/macro/day-goal/sensor MVP.
