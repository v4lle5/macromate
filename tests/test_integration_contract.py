from __future__ import annotations

import ast
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).parents[1]
INTEGRATION = ROOT / "custom_components" / "macromate"


class IntegrationContractTests(unittest.TestCase):
    def test_manifest_is_hacs_ready_and_has_config_flow(self) -> None:
        manifest = json.loads((INTEGRATION / "manifest.json").read_text())
        self.assertEqual(manifest["domain"], "macromate")
        self.assertTrue(manifest["config_flow"])
        self.assertEqual(manifest["iot_class"], "calculated")
        self.assertTrue(manifest["single_config_entry"])
        self.assertRegex(manifest["version"], r"^\d+\.\d+\.\d+$")

    def test_expected_home_assistant_files_exist_and_parse(self) -> None:
        for name in (
            "__init__.py",
            "config_flow.py",
            "const.py",
            "coordinator.py",
            "sensor.py",
            "services.yaml",
            "strings.json",
        ):
            path = INTEGRATION / name
            self.assertTrue(path.is_file(), name)
            if path.suffix == ".py":
                ast.parse(path.read_text(), filename=str(path))

    def test_services_expose_logging_editing_and_deletion(self) -> None:
        text = (INTEGRATION / "services.yaml").read_text()
        for service in (
            "log_meal:",
            "list_meals:",
            "update_meal:",
            "delete_meal:",
            "clear_day:",
        ):
            self.assertIn(service, text)
        for nutrient in ("calories:", "protein:", "carbs:", "fat:"):
            self.assertIn(nutrient, text)

    def test_sensor_module_exposes_daily_macros_and_remaining_calories(self) -> None:
        text = (INTEGRATION / "sensor.py").read_text()
        for key in ("calories", "protein", "carbs", "fat", "remaining_calories"):
            self.assertIn(f'key="{key}"', text)

    def test_garmin_entities_and_weight_recommendation_are_configured(self) -> None:
        config_flow = (INTEGRATION / "config_flow.py").read_text()
        coordinator = (INTEGRATION / "coordinator.py").read_text()
        for key in ("CONF_WEIGHT_ENTITY", "CONF_ACTIVE_CALORIES_ENTITY", "CONF_BMR_ENTITY"):
            self.assertIn(key, config_flow)
            self.assertIn(key, coordinator)
        self.assertIn("build_recommendation", coordinator)

    def test_profile_onboarding_replaces_manual_factor_settings(self) -> None:
        config_flow = (INTEGRATION / "config_flow.py").read_text()
        for factor in ("CONF_KCAL_PER_KG", "CONF_PROTEIN_PER_KG", "CONF_FAT_PER_KG", "CONF_CALORIE_ADJUSTMENT"):
            self.assertNotIn(factor, config_flow)
        required = {"formula_sex", "birthday", "height_cm", "weight_kg", "target_weight_kg", "goal",
                    "weekly_pace_kg", "activity_level", "macro_plan"}
        for filename in (INTEGRATION / "strings.json", INTEGRATION / "translations" / "de.json"):
            strings = json.loads(filename.read_text())
            for section, step in (("config", "user"), ("options", "init")):
                fields = strings[section]["step"][step]["data"]
                self.assertTrue(required.issubset(fields))
                self.assertNotIn("enable_food_database", fields)
                for factor in ("kcal_per_kg", "protein_per_kg", "fat_per_kg", "calorie_adjustment"):
                    self.assertNotIn(factor, fields)
                self.assertIn("adults_only", strings[section]["error"])
                self.assertIn("invalid_recommendation", strings[section]["error"])
            self.assertEqual(set(strings["selector"]["activity_level"]["options"]),
                             {"low", "moderate", "high", "very_high"})
            self.assertEqual(set(strings["selector"]["macro_plan"]["options"]),
                             {"balanced", "moderate_carb", "low_carb", "high_protein", "low_fat"})

    def test_translations_are_valid_json(self) -> None:
        strings = json.loads((INTEGRATION / "strings.json").read_text())
        german = json.loads((INTEGRATION / "translations" / "de.json").read_text())
        self.assertIn("config", strings)
        self.assertIn("services", german)


if __name__ == "__main__":
    unittest.main()
