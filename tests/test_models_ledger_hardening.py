"""Pure ledger regression tests; no Home Assistant runtime needed."""
from __future__ import annotations

import json
import unittest

from custom_components.macromate.models import OperationLedger


class LedgerHardeningTests(unittest.TestCase):
    def test_restore_rejects_corrupt_or_duplicate_history(self):
        ledger = OperationLedger()
        ledger.record("r", "delete", {}, {"deleted_entry_id": "m"})
        record = ledger.to_list()[0]
        corrupt = [None, {}, {"request_id": "r"},
                   {**record, "payload_hash": "not-a-hash"},
                   {**record, "operation": ""},
                   {**record, "result": {"n": float("nan")}}]
        for value in corrupt:
            with self.subTest(value=value), self.assertRaises(ValueError):
                OperationLedger.from_list([value])
        for value in (None, {}, "bad", [record, record]):
            with self.subTest(value=value), self.assertRaises(ValueError):
                OperationLedger.from_list(value)

    def test_nested_key_order_and_defensive_copies_survive_json_roundtrip(self):
        payload = {"b": [1, {"z": 2, "a": 3}], "a": "ö"}
        equivalent = {"a": "ö", "b": [1, {"a": 3, "z": 2}]}
        result = {"entries": [{"entry_id": "original"}]}
        ledger = OperationLedger()
        self.assertIsNone(ledger.replay("missing", "create", payload))
        ledger.record("r", "create", payload, result)
        result["entries"][0]["entry_id"] = "input-mutated"
        replay = ledger.replay("r", "create", equivalent)
        assert replay is not None
        replay["entries"].clear()
        exported = ledger.to_list()
        restored = OperationLedger.from_list(json.loads(json.dumps(exported)))
        exported[0]["result"]["entries"].clear()
        for candidate in (ledger, restored):
            self.assertEqual(candidate.replay("r", "create", payload),
                             {"entries": [{"entry_id": "original"}]})

    def test_invalid_record_inputs_fail_without_changing_state(self):
        invalid = [
            ("", "create", {}, {}), (" ", "create", {}, {}),
            (None, "create", {}, {}), ("r", "", {}, {}),
            ("r", "create", [], {}), ("r", "create", {}, None),
            ("r", "create", {1: "ambiguous"}, {}),
            ("r", "create", {"n": float("nan")}, {}),
            ("r", "create", {}, {"n": float("inf")}),
            ("r", "create", {"bad": object()}, {}),
        ]
        ledger = OperationLedger()
        for args in invalid:
            with self.subTest(args=args), self.assertRaises(ValueError):
                ledger.record(*args)
            self.assertEqual(ledger.to_list(), [])

    def test_retention_evicts_oldest_without_refreshing_replays(self):
        ledger = OperationLedger(max_entries=2)
        ledger.record("a", "delete", {}, {"deleted": "a"})
        ledger.record("b", "clear", {}, {"count": 2})
        ledger.record("a", "delete", {}, {"deleted": "ignored"})
        ledger.record("c", "update", {}, {})
        self.assertIsNone(ledger.replay("a", "delete", {}))
        self.assertEqual([item["request_id"] for item in ledger.to_list()], ["b", "c"])
        restored = OperationLedger.from_list(ledger.to_list(), max_entries=1)
        self.assertEqual([item["request_id"] for item in restored.to_list()], ["c"])
        for value in (0, -1, True, 1.5):
            with self.subTest(value=value), self.assertRaises(ValueError):
                OperationLedger(max_entries=value)

    def test_record_cannot_overwrite_an_accepted_request(self):
        ledger = OperationLedger()
        ledger.record("r", "create", {"n": 1}, {"entry_id": "original"})
        ledger.record("r", "create", {"n": 1}, {"entry_id": "replacement"})
        self.assertEqual(ledger.replay("r", "create", {"n": 1}), {"entry_id": "original"})
        with self.assertRaisesRegex(ValueError, "different payload"):
            ledger.record("r", "create", {"n": 2}, {})
        with self.assertRaisesRegex(ValueError, "different operation"):
            ledger.record("r", "delete", {"n": 1}, {})

    def test_same_payload_cannot_reuse_request_id_for_another_operation(self):
        ledger = OperationLedger()
        ledger.record("r", "create", {"entry_id": "m"}, {"entry_id": "m"})
        with self.assertRaisesRegex(ValueError, "different operation"):
            ledger.replay("r", "delete", {"entry_id": "m"})
