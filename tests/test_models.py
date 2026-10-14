from __future__ import annotations

from datetime import datetime, timezone
import unittest

from custom_components.macromate.models import DailyGoals, MealEntry, MealLog, OperationLedger
from custom_components.macromate.time import localize_wall_time


def entry(
    entry_id: str = "meal-1",
    *,
    calories: float = 500,
    protein: float = 30,
    carbs: float = 60,
    fat: float = 15,
    eaten_at: datetime | None = None,
) -> MealEntry:
    return MealEntry(
        id=entry_id,
        name="Haferflocken",
        meal_type="breakfast",
        calories=calories,
        protein=protein,
        carbs=carbs,
        fat=fat,
        eaten_at=eaten_at or datetime(2026, 10, 8, 7, 30, tzinfo=timezone.utc),
    )


class MealModelTests(unittest.TestCase):
    def test_service_dict_exposes_entry_id_for_crud_roundtrip(self) -> None:
        value = entry().to_service_dict()
        self.assertEqual(value["entry_id"], "meal-1")
        self.assertNotIn("id", value)

    def test_operation_ledger_replays_only_identical_request(self) -> None:
        ledger = OperationLedger()
        payload = {"name": "Porridge", "calories": 500}
        ledger.record("request-1", "create", payload, {"entry_id": "meal-1"})
        self.assertEqual(
            ledger.replay("request-1", "create", payload),
            {"entry_id": "meal-1"},
        )
        with self.assertRaisesRegex(ValueError, "different payload"):
            ledger.replay("request-1", "create", {**payload, "calories": 900})

    def test_operation_ledger_roundtrip_preserves_delete_tombstone(self) -> None:
        ledger = OperationLedger()
        ledger.record(
            "delete-1",
            "delete",
            {"entry_id": "meal-1"},
            {"deleted_entry_id": "meal-1"},
        )
        restored = OperationLedger.from_list(ledger.to_list())
        self.assertEqual(
            restored.replay("delete-1", "delete", {"entry_id": "meal-1"}),
            {"deleted_entry_id": "meal-1"},
        )

    def test_meal_entry_roundtrips_through_storage_dict(self) -> None:
        original = entry()
        restored = MealEntry.from_dict(original.to_dict())
        self.assertEqual(restored, original)

    def test_meal_entry_rejects_negative_nutrients(self) -> None:
        with self.assertRaisesRegex(ValueError, "calories"):
            entry(calories=-1)

    def test_daily_summary_only_counts_requested_local_day(self) -> None:
        log = MealLog(
            [
                entry(
                    "late",
                    calories=300,
                    eaten_at=datetime(2026, 10, 7, 22, 30, tzinfo=timezone.utc),
                ),
                entry(
                    "today",
                    calories=700,
                    eaten_at=datetime(2026, 10, 8, 10, 0, tzinfo=timezone.utc),
                ),
            ]
        )
        summary = log.summary_for_date("2026-10-08", "Europe/Berlin")
        self.assertEqual(summary.calories, 1000)
        self.assertEqual(summary.entry_count, 2)

    def test_daily_summary_calculates_remaining_goals_without_below_zero(self) -> None:
        log = MealLog([entry(calories=2200, protein=170, carbs=190, fat=80)])
        goals = DailyGoals(calories=2000, protein=150, carbs=250, fat=70)
        summary = log.summary_for_date("2026-10-08", "UTC", goals)
        self.assertEqual(
            summary.remaining,
            {"calories": 0, "protein": 0, "carbs": 60, "fat": 0},
        )

    def test_meal_entry_rejects_non_finite_nutrients(self) -> None:
        for value in (float("nan"), float("inf"), float("-inf")):
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, "calories"):
                entry(calories=value)

    def test_goals_reject_non_finite_values(self) -> None:
        with self.assertRaisesRegex(ValueError, "protein"):
            DailyGoals(protein=float("inf"))

    def test_localize_wall_time_rejects_nonexistent_dst_time(self) -> None:
        naive = datetime(2026, 3, 29, 2, 30)
        with self.assertRaisesRegex(ValueError, "nonexistent"):
            localize_wall_time(naive, "Europe/Berlin")

    def test_localize_wall_time_rejects_ambiguous_dst_time(self) -> None:
        naive = datetime(2026, 10, 25, 2, 30)
        with self.assertRaisesRegex(ValueError, "ambiguous"):
            localize_wall_time(naive, "Europe/Berlin")

    def test_localize_wall_time_accepts_regular_time(self) -> None:
        localized = localize_wall_time(datetime(2026, 10, 8, 12, 30), "Europe/Berlin")
        self.assertEqual(localized.utcoffset().total_seconds(), 7200)

    def test_remove_requires_existing_entry(self) -> None:
        log = MealLog([entry()])
        with self.assertRaises(KeyError):
            log.remove("missing")

    def test_clear_date_keeps_entries_from_other_days(self) -> None:
        log = MealLog(
            [
                entry("today"),
                entry(
                    "tomorrow",
                    eaten_at=datetime(2026, 10, 9, 7, 30, tzinfo=timezone.utc),
                ),
            ]
        )
        removed = log.clear_date("2026-10-08", "UTC")
        self.assertEqual(removed, 1)
        self.assertEqual([item.id for item in log.entries], ["tomorrow"])


if __name__ == "__main__":
    unittest.main()
