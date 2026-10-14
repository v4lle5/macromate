# Independent reference-app analysis

MacroMate's behavior model was informed by static inspection of the supplied Android artifact, not by YAZIO production API access or execution of the app.

## Provenance

- Reference package: `com.yazio.android`, version `26.41.2`.
- Supplied XAPK SHA-256: `59bd1d7c99cf1376732293978015db863789c4237ba72c33f0868a4136f67a50`.
- Selectively extracted base APK SHA-256: `ff7113943f4ab87ff389e31704b2f3301812d7db0207efbed58df1dcbb7074e2`.
- Actual analysis: REA 6.4.0, headless JADX provider 0.7.1, JDK 21.0.12.1; 108 successful REA operations with retained result hashes and evidence IDs. Seven method observations used the provider's Smali representation rather than relying on incomplete Java output.
- The private evidence index records 42 claims and 53 nutrient enum entries, with energy separate. Raw decompilations, APKs and extracted assets are deliberately not part of the implementation or install package.

## Verified reference behavior used as a functional guide

- Products have identities distinct from diary entries, a name/optional producer, g/ml base unit, declared nutrition, named product-specific serving sizes and barcode strings.
- Product nutrition is normalized per one base unit; logged totals scale by the recorded base amount. Simple/quick entries already represent total nutrition.
- Missing nutrients and declared zero are distinguishable. Energy is not universally reconstructed from macro values.
- Diary meal categories are breakfast/lunch/dinner/snack. Favorites include preferred portion information; recent entries and reusable custom products are distinct concepts.
- The verified barcode path performs a product search, not a proven complete local barcode-database lookup. Its small string heuristic is less strict than MacroMate's independently specified GTIN checksum policy.
- Locally visible goal logic uses monthly age in a Mifflin-shaped BMR expression; PAL values 1.25/1.38/1.52/1.65; signed 750 × kg/week adjustment; target-weight BMR floor; macro goal factors 4.1/4.1/9.3 kcal/g.

## Independent MacroMate choices

- Open Food Facts and locally entered products replace any proprietary food backend. Open data retains its separate licenses and source attribution.
- Immutable food-label snapshots preserve recorded historical nutrition after later product edits.
- HA-local dates, durable bounded idempotency, admin-only private commands, explicit bulk-clear confirmation and declared/missing nutrient metadata form MacroMate's own tested contract.
- A current daily active-energy source replaces the PAL budget rather than blindly adding overlapping activity. Source freshness/fallback is explicit.
- Adult/bounds support policy and stopping after crossing a target weight are MacroMate policies, not claims of exact server parity.

## Unknown or not reproduced

Server search ranking and coverage, full relational server schema/database, moderation/private-public publication rules, remote experiments, every scanner-library symbology, account-specific backend goal changes and universal multi-wearable deduplication were not established by static evidence. MacroMate does not claim a complete clone of those systems.

AI, recipes and fasting are excluded. No reference-app code, bundled databases, brand assets, secret values or private raw evidence are published with this independent implementation.
