#!/usr/bin/env python3
"""Small authenticated Home Assistant client for Hermes Agent.

Secrets are read from HA_TOKEN. Nothing is stored or logged by this script.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DOMAIN = "macromate"


def service_url(base_url: str, service: str, *, response: bool) -> str:
    url = f"{base_url.rstrip('/')}/api/services/{DOMAIN}/{service}"
    return f"{url}?return_response" if response else url


def call_service(base_url: str, token: str, service: str, data: dict, *, response=True) -> dict:
    request = Request(
        service_url(base_url, service, response=response),
        data=json.dumps(data).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=20) as result:
            body = json.load(result)
    except HTTPError as err:
        detail = err.read().decode("utf-8", "replace")
        raise RuntimeError(f"Home Assistant returned HTTP {err.code}: {detail}") from err
    except URLError as err:
        raise RuntimeError(f"Home Assistant is unreachable: {err.reason}") from err
    return body.get("service_response", body) if isinstance(body, dict) else {"result": body}


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="Manage MacroMate through Home Assistant")
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
    clear.add_argument("--date")
    return result


def _payload(args: argparse.Namespace) -> tuple[str, dict]:
    if args.command == "list":
        return "list_meals", {"date": args.date} if args.date else {}
    if args.command == "delete":
        return "delete_meal", {"entry_id": args.entry_id}
    if args.command == "clear-day":
        return "clear_day", {"date": args.date} if args.date else {}
    data = {
        key: value
        for key, value in vars(args).items()
        if key != "command" and value is not None
    }
    if args.command == "add":
        data["meal_type"] = data.pop("meal_type")
        return "log_meal", data
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
        result = call_service(base_url, token, service, data)
    except RuntimeError as err:
        print(str(err), file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
