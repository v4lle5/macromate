"""Private, admin-only MacroMate WebSocket boundary."""
from __future__ import annotations

import json
import voluptuous as vol
from homeassistant.components import websocket_api
from .const import DOMAIN
from .food_provider import ProviderUnavailable

ACTIONS = frozenset({"diary", "search_foods", "food", "barcode", "save_food", "favorite",
                     "log_food", "log_meal", "update_meal", "update_food_entry", "delete_meal",
                     "copy_meal", "clear_day"})


@websocket_api.websocket_command({vol.Required("type"): "macromate/command",
                                 vol.Required("action"): vol.In(ACTIONS),
                                 vol.Optional("payload", default=dict): dict})
@websocket_api.require_admin
@websocket_api.async_response
async def command(hass, connection, msg):
    """Use HA authentication, never accept extra tokens or arbitrary URLs."""
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "not_ready", "MacroMate ist nicht eingerichtet")
        return
    try:
        if len(json.dumps(msg["payload"], allow_nan=False)) > 65536:
            raise ValueError("Die Anfrage ist zu groß")
        result = await entries[0].runtime_data.async_command(msg["action"], msg["payload"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Eintrag oder Lebensmittel nicht gefunden")
    except (ValueError, TypeError) as err:
        connection.send_error(msg["id"], "invalid_request", str(err)[:240])
    except PermissionError:
        connection.send_error(msg["id"], "invalid_request", "Online-Lebensmittelsuche ist nicht freigegeben")
    except (ProviderUnavailable, TimeoutError):
        connection.send_error(msg["id"], "provider_unavailable", "Datenquelle derzeit nicht erreichbar; lokale Daten bleiben erhalten")
    except OSError:
        connection.send_error(msg["id"], "storage_unavailable", "Speichern fehlgeschlagen; Status prüfen und dieselbe Anfrage-ID beibehalten")
    else:
        connection.send_result(msg["id"], result)


def async_register(hass):
    websocket_api.async_register_command(hass, command)
