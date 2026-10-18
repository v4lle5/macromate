"""Deadline delivery without a browser, including replay of a durable outbox."""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch
import unittest

from homeassistant.components import persistent_notification

from custom_components.macromate.coordinator import MealTrackerCoordinator
from custom_components.macromate.timer_notifications import TimerNotifications, fingerprint
import test_unified_http as native


class TimerNotificationTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers

    async def timer(self):
        result = await self.coord.async_command("global_timers_add", {
            "label": "Synthetic timer", "duration": 1,
            "start_time": datetime.now(timezone.utc).timestamp() - 2,
        })
        return result["timer"]

    async def test_expired_timer_notifies_without_frontend_and_deduplicates_after_restart(self):
        timer = await self.timer()
        notifications = []
        events = []
        unsubscribe = self.hass.bus.async_listen("macromate_timer_finished", lambda event: events.append(event.data))
        original = persistent_notification.async_create

        def observed(*args, **kwargs):
            notifications.append(kwargs["notification_id"])
            return original(*args, **kwargs)

        manager = TimerNotifications(self.coord)
        manager.active = True
        with patch.object(persistent_notification, "async_create", observed):
            await manager.expire(timer["id"], fingerprint(timer))
            restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
            await restarted.async_load()
            fresh = TimerNotifications(restarted)
            fresh.active = True
            await fresh.expire(timer["id"], fingerprint(timer))
        unsubscribe()
        await self.hass.async_block_till_done()
        self.assertEqual(len(notifications), 1)
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["event_id"], fingerprint(timer))
        self.assertTrue(restarted.timer_receipts[timer["id"]]["delivered"])

    async def test_committed_pending_outbox_is_replayed_with_stable_notification_id(self):
        timer = await self.timer()
        digest = fingerprint(timer)

        def pending(state):
            state["timer_receipts"] = {timer["id"]: {"fingerprint": digest, "delivered": False}}
            return {}

        await self.coord._transact("synthetic_outbox", {}, None, pending)
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        await restarted.async_load()
        manager = TimerNotifications(restarted)
        manager.active = True
        with patch.object(persistent_notification, "async_create") as notify:
            await manager.expire(timer["id"], digest)
            self.assertEqual(notify.call_args.kwargs["notification_id"], "macromate_timer_" + digest)
        self.assertTrue(restarted.timer_receipts[timer["id"]]["delivered"])

    async def test_cancelled_or_restarted_timer_does_not_deliver_old_deadline(self):
        timer = await self.timer()
        manager = TimerNotifications(self.coord)
        manager.active = True
        await self.coord.async_command("global_timers_update", {"timer_id": timer["id"], "running": False})
        with self.assertRaises(ValueError):
            await manager.expire(timer["id"], fingerprint(timer))
        self.assertEqual(self.coord.timer_receipts, {})

    async def test_native_scheduled_deadline_runs_and_unload_cancels_future_timer(self):
        timer = await self.timer()
        manager = TimerNotifications(self.coord)
        fired = asyncio.Event()
        async def on_finished(event):
            fired.set()

        unsubscribe = self.hass.bus.async_listen("macromate_timer_finished", on_finished)
        manager.start()
        try:
            await asyncio.wait_for(fired.wait(), 3)
            await self.hass.async_block_till_done()
            self.assertTrue(self.coord.timer_receipts[timer["id"]]["delivered"])
            future = (await self.coord.async_command("global_timers_add", {"label": "Future", "duration": 600}))["timer"]
            self.assertIn(future["id"], manager.scheduled)
        finally:
            manager.stop()
            unsubscribe()
        self.assertEqual(manager.scheduled, {})

    async def test_failed_delivery_retries_and_unload_cancels_retry(self):
        await self.timer()
        manager = TimerNotifications(self.coord)
        deadlines, retries = [], []
        cancel = Mock()
        def schedule(_hass, callback, _deadline):
            deadlines.append(callback)
            return Mock()
        def retry(_hass, delay, callback):
            self.assertEqual(delay, 30)
            retries.append(callback)
            return cancel
        with patch('custom_components.macromate.timer_notifications.async_track_point_in_utc_time', schedule), \
             patch('custom_components.macromate.timer_notifications.async_call_later', retry), \
             patch.object(manager, 'expire', AsyncMock(side_effect=OSError('synthetic disk failure'))):
            manager.start()
            with self.assertLogs('custom_components.macromate.timer_notifications', level='ERROR'):
                await deadlines[-1](None)
            self.assertEqual(len(retries), 1)
            self.assertEqual(manager.scheduled, {})
            retries[-1](None)
            self.assertEqual(len(deadlines), 2)
            with self.assertLogs('custom_components.macromate.timer_notifications', level='ERROR'):
                await deadlines[-1](None)
            manager.stop()
            cancel.assert_called_once()

    async def test_edit_during_expiry_preserves_the_replacement_deadline(self):
        timer = await self.timer()
        manager = TimerNotifications(self.coord)
        deadlines = []
        def schedule(_hass, callback, _deadline):
            deadlines.append(callback)
            return Mock()
        async def edit(*_args):
            await self.coord.async_command('global_timers_update', {
                'timer_id': timer['id'], 'duration': 600,
            })
            raise ValueError('old deadline no longer applies')
        with patch('custom_components.macromate.timer_notifications.async_track_point_in_utc_time', schedule), \
             patch.object(manager, 'expire', edit):
            manager.start()
            await deadlines[0](None)
            self.assertEqual(len(deadlines), 2)
            self.assertEqual(manager.scheduled[timer['id']][0], fingerprint(self.coord.kitchen['timers'][timer['id']]))
            manager.stop()
