"""Pure, staged import of pinned Recipe-Manager private Store data.

Source contract inspected as DATA, never imported or executed:
Recipe-Manager 3c6dcba4b84872ac432e1198f6e855d437cfa294, const.py,
models.py, storage.py and websocket/handlers.py. The four accepted Store names
are constants below; raw records are ID-keyed dictionaries, not API responses.
This is independent conversion code, not an upstream lifecycle/migration hook.
The upstream model contract is MIT, Copyright (c) 2026 thekiwismarthome.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The pin has 43 fields ACROSS Recipe (25), Ingredient (5), MealPlanEntry (6)
and the GlobalTimerStorage record (7); it does not have 43 recipe fields.
Current native Recipe records contain 34 fields, including identity/dates.

Format contract:
- Each exact Store key maps to decoded raw data OR exactly
  {version: 1, minor_version: 1, key: <matching Store key>, data: <raw>}.
- Recipes/meal_plans/global_timers raw data are ID-keyed record maps. Only the
  legacy title/name and favourite/is_favourite aliases are translated; equal
  duplicates are accepted, conflicts rejected. No generic wrapper probing.
- A global_timers transfer extension may be exactly
  {timers: <ID map>, timer_presets: <array of rm_timer_presets records>}.
  The preset array is explicitly supplied browser data, NOT a native HA Store.
- The unused upstream tags constant may carry an auxiliary string array;
  retain it as inert importer preferences, never invent recipe taxonomy.
- Source nutrition/raw metadata, including numeric zero, remain literal.
  The pinned format does not declare nutrient units/basis; never infer current
  declared_nutrition from it. Explicit current declaration fields are retained.
- images maps exact old local URL references to supplied base64, not paths.
  Both original local prefixes are supported; all referenced local images
  require bytes, all supplied images require a reference. Remote references
  remain inert metadata. Existing valid current private references are retained.

Call only on a DETACHED full MacroMate root inside the coordinator's executor
transaction. The parent must require admin, confirm=True, request_id, source,
and an explicit preserve_permissions boolean, then full-restore-validate the
result before durable commit/publication/ledger. This helper also checks admin;
there are no recipe ACL extensions or public-media inheritance semantics.
"""
from __future__ import annotations

from copy import deepcopy
import re
from urllib.parse import unquote, urlsplit
from uuid import uuid4

from .platform_support import Actor, empty_kitchen, require_admin, validate_json
from .recipes import (
    _ID, _PLAN_FIELDS, _PRESET_FIELDS, _RECIPE_FIELDS, _TIMER_FIELDS,
    _epoch, _json_value, _object, _validate,
)

RECIPES = "recipe_manager.recipes"
MEAL_PLANS = "recipe_manager.meal_plans"
GLOBAL_TIMERS = "recipe_manager.global_timers"
TAGS = "recipe_manager.tags"
STORE_KEYS = (RECIPES, MEAL_PLANS, GLOBAL_TIMERS, TAGS)


def _record(key, raw, fields, now, defaults):
    _validate(key, _ID)
    if not isinstance(raw, dict) or raw.get("id") != key:
        raise ValueError("legacy record identity mismatch")
    if set(raw) - (set(fields) | {"id", "created_at", "updated_at"}):
        raise ValueError("unknown legacy record field")
    _json_value(raw)
    record = deepcopy(defaults)
    record.update(deepcopy(raw))
    record.setdefault("created_at", now)
    record.setdefault("updated_at", now)
    _validate({k: v for k, v in record.items() if k in fields}, _object(fields, fields))
    _epoch(record["created_at"])
    _epoch(record["updated_at"])
    return record


def _store_data(key, value):
    # A raw record map can legitimately contain IDs named 'data'/'version'.
    # Only the full, exact HA envelope is unwrapped; malformed envelopes fail
    # closed in the record validator instead of arbitrary-key probing.
    if isinstance(value, dict) and all(
            isinstance(row, dict) and row.get("id") == rid for rid, row in value.items()):
        return value
    if isinstance(value, dict) and set(value) == {"version", "minor_version", "key", "data"}:
        if (type(value["version"]) is not int or value["version"] != 1
                or type(value["minor_version"]) is not int or value["minor_version"] != 1
                or value["key"] != key):
            raise ValueError("unsupported legacy Store envelope")
        return value["data"]
    return value


def _recipe_aliases(raw):
    if not isinstance(raw, dict):
        raise ValueError("legacy recipe must be an object")
    result = deepcopy(raw)
    # Equal aliases are accepted; conflicting aliases never silently overwrite
    # an explicit False, an existing title, or other original source values.
    for old, current in (("title", "name"), ("favourite", "is_favourite")):
        if old in result:
            _validate(result[old], _RECIPE_FIELDS[current])
            if current in result and (type(result[current]) is not type(result[old])
                                      or result[current] != result[old]):
                raise ValueError("conflicting legacy recipe aliases")
            result[current] = result.pop(old)
    return result


def _recipe_defaults():
    # Same legitimate defaults as recipes._new_recipe, without generating a new
    # record identity and subsequently replacing it. Native schemas stay shared.
    value = dict.fromkeys(_RECIPE_FIELDS)
    for key in ("ingredients", "instructions", "photos", "tags", "courses",
                "categories", "collections", "cuisines", "instruction_groups"):
        value[key] = []
    value.update(is_favourite=False, nutrition_basis="unknown")
    return value


LOCAL_IMAGE_PREFIXES = ("/local/recipe_manager/images/", "/local/images/recipe_manager/")


def _image_reference(reference, kitchen):
    from .private_media import PREFIX, media_id

    if reference is None or reference == "":
        return "empty"
    if not isinstance(reference, str) or len(reference) > 4096 or any(
            ord(char) <= 32 or ord(char) == 127 for char in reference) or "\\" in reference:
        raise ValueError("malformed legacy image reference")
    for prefix in LOCAL_IMAGE_PREFIXES:
        if reference.startswith(prefix):
            filename = reference[len(prefix):]
            if (not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,249}", filename)
                    or ".." in filename or "." not in filename):
                raise ValueError("malformed legacy local image reference")
            return "local"
    if reference.startswith(PREFIX):
        mid = media_id(reference)
        if mid is None or mid not in kitchen["media"]:
            raise ValueError("missing legacy private image")
        return "private"
    try:
        parsed = urlsplit(reference)
        port = parsed.port  # Validate malformed ports even though never fetched.
    except ValueError:
        raise ValueError("malformed legacy remote image reference") from None
    decoded_path = unquote(parsed.path)
    if (parsed.scheme not in ("http", "https") or not parsed.hostname
            or parsed.username is not None or parsed.password is not None
            or port is not None and not 1 <= port <= 65535
            or "%" in parsed.netloc or parsed.fragment
            or re.search(r"%(?![0-9A-Fa-f]{2})", reference)
            or "%" in decoded_path or "\\" in decoded_path
            or any(ord(char) < 32 or ord(char) == 127 for char in decoded_path)
            or any(part in (".", "..") for part in decoded_path.split("/"))):
        raise ValueError("unsupported legacy image reference")
    return "remote"  # Inert metadata, never automatically retrieved.


def _migrate_images(kitchen, recipe_ids, images, actor, result):
    from .kitchen_network import normalize_image
    from .private_media import PREFIX

    if not isinstance(images, dict) or len(images) > 10000:
        raise ValueError("images must map exact local URL references to base64")
    for reference, data in images.items():
        if _image_reference(reference, kitchen) != "local" or not isinstance(data, str):
            raise ValueError("only supplied legacy local image bytes are accepted")
    for rid in recipe_ids:
        recipe = kitchen["recipes"][rid]
        def migrate(reference):
            if _image_reference(reference, kitchen) != "local":
                return reference
            if reference not in images:
                raise ValueError("legacy local image bytes required")
            if reference not in result["image_map"]:
                record = normalize_image(images[reference])
                mid = str(uuid4())
                if mid in kitchen["media"]:
                    raise ValueError("legacy media ID collision")
                kitchen["media"][mid] = {**record, "owner_id": actor.owner_id, "allowed_users": []}
                result["media_ids"].append(mid)
                result["image_map"][reference] = PREFIX + mid
            return result["image_map"][reference]
        recipe["image_url"] = migrate(recipe["image_url"])
        recipe["photos"] = [migrate(ref) for ref in recipe["photos"]]
    if set(images) != set(result["image_map"]):
        raise ValueError("unreferenced supplied legacy image")


def import_legacy_recipes(state: dict, stores: dict, images: dict, actor: Actor,
                          now: str, *, preserve_permissions: bool = False) -> dict:
    """Convert caller-supplied inert data; no HA, paths, files or network calls.

    Reject the entire bundle on corruption or ID collision. Only the provided
    root's kitchen is adopted, after all conversions pass. Parent staging and
    full-root restore validation are still required for transaction atomicity.
    """
    require_admin(actor)
    if type(preserve_permissions) is not bool:
        raise ValueError("preserve_permissions must be a boolean")
    _epoch(now)
    if not isinstance(state, dict) or not isinstance(state.get("kitchen"), dict):
        raise ValueError("detached full root with kitchen required")
    if (set(state["kitchen"]) != set(empty_kitchen())
            or any(not isinstance(rows, dict) for rows in state["kitchen"].values())):
        raise ValueError("invalid detached kitchen collections")
    if not isinstance(stores, dict) or not stores or set(stores) - set(STORE_KEYS):
        raise ValueError("unsupported legacy Store key")
    stores = validate_json(stores, max_bytes=67108864)
    stores = {key: _store_data(key, value) for key, value in stores.items()}
    images = validate_json(images, max_bytes=67108864)
    kitchen = deepcopy(state["kitchen"])
    result = {"source": "recipe_manager", "imported": True, "recipe_ids": [],
              "meal_plan_ids": [], "timer_ids": [], "timer_preset_ids": [],
              "media_ids": [], "image_map": {}, "tag_count": 0}
    timers = stores.get(GLOBAL_TIMERS, {})
    if (isinstance(timers, dict) and set(timers) == {"timers", "timer_presets"}
            and isinstance(timers["timer_presets"], list)):
        # Explicit transfer extension for the card's rm_timer_presets array.
        # These are NOT claimed to be a separate native HA preset Store.
        presets = timers["timer_presets"]
        if len(presets) > 1000:
            raise ValueError("too many legacy timer presets")
        for raw in presets:
            key = raw.get("id") if isinstance(raw, dict) else None
            record = _record(key, raw, _PRESET_FIELDS, now, {})
            if key in kitchen["timer_presets"]:
                raise ValueError("legacy preset ID collision")
            kitchen["timer_presets"][key] = record
            result["timer_preset_ids"].append(key)
        stores[GLOBAL_TIMERS] = timers["timers"]
    if TAGS in stores:
        # The pin defines this key but derives tags from recipes, without ever
        # writing a tags Store. Preserve an explicitly supplied auxiliary list
        # as inert private importer preferences; do not invent recipe tags.
        _validate(stores[TAGS], {"type": "array", "maxItems": 10000,
                               "items": {"type": "string", "minLength": 1, "maxLength": 300}})
        prefs = kitchen["preferences"].setdefault(actor.owner_id, {})
        if "legacy_recipe_manager_tags" in prefs:
            raise ValueError("legacy tags preference collision")
        prefs["legacy_recipe_manager_tags"] = deepcopy(stores[TAGS])
        result["tag_count"] = len(stores[TAGS])
    for store, bucket, fields, defaults, result_key in (
        (RECIPES, "recipes", _RECIPE_FIELDS, _recipe_defaults(), "recipe_ids"),
        (MEAL_PLANS, "meal_plan", _PLAN_FIELDS, {"servings": 1, "notes": None}, "meal_plan_ids"),
        (GLOBAL_TIMERS, "timers", _TIMER_FIELDS,
         {"running": True, "paused_remaining": None, "preset_id": None}, "timer_ids"),
    ):
        rows = stores.get(store, {})
        if not isinstance(rows, dict) or len(rows) > 10000:
            raise ValueError("invalid legacy record collection")
        for key, raw in rows.items():
            if key in kitchen[bucket]:
                raise ValueError("legacy record ID collision")
            if bucket == "recipes":
                raw = _recipe_aliases(raw)
            record = _record(key, raw, fields, now, defaults)
            if bucket == "recipes":
                from .recipes import validate_declared_nutrition
                validate_declared_nutrition(record["declared_nutrition"])
                if "nutrition_raw" not in raw:
                    record["nutrition_raw"] = deepcopy(record["nutrition"])
            kitchen[bucket][key] = record
            result[result_key].append(key)
    for entry in kitchen["meal_plan"].values():
        if entry["recipe_id"] not in kitchen["recipes"]:
            raise ValueError("missing legacy planned recipe")
    for timer in kitchen["timers"].values():
        if timer["preset_id"] is not None and timer["preset_id"] not in kitchen["timer_presets"]:
            raise ValueError("missing legacy timer preset")
        remaining = timer["paused_remaining"]
        if timer["running"] and remaining is not None or remaining is not None and remaining > timer["duration"]:
            raise ValueError("invalid legacy timer pause state")
    _migrate_images(kitchen, result["recipe_ids"], images, actor, result)
    state["kitchen"] = kitchen
    return result
