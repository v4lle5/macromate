"""Evidence-derived goals wired into actual HA states and persisted date snapshots."""
from datetime import date, datetime, timezone
from unittest.mock import patch
from test_coordinator_transactions import CoordinatorTransactions

PROFILE = {"profile_version":1,"formula_sex":"male","birthday":"1996-10-14","height_cm":180,"weight_kg":80,
           "target_weight_kg":70,"goal":"lose","weekly_pace_kg":0.5,"activity_level":"moderate",
           "macro_plan":"moderate_carb","weight_entity":None,"bmr_entity":None,"active_calories_entity":None,
           "enable_food_database":False}


class RuntimeGoalTests(CoordinatorTransactions):
    async def asyncSetUp(self):
        await super().asyncSetUp()
        # HA StateMachine derives update timestamps through this public dt helper.
        # Freeze synthetic state timestamps, so these tests work on any CI date.
        clock = patch("homeassistant.util.dt.utc_from_timestamp",return_value=datetime(2026,10,14,10,tzinfo=timezone.utc))
        clock.start()
        self.addCleanup(clock.stop)

    async def test_weight_source_fallback_is_explicit_for_stale_and_restored_values(self):
        self.coord.settings = {**PROFILE, 'weight_entity': 'sensor.synthetic_weight'}
        self.coord.today = lambda: date(2026, 10, 14)
        with patch('homeassistant.util.dt.utcnow', return_value=datetime(2026,10,14,12,tzinfo=timezone.utc)):
            self.hass.states.async_set('sensor.synthetic_weight', '82', {'unit_of_measurement': 'kg'})
            self.assertEqual(self.coord.recommendation().weight_source, 'garmin')
            for attrs in ({'restored': True}, {'measurement_date': '2026-10-01'}):
                self.hass.states.async_set('sensor.synthetic_weight', '82', {'unit_of_measurement': 'kg', **attrs})
                recommendation = self.coord.recommendation()
                self.assertEqual(recommendation.weight_source, 'profile')
                self.assertEqual(recommendation.weight_kg, 80)
                self.assertIn('weight_unavailable', recommendation.fallback_reasons)
                self.assertEqual(recommendation.source_status, 'fallback')

    async def test_unavailable_current_goal_does_not_reuse_stale_today_snapshot(self):
        self.coord.settings = {**PROFILE,"goal":"maintain","target_weight_kg":80,"weekly_pace_kg":0,
                               "active_calories_entity":"sensor.synthetic_active"}
        self.coord.today = lambda:date(2026,10,14)
        self.hass.states.async_set("sensor.synthetic_active","300",{"unit_of_measurement":"kcal"})
        await self.coord.async_record_goal()
        self.assertIsNotNone(self.coord.diary_data()["recommendation"])
        self.hass.states.async_set("sensor.synthetic_active","20000",{"unit_of_measurement":"kcal"})
        self.assertIsNone(self.coord.recommendation())
        self.assertIsNone(self.coord.diary_data()["recommendation"])
        self.assertEqual(self.coord.summary(date(2026,10,14)).remaining,{})

    async def test_source_event_updates_persisted_daily_goal_and_unsubscribe_stops_it(self):
        self.coord.settings = {**PROFILE,"goal":"maintain","target_weight_kg":80,"weekly_pace_kg":0,
                               "active_calories_entity":"sensor.synthetic_active"}
        self.coord.today = lambda:date(2026,10,14)
        stop = self.coord.async_start()
        self.hass.states.async_set("sensor.synthetic_active","300",{"unit_of_measurement":"kcal","measurement_date":"2026-10-14"})
        await self.hass.async_block_till_done()
        self.assertIn("2026-10-14",self.coord.daily_goals)
        self.assertEqual(self.coord.daily_goals["2026-10-14"]["active_calories"],300)
        stop()
        self.hass.states.async_set("sensor.synthetic_active","500",{"unit_of_measurement":"kcal","measurement_date":"2026-10-14"})
        await self.hass.async_block_till_done()
        self.assertEqual(self.coord.daily_goals["2026-10-14"]["active_calories"],300)

    async def test_current_active_energy_replaces_pal_and_stale_or_restored_values_fall_back(self):
        self.coord.settings = {**PROFILE,"goal":"maintain","target_weight_kg":80,"weekly_pace_kg":0,
                               "active_calories_entity":"sensor.synthetic_active"}
        self.coord.today = lambda:date(2026,10,14)
        self.hass.states.async_set("sensor.synthetic_active","400",{"unit_of_measurement":"kcal","measurement_date":"2026-10-14"})
        rec = self.coord.recommendation()
        self.assertEqual(rec.budget_source,"bmr_plus_active")
        self.assertEqual(rec.calorie_target,rec.bmr+400)
        self.hass.states.async_set("sensor.synthetic_active","0",{"unit_of_measurement":"kcal","measurement_date":"2026-10-14"})
        self.assertEqual(self.coord.recommendation().calorie_target,rec.bmr)
        for attrs in ({"measurement_date":"2026-10-13"},{"restored":True},{"macromate_energy_role":"total"}):
            self.hass.states.async_set("sensor.synthetic_active","400",{"unit_of_measurement":"kcal",**attrs})
            degraded = self.coord.recommendation()
            self.assertEqual(degraded.budget_source,"profile_pal")
            self.assertAlmostEqual(degraded.calorie_target,degraded.bmr*1.38)
            self.assertEqual(degraded.source_status,"fallback")

    async def test_profile_goals_work_without_garmin_and_history_is_not_todays_goal(self):
        self.coord.settings = dict(PROFILE)
        self.coord.today = lambda:date(2026,10,14)
        rec = self.coord.recommendation()
        self.assertIsNotNone(rec)
        self.assertAlmostEqual(rec.calorie_target,2081.4)
        unknown = self.coord.diary_data("2026-10-13")
        self.assertIsNone(unknown["recommendation"])
        await self.coord.async_record_goal()
        self.coord.today = lambda:date(2026,10,15)
        self.coord.settings["weight_kg"] = 75
        past = self.coord.diary_data("2026-10-14")
        self.assertAlmostEqual(past["recommendation"]["calorie_target"],2081.4)
        self.assertNotEqual(self.coord.diary_data("2026-10-15")["recommendation"]["calorie_target"],2081.4)
        await self.coord.async_load()
        self.assertAlmostEqual(self.coord.diary_data("2026-10-14")["recommendation"]["calorie_target"],2081.4)


if __name__ == "__main__":
    import unittest
    unittest.main()
