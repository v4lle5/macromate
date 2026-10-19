"""Framework-independent food labels. Unknown values are absent, never zero.

Nutrition is canonical per ONE g or ml, not per portion. `calories` is kcal;
macros are g. No macro-derived energy or physical mass/volume conversion.
"""

from __future__ import annotations

import math
from collections.abc import Mapping
from dataclasses import dataclass, replace
from types import MappingProxyType
from typing import Any
from uuid import uuid4

# Each value uses the unit below at every basis (per one, per 100, or total).
# ug means micrograms, not IU. Alcohol/water are ml by this domain policy.
NUTRIENT_UNITS = MappingProxyType(
    {
        "calories": "kcal",
        "protein": "g",
        "carbs": "g",
        "fat": "g",
        "saturated_fat": "g",
        "monounsaturated_fat": "g",
        "polyunsaturated_fat": "g",
        "trans_fat": "g",
        "fiber": "g",
        "sugar": "g",
        "added_sugar": "g",
        "salt": "g",
        "alcohol": "ml",
        "water": "ml",
        "cholesterol": "mg",
        "sodium": "mg",
        "vitamin_a": "ug",
        "vitamin_b1": "mg",
        "vitamin_b2": "mg",
        "vitamin_b3": "mg",
        "vitamin_b5": "mg",
        "vitamin_b6": "mg",
        "vitamin_b7": "ug",
        "vitamin_b11": "ug",
        "vitamin_b12": "ug",
        "vitamin_c": "mg",
        "vitamin_d": "ug",
        "vitamin_e": "mg",
        "vitamin_k": "ug",
        "arsenic": "ug",
        "boron": "mg",
        "biotin": "ug",
        "calcium": "mg",
        "choline": "mg",
        "chloride": "mg",
        "chromium": "mg",
        "cobalt": "ug",
        "copper": "mg",
        "fluoride": "mg",
        "fluorine": "mg",
        "iodine": "ug",
        "iron": "mg",
        "magnesium": "mg",
        "manganese": "mg",
        "molybdenum": "ug",
        "phosphorus": "mg",
        "potassium": "mg",
        "rubidium": "ug",
        "selenium": "ug",
        "silicon": "mg",
        "sulfur": "mg",
        "tin": "mg",
        "vanadium": "ug",
        "zinc": "mg",
    }
)


def _number(name: str, value: Any, *, positive: bool = False) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number")
    try:
        number = float(value)
    except (OverflowError, ValueError):
        raise ValueError(f"{name} must be finite") from None
    if not math.isfinite(number) or number < 0 or (positive and number == 0):
        raise ValueError(f"{name} must be finite and {'positive' if positive else 'nonnegative'}")
    return number


def _scaled_number(name: str, value: float, factor: float) -> float:
    result = _number(name, value * factor)
    if result == 0 and value > 0 and factor > 0:
        raise ValueError(f"{name} underflow")
    return result


def _text(name: str, value: Any, limit: int = 300) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise ValueError(f"{name} must be nonempty text of at most {limit} characters")
    return value


def validate_barcode(value: Any) -> str:
    """Own GTIN8/12/13/14 policy: ASCII and GS1 mod-10; never normalize."""
    if (
        not isinstance(value, str)
        or len(value) not in (8, 12, 13, 14)
        or any(char < "0" or char > "9" for char in value)
    ):
        raise ValueError("barcode must be an ASCII GTIN8, GTIN12, GTIN13 or GTIN14 string")
    total = sum(
        int(char) * (3 if index % 2 == 0 else 1) for index, char in enumerate(reversed(value[:-1]))
    )
    if (total + int(value[-1])) % 10:
        raise ValueError("barcode check digit is invalid")
    return value


def _nutrition(values: Any) -> dict[str, float]:
    if not isinstance(values, Mapping):
        raise ValueError("nutrients must be an object")
    if any(key not in NUTRIENT_UNITS for key in values):
        raise ValueError("unknown nutrient")
    return {key: _number(key, number) for key, number in values.items() if number is not None}


@dataclass(frozen=True, slots=True)
class ServingDefinition:
    """One named serving with its product-specific amount in the base unit."""

    serving_id: str
    label: str
    amount: float

    def __post_init__(self) -> None:
        _text("serving_id", self.serving_id)
        _text("label", self.label)
        object.__setattr__(self, "amount", _number("serving amount", self.amount, positive=True))

    @classmethod
    def from_dict(cls, value: Mapping[str, Any]) -> ServingDefinition:
        if not isinstance(value, Mapping):
            raise ValueError("serving must be an object")
        return cls(value["serving_id"], value["label"], value["amount"])

    def to_dict(self) -> dict[str, Any]:
        return {"serving_id": self.serving_id, "label": self.label, "amount": self.amount}


@dataclass(frozen=True, slots=True)
class FoodProduct:
    food_id: str
    name: str
    base_unit: str
    nutrients: Mapping[str, float]
    servings: tuple[ServingDefinition, ...] = ()
    barcodes: tuple[str, ...] = ()
    producer: str | None = None
    source: str = "local"
    source_url: str | None = None
    license: str | None = None
    favorite: Mapping[str, Any] | None = None

    def __post_init__(self) -> None:
        _text("food_id", self.food_id)
        _text("name", self.name)
        if self.base_unit not in ("g", "ml"):
            raise ValueError("base_unit must be g or ml")
        object.__setattr__(self, "nutrients", MappingProxyType(_nutrition(self.nutrients)))
        if not isinstance(self.servings, (tuple, list)):
            raise ValueError("servings must be a list")
        servings = tuple(
            item if isinstance(item, ServingDefinition) else ServingDefinition.from_dict(item)
            for item in self.servings
        )
        if len({item.serving_id for item in servings}) != len(servings):
            raise ValueError("duplicate serving_id")
        object.__setattr__(self, "servings", servings)
        if not isinstance(self.barcodes, (tuple, list)):
            raise ValueError("barcodes must be a list")
        barcodes = tuple(validate_barcode(item) for item in self.barcodes)
        if len(set(barcodes)) != len(barcodes):
            raise ValueError("duplicate barcode")
        object.__setattr__(self, "barcodes", barcodes)
        if self.producer is not None:
            _text("producer", self.producer)
        if self.source not in ("local", "open_food_facts", "usda"):
            raise ValueError("unknown food source")
        for key in ("source_url", "license"):
            if getattr(self, key) is not None:
                _text(key, getattr(self, key), 1000)
        if self.favorite is not None:
            if not isinstance(self.favorite, Mapping) or set(self.favorite) - {
                "amount",
                "serving_id",
                "quantity",
            }:
                raise ValueError("invalid favorite")
            amount = _number("favorite amount", self.favorite.get("amount"), positive=True)
            template: dict[str, Any] = {"amount": amount}
            if (
                self.favorite.get("serving_id") is not None
                or self.favorite.get("quantity") is not None
            ):
                expected = self.portion_amount(
                    serving_id=self.favorite.get("serving_id"),
                    quantity=self.favorite.get("quantity"),
                )
                if not math.isclose(amount, expected, rel_tol=1e-12):
                    raise ValueError("favorite amount conflicts with serving")
                template.update(
                    serving_id=self.favorite["serving_id"], quantity=self.favorite["quantity"]
                )
            object.__setattr__(self, "favorite", MappingProxyType(template))

    @property
    def is_custom(self) -> bool:
        return self.source == "local"

    @property
    def is_favorite(self) -> bool:
        return self.favorite is not None

    def with_favorite(
        self,
        enabled: bool,
        amount: float | None = None,
        *,
        serving_id: str | None = None,
        quantity: float | None = None,
    ) -> FoodProduct:
        """Return a new product. Without a selection retain template or use 100 g/ml."""
        if not isinstance(enabled, bool):
            raise ValueError("enabled must be boolean")
        selection = amount is not None or serving_id is not None or quantity is not None
        if not enabled:
            if selection:
                raise ValueError("disabled favorite cannot have a portion")
            return replace(self, favorite=None)
        if not selection:
            return replace(self, favorite=self.favorite or {"amount": 100})
        template: dict[str, Any] = {
            "amount": self.portion_amount(amount, serving_id=serving_id, quantity=quantity)
        }
        if serving_id is not None:
            template.update(serving_id=serving_id, quantity=quantity)
        return replace(self, favorite=template)

    @classmethod
    def from_dict(cls, value: Mapping[str, Any]) -> FoodProduct:
        if not isinstance(value, Mapping):
            raise ValueError("food must be an object")
        nutrients = _nutrition(value["nutrients"]) if "nutrients" in value else None
        if "nutrients_per_100" in value:
            per_base = {
                key: _scaled_number(key, number, 0.01)
                for key, number in _nutrition(value["nutrients_per_100"]).items()
            }
            if nutrients is not None and (
                nutrients.keys() != per_base.keys()
                or any(
                    not math.isclose(nutrients[key], per_base[key], rel_tol=1e-12, abs_tol=0)
                    for key in nutrients
                )
            ):
                raise ValueError("conflicting nutrient bases")
            # Preserve the canonical per-unit values after validating both bases.
            # Recomputing them on every reload introduces binary-float drift.
            if nutrients is None:
                nutrients = per_base
        if nutrients is None:
            raise ValueError("nutrients or nutrients_per_100 is required")
        return cls(
            value.get("food_id", "local:" + str(uuid4())),
            value["name"],
            value["base_unit"],
            nutrients,
            servings=value.get("servings", ()),
            barcodes=value.get("barcodes", ()),
            producer=value.get("producer"),
            source=value.get("source", "local"),
            source_url=value.get("source_url"),
            license=value.get("license"),
            favorite=value.get("favorite"),
        )

    def portion_amount(
        self,
        amount: float | None = None,
        *,
        serving_id: str | None = None,
        quantity: float | None = None,
    ) -> float:
        """Require either positive base amount OR serving_id with positive quantity."""
        if amount is not None:
            if serving_id is not None or quantity is not None:
                raise ValueError("choose amount OR serving_id with quantity")
            return _number("amount", amount, positive=True)
        if serving_id is None or quantity is None:
            raise ValueError("amount or serving_id with quantity is required")
        _text("serving_id", serving_id)
        for serving in self.servings:
            if serving.serving_id == serving_id:
                return _number(
                    "portion amount",
                    serving.amount * _number("quantity", quantity, positive=True),
                    positive=True,
                )
        raise ValueError("unknown serving_id")

    def scaled(self, amount: float) -> dict[str, float]:
        factor = _number("amount", amount)
        return {key: _scaled_number(key, number, factor) for key, number in self.nutrients.items()}

    def to_dict(self) -> dict[str, Any]:
        return {
            "food_id": self.food_id,
            "name": self.name,
            "base_unit": self.base_unit,
            "nutrients": dict(self.nutrients),
            "nutrients_per_100": self.scaled(100),
            "servings": [item.to_dict() for item in self.servings],
            "barcodes": list(self.barcodes),
            "producer": self.producer,
            "source": self.source,
            "source_url": self.source_url,
            "license": self.license,
            "is_custom": self.is_custom,
            "is_favorite": self.is_favorite,
            "favorite": dict(self.favorite) if self.favorite is not None else None,
            "nutrient_units": dict(NUTRIENT_UNITS),
            "missing_nutrients": [key for key in NUTRIENT_UNITS if key not in self.nutrients],
        }
