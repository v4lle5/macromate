"""Legacy migration is a real authenticated HA action, not a file rewrite."""

import json
import asyncio
import base64
import io
from typing import Any
from pathlib import Path
import unittest
from unittest.mock import patch

import test_unified_http as native


class LegacyImportNativeTests(unittest.IsolatedAsyncioTestCase):
    client: Any
    hass: Any
    coord: Any
    tmp: Any
    owner: Any
    other: Any
    tokens: list[tuple[Any, str]]
    origin: str
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers

    async def service(self, action, payload, user=0):
        async with self.client.post(
            self.origin + f"/api/services/macromate/{action}?return_response",
            headers=self.headers(user), json=payload,
        ) as response:
            return response.status, await response.json()

    async def test_describe_publishes_admin_confirmed_stable_id_legacy_contract(self):
        status, body = await self.service("describe", {})
        self.assertEqual(status, 200)
        actions = body["service_response"]["actions"]
        self.assertIn("legacy_import", actions, "Legacy stores have no native import action")
        action = actions["legacy_import"]
        self.assertTrue(action["admin_only"])
        self.assertFalse(action["read_only"])
        schema = action["schema"]
        self.assertFalse(schema["additionalProperties"])
        self.assertGreaterEqual(
            set(schema["required"]),
            {"source", "stores", "preserve_permissions", "confirm", "request_id"},
        )
        self.assertEqual(schema["properties"]["confirm"], {"const": True})
        self.assertEqual(
            schema["properties"]["source"],
            {"const": "recipe_manager"},
        )


    def test_legacy_source_country_and_stable_id_schema_is_fail_closed(self):
        from custom_components.macromate.platform_api import ACTIONS
        from custom_components.macromate.platform_support import validate_payload

        schema = ACTIONS["legacy_import"]["schema"]
        recipe = {"source": "recipe_manager", "stores": {"recipe_manager.recipes": {"recipes": {}}},
                  "preserve_permissions": False, "confirm": True, "request_id": "stable-import"}
        self.assertEqual(validate_payload(recipe, schema), recipe)
        for invalid in ({**recipe, "country": "GB"},
                        {**recipe, "source": "shopping_list_manager"},
                        {**recipe, "request_id": " "},
                        {**recipe, "request_id": "control\u0000id"}):
            with self.subTest(source=invalid["source"], country=invalid.get("country")), self.assertRaises(ValueError):
                validate_payload(invalid, schema)
        shopping = {**recipe, "source": "shopping_list_manager", "country": "GB"}
        with self.assertRaises(ValueError):
            validate_payload(shopping, schema)

    def test_legacy_raw_category_and_auxiliary_tag_arrays_are_valid_schema_inputs(self):
        from custom_components.macromate.platform_api import ACTIONS
        from custom_components.macromate.platform_support import validate_payload

        base = {"preserve_permissions": False, "confirm": True, "request_id": "literal-array"}
        for payload in (
            {**base, "source": "recipe_manager", "stores": {"recipe_manager.tags": []}},
        ):
            self.assertEqual(validate_payload(payload, ACTIONS["legacy_import"]["schema"]), payload)

    def test_legacy_service_metadata_covers_every_discovered_field(self):
        import yaml
        from custom_components.macromate.platform_api import ACTIONS

        component = Path(__file__).parents[2] / "custom_components" / "macromate"
        services = yaml.safe_load((component / "services.yaml").read_text())
        self.assertIn("legacy_import", services, "Legacy import lacks native service metadata")
        expected = set(ACTIONS["legacy_import"]["schema"]["properties"])
        self.assertEqual(set(services["legacy_import"]["fields"]), expected)
        for file in (component / "strings.json", component / "translations/en.json", component / "translations/de.json"):
            document = json.loads(file.read_text())
            self.assertIn("legacy_import", document["services"], str(file))
            record = document["services"]["legacy_import"]
            self.assertTrue(record["name"])
            self.assertTrue(record["description"])
            self.assertEqual(set(record["fields"]), expected)

    async def test_recipe_store_images_plans_and_timers_survive_real_sdk_import(self):
        from PIL import Image
        from tools import macromate_transfer as sdk

        stream = io.BytesIO()
        Image.new("RGB", (3, 2), "blue").save(stream, format="PNG")
        encoded = base64.b64encode(stream.getvalue()).decode("ascii")
        first = "/local/recipe_manager/images/original.webp"
        second = "/local/images/recipe_manager/extra.webp"
        record = {"id": "Old.Recipe", "title": "Original soup", "favourite": False,
                  "ingredients": [{"name": "Base", "is_heading": True}, {"name": "Milk", "amount": "1/2", "unit": "cup"}],
                  "nutrition": {"calories": "120 kcal", "protein": None, "fat": 0},
                  "image_url": first, "photos": [second, first, "https://example.invalid/inert.png"],
                  "created_at": "2026-03-05T09:10:11Z", "updated_at": "2026-03-05T09:10:11Z"}
        key = "recipe_manager.recipes"
        stores = {key: {"version": 1, "minor_version": 1, "key": key, "data": {record["id"]: record}},
                  "recipe_manager.meal_plans": {"Old.Plan": {"id": "Old.Plan", "recipe_id": record["id"], "date": "2026-10-14", "meal_type": "dinner", "servings": 2}},
                  "recipe_manager.global_timers": {"timers": {"Old.Timer": {"id": "Old.Timer", "label": "Soup", "duration": 1200, "start_time": 1772701200., "running": False, "paused_remaining": 0, "preset_id": "Old.Preset"}},
                                                    "timer_presets": [{"id": "Old.Preset", "name": "Soup", "seconds": 1200}]},
                  "recipe_manager.tags": ["inert auxiliary tag"]}
        kwargs = dict(source="recipe_manager", stores=stores, images={first: encoded, second: encoded},
                      preserve_permissions=False, request_id="native-old-recipe", confirm=True, trusted_lan_http=True)
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as save:
            result = await asyncio.to_thread(sdk.import_legacy, self.origin, self.tokens[0][1], **kwargs)
            self.assertTrue(result["imported"])
            self.assertEqual(result["recipe_ids"], ["Old.Recipe"])
            self.assertEqual(result["meal_plan_ids"], ["Old.Plan"])
            self.assertEqual(result["timer_ids"], ["Old.Timer"])
            self.assertEqual(result["timer_preset_ids"], ["Old.Preset"])
            self.assertEqual(save.call_count, 1)
            path = Path(self.tmp.name) / ".storage/macromate.meals"
            before = path.read_bytes()
            durable = json.loads(before)["data"]
            self.assertEqual(durable, self.coord._state())
            actual = durable["kitchen"]["recipes"]["Old.Recipe"]
            self.assertEqual(actual["name"], record["title"])
            self.assertIs(actual["is_favourite"], False)
            self.assertEqual(actual["created_at"], record["created_at"])
            self.assertEqual(actual["nutrition_raw"], record["nutrition"])
            self.assertIsNone(actual["declared_nutrition"])
            self.assertEqual(actual["nutrition_basis"], "unknown")
            self.assertEqual(actual["photos"], [result["image_map"][second], result["image_map"][first], "https://example.invalid/inert.png"])
            replay = await asyncio.to_thread(sdk.import_legacy, self.origin, self.tokens[0][1], **kwargs)
            self.assertEqual(replay, result)
            self.assertEqual(save.call_count, 1)
            self.assertEqual(path.read_bytes(), before)
            async with self.client.ws_connect(self.origin + "/api/websocket") as ws:
                self.assertEqual((await ws.receive_json())["type"], "auth_required")
                await ws.send_json({"type": "auth", "access_token": self.tokens[0][1]})
                self.assertEqual((await ws.receive_json())["type"], "auth_ok")
                await ws.send_json({"id": 1, "type": "macromate/command", "action": "legacy_import",
                                    "payload": {key: value for key, value in kwargs.items() if key != "trusted_lan_http"}})
                response = await ws.receive_json()
                self.assertTrue(response["success"], response)
                self.assertEqual(response["result"], result)
            self.assertEqual(save.call_count, 1)
            self.assertEqual(path.read_bytes(), before)
        for reference in result["image_map"].values():
            async with self.client.get(self.origin + reference, headers=self.headers()) as response:
                self.assertEqual(response.status, 200)
                self.assertEqual(response.content_type, "image/webp")
                with Image.open(io.BytesIO(await response.read())) as image:
                    self.assertEqual(image.size, (3, 2))
            async with self.client.get(self.origin + reference, headers=self.headers(1)) as response:
                self.assertEqual(response.status, 404)
                await response.read()
        status, body = await self.service("recipes_get", {"recipe_id": "Old.Recipe"})
        self.assertEqual(status, 200)
        self.assertEqual(body["service_response"]["recipe"], actual)
        from custom_components.macromate.coordinator import MealTrackerCoordinator
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        await restarted.async_load()
        self.assertEqual(restarted._state(), durable)
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as save:
            status, _ = await self.service("recipe_log", {"recipe_id": "Old.Recipe", "servings": 1, "meal_type": "dinner", "request_id": "no-invented-nutrition"})
            self.assertEqual(status, 400)
            save.assert_not_called()
            self.assertEqual(path.read_bytes(), before)

    async def test_large_recipe_import_uses_private_sdk_without_raising_generic_limits(self):
        from tools import macromate_transfer as sdk
        from tools import macromate_client as generic

        records = {f"Large.{index:03}": {"id": f"Large.{index:03}", "name": f"Large recipe {index}", "notes": "x" * 50000} for index in range(180)}
        stores = {"recipe_manager.recipes": records}
        payload = {"source": "recipe_manager", "stores": stores, "images": {}, "preserve_permissions": False, "confirm": True, "request_id": "native-large-legacy"}
        self.assertGreater(len(json.dumps(payload).encode()), 8388608)
        with patch.object(generic, "build_opener", wraps=generic.build_opener) as opener:
            with self.assertRaises(ValueError):
                await asyncio.to_thread(generic.call_service, self.origin, self.tokens[0][1], "legacy_import", payload, trusted_lan_http=True)
            opener.assert_not_called()
        result = await asyncio.to_thread(sdk.import_legacy, self.origin, self.tokens[0][1], source="recipe_manager", stores=stores,
                                        preserve_permissions=False, request_id="native-large-legacy", confirm=True, trusted_lan_http=True)
        self.assertEqual(result["recipe_ids"], list(records))
        path = Path(self.tmp.name) / ".storage/macromate.meals"
        durable = json.loads(path.read_bytes())["data"]
        self.assertEqual(durable, self.coord._state())
        for key, source in records.items():
            self.assertEqual(durable["kitchen"]["recipes"][key]["notes"], source["notes"])
        downloaded = await asyncio.to_thread(sdk.download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True)
        self.assertEqual(downloaded["data"], durable)
        status, body = await self.service("describe", {})
        self.assertEqual(status, 200)
        limits = body["service_response"]["limits"]
        self.assertEqual(limits["command_payload_bytes"], 8388608)
        self.assertEqual(limits["client_default_request_bytes"], 1048576)
        self.assertEqual(limits["client_default_response_bytes"], 4194304)
        self.assertEqual(limits["native_ha_http_request_bytes"], 16777216)

    async def test_retired_legacy_shopping_refused_by_services_and_private_route(self):
        payload = {'source': 'shopping_list_manager', 'stores': {'shopping_list_manager.custom_regions': {}},
                   'country': 'GB', 'preserve_permissions': False, 'confirm': True, 'request_id': 'retired'}
        before = self.coord._state()
        with patch.object(self.coord._store, 'async_save', wraps=self.coord._store.async_save) as save:
            status, _ = await self.service('legacy_import', payload)
            self.assertEqual(status, 400)
            async with self.client.post(self.origin + '/api/macromate/legacy-import', headers=self.headers(), json=payload) as response:
                self.assertEqual(response.status, 400)
                await response.read()
            save.assert_not_called()
        self.assertEqual(self.coord._state(), before)


    async def test_conflicting_recipe_declarations_reject_create_update_and_legacy_before_save(self):
        from tools import macromate_transfer as sdk

        status, created = await self.service("recipes_add", {"name": "Equal aliases",
            "declared_nutrition": {"calories": 100, "carbs": 3, "carbohydrates": 3},
            "nutrition_basis": "per_serving"})
        self.assertEqual(status, 200)
        rid = created["service_response"]["recipe"]["id"]
        path = Path(self.tmp.name) / ".storage/macromate.meals"
        before = path.read_bytes()
        for value in (0, 3):
            declarations = {"calories": 100, "carbs": value, "carbohydrates": 7}
            cases = [("recipes_add", {"name": "Conflicting", "declared_nutrition": declarations,
                                      "nutrition_basis": "per_serving"}),
                     ("recipes_update", {"recipe_id": rid, "declared_nutrition": declarations}),
                     ("legacy_import", {"source": "recipe_manager", "stores": {"recipe_manager.recipes": {
                         "Conflicting": {"id": "Conflicting", "name": "Conflicting", "declared_nutrition": declarations,
                                         "nutrition_basis": "per_serving"}}},
                         "preserve_permissions": False, "confirm": True, "request_id": f"bad-alias-{value}"})]
            for action, payload in cases:
                with self.subTest(action=action, value=value), patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as save:
                    status, body = await self.service(action, payload)
                    self.assertEqual(status, 400, body)
                    save.assert_not_called()
                    self.assertEqual(path.read_bytes(), before)
        status, _ = await self.service("recipe_log", {"recipe_id": rid, "servings": 1, "meal_type": "dinner"})
        self.assertEqual(status, 200)
        backup = await asyncio.to_thread(sdk.download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True)
        result = await asyncio.to_thread(sdk.restore_backup, self.origin, self.tokens[0][1], backup["data"],
                                        confirm=True, request_id="equal-alias-history", trusted_lan_http=True)
        self.assertTrue(result["restored"])
        self.assertEqual(json.loads(path.read_bytes())["data"], self.coord._state())

    async def test_historical_shopping_image_bytes_and_acl_survive_full_restore(self):
        from PIL import Image
        from tools import macromate_transfer as sdk
        from copy import deepcopy

        image = io.BytesIO()
        Image.new("RGB", (4, 3), "green").save(image, format="PNG")
        reference = "/local/images/shopping_list_manager/old.png"
        prefix = "shopping_list_manager."
        stores = {
            prefix + "lists": {"Old.List": {"id": "Old.List", "name": "  Literal List  ",
                "owner_id": self.owner.id, "allowed_users": [self.other.id], "item_order": []}},
            prefix + "categories": [{"id": "Old.Category", "name": "Category", "system": False}],
            prefix + "products": {"Old.Product": {"id": "Old.Product", "name": "Milk",
                "category_id": "Old.Category", "custom": True, "barcode": "000123"}},
            prefix + "items": {"Old.List": [{"id": "Old.Item", "list_id": "Old.List", "name": "Milk",
                "product_id": "Old.Product", "category_id": "Old.Category", "quantity": 2,
                "unit": "bottles", "image_url": reference}]},
        }
        original = deepcopy(stores)
        # Dormant decoder constructs an old upgrade fixture; shopping import
        # routes are retired. Only complete administrative restore is callable.
        from custom_components.macromate.legacy_shopping import import_legacy_shopping
        from custom_components.macromate.platform_support import Actor
        stage = deepcopy(self.coord._state())
        result = import_legacy_shopping(stage, stores,
            {reference: base64.b64encode(image.getvalue()).decode('ascii')},
            Actor(self.owner.id, is_admin=True), '2026-10-01T12:00:00+00:00',
            country='GB', preserve_permissions=True)
        options = dict(request_id='historical-full-restore', confirm=True, trusted_lan_http=True)
        path = Path(self.tmp.name) / ".storage/macromate.meals"
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as save:
            await asyncio.to_thread(sdk.restore_backup, self.origin, self.tokens[0][1], stage, **options)
            self.assertEqual(save.call_count, 1)
            before = path.read_bytes()
            durable = json.loads(before)["data"]
            self.assertEqual(durable, self.coord._state())
            kitchen = durable["kitchen"]
            self.assertEqual(kitchen["shopping_lists"]["Old.List"]["name"], "  Literal List  ")
            self.assertEqual(kitchen["shopping_lists"]["Old.List"]["allowed_users"], [self.other.id])
            self.assertEqual(kitchen["shopping_lists"]["Old.List"]["item_order"], ["Old.Item"])
            self.assertEqual(kitchen["products"]["Old.Product"]["barcode"], "000123")
            item = kitchen["shopping_items"]["Old.Item"]
            self.assertEqual((item["quantity"], item["unit"]), (2, "bottles"))
            self.assertEqual(item["image_url"], result["image_map"][reference])
            replay = await asyncio.to_thread(sdk.restore_backup, self.origin, self.tokens[0][1], stage, **options)
            self.assertTrue(replay["restored"])
            self.assertEqual(save.call_count, 1)
            self.assertEqual(path.read_bytes(), before)
        self.assertEqual(stores, original)
        async with self.client.get(self.origin + item["image_url"], headers=self.headers(1)) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.content_type, "image/webp")
            with Image.open(io.BytesIO(await response.read())) as decoded:
                self.assertEqual(decoded.size, (4, 3))
        from custom_components.macromate.coordinator import MealTrackerCoordinator
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        await restarted.async_load()
        self.assertEqual(restarted._state(), durable)

    async def test_legacy_auth_validation_conflicts_and_failed_save_never_publish(self):
        from copy import deepcopy

        status, _ = await self.service("preferences_update", {"preferences": {"keep": "baseline"}})
        self.assertEqual(status, 200)
        path = Path(self.tmp.name) / ".storage/macromate.meals"
        before = path.read_bytes()
        state = deepcopy(self.coord._state())
        payload = {"source": "recipe_manager", "stores": {"recipe_manager.recipes": {
            "Old.Valid": {"id": "Old.Valid", "name": "Valid"}}},
            "preserve_permissions": False, "confirm": True, "request_id": "native-rejections"}
        route = self.origin + "/api/macromate/legacy-import"
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as save:
            for headers, expected in (({}, 401), (self.headers(1), 403)):
                async with self.client.post(route, headers=headers, json=payload) as response:
                    self.assertEqual(response.status, expected)
                    await response.read()
            async with self.client.post(self.origin + "/api/services/macromate/legacy_import?return_response",
                                        headers=self.headers(1), json=payload) as response:
                self.assertEqual(response.status, 401)
                await response.read()
            bad = deepcopy(payload)
            bad["stores"]["recipe_manager.recipes"]["Old.Invalid"] = {"id": "mismatch", "name": "Bad"}
            for change in ({"confirm": False}, {"request_id": " "}, {"stores": bad["stores"]},
                           {"images": {"unused": "AAAA"}}):
                async with self.client.post(route, headers=self.headers(), json={**payload, **change}) as response:
                    self.assertEqual(response.status, 400)
                    await response.read()
            save.assert_not_called()
            self.assertEqual(self.coord._state(), state)
            self.assertEqual(path.read_bytes(), before)
        with patch.object(self.coord._store, "async_save", side_effect=OSError("synthetic disk failure")):
            async with self.client.post(route, headers=self.headers(), json=payload) as response:
                self.assertEqual(response.status, 503)
                await response.read()
        self.assertEqual(self.coord._state(), state)
        self.assertEqual(path.read_bytes(), before)
        async with self.client.post(route, headers=self.headers(), json=payload) as response:
            self.assertEqual(response.status, 200)
            await response.read()
        committed = path.read_bytes()
        async with self.client.post(route, headers=self.headers(), json={**payload, "preserve_permissions": True}) as response:
            self.assertEqual(response.status, 400)
            await response.read()
        self.assertEqual(path.read_bytes(), committed)


if __name__ == "__main__":
    unittest.main()
