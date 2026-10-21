"""Backward-safe, pure settings migration tests."""
from datetime import date
import importlib
import importlib.util
import unittest

LEGACY = {
    "weight_entity": "sensor.exact_existing_weight", "active_calories_entity": "sensor.exact_existing_active",
    "bmr_entity": "sensor.exact_existing_bmr", "kcal_per_kg": 23.5,
    "calorie_adjustment": -150, "protein_per_kg": 1.8, "fat_per_kg": 0.9,
}


class ProfileMigrationTests(unittest.TestCase):
    def test_v1_migration_preserves_legacy_goals_and_explicit_unset_entities(self):
        spec = importlib.util.find_spec("custom_components.macromate.migration")
        self.assertIsNotNone(spec, "a config-entry migration is required")
        module = importlib.import_module("custom_components.macromate.migration")
        options = {"bmr_entity": None, "calorie_adjustment": -300}
        migrated = module.migrate_settings_v1(LEGACY, options)
        self.assertEqual(migrated["weight_entity"], LEGACY["weight_entity"])
        self.assertEqual(migrated["active_calories_entity"], LEGACY["active_calories_entity"])
        self.assertIsNone(migrated["bmr_entity"])
        self.assertEqual(migrated["calorie_adjustment"], -300)
        self.assertEqual(migrated["kcal_per_kg"], 23.5)
        self.assertEqual(migrated["protein_per_kg"], 1.8)
        self.assertEqual(migrated["fat_per_kg"], 0.9)
        self.assertTrue(migrated["enable_food_database"])
        self.assertFalse(migrated["profile_complete"])
        self.assertNotIn("birthday", migrated)
        self.assertNotIn("formula_sex", migrated)
        from custom_components.macromate.profile import is_profile_complete
        self.assertFalse(is_profile_complete(migrated, date(2026, 10, 14)))
        self.assertEqual(LEGACY["bmr_entity"], "sensor.exact_existing_bmr")
        self.assertEqual(module.migrate_settings_v1(migrated, {}), migrated)
        empty = module.migrate_settings_v1({}, {})
        for key in ("weight_entity", "active_calories_entity", "bmr_entity"):
            self.assertIsNone(empty[key])
