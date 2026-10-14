"""Service boundary checks against actual HA ServiceRegistry, synthetic users/data."""
import tempfile
import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch
from datetime import datetime, timezone
from homeassistant import auth
from homeassistant.auth.const import GROUP_ID_READ_ONLY, GROUP_ID_ADMIN
from homeassistant.config_entries import ConfigEntries
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import Unauthorized
from custom_components.macromate import async_setup
from custom_components.macromate.coordinator import MealTrackerCoordinator


class ServiceBoundaryTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR"))
        self.hass = HomeAssistant(self.tmp.name)
        self.hass.config.time_zone = "Europe/Berlin"
        self.hass.config_entries = ConfigEntries(self.hass, {})
        from homeassistant import loader
        from homeassistant.bootstrap import async_load_base_functionality
        loader.async_setup(self.hass)
        await async_load_base_functionality(self.hass)
        self.hass.auth = await auth.auth_manager_from_config(self.hass, [], [])
        self.coord = MealTrackerCoordinator(self.hass, {"weight_entity":None,"active_calories_entity":None})
        self.patch = patch.object(self.hass.config_entries, "async_loaded_entries", return_value=[SimpleNamespace(runtime_data=self.coord)])
        self.patch.start()
        await async_setup(self.hass, {})
    async def asyncTearDown(self):
        self.patch.stop()
        await self.hass.async_stop(force=True)
        self.tmp.cleanup()
    async def call(self, name, data, context=None):
        return await self.hass.services.async_call("macromate",name,data,blocking=True,return_response=True,context=context)
    async def test_food_actions_share_websocket_contract_and_explicit_clear(self):
        food = (await self.call("save_food",{"food":{"name":"Synthetic service food","base_unit":"g",
            "nutrients_per_100":{"calories":200}},"request_id":"servicefood"}))["food"]
        entry = await self.call("log_food",{"food_id":food["food_id"],"amount":150,"meal_type":"lunch",
            "date":"2026-10-14","request_id":"servicelog"})
        diary = await self.call("list_meals",{"date":"2026-10-14"})
        self.assertEqual(diary["totals"]["calories"],300)
        self.assertIn("meals",diary)
        from homeassistant.exceptions import ServiceValidationError
        with self.assertRaises(ServiceValidationError):
            await self.call("clear_day",{"date":"2026-10-14"})
        self.assertEqual(await self.call("clear_day",{"date":"2026-10-14","confirm":True,"request_id":"serviceclear"}),{"removed":1})

    async def test_private_websocket_command_registered_and_rejects_read_only(self):
        self.assertIn("macromate/command", self.hass.data.get("websocket_api", {}))
        await self.hass.auth.async_create_user("Synthetic owner",group_ids=[GROUP_ID_ADMIN])
        reader = await self.hass.auth.async_create_user("Synthetic reader",group_ids=[GROUP_ID_READ_ONLY])
        class Connection:
            def __init__(self, user):
                self.user = user
                self.result = None
            def send_error(self, request_id, code, message):
                self.result = (code, message)
            def send_result(self, request_id, result):
                self.result = result
        connection = Connection(reader)
        handler, schema = self.hass.data["websocket_api"]["macromate/command"]
        with self.assertRaises(Unauthorized):
            handler(self.hass, connection, schema({"id":1,"type":"macromate/command","action":"diary"}))

    async def test_read_only_user_cannot_read_or_mutate_private_nutrition(self):
        await self.hass.auth.async_create_user("Synthetic owner",group_ids=[GROUP_ID_ADMIN])
        reader = await self.hass.auth.async_create_user("Synthetic reader",group_ids=[GROUP_ID_READ_ONLY])
        self.assertFalse(reader.is_admin)
        for name,data in (("list_meals",{}),("log_meal",{"name":"Test","meal_type":"lunch","calories":1})):
            with self.subTest(name=name), self.assertRaises(Unauthorized):
                await self.call(name,data,Context(user_id=reader.id))


if __name__ == "__main__":
    unittest.main()
