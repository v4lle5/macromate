"""MacroMate: local nutrition diary, optional open food data and dashboard card."""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from typing import Any

from .const import DOMAIN, PLATFORMS
from .migration import (
    async_migrate_entry as async_migrate_entry,  # HA discovers this public lifecycle hook.
)

SERVICE_ACTIONS = {
    "list_meals": "diary",
    "log_meal": "log_meal",
    "update_meal": "update_meal",
    "delete_meal": "delete_meal",
    "clear_day": "clear_day",
    "copy_meal": "copy_meal",
    "search_foods": "search_foods",
    "get_food": "food",
    "lookup_barcode": "barcode",
    "save_food": "save_food",
    "set_favorite": "favorite",
    "log_food": "log_food",
    "update_food_entry": "update_food_entry",
}
READ_ACTIONS = frozenset({"diary", "search_foods", "food", "barcode"})


def _settings(entry) -> dict[str, Any]:
    return dict(entry.options) if entry.options else dict(entry.data)


def _parse_datetime(hass, value: str | datetime | None):
    from homeassistant.util import dt as dt_util

    from .time import localize_wall_time

    if value is None:
        return dt_util.utcnow()
    parsed = value if isinstance(value, datetime) else dt_util.parse_datetime(value)
    if parsed is None:
        raise ValueError("invalid datetime")
    return localize_wall_time(parsed, hass.config.time_zone)


async def async_setup(hass, config) -> bool:
    """Register stable actions once, even before an entry has loaded."""
    import voluptuous as vol
    from homeassistant.core import SupportsResponse
    from homeassistant.exceptions import ServiceValidationError
    from homeassistant.helpers.service import async_register_admin_service

    from .food_provider import ProviderUnavailable
    from .platform_api import ACTIONS
    from .platform_support import Actor, validate_json
    from .websocket import async_register, require_user_action

    service_actions = {**SERVICE_ACTIONS, **{name: name for name in ACTIONS}}
    async_register(hass)
    from .private_media import register_views

    register_views(hass)
    if getattr(hass, "http", None):
        from .agent_api import async_register_agent_views

        await async_register_agent_views(hass)

    def handler_for(action):
        async def handle(call):
            entries = hass.config_entries.async_loaded_entries(DOMAIN)
            if not entries:
                raise ServiceValidationError("MacroMate ist nicht eingerichtet")
            try:
                if call.context.user_id is None:
                    actor = Actor(None, trusted_internal=True)
                else:
                    user = await hass.auth.async_get_user(call.context.user_id)
                    if user is None or not user.is_active:
                        raise PermissionError("authenticated active user required")
                    require_user_action(user, action, call.data)
                    actor = Actor(user.id, is_admin=user.is_admin)
                result = await entries[0].runtime_data.async_command(
                    action, dict(call.data), actor=actor
                )
                validate_json(result, max_bytes=8388608)
            except KeyError as err:
                raise ServiceValidationError("Eintrag oder Lebensmittel nicht gefunden") from err
            except (ValueError, TypeError) as err:
                raise ServiceValidationError(str(err)[:240]) from err
            except PermissionError as err:
                raise ServiceValidationError(
                    "Kein Zugriff auf diese MacroMate-Aktion oder fehlende Online-Freigabe"
                ) from err
            except ProviderUnavailable as err:
                raise ServiceValidationError("Open Food Facts derzeit nicht erreichbar") from err
            except OSError as err:
                raise ServiceValidationError(
                    "Speichern fehlgeschlagen; dieselbe request_id beibehalten und Status prüfen"
                ) from err
            return result if call.return_response else None

        return handle

    for service, action in service_actions.items():
        options = {
            "schema": vol.Schema(dict),
            "supports_response": (
                SupportsResponse.ONLY if ACTIONS[action]["read_only"] else SupportsResponse.OPTIONAL
            ),
        }
        if ACTIONS[action]["admin_only"]:
            async_register_admin_service(hass, DOMAIN, service, handler_for(action), **options)
        else:
            hass.services.async_register(DOMAIN, service, handler_for(action), **options)
    return True


async def _async_assets(hass) -> None:
    """Serve dashboard code only; never register a standalone sidebar panel."""
    if not getattr(hass, "http", None):
        return  # A deliberately headless HA runtime has no HTTP asset server.
    from homeassistant.components.http import StaticPathConfig

    runtime = hass.data.setdefault(DOMAIN, {})
    if not runtime.get("assets_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig("/macromate-assets", str(Path(__file__).parent / "frontend"), False)]
        )
        runtime["assets_registered"] = True


async def _async_card_resource(hass) -> None:
    """Load the dashboard card like Recipe Manager, without editing Lovelace.

    HA's extra-module API works with both YAML and storage dashboards. It does
    not create a dashboard, view, card or resource record on the user's behalf.
    Headless runtimes deliberately have no frontend module manager.
    """
    from homeassistant.components import frontend

    modules = hass.data.get(frontend.DATA_EXTRA_MODULE_URL)
    import json

    delivery = await hass.async_add_executor_job(
        lambda: json.loads(
            (Path(__file__).parent / "frontend" / "delivery-manifest.json").read_text()
        )
    )
    url = delivery["entry"]
    if modules is None:
        return
    # Entry reloads keep HA's module manager alive. Replace only our generated
    # release loaders so a fresh page cannot race an obsolete automatic module.
    # User-managed Lovelace resources and other extra modules are untouched.
    for registered in tuple(modules.urls):
        if registered != url and re.fullmatch(
            r"/macromate-assets/releases/[0-9a-f]{64}/loader\.js", registered
        ):
            frontend.remove_extra_js_url(hass, registered)
    if url not in modules.urls:
        frontend.add_extra_js_url(hass, url)


async def async_setup_entry(hass, entry) -> bool:
    from .coordinator import MealTrackerCoordinator

    runtime = MealTrackerCoordinator(hass, _settings(entry))
    await runtime.async_load()
    entry.runtime_data = runtime
    await runtime.async_record_goal()
    entry.async_on_unload(runtime.async_start())
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    # HTTP may have become available since a headless async_setup. This hook
    # registers only routes; credentials still require explicit operator minting.
    if getattr(hass, "http", None):
        from .agent_api import async_register_agent_views

        await async_register_agent_views(hass)
    await _async_assets(hass)
    await _async_card_resource(hass)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def _async_reload(hass, entry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass, entry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    return unloaded


async def async_remove_entry(hass, entry) -> None:
    """The user removing this integration also removes its private local dataset."""
    from homeassistant.helpers.storage import Store

    from .const import STORE_KEY, STORE_VERSION

    credentials = hass.data.get(DOMAIN, {}).get("agent_credentials")
    if credentials is not None:
        await credentials.async_remove()
    else:
        await Store(hass, 1, "macromate.agent_credentials", private=True).async_remove()
    await Store(hass, STORE_VERSION, STORE_KEY).async_remove()
