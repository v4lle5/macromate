"""Immutable food diary metadata; synthetic label values only."""
from datetime import datetime, timezone
import unittest
from custom_components.macromate.models import MealEntry


class FoodDiaryMetadataTests(unittest.TestCase):
    def test_food_entry_roundtrips_immutable_nutrition_snapshot(self):
        data = dict(id="e1", name="Synthetic food", meal_type="lunch", calories=150,
                    protein=5, carbs=20, fat=3, eaten_at=datetime(2026, 10, 14, tzinfo=timezone.utc),
                    food_id="f1", amount=50, base_unit="g", serving_id="slice", quantity=2,
                    nutrients={"calories":150,"protein":5,"carbs":20,"fat":3,"fiber":1},
                    food_snapshot={"food_id":"f1","name":"Synthetic food","base_unit":"g",
                                   "nutrients":{"calories":3,"protein":0.1,"carbs":0.4,"fat":0.06,"fiber":0.02},
                                   "servings":[{"serving_id":"slice","label":"Slice","amount":25}]})
        item = MealEntry(**data)
        data["nutrients"]["fiber"] = 99
        data["food_snapshot"]["name"] = "Changed outside"
        self.assertEqual(item.nutrients["fiber"], 1)
        self.assertEqual(item.food_snapshot["name"], "Synthetic food")
        self.assertEqual(MealEntry.from_dict(item.to_dict()), item)
        public = item.to_service_dict()
        self.assertEqual(public["amount"], 50)
        self.assertEqual(public["entry_id"], "e1")
        public["nutrients"]["fiber"] = 55
        self.assertEqual(item.nutrients["fiber"], 1)

    def test_food_metadata_rejects_invalid_amount_or_unit(self):
        base = dict(id="e", name="Test", meal_type="lunch", calories=1,
                    protein=0, carbs=0, fat=0, eaten_at=datetime.now(timezone.utc),
                    food_id="f", amount=1, base_unit="g", food_snapshot={"food_id":"f"})
        for changes in ({"amount":float("nan")}, {"amount":0}, {"base_unit":"oz"}, {"quantity":-1}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                MealEntry(**{**base, **changes})


if __name__ == "__main__":
    unittest.main()
