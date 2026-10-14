"""Serializable user profile; pure Python, independent of Home Assistant."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
import math
import re
from typing import Any, Mapping

PROFILE_VERSION = 1
ACTIVITY_LEVELS = {"low": 1.25, "moderate": 1.38, "high": 1.52, "very_high": 1.65}
# Independent readable names; triples are carbohydrate / fat / protein energy shares.
MACRO_PLANS = {
    "balanced": (0.50, 0.30, 0.20),
    "moderate_carb": (0.45, 0.30, 0.25),
    "low_carb": (0.30, 0.45, 0.25),
    "high_protein": (0.35, 0.25, 0.40),
    "low_fat": (0.55, 0.25, 0.20),
}


class ProfileValidationError(ValueError):
    """Field-safe errors suitable for translated forms."""

    def __init__(self, field: str, code: str = "invalid_profile") -> None:
        self.field = field
        self.code = code
        super().__init__(f"{field}: {code}")


def bounded_number(name: str, value: Any, minimum: float, maximum: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ProfileValidationError(name)
    try:
        number = float(value)
    except OverflowError:
        raise ProfileValidationError(name) from None
    if not math.isfinite(number) or not minimum <= number <= maximum:
        raise ProfileValidationError(name)
    return number


def _choice(name: str, value: Any, choices) -> str:
    if not isinstance(value, str) or value not in choices:
        raise ProfileValidationError(name)
    return value


def _complete_months(birthday: date, current_date: date) -> int:
    return ((current_date.year - birthday.year) * 12 + current_date.month
            - birthday.month - (current_date.day < birthday.day))


@dataclass(frozen=True, slots=True)
class Profile:
    formula_sex: str
    birthday: date
    height_cm: float
    weight_kg: float
    target_weight_kg: float
    goal: str
    weekly_pace_kg: float
    activity_level: str
    macro_plan: str

    @classmethod
    def from_settings(cls, settings: Mapping[str, Any], current_date: date) -> Profile:
        required = ("profile_version", "formula_sex", "birthday", "height_cm", "weight_kg",
                    "target_weight_kg", "goal", "weekly_pace_kg", "activity_level", "macro_plan")
        for key in required:
            if key not in settings:
                raise ProfileValidationError(key, "profile_required")
        if type(current_date) is not date:
            raise ProfileValidationError("current_date")
        if type(settings["profile_version"]) is not int or settings["profile_version"] != PROFILE_VERSION:
            raise ProfileValidationError("profile_version")
        raw_birthday = settings["birthday"]
        try:
            birthday = date.fromisoformat(raw_birthday)
        except (ValueError, TypeError):
            raise ProfileValidationError("birthday") from None
        if birthday.isoformat() != raw_birthday or birthday > current_date:
            raise ProfileValidationError("birthday")
        # MacroMate policy, not a claimed reference-app restriction or medical advice.
        months = _complete_months(birthday, current_date)
        if not 216 <= months <= 1440:
            raise ProfileValidationError("birthday", "adults_only")
        weight = bounded_number("weight_kg", settings["weight_kg"], 30, 350)
        target = bounded_number("target_weight_kg", settings["target_weight_kg"], 30, 350)
        goal = _choice("goal", settings["goal"], ("lose", "maintain", "gain"))
        pace = bounded_number("weekly_pace_kg", settings["weekly_pace_kg"], 0, 1.5)
        if ((goal == "lose" and target >= weight) or (goal == "gain" and target <= weight)
                or (goal == "maintain" and target != weight)):
            raise ProfileValidationError("target_weight_kg", "goal_mismatch")
        if (goal == "maintain" and pace != 0) or (goal != "maintain" and pace == 0):
            raise ProfileValidationError("weekly_pace_kg", "goal_mismatch")
        return cls(
            formula_sex=_choice("formula_sex", settings["formula_sex"], ("female", "male")),
            birthday=birthday,
            height_cm=bounded_number("height_cm", settings["height_cm"], 100, 250),
            weight_kg=weight, target_weight_kg=target, goal=goal, weekly_pace_kg=pace,
            activity_level=_choice("activity_level", settings["activity_level"], ACTIVITY_LEVELS),
            macro_plan=_choice("macro_plan", settings["macro_plan"], MACRO_PLANS),
        )

    def to_settings(self) -> dict[str, Any]:
        return {
            "profile_version": PROFILE_VERSION, "formula_sex": self.formula_sex,
            "birthday": self.birthday.isoformat(), "height_cm": self.height_cm,
            "weight_kg": self.weight_kg, "target_weight_kg": self.target_weight_kg,
            "goal": self.goal, "weekly_pace_kg": self.weekly_pace_kg,
            "activity_level": self.activity_level, "macro_plan": self.macro_plan,
        }


def is_profile_complete(settings: Mapping[str, Any], current_date: date) -> bool:
    """Validate actual fields; never trust a persisted profile_complete flag."""
    try:
        Profile.from_settings(settings, current_date)
    except ValueError:
        return False
    return True


def normalize_settings(settings: Mapping[str, Any], current_date: date) -> dict[str, Any]:
    """Return a complete replacement settings set; omitted optional sources stay unset."""
    profile = Profile.from_settings({"profile_version": PROFILE_VERSION, **settings}, current_date)
    result = profile.to_settings()
    result["profile_complete"] = True
    consent = settings.get("enable_food_database", False)
    if type(consent) is not bool:
        raise ProfileValidationError("enable_food_database")
    result["enable_food_database"] = consent
    for key in ("weight_entity", "bmr_entity", "active_calories_entity"):
        entity = settings.get(key)
        if entity is None or entity == "":
            result[key] = None
        elif isinstance(entity, str) and re.fullmatch(r"sensor\.[a-z0-9_]+", entity):
            result[key] = entity
        else:
            raise ProfileValidationError(key)
    return result


def calculate_bmr(profile: Profile, current_date: date, weight_kg: float | None = None) -> float:
    """Evidence-derived kg/cm formula; age is complete calendar months / 12."""
    profile = Profile.from_settings(profile.to_settings(), current_date)
    weight = profile.weight_kg if weight_kg is None else bounded_number("weight_kg", weight_kg, 30, 350)
    age = _complete_months(profile.birthday, current_date) / 12
    offset = -161 if profile.formula_sex == "female" else 5
    return bounded_number("bmr", 10 * weight + 6.25 * profile.height_cm - 5 * age + offset, 500, 5000)
