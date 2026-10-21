"""Unified registry and staged kitchen runtime shared by native transports."""

from __future__ import annotations

import math
from copy import deepcopy
from uuid import uuid4

from .household import NUTRITION_COMMANDS
from .household import descriptors as profile_descriptors
from .models import MEAL_TYPES, NUTRIENTS, MealEntry
from .platform_support import (
    Actor,
    require_access,
    require_admin,
    require_nutrition,
    utc_timestamp,
    validate_payload,
)
from .recipes import RECIPE_ACTIONS, recipe_authorize, recipe_command, validate_declared_nutrition
from .runtime_api import DiaryCommands
from .storage_budget import (
    MAX_DATA_BYTES,
    MAX_RESTORE_METADATA_BYTES,
    MAX_RESTORE_RECEIPT_BYTES,
    MAX_RESTORE_RECEIPTS,
    MAX_STORAGE_BYTES,
    MAX_TRANSFER_BYTES,
    validate_storage_root,
)

SERVINGS = {"type": "number", "exclusiveMinimum": 0, "maximum": 100000}
MEAL = {"type": "string", "enum": list(MEAL_TYPES)}
DAY = {"type": "string", "format": "date"}

VERSION = "0.4.0"
LEGACY_SERVICES = {
    "list_meals": "diary",
    "log_meal": "log_meal",
    "update_meal": "update_meal",
    "delete_meal": "delete_meal",
    "clear_day": "clear_day",
    "copy_meal": "copy_meal",
    "search_foods": "search_foods",
    "get_food": "food",
    "lookup_barcode": "barcode",
    "save_food": "save_food",
    "set_favorite": "favorite",
    "log_food": "log_food",
    "update_food_entry": "update_food_entry",
}
ID = {"type": "string", "minLength": 1, "maxLength": 128}


def descriptor(description, properties=None, required=(), *, read=False, admin=True):
    properties = deepcopy(properties or {})
    if not read:
        properties["request_id"] = ID
    return {
        "description": description,
        "read_only": read,
        "admin_only": admin,
        "schema": {
            "type": "object",
            "properties": properties,
            "required": list(required),
            "additionalProperties": False,
        },
    }


ACTIONS = {
    **deepcopy(RECIPE_ACTIONS),
    "describe": descriptor(
        "Discover the authoritative command registry and finite transport limits.",
        read=True,
        admin=False,
    ),
    "recipe_log": descriptor(
        "Log explicit recipe portions using an immutable declared-nutrition snapshot.",
        {"recipe_id": ID, "servings": SERVINGS, "meal_type": MEAL, "date": DAY},
        ["recipe_id", "servings", "meal_type"],
    ),
    "recipe_entry_update": descriptor(
        "Scale the recorded recipe snapshot, not the current recipe.",
        {"entry_id": ID, "servings": SERVINGS, "meal_type": MEAL},
        ["entry_id"],
    ),
    "food_delete": descriptor(
        "Delete a local or cached food without rewriting recorded diary snapshots.",
        {"food_id": ID},
        ["food_id"],
    ),
    "preferences_get": descriptor(
        "Read authenticated-user UI preferences.", read=True, admin=False
    ),
    "preferences_update": descriptor(
        "Patch authenticated-user UI preferences without changing ACL or provider consent.",
        {"preferences": {"type": "object", "maxProperties": 100}},
        ["preferences"],
        admin=False,
    ),
    "legacy_import": descriptor(
        (
            "Atomically import explicitly supplied standalone legacy stores "
            "and images; never read server files or fetch URLs."
        ),
        {
            "source": {"const": "recipe_manager"},
            "stores": {
                "type": "object",
                "minProperties": 1,
                "maxProperties": 8,
                "additionalProperties": {"type": ["object", "array"]},
            },
            "images": {
                "type": "object",
                "maxProperties": 1000,
                "additionalProperties": {
                    "type": "string",
                    "minLength": 4,
                    "maxLength": 4 * ((8 * 1024 * 1024 + 2) // 3) + 64,
                },
            },
            "preserve_permissions": {"type": "boolean"},
            "confirm": {"const": True},
        },
        ["source", "stores", "preserve_permissions", "confirm", "request_id"],
    ),
    "platform_restore": descriptor(
        "Atomically restore a validated complete private dataset after explicit confirmation.",
        {"data": {"type": "object"}, "confirm": {"const": True}},
        ["data", "confirm"],
    ),
}

# Only recipe migration remains operational; historical shopping is restored
# exclusively as inert data in a complete administrative backup.
ACTIONS["legacy_import"]["schema"]["properties"]["request_id"] = {
    **ID,
    "pattern": r"^[^\x00-\x1f]*[^\s\x00-\x1f][^\x00-\x1f]*$",
}

CROSS_ACTIONS = {
    "recipe_log",
    "recipe_entry_update",
    "food_delete",
    "preferences_get",
    "preferences_update",
    "legacy_import",
    "platform_restore",
}


def recipe_nutrients(recipe, servings):
    basis = recipe.get("nutrition_basis")
    nutrition = recipe.get("declared_nutrition")
    if (
        not isinstance(nutrition, dict)
        or nutrition.get("calories") is None
        or basis not in ("per_recipe", "per_serving")
    ):
        raise ValueError("recipe requires declared calories and a known nutrition basis")
    validate_declared_nutrition(nutrition)
    denominator = recipe.get("servings") if basis == "per_recipe" else 1
    if type(denominator) not in (int, float) or denominator <= 0:
        raise ValueError("per-recipe nutrition requires a positive recipe yield")
    values = {}
    aliases = {"carbohydrates": "carbs"}
    for key, value in nutrition.items():
        if value is None:
            continue
        if type(value) not in (int, float) or not math.isfinite(value) or value < 0:
            raise ValueError("invalid declared recipe nutrient")
        scaled = value * servings / denominator
        if not math.isfinite(scaled) or scaled > 1000000:
            raise ValueError("scaled nutrient outside supported range")
        values[aliases.get(key, key)] = round(scaled, 6)
    return values


NUM = {"type": "number", "minimum": 0, "maximum": 100000}
TEXT = {"type": "string", "minLength": 1, "maxLength": 300}
PORTION = {"amount": NUM, "serving_id": TEXT, "quantity": NUM}
NUTRITION_ACTIONS = {
    "diary": descriptor("Read a private dated diary.", {"date": DAY}, read=True),
    "food": descriptor(
        "Read an exact nutrient-tracked food.", {"food_id": ID}, ["food_id"], read=True
    ),
    "search_foods": descriptor(
        "Search foods; online requests also query Open Food Facts using only the submitted food name.",
        {
            "query": {"type": "string", "maxLength": 200},
            "filter": {"enum": ["all", "favorites", "recent", "custom"]},
            "online": {"type": "boolean"},
        },
        read=True,
    ),
    "barcode": descriptor(
        "Look up an exact food barcode; online requests also query Open Food Facts when it is not cached.",
        {"barcode": TEXT, "online": {"type": "boolean"}},
        ["barcode"],
        read=True,
    ),
    "log_meal": descriptor(
        "Create a quick meal retaining missing declarations.",
        {
            "name": {**TEXT, "maxLength": 120},
            "meal_type": MEAL,
            **{k: NUM for k in NUTRIENTS},
            "date": DAY,
            "eaten_at": TEXT,
        },
        ["name", "meal_type", "calories"],
    ),
    "update_meal": descriptor(
        "Patch a quick meal; null clears optional declarations.",
        {
            "entry_id": ID,
            "name": {**TEXT, "maxLength": 120},
            "meal_type": MEAL,
            "calories": NUM,
            **{k: {**NUM, "type": ["number", "null"]} for k in ("protein", "carbs", "fat")},
            "eaten_at": TEXT,
        },
        ["entry_id"],
    ),
    "delete_meal": descriptor("Delete an exact diary entry.", {"entry_id": ID}, ["entry_id"]),
    "copy_meal": descriptor(
        "Copy a recorded snapshot to an explicit date.",
        {"entry_id": ID, "date": DAY, "meal_type": MEAL},
        ["entry_id", "date"],
    ),
    "clear_day": descriptor(
        "Clear only an explicitly confirmed dated diary.",
        {"date": DAY, "confirm": {"const": True}},
        ["date", "confirm"],
    ),
    "favorite": descriptor(
        "Set an exact food favorite.",
        {"food_id": ID, "enabled": {"type": "boolean"}, **PORTION},
        ["food_id", "enabled"],
    ),
    "save_food": descriptor(
        "Create or replace a locally declared nutrient-tracked food.",
        {"food": {"type": "object"}},
        ["food"],
    ),
    "log_food": descriptor(
        "Log a declared food portion with an immutable snapshot.",
        {"food_id": ID, "meal_type": MEAL, "date": DAY, "eaten_at": TEXT, **PORTION},
        ["food_id", "meal_type"],
    ),
    "update_food_entry": descriptor(
        "Scale a recorded food snapshot.",
        {"entry_id": ID, "meal_type": MEAL, **PORTION},
        ["entry_id"],
    ),
}
ACTIONS.update(NUTRITION_ACTIONS)

ACTIONS["nutrition_report"] = descriptor(
    "Read an ISO week or calendar month report without inventing historical goals.",
    {"period": {"enum": ["week", "month"]}, "date": DAY},
    read=True,
    admin=False,
)
ACTIONS.update(profile_descriptors(descriptor, ID))
for _action in NUTRITION_COMMANDS:
    ACTIONS[_action]["schema"]["properties"]["profile_id"] = ID
    ACTIONS[_action]["admin_only"] = False

LIMITS = {
    "root_state_bytes": MAX_STORAGE_BYTES,
    "root_data_budget_bytes": MAX_DATA_BYTES,
    "root_state_depth": 32,
    "restore_metadata_reserve_bytes": MAX_RESTORE_METADATA_BYTES,
    "restore_receipt_bytes": MAX_RESTORE_RECEIPT_BYTES,
    "restore_receipt_entries": MAX_RESTORE_RECEIPTS,
    "root_budget_policy": (
        "Only exact bounded administrative restore receipts are "
        "uncharged; ordinary data and other operation history share the "
        "original 64 MiB budget. All history remains in the same atomic "
        "Store and backup."
    ),
    "command_payload_bytes": 8388608,
    "snapshot_bytes": 2097152,
    "replay_entries": 1000,
    "client_default_request_bytes": 1048576,
    "client_default_response_bytes": 4194304,
    "native_ha_http_request_bytes": 16777216,
    "native_ha_ws_message_bytes": 4194304,
    "command_response_bytes": 8388608,
    "media_bytes": 8388608,
    "backup_route": "/api/macromate/backup",
    "restore_route": "/api/macromate/restore",
    "restore_http_request_bytes": MAX_TRANSFER_BYTES,
    "backup_http_response_bytes": MAX_STORAGE_BYTES + 10,
    "legacy_import_route": "/api/macromate/legacy-import",
    "legacy_import_http_request_bytes": MAX_TRANSFER_BYTES,
    "large_transfer": (
        "The native WS frame cap includes its envelope. Large backups and "
        "legacy imports require the dedicated authenticated HTTP routes; "
        "generic clients retain their smaller limits."
    ),
}


class PlatformCommands(DiaryCommands):
    def _validate_restore(self, data):
        from .restore_consistency import normalize_legacy_recipe_sugar

        data = normalize_legacy_recipe_sugar(data)
        # Dormant historical schemas/catalog references only, never dispatch.
        from . import shopping
        from .foods import FoodProduct, ServingDefinition
        from .platform_support import empty_kitchen, identifier
        from .recipes import _ID as recipe_id_schema
        from .recipes import _epoch

        def persisted_schema(action):
            # Native persisted records are complete models, not create patches.
            props = deepcopy(ACTIONS[action]["schema"]["properties"])
            for field in ("request_id", "download_image"):
                props.pop(field, None)
            props.update(
                id=recipe_id_schema,
                created_at={"type": "string", "minLength": 1, "maxLength": 64},
                updated_at={"type": "string", "minLength": 1, "maxLength": 64},
            )
            return {
                "type": "object",
                "properties": props,
                "required": list(props),
                "additionalProperties": False,
            }

        recipe_schema = persisted_schema("recipes_add")
        decoded = self._decode_state(data)
        # Root restore must not use legacy model coercions to repair malformed
        # identifiers or turn booleans into nutrient declarations.
        for row in data.get("entries", []):
            if set(row) - set(MealEntry.__dataclass_fields__):
                raise ValueError("unknown diary entry field")
            for key in ("id", "name", "meal_type", "eaten_at"):
                validate_payload(row[key], {"type": "string"})
            for key in NUTRIENTS:
                validate_payload(row[key], {"type": "number", "minimum": 0})
            for key in ("amount", "quantity", "recipe_servings"):
                if row.get(key) is not None:
                    validate_payload(
                        row[key], {"type": "number", "exclusiveMinimum": 0, "maximum": 100000}
                    )
            for key in ("food_id", "serving_id", "recipe_id"):
                if row.get(key) is not None:
                    identifier(row[key], key)
            if row.get("base_unit") is not None:
                validate_payload(row["base_unit"], {"enum": ["g", "ml"]})
            for key in ("food_snapshot", "recipe_snapshot"):
                if row.get(key) is not None:
                    validate_payload(row[key], {"type": "object"})
            if (row.get("food_id") is not None) != (row.get("food_snapshot") is not None):
                raise ValueError("food entries require an identified snapshot")
            if row.get("food_snapshot") is not None:
                snapshot = row["food_snapshot"]
                food = FoodProduct.from_dict(snapshot)
                if food.food_id != row["food_id"] or food.base_unit != row["base_unit"]:
                    raise ValueError("food snapshot identity or base unit mismatch")
                fields = ServingDefinition.__dataclass_fields__
                for serving in snapshot["servings"]:
                    validate_payload(
                        serving,
                        {
                            "type": "object",
                            "properties": {key: {} for key in fields},
                            "required": list(fields),
                            "additionalProperties": False,
                        },
                    )
                if row.get("serving_id") is not None or row.get("quantity") is not None:
                    amount = food.portion_amount(
                        serving_id=row.get("serving_id"), quantity=row.get("quantity")
                    )
                    if not math.isclose(amount, row["amount"], rel_tol=1e-12):
                        raise ValueError("food snapshot serving conflicts with amount")
                nutrition = food.scaled(row["amount"])
                if "calories" not in nutrition:
                    raise ValueError("food snapshot requires declared calories")
                canonical = food.to_dict()
                if set(snapshot) != set(canonical):
                    raise ValueError("incomplete or unknown food snapshot field")
                # These serialized projections are not constructor inputs.
                for field in ("is_custom", "is_favorite", "nutrient_units", "missing_nutrients"):
                    validate_payload(snapshot[field], {"const": canonical[field]})
            if row.get("recipe_snapshot") is not None:
                snapshot = row["recipe_snapshot"]
                validate_payload(snapshot, recipe_schema)
                _epoch(snapshot["created_at"])
                _epoch(snapshot["updated_at"])
                recipe_nutrients(snapshot, row["recipe_servings"])
            if row.get("nutrients") is not None:
                validate_payload(
                    row["nutrients"],
                    {
                        "type": "object",
                        "additionalProperties": {"type": "number", "minimum": 0},
                    },
                )
        for day, goal in data.get("daily_goals", {}).items():
            validate_payload(day, DAY)
            if not isinstance(goal, dict) or not {
                "calorie_target",
                "protein",
                "carbs",
                "fat",
            } <= set(goal):
                raise ValueError("invalid dated nutrition goal")
            for key in ("calorie_target", "protein", "carbs", "fat"):
                validate_payload(goal[key], {"type": "number", "minimum": 0})
        kitchen = decoded[-1]
        if set(kitchen) != set(empty_kitchen()):
            raise ValueError("unknown kitchen collection")
        for key, food in data.get("foods", {}).items():
            if FoodProduct.from_dict(food).food_id != key:
                raise ValueError("food identity mismatch")
        for key, favorite in data.get("favorites", {}).items():
            FoodProduct.from_dict({**data["foods"][key], "favorite": favorite})
        for owner, preferences in kitchen["preferences"].items():
            identifier(owner)
            if "ui" in preferences and not isinstance(preferences["ui"], dict):
                raise ValueError("invalid UI preferences")
            if "shopping_usage" in preferences:
                usage = preferences["shopping_usage"]
                if not isinstance(usage, dict):
                    raise ValueError("invalid shopping usage")
                for pid, record in usage.items():
                    identifier(pid)
                    validate_payload(record, shopping.USAGE_RECORD)
                    if record["last_used"] is not None:
                        from .recipes import _epoch

                        _epoch(record["last_used"])
            # Other user preference extensions are inert JSON, retained for
            # additive compatibility. Only the reserved shopping settings have
            # a closed field vocabulary; UI keys are intentionally extensible.
            if owner == "shopping":
                validate_payload(preferences, shopping.BACKUP["properties"]["settings"])
                country = preferences.get("country", "NZ")
                if country not in shopping.COUNTRIES and country not in kitchen["regions"]:
                    raise ValueError("missing selected shopping region")
        for bucket, action in (
            ("recipes", "recipes_add"),
            ("meal_plan", "meal_plan_add"),
            ("timers", "global_timers_add"),
            ("timer_presets", "timer_presets_add"),
        ):
            # Creation inputs are partial patches. Persisted records contain
            # every domain field (including null/default values) and timestamps;
            # validate the original record, never a lossy field projection.
            schema = persisted_schema(action)
            for key, row in kitchen[bucket].items():
                validate_payload(row, schema)
                if bucket == "recipes":
                    validate_declared_nutrition(row["declared_nutrition"])
                if row["id"] != key:
                    raise ValueError("kitchen identity mismatch")
                _epoch(row["created_at"])
                _epoch(row["updated_at"])
                if bucket == "meal_plan" and row["recipe_id"] not in kitchen["recipes"]:
                    raise ValueError("missing planned recipe")
                if bucket == "timers":
                    if (
                        row["preset_id"] is not None
                        and row["preset_id"] not in kitchen["timer_presets"]
                    ):
                        raise ValueError("missing timer preset")
                    remaining = row["paused_remaining"]
                    if (
                        row["running"]
                        and remaining is not None
                        or remaining is not None
                        and remaining > row["duration"]
                    ):
                        raise ValueError("invalid timer pause state")
        schemas = {
            "shopping_lists": shopping.LIST_RECORD,
            "shopping_items": shopping.ITEM_RECORD,
            "products": shopping.PRODUCT_RECORD,
            "categories": shopping.CATEGORY_RECORD,
            "loyalty_cards": shopping.CARD_RECORD,
            "regions": shopping.REGION_RECORD,
        }
        # Required persisted fields shared by native creation and additive
        # shopping imports. Import-optional metadata (e.g. product timestamps,
        # item order_index, region currency) must remain optional here.
        required = {
            "shopping_lists": {
                "id",
                "name",
                "icon",
                "owner_id",
                "allowed_users",
                "created_at",
                "updated_at",
                "item_order",
                "category_order",
                "ha_todo_entity_id",
            },
            "shopping_items": {
                "id",
                "list_id",
                "name",
                "category_id",
                "product_id",
                "quantity",
                "unit",
                "note",
                "price",
                "currency",
                "image_url",
                "barcode",
                "checked",
                "checked_at",
                "created_at",
                "updated_at",
                "estimated_total",
            },
            "products": {
                "id",
                "owner_id",
                "allowed_users",
                "name",
                "category_id",
                "aliases",
                "default_unit",
                "default_quantity",
                "price",
                "currency",
                "nutrition",
                "region",
                "source",
                "custom",
            },
            "categories": {
                "id",
                "owner_id",
                "allowed_users",
                "name",
                "icon",
                "color",
                "sort_order",
                "region",
                "system",
            },
            "loyalty_cards": {
                "id",
                "owner_id",
                "allowed_users",
                "name",
                "number",
                "barcode",
                "barcode_type",
                "logo",
                "notes",
                "color",
                "created_at",
                "updated_at",
            },
            "regions": {"id", "code", "name", "owner_id", "allowed_users"},
        }
        for bucket, schema in schemas.items():
            schema = {**schema, "required": sorted(required[bucket])}
            for key, row in kitchen[bucket].items():
                validate_payload(row, schema)
                # Items inherit their parent list's ACL; ordinary persisted
                # items intentionally have no independent ownership grant.
                if bucket != "shopping_items" and (
                    "owner_id" not in row or "allowed_users" not in row
                ):
                    raise ValueError("explicit object ACL required")
                for owner in [row["owner_id"]] if row.get("owner_id") is not None else []:
                    identifier(owner, "owner_id")
                if bucket == "products" and row["source"] == "catalog":
                    if not isinstance(row["owner_id"], str):
                        raise ValueError("catalog override requires a private owner")
                    base = shopping._catalog(row["region"]).get(row["id"])
                    if base is None:
                        raise ValueError("missing catalog override product")
                expected = (
                    row["owner_id"] + "|" + row["id"]
                    if bucket == "products" and row.get("source") == "catalog"
                    else row["id"]
                )
                if key != expected:
                    raise ValueError("shopping identity mismatch")
                if bucket == "regions" and (row["id"] != row["code"] or key in shopping.COUNTRIES):
                    raise ValueError("region identity mismatch")
                if bucket == "shopping_items" and row["list_id"] not in kitchen["shopping_lists"]:
                    raise ValueError("missing item parent")
        known_categories = set(kitchen["categories"])
        for country in ("NZ", "BE"):
            known_categories.update(
                row["id"]
                for row in shopping._categories(
                    empty_kitchen(), country, Actor(None, trusted_internal=True)
                )
            )
        for bucket in ("products", "shopping_items"):
            for row in kitchen[bucket].values():
                if row["category_id"] not in known_categories:
                    raise ValueError("missing shopping category")
                if bucket == "shopping_items":
                    total = (
                        None if row["price"] is None else round(row["quantity"] * row["price"], 10)
                    )
                    if row["estimated_total"] != total:
                        raise ValueError("invalid item price total")
                # Missing product references are legitimate historical snapshots
                # after product deletion; they are not reattached or repaired.
        for lid, row in kitchen["shopping_lists"].items():
            if any(cid not in known_categories for cid in row["category_order"]):
                raise ValueError("missing ordered category")
            if set(row.get("item_order", [])) != {
                i["id"] for i in kitchen["shopping_items"].values() if i["list_id"] == lid
            }:
                raise ValueError("invalid list item order")
        for owner, lid in kitchen["active_lists"].items():
            identifier(owner)
            if lid not in kitchen["shopping_lists"]:
                raise ValueError("missing active list")
            # Native membership revocation can leave a stale active selection.
            # It is inert UI state, not an ACL grant; retain it without repair.
        from .kitchen_network import normalize_image
        from .private_media import PREFIX, media_id

        for mid, record in kitchen["media"].items():
            if media_id(mid) != mid or set(record) != {
                "data",
                "content_type",
                "owner_id",
                "allowed_users",
            }:
                raise ValueError("invalid media identity or fields")
            validate_payload(
                {k: v for k, v in record.items() if k != "data"},
                {
                    "type": "object",
                    "properties": {
                        "content_type": {"const": "image/webp"},
                        "owner_id": {"type": ["string", "null"], "minLength": 1, "maxLength": 128},
                        "allowed_users": shopping.IDS,
                    },
                    "additionalProperties": False,
                },
            )
            if record["owner_id"] is not None:
                identifier(record["owner_id"], "owner_id")
            # Require already-normalized private media, never turn hostile or
            # mislabeled source bytes into a different accepted backup record.
            if normalize_image(record["data"]) != {
                "data": record["data"],
                "content_type": record["content_type"],
            }:
                raise ValueError("private media must already be normalized WebP")
        for bucket in ("recipes", "products", "shopping_items", "loyalty_cards"):
            for row in kitchen[bucket].values():
                for ref in (row.get("image_url"), row.get("logo"), *row.get("photos", [])):
                    mid = media_id(ref)
                    if mid is not None or isinstance(ref, str) and ref.startswith(PREFIX):
                        if mid is None or mid not in kitchen["media"]:
                            raise ValueError("missing or malformed private media reference")
        from .restore_consistency import validate_history_consistency

        validate_history_consistency(data, recipe_nutrients=recipe_nutrients)
        for profile in data.get("profiles", {}).values():
            # Validate historical snapshots, references and nutrition models in
            # every partition, without mixing them into the default diary.
            self._validate_restore({"schema": 3, **profile["data"]})
        # Persist exactly the root shape adoption/export will expose. Optional
        # legacy collections must consume ordinary budget BEFORE Save, not appear
        # for the first time in _state() after a sparse boundary-size restore.
        return validate_storage_root(
            {
                **data,
                "schema": 3,
                "entries": [entry.to_dict() for entry in decoded[0].entries],
                "ledger": decoded[1].to_list(),
                "foods": data.get("foods", {}),
                "favorites": data.get("favorites", {}),
                "daily_goals": data.get("daily_goals", {}),
                "kitchen": kitchen,
            }
        )

    def _cross_command(self, state, action, values, actor, prepared=None):
        if action == "legacy_import":
            # The coordinator owns this detached stage and executor. Importers
            # never open source files, fetch URLs, publish or persist anything.
            from .legacy_recipes import import_legacy_recipes

            result = import_legacy_recipes(
                state,
                values["stores"],
                values.get("images", {}),
                actor,
                utc_timestamp(),
                preserve_permissions=values["preserve_permissions"],
            )
            # Validate the complete resulting persisted model, not just an
            # import projection, before the transaction can add its receipt/save.
            self._validate_restore(state)
            return result
        if action == "platform_restore":
            restored = deepcopy(prepared)
            state.clear()
            state.update(restored)
            state["schema"] = 3
            state.setdefault("kitchen", deepcopy(self._decode_state(restored)[-1]))
            return {"restored": True, "schema_version": 3}
        if action in ("preferences_get", "preferences_update"):
            target = state["kitchen"]["preferences"].setdefault(actor.owner_id, {})
            if action == "preferences_update":
                from .platform_support import validate_json

                patch = validate_json(values["preferences"], max_bytes=2097152)
                target.setdefault("ui", {}).update(patch)
            return {"preferences": deepcopy(target.get("ui", {}))}
        if action == "food_delete":
            fid = values["food_id"]
            if fid not in state["foods"]:
                raise KeyError(fid)
            del state["foods"][fid]
            state["favorites"].pop(fid, None)
            return {"deleted_food_id": fid}
        if action == "recipe_log":
            recipe = deepcopy(state["kitchen"]["recipes"][values["recipe_id"]])
            servings = values["servings"]
            nutrition = recipe_nutrients(recipe, servings)
            item = MealEntry(
                id=uuid4().hex,
                name=recipe["name"],
                meal_type=values["meal_type"],
                eaten_at=self._entry_time(values),
                **{k: nutrition.get(k, 0) for k in NUTRIENTS},
                nutrients=nutrition,
                recipe_id=recipe["id"],
                recipe_servings=servings,
                recipe_snapshot=recipe,
            )
            state["entries"].append(item.to_dict())
            return self._entry_result(item)
        if action == "recipe_entry_update":
            if not any(key in values for key in ("servings", "meal_type")):
                raise ValueError("at least one changed field required")
            original = next(
                (row for row in state["entries"] if row["id"] == values["entry_id"]),
                None,
            )
            if original is None:
                raise KeyError(values["entry_id"])
            if not original.get("recipe_snapshot"):
                raise ValueError("entry is not a recipe snapshot")
            servings = values.get("servings", original["recipe_servings"])
            nutrition = recipe_nutrients(original["recipe_snapshot"], servings)
            item = MealEntry.from_dict(
                {
                    **original,
                    "recipe_servings": servings,
                    "nutrients": nutrition,
                    **{k: nutrition.get(k, 0) for k in NUTRIENTS},
                    "meal_type": values.get("meal_type", original["meal_type"]),
                }
            )
            state["entries"] = [
                item.to_dict() if row["id"] == item.id else row for row in state["entries"]
            ]
            return self._entry_result(item)
        raise ValueError("unknown cross-domain action")

    async def _prepare_network(self, action, values, actor):
        from . import kitchen_network as network

        if action == "platform_restore":
            return await self.hass.async_add_executor_job(self._validate_restore, values["data"])
        if action == "recipes_scrape":
            recipe = await network.fetch_recipe(values["url"], enabled=values["enabled"])
            return {"recipe": self._clean_recipe_media(recipe, {})}
        if action == "recipe_keeper_import":
            if "html_content" in values:
                recipes = await self.hass.async_add_executor_job(
                    network.parse_recipe_keeper, values["html_content"]
                )
                return {"recipes": recipes, "media": {}}
            return await self.hass.async_add_executor_job(
                network.parse_recipe_archive, values["base64_data"]
            )
        if action == "recipes_upload_image":
            return await self.hass.async_add_executor_job(
                network.normalize_image, values["image_data"]
            )
        if action == "recipes_download_image" or values.get("download_image"):
            url = values.get("image_url")
            if not url:
                raise ValueError("explicit image URL required")
            return await network.fetch_image(
                url,
                enabled=values.get(
                    "enabled", values.get("allow_remote", values.get("download_image"))
                )
                is True,
            )
        raise ValueError("unknown preprocessor")

    @staticmethod
    def _clean_recipe_media(recipe, mapping):
        from .private_media import PREFIX

        value = deepcopy(recipe)
        numeric_fields = ACTIONS["recipes_add"]["schema"]["properties"]["declared_nutrition"][
            "properties"
        ]
        if value.get("declared_nutrition") is None and isinstance(value.get("nutrition"), dict):
            value["declared_nutrition"] = {
                key: number
                for key, number in value["nutrition"].items()
                if key in numeric_fields and type(number) in (int, float)
            }
        original = {
            "image_url": value.get("image_url"),
            "photos": deepcopy(value.get("photos", [])),
        }
        refs = [value.get("image_url"), *value.get("photos", [])]
        local = list(dict.fromkeys(PREFIX + mapping[ref] for ref in refs if ref in mapping))
        value["photos"] = local
        value["image_url"] = local[0] if local else None
        if any(original.values()):
            value.setdefault("import_metadata", {})["original_media"] = original
        for alias in ("ingredient_groups", "_image_filename"):
            value.pop(alias, None)
        return value

    def _apply_network(self, state, action, values, actor, prepared):
        from .private_media import PREFIX

        if action == "platform_restore":
            return self._cross_command(state, action, values, actor, prepared)
        kitchen = state["kitchen"]

        def store(record):
            mid = uuid4().hex
            kitchen["media"][mid] = {
                **record,
                "owner_id": actor.owner_id,
                "allowed_users": [],
            }
            return mid

        if action == "recipe_keeper_import":
            mapping = {ref: store(record) for ref, record in prepared["media"].items()}
            ids, images = [], []
            for recipe in prepared["recipes"]:
                filename = recipe.get("_image_filename")
                clean = self._clean_recipe_media(recipe, mapping)
                result = recipe_command(kitchen, "recipes_add", clean, actor, utc_timestamp())[
                    "recipe"
                ]
                ids.append(result["id"])
                if filename and not result.get("image_url"):
                    images.append({"recipe_id": result["id"], "image_filename": filename})
            return {
                "imported": len(ids),
                "failed": 0,
                "recipe_ids": ids,
                "recipe_images": images,
            }
        mid = store(prepared)
        url = PREFIX + mid
        if action.startswith("recipes_"):
            if action == "recipes_add":
                clean = {
                    k: v for k, v in values.items() if k not in ("download_image", "request_id")
                }
                clean["image_url"], clean["photos"] = url, [url]
                result = recipe_command(kitchen, "recipes_add", clean, actor, utc_timestamp())
                return result
            recipe = kitchen["recipes"][values["recipe_id"]]
            recipe["image_url"] = url
            recipe["photos"] = list(dict.fromkeys([*recipe.get("photos", []), url]))
            recipe["updated_at"] = utc_timestamp()
            return {"image_url": url, "local_url": url, "media_id": mid, "recipe_id": recipe["id"]}
        raise ValueError("unknown media operation")

    async def async_command(self, action, payload, *, actor=None):
        actor = actor if actor is not None else Actor(None, trusted_internal=True)
        if action not in ACTIONS:
            return await super().async_command(action, payload, actor=actor)
        if action == "platform_restore":
            if not isinstance(payload, dict) or "data" not in payload:
                raise ValueError("complete restore data required")
            envelope = validate_payload({**payload, "data": {}}, ACTIONS[action]["schema"])
            # The root's accepted depth is measured from the root itself, not
            # the additional transfer envelope. Keep both finite byte bounds.
            data = validate_storage_root(payload["data"])
            values = {**envelope, "data": data}
            import json

            if (
                len(json.dumps(values, ensure_ascii=False, allow_nan=False).encode("utf-8"))
                > MAX_TRANSFER_BYTES
            ):
                raise ValueError("JSON payload is too large")
        elif action == "legacy_import":
            # Only this explicit administrator bulk operation uses the finite
            # transfer budget. Ordinary command validation retains its 8 MiB cap.
            require_admin(actor)
            values = validate_payload(
                payload, ACTIONS[action]["schema"], max_bytes=MAX_TRANSFER_BYTES
            )
            values.setdefault("images", {})
        else:
            values = validate_payload(payload, ACTIONS[action]["schema"])
        if ACTIONS[action]["admin_only"]:
            require_admin(actor)
        if not (actor.user_id or actor.trusted_internal):
            raise PermissionError("authenticated actor required")
        if action in NUTRITION_ACTIONS:
            return await super().async_command(action, values, actor=actor)
        if action == "describe":
            return {
                "version": VERSION,
                "actions": deepcopy(ACTIONS),
                "legacy_services": dict(LEGACY_SERVICES),
                "limits": deepcopy(LIMITS),
            }
        if action in CROSS_ACTIONS:

            def command(kitchen, action, values, actor, now):
                return None

            def authorize(kitchen, action, values, actor, allow_missing=False):
                return (
                    None
                    if action.startswith("preferences_")
                    else require_nutrition(actor)
                    if action in NUTRITION_COMMANDS
                    else require_admin(actor)
                )
        else:
            command, authorize = recipe_command, recipe_authorize
        network_action = (
            ACTIONS[action].get("network")
            or values.get("download_image")
            or action == "platform_restore"
        )
        if ACTIONS[action]["read_only"] and network_action:
            async with self._lock:
                await self.hass.async_add_executor_job(
                    authorize, self.kitchen, action, values, actor
                )
            return await self._prepare_network(action, values, actor)
        if ACTIONS[action]["read_only"]:
            async with self._lock:
                if action == "preferences_get":
                    return {
                        "preferences": deepcopy(
                            self.kitchen["preferences"].get(actor.owner_id, {}).get("ui", {})
                        )
                    }
                result = await self.hass.async_add_executor_job(
                    command,
                    deepcopy(self.kitchen),
                    action,
                    values,
                    actor,
                    utc_timestamp(),
                )
                if action == "platform_info":
                    result["version"] = VERSION
                if action == "platform_backup":
                    result["data"] = self._state()
                return result
        request_id = values.get("request_id")
        scoped_id = f"{actor.owner_id}:{request_id}" if request_id is not None else None
        fingerprint = {
            "actor": {
                "user_id": actor.user_id,
                "is_admin": actor.is_admin,
                "trusted_internal": actor.trusted_internal,
            },
            "payload": values,
        }
        access = []

        def guard(state):
            authorize(state["kitchen"], action, values, actor, allow_missing=True)
            if action == "platform_restore":
                return  # Administrative replacement media is validated in preprocessing.
            from .private_media import media_bytes, media_id

            def check_references(value):
                if isinstance(value, list):
                    for child in value:
                        check_references(child)
                elif isinstance(value, dict):
                    for key, child in value.items():
                        if key in (
                            "metadata",
                            "import_metadata",
                            "provenance",
                            "nutrition_provenance",
                        ):
                            continue  # Inert originals are not rendered media grants.
                        if key in ("image_url", "photos", "logo", "local_url"):
                            for ref in child if isinstance(child, list) else [child]:
                                mid = media_id(ref)
                                if mid is not None:
                                    media_bytes(state["kitchen"], mid, actor)
                        else:
                            check_references(child)

            check_references(values)

        def replay_guard(state, targets):
            for bucket, key in targets:
                row = state["kitchen"][bucket].get(key)
                if row is not None:
                    require_access(row, actor)

        def apply(state):
            kitchen = state["kitchen"]
            before = deepcopy(kitchen)
            if network_action:
                result = self._apply_network(state, action, values, actor, prepared)
            else:
                result = (
                    self._cross_command(state, action, values, actor)
                    if action in CROSS_ACTIONS
                    else command(kitchen, action, values, actor, utc_timestamp())
                )
            kitchen = state["kitchen"]
            users = set(result.pop("_event_users", [])) | {actor.owner_id}
            public = False
            for bucket in (
                "shopping_lists",
                "loyalty_cards",
                "products",
                "categories",
                "regions",
            ):
                for key in set(before[bucket]) | set(kitchen[bucket]):
                    old, new = before[bucket].get(key), kitchen[bucket].get(key)
                    if old != new:
                        access.append([bucket, key])
                        for row in (old, new):
                            if row:
                                public |= "owner_id" in row and row["owner_id"] is None
                                if row.get("owner_id"):
                                    users.add(row["owner_id"])
                                users.update(row.get("allowed_users", []))
            for row in list(before["shopping_items"].values()) + list(
                kitchen["shopping_items"].values()
            ):
                if (
                    row.get("id") == values.get("item_id")
                    or row.get("id") in values.get("item_ids", [])
                    or row.get("list_id") == values.get("list_id")
                ):
                    access.append(["shopping_lists", row["list_id"]])
            if values.get("list_id"):
                access.append(["shopping_lists", values["list_id"]])
            for bucket, key in access:
                if bucket == "shopping_lists":
                    for source in (before, kitchen):
                        row = source[bucket].get(key)
                        if row is not None:
                            public |= "owner_id" in row and row["owner_id"] is None
                            users.update(row.get("allowed_users", []))
                            if row.get("owner_id"):
                                users.add(row["owner_id"])
            result["_event_users"], result["_event_public"] = sorted(users), public
            return result

        prepared = None
        if network_action:
            async with self._lock:
                current = self._state()
                await self.hass.async_add_executor_job(guard, current)
                previous = self.ledger.replay(scoped_id, action, fingerprint) if scoped_id else None
                if previous is not None:
                    replay_guard(current, previous.get("__access", []))
                    return deepcopy(previous.get("__result", previous))
                await self.hass.async_add_executor_job(
                    authorize, self.kitchen, action, values, actor
                )
            prepared = await self._prepare_network(action, values, actor)
        return await self._transact(
            action,
            fingerprint,
            scoped_id,
            apply,
            guard=guard,
            replay_guard=replay_guard,
            access_metadata=lambda state, result: access,
            executor=True,
        )
