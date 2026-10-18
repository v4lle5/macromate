"""Pure identity and validation helpers shared by MacroMate kitchen domains."""

from __future__ import annotations

import json
import math
import re
from copy import deepcopy
from dataclasses import dataclass
from datetime import UTC, date, datetime


@dataclass(frozen=True, slots=True)
class Actor:
    user_id: str | None
    is_admin: bool = False
    trusted_internal: bool = False
    nutrition_profile_id: str | None = None

    def __post_init__(self):
        if self.user_id is not None and (
            not isinstance(self.user_id, str) or not self.user_id or len(self.user_id) > 128
        ):
            raise ValueError("invalid actor identity")
        if type(self.is_admin) is not bool or type(self.trusted_internal) is not bool:
            raise ValueError("actor authorization flags must be booleans")
        if self.nutrition_profile_id is not None:
            identifier(self.nutrition_profile_id, "nutrition_profile_id")

    @property
    def owner_id(self) -> str:
        return self.user_id or "internal"


def require_admin(actor: Actor) -> None:
    if not actor.is_admin and not actor.trusted_internal:
        raise PermissionError("administrator access required")


def require_nutrition(actor: Actor) -> None:
    """A profile capability is attached only after server-side ownership checks."""
    if actor.nutrition_profile_id is None:
        require_admin(actor)


def can_access(record: dict, actor: Actor) -> bool:
    if actor.is_admin or actor.trusted_internal:
        return True
    if actor.user_id is None:
        return False
    return (
        ("owner_id" in record and record["owner_id"] is None)
        or record.get("owner_id") == actor.user_id
        or actor.user_id in record.get("allowed_users", [])
    )


def require_access(record: dict, actor: Actor, owner_only: bool = False) -> None:
    if not can_access(record, actor):
        raise PermissionError("object access denied")
    if owner_only and not (
        actor.is_admin or actor.trusted_internal or record.get("owner_id") == actor.user_id
    ):
        raise PermissionError("object owner access required")


def text(value, field="text", *, max_length=32768, min_length=0, allow_none=False):
    if value is None and allow_none:
        return None
    if not isinstance(value, str) or not min_length <= len(value) <= max_length:
        raise ValueError(f"invalid {field}")
    return value


def identifier(value, field="id"):
    result = text(value, field, min_length=1, max_length=128)
    if not isinstance(result, str) or not result.strip() or any(ord(char) < 32 for char in result):
        raise ValueError(f"invalid {field}")
    return result


def number(value, field="number", *, minimum=0, maximum=1000000, allow_none=False):
    if value is None and allow_none:
        return None
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValueError(f"invalid {field}")
    if not minimum <= value <= maximum or not math.isfinite(value):
        raise ValueError(f"invalid {field}")
    return value


def validate_json(value, *, max_bytes=8388608):
    def check(item, depth=0):
        if depth > 32:
            raise ValueError("JSON nesting is too deep")
        if isinstance(item, dict):
            if any(not isinstance(key, str) for key in item):
                raise ValueError("JSON keys must be strings")
            for child in item.values():
                check(child, depth + 1)
        elif isinstance(item, list):
            for child in item:
                check(child, depth + 1)
        elif item is not None and type(item) not in (str, int, float, bool):
            raise ValueError("invalid JSON data")

    try:
        check(value)
        raw = json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8")
    except (TypeError, RecursionError, OverflowError, UnicodeError) as error:
        raise ValueError("invalid JSON data") from error
    if len(raw) > max_bytes:
        raise ValueError("JSON payload is too large")
    return deepcopy(value)


def utc_timestamp():
    return datetime.now(UTC).isoformat()


def empty_kitchen():
    return {
        key: {}
        for key in (
            "recipes",
            "meal_plan",
            "timers",
            "timer_presets",
            "shopping_lists",
            "shopping_items",
            "products",
            "categories",
            "loyalty_cards",
            "regions",
            "active_lists",
            "preferences",
            "media",
        )
    }


def validate_payload(payload, schema, *, max_bytes=8 * 1024 * 1024):
    """Validate without coercion; only explicit bulk callers override byte bounds."""
    value = validate_json(payload, max_bytes=max_bytes)

    def check(item, rule):
        if rule is True:
            return
        if rule is False or not isinstance(rule, dict):
            raise ValueError("invalid action payload")
        if "not" in rule:
            try:
                check(item, rule["not"])
            except ValueError:
                pass
            else:
                raise ValueError("forbidden action payload combination")
        if "const" in rule and not (type(item) is type(rule["const"]) and item == rule["const"]):
            raise ValueError("invalid action confirmation or constant")
        for keyword in ("anyOf", "oneOf", "allOf"):
            if keyword not in rule:
                continue
            matches = 0
            for branch in rule[keyword]:
                try:
                    check(item, branch)
                except ValueError:
                    continue
                matches += 1
            if (
                keyword == "anyOf"
                and matches == 0
                or keyword == "oneOf"
                and matches != 1
                or keyword == "allOf"
                and matches != len(rule[keyword])
            ):
                raise ValueError("invalid action payload combination")
        types = rule.get("type")
        choices = types if isinstance(types, list) else [types] if types is not None else []
        kinds = {
            "null": item is None,
            "boolean": type(item) is bool,
            "integer": type(item) is int,
            "number": type(item) in (int, float),
            "string": isinstance(item, str),
            "array": isinstance(item, list),
            "object": isinstance(item, dict),
        }
        if choices and not any(kinds.get(kind, False) for kind in choices):
            raise ValueError("invalid action payload type")
        if "enum" in rule and not any(
            type(item) is type(option) and item == option for option in rule["enum"]
        ):
            raise ValueError("invalid action choice")
        if isinstance(item, dict):
            props = rule.get("properties", {})
            if any(key not in item for key in rule.get("required", [])):
                raise ValueError("required action field missing")
            if not rule.get("minProperties", 0) <= len(item) <= rule.get("maxProperties", 10000):
                raise ValueError("invalid action object size")
            for key, child in item.items():
                if key in props:
                    check(child, props[key])
                else:
                    check(child, rule.get("additionalProperties", True))
        elif isinstance(item, list):
            if not rule.get("minItems", 0) <= len(item) <= rule.get("maxItems", 10000):
                raise ValueError("invalid action collection size")
            if rule.get("uniqueItems"):
                encoded = [json.dumps(child, sort_keys=True, allow_nan=False) for child in item]
                if len(set(encoded)) != len(encoded):
                    raise ValueError("duplicate action collection items")
            for child in item:
                check(child, rule.get("items", True))
        elif isinstance(item, str):
            if not rule.get("minLength", 0) <= len(item) <= rule.get("maxLength", 8388608):
                raise ValueError("invalid action text size")
            if "pattern" in rule and re.search(rule["pattern"], item) is None:
                raise ValueError("invalid action text")
            if rule.get("format") == "date":
                if re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", item) is None:
                    raise ValueError("date must be YYYY-MM-DD")
                if date.fromisoformat(item).isoformat() != item:
                    raise ValueError("date must be YYYY-MM-DD")
        elif type(item) in (int, float):
            if (
                "minimum" in rule
                and item < rule["minimum"]
                or "maximum" in rule
                and item > rule["maximum"]
            ):
                raise ValueError("action number outside supported range")
            if (
                "exclusiveMinimum" in rule
                and item <= rule["exclusiveMinimum"]
                or "exclusiveMaximum" in rule
                and item >= rule["exclusiveMaximum"]
            ):
                raise ValueError("action number outside supported range")

    check(value, schema)
    return value
