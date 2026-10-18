"""Dormant historical shopping compatibility, not an operational integration.

No services, WS actions, discovery or import routes dispatch this module. Keep
historical schemas/catalog identities/decoding to preserve existing full backups
and retained media; never initialize, migrate or prune user data on load.

Source-format reference: shopping-list-manager c55e90d (MIT),
Copyright (c) 2026 thekiwismarthome. No upstream code is executed.
"""

from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
from urllib.parse import urlsplit

from . import shopping
from .kitchen_network import normalize_image
from .platform_support import (
    Actor,
    empty_kitchen,
    identifier,
    require_admin,
    validate_json,
    validate_payload,
)
from .private_media import PREFIX as PRIVATE_PREFIX
from .storage_budget import MAX_DATA_BYTES

SOURCE = "shopping_list_manager"
STORE_KEYS = tuple(
    SOURCE + "." + suffix
    for suffix in ("lists", "items", "products", "categories", "loyalty_cards", "custom_regions")
)


LOCAL_PREFIXES = ("/local/images/shopping_list_manager/", "/local/shopping_list_manager/images/")


def _local_image(url):
    """Recognize only exact, unambiguous upstream local asset URLs."""
    if not isinstance(url, str):
        raise ValueError("Invalid legacy image URL")
    for prefix in LOCAL_PREFIXES:
        if url.startswith(prefix):
            filename = url[len(prefix) :]
            if (
                not 1 <= len(filename) <= 255
                or ".." in filename
                or any(c in "/\\%?#:" or ord(c) < 32 for c in filename)
            ):
                raise ValueError("Unsafe legacy local image URL")
            return True
    if url.startswith("/") or "\\" in url or any(ord(c) < 32 for c in url):
        raise ValueError("Unknown or ambiguous local image URL")
    parsed = urlsplit(url)
    if (
        parsed.scheme not in ("https", "http")
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or any(parsed.path.startswith(prefix) for prefix in LOCAL_PREFIXES)
    ):
        raise ValueError("Invalid or ambiguous remote image URL")
    return False


def _migrate_images(staged, references, images, actor):
    by_url = {}
    for row, field, acl in references:
        url = row.get(field)
        if url is None or url == "":
            continue
        if _local_image(url):
            by_url.setdefault(url, []).append((row, field, acl))
    if set(images) != set(by_url):
        raise ValueError("Supply exactly every referenced local image URL")
    image_map = {}
    media_ids = []
    for url, uses in by_url.items():
        record = normalize_image(images[url])
        mid = "legacy-slm-" + sha256(url.encode("utf-8")).hexdigest()
        if mid in staged["media"]:
            raise ValueError("Legacy media ID collision")
        owners = {acl["owner_id"] for _, _, acl in uses}
        users = {user for _, _, acl in uses for user in acl["allowed_users"]}
        if None in owners:
            owner, members = None, []
        elif len(owners) == 1:
            owner = next(iter(owners))
            members = sorted(users - {owner})
        else:
            owner = actor.owner_id
            members = sorted((users | owners) - {owner})
        staged["media"][mid] = {**record, "owner_id": owner, "allowed_users": members}
        image_map[url] = PRIVATE_PREFIX + mid
        media_ids.append(mid)
        for row, field, _ in uses:
            row[field] = image_map[url]
    return media_ids, image_map


def _acl(raw, actor, preserve):
    if raw.get("owner_id") is not None:
        identifier(raw["owner_id"], "owner_id")
    validate_payload(raw.get("allowed_users", []), shopping.IDS)
    return {
        "owner_id": raw.get("owner_id") if preserve else actor.owner_id,
        "allowed_users": deepcopy(raw.get("allowed_users", [])) if preserve else [],
    }


def import_legacy_shopping(
    state: dict,
    stores: dict,
    images: dict,
    actor: Actor,
    now: str,
    *,
    country: str,
    preserve_permissions: bool = False,
) -> dict:
    """Add validated legacy records; leave state and inputs untouched on error.

    Default ACLs reset to importer/private. Only an administrator's explicit
    preserve_permissions=True retains literal source ACLs and pinned legacy
    absent-owner public defaults. Catalog overrides always belong privately to
    the importer, matching the current personal-override model.
    """
    require_admin(actor)
    if type(preserve_permissions) is not bool:
        raise ValueError("preserve_permissions must be boolean")
    # Transfer-local source bounds; individual records and decoded images keep
    # their existing limits, and the parent validates the complete staged root.
    validate_json(stores, max_bytes=MAX_DATA_BYTES)
    validate_json(images, max_bytes=MAX_DATA_BYTES)
    if not isinstance(stores, dict) or set(stores) - set(STORE_KEYS):
        raise ValueError("Unknown legacy Store key")
    if not isinstance(images, dict):
        raise ValueError("images must be an exact URL mapping")
    staged = deepcopy(state["kitchen"])
    raw = {}
    for key, payload in stores.items():
        if isinstance(payload, dict) and any(
            name in payload and not isinstance(payload[name], (dict, list))
            for name in ("version", "minor_version", "key", "data")
        ):
            if (
                set(payload) != {"version", "minor_version", "key", "data"}
                or type(payload["version"]) is not int
                or payload["version"] != 2
                or type(payload["minor_version"]) is not int
                or payload["minor_version"] != 1
                or payload["key"] != key
            ):
                raise ValueError("Invalid legacy Store envelope")
            payload = payload["data"]
        raw[key.removeprefix(SOURCE + ".")] = deepcopy(payload)
    regions = raw.get("custom_regions", {"regions": {}})
    if (
        not isinstance(regions, dict)
        or set(regions) != {"regions"}
        or not isinstance(regions["regions"], dict)
    ):
        raise ValueError("Invalid legacy custom regions wrapper")
    region_codes = []
    for code, value in regions["regions"].items():
        if isinstance(value, str):
            value = {"name": value}
        if not isinstance(value, dict):
            raise ValueError("Invalid legacy region")
        row = {
            "id": code,
            "code": code,
            "currency_symbol": None,
            "currency": None,
            "language": None,
            **deepcopy(value),
            **_acl(value, actor, preserve_permissions),
        }
        validate_payload(row, shopping.REGION_RECORD)
        if row["id"] != code or row["code"] != code or code in shopping.COUNTRIES:
            raise ValueError("Invalid legacy region identity")
        if code in staged["regions"]:
            raise ValueError("Legacy region ID collision")
        staged["regions"][code] = row
        region_codes.append(code)
    identifier(country, "country")
    if country not in shopping.COUNTRIES and country not in staged["regions"]:
        raise ValueError("Unknown explicit country")
    ids = {
        "list_ids": [],
        "item_ids": [],
        "product_ids": [],
        "category_ids": [],
        "loyalty_card_ids": [],
    }
    id_map = {}
    product_keys = {}
    catalog = shopping._catalog(country)
    system_categories = {r["id"]: r for r in shopping._categories(empty_kitchen(), country, actor)}

    def insert(bucket, row, schema, output):
        validate_payload(row, schema)
        identifier(row["id"])
        if "|" in row["id"]:
            raise ValueError("Reserved legacy ID")
        key = (
            actor.owner_id + "|" + row["id"]
            if bucket == "products" and row["source"] == "catalog"
            else row["id"]
        )
        if key in staged[bucket]:
            raise ValueError("Legacy ID collision")
        staged[bucket][key] = row
        if bucket == "products":
            product_keys[row["id"]] = key
        ids[output].append(row["id"])

    def keyed(suffix):
        value = raw.get(suffix, {})
        if not isinstance(value, dict):
            raise ValueError("Invalid keyed legacy Store")
        for key, row in value.items():
            identifier(key)
            if not isinstance(row, dict) or row.get("id") != key:
                raise ValueError("Legacy Store key/ID mismatch")
            yield deepcopy(row)

    categories = raw.get("categories", [])
    if not isinstance(categories, list):
        raise ValueError("Invalid legacy categories Store")
    seen_categories = set()
    for value in categories:
        if not isinstance(value, dict):
            raise ValueError("Invalid legacy category")
        row = {
            "icon": "mdi:cart",
            "color": "#9fa8da",
            "sort_order": 14,
            "region": country,
            "system": True,
            **value,
            **_acl(value, actor, preserve_permissions),
        }
        validate_payload(row, shopping.CATEGORY_RECORD)
        if row["id"] in seen_categories:
            raise ValueError("Duplicate legacy category ID")
        seen_categories.add(row["id"])
        base = system_categories.get(row["id"])
        if base is not None:
            if any(row.get(key) != val for key, val in base.items()):
                raise ValueError("Cannot shadow packaged system category")
            continue  # Immutable, unchanged bundled definition, not a new record.
        if row["system"]:
            raise ValueError("Unknown legacy system category")
        insert("categories", row, shopping.CATEGORY_RECORD, "category_ids")
    for value in keyed("products"):
        row = {
            "aliases": [],
            "default_unit": "units",
            "default_quantity": 1,
            "price": None,
            "currency": None,
            "price_per_unit": None,
            "price_updated": None,
            "image_url": None,
            "image_source": None,
            "barcode": None,
            "brands": [],
            "nutrition": None,
            "user_frequency": 0,
            "last_used": None,
            "custom": False,
            "source": "user",
            "tags": [],
            "collections": [],
            "taxonomy": {},
            "allergens": [],
            "substitution_group": "",
            "priority_level": 0,
            "image_hint": "",
            "region": country,
            **value,
            **_acl(value, actor, preserve_permissions),
        }
        if row["source"] == "catalog":
            # Exact trusted catalog identity + explicit country only. Never
            # match names/aliases or infer a catalog identity for a user row.
            pid = row["id"] if row["id"] in catalog else country + ":" + row["id"]
            if pid not in catalog or ("region" in value and value["region"] != country):
                raise ValueError("Unrecognized exact legacy catalog identity")
            if pid != row["id"]:
                id_map[row["id"]] = pid
            row.update(id=pid, owner_id=actor.owner_id, allowed_users=[], region=country)
        elif row["id"].split(":", 1)[0] in shopping.COUNTRIES:
            raise ValueError("Reserved catalog product namespace")
        insert("products", row, shopping.PRODUCT_RECORD, "product_ids")
        if row["user_frequency"] or row["last_used"] is not None:
            usage = {"user_frequency": row["user_frequency"], "last_used": row["last_used"]}
            validate_payload(usage, shopping.USAGE_RECORD)
            if usage["last_used"] is not None:
                from .recipes import _epoch

                _epoch(usage["last_used"])
            target = (
                staged["preferences"]
                .setdefault(actor.owner_id, {})
                .setdefault("shopping_usage", {})
            )
            if row["id"] in target:
                raise ValueError("Legacy product usage collision")
            target[row["id"]] = usage
    active = []
    for value in keyed("lists"):
        row = {
            "icon": "mdi:cart",
            "created_at": now,
            "updated_at": now,
            "item_order": [],
            "category_order": [],
            "ha_todo_entity_id": None,
            **value,
            **_acl(value, actor, preserve_permissions),
        }
        validate_payload(row.get("active", False), shopping.BOOL)
        if row.pop("active", False):
            active.append(row["id"])
        insert("shopping_lists", row, shopping.LIST_RECORD, "list_ids")
    if len(active) > 1 or active and actor.owner_id in staged["active_lists"]:
        raise ValueError("Legacy active selection collision")
    if active:
        staged["active_lists"][actor.owner_id] = active[0]
    for value in keyed("loyalty_cards"):
        row = {
            "barcode": "",
            "barcode_type": "barcode",
            "logo": "",
            "notes": "",
            "color": "#9fa8da",
            "created_at": now,
            "updated_at": now,
            **value,
            **_acl(value, actor, preserve_permissions),
        }
        insert("loyalty_cards", row, shopping.CARD_RECORD, "loyalty_card_ids")
    groups = raw.get("items", {})
    if not isinstance(groups, dict):
        raise ValueError("Invalid legacy items Store")
    for lid, rows in groups.items():
        if lid not in ids["list_ids"] or not isinstance(rows, list):
            raise ValueError("Legacy items require an imported parent")
        for value in rows:
            if not isinstance(value, dict) or value.get("list_id") != lid:
                raise ValueError("Legacy item parent mismatch")
            row = {
                "category_id": "other",
                "product_id": None,
                "quantity": 1,
                "unit": "units",
                "note": None,
                "checked": False,
                "checked_at": None,
                "created_at": now,
                "updated_at": now,
                "image_url": None,
                "order_index": 0,
                "price": None,
                "currency": None,
                "barcode": None,
                **value,
            }
            validate_payload(row, shopping.ITEM_RECORD)
            if "owner_id" in row or "allowed_users" in row:
                child_acl = _acl(row, actor, preserve_permissions)
                parent = staged["shopping_lists"][lid]
                if preserve_permissions and child_acl != {
                    k: parent[k] for k in ("owner_id", "allowed_users")
                }:
                    raise ValueError("Legacy child ACL must match parent")
                row.pop("owner_id", None)
                row.pop("allowed_users", None)
            total = None if row["price"] is None else round(row["quantity"] * row["price"], 10)
            if "estimated_total" in row and row["estimated_total"] != total:
                raise ValueError("Inconsistent legacy item price total")
            row["estimated_total"] = total
            row["product_id"] = id_map.get(row["product_id"], row["product_id"])
            insert("shopping_items", row, shopping.ITEM_RECORD, "item_ids")
    known = set(system_categories) | set(ids["category_ids"])
    for bucket, output in (("products", "product_ids"), ("shopping_items", "item_ids")):
        for key in ids[output]:
            row = staged[bucket][product_keys[key] if bucket == "products" else key]
            if row["category_id"] not in known:
                raise ValueError("Missing legacy category reference")
            pid = row.get("product_id")
            if pid and pid not in product_keys and pid not in catalog:
                raise ValueError("Missing legacy product reference")
    order_map = {}
    for lid in ids["list_ids"]:
        parent = staged["shopping_lists"][lid]
        if any(cid not in known for cid in parent["category_order"]):
            raise ValueError("Missing ordered legacy category")
        item_ids = [r["id"] for r in staged["shopping_items"].values() if r["list_id"] == lid]
        source_order = list(parent["item_order"])
        if not set(source_order) <= set(item_ids):
            raise ValueError("Unknown legacy ordered item")
        # Pinned upstream add_item never updates item_order. This is a supported
        # source representation, not an unknown-ID repair: preserve its explicit
        # prefix, append the actual Store sequence, and report the conversion.
        parent["item_order"].extend(iid for iid in item_ids if iid not in source_order)
        if parent["item_order"] != source_order:
            order_map[lid] = {
                "source_item_order": source_order,
                "item_order": list(parent["item_order"]),
                "policy": "legacy_order_then_items_store_order",
            }
    references = []
    for bucket, output, field in (
        ("products", "product_ids", "image_url"),
        ("shopping_items", "item_ids", "image_url"),
        ("loyalty_cards", "loyalty_card_ids", "logo"),
    ):
        for key in ids[output]:
            row = staged[bucket][product_keys[key] if bucket == "products" else key]
            acl = staged["shopping_lists"][row["list_id"]] if bucket == "shopping_items" else row
            references.append((row, field, acl))
    media_ids, image_map = _migrate_images(staged, references, images, actor)
    state["kitchen"] = staged
    return {
        "source": SOURCE,
        "imported": {
            "regions": len(region_codes),
            **{
                bucket: len(ids[key])
                for bucket, key in (
                    ("lists", "list_ids"),
                    ("items", "item_ids"),
                    ("products", "product_ids"),
                    ("categories", "category_ids"),
                    ("loyalty_cards", "loyalty_card_ids"),
                )
            },
        },
        "region_codes": region_codes,
        **ids,
        "order_map": order_map,
        "media_ids": media_ids,
        "image_map": image_map,
        "id_map": id_map,
        "permission_policy": {
            "mode": "preserve_source" if preserve_permissions else "reset_private",
            "missing_acl": "pinned_legacy_public" if preserve_permissions else "importer_private",
            "catalog_overrides": "importer_private",
            "usage_owner": "importer",
            "items": "inherit_parent_list",
            "media": "source_object_acl",
        },
    }
