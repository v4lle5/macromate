"""Weight- and Garmin-based nutrition recommendations."""

from __future__ import annotations

from dataclasses import dataclass
import math

_WEIGHT_FACTORS = {
    "kg": 1.0,
    "kgs": 1.0,
    "kilogram": 1.0,
    "kilograms": 1.0,
    "lb": 0.45359237,
    "lbs": 0.45359237,
    "pound": 0.45359237,
    "pounds": 0.45359237,
    "st": 6.35029318,
}


def _finite(
    name: str,
    value: float,
    *,
    minimum: float | None = None,
    maximum: float | None = None,
) -> float:
    number = float(value)
    if (
        not math.isfinite(number)
        or (minimum is not None and number < minimum)
        or (maximum is not None and number > maximum)
    ):
        raise ValueError(f"{name} is invalid")
    return number


_ENERGY_FACTORS = {
    "kcal": 1.0,
    "kilocalorie": 1.0,
    "kilocalories": 1.0,
    "kj": 1 / 4.184,
}


def energy_to_kcal(value: float, unit: str | None) -> float:
    if unit is None or not unit.strip():
        raise ValueError("energy unit is required")
    normalized = unit.strip().casefold()
    if normalized not in _ENERGY_FACTORS:
        raise ValueError(f"unsupported energy unit: {unit}")
    return _finite("energy", value, minimum=0, maximum=100000) * _ENERGY_FACTORS[normalized]


def weight_to_kg(value: float, unit: str | None) -> float:
    if unit is None or not unit.strip():
        raise ValueError("weight unit is required")
    normalized = unit.strip().casefold()
    if normalized not in _WEIGHT_FACTORS:
        raise ValueError(f"unsupported weight unit: {unit}")
    return round(
        _finite("weight", value, minimum=0.01, maximum=1102) * _WEIGHT_FACTORS[normalized],
        3,
    )


@dataclass(frozen=True, slots=True)
class NutritionRecommendation:
    weight_kg: float
    bmr: float
    bmr_source: str
    active_calories: float
    calorie_adjustment: float
    calorie_target: float
    protein: float
    carbs: float
    fat: float

    def balance(self, consumed_calories: float) -> float:
        return round(self.calorie_target - float(consumed_calories), 1)


def build_recommendation(
    *,
    weight_kg: float,
    active_calories: float,
    garmin_bmr: float | None,
    calorie_adjustment: float,
    kcal_per_kg: float,
    protein_per_kg: float,
    fat_per_kg: float,
) -> NutritionRecommendation:
    """Create today's recommendation.

    Garmin's own BMR wins when available. Otherwise the configurable kcal/kg
    estimate is used. Active Garmin calories are added as they accrue. A negative
    adjustment creates a deficit; a positive adjustment creates a surplus.
    """
    weight = _finite("weight", weight_kg, minimum=0.01, maximum=500)
    active = _finite("active_calories", active_calories, minimum=0, maximum=20000)
    adjustment = _finite("calorie_adjustment", calorie_adjustment, minimum=-10000, maximum=10000)
    per_kg = _finite("kcal_per_kg", kcal_per_kg, minimum=0.01, maximum=100)
    protein_factor = _finite("protein_per_kg", protein_per_kg, minimum=0, maximum=10)
    fat_factor = _finite("fat_per_kg", fat_per_kg, minimum=0, maximum=10)

    if garmin_bmr is not None:
        bmr = _finite("garmin_bmr", garmin_bmr, minimum=1, maximum=10000)
        source = "garmin"
    else:
        bmr = weight * per_kg
        source = "weight_estimate"

    protein = _finite("protein", weight * protein_factor, minimum=0, maximum=5000)
    fat = _finite("fat", weight * fat_factor, minimum=0, maximum=5000)
    minimum_macro_calories = _finite(
        "mandatory macro calories", protein * 4 + fat * 9, minimum=0, maximum=50000
    )
    raw_target = _finite(
        "calorie target", bmr + active + adjustment, minimum=-10000, maximum=50000
    )
    calorie_target = max(0.0, raw_target, minimum_macro_calories)
    carbs = _finite(
        "carbs",
        max(0.0, (calorie_target - minimum_macro_calories) / 4),
        minimum=0,
        maximum=10000,
    )
    return NutritionRecommendation(
        weight_kg=round(weight, 1),
        bmr=round(bmr),
        bmr_source=source,
        active_calories=round(active),
        calorie_adjustment=round(adjustment),
        calorie_target=round(calorie_target),
        protein=round(protein, 1),
        carbs=round(carbs, 1),
        fat=round(fat, 1),
    )
