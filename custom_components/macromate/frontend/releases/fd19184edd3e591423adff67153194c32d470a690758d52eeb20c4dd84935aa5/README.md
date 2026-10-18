# MacroMate dashboard assets

Home Assistant serves this directory at `/macromate-assets/` and automatically
loads `macromate-card.js`. Add **MacroMate** through the visual card picker in a
dashboard view configured as **Panel (single card)**. No separate sidebar menu
or `macromate-panel` element is registered.

`nutrition-base.js` is an unregistered implementation base for the full card's
`mm-nutrition` component, not another UI entry point. It retains diary forms,
food search, camera/image decoding, nutrient handling and connection cleanup.
Its focused browser fixtures register a test-only element. Internal navigation
in the complete card remains supported.

The existing HA connection supplies authenticated HTTP/WS access; these assets
never request, persist or log bearer tokens. Private data is not static content.
Build the unified frontend with the controlled pinned build dependencies and
mirror the **complete** output into the installable component before native
acceptance. See `docs/DASHBOARD_CARD.md` and `tests/frontend/macromate-unified-build.mjs`.
