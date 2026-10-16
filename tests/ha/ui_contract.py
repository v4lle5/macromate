"""Replay captured browser payloads through the real HA command boundary.
Only generated food IDs are substituted when a fixture food is seeded.
"""
import asyncio
import json
import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from homeassistant.core import HomeAssistant
from custom_components.macromate.coordinator import MealTrackerCoordinator
from test_coordinator_transactions import MemoryStore


async def main(data):
    with tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR")) as directory:
        hass = HomeAssistant(directory)
        hass.config.time_zone = "Europe/Berlin"
        runtime = MealTrackerCoordinator(hass, {"weight_entity": None, "active_calories_entity": None})
        runtime._store = MemoryStore()
        if data.get("seed_entries"):
            runtime._adopt({"entries": [{**entry, "id": entry["entry_id"]} for entry in data["seed_entries"]]})
        results = []
        try:
            seed = data.get("seed_food")
            if seed:
                original_id = seed["food_id"]
                raw = {k: v for k, v in seed.items() if k in {"name", "producer", "base_unit", "nutrients_per_100", "servings", "barcodes"}}
                saved = await runtime.async_command("save_food", {"food": raw})
            for call in data["calls"]:
                payload = dict(call["payload"])
                if seed and payload.get("food_id") == original_id:
                    payload["food_id"] = saved["food"]["food_id"]
                results.append(await runtime.async_command(call["action"], payload))
            await runtime.async_load()
            return {"results": results, "diary": runtime.diary_data(data.get("date")), "state": runtime._state()}
        finally:
            await hass.async_stop(force=True)


if __name__ == "__main__":
    print(json.dumps(asyncio.run(main(json.load(sys.stdin)))))
