"""Authenticated unified commands and filtered, data-free refresh subscription."""

from __future__ import annotations

from functools import wraps

import voluptuous as vol
from homeassistant.auth.const import GROUP_ID_READ_ONLY
from homeassistant.components import websocket_api
from homeassistant.core import callback
from homeassistant.exceptions import Unauthorized

from .const import DOMAIN, EVENT_UPDATED
from .food_provider import ProviderUnavailable
from .platform_api import ACTIONS
from .platform_support import Actor, validate_json


def require_user_action(user, action, payload=None):
    if user is None or not user.is_active:
        raise Unauthorized()
    descriptor = ACTIONS[action]
    if descriptor["admin_only"] and not user.is_admin:
        raise Unauthorized()
    from .household import NUTRITION_COMMANDS

    if action in NUTRITION_COMMANDS and not user.is_admin and not (payload or {}).get("profile_id"):
        raise Unauthorized()
    if (
        not descriptor["read_only"]
        and not user.is_admin
        and any(group.id == GROUP_ID_READ_ONLY for group in user.groups)
    ):
        raise Unauthorized()


def authorized_command(func):
    @callback
    @wraps(func)
    def check(hass, connection, msg):
        require_user_action(connection.user, msg["action"], msg.get("payload"))
        return func(hass, connection, msg)

    return check


@websocket_api.websocket_command(
    {
        vol.Required("type"): "macromate/command",
        vol.Required("action"): vol.In(ACTIONS),
        vol.Optional("payload", default=dict): dict,
    }
)
@authorized_command
@websocket_api.async_response
async def command(hass, connection, msg):
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "not_ready", "MacroMate is not configured")
        return
    try:
        validate_json(msg["payload"], max_bytes=8388608)
        user = await hass.auth.async_get_user(connection.user.id)
        require_user_action(user, msg["action"], msg.get("payload"))
        actor = Actor(user.id, is_admin=user.is_admin)
        result = await entries[0].runtime_data.async_command(
            msg["action"], msg["payload"], actor=actor
        )
        validate_json(result, max_bytes=8388608)
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Selected record no longer exists")
    except (ValueError, TypeError):
        connection.send_error(msg["id"], "invalid_request", "Check the submitted fields")
    except (PermissionError, Unauthorized):
        connection.send_error(
            msg["id"],
            "unauthorized",
            "Access denied or explicit remote consent required",
        )
    except (ProviderUnavailable, TimeoutError):
        connection.send_error(msg["id"], "provider_unavailable", "Remote provider unavailable")
    except OSError:
        connection.send_error(
            msg["id"],
            "storage_unavailable",
            "Save failed; inspect readback and retain the same request ID",
        )
    else:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "macromate/subscribe"})
@websocket_api.async_response
async def subscribe(hass, connection, msg):
    if connection.user is None or not connection.user.is_active:
        connection.send_error(msg["id"], "unauthorized", "Access denied")
        return

    async def changed(event):
        user = await hass.auth.async_get_user(connection.user.id)
        if (
            user is not None
            and user.is_active
            and (
                user.is_admin or event.data.get("public") or user.id in event.data.get("users", [])
            )
        ):
            connection.send_event(msg["id"], {"event": "refresh"})

    connection.subscriptions[msg["id"]] = hass.bus.async_listen(EVENT_UPDATED, changed)
    connection.send_result(msg["id"])


def async_register(hass):
    websocket_api.async_register_command(hass, command)
    websocket_api.async_register_command(hass, subscribe)
