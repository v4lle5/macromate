"""Real loopback native HA HTTP/WS with disposable users and private Store."""

import base64
import io
import json
import unittest
from PIL import Image
from aiohttp import ClientSession
from homeassistant.setup import async_setup_component
from homeassistant.auth.const import GROUP_ID_ADMIN, GROUP_ID_USER
import test_service_boundary as boundary
from custom_components.macromate.platform_support import Actor


class NativeHTTPTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        await boundary.ServiceBoundaryTests.asyncSetUp(self)
        self.owner = await self.hass.auth.async_create_user(
            "Synthetic owner", group_ids=[GROUP_ID_ADMIN]
        )
        self.other = await self.hass.auth.async_create_user(
            "Synthetic other", group_ids=[GROUP_ID_USER]
        )
        self.tokens = []
        for user in (self.owner, self.other):
            refresh = await self.hass.auth.async_create_refresh_token(
                user, client_id="https://example.invalid/native-test"
            )
            self.tokens.append(
                (refresh, self.hass.auth.async_create_access_token(refresh))
            )
        from homeassistant.components import api, websocket_api
        from homeassistant.components.http import HomeAssistantHTTP

        # HA's production config schema rejects port 0. Construct the real native
        # server with an ephemeral loopback port before its first bind instead.
        server = HomeAssistantHTTP(
            self.hass, None, None, None, ["127.0.0.1"], 0, [], "modern"
        )
        self.hass.http = server
        await server.async_bind()
        await server.async_initialize(
            cors_origins=[], use_x_forwarded_for=False, login_threshold=-1,
            is_ban_enabled=False, use_x_frame_options=True,
        )
        # Initialize native transports directly so dependency setup cannot replace
        # this server with a production-port HTTP instance.
        self.hass.config.components.add("http")
        self.assertTrue(await websocket_api.async_setup(self.hass, {}))
        self.hass.config.components.add("websocket_api")
        self.assertTrue(await api.async_setup(self.hass, {}))
        self.hass.config.components.add("api")
        self.assertIs(self.hass.http, server)
        self.assertTrue(server._server.sockets)
        self.assertTrue(all(
            sock.getsockname()[0] == "127.0.0.1" and sock.getsockname()[1] not in (0, 8123)
            for sock in server._server.sockets
        ))
        from custom_components.macromate import async_setup

        await async_setup(self.hass, {})
        await self.hass.http.start()
        port = self.hass.http._server.sockets[0].getsockname()[1]
        self.origin = f"http://127.0.0.1:{port}"
        self.client = ClientSession()

    async def asyncTearDown(self):
        await self.client.close()
        for user in await self.hass.auth.async_get_users():
            for refresh in list(user.refresh_tokens.values()):
                self.hass.auth.async_remove_refresh_token(refresh)
        self.assertTrue(
            all(
                not user.refresh_tokens
                for user in await self.hass.auth.async_get_users()
            )
        )
        store = self.hass.auth._store
        await store._store.async_save(store._data_to_save())
        persisted = json.loads(
            (
                __import__("pathlib").Path(self.tmp.name) / ".storage" / "auth"
            ).read_text()
        )
        self.assertEqual(persisted["data"]["refresh_tokens"], [])
        await self.hass.http.stop()
        import asyncio

        port = int(self.origin.rsplit(":", 1)[1])
        with self.assertRaises(ConnectionRefusedError):
            await asyncio.open_connection("127.0.0.1", port)
        await boundary.ServiceBoundaryTests.asyncTearDown(self)

    def headers(self, index=0):
        return {"Authorization": "Bearer " + self.tokens[index][1]}

    async def test_private_media_http_and_large_backup_restore_roundtrip(self):
        recipe = (
            await self.coord.async_command(
                "recipes_add",
                {"name": "Photo"},
                actor=Actor(self.owner.id, is_admin=True),
            )
        )["recipe"]
        stream = io.BytesIO()
        Image.new("RGB", (3, 3), "blue").save(stream, format="PNG")
        uploaded = await self.coord.async_command(
            "recipes_upload_image",
            {
                "recipe_id": recipe["id"],
                "image_data": base64.b64encode(stream.getvalue()).decode(),
            },
            actor=Actor(self.owner.id, is_admin=True),
        )
        route = uploaded["image_url"]
        for headers, status in (
            ({}, 401),
            (self.headers(1), 404),
            (self.headers(), 200),
        ):
            async with self.client.get(
                self.origin + route, headers=headers
            ) as response:
                self.assertEqual(response.status, status)
                if status == 200:
                    self.assertEqual(response.headers["Content-Type"], "image/webp")
                    self.assertEqual(response.headers["Cache-Control"], "no-store")
                    self.assertEqual(
                        Image.open(io.BytesIO(await response.read())).format, "WEBP"
                    )

        # Larger than native HA's generic 16 MiB request limit, helper's 8 MiB
        # JSON limit and the shipped generic client's 1/4 MiB limits.
        def fill(state):
            state["kitchen"]["preferences"]["synthetic-large"] = {
                "notes": ["x" * 60000 for _ in range(290)]
            }
            return {}

        await self.coord._transact("synthetic-large-fixture", {}, None, fill)
        async with self.client.post(
            self.origin + "/api/services/macromate/platform_backup?return_response",
            headers=self.headers(),
            json={},
        ) as response:
            self.assertEqual(response.status, 400)
        async with self.client.get(
            self.origin + "/api/macromate/backup", headers=self.headers()
        ) as response:
            self.assertEqual(response.status, 200)
            raw = await response.read()
            self.assertGreater(len(raw), 16777216)
            backup = json.loads(raw)
        payload = {
            "data": backup["data"],
            "confirm": True,
            "request_id": "http-restore",
        }
        async with self.client.post(
            self.origin + "/api/macromate/restore", headers=self.headers(), json=payload
        ) as response:
            self.assertEqual(response.status, 200, await response.text())
            self.assertTrue((await response.json())["restored"])
        self.assertEqual(
            self.coord.kitchen["preferences"]["synthetic-large"],
            backup["data"]["kitchen"]["preferences"]["synthetic-large"],
        )
        async with self.client.get(
            self.origin + "/api/macromate/backup", headers=self.headers(1)
        ) as response:
            self.assertEqual(response.status, 403)

    async def test_native_http_cross_domain_crud_and_independent_store_readback(self):
        from pathlib import Path

        async def api(action, payload):
            async with self.client.post(
                self.origin + "/api/services/macromate/" + action + "?return_response",
                headers=self.headers(),
                json=payload,
            ) as response:
                self.assertEqual(response.status, 200, await response.text())
                return (await response.json())["service_response"]

        recipe = (
            await api(
                "recipes_add",
                {
                    "name": "HTTP oats",
                    "servings": 1,
                    "ingredients": [{"name": "Oats", "amount": "40", "unit": "g"}],
                    "declared_nutrition": {"calories": 200},
                    "nutrition_basis": "per_serving",
                    "request_id": "http-recipe",
                },
            )
        )["recipe"]
        rid = recipe["id"]
        await api(
            "recipes_update",
            {"recipe_id": rid, "notes": "HTTP note", "request_id": "http-note"},
        )
        self.assertEqual(
            (await api("recipes_get", {"recipe_id": rid}))["recipe"]["notes"],
            "HTTP note",
        )
        plan = (
            await api(
                "meal_plan_add",
                {
                    "recipe_id": rid,
                    "date": "2026-10-14",
                    "meal_type": "lunch",
                    "request_id": "http-plan",
                },
            )
        )["entry"]
        await api(
            "meal_plan_update",
            {
                "entry_id": plan["id"],
                "date": "2026-10-15",
                "request_id": "http-plan-edit",
            },
        )
        self.assertEqual(
            (await api("meal_plan_get", {"entry_id": plan["id"]}))["entry"]["date"],
            "2026-10-15",
        )
        logged = await api(
            "recipe_log",
            {
                "recipe_id": rid,
                "servings": 1,
                "date": "2026-10-14",
                "meal_type": "lunch",
                "request_id": "http-log",
            },
        )
        await api(
            "recipe_entry_update",
            {"entry_id": logged["entry_id"], "servings": 2, "request_id": "http-scale"},
        )
        diary = await api("diary", {"date": "2026-10-14"})
        self.assertEqual(diary["entries"][0]["calories"], 400)
        raw = json.loads(
            (Path(self.tmp.name) / ".storage" / "macromate.meals").read_text()
        )
        self.assertEqual(raw["version"], 1)
        self.assertEqual(raw["data"]["schema"], 3)
        self.assertEqual(raw["data"]["entries"][0]["id"], logged["entry_id"])
        await api(
            "meal_plan_remove",
            {"entry_id": plan["id"], "request_id": "http-plan-delete"},
        )
        self.assertEqual(
            (await api("meal_plan_get", {"week_start": "2026-10-12"}))["entries"], []
        )
        await api(
            "recipes_delete", {"recipe_id": rid, "request_id": "http-recipe-delete"}
        )
        self.assertEqual((await api("recipes_get_all", {}))["recipes"], [])
        self.assertEqual(
            (await api("diary", {"date": "2026-10-14"}))["entries"][0][
                "recipe_snapshot"
            ]["id"],
            rid,
        )
        await api(
            "delete_meal",
            {"entry_id": logged["entry_id"], "request_id": "http-diary-delete"},
        )
        self.assertEqual((await api("diary", {"date": "2026-10-14"}))["entries"], [])

    async def test_native_authenticated_websocket_commands_and_subscription(self):
        async with self.client.ws_connect(self.origin + "/api/websocket") as ws:
            self.assertEqual((await ws.receive_json())["type"], "auth_required")
            await ws.send_json({"type": "auth", "access_token": self.tokens[0][1]})
            self.assertEqual((await ws.receive_json())["type"], "auth_ok")
            await ws.send_json(
                {
                    "id": 1,
                    "type": "macromate/command",
                    "action": "describe",
                    "payload": {},
                }
            )
            discovery = await ws.receive_json()
            self.assertTrue(discovery["success"])
            self.assertIn("recipe_log", discovery["result"]["actions"])
            await ws.send_json({"id": 2, "type": "macromate/subscribe"})
            self.assertTrue((await ws.receive_json())["success"])
            await ws.send_json(
                {
                    "id": 3,
                    "type": "macromate/command",
                    "action": "recipes_add",
                    "payload": {"name": "WS recipe", "request_id": "ws-create"},
                }
            )
            messages = [await ws.receive_json(), await ws.receive_json()]
            result = next(m for m in messages if m["type"] == "result")
            event = next(m for m in messages if m["type"] == "event")
            self.assertEqual(event["event"], {"event": "refresh"})
            self.assertIn(
                result["result"]["recipe"]["id"], self.coord.kitchen["recipes"]
            )
