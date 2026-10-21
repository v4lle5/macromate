"""Independent formula and policy tests; no reference-app source/data."""
from datetime import date
from dataclasses import replace
import importlib
import importlib.util
import json
import unittest

TODAY = date(2026, 10, 14)
SETTINGS = {
    "profile_version": 1, "formula_sex": "male", "birthday": "1996-10-14",
    "height_cm": 180, "weight_kg": 80, "target_weight_kg": 70,
    "goal": "lose", "weekly_pace_kg": 0.5, "activity_level": "moderate",
    "macro_plan": "moderate_carb",
}


def profile_module():
    spec = importlib.util.find_spec("custom_components.macromate.profile")
    assert spec is not None, "profile domain module is required"
    return importlib.import_module("custom_components.macromate.profile")


class ProfileGoalsTests(unittest.TestCase):
    def test_retired_food_database_preference_cannot_disable_submitted_lookups(self):
        module = profile_module()
        for legacy in ({}, {"enable_food_database": False}, {"enable_food_database": True}):
            with self.subTest(legacy=legacy):
                settings = {**SETTINGS, **legacy}
                result = module.normalize_settings(settings, TODAY)
                self.assertTrue(result["enable_food_database"])
                self.assertEqual(settings, {**SETTINGS, **legacy})

    def test_profile_json_roundtrip_has_no_manual_factors(self):
        module = profile_module()
        profile = module.Profile.from_settings(SETTINGS, TODAY)
        result = json.loads(json.dumps(profile.to_settings()))
        self.assertEqual(result, SETTINGS)
        self.assertEqual(profile.birthday, date(1996, 10, 14))
        self.assertNotIn("kcal_per_kg", result)

    def test_invalid_or_incomplete_profiles_fail_closed(self):
        module = profile_module()
        invalid = {
            "profile_version": [None, 2, True],
            "birthday": ["2010-10-14", "2027-01-01", "1900-01-01", "19961014", "bad"],
            "formula_sex": ["unknown", None], "height_cm": [99, 251, float("inf"), True],
            "weight_kg": [0, 351, float("nan"), "80", 10 ** 400],
            "target_weight_kg": [0, 90], "goal": ["invalid", "gain", "maintain"],
            "weekly_pace_kg": [-0.5, 0, 1.51, float("inf")],
            "activity_level": ["invalid"], "macro_plan": ["invalid"],
        }
        for key, values in invalid.items():
            for value in values:
                with self.subTest(key=key, value=value):
                    settings = {**SETTINGS, key: value}
                    with self.assertRaises(ValueError):
                        module.Profile.from_settings(settings, TODAY)
                    self.assertFalse(module.is_profile_complete(settings, TODAY))
        for key in SETTINGS:
            with self.subTest(missing=key):
                settings = {k: v for k, v in SETTINGS.items() if k != key}
                with self.assertRaises(ValueError):
                    module.Profile.from_settings(settings, TODAY)
                self.assertFalse(module.is_profile_complete(settings, TODAY))
        self.assertTrue(module.is_profile_complete(SETTINGS, TODAY))

    def test_automatic_profile_goal_matches_independent_control(self):
        module = importlib.import_module("custom_components.macromate.recommendation")
        self.assertTrue(hasattr(module, "build_profile_recommendation"))
        result = module.build_profile_recommendation(SETTINGS, TODAY)
        self.assertEqual(result.bmr, 1780)
        self.assertAlmostEqual(result.calorie_target, 2081.4)
        self.assertAlmostEqual(result.protein, 2081.4 * 0.25 / 4.1)
        self.assertAlmostEqual(result.carbs, 2081.4 * 0.45 / 4.1)
        self.assertAlmostEqual(result.fat, 2081.4 * 0.30 / 9.3)
        self.assertEqual(result.calorie_adjustment, -375)
        self.assertEqual(result.bmr_source, "profile_formula")
        self.assertEqual(result.budget_source, "profile_pal")
        self.assertEqual(result.weight_source, "profile")

    def test_current_wearable_budget_replaces_pal_including_zero_activity(self):
        build = importlib.import_module("custom_components.macromate.recommendation").build_profile_recommendation
        for active in (0, 500):
            result = build(SETTINGS, TODAY, weight_kg=82, garmin_bmr=1800, active_calories=active)
            expected = max(1800 + active - 375, 1680)
            self.assertEqual(result.calorie_target, expected)
            self.assertEqual(result.weight_kg, 82)
            self.assertEqual(result.weight_source, "garmin")
            self.assertEqual(result.bmr_source, "garmin")
            self.assertEqual(result.budget_source, "bmr_plus_active")
            self.assertEqual(result.active_calories, active)
            self.assertEqual(result.source_status, "wearable")
        fallback = build(SETTINGS, TODAY, garmin_bmr=1800)
        self.assertAlmostEqual(fallback.calorie_target, 1800 * 1.38 - 375)
        self.assertEqual(fallback.budget_source, "profile_pal")

    def test_unusable_optional_sources_fall_back_with_explicit_status(self):
        build = importlib.import_module("custom_components.macromate.recommendation").build_profile_recommendation
        settings = {**SETTINGS, "weight_entity": "sensor.old_weight", "bmr_entity": "sensor.old_bmr",
                    "active_calories_entity": "sensor.old_active"}
        for invalid in (None, float("nan"), float("inf"), -1, True, "80", 1e308):
            result = build(settings, TODAY, weight_kg=invalid, garmin_bmr=invalid, active_calories=invalid)
            self.assertAlmostEqual(result.calorie_target, 2081.4)
            self.assertEqual(result.source_status, "fallback")
            self.assertEqual(set(result.fallback_reasons), {"weight_unavailable", "bmr_unavailable", "active_calories_unavailable"})

    def test_goal_reached_stops_adjustment_in_both_directions(self):
        build = importlib.import_module("custom_components.macromate.recommendation").build_profile_recommendation
        for goal, target, weights in (("lose", 70, (70, 69)), ("gain", 90, (90, 91))):
            settings = {**SETTINGS, "goal": goal, "target_weight_kg": target}
            for weight in weights:
                result = build(settings, TODAY, weight_kg=weight)
                self.assertEqual(result.calorie_adjustment, 0)
                self.assertAlmostEqual(result.calorie_target, result.bmr * 1.38)
                self.assertEqual(result.goal_status, "target_reached")
        result = build({**SETTINGS, "goal": "maintain", "target_weight_kg": 80, "weekly_pace_kg": 0}, TODAY)
        self.assertEqual(result.goal_status, "maintaining")
        self.assertAlmostEqual(result.calorie_target, 2456.4)

    def test_direct_bmr_api_revalidates_profile_and_reference_date(self):
        module = profile_module()
        profile = module.Profile.from_settings(SETTINGS, TODAY)
        for bad_profile, reference_date in ((replace(profile, formula_sex="unknown"), TODAY),
                                            (profile, date(2010, 10, 14)), (profile, "2026-10-14")):
            with self.subTest(reference_date=reference_date):
                with self.assertRaises(ValueError):
                    module.calculate_bmr(bad_profile, reference_date)

    def test_evidence_month_age_sex_offsets_pal_floor_and_macro_plans(self):
        module = profile_module()
        build = importlib.import_module("custom_components.macromate.recommendation").build_profile_recommendation
        profile = module.Profile.from_settings(SETTINGS, TODAY)
        self.assertAlmostEqual(module.calculate_bmr(profile, date(2026, 11, 13)), 1780)
        self.assertAlmostEqual(module.calculate_bmr(profile, date(2026, 11, 14)), 1780 - 5 / 12)
        female = module.Profile.from_settings({**SETTINGS, "formula_sex": "female"}, TODAY)
        self.assertAlmostEqual(module.calculate_bmr(female, TODAY), 1614)
        for level, pal in (("low", 1.25), ("moderate", 1.38), ("high", 1.52), ("very_high", 1.65)):
            result = build({**SETTINGS, "activity_level": level, "goal": "maintain", "weekly_pace_kg": 0,
                            "target_weight_kg": 80}, TODAY)
            self.assertAlmostEqual(result.calorie_target, 1780 * pal)
        floor = build({**SETTINGS, "weekly_pace_kg": 1.5}, TODAY)
        self.assertEqual(floor.calorie_target, 1680)
        gain = build({**SETTINGS, "goal": "gain", "target_weight_kg": 90}, TODAY)
        self.assertAlmostEqual(gain.calorie_target, 2831.4)
        for plan, shares in (("balanced", (.50, .30, .20)), ("moderate_carb", (.45, .30, .25)),
                             ("low_carb", (.30, .45, .25)), ("high_protein", (.35, .25, .40)),
                             ("low_fat", (.55, .25, .20))):
            result = build({**SETTINGS, "macro_plan": plan}, TODAY)
            self.assertAlmostEqual(result.carbs * 4.1 / result.calorie_target, shares[0])
            self.assertAlmostEqual(result.fat * 9.3 / result.calorie_target, shares[1])
            self.assertAlmostEqual(result.protein * 4.1 / result.calorie_target, shares[2])
            self.assertAlmostEqual(result.carbs * 4.1 + result.protein * 4.1 + result.fat * 9.3, result.calorie_target)
        with self.assertRaises(ValueError):
            build({**SETTINGS, "height_cm": 100, "weight_kg": 35, "target_weight_kg": 30,
                   "birthday": "1910-10-14", "formula_sex": "female"}, TODAY)
        with self.assertRaises(ValueError):
            build(SETTINGS, TODAY, garmin_bmr=5000, active_calories=20000)
        # Reference-derived form range rejects; it does not clamp a >5000-kcal goal.
        with self.assertRaises(ValueError):
            build(SETTINGS, TODAY, garmin_bmr=4800, active_calories=1000)
