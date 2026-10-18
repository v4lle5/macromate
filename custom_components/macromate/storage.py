"""Durable private storage shared by data and delegated credentials."""

from __future__ import annotations

from typing import Any

from homeassistant.core import CoreState
from homeassistant.helpers.storage import Store


class DurableStore(Store[dict[str, Any]]):
    """Propagate native write failures instead of acknowledging volatile state."""

    async def async_save(self, data: dict[str, Any]) -> None:
        if self.hass.state is CoreState.stopping or self._read_only:
            raise OSError("MacroMate storage is stopping or read-only")
        await super().async_save(data)

    async def _async_write_data(self, data: dict) -> None:
        from homeassistant.util.file import WriteError
        from homeassistant.util.json import SerializationError

        try:
            await super()._async_write_data(data)
        except (WriteError, SerializationError) as error:
            raise OSError("MacroMate atomic storage write failed") from error
