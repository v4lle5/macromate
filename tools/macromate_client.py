#!/usr/bin/env python3
"""Small authenticated Home Assistant client for Hermes Agent.

Secrets are read from HA_TOKEN. Nothing is stored or logged by this script.
HA_URL is a credential-free origin (no path, query or fragment). HTTPS is
required unless --trusted-lan-http is explicitly supplied before the command.
That override asserts operator trust; it does not prove the network is safe.
Redirects are always refused, including same-origin redirects. Use the final
Home Assistant origin, not a redirecting alias. Validation raises ValueError;
transport/protocol failures raise sanitized RuntimeError without server text.
CLI exit codes: 0 success, 1 request/validation failure, 2 usage/missing env.
"""

from __future__ import annotations

import argparse
import ipaddress
import json
import math
import os
import re
import sys
from http.client import HTTPException
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

DOMAIN = "macromate"


def _reject_constant(value: str) -> None:
    raise ValueError("non-finite JSON number")


def _finite_float(value: str) -> float:
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("non-finite JSON number")
    return number


class _NoRedirects(HTTPRedirectHandler):
    """Reject before urllib constructs any follow-up authenticated request."""

    def http_error_302(self, req, fp, code, msg, headers):
        raise HTTPError(req.full_url, code, "redirect refused", headers, fp)

    http_error_301 = http_error_302
    http_error_303 = http_error_302
    http_error_307 = http_error_302
    http_error_308 = http_error_302


def service_url(
    base_url: str, service: str, *, response: bool, trusted_lan_http: bool = False
) -> str:
    """Build a URL from a credential-free origin, never an arbitrary URL."""
    if (not isinstance(base_url, str) or not base_url
            or any(char.isspace() or ord(char) < 32 or ord(char) == 127 for char in base_url)
            or any(char in base_url for char in "\\%@?#")):
        raise ValueError("HA_URL must be a valid origin without credentials, query or fragment")
    try:
        origin = urlsplit(base_url)
        host = origin.hostname
        port = origin.port
    except ValueError:
        raise ValueError("HA_URL must be a valid origin") from None
    if (not host or origin.username is not None or origin.password is not None
            or origin.path not in ("", "/") or origin.netloc.endswith(":")
            or (port is not None and not 1 <= port <= 65535)):
        raise ValueError("HA_URL must be a valid origin without credentials or a path")
    if ":" in host:
        try:
            ipaddress.IPv6Address(host)
        except ValueError:
            raise ValueError("HA_URL has an invalid host") from None
    elif (host.endswith("..") or len(host.removesuffix(".")) > 253
          or not all(re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?", label)
                     for label in host.removesuffix(".").split("."))):
        raise ValueError("HA_URL has an invalid host")
    if origin.scheme != "https" and not (
        trusted_lan_http and origin.scheme == "http"
    ):
        raise ValueError("HA_URL must use HTTPS; HTTP requires explicit trusted-LAN opt-in")
    if not isinstance(service, str) or not re.fullmatch(r"[a-z][a-z0-9_]*", service):
        raise ValueError("service must be a valid action name")
    url = f"{base_url.rstrip('/')}/api/services/{DOMAIN}/{service}"
    return f"{url}?return_response" if response else url


def call_service(
    base_url: str, token: str, service: str, data: dict, *, response: bool = True,
    trusted_lan_http: bool = False,
) -> dict:
    url = service_url(base_url, service, response=response, trusted_lan_http=trusted_lan_http)
    if not isinstance(token, str) or not re.fullmatch(r"[\x21-\x7e]+", token):
        raise ValueError("HA_TOKEN must be a nonempty token without whitespace or control characters")
    if not isinstance(data, dict):
        raise ValueError("service payload must be a JSON object")
    try:
        encoded = json.dumps(data, allow_nan=False).encode("utf-8")
    except (TypeError, ValueError, RecursionError):
        raise ValueError("service payload must be finite JSON data") from None
    request = Request(
        url,
        data=encoded,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with build_opener(_NoRedirects()).open(request, timeout=20) as result:
            body = json.load(result, parse_constant=_reject_constant, parse_float=_finite_float)
    except HTTPError as err:
        if 300 <= err.code < 400:
            err.close()
            raise RuntimeError("Home Assistant redirects are disabled") from None
        err.close()
        raise RuntimeError(f"Home Assistant returned HTTP {err.code}") from None
    except TimeoutError:
        raise RuntimeError("Home Assistant request timed out") from None
    except (URLError, OSError):
        raise RuntimeError("Home Assistant is unreachable") from None
    except HTTPException:
        raise RuntimeError("Home Assistant returned an invalid HTTP response") from None
    except (ValueError, RecursionError):
        raise RuntimeError("Home Assistant returned invalid JSON") from None
    if isinstance(body, dict) and "service_response" in body:
        body = body["service_response"]
    return body if isinstance(body, dict) else {"result": body}


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="Manage MacroMate through Home Assistant")
    result.add_argument("--trusted-lan-http", action="store_true",
                        help="Allow plaintext HTTP only on an explicitly trusted LAN")
    sub = result.add_subparsers(dest="command", required=True)

    listing = sub.add_parser("list", help="List meals and today's recommendation")
    listing.add_argument("--date")

    add = sub.add_parser("add", help="Add one meal")
    add.add_argument("--name", required=True)
    add.add_argument("--meal-type", required=True, choices=("breakfast", "lunch", "dinner", "snack"))
    add.add_argument("--calories", type=float, required=True)
    add.add_argument("--protein", type=float, default=0)
    add.add_argument("--carbs", type=float, default=0)
    add.add_argument("--fat", type=float, default=0)
    add.add_argument("--eaten-at")
    add.add_argument("--request-id", help="Stable idempotency ID; reuse only for the same logical add")

    update = sub.add_parser("update", help="Correct an existing meal")
    update.add_argument("entry_id")
    update.add_argument("--name")
    update.add_argument("--meal-type", choices=("breakfast", "lunch", "dinner", "snack"))
    update.add_argument("--calories", type=float)
    update.add_argument("--protein", type=float)
    update.add_argument("--carbs", type=float)
    update.add_argument("--fat", type=float)
    update.add_argument("--eaten-at")

    delete = sub.add_parser("delete", help="Delete one meal by ID")
    delete.add_argument("entry_id")

    clear = sub.add_parser("clear-day", help="Delete all meals on a date")
    clear.add_argument("--date",required=True)
    clear.add_argument("--confirm",action="store_true",required=True,help="Confirm deletion of every entry on this explicit date")
    for mutation in (update, delete, clear):
        mutation.add_argument("--request-id", help="Stable ID; reuse only for the same logical operation")
    return result


def _payload(args: argparse.Namespace) -> tuple[str, dict]:
    if args.command == "list":
        return "list_meals", {"date": args.date} if args.date else {}

    data = {
        key: value
        for key, value in vars(args).items()
        if key not in ("command", "trusted_lan_http") and value is not None
    }
    if args.command == "add":
        return "log_meal", data
    if args.command == "delete":
        return "delete_meal", data
    if args.command == "clear-day":
        return "clear_day", data
    return "update_meal", data


def main() -> int:
    args = parser().parse_args()
    base_url = os.environ.get("HA_URL", "").strip()
    token = os.environ.get("HA_TOKEN", "").strip()
    if not base_url or not token:
        print("HA_URL and HA_TOKEN must be set", file=sys.stderr)
        return 2
    service, data = _payload(args)
    try:
        result = call_service(base_url, token, service, data,
                              trusted_lan_http=args.trusted_lan_http)
    except (RuntimeError, ValueError) as err:
        print(str(err), file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
