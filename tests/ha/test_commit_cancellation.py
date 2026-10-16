"""Cancellation at the native atomic Store boundary must not reorder commits."""

import asyncio
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch

from homeassistant.core import HomeAssistant

from custom_components.macromate.const import EVENT_UPDATED
from custom_components.macromate.coordinator import MealTrackerCoordinator
from custom_components.macromate.platform_support import Actor


TIMEOUT = 10
SETTINGS = {"weight_entity": None, "active_calories_entity": None}
OWNER = Actor("owner", is_admin=True)
MEMBER = Actor("member")
FIRST = {"name": "Cancelled A", "request_id": "cancelled-a"}
SECOND = {"name": "Acknowledged B", "request_id": "acknowledged-b"}


class ObservedLock(asyncio.Lock):
    """Expose acquisition attempts without relying on wall-clock sleeps."""

    def __init__(self):
        super().__init__()
        self.attempts = asyncio.Queue()

    async def acquire(self):
        self.attempts.put_nowait(None)
        return await super().acquire()


class WriteGate:
    """Pause the first call before running the real Store/staging function."""

    def __init__(self, original):
        self.original = original
        self.entered = threading.Event()
        self.release = threading.Event()
        self.settled = threading.Event()
        self.calls = 0
        self._counter_lock = threading.Lock()

    def __call__(self, *args, **kwargs):
        with self._counter_lock:
            self.calls += 1
            first = self.calls == 1
        if not first:
            return self.original(*args, **kwargs)
        self.entered.set()
        try:
            if not self.release.wait(TIMEOUT):
                raise TimeoutError("test did not release the gated executor job")
            return self.original(*args, **kwargs)
        finally:
            self.settled.set()


async def loop_barrier():
    """Let already-scheduled cancellation delivery run, without a timing sleep."""
    future = asyncio.get_running_loop().create_future()
    asyncio.get_running_loop().call_soon(future.set_result, None)
    await future


class CommitCancellationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR"))
        self.hass = HomeAssistant(self.tmp.name)
        self.coord = MealTrackerCoordinator(self.hass, SETTINGS)
        self.tasks = []
        self.gates = []

    async def asyncTearDown(self):
        try:
            for gate in self.gates:
                gate.release.set()
            if self.tasks:
                await asyncio.wait_for(
                    asyncio.gather(*self.tasks, return_exceptions=True), TIMEOUT
                )
            for gate in self.gates:
                if gate.entered.is_set():
                    self.assertTrue(await asyncio.to_thread(gate.settled.wait, TIMEOUT))
        finally:
            await self.hass.async_stop(force=True)
            self.tmp.cleanup()

    async def api(self, action, payload, actor=OWNER):
        return await self.coord.async_command(action, payload, actor=actor)

    def spawn(self, coroutine):
        task = asyncio.create_task(coroutine)
        self.tasks.append(task)
        return task

    async def thread_event(self, event):
        self.assertTrue(await asyncio.to_thread(event.wait, TIMEOUT))

    def disk(self):
        return json.loads(Path(self.coord._store.path).read_text())["data"]

    async def test_cancelled_write_settles_before_later_mutations_and_preserves_history(self):
        # This test must import the working tree, never the preserved review snapshot.
        import custom_components.macromate.coordinator as live

        self.assertEqual(
            Path(live.__file__).resolve(),
            Path(__file__).resolve().parents[2]
            / "custom_components/macromate/coordinator.py",
        )
        from historical_shopping_fixture import historical_shopping
        created = await historical_shopping(self.coord, 'shopping_lists_create', {'name': 'Historical private'}, OWNER)
        lid = created['list']['id']
        member_payload = {'list_id': lid, 'name': 'No longer callable', 'request_id': 'member-write'}
        before = self.coord._state()
        gate = WriteGate(self.coord._store._write_prepared_data)
        self.gates.append(gate)
        self.coord._lock = ObservedLock()
        publications = []
        notifications = []
        bus_type = type(self.hass.bus)
        fire = bus_type.async_fire

        def published(bus, event_type, *args, **kwargs):
            if bus is self.hass.bus and event_type == EVENT_UPDATED:
                publications.append((
                    self.coord._state(), self.disk(),
                    self.coord._lock.locked(), gate.settled.is_set(),
                ))
            return fire(bus, event_type, *args, **kwargs)

        self.coord.async_add_listener(
            lambda: notifications.append((self.coord._state(), self.coord._lock.locked()))
        )
        write_patch = patch.object(self.coord._store, "_write_prepared_data", gate)
        write_patch.start()
        self.addCleanup(write_patch.stop)
        with patch.object(bus_type, "async_fire", published):
            first = self.spawn(self.api("recipes_add", FIRST))
            await asyncio.wait_for(self.coord._lock.attempts.get(), TIMEOUT)
            await self.thread_event(gate.entered)
            for _ in range(3):
                self.assertTrue(first.cancel())
                await loop_barrier()
                self.assertFalse(
                    first.done(),
                    "cancel released a transaction with a disk write still running",
                )
                self.assertTrue(self.coord._lock.locked())
                self.assertTrue(self.coord._store._write_lock.locked())
            second = self.spawn(self.api("recipes_add", SECOND))
            await asyncio.wait_for(self.coord._lock.attempts.get(), TIMEOUT)
            revoked = self.spawn(self.api(
                "preferences_update",
                {"preferences": {"language": "de"}, "request_id": "preferences"},
            ))
            await asyncio.wait_for(self.coord._lock.attempts.get(), TIMEOUT)
            self.assertFalse(second.done())
            self.assertFalse(revoked.done())
            self.assertEqual(gate.calls, 1)
            self.assertEqual(self.coord._state(), before)
            self.assertEqual(self.disk(), before)
            self.assertEqual(publications, [])
            self.assertEqual(notifications, [])
            gate.release.set()
            with self.assertRaises(asyncio.CancelledError):
                await asyncio.wait_for(first, TIMEOUT)
            acknowledged = await asyncio.wait_for(second, TIMEOUT)
            await asyncio.wait_for(revoked, TIMEOUT)

        await self.thread_event(gate.settled)
        final = self.coord._state()
        self.assertEqual(self.disk(), final)
        self.assertEqual(
            {r["name"] for r in final["kitchen"]["recipes"].values()},
            {FIRST["name"], SECOND["name"]},
        )
        self.assertEqual(final["kitchen"]["shopping_lists"][lid]["allowed_users"], [])
        ids = [row["request_id"] for row in final["ledger"]]
        for request_id in (
            "owner:cancelled-a", "owner:acknowledged-b", "owner:preferences"
        ):
            self.assertEqual(ids.count(request_id), 1)
        self.assertEqual(len(publications), 3)
        self.assertTrue(all(locked and settled for _, _, locked, settled in publications))
        self.assertTrue(all(state == durable for state, durable, _, _ in publications))
        self.assertTrue(all(locked for _, locked in notifications))
        self.assertEqual(
            [state for state, _, _, _ in publications],
            [state for state, _ in notifications],
        )
        self.assertEqual(
            {r["name"] for r in publications[0][0]["kitchen"]["recipes"].values()},
            {FIRST["name"]},
        )
        self.assertEqual(publications[-1][0], final)
        self.assertEqual(await self.api("recipes_add", SECOND), acknowledged)
        replay_first = await self.api("recipes_add", FIRST)
        self.assertEqual(replay_first["recipe"]["name"], FIRST["name"])
        with self.assertRaises((ValueError, PermissionError)):
            await self.api("shopping_items_get", {"list_id": lid}, MEMBER)
        with self.assertRaises((ValueError, PermissionError)):
            await self.api("shopping_items_add", member_payload, MEMBER)
        self.assertEqual(self.coord._state(), final)
        self.assertEqual(self.disk(), final)
        self.assertEqual(
            gate.calls, 3, "replay must not write or append a second ledger record"
        )
        self.assertEqual(len(notifications), 3, "replay must not publish again")

        # A separate interpreter rules out a warm Store cache masking disk corruption.
        result = await asyncio.wait_for(
            asyncio.to_thread(
                subprocess.run,
                [
                    sys.executable, str(Path(__file__).resolve()),
                    "--read-store", self.tmp.name, lid,
                ],
                cwd=Path(__file__).resolve().parents[2],
                env={**os.environ, "PYTHONPATH": str(Path(__file__).resolve().parents[2])},
                text=True,
                capture_output=True,
                timeout=TIMEOUT,
            ),
            TIMEOUT + 2,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout), final)

    async def test_cancelled_atomic_write_failure_never_adopts_or_acknowledges(self):
        loop = asyncio.get_running_loop()
        unhandled = []
        self.addCleanup(loop.set_exception_handler, loop.get_exception_handler())
        loop.set_exception_handler(lambda _loop, context: unhandled.append(context))
        await self.api("recipes_add", {"name": "Existing durable recipe"})
        before = self.coord._state()
        gate = WriteGate(self.coord._store._write_prepared_data)
        self.gates.append(gate)
        notifications = []
        self.coord.async_add_listener(lambda: notifications.append(self.coord._state()))
        events = []
        unsubscribe = self.hass.bus.async_listen(
            EVENT_UPDATED, lambda event: events.append(event.data)
        )
        self.addCleanup(unsubscribe)
        with (
            patch.object(self.coord._store, "_write_prepared_data", gate),
            # Real Store serialization/temp-file writing runs, but atomic replace
            # fails. HA's WriteError must emerge as OSError, not a successful save.
            patch(
                "homeassistant.util.file.AtomicWriter.commit",
                side_effect=OSError("synthetic atomic replace failure"),
            ),
            self.assertLogs("homeassistant.util.file", level="ERROR"),
        ):
            first = self.spawn(self.api("recipes_add", FIRST))
            await self.thread_event(gate.entered)
            for _ in range(3):
                first.cancel()
                await loop_barrier()
                self.assertFalse(first.done())
                self.assertTrue(self.coord._lock.locked())
                self.assertTrue(self.coord._store._write_lock.locked())
            gate.release.set()
            # A real storage failure takes precedence over deferred cancellation.
            with self.assertRaisesRegex(OSError, "atomic storage write failed"):
                await asyncio.wait_for(first, TIMEOUT)
        await self.thread_event(gate.settled)
        await self.hass.async_block_till_done()
        self.assertFalse(self.coord._lock.locked())
        self.assertFalse(self.coord._store._write_lock.locked())
        self.assertEqual(self.coord._state(), before)
        self.assertEqual(self.disk(), before)
        self.assertEqual(notifications, [])
        self.assertEqual(events, [])
        self.assertEqual(
            unhandled, [],
            "a joined failed commit must not be reported as an unhandled background exception",
        )
        accepted = await self.api("recipes_add", FIRST)
        self.assertEqual(await self.api("recipes_add", FIRST), accepted)
        await self.api("recipes_add", SECOND)
        self.assertEqual(self.disk(), self.coord._state())
        self.assertEqual(
            sum(row["request_id"] == "owner:cancelled-a" for row in self.coord.ledger.to_list()),
            1,
        )

    async def test_cancellation_while_waiting_for_transaction_lock_does_not_write(self):
        await self.api("recipes_add", {"name": "Existing durable recipe"})
        before = self.coord._state()
        self.coord._lock = ObservedLock()
        gate = WriteGate(self.coord._store._write_prepared_data)
        self.gates.append(gate)
        with patch.object(self.coord._store, "_write_prepared_data", gate):
            async with self.coord._lock:
                await asyncio.wait_for(self.coord._lock.attempts.get(), TIMEOUT)
                first = self.spawn(self.api("recipes_add", FIRST))
                await asyncio.wait_for(self.coord._lock.attempts.get(), TIMEOUT)
                first.cancel()
                with self.assertRaises(asyncio.CancelledError):
                    await asyncio.wait_for(first, TIMEOUT)
                self.assertEqual(gate.calls, 0)
                self.assertEqual(self.coord._state(), before)
                self.assertEqual(self.disk(), before)
        accepted = await self.api("recipes_add", FIRST)
        self.assertEqual(await self.api("recipes_add", FIRST), accepted)
        self.assertEqual(self.disk(), self.coord._state())

    async def test_cancellation_during_staging_never_starts_a_durable_write(self):
        await self.api("recipes_add", {"name": "Existing durable recipe"})
        before = self.coord._state()
        notifications = []
        self.coord.async_add_listener(lambda: notifications.append(self.coord._state()))
        for phase in ("guard", "apply", "decode"):
            with self.subTest(phase=phase):
                def apply(state):
                    state["kitchen"]["preferences"]["synthetic"] = {
                        "ui": {"phase": phase}
                    }
                    return {"accepted": True}

                stage = {
                    "guard": lambda state: None,
                    "apply": apply,
                    "decode": self.coord._decode_state,
                }[phase]
                gate = WriteGate(stage)
                self.gates.append(gate)
                with (
                    patch.object(
                        self.coord, "_decode_state",
                        gate if phase == "decode" else self.coord._decode_state,
                    ),
                    patch.object(
                        self.coord._store, "_write_prepared_data",
                        wraps=self.coord._store._write_prepared_data,
                    ) as writes,
                ):
                    first = self.spawn(self.coord._transact(
                        "synthetic-stage", {"phase": phase}, "stage-" + phase,
                        gate if phase == "apply" else apply,
                        guard=gate if phase == "guard" else None,
                        executor=True,
                    ))
                    await self.thread_event(gate.entered)
                    try:
                        first.cancel()
                        with self.assertRaises(asyncio.CancelledError):
                            await asyncio.wait_for(first, TIMEOUT)
                        self.assertFalse(self.coord._lock.locked())
                    finally:
                        gate.release.set()
                        await self.thread_event(gate.settled)
                    writes.assert_not_called()
                self.assertEqual(self.coord._state(), before)
                self.assertEqual(self.disk(), before)
                self.assertEqual(notifications, [])
        accepted = await self.api("recipes_add", FIRST)
        self.assertEqual(await self.api("recipes_add", FIRST), accepted)
        self.assertEqual(self.disk(), self.coord._state())


async def read_restarted_store(config_dir, lid):
    hass = HomeAssistant(config_dir)
    try:
        coord = MealTrackerCoordinator(hass, SETTINGS)
        await coord.async_load()
        before = coord._state()
        for payload in (FIRST, SECOND):
            result = await coord.async_command("recipes_add", payload, actor=OWNER)
            assert result["recipe"]["name"] == payload["name"]
        for action, payload in (
            ("shopping_items_get", {"list_id": lid}),
            ("shopping_items_add", {
                "list_id": lid, "name": "Synthetic item", "request_id": "member-write"
            }),
        ):
            try:
                await coord.async_command(action, payload, actor=MEMBER)
            except (ValueError, PermissionError):
                pass
            else:
                raise AssertionError("revoked member retained access after restart")
        assert coord._state() == before
        print(json.dumps(before))
    finally:
        await hass.async_stop(force=True)


if __name__ == "__main__":
    if len(sys.argv) == 4 and sys.argv[1] == "--read-store":
        asyncio.run(read_restarted_store(sys.argv[2], sys.argv[3]))
    else:
        unittest.main()
