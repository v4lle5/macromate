"""Shipped local backup-transfer client against real disposable HA HTTP."""
import asyncio
import importlib.util
import json
from copy import deepcopy
from pathlib import Path
import unittest
from unittest.mock import patch
import test_unified_http as native
from tools import macromate_transfer as sdk
from custom_components.macromate.platform_support import validate_json
from custom_components.macromate.coordinator import MealTrackerCoordinator


class AgentTransferTests(unittest.IsolatedAsyncioTestCase):
    coord: MealTrackerCoordinator
    origin: str
    tokens: list[tuple[object, str]]
    asyncSetUp = native.NativeHTTPTests.asyncSetUp
    asyncTearDown = native.NativeHTTPTests.asyncTearDown
    headers = native.NativeHTTPTests.headers

    async def test_native_accepted_depth32_sdk_get_restore_and_rejected_depth33(self):
        store_path = Path(self.tmp.name) / ".storage" / "macromate.meals"
        for depth, arrays in ((31, 26), (32, 27)):
            nested = "synthetic-leaf"
            for _ in range(arrays):
                nested = [nested]
            # Seed through the real authenticated domain action, not a
            # hand-built coordinator state. No request ID adds ledger depth.
            async with self.client.post(
                self.origin + "/api/services/macromate/preferences_update?return_response",
                headers=self.headers(), json={"preferences": {"deep": nested}},
            ) as response:
                self.assertEqual(response.status, 200, await response.text())
                await response.read()
            root = json.loads(store_path.read_bytes())["data"]
            self.assertEqual(root, self.coord._state())
            validate_json(root, max_bytes=67108864)
            with self.assertRaisesRegex(ValueError, "nesting"):
                # Adding 33-depth wrappers to this root must fail.
                wrapped = root
                for _ in range(33 - depth):
                    wrapped = {"data": wrapped}
                validate_json(wrapped, max_bytes=sdk.MAX_TRANSFER_BYTES)
            downloaded = await asyncio.to_thread(
                sdk.download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True,
            )
            self.assertEqual(downloaded["data"], root)
            async with self.client.post(
                self.origin + "/api/services/macromate/preferences_update?return_response",
                headers=self.headers(), json={"preferences": {"deep": "changed"}},
            ) as response:
                self.assertEqual(response.status, 200, await response.text())
                await response.read()
            self.assertNotEqual(json.loads(store_path.read_bytes())["data"], root)
            kwargs = dict(request_id=f"sdk-depth{depth}", confirm=True, trusted_lan_http=True)
            with patch.object(sdk, "build_opener", wraps=sdk.build_opener) as opener:
                result = await asyncio.to_thread(
                    sdk.restore_backup, self.origin, self.tokens[0][1], downloaded["data"], **kwargs,
                )
                self.assertEqual(opener.call_count, 1)  # No automatic retries.
            self.assertTrue(result["restored"])
            durable_bytes = store_path.read_bytes()
            durable = json.loads(durable_bytes)["data"]
            self.assertEqual(durable, self.coord._state())
            self.assertEqual(
                {k: v for k, v in durable.items() if k != "ledger"},
                {k: v for k, v in root.items() if k != "ledger"},
            )
            self.assertEqual(durable["ledger"][:-1], root["ledger"])
            self.assertEqual(durable["ledger"][-1]["request_id"], f"{self.owner.id}:{kwargs['request_id']}")
            with patch.object(sdk, "build_opener", wraps=sdk.build_opener) as opener:
                replay = await asyncio.to_thread(
                    sdk.restore_backup, self.origin, self.tokens[0][1], downloaded["data"], **kwargs,
                )
                self.assertEqual(opener.call_count, 1)  # Explicit identical replay.
            self.assertEqual(replay, result)
            self.assertEqual(store_path.read_bytes(), durable_bytes)
            self.assertEqual(self.coord._state(), durable)
        beyond = deepcopy(downloaded["data"])
        beyond["kitchen"]["preferences"][self.owner.id]["ui"]["deep"] = [nested]
        with self.assertRaisesRegex(ValueError, "nesting"):
            validate_json(beyond, max_bytes=67108864)
        with patch.object(sdk, "build_opener", wraps=sdk.build_opener) as opener:
            with self.assertRaisesRegex(ValueError, "transfer payload must be finite JSON data"):
                await asyncio.to_thread(
                    sdk.restore_backup, self.origin, self.tokens[0][1], beyond,
                    request_id="sdk-depth33", confirm=True, trusted_lan_http=True,
                )
            opener.assert_not_called()
        self.assertEqual(store_path.read_bytes(), durable_bytes)
        self.assertEqual(self.coord._state(), durable)
        for function, kwargs in (
            (sdk.download_backup, {}),
            (sdk.restore_backup, dict(data=downloaded["data"], request_id="sdk-denied", confirm=True)),
        ):
            with self.subTest(denied=function.__name__):
                with patch.object(sdk, "build_opener", wraps=sdk.build_opener) as opener:
                    with self.assertRaisesRegex(RuntimeError, "^Home Assistant returned HTTP 403$"):
                        await asyncio.to_thread(
                            function, self.origin, self.tokens[1][1], trusted_lan_http=True, **kwargs,
                        )
                    self.assertEqual(opener.call_count, 1)
                self.assertEqual(store_path.read_bytes(), durable_bytes)
                self.assertEqual(self.coord._state(), durable)

    async def test_shipped_transfer_exceeds_generic_limits_with_exact_restore_readback(self):
        self.assertIsNotNone(importlib.util.find_spec("tools.macromate_transfer"), "large-transfer client is missing")
        from tools.macromate_transfer import download_backup, restore_backup
        notes = {"notes": ["x" * 50000 for _ in range(90)]}
        def seed(state):
            state["kitchen"]["preferences"]["synthetic-transfer"] = notes
            return {}
        await self.coord._transact("synthetic-transfer-seed", {}, None, seed)
        snapshot = await asyncio.to_thread(download_backup, self.origin, self.tokens[0][1], trusted_lan_http=True)
        self.assertEqual(snapshot["data"]["kitchen"]["preferences"]["synthetic-transfer"], notes)
        def change(state):
            state["kitchen"]["preferences"].pop("synthetic-transfer")
            return {}
        await self.coord._transact("synthetic-transfer-change", {}, None, change)
        result = await asyncio.to_thread(restore_backup, self.origin, self.tokens[0][1], snapshot["data"], request_id="synthetic-transfer-restore", confirm=True, trusted_lan_http=True)
        self.assertTrue(result["restored"])
        self.assertEqual(self.coord.kitchen["preferences"]["synthetic-transfer"], notes)
        store_path = Path(self.tmp.name) / ".storage" / "macromate.meals"
        durable_bytes = store_path.read_bytes()
        durable = json.loads(durable_bytes)["data"]
        self.assertEqual(durable, self.coord._state())
        self.assertEqual(
            {k: v for k, v in durable.items() if k != "ledger"},
            {k: v for k, v in snapshot["data"].items() if k != "ledger"},
        )
        replay = await asyncio.to_thread(restore_backup, self.origin, self.tokens[0][1], snapshot["data"], request_id="synthetic-transfer-restore", confirm=True, trusted_lan_http=True)
        self.assertEqual(replay, result)
        self.assertEqual(store_path.read_bytes(), durable_bytes)
        with self.assertRaisesRegex(RuntimeError, "^Home Assistant returned HTTP 403$"):
            await asyncio.to_thread(download_backup, self.origin, self.tokens[1][1], trusted_lan_http=True)
        self.assertEqual(store_path.read_bytes(), durable_bytes)
        with self.assertRaises(ValueError):
            await asyncio.to_thread(restore_backup, self.origin, self.tokens[0][1], snapshot["data"], request_id="unconfirmed", confirm=False, trusted_lan_http=True)


if __name__ == "__main__":
    unittest.main()
