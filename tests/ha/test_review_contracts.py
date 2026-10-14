"""Confirmed independent-review nutrient contract regressions."""
from test_coordinator_transactions import CoordinatorTransactions


class ReviewContracts(CoordinatorTransactions):
    async def test_direct_create_omissions_match_private_command_declarations(self):
        item = await self.coord.async_create(name="Direct", meal_type="snack", calories=100, protein=0)
        self.assertEqual(item.nutrients, {"calories": 100, "protein": 0})
        await self.coord.async_load()
        self.assertEqual(self.coord.log.entries[0].nutrients, item.nutrients)
        self.assertIn("carbs", self.coord.diary_data()["nutrition_missing"])
        with self.assertRaises((KeyError, ValueError, TypeError)):
            await self.coord.async_create(name="Missing energy", meal_type="snack")

    async def test_legacy_explicit_macros_stay_known_on_sparse_edit_and_copy(self):
        from custom_components.macromate.models import MealEntry
        legacy = MealEntry(**{k: v for k, v in self.values.items() if k != "request_id"}, id="legacy")
        await self.coord.async_add(legacy)
        await self.coord.async_update("legacy", {"name": "Renamed"}, "legacy-rename")
        await self.coord.async_load()
        self.assertNotIn("protein", self.coord.diary_data("2026-10-14")["nutrition_missing"])
        changed = await self.coord.async_update("legacy", {"protein": None}, "legacy-clear")
        self.assertNotIn("protein", changed.nutrients)
        self.assertEqual(changed.nutrients["carbs"], 50)
        copied = await self.coord.async_command("copy_meal", {"entry_id": "legacy", "date": "2026-10-15", "request_id": "legacy-copy"})
        self.assertEqual(copied["entry"]["nutrients"], changed.nutrients)
        with self.assertRaises(ValueError):
            await self.coord.async_update("legacy", {"calories": None})

    async def test_incomplete_intake_and_balances_are_unavailable_with_private_summary_only(self):
        from custom_components.macromate.sensor import MealSensor, SENSORS
        from custom_components.macromate.models import MealEntry
        from custom_components.macromate.recommendation import build_recommendation
        self.coord.recommendation = lambda: build_recommendation(weight_kg=80, active_calories=200, garmin_bmr=None, calorie_adjustment=-300, kcal_per_kg=24, protein_per_kg=1.8, fat_per_kg=0.8)
        day = self.coord.today().isoformat()
        quick = await self.coord.async_command("log_meal", {"name": "Unknown quick", "meal_type": "snack", "calories": 250})
        food = await self.coord.async_command("save_food", {"food": {"name": "Unknown food", "base_unit": "g", "nutrients_per_100": {"calories": 100}}})
        logged = await self.coord.async_command("log_food", {"food_id": food["food"]["food_id"], "amount": 100, "meal_type": "snack"})
        summary = self.coord.summary(self.coord.today())
        self.assertIn("protein", summary.nutrition_missing)
        for key in ("protein", "carbs", "fat", "remaining_protein", "remaining_carbs", "remaining_fat"):
            sensor = MealSensor(self.coord, "stable", next(d for d in SENSORS if d.key == key))
            self.assertFalse(sensor.available, key)
            self.assertIsNone(sensor.native_value, key)
            self.assertFalse(sensor.extra_state_attributes["nutrition_complete"])
            self.assertNotIn("Unknown", str(sensor.extra_state_attributes))
            self.assertEqual(sensor.unique_id, "stable_" + key)
        calorie = MealSensor(self.coord, "stable", SENSORS[0])
        self.assertTrue(calorie.available)
        self.assertEqual(calorie.native_value, 350)
        await self.coord.async_remove(quick["entry_id"])
        await self.coord.async_remove(logged["entry_id"])
        await self.coord.async_command("log_meal", {"name": "Zeros", "meal_type": "snack", "calories": 0, "protein": 0, "carbs": 0, "fat": 0})
        protein = MealSensor(self.coord, "stable", SENSORS[1])
        self.assertTrue(protein.available)
        self.assertEqual(protein.native_value, 0)
        self.assertTrue(protein.extra_state_attributes["nutrition_complete"])

    async def test_food_snapshot_rejects_quick_macro_clearing(self):
        food = await self.coord.async_command("save_food", {"food": {"name": "Energy only", "base_unit": "g", "nutrients_per_100": {"calories": 100}}})
        entry = await self.coord.async_command("log_food", {"food_id": food["food"]["food_id"], "amount": 100, "meal_type": "snack"})
        for changes in ({"protein": None}, {"nutrients": {"calories": 999}}):
            with self.assertRaises(ValueError):
                await self.coord.async_update(entry["entry_id"], changes)
