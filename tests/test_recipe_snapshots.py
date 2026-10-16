"""Recipe diary snapshots remain independent of their editable source record."""
from datetime import datetime, timezone
import unittest
from custom_components.macromate.models import MealEntry, MealLog


class RecipeSnapshotTests(unittest.TestCase):
    def values(self):
        return {"id": "entry-synthetic-recipe", "name": "Synthetic recipe", "meal_type": "lunch", "calories": 150,
                "protein": 0, "carbs": 0, "fat": 0, "eaten_at": datetime(2026, 10, 14, 12, tzinfo=timezone.utc).isoformat(),
                "nutrients": {"calories": 150, "protein": 0}, "recipe_id": "recipe:001", "recipe_servings": 1.5,
                "recipe_snapshot": {"id": "recipe:001", "name": "Synthetic recipe", "servings": 4,
                                    "nutrition_basis": "per_serving", "declared_nutrition": {"calories": 100, "protein": 0},
                                    "ingredients": [{"name": "Synthetic ingredient", "quantity": 2, "unit": "g"}]}}

    def test_incomplete_or_invalid_recipe_snapshot_is_rejected(self):
        original = self.values()
        cases = [dict(original, recipe_servings=value) for value in (0, -1, True, "1", float("nan"))]
        cases += [dict(original, recipe_snapshot=None), dict(original, recipe_id=None),
                  dict(original, recipe_snapshot={**original["recipe_snapshot"], "id": "other-recipe"}),
                  dict(original, food_id="food:001", base_unit="g", amount=1),
                  dict(original, nutrients={"protein": 0}),
                  dict(original, recipe_snapshot={**original["recipe_snapshot"], "bad": float("nan")})]
        for index, value in enumerate(cases):
            with self.subTest(case=index), self.assertRaises(ValueError):
                MealEntry.from_dict(value)

    def test_recipe_snapshot_roundtrip_keeps_ids_and_unknown_nutrients(self):
        original = self.values()
        item = MealEntry.from_dict(original)
        self.assertEqual(item.to_dict(), original)
        original["recipe_snapshot"]["ingredients"][0]["name"] = "Edited source"
        wire = item.to_service_dict()
        self.assertEqual(wire["recipe_snapshot"]["ingredients"][0]["name"], "Synthetic ingredient")
        self.assertEqual(wire["recipe_id"], "recipe:001")
        self.assertEqual(wire["entry_id"], "entry-synthetic-recipe")
        wire["recipe_snapshot"]["name"] = "Edited response"
        self.assertEqual(item.to_dict()["recipe_snapshot"]["name"], "Synthetic recipe")
        summary = MealLog([item]).summary_for_date("2026-10-14", "UTC")
        self.assertNotIn("protein", summary.nutrition_missing)
        self.assertIn("carbs", summary.nutrition_missing)


if __name__ == "__main__":
    unittest.main()
