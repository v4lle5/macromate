"""Profile-based UI setup for MacroMate; Garmin readings are optional."""
from __future__ import annotations

from datetime import date, datetime
import re
from typing import Any
from zoneinfo import ZoneInfo

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


class _DecimalTextSelector(TextSelector):
    """Keep comma input intact in HA's form; accept older numeric API clients."""

    def __call__(self, data):
        if type(data) in (int, float):
            data = str(data)
        return super().__call__(data)


def _schema(hass, values: dict[str, Any], *, display_saved: bool = False) -> vol.Schema:
    values = dict(values)
    birthday = values.get(CONF_BIRTHDAY)
    if display_saved and isinstance(birthday, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", birthday):
        try:
            values[CONF_BIRTHDAY] = date.fromisoformat(birthday).strftime("%d.%m.%Y")
        except ValueError:
            pass  # Preserve invalid input verbatim for correction.
    fields = {
        CONF_FORMULA_SEX: _select(("female", "male"), "formula_sex"),
        CONF_BIRTHDAY: TextSelector(TextSelectorConfig(type=TextSelectorType.TEXT)),
        CONF_HEIGHT_CM: _number(100, 250, 0.1),
        CONF_WEIGHT_KG: _number(30, 350, 0.1), CONF_TARGET_WEIGHT_KG: _number(30, 350, 0.1),
        CONF_GOAL: _select(("lose", "maintain", "gain"), "goal"),
        CONF_WEEKLY_PACE_KG: _DecimalTextSelector(TextSelectorConfig(type=TextSelectorType.TEXT)),
        CONF_ACTIVITY_LEVEL: _select(ACTIVITY_LEVELS, "activity_level"),
        CONF_MACRO_PLAN: _select(MACRO_PLANS, "macro_plan"),
        CONF_ENABLE_FOOD_DATABASE: bool,
    }
    defaults = {CONF_GOAL: "maintain", CONF_WEEKLY_PACE_KG: 0,
                CONF_ACTIVITY_LEVEL: "low", CONF_MACRO_PLAN: "balanced", CONF_ENABLE_FOOD_DATABASE: False}
    schema = {}
    for key, validator in fields.items():
        default = values.get(key, defaults.get(key, vol.UNDEFINED))
        if key == CONF_WEEKLY_PACE_KG and default is not vol.UNDEFINED:
            default = str(default)
            if hass.config.language == 'de':
                default = default.replace('.', ',')
        if key == CONF_WEIGHT_KG:
            # Optional input, not an optional physiological weight: a usable
            # selected sensor must supply it when this field is left blank.
            description = {'suggested_value': values[key]} if key in values else None
            schema[vol.Optional(key, description=description)] = validator
        else:
            schema[vol.Required(key, default=default)] = validator
    # Suggestions display existing choices without reinserting a cleared source.
    # Clearing a submitted field is persisted as an explicit None by _normalized.
    for key in (CONF_WEIGHT_ENTITY, CONF_BMR_ENTITY, CONF_ACTIVE_CALORIES_ENTITY):
        description = {"suggested_value": values[key]} if values.get(key) else None
        schema[vol.Optional(key, description=description)] = _ENTITY
    return vol.Schema(schema)


def _normalized(user_input: dict[str, Any]) -> dict[str, Any]:
    values = dict(user_input)
    birthday = values.get(CONF_BIRTHDAY)
    if isinstance(birthday, str) and re.fullmatch(r"\d{2}\.\d{2}\.\d{4}", birthday):
        try:
            values[CONF_BIRTHDAY] = datetime.strptime(birthday, "%d.%m.%Y").date().isoformat()
        except ValueError:
            raise ProfileValidationError(CONF_BIRTHDAY) from None
    pace = values.get(CONF_WEEKLY_PACE_KG)
    if isinstance(pace, str):
        if not re.fullmatch(r"\d+(?:[.,]\d+)?", pace.strip()):
            raise ProfileValidationError(CONF_WEEKLY_PACE_KG)
        values[CONF_WEEKLY_PACE_KG] = float(pace.strip().replace(',', '.'))
    return normalize_settings(values, dt_util.now().date())


def _validated(hass, user_input: dict[str, Any]) -> dict[str, Any]:
    from .weight_source import current_weight_kg

    values = dict(user_input)
    entity = values.get(CONF_WEIGHT_ENTITY)
    if entity and (not isinstance(entity, str) or not re.fullmatch(r'sensor\.[a-z0-9_]+', entity)):
        raise ProfileValidationError(CONF_WEIGHT_ENTITY)
    if values.get(CONF_WEIGHT_KG) in (None, '') and entity:
        weight = current_weight_kg(hass.states.get(entity), dt_util.utcnow().astimezone(ZoneInfo(hass.config.time_zone)))
        if weight is None:
            raise ProfileValidationError(CONF_WEIGHT_KG, 'weight_required')
        # A real accepted reading is retained as the explicitly labelled profile
        # fallback; it is not subsequently represented as live sensor data.
        values[CONF_WEIGHT_KG] = weight
    if values.get(CONF_WEIGHT_KG) == '':
        values.pop(CONF_WEIGHT_KG)
    result = _normalized(values)
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
        return self.async_show_form(step_id="init", data_schema=_schema(self.hass, current if user_input is None else user_input, display_saved=user_input is None), errors=errors)
