"""Config-flow runtime checks against real Home Assistant (not AST substitutes)."""
from datetime import datetime
import importlib
import os
import tempfile
import unittest
from unittest.mock import patch
from zoneinfo import ZoneInfo

try:
    import homeassistant  # Installs Probatio's voluptuous compatibility alias.
    from homeassistant.config_entries import ConfigEntries, ConfigEntry
    from homeassistant.core import HomeAssistant
except ImportError:
    HomeAssistant = None

PROFILE_INPUT = {
    "formula_sex": "male", "birthday": "1996-10-14", "height_cm": 180,
    "weight_kg": 80, "target_weight_kg": 70, "goal": "lose", "weekly_pace_kg": 0.5,
    "activity_level": "moderate", "macro_plan": "moderate_carb",
}


@unittest.skipIf(HomeAssistant is None, "Requires isolated HA runtime")
class ProfileFlowRuntimeTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"])
        self.hass = HomeAssistant(self.tmp.name)
        await self.hass.config.async_set_time_zone("Europe/Berlin")
        self.hass.config_entries = ConfigEntries(self.hass, {})
        self.module = importlib.import_module("custom_components.macromate.config_flow")
        clock = patch.object(self.module.dt_util, "now", return_value=datetime(2026, 10, 14, 12, tzinfo=ZoneInfo("Europe/Berlin")))
        clock.start()
        self.addCleanup(clock.stop)

    async def asyncTearDown(self):
        await self.hass.async_stop(force=True)
        self.tmp.cleanup()

    def flow(self):
        flow = self.module.MealTrackerConfigFlow()
        flow.hass = self.hass
        flow.context = {"source": "user"}
        return flow

    def register_entry(self, data, options=None, version=2):
        entry = ConfigEntry(domain="macromate", title="Synthetic profile", version=version, minor_version=1,
                            data=data, options=options or {}, source="user", unique_id=None,
                            discovery_keys={}, subentries_data=[])
        # Register only: this focused harness deliberately does not load coordinator/panel.
        self.hass.config_entries._entries[entry.entry_id] = entry
        return entry

    def options_flow(self, entry):
        flow = self.module.MealTrackerConfigFlow.async_get_options_flow(entry)
        flow.hass = self.hass
        flow.handler = entry.entry_id
        return flow

    async def test_german_birthday_normalizes_and_reopens_without_rewriting_iso_data(self):
        result = await self.flow().async_step_user({**PROFILE_INPUT, 'birthday': '23.07.1992'})
        self.assertEqual(result['type'], 'create_entry')
        self.assertEqual(result['data']['birthday'], '1992-07-23')
        entry = self.register_entry(result['data'])
        form = await self.options_flow(entry).async_step_init()
        field = next(k for k in form['data_schema'].schema if str(k) == 'birthday')
        self.assertEqual(field.default(), '23.07.1992')
        self.assertEqual(entry.data['birthday'], '1992-07-23')

    async def test_decimal_comma_weekly_pace_through_native_schema(self):
        for text in ('0,5', '0.5'):
            for goal, target in (('lose', 70), ('gain', 90)):
                flow = self.flow()
                form = await flow.async_step_user()
                submitted = form['data_schema']({**PROFILE_INPUT, 'weekly_pace_kg': text,
                                                'goal': goal, 'target_weight_kg': target})
                result = await flow.async_step_user(submitted)
                self.assertEqual(result['type'], 'create_entry')
                self.assertEqual(result['data']['weekly_pace_kg'], .5)

    async def test_current_weight_sensor_replaces_required_manual_weight(self):
        self.hass.states.async_set('sensor.synthetic_weight', '80', {'unit_of_measurement': 'kg'})
        values = {**PROFILE_INPUT, 'weight_entity': 'sensor.synthetic_weight'}
        values.pop('weight_kg')
        flow = self.flow()
        form = await flow.async_step_user()
        submitted = form['data_schema'](values)
        result = await flow.async_step_user(submitted)
        self.assertEqual(result['type'], 'create_entry')
        self.assertEqual(result['data']['weight_kg'], 80)
        entry = self.register_entry(result['data'])
        options = self.options_flow(entry)
        form = await options.async_step_init()
        self.hass.states.async_set('sensor.synthetic_weight', '81', {'unit_of_measurement': 'kg'})
        result = await options.async_step_init(form['data_schema'](values))
        self.assertEqual(result['data']['weight_kg'], 81, 'Omission must not reinsert an old mandatory default')
        self.hass.states.async_set('sensor.synthetic_weight', 'unavailable', {'unit_of_measurement': 'kg'})
        result = await options.async_step_init(form['data_schema'](values))
        self.assertEqual(result['errors'], {'weight_kg': 'weight_required'})
        fallback = await options.async_step_init(form['data_schema']({**values, 'weight_kg': 79}))
        self.assertEqual(fallback['data']['weight_kg'], 79)

    async def test_sensor_only_setup_rejects_unusable_stale_restored_and_bad_targets(self):
        values = {k:v for k,v in PROFILE_INPUT.items() if k != 'weight_kg'}
        values['weight_entity'] = 'sensor.synthetic_weight'
        for state, attrs in [('unavailable', {}), ('nan', {}), ('0', {}), ('500', {}),
                             ('80', {'restored': True}), ('80', {'measurement_date': '2000-01-01'}),
                             ('80', {'measurement_date': '2999-01-01'})]:
            with self.subTest(state=state, attrs=attrs):
                self.hass.states.async_set(values['weight_entity'], state, {'unit_of_measurement': 'kg', **attrs})
                result = await self.flow().async_step_user(values)
                self.assertEqual(result['errors'], {'weight_kg': 'weight_required'})
        self.hass.states.async_set(values['weight_entity'], '80', {'unit_of_measurement': 'kg'})
        result = await self.flow().async_step_user({**values, 'target_weight_kg': 90})
        self.assertEqual(result['errors'], {'target_weight_kg': 'goal_mismatch'})

    async def test_sensor_date_uses_ha_timezone_at_local_midnight(self):
        from datetime import timezone
        now = datetime(2026,10,16,22,30,tzinfo=timezone.utc)
        with patch('homeassistant.util.dt.utc_from_timestamp', return_value=now), patch.object(self.module.dt_util, 'utcnow', return_value=now):
            self.hass.states.async_set('sensor.synthetic_weight', '80',
                {'unit_of_measurement': 'kg', 'measurement_date': '2026-10-17'})
            values = {**PROFILE_INPUT, 'weight_entity': 'sensor.synthetic_weight'}
            values.pop('weight_kg')
            result = await self.flow().async_step_user(values)
            self.assertEqual(result['type'], 'create_entry')

    async def test_birthday_is_manual_text_without_an_implicit_today_in_both_forms(self):
        import voluptuous as vol
        from homeassistant.helpers.selector import TextSelector
        from homeassistant.helpers import config_validation as cv
        from probatio import to_field_list as convert

        forms = [await self.flow().async_step_user()]
        entry = self.register_entry({"profile_complete": False})
        forms.append(await self.options_flow(entry).async_step_init())
        for form in forms:
            schema = form["data_schema"]
            field = next(key for key in schema.schema if str(key) == "birthday")
            self.assertIs(field.default, vol.UNDEFINED)
            selector = schema.schema[field]
            self.assertIsInstance(selector, TextSelector)
            self.assertEqual(selector.config["type"], "text")
            self.assertFalse(selector.config["multiline"])
            serialized = convert(schema, custom_serializer=cv.custom_serializer)
            birthday = next(item for item in serialized if item["name"] == "birthday")
            self.assertNotIn("default", birthday)
            self.assertIn("text", birthday["selector"])
            self.assertNotIn("date", birthday["selector"])
            missing = dict(PROFILE_INPUT)
            missing.pop("birthday")
            with self.assertRaises(vol.Invalid):
                schema(missing)

    async def test_manual_iso_birthday_survives_setup_options_save_and_reopen(self):
        birthday = "1988-02-29"
        flow = self.flow()
        form = await flow.async_step_user()
        result = await flow.async_step_user(form["data_schema"]({**PROFILE_INPUT, "birthday": birthday}))
        self.assertEqual(result["data"]["birthday"], birthday)
        entry = self.register_entry(result["data"])
        for expected in (birthday, "1992-07-23"):
            options = self.options_flow(entry)
            form = await options.async_step_init()
            field = next(key for key in form["data_schema"].schema if str(key) == "birthday")
            self.assertEqual(field.default(), datetime.fromisoformat(entry.options.get("birthday", birthday)).strftime('%d.%m.%Y'))
            submitted = form["data_schema"]({**PROFILE_INPUT, "birthday": expected})
            result = await options.async_step_init(submitted)
            self.assertEqual(result["data"]["birthday"], expected)
            await self.hass.config_entries.options.async_finish_flow(options, result)
            exact = self.hass.config_entries.async_get_known_entry(entry.entry_id)
            self.assertEqual(exact.options["birthday"], expected)
            reopened = await self.options_flow(exact).async_step_init()
            field = next(key for key in reopened["data_schema"].schema if str(key) == "birthday")
            self.assertEqual(field.default(), datetime.fromisoformat(expected).strftime('%d.%m.%Y'))
        self.assertEqual(entry.data["birthday"], birthday)

    async def test_manual_birthday_errors_keep_typed_value_in_both_forms(self):
        entry = self.register_entry(self.module._normalized(PROFILE_INPUT))
        for value, code in (("", "invalid_profile"), ("1990-02-30", "invalid_profile"),
                            ("32.07.1992", "invalid_profile"), ("07/23/1992", "invalid_profile"),
                            ("19920723", "invalid_profile"), ("2027-01-01", "invalid_profile"),
                            ("2008-10-15", "adults_only"), ("1905-01-01", "adults_only")):
            for kind in ("config", "options"):
                with self.subTest(value=value, kind=kind):
                    if kind == "config":
                        # A separate native flow avoids single-instance rejection.
                        self.hass.config_entries._entries.pop(entry.entry_id, None)
                        flow = self.flow()
                        step = flow.async_step_user
                    else:
                        self.hass.config_entries._entries[entry.entry_id] = entry
                        step = self.options_flow(entry).async_step_init
                    form = await step()
                    submitted = form["data_schema"]({**PROFILE_INPUT, "birthday": value})
                    result = await step(submitted)
                    self.assertEqual(result["type"], "form")
                    self.assertEqual(result["errors"], {"birthday": code})
                    field = next(key for key in result["data_schema"].schema if str(key) == "birthday")
                    self.assertEqual(field.default(), value)
        self.assertEqual(entry.data["birthday"], PROFILE_INPUT["birthday"])
        self.assertEqual(dict(entry.options), {})

    async def test_manual_birthday_accepts_exact_adult_boundary_in_both_forms(self):
        birthday = "2008-10-14"
        config = await self.flow().async_step_user({**PROFILE_INPUT, "birthday": birthday})
        self.assertEqual(config["data"]["birthday"], birthday)
        entry = self.register_entry(self.module._normalized(PROFILE_INPUT))
        options = self.options_flow(entry)
        form = await options.async_step_init()
        result = await options.async_step_init(form["data_schema"]({**PROFILE_INPUT, "birthday": birthday}))
        self.assertEqual(result["data"]["birthday"], birthday)

    async def test_options_submission_clears_sources_without_reintroducing_data_defaults(self):
        settings = self.module._normalized(PROFILE_INPUT)
        data = {**settings, "weight_entity": "sensor.original_weight", "bmr_entity": "sensor.original_bmr",
                "active_calories_entity": "sensor.original_active", "enable_food_database": False}
        entry = self.register_entry(data)
        flow = self.options_flow(entry)
        form = await flow.async_step_init()
        self.assertNotIn("enable_food_database", {str(key) for key in form["data_schema"].schema})
        submitted = form["data_schema"](PROFILE_INPUT)
        for key in ("weight_entity", "bmr_entity", "active_calories_entity"):
            self.assertNotIn(key, submitted, "Cleared entities must not get server defaults")
        result = await flow.async_step_init(submitted)
        self.assertEqual(result["type"], "create_entry")
        for key in ("weight_entity", "bmr_entity", "active_calories_entity"):
            self.assertIsNone(result["data"][key])
        self.assertTrue(result["data"]["enable_food_database"])
        await self.hass.config_entries.options.async_finish_flow(flow, result)
        exact = self.hass.config_entries.async_get_known_entry(entry.entry_id)
        self.assertIsNone(exact.options["weight_entity"])
        reloaded = await self.options_flow(exact).async_step_init()
        optional = {str(key): key for key in reloaded["data_schema"].schema}
        self.assertEqual(optional["weight_entity"].description, None)
        invalid = await self.options_flow(exact).async_step_init({**PROFILE_INPUT, "birthday": "2010-10-14"})
        self.assertEqual(invalid["errors"], {"birthday": "adults_only"})
        duplicate = await self.flow().async_step_user()
        self.assertEqual(duplicate["reason"], "single_instance_allowed")

    async def test_real_config_entry_migration_readback_and_future_version_refusal(self):
        migration = importlib.import_module("custom_components.macromate.migration")
        self.assertTrue(hasattr(migration, "async_migrate_entry"))
        legacy = {"weight_entity": "sensor.exact_weight", "active_calories_entity": "sensor.exact_active",
                  "bmr_entity": "sensor.exact_bmr", "kcal_per_kg": 23.5, "protein_per_kg": 1.8,
                  "fat_per_kg": .9, "calorie_adjustment": -150}
        entry = self.register_entry(legacy, {"bmr_entity": None, "calorie_adjustment": -300}, version=1)
        self.assertTrue(await migration.async_migrate_entry(self.hass, entry))
        exact = self.hass.config_entries.async_get_known_entry(entry.entry_id)
        self.assertEqual(exact.version, 2)
        self.assertEqual(exact.options, {})
        self.assertEqual(exact.data["weight_entity"], "sensor.exact_weight")
        self.assertIsNone(exact.data["bmr_entity"])
        self.assertEqual(exact.data["calorie_adjustment"], -300)
        self.assertFalse(exact.data["profile_complete"])
        self.assertTrue(exact.data["enable_food_database"])
        self.assertNotIn("birthday", exact.data)
        self.assertTrue(await migration.async_migrate_entry(self.hass, entry))
        form = await self.options_flow(entry).async_step_init()
        self.assertNotIn("kcal_per_kg", {str(key) for key in form["data_schema"].schema})
        completion_flow = self.options_flow(entry)
        complete = await completion_flow.async_step_init(PROFILE_INPUT)
        await self.hass.config_entries.options.async_finish_flow(completion_flow, complete)
        self.assertNotIn("kcal_per_kg", entry.options)
        self.assertTrue(entry.options["profile_complete"])
        future = self.register_entry({"sentinel": "untouched"}, version=3)
        self.assertFalse(await migration.async_migrate_entry(self.hass, future))
        self.assertEqual(future.version, 3)
        self.assertEqual(dict(future.data), {"sentinel": "untouched"})

    async def test_onboarding_collects_profile_without_manual_factors_or_required_garmin(self):
        flow = self.flow()
        form = await flow.async_step_user()
        keys = {str(key) for key in form["data_schema"].schema}
        self.assertNotIn("kcal_per_kg", keys)
        self.assertTrue(set(PROFILE_INPUT).issubset(keys))
        self.assertNotIn("enable_food_database", keys)
        submitted = form["data_schema"](PROFILE_INPUT)
        result = await flow.async_step_user(submitted)
        self.assertEqual(result["type"], "create_entry")
        self.assertEqual(result["version"], 2)
        self.assertTrue(result["data"]["profile_complete"])
        self.assertTrue(result["data"]["enable_food_database"])
        for key in ("weight_entity", "bmr_entity", "active_calories_entity"):
            self.assertIsNone(result["data"][key])
        self.assertNotIn("kcal_per_kg", result["data"])

    async def test_bad_profile_returns_translated_field_errors(self):
        for key, value, code in (("birthday", "2010-10-14", "adults_only"),
                                 ("weight_kg", float("nan"), "invalid_profile"),
                                 ("target_weight_kg", 90, "goal_mismatch")):
            with self.subTest(key=key):
                result = await self.flow().async_step_user({**PROFILE_INPUT, key: value})
                self.assertEqual(result["type"], "form")
                self.assertEqual(result["errors"], {key: code})
        incomplete = await self.flow().async_step_user({})
        self.assertEqual(incomplete["type"], "form")
        self.assertIn("profile_required", incomplete["errors"].values())
        unreasonable = await self.flow().async_step_user({**PROFILE_INPUT, "height_cm": 100,
            "weight_kg": 35, "target_weight_kg": 30, "formula_sex": "female", "birthday": "1910-10-14"})
        self.assertEqual(unreasonable["errors"], {"base": "invalid_recommendation"})

    async def test_optional_sources_require_meaningful_units(self):
        cases = (("weight_entity", "kg", "kcal"), ("bmr_entity", "kcal", "kg"),
                 ("active_calories_entity", "kJ", None))
        for key, valid_unit, invalid_unit in cases:
            with self.subTest(key=key):
                entity = "sensor.synthetic_" + key
                self.hass.states.async_set(entity, "80", {"unit_of_measurement": invalid_unit})
                invalid = await self.flow().async_step_user({**PROFILE_INPUT, key: entity})
                self.assertEqual(invalid["errors"], {key: "invalid_source_unit"})
                self.hass.states.async_set(entity, "80", {"unit_of_measurement": valid_unit})
                result = await self.flow().async_step_user({**PROFILE_INPUT, key: entity})
                self.assertEqual(result["data"][key], entity)
        missing = await self.flow().async_step_user({**PROFILE_INPUT, "weight_entity": "sensor.missing"})
        self.assertEqual(missing["errors"], {"weight_entity": "source_not_found"})
        malformed = await self.flow().async_step_user({**PROFILE_INPUT, "weight_entity": " Sensor.WEIGHT "})
        self.assertEqual(malformed["errors"], {"weight_entity": "invalid_profile"})
