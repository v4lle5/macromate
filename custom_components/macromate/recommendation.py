"""Weight- and Garmin-based nutrition recommendations."""

from __future__ import annotations

import math
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import date
from typing import Any

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
    budget_source: str = "legacy"
    weight_source: str = "legacy"
    source_status: str = "legacy"
    fallback_reasons: tuple[str, ...] = ()
    goal_status: str = "legacy"
    profile_version: int | None = None

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
    raw_target = _finite("calorie target", bmr + active + adjustment, minimum=-10000, maximum=50000)
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


def build_profile_recommendation(
    settings: Mapping[str, Any],
    current_date: date,
    *,
    weight_kg: float | None = None,
    garmin_bmr: float | None = None,
    active_calories: float | None = None,
) -> NutritionRecommendation:
    """Build precise goals from a complete profile (no manual multipliers).

    Optional readings must already be normalized and validated by the caller for
    entity meaning, unit and freshness. None means unusable, NOT zero. A trusted
    current active-energy reading replaces PAL: BMR + active, never PAL + active.
    Invalid optional readings fall back; invalid profile data always raises.
    """
    from .profile import ACTIVITY_LEVELS, MACRO_PLANS, Profile, bounded_number, calculate_bmr

    profile = Profile.from_settings(settings, current_date)
    reasons = []

    def usable(value, key, minimum, maximum):
        if value is not None:
            try:
                return bounded_number(key, value, minimum, maximum)
            except ValueError:
                pass
        if value is not None or settings.get(f"{key}_entity"):
            reasons.append(f"{key}_unavailable")
        return None

    live_weight = usable(weight_kg, "weight", 30, 350)
    live_bmr = usable(garmin_bmr, "bmr", 500, 5000)
    active = usable(active_calories, "active_calories", 0, 20000)
    weight = profile.weight_kg if live_weight is None else live_weight
    bmr = calculate_bmr(profile, current_date, weight) if live_bmr is None else live_bmr
    reached = (profile.goal == "lose" and weight <= profile.target_weight_kg) or (
        profile.goal == "gain" and weight >= profile.target_weight_kg
    )
    # Crossing-stop is MacroMate's policy; the reference proves only equality-stop.
    adjusting = profile.goal != "maintain" and not reached
    adjustment = (
        750 * profile.weekly_pace_kg * (-1 if profile.goal == "lose" else 1) if adjusting else 0
    )
    budget = bmr * ACTIVITY_LEVELS[profile.activity_level] if active is None else bmr + active
    target = (
        max(budget + adjustment, calculate_bmr(profile, current_date, profile.target_weight_kg))
        if adjusting
        else budget
    )
    # The reference's supported goal interval is validation, not medical advice or clamping.
    target = bounded_number("calorie_target", target, 500, 5000)
    carbs_share, fat_share, protein_share = MACRO_PLANS[profile.macro_plan]
    return NutritionRecommendation(
        weight_kg=weight,
        bmr=bmr,
        bmr_source="profile_formula" if live_bmr is None else "garmin",
        active_calories=0 if active is None else active,
        calorie_adjustment=adjustment,
        calorie_target=target,
        protein=target * protein_share / 4.1,
        carbs=target * carbs_share / 4.1,
        fat=target * fat_share / 9.3,
        budget_source="profile_pal" if active is None else "bmr_plus_active",
        weight_source="profile" if live_weight is None else "garmin",
        source_status="fallback" if reasons else ("estimated" if active is None else "wearable"),
        fallback_reasons=tuple(reasons),
        goal_status="maintaining"
        if profile.goal == "maintain"
        else ("target_reached" if reached else "active"),
        profile_version=1,
    )
