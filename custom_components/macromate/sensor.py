"""Nutrition, Garmin and recommendation sensors for MacroMate."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.core import callback
from homeassistant.helpers.event import async_track_time_change


@dataclass(frozen=True, kw_only=True)
class MealSensorDescription(SensorEntityDescription):
    value: Callable
    needs_recommendation: bool = False


SENSORS = (
    MealSensorDescription(
        key="calories",
        translation_key="calories",
        name=None,
        native_unit_of_measurement="kcal",
        icon="mdi:food-apple",
        state_class=SensorStateClass.MEASUREMENT,
        value=lambda s, r: s.calories,
    ),
    MealSensorDescription(
        key="protein",
        translation_key="protein",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:food-drumstick",
        state_class=SensorStateClass.MEASUREMENT,
        value=lambda s, r: s.protein,
    ),
    MealSensorDescription(
        key="carbs",
        translation_key="carbs",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:bread-slice",
        state_class=SensorStateClass.MEASUREMENT,
        value=lambda s, r: s.carbs,
    ),
    MealSensorDescription(
        key="fat",
        translation_key="fat",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:water",
        state_class=SensorStateClass.MEASUREMENT,
        value=lambda s, r: s.fat,
    ),
    MealSensorDescription(
        key="meal_count",
        translation_key="meal_count",
        name=None,
        icon="mdi:counter",
        value=lambda s, r: s.entry_count,
    ),
    MealSensorDescription(
        key="garmin_weight",
        translation_key="garmin_weight",
        name=None,
        native_unit_of_measurement="kg",
        icon="mdi:scale-bathroom",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: r.weight_kg,
    ),
    MealSensorDescription(
        key="recommended_bmr",
        translation_key="recommended_bmr",
        name=None,
        native_unit_of_measurement="kcal",
        icon="mdi:human-male-height",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: r.bmr,
    ),
    MealSensorDescription(
        key="garmin_active_calories",
        translation_key="garmin_active_calories",
        name=None,
        native_unit_of_measurement="kcal",
        icon="mdi:run",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: r.active_calories,
    ),
    MealSensorDescription(
        key="calorie_target",
        translation_key="calorie_target",
        name=None,
        native_unit_of_measurement="kcal",
        icon="mdi:target",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: r.calorie_target,
    ),
    MealSensorDescription(
        key="protein_target",
        translation_key="protein_target",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:target",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: r.protein,
    ),
    MealSensorDescription(
        key="carbs_target",
        translation_key="carbs_target",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:target",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: r.carbs,
    ),
    MealSensorDescription(
        key="fat_target",
        translation_key="fat_target",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:target",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: r.fat,
    ),
    MealSensorDescription(
        key="remaining_calories",
        translation_key="remaining_calories",
        name=None,
        native_unit_of_measurement="kcal",
        icon="mdi:gauge",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: r.balance(s.calories),
    ),
    MealSensorDescription(
        key="remaining_protein",
        translation_key="remaining_protein",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:gauge",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: round(r.protein - s.protein, 1),
    ),
    MealSensorDescription(
        key="remaining_carbs",
        translation_key="remaining_carbs",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:gauge",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: round(r.carbs - s.carbs, 1),
    ),
    MealSensorDescription(
        key="remaining_fat",
        translation_key="remaining_fat",
        name=None,
        native_unit_of_measurement="g",
        icon="mdi:gauge",
        state_class=SensorStateClass.MEASUREMENT,
        needs_recommendation=True,
        value=lambda s, r: round(r.fat - s.fat, 1),
    ),
)


async def async_setup_entry(hass, entry, async_add_entities) -> None:
    async_add_entities(
        MealSensor(entry.runtime_data, entry.entry_id, description) for description in SENSORS
    )


class MealSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False
    _unrecorded_attributes = frozenset({"entries"})

    def __init__(self, coordinator, entry_id: str, description: MealSensorDescription) -> None:
        self.coordinator = coordinator
        self.entity_description = description
        self._attr_unique_id = f"{entry_id}_{description.key}"

    @property
    def _summary(self):
        return self.coordinator.summary(self.coordinator.today())

    @property
    def _recommendation(self):
        return self.coordinator.recommendation()

    @property
    def _nutrient(self):
        key = self.entity_description.key.removeprefix("remaining_")
        return key if key in ("calories", "protein", "carbs", "fat") else None

    @property
    def available(self) -> bool:
        complete = self._nutrient is None or self._nutrient not in self._summary.nutrition_missing
        recommendation = self._recommendation
        if self.entity_description.key == "garmin_weight":
            return recommendation is not None and recommendation.weight_source in (
                "garmin",
                "legacy",
            )
        if self.entity_description.key == "garmin_active_calories":
            return recommendation is not None and recommendation.budget_source in (
                "bmr_plus_active",
                "legacy",
            )
        return complete and (
            not self.entity_description.needs_recommendation or recommendation is not None
        )

    @property
    def native_value(self):
        recommendation = self._recommendation
        if not self.available:
            return None
        return self.entity_description.value(self._summary, recommendation)

    @property
    def extra_state_attributes(self):
        if self.entity_description.key in ("garmin_weight", "garmin_active_calories"):
            recommendation = self._recommendation
            return {
                "source": (
                    recommendation.weight_source
                    if self.entity_description.key == "garmin_weight"
                    else recommendation.budget_source
                )
                if recommendation
                else None,
                "source_status": recommendation.source_status if recommendation else "unavailable",
            }
        if self.entity_description.key == "recommended_bmr" and self._recommendation:
            return {
                "source": self._recommendation.bmr_source,
                "note": (
                    "Garmin-Grundumsatz oder profilbasierte Schätzung; keine "
                    "medizinische Empfehlung."
                ),
            }
        if self.entity_description.key != "calories":
            return (
                {
                    "nutrition_complete": self._nutrient not in self._summary.nutrition_missing,
                    "known_total": getattr(self._summary, self._nutrient),
                }
                if self._nutrient
                else None
            )
        recommendation = self._recommendation
        return {
            "nutrition_complete": "calories" not in self._summary.nutrition_missing,
            "known_total": self._summary.calories,
            "entry_count": self._summary.entry_count,
            "recommendation_available": recommendation is not None,
            "bmr_source": recommendation.bmr_source if recommendation else None,
        }

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(self.coordinator.async_add_listener(self._handle_update))
        self.async_on_remove(
            async_track_time_change(self.hass, self._handle_midnight, hour=0, minute=0, second=0)
        )

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()

    @callback
    def _handle_midnight(self, now) -> None:
        self.async_write_ha_state()
