"""Native HTTP capability boundary, registered by the integration lifecycle.

There is no proxy, HA token conversion, service registration or generic fallback.
The reviewed matrix delegates only existing global recipe/plan/diary commands.
"""

from __future__ import annotations

import hashlib
import json
from copy import deepcopy

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.components.http.const import KEY_HASS_USER

from .agent_auth import AgentCredentials, settle
from .const import DOMAIN
from .platform_api import ACTIONS
from .platform_support import Actor, validate_json

ACTION_SCOPES = {
    "profiles_list": {"diary.read"},
    "nutrition_report": {"diary.read"},
    "recipes_get": {"recipes.read"},
    "recipes_get_all": {"recipes.read"},
    "recipes_search": {"recipes.read"},
    "tags_get_all": {"recipes.read"},
    "recipes_add": {"recipes.create"},
    "recipes_update": {"recipes.update", "recipes.read"},
    "recipes_set_favourite": {"recipes.update", "recipes.read"},
    # Native deletion cascades to plan entries, so both opt-ins are mandatory.
    "recipes_delete": {"recipes.delete", "mealplan.delete"},
    "meal_plan_get": {"mealplan.read"},
    "meal_plan_add": {"mealplan.create", "recipes.read"},
    "meal_plan_update": {"mealplan.update", "mealplan.read", "recipes.read"},
    "meal_plan_remove": {"mealplan.delete"},
    "diary": {"diary.read"},
    "log_meal": {"diary.create"},
    "copy_meal": {"diary.create", "diary.read"},
    "update_meal": {"diary.update", "diary.read"},
    "recipe_log": {"diary.create", "recipes.read"},
    "recipe_entry_update": {"diary.update", "diary.read", "recipes.read"},
    "delete_meal": {"diary.delete"},
}
MAX_BODY = 256 * 1024
HEADERS = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
}


def strict_json(raw):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError("Duplicate key")
            result[key] = value
        return result

    def constant(_):
        raise ValueError("Nonfinite JSON")

    return validate_json(
        json.loads(raw, object_pairs_hook=pairs, parse_constant=constant), max_bytes=MAX_BODY
    )


async def body(request):
    if (
        request.query_string
        or request.content_type != "application/json"
        or request.headers.get("Content-Encoding")
    ):
        raise web.HTTPBadRequest(text="Invalid request", headers=HEADERS)
    request._client_max_size = MAX_BODY
    try:
        value = strict_json(await request.read())
        if not isinstance(value, dict):
            raise ValueError("Object required")
        return value
    except (ValueError, TypeError, RecursionError, UnicodeError):
        raise web.HTTPBadRequest(text="Invalid request", headers=HEADERS) from None


async def async_register_agent_views(hass):
    """Register once after native HTTP setup, including concurrent lifecycle calls.

    Loading the private Store yields; serialize the complete load/register step.
    Registration creates no credential and changes no native HA authentication.
    """
    import asyncio

    runtime = hass.data.setdefault(DOMAIN, {})
    lock = runtime.setdefault("agent_registration_lock", asyncio.Lock())
    async with lock:
        return await _async_register_agent_views(hass)


async def _async_register_agent_views(hass):
    """Register under the lifecycle lock; resolve the coordinator per request."""
    runtime = hass.data.setdefault(DOMAIN, {})
    if "agent_credentials" in runtime:
        return runtime["agent_credentials"]
    if not getattr(hass, "http", None):
        raise RuntimeError("Native HTTP required")
    credentials = AgentCredentials(hass)
    await credentials.async_load()

    def coordinator():
        entries = hass.config_entries.async_loaded_entries(DOMAIN)
        if len(entries) != 1:
            raise web.HTTPServiceUnavailable(headers=HEADERS)
        return entries[0].runtime_data

    async def admin(request):
        user = request.get(KEY_HASS_USER)
        user = await hass.auth.async_get_user(user.id) if user else None
        if user is None or not user.is_active or not user.is_admin or user.system_generated:
            raise web.HTTPForbidden(headers=HEADERS)
        return user

    class CredentialsView(HomeAssistantView):
        url = "/api/macromate/agent/credentials"
        name = "api:macromate:agent:credentials"
        requires_auth = True

        async def get(self, request):
            await admin(request)
            if request.query_string:
                raise web.HTTPBadRequest(headers=HEADERS)
            async with credentials.lock:
                await admin(request)
                return web.json_response(
                    {
                        "credentials": [
                            credentials.metadata(row) for row in credentials.rows.values()
                        ]
                    },
                    headers=HEADERS,
                )

        async def post(self, request):
            await admin(request)
            payload = await body(request)
            async with credentials.lock:
                user = await admin(request)
                try:
                    result = await credentials.mint(user.id, payload)
                except ValueError:
                    raise web.HTTPBadRequest(
                        text="Invalid credential request", headers=HEADERS
                    ) from None
                except OSError:
                    raise web.HTTPServiceUnavailable(headers=HEADERS) from None
            return web.json_response(result, headers=HEADERS)

    class RevokeView(HomeAssistantView):
        url = "/api/macromate/agent/credentials/{credential_id}"
        name = "api:macromate:agent:revoke"
        requires_auth = True

        async def delete(self, request, credential_id):
            await admin(request)
            if request.query_string:
                raise web.HTTPBadRequest(headers=HEADERS)
            async with credentials.lock:
                await admin(request)
                try:
                    result = await credentials.revoke(credential_id)
                except KeyError:
                    raise web.HTTPNotFound(headers=HEADERS) from None
                except OSError:
                    raise web.HTTPServiceUnavailable(headers=HEADERS) from None
            return web.json_response(result, headers=HEADERS)

    class ActionView(HomeAssistantView):
        url = "/api/macromate/agent/action/{action}"
        name = "api:macromate:agent:action"
        requires_auth = False  # Only our independent opaque credential is accepted.

        async def post(self, request, action):
            authorization = request.headers.getall("Authorization", [])
            if (
                len(authorization) != 1
                or not authorization[0].startswith("Bearer ")
                or len(authorization[0]) > 128
            ):
                raise web.HTTPUnauthorized(headers=HEADERS)
            token = authorization[0][7:]
            async with credentials.lock:
                try:
                    row = await credentials.authenticate(token)
                except PermissionError:
                    raise web.HTTPUnauthorized(headers=HEADERS) from None
                try:
                    credentials.charge(row["id"])
                except OverflowError:
                    raise web.HTTPTooManyRequests(
                        headers={**HEADERS, "Retry-After": "60"}
                    ) from None
                scopes = set(row["scopes"])
                if action != "describe" and (
                    action not in ACTION_SCOPES or not ACTION_SCOPES[action] <= scopes
                ):
                    raise web.HTTPForbidden(headers=HEADERS)
                payload = await body(request)
                try:
                    row = await credentials.authenticate(token)
                except PermissionError:
                    raise web.HTTPUnauthorized(headers=HEADERS) from None
                if action == "describe":
                    if payload:
                        raise web.HTTPBadRequest(headers=HEADERS)
                    return web.json_response(
                        {
                            "actions": {
                                key: deepcopy(ACTIONS[key])
                                for key, required in ACTION_SCOPES.items()
                                if required <= scopes
                            },
                            "scopes": sorted(scopes),
                            "limits": {"body_bytes": MAX_BODY, "requests_per_minute": 60},
                        },
                        headers=HEADERS,
                    )
                # No network/media acquisition, permission changes or identity input.
                if payload.get("download_image") or any(
                    key in payload
                    for key in (
                        "actor",
                        "user_id",
                        "is_admin",
                        "trusted_internal",
                        "owner_id",
                        "allowed_users",
                        "scopes",
                    )
                ):
                    raise web.HTTPBadRequest(text="Invalid request", headers=HEADERS)
                if not ACTIONS[action]["read_only"]:
                    request_id = payload.get("request_id")
                    if (
                        not isinstance(request_id, str)
                        or not 1 <= len(request_id) <= 128
                        or not request_id.strip()
                        or any(ord(c) < 32 for c in request_id)
                    ):
                        raise web.HTTPBadRequest(text="Stable request_id required", headers=HEADERS)
                    # Distinct per-token replay principal without altering data ownership.
                    payload["request_id"] = (
                        "agent:" + row["id"] + ":" + hashlib.sha256(request_id.encode()).hexdigest()
                    )
                # The credential's currently-active issuing admin is the server-side
                # actor. This never grants HA auth and never sets trusted_internal.
                import asyncio

                async def command():
                    return await coordinator().async_command(
                        action, payload, actor=Actor(row["user_id"], is_admin=True)
                    )

                try:
                    result = await settle(asyncio.create_task(command()))
                except PermissionError:
                    raise web.HTTPForbidden(headers=HEADERS) from None
                except (ValueError, TypeError, KeyError):
                    raise web.HTTPBadRequest(text="Invalid action data", headers=HEADERS) from None
                except OSError:
                    raise web.HTTPServiceUnavailable(
                        text="Outcome uncertain; retain request_id", headers=HEADERS
                    ) from None
                return web.json_response(result, headers=HEADERS)

    for view in (CredentialsView(), RevokeView(), ActionView()):
        hass.http.register_view(view)
    runtime["agent_credentials"] = credentials
    return credentials
