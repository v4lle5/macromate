"""Food/diary API integration: synthetic labels, actual HA coordinator."""
from test_coordinator_transactions import CoordinatorTransactions


class FoodCommandsTests(CoordinatorTransactions):
    async def test_provider_failures_preserve_local_search_and_logging(self):
        from unittest.mock import AsyncMock
        from custom_components.macromate.food_provider import (
            ProviderConsentRequired, ProviderRateLimited, ProviderUnavailable,
        )
        food = (await self.coord.async_command("save_food", {"food": {
            "name": "Synthetic oats", "base_unit": "g",
            "nutrients_per_100": {"calories": 400},
        }}))["food"]
        provider = self.coord._provider = AsyncMock()
        provider.set_enabled = lambda enabled: None
        self.coord.settings["enable_food_database"] = True
        for failure, warning in [
            (ProviderUnavailable("private upstream details"), "provider_unavailable"),
            (TimeoutError(), "provider_unavailable"),
            (ProviderRateLimited(), "provider_rate_limited"),
            (ProviderConsentRequired(), "provider_consent_required"),
        ]:
            with self.subTest(warning=warning, failure=type(failure)):
                provider.async_search.side_effect = failure
                provider.async_lookup_barcode.side_effect = failure
                before = self.coord._state()
                result = await self.coord.async_command("search_foods", {
                    "query": "oats", "online": True,
                })
                self.assertEqual(result["warnings"], [warning])
                self.assertEqual(result["source"], "local")
                self.assertEqual([row["food_id"] for row in result["foods"]], [food["food_id"]])
                barcode = await self.coord.async_command("barcode", {
                    "barcode": "4006381333931", "online": True,
                })
                self.assertEqual(barcode["warnings"], [warning])
                self.assertEqual(barcode["foods"], [])
                self.assertEqual(self.coord._state(), before)
                self.assertNotIn("private upstream", str(result))
        logged = await self.coord.async_command("log_food", {
            "food_id": food["food_id"], "amount": 50, "meal_type": "breakfast",
        })
        self.assertEqual(logged["entry"]["calories"], 200)

    async def test_disabled_online_search_returns_local_results_without_contacting_provider(self):
        from unittest.mock import AsyncMock
        provider = self.coord._provider = AsyncMock()
        result = await self.coord.async_command("search_foods", {"query": "oats", "online": True})
        self.assertEqual(result["warnings"], ["provider_consent_required"])
        self.assertEqual(result["foods"], [])
        self.assertEqual(provider.mock_calls, [])

    async def test_successful_remote_search_and_cache_failure_are_not_reported_as_offline(self):
        from unittest.mock import AsyncMock
        from custom_components.macromate.foods import FoodProduct
        remote = FoodProduct.from_dict({
            "food_id": "off:4006381333931", "name": "Synthetic remote oats",
            "base_unit": "g", "nutrients_per_100": {"calories": 400},
            "source": "open_food_facts", "barcodes": ["4006381333931"],
            "source_url": "https://world.openfoodfacts.org/product/4006381333931",
            "license": "ODbL-1.0 / DbCL-1.0",
        })
        provider = self.coord._provider = AsyncMock()
        provider.set_enabled = lambda enabled: None
        provider.async_search.return_value = [remote]
        self.coord.settings["enable_food_database"] = True
        self.store.fail = True
        with self.assertRaises(OSError):
            await self.coord.async_command("search_foods", {"query": "oats", "online": True})
        self.assertNotIn(remote.food_id, self.coord.foods)
        self.store.fail = False
        result = await self.coord.async_command("search_foods", {"query": "oats", "online": True})
        self.assertEqual(result["warnings"], [])
        self.assertEqual(result["source"], "local + Open Food Facts")
        self.assertIn("ODbL", result["attribution"])
        self.assertEqual(result["foods"][0]["food_id"], remote.food_id)

    async def test_online_access_requires_config_consent_and_cached_attribution_persists(self):
        from custom_components.macromate.foods import FoodProduct
        class Provider:
            calls = 0
            def set_enabled(self, enabled):
                self.enabled = enabled
            async def async_lookup_barcode(self, barcode):
                self.calls += 1
                return FoodProduct.from_dict({"food_id":"off:"+barcode,"name":"Synthetic OFF fixture",
                    "base_unit":"g","nutrients_per_100":{"calories":100},"barcodes":[barcode],
                    "source":"open_food_facts","source_url":"https://world.openfoodfacts.org/product/"+barcode,"license":"ODbL-1.0 / DbCL-1.0"})
        provider = Provider()
        self.coord._provider = provider
        disabled = await self.coord.async_command("barcode",{"barcode":"4006381333931","online":True})
        self.assertEqual(disabled["warnings"], ["provider_consent_required"])
        self.assertEqual(disabled["foods"], [])
        self.assertEqual(provider.calls,0)
        self.coord.settings["enable_food_database"] = True
        remote = await self.coord.async_command("barcode",{"barcode":"4006381333931","online":True})
        self.assertEqual(provider.calls,1)
        self.assertIn("ODbL",remote["attribution"])
        self.coord.settings["enable_food_database"] = False
        await self.coord.async_load()
        cached = await self.coord.async_command("barcode",{"barcode":"4006381333931","online":False})
        self.assertEqual(cached["foods"][0]["food_id"],remote["foods"][0]["food_id"])
        self.assertIn("Open Food Facts",cached["attribution"])
        self.assertEqual(provider.calls,1)

    async def test_quick_copy_edit_delete_and_confirmed_clear_are_retryable(self):
        payload = {"name":"Synthetic quick","meal_type":"lunch","calories":500,"protein":20,"date":"2026-10-14","request_id":"quick1"}
        item = await self.coord.async_command("log_meal",payload)
        replay = await self.coord.async_command("log_meal",payload)
        self.assertEqual(replay,item)
        copied = await self.coord.async_command("copy_meal",{"entry_id":item["entry_id"],"date":"2026-10-15","meal_type":"snack","request_id":"copy1"})
        self.assertNotEqual(copied["entry_id"],item["entry_id"])
        self.assertEqual(copied["entry"]["calories"],500)
        edited = await self.coord.async_command("update_meal",{"entry_id":item["entry_id"],"calories":450,"request_id":"editquick1"})
        self.assertEqual(edited["entry"]["calories"],450)
        await self.coord.async_command("delete_meal",{"entry_id":item["entry_id"],"request_id":"delquick1"})
        await self.coord.async_command("delete_meal",{"entry_id":item["entry_id"],"request_id":"delquick1"})
        await self.coord.async_command("log_meal",payload)
        self.assertEqual((await self.coord.async_command("diary",{"date":"2026-10-14"}))["entries"],[])
        with self.assertRaises(ValueError):
            await self.coord.async_command("clear_day",{"date":"2026-10-15","confirm":False})
        cleared = await self.coord.async_command("clear_day",{"date":"2026-10-15","confirm":True,"request_id":"clearnext"})
        self.assertEqual(cleared["removed"],1)
        self.assertEqual(await self.coord.async_command("clear_day",{"date":"2026-10-15","confirm":True,"request_id":"clearnext"}),cleared)

    async def test_local_search_barcode_and_favorite_templates_survive_restart(self):
        food = (await self.coord.async_command("save_food", {"food":{"name":"Synthetic juice","producer":"Test Maker",
                "base_unit":"ml","nutrients_per_100":{"calories":50},
                "servings":[{"serving_id":"glass","label":"Glass","amount":250}],
                "barcodes":["0012345678905"]},"request_id":"savejuice"}))["food"]
        favorite = await self.coord.async_command("favorite", {"food_id":food["food_id"],"enabled":True,
                         "serving_id":"glass","quantity":0.5,"request_id":"favorite1"})
        self.assertEqual(favorite["food"]["favorite"]["amount"],125)
        found = await self.coord.async_command("search_foods", {"query":"maker","filter":"favorites"})
        self.assertEqual(len(found["foods"]),1)
        barcode = await self.coord.async_command("barcode", {"barcode":"0012345678905","online":False})
        self.assertEqual(barcode["foods"][0]["food_id"],food["food_id"])
        await self.coord.async_load()
        self.assertTrue((await self.coord.async_command("food",{"food_id":food["food_id"]}))["food"]["is_favorite"])
        empty = await self.coord.async_command("search_foods", {"query":"maker","filter":"recent"})
        self.assertEqual(empty["foods"],[])
        await self.coord.async_command("log_food", {"food_id":food["food_id"],"amount":100,"meal_type":"snack","request_id":"juicelog"})
        recent = await self.coord.async_command("search_foods", {"query":"maker","filter":"recent"})
        self.assertEqual(len(recent["foods"]),1)
        self.assertIn("protein",(await self.coord.async_command("diary",{}))["nutrition_missing"])

    async def test_create_food_serving_log_edit_snapshot_and_diary(self):
        created = await self.coord.async_command("save_food", {"food":{
            "name":"Synthetic oats","base_unit":"g",
            "nutrients_per_100":{"calories":400,"protein":20,"carbs":60,"fat":10,"fiber":8},
            "servings":[{"serving_id":"scoop","label":"Scoop","amount":25}],
            "barcodes":["4006381333931"]},"request_id":"foodcreate1"})
        fid = created["food"]["food_id"]
        entry = await self.coord.async_command("log_food", {"food_id":fid,"serving_id":"scoop","quantity":2,
            "meal_type":"breakfast","date":"2026-10-14","request_id":"foodlog1"})
        self.assertEqual(entry["entry"]["calories"],200)
        self.assertEqual(entry["entry"]["amount"],50)
        self.assertEqual(entry["entry"]["nutrients"]["fiber"],4)
        await self.coord.async_command("save_food", {"food":{
            "food_id":fid,"name":"Renamed","base_unit":"g",
            "nutrients_per_100":{"calories":1000,"protein":0,"carbs":0,"fat":0}},"request_id":"foodedit1"})
        corrected = await self.coord.async_command("update_food_entry", {"entry_id":entry["entry_id"],"amount":75,"request_id":"portion1"})
        self.assertEqual(corrected["entry"]["calories"],300)
        self.assertEqual(corrected["entry"]["name"],"Synthetic oats")
        diary = await self.coord.async_command("diary", {"date":"2026-10-14"})
        self.assertEqual(diary["meals"]["breakfast"]["totals"]["calories"],300)
        self.assertEqual(diary["totals"]["fiber"],6)
        self.assertEqual(diary["entries"][0]["entry_id"],entry["entry_id"])


if __name__ == "__main__":
    import unittest
    unittest.main()
