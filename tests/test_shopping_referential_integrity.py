"""Shopping referential integrity through real actor-scoped domain commands."""
from copy import deepcopy
import json
import unittest

from custom_components.macromate.platform_support import Actor, empty_kitchen
from custom_components.macromate.shopping import shopping_command

NOW = "2026-10-14T12:00:00+00:00"
OWNER = Actor("owner")
MEMBER = Actor("member")
ADMIN = Actor("admin", is_admin=True)
CATALOG_ID = "NZ:prod_milk_trim"


def call(state, suffix, payload=None, actor=OWNER):
    return shopping_command(state, "shopping_" + suffix, payload or {}, actor, NOW)


class ShoppingReferentialIntegrityTests(unittest.TestCase):
    def test_category_delete_rejects_every_stored_product_reference_atomically(self):
        for variant in ("owned", "private_custom", "owned_override", "private_override", "private_tombstone"):
            with self.subTest(variant=variant):
                state = empty_kitchen()
                category = call(state, "categories_add", {"name": "Own category"})["category"]
                lid = call(state, "lists_create", {"name": "Category order"})["list"]["id"]
                actor = ADMIN if variant.startswith("private") else OWNER
                if variant in ("owned", "private_custom"):
                    product = call(state, "products_add", {
                        "name": "Secret product record", "category_id": category["id"],
                        "barcode": "000PRIVATE", "price": 3.25, "currency": "EUR",
                    }, actor)["product"]
                else:
                    product = call(state, "products_update", {
                        "product_id": CATALOG_ID, "name": "Secret product record",
                        "category_id": category["id"], "barcode": "000PRIVATE",
                    }, actor)["product"]
                    if variant == "private_tombstone":
                        call(state, "products_delete", {"product_id": CATALOG_ID}, actor)
                before = deepcopy(state)
                with self.assertRaises(ValueError) as rejected:
                    call(state, "categories_delete", {"category_id": category["id"]})
                self.assertEqual(str(rejected.exception), "Category is used by a shopping product")
                self.assertNotIn(product["id"], str(rejected.exception))
                self.assertNotIn(product["name"], str(rejected.exception))
                self.assertNotIn(product["barcode"], str(rejected.exception))
                self.assertEqual(state, before)
                self.assertIn(category["id"], call(state, "lists_get", {"list_id": lid})["list"]["category_order"])
                # The rejection leaves the owner's actual export importable.
                restored = empty_kitchen()
                call(restored, "import_data", {"data": call(state, "export_data")})
                self.assertIn(category["id"], restored["categories"])
                if variant == "owned":
                    self.assertEqual(call(restored, "products_get", {"product_id": product["id"]})["product"], product)

    def test_actual_owner_member_exports_roundtrip_with_private_category_remapping(self):
        state = empty_kitchen()
        owner_category = call(state, "categories_add", {
            "name": "OWNER PRIVATE CATEGORY", "icon": "mdi:owner-secret", "color": "#aabbcc",
        })["category"]
        lid = call(state, "lists_create", {"name": "Shared weekly", "icon": "mdi:basket"})["list"]["id"]
        call(state, "lists_update_members", {"list_id": lid, "allowed_users": ["member"]})
        member_category = call(state, "categories_add", {
            "name": "MEMBER PRIVATE CATEGORY", "icon": "mdi:member-secret", "color": "#ddeeff",
        }, MEMBER)["category"]
        products = {}
        for actor, category in ((OWNER, owner_category), (MEMBER, member_category)):
            products[actor.owner_id] = call(state, "products_add", {
                "name": actor.owner_id + " declared product", "category_id": category["id"],
                "aliases": ["declared alias"], "default_quantity": 0.375, "default_unit": "kg",
                "price": 0, "currency": "EUR", "price_per_unit": 0, "barcode": "00012345",
                "brands": ["Local"], "tags": ["vegan"], "collections": ["weekly"],
                "taxonomy": {"storage": ["fridge"]}, "nutrition": {"calories": 42},
                "allergens": [], "substitution_group": None,
            }, actor)["product"]
            call(state, "products_update", {
                "product_id": CATALOG_ID, "category_id": category["id"],
                "price": 2.75, "currency": "NZD", "barcode": "00098765",
                "default_unit": "ml", "default_quantity": 250,
            }, actor)
            call(state, "items_add", {
                "list_id": lid, "name": actor.owner_id + " item snapshot",
                "category_id": category["id"], "product_id": products[actor.owner_id]["id"],
                "quantity": 0.375, "unit": "kg", "price": 3.2, "currency": "EUR",
                "barcode": "00000123", "note": "Exact snapshot, not a category label",
                "image_url": "https://example.org/snapshot.png",
            }, actor)
            call(state, "lists_set_active", {"list_id": lid}, actor)
        public_item = call(state, "items_add", {
            "list_id": lid, "name": "System category item", "category_id": "dairy",
            "product_id": CATALOG_ID, "quantity": 250, "unit": "ml", "price": 0,
            "currency": "NZD", "barcode": "00000999",
        }, MEMBER)["item"]
        call(state, "items_check", {"item_id": public_item["id"], "checked": True}, MEMBER)
        ordered = [public_item["id"], *reversed(state["shopping_lists"][lid]["item_order"][:-1])]
        call(state, "items_reorder", {"list_id": lid, "item_order": ordered}, MEMBER)
        original = deepcopy(state)

        for actor, own_category, hidden_category in (
            (OWNER, owner_category, member_category), (MEMBER, member_category, owner_category),
        ):
            with self.subTest(actor=actor.owner_id):
                backup = call(state, "export_data", actor=actor)
                self.assertEqual(state, original, "export must not remap live state")
                # Import the actor's actual JSON export, not a repaired synthetic backup.
                wire_backup = json.loads(json.dumps(backup))
                restored = empty_kitchen()
                imported = call(restored, "import_data", {"data": wire_backup}, actor)
                self.assertEqual(imported["imported"], {
                    "products": 2, "lists": 1, "items": 3, "loyalty_cards": 0,
                    "categories": 1, "regions": 0,
                })
                serialized = json.dumps(backup)
                for private_value in (hidden_category["id"], hidden_category["name"], hidden_category["icon"], hidden_category["color"]):
                    self.assertNotIn(private_value, serialized)
                self.assertEqual(backup["categories"], [own_category])
                expected_list = deepcopy(original["shopping_lists"][lid])
                expected_list["category_order"] = [cid for cid in expected_list["category_order"] if cid != hidden_category["id"]]
                self.assertEqual(backup["lists"], [expected_list])
                expected_list.update(owner_id=actor.owner_id, allowed_users=[], active=True)
                self.assertEqual(call(restored, "lists_get", {"list_id": lid}, actor)["list"], expected_list)
                expected_items = []
                for iid in ordered:
                    row = deepcopy(original["shopping_items"][iid])
                    if row["category_id"] == hidden_category["id"]:
                        row["category_id"] = "other"
                    expected_items.append(row)
                    self.assertEqual(call(restored, "items_get_one", {"item_id": iid}, actor)["item"], row)
                self.assertEqual(backup["items"][lid], expected_items)
                self.assertEqual(call(restored, "items_get", {"list_id": lid}, actor)["items"], expected_items)
                pid = products[actor.owner_id]["id"]
                for product_id in (pid, CATALOG_ID):
                    self.assertEqual(call(restored, "products_get", {"product_id": product_id}, actor),
                                     call(state, "products_get", {"product_id": product_id}, actor))
                self.assertEqual(restored["categories"][own_category["id"]], own_category)
                other_actor = MEMBER if actor == OWNER else OWNER
                before_denial = deepcopy(restored)
                with self.assertRaises(PermissionError):
                    call(restored, "lists_get", {"list_id": lid}, other_actor)
                with self.assertRaises(PermissionError):
                    call(restored, "items_get_one", {"item_id": public_item["id"]}, other_actor)
                self.assertEqual(restored, before_denial)
                # Returned nested copies remain independent after export and import.
                backup["lists"][0]["category_order"].clear()
                backup["items"][lid][0]["note"] = "modified exported copy"
                backup["user_products"][0]["taxonomy"].clear()
                self.assertEqual(state, original)
                self.assertEqual(call(restored, "items_get", {"list_id": lid}, actor)["items"], expected_items)

    def test_member_export_with_no_authorized_custom_categories_uses_public_fallback(self):
        state = empty_kitchen()
        category = call(state, "categories_add", {
            "name": "Private category label", "icon": "mdi:private", "color": "#123abc",
        })["category"]
        lid = call(state, "lists_create", {"name": "Shared"})["list"]["id"]
        call(state, "lists_update_members", {"list_id": lid, "allowed_users": ["member"]})
        item = call(state, "items_add", {
            "list_id": lid, "name": "Snapshot", "category_id": category["id"],
            "quantity": 0.25, "unit": "l", "price": None, "barcode": "00042",
        })["item"]
        before = deepcopy(state)
        for actor in (OWNER, MEMBER):
            with self.subTest(actor=actor.owner_id):
                backup = call(state, "export_data", {"list_ids": [lid]}, actor)
                expected = deepcopy(item)
                if actor == MEMBER:
                    expected["category_id"] = "other"
                    self.assertEqual(backup["categories"], [])
                    for value in (category["id"], category["name"], category["icon"], category["color"]):
                        self.assertNotIn(value, json.dumps(backup))
                else:
                    self.assertEqual(backup["categories"], [category])
                restored = empty_kitchen()
                call(restored, "import_data", {"data": backup}, actor)
                self.assertEqual(call(restored, "items_get_one", {"item_id": item["id"]}, actor)["item"], expected)
                restored_list = call(restored, "lists_get", {"list_id": lid}, actor)["list"]
                self.assertEqual(restored_list["owner_id"], actor.owner_id)
                self.assertEqual(restored_list["allowed_users"], [])
        with self.assertRaises(PermissionError):
            call(state, "items_add", {"list_id": lid, "name": "Denied", "category_id": category["id"]}, MEMBER)
        self.assertEqual(state, before)

    def test_visible_product_export_remaps_omitted_private_category_only_in_copy(self):
        state = empty_kitchen()
        category = call(state, "categories_add", {"name": "Private product category"})["category"]
        product = call(state, "products_add", {
            "name": "Authorized product", "category_id": category["id"], "barcode": "000456",
            "default_unit": "g", "default_quantity": 125, "price": 1.25, "currency": "EUR",
        }, ADMIN)["product"]
        # Persisted PRODUCT_RECORD ACLs can grant access independently of category
        # ACLs. There is deliberately no invented product-sharing command here.
        state["products"][product["id"]]["allowed_users"] = [MEMBER.owner_id]
        before = deepcopy(state)
        backup = call(state, "export_data", actor=MEMBER)
        expected_export = deepcopy(before["products"][product["id"]])
        expected_export["category_id"] = "other"
        self.assertEqual(backup["user_products"], [expected_export])
        self.assertEqual(backup["categories"], [])
        self.assertNotIn(category["id"], json.dumps(backup))
        self.assertNotIn(category["name"], json.dumps(backup))
        restored = empty_kitchen()
        call(restored, "import_data", {"data": backup}, MEMBER)
        expected = {**product, "category_id": "other", "owner_id": MEMBER.owner_id, "allowed_users": []}
        self.assertEqual(call(restored, "products_get", {"product_id": product["id"]}, MEMBER)["product"], expected)
        self.assertEqual(state, before)
        with self.assertRaises(PermissionError):
            call(restored, "products_get", {"product_id": product["id"]}, Actor(ADMIN.user_id))

    def test_import_rejects_unclosed_category_references_without_partial_writes(self):
        state = empty_kitchen()
        category = call(state, "categories_add", {"name": "Hidden"})["category"]
        for category_id, error_type in ((category["id"], PermissionError), ("missing-category", ValueError)):
            for bucket in ("product", "list", "item"):
                with self.subTest(category_id=category_id, bucket=bucket):
                    data: dict = {"lists": [{"id": "new-list", "name": "New"}]}
                    if bucket == "product":
                        data["user_products"] = [{"id": "new-product", "name": "New", "category_id": category_id}]
                    elif bucket == "list":
                        data["lists"][0]["category_order"] = [category_id]
                    else:
                        data["items"] = {"new-list": [{"id": "new-item", "list_id": "new-list", "name": "New", "category_id": category_id}]}
                    before = deepcopy(state)
                    with self.assertRaises(error_type):
                        call(state, "import_data", {"data": data}, MEMBER)
                    self.assertEqual(state, before)


if __name__ == "__main__":
    unittest.main()
