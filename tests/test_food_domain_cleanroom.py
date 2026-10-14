"""Independent synthetic label examples; no reference-app data copied."""
from __future__ import annotations

import importlib
import importlib.util
import unittest

MODULE = "custom_components.macromate.foods"


def foods_module():
    assert importlib.util.find_spec(MODULE) is not None, "food domain is not implemented"
    return importlib.import_module(MODULE)


def product(**changes):
    data = {"food_id": "local:drink", "name": "Example drink", "base_unit": "ml",
            "nutrients_per_100": {"calories": 43, "protein": 1.2, "fat": 0}}
    data.update(changes)
    return foods_module().FoodProduct.from_dict(data)


class FoodDomainTests(unittest.TestCase):
    def test_per_100_ml_label_roundtrip_preserves_unknown_vs_zero(self):
        food = product()
        self.assertEqual(food.nutrients, {"calories": .43, "protein": .012, "fat": 0})
        self.assertEqual(food.scaled(250), {"calories": 107.5, "protein": 3, "fat": 0})
        wire = food.to_dict()
        self.assertEqual(wire["base_unit"], "ml")
        self.assertEqual(wire["nutrients_per_100"], {"calories": 43, "protein": 1.2, "fat": 0})
        self.assertIn("carbs", wire["missing_nutrients"])
        self.assertNotIn("fat", wire["missing_nutrients"])
        self.assertEqual(foods_module().FoodProduct.from_dict(wire), food)

    def test_positive_nutrition_does_not_underflow_into_a_fabricated_zero(self):
        with self.assertRaisesRegex(ValueError, "underflow"):
            product(nutrients_per_100={"calories": 5e-324})
        food = foods_module().FoodProduct.from_dict({"food_id": "tiny", "name": "Tiny",
                                                     "base_unit": "g", "nutrients": {"calories": 5e-324}})
        with self.assertRaisesRegex(ValueError, "underflow"):
            food.scaled(.01)

    def test_favorite_is_an_immutable_portion_template_and_metadata_roundtrips(self):
        food = product(producer="Example Co", servings=[{"serving_id": "b", "label": "Bottle", "amount": 300}])
        self.assertTrue(hasattr(food, "with_favorite"), "favorite portion template missing")
        favorite = food.with_favorite(True, serving_id="b", quantity=2)
        self.assertFalse(food.is_favorite)
        self.assertEqual(dict(favorite.favorite), {"amount": 600, "serving_id": "b", "quantity": 2})
        wire = favorite.to_dict()
        self.assertEqual(wire["producer"], "Example Co")
        self.assertEqual(wire["source"], "local")
        self.assertTrue(wire["is_custom"])
        self.assertTrue(wire["is_favorite"])
        self.assertEqual(foods_module().FoodProduct.from_dict(wire), favorite)
        wire["favorite"]["amount"] = 1
        self.assertEqual(favorite.favorite["amount"], 600)
        with self.assertRaises(ValueError):
            foods_module().FoodProduct.from_dict(wire)
        self.assertEqual(favorite.with_favorite(True).favorite, favorite.favorite)
        self.assertEqual(food.with_favorite(True).favorite, {"amount": 100})
        self.assertFalse(favorite.with_favorite(False).is_favorite)
        self.assertEqual(food.with_favorite(True, amount=25).favorite, {"amount": 25})
        with self.assertRaises(ValueError):
            food.with_favorite("true")
        with self.assertRaises(ValueError):
            food.with_favorite(False, amount=25)
        new_data = food.to_dict()
        del new_data["food_id"]
        created = foods_module().FoodProduct.from_dict(new_data)
        self.assertTrue(created.food_id.startswith("local:"))
        self.assertNotEqual(created.food_id, food.food_id)

    def test_barcodes_preserve_gtin_tokens_and_require_ascii_check_digit(self):
        valid = ("96385074", "012345678905", "0012345678905", "00012345678905")
        module = foods_module()
        self.assertTrue(hasattr(module, "validate_barcode"), "GTIN policy missing")
        for barcode in valid:
            self.assertEqual(module.validate_barcode(barcode), barcode)
        food = product(barcodes=list(valid))
        self.assertEqual(food.barcodes, valid)
        self.assertEqual(food.to_dict()["barcodes"], list(valid))
        self.assertEqual(module.FoodProduct.from_dict(food.to_dict()), food)
        for token in (12345678905, " 012345678905", "012345678905 ", "012345678904",
                      "٠١٢٣٤٥٦٧٨٩٠٥", "123456789", "01234567890x"):
            with self.subTest(token=token), self.assertRaises(ValueError):
                module.validate_barcode(token)
            with self.subTest(product_token=token), self.assertRaises(ValueError):
                product(barcodes=[token])
        with self.assertRaises(ValueError):
            product(barcodes=[valid[0], valid[0]])
        with self.assertRaises(ValueError):
            product(barcodes=valid[0])

    def test_product_specific_servings_resolve_unambiguous_positive_portions(self):
        food = product(servings=[{"serving_id": "bottle", "label": "Small bottle", "amount": 330}])
        self.assertEqual(food.portion_amount(serving_id="bottle", quantity=1.5), 495)
        self.assertEqual(food.portion_amount(amount=77), 77)
        self.assertEqual(food.scaled(food.portion_amount(serving_id="bottle", quantity=1))["calories"], 141.9)
        self.assertEqual(foods_module().FoodProduct.from_dict(food.to_dict()), food)
        for selection in ({}, {"amount": 0}, {"amount": -1}, {"amount": True},
                          {"amount": 10, "serving_id": "bottle", "quantity": 1},
                          {"serving_id": "bottle"}, {"quantity": 2},
                          {"serving_id": "cup", "quantity": 1},
                          {"serving_id": "bottle", "quantity": 0},
                          {"serving_id": "bottle", "quantity": 1e308}):
            with self.subTest(selection=selection), self.assertRaises(ValueError):
                food.portion_amount(**selection)
        for serving in ({"serving_id": "x", "label": "Cup", "amount": 0},
                        {"serving_id": "x", "label": "", "amount": 50},
                        {"serving_id": "x", "label": "Cup", "amount": float("nan")}):
            with self.subTest(serving=serving), self.assertRaises(ValueError):
                product(servings=[serving])
        definition = {"serving_id": "x", "label": "Cup", "amount": 50}
        with self.assertRaises(ValueError):
            product(servings=[definition, definition])

    def test_known_nutrients_have_explicit_units_and_label_validation(self):
        units = foods_module().NUTRIENT_UNITS
        self.assertGreaterEqual(len(units), 54)
        for key in ("sugar", "added_sugar", "fiber", "saturated_fat", "trans_fat", "salt"):
            self.assertEqual(units[key], "g")
        for key in ("sodium", "cholesterol", "calcium", "iron", "vitamin_c", "vitamin_b1"):
            self.assertEqual(units[key], "mg")
        for key in ("vitamin_a", "vitamin_d", "vitamin_b12", "iodine", "selenium"):
            self.assertEqual(units[key], "ug")
        self.assertEqual(units["water"], "ml")
        label = {key: 1 for key in units}
        food = product(nutrients_per_100=label)
        self.assertEqual(food.scaled(100), label)
        label["calories"] = 999
        self.assertEqual(food.scaled(100)["calories"], 1)
        with self.assertRaises(TypeError):
            food.nutrients["calories"] = 2
        self.assertEqual(food.to_dict()["nutrient_units"], dict(units))
        self.assertNotIn("protein", product(nutrients_per_100={"protein": None}).nutrients)
        for number in (-1, float("nan"), float("inf"), True, "3", {}, 10**500):
            with self.subTest(number=str(number)), self.assertRaises(ValueError):
                product(nutrients_per_100={"calories": number})
        for changes in ({"base_unit": "oz"}, {"name": " "}, {"name": 1},
                        {"nutrients_per_100": {"mystery": 1}}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                product(**changes)
        for amount in (-1, True, "3", float("inf")):
            with self.subTest(amount=amount), self.assertRaises(ValueError):
                food.scaled(amount)
        self.assertEqual(food.scaled(0), {key: 0 for key in units})
        huge = product(nutrients_per_100={"calories": 1e308})
        with self.assertRaises(ValueError):
            huge.scaled(1e308)
        with self.assertRaises(ValueError):
            product(nutrients={"calories": 1e308}).to_dict()
        with self.assertRaisesRegex(ValueError, "conflict"):
            product(nutrients={"calories": 9}, nutrients_per_100={"calories": 1})
