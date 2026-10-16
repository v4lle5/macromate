"""Pure historical consistency contract (no HA runtime required)."""
from copy import deepcopy
import unittest

from custom_components.macromate.foods import FoodProduct


class HistoryConsistencyTests(unittest.TestCase):
    def setUp(self):
        self.recipe_calls = []
        self.recipe_expected = None

    def recipe_scaler(self, snapshot, servings):
        # Explicit callback fixture: native derivation/rounding is exercised in
        # authenticated HA tests, never reimplemented in this pure test suite.
        self.recipe_calls.append((deepcopy(snapshot), servings))
        if self.recipe_expected is None:
            self.fail('Food/legacy validation must not invoke a recipe scaler')
        return dict(self.recipe_expected)

    def food_row(self):
        food = FoodProduct.from_dict({'food_id': 'local:captured', 'name': 'Captured',
            'base_unit': 'g', 'nutrients_per_100': {'calories': 123, 'protein': 0, 'fat': None}})
        return {'food_id': food.food_id, 'food_snapshot': food.to_dict(), 'amount': 50,
                'base_unit': 'g', 'nutrients': {'calories': 61.5, 'protein': 0},
                'calories': 61.5, 'protein': 0, 'carbs': 0, 'fat': 0}

    def validate(self, row):
        from custom_components.macromate.restore_consistency import validate_history_consistency
        data = {'schema': 3, 'entries': [row]}
        before = deepcopy(data)
        self.assertIsNone(validate_history_consistency(data, recipe_nutrients=self.recipe_scaler))
        self.assertEqual(data, before)

    def test_food_material_forgery_rejected(self):
        row = self.food_row()
        row['calories'] = row['nutrients']['calories'] = 999
        with self.assertRaises(ValueError):
            self.validate(row)

    def test_food_zero_unknown_and_unrounded_portion_remain_exact(self):
        self.validate(self.food_row())

    def test_map_presence_and_primary_compatibility_fields_fail_closed(self):
        original = self.food_row()
        for field, value in [('nutrients', None), ('nutrients', {}),
                             ('nutrients', {'calories': 61.5}),
                             ('nutrients', {'calories': 61.5, 'protein': 0, 'fat': 0}),
                             ('nutrients', {'calories': 61.5, 'protein': 0, 'invented': 0}),
                             ('protein', 1), ('fat', 1), ('calories', False)]:
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                self.validate({**original, field: value})
        for value in (True, False, None, '61.5', float('nan'), float('inf'), -1):
            row = deepcopy(original)
            row['nutrients']['calories'] = value
            with self.subTest(numeric=value), self.assertRaises(ValueError):
                self.validate(row)

    def test_tolerance_accepts_only_serialization_noise_not_display_rounding(self):
        row = self.food_row()
        row['nutrients']['calories'] += 1e-10
        row['calories'] -= 1e-10
        self.validate(row)
        row['nutrients']['calories'] += .00001
        with self.assertRaises(ValueError):
            self.validate(row)

    def recipe_row(self, basis='per_serving'):
        return {'recipe_id': 'recipe:captured', 'recipe_servings': .3333333,
                'recipe_snapshot': {'id': 'recipe:captured', 'servings': 3,
                    'nutrition_basis': basis, 'declared_nutrition':
                    {'calories': 123, 'protein': 0, 'carbohydrates': 6, 'sugar': 2, 'fat': None}},
                'nutrients': {'calories': 41, 'protein': 0, 'carbs': 2, 'sugars': .666667},
                'calories': 41, 'protein': 0, 'carbs': 2, 'fat': 0}

    def test_recipe_uses_injected_scaler_and_canonical_alias_policy(self):
        row = self.recipe_row()
        # A callback fixture, not a second recipe scaling implementation.
        row['calories'] = row['nutrients']['calories'] = 40.999996
        self.recipe_expected = dict(row['nutrients'])
        self.validate(row)
        self.assertEqual(self.recipe_calls, [(row['recipe_snapshot'], row['recipe_servings'])])
        row['recipe_snapshot']['declared_nutrition']['carbs'] = 6
        self.validate(row)
        row['recipe_snapshot']['declared_nutrition']['carbs'] = 7
        with self.assertRaises(ValueError):
            self.validate(row)
        row = self.recipe_row()
        row['calories'] = row['nutrients']['calories'] = 40.999996
        for alias, canonical in [('carbohydrates', 'carbs'), ('sugar', 'sugars')]:
            forged = deepcopy(row)
            forged['nutrients'][alias] = forged['nutrients'][canonical]
            with self.subTest(alias=alias), self.assertRaises(ValueError):
                self.validate(forged)

    def test_recipe_per_recipe_yield_and_unknown_primary_zero(self):
        row = self.recipe_row('per_recipe')
        row['recipe_servings'] = 1.5
        row['nutrients'] = {'calories': 61.5, 'protein': 0, 'carbs': 3, 'sugars': 1}
        row.update(calories=61.5, carbs=3)
        self.recipe_expected = dict(row['nutrients'])
        self.validate(row)
        row['nutrients']['fat'] = 0
        with self.assertRaises(ValueError):
            self.validate(row)  # An unknown cannot become a known zero.

    def test_extended_food_units_and_named_ml_portion(self):
        food = FoodProduct.from_dict({'food_id': 'local:milk', 'name': 'Captured milk',
            'base_unit': 'ml', 'nutrients_per_100': {'calories': 0, 'sodium': 12.3,
                'vitamin_a': 45.6, 'water': 89.1, 'sugar': 0},
            'servings': [{'serving_id': 'cup', 'label': 'Cup', 'amount': 125}]})
        row = {'food_id': food.food_id, 'food_snapshot': food.to_dict(), 'amount': 250,
               'base_unit': 'ml', 'serving_id': 'cup', 'quantity': 2,
               'nutrients': food.scaled(250), 'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
        self.validate(row)
        row['quantity'] = 3
        with self.assertRaises(ValueError):
            self.validate(row)

    def test_missing_map_legacy_quick_entry_is_not_reinterpreted(self):
        self.validate({'calories': 10, 'protein': 2, 'carbs': 0, 'fat': 0})
        self.validate({'calories': 10, 'protein': 2, 'carbs': 0, 'fat': 0, 'nutrients': None})
