"""Backward-safe config-entry migration; does not touch the meal Store.

Parent integration must export/import async_migrate_entry from its __init__.py.
Old factors remain internal for the legacy runtime until a complete profile is
submitted in options. No demographic values are invented.
"""

from __future__ import annotations

from collections.abc import Mapping
from copy import deepcopy
from typing import Any

from .profile import PROFILE_VERSION


def migrate_settings_v1(data: Mapping[str, Any], options: Mapping[str, Any]) -> dict[str, Any]:
    """Collapse v1 sparse options over data once; explicit None always wins."""
    settings = deepcopy({**data, **options})
    for key in ("weight_entity", "bmr_entity", "active_calories_entity"):
        settings.setdefault(key, None)
    settings.setdefault("profile_version", PROFILE_VERSION)
    settings["profile_complete"] = False
    settings["enable_food_database"] = True
    return settings


async def async_migrate_entry(hass, config_entry) -> bool:
    """Upgrade v1 atomically; refuse unknown future versions without mutation."""
    from .const import CONFIG_VERSION

    if config_entry.version == CONFIG_VERSION:
        return True
    if config_entry.version != 1:
        return False
    settings = migrate_settings_v1(config_entry.data, config_entry.options)
    hass.config_entries.async_update_entry(
        config_entry,
        version=CONFIG_VERSION,
        minor_version=1,
        data=settings,
        options={},
    )
    return True
