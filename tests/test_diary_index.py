"""Repeated reads preserve local-date and mutation semantics."""

from datetime import datetime, timezone
import unittest

from custom_components.macromate.models import MealEntry, MealLog


def entry(key, stamp):
    return MealEntry(key, key, "lunch", 100, 1, 1, 1, datetime.fromisoformat(stamp))


class DiaryIndexTests(unittest.TestCase):
    def test_date_reads_remain_correct_after_add_remove_and_clear(self):
        first = entry("first", "2026-10-14T23:30:00+00:00")
        log = MealLog([first])
        for _ in range(3):
            self.assertEqual(log.summary_for_date("2026-10-15", "Europe/Berlin").entry_count, 1)
            self.assertEqual(log.summary_for_date("2026-10-14", "UTC").entry_count, 1)
        second = entry("second", "2026-10-14T22:30:00+00:00")
        log.add(second)
        self.assertEqual([row.id for row in log.entries], ["second", "first"])
        self.assertEqual(log.summary_for_date("2026-10-15", "Europe/Berlin").calories, 200)
        log.remove("first")
        self.assertEqual(log.summary_for_date("2026-10-15", "Europe/Berlin").calories, 100)
        self.assertEqual(log.clear_date("2026-10-15", "Europe/Berlin"), 1)
        self.assertEqual(log.summary_for_date("2026-10-15", "Europe/Berlin").entry_count, 0)
        self.assertEqual(log.entries, ())

    def test_timezone_changes_do_not_reuse_another_local_day(self):
        log = MealLog([entry("boundary", "2026-10-14T23:30:00+00:00")])
        for zone in ("UTC", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "Pacific/Auckland", "UTC"):
            expected = 1 if zone in ("UTC", "America/New_York") else 0
            self.assertEqual(log.summary_for_date("2026-10-14", zone).entry_count, expected)
