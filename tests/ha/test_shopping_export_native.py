"""Actor-scoped shopping JSON exports through native HTTP and durable Store.

Disposable synthetic users/records only; transport setup and credential/listener
cleanup come from the common native fixture. No fake HTTP or Store responses.
"""
from copy import deepcopy
import json
from pathlib import Path
import unittest

import test_unified_http as native
from custom_components.macromate.shopping import SHOPPING_ACTIONS


class ShoppingExportNativeTests(unittest.IsolatedAsyncioTestCase):
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers

    async def asyncSetUp(self):
        await native.NativeHTTPTests.asyncSetUp(self)
        self.sequence = 0
        await self.api("preferences_update", {"preferences": {"synthetic_seed": True}})
        self.initial = await self.backup()

    async def api(self, action, payload=None, index=0, expected=200):
        payload = deepcopy(payload or {})
        if action not in SHOPPING_ACTIONS or not SHOPPING_ACTIONS[action]["read_only"]:
            self.sequence += 1
            payload.setdefault("request_id", f"shopping-export-{self.sequence}")
        async with self.client.post(
            self.origin + "/api/services/macromate/" + action + "?return_response",
            headers=self.headers(index), json=payload,
        ) as response:
            self.assertEqual(response.status, expected, action)
            if expected == 200:
                return (await response.json())["service_response"]
            # Do not expose item details or credentials through failure messages.
            await response.read()
        return {}

    async def reject_unchanged(self, action, payload, index=1, expected=400):
        before = self.durable()
        path = Path(self.tmp.name) / ".storage" / "macromate.meals"
        before_bytes = path.read_bytes()
        await self.api(action, payload, index, expected=expected)
        self.assertEqual(path.read_bytes(), before_bytes, "rejection must not write Store")
        self.assertEqual(self.durable(), before)
        self.assertEqual(await self.backup(), before)

    def durable(self):
        path = Path(self.tmp.name) / ".storage" / "macromate.meals"
        state = json.loads(path.read_text())["data"]
        self.assertEqual(state, self.coord._state())
        return state

    async def backup(self):
        async with self.client.get(
            self.origin + "/api/macromate/backup", headers=self.headers(),
        ) as response:
            self.assertEqual(response.status, 200)
            data = (await response.json())["data"]
        self.assertEqual(data, self.durable())
        return data

    async def restore(self, data):
        self.sequence += 1
        async with self.client.post(
            self.origin + "/api/macromate/restore", headers=self.headers(),
            json={"data": data, "confirm": True,
                  "request_id": f"shopping-export-restore-{self.sequence}"},
        ) as response:
            self.assertEqual(response.status, 200)
            self.assertTrue((await response.json())["restored"])
        restored = await self.backup()
        self.assertEqual(
            {k: v for k, v in restored.items() if k != "ledger"},
            {k: v for k, v in data.items() if k != "ledger"},
        )

    async def export(self, payload=None, index=0):
        before = self.durable()
        data = await self.api("shopping_export_data", payload, index)
        self.assertEqual(self.durable(), before, "export must not alter live/durable state")
        # Import precisely the actor's JSON export without repairing its fields.
        return json.loads(json.dumps(data))

    async def import_exact(self, data, index=0):
        result = await self.api("shopping_import_data", {"data": data}, index)
        self.assertTrue(result["success"])
        owner_id = (self.owner, self.other)[index].id
        kitchen = self.durable()["kitchen"]
        for exported in data["lists"]:
            expected = {**exported, "owner_id": owner_id, "allowed_users": []}
            self.assertEqual(kitchen["shopping_lists"][exported["id"]], expected)
            read = await self.api("shopping_lists_get", {"list_id": exported["id"]}, index)
            self.assertEqual(read["list"], {
                **expected, "active": data["active_list_id"] == exported["id"],
            })
            read = await self.api("shopping_items_get", {"list_id": exported["id"]}, index)
            self.assertEqual(read["items"], data["items"][exported["id"]])
            for item in data["items"][exported["id"]]:
                self.assertEqual(kitchen["shopping_items"][item["id"]], item)
                read = await self.api("shopping_items_get_one", {"item_id": item["id"]}, index)
                self.assertEqual(read["item"], item)
        for bucket, source in (("categories", "categories"), ("products", "user_products"),
                               ("loyalty_cards", "loyalty_cards")):
            for exported in data[source]:
                key = exported["id"]
                if bucket == "products" and exported.get("source") == "catalog":
                    key = owner_id + "|" + key
                self.assertEqual(kitchen[bucket][key], {
                    **exported, "owner_id": owner_id, "allowed_users": [],
                })
        self.assertEqual(kitchen["preferences"].get(owner_id, {}).get("shopping_usage", {}),
                         data["preferences"]["shopping_usage"])
        self.assertEqual(kitchen["active_lists"].get(owner_id), data["active_list_id"])
        return result

    async def test_selected_export_active_selection_is_closed_over_exported_lists(self):
        for index in (0, 1):
            with self.subTest(actor="administrator" if index == 0 else "ordinary-owner"):
                await self.restore(self.initial)
                a = (await self.api("shopping_lists_create", {"name": "Selected A"}, index))["list"]
                b = (await self.api("shopping_lists_create", {"name": "Active B"}, index))["list"]
                item = (await self.api("shopping_items_add", {
                    "list_id": a["id"], "name": "Exact retained snapshot", "quantity": 0.375,
                    "unit": "kg", "price": 0, "barcode": "0000123", "note": "Declared note",
                }, index))["item"]
                await self.api("shopping_lists_set_active", {"list_id": b["id"]}, index)
                root = await self.backup()
                for ids in ([a["id"]], []):
                    with self.subTest(selected_ids=ids):
                        exported = await self.export({"list_ids": ids}, index)
                        self.assertEqual([row["id"] for row in exported["lists"]], ids)
                        self.assertIsNone(exported["active_list_id"])
                        if ids:
                            self.assertEqual(exported["items"][a["id"]], [item])
                        await self.restore(self.initial)
                        await self.import_exact(exported, index)
                        self.assertNotIn(b["id"], self.durable()["kitchen"]["shopping_lists"])
                        await self.restore(root)
                # Included authorized selections are preserved, not always cleared.
                included = await self.export({"list_ids": [b["id"]]}, index)
                self.assertEqual(included["active_list_id"], b["id"])
                await self.restore(self.initial)
                await self.import_exact(included, index)

    async def test_revoked_member_export_omits_inaccessible_selection_without_root_repair(self):
        row = (await self.api("shopping_lists_create", {"name": "Owner private list"}))["list"]
        lid = row["id"]
        item = (await self.api("shopping_items_add", {"list_id": lid, "name": "Private contents"}))["item"]
        await self.api("shopping_lists_update_members", {"list_id": lid, "allowed_users": [self.other.id]})
        await self.api("shopping_lists_set_active", {"list_id": lid}, 1)
        await self.api("shopping_lists_update_members", {"list_id": lid, "allowed_users": []})
        root = await self.backup()
        exported = await self.export(index=1)
        self.assertEqual(exported["lists"], [])
        self.assertEqual(exported["items"], {})
        self.assertIsNone(exported["active_list_id"])
        for value in (lid, row["name"], item["id"], item["name"]):
            self.assertNotIn(value, json.dumps(exported))
        self.assertEqual(root["kitchen"]["active_lists"][self.other.id], lid)
        await self.restore(root)
        self.assertEqual((await self.backup())["kitchen"]["active_lists"][self.other.id], lid)
        for action, payload in (("shopping_lists_get", {"list_id": lid}),
                                ("shopping_items_get_one", {"item_id": item["id"]}),
                                ("shopping_export_data", {"list_ids": [lid]})):
            await self.reject_unchanged(action, payload)
        await self.restore(self.initial)
        await self.import_exact(exported, 1)
        self.assertNotIn(self.other.id, self.durable()["kitchen"]["active_lists"])

    async def test_member_export_excludes_global_region_mutations_and_roundtrips_exactly(self):
        await self.api("shopping_regions_create", {
            "code": "XY", "name": "Public synthetic region", "currency": "XYS",
            "currency_symbol": "¤", "language": "xy",
        })
        category = (await self.api("shopping_categories_add", {
            "name": "Member custom category", "icon": "mdi:basket", "color": "#aabbcc",
        }, 1))["category"]
        product = (await self.api("shopping_products_add", {
            "name": "Member declared product", "category_id": category["id"],
            "default_quantity": 0.375, "default_unit": "kg", "price": 0,
            "currency": "NZD", "barcode": "00098765", "aliases": ["Declared alias"],
            "taxonomy": {"storage": ["fridge"]}, "nutrition": {"calories": 42},
            "substitution_group": None,
        }, 1))["product"]
        catalog_id = "NZ:prod_milk_trim"
        await self.api("shopping_products_update", {
            "product_id": catalog_id, "category_id": category["id"], "price": 2.75,
            "default_quantity": 250, "default_unit": "ml", "barcode": "00000123",
        }, 1)
        # A hiding tombstone remains a personal catalog overlay, not global metadata.
        hidden_id = "NZ:prod_milk_whole"
        await self.api("shopping_products_delete", {"product_id": hidden_id}, 1)
        own = (await self.api("shopping_lists_create", {"name": "Member owned"}, 1))["list"]
        item_ids = []
        for pid in (product["id"], catalog_id):
            item = (await self.api("shopping_items_add", {
                "list_id": own["id"], "name": "Exact declared snapshot", "product_id": pid,
                "category_id": category["id"], "quantity": 0.375, "unit": "kg",
                "price": 0, "currency": "NZD", "barcode": "00000456",
                "note": "No inferred normalization", "image_url": "https://example.invalid/snapshot.png",
            }, 1))["item"]
            item_ids.append(item["id"])
        await self.api("shopping_items_check", {"item_id": item_ids[0], "checked": True}, 1)
        await self.api("shopping_items_reorder", {
            "list_id": own["id"], "item_order": list(reversed(item_ids)),
        }, 1)
        await self.api("shopping_lists_set_active", {"list_id": own["id"]}, 1)
        await self.api("shopping_loyalty_add", {
            "name": "Member loyalty", "number": "0001234", "barcode_type": "qrcode",
        }, 1)
        before_products = {}
        for pid in (product["id"], catalog_id):
            before_products[pid] = await self.api("shopping_products_get", {"product_id": pid}, 1)
        exported = await self.export(index=1)
        # Native RED: the unmodified ordinary member export must not ask its
        # importer to perform forbidden global region/settings mutations.
        replay = await self.api("shopping_import_data", {"data": exported}, 1)
        self.assertTrue(all(count == 0 for count in replay["imported"].values()))
        self.assertEqual(exported["country"], "NZ")
        self.assertEqual(exported["regions"], [])
        self.assertNotIn("settings", exported)
        self.assertEqual((await self.backup())["kitchen"]["regions"]["XY"]["currency"], "XYS")
        # Also carry a genuinely shared list whose private category is omitted.
        private = (await self.api("shopping_categories_add", {
            "name": "OWNER PRIVATE CATEGORY", "icon": "mdi:private", "color": "#112233",
        }))["category"]
        shared = (await self.api("shopping_lists_create", {"name": "Owner shared"}))["list"]
        await self.api("shopping_lists_update_members", {
            "list_id": shared["id"], "allowed_users": [self.other.id],
        })
        shared_item = (await self.api("shopping_items_add", {
            "list_id": shared["id"], "name": "Shared authorized snapshot",
            "category_id": private["id"], "quantity": 0.25, "unit": "l", "price": None,
            "barcode": "000042", "note": "Retained item details",
        }))["item"]
        exported = await self.export(index=1)
        for value in (private["id"], private["name"], private["icon"], private["color"]):
            self.assertNotIn(value, json.dumps(exported))
        self.assertEqual(exported["items"][shared["id"]], [{**shared_item, "category_id": "other"}])
        # Existing shared IDs remain owner-protected; region omission must not
        # grant the importer ownership or permit replacing shared source data.
        await self.reject_unchanged("shopping_import_data", {"data": exported})
        await self.restore(self.initial)
        imported = await self.import_exact(exported, 1)
        self.assertEqual(imported["imported"], {
            "products": 3, "lists": 2, "items": 3, "loyalty_cards": 1,
            "categories": 1, "regions": 0,
        })
        self.assertEqual(self.durable()["kitchen"]["regions"], {})
        self.assertEqual((await self.api("shopping_get_integration_settings", {}, 1))["country"], "NZ")
        for pid, expected in before_products.items():
            self.assertEqual(await self.api("shopping_products_get", {"product_id": pid}, 1), expected)
        self.assertNotIn(hidden_id, [row["id"] for row in
                         (await self.api("shopping_products_get_all", {}, 1))["products"]])
        root = await self.backup()
        await self.restore(root)
        await self.import_exact(exported, 1)
        self.assertEqual((await self.backup())["kitchen"], root["kitchen"])

    async def test_administrative_exports_remain_complete_and_member_region_writes_fail_closed(self):
        await self.api("shopping_regions_create", {
            "code": "XY", "name": "Exact custom region", "currency": "XYS",
            "currency_symbol": "¤", "language": "xy",
        })
        await self.api("shopping_regions_create", {"code": "ZZ", "name": "Unselected custom region"})
        await self.api("shopping_set_country", {"country": "XY"})
        await self.api("shopping_update_integration_settings", {
            "metric_units_only": False, "enable_price_tracking": False, "enable_image_search": True,
        })
        root = await self.backup()
        admin = await self.export()
        self.assertEqual(admin["country"], "XY")
        self.assertEqual(admin["regions"], list(root["kitchen"]["regions"].values()))
        self.assertEqual(admin["settings"], {
            "country": "XY", "metric_units_only": False,
            "enable_price_tracking": False, "enable_image_search": True,
        })
        member = await self.export(index=1)
        self.assertEqual(member["country"], "XY", "retain the literal custom country ID")
        self.assertEqual(member["regions"], [])
        self.assertNotIn("settings", member)
        for action, payload, expected in (
            ("shopping_regions_create", {"code": "AB", "name": "Denied"}, 401),
            ("shopping_regions_update", {"code": "XY", "name": "Denied"}, 401),
            ("shopping_regions_delete", {"code": "XY", "confirm": True}, 401),
            ("shopping_set_country", {"country": "NZ"}, 401),
            ("shopping_update_integration_settings", {"metric_units_only": True}, 401),
            ("shopping_import_data", {"data": {"regions": admin["regions"],
                "lists": [{"id": "denied-staged-list", "name": "Must not persist"}],
                "categories": [{"id": "denied-staged-category", "name": "Must not persist"}]}}, 400),
            ("shopping_import_data", {"data": {"settings": admin["settings"]}}, 400),
            ("shopping_import_data", {"data": admin}, 400),
        ):
            with self.subTest(action=action, payload_kind=tuple(payload)):
                await self.reject_unchanged(action, payload, expected=expected)
        await self.restore(self.initial)
        await self.import_exact(admin)
        imported = await self.backup()
        self.assertEqual(imported["kitchen"]["regions"], root["kitchen"]["regions"])
        self.assertEqual(imported["kitchen"]["preferences"]["shopping"], admin["settings"])
        # The formerly-global region remains publicly readable, but not writable.
        self.assertEqual((await self.api("shopping_regions_get", {"code": "XY"}, 1))["region"],
                         root["kitchen"]["regions"]["XY"])

    async def test_custom_country_member_transfer_keeps_ids_without_provisioning_global_metadata(self):
        await self.api("shopping_regions_create", {"code": "XY", "name": "Source public region"})
        await self.api("shopping_set_country", {"country": "XY"})
        category = (await self.api("shopping_categories_add", {"name": "Custom country category"}, 1))["category"]
        product = (await self.api("shopping_products_add", {
            "name": "Custom country product", "category_id": category["id"],
            "price": 0, "currency": "XYS", "barcode": "00099",
        }, 1))["product"]
        row = (await self.api("shopping_lists_create", {"name": "Custom country list"}, 1))["list"]
        await self.api("shopping_items_add", {
            "list_id": row["id"], "name": "Literal custom snapshot", "product_id": product["id"],
            "category_id": category["id"], "quantity": 0.25, "unit": "kg", "currency": "XYS",
        }, 1)
        await self.api("shopping_lists_set_active", {"list_id": row["id"]}, 1)
        source_products = (await self.api("shopping_products_get_all", {"country": "XY"}, 1))["products"]
        exported = await self.export(index=1)
        self.assertEqual(exported["country"], "XY")
        self.assertEqual(exported["regions"], [])
        self.assertEqual(exported["categories"][0]["region"], "XY")
        self.assertEqual(exported["user_products"][0]["region"], "XY")
        await self.restore(self.initial)
        await self.reject_unchanged("shopping_products_get_all", {"country": "XY"})
        # A custom regional environment is an administrative prerequisite, not
        # something a member transfer may create, select or silently normalize.
        await self.api("shopping_regions_create", {
            "code": "XY", "name": "Destination administrator metadata", "currency": "XYS",
        })
        await self.api("shopping_set_country", {"country": "XY"})
        destination_region = self.durable()["kitchen"]["regions"]["XY"]
        await self.import_exact(exported, 1)
        self.assertEqual(self.durable()["kitchen"]["regions"], {"XY": destination_region})
        self.assertEqual((await self.api("shopping_get_integration_settings", {}, 1))["country"], "XY")
        self.assertEqual((await self.api("shopping_products_get_all", {"country": "XY"}, 1))["products"],
                         source_products)
