"""MarcoMate integration."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from .const import DOMAIN, PLATFORMS


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
    """Register actions independent of config-entry state."""
    import math

    import voluptuous as vol
    from homeassistant.core import ServiceCall, SupportsResponse
    from homeassistant.exceptions import ServiceValidationError
    from homeassistant.helpers import config_validation as cv
    from homeassistant.util import dt as dt_util

    def coordinator():
        entries = hass.config_entries.async_loaded_entries(DOMAIN)
        if not entries:
            raise ServiceValidationError("MarcoMate ist nicht eingerichtet")
        return entries[0].runtime_data

    def failure(err: Exception) -> ServiceValidationError:
        return ServiceValidationError(str(err))

    async def log_meal(call: ServiceCall) -> dict[str, Any]:
        try:
            item = await coordinator().async_create(
                name=call.data["name"],
                meal_type=call.data["meal_type"],
                calories=call.data["calories"],
                protein=call.data.get("protein", 0),
                carbs=call.data.get("carbs", 0),
                fat=call.data.get("fat", 0),
                eaten_at=_parse_datetime(hass, call.data.get("eaten_at")),
                request_id=call.data.get("request_id"),
            )
        except (ValueError, KeyError) as err:
            raise failure(err) from err
        return {"entry_id": item.id}

    async def list_meals(call: ServiceCall) -> dict[str, Any]:
        requested = call.data.get("date") or dt_util.now().date().isoformat()
        try:
            day = date.fromisoformat(requested)
            summary = coordinator().summary(day)
        except (TypeError, ValueError) as err:
            raise failure(err) from err
        recommendation = coordinator().recommendation()
        return {
            "date": summary.date,
            "entries": [item.to_dict() for item in summary.entries],
            "totals": {
                "calories": summary.calories,
                "protein": summary.protein,
                "carbs": summary.carbs,
                "fat": summary.fat,
            },
            "recommendation": (
                {
                    "weight_kg": recommendation.weight_kg,
                    "bmr": recommendation.bmr,
                    "bmr_source": recommendation.bmr_source,
                    "active_calories": recommendation.active_calories,
                    "calorie_target": recommendation.calorie_target,
                    "protein": recommendation.protein,
                    "carbs": recommendation.carbs,
                    "fat": recommendation.fat,
                    "calorie_balance": recommendation.balance(summary.calories),
                }
                if recommendation
                else None
            ),
        }

    async def update_meal(call: ServiceCall) -> dict[str, Any]:
        try:
            changes = {
                key: call.data.get(key)
                for key in ("name", "meal_type", "calories", "protein", "carbs", "fat")
                if key in call.data
            }
            if "eaten_at" in call.data:
                changes["eaten_at"] = _parse_datetime(hass, call.data["eaten_at"]).isoformat()
            item = await coordinator().async_update(call.data["entry_id"], changes)
        except (ValueError, KeyError) as err:
            raise failure(err) from err
        return {"entry_id": item.id}

    async def delete_meal(call: ServiceCall) -> dict[str, Any]:
        try:
            await coordinator().async_remove(call.data["entry_id"])
        except KeyError as err:
            raise failure(err) from err
        return {"deleted_entry_id": call.data["entry_id"]}

    async def clear_day(call: ServiceCall) -> dict[str, Any]:
        requested = call.data.get("date") or dt_util.now().date().isoformat()
        try:
            removed = await coordinator().async_clear_date(requested)
        except ValueError as err:
            raise failure(err) from err
        return {"removed": removed}

    def finite(value: float) -> float:
        if not math.isfinite(value):
            raise vol.Invalid("value must be finite")
        return value

    non_negative = vol.All(vol.Coerce(float), finite, vol.Range(min=0, max=10000))
    meal_type = vol.In(["breakfast", "lunch", "dinner", "snack"])
    create_schema = vol.Schema(
        {
            vol.Required("name"): vol.All(cv.string, vol.Length(min=1, max=120)),
            vol.Required("meal_type"): meal_type,
            vol.Required("calories"): non_negative,
            vol.Optional("protein", default=0): non_negative,
            vol.Optional("carbs", default=0): non_negative,
            vol.Optional("fat", default=0): non_negative,
            vol.Optional("eaten_at"): cv.string,
            vol.Optional("request_id"): vol.All(cv.string, vol.Length(min=1, max=128)),
        }
    )
    update_schema = vol.Schema(
        {
            vol.Required("entry_id"): cv.string,
            vol.Optional("name"): vol.All(cv.string, vol.Length(min=1, max=120)),
            vol.Optional("meal_type"): meal_type,
            vol.Optional("calories"): non_negative,
            vol.Optional("protein"): non_negative,
            vol.Optional("carbs"): non_negative,
            vol.Optional("fat"): non_negative,
            vol.Optional("eaten_at"): cv.string,
        }
    )
    hass.services.async_register(
        DOMAIN,
        "log_meal",
        log_meal,
        schema=create_schema,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "list_meals",
        list_meals,
        schema=vol.Schema({vol.Optional("date"): cv.string}),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        "update_meal",
        update_meal,
        schema=update_schema,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "delete_meal",
        delete_meal,
        schema=vol.Schema({vol.Required("entry_id"): cv.string}),
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "clear_day",
        clear_day,
        schema=vol.Schema({vol.Optional("date"): cv.string}),
        supports_response=SupportsResponse.OPTIONAL,
    )
    return True


async def async_setup_entry(hass, entry) -> bool:
    from .coordinator import MealTrackerCoordinator

    runtime = MealTrackerCoordinator(hass, _settings(entry))
    await runtime.async_load()
    entry.runtime_data = runtime
    entry.async_on_unload(runtime.async_start())
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def _async_reload(hass, entry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass, entry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass, entry) -> None:
    """Delete locally stored meal data when the integration is removed."""
    from homeassistant.helpers.storage import Store

    from .const import STORE_KEY, STORE_VERSION

    await Store(hass, STORE_VERSION, STORE_KEY).async_remove()
