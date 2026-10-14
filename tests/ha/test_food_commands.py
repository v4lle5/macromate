"""Food/diary API integration: synthetic labels, actual HA coordinator."""
from test_coordinator_transactions import CoordinatorTransactions


class FoodCommandsTests(CoordinatorTransactions):
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
        with self.assertRaises(PermissionError):
            await self.coord.async_command("barcode",{"barcode":"4006381333931","online":True})
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
