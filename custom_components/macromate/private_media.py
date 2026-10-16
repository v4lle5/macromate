"""Private in-Store media; no public files or automatic remote retrieval."""

from __future__ import annotations
import base64
import re
from .platform_support import Actor, can_access
from .storage_budget import MAX_TRANSFER_BYTES


def register_views(hass):
    """Register authenticated views once, including bounded full-state transfer."""
    from aiohttp import web
    from homeassistant.components.http import HomeAssistantView
    from homeassistant.components.http.const import KEY_HASS_USER
    from .const import DOMAIN
    import json

    runtime = hass.data.setdefault(DOMAIN, {})
    if runtime.get("private_views_registered") or not getattr(hass, "http", None):
        return

    async def identity(request, admin=False):
        user = request.get(KEY_HASS_USER)
        user = await hass.auth.async_get_user(user.id) if user is not None else None
        if user is None or not user.is_active or admin and not user.is_admin:
            raise web.HTTPForbidden()
        return Actor(user.id, is_admin=user.is_admin)

    def coordinator():
        entries = hass.config_entries.async_loaded_entries(DOMAIN)
        if not entries:
            raise web.HTTPServiceUnavailable()
        return entries[0].runtime_data

    headers = {"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"}

    class MediaView(HomeAssistantView):
        url = "/api/macromate/media/{media_id}"
        name = "api:macromate:media"
        requires_auth = True

        async def get(self, request, media_id):
            actor = await identity(request)
            coord = coordinator()
            try:
                async with coord._lock:
                    body = media_bytes(coord.kitchen, media_id, actor)
            except (KeyError, PermissionError, ValueError):
                raise web.HTTPNotFound() from None
            return web.Response(body=body, content_type="image/webp", headers=headers)

    class BackupView(HomeAssistantView):
        url = "/api/macromate/backup"
        name = "api:macromate:backup"
        requires_auth = True

        async def get(self, request):
            await identity(request, admin=True)
            coord = coordinator()
            async with coord._lock:
                data = coord._state()
            body = await hass.async_add_executor_job(
                lambda: json.dumps(
                    {"data": data}, ensure_ascii=False, allow_nan=False
                ).encode("utf-8")
            )
            return web.Response(
                body=body, content_type="application/json", headers=headers
            )

    class RestoreView(HomeAssistantView):
        url = "/api/macromate/restore"
        name = "api:macromate:restore"
        requires_auth = True

        async def post(self, request):
            actor = await identity(request, admin=True)
            # Route-local override, following HA's native upload views; the
            # normal services retain HA's default finite 16 MiB request cap.
            request._client_max_size = MAX_TRANSFER_BYTES

            def pairs(rows):
                result = {}
                for key, value in rows:
                    if key in result:
                        raise ValueError("duplicate JSON key")
                    result[key] = value
                return result

            try:
                raw = await request.read()
                payload = await hass.async_add_executor_job(
                    lambda: json.loads(
                        raw,
                        object_pairs_hook=pairs,
                        parse_constant=lambda v: (_ for _ in ()).throw(
                            ValueError("nonfinite JSON")
                        ),
                    )
                )
                result = await coordinator().async_command(
                    "platform_restore", payload, actor=actor
                )
            except (ValueError, TypeError, KeyError):
                raise web.HTTPBadRequest(text="Invalid restore data") from None
            except OSError:
                raise web.HTTPServiceUnavailable(
                    text="Restore not committed; retain the same request ID"
                ) from None
            return web.json_response(result, headers=headers)

    class LegacyImportView(HomeAssistantView):
        url = "/api/macromate/legacy-import"
        name = "api:macromate:legacy-import"
        requires_auth = True

        async def post(self, request):
            actor = await identity(request, admin=True)
            request._client_max_size = MAX_TRANSFER_BYTES

            def decode(raw):
                from .platform_support import identifier, validate_json

                def pairs(rows):
                    value = {}
                    for key, child in rows:
                        if key in value:
                            raise ValueError("duplicate JSON key")
                        value[key] = child
                    return value

                payload = validate_json(json.loads(
                    raw, object_pairs_hook=pairs,
                    parse_constant=lambda value: (_ for _ in ()).throw(ValueError("nonfinite JSON")),
                ), max_bytes=MAX_TRANSFER_BYTES)
                required = {"source", "stores", "preserve_permissions", "confirm", "request_id"}
                if (not isinstance(payload, dict) or required - set(payload)
                        or set(payload) - (required | {"images", "country"})
                        or payload["source"] not in ("recipe_manager", "shopping_list_manager")
                        or not isinstance(payload["stores"], dict)
                        or not isinstance(payload.get("images", {}), dict)
                        or type(payload["preserve_permissions"]) is not bool
                        or payload["confirm"] is not True):
                    raise ValueError("invalid legacy import envelope")
                identifier(payload["request_id"], "request_id")
                if payload["source"] == "shopping_list_manager":
                    identifier(payload.get("country"), "country")
                elif "country" in payload:
                    raise ValueError("country is only supported for shopping imports")
                payload.setdefault("images", {})
                return payload

            try:
                raw = await request.read()
                payload = await hass.async_add_executor_job(decode, raw)
                result = await coordinator().async_command("legacy_import", payload, actor=actor)
            except (ValueError, TypeError, KeyError, RecursionError):
                raise web.HTTPBadRequest(text="Invalid legacy import data") from None
            except PermissionError:
                raise web.HTTPForbidden() from None
            except OSError:
                raise web.HTTPServiceUnavailable(
                    text="Import not committed; retain the same request ID"
                ) from None
            return web.json_response(result, headers=headers)

    for view in (MediaView(), BackupView(), RestoreView(), LegacyImportView()):
        hass.http.register_view(view)
    runtime["private_views_registered"] = True


PREFIX = "/api/macromate/media/"


def media_id(reference):
    if not isinstance(reference, str):
        return None
    value = reference.removeprefix(PREFIX)
    return value if re.fullmatch(r"[A-Za-z0-9_-]{1,128}", value) else None


def media_bytes(kitchen, mid, actor):
    if media_id(mid) != mid or mid not in kitchen["media"]:
        raise KeyError("media not found")
    record = kitchen["media"][mid]
    allowed = actor.is_admin or actor.trusted_internal
    # Referenced media follows current object/parent ACLs, never a stale upload ACL.
    referenced = False
    for bucket in ("products", "shopping_items", "loyalty_cards", "recipes"):
        for row in kitchen[bucket].values():
            refs = [row.get("image_url"), row.get("logo"), *row.get("photos", [])]
            if not any(media_id(ref) == mid for ref in refs):
                continue
            referenced = True
            if bucket == "shopping_items":
                allowed |= can_access(
                    kitchen["shopping_lists"].get(row["list_id"], {}), actor
                )
            elif bucket != "recipes":
                allowed |= can_access(row, actor)
    if not referenced:
        allowed |= can_access(record, actor)
    if not allowed:
        raise PermissionError("media access denied")
    return base64.b64decode(record["data"], validate=True)
