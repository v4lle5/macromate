"""Disposable real config-entry writer/reader; used by process-restart test."""

import asyncio
import json
import sys
import homeassistant
from homeassistant import auth, loader
from homeassistant.bootstrap import async_load_base_functionality
from homeassistant.config_entries import ConfigEntries
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

PROFILE = {
    "formula_sex": "male",
    "birthday": "1990-01-01",
    "height_cm": 180,
    "weight_kg": 80,
    "target_weight_kg": 80,
    "goal": "maintain",
    "weekly_pace_kg": 0,
    "activity_level": "low",
    "macro_plan": "balanced",
    "enable_food_database": False,
}


async def run(path, mode):
    hass = HomeAssistant(path)
    hass.config.time_zone = "Europe/Berlin"
    hass.config_entries = ConfigEntries(hass, {})
    loader.async_setup(hass)
    await async_load_base_functionality(hass)
    hass.auth = await auth.auth_manager_from_config(hass, [], [])
    await hass.config_entries.async_initialize()
    assert await async_setup_component(hass, "macromate", {})
    if mode == "write":
        # Upgrade fixture: historical records precede entry setup/load.
        from homeassistant.helpers.storage import Store
        from historical_shopping_fixture import historical_dataset
        historical = historical_dataset()
        await Store(hass, 1, "macromate.meals").async_save({
            "schema": 3, "entries": [], "foods": {}, "favorites": {},
            "daily_goals": {}, "ledger": [], "kitchen": historical,
        })
        flow = await hass.config_entries.flow.async_init(
            "macromate", context={"source": "user"}, data=PROFILE
        )
        assert flow["type"] == "create_entry", flow["type"]
    entries = hass.config_entries.async_entries("macromate")
    assert len(entries) == 1
    entry = entries[0]
    if entry.state.value != "loaded":
        assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state.value == "loaded"
    coord = entry.runtime_data

    async def api(name, data):
        return await hass.services.async_call(
            "macromate", name, data, blocking=True, return_response=True
        )

    if mode == "write":
        recipe = (
            await api(
                "recipes_add",
                {
                    "name": "Restart recipe",
                    "servings": 2,
                    "declared_nutrition": {"calories": 250},
                    "nutrition_basis": "per_serving",
                    "request_id": "restart-recipe",
                },
            )
        )["recipe"]
        plan = (
            await api(
                "meal_plan_add",
                {
                    "recipe_id": recipe["id"],
                    "date": "2026-10-14",
                    "meal_type": "lunch",
                    "request_id": "restart-plan",
                },
            )
        )["entry"]
        logged = await api(
            "recipe_log",
            {
                "recipe_id": recipe["id"],
                "servings": 2,
                "date": "2026-10-14",
                "meal_type": "lunch",
                "request_id": "restart-log",
            },
        )
        food = (
            await api(
                "save_food",
                {
                    "food": {
                        "name": "Restart food",
                        "base_unit": "g",
                        "nutrients_per_100": {"calories": 100},
                    },
                    "request_id": "restart-food",
                },
            )
        )["food"]
        await api(
            "set_favorite",
            {
                "food_id": food["food_id"],
                "enabled": True,
                "amount": 50,
                "request_id": "restart-favorite",
            },
        )
        for bucket in historical:
            if bucket != "recipes" and bucket != "meal_plan":
                assert coord.kitchen[bucket] == historical[bucket], bucket
        expected = {
            "recipe_id": recipe["id"],
            "plan_id": plan["id"],
            "entry_id": logged["entry_id"],
            "food_id": food["food_id"],
            "state": coord._state(),
        }
    else:
        with open(path + "/expected.json") as source:
            expected = json.load(source)
        assert coord._state() == expected["state"]
        recipe = (
            await api(
                "recipes_add",
                {
                    "name": "Restart recipe",
                    "servings": 2,
                    "declared_nutrition": {"calories": 250},
                    "nutrition_basis": "per_serving",
                    "request_id": "restart-recipe",
                },
            )
        )["recipe"]
        assert recipe["id"] == expected["recipe_id"]
        assert not hass.services.has_service("macromate", "shopping_items_delete")
        assert coord.kitchen["shopping_items"] == expected["state"]["kitchen"]["shopping_items"]
        assert expected["food_id"] in coord.favorites
        assert any(row.id == expected["entry_id"] for row in coord.log.entries)
    states = hass.states.async_all("sensor")
    assert len(states) > 5
    await hass.config_entries._store.async_save(hass.config_entries._data_to_save())
    if mode == "write":
        with open(path + "/expected.json", "w") as target:
            json.dump(expected, target)
    report = {
        "mode": mode,
        "entry_loaded": True,
        "sensors": len(states),
        "schema": coord._state()["schema"],
        "recipes": len(coord.kitchen["recipes"]),
        "diary_entries": len(coord.log.entries),
        "ledger": len(coord.ledger.to_list()),
    }
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_stop(force=True)
    print(json.dumps(report))


if __name__ == "__main__":
    asyncio.run(run(sys.argv[1], sys.argv[2]))
