"""Pure domain model for MacroMate."""

from __future__ import annotations

import hashlib
import json
import math
from copy import deepcopy
from dataclasses import asdict, dataclass
from datetime import date, datetime
from typing import Any, Iterable
from zoneinfo import ZoneInfo
from .platform_support import identifier, number as validate_number, validate_json

NUTRIENTS = ("calories", "protein", "carbs", "fat")
MEAL_TYPES = ("breakfast", "lunch", "dinner", "snack")


def _non_negative(name: str, value: float) -> float:
    number = float(value)
    if not math.isfinite(number):
        raise ValueError(f"{name} must be finite")
    if number < 0:
        raise ValueError(f"{name} must not be negative")
    return number


@dataclass(frozen=True, slots=True)
class DailyGoals:
    calories: float = 2000
    protein: float = 150
    carbs: float = 250
    fat: float = 70

    def __post_init__(self) -> None:
        for name in NUTRIENTS:
            object.__setattr__(self, name, _non_negative(name, getattr(self, name)))

    def to_dict(self) -> dict[str, float]:
        return asdict(self)


@dataclass(frozen=True, slots=True)
class MealEntry:
    id: str
    name: str
    meal_type: str
    calories: float
    protein: float
    carbs: float
    fat: float
    eaten_at: datetime
    food_id: str | None = None
    amount: float | None = None
    base_unit: str | None = None
    serving_id: str | None = None
    quantity: float | None = None
    nutrients: dict[str, float] | None = None
    food_snapshot: dict[str, Any] | None = None
    recipe_id: str | None = None
    recipe_servings: float | None = None
    recipe_snapshot: dict[str, Any] | None = None

    def __post_init__(self) -> None:
        if not self.id.strip():
            raise ValueError("id is required")
        if not self.name.strip():
            raise ValueError("name is required")
        if self.meal_type not in MEAL_TYPES:
            raise ValueError(f"meal_type must be one of {', '.join(MEAL_TYPES)}")
        if self.eaten_at.tzinfo is None:
            raise ValueError("eaten_at must include a timezone")
        for nutrient in NUTRIENTS:
            object.__setattr__(self, nutrient, _non_negative(nutrient, getattr(self, nutrient)))
        if self.food_id is not None:
            if not isinstance(self.food_id, str) or not self.food_id.strip():
                raise ValueError("food_id is required")
            if self.base_unit not in ("g", "ml") or self.amount is None:
                raise ValueError("food amount and g/ml base_unit are required")
        for field in ("amount", "quantity"):
            value = getattr(self, field)
            if value is not None:
                number = _non_negative(field, value)
                if number == 0 or number > 100000:
                    raise ValueError(f"{field} is outside supported range")
                object.__setattr__(self, field, number)
        if self.nutrients is not None:
            object.__setattr__(self, "nutrients", {
                key: _non_negative(key, value) for key, value in self.nutrients.items()
            })
        if self.food_snapshot is not None:
            object.__setattr__(self, "food_snapshot", deepcopy(self.food_snapshot))
        if any(value is not None for value in (self.recipe_id, self.recipe_servings, self.recipe_snapshot)):
            identifier(self.recipe_id, "recipe_id")
            servings = validate_number(self.recipe_servings, "recipe_servings", maximum=100000)
            if servings is None or servings <= 0 or not isinstance(self.recipe_snapshot, dict):
                raise ValueError("recipe entries require positive servings and a recipe snapshot")
            if self.food_id is not None or self.food_snapshot is not None:
                raise ValueError("an entry cannot be both a recipe and a food")
            if self.nutrients is None or "calories" not in self.nutrients:
                raise ValueError("recipe entries require declared calories")
            snapshot = validate_json(self.recipe_snapshot, max_bytes=2097152)
            if snapshot.get("id") != self.recipe_id:
                raise ValueError("recipe snapshot identity mismatch")
            object.__setattr__(self, "recipe_snapshot", snapshot)

    def to_dict(self) -> dict[str, Any]:
        value = {
            "id": self.id,
            "name": self.name,
            "meal_type": self.meal_type,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "eaten_at": self.eaten_at.isoformat(),
        }
        for key in ("food_id", "amount", "base_unit", "serving_id", "quantity", "nutrients", "food_snapshot", "recipe_id", "recipe_servings", "recipe_snapshot"):
            if (extra := getattr(self, key)) is not None:
                value[key] = deepcopy(extra)
        return value

    def to_service_dict(self) -> dict[str, Any]:
        """Expose the CRUD identifier without changing the storage schema."""
        value = self.to_dict()
        value["entry_id"] = value.pop("id")
        return value

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "MealEntry":
        return cls(
            id=str(value["id"]),
            name=str(value["name"]),
            meal_type=str(value["meal_type"]),
            calories=float(value["calories"]),
            protein=float(value["protein"]),
            carbs=float(value["carbs"]),
            fat=float(value["fat"]),
            eaten_at=datetime.fromisoformat(str(value["eaten_at"])),
            **{key: value[key] for key in ("food_id", "amount", "base_unit", "serving_id", "quantity", "nutrients", "food_snapshot", "recipe_id", "recipe_servings", "recipe_snapshot") if key in value},
        )


@dataclass(frozen=True, slots=True)
class DailySummary:
    date: str
    calories: float
    protein: float
    carbs: float
    fat: float
    entry_count: int
    entries: tuple[MealEntry, ...]
    remaining: dict[str, float]
    nutrition_missing: tuple[str, ...] = ()


class OperationLedger:
    """Bounded, persistable idempotency history, independent of Home Assistant.

    ``replay`` returns None on a miss, an independent result dict on a hit,
    and raises ValueError on request-ID reuse with another operation/payload.
    ``record`` never replaces an accepted result, even on an identical retry.
    ``to_list``/``from_list`` serialize oldest-first records with request_id,
    operation, payload_hash (SHA-256 of sorted compact JSON), and result.
    Nested object key order is immaterial; array order and JSON number spelling
    (e.g. 1 versus 1.0) remain significant. Inputs must be finite JSON objects.

    The default retains the last 1000 newly accepted operations; evicted IDs
    have no retry guarantee. Replay does not extend retention. Callers must
    preserve logical payloads before resolving clock-dependent defaults, and
    own the lock around replay -> staged mutation -> record -> durable save.
    This class performs neither persistence nor atomic meal mutations itself.
    """

    def __init__(self, *, max_entries: int = 1000) -> None:
        if type(max_entries) is not int or max_entries < 1:
            raise ValueError("max_entries must be a positive integer")
        self.max_entries = max_entries
        self._records: dict[str, dict[str, Any]] = {}

    @staticmethod
    def _validate_identifier(value: str, name: str) -> None:
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{name} must be a nonempty string")

    @staticmethod
    def _canonical(value: dict[str, Any]) -> str:
        def validate(item: Any) -> None:
            if isinstance(item, dict):
                for key, child in item.items():
                    if not isinstance(key, str):
                        raise ValueError("JSON object keys must be strings")
                    validate(child)
            elif isinstance(item, list):
                for child in item:
                    validate(child)
            elif item is not None and type(item) not in (str, int, float, bool):
                raise ValueError("value must contain only JSON data")

        if not isinstance(value, dict):
            raise ValueError("value must be a JSON object")
        try:
            validate(value)
            return json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False)
        except (TypeError, RecursionError) as err:
            raise ValueError("value must contain only JSON data") from err

    @classmethod
    def _payload_hash(cls, payload: dict[str, Any]) -> str:
        canonical = cls._canonical(payload)
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def replay(
        self, request_id: str, operation: str, payload: dict[str, Any]
    ) -> dict[str, Any] | None:
        self._validate_identifier(request_id, "request_id")
        self._validate_identifier(operation, "operation")
        payload_hash = self._payload_hash(payload)
        record = self._records.get(request_id)
        if record is None:
            return None
        if record["operation"] != operation:
            raise ValueError("request_id reused with a different operation")
        if record["payload_hash"] != payload_hash:
            raise ValueError("request_id reused with a different payload")
        return deepcopy(record["result"])

    def record(
        self, request_id: str, operation: str, payload: dict[str, Any], result: dict[str, Any]
    ) -> None:
        self._canonical(result)
        if self.replay(request_id, operation, payload) is not None:
            return
        self._records[request_id] = {
            "request_id": request_id,
            "operation": operation,
            "payload_hash": self._payload_hash(payload),
            "result": deepcopy(result),
        }
        self._trim()

    def _trim(self) -> None:
        while len(self._records) > self.max_entries:
            del self._records[next(iter(self._records))]

    def to_list(self) -> list[dict[str, Any]]:
        return deepcopy(list(self._records.values()))

    @classmethod
    def from_list(
        cls, values: list[dict[str, Any]], *, max_entries: int = 1000
    ) -> "OperationLedger":
        ledger = cls(max_entries=max_entries)
        if not isinstance(values, list):
            raise ValueError("operation ledger must be a list")
        for value in values:
            if not isinstance(value, dict) or set(value) != {
                "request_id", "operation", "payload_hash", "result"
            }:
                raise ValueError("invalid operation ledger record")
            cls._validate_identifier(value["request_id"], "request_id")
            cls._validate_identifier(value["operation"], "operation")
            digest = value["payload_hash"]
            if (not isinstance(digest, str) or len(digest) != 64
                    or any(char not in "0123456789abcdef" for char in digest)):
                raise ValueError("invalid payload hash")
            cls._canonical(value["result"])
            if value["request_id"] in ledger._records:
                raise ValueError("duplicate request_id in operation ledger")
            ledger._records[value["request_id"]] = deepcopy(value)
        ledger._trim()
        return ledger


class MealLog:
    def __init__(self, entries: Iterable[MealEntry] = ()) -> None:
        items = list(entries)
        if len({item.id for item in items}) != len(items):
            raise ValueError("meal entry ids must be unique")
        self._entries = items

    @property
    def entries(self) -> tuple[MealEntry, ...]:
        return tuple(sorted(self._entries, key=lambda item: item.eaten_at))

    def add(self, item: MealEntry) -> None:
        if any(existing.id == item.id for existing in self._entries):
            raise ValueError(f"duplicate meal entry id: {item.id}")
        self._entries.append(item)

    def remove(self, entry_id: str) -> MealEntry:
        for index, item in enumerate(self._entries):
            if item.id == entry_id:
                return self._entries.pop(index)
        raise KeyError(entry_id)

    def _entries_for_date(self, requested: str | date, timezone: str) -> list[MealEntry]:
        day = date.fromisoformat(requested) if isinstance(requested, str) else requested
        zone = ZoneInfo(timezone)
        return [item for item in self._entries if item.eaten_at.astimezone(zone).date() == day]

    def clear_date(self, requested: str | date, timezone: str) -> int:
        selected = {item.id for item in self._entries_for_date(requested, timezone)}
        self._entries = [item for item in self._entries if item.id not in selected]
        return len(selected)

    def summary_for_date(
        self,
        requested: str | date,
        timezone: str,
        goals: DailyGoals | None = None,
    ) -> DailySummary:
        day = date.fromisoformat(requested) if isinstance(requested, str) else requested
        selected = self._entries_for_date(day, timezone)
        declared = [item.nutrients if item.nutrients is not None else
                    {key:getattr(item,key) for key in NUTRIENTS} for item in selected]
        missing = tuple(key for key in NUTRIENTS if any(key not in values for values in declared))
        totals = {
            nutrient: round(sum(values.get(nutrient,0) for values in declared), 2)
            for nutrient in NUTRIENTS
        }
        remaining = (
            {
                nutrient: round(max(0.0, getattr(goals, nutrient) - totals[nutrient]), 2)
                for nutrient in NUTRIENTS if nutrient not in missing
            }
            if goals
            else {}
        )
        return DailySummary(
            date=day.isoformat(),
            entry_count=len(selected),
            entries=tuple(sorted(selected, key=lambda item: item.eaten_at)),
            remaining=remaining,
            nutrition_missing=missing,
            **totals,
        )
