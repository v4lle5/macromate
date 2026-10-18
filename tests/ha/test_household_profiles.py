"""Household partitions on native HA identities, durable storage and services."""

import asyncio
from copy import deepcopy
from datetime import date
from pathlib import Path
import unittest

from homeassistant.exceptions import ServiceValidationError, Unauthorized
from homeassistant.core import Context
from homeassistant.auth.const import GROUP_ID_READ_ONLY

from custom_components.macromate.coordinator import MealTrackerCoordinator
from custom_components.macromate.platform_support import Actor
import test_unified_http as native
from test_runtime_goals import PROFILE


class HouseholdProfiles(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers

    async def call(self, action, payload=None, user=None):
        user = user or self.owner
        return await self.hass.services.async_call(
            "macromate", action, payload or {}, blocking=True, return_response=True,
            context=Context(user_id=user.id),
        )

    async def profile(self, owner=None):
        result = await self.call("profiles_create", {
            "name": "Person", "owner_id": (owner or self.other).id,
            "settings": PROFILE, "request_id": "person-" + (owner or self.other).id,
        })
        return result["profile"]["id"]

    async def test_native_owner_isolation_and_reload(self):
        profile_id = await self.profile()
        fields = {"profile_id": profile_id, "name": "Private lunch", "calories": 321,
                  "meal_type": "lunch", "date": "2026-10-14", "request_id": "lunch"}
        entry = await self.call("log_meal", fields, self.other)
        replay = await self.call("log_meal", fields, self.other)
        self.assertEqual(entry, replay)
        self.assertEqual((await self.call("diary", {"profile_id": profile_id, "date": "2026-10-14"}, self.other))["totals"]["calories"], 321)
        self.assertEqual((await self.call("diary", {"date": "2026-10-14"}))["entries"], [])
        outsider = await self.hass.auth.async_create_user("Unshared person")
        self.assertEqual((await self.call("profiles_list", user=outsider))["profiles"], [])
        with self.assertRaises((ServiceValidationError, Unauthorized)):
            await self.call("diary", {"profile_id": profile_id}, outsider)
        self.assertTrue(Path(self.coord._store.path).exists())
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        await restarted.async_load()
        diary = await restarted.async_command("diary", {"profile_id": profile_id, "date": "2026-10-14"}, actor=Actor(self.other.id))
        self.assertEqual(diary["totals"]["calories"], 321)

    async def test_sharing_revocation_and_cross_profile_ids(self):
        first = await self.profile()
        second = await self.profile(self.owner)
        entry = await self.call("log_meal", {"profile_id": first, "name": "Original", "calories": 20,
                                           "meal_type": "lunch", "request_id": "original"}, self.other)
        with self.assertRaises((ServiceValidationError, Unauthorized)):
            await self.call("update_meal", {"profile_id": second, "entry_id": entry["entry_id"], "name": "Crossed"}, self.other)
        reader = await self.hass.auth.async_create_user("Read only", group_ids=[GROUP_ID_READ_ONLY])
        await self.call("profiles_update", {"profile_id": first, "allowed_users": [reader.id], "request_id": "share"})
        self.assertEqual(len((await self.call("profiles_list", user=reader))["profiles"]), 1)
        with self.assertRaises((ServiceValidationError, Unauthorized)):
            await self.call("log_meal", {"profile_id": first, "name": "Denied", "calories": 1, "meal_type": "lunch"}, reader)
        await self.call("profiles_update", {"profile_id": first, "allowed_users": [], "request_id": "unshare"})
        self.assertEqual((await self.call("profiles_list", user=reader))["profiles"], [])

    async def test_calendar_report_preserves_unknowns_and_captured_goals(self):
        profile_id = await self.profile()
        for day, calories in (("2026-10-13", 100), ("2026-10-14", 300)):
            await self.call("log_meal", {"profile_id": profile_id, "name": "Logged", "calories": calories,
                                       "meal_type": "lunch", "date": day, "request_id": day}, self.other)
        report = await self.call("nutrition_report", {"profile_id": profile_id, "period": "week", "date": "2026-10-14"}, self.other)
        self.assertEqual((report["start"], report["end"]), ("2026-10-12", "2026-10-18"))
        self.assertEqual(report["average_per_logged_day"]["calories"], 200)
        self.assertEqual(report["incomplete_days"]["protein"], 2)
        self.assertIsNone(report["days"][0]["calorie_target"])
        month = await self.call("nutrition_report", {"profile_id": profile_id, "period": "month", "date": "2024-02-01"}, self.other)
        self.assertEqual(len(month["days"]), 29)

    async def test_profile_restore_rejects_forged_history_and_keeps_default(self):
        profile_id = await self.profile()
        before = self.coord._state()
        invalid = deepcopy(before)
        invalid["profiles"][profile_id]["data"]["entries"] = [{"id": "bad"}]
        with self.assertRaises((ValueError, KeyError, TypeError)):
            self.coord._validate_restore(invalid)
        self.assertEqual(self.coord._state(), before)
        valid = self.coord._validate_restore(before)
        self.assertEqual(valid["profiles"], before["profiles"])

    async def test_concurrent_default_and_person_writes_survive_reload(self):
        profile_id = await self.profile()
        async def write(index, person):
            return await self.call('log_meal', {
                'name': f'Meal {index}', 'calories': index + 1, 'meal_type': 'lunch',
                'date': '2026-10-14', 'request_id': f'parallel-{index}',
                **({'profile_id': profile_id} if person else {}),
            }, self.other if person else self.owner)
        await asyncio.gather(*(write(index, index % 2 == 1) for index in range(8)))
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        await restarted.async_load()
        default = await restarted.async_command('diary', {'date': '2026-10-14'})
        person = await restarted.async_command('diary', {'profile_id': profile_id, 'date': '2026-10-14'}, actor=Actor(self.other.id))
        self.assertEqual(default['totals']['calories'], 16)
        self.assertEqual(person['totals']['calories'], 20)
        self.assertEqual(len(default['entries']), 4)
        self.assertEqual(len(person['entries']), 4)
