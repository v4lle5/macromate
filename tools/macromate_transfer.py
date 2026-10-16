#!/usr/bin/env python3
"""Bounded private backup transfers for datasets exceeding generic action limits.

Credentials remain in the caller's protected environment; neither function
persists data or retries. Restore is destructive and requires confirm=True.
"""
from __future__ import annotations

import json
import re
from http.client import HTTPException
from urllib.error import HTTPError, URLError
from urllib.request import Request, build_opener

if __package__:
    from . import macromate_client as client
else:
    import macromate_client as client

# Mirror the pure server budget without making this standalone SDK depend on
# importing the HA integration. Tests pin equality with storage_budget.py.
MAX_DATA_BYTES = 64 * 1024 * 1024
MAX_STORAGE_BYTES = MAX_DATA_BYTES + 4 * 1024 * 1024
MAX_TRANSFER_BYTES = MAX_STORAGE_BYTES + 8192


def _request(base_url, token, path, *, payload=None, trusted_lan_http=False):
    client.service_url(base_url, "describe", response=True, trusted_lan_http=trusted_lan_http)
    if not isinstance(token, str) or not re.fullmatch(r"[\x21-\x7e]+", token):
        raise ValueError("HA_TOKEN must be a nonempty token without whitespace or control characters")
    if path not in ("backup", "restore", "legacy-import"):
        raise ValueError("unsupported private transfer")
    encoded = None
    if payload is not None:
        try:
            if path == "restore":
                # The backup root gets the same depth budget as persisted data;
                # the small transfer envelope must not consume one of its levels.
                client._validate_json_data(payload["data"])
                client._validate_json_data({**payload, "data": {}})
            else:
                client._validate_json_data(payload)
            encoded = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
        except (ValueError, TypeError, RecursionError):
            raise ValueError("transfer payload must be finite JSON data") from None
        if len(encoded) > MAX_TRANSFER_BYTES:
            raise ValueError("transfer request exceeds the byte limit")
    request = Request(base_url.rstrip("/") + "/api/macromate/" + path, data=encoded,
                      method="GET" if path == "backup" else "POST",
                      headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    try:
        with build_opener(client._NoRedirects()).open(request, timeout=20) as response:
            length = response.headers.get("Content-Length")
            expected = int(length) if length is not None else None
            if expected is not None and (expected < 0 or expected > MAX_TRANSFER_BYTES):
                raise RuntimeError("transfer response exceeds the byte limit")
            raw = response.read(MAX_TRANSFER_BYTES + 1)
            if len(raw) > MAX_TRANSFER_BYTES:
                raise RuntimeError("transfer response exceeds the byte limit")
            if expected is not None and len(raw) != expected:
                raise HTTPException("invalid response length")
            value = json.loads(raw, parse_constant=client._reject_constant,
                               parse_float=client._finite_float, object_pairs_hook=client._unique_object)
            json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8")
    except HTTPError as error:
        code = error.code
        error.close()
        if 300 <= code < 400:
            raise RuntimeError("Home Assistant redirects are disabled") from None
        raise RuntimeError(f"Home Assistant returned HTTP {code}") from None
    except TimeoutError:
        raise RuntimeError("Home Assistant transfer timed out; preserve the request ID") from None
    except (OSError, URLError):
        raise RuntimeError("Home Assistant is unreachable") from None
    except HTTPException:
        raise RuntimeError("Home Assistant returned an invalid HTTP response") from None
    except (ValueError, RecursionError):
        raise RuntimeError("Home Assistant returned invalid transfer JSON") from None
    if not isinstance(value, dict):
        raise RuntimeError("Home Assistant returned an invalid transfer envelope")
    return value


def download_backup(base_url, token, *, trusted_lan_http=False):
    """Read complete private data, including the finite restore-receipt reserve."""
    result = _request(base_url, token, "backup", trusted_lan_http=trusted_lan_http)
    if not isinstance(result.get("data"), dict):
        raise RuntimeError("Home Assistant returned an invalid backup envelope")
    return result


def restore_backup(base_url, token, data, *, request_id, confirm=False, trusted_lan_http=False):
    """Restore once; keep the identical payload/request ID after uncertainty."""
    if confirm is not True:
        raise ValueError("restore requires explicit confirm=True")
    if not isinstance(request_id, str) or not 1 <= len(request_id) <= 128 or not request_id.strip():
        raise ValueError("restore requires a stable request ID")
    if not isinstance(data, dict):
        raise ValueError("restore data must be a JSON object")
    return _request(base_url, token, "restore",
                    payload={"data": data, "confirm": True, "request_id": request_id},
                    trusted_lan_http=trusted_lan_http)


def import_legacy(base_url, token, *, source, stores, images=None, country=None,
                  preserve_permissions=False, request_id, confirm=False, trusted_lan_http=False):
    """Upload supplied legacy JSON once; never read files, fetch media or retry."""
    if confirm is not True:
        raise ValueError("legacy import requires explicit confirm=True")
    if source != "recipe_manager":
        raise ValueError("unsupported legacy import source")
    if not isinstance(stores, dict) or images is not None and not isinstance(images, dict):
        raise ValueError("legacy stores and images must be JSON objects")
    if type(preserve_permissions) is not bool:
        raise ValueError("preserve_permissions must be a boolean")
    if (not isinstance(request_id, str) or not 1 <= len(request_id) <= 128
            or not request_id.strip() or any(ord(char) < 32 for char in request_id)):
        raise ValueError("legacy import requires a stable request ID")
    if source == "recipe_manager" and country is not None:
        raise ValueError("country is only supported for shopping imports")
    if source == "shopping_list_manager" and (
            not isinstance(country, str) or not 1 <= len(country) <= 128
            or not country.strip() or any(ord(char) < 32 for char in country)):
        raise ValueError("shopping import requires a country")
    payload = {
        "source": source, "stores": stores, "images": {} if images is None else images,
        "preserve_permissions": preserve_permissions, "confirm": True, "request_id": request_id,
    }
    if source == "shopping_list_manager":
        payload["country"] = country
    return _request(base_url, token, "legacy-import", payload=payload,
                    trusted_lan_http=trusted_lan_http)
