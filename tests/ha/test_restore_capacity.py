"""Exact charged-cap roots through authenticated HA and the shipped SDK."""
import asyncio
from copy import deepcopy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

from homeassistant.auth.const import GROUP_ID_READ_ONLY, GROUP_ID_USER
import test_unified_http as native
from custom_components.macromate.coordinator import MealTrackerCoordinator
from tools import macromate_transfer as sdk

CAP = 67108864


def size(value):
    return len(json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8"))


class RestoreCapacityTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers

    async def test_legacy_route_rejects_invalid_json_and_non_admin_without_save(self):
        cases = (b'{"source":"recipe_manager","source":"recipe_manager"}',
                 b'{"stores":{"bad":1e999}}', b'{"unknown":true}', b'[]')
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as saves:
            for raw in cases:
                async with self.client.post(
                    self.origin + "/api/macromate/legacy-import",
                    headers={**self.headers(), "Content-Type": "application/json"}, data=raw,
                ) as response:
                    self.assertEqual(response.status, 400, await response.text())
                    await response.read()
            async with self.client.post(
                self.origin + "/api/macromate/legacy-import",
                headers=self.headers(1), json={},
            ) as response:
                self.assertEqual(response.status, 403)
                await response.read()
            readonly = await self.hass.auth.async_create_user(
                "Synthetic read-only importer", group_ids=[GROUP_ID_READ_ONLY],
            )
            refresh = await self.hass.auth.async_create_refresh_token(
                readonly, client_id="https://example.invalid/readonly-import",
            )
            token = self.hass.auth.async_create_access_token(refresh)
            async with self.client.post(
                self.origin + "/api/macromate/legacy-import",
                headers={"Authorization": "Bearer " + token}, json={},
            ) as response:
                self.assertEqual(response.status, 403)
                await response.read()
            saves.assert_not_called()

    async def test_restore_receipt_is_bounded_even_when_shared_objects_change(self):
        downloaded = await asyncio.to_thread(
            sdk.download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True,
        )
        from historical_shopping_fixture import historical_shopping
        await historical_shopping(self.coord, 'shopping_lists_create', {'name': 'Historical fixture'})
        await asyncio.to_thread(
            sdk.restore_backup, self.origin, self.tokens[0][1], downloaded["data"],
            request_id="replace-shared", confirm=True, trusted_lan_http=True,
        )
        row = self.coord.ledger.to_list()[-1]
        self.assertEqual(row["result"], {
            "__result": {"restored": True, "schema_version": 3}, "__access": [],
        })
        self.assertEqual(self.coord.kitchen["shopping_lists"], {})

    async def test_integer_history_representation_is_charged_as_serialized_model(self):
        from custom_components.macromate.models import MealEntry

        async with self.client.post(self.origin + "/api/services/macromate/log_meal?return_response",
                                    headers=self.headers(), json={"name": "Historical integers", "calories": 100,
                                                                  "meal_type": "snack"}) as response:
            self.assertEqual(response.status, 200)
            await response.read()
        path = Path(self.tmp.name) / ".storage/macromate.meals"
        before = path.read_bytes()
        root = deepcopy(self.coord._state())
        for key in ("calories", "protein", "carbs", "fat"):
            root["entries"][0][key] = int(root["entries"][0][key])
        root["kitchen"]["preferences"] = {f"integer-{i}": {"ui": {"padding": ""}} for i in range(34)}
        remaining = CAP - size(root)
        for row in root["kitchen"]["preferences"].values():
            length = min(2000000, remaining)
            row["ui"]["padding"] = "x" * length
            remaining -= length
        self.assertEqual(remaining, 0)
        canonical_entries = [MealEntry.from_dict(row).to_dict() for row in root["entries"]]
        overhead = size({**root, "entries": canonical_entries}) - size(root)
        self.assertGreater(overhead, 0)
        self.assertEqual(size(root), CAP)
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as saves:
            async with self.client.post(self.origin + "/api/macromate/restore", headers=self.headers(),
                json={"data": root, "confirm": True, "request_id": "integer-overflow"}) as response:
                self.assertEqual(response.status, 400, await response.text())
            saves.assert_not_called()
        self.assertEqual(path.read_bytes(), before)
        last = list(root["kitchen"]["preferences"].values())[-1]["ui"]
        last["padding"] = last["padding"][:-overhead]
        self.assertEqual(size({**root, "entries": canonical_entries}), CAP)
        await asyncio.to_thread(sdk.restore_backup, self.origin, self.tokens[0][1], root,
                               confirm=True, request_id="integer-exact", trusted_lan_http=True)
        durable = json.loads(path.read_bytes())["data"]
        self.assertEqual(json.dumps(durable, sort_keys=True), json.dumps(self.coord._state(), sort_keys=True))
        self.assertEqual(size(durable), size(self.coord._state()))
        downloaded = await asyncio.to_thread(sdk.download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True)
        self.assertEqual(size(downloaded["data"]), size(durable))
        await asyncio.to_thread(sdk.restore_backup, self.origin, self.tokens[0][1], downloaded["data"],
                               confirm=True, request_id="integer-downloaded", trusted_lan_http=True)
        self.assertEqual(json.dumps(json.loads(path.read_bytes())["data"], sort_keys=True),
                         json.dumps(self.coord._state(), sort_keys=True))

    async def test_sparse_root_defaults_are_charged_before_native_save(self):
        async with self.client.post(self.origin + "/api/services/macromate/preferences_update?return_response",
                                    headers=self.headers(), json={"preferences": {"baseline": True}}) as response:
            self.assertEqual(response.status, 200)
            await response.read()
        path = Path(self.tmp.name) / ".storage/macromate.meals"
        before = path.read_bytes()
        original = deepcopy(self.coord._state())
        root = deepcopy(original)
        defaults = {"entries": [], "foods": {}, "favorites": {}, "daily_goals": {}}
        for key in defaults:
            root.pop(key)
        root["kitchen"]["preferences"] = {f"sparse-{i}": {"ui": {"padding": ""}} for i in range(34)}
        remaining = CAP - size(root)
        for row in root["kitchen"]["preferences"].values():
            length = min(2000000, remaining)
            row["ui"]["padding"] = "x" * length
            remaining -= length
        self.assertEqual(remaining, 0)
        self.assertEqual(size(root), CAP)
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as saves:
            async with self.client.post(self.origin + "/api/macromate/restore", headers=self.headers(),
                json={"data": root, "confirm": True, "request_id": "sparse-overflow"}) as response:
                self.assertEqual(response.status, 400, await response.text())
            saves.assert_not_called()
        self.assertEqual(path.read_bytes(), before)
        self.assertEqual(self.coord._state(), original)
        # An exact-cap canonical root remains accepted even when input is sparse.
        overhead = size({**root, **defaults}) - size(root)
        last = list(root["kitchen"]["preferences"].values())[-1]["ui"]
        self.assertGreater(len(last["padding"]), overhead)
        last["padding"] = last["padding"][:-overhead]
        self.assertEqual(size({**root, **defaults}), CAP)
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as saves:
            result = await asyncio.to_thread(sdk.restore_backup, self.origin, self.tokens[0][1], root,
                confirm=True, request_id="sparse-exact", trusted_lan_http=True)
            self.assertTrue(result["restored"])
            self.assertEqual(saves.call_count, 1)
            durable = json.loads(path.read_bytes())["data"]
            self.assertEqual(durable, self.coord._state())
            self.assertTrue(set(defaults).issubset(durable))
            downloaded = await asyncio.to_thread(sdk.download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True)
            self.assertEqual(downloaded["data"], durable)
            again = await asyncio.to_thread(sdk.restore_backup, self.origin, self.tokens[0][1], downloaded["data"],
                confirm=True, request_id="sparse-downloaded", trusted_lan_http=True)
            self.assertEqual(again, result)
            self.assertEqual(saves.call_count, 2)
            durable_bytes = path.read_bytes()
            replay = await asyncio.to_thread(sdk.restore_backup, self.origin, self.tokens[0][1], downloaded["data"],
                confirm=True, request_id="sparse-downloaded", trusted_lan_http=True)
            self.assertEqual(replay, result)
            self.assertEqual(saves.call_count, 2)
            self.assertEqual(path.read_bytes(), durable_bytes)
        cold = MealTrackerCoordinator(self.hass, self.coord.settings)
        await cold.async_load()
        self.assertEqual(cold._state(), json.loads(durable_bytes)["data"])

    async def test_native_exact_cap_sdk_restore_restart_replay_and_ordinary_excess(self):
        async with self.client.post(
            self.origin + "/api/services/macromate/recipes_add?return_response",
            headers=self.headers(), json={"name": "Retained identity", "request_id": "original-create"},
        ) as response:
            self.assertEqual(response.status, 200, await response.text())
            await response.read()
        original = self.coord._state()
        self.assertEqual(len(original["ledger"]), 1)
        recipe_id = next(iter(original["kitchen"]["recipes"]))
        actors = [(self.owner, self.tokens[0][1]), (self.other, self.tokens[1][1])]
        for index in range(32):
            user = await self.hass.auth.async_create_user(
                f"Synthetic capacity actor {index}", group_ids=[GROUP_ID_USER],
            )
            refresh = await self.hass.auth.async_create_refresh_token(
                user, client_id="https://example.invalid/capacity-test",
            )
            actors.append((user, self.hass.auth.async_create_access_token(refresh)))
        root = deepcopy(original)
        root["kitchen"]["preferences"] = {
            user.id: {"ui": {"padding": ""}} for user, _ in actors
        }
        remaining = CAP - size(root)
        for user, token in actors:
            length = min(2000000, remaining)
            padding = "x" * length
            remaining -= length
            root["kitchen"]["preferences"][user.id]["ui"]["padding"] = padding
            async with self.client.post(
                self.origin + "/api/services/macromate/preferences_update?return_response",
                headers={"Authorization": "Bearer " + token},
                json={"preferences": {"padding": padding}},
            ) as response:
                self.assertEqual(response.status, 200, await response.text())
                await response.read()
        self.assertEqual(remaining, 0)
        self.assertEqual(size(root), CAP)
        self.assertEqual(self.coord._state(), root)
        path = Path(self.tmp.name) / ".storage/macromate.meals"
        self.assertEqual(json.loads(path.read_bytes())["data"], root)
        downloaded = await asyncio.to_thread(
            sdk.download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True,
        )
        self.assertEqual(downloaded["data"], root)
        kwargs = dict(request_id="native-exact-cap", confirm=True, trusted_lan_http=True)
        with patch.object(self.coord._store, "async_save", wraps=self.coord._store.async_save) as saves:
            with patch.object(sdk, "build_opener", wraps=sdk.build_opener) as opener:
                result = await asyncio.to_thread(
                    sdk.restore_backup, self.origin, self.tokens[0][1], root, **kwargs,
                )
                self.assertEqual(opener.call_count, 1)
            self.assertEqual(saves.call_count, 1)
        self.assertEqual(result, {"restored": True, "schema_version": 3})
        durable_bytes = path.read_bytes()
        durable = json.loads(durable_bytes)["data"]
        self.assertGreater(size(durable), CAP)
        self.assertEqual(self.coord._state(), durable)
        self.assertEqual(durable["ledger"][:-1], original["ledger"])
        self.assertEqual(durable["ledger"][-1]["request_id"], self.owner.id + ":native-exact-cap")
        self.assertEqual(durable["kitchen"]["recipes"], original["kitchen"]["recipes"])
        self.assertIn(recipe_id, self.coord.kitchen["recipes"])
        child = await asyncio.to_thread(
            subprocess.run,
            [sys.executable, "-B", str(Path(__file__).resolve()), "--restart-probe", self.tmp.name, self.owner.id],
            cwd=Path(__file__).parents[2], env={**os.environ, "PYTHONPATH": ".:tests/ha"},
            text=True, capture_output=True, timeout=90,
        )
        self.assertEqual(child.returncode, 0, child.stderr[-4000:])
        child_report = json.loads(child.stdout.splitlines()[-1])
        self.assertEqual(child_report["root_bytes"], size(durable))
        self.assertEqual(child_report["disk_sha256"], hashlib.sha256(durable_bytes).hexdigest())
        self.assertTrue(child_report["replay_unchanged"])
        self.assertEqual(path.read_bytes(), durable_bytes)
        restarted = MealTrackerCoordinator(self.hass, self.coord.settings)
        await restarted.async_load()
        self.assertEqual(restarted._state(), durable)
        # Replace the actual loaded entry runtime, so replay uses a fresh Store/model.
        self.hass.config_entries.async_loaded_entries("macromate")[0].runtime_data = restarted
        self.coord = restarted
        with patch.object(restarted._store, "async_save", wraps=restarted._store.async_save) as saves:
            replay = await asyncio.to_thread(
                sdk.restore_backup, self.origin, self.tokens[0][1], root, **kwargs,
            )
            self.assertEqual(replay, result)
            saves.assert_not_called()
        self.assertEqual(path.read_bytes(), durable_bytes)
        self.assertEqual(restarted._state(), durable)
        # Even with receipt reserve available, ordinary data cannot use one byte of it.
        with patch.object(restarted._store, "async_save", wraps=restarted._store.async_save) as saves:
            async with self.client.post(
                self.origin + "/api/services/macromate/preferences_update?return_response",
                headers=self.headers(), json={"preferences": {"padding": root["kitchen"]["preferences"][self.owner.id]["ui"]["padding"] + "x"}},
            ) as response:
                self.assertEqual(response.status, 400)
                await response.read()
            saves.assert_not_called()
        self.assertEqual(path.read_bytes(), durable_bytes)
        self.assertEqual(restarted._state(), durable)
        # A native backup that already contains exempt restore metadata must
        # itself round-trip; the input root now exceeds the charged data budget.
        receipt_backup = await asyncio.to_thread(
            sdk.download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True,
        )
        self.assertEqual(receipt_backup["data"], durable)
        receipt_kwargs = dict(request_id="native-receipt-root", confirm=True, trusted_lan_http=True)
        with patch.object(restarted._store, "async_save", wraps=restarted._store.async_save) as saves:
            second = await asyncio.to_thread(
                sdk.restore_backup, self.origin, self.tokens[0][1], durable, **receipt_kwargs,
            )
            self.assertEqual(second, result)
            self.assertEqual(saves.call_count, 1)
            second_bytes = path.read_bytes()
            second_root = json.loads(second_bytes)["data"]
            self.assertEqual(second_root, restarted._state())
            self.assertEqual(second_root["ledger"][:-1], durable["ledger"])
            self.assertEqual(second_root["kitchen"], durable["kitchen"])
            replay = await asyncio.to_thread(
                sdk.restore_backup, self.origin, self.tokens[0][1], durable, **receipt_kwargs,
            )
            self.assertEqual(replay, second)
            self.assertEqual(saves.call_count, 1)
            self.assertEqual(path.read_bytes(), second_bytes)
        cold = MealTrackerCoordinator(self.hass, self.coord.settings)
        await cold.async_load()
        self.assertEqual(cold._state(), second_root)


async def restart_probe(path, owner_id):
    """Fresh process, real Store decoder and exact replay of native-written data."""
    from homeassistant.core import HomeAssistant
    from custom_components.macromate.platform_support import Actor
    hass = HomeAssistant(path)
    coord = MealTrackerCoordinator(hass, {"weight_entity": None, "active_calories_entity": None})
    store_path = Path(path) / ".storage/macromate.meals"
    before = store_path.read_bytes()
    try:
        await coord.async_load()
        root = coord._state()
        assert json.loads(before)["data"] == root
        original = deepcopy(root)
        row = original["ledger"].pop()
        assert row["request_id"] == owner_id + ":native-exact-cap"
        result = await coord.async_command(
            "platform_restore", {"data": original, "confirm": True, "request_id": "native-exact-cap"},
            actor=Actor(owner_id, is_admin=True),
        )
        assert result == {"restored": True, "schema_version": 3}
        assert coord._state() == root and store_path.read_bytes() == before
        print(json.dumps({"root_bytes": size(root), "disk_sha256": hashlib.sha256(before).hexdigest(),
                          "replay_unchanged": True}))
    finally:
        await hass.async_stop(force=True)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--restart-probe":
        asyncio.run(restart_probe(sys.argv[2], sys.argv[3]))
    else:
        unittest.main()
