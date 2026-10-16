"""Pure shopping-domain acceptance tests; no Home Assistant runtime required."""
from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import importlib
import json
import unittest

ROOT = Path(__file__).resolve().parents[1]
NOW = "2026-10-14T10:00:00Z"

from custom_components.macromate.platform_support import Actor

OWNER = Actor("owner")
MEMBER = Actor("member")
OTHER = Actor("other")
ADMIN = Actor("admin", True)

def kitchen():
    return {key: {} for key in (
        "recipes", "meal_plan", "timers", "timer_presets", "shopping_lists",
        "shopping_items", "products", "categories", "loyalty_cards", "regions",
        "active_lists", "preferences", "media")}

class ShoppingTests(unittest.TestCase):
    def setUp(self):
        self.domain = importlib.import_module("custom_components.macromate.shopping")
        self.k = kitchen()

    successful_actions = set()
    preprocessor_actions = set()

    def call(self, suffix, payload=None, actor=OWNER):
        action = "shopping_" + suffix
        try:
            result = self.domain.shopping_command(self.k, action, payload or {}, actor, NOW)
        except ValueError as error:
            if "parent preprocessing" in str(error):
                self.preprocessor_actions.add(action)
            raise
        self.successful_actions.add(action)
        return result

    def test_private_list_crud_and_member_acl(self):
        self.assertEqual(self.call("lists_get_all"), {"lists": []})
        self.assertEqual(self.k, kitchen(), "read cannot initialize hidden state")
        row = self.call("lists_create", {"name": "Weekly"})["list"]
        self.assertEqual(row["owner_id"], OWNER.user_id)
        self.assertEqual(row["allowed_users"], [])
        lid = row["id"]
        with self.assertRaises(PermissionError):
            self.call("lists_get", {"list_id": lid}, OTHER)
        self.call("lists_update_members", {"list_id": lid, "allowed_users": [MEMBER.user_id]})
        self.assertEqual(self.call("lists_get", {"list_id": lid}, MEMBER)["list"]["name"], "Weekly")
        with self.assertRaises(PermissionError):
            self.call("lists_update", {"list_id": lid, "name": "Stolen"}, MEMBER)
        self.call("lists_update", {"list_id": lid, "name": "Updated", "ha_todo_entity_id": "todo.weekly"})
        self.call("lists_set_active", {"list_id": lid}, MEMBER)
        self.assertTrue(self.call("lists_get_all", actor=MEMBER)["lists"][0]["active"])
        self.assertFalse(self.call("lists_get_all")["lists"][0]["active"])
        with self.assertRaises(ValueError):
            self.call("lists_delete", {"list_id": lid})
        self.call("lists_delete", {"list_id": lid, "confirm": True})
        self.assertEqual(self.call("lists_get_all"), {"lists": []})
        self.assertNotIn(MEMBER.user_id, self.k["active_lists"])

    def test_all_six_real_catalogs_and_packaged_categories(self):
        counts = {"AU": 172, "BE": 62, "CA": 172, "GB": 172, "NZ": 172, "US": 172}
        # Assert actual pinned dataset counts below, not a synthetic catalog fixture.
        total = 0
        ids = set()
        original = deepcopy(self.k)
        for country, count in counts.items():
            data = json.loads((ROOT / "custom_components/macromate/data" / f"products_catalog_{country.lower()}.json").read_text())
            products = self.call("products_get_all", {"country": country})["products"]
            self.assertEqual(len(products), len(data["products"]))
            self.assertEqual(len(products), count)
            for raw, row in zip(data["products"], products):
                self.assertEqual(row["id"], country + ":" + raw["id"])
                self.assertNotIn(row["id"], ids)
                ids.add(row["id"])
                self.assertEqual(row["currency"], data["currency"])
                self.assertEqual(row["price"], raw.get("price", raw.get("typical_price")))
                self.assertIsNone(row.get("nutrition"))
                for key, value in raw.items():
                    if key != "id":
                        self.assertEqual(row[key], value)
            total += len(products)
            categories = self.call("categories_get_all", {"country": country})["categories"]
            self.assertEqual(len(categories), 13)
            self.assertTrue(all({"id", "name", "icon", "color", "sort_order", "system"} <= set(c) for c in categories))
        self.assertEqual(total, sum(counts.values()))
        self.assertEqual(self.k, original)
        self.assertEqual(self.call("categories_get_all", {"country": "BE"})["categories"][0]["name"], "Groenten & Fruit")
        settings = self.call("get_integration_settings")
        self.assertEqual(settings["country"], "NZ")
        self.call("set_country", {"country": "BE"}, ADMIN)
        self.assertEqual(self.call("get_integration_settings")["country"], "BE")
        self.assertEqual(self.call("lists_create", {"name": "Belgian"})["list"]["category_order"], [c["id"] for c in self.call("categories_get_all")["categories"]])
        for invalid in ["../NZ", "xx", "NZ/../US"]:
            with self.assertRaises(ValueError):
                self.call("products_get_all", {"country": invalid})

    def test_items_full_crud_order_delta_check_and_acl(self):
        lid = self.call("lists_create", {"name": "Shared"})["list"]["id"]
        self.call("lists_update_members", {"list_id": lid, "allowed_users": ["member"]})
        item = self.call("items_add", {"list_id": lid, "name": "Flour", "quantity": .25, "unit": "kg"}, MEMBER)["item"]
        iid = item["id"]
        self.assertEqual(item["list_id"], lid)
        self.assertIsNone(item["estimated_total"])
        self.assertEqual(self.call("items_get", {"list_id": lid})["items"][0]["id"], iid)
        self.assertEqual(self.call("items_get_one", {"item_id": iid})["item"]["id"], iid)
        for op, payload in [
            ("items_get", {"list_id": lid}), ("items_get_one", {"item_id": iid}),
            ("items_check", {"item_id": iid, "checked": True}),
            ("items_increment", {"item_id": iid, "amount": .5}),
            ("items_update", {"item_id": iid, "note": "No"}),
            ("items_reorder", {"list_id": lid, "item_order": [iid]}),
            ("items_bulk_check", {"item_ids": [iid], "checked": True}),
            ("items_clear_checked", {"list_id": lid, "confirm": True}),
            ("items_delete", {"item_id": iid}),
            ("items_get_total", {"list_id": lid}),
        ]:
            before = deepcopy(self.k)
            with self.assertRaises(PermissionError, msg=op):
                self.call(op, payload, OTHER)
            self.assertEqual(self.k, before)
        self.assertEqual(self.call("items_increment", {"item_id": iid, "amount": -.1}, MEMBER)["item"]["quantity"], .15)
        with self.assertRaises(ValueError):
            self.call("items_increment", {"item_id": iid, "amount": -1})
        self.call("items_update", {"item_id": iid, "note": "Fresh", "price": 2, "currency": "EUR"}, MEMBER)
        second = self.call("items_add", {"list_id": lid, "name": "Water"})["item"]["id"]
        self.call("items_reorder", {"list_id": lid, "item_order": [second, iid]}, MEMBER)
        self.assertEqual([i["id"] for i in self.call("items_get", {"list_id": lid})["items"]], [second, iid])
        with self.assertRaises(ValueError):
            self.call("items_reorder", {"list_id": lid, "item_order": ["foreign"]})
        self.call("items_check", {"item_id": iid, "checked": True}, MEMBER)
        self.assertEqual(self.call("items_get_one", {"item_id": iid})["item"]["checked_at"], NOW)
        self.assertEqual(self.call("items_bulk_check", {"item_ids": [iid, second], "checked": False}, MEMBER)["count"], 2)
        self.call("items_check", {"item_id": second, "checked": True})
        with self.assertRaises(ValueError):
            self.call("items_clear_checked", {"list_id": lid})
        self.assertEqual(self.call("items_clear_checked", {"list_id": lid, "confirm": True}, MEMBER)["count"], 1)
        self.assertEqual(self.call("lists_get", {"list_id": lid})["list"]["item_order"], [iid])
        self.call("items_delete", {"item_id": iid}, MEMBER)
        self.assertEqual(self.call("items_get", {"list_id": lid}), {"items": []})
        self.assertEqual(self.call("lists_get", {"list_id": lid})["list"]["item_order"], [])

    def test_totals_preserve_unknown_and_separate_currencies(self):
        lid = self.call("lists_create", {"name": "Budget"})["list"]["id"]
        self.call("items_add", {"list_id": lid, "name": "Unknown"})
        self.assertIsNone(self.call("items_get_total", {"list_id": lid})["total"])
        a = self.call("items_add", {"list_id": lid, "name": "A", "price": 1.5, "quantity": 2, "currency": "EUR"})["item"]["id"]
        self.call("items_add", {"list_id": lid, "name": "B", "price": 4, "currency": "USD"})
        self.call("items_add", {"list_id": lid, "name": "Free", "price": 0, "currency": "USD"})
        result = self.call("items_get_total", {"list_id": lid})
        self.assertEqual(result["totals"], {"EUR": 3, "USD": 4})
        self.assertIsNone(result["total"])
        self.assertIsNone(result["currency"])
        self.assertEqual(result["item_count"], 3)
        self.assertEqual(result["unknown_price_count"], 1)
        self.call("items_check", {"item_id": a, "checked": True})
        result = self.call("items_get_total", {"list_id": lid})
        self.assertEqual(result["total"], 4)
        self.assertEqual(result["currency"], "USD")
        self.call("items_update", {"item_id": a, "price": None})
        self.assertIsNone(self.call("items_get_one", {"item_id": a})["item"]["estimated_total"])

    def test_product_crud_catalog_overrides_usage_and_search(self):
        p = self.call("products_add", {"name": "Oat drink", "category_id": "dairy", "aliases": ["oatmilk"], "barcode": "00123", "allergens": [], "tags": ["vegan"], "substitution_group": "milk_group"})["product"]
        pid = p["id"]
        self.assertTrue(p["custom"])
        self.assertIsNone(p["price"])
        self.assertEqual(p["owner_id"], "owner")
        with self.assertRaises(PermissionError):
            self.call("products_get", {"product_id": pid}, OTHER)
        self.assertIsNone(self.call("products_search_by_barcode", {"barcode": "00123"}, OTHER)["product"])
        self.assertEqual(self.call("products_search_by_barcode", {"barcode": "00123"})["product"]["id"], pid)
        self.assertEqual(self.call("products_get_by_ids", {"product_ids": [pid, "missing"]})["products"][0]["id"], pid)
        self.call("products_update", {"product_id": pid, "price": 0, "currency": "EUR", "default_quantity": .5})
        self.assertEqual(self.call("products_get", {"product_id": pid})["product"]["price"], 0)
        self.assertEqual(self.call("products_search", {"query": "oatmikl", "exclude_allergens": ["milk"], "include_tags": ["vegan"]})["products"][0]["id"], pid)
        catalog_id = "NZ:prod_milk_trim"
        self.call("products_update", {"product_id": catalog_id, "price": 8, "aliases": ["specialmilk"]})
        self.call("set_country", {"country": "AU"}, ADMIN)
        self.call("set_country", {"country": "NZ"}, ADMIN)
        self.assertEqual(self.call("products_get", {"product_id": catalog_id})["product"]["price"], 8)
        self.assertEqual(self.call("products_get", {"product_id": catalog_id}, OTHER)["product"]["price"], 3.99)
        lid = self.call("lists_create", {"name": "Usage"})["list"]["id"]
        self.call("lists_update_members", {"list_id": lid, "allowed_users": ["member"]})
        for _ in range(2):
            self.call("items_add", {"list_id": lid, "name": "Milk", "product_id": catalog_id})
        self.call("items_add", {"list_id": lid, "name": "Oat", "product_id": pid})
        suggestions = self.call("products_suggestions", {"limit": 2})["products"]
        self.assertEqual([r["id"] for r in suggestions], [catalog_id, pid])
        self.assertEqual(suggestions[0]["user_frequency"], 2)
        self.assertEqual(self.call("products_get", {"product_id": catalog_id}, MEMBER)["product"]["user_frequency"], 0)
        self.assertEqual(self.call("products_recent", {"limit": 2})["products"][0]["last_used"], NOW)
        substitutes = self.call("products_substitutes", {"product_id": catalog_id, "exclude_allergens": ["milk"]})["substitutes"]
        self.assertIn(pid, [r["id"] for r in substitutes])
        self.assertTrue(all("milk" not in r["allergens"] for r in substitutes))
        self.call("products_delete", {"product_id": catalog_id})
        self.call("set_country", {"country": "NZ"}, ADMIN)
        self.assertNotIn(catalog_id, [r["id"] for r in self.call("products_get_all")["products"]])
        self.assertIn(catalog_id, [r["id"] for r in self.call("products_get_all", actor=OTHER)["products"]])
        self.call("products_delete", {"product_id": pid})
        self.assertIsNone(self.call("products_search_by_barcode", {"barcode": "00123"})["product"])

    def test_loyalty_private_shared_crud_and_owner_management(self):
        card = self.call("loyalty_add", {"name": "Shop", "number": "000123", "barcode_type": "qrcode", "notes": "Private"})["card"]
        cid = card["id"]
        self.assertEqual(self.call("loyalty_get_all", actor=OTHER), {"cards": []})
        self.call("loyalty_update_members", {"card_id": cid, "allowed_users": ["member"]})
        self.assertEqual(self.call("loyalty_get", {"card_id": cid}, MEMBER)["card"]["number"], "000123")
        for op, payload in [("loyalty_get", {"card_id": cid}), ("loyalty_update", {"card_id": cid, "number": "9"}), ("loyalty_delete", {"card_id": cid}), ("loyalty_update_members", {"card_id": cid, "allowed_users": []})]:
            with self.assertRaises(PermissionError):
                self.call(op, payload, OTHER)
        for op, payload in [("loyalty_update", {"card_id": cid, "notes": "9"}), ("loyalty_delete", {"card_id": cid}), ("loyalty_update_members", {"card_id": cid, "allowed_users": []})]:
            with self.assertRaises(PermissionError):
                self.call(op, payload, MEMBER)
        self.call("loyalty_update", {"card_id": cid, "logo": "mdi:cart", "notes": "Updated", "barcode_type": "barcode"})
        self.assertEqual(self.call("loyalty_get", {"card_id": cid})["card"]["notes"], "Updated")
        self.call("loyalty_delete", {"card_id": cid})
        self.assertEqual(self.call("loyalty_get_all"), {"cards": []})
        with self.assertRaises(PermissionError):
            self.call("loyalty_add", {"name": "Public", "number": "1", "private": False})
        public = self.call("loyalty_add", {"name": "Public", "number": "1", "private": False}, ADMIN)["card"]
        self.assertEqual(self.call("loyalty_get", {"card_id": public["id"]}, OTHER)["card"]["number"], "1")
        with self.assertRaises(PermissionError):
            self.call("loyalty_delete", {"card_id": public["id"]}, OTHER)

    def test_custom_regions_settings_and_category_order_persist(self):
        with self.assertRaises(PermissionError):
            self.call("regions_create", {"code": "DE", "name": "Germany"})
        self.call("regions_create", {"code": "DE", "name": "Germany", "currency_symbol": "€", "currency": "EUR", "language": "de"}, ADMIN)
        self.assertEqual(self.call("regions_get_all")["regions"]["DE"]["name"], "Germany")
        self.call("regions_update", {"code": "DE", "name": "Deutschland"}, ADMIN)
        self.assertEqual(self.call("regions_get", {"code": "DE"})["region"]["name"], "Deutschland")
        self.call("set_country", {"country": "DE"}, ADMIN)
        self.assertEqual(self.call("products_get_all"), {"products": []})
        self.call("update_integration_settings", {"metric_units_only": False, "enable_price_tracking": False, "enable_image_search": True}, ADMIN)
        self.assertFalse(self.call("get_integration_settings")["metric_units_only"])
        self.k = json.loads(json.dumps(self.k))
        self.assertEqual(self.call("get_integration_settings")["country"], "DE")
        self.call("regions_delete", {"code": "DE", "confirm": True}, ADMIN)
        self.assertEqual(self.call("get_integration_settings")["country"], "NZ")
        with self.assertRaises(ValueError):
            self.call("regions_create", {"code": "NZ", "name": "Collision"}, ADMIN)
        category = self.call("categories_add", {"name": "Local", "icon": "mdi:cart", "color": "#123456"})["category"]
        self.call("categories_update", {"category_id": category["id"], "name": "Custom"})
        lid = self.call("lists_create", {"name": "Order"})["list"]["id"]
        order = [r["id"] for r in self.call("categories_get_all")["categories"]][::-1]
        self.call("categories_reorder", {"list_id": lid, "category_order": order})
        self.assertEqual(self.call("categories_get_all", {"list_id": lid})["categories"][0]["id"], order[0])
        self.assertEqual(self.call("lists_get", {"list_id": lid})["list"]["category_order"], order)
        with self.assertRaises(ValueError):
            self.call("categories_reorder", {"list_id": lid, "category_order": ["foreign"]})
        self.call("categories_delete", {"category_id": category["id"]})
        self.assertNotIn(category["id"], self.call("lists_get", {"list_id": lid})["list"]["category_order"])

    def test_import_export_complete_acl_filtered_additive_roundtrip(self):
        lid = self.call("lists_create", {"name": "Exported"})["list"]["id"]
        self.call("lists_update_members", {"list_id": lid, "allowed_users": ["member"]})
        product = self.call("products_add", {"name": "Custom", "category_id": "other"})["product"]
        self.call("items_add", {"list_id": lid, "name": "Custom", "product_id": product["id"], "price": 0, "currency": "EUR"})
        self.call("products_update", {"product_id": "NZ:prod_milk_trim", "price": 7})
        card = self.call("loyalty_add", {"name": "Private", "number": "001"})["card"]
        self.call("lists_create", {"name": "Someone else's"}, OTHER)
        backup = self.call("export_data")
        self.assertEqual([r["id"] for r in backup["lists"]], [lid])
        self.assertEqual([r["id"] for r in backup["loyalty_cards"]], [card["id"]])
        self.assertEqual(self.call("export_data", actor=MEMBER)["loyalty_cards"], [])
        self.assertEqual(self.call("export_data", actor=OTHER)["user_products"], [])
        self.assertEqual(backup["slm_backup_version"], "2.0")
        original = self.k
        self.k = kitchen()
        imported = self.call("import_data", {"data": backup})
        self.assertEqual(imported["imported"]["lists"], 1)
        self.assertEqual(imported["imported"]["items"], 1)
        self.assertEqual(self.call("items_get", {"list_id": lid})["items"][0]["price"], 0)
        self.assertEqual(self.call("loyalty_get", {"card_id": card["id"]})["card"]["number"], "001")
        self.assertEqual(self.call("products_get", {"product_id": "NZ:prod_milk_trim"})["product"]["price"], 7)
        # Imported new objects cannot assign another owner or silently share.
        self.assertEqual(self.call("lists_get", {"list_id": lid})["list"]["allowed_users"], [])
        before = deepcopy(self.k)
        repeat = self.call("import_data", {"data": backup})
        self.assertEqual(repeat["imported"]["items"], 0)
        self.assertEqual(self.k, before)
        self.k = original
        before = deepcopy(self.k)
        with self.assertRaises(PermissionError):
            self.call("import_data", {"data": backup}, OTHER)
        self.assertEqual(self.k, before)
        malicious = deepcopy(backup)
        malicious["lists"][0]["owner_id"] = "other"
        self.k = kitchen()
        self.call("import_data", {"data": malicious})
        self.assertEqual(self.call("lists_get", {"list_id": lid})["list"]["owner_id"], "owner")
        malformed = deepcopy(backup)
        malformed["items"][lid][0]["quantity"] = float("nan")
        before = deepcopy(self.k)
        with self.assertRaises(ValueError):
            self.call("import_data", {"data": malformed})
        self.assertEqual(self.k, before)

    def test_parent_preprocessors_are_explicit_not_fake_network(self):
        for name, payload in [
            ("users_get_all", {}),
            ("openfoodfacts_fetch", {"barcode": "00123", "allow_remote": True}),
            ("products_download_image", {"image_url": "https://example.org/food.webp", "product_name": "Apple", "allow_remote": True}),
        ]:
            descriptor = self.domain.SHOPPING_ACTIONS["shopping_" + name]
            self.assertTrue(descriptor["network"])
            self.assertTrue(descriptor["preprocessor"])
            before = deepcopy(self.k)
            with self.assertRaisesRegex(ValueError, "parent preprocessing"):
                self.call(name, payload)
            self.assertEqual(self.k, before)
        with self.assertRaises(ValueError):
            self.call("openfoodfacts_fetch", {"barcode": "00123"})
        with self.assertRaises(ValueError):
            self.call("openfoodfacts_fetch", {"allow_remote": True})
        with self.assertRaises(ValueError):
            self.call("products_download_image", {"image_url": "https://example.org/img", "product_name": "Apple", "allow_remote": False})

    def test_hostile_schema_values_and_atomic_cross_list_bulk_acl(self):
        lid = self.call("lists_create", {"name": "Allowed"})["list"]["id"]
        item = self.call("items_add", {"list_id": lid, "name": "Allowed"})["item"]["id"]
        other_list = self.call("lists_create", {"name": "Hidden"}, OTHER)["list"]["id"]
        hidden = self.call("items_add", {"list_id": other_list, "name": "Hidden"}, OTHER)["item"]["id"]
        before = deepcopy(self.k)
        with self.assertRaises(PermissionError):
            self.call("items_bulk_check", {"item_ids": [item, hidden], "checked": True})
        self.assertEqual(self.k, before)
        for suffix, payload in [
            ("lists_create", {"name": " "}), ("lists_create", {"name": "Bad", "owner_id": "other"}),
            ("items_update", {"item_id": item, "quantity": True}),
            ("items_update", {"item_id": item, "quantity": 0}),
            ("items_update", {"item_id": item, "price": float("inf")}),
            ("products_suggestions", {"limit": -1}), ("products_suggestions", {"limit": 201}),
            ("items_reorder", {"list_id": lid, "item_order": [item, item]}),
            ("regions_create", {"code": "../DE", "name": "Bad"}),
            ("lists_delete", {"list_id": lid, "confirm": 1}),
            ("products_add", {"name": "Bad", "category_id": "other", "taxonomy": {"x": float("nan")}}),
            ("lists_update", {"list_id": lid, "category_order": ["foreign"]}),
            ("items_add", {"list_id": lid, "name": "Bad", "category_id": "foreign"}),
        ]:
            with self.assertRaises(ValueError, msg=suffix):
                self.call(suffix, payload, ADMIN)
            self.assertEqual(self.k, before)
        for suffix, payload in [("export_data", {}), ("lists_get_all", {}), ("products_get_all", {}), ("get_integration_settings", {})]:
            with self.assertRaises(PermissionError):
                self.call(suffix, payload, Actor(None))
        secret_category = self.call("categories_add", {"name": "Secret"}, OTHER)["category"]["id"]
        with self.assertRaises(PermissionError):
            self.call("items_add", {"list_id": lid, "name": "Bad", "category_id": secret_category})
        with self.assertRaises(PermissionError):
            self.domain.shopping_authorize(self.k, "shopping_export_data", {"list_ids": [other_list]}, OWNER)
        with self.assertRaises(PermissionError):
            self.domain.shopping_authorize(self.k, "shopping_import_data", {"data": {"lists": [{"id": other_list, "name": "Guess"}]}}, OWNER)

    def test_deleted_list_and_card_retain_private_event_audience(self):
        lid = self.call("lists_create", {"name": "Secret"})["list"]["id"]
        self.call("lists_update_members", {"list_id": lid, "allowed_users": ["member"]})
        iid = self.call("items_add", {"list_id": lid, "name": "Secret"})["item"]["id"]
        deleted = self.call("items_delete", {"item_id": iid})
        self.assertEqual(set(deleted["_event_users"]), {"owner", "member"})
        removed = self.call("lists_update_members", {"list_id": lid, "allowed_users": []})
        self.assertEqual(set(removed["_event_users"]), {"owner", "member"})
        self.call("lists_update_members", {"list_id": lid, "allowed_users": ["member"]})
        deleted = self.call("lists_delete", {"list_id": lid, "confirm": True})
        self.assertEqual(set(deleted["_event_users"]), {"owner", "member"})
        self.assertNotIn("Secret", json.dumps({k: v for k, v in deleted.items() if k.startswith("_event")}))
        card = self.call("loyalty_add", {"name": "Card", "number": "Private"})["card"]
        self.call("loyalty_update_members", {"card_id": card["id"], "allowed_users": ["member"]})
        self.assertEqual(set(self.call("loyalty_delete", {"card_id": card["id"]})["_event_users"]), {"owner", "member"})

    def test_registry_and_pinned_inventory_schema(self):
        from custom_components.macromate.platform_support import validate_payload
        import hashlib
        inventory = json.loads((ROOT / "custom_components/macromate/data/shopping_coverage.json").read_text())
        self.assertEqual(inventory["upstream_revision"], "c55e90d74f5efd39f5c083b3020fbfe48a19f267")
        self.assertEqual(len(inventory["commands"]), 40)
        self.assertEqual(len({row["upstream"] for row in inventory["commands"]}), 40)
        self.assertEqual(len(inventory["features"]), 68)
        self.assertEqual(inventory["actions"], sorted(self.domain.SHOPPING_ACTIONS))
        self.assertEqual(len({row["id"] for row in inventory["features"]}), 68)
        for row in inventory["commands"]:
            if row["status"] == "replaced_by_filtered_subscription":
                self.assertEqual(row["upstream"], "shopping_list_manager/subscribe")
                continue
            desc = self.domain.SHOPPING_ACTIONS[row["action"]]
            self.assertTrue(set(row["upstream_properties"]) <= set(desc["schema"]["properties"]))
            self.assertTrue(set(row["upstream_required"]) <= set(desc["schema"]["required"]))
            self.assertTrue(hasattr(self, row["test"]))
        for action, desc in self.domain.SHOPPING_ACTIONS.items():
            self.assertIsInstance(desc["description"], str)
            self.assertIs(type(desc["read_only"]), bool)
            self.assertIs(type(desc["admin_only"]), bool)
            self.assertEqual(desc["schema"]["type"], "object")
            self.assertFalse(desc["schema"]["additionalProperties"])
            self.assertIn("required", desc["schema"])
            self.assertNotIn("owner_id", desc["schema"]["properties"])
            if not desc["read_only"]:
                self.assertIn("request_id", desc["schema"]["properties"])
            with self.assertRaises(ValueError):
                self.domain.shopping_authorize(self.k, action, {"actor": "admin"}, ADMIN)
        for asset in inventory["assets"]:
            path = ROOT / "custom_components/macromate/data" / asset["file"]
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), asset["sha256"])
        for code in self.domain.COUNTRIES:
            for row in self.call("products_get_all", {"country": code})["products"]:
                validate_payload(row, self.domain.PRODUCT_RECORD)
        text = (ROOT / "custom_components/macromate/shopping.py").read_text()
        self.assertNotIn("homeassistant", text.lower())
        self.assertFalse(any("node_modules" in str(p) or p.suffix == ".pyc" for p in (ROOT / "custom_components/macromate/data").rglob("*")))

    def test_z_all_registered_domain_actions_really_exercised(self):
        # Independent of ordering or single-test selection: execute named vertical
        # scenarios with real dictionaries if they have not run in this process.
        registry = self.domain.SHOPPING_ACTIONS
        if set(registry) - self.successful_actions - self.preprocessor_actions:
            for name in sorted(n for n in dir(self) if n.startswith("test_") and n != self._testMethodName):
                case = type(self)(name)
                result = unittest.TestResult()
                case.run(result)
                self.assertTrue(result.wasSuccessful(), (result.errors, result.failures))
        pure = {name for name, desc in registry.items() if not desc.get("preprocessor")}
        injected = set(registry) - pure
        self.assertEqual(pure - self.successful_actions, set())
        self.assertEqual(injected, self.preprocessor_actions)
        self.assertEqual(len(pure), 50)
        self.assertEqual(len(injected), 3)

    def test_deleted_product_export_roundtrip_and_reserved_import_ids(self):
        pid = self.call("products_add", {"name": "Used", "category_id": "other"})["product"]["id"]
        lid = self.call("lists_create", {"name": "History"})["list"]["id"]
        iid = self.call("items_add", {"list_id": lid, "name": "Used", "product_id": pid})["item"]["id"]
        self.call("items_delete", {"item_id": iid})
        self.call("products_delete", {"product_id": pid})
        self.call("products_delete", {"product_id": "NZ:prod_milk_trim"})
        backup = self.call("export_data")
        self.k = kitchen()
        self.call("import_data", {"data": backup})
        self.assertNotIn("NZ:prod_milk_trim", [r["id"] for r in self.call("products_get_all")["products"]])
        before = deepcopy(self.k)
        for data in [
            {"user_products": [{"id": "NZ:prod_milk_whole", "name": "Hijacked", "category_id": "other", "source": "user"}]},
            {"user_products": [{"id": "other|private", "name": "Hijacked", "category_id": "other"}]},
            {"categories": [{"id": "produce", "name": "Hijacked"}]},
        ]:
            with self.assertRaises(ValueError):
                self.call("import_data", {"data": data})
            self.assertEqual(self.k, before)
        # Long image URLs are validated by the parent, not truncated to identifier length.
        with self.assertRaisesRegex(ValueError, "parent preprocessing"):
            self.call("products_download_image", {"image_url": "https://example.org/" + "a" * 256,
                "product_name": "Apple", "allow_remote": True})

    def test_taxonomy_filters_schema_and_declared_metadata_search(self):
        p = self.call("products_add", {"name": "Custom metadata", "category_id": "other",
            "taxonomy": {"dietary": ["vegan"], "storage": "fridge", "extra": {"opaque": True}},
            "brands": ["Local"], "collections": ["weekly"], "image_hint": "opaque", "image_source": "declared",
            "nutrition": {"calories": 123}, "price_per_unit": 0})["product"]
        pid = p["id"]
        rows = self.call("products_search", {"query": "Custom metadata", "taxonomy_filters": {"storage": ["fridge"], "dietary": ["vegan"]}})["products"]
        self.assertEqual(rows[0]["id"], pid)
        self.assertEqual(rows[0]["nutrition"], {"calories": 123})
        self.assertEqual(self.call("products_search", {"query": "Custom metadata", "taxonomy_filters": {"storage": ["freezer"]}}), {"products": []})
        with self.assertRaises(ValueError):
            self.call("products_search", {"query": "Custom metadata", "taxonomy_filters": {"dietary": [{"bad": True}]}})
        rows = self.call("products_search", {"query": "Custom metadata", "taxonomy_filters": {"extra": ["anything"]}})["products"]
        self.assertEqual(rows, [])
        settings = self.call("get_integration_settings")
        self.assertEqual(settings["version"], json.loads((ROOT / "custom_components/macromate/manifest.json").read_text())["version"])

    def test_country_switch_keeps_custom_products_visible_and_catalog_overrides_scoped(self):
        pid = self.call("products_add", {"name": "Local bread", "category_id": "bakery", "currency": "NZD", "price": 2})["product"]["id"]
        cid = self.call("categories_add", {"name": "Local shop"})["category"]["id"]
        self.call("products_update", {"product_id": "NZ:prod_milk_trim", "price": 8})
        self.call("set_country", {"country": "BE"}, ADMIN)
        self.assertIn(pid, [r["id"] for r in self.call("products_get_all")["products"]])
        self.assertIn(cid, [r["id"] for r in self.call("categories_get_all")["categories"]])
        self.assertEqual(self.call("products_get", {"product_id": pid})["product"]["currency"], "NZD")
        self.assertFalse(any(r["id"].startswith("NZ:") for r in self.call("products_get_all")["products"]))
        self.call("set_country", {"country": "NZ"}, ADMIN)
        self.assertEqual(self.call("products_get", {"product_id": "NZ:prod_milk_trim"})["product"]["price"], 8)
        global_list = self.call("lists_create", {"name": "Global", "private": False}, ADMIN)["list"]
        self.assertEqual(global_list["owner_id"], "internal")
        self.assertNotIn(global_list["id"], [r["id"] for r in self.call("lists_get_all")["lists"]])
        self.call("lists_update_members", {"list_id": global_list["id"], "allowed_users": ["member"]}, ADMIN)
        self.assertEqual(self.call("lists_get", {"list_id": global_list["id"]}, MEMBER)["list"]["name"], "Global")
        with self.assertRaises(PermissionError):
            self.call("lists_delete", {"list_id": global_list["id"], "confirm": True}, MEMBER)

    def test_item_snapshot_survives_deleted_link_and_large_price_roundtrip(self):
        pid = self.call("products_add", {"name": "Transient", "category_id": "other"})["product"]["id"]
        lid = self.call("lists_create", {"name": "Snapshot"})["list"]["id"]
        row = self.call("items_add", {"list_id": lid, "name": "Retained name", "product_id": pid,
            "quantity": 1000000, "price": 1000000000, "currency": "EUR"})["item"]
        self.call("products_delete", {"product_id": pid})
        backup = self.call("export_data")
        self.k = kitchen()
        self.call("import_data", {"data": backup})
        restored = self.call("items_get_one", {"item_id": row["id"]})["item"]
        self.assertEqual(restored["product_id"], pid)
        self.assertEqual(restored["name"], "Retained name")
        self.assertEqual(restored["estimated_total"], row["estimated_total"])
        self.assertEqual(self.call("items_get_total", {"list_id": lid})["total"], row["quantity"] * row["price"])

    def test_import_references_enforce_category_acl_atomically(self):
        cid = self.call("categories_add", {"name": "Hidden category"}, OTHER)["category"]["id"]
        before = deepcopy(self.k)
        for data in [
            {"lists": [{"id": "imported-list", "name": "New", "category_order": [cid]}]},
            {"lists": [{"id": "imported-list", "name": "New"}], "items": {"imported-list": [{"id": "imported-item", "list_id": "imported-list", "name": "New", "category_id": cid}]}},
            {"user_products": [{"id": "imported-product", "name": "New", "category_id": cid}]},
        ]:
            with self.assertRaises(PermissionError):
                self.call("import_data", {"data": data})
            self.assertEqual(self.k, before)

if __name__ == "__main__":
    unittest.main()
