"""Pure staged shopping domain.

Catalog/data attribution: Copyright (c) 2026 thekiwismarthome (MIT).
No persistence, Home Assistant, event publication or network I/O lives here.
"""
from __future__ import annotations

from copy import deepcopy
from uuid import uuid4
import json
from pathlib import Path
from functools import lru_cache
from difflib import SequenceMatcher
import unicodedata

from .platform_support import can_access, require_access, validate_payload

COUNTRIES = {"NZ": "New Zealand", "AU": "Australia", "US": "United States", "GB": "United Kingdom", "CA": "Canada", "BE": "Belgium (Dutch)"}
DATA = Path(__file__).with_name("data")

S = {"type": "string", "maxLength": 4096}
ID = {"type": "string", "minLength": 1, "maxLength": 128, "pattern": r"^[^\x00-\x1f]*\S[^\x00-\x1f]*$"}
BOOL = {"type": "boolean"}
IDS = {"type": "array", "items": ID, "maxItems": 1000, "uniqueItems": True}
NULL_S = {"type": ["string", "null"], "maxLength": 4096}

SHOPPING_ACTIONS = {}

def _action(action_name, description, *, read=False, admin=False, required=(), **properties):
    if not read:
        properties["request_id"] = ID
    SHOPPING_ACTIONS["shopping_" + action_name] = {
        "description": description, "read_only": read, "admin_only": admin,
        "schema": {"type": "object", "properties": properties,
                   "required": list(required), "additionalProperties": False},
    }

_action("lists_get_all", "Read permitted lists with the current user's active selection.", read=True)
_action("lists_get", "Read an exact permitted list.", read=True, required=("list_id",), list_id=ID)
_action("lists_create", "Create a privately owned list; global lists require an administrator.",
        required=("name",), name=ID, icon=S, private=BOOL)
_action("lists_update", "Update list metadata as owner or administrator. Todo links are metadata only.",
        required=("list_id",), list_id=ID, name=ID, icon=S, category_order=IDS, ha_todo_entity_id=NULL_S)
_action("lists_update_members", "Replace list membership as owner or administrator.",
        required=("list_id", "allowed_users"), list_id=ID, allowed_users=IDS)
_action("lists_set_active", "Persist the current user's active list without changing another user's choice.",
        required=("list_id",), list_id=ID)
_action("lists_delete", "Delete an explicitly confirmed list and its items as owner or administrator.",
        required=("list_id", "confirm"), list_id=ID, confirm={"const": True})


_action("products_get_all", "Read catalog products for a region and permitted custom products.", read=True, country=ID)
_action("categories_get_all", "Read real packaged category defaults and permitted overrides.", read=True, country=ID, list_id=ID)
_action("get_integration_settings", "Read persisted shopping settings and available regions.", read=True)
_action("set_country", "Select a real catalog or custom region without discarding overrides.", admin=True, required=("country",), country=ID)


QTY = {"type": "number", "minimum": 0.000001, "maximum": 1000000}
PRICE = {"type": ["number", "null"], "minimum": 0, "maximum": 1000000000}
ITEM_FIELDS = {"name": ID, "category_id": ID, "product_id": NULL_S, "quantity": QTY, "unit": ID,
               "note": NULL_S, "price": PRICE, "currency": NULL_S, "image_url": NULL_S, "barcode": NULL_S}
_action("items_get", "Read all items of a permitted list in stored order.", read=True, required=("list_id",), list_id=ID)
_action("items_get_one", "Read one exact item after checking its parent list.", read=True, required=("item_id",), item_id=ID)
_action("items_add", "Add an item to a permitted list.", required=("list_id", "name"), list_id=ID, **ITEM_FIELDS)
_action("items_update", "Patch an item after checking its parent list.", required=("item_id",), item_id=ID, **ITEM_FIELDS)
_action("items_check", "Set checked status and timestamp after parent-list authorization.", required=("item_id", "checked"), item_id=ID, checked=BOOL)
_action("items_increment", "Apply a bounded quantity delta without inventing a minimum of one.", required=("item_id", "amount"), item_id=ID, amount={"type": "number", "minimum": -1000000, "maximum": 1000000})
_action("items_delete", "Delete one authorized item and clean list order.", required=("item_id",), item_id=ID)
_action("items_reorder", "Replace item order with an exact permutation of this list's IDs.", required=("list_id", "item_order"), list_id=ID, item_order=IDS)
_action("items_bulk_check", "Check an explicit set only after authorizing every parent list.", required=("item_ids", "checked"), item_ids=IDS, checked=BOOL)
_action("items_clear_checked", "Clear checked items from an explicitly confirmed permitted list.", required=("list_id", "confirm"), list_id=ID, confirm={"const": True})
_action("items_get_total", "Read unchecked known-price currency totals; missing prices remain unknown.", read=True, required=("list_id",), list_id=ID)


LIMIT = {"type": "integer", "minimum": 1, "maximum": 200}
PRODUCT_FIELDS = {"name": ID, "category_id": ID, "aliases": {**IDS, "uniqueItems": False}, "default_unit": ID,
                  "default_quantity": QTY, "price": PRICE, "currency": NULL_S, "price_per_unit": PRICE,
                  "barcode": NULL_S, "image_url": NULL_S, "image_source": NULL_S, "brands": IDS,
                  "tags": IDS, "collections": IDS, "taxonomy": {"type": "object"},
                  "nutrition": {"type": ["object", "null"]}, "allergens": IDS,
                  "substitution_group": NULL_S, "priority_level": {"type": "integer", "minimum": 0, "maximum": 1000}, "image_hint": S}
SEARCH_FIELDS = {"country": ID, "limit": LIMIT, "exclude_allergens": IDS, "include_tags": IDS,
                 "substitution_group": S, "taxonomy_filters": {"type": "object", "additionalProperties": {"type": "array", "items": ID, "maxItems": 100}, "maxProperties": 100}}
_action("products_add", "Create an owned custom product with declared metadata only.", required=("name", "category_id"), **PRODUCT_FIELDS)
_action("products_get", "Read an exact catalog or permitted custom product.", read=True, required=("product_id",), product_id=ID)
_action("products_get_by_ids", "Read requested IDs in order; missing IDs are omitted, inaccessible IDs denied.", read=True, required=("product_ids",), product_ids=IDS)
_action("products_update", "Patch an owned custom product or persist a current-user catalog override.", required=("product_id",), product_id=ID, **PRODUCT_FIELDS)
_action("products_delete", "Delete an owned product or persist a current-user catalog hiding override.", required=("product_id",), product_id=ID)
_action("products_search", "Fuzzy name and alias search with allergen, tag, group and taxonomy filters.", read=True, required=("query",), query=S, **SEARCH_FIELDS)
_action("products_search_by_barcode", "Find a permitted product by exact barcode, preserving leading zeros.", read=True, required=("barcode",), barcode=ID, country=ID)
_action("products_suggestions", "Suggest products ranked by this user's frequency, recency and catalog priority.", read=True, country=ID, limit=LIMIT)
_action("products_recent", "Read this user's recently used permitted products.", read=True, country=ID, limit=LIMIT)
_action("products_substitutes", "Read permitted same-group substitutes with dietary filters.", read=True, required=("product_id",), product_id=ID, **SEARCH_FIELDS)


LOYALTY_FIELDS = {"name": ID, "number": ID, "barcode": S, "barcode_type": {"type": "string", "enum": ["barcode", "qrcode"]}, "logo": S, "notes": S, "color": S}
_action("loyalty_get_all", "Read only loyalty cards permitted to the current actor.", read=True)
_action("loyalty_get", "Read an exact permitted loyalty card.", read=True, required=("card_id",), card_id=ID)
_action("loyalty_add", "Create a private loyalty card; explicitly public cards require an administrator.", required=("name", "number"), private=BOOL, **LOYALTY_FIELDS)
_action("loyalty_update", "Patch a loyalty card as owner or administrator.", required=("card_id",), card_id=ID, **LOYALTY_FIELDS)
_action("loyalty_delete", "Delete an exact loyalty card as owner or administrator.", required=("card_id",), card_id=ID)
_action("loyalty_update_members", "Replace loyalty-card membership as owner or administrator.", required=("card_id", "allowed_users"), card_id=ID, allowed_users=IDS)


REGION_CODE = {"type": "string", "pattern": "^[A-Z][A-Z0-9_-]{1,7}$", "minLength": 2, "maxLength": 8}
REGION_FIELDS = {"name": ID, "currency_symbol": NULL_S, "currency": NULL_S, "language": NULL_S}
_action("regions_get_all", "Read permitted custom regions.", read=True)
_action("regions_get", "Read an exact permitted custom region.", read=True, required=("code",), code=REGION_CODE)
_action("regions_create", "Create a public administrator-managed custom region; no fake fallback catalog.", admin=True, required=("code", "name"), code=REGION_CODE, **REGION_FIELDS)
_action("regions_update", "Patch an exact custom region as administrator.", admin=True, required=("code",), code=REGION_CODE, **REGION_FIELDS)
_action("regions_delete", "Delete an explicitly confirmed custom region and reset its active selection.", admin=True, required=("code", "confirm"), code=REGION_CODE, confirm={"const": True})
_action("update_integration_settings", "Persist administrative shopping options without modifying unrelated settings.", admin=True, metric_units_only=BOOL, enable_price_tracking=BOOL, enable_image_search=BOOL)
CATEGORY_FIELDS = {"name": ID, "icon": S, "color": S}
_action("categories_add", "Create an owned custom shopping category.", required=("name",), **CATEGORY_FIELDS)
_action("categories_update", "Patch an owned custom category.", required=("category_id",), category_id=ID, **CATEGORY_FIELDS)
_action("categories_delete", "Delete an unused owned custom category and clean permitted list ordering.", required=("category_id",), category_id=ID)
_action("categories_reorder", "Persist an exact category permutation for a permitted list.", required=("list_id", "category_order"), list_id=ID, category_order=IDS)


_action("users_get_all", "Read active non-system HA users through the authenticated parent preprocessor.", read=True)
_action("openfoodfacts_fetch", "Fetch transient Open Food Facts data only through explicit parent network consent.", read=True,
        required=("allow_remote",), allow_remote={"const": True}, query=ID, barcode=ID,
        page_size={"type": "integer", "minimum": 1, "maximum": 100})
SHOPPING_ACTIONS["shopping_openfoodfacts_fetch"]["schema"]["anyOf"] = [{"required": ["query"]}, {"required": ["barcode"]}]
_action("products_download_image", "Normalize remote product media through the parent; never write public files or infer a product assignment.",
        required=("image_url", "product_name", "allow_remote"), image_url={**S, "minLength": 1}, product_name=ID,
        allow_remote={"const": True}, product_id=ID)
for _name in ("shopping_users_get_all", "shopping_openfoodfacts_fetch", "shopping_products_download_image"):
    SHOPPING_ACTIONS[_name].update(network=True, preprocessor=True)


def _record_schema(fields, required):
    return {"type": "object", "properties": {"id": ID, "owner_id": NULL_S, "allowed_users": IDS,
            "created_at": S, "updated_at": S, **fields}, "required": ["id", *required], "additionalProperties": False}

LIST_RECORD = _record_schema({"name": ID, "icon": S, "item_order": IDS, "category_order": IDS,
                              "active": BOOL, "ha_todo_entity_id": NULL_S}, ["name"])
PRODUCT_RECORD = _record_schema({**PRODUCT_FIELDS, "region": ID, "custom": BOOL,
    "source": {"type": "string", "enum": ["catalog", "user"]}, "deleted": BOOL,
    "price_updated": NULL_S, "user_frequency": {"type": "integer", "minimum": 0}, "last_used": NULL_S}, ["name", "category_id"])
ITEM_RECORD = _record_schema({**ITEM_FIELDS, "list_id": ID, "checked": BOOL, "checked_at": NULL_S,
                              "order_index": {"type": "integer", "minimum": 0}, "estimated_total": {**PRICE, "maximum": 1000000000000000}}, ["list_id", "name"])
CARD_RECORD = _record_schema(LOYALTY_FIELDS, ["name", "number"])
CATEGORY_RECORD = _record_schema({**CATEGORY_FIELDS, "region": ID, "system": BOOL,
                                  "sort_order": {"type": "integer", "minimum": 0}}, ["name"])
REGION_RECORD = _record_schema({**REGION_FIELDS, "code": REGION_CODE}, ["code", "name"])
USAGE_RECORD = {"type": "object", "properties": {"user_frequency": {"type": "integer", "minimum": 0, "maximum": 1000000000}, "last_used": NULL_S}, "required": ["user_frequency", "last_used"], "additionalProperties": False}
BACKUP = {"type": "object", "additionalProperties": False, "properties": {
    "slm_backup_version": {"type": "string", "enum": ["1.0", "2.0"]}, "exported_at": S, "country": ID,
    "user_products": {"type": "array", "items": PRODUCT_RECORD, "maxItems": 1000},
    "lists": {"type": "array", "items": LIST_RECORD, "maxItems": 1000},
    "items": {"type": "object", "additionalProperties": {"type": "array", "items": ITEM_RECORD, "maxItems": 1000}, "maxProperties": 1000},
    "loyalty_cards": {"type": "array", "items": CARD_RECORD, "maxItems": 1000},
    "categories": {"type": "array", "items": CATEGORY_RECORD, "maxItems": 1000},
    "regions": {"type": "array", "items": REGION_RECORD, "maxItems": 1000},
    "preferences": {"type": "object", "properties": {"shopping_usage": {"type": "object", "additionalProperties": USAGE_RECORD, "maxProperties": 2000}}, "additionalProperties": False},
    "settings": {"type": "object", "properties": {"country": ID, "metric_units_only": BOOL, "enable_price_tracking": BOOL, "enable_image_search": BOOL}, "additionalProperties": False},
    "active_list_id": NULL_S,
}}
_action("export_data", "Export only permitted shopping records plus the current user's overrides and usage.", read=True, list_ids=IDS)
_action("import_data", "Validate and add shopping backup records atomically; existing IDs require owner access and remain unchanged.", required=("data",), data=BACKUP)


def _import_data(kitchen, data, actor, now):
    validate_payload(data, BACKUP)
    staged = deepcopy(kitchen)
    counts = {"products": 0, "lists": 0, "items": 0, "loyalty_cards": 0, "categories": 0, "regions": 0}
    specs = (("user_products", "products"), ("lists", "shopping_lists"),
             ("categories", "categories"), ("loyalty_cards", "loyalty_cards"), ("regions", "regions"))
    for source, bucket in specs:
        seen = set()
        for raw in data.get(source, []):
            identifier = raw["id"]
            if identifier in seen:
                raise ValueError("Duplicate imported shopping ID")
            seen.add(identifier)
            row = deepcopy(raw)
            if "|" in identifier:
                raise ValueError("Reserved imported shopping ID")
            if bucket == "products" and row.get("source", "user") != "catalog" and identifier.split(":", 1)[0] in COUNTRIES:
                raise ValueError("Reserved catalog product ID")
            if bucket == "categories" and identifier in {r["id"] for r in _categories(staged, "NZ", actor) if r["system"]}:
                raise ValueError("Reserved system category ID")
            if bucket == "regions":
                if not (actor.is_admin or actor.trusted_internal):
                    raise PermissionError("Administrator required to import regions")
                if identifier != row["code"] or identifier in COUNTRIES:
                    raise ValueError("Invalid imported region")
                key = identifier
                row.update(owner_id=None, allowed_users=[])
            else:
                key = identifier
                row.update(owner_id=actor.owner_id, allowed_users=[])
            if bucket == "products" and row.get("source") == "catalog":
                base = _catalog(identifier.split(":", 1)[0]).get(identifier)
                if base is None:
                    raise ValueError("Invalid imported catalog ID")
                row = {**deepcopy(base), **row}
                key = actor.owner_id + "|" + identifier
            existing = staged[bucket].get(key)
            if existing is not None:
                _access(existing, actor, owner=True)
                continue
            if bucket == "shopping_lists":
                row = {"icon": "mdi:cart", "ha_todo_entity_id": None, "created_at": now,
                       "updated_at": now, "category_order": [], **row, "item_order": []}
                row.pop("active", None)
            elif bucket == "products":
                row = {"aliases": [], "default_unit": "units", "default_quantity": 1, "price": None,
                       "currency": None, "nutrition": None, "region": data.get("country", _settings(staged)["country"]),
                       "source": "user", "custom": True, **row}
            elif bucket == "categories":
                row = {"icon": "mdi:cart", "color": "#9fa8da", "sort_order": 14,
                       "region": data.get("country", "NZ"), **row, "system": False}
            elif bucket == "loyalty_cards":
                row = {"barcode": "", "barcode_type": "barcode", "logo": "", "notes": "", "color": "#9fa8da",
                       "created_at": now, "updated_at": now, **row}
            staged[bucket][key] = row
            counts[{"shopping_lists": "lists", "loyalty_cards": "loyalty_cards"}.get(bucket, bucket)] += 1
    for raw in data.get("user_products", []):
        _category(staged, raw["category_id"], actor)
    for raw in data.get("lists", []):
        for cid in raw.get("category_order", []):
            _category(staged, cid, actor)
    for lid, rows in data.get("items", {}).items():
        _access(_get(staged, "shopping_lists", lid), actor, owner=True)
        for raw in rows:
            if raw["list_id"] != lid:
                raise ValueError("Imported item parent mismatch")
            existing = staged["shopping_items"].get(raw["id"])
            if existing is not None:
                _access(_get(staged, "shopping_lists", existing["list_id"]), actor, owner=True)
                if existing["list_id"] != lid:
                    raise ValueError("Imported item ID collision")
                continue
            _category(staged, raw.get("category_id", "other"), actor)
            if raw.get("product_id"):
                _product(staged, raw["product_id"], actor, missing=True)
            row = {"category_id": "other", "product_id": None, "quantity": 1, "unit": "units", "note": None,
                   "checked": False, "checked_at": None, "price": None, "currency": None,
                   "image_url": None, "barcode": None, "created_at": now, "updated_at": now, **deepcopy(raw)}
            _item_total(row)
            staged["shopping_items"][row["id"]] = row
            staged["shopping_lists"][lid]["item_order"].append(row["id"])
            counts["items"] += 1
    for raw in data.get("lists", []):
        lid = raw["id"]
        if counts["items"] and raw.get("item_order"):
            rows = _items(staged, lid)
            if set(raw["item_order"]) != {r["id"] for r in rows}:
                raise ValueError("Invalid imported item order")
            staged["shopping_lists"][lid]["item_order"] = list(raw["item_order"])
    usage = data.get("preferences", {}).get("shopping_usage", {})
    if usage:
        target = staged["preferences"].setdefault(actor.owner_id, {}).setdefault("shopping_usage", {})
        for pid, entry in usage.items():
            _product(staged, pid, actor, missing=True)
            target.setdefault(pid, deepcopy(entry))
    if data.get("settings"):
        if not (actor.is_admin or actor.trusted_internal):
            raise PermissionError("Administrator required to import settings")
        settings = data["settings"]
        if "country" in settings:
            _country(staged, settings, actor)
        staged["preferences"].setdefault("shopping", {}).update(settings)
    if data.get("active_list_id"):
        _access(_get(staged, "shopping_lists", data["active_list_id"]), actor)
        staged["active_lists"].setdefault(actor.owner_id, data["active_list_id"])
    kitchen.update(staged)
    return {"success": True, "imported": counts}


def _usage(kitchen, actor):
    return kitchen["preferences"].get(actor.owner_id, {}).get("shopping_usage", {})


def _product(kitchen, pid, actor, *, missing=False):
    row = kitchen["products"].get(actor.owner_id + "|" + pid) or kitchen["products"].get(pid)
    if row is not None:
        _access(row, actor)
        if row.get("deleted"):
            row = None
    else:
        row = _catalog(pid.split(":", 1)[0]).get(pid)
    if row is None:
        if missing:
            return None
        raise ValueError("Shopping product not found")
    result = deepcopy(row)
    result.update(_usage(kitchen, actor).get(pid, {"user_frequency": 0, "last_used": None}))
    return result


def _normal(value):
    return " ".join(unicodedata.normalize("NFKD", value).casefold().split())


def _score(query, row):
    texts = [_normal(row["name"]), *[_normal(a) for a in row.get("aliases", [])]]
    q = _normal(query)
    if not q:
        return 0
    return max(100 if q == name else 90 if q in name else 100 * SequenceMatcher(None, q, name).ratio() for name in texts)


def _filtered(row, payload):
    lower = lambda values: {_normal(v) for v in values}
    if lower(payload.get("exclude_allergens", [])) & lower(row.get("allergens", [])):
        return False
    if payload.get("include_tags") and not (lower(payload["include_tags"]) & lower(row.get("tags", []))):
        return False
    if payload.get("substitution_group") and row.get("substitution_group") != payload["substitution_group"]:
        return False
    for key, values in payload.get("taxonomy_filters", {}).items():
        actual = row.get("taxonomy", {}).get(key, [])
        actual = actual if isinstance(actual, list) else [actual]
        if not isinstance(values, list) or not any(value in actual for value in values):
            return False
    return True


def _items(kitchen, lid):
    rows = [r for r in kitchen["shopping_items"].values() if r["list_id"] == lid]
    order = kitchen["shopping_lists"][lid]["item_order"]
    positions = {key: n for n, key in enumerate(order)}
    return sorted(rows, key=lambda r: (positions.get(r["id"], len(order)), r.get("order_index", 0)))


def _remove_item(kitchen, iid):
    row = kitchen["shopping_items"].pop(iid)
    parent = kitchen["shopping_lists"][row["list_id"]]
    parent["item_order"] = [key for key in parent["item_order"] if key != iid]


def _item_total(row):
    row["estimated_total"] = None if row.get("price") is None else round(row["quantity"] * row["price"], 10)


def _settings(kitchen):
    return {"country": "NZ", "metric_units_only": True, "enable_price_tracking": True,
            "enable_image_search": False, **kitchen["preferences"].get("shopping", {})}


def _country(kitchen, payload, actor):
    code = payload.get("country", _settings(kitchen)["country"])
    if code not in COUNTRIES:
        region = kitchen["regions"].get(code)
        if region is None:
            raise ValueError("Unknown shopping region")
        _access(region, actor)
    return code


@lru_cache(maxsize=6)
def _catalog(code):
    if code not in COUNTRIES:
        return {}
    data = json.loads((DATA / f"products_catalog_{code.lower()}.json").read_text(encoding="utf-8"))
    return {code + ":" + raw["id"]: {
        "aliases": [], "default_unit": "units", "default_quantity": 1,
        "price": raw.get("price", raw.get("typical_price")), "currency": data["currency"],
        "price_per_unit": None, "price_updated": None, "image_url": None, "image_source": None,
        "barcode": None, "brands": [], "nutrition": None, "user_frequency": 0, "last_used": None,
        "tags": [], "collections": [], "taxonomy": {}, "allergens": [], "substitution_group": "",
        "priority_level": 0, "image_hint": "", **raw, "id": code + ":" + raw["id"],
        "region": code, "source": "catalog", "custom": False,
    } for raw in data["products"]}


def _products(kitchen, code, actor):
    rows = deepcopy(_catalog(code))
    for row in kitchen["products"].values():
        if row.get("source") == "catalog" and row.get("owner_id") != actor.owner_id:
            continue
        if _can(row, actor) and (row.get("source") != "catalog" or row.get("region", code) == code):
            if row.get("deleted"):
                rows.pop(row["id"], None)
            else:
                rows[row["id"]] = deepcopy(row)
    for pid, row in rows.items():
        row.update(_usage(kitchen, actor).get(pid, {"user_frequency": 0, "last_used": None}))
    return list(rows.values())


def _category(kitchen, cid, actor, *, allow_missing=False):
    row = kitchen["categories"].get(cid)
    if row is not None:
        _access(row, actor)
        return row
    for row in _categories(kitchen, _country(kitchen, {}, actor), actor):
        if row["id"] == cid:
            return row
    if allow_missing:
        return None
    raise ValueError("Shopping category not found")


def _categories(kitchen, code, actor):
    filename = "categories_be.json" if code == "BE" else "categories.json"
    rows = {r["id"]: r for r in json.loads((DATA / filename).read_text(encoding="utf-8"))["categories"]}
    for row in kitchen["categories"].values():
        if _can(row, actor) and (not row.get("system") or row.get("region", code) == code):
            rows[row["id"]] = deepcopy(row)
    return sorted(rows.values(), key=lambda r: r["sort_order"])


def _validate(value, schema, label="payload"):
    validate_payload(value, schema)


def _can(record, actor):
    return can_access(record, actor)


def _access(record, actor, owner=False):
    require_access(record, actor, owner_only=owner)


def _get(kitchen, bucket, identifier):
    try:
        return kitchen[bucket][identifier]
    except KeyError:
        raise ValueError("Shopping object not found") from None


def shopping_authorize(kitchen, action, payload, actor, *, allow_missing=False):
    """Authorize exact objects, including replay checks, without mutating state."""
    descriptor = SHOPPING_ACTIONS.get(action)
    if descriptor is None:
        raise ValueError("Unknown shopping action")
    validate_payload(payload, descriptor["schema"])
    if not (actor.user_id or actor.trusted_internal):
        raise PermissionError("Authenticated actor required")
    if descriptor["admin_only"] and not (actor.is_admin or actor.trusted_internal):
        raise PermissionError("Administrator required")
    if action in {"shopping_lists_create", "shopping_loyalty_add"} and payload.get("private") is False and not (actor.is_admin or actor.trusted_internal):
        raise PermissionError("Administrator required for global list")
    if action.startswith("shopping_regions_") and "code" in payload and action != "shopping_regions_create":
        row = kitchen["regions"].get(payload["code"])
        if row is None:
            if not allow_missing:
                raise ValueError("Shopping region not found")
        else:
            _access(row, actor, owner=not descriptor["read_only"])
    if action in {"shopping_categories_update", "shopping_categories_delete"}:
        row = kitchen["categories"].get(payload["category_id"])
        if row is None:
            if not allow_missing:
                raise ValueError("Custom shopping category not found")
        else:
            _access(row, actor, owner=True)
    if action == "shopping_export_data":
        for lid in payload.get("list_ids", []):
            row = kitchen["shopping_lists"].get(lid)
            if row is not None:
                _access(row, actor)
            elif not allow_missing:
                raise ValueError("Shopping list not found")
    if action == "shopping_import_data":
        _import_data(deepcopy(kitchen), payload["data"], actor, "")
    if "category_id" in payload and action not in {"shopping_categories_delete", "shopping_categories_update"}:
        _category(kitchen, payload["category_id"], actor, allow_missing=allow_missing)
    if "category_order" in payload:
        for cid in payload["category_order"]:
            _category(kitchen, cid, actor, allow_missing=allow_missing)
        if not allow_missing and set(payload["category_order"]) != {r["id"] for r in _categories(kitchen, _country(kitchen, {}, actor), actor)}:
            raise ValueError("Category order must be an exact permutation")
    if "card_id" in payload:
        row = kitchen["loyalty_cards"].get(payload["card_id"])
        if row is None:
            if not allow_missing:
                raise ValueError("Shopping object not found")
        else:
            _access(row, actor, owner=action != "shopping_loyalty_get")
    for pid in ([payload["product_id"]] if payload.get("product_id") else payload.get("product_ids", [])):
        row = _product(kitchen, pid, actor, missing=allow_missing or action == "shopping_products_get_by_ids")
        if row and row.get("source") != "catalog" and action in {"shopping_products_update", "shopping_products_delete"}:
            _access(row, actor, owner=True)
    for iid in ([payload["item_id"]] if "item_id" in payload else payload.get("item_ids", [])):
        item = kitchen["shopping_items"].get(iid)
        if item is None:
            if not allow_missing:
                raise ValueError("Shopping object not found")
        else:
            _access(_get(kitchen, "shopping_lists", item["list_id"]), actor)
    if "list_id" in payload:
        row = kitchen["shopping_lists"].get(payload["list_id"])
        if row is None:
            if not allow_missing:
                raise ValueError("Shopping object not found")
        else:
            _access(row, actor, owner=action in {"shopping_lists_update", "shopping_lists_update_members", "shopping_lists_delete"})


def _list_view(kitchen, row, actor):
    return {**deepcopy(row), "active": kitchen["active_lists"].get(actor.owner_id) == row["id"]}


def _event_audience(kitchen, payload, actor):
    records = []
    for lid in ([payload["list_id"]] if "list_id" in payload else []):
        row = kitchen["shopping_lists"].get(lid)
        if row:
            records.append(row)
    for iid in ([payload["item_id"]] if "item_id" in payload else payload.get("item_ids", [])):
        item = kitchen["shopping_items"].get(iid)
        if item and item["list_id"] in kitchen["shopping_lists"]:
            records.append(kitchen["shopping_lists"][item["list_id"]])
    if "card_id" in payload and payload["card_id"] in kitchen["loyalty_cards"]:
        records.append(kitchen["loyalty_cards"][payload["card_id"]])
    users = {actor.owner_id}
    for row in records:
        if row.get("owner_id") is not None:
            users.add(row["owner_id"])
            users.update(row.get("allowed_users", []))
    return users


def shopping_command(kitchen, action, payload, actor, now):
    """Authorize and dispatch; internal audience metadata is stripped by transport."""
    shopping_authorize(kitchen, action, payload, actor)
    if SHOPPING_ACTIONS[action]["read_only"]:
        return _dispatch(kitchen, action, payload, actor, now)
    audience = _event_audience(kitchen, payload, actor)
    result = _dispatch(kitchen, action, payload, actor, now)
    audience.update(_event_audience(kitchen, payload, actor))
    result["_event_users"] = sorted(audience)
    return result


def _dispatch(kitchen, action, payload, actor, now):
    """Dispatch an already-authorized command against staged state."""
    if SHOPPING_ACTIONS[action].get("preprocessor"):
        raise ValueError("Shopping action requires parent preprocessing")
    op = action.removeprefix("shopping_")
    if op == "import_data":
        return _import_data(kitchen, payload["data"], actor, now)
    if op == "export_data":
        ids = payload.get("list_ids")
        if ids is not None:
            for lid in ids:
                _access(_get(kitchen, "shopping_lists", lid), actor)
        lists = [deepcopy(r) for r in kitchen["shopping_lists"].values() if _can(r, actor) and (ids is None or r["id"] in ids)]
        products = [deepcopy(r) for r in kitchen["products"].values() if _can(r, actor) and (r.get("source") != "catalog" or r.get("owner_id") == actor.owner_id)]
        # Selections are references, not access grants. Close only this detached
        # export; inert selections in the administrative root backup stay intact.
        active_list_id = kitchen["active_lists"].get(actor.owner_id)
        if active_list_id not in {r["id"] for r in lists}:
            active_list_id = None
        result = {"slm_backup_version": "2.0", "exported_at": now, "country": _settings(kitchen)["country"],
                  "lists": lists, "items": {r["id"]: deepcopy(_items(kitchen, r["id"])) for r in lists},
                  "user_products": products, "loyalty_cards": [deepcopy(r) for r in kitchen["loyalty_cards"].values() if _can(r, actor)],
                  "categories": [deepcopy(r) for r in kitchen["categories"].values() if _can(r, actor)],
                  # Global administrator-managed metadata is not an actor-owned
                  # transfer: ordinary imports must not request region mutations.
                  "regions": [deepcopy(r) for r in kitchen["regions"].values() if _can(r, actor)] if actor.is_admin or actor.trusted_internal else [],
                  "preferences": {"shopping_usage": deepcopy(_usage(kitchen, actor))},
                  "active_list_id": active_list_id}
        # ACL filtering can omit a category still referenced by an authorized
        # shared list/item/product. Close only the exported copies: private
        # category IDs and metadata must not be included to repair the backup.
        category_ids = {r["id"] for r in _categories(kitchen, result["country"], actor)}
        for row in lists:
            row["category_order"] = [cid for cid in row["category_order"] if cid in category_ids]
        for row in [*products, *(item for rows in result["items"].values() for item in rows)]:
            if row.get("category_id", "other") not in category_ids:
                row["category_id"] = "other"
        if actor.is_admin or actor.trusted_internal:
            result["settings"] = _settings(kitchen)
        return result
    if op == "update_integration_settings":
        kitchen["preferences"].setdefault("shopping", {}).update({k: v for k, v in payload.items() if k != "request_id"})
        return {"success": True, **_settings(kitchen)}
    if op == "regions_get_all":
        return {"regions": {c: deepcopy(r) for c, r in kitchen["regions"].items() if _can(r, actor)}}
    if op == "regions_create":
        code = payload["code"]
        _validate(code, REGION_CODE, "region code")
        if code in COUNTRIES or code in kitchen["regions"]:
            raise ValueError("Shopping region already exists")
        row = {"id": code, "code": code, "owner_id": None, "allowed_users": [],
               "currency_symbol": None, "currency": None, "language": None,
               **{k: v for k, v in payload.items() if k in REGION_FIELDS}}
        kitchen["regions"][code] = row
        return {"success": True, "code": code, "custom_regions": deepcopy(kitchen["regions"])}
    if op in {"regions_get", "regions_update", "regions_delete"}:
        row = _get(kitchen, "regions", payload["code"])
        if op == "regions_delete":
            del kitchen["regions"][payload["code"]]
            if _settings(kitchen)["country"] == payload["code"]:
                kitchen["preferences"].setdefault("shopping", {})["country"] = "NZ"
            return {"success": True, "code": payload["code"], "custom_regions": deepcopy(kitchen["regions"])}
        if op == "regions_update":
            row.update({k: v for k, v in payload.items() if k in REGION_FIELDS})
        return {"region": deepcopy(row)}
    if op == "categories_add":
        code = _country(kitchen, {}, actor)
        row = {"id": str(uuid4()), "owner_id": actor.owner_id, "allowed_users": [], "region": code,
               "system": False, "sort_order": len(_categories(kitchen, code, actor)) + 1,
               "icon": "mdi:cart", "color": "#9fa8da", **{k: v for k, v in payload.items() if k in CATEGORY_FIELDS}}
        kitchen["categories"][row["id"]] = row
        return {"category": deepcopy(row)}
    if op in {"categories_update", "categories_delete"}:
        row = _get(kitchen, "categories", payload["category_id"])
        if op == "categories_delete":
            if any(r.get("category_id") == row["id"] for r in kitchen["shopping_items"].values()):
                raise ValueError("Category is used by a shopping item")
            # All stored references count, including other users' overrides and
            # hiding tombstones. Do not disclose any referencing private record.
            if any(r.get("category_id") == row["id"] for r in kitchen["products"].values()):
                raise ValueError("Category is used by a shopping product")
            for parent in kitchen["shopping_lists"].values():
                if row["id"] in parent["category_order"]:
                    _access(parent, actor)
            del kitchen["categories"][row["id"]]
            for parent in kitchen["shopping_lists"].values():
                if row["id"] in parent["category_order"]:
                    parent["category_order"].remove(row["id"])
            return {"deleted": True, "category_id": row["id"]}
        row.update({k: v for k, v in payload.items() if k in CATEGORY_FIELDS})
        return {"category": deepcopy(row)}
    if op == "categories_reorder":
        code = _country(kitchen, {}, actor)
        if set(payload["category_order"]) != {r["id"] for r in _categories(kitchen, code, actor)}:
            raise ValueError("Category order must contain exactly this region's category IDs")
        kitchen["shopping_lists"][payload["list_id"]]["category_order"] = list(payload["category_order"])
        return {"success": True}
    if op == "loyalty_get_all":
        return {"cards": [deepcopy(row) for row in kitchen["loyalty_cards"].values() if _can(row, actor)]}
    if op == "loyalty_add":
        row = {"id": str(uuid4()), "owner_id": actor.owner_id if payload.get("private", True) else None,
               "allowed_users": [], "barcode": "", "barcode_type": "barcode", "logo": "", "notes": "", "color": "#9fa8da",
               "created_at": now, "updated_at": now}
        row.update({k: v for k, v in payload.items() if k in LOYALTY_FIELDS})
        kitchen["loyalty_cards"][row["id"]] = row
        return {"card": deepcopy(row)}
    if op in {"loyalty_get", "loyalty_update", "loyalty_update_members", "loyalty_delete"}:
        row = _get(kitchen, "loyalty_cards", payload["card_id"])
        if op == "loyalty_delete":
            del kitchen["loyalty_cards"][row["id"]]
            return {"success": True, "card_id": row["id"]}
        if op != "loyalty_get":
            row.update({k: deepcopy(v) for k, v in payload.items() if k in LOYALTY_FIELDS or k == "allowed_users"})
            row["updated_at"] = now
        return {"card": deepcopy(row)}
    if op == "products_add":
        row = {"id": str(uuid4()), "owner_id": actor.owner_id, "allowed_users": [],
               "custom": True, "source": "user", "region": _country(kitchen, {}, actor),
               "aliases": [], "default_unit": "units", "default_quantity": 1, "price": None,
               "currency": None, "price_per_unit": None, "price_updated": None, "barcode": None,
               "image_url": None, "image_source": None, "brands": [], "nutrition": None,
               "tags": [], "collections": [], "taxonomy": {}, "allergens": [],
               "substitution_group": "", "priority_level": 0, "image_hint": "", "created_at": now, "updated_at": now}
        row.update({k: deepcopy(v) for k, v in payload.items() if k in PRODUCT_FIELDS})
        kitchen["products"][row["id"]] = row
        return {"product": _product(kitchen, row["id"], actor)}
    if op in {"products_get", "products_get_by_ids"}:
        if op == "products_get":
            return {"product": _product(kitchen, payload["product_id"], actor)}
        return {"products": [r for pid in payload["product_ids"] if (r := _product(kitchen, pid, actor, missing=True)) is not None]}
    if op in {"products_update", "products_delete"}:
        row = _product(kitchen, payload["product_id"], actor)
        key = row["id"]
        if row["source"] == "catalog":
            key = actor.owner_id + "|" + row["id"]
            row.update(owner_id=actor.owner_id, allowed_users=[])
        if op == "products_delete":
            if row["source"] == "catalog":
                row["deleted"] = True
                kitchen["products"][key] = row
            else:
                del kitchen["products"][key]
            return {"deleted": True, "product_id": row["id"]}
        row.update({k: deepcopy(v) for k, v in payload.items() if k in PRODUCT_FIELDS})
        row["updated_at"] = now
        if "price" in payload:
            row["price_updated"] = now
        kitchen["products"][key] = row
        return {"product": deepcopy(row)}
    if op in {"products_search", "products_search_by_barcode", "products_suggestions", "products_recent", "products_substitutes"}:
        rows = _products(kitchen, _country(kitchen, payload, actor), actor)
        limit = payload.get("limit", 20 if op == "products_suggestions" else 10)
        if op == "products_search_by_barcode":
            return {"product": next((r for r in rows if r.get("barcode") == payload["barcode"]), None)}
        rows = [r for r in rows if _filtered(r, payload)]
        if op == "products_search":
            rows = [r for r in rows if _score(payload["query"], r) >= 60]
            rows.sort(key=lambda r: (_score(payload["query"], r), r["user_frequency"], r.get("priority_level", 0)), reverse=True)
        elif op == "products_substitutes":
            base = _product(kitchen, payload["product_id"], actor)
            group = base.get("substitution_group")
            rows = [r for r in rows if group and r.get("substitution_group") == group and r["id"] != base["id"]]
            rows.sort(key=lambda r: (r.get("priority_level", 0), r["user_frequency"]), reverse=True)
            return {"substitutes": rows[:payload.get("limit", 5)]}
        elif op == "products_recent":
            rows = [r for r in rows if r["last_used"]]
            rows.sort(key=lambda r: (r["last_used"], r["user_frequency"]), reverse=True)
        else:
            rows.sort(key=lambda r: (r["user_frequency"], r["last_used"] or "", r.get("priority_level", 0)), reverse=True)
        return {"products": rows[:limit]}
    if op in {"items_get", "items_get_one"}:
        if op == "items_get":
            return {"items": deepcopy(_items(kitchen, payload["list_id"]))}
        return {"item": deepcopy(_get(kitchen, "shopping_items", payload["item_id"]))}
    if op == "items_add":
        row = {"id": str(uuid4()), "list_id": payload["list_id"], "category_id": "other", "product_id": None,
               "quantity": 1, "unit": "units", "note": None, "price": None, "currency": None,
               "image_url": None, "barcode": None, "checked": False, "checked_at": None,
               "order_index": len(_items(kitchen, payload["list_id"])), "created_at": now, "updated_at": now}
        row.update({key: deepcopy(value) for key, value in payload.items() if key in ITEM_FIELDS})
        _item_total(row)
        kitchen["shopping_items"][row["id"]] = row
        kitchen["shopping_lists"][row["list_id"]]["item_order"].append(row["id"])
        if row.get("product_id"):
            usage = kitchen["preferences"].setdefault(actor.owner_id, {}).setdefault("shopping_usage", {})
            previous = usage.get(row["product_id"], {})
            usage[row["product_id"]] = {"user_frequency": previous.get("user_frequency", 0) + 1, "last_used": now}
        return {"item": deepcopy(row)}
    if op in {"items_update", "items_check", "items_increment"}:
        row = _get(kitchen, "shopping_items", payload["item_id"])
        if op == "items_increment":
            quantity = round(row["quantity"] + payload["amount"], 10)
            _validate(quantity, QTY, "quantity")
            row["quantity"] = quantity
        elif op == "items_check":
            row["checked"] = payload["checked"]
            row["checked_at"] = now if payload["checked"] else None
        else:
            row.update({key: deepcopy(value) for key, value in payload.items() if key in ITEM_FIELDS})
        row["updated_at"] = now
        _item_total(row)
        return {"item": deepcopy(row)}
    if op == "items_bulk_check":
        for iid in payload["item_ids"]:
            shopping_command(kitchen, "shopping_items_check", {"item_id": iid, "checked": payload["checked"]}, actor, now)
        return {"success": True, "count": len(payload["item_ids"])}
    if op == "items_delete":
        _remove_item(kitchen, payload["item_id"])
        return {"success": True, "item_id": payload["item_id"]}
    if op == "items_clear_checked":
        ids = [r["id"] for r in _items(kitchen, payload["list_id"]) if r["checked"]]
        for iid in ids:
            _remove_item(kitchen, iid)
        return {"success": True, "count": len(ids)}
    if op == "items_get_total":
        rows = [row for row in _items(kitchen, payload["list_id"]) if not row["checked"]]
        totals = {}
        unknown = 0
        count = 0
        for row in rows:
            if row.get("price") is None:
                unknown += 1
                continue
            currency = row.get("currency") or "unknown"
            totals[currency] = totals.get(currency, 0) + row["quantity"] * row["price"]
            count += 1
        totals = {key: round(value, 2) for key, value in totals.items()}
        single = len(totals) == 1 and "unknown" not in totals
        return {"totals": totals, "total": next(iter(totals.values())) if single else None,
                "currency": next(iter(totals)) if single else None, "item_count": count,
                "unknown_price_count": unknown, "complete": unknown == 0 and "unknown" not in totals}
    if op == "items_reorder":
        rows = _items(kitchen, payload["list_id"])
        if set(payload["item_order"]) != {r["id"] for r in rows}:
            raise ValueError("Item order must contain exactly this list's item IDs")
        kitchen["shopping_lists"][payload["list_id"]]["item_order"] = list(payload["item_order"])
        for index, iid in enumerate(payload["item_order"]):
            kitchen["shopping_items"][iid]["order_index"] = index
        return {"success": True}
    if op == "get_integration_settings":
        regions = {c: deepcopy(r) for c, r in kitchen["regions"].items() if _can(r, actor)}
        return {**_settings(kitchen), "version": json.loads(Path(__file__).with_name("manifest.json").read_text(encoding="utf-8"))["version"], "available_countries": {**COUNTRIES, **{c: r["name"] for c, r in regions.items()}}, "custom_regions": regions}
    if op == "set_country":
        code = _country(kitchen, payload, actor)
        kitchen["preferences"].setdefault("shopping", {})["country"] = code
        return {"success": True, "country": code, "products_loaded": len(_catalog(code))}
    if op == "products_get_all":
        return {"products": _products(kitchen, _country(kitchen, payload, actor), actor)}
    if op == "categories_get_all":
        rows = _categories(kitchen, _country(kitchen, payload, actor), actor)
        if payload.get("list_id"):
            order = kitchen["shopping_lists"][payload["list_id"]]["category_order"]
            positions = {cid: index for index, cid in enumerate(order)}
            rows.sort(key=lambda row: positions.get(row["id"], len(order)))
        return {"categories": rows}
    if op == "lists_get_all":
        return {"lists": [_list_view(kitchen, row, actor) for row in kitchen["shopping_lists"].values() if _can(row, actor)]}
    if op == "lists_create":
        lid = str(uuid4())
        row = {"id": lid, "name": payload["name"], "icon": payload.get("icon", "mdi:cart"),
               "owner_id": actor.owner_id if payload.get("private", True) else "internal",
               "allowed_users": [], "created_at": now, "updated_at": now,
               "item_order": [], "category_order": [c["id"] for c in _categories(kitchen, _country(kitchen, {}, actor), actor)], "ha_todo_entity_id": None}
        kitchen["shopping_lists"][lid] = row
        return {"list": _list_view(kitchen, row, actor)}
    if op == "lists_get":
        return {"list": _list_view(kitchen, _get(kitchen, "shopping_lists", payload["list_id"]), actor)}
    if op in {"lists_update", "lists_update_members"}:
        row = _get(kitchen, "shopping_lists", payload["list_id"])
        for key, value in payload.items():
            if key not in {"request_id", "list_id"}:
                row[key] = deepcopy(value)
        row["updated_at"] = now
        return {"list": _list_view(kitchen, row, actor)}
    if op == "lists_set_active":
        kitchen["active_lists"][actor.owner_id] = payload["list_id"]
        return {"success": True}
    if op == "lists_delete":
        lid = payload["list_id"]
        del kitchen["shopping_lists"][lid]
        for key, value in list(kitchen["active_lists"].items()):
            if value == lid:
                del kitchen["active_lists"][key]
        for key, value in list(kitchen["shopping_items"].items()):
            if value["list_id"] == lid:
                del kitchen["shopping_items"][key]
        return {"success": True, "list_id": lid}
    raise ValueError("Shopping action not implemented")
