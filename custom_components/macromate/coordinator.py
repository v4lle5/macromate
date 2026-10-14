"""Storage-backed runtime and Garmin sensor adapter for MacroMate."""

from __future__ import annotations

from collections.abc import Callable
from datetime import date
from typing import Any
from uuid import uuid4

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.storage import Store

from .const import (
    CONF_ACTIVE_CALORIES_ENTITY,
    CONF_BMR_ENTITY,
    CONF_CALORIE_ADJUSTMENT,
    CONF_FAT_PER_KG,
    CONF_KCAL_PER_KG,
    CONF_PROTEIN_PER_KG,
    CONF_WEIGHT_ENTITY,
    DEFAULT_CALORIE_ADJUSTMENT,
    DEFAULT_FAT_PER_KG,
    DEFAULT_KCAL_PER_KG,
    DEFAULT_PROTEIN_PER_KG,
    EVENT_UPDATED,
    STORE_KEY,
    STORE_VERSION,
)
from .models import DailyGoals, DailySummary, MealEntry, MealLog
from .recommendation import (
    NutritionRecommendation,
    build_recommendation,
    energy_to_kcal,
    weight_to_kg,
)


class MealTrackerCoordinator:
    """Own meal storage and derive recommendations from selected Garmin entities."""

    def __init__(self, hass: HomeAssistant, settings: dict[str, Any]) -> None:
        self.hass = hass
        self.settings = settings
        self.log = MealLog()
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
        self._listeners: list[Callable[[], None]] = []

    @property
    def source_entities(self) -> list[str]:
        return [
            entity_id
            for entity_id in (
                self.settings[CONF_WEIGHT_ENTITY],
                self.settings[CONF_ACTIVE_CALORIES_ENTITY],
                self.settings.get(CONF_BMR_ENTITY),
            )
            if entity_id
        ]

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self.log = MealLog(MealEntry.from_dict(item) for item in data.get("entries", []))

    @callback
    def async_start(self) -> Callable[[], None]:
        return async_track_state_change_event(
            self.hass, self.source_entities, lambda event: self.async_update_listeners()
        )

    def _number(self, entity_id: str | None) -> tuple[float, str | None] | None:
        if not entity_id or (state := self.hass.states.get(entity_id)) is None:
            return None
        if state.state in ("unknown", "unavailable", "none", ""):
            return None
        try:
            return float(state.state), state.attributes.get("unit_of_measurement")
        except (TypeError, ValueError):
            return None

    def recommendation(self) -> NutritionRecommendation | None:
        weight_value = self._number(self.settings[CONF_WEIGHT_ENTITY])
        active_value = self._number(self.settings[CONF_ACTIVE_CALORIES_ENTITY])
        if weight_value is None or active_value is None:
            return None
        try:
            weight = weight_to_kg(*weight_value)
            active_calories = energy_to_kcal(*active_value)
            bmr_value = self._number(self.settings.get(CONF_BMR_ENTITY))
            garmin_bmr = energy_to_kcal(*bmr_value) if bmr_value and bmr_value[0] > 0 else None
            return build_recommendation(
                weight_kg=weight,
                active_calories=active_calories,
                garmin_bmr=garmin_bmr,
                calorie_adjustment=self.settings.get(CONF_CALORIE_ADJUSTMENT, DEFAULT_CALORIE_ADJUSTMENT),
                kcal_per_kg=self.settings.get(CONF_KCAL_PER_KG, DEFAULT_KCAL_PER_KG),
                protein_per_kg=self.settings.get(CONF_PROTEIN_PER_KG, DEFAULT_PROTEIN_PER_KG),
                fat_per_kg=self.settings.get(CONF_FAT_PER_KG, DEFAULT_FAT_PER_KG),
            )
        except (OverflowError, ValueError):
            return None

    async def _async_commit(self, action: str, entry_id: str | None = None) -> None:
        await self._store.async_save({"entries": [item.to_dict() for item in self.log.entries]})
        self.hass.bus.async_fire(EVENT_UPDATED, {"action": action, "entry_id": entry_id})
        self.async_update_listeners()

    async def async_add(self, item: MealEntry) -> None:
        self.log.add(item)
        await self._async_commit("added", item.id)

    async def async_create(self, **values) -> MealEntry:
        request_id = values.pop("request_id", None)
        if request_id:
            existing = next((item for item in self.log.entries if item.id == request_id), None)
            if existing is not None:
                return existing
        item = MealEntry(
            id=request_id or uuid4().hex,
            name=values.pop("name").strip(),
            **values,
        )
        await self.async_add(item)
        return item

    async def async_update(self, entry_id: str, changes: dict[str, Any]) -> MealEntry:
        current = next((item for item in self.log.entries if item.id == entry_id), None)
        if current is None:
            raise KeyError(entry_id)
        values = current.to_dict()
        values.update({key: value for key, value in changes.items() if value is not None})
        values["id"] = entry_id
        replacement = MealEntry.from_dict(values)
        self.log.remove(entry_id)
        self.log.add(replacement)
        await self._async_commit("updated", entry_id)
        return replacement

    async def async_remove(self, entry_id: str) -> None:
        self.log.remove(entry_id)
        await self._async_commit("deleted", entry_id)

    async def async_clear_date(self, requested: str) -> int:
        removed = self.log.clear_date(requested, self.hass.config.time_zone)
        if removed:
            await self._async_commit("day_cleared")
        return removed

    def summary(self, requested: date) -> DailySummary:
        recommendation = self.recommendation()
        goals = DailyGoals(
            calories=recommendation.calorie_target,
            protein=recommendation.protein,
            carbs=recommendation.carbs,
            fat=recommendation.fat,
        ) if recommendation else None
        return self.log.summary_for_date(requested, self.hass.config.time_zone, goals)

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(listener)

        def remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove

    @callback
    def async_update_listeners(self) -> None:
        for listener in tuple(self._listeners):
            listener()
