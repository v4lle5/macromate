"""Pure administrative recipe, planning and cooking-timer commands.

Only the caller's staged kitchen dictionaries are mutated. Persistence, replay,
remote fetching, media normalization and event publication belong to transport.
"""

from __future__ import annotations

import json
import math
import re
from copy import deepcopy
from datetime import date, datetime, timedelta
from typing import Any
from uuid import uuid4

from .platform_support import Actor, require_admin


def _text(limit=50000, *, nullable=False, nonempty=False):
    schema = {"type": ["string", "null"] if nullable else "string", "maxLength": limit}
    if nonempty:
        schema.update(minLength=1, pattern=r"\S")
    return schema


def _number(low: float = 0, high: float = 1000000, *, nullable=False, integer=False):
    kind = "integer" if integer else "number"
    return {"type": [kind, "null"] if nullable else kind, "minimum": low, "maximum": high}


def _object(properties, required=(), *, nullable=False):
    return {
        "type": ["object", "null"] if nullable else "object",
        "properties": properties,
        "required": list(required),
        "additionalProperties": False,
    }


def _array(items, limit=1000):
    return {"type": "array", "items": items, "maxItems": limit}


_ID = {
    "type": "string",
    "minLength": 1,
    "maxLength": 128,
    "pattern": r"^[A-Za-z0-9][A-Za-z0-9_.:-]*$",
    "not": {"type": "string", "pattern": r"\s"},
}
_BOOL = {"type": "boolean"}
_DATE = {"type": "string", "format": "date", "pattern": r"^\d{4}-\d{2}-\d{2}$"}
_CONFIRM = {"type": "boolean", "enum": [True]}
_JSON_OBJECT = {"type": ["object", "null"], "maxProperties": 200}
_NUTRIENT_NAMES = (
    "calories",
    "protein",
    "carbs",
    "carbohydrates",
    "fat",
    "fiber",
    "sugar",
    "sodium",
    "saturated_fat",
    "trans_fat",
    "cholesterol",
)
_NUTRITION = {
    **_JSON_OBJECT,
    "properties": {
        key: {**_number(nullable=True), "type": ["number", "string", "null"], "maxLength": 1000}
        for key in _NUTRIENT_NAMES
    },
}
_INGREDIENT = _object(
    {
        "name": _text(1000, nonempty=True),
        "amount": _text(200, nullable=True),
        "unit": _text(100, nullable=True),
        "notes": _text(nullable=True),
        "raw": _text(8192),
        "amount_fraction": _text(200, nullable=True),
        "amount_range": {**_array(_text(200, nullable=True), 2), "minItems": 2},
        "is_heading": {"type": ["boolean", "null"]},
    },
    ["name"],
)
_RECIPE_FIELDS = {
    "name": _text(300, nonempty=True),
    "ingredients": _array(_INGREDIENT),
    "instructions": _array(_text()),
    "photos": _array(_text(4096)),
    **{
        key: _array(_text(300, nonempty=True), 200)
        for key in ("tags", "courses", "categories", "collections")
    },
    **{key: _text(nullable=True) for key in ("description", "notes")},
    **{key: _text(4096, nullable=True) for key in ("source_url", "image_url")},
    **{key: _text(300, nullable=True) for key in ("cuisine", "category", "servings_text")},
    **{
        key: _number(high=525600, nullable=True) for key in ("prep_time", "cook_time", "total_time")
    },
    "servings": _number(0.001, 10000, nullable=True),
    "nutrition": _NUTRITION,
    "declared_nutrition": _object(
        {key: _number(nullable=True) for key in _NUTRIENT_NAMES}, nullable=True
    ),
    "nutrition_basis": {"type": "string", "enum": ["per_serving", "per_recipe", "unknown"]},
    "nutrition_provenance": _JSON_OBJECT,
    "metadata": _JSON_OBJECT,
    "nutrition_raw": _JSON_OBJECT,
    "provenance": _JSON_OBJECT,
    "import_metadata": _JSON_OBJECT,
    "cuisines": _array(_text(300, nonempty=True), 200),
    "instruction_groups": _array(
        _object({"name": _text(1000), "instructions": _array(_text())}, ["name", "instructions"])
    ),
    "is_favourite": _BOOL,
    "rating": _number(1, 5, nullable=True),
}


def _descriptor(description, properties=None, required=(), *, read_only=False, network=False):
    properties = deepcopy(properties or {})
    if not read_only:
        properties["request_id"] = deepcopy(_ID)
    value = {
        "description": description,
        "read_only": read_only,
        "admin_only": True,
        "schema": _object(properties, required),
    }
    if network:
        value["network"] = True
    return value


_SEARCH_FIELDS = {
    "query": _text(300),
    "is_favourite": _BOOL,
    **{
        key: _array(_text(300, nonempty=True), 200)
        for key in ("tags", "courses", "categories", "collections")
    },
    "min_rating": _number(1, 5, integer=True),
    "limit": _number(1, 500, integer=True),
    "offset": _number(0, 1000000, integer=True),
    "sort": {"type": "string", "enum": ["name", "rating", "created_at", "updated_at"]},
    "order": {"type": "string", "enum": ["asc", "desc"]},
}

_PLAN_FIELDS = {
    "recipe_id": _ID,
    "date": _DATE,
    "meal_type": {"type": "string", "enum": ["breakfast", "lunch", "dinner", "snack", "dessert"]},
    "servings": _number(0.001, 10000),
    "notes": _text(nullable=True),
}
_TIMER_FIELDS = {
    "label": _text(300, nonempty=True),
    "duration": _number(1, 604800),
    "start_time": _number(0, 253402300799),
    "running": _BOOL,
    "paused_remaining": _number(0, 604800, nullable=True),
    "preset_id": {**_ID, "type": ["string", "null"]},
}
_PRESET_FIELDS = {"name": _text(300, nonempty=True), "seconds": _number(1, 604800)}

RECIPE_ACTIONS = {
    "recipes_add": _descriptor(
        "Create a recipe without inventing missing nutrition.",
        {**_RECIPE_FIELDS, "download_image": _BOOL},
        ["name"],
    ),
    "recipes_get": _descriptor(
        "Read one recipe.", {"recipe_id": _ID}, ["recipe_id"], read_only=True
    ),
    "recipes_get_all": _descriptor(
        "Read and optionally filter recipes.", _SEARCH_FIELDS, read_only=True
    ),
    "recipes_search": _descriptor(
        "Search recipe text and taxonomy with bounded pagination.", _SEARCH_FIELDS, read_only=True
    ),
    "recipes_update": _descriptor(
        "Update recipe fields, retaining unchanged metadata.",
        {"recipe_id": _ID, **_RECIPE_FIELDS},
        ["recipe_id"],
    ),
    "recipes_delete": _descriptor(
        "Delete one recipe and its planned entries.", {"recipe_id": _ID}, ["recipe_id"]
    ),
    "recipes_toggle_favourite": _descriptor(
        "Toggle a favourite, or set an explicit retry-safe value.",
        {"recipe_id": _ID, "is_favourite": _BOOL},
        ["recipe_id"],
    ),
    "recipes_set_favourite": _descriptor(
        "Set a favourite explicitly; repeated values are idempotent.",
        {"recipe_id": _ID, "is_favourite": _BOOL},
        ["recipe_id", "is_favourite"],
    ),
    "tags_get_all": _descriptor(
        "Read sorted unique tags, courses, categories and collections.", read_only=True
    ),
    "meal_plan_get": _descriptor(
        "Read planned entries, one exact entry or an exact seven-day week.",
        {"week_start": _DATE, "entry_id": _ID},
        read_only=True,
    ),
    "meal_plan_add": _descriptor(
        "Schedule a recipe without logging nutrition.",
        _PLAN_FIELDS,
        ["recipe_id", "date", "meal_type"],
    ),
    "meal_plan_update": _descriptor(
        "Update an existing planned entry without changing its ID.",
        {"entry_id": _ID, **_PLAN_FIELDS},
        ["entry_id"],
    ),
    "meal_plan_remove": _descriptor("Remove one planned entry.", {"entry_id": _ID}, ["entry_id"]),
    "meal_plan_clear": _descriptor(
        "Clear only the confirmed seven-day range starting at week_start.",
        {"week_start": _DATE, "confirm": _CONFIRM},
        ["week_start", "confirm"],
    ),
    "global_timers_get": _descriptor(
        "Read timers with remaining time derived from the supplied clock.",
        {"timer_id": _ID},
        read_only=True,
    ),
    "global_timers_add": _descriptor(
        "Create a global cooking timer; start_time is epoch seconds.",
        _TIMER_FIELDS,
        ["label", "duration"],
    ),
    "global_timers_update": _descriptor(
        "Edit, pause, resume or extend a cooking timer.",
        {"timer_id": _ID, **_TIMER_FIELDS},
        ["timer_id"],
    ),
    "global_timers_delete": _descriptor(
        "Stop and delete one global timer.", {"timer_id": _ID}, ["timer_id"]
    ),
    "timer_presets_get": _descriptor(
        "Read all timer presets or one exact preset.", {"preset_id": _ID}, read_only=True
    ),
    "timer_presets_add": _descriptor(
        "Create a reusable timer preset.", _PRESET_FIELDS, ["name", "seconds"]
    ),
    "timer_presets_update": _descriptor(
        "Edit a timer preset without changing active timer durations.",
        {"preset_id": _ID, **_PRESET_FIELDS},
        ["preset_id"],
    ),
    "timer_presets_delete": _descriptor(
        "Delete a preset while preserving and detaching active timers.",
        {"preset_id": _ID},
        ["preset_id"],
    ),
    "recipes_scrape": _descriptor(
        "Preview a remote recipe after explicit remote-import consent.",
        {"url": _text(4096, nonempty=True), "enabled": _CONFIRM},
        ["url", "enabled"],
        read_only=True,
        network=True,
    ),
    "recipes_download_image": _descriptor(
        "Download and privately normalize a recipe image after consent.",
        {"recipe_id": _ID, "image_url": _text(4096, nonempty=True), "enabled": _CONFIRM},
        ["recipe_id", "image_url", "enabled"],
        network=True,
    ),
    "recipes_upload_image": _descriptor(
        "Normalize an uploaded recipe photo in parent preprocessing.",
        {"recipe_id": _ID, "image_data": _text(12000000, nonempty=True)},
        ["recipe_id", "image_data"],
        network=True,
    ),
    "recipe_keeper_import": _descriptor(
        "Import recipes from inert Recipe Keeper HTML or an archive.",
        {
            "html_content": _text(8000000, nonempty=True),
            "base64_data": _text(12000000, nonempty=True),
        },
        network=True,
    ),
    "platform_info": _descriptor(
        "Read kitchen schema and recipe-domain counts; transport supplies integration version.",
        read_only=True,
    ),
    "platform_backup": _descriptor(
        "Export recipe-compatible data plus the complete staged kitchen.", read_only=True
    ),
}

for _action, _fields in (
    ("recipes_update", _RECIPE_FIELDS),
    ("meal_plan_update", _PLAN_FIELDS),
    ("global_timers_update", _TIMER_FIELDS),
    ("timer_presets_update", _PRESET_FIELDS),
):
    RECIPE_ACTIONS[_action]["schema"]["anyOf"] = [{"required": [key]} for key in _fields]
RECIPE_ACTIONS["meal_plan_get"]["schema"]["not"] = {"required": ["entry_id", "week_start"]}
RECIPE_ACTIONS["recipe_keeper_import"]["schema"]["oneOf"] = [
    {"required": ["html_content"]},
    {"required": ["base64_data"]},
]


def _json_value(value, depth=0, *, max_text=50000):
    if depth > 12:
        raise ValueError("JSON nesting exceeds limit")
    if value is None or type(value) is bool:
        return
    if isinstance(value, str):
        if len(value) > max_text:
            raise ValueError("JSON text exceeds limit")
        return
    if type(value) in (int, float):
        if not -1e12 <= value <= 1e12 or not math.isfinite(value):
            raise ValueError("JSON number must be finite and bounded")
        return
    if isinstance(value, list) and len(value) <= 1000:
        for child in value:
            _json_value(child, depth + 1, max_text=max_text)
        return
    if isinstance(value, dict) and len(value) <= 200:
        for key, child in value.items():
            if not isinstance(key, str) or len(key) > 300:
                raise ValueError("Invalid JSON key")
            _json_value(child, depth + 1, max_text=max_text)
        return
    raise ValueError("Invalid or oversized JSON value")


def _validate(value, schema, path="payload"):
    for combinator in ("anyOf", "oneOf", "not"):
        if combinator not in schema:
            continue
        candidates = [schema[combinator]] if combinator == "not" else schema[combinator]
        accepted = 0
        for candidate in candidates:
            try:
                _validate(value, candidate, path)
            except ValueError:
                pass
            else:
                accepted += 1
        if (
            (combinator == "anyOf" and not accepted)
            or (combinator == "oneOf" and accepted != 1)
            or (combinator == "not" and accepted)
        ):
            raise ValueError(f"{path}: invalid field combination")
    types = schema.get("type", [])
    types = [types] if isinstance(types, str) else types
    kinds = {
        "null": value is None,
        "boolean": type(value) is bool,
        "string": isinstance(value, str),
        "integer": type(value) is int,
        "number": type(value) in (int, float),
        "object": isinstance(value, dict),
        "array": isinstance(value, list),
    }
    if types and not any(kinds[kind] for kind in types):
        raise ValueError(f"{path}: invalid type")
    if "enum" in schema and value not in schema["enum"]:
        raise ValueError(f"{path}: invalid choice")
    if value is None:
        return
    if isinstance(value, str):
        if not schema.get("minLength", 0) <= len(value) <= schema.get("maxLength", 50000):
            raise ValueError(f"{path}: invalid length")
        if "pattern" in schema and not re.search(schema["pattern"], value):
            raise ValueError(f"{path}: invalid text")
        if schema.get("format") == "date":
            date.fromisoformat(value)
    elif type(value) in (int, float):
        if not math.isfinite(value) or not schema.get("minimum", -1e12) <= value <= schema.get(
            "maximum", 1e12
        ):
            raise ValueError(f"{path}: invalid number")
    elif isinstance(value, list):
        if not schema.get("minItems", 0) <= len(value) <= schema.get("maxItems", 1000):
            raise ValueError(f"{path}: invalid row count")
        for index, item in enumerate(value):
            _validate(item, schema.get("items", {}), f"{path}[{index}]")
    elif isinstance(value, dict):
        properties = schema.get("properties", {})
        if len(value) > schema.get("maxProperties", 200):
            raise ValueError(f"{path}: too many fields")
        if any(key not in value for key in schema.get("required", [])):
            raise ValueError(f"{path}: required field missing")
        if schema.get("additionalProperties") is False and set(value) - set(properties):
            raise ValueError(f"{path}: unknown field")
        for key, child in value.items():
            _validate(child, properties.get(key, {}), f"{path}.{key}")


def _payload(action, payload):
    if action not in RECIPE_ACTIONS:
        raise ValueError("Unknown recipe action")
    network = RECIPE_ACTIONS[action].get("network", False)
    _json_value(payload, max_text=12000000 if network else 50000)
    _validate(payload, RECIPE_ACTIONS[action]["schema"])
    if len(json.dumps(payload, allow_nan=False)) > (16000000 if network else 2000000):
        raise ValueError("Payload exceeds limit")
    if action == "recipe_keeper_import" and ("html_content" in payload) == (
        "base64_data" in payload
    ):
        raise ValueError("Supply exactly one of html_content or base64_data")


def _new_recipe(payload, now):
    record: dict[str, Any] = {key: None for key in _RECIPE_FIELDS}
    record.update(
        {
            key: []
            for key in (
                "ingredients",
                "instructions",
                "photos",
                "tags",
                "courses",
                "categories",
                "collections",
                "cuisines",
                "instruction_groups",
            )
        }
    )
    record.update(is_favourite=False, nutrition_basis="unknown")
    record.update(deepcopy({key: value for key, value in payload.items() if key in _RECIPE_FIELDS}))
    record.update(id=str(uuid4()), created_at=now, updated_at=now)
    return record


def recipe_authorize(kitchen, action, payload, actor: Actor, *, allow_missing=False):
    """Check actor and current targets before command execution or ledger replay."""
    require_admin(actor)
    _payload(action, payload)
    for field, collection in (
        ("recipe_id", "recipes"),
        ("entry_id", "meal_plan"),
        ("timer_id", "timers"),
        ("preset_id", "timer_presets"),
    ):
        if (
            payload.get(field) is not None
            and payload[field] not in kitchen[collection]
            and not allow_missing
        ):
            raise KeyError(f"{collection} record not found")


def _plan_entries(kitchen, week_start=None):
    entries = list(kitchen["meal_plan"].values())
    if week_start is not None:
        start = date.fromisoformat(week_start)
        try:
            end = start + timedelta(days=6)
        except OverflowError:
            raise ValueError("Week range exceeds supported dates") from None
        entries = [entry for entry in entries if start <= date.fromisoformat(entry["date"]) <= end]
    return entries


def _plan_read(kitchen, entry):
    result = deepcopy(entry)
    recipe = kitchen["recipes"].get(entry["recipe_id"])
    if recipe:
        result.update(recipe_name=recipe["name"], recipe_image=recipe.get("image_url"))
    return result


def _epoch(now):
    if not isinstance(now, str) or len(now) > 64:
        raise ValueError("Invalid clock timestamp")
    parsed = datetime.fromisoformat(now)
    if parsed.tzinfo is None:
        raise ValueError("Clock timestamp must include a timezone")
    epoch = parsed.timestamp()
    if not 0 <= epoch <= 253402300799:
        raise ValueError("Clock timestamp exceeds range")
    return epoch


def _timer_remaining(timer, epoch):
    if timer["running"]:
        return max(0, min(timer["duration"], timer["duration"] - (epoch - timer["start_time"])))
    return (
        timer.get("paused_remaining")
        if timer.get("paused_remaining") is not None
        else timer["duration"]
    )


def _timer_read(timer, epoch):
    remaining = _timer_remaining(timer, epoch)
    return {**deepcopy(timer), "remaining": remaining, "expired": remaining <= 0}


def _timer_change(existing, payload, now, epoch):
    if existing is None:
        timer = {
            "id": str(uuid4()),
            "start_time": epoch,
            "running": True,
            "paused_remaining": None,
            "preset_id": None,
            "created_at": now,
        }
        remaining = payload["duration"]
    else:
        timer = deepcopy(existing)
        remaining = _timer_remaining(existing, epoch)
        remaining += payload.get("duration", existing["duration"]) - existing["duration"]
    timer.update({key: value for key, value in payload.items() if key in _TIMER_FIELDS})
    remaining = min(timer["duration"], max(0, remaining))
    if timer["running"]:
        if payload.get("paused_remaining") is not None:
            raise ValueError("Running timers cannot have paused_remaining")
        if (
            existing is not None
            and (not existing["running"] or "duration" in payload)
            and "start_time" not in payload
        ):
            timer["start_time"] = epoch - (timer["duration"] - remaining)
        timer["paused_remaining"] = None
    else:
        timer["paused_remaining"] = (
            payload["paused_remaining"]
            if payload.get("paused_remaining") is not None
            else remaining
        )
        if timer["paused_remaining"] > timer["duration"]:
            raise ValueError("Paused remaining time exceeds duration")
    _validate({key: timer[key] for key in _TIMER_FIELDS}, _object(_TIMER_FIELDS))
    timer["updated_at"] = now
    return timer


def validate_declared_nutrition(declarations):
    """Equivalent aliases are one declaration, never last-key-wins nutrition."""
    if declarations is not None:
        carbs = declarations.get("carbs")
        carbohydrates = declarations.get("carbohydrates")
        if carbs is not None and carbohydrates is not None and carbs != carbohydrates:
            raise ValueError("conflicting recipe nutrient aliases")


def recipe_command(kitchen, action, payload, actor: Actor, now: str) -> dict:
    """Apply an action to a staged kitchen and return an independent JSON result."""
    recipe_authorize(kitchen, action, payload, actor)
    validate_declared_nutrition(payload.get("declared_nutrition"))
    epoch = _epoch(now)
    if RECIPE_ACTIONS[action].get("network") or payload.get("download_image"):
        raise ValueError("Action requires parent preprocessing")
    if action == "platform_info":
        return {
            "schema_version": 3,
            "recipe_count": len(kitchen["recipes"]),
            "meal_plan_count": len(kitchen["meal_plan"]),
            "timer_count": len(kitchen["timers"]),
            "timer_preset_count": len(kitchen["timer_presets"]),
        }
    if action == "platform_backup":
        return deepcopy(
            {
                "version": 1,
                "schema_version": 3,
                "recipes": list(kitchen["recipes"].values()),
                "meal_plans": list(kitchen["meal_plan"].values()),
                "timers": list(kitchen["timers"].values()),
                "timer_presets": list(kitchen["timer_presets"].values()),
                "kitchen": kitchen,
            }
        )
    if action == "recipes_add":
        record = _new_recipe(payload, now)
        kitchen["recipes"][record["id"]] = record
        return {"recipe": deepcopy(record)}
    if action == "recipes_get":
        return {"recipe": deepcopy(kitchen["recipes"][payload["recipe_id"]])}
    if action in ("recipes_get_all", "recipes_search"):
        records = list(kitchen["recipes"].values())
        query = payload.get("query", "").casefold()
        if query:
            records = [
                r
                for r in records
                if query
                in " ".join(
                    [
                        r["name"],
                        r.get("description") or "",
                        r.get("notes") or "",
                        *[i["name"] for i in r.get("ingredients", [])],
                    ]
                ).casefold()
            ]
        if "is_favourite" in payload:
            records = [
                r for r in records if r.get("is_favourite", False) == payload["is_favourite"]
            ]
        for key in ("tags", "courses", "categories", "collections"):
            if key in payload:
                records = [r for r in records if set(payload[key]).issubset(r.get(key, []))]
        if "min_rating" in payload:
            records = [r for r in records if (r.get("rating") or 0) >= payload["min_rating"]]
        if "sort" in payload:
            key = payload["sort"]
            records.sort(
                key=lambda r: (
                    (r.get(key) or 0) if key == "rating" else (r.get(key) or "").casefold(),
                    r["id"],
                ),
                reverse=payload.get("order") == "desc",
            )
        total = len(records)
        offset = payload.get("offset", 0)
        limit = payload.get("limit", 100 if action == "recipes_search" else total)
        result: dict[str, Any] = {"recipes": deepcopy(records[offset : offset + limit])}
        if action == "recipes_search" or payload:
            result.update(total=total, offset=offset, has_more=offset + limit < total)
        return result
    if action in ("recipes_update", "recipes_toggle_favourite", "recipes_set_favourite"):
        record = deepcopy(kitchen["recipes"][payload["recipe_id"]])
        if action != "recipes_update" and payload.get("is_favourite") is record.get("is_favourite"):
            return {"recipe": record}
        record.update(
            deepcopy({key: value for key, value in payload.items() if key in _RECIPE_FIELDS})
        )
        if action == "recipes_toggle_favourite" and "is_favourite" not in payload:
            record["is_favourite"] = not record.get("is_favourite", False)
        record["updated_at"] = now
        kitchen["recipes"][record["id"]] = record
        return {"recipe": deepcopy(record)}
    if action == "recipes_delete":
        rid = payload["recipe_id"]
        del kitchen["recipes"][rid]
        removed = [key for key, value in kitchen["meal_plan"].items() if value["recipe_id"] == rid]
        for key in removed:
            del kitchen["meal_plan"][key]
        return {"id": rid, "deleted": True, "removed_plan_entries": removed}
    if action == "tags_get_all":
        return {
            key: sorted({value for r in kitchen["recipes"].values() for value in r.get(key, [])})
            for key in ("tags", "courses", "categories", "collections")
        }
    if action == "meal_plan_get":
        if "entry_id" in payload:
            return {"entry": _plan_read(kitchen, kitchen["meal_plan"][payload["entry_id"]])}
        return {
            "entries": [
                _plan_read(kitchen, entry)
                for entry in _plan_entries(kitchen, payload.get("week_start"))
            ]
        }
    if action in ("meal_plan_add", "meal_plan_update"):
        if action == "meal_plan_add":
            record = {"id": str(uuid4()), "servings": 1, "notes": None, "created_at": now}
        else:
            record = deepcopy(kitchen["meal_plan"][payload["entry_id"]])
        record.update(
            deepcopy({key: value for key, value in payload.items() if key in _PLAN_FIELDS})
        )
        record["updated_at"] = now
        kitchen["meal_plan"][record["id"]] = record
        return {"entry": deepcopy(record)}
    if action == "meal_plan_remove":
        eid = payload["entry_id"]
        del kitchen["meal_plan"][eid]
        return {"id": eid, "removed": True}
    if action == "meal_plan_clear":
        entries = _plan_entries(kitchen, payload["week_start"])
        for entry in entries:
            del kitchen["meal_plan"][entry["id"]]
        return {
            "cleared": len(entries),
            "week_start": payload["week_start"],
            "removed_ids": [entry["id"] for entry in entries],
        }
    if action == "global_timers_get":
        if "timer_id" in payload:
            return {"timer": _timer_read(kitchen["timers"][payload["timer_id"]], epoch)}
        return {"timers": [_timer_read(timer, epoch) for timer in kitchen["timers"].values()]}
    if action in ("global_timers_add", "global_timers_update"):
        existing = (
            kitchen["timers"][payload["timer_id"]] if action == "global_timers_update" else None
        )
        record = _timer_change(existing, payload, now, epoch)
        kitchen["timers"][record["id"]] = record
        return {"timer": deepcopy(record)}
    if action == "global_timers_delete":
        tid = payload["timer_id"]
        del kitchen["timers"][tid]
        return {"id": tid, "deleted": True}
    if action == "timer_presets_get":
        if "preset_id" in payload:
            return {"preset": deepcopy(kitchen["timer_presets"][payload["preset_id"]])}
        return {"presets": deepcopy(list(kitchen["timer_presets"].values()))}
    if action in ("timer_presets_add", "timer_presets_update"):
        record = (
            deepcopy(kitchen["timer_presets"][payload["preset_id"]])
            if action == "timer_presets_update"
            else {"id": str(uuid4()), "created_at": now}
        )
        record.update({key: value for key, value in payload.items() if key in _PRESET_FIELDS})
        record["updated_at"] = now
        kitchen["timer_presets"][record["id"]] = record
        return {"preset": deepcopy(record)}
    if action == "timer_presets_delete":
        pid = payload["preset_id"]
        del kitchen["timer_presets"][pid]
        for timer in kitchen["timers"].values():
            if timer.get("preset_id") == pid:
                timer.update(preset_id=None, updated_at=now)
        return {"id": pid, "deleted": True}
    raise ValueError("Unknown recipe action")
