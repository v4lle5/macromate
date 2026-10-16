# MacroMate dashboard card

One local Home Assistant card for recipes, shopping, weekly planning, cooking timers and nutrition. The nutrition pane retains the calorie ring, macro overview, food database, scanner and diary editing. The original compact read-only overview remains available explicitly with `mode: summary`.

This is a development candidate. A local checkout is not automatically published, installed or registered in a dashboard. Do not delete/re-add an existing integration as an upgrade procedure.

## Preview

Actual Chromium captures from a disposable Home Assistant 2026.10.1 instance. All diary data is synthetic; these are not household screenshots or proof of physical-device/Lovelace-editor acceptance.

<img src="images/macromate-unified-light.png" alt="Combined MacroMate mobile nutrition pane with retained calorie ring and explicitly incomplete macros; synthetic data" width="300">
<img src="images/macromate-unified-dark.png" alt="Combined MacroMate desktop workspace in a dark theme; synthetic data" width="640">

## Install the complete integration first

1. Back up HA and the existing MacroMate configuration/storage.
2. Copy the complete `custom_components/macromate` directory into `/config/custom_components/macromate`, including every frontend chunk, source adapter, notice and brand asset. Do not copy only `app.js` or the two root card files.
3. Restart Home Assistant and retain the existing integration entry. Complete its profile/options if necessary. HACS can download this candidate only after a corresponding revision is actually published.

The tested framework is HA 2026.10.1 / Python 3.14.2. No npm server, separate recipe/shopping integration or additional runtime custom-card dependency is required. Optional remote lookups/imports need explicit consent. Camera access requires HTTPS or localhost and browser permission.

## Register the resource

Enable advanced mode in your HA user profile if Resources is hidden. Open **Settings → Dashboards → three-dot menu → Resources** and add:

- URL: `/macromate-assets/macromate-card.js?v=unified1`
- Type: **JavaScript module**

Keep one registration. Updating the integration does not register the resource automatically. In YAML-mode dashboards use the equivalent resource entry instead of registering it twice:

```yaml
resources:
  - url: /macromate-assets/macromate-card.js?v=unified1
    type: module
```

Add a **Manual** dashboard card:

```yaml
type: custom:macromate-card
```

For the original read-only calorie/macro/meal-group overview:

```yaml
type: custom:macromate-card
mode: summary
```

The default combined card is editable according to server permissions. Home Assistant supplies authentication; no entity IDs or extra bearer token are needed in card configuration.

## Permissions, data and connected workflows

Private nutrition, recipes and planning require an administrator. Shopping members see only authorized records and cannot assume ownership or administer global regions. A read-only HA identity cannot mutate data. Dashboard placement does not grant access; the server enforces permissions for both UI and agents.

Recipe/plan → shopping is an explicit atomic transfer, with original ingredient indexes and exact selected catalog IDs. Adding a plan does not silently log calories. Recipe → diary logging is a separate confirmed portion operation; saved nutrition snapshots survive later source edits/deletion. Unknown nutrients stay unknown, not zero. Incomplete totals do not imply exact progress, and over-goal intake is distinct from calories remaining.

The combined interface includes dedicated workflows and **All actions**, whose schema forms cover advanced fields as explicit JSON. Placeholder Cookbook/Sync/Help navigation that was inert upstream stays disabled; it is not a functioning sync service. Recipes/shopping/card share the integration's state, rather than running independent embedded integrations.

Refresh events coalesce. Safe list metadata can refresh while a recipe editor is dirty; protected recipes/dates/drafts/focus are retained. Uncertain mutations retain their exact request and UUID for explicit retry only. Identity changes/removal clear private UI state and release subscriptions, cameras and object URLs. Private recipe photos use authenticated local media routes; barcode camera frames are decoded locally, not uploaded for recognition.

## Verification and limits

The local candidate has executable coverage for native authenticated HA HTTP/WebSocket CRUD, exact durable Store readback, backup/restore, membership revocation, unknown/zero nutrition and lost-response explicit replay. Frontend checks exercise real barcode pixels/virtual camera frames, source/domain/coordinator workflows, themes, forms and context cleanup. Build tests compare every generated output and both manifests across clean dependency directories and relocated checkouts. Complete source/installable inventories and bytes must match **after** rebuilding and **before** native acceptance.

These are different evidence tiers, not interchangeable claims. The feature inventory is in `UNIFIED_FEATURE_MATRIX.json`; build commands and evidence boundaries are in `../frontend/unified-src/README.md`; agent CRUD/transfer contracts are in `AGENT_API.md`. Local tests are not a GitHub Actions result for an unpublished revision.

Physical cameras, iOS/Safari/WebKit, a full native Lovelace-editor session, live OFF coverage and live Garmin devices remain unverified. Some nutrition summary wording/number formatting still follows German conventions in an English UI. The card is not a medical tool.

## Troubleshooting

- **Custom element missing / 404:** verify the complete installed frontend, configured integration, HA restart and module resource. A version number alone does not prove the files are present.
- **Old UI:** refresh the dashboard/browser cache and keep one resource registration. A partial chunk update is not a valid installation.
- **Permission denied:** use an identity authorized for the exact domain/object; do not bypass server restrictions.
- **Unknown goals:** complete integration profile/options. Missing goals are not an instruction to consume zero calories.
- **Uncertain write:** inspect the exact target before an operator-approved identical-ID retry. Never create a replacement UUID merely to hide uncertainty.
