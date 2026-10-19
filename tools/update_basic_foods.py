"""Generate the small offline catalogue from the pinned, public-domain USDA archive.

Download the SR Legacy JSON archive linked by https://fdc.nal.usda.gov/download-datasets/.
Run: python tools/update_basic_foods.py /path/to/archive.zip
Then: python -m ruff format custom_components/macromate/basic_food_data.py
No network requests, API key or database service are used at runtime.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import pprint
from pathlib import Path
from zipfile import ZipFile

ARCHIVE_URL = (
    "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_json_2018-04.zip"
)
ARCHIVE_SHA256 = "0fe8ae486a2c8eb42cb96413f058deb51863a46c8fb8eeb4b1fb45006dd338ef"

# FDC ID, German display name and extra German/English search terms.
SELECTION = (
    (173944, "Banane, roh (ohne Schale)", "banana bananas bananen"),
    (171688, "Apfel, roh (mit Schale)", "apple apples äpfel aepfel"),
    (169118, "Birne, roh", "pear pears birnen"),
    (169097, "Orange, roh", "oranges orangen apfelsine"),
    (167762, "Erdbeere, roh", "strawberry strawberries erdbeeren"),
    (171711, "Heidelbeere, roh", "blueberry blueberries blaubeere blaubeeren heidelbeeren"),
    (171705, "Avocado, roh", "avocados"),
    (170457, "Tomate, roh", "tomato tomatoes tomaten"),
    (168409, "Gurke, roh (mit Schale)", "cucumber cucumbers gurken"),
    (170393, "Karotte, roh", "carrot carrots möhre möhren karotten"),
    (170379, "Brokkoli, roh", "broccoli"),
    (168462, "Spinat, roh", "spinach"),
    (170000, "Zwiebel, roh", "onion onions zwiebeln"),
    (170440, "Kartoffel, gekocht (ohne Schale, ohne Salz)", "potato potatoes kartoffeln"),
    (168878, "Reis, weiß, Langkorn, gekocht (angereichert)", "rice cooked"),
    (169756, "Reis, weiß, Langkorn, trocken", "rice raw uncooked ungekocht"),
    (173904, "Haferflocken, trocken (nicht angereichert)", "oats oatmeal hafer"),
    (168928, "Nudeln, gekocht (ohne Salz, nicht angereichert)", "pasta cooked spaghetti"),
    (168927, "Nudeln, trocken (nicht angereichert)", "pasta dry spaghetti ungekocht"),
    (172688, "Weizenvollkornbrot", "whole wheat bread vollkornbrot brot"),
    (171287, "Hühnerei, roh", "egg eggs ei eier"),
    (172217, "Vollmilch, 3,25 % Fett (pro 100 g)", "milk milch"),
    (170886, "Naturjoghurt, fettarm", "yogurt yoghurt joghurt"),
    (171477, "Hähnchenbrust, gegart (ohne Haut)", "chicken breast huhn hähnchen"),
    (175168, "Lachs, Atlantik, Zucht, gegart", "salmon"),
    (170567, "Mandel, natur", "almond almonds mandeln"),
    (170187, "Walnuss, natur", "walnut walnuts walnüsse walnuesse"),
    (171413, "Olivenöl (pro 100 g)", "olive oil olivenoel"),
    (173430, "Butter, ungesalzen", "butter unsalted"),
    (172421, "Linsen, gekocht (ohne Salz)", "lentil lentils"),
    (173757, "Kichererbsen, gekocht (ohne Salz)", "chickpea chickpeas"),
    (172475, "Tofu, fest (mit Calciumsulfat)", "tofu firm"),
)

# Domain name: (USDA nutrient ID, source unit, conversion into the domain unit).
# Water/alcohol in g are deliberately omitted: this domain uses ml for those.
NUTRIENTS = {
    "calories": (1008, "kcal", 1),
    "protein": (1003, "g", 1),
    "carbs": (1005, "g", 1),
    "fat": (1004, "g", 1),
    "fiber": (1079, "g", 1),
    "sugar": (2000, "g", 1),
    "saturated_fat": (1258, "g", 1),
    "monounsaturated_fat": (1292, "g", 1),
    "polyunsaturated_fat": (1293, "g", 1),
    "trans_fat": (1257, "g", 1),
    "cholesterol": (1253, "mg", 1),
    "sodium": (1093, "mg", 1),
    "vitamin_a": (1106, "ug", 1),
    "vitamin_b1": (1165, "mg", 1),
    "vitamin_b2": (1166, "mg", 1),
    "vitamin_b3": (1167, "mg", 1),
    "vitamin_b5": (1170, "mg", 1),
    "vitamin_b6": (1175, "mg", 1),
    "vitamin_b11": (1177, "ug", 1),
    "vitamin_b12": (1178, "ug", 1),
    "vitamin_c": (1162, "mg", 1),
    "vitamin_d": (1114, "ug", 1),
    "vitamin_e": (1109, "mg", 1),
    "vitamin_k": (1185, "ug", 1),
    "calcium": (1087, "mg", 1),
    "copper": (1098, "mg", 1),
    "fluoride": (1099, "ug", 0.001),
    "iron": (1089, "mg", 1),
    "magnesium": (1090, "mg", 1),
    "manganese": (1101, "mg", 1),
    "phosphorus": (1091, "mg", 1),
    "potassium": (1092, "mg", 1),
    "selenium": (1103, "ug", 1),
    "zinc": (1095, "mg", 1),
    "choline": (1180, "mg", 1),
}


def nutrients(row):
    """Map only published numbers with matching units; never fill missing values."""
    original = {entry["nutrient"]["id"]: entry for entry in row["foodNutrients"]}
    result = {}
    for name, (identifier, unit, factor) in NUTRIENTS.items():
        entry = original.get(identifier)
        if entry is None or "amount" not in entry:
            continue
        actual_unit = entry["nutrient"]["unitName"].lower().replace("µ", "u").replace("μ", "u")
        value = entry["amount"]
        if actual_unit != unit or isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("unexpected USDA nutrient type or unit")
        if not math.isfinite(value) or value < 0:
            raise ValueError("invalid USDA nutrient")
        result[name] = value * factor
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    if hashlib.sha256(args.archive.read_bytes()).hexdigest() != ARCHIVE_SHA256:
        parser.error("Archive differs from the pinned official SR Legacy April 2018 release")
    with ZipFile(args.archive) as archive:
        rows = json.loads(archive.read("FoodData_Central_sr_legacy_food_json_2018-04.json"))
    rows = {row["fdcId"]: row for row in rows["SRLegacyFoods"]}
    foods = []
    for identifier, name, aliases in SELECTION:
        row = rows[identifier]
        nutrition = nutrients(row)
        if not {"calories", "protein", "carbs", "fat"} <= nutrition.keys():
            raise ValueError("selected food is missing primary nutrients")
        portions = []
        if identifier in (173944, 171688, 171287):
            modifier = "large" if identifier == 171287 else "medium"
            portion = next(p for p in row["foodPortions"] if p["modifier"].startswith(modifier))
            if portion["amount"] != 1:
                raise ValueError("portion is not one piece")
            portions = [
                {
                    "serving_id": "piece",
                    "label": "Stück (USDA-Referenz, essbarer Anteil)",
                    "amount": portion["gramWeight"],
                }
            ]
        foods.append(
            {
                "food_id": f"usda-sr:{identifier}",
                "name": name,
                "base_unit": "g",
                "nutrients_per_100": nutrition,
                "servings": portions,
                "source": "usda",
                "source_url": f"https://fdc.nal.usda.gov/food-details/{identifier}/nutrients",
                "license": "CC0-1.0",
                "aliases": aliases,
                "source_description": row["description"],
            }
        )
    target = Path(__file__).resolve().parents[1] / "custom_components/macromate/basic_food_data.py"
    target.write_text(
        '"""USDA FoodData Central SR Legacy April 2018, public domain (CC0-1.0).\n\n'
        "Generated by tools/update_basic_foods.py; do not edit nutrient values by hand.\n"
        "Values are reference averages per 100 g edible portion, not individual measurements.\n"
        f'Archive: {ARCHIVE_URL}\nSHA-256: {ARCHIVE_SHA256}\n"""\n\n'
        + "FOODS = "
        + pprint.pformat(tuple(foods), width=94, sort_dicts=False)
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(foods)} reference foods to {target}")


if __name__ == "__main__":
    main()
