"""Coordinator transactions against real HA classes and synthetic storage."""
import asyncio
import os
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from homeassistant.core import HomeAssistant
from custom_components.macromate.coordinator import MealTrackerCoordinator


class MemoryStore:
    def __init__(self):
        self.value = None
        self.fail = False
    async def async_load(self):
        return self.value
    async def async_save(self, value):
        if self.fail:
            raise OSError("synthetic disk failure")
        await asyncio.sleep(0)
        self.value = value


class CoordinatorTransactions(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR"))
        self.hass = HomeAssistant(self.tmp.name)
        self.hass.config.time_zone = "Europe/Berlin"
        self.coord = MealTrackerCoordinator(self.hass, {"weight_entity":None,"active_calories_entity":None})
        self.store = MemoryStore()
        self.coord._store = self.store
        self.values = dict(name="Synthetic meal",meal_type="lunch",calories=500.,protein=20.,carbs=50.,fat=10.,
                           eaten_at=datetime(2026,10,14,10,tzinfo=timezone.utc),request_id="create1")
    async def asyncTearDown(self):
        await self.hass.async_stop(force=True)
        self.tmp.cleanup()
    async def test_create_retry_conflicts_and_survives_delete_and_reload(self):
        first = await self.coord.async_create(**self.values)
        with self.assertRaisesRegex(ValueError,"different payload"):
            await self.coord.async_create(**{**self.values,"calories":999.})
        await self.coord.async_remove(first.id)
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        restarted._store = self.store
        await restarted.async_load()
        replay = await restarted.async_create(**self.values)
        self.assertEqual(replay.id, first.id)
        self.assertEqual(restarted.log.entries, ())

    async def test_failed_save_does_not_publish_and_concurrent_retries_add_once(self):
        self.store.fail = True
        with self.assertRaises(OSError):
            await self.coord.async_create(**self.values)
        self.assertEqual(self.coord.log.entries, ())
        self.assertEqual(self.coord.ledger.to_list(), [])
        self.store.fail = False
        results = await asyncio.gather(*(self.coord.async_create(**self.values) for _ in range(8)))
        self.assertEqual(len({item.id for item in results}), 1)
        self.assertEqual(len(self.coord.log.entries), 1)

    async def test_backdated_create_persists_exact_committed_order_and_replay(self):
        later = await self.coord.async_create(**{
            **self.values, "eaten_at": datetime(2026, 10, 16, 10, tzinfo=timezone.utc),
        })
        earlier_values = {
            **self.values, "eaten_at": datetime(2026, 10, 16, 6, tzinfo=timezone.utc),
            "request_id": "earlier-create",
        }
        earlier = await self.coord.async_create(**earlier_values)
        assert self.store.value is not None
        self.assertEqual(self.store.value, self.coord._state())
        self.assertEqual([row["id"] for row in self.store.value["entries"]],
                         [earlier.id, later.id])
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        restarted._store = self.store
        await restarted.async_load()
        self.assertEqual(restarted._state(), self.store.value)
        self.assertEqual((await restarted.async_create(**earlier_values)).id, earlier.id)
        self.assertEqual(restarted._state(), self.store.value)

    async def test_clock_default_is_not_part_of_logical_retry_payload(self):
        values = {**self.values, "eaten_at":None}
        first = await self.coord.async_create(**values)
        await asyncio.sleep(0.01)
        second = await self.coord.async_create(**values)
        self.assertEqual(first.to_dict(), second.to_dict())

    async def test_update_delete_clear_request_history_survives_reload(self):
        first = await self.coord.async_create(**self.values)
        await self.coord.async_update(first.id, {"calories":400.}, "update1")
        await self.coord.async_update(first.id, {"calories":400.}, "update1")
        with self.assertRaises(ValueError):
            await self.coord.async_update(first.id, {"calories":300.}, "update1")
        await self.coord.async_remove(first.id, "delete1")
        await self.coord.async_remove(first.id, "delete1")
        await self.coord.async_create(**{**self.values,"request_id":"create2"})
        count = await self.coord.async_clear_date("2026-10-14", "clear1")
        self.assertEqual(count, 1)
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        restarted._store = self.store
        await restarted.async_load()
        self.assertEqual(await restarted.async_clear_date("2026-10-14", "clear1"), 1)
        await restarted.async_remove(first.id, "delete1")
        self.assertEqual(restarted.log.entries, ())


if __name__ == "__main__":
    unittest.main()
