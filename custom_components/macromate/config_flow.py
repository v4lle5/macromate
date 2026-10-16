"""Profile-based UI setup for MacroMate; Garmin readings are optional."""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    EntitySelector, EntitySelectorConfig,
    NumberSelector, NumberSelectorConfig, NumberSelectorMode,
    SelectSelector, SelectSelectorConfig, SelectSelectorMode,
    TextSelector, TextSelectorConfig, TextSelectorType,
)
from homeassistant.util import dt as dt_util

from .const import (
    CONF_ACTIVE_CALORIES_ENTITY, CONF_BMR_ENTITY, CONF_WEIGHT_ENTITY,
    CONF_ENABLE_FOOD_DATABASE, CONF_FORMULA_SEX, CONF_BIRTHDAY,
    CONF_HEIGHT_CM, CONF_WEIGHT_KG, CONF_TARGET_WEIGHT_KG, CONF_GOAL,
    CONF_WEEKLY_PACE_KG, CONF_ACTIVITY_LEVEL, CONF_MACRO_PLAN, CONFIG_VERSION, DOMAIN,
)
from .profile import ACTIVITY_LEVELS, MACRO_PLANS, ProfileValidationError, normalize_settings
from .recommendation import build_profile_recommendation, energy_to_kcal, weight_to_kg

_ENTITY = EntitySelector(EntitySelectorConfig(domain="sensor"))


def _number(minimum, maximum, step):
    return NumberSelector(NumberSelectorConfig(min=minimum, max=maximum, step=step, mode=NumberSelectorMode.BOX))


def _select(options, key):
    return SelectSelector(SelectSelectorConfig(options=list(options), mode=SelectSelectorMode.DROPDOWN, translation_key=key))


def _schema(hass, values: dict[str, Any]) -> vol.Schema:
    fields = {
        CONF_FORMULA_SEX: _select(("female", "male"), "formula_sex"),
        CONF_BIRTHDAY: TextSelector(TextSelectorConfig(type=TextSelectorType.TEXT)),
        CONF_HEIGHT_CM: _number(100, 250, 0.1),
        CONF_WEIGHT_KG: _number(30, 350, 0.1), CONF_TARGET_WEIGHT_KG: _number(30, 350, 0.1),
        CONF_GOAL: _select(("lose", "maintain", "gain"), "goal"),
        CONF_WEEKLY_PACE_KG: _number(0, 1.5, 0.05),
        CONF_ACTIVITY_LEVEL: _select(ACTIVITY_LEVELS, "activity_level"),
        CONF_MACRO_PLAN: _select(MACRO_PLANS, "macro_plan"),
        CONF_ENABLE_FOOD_DATABASE: bool,
    }
    defaults = {CONF_GOAL: "maintain", CONF_WEEKLY_PACE_KG: 0,
                CONF_ACTIVITY_LEVEL: "low", CONF_MACRO_PLAN: "balanced", CONF_ENABLE_FOOD_DATABASE: False}
    schema = {}
    for key, validator in fields.items():
        default = values.get(key, defaults.get(key, vol.UNDEFINED))
        schema[vol.Required(key, default=default)] = validator
    # Suggestions display existing choices without reinserting a cleared source.
    # Clearing a submitted field is persisted as an explicit None by _normalized.
    for key in (CONF_WEIGHT_ENTITY, CONF_BMR_ENTITY, CONF_ACTIVE_CALORIES_ENTITY):
        description = {"suggested_value": values[key]} if values.get(key) else None
        schema[vol.Optional(key, description=description)] = _ENTITY
    return vol.Schema(schema)


def _normalized(user_input: dict[str, Any]) -> dict[str, Any]:
    return normalize_settings(user_input, dt_util.now().date())


def _validated(hass, user_input: dict[str, Any]) -> dict[str, Any]:
    result = _normalized(user_input)
    for key in (CONF_WEIGHT_ENTITY, CONF_BMR_ENTITY, CONF_ACTIVE_CALORIES_ENTITY):
        if (entity := result[key]) is None:
            continue
        state = hass.states.get(entity)
        if state is None:
            raise ProfileValidationError(key, "source_not_found")
        try:
            # Validate the declared unit independently of temporarily unavailable values.
            converter = weight_to_kg if key == CONF_WEIGHT_ENTITY else energy_to_kcal
            converter(1, state.attributes.get("unit_of_measurement"))
        except (ValueError, TypeError, AttributeError):
            raise ProfileValidationError(key, "invalid_source_unit") from None
    try:
        build_profile_recommendation(result, dt_util.now().date())
    except ValueError:
        raise ProfileValidationError("base", "invalid_recommendation") from None
    return result


class MealTrackerConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = CONFIG_VERSION

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        errors = {}
        if user_input is not None:
            try:
                settings = _validated(self.hass, user_input)
            except ProfileValidationError as err:
                errors[err.field] = err.code
            else:
                return self.async_create_entry(title="MacroMate", data=settings)
        return self.async_show_form(step_id="user", data_schema=_schema(self.hass, user_input or {}), errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return MealTrackerOptionsFlow()


class MealTrackerOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        current = dict(self.config_entry.options or self.config_entry.data)
        errors = {}
        if user_input is not None:
            try:
                settings = _validated(self.hass, user_input)
            except ProfileValidationError as err:
                errors[err.field] = err.code
            else:
                return self.async_create_entry(data=settings)
        return self.async_show_form(step_id="init", data_schema=_schema(self.hass, current if user_input is None else user_input), errors=errors)
