"""One source policy for setup and live goals, including local-date boundaries."""
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
import unittest
from zoneinfo import ZoneInfo

from custom_components.macromate.weight_source import current_weight_kg
from custom_components.macromate.recommendation import weight_to_kg


class WeightSourceTests(unittest.TestCase):
    def test_finite_units_age_boundaries_and_date_metadata(self):
        now = datetime(2026, 10, 17, 0, 30, tzinfo=ZoneInfo('Europe/Berlin'))
        state = SimpleNamespace(state='176', attributes={'unit_of_measurement': 'lb', 'measurement_date': '2026-10-17'},
                                last_updated=now.astimezone(timezone.utc))
        self.assertEqual(current_weight_kg(state, now), weight_to_kg(176, 'lb'))
        state.last_updated = now - timedelta(days=7)
        self.assertIsNotNone(current_weight_kg(state, now))
        state.last_updated -= timedelta(microseconds=1)
        self.assertIsNone(current_weight_kg(state, now))
        state.last_updated = now + timedelta(seconds=1)
        self.assertIsNone(current_weight_kg(state, now))
        state.last_updated = now
        for value in ('nan', 'inf', '-1', '0', '10000', 'unavailable'):
            state.state = value
            self.assertIsNone(current_weight_kg(state, now), value)
        state.state = '176'
        for attrs in ({'restored': True}, {'measurement_date': 'yesterday'},
                      {'measurement_date': '2026-10-18'}, {'measurement_date': '2026-10-09'}):
            state.attributes = {'unit_of_measurement': 'lb', **attrs}
            self.assertIsNone(current_weight_kg(state, now), attrs)
