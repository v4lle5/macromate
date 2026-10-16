"""Pure storage budget accounting, independent of Home Assistant."""
from copy import deepcopy
import importlib.util
import json
import unittest
from unittest.mock import patch


def size(value):
    return len(json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8"))


def receipt(request_id="actor:restore"):
    return {"request_id": request_id, "operation": "platform_restore", "payload_hash": "a" * 64,
            "result": {"__result": {"restored": True, "schema_version": 3}, "__access": []}}


class StorageBudgetTests(unittest.TestCase):
    def test_restore_like_forgery_is_charged_as_ordinary_data(self):
        from custom_components.macromate import storage_budget as budget
        ordinary = {"ledger": [], "padding": ""}
        ordinary["padding"] = "x" * (1024 - size(ordinary))
        variants = []
        for change in (
            {"operation": "recipes_add"}, {"payload_hash": "A" * 64},
            {"payload_hash": "a" * 63}, {"request_id": "unscoped"},
            {"request_id": "a" * 129 + ":" + "b" * 128},
            {"request_id": "a:bad\n"}, {"extra": "not canonical"},
            {"result": {"restored": True, "schema_version": 3}},
            {"result": {"__result": {"restored": True, "schema_version": 3}, "__access": [["recipes", "private"]]}},
            {"result": {"__result": {"restored": 1, "schema_version": 3}, "__access": []}},
            {"result": {"__result": {"restored": True, "schema_version": 3.0}, "__access": []}},
            {"result": {"__result": {"restored": True, "schema_version": 3, "padding": "x" * 5000}, "__access": []}},
        ):
            variants.append({**receipt(), **change})
        with patch.object(budget, "MAX_DATA_BYTES", 1024):
            budget.validate_storage_root({**ordinary, "ledger": [receipt()]})
            for row in variants:
                with self.subTest(fields=list(row)), self.assertRaisesRegex(ValueError, "charged"):
                    budget.validate_storage_root({**ordinary, "ledger": [row]})
            # Even a perfectly valid normal-operation result stays charged.
            row = {**receipt(), "operation": "preferences_update", "result": {}}
            with self.assertRaisesRegex(ValueError, "charged"):
                budget.validate_storage_root({**ordinary, "ledger": [row]})

    def test_utf8_boundary_uses_bytes_and_reserve_does_not_pay_for_data(self):
        from custom_components.macromate import storage_budget as budget
        root = {"ledger": [receipt("é:😀")], "padding": "é" * 20}
        charged = {**root, "ledger": []}
        with patch.object(budget, "MAX_DATA_BYTES", size(charged)):
            budget.validate_storage_root(root)
            root["padding"] += "x"
            with self.assertRaisesRegex(ValueError, "charged"):
                budget.validate_storage_root(root)

    def test_count_pool_syntax_and_retention_are_finite(self):
        from custom_components.macromate import storage_budget as budget
        from custom_components.macromate.models import OperationLedger
        root = {"ledger": [receipt(f"actor:restore-{index}") for index in range(1000)]}
        self.assertEqual(budget.validate_storage_root(root), root)
        self.assertLessEqual(budget.MAX_CANONICAL_RECEIPT_BYTES, 4096)
        self.assertLessEqual(1000 * (4096 + len(", ".encode("utf-8"))), 4194304)
        self.assertLessEqual(size(root) - size({"ledger": []}), budget.MAX_RESTORE_METADATA_BYTES)
        root["ledger"].append(receipt("actor:one-too-many"))
        with self.assertRaisesRegex(ValueError, "retention"):
            budget.validate_storage_root(root)
        ledger = OperationLedger()
        for index in range(1001):
            ledger.record(f"actor:restore-{index}", "platform_restore", {"index": index}, receipt()["result"])
        retained = ledger.to_list()
        self.assertEqual(len(retained), 1000)
        self.assertEqual(retained[0]["request_id"], "actor:restore-1")
        self.assertEqual(retained[-1]["request_id"], "actor:restore-1000")
        budget.validate_storage_root({"ledger": retained})

    def test_canonical_unicode_and_escape_id_bound_is_proven(self):
        from custom_components.macromate import storage_budget as budget
        for actor, request in (("😀" * 128, "😀" * 128), ("\x01" * 128, "\\" * 128), ("a:" * 64, "b:" * 64)):
            row = receipt(actor + ":" + request)
            self.assertLessEqual(size(row), budget.MAX_CANONICAL_RECEIPT_BYTES)
            with patch.object(budget, "MAX_DATA_BYTES", size({"ledger": []})):
                budget.validate_storage_root({"ledger": [row]})

    def test_total_limit_nonfinite_containers_and_root_depth32(self):
        from custom_components.macromate import storage_budget as budget
        root = {"ledger": [receipt()]}
        with patch.object(budget, "MAX_STORAGE_BYTES", size(root) - 1):
            with self.assertRaisesRegex(ValueError, "large"):
                budget.validate_storage_root(root)
        for value in ([], {"a": float("inf")}, {"a": float("nan")}, {"a": (1,)}, {1: "bad"}, {"a": "\ud800"}):
            with self.subTest(kind=type(value)), self.assertRaises(ValueError):
                budget.validate_storage_root(value)
        leaf = "leaf"
        for _ in range(31):
            leaf = [leaf]
        budget.validate_storage_root({"deep": leaf, "ledger": [receipt()]})
        with self.assertRaisesRegex(ValueError, "nesting"):
            budget.validate_storage_root({"deep": [leaf], "ledger": [receipt()]})

    def test_exact_charged_budget_accepts_one_small_restore_receipt(self):
        self.assertIsNotNone(importlib.util.find_spec("custom_components.macromate.storage_budget"),
                             "missing bounded restore receipt budget")
        from custom_components.macromate import storage_budget as budget
        root = {"schema": 3, "ledger": [], "padding": ""}
        root["padding"] = "x" * (budget.MAX_DATA_BYTES - size(root))
        self.assertEqual(size(root), budget.MAX_DATA_BYTES)
        root["ledger"].append(receipt())
        result = budget.validate_storage_root(root)
        self.assertEqual(result, root)
        self.assertIsNot(result, root)
        result["ledger"][0]["result"]["__access"].append("detached")
        self.assertEqual(root["ledger"][0]["result"]["__access"], [])
        root["padding"] += "x"
        with self.assertRaises(ValueError):
            budget.validate_storage_root(root)


if __name__ == "__main__":
    unittest.main()
