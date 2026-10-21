"""Full reference search shares public data, preserves pinned labels and OFF results."""
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

from custom_components.macromate.bls_foods import catalogue
from custom_components.macromate.foods import FoodProduct
from test_coordinator_transactions import CoordinatorTransactions


class BLSFoodCommands(IsolatedAsyncioTestCase):
    asyncSetUp = CoordinatorTransactions.asyncSetUp
    asyncTearDown = CoordinatorTransactions.asyncTearDown

    async def test_favorite_log_reload_and_reference_update_keep_pinned_values(self):
        food_id = "bls4:F503100"
        saved = await self.coord.async_command("favorite", {"food_id": food_id, "enabled": True})
        self.assertEqual(saved["food"]["favorite"]["amount"], 100)
        payload = {"food_id": food_id, "amount": 150, "meal_type": "snack", "request_id": "bls-banana"}
        logged = await self.coord.async_command("log_food", payload)
        self.assertEqual(logged["entry"]["calories"], 118.5)
        self.assertEqual(logged["entry"]["food_snapshot"]["source"], "bls")
        await self.coord.async_load()
        self.assertEqual(await self.coord.async_command("log_food", payload), logged)
        self.assertEqual(len(self.coord.foods), 1)
        favorites = await self.coord.async_command("search_foods", {"query": "banana", "filter": "favorites"})
        self.assertEqual([row["food_id"] for row in favorites["foods"]], [food_id])
        with patch.dict(catalogue()[0][food_id]["nutrients_per_100"], {"calories": 999}):
            updated = await self.coord.async_command("update_food_entry", {"entry_id": logged["entry_id"], "amount": 50})
            self.assertEqual(updated["entry"]["calories"], 39.5)
            self.assertEqual((await self.coord.async_command("food", {"food_id": food_id}))["food"]["nutrients_per_100"]["calories"], 79)
        recent = await self.coord.async_command("search_foods", {"query": "banana", "filter": "recent"})
        self.assertEqual(recent["foods"][0]["food_id"], food_id)

    async def test_failed_log_is_atomic_and_reference_cannot_be_edited(self):
        payload = {"food_id": "bls4:F503100", "amount": 100, "meal_type": "snack", "request_id": "atomic-bls"}
        before = self.coord._state()
        self.store.fail = True
        with self.assertRaises(OSError):
            await self.coord.async_command("log_food", payload)
        self.assertEqual(self.coord._state(), before)
        self.store.fail = False
        await self.coord.async_command("log_food", payload)
        with self.assertRaises(ValueError):
            await self.coord.async_command("save_food", {"food": {"food_id": payload["food_id"], "name": "Changed", "base_unit": "g", "nutrients_per_100": {"calories": 1}}})

    async def test_bounded_search_and_online_brand_results_remain_visible(self):
        self.coord.settings["enable_food_database"] = True
        remote = FoodProduct.from_dict({
            "food_id": "off:012345678905", "name": "Branded apple food", "base_unit": "g",
            "nutrients_per_100": {"calories": 60}, "source": "open_food_facts",
        })
        self.coord._provider = AsyncMock()
        self.coord._provider.set_enabled = Mock()
        self.coord._provider.async_search.return_value = [remote]
        result = await self.coord.async_command("search_foods", {"query": "Apfel", "online": True})
        self.assertEqual(len(result["foods"]), 100)
        self.assertTrue(result["has_more"])
        self.assertEqual(result["foods"][0]["food_id"], "bls4:F110100")
        self.assertIn(remote.food_id, [row["food_id"] for row in result["foods"]])
        self.assertEqual(len(result["attributions"]), 2)
        self.assertEqual(set(self.coord.foods), {remote.food_id})
        self.coord.settings["enable_food_database"] = False
        fallback = await self.coord.async_command("search_foods", {"query": "Banane", "online": True})
        self.assertEqual(fallback["foods"][0]["food_id"], "bls4:F503100")
        self.assertEqual(fallback["warnings"], [])
        self.coord._provider.async_search.assert_awaited_with("Banane", submitted=True)
        custom = await self.coord.async_command("save_food", {"food": {"name": "Meine Banane", "base_unit": "g", "nutrients_per_100": {"calories": 90}}})
        combined = await self.coord.async_command("search_foods", {"query": "Banane"})
        self.assertEqual(combined["foods"][0]["food_id"], custom["food"]["food_id"])
