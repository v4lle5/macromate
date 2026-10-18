"""Measure synthetic Store transactions and event-loop lag without user data."""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import tempfile
import time
from datetime import UTC, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


async def benchmark(entries, media_mib):
    from homeassistant.core import HomeAssistant

    from custom_components.macromate.coordinator import MealTrackerCoordinator
    from custom_components.macromate.models import MealEntry, MealLog

    with tempfile.TemporaryDirectory(prefix="macromate-benchmark-") as directory:
        hass = HomeAssistant(directory)
        coord = MealTrackerCoordinator(
            hass, {"weight_entity": None, "active_calories_entity": None}
        )
        coord.log = MealLog(
            MealEntry(
                id=f"synthetic-{index}",
                name="Synthetic benchmark",
                meal_type="lunch",
                calories=100,
                protein=1,
                carbs=1,
                fat=1,
                eaten_at=datetime(2026, 10, 14, 12, tzinfo=UTC),
            )
            for index in range(entries)
        )
        # Byte-equivalent inert media fixture; no image decoding or real photos.
        coord.kitchen["media"]["synthetic"] = {"data": "x" * (media_mib * 1024 * 1024)}
        lags = []
        active = True

        async def heartbeat():
            while active:
                start = time.perf_counter()
                await asyncio.sleep(0.005)
                lags.append(max(0, time.perf_counter() - start - 0.005))

        pulse = asyncio.create_task(heartbeat())
        await asyncio.sleep(0)  # Arm the heartbeat before any synchronous staging.
        start = time.perf_counter()
        try:
            await coord.async_create(name="Synthetic write", meal_type="snack", calories=1)
            elapsed = time.perf_counter() - start
        finally:
            active = False
            await pulse
            await hass.async_stop(force=True)
        return {
            "entries": entries,
            "media_mib": media_mib,
            "transaction_seconds": round(elapsed, 3),
            "max_event_loop_lag_ms": round(max(lags, default=0) * 1000, 2),
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--entries", type=int, default=10000)
    parser.add_argument("--media-mib", type=int, default=8)
    args = parser.parse_args()
    if not 0 <= args.entries <= 100000 or not 0 <= args.media_mib <= 32:
        parser.error("Use at most 100000 entries and 32 MiB of synthetic media")
    print(json.dumps(asyncio.run(benchmark(args.entries, args.media_mib)), indent=2))


if __name__ == "__main__":
    main()
