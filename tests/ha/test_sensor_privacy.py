"""HA sensor summaries must not expose detailed private food diaries."""
from datetime import date
from test_coordinator_transactions import CoordinatorTransactions


class SensorPrivacyTests(CoordinatorTransactions):
    async def test_sensor_attributes_omit_food_names_and_snapshots(self):
        from custom_components.macromate.sensor import MealSensor,SENSORS
        await self.coord.async_create(**self.values)
        sensor = MealSensor(self.coord,"entry",SENSORS[0])
        attrs = sensor.extra_state_attributes
        self.assertNotIn("entries",attrs)
        self.assertNotIn("Synthetic meal",str(attrs))


if __name__ == "__main__":
    import unittest
    unittest.main()
