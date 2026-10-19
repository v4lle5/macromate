"""BLS release integrity, unit boundaries, unknowns and basic-food discovery."""
import gzip
import importlib
import json
import unittest
from pathlib import Path

from tools.update_bls_foods import NUTRIENTS, nutrient_columns, nutrients


class BLSFoodDataTests(unittest.TestCase):
    def test_complete_catalogue_is_valid_and_preserves_roundtrip_values(self):
        module = importlib.import_module("custom_components.macromate.bls_foods")
        FoodProduct = importlib.import_module("custom_components.macromate.foods").FoodProduct
        rows, index = module.catalogue()
        self.assertEqual(len(rows), 7140)
        self.assertEqual(rows.keys(), index.keys())
        for row in rows.values():
            food = FoodProduct.from_dict(row)
            self.assertFalse(food.is_custom)
            self.assertEqual(food.source, "bls")
            self.assertEqual(food.base_unit, "g")
            self.assertEqual(food.license, "CC-BY-4.0")
            self.assertIn("calories", food.nutrients)
            self.assertNotIn("water", food.nutrients)
            self.assertNotIn("alcohol", food.nutrients)
            self.assertEqual(FoodProduct.from_dict(food.to_dict()), food)
        with self.assertRaises(TypeError):
            rows["invented"] = {}

    def test_source_release_and_banana_nutrients_are_retained(self):
        module = importlib.import_module("custom_components.macromate.bls_foods")
        path = Path(module.__file__).with_name("bls_food_data.json.gz")
        data = json.loads(gzip.decompress(path.read_bytes()))
        self.assertEqual(data["workbook_sha256"], "524bbefe25b691f5cb3de7a9f3e27fa2967aebfeabf217d99414ba7806e78c60")
        self.assertEqual(len(data["components"]), 39)
        food = module.catalogue()[0]["bls4:F503100"]
        self.assertEqual(food["name"], "Banane roh")
        per100 = food["nutrients_per_100"]
        self.assertEqual(per100["calories"], 79)
        self.assertEqual(per100["carbs"], 15.89)
        self.assertEqual(per100["vitamin_b6"], .25513)
        self.assertEqual(per100["copper"], .104)
        self.assertEqual(per100["chromium"], .003)
        self.assertEqual(per100["vitamin_a"], 4)  # RAE, not RE=8.
        self.assertNotIn("sulfur", per100)  # Source '-'; never fabricated zero.

    def test_common_foods_aliases_and_preparations_rank_before_compound_dishes(self):
        module = importlib.import_module("custom_components.macromate.bls_foods")
        for queries, expected in (
            (("Banane", "bananen", "BANANA"), "bls4:F503100"),
            (("Apfel", "Äpfel", "Aepfel", "apple"), "bls4:F110100"),
            (("Haferflocken", "hafer flocken", "oat flakes"), "bls4:C133000"),
            (("Brokkoli", "Broccoli"), "bls4:G312100"),
            (("Ei", "Hühnerei"), "bls4:E111100"),
            (("Reis gekocht",), "bls4:X820162"),
        ):
            for query in queries:
                self.assertEqual(module.search(query)[0], expected, query)
        self.assertEqual(module.search("absichtlichkeintrefferxyz"), [])
        self.assertEqual(len(module.search("")), 7140)
        self.assertFalse(module.matches("ei", "weizen reis"))

    def test_extraction_checks_units_and_never_turns_trace_or_limits_into_zero(self):
        header = ["BLS Code", "Lebensmittelbezeichnung", "Food name"] + [
            f"{code} Test [{unit}/100g]" for code, unit, _ in NUTRIENTS.values()
        ]
        columns = nutrient_columns(header)
        values = [None] * len(header)
        for name, value in (("calories", 0), ("copper", 104), ("vitamin_b6", 255.13)):
            values[columns[name][0]] = value
        for name, marker in zip(("protein", "fat", "carbs", "sugar", "sulfur"), ("-", "TR", "<LOD", "<LOQ", "<LOD or <LOQ")):
            values[columns[name][0]] = marker
        self.assertEqual(nutrients(values, columns), {"calories": 0., "vitamin_b6": .25513, "copper": .104})
        for invalid in (True, -1, float("inf"), "unexpected"):
            values[columns["calories"][0]] = invalid
            with self.assertRaises(ValueError):
                nutrients(values, columns)
        header[columns["copper"][0]] = "CU Test [mg/100g]"
        with self.assertRaises(ValueError):
            nutrient_columns(header)
        with self.assertRaises(ValueError):
            nutrient_columns([])
