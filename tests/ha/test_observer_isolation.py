"""Post-commit synchronous observers cannot change durable command acceptance."""

import asyncio
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from custom_components.macromate.const import EVENT_UPDATED
from custom_components.macromate.coordinator import MealTrackerCoordinator
from custom_components.macromate.platform_support import Actor


SETTINGS = {"weight_entity": None, "active_calories_entity": None}
OWNER = Actor("owner", is_admin=True)
LOGGER = "custom_components.macromate.coordinator"


class ObserverIsolationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR"))
        self.hass = HomeAssistant(self.tmp.name)
        self.coord = MealTrackerCoordinator(self.hass, SETTINGS)

    async def asyncTearDown(self):
        await self.hass.async_stop(force=True)
        self.tmp.cleanup()

    async def api(self, action, payload):
        return await self.coord.async_command(action, payload, actor=OWNER)

    def disk(self):
        return json.loads(Path(self.coord._store.path).read_text())["data"]

    async def test_throwing_first_observer_preserves_acceptance_readback_and_replay(self):
        self.assertIsInstance(self.coord._store, Store)
        payload = {"name": "Synthetic observer recipe", "request_id": "observer-create"}
        attempted = []
        notifications = []
        publications = []
        bus_type = type(self.hass.bus)
        fire = bus_type.async_fire

        def published(bus, event_type, *args, **kwargs):
            if bus is self.hass.bus and event_type == EVENT_UPDATED:
                publications.append((self.coord._state(), self.disk(), self.coord._lock.locked()))
            return fire(bus, event_type, *args, **kwargs)

        def broken():
            attempted.append(self.coord._state())
            raise RuntimeError("SYNTHETIC_PRIVATE_CALLBACK_PAYLOAD_TOKEN")

        self.coord.async_add_listener(broken)
        self.coord.async_add_listener(
            lambda: notifications.append((self.coord._state(), self.disk(), self.coord._lock.locked()))
        )
        with (
            patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as saves,
            patch.object(bus_type, "async_fire", published),
        ):
            errors = []
            try:
                with self.assertLogs(LOGGER, level="ERROR") as captured:
                    accepted = await self.api("recipes_add", payload)
            except RuntimeError as error:
                errors.append(type(error).__name__)
            # Assert the real save/adoption boundary even in the original RED case.
            durable = self.disk()
            self.assertEqual(durable, self.coord._state())
            self.assertEqual(len(durable["kitchen"]["recipes"]), 1)
            self.assertEqual(len(durable["ledger"]), 1)
            self.assertEqual(saves.call_count, 1)
            self.assertEqual(errors, [], "a post-commit observer failure must not reject an accepted command")
            rid = accepted["recipe"]["id"]
            self.assertEqual(durable["kitchen"]["recipes"][rid], accepted["recipe"])
            self.assertEqual(durable["ledger"][0]["request_id"], "owner:observer-create")
            self.assertEqual(durable["ledger"][0]["result"]["__result"], accepted)
            self.assertEqual(attempted, [durable])
            self.assertEqual(notifications, [(durable, durable, True)])
            self.assertEqual(publications, [(durable, durable, True)])
            self.assertEqual(len(captured.records), 1)
            for record in captured.records:
                self.assertIsNone(record.exc_info)
                self.assertIsNone(record.stack_info)
                self.assertNotIn("SYNTHETIC_PRIVATE", record.getMessage())
                self.assertNotIn(payload["name"], record.getMessage())
                self.assertNotIn(payload["request_id"], record.getMessage())
            self.assertEqual(await self.api("recipes_get", {"recipe_id": rid}), accepted)
            self.assertEqual(await self.api("recipes_add", payload), accepted)
            self.assertEqual(saves.call_count, 1)
            self.assertEqual(len(notifications), 1)
            self.assertEqual(len(publications), 1)

            update = {"recipe_id": rid, "notes": "Later durable note", "request_id": "observer-update"}
            with self.assertLogs(LOGGER, level="ERROR"):
                updated = await self.api("recipes_update", update)
            final = self.disk()
            self.assertEqual(final, self.coord._state())
            self.assertEqual(final["kitchen"]["recipes"][rid], updated["recipe"])
            self.assertEqual(len(final["ledger"]), 2)
            self.assertEqual(saves.call_count, 2)
            self.assertEqual(attempted, [durable, final])
            self.assertEqual(notifications, [(durable, durable, True), (final, final, True)])
            self.assertEqual(publications, notifications)
            self.assertEqual(await self.api("recipes_update", update), updated)
            self.assertEqual(await self.api("recipes_add", payload), accepted)
            self.assertEqual(await self.api("recipes_get", {"recipe_id": rid}), updated)
            self.assertEqual(saves.call_count, 2)
            self.assertEqual(len(publications), 2)
            self.assertEqual(len(notifications), 2)
            self.assertEqual(self.disk(), final)

        # A fresh HA/Store instance has no warm in-memory Store cache.
        restarted_hass = HomeAssistant(self.tmp.name)
        try:
            restarted = MealTrackerCoordinator(restarted_hass, SETTINGS)
            await restarted.async_load()
            self.assertEqual(restarted._state(), final)
            with patch.object(restarted._store, "async_save", wraps=restarted._store.async_save) as saves:
                self.assertEqual(await restarted.async_command("recipes_add", payload, actor=OWNER), accepted)
                self.assertEqual(await restarted.async_command("recipes_update", update, actor=OWNER), updated)
                self.assertEqual(
                    await restarted.async_command("recipes_get", {"recipe_id": rid}, actor=OWNER), updated
                )
                saves.assert_not_called()
            self.assertEqual(restarted._state(), final)
            self.assertEqual(self.disk(), final)
        finally:
            await restarted_hass.async_stop(force=True)

    async def test_atomic_save_failure_still_rejects_without_observer_delivery(self):
        await self.api("recipes_add", {"name": "Existing durable recipe"})
        before = self.disk()
        attempted = []
        notifications = []
        events = []

        def broken():
            attempted.append(True)
            raise RuntimeError("SYNTHETIC_PRIVATE_CALLBACK_PAYLOAD_TOKEN")

        self.coord.async_add_listener(broken)
        self.coord.async_add_listener(lambda: notifications.append(self.coord._state()))
        unsubscribe = self.hass.bus.async_listen(EVENT_UPDATED, lambda event: events.append(event.data))
        self.addCleanup(unsubscribe)
        payload = {"name": "Failed then accepted recipe", "request_id": "observer-save-failure"}
        with (
            patch("homeassistant.util.file.AtomicWriter.commit", side_effect=OSError("synthetic write failure")),
            self.assertLogs("homeassistant.util.file", level="ERROR"),
            self.assertNoLogs(LOGGER, level="ERROR"),
        ):
            with self.assertRaisesRegex(OSError, "atomic storage write failed"):
                await self.api("recipes_add", payload)
        await self.hass.async_block_till_done()
        self.assertEqual(self.disk(), before)
        self.assertEqual(self.coord._state(), before)
        self.assertEqual(attempted, [])
        self.assertEqual(notifications, [])
        self.assertEqual(events, [])
        self.assertFalse(self.coord._lock.locked())
        self.assertFalse(self.coord._store._write_lock.locked())
        with self.assertLogs(LOGGER, level="ERROR"):
            accepted = await self.api("recipes_add", payload)
        self.assertEqual(await self.api("recipes_add", payload), accepted)
        await self.hass.async_block_till_done()
        self.assertEqual(len(attempted), 1)
        self.assertEqual(notifications, [self.disk()])
        self.assertEqual(len(events), 1)
        self.assertEqual(self.disk(), self.coord._state())
        self.assertEqual(sum(row["request_id"] == "owner:observer-save-failure" for row in self.disk()["ledger"]), 1)

    async def test_precommit_staging_errors_are_not_observer_errors(self):
        await self.api("recipes_add", {"name": "Existing durable recipe"})
        before = self.disk()
        notifications = []
        self.coord.async_add_listener(lambda: notifications.append(True))

        def fail(state):
            raise RuntimeError("synthetic staging failure")

        def malformed(state):
            state["schema"] = 99
            return {}

        with (
            patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as saves,
            self.assertNoLogs(LOGGER, level="ERROR"),
        ):
            for apply, guard, error in ((fail, None, RuntimeError), (lambda state: {}, fail, RuntimeError), (malformed, None, ValueError)):
                with self.subTest(error=error, guard=guard is not None):
                    with self.assertRaises(error):
                        await self.coord._transact("synthetic-invalid-stage", {}, "invalid-stage", apply, guard=guard)
                    self.assertEqual(self.coord._state(), before)
                    self.assertEqual(self.disk(), before)
                    self.assertFalse(self.coord._lock.locked())
            saves.assert_not_called()
        self.assertEqual(notifications, [])

    async def test_cancelled_durable_commit_joins_and_notifies_past_throwing_observer(self):
        import test_commit_cancellation as cancellation

        await self.api("recipes_add", {"name": "Existing durable recipe"})
        before = self.disk()
        gate = cancellation.WriteGate(self.coord._store._write_prepared_data)
        notifications = []
        attempted = []
        events = []

        def broken():
            attempted.append(self.coord._state())
            raise RuntimeError("SYNTHETIC_PRIVATE_CALLBACK_PAYLOAD_TOKEN")

        self.coord.async_add_listener(broken)
        self.coord.async_add_listener(lambda: notifications.append((self.coord._state(), self.disk(), self.coord._lock.locked())))
        unsubscribe = self.hass.bus.async_listen(EVENT_UPDATED, lambda event: events.append(event.data))
        self.addCleanup(unsubscribe)
        payload = {"name": "Cancelled observer recipe", "request_id": "observer-cancelled"}
        first = None
        try:
            with (
                patch.object(self.coord._store, "_write_prepared_data", gate),
                self.assertLogs(LOGGER, level="ERROR"),
            ):
                first = asyncio.create_task(self.api("recipes_add", payload))
                self.assertTrue(await asyncio.to_thread(gate.entered.wait, cancellation.TIMEOUT))
                for _ in range(3):
                    self.assertTrue(first.cancel())
                    await cancellation.loop_barrier()
                    self.assertFalse(first.done())
                    self.assertTrue(self.coord._lock.locked())
                    self.assertEqual(self.disk(), before)
                    self.assertEqual(self.coord._state(), before)
                    self.assertEqual(notifications, [])
                gate.release.set()
                with self.assertRaises(asyncio.CancelledError):
                    await asyncio.wait_for(first, cancellation.TIMEOUT)
            await self.hass.async_block_till_done()
            final = self.disk()
            self.assertEqual(self.coord._state(), final)
            self.assertEqual(attempted, [final])
            self.assertEqual(notifications, [(final, final, True)])
            self.assertEqual(len(events), 1)
            self.assertFalse(self.coord._lock.locked())
            self.assertFalse(self.coord._store._write_lock.locked())
            rid = next(rid for rid in final["kitchen"]["recipes"] if rid not in before["kitchen"]["recipes"])
            accepted = await self.api("recipes_add", payload)
            self.assertEqual(accepted["recipe"], final["kitchen"]["recipes"][rid])
            self.assertEqual(await self.api("recipes_get", {"recipe_id": rid}), accepted)
            self.assertEqual(gate.calls, 1)
            self.assertEqual(len(final["ledger"]), 1)
            self.assertEqual(final["ledger"][0]["request_id"], "owner:observer-cancelled")
            self.assertEqual(len(notifications), 1)
            self.assertEqual(len(events), 1)
            self.assertEqual(self.disk(), final)
        finally:
            gate.release.set()
            if first is not None:
                await asyncio.wait_for(asyncio.gather(first, return_exceptions=True), cancellation.TIMEOUT)
            if gate.entered.is_set():
                self.assertTrue(await asyncio.to_thread(gate.settled.wait, cancellation.TIMEOUT))


class NativeHTTPFixtureIsolationTests(unittest.IsolatedAsyncioTestCase):
    async def test_native_fixture_never_attempts_production_port_binding(self):
        from homeassistant.components.http import HomeAssistantHTTP
        import test_unified_http as native

        fixture = native.NativeHTTPTests("test_native_authenticated_websocket_commands_and_subscription")
        binds = []
        bind = HomeAssistantHTTP.async_bind

        async def guarded_bind(server):
            # Fail before any real production-port bind; never occupy the user's
            # live HA port even briefly to simulate a port collision.
            self.assertNotEqual(server.server_port, 8123, "production port must not be allocated at setup")
            self.assertEqual(server.server_port, 0)
            self.assertEqual(server.server_host, ["127.0.0.1"])
            await bind(server)
            addresses = [sock.getsockname() for sock in server._server.sockets]
            self.assertTrue(addresses)
            self.assertTrue(all(address[0] == "127.0.0.1" for address in addresses))
            self.assertTrue(all(address[1] not in (0, 8123) for address in addresses))
            binds.append((server, addresses))

        try:
            with patch.object(HomeAssistantHTTP, "async_bind", guarded_bind):
                await fixture.asyncSetUp()
                self.assertEqual(len(binds), 1, "native dependencies must not replace the server")
                self.assertIs(fixture.hass.http, binds[0][0])
                self.assertEqual(fixture.origin, f"http://127.0.0.1:{binds[0][1][0][1]}")
                # Prove native auth/API is served, not only that a socket exists.
                async with fixture.client.get(fixture.origin + "/api/", headers=fixture.headers()) as response:
                    self.assertEqual(response.status, 200)
                    self.assertEqual((await response.json())["message"], "API running.")
        finally:
            if hasattr(fixture, "client"):
                await fixture.asyncTearDown()
            elif hasattr(fixture, "hass"):
                await native.boundary.ServiceBoundaryTests.asyncTearDown(fixture)
