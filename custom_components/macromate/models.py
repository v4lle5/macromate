"""Pure domain model for MacroMate."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date, datetime
import math
from typing import Any, Iterable
from zoneinfo import ZoneInfo

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

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "meal_type": self.meal_type,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "eaten_at": self.eaten_at.isoformat(),
        }

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
        totals = {
            nutrient: round(sum(getattr(item, nutrient) for item in selected), 2)
            for nutrient in NUTRIENTS
        }
        remaining = (
            {
                nutrient: round(max(0.0, getattr(goals, nutrient) - totals[nutrient]), 2)
                for nutrient in NUTRIENTS
            }
            if goals
            else {}
        )
        return DailySummary(
            date=day.isoformat(),
            entry_count=len(selected),
            entries=tuple(sorted(selected, key=lambda item: item.eaten_at)),
            remaining=remaining,
            **totals,
        )
