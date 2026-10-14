"""Storage-backed runtime and Garmin sensor adapter for MacroMate."""

from __future__ import annotations

from collections.abc import Callable
import asyncio
from copy import deepcopy
from dataclasses import asdict
from datetime import date
from typing import Any
from uuid import uuid4

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_change
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
from .models import DailyGoals, DailySummary, MealEntry, MealLog, OperationLedger
from .runtime_api import DiaryCommands
from .recommendation import (
    NutritionRecommendation,
    build_recommendation,
    build_profile_recommendation,
    energy_to_kcal,
    weight_to_kg,
)


class MealTrackerCoordinator(DiaryCommands):
    """Own meal storage and derive recommendations from selected Garmin entities."""

    def __init__(self, hass: HomeAssistant, settings: dict[str, Any]) -> None:
        self.hass = hass
        self.settings = settings
        self.log = MealLog()
        self.ledger = OperationLedger()
        self.foods: dict[str, dict[str, Any]] = {}
        self.favorites: dict[str, dict[str, Any]] = {}
        self.daily_goals: dict[str, dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY, private=True, atomic_writes=True)
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
        self._adopt(data)

    def _adopt(self, data: dict[str, Any]) -> None:
        if data.get("schema", 1) not in (1, 2):
            raise ValueError("unsupported MacroMate data schema; no data overwritten")
        self.log = MealLog(MealEntry.from_dict(item) for item in data.get("entries", []))
        self.ledger = OperationLedger.from_list(data.get("ledger", []))
        self.foods = deepcopy(data.get("foods", {}))
        self.favorites = deepcopy(data.get("favorites", {}))
        self.daily_goals = deepcopy(data.get("daily_goals", {}))

    def _state(self) -> dict[str, Any]:
        return {"schema": 2, "entries": [item.to_dict() for item in self.log.entries],
                "ledger": self.ledger.to_list(), "foods": deepcopy(self.foods),
                "favorites": deepcopy(self.favorites), "daily_goals": deepcopy(self.daily_goals)}

    async def _transact(self, operation: str, payload: dict[str, Any], request_id: str | None,
                        apply: Callable[[dict[str, Any]], dict[str, Any]]) -> dict[str, Any]:
        """Serialize replay, stage, durable atomic save, then publish accepted state."""
        async with self._lock:
            if request_id is not None:
                previous = self.ledger.replay(request_id, operation, payload)
                if previous is not None:
                    return previous
            staged = self._state()
            result = apply(staged)
            if request_id is not None:
                ledger = OperationLedger.from_list(staged["ledger"])
                ledger.record(request_id, operation, payload, result)
                staged["ledger"] = ledger.to_list()
            await self._store.async_save(staged)
            self._adopt(staged)
            self.hass.bus.async_fire(EVENT_UPDATED, {"action": operation, "entry_id": result.get("entry_id")})
            self.async_update_listeners()
            return deepcopy(result)

    @callback
    def async_start(self) -> Callable[[], None]:
        self._closed = False
        async def refresh(event):
            if not self._closed:
                await self.async_record_goal()
        unsubscribes = [async_track_state_change_event(self.hass,self.source_entities,refresh),
                       async_track_time_change(self.hass,refresh,hour=0,minute=0,second=0)]
        def stop():
            self._closed = True
            for unsubscribe in unsubscribes:
                unsubscribe()
            provider = getattr(self,"_provider",None)
            if provider is not None:
                provider.set_enabled(False)
        return stop

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
        from .profile import is_profile_complete
        from zoneinfo import ZoneInfo
        def normalized(entity_id, converter):
            reading = self._number(entity_id)
            try:
                return converter(*reading) if reading is not None else None
            except (TypeError, OverflowError, ValueError):
                return None
        weight = normalized(self.settings.get(CONF_WEIGHT_ENTITY),weight_to_kg)
        active_calories = normalized(self.settings.get(CONF_ACTIVE_CALORIES_ENTITY),energy_to_kcal)
        garmin_bmr = normalized(self.settings.get(CONF_BMR_ENTITY),energy_to_kcal)
        if is_profile_complete(self.settings,self.today()):
            active_state = self.hass.states.get(self.settings.get(CONF_ACTIVE_CALORIES_ENTITY) or "")
            if active_state is not None:
                attrs = active_state.attributes
                dated = attrs.get("measurement_date",attrs.get("date"))
                if (attrs.get("restored") is True
                    or active_state.last_updated.astimezone(ZoneInfo(self.hass.config.time_zone)).date() != self.today()
                    or (dated is not None and str(dated)[:10] != self.today().isoformat())
                    or attrs.get("macromate_energy_role","active") != "active"):
                    active_calories = None
            try:
                return build_profile_recommendation(self.settings,self.today(),weight_kg=weight,
                                                    garmin_bmr=garmin_bmr,active_calories=active_calories)
            except (OverflowError, ValueError):
                return None
        if weight is None or active_calories is None:
            return None
        try:
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
        await self._store.async_save(self._state())
        self.hass.bus.async_fire(EVENT_UPDATED, {"action": action, "entry_id": entry_id})
        self.async_update_listeners()

    async def async_record_goal(self) -> None:
        recommendation = self.recommendation()
        if recommendation is None:
            self.async_update_listeners()
            return
        value = asdict(recommendation)
        key = self.today().isoformat()
        if self.daily_goals.get(key) == value:
            self.async_update_listeners()
            return
        def apply_goal(state):
            state["daily_goals"][key] = value
            return {"date":key}
        await self._transact("goal_snapshot",{},None,apply_goal)

    async def async_add(self, item: MealEntry) -> None:
        def apply(state):
            log = MealLog(MealEntry.from_dict(row) for row in state["entries"])
            log.add(item)
            state["entries"] = [row.to_dict() for row in log.entries]
            return {"entry": item.to_dict(), "entry_id": item.id}
        await self._transact("added", item.to_dict(), None, apply)

    async def async_create(self, **values) -> MealEntry:
        """Create quick nutrition: only supplied primary values are declared.

        Keep legacy numeric storage fields, using zero placeholders for omitted
        macros; the optional nutrients map, not placeholders, conveys knowledge.
        """
        request_id = values.pop("request_id", None)
        from homeassistant.util import dt as dt_util
        payload = dict(values)
        if payload.get("eaten_at") is not None:
            payload["eaten_at"] = payload["eaten_at"].isoformat()
        def apply(state):
            item = MealEntry(id=uuid4().hex, **{**values, "name": values["name"].strip(),
                                              **{key:values[key] if key == "calories" else values.get(key,0) for key in ("calories", "protein", "carbs", "fat")},
                                              "nutrients":{key:values[key] for key in ("calories", "protein", "carbs", "fat") if key in values},
                                              "eaten_at": values.get("eaten_at") or dt_util.utcnow()})
            state["entries"].append(item.to_dict())
            return {"entry": item.to_dict(), "entry_id": item.id}
        result = await self._transact("create", payload, request_id, apply)
        return MealEntry.from_dict(result["entry"])

    async def async_update(self, entry_id: str, changes: dict[str, Any], request_id: str | None = None) -> MealEntry:
        """Patch quick entries: absent fields retain values; null macros clear.

        Explicit zero stays declared. Legacy records without a nutrients map
        retain all four primary declarations until explicitly cleared. Food
        snapshot nutrition remains editable only through the portion command.
        """
        def apply(state):
            current = next((row for row in state["entries"] if row["id"] == entry_id), None)
            if current is None:
                raise KeyError(entry_id)
            nutrient_changes = {key:value for key,value in changes.items() if key in ("calories", "protein", "carbs", "fat")}
            if current.get("food_id") and any(key in changes for key in ("calories", "protein", "carbs", "fat", "nutrients")):
                raise ValueError("food entry nutrition is a snapshot; edit its portion instead")
            updated = {**current, **changes, "id":entry_id}
            if nutrient_changes:
                declared = dict(current.get("nutrients") if current.get("nutrients") is not None else
                                {key:current[key] for key in ("calories", "protein", "carbs", "fat")})
                for key,value in nutrient_changes.items():
                    if value is None:
                        if key == "calories":
                            raise ValueError("calories cannot be cleared")
                        declared.pop(key,None)
                        updated[key] = 0
                    else:
                        declared[key] = value
                updated["nutrients"] = declared
            replacement = MealEntry.from_dict(updated)
            state["entries"] = [replacement.to_dict() if row["id"] == entry_id else row for row in state["entries"]]
            return {"entry": replacement.to_dict(), "entry_id":entry_id}
        result = await self._transact("update", {"entry_id":entry_id,"changes":changes}, request_id, apply)
        return MealEntry.from_dict(result["entry"])

    async def async_remove(self, entry_id: str, request_id: str | None = None) -> None:
        def apply(state):
            if not any(row["id"] == entry_id for row in state["entries"]):
                raise KeyError(entry_id)
            state["entries"] = [row for row in state["entries"] if row["id"] != entry_id]
            return {"deleted_entry_id":entry_id}
        await self._transact("delete", {"entry_id":entry_id}, request_id, apply)

    async def async_clear_date(self, requested: str, request_id: str | None = None) -> int:
        def apply(state):
            log = MealLog(MealEntry.from_dict(row) for row in state["entries"])
            removed = log.clear_date(requested, self.hass.config.time_zone)
            state["entries"] = [row.to_dict() for row in log.entries]
            return {"removed":removed}
        result = await self._transact("clear_day", {"date":requested}, request_id, apply)
        return result["removed"]

    def summary(self, requested: date) -> DailySummary:
        current = self.recommendation() if requested == self.today() else None
        recommendation = (asdict(current) if current else None) if requested == self.today() else self.daily_goals.get(requested.isoformat())
        goals = DailyGoals(
            calories=recommendation["calorie_target"],
            protein=recommendation["protein"],
            carbs=recommendation["carbs"],
            fat=recommendation["fat"],
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
