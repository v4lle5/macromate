"""Retired shopping is inaccessible even to native administrators."""
import unittest
from unittest.mock import patch
from homeassistant.exceptions import ServiceNotFound
from custom_components.macromate.platform_api import ACTIONS
from custom_components.macromate.shopping import SHOPPING_ACTIONS
import test_unified_http as native

RETIRED = tuple(SHOPPING_ACTIONS) + ("recipe_to_shopping", "plan_to_shopping")

class ShoppingRetirementTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers
    # Do not inherit the base's test cases; reuse only its real native fixture.
    async def test_retired_registry_and_native_transports(self):
        self.assertFalse(set(RETIRED) & ACTIONS.keys())
        before = self.coord._state()
        async with self.client.ws_connect(self.origin + "/api/websocket") as ws:
            await ws.receive_json()
            await ws.send_json({"type": "auth", "access_token": self.tokens[0][1]})
            self.assertEqual((await ws.receive_json())["type"], "auth_ok")
            for index, action in enumerate(RETIRED, 1):
                with self.subTest(action=action):
                    self.assertFalse(self.hass.services.has_service("macromate", action))
                    from tools.macromate_client import service_url
                    from custom_components.macromate.platform_support import Actor
                    with self.assertRaises(ValueError):
                        service_url(self.origin, action, response=True, trusted_lan_http=True)
                    with self.assertRaises(ValueError):
                        await self.coord.async_command(action, {}, actor=Actor(self.owner.id, is_admin=True))
                    with self.assertRaises(ServiceNotFound):
                        await self.hass.services.async_call("macromate", action, {}, blocking=True)
                    async with self.client.post(self.origin + "/api/services/macromate/" + action,
                                                headers=self.headers(), json={}) as response:
                        self.assertEqual(response.status, 400)
                    await ws.send_json({"id": index, "type": "macromate/command", "action": action, "payload": {}})
                    response = await ws.receive_json()
                    self.assertFalse(response["success"])
                    self.assertEqual(response["error"]["code"], "invalid_format")
        self.assertEqual(self.coord._state(), before)

if __name__ == "__main__":
    unittest.main()
