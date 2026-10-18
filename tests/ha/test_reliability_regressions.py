"""Exercise faults at the real storage and authenticated HTTP boundaries."""

import json
from pathlib import Path
import unittest
from unittest.mock import patch

from homeassistant.core import CoreState
from homeassistant.util.file import WriteError

from custom_components.macromate import async_remove_entry
from custom_components.macromate.agent_auth import AgentCredentials
from custom_components.macromate.sensor import MealSensor, SENSORS
import test_agent_credentials_native as native_credentials
from test_runtime_goals import PROFILE


class ReliabilityRegressions(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = native_credentials.AgentCredentialsTests.asyncSetUp
    asyncTearDown = native_credentials.AgentCredentialsTests.asyncTearDown
    headers = native_credentials.AgentCredentialsTests.headers
    mint = native_credentials.AgentCredentialsTests.mint
    action = native_credentials.AgentCredentialsTests.action

    async def test_native_write_failure_never_acknowledges_revocation(self):
        credential = await self.mint()
        disk = Path(self.agents.store.path)
        original = disk.read_bytes()
        self.assertTrue(self.agents.store._atomic_writes)
        with patch.object(self.agents.store, "_write_prepared_data", side_effect=WriteError("synthetic")):
            async with self.client.delete(
                self.origin + "/api/macromate/agent/credentials/" + credential["id"],
                headers=self.headers(),
            ) as response:
                self.assertEqual(response.status, 503)
        self.assertFalse(self.agents.rows[credential["id"]]["revoked"])
        self.assertEqual(disk.read_bytes(), original)
        await self.action(credential, "describe", {})
        async with self.client.delete(
            self.origin + "/api/macromate/agent/credentials/" + credential["id"],
            headers=self.headers(),
        ) as response:
            self.assertEqual(response.status, 200)
        restarted = AgentCredentials(self.hass)
        await restarted.async_load()
        with self.assertRaises(PermissionError):
            await restarted.authenticate(credential["token"])

    async def test_stopping_and_read_only_credentials_are_not_published(self):
        before = dict(self.agents.rows)
        for stopping in (True, False):
            with (
                patch.object(self.hass, "state", CoreState.stopping if stopping else self.hass.state),
                patch.object(self.agents.store, "_read_only", not stopping),
            ):
                with self.assertRaises(OSError):
                    await self.agents.mint(self.owner.id, {"label": "Must not persist"})
            self.assertEqual(self.agents.rows, before)

    async def test_removal_erases_credentials_in_memory_and_after_reload(self):
        credential = await self.mint()
        await async_remove_entry(self.hass, None)
        self.assertFalse(Path(self.agents.store.path).exists())
        self.assertEqual(self.agents.rows, {})
        with self.assertRaises(PermissionError):
            await self.agents.authenticate(credential["token"])
        restarted = AgentCredentials(self.hass)
        await restarted.async_load()
        self.assertEqual(restarted.rows, {})

    async def test_missing_wearable_sources_are_unavailable_not_zero_or_profile_weight(self):
        self.coord.settings = {**PROFILE, "weight_entity": "sensor.missing_weight",
                               "active_calories_entity": "sensor.missing_active"}
        for key in ("garmin_weight", "garmin_active_calories"):
            description = next(row for row in SENSORS if row.key == key)
            sensor = MealSensor(self.coord, "synthetic", description)
            self.assertFalse(sensor.available)
            self.assertIsNone(sensor.native_value)
            self.assertEqual(sensor.extra_state_attributes["source_status"], "fallback")

    async def test_recipe_sugar_totals_and_legacy_snapshot_upgrade(self):
        recipe = await self.coord.async_command("recipes_add", {
            "name": "Synthetic sugar", "servings": 2, "nutrition_basis": "per_recipe",
            "declared_nutrition": {"calories": 200, "sugar": 24}, "request_id": "recipe",
        })
        result = await self.coord.async_command("recipe_log", {
            "recipe_id": recipe["recipe"]["id"], "servings": 1, "meal_type": "lunch",
            "date": "2026-10-14", "request_id": "entry",
        })
        diary = self.coord.diary_data("2026-10-14")
        self.assertEqual(diary["totals"]["sugar"], 12)
        self.assertNotIn("sugar", diary["nutrition_missing"])
        self.assertNotIn("sugars", diary["totals"])
        legacy = self.coord._state()
        legacy["entries"][0]["nutrients"]["sugars"] = legacy["entries"][0]["nutrients"].pop("sugar")
        before = json.loads(json.dumps(legacy["entries"][0]["recipe_snapshot"]))
        restored = self.coord._validate_restore(legacy)
        self.assertEqual(restored["entries"][0]["nutrients"]["sugar"], 12)
        self.assertEqual(restored["entries"][0]["recipe_snapshot"], before)
        self.assertEqual(result["entry"]["nutrients"]["sugar"], 12)
