from __future__ import annotations

import unittest

from custom_components.macromate.recommendation import (
    NutritionRecommendation,
    build_recommendation,
    energy_to_kcal,
    weight_to_kg,
)


class RecommendationTests(unittest.TestCase):
    def test_uses_garmin_bmr_when_available(self) -> None:
        result = build_recommendation(
            weight_kg=80,
            active_calories=450,
            garmin_bmr=1760,
            calorie_adjustment=-300,
            kcal_per_kg=22,
            protein_per_kg=1.6,
            fat_per_kg=0.8,
        )
        self.assertEqual(result.bmr, 1760)
        self.assertEqual(result.bmr_source, "garmin")
        self.assertEqual(result.calorie_target, 1910)

    def test_estimates_bmr_from_garmin_weight_without_bmr_sensor(self) -> None:
        result = build_recommendation(
            weight_kg=82.5,
            active_calories=300,
            garmin_bmr=None,
            calorie_adjustment=0,
            kcal_per_kg=22,
            protein_per_kg=1.6,
            fat_per_kg=0.8,
        )
        self.assertEqual(result.bmr, 1815)
        self.assertEqual(result.bmr_source, "weight_estimate")
        self.assertEqual(result.calorie_target, 2115)

    def test_macros_are_weight_based_and_carbs_fill_remaining_calories(self) -> None:
        result = build_recommendation(
            weight_kg=80,
            active_calories=400,
            garmin_bmr=1800,
            calorie_adjustment=0,
            kcal_per_kg=22,
            protein_per_kg=1.6,
            fat_per_kg=0.8,
        )
        self.assertEqual(result.protein, 128)
        self.assertEqual(result.fat, 64)
        self.assertEqual(result.carbs, 278)

    def test_too_small_calorie_target_is_raised_to_cover_mandatory_macros(self) -> None:
        result = build_recommendation(
            weight_kg=80,
            active_calories=0,
            garmin_bmr=1800,
            calorie_adjustment=-5000,
            kcal_per_kg=22,
            protein_per_kg=1.6,
            fat_per_kg=0.8,
        )
        self.assertEqual(result.calorie_target, 1088)
        self.assertEqual(result.carbs, 0)

    def test_derived_overflow_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "weight"):
            build_recommendation(
                weight_kg=1e308,
                active_calories=0,
                garmin_bmr=None,
                calorie_adjustment=0,
                kcal_per_kg=100,
                protein_per_kg=1.6,
                fat_per_kg=0.8,
            )

    def test_balance_can_be_negative_after_target_is_exceeded(self) -> None:
        recommendation = NutritionRecommendation(
            weight_kg=80,
            bmr=1800,
            bmr_source="garmin",
            active_calories=200,
            calorie_adjustment=-200,
            calorie_target=1800,
            protein=128,
            carbs=200,
            fat=64,
        )
        self.assertEqual(recommendation.balance(1950), -150)

    def test_weight_units_are_normalized(self) -> None:
        self.assertAlmostEqual(weight_to_kg(176.3698, "lb"), 80, places=3)
        self.assertEqual(weight_to_kg(80, "kg"), 80)

    def test_missing_weight_unit_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "unit"):
            weight_to_kg(80, None)

    def test_energy_units_are_normalized_and_missing_unit_rejected(self) -> None:
        self.assertEqual(energy_to_kcal(500, "kcal"), 500)
        self.assertAlmostEqual(energy_to_kcal(4184, "kJ"), 1000)
        with self.assertRaisesRegex(ValueError, "unit"):
            energy_to_kcal(500, None)

    def test_invalid_weight_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "weight"):
            build_recommendation(
                weight_kg=0,
                active_calories=0,
                garmin_bmr=None,
                calorie_adjustment=0,
                kcal_per_kg=22,
                protein_per_kg=1.6,
                fat_per_kg=0.8,
            )


if __name__ == "__main__":
    unittest.main()
