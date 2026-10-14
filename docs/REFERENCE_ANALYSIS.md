# MacroMate nutrition model

MacroMate implements local nutrition tracking with optional Open Food Facts lookup. This note describes its own data and behavior contracts.

## Foods and portions

- Product identities are separate from diary-entry and request identities.
- Foods have a name, optional producer, explicit g/ml base unit, declared nutrients, product-specific named servings and barcode strings.
- Product nutrition is normalized per one base unit. Label input per 100 g/ml is converted once; diary totals scale by the selected amount.
- Quick entries contain total nutrition. Missing values remain distinguishable from explicitly declared zero.
- Four meal categories are supported: breakfast, lunch, dinner and snack.
- Favorites retain preferred portion information; recently consumed foods and reusable custom foods are separate concepts.
- Barcodes remain exact strings, including leading zeros. Lookup requires supported ASCII GTIN syntax and a valid check digit.
- Immutable product snapshots preserve historical nutrition after later product edits.

## Goals and activity

- Goal calculation uses profile inputs, monthly age, activity-category factors, a signed weekly weight-change adjustment and a target-weight BMR floor.
- Macro goals use explicit energy shares and conversion factors; declared food-label energy is stored independently.
- Adjustment stops at or beyond the target weight.
- A usable current daily active-energy source replaces the PAL budget instead of adding overlapping activity. Source freshness and fallback behavior are explicit.
- HA-local dated snapshots preserve historical goals. Missing historical snapshots do not borrow today's recommendation.

## Storage, access and data sources

- Records, favorites, dated goals and bounded request history share atomic local persistence.
- Private commands require administrator access; bulk day deletion additionally requires an explicit date and confirmation.
- Open Food Facts records retain their source and separate data-license attribution. Provider coverage and community data accuracy are not guaranteed.
- Declared-only aggregates carry missingness information; incomplete consumed/balance sensors are unavailable rather than apparent exact totals.

AI, recipes and fasting are excluded. Private analysis material, application binaries, secrets and third-party proprietary databases are not distributed with the integration.
