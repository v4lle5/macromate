"""UI setup for MacroMate."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
)

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
    DOMAIN,
)

_ENTITY = EntitySelector(EntitySelectorConfig(domain="sensor"))
_FACTOR = NumberSelector(NumberSelectorConfig(min=0, max=100, step=0.1, mode=NumberSelectorMode.BOX))
_ADJUSTMENT = NumberSelector(NumberSelectorConfig(min=-2000, max=2000, step=25, mode=NumberSelectorMode.BOX))


def _entity_default(hass, preferred: str) -> str | object:
    return preferred if hass.states.get(preferred) is not None else vol.UNDEFINED


def _schema(hass, values: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(
                CONF_WEIGHT_ENTITY,
                default=values.get(CONF_WEIGHT_ENTITY, _entity_default(hass, "sensor.garmin_connect_weight")),
            ): _ENTITY,
            vol.Required(
                CONF_ACTIVE_CALORIES_ENTITY,
                default=values.get(
                    CONF_ACTIVE_CALORIES_ENTITY,
                    _entity_default(hass, "sensor.garmin_connect_active_calories"),
                ),
            ): _ENTITY,
            vol.Optional(
                CONF_BMR_ENTITY,
                default=values.get(
                    CONF_BMR_ENTITY,
                    _entity_default(hass, "sensor.garmin_connect_bmr_calories"),
                ),
            ): _ENTITY,
            vol.Required(CONF_KCAL_PER_KG, default=values.get(CONF_KCAL_PER_KG, DEFAULT_KCAL_PER_KG)): _FACTOR,
            vol.Required(
                CONF_CALORIE_ADJUSTMENT,
                default=values.get(CONF_CALORIE_ADJUSTMENT, DEFAULT_CALORIE_ADJUSTMENT),
            ): _ADJUSTMENT,
            vol.Required(
                CONF_PROTEIN_PER_KG,
                default=values.get(CONF_PROTEIN_PER_KG, DEFAULT_PROTEIN_PER_KG),
            ): _FACTOR,
            vol.Required(CONF_FAT_PER_KG, default=values.get(CONF_FAT_PER_KG, DEFAULT_FAT_PER_KG)): _FACTOR,
        }
    )


def _normalized(user_input: dict[str, Any]) -> dict[str, Any]:
    result = dict(user_input)
    if not result.get(CONF_BMR_ENTITY):
        result[CONF_BMR_ENTITY] = None
    for key in (CONF_KCAL_PER_KG, CONF_CALORIE_ADJUSTMENT, CONF_PROTEIN_PER_KG, CONF_FAT_PER_KG):
        result[key] = float(result[key])
    return result


class MealTrackerConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            return self.async_create_entry(title="MacroMate", data=_normalized(user_input))
        return self.async_show_form(step_id="user", data_schema=_schema(self.hass, {}))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return MealTrackerOptionsFlow()


class MealTrackerOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        current = {**self.config_entry.data, **self.config_entry.options}
        if user_input is not None:
            return self.async_create_entry(data=_normalized(user_input))
        return self.async_show_form(step_id="init", data_schema=_schema(self.hass, current))
