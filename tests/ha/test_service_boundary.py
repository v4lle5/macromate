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
        self.coord = MealTrackerCoordinator(
            self.hass, {"weight_entity": None, "active_calories_entity": None}
        )
        self.patch = patch.object(
            self.hass.config_entries,
            "async_loaded_entries",
            return_value=[SimpleNamespace(runtime_data=self.coord)],
        )
        self.patch.start()
        await async_setup(self.hass, {})

    async def asyncTearDown(self):
        self.patch.stop()
        await self.hass.async_stop(force=True)
        self.tmp.cleanup()

    async def call(self, name, data, context=None):
        return await self.hass.services.async_call(
            "macromate",
            name,
            data,
            blocking=True,
            return_response=True,
            context=context,
        )

    async def test_metadata_describes_every_registered_service_and_dependency(self):
        import json
        from pathlib import Path
        import yaml
        from custom_components.macromate import SERVICE_ACTIONS
        from custom_components.macromate.platform_api import ACTIONS

        root = Path(__file__).parents[2] / "custom_components" / "macromate"
        names = set(ACTIONS) | set(SERVICE_ACTIONS)
        metadata = yaml.safe_load((root / "services.yaml").read_text())
        self.assertEqual(set(metadata), names)
        for filename in (
            "strings.json",
            "translations/en.json",
            "translations/de.json",
        ):
            translations = json.loads((root / filename).read_text())["services"]
            self.assertEqual(set(translations), names)
        self.assertEqual(
            json.loads((root / "manifest.json").read_text())["requirements"],
            ["recipe-scrapers==15.12.0"],
        )

    async def test_native_subscription_filters_private_and_previous_audiences(self):
        from homeassistant.auth.const import GROUP_ID_USER

        owner = await self.hass.auth.async_create_user(
            "Owner", group_ids=[GROUP_ID_ADMIN]
        )
        member = await self.hass.auth.async_create_user(
            "Member", group_ids=[GROUP_ID_USER]
        )
        outsider = await self.hass.auth.async_create_user(
            "Other", group_ids=[GROUP_ID_USER]
        )

        class Connection:
            def __init__(self, user):
                self.user, self.events, self.subscriptions = user, [], {}

            def send_result(self, *args):
                pass

            def send_error(self, *args):
                self.events.append(args)

            def send_event(self, rid, data):
                self.events.append(data)

        peers = [Connection(user) for user in (owner, member, outsider)]
        handler, schema = self.hass.data["websocket_api"]["macromate/subscribe"]
        for index, connection in enumerate(peers):
            message = {"id": index + 1, "type": "macromate/subscribe"}
            handler(
                self.hass, connection, schema(message) if callable(schema) else message
            )
        await self.hass.async_block_till_done()
        lid = (
            await self.call(
                "shopping_lists_create", {"name": "Private"}, Context(user_id=owner.id)
            )
        )["list"]["id"]
        await self.call(
            "shopping_lists_update_members",
            {"list_id": lid, "allowed_users": [member.id]},
            Context(user_id=owner.id),
        )
        await self.hass.async_block_till_done()
        peers[1].events.clear()
        await self.call(
            "shopping_lists_update_members",
            {"list_id": lid, "allowed_users": []},
            Context(user_id=owner.id),
        )
        await self.hass.async_block_till_done()
        self.assertEqual(peers[1].events, [{"event": "refresh"}])
        self.assertEqual(peers[2].events, [])
        public_lid = (
            await self.call(
                "shopping_lists_create",
                {"name": "Public", "private": False},
                Context(user_id=owner.id),
            )
        )["list"]["id"]

        def publish(state):
            state["kitchen"]["shopping_lists"][public_lid]["owner_id"] = None
            return {}

        await self.coord._transact("synthetic-public-acl", {}, None, publish)
        await self.hass.async_block_till_done()
        peers[2].events.clear()
        await self.call(
            "shopping_items_add",
            {"list_id": public_lid, "name": "Visible"},
            Context(user_id=owner.id),
        )
        await self.hass.async_block_till_done()
        self.assertEqual(peers[2].events, [{"event": "refresh"}])
        for connection in peers:
            for cancel in connection.subscriptions.values():
                cancel()

    async def test_unified_native_registry_shared_acl_and_read_only_mutations(self):
        from homeassistant.auth.const import GROUP_ID_USER
        from homeassistant.exceptions import ServiceValidationError

        owner = await self.hass.auth.async_create_user(
            "Owner", group_ids=[GROUP_ID_ADMIN]
        )
        member = await self.hass.auth.async_create_user(
            "Member", group_ids=[GROUP_ID_USER]
        )
        reader = await self.hass.auth.async_create_user(
            "Reader", group_ids=[GROUP_ID_READ_ONLY]
        )
        discovery = await self.call("describe", {}, Context(user_id=member.id))
        services = self.hass.services.async_services()["macromate"]
        self.assertTrue(set(discovery["actions"]) <= set(services))
        lid = (
            await self.call(
                "shopping_lists_create", {"name": "Shared"}, Context(user_id=owner.id)
            )
        )["list"]["id"]
        await self.call(
            "shopping_lists_update_members",
            {"list_id": lid, "allowed_users": [member.id, reader.id]},
            Context(user_id=owner.id),
        )
        added = await self.call(
            "shopping_items_add",
            {"list_id": lid, "name": "Apple", "request_id": "member-item"},
            Context(user_id=member.id),
        )
        self.assertEqual(
            (
                await self.call(
                    "shopping_items_get_one",
                    {"item_id": added["item"]["id"]},
                    Context(user_id=member.id),
                )
            )["item"]["name"],
            "Apple",
        )
        with self.assertRaises(Unauthorized):
            await self.call(
                "shopping_items_add",
                {"list_id": lid, "name": "Denied"},
                Context(user_id=reader.id),
            )
        self.assertEqual(
            len(
                (
                    await self.call(
                        "shopping_items_get",
                        {"list_id": lid},
                        Context(user_id=reader.id),
                    )
                )["items"]
            ),
            1,
        )
        self.assertIn("macromate/subscribe", self.hass.data["websocket_api"])

    async def test_native_transports_pass_only_server_derived_actor(self):
        owner = await self.hass.auth.async_create_user(
            "Synthetic owner", group_ids=[GROUP_ID_ADMIN]
        )
        original = self.coord.async_command
        seen = []

        async def observed(action, payload, **kwargs):
            seen.append(kwargs.get("actor"))
            return await original(action, payload, **kwargs)

        self.coord.async_command = observed
        await self.call("list_meals", {}, Context(user_id=owner.id))
        self.assertIsNotNone(seen[-1])
        self.assertEqual(seen[-1].user_id, owner.id)
        self.assertTrue(seen[-1].is_admin)
        self.assertFalse(seen[-1].trusted_internal)
        await self.call("list_meals", {})
        self.assertIsNone(seen[-1].user_id)
        self.assertTrue(seen[-1].trusted_internal)

        class Connection:
            user = owner
            result = None

            def send_error(self, request_id, code, message):
                self.result = {"error": code}

            def send_result(self, request_id, result):
                self.result = result

        connection = Connection()
        handler, schema = self.hass.data["websocket_api"]["macromate/command"]
        handler(
            self.hass,
            connection,
            schema({"id": 1, "type": "macromate/command", "action": "diary"}),
        )
        await self.hass.async_block_till_done()
        self.assertEqual(connection.result["entries"], [])
        self.assertEqual(seen[-1].user_id, owner.id)
        self.assertFalse(seen[-1].trusted_internal)

    async def test_food_actions_share_websocket_contract_and_explicit_clear(self):
        food = (
            await self.call(
                "save_food",
                {
                    "food": {
                        "name": "Synthetic service food",
                        "base_unit": "g",
                        "nutrients_per_100": {"calories": 200},
                    },
                    "request_id": "servicefood",
                },
            )
        )["food"]
        entry = await self.call(
            "log_food",
            {
                "food_id": food["food_id"],
                "amount": 150,
                "meal_type": "lunch",
                "date": "2026-10-14",
                "request_id": "servicelog",
            },
        )
        diary = await self.call("list_meals", {"date": "2026-10-14"})
        self.assertEqual(diary["totals"]["calories"], 300)
        self.assertIn("meals", diary)
        from homeassistant.exceptions import ServiceValidationError

        with self.assertRaises(ServiceValidationError):
            await self.call("clear_day", {"date": "2026-10-14"})
        self.assertEqual(
            await self.call(
                "clear_day",
                {"date": "2026-10-14", "confirm": True, "request_id": "serviceclear"},
            ),
            {"removed": 1},
        )

    async def test_private_websocket_command_registered_and_rejects_read_only(self):
        self.assertIn("macromate/command", self.hass.data.get("websocket_api", {}))
        await self.hass.auth.async_create_user(
            "Synthetic owner", group_ids=[GROUP_ID_ADMIN]
        )
        reader = await self.hass.auth.async_create_user(
            "Synthetic reader", group_ids=[GROUP_ID_READ_ONLY]
        )

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
            handler(
                self.hass,
                connection,
                schema({"id": 1, "type": "macromate/command", "action": "diary"}),
            )

    async def test_read_only_user_cannot_read_or_mutate_private_nutrition(self):
        await self.hass.auth.async_create_user(
            "Synthetic owner", group_ids=[GROUP_ID_ADMIN]
        )
        reader = await self.hass.auth.async_create_user(
            "Synthetic reader", group_ids=[GROUP_ID_READ_ONLY]
        )
        self.assertFalse(reader.is_admin)
        for name, data in (
            ("list_meals", {}),
            ("log_meal", {"name": "Test", "meal_type": "lunch", "calories": 1}),
        ):
            with self.subTest(name=name), self.assertRaises(Unauthorized):
                await self.call(name, data, Context(user_id=reader.id))


if __name__ == "__main__":
    unittest.main()
