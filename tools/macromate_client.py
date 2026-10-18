#!/usr/bin/env python3
"""Generic authenticated MacroMate client with legacy diary conveniences.

Secrets are read from HA_TOKEN. Nothing is stored or logged by this script.
HA_URL is a credential-free origin (no path, query or fragment). HTTPS is
required unless --trusted-lan-http is explicitly supplied before the command.
That override asserts operator trust; it does not prove the network is safe.
Redirects are always refused, including same-origin redirects. Use the final
Home Assistant origin, not a redirecting alias. Validation raises ValueError;
transport/protocol failures raise sanitized RuntimeError without server text.
CLI exit codes: 0 success, 1 request/validation failure, 2 usage/missing env.
Use describe for exact live action names/schemas; call SERVICE reads JSON from
stdin or --json-file PATH without flattening nested fields or dropping null.
Requests are bounded to 1 MiB and responses to 4 MiB. No automatic retries or
request-ID generation occur, including after an ambiguous mutation response.
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
MAX_REQUEST_BYTES = 1024 * 1024
MAX_RESPONSE_BYTES = 4 * 1024 * 1024


def _validate_json_data(value, depth=0):
    """Reject Python-only data rather than letting the encoder repair it."""
    if depth > 32:
        raise ValueError("service payload nesting exceeds the limit")
    if isinstance(value, dict):
        if any(not isinstance(key, str) for key in value):
            raise ValueError("service payload JSON keys must be strings")
        for child in value.values():
            _validate_json_data(child, depth + 1)
    elif isinstance(value, list):
        for child in value:
            _validate_json_data(child, depth + 1)
    elif value is not None and type(value) not in (str, int, float, bool):
        raise ValueError("service payload must contain only JSON data")


def _reject_constant(value: str) -> None:
    raise ValueError("non-finite JSON number")


def _unique_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise ValueError("duplicate JSON field")
        value[key] = item
    return value


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
    if (
        not isinstance(base_url, str)
        or not base_url
        or any(char.isspace() or ord(char) < 32 or ord(char) == 127 for char in base_url)
        or any(char in base_url for char in "\\%@?#")
    ):
        raise ValueError("HA_URL must be a valid origin without credentials, query or fragment")
    try:
        origin = urlsplit(base_url)
        host = origin.hostname
        port = origin.port
    except ValueError:
        raise ValueError("HA_URL must be a valid origin") from None
    if (
        not host
        or origin.username is not None
        or origin.password is not None
        or origin.path not in ("", "/")
        or origin.netloc.endswith(":")
        or (port is not None and not 1 <= port <= 65535)
    ):
        raise ValueError("HA_URL must be a valid origin without credentials or a path")
    if ":" in host:
        try:
            ipaddress.IPv6Address(host)
        except ValueError:
            raise ValueError("HA_URL has an invalid host") from None
    elif (
        host.endswith("..")
        or len(host.removesuffix(".")) > 253
        or not all(
            re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?", label)
            for label in host.removesuffix(".").split(".")
        )
    ):
        raise ValueError("HA_URL has an invalid host")
    if origin.scheme != "https" and not (trusted_lan_http and origin.scheme == "http"):
        raise ValueError("HA_URL must use HTTPS; HTTP requires explicit trusted-LAN opt-in")
    if isinstance(service, str) and (
        service.startswith("shopping_") or service in ("recipe_to_shopping", "plan_to_shopping")
    ):
        raise ValueError("internal shopping actions have been retired")
    if not isinstance(service, str) or not re.fullmatch(r"[a-z][a-z0-9_]*", service):
        raise ValueError("service must be a valid action name")
    url = f"{base_url.rstrip('/')}/api/services/{DOMAIN}/{service}"
    return f"{url}?return_response" if response else url


def call_service(
    base_url: str,
    token: str,
    service: str,
    data: dict,
    *,
    response: bool = True,
    trusted_lan_http: bool = False,
) -> dict:
    """Call any named action once; preserve JSON data and unwrap HA's envelope.

    Supply credentials from protected environment management, not literals.
    Local validation raises ValueError; transport/protocol errors are sanitized
    RuntimeErrors. A failure does not establish whether a mutation committed.
    """
    url = service_url(base_url, service, response=response, trusted_lan_http=trusted_lan_http)
    if not isinstance(token, str) or not re.fullmatch(r"[\x21-\x7e]+", token):
        raise ValueError(
            "HA_TOKEN must be a nonempty token without whitespace or control characters"
        )
    if not isinstance(data, dict):
        raise ValueError("service payload must be a JSON object")
    try:
        _validate_json_data(data)
        encoded = json.dumps(data, allow_nan=False, ensure_ascii=False).encode("utf-8")
    except (TypeError, ValueError, RecursionError):
        raise ValueError("service payload must be finite JSON data") from None
    if len(encoded) > MAX_REQUEST_BYTES:
        raise ValueError("service payload exceeds the request byte limit")
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
            length = result.headers.get("Content-Length")
            expected = int(length) if length is not None else None
            if expected is not None and expected > MAX_RESPONSE_BYTES:
                raise RuntimeError("Home Assistant response exceeds the byte limit")
            raw = result.read(MAX_RESPONSE_BYTES + 1)
            if len(raw) > MAX_RESPONSE_BYTES:
                raise RuntimeError("Home Assistant response exceeds the byte limit")
            if expected is not None and (expected < 0 or len(raw) != expected):
                raise HTTPException("invalid response length")
            body = json.loads(
                raw,
                parse_constant=_reject_constant,
                parse_float=_finite_float,
                object_pairs_hook=_unique_object,
            )
            # Reject unpaired surrogates before Python consumers or stdout see them.
            json.dumps(body, allow_nan=False, ensure_ascii=False).encode("utf-8")
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


class _SafeArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        # argparse's default echoes invalid values, which may contain private data.
        self.print_usage(sys.stderr)
        self.exit(2, "Invalid command arguments; use --help for accepted fields\n")


def parser() -> argparse.ArgumentParser:
    result = _SafeArgumentParser(description="Manage MacroMate through Home Assistant")
    result.add_argument(
        "--trusted-lan-http",
        action="store_true",
        help="Allow plaintext HTTP only on an explicitly trusted LAN",
    )
    sub = result.add_subparsers(dest="command", required=True)
    sub.add_parser("describe", help="Discover all action schemas, permissions and server limits")

    generic = sub.add_parser("call", help="Call any discovered MacroMate action with JSON stdin")
    generic.add_argument("service")
    generic.add_argument(
        "--json-file",
        default="-",
        metavar="PATH",
        help="Read bounded UTF-8 JSON from PATH; '-' (default) means stdin",
    )

    listing = sub.add_parser("list", help="List meals and today's recommendation")
    listing.add_argument("--date")

    add = sub.add_parser("add", help="Add one meal")
    add.add_argument("--name", required=True)
    add.add_argument(
        "--meal-type", required=True, choices=("breakfast", "lunch", "dinner", "snack")
    )
    add.add_argument("--calories", type=float, required=True)
    add.add_argument("--protein", type=float)
    add.add_argument("--carbs", type=float)
    add.add_argument("--fat", type=float)
    when = add.add_mutually_exclusive_group()
    when.add_argument("--eaten-at")
    when.add_argument("--date", help="Explicit HA-local diary date (YYYY-MM-DD)")
    add.add_argument(
        "--request-id", help="Stable idempotency ID; reuse only for the same logical add"
    )

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

    copy = sub.add_parser("copy", help="Copy an existing diary snapshot to an explicit date")
    copy.add_argument("entry_id")
    copy.add_argument("--date", required=True)
    copy.add_argument("--meal-type", choices=("breakfast", "lunch", "dinner", "snack"))

    clear = sub.add_parser("clear-day", help="Delete all meals on a date")
    clear.add_argument("--date", required=True)
    clear.add_argument(
        "--confirm",
        action="store_true",
        required=True,
        help="Confirm deletion of every entry on this explicit date",
    )
    for mutation in (update, delete, clear, copy):
        mutation.add_argument(
            "--request-id", help="Stable ID; reuse only for the same logical operation"
        )
    return result


def read_payload(path: str = "-") -> dict:
    """Read at most the request limit plus one byte, without exposing source text."""
    try:
        if path == "-":
            raw = sys.stdin.buffer.read(MAX_REQUEST_BYTES + 1)
        else:
            with open(path, "rb") as source:
                raw = source.read(MAX_REQUEST_BYTES + 1)
    except (OSError, ValueError):
        raise ValueError("service payload source could not be read") from None
    if len(raw) > MAX_REQUEST_BYTES:
        raise ValueError("service payload exceeds the request byte limit")
    try:
        data = json.loads(
            raw.decode("utf-8"),
            parse_constant=_reject_constant,
            parse_float=_finite_float,
            object_pairs_hook=_unique_object,
        )
    except (ValueError, RecursionError):
        raise ValueError("service payload must be valid finite UTF-8 JSON") from None
    if not isinstance(data, dict):
        raise ValueError("service payload must be a JSON object")
    return data


def _payload(args: argparse.Namespace) -> tuple[str, dict]:
    if args.command == "describe":
        return "describe", {}
    if args.command == "call":
        return args.service, read_payload(args.json_file)
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
    if args.command == "copy":
        return "copy_meal", data
    if args.command == "clear-day":
        return "clear_day", data
    return "update_meal", data


def main() -> int:
    args = parser().parse_args()
    base_url = os.environ.get("HA_URL", "")
    token = os.environ.get("HA_TOKEN", "")
    if not base_url or not token:
        print("HA_URL and HA_TOKEN must be set", file=sys.stderr)
        return 2
    try:
        service, data = _payload(args)
        result = call_service(
            base_url, token, service, data, trusted_lan_http=args.trusted_lan_http
        )
    except (RuntimeError, ValueError) as err:
        print(str(err), file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
