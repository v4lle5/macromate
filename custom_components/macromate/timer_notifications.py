"""Native HA timer deadlines and a durable, idempotent notification outbox."""

from __future__ import annotations

import hashlib
import logging
import re
from datetime import UTC, datetime

from homeassistant.core import callback
from homeassistant.helpers.event import async_call_later, async_track_point_in_utc_time

LOGGER = logging.getLogger(__name__)


def fingerprint(timer):
    return hashlib.sha256(
        f"{timer['id']}:{timer['start_time']}:{timer['duration']}".encode()
    ).hexdigest()


def validate_receipts(rows):
    if not isinstance(rows, dict) or len(rows) > 1000:
        raise ValueError("invalid timer notification history")
    for key, row in rows.items():
        if (
            not isinstance(key, str)
            or not 1 <= len(key) <= 128
            or not isinstance(row, dict)
            or set(row) != {"fingerprint", "delivered"}
            or not isinstance(row["fingerprint"], str)
            or re.fullmatch("[0-9a-f]{64}", row["fingerprint"]) is None
            or type(row["delivered"]) is not bool
        ):
            raise ValueError("invalid timer notification receipt")
    return rows


class TimerNotifications:
    def __init__(self, coordinator):
        self.coord = coordinator
        self.hass = coordinator.hass
        self.scheduled = {}
        self.active = False
        self.retry_cancel = None

    @callback
    def start(self):
        self.active = True
        self.unsubscribe = self.coord.async_add_listener(self.changed)
        self.changed()

    @callback
    def stop(self):
        self.active = False
        self.unsubscribe()
        for _, cancel in self.scheduled.values():
            cancel()
        self.scheduled.clear()
        if self.retry_cancel is not None:
            self.retry_cancel()
            self.retry_cancel = None
        # Started durable commits join through the coordinator's own cancellation
        # boundary; no new deadline/notification is admitted after unload.

    @callback
    def changed(self):
        if not self.active:
            return
        timers = self.coord.kitchen["timers"]
        for key in list(self.scheduled):
            timer = timers.get(key)
            if (
                timer is None
                or not timer["running"]
                or fingerprint(timer) != self.scheduled[key][0]
            ):
                self.scheduled.pop(key)[1]()
        for key, timer in timers.items():
            if not timer["running"]:
                continue
            digest = fingerprint(timer)
            receipt = self.coord.timer_receipts.get(key)
            if receipt and receipt["fingerprint"] == digest and receipt["delivered"]:
                continue
            if key in self.scheduled:
                continue
            try:
                deadline = datetime.fromtimestamp(timer["start_time"] + timer["duration"], UTC)
            except (ValueError, OverflowError, OSError):
                LOGGER.warning("MacroMate timer deadline is outside the supported calendar")
                continue

            async def expired(now, timer_id=key, expected=digest):
                try:
                    await self.expire(timer_id, expected)
                except ValueError:
                    # A timer edited or cancelled while its deadline was being
                    # handled must not emit an obsolete alert.
                    pass
                except OSError:
                    LOGGER.error("MacroMate timer notification could not be committed")
                    if self.active and self.retry_cancel is None:

                        @callback
                        def retry_later(_now):
                            self.retry_cancel = None
                            self.changed()

                        self.retry_cancel = async_call_later(self.hass, 30, retry_later)
                finally:
                    if self.scheduled.get(timer_id, (None,))[0] == expected:
                        self.scheduled.pop(timer_id, None)

            self.scheduled[key] = (
                digest,
                async_track_point_in_utc_time(self.hass, expired, deadline),
            )

    async def expire(self, key, digest):
        if not self.active:
            return

        def verify(state):
            timer = state["kitchen"]["timers"].get(key)
            if timer is None or not timer["running"] or fingerprint(timer) != digest:
                raise ValueError("timer changed")

        def record(state):
            receipts = state.setdefault("timer_receipts", {})
            receipts[key] = {"fingerprint": digest, "delivered": False}
            # Keep only the newest 1000 timer instances; active outbox entries
            # are never evicted to make room for delivered history.
            for old in list(receipts):
                if len(receipts) <= 1000:
                    break
                if old != key and receipts[old]["delivered"]:
                    del receipts[old]
            return {"timer_id": key}

        receipt = self.coord.timer_receipts.get(key)
        if receipt is None or receipt["fingerprint"] != digest:
            await self.coord._transact("timer_expired", {}, None, record, guard=verify)
        elif receipt["delivered"]:
            return
        if not self.active:
            return
        timer = self.coord.kitchen["timers"].get(key)
        if timer is None or not timer["running"] or fingerprint(timer) != digest:
            return
        from homeassistant.components import persistent_notification
        from homeassistant.setup import async_setup_component

        if not await async_setup_component(self.hass, "persistent_notification", {}):
            raise OSError("native notification component unavailable")
        if not self.active:
            return
        timer = self.coord.kitchen["timers"].get(key)
        if timer is None or not timer["running"] or fingerprint(timer) != digest:
            return
        # A stable native notification ID makes outbox replay after a crash
        # replace the same notification rather than create duplicate alerts.
        persistent_notification.async_create(
            self.hass,
            "A cooking timer has finished. Open MacroMate to view it.",
            title="MacroMate",
            notification_id="macromate_timer_" + digest,
        )
        self.hass.bus.async_fire("macromate_timer_finished", {"timer_id": key, "event_id": digest})

        def acknowledge(state):
            row = state["timer_receipts"].get(key)
            if row and row["fingerprint"] == digest:
                row["delivered"] = True
            return {"timer_id": key}

        await self.coord._transact(
            "timer_notification_delivered", {}, None, acknowledge, guard=verify
        )
