"""Reject contradictory historical nutrition without consulting live sources.

Call after structural restore validation, on the original (not decoded/coerced)
JSON. Food portions use FoodProduct.scaled's *unrounded* values; recipe portions
use the native recipe policy (multiply, divide by yield, round to six decimals).
Comparisons allow only float serialization noise: relative 1e-12 / absolute 1e-9
in the nutrient's own unit, NOT the diary's rounded display totals. Presence is
exact: unknown is absent, explicit zero is known. Unknown primary compatibility
fields must be numeric zero placeholders, never fabricated declarations.

Pinned MacroMate fbd6b18's log_food always writes a complete nutrients map.
Legacy quick MealEntry/async_add records can lack that map and survive schema
1/2 -> 3 migration unchanged. They have no historical snapshot and remain
untouched here. A snapshot entry cannot shed its map by claiming an old schema;
all four primary numbers alone cannot preserve unknown/extended declarations.
"""
from __future__ import annotations

import math
from collections.abc import Callable
from typing import Any

from .foods import FoodProduct
from .recipes import _NUTRIENT_NAMES

_PRIMARY = ('calories', 'protein', 'carbs', 'fat')
_RECIPE_ALIASES = {'carbohydrates': 'carbs', 'sugar': 'sugars'}
_REL_TOL = 1e-12
_ABS_TOL = 1e-9


def _number(value: Any) -> float:
    if type(value) not in (int, float):
        raise ValueError('historical nutrient must be numeric, not boolean')
    try:
        number = float(value)
    except (OverflowError, ValueError):
        raise ValueError('historical nutrient must be finite') from None
    if not math.isfinite(number) or number < 0:
        raise ValueError('historical nutrient must be finite and nonnegative')
    return number


def _same(actual: Any, expected: float) -> bool:
    return math.isclose(_number(actual), expected, rel_tol=_REL_TOL, abs_tol=_ABS_TOL)


def _validate_recipe_aliases(snapshot: dict) -> None:
    """Reject contradictory aliases before the native scaler can overwrite one.

    Equivalent aliases denote one declaration, never additive nutrition. The
    authoritative scaler determines the persisted canonical spelling and rounding.
    """
    declarations = snapshot['declared_nutrition']
    known: dict[str, float] = {}
    for key, raw in declarations.items():
        if key not in _NUTRIENT_NAMES:
            raise ValueError('unknown historical recipe nutrient')
        if raw is None:
            continue
        canonical = _RECIPE_ALIASES.get(key, key)
        value = _number(raw)
        if canonical in known and known[canonical] != value:
            raise ValueError('conflicting historical recipe nutrient aliases')
        known[canonical] = value


def validate_history_consistency(
    data: dict[str, Any], *,
    recipe_nutrients: Callable[[dict[str, Any], float], dict[str, float]],
) -> None:
    """Validate captured snapshot -> recorded portion -> map and primary fields.

    No source lookup, mutation, normalization, inference or implicit repair.
    Structural validation remains the caller's responsibility. The required
    recipe_nutrients callback MUST be platform_api.recipe_nutrients: injecting it
    avoids importing the HA transport here and prevents a second scaling policy.
    """
    for row in data.get('entries', []):
        food_snapshot = row.get('food_snapshot')
        recipe_snapshot = row.get('recipe_snapshot')
        if food_snapshot is None and recipe_snapshot is None:
            continue  # Includes authentic legacy missing-map quick entries.
        if food_snapshot is not None and recipe_snapshot is not None:
            raise ValueError('historical entry cannot be both food and recipe')
        if food_snapshot is not None:
            food = FoodProduct.from_dict(food_snapshot)
            amount = _number(row['amount'])
            if amount <= 0:
                raise ValueError('historical food requires positive amount')
            if row.get('serving_id') is not None or row.get('quantity') is not None:
                selected = food.portion_amount(serving_id=row.get('serving_id'), quantity=row.get('quantity'))
                if not math.isclose(amount, selected, rel_tol=_REL_TOL, abs_tol=0):
                    raise ValueError('historical serving conflicts with amount')
            expected = food.scaled(amount)
        else:
            if not isinstance(recipe_snapshot, dict):
                raise ValueError('historical recipe snapshot must be an object')
            _validate_recipe_aliases(recipe_snapshot)
            expected = recipe_nutrients(recipe_snapshot, row['recipe_servings'])
        recorded = row.get('nutrients')
        if not isinstance(recorded, dict) or set(recorded) != set(expected):
            raise ValueError('historical nutrient declarations differ from snapshot portion')
        for key, value in expected.items():
            if not _same(recorded[key], value):
                raise ValueError('historical nutrient differs from snapshot portion: ' + key)
        for key in _PRIMARY:
            if key in expected:
                matches = _same(row[key], expected[key])
            else:
                matches = _number(row[key]) == 0
            if not matches:
                raise ValueError('historical primary field differs from snapshot portion: ' + key)
