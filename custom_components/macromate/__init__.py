"""MacroMate: local nutrition diary, optional open food data and private panel."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

from .const import DOMAIN, PLATFORMS
from .migration import async_migrate_entry  # HA discovers this public lifecycle hook.

SERVICE_ACTIONS = {
    "list_meals":"diary", "log_meal":"log_meal", "update_meal":"update_meal",
    "delete_meal":"delete_meal", "clear_day":"clear_day", "copy_meal":"copy_meal",
    "search_foods":"search_foods", "get_food":"food", "lookup_barcode":"barcode",
    "save_food":"save_food", "set_favorite":"favorite", "log_food":"log_food",
    "update_food_entry":"update_food_entry",
}
READ_ACTIONS = frozenset({"diary","search_foods","food","barcode"})


def _settings(entry) -> dict[str, Any]:
    return dict(entry.options) if entry.options else dict(entry.data)


def _parse_datetime(hass, value: str | datetime | None):
    from homeassistant.util import dt as dt_util
    from .time import localize_wall_time
    if value is None:
        return dt_util.utcnow()
    parsed = value if isinstance(value,datetime) else dt_util.parse_datetime(value)
    if parsed is None:
        raise ValueError("invalid datetime")
    return localize_wall_time(parsed,hass.config.time_zone)


async def async_setup(hass, config) -> bool:
    """Register stable actions once, even before an entry has loaded."""
    import voluptuous as vol
    from homeassistant.core import SupportsResponse
    from homeassistant.exceptions import ServiceValidationError
    from homeassistant.helpers.service import async_register_admin_service
    from .food_provider import ProviderUnavailable
    from .websocket import async_register
    async_register(hass)

    def handler_for(action):
        async def handle(call):
            entries = hass.config_entries.async_loaded_entries(DOMAIN)
            if not entries:
                raise ServiceValidationError("MacroMate ist nicht eingerichtet")
            try:
                result = await entries[0].runtime_data.async_command(action,dict(call.data))
            except KeyError as err:
                raise ServiceValidationError("Eintrag oder Lebensmittel nicht gefunden") from err
            except (ValueError,TypeError) as err:
                raise ServiceValidationError(str(err)[:240]) from err
            except PermissionError as err:
                raise ServiceValidationError("Online-Lebensmittelsuche ist nicht freigegeben") from err
            except ProviderUnavailable as err:
                raise ServiceValidationError("Open Food Facts derzeit nicht erreichbar") from err
            except OSError as err:
                raise ServiceValidationError("Speichern fehlgeschlagen; dieselbe request_id beibehalten und Status prüfen") from err
            return result if call.return_response else None
        return handle

    for service,action in SERVICE_ACTIONS.items():
        async_register_admin_service(hass,DOMAIN,service,handler_for(action),
            schema=vol.Schema(dict),
            supports_response=SupportsResponse.ONLY if action in READ_ACTIONS else SupportsResponse.OPTIONAL)
    return True


async def _async_panel(hass) -> None:
    """Serve public code only. Private diary data uses the authenticated WS API."""
    if not getattr(hass,"http",None):
        return  # A deliberately headless HA runtime does not have a panel.
    from homeassistant.components import frontend,panel_custom
    from homeassistant.components.http import StaticPathConfig
    runtime = hass.data.setdefault(DOMAIN,{})
    if not runtime.get("assets_registered"):
        await hass.http.async_register_static_paths([
            StaticPathConfig("/macromate-assets",str(Path(__file__).parent / "frontend"),False)
        ])
        runtime["assets_registered"] = True
    if not frontend.async_panel_exists(hass,DOMAIN):
        await panel_custom.async_register_panel(hass,frontend_url_path=DOMAIN,
            webcomponent_name="macromate-panel",sidebar_title="MacroMate",sidebar_icon="mdi:food-apple-outline",
            module_url="/macromate-assets/panel.js",embed_iframe=False,trust_external=False,
            require_admin=True,config={"version":"0.3.0"})


async def async_setup_entry(hass,entry) -> bool:
    from .coordinator import MealTrackerCoordinator
    runtime = MealTrackerCoordinator(hass,_settings(entry))
    await runtime.async_load()
    entry.runtime_data = runtime
    await runtime.async_record_goal()
    entry.async_on_unload(runtime.async_start())
    await hass.config_entries.async_forward_entry_setups(entry,PLATFORMS)
    await _async_panel(hass)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def _async_reload(hass,entry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass,entry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry,PLATFORMS)
    if unloaded:
        from homeassistant.components import frontend
        if frontend.async_panel_exists(hass,DOMAIN):
            frontend.async_remove_panel(hass,DOMAIN)
    return unloaded


async def async_remove_entry(hass,entry) -> None:
    """The user removing this integration also removes its private local dataset."""
    from homeassistant.helpers.storage import Store
    from .const import STORE_KEY,STORE_VERSION
    await Store(hass,STORE_VERSION,STORE_KEY).async_remove()
