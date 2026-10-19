"""Fresh installs discover and log public reference foods without online requests."""
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, patch

from test_coordinator_transactions import CoordinatorTransactions


class BasicFoodCommands(IsolatedAsyncioTestCase):
    asyncSetUp = CoordinatorTransactions.asyncSetUp
    asyncTearDown = CoordinatorTransactions.asyncTearDown
    async def test_fresh_search_finds_banana_and_aliases_without_saving_or_online_access(self):
        self.coord._provider = AsyncMock()
        before = self.coord._state()
        for query in ("Banane", "bananen", "BANANA"):
            result = await self.coord.async_command("search_foods", {"query": query})
            self.assertEqual(len(result["foods"]), 1)
            food = result["foods"][0]
            self.assertEqual(food["food_id"], "usda-sr:173944")
            self.assertEqual(food["source"], "usda")
            self.assertFalse(food["is_custom"])
            self.assertAlmostEqual(food["nutrients_per_100"]["calories"], 89)
            self.assertIn("USDA", result["attribution"])
            self.assertEqual(result["warnings"], [])
        self.assertEqual(self.coord._state(), before)
        self.assertEqual(self.coord._provider.mock_calls, [])
        empty = await self.coord.async_command("search_foods", {"query":"Banane", "filter":"custom"})
        self.assertEqual(empty["foods"], [])

    async def test_catalog_food_can_be_favorited_logged_and_replayed_after_reload(self):
        food_id = "usda-sr:173944"
        result = await self.coord.async_command("favorite", {
            "food_id": food_id, "enabled": True, "serving_id": "piece", "quantity": 1,
            "request_id": "banana-favorite",
        })
        self.assertEqual(result["food"]["favorite"]["amount"], 118)
        payload = {"food_id":food_id,"amount":100,"meal_type":"snack","request_id":"banana-log"}
        logged = await self.coord.async_command("log_food", payload)
        self.assertEqual(logged["entry"]["calories"], 89)
        self.assertEqual(logged["entry"]["food_snapshot"]["license"], "CC0-1.0")
        await self.coord.async_load()
        self.assertEqual(await self.coord.async_command("log_food", payload), logged)
        self.assertEqual(len(self.coord.log.entries), 1)
        favorites = await self.coord.async_command("search_foods", {"query":"banana","filter":"favorites"})
        self.assertEqual(favorites["foods"][0]["food_id"], food_id)
        self.assertEqual(len(self.coord.foods), 1, "Only the chosen catalogue food is stored")
        from custom_components.macromate.basic_foods import BASIC_FOODS
        with patch.dict(BASIC_FOODS[food_id]["nutrients_per_100"], {"calories": 999}):
            updated = await self.coord.async_command("update_food_entry", {
                "entry_id": logged["entry_id"], "amount": 50,
            })
            self.assertEqual(updated["entry"]["calories"], 44.5)
            self.assertEqual((await self.coord.async_command("food", {"food_id":food_id}))["food"]["nutrients_per_100"]["calories"], 89)

    async def test_catalog_food_logging_is_atomic_and_cannot_be_edited_as_custom_food(self):
        payload = {"food_id":"usda-sr:173944","amount":100,"meal_type":"snack","request_id":"atomic-banana"}
        before = self.coord._state()
        self.store.fail = True
        with self.assertRaises(OSError):
            await self.coord.async_command("log_food", payload)
        self.assertEqual(self.coord._state(), before)
        self.store.fail = False
        await self.coord.async_command("log_food", payload)
        with self.assertRaises(ValueError):
            await self.coord.async_command("save_food", {"food": {
                "food_id":payload["food_id"],"name":"Changed reference","base_unit":"g",
                "nutrients_per_100":{"calories":999},
            }})
