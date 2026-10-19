"""Public catalogue data and extraction preserve source units and unknowns."""
import importlib
import unittest

from tools.update_basic_foods import nutrients


class BasicFoodDataTests(unittest.TestCase):
    def test_catalogue_contains_valid_read_only_foods_with_source_links(self):
        from custom_components.macromate.basic_food_data import FOODS
        FoodProduct = importlib.import_module("custom_components.macromate.foods").FoodProduct
        self.assertGreaterEqual(len(FOODS), 30)
        self.assertEqual(len({row["food_id"] for row in FOODS}), len(FOODS))
        for row in FOODS:
            food = FoodProduct.from_dict(row)
            self.assertFalse(food.is_custom)
            self.assertEqual(food.base_unit, "g")
            self.assertEqual(food.license, "CC0-1.0")
            self.assertTrue(food.source_url.startswith("https://fdc.nal.usda.gov/food-details/"))
            self.assertEqual(FoodProduct.from_dict(food.to_dict()), food)

    def test_usda_units_convert_micrograms_without_inventing_missing_nutrients(self):
        def entry(identifier, unit, amount):
            return {"nutrient":{"id":identifier,"unitName":unit},"amount":amount}
        data = {"foodNutrients":[entry(1008,"kcal",89),entry(1099,"µg",3),entry(1051,"g",74)]}
        self.assertEqual(nutrients(data), {"calories":89,"fluoride":0.003})
        self.assertNotIn("protein", nutrients(data))
        with self.assertRaises(ValueError):
            nutrients({"foodNutrients":[entry(1008,"kJ",372)]})
