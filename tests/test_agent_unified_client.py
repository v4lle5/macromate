"""Real subprocess/loopback boundary tests; fixture is not a Home Assistant runtime."""
from __future__ import annotations

import contextlib
import ast
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from tools import macromate_client as client

TOKEN = "synthetic-unified-test-token"


@contextlib.contextmanager
def server(reply=None, status=200, location=None, raw=None, declared_length: str | int | None = "actual"):
    records = []

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            payload = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            records.append((self.path, payload, self.headers.get("Authorization")))
            body = raw if raw is not None else json.dumps({
                "changed_states": [],
                "service_response": reply if reply is not None else {"echo": payload},
            }, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            if location:
                self.send_header("Location", location)
            if declared_length is not None:
                self.send_header("Content-Length", str(len(body) if declared_length == "actual" else declared_length))
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass  # The client intentionally closes oversized responses early.

        def log_message(self, format, *args):
            pass

    httpd = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{httpd.server_port}", records
    finally:
        httpd.shutdown()
        httpd.server_close()
        thread.join()


class UnifiedClientTests(unittest.TestCase):
    def test_duplicate_json_fields_are_rejected_in_inputs_and_responses(self):
        with server() as (url, records):
            for payload in ('{"request_id":"first","request_id":"second"}', '{"metadata":{"id":"one","id":"two"}}'):
                with self.subTest(payload=payload):
                    result = self.cli(url, "--trusted-lan-http", "call", "recipes_update", payload=payload)
                    self.assertEqual(result.returncode, 1)
                    self.assertEqual(result.stdout, "")
                    self.assertNotIn("first", result.stderr)
                    self.assertNotIn("second", result.stderr)
            self.assertEqual(records, [])
        with server(raw=b'{"service_response":{"id":"one","id":"two"}}') as (url, records):
            with self.assertRaisesRegex(RuntimeError, "invalid JSON"):
                client.call_service(url, TOKEN, "recipes_get", {"recipe_id": "one"}, trusted_lan_http=True)
            self.assertEqual(len(records), 1, "An ambiguous response must never auto-retry")

    def test_python_api_rejects_non_json_key_types_and_tuple_coercion_before_transport(self):
        invalid = ({1: "private"}, {"metadata": {False: "private"}}, {"items": ("a", "b")}, {"items": {"a"}})
        with server() as (url, records):
            for data in invalid:
                with self.subTest(kind=repr(type(data))), self.assertRaises(ValueError):
                    client.call_service(url, TOKEN, "recipes_add", data, trusted_lan_http=True)
            self.assertEqual(records, [])

    def test_documented_recipe_and_shopping_json_matches_actual_schemas(self):
        from custom_components.macromate.recipes import RECIPE_ACTIONS
        from custom_components.macromate.shopping import SHOPPING_ACTIONS
        from custom_components.macromate.platform_support import validate_payload

        registry = {**RECIPE_ACTIONS, **SHOPPING_ACTIONS}
        root = Path(__file__).resolve().parents[1]
        validated = 0
        for relative in ("docs/AGENT_API.md", "agent-skill/SKILL.md"):
            text = (root / relative).read_text(encoding="utf-8")
            for source in re.findall(r"```python\n(.*?)```", text, re.S):
                ast.parse(source, filename=relative)
            for raw, action in re.findall(r"printf '%s' '([^']*)' \|[^\n]*? call ([a-z][a-z0-9_]*)", text):
                data = json.loads(raw)
                if action in registry:
                    with self.subTest(document=relative, action=action):
                        validate_payload(data, registry[action]["schema"])
                        if not registry[action]["read_only"]:
                            self.assertIn("request_id", data)
                    validated += 1
        self.assertGreater(validated, 0)

    def cli(self, url, *args, payload="", token=TOKEN):
        env = {**os.environ, "HA_URL": url, "HA_TOKEN": token,
               "PYTHONDONTWRITEBYTECODE": "1"}
        return subprocess.run([sys.executable, client.__file__, *args],
                              input=payload, text=True, capture_output=True,
                              env=env, timeout=10)

    def test_representative_crud_payloads_across_all_unified_domains(self):
        # This proves transport fidelity, NOT backend CRUD/persistence/ACL behavior.
        cases = {
            "recipes_add": {"name": "Müsli", "ingredients": [{"name": "Hafer", "amount": "40", "unit": "g"}],
                            "declared_nutrition": {"calories": 210, "protein": None}, "nutrition_basis": "per_serving"},
            "recipes_get": {"recipe_id": "recipe-1"},
            "recipes_update": {"recipe_id": "recipe-1", "notes": None},
            "recipes_delete": {"recipe_id": "recipe-1"},
            "meal_plan_add": {"recipe_id": "recipe-1", "date": "2026-10-14", "meal_type": "lunch"},
            "meal_plan_get": {"week_start": "2026-10-12"},
            "meal_plan_update": {"entry_id": "plan-1", "date": "2026-10-15"},
            "meal_plan_remove": {"entry_id": "plan-1"},
            "shopping_lists_create": {"name": "Wocheneinkauf", "private": True},
            "shopping_lists_get": {"list_id": "list-1"},
            "shopping_lists_update": {"list_id": "list-1", "name": "Groceries"},
            "shopping_lists_delete": {"list_id": "list-1", "confirm": True},
            "shopping_items_add": {"list_id": "list-1", "name": "Äpfel", "quantity": 2.5, "unit": "kg"},
            "shopping_items_get_one": {"item_id": "item-1"},
            "shopping_items_update": {"item_id": "item-1", "price": None, "note": "🍎"},
            "shopping_items_delete": {"item_id": "item-1"},
            "log_meal": {"name": "Lunch", "calories": 210, "meal_type": "lunch", "date": "2026-10-14"},
            "diary": {"date": "2026-10-14"},
            "update_meal": {"entry_id": "diary-1", "protein": None},
            "delete_meal": {"entry_id": "diary-1"},
            "save_food": {"food": {"name": "Oats", "base_unit": "g", "nutrients_per_100": {"calories": 370}}},
            "food": {"food_id": "local:food-1"},
            "food_delete": {"food_id": "local:food-1"},
            "log_food": {"food_id": "local:food-1", "amount": 40, "meal_type": "breakfast", "date": "2026-10-14"},
            "update_food_entry": {"entry_id": "diary-2", "amount": 50},
            "recipe_log": {"recipe_id": "recipe-1", "servings": 1, "meal_type": "lunch", "date": "2026-10-14"},
            "recipe_entry_update": {"entry_id": "diary-3", "servings": 2},
            "recipe_to_shopping": {"recipe_id": "recipe-1", "list_id": "list-1", "ingredient_indexes": [0]},
            "plan_to_shopping": {"week_start": "2026-10-12", "list_id": "list-1"},
            "meal_plan_clear": {"week_start": "2026-10-12", "confirm": True},
            "shopping_items_clear_checked": {"list_id": "list-1", "confirm": True},
            "global_timers_add": {"label": "Cook", "duration": 120},
            "global_timers_get": {"timer_id": "timer-1"},
            "global_timers_update": {"timer_id": "timer-1", "running": False},
            "global_timers_delete": {"timer_id": "timer-1"},
            "timer_presets_add": {"name": "Tea", "seconds": 180},
            "timer_presets_get": {"preset_id": "preset-1"},
            "timer_presets_update": {"preset_id": "preset-1", "seconds": 120},
            "timer_presets_delete": {"preset_id": "preset-1"},
            "shopping_products_add": {"name": "Oats", "category_id": "other"},
            "shopping_products_get": {"product_id": "NZ:oats"},
            "shopping_products_update": {"product_id": "product-1", "price": None},
            "shopping_products_delete": {"product_id": "product-1"},
            "shopping_categories_add": {"name": "Pantry"},
            "shopping_categories_get_all": {"country": "NZ"},
            "shopping_categories_update": {"category_id": "category-1", "name": "Dry goods"},
            "shopping_categories_delete": {"category_id": "category-1"},
            "shopping_loyalty_add": {"name": "Example store", "number": "000123", "private": True},
            "shopping_loyalty_get": {"card_id": "card-1"},
            "shopping_loyalty_update": {"card_id": "card-1", "notes": "Synthetic data"},
            "shopping_loyalty_delete": {"card_id": "card-1"},
            "shopping_regions_create": {"code": "EX", "name": "Example"},
            "shopping_regions_get": {"code": "EX"},
            "shopping_regions_update": {"code": "EX", "currency": "EUR"},
            "shopping_regions_delete": {"code": "EX", "confirm": True},
            "shopping_get_integration_settings": {},
            "shopping_update_integration_settings": {"metric_units_only": True},
            "preferences_update": {"preferences": {"theme": "dark"}},
            "preferences_get": {},
        }
        reads = {"recipes_get", "meal_plan_get", "shopping_lists_get", "shopping_items_get_one", "diary", "food",
                 "global_timers_get", "timer_presets_get", "shopping_products_get", "shopping_categories_get_all",
                 "shopping_loyalty_get", "shopping_regions_get", "shopping_get_integration_settings", "preferences_get"}
        with server() as (url, records):
            for index, (action, original) in enumerate(cases.items()):
                payload = dict(original)
                if action not in reads:
                    payload["request_id"] = f"sample-{index}-v1"
                with self.subTest(action=action):
                    result = self.cli(url, "--trusted-lan-http", "call", action, payload=json.dumps(payload))
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(json.loads(result.stdout), {"echo": payload})
                    self.assertEqual(records[-1][:2], (f"/api/services/macromate/{action}?return_response", payload))
            self.assertEqual(len(records), len(cases))

    def test_legacy_cli_commands_and_missing_environment_remain_compatible(self):
        cases = [(["list", "--date", "2026-10-14"], "list_meals", {"date": "2026-10-14"}),
                 (["update", "diary-1", "--name", "Correction", "--request-id", "correct-1"], "update_meal",
                  {"entry_id": "diary-1", "name": "Correction", "request_id": "correct-1"}),
                 (["delete", "diary-1", "--request-id", "delete-1"], "delete_meal",
                  {"entry_id": "diary-1", "request_id": "delete-1"}),
                 (["clear-day", "--date", "2026-10-14", "--confirm", "--request-id", "clear-1"], "clear_day",
                  {"date": "2026-10-14", "confirm": True, "request_id": "clear-1"})]
        with server() as (url, records):
            for args, action, data in cases:
                result = self.cli(url, "--trusted-lan-http", *args)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(records[-1][:2], (f"/api/services/macromate/{action}?return_response", data))
        for url, token in (("", TOKEN), ("https://ha.example", "")):
            result = self.cli(url, "describe", token=token)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(result.stdout, "")
            self.assertNotIn(TOKEN, result.stderr)

    def test_generic_errors_are_sanitized_and_never_retried(self):
        secret_body = (TOKEN + " private diary contents").encode()
        with server() as (target, target_records):
            for status, body, location in ((403, secret_body, None), (500, secret_body, None),
                                           (307, secret_body, target + "/stolen"),
                                           (200, secret_body, None), (200, b'{"n":1e999}', None)):
                with self.subTest(status=status), server(status=status, raw=body, location=location) as (url, records):
                    result = self.cli(url, "--trusted-lan-http", "call", "recipes_delete",
                                      payload='{"recipe_id":"recipe-1","request_id":"delete-1"}')
                    self.assertEqual(result.returncode, 1)
                    self.assertEqual(result.stdout, "")
                    self.assertNotIn(TOKEN, result.stderr)
                    self.assertNotIn("private diary", result.stderr)
                    self.assertNotIn("Traceback", result.stderr)
                    self.assertEqual(len(records), 1)
            self.assertEqual(target_records, [])
        with server() as (url, records):
            for origin, action in ((url, "recipes_get"), ("https://user:secret@ha.example", "recipes_get"),
                                   (url, "../stolen")):
                args = [] if origin == url and action == "recipes_get" else ["--trusted-lan-http"]
                result = self.cli(origin, *args, "call", action, payload="{}")
                self.assertEqual(result.returncode, 1)
                self.assertNotIn("secret", result.stderr)
            self.assertEqual(records, [])

    def test_responses_are_bounded_and_unicode_valid_before_cli_output(self):
        bodies = [b'{"service_response":{"x":"' + b'x' * (4 * 1024 * 1024) + b'"}}',
                  b'{"service_response":{"x":"\\ud800"}}']
        for body in bodies:
            with self.subTest(body_size=len(body)), server(raw=body) as (url, records):
                result = self.cli(url, "--trusted-lan-http", "describe")
                self.assertEqual(result.returncode, 1)
                self.assertEqual(result.stdout, "")
                self.assertNotIn("Traceback", result.stderr)
                self.assertNotIn(TOKEN, result.stderr)
                self.assertEqual(len(records), 1, "No automatic retry after ambiguous response")

    def test_response_limits_without_length_and_truncation_are_sanitized(self):
        for raw, declared_length in ((b'"' + b'x' * client.MAX_RESPONSE_BYTES + b'"', None),
                                     (b'{}', 100), (b'{"service_response":', None),
                                     (b'\xff', None), (b'{"n":NaN}', None)):
            with self.subTest(length=declared_length), server(raw=raw, declared_length=declared_length) as (url, records):
                result = self.cli(url, "--trusted-lan-http", "call", "diary", payload="{}")
                self.assertEqual(result.returncode, 1)
                self.assertEqual(result.stdout, "")
                self.assertNotIn("Traceback", result.stderr)
                self.assertEqual(len(records), 1)

    def test_file_request_limit_and_invalid_utf8_are_checked_before_transport(self):
        with tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"]) as tmp:
            path = Path(tmp) / "data.json"
            with server() as (url, records):
                for raw in (b'{"data":"' + b'x' * client.MAX_REQUEST_BYTES + b'"}', b'\xff'):
                    path.write_bytes(raw)
                    result = self.cli(url, "--trusted-lan-http", "call", "recipes_add", "--json-file", str(path))
                    self.assertEqual(result.returncode, 1)
                    self.assertNotIn(tmp, result.stderr)
                    self.assertNotIn("Traceback", result.stderr)
                self.assertEqual(records, [])

    def test_encoded_request_at_exact_limit_is_allowed(self):
        overhead = len(json.dumps({"x": ""}).encode("utf-8"))
        data = {"x": "x" * (client.MAX_REQUEST_BYTES - overhead)}
        with server(reply={"ok": True}) as (url, records):
            result = self.cli(url, "--trusted-lan-http", "call", "future_action", payload=json.dumps(data))
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(len(records), 1)
            self.assertEqual(records[0][1], data)

    def test_argument_errors_never_echo_private_arguments(self):
        for args in (["call", "recipes_add", "--token", TOKEN],
                     ["add", "--name", "private meal", "--meal-type", TOKEN, "--calories", "10"],
                     ["update", "entry-1", "--calories", TOKEN]):
            result = self.cli("https://ha.example", *args)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(result.stdout, "")
            self.assertNotIn(TOKEN, result.stderr)
            self.assertNotIn("private meal", result.stderr)

    def test_credentials_and_origin_are_not_silently_trimmed(self):
        with server() as (url, records):
            for origin, token in ((" " + url, TOKEN), (url, TOKEN + "\n")):
                result = self.cli(origin, "--trusted-lan-http", "describe", token=token)
                self.assertEqual(result.returncode, 1)
                self.assertEqual(result.stdout, "")
                self.assertNotIn(TOKEN, result.stderr)
            self.assertEqual(records, [])

    def test_describe_returns_live_action_descriptors_without_hardcoded_allowlist(self):
        descriptor = {"description": "Read future feature", "read_only": True,
                      "admin_only": False, "schema": {"type": "object",
                      "properties": {"target": {"type": "string"}},
                      "required": ["target"], "additionalProperties": False}}
        discovery = {"version": 1, "actions": {"future_feature_get": descriptor},
                     "legacy_services": {"list_meals": "diary"}, "limits": {"ledger": 1000}}
        with server(reply=discovery) as (url, records):
            result = self.cli(url, "--trusted-lan-http", "describe")
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout), discovery)
            self.assertEqual(records[0][:2], ("/api/services/macromate/describe?return_response", {}))
            result = self.cli(url, "--trusted-lan-http", "call", "future_feature_get",
                              payload='{"target":"exact-object"}')
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(records[-1][0], "/api/services/macromate/future_feature_get?return_response")

    def test_diary_explicit_date_and_copy_do_not_invent_macros_or_ids(self):
        cases = [(["add", "--name", "Müsli", "--meal-type", "lunch", "--calories", "12",
                   "--date", "2026-10-14", "--protein", "0", "--request-id", "add-1"],
                  "log_meal", {"name": "Müsli", "meal_type": "lunch", "calories": 12,
                   "date": "2026-10-14", "protein": 0, "request_id": "add-1"}),
                 (["copy", "entry-7", "--date", "2026-10-15", "--meal-type", "snack",
                   "--request-id", "copy-1"], "copy_meal", {"entry_id": "entry-7",
                   "date": "2026-10-15", "meal_type": "snack", "request_id": "copy-1"})]
        with server() as (url, records):
            for args, action, payload in cases:
                result = self.cli(url, "--trusted-lan-http", *args)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(records[-1][:2], (f"/api/services/macromate/{action}?return_response", payload))
            count = len(records)
            for args in (["copy", "entry-7"],
                         ["add", "--name", "x", "--meal-type", "lunch", "--calories", "12",
                          "--date", "2026-10-14", "--eaten-at", "2026-10-15T10:00:00+00:00"]):
                result = self.cli(url, "--trusted-lan-http", *args)
                self.assertEqual(result.returncode, 2)
            self.assertEqual(len(records), count)

    def test_generic_json_input_is_bounded_finite_object_and_sanitized(self):
        private = "private meal text " + TOKEN
        cases = [private, "", "null", "[]", '{"n":NaN}', '{"n":Infinity}',
                 '{"n":1e999}', '{"secret":"\\ud800"}',
                 '{"x":"' + 'x' * (1024 * 1024) + '"}']
        with server() as (url, records):
            for payload in cases:
                with self.subTest(payload_length=len(payload)):
                    result = self.cli(url, "--trusted-lan-http", "call", "recipes_add", payload=payload)
                    self.assertEqual(result.returncode, 1)
                    self.assertEqual(result.stdout, "")
                    self.assertNotIn(TOKEN, result.stderr)
                    self.assertNotIn("private meal", result.stderr)
                    self.assertNotIn("Traceback", result.stderr)
            self.assertEqual(records, [])

    def test_payload_file_and_explicit_stdin_preserve_data(self):
        payload = {"entry_id": "entry-1", "protein": None, "request_id": "patch-1"}
        with tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"]) as tmp:
            path = Path(tmp) / "payload.json"
            path.write_text(json.dumps(payload), encoding="utf-8")
            with server() as (url, records):
                for source in (str(path), "-"):
                    result = self.cli(url, "--trusted-lan-http", "call", "update_meal",
                                      "--json-file", source, payload=json.dumps(payload))
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(json.loads(result.stdout), {"echo": payload})
                self.assertEqual([r[1] for r in records], [payload, payload])
            with server() as (url, records):
                result = self.cli(url, "--trusted-lan-http", "call", "update_meal",
                                  "--json-file", str(Path(tmp) / TOKEN))
                self.assertEqual(result.returncode, 1)
                self.assertNotIn(TOKEN, result.stderr)
                self.assertNotIn(tmp, result.stderr)
                self.assertEqual(records, [])

    def test_python_payload_size_and_unicode_errors_are_sanitized(self):
        with server() as (url, records):
            for data in ({"x": "x" * (1024 * 1024)}, {"x": "\ud800"}):
                with self.subTest(size=len(data["x"])):
                    with self.assertRaisesRegex(ValueError, "payload"):
                        client.call_service(url, TOKEN, "recipes_add", data, trusted_lan_http=True)
            self.assertEqual(records, [])

    def test_generic_stdin_preserves_nested_null_unicode_and_object_ids(self):
        payload = {"recipe_id": "recipe-17", "metadata": {"name": "Müsli 🍓",
                   "nutrition": {"protein": None, "carbs": 0},
                   "ingredients": [{"name": "Äpfel", "quantity": 1.25}]},
                   "request_id": "recipe-edit-17-v1"}
        with server() as (url, records):
            result = self.cli(url, "--trusted-lan-http", "call", "recipes_update",
                              payload=json.dumps(payload))
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout), {"echo": payload})
            self.assertEqual(records, [("/api/services/macromate/recipes_update?return_response",
                                        payload, "Bearer " + TOKEN)])
            self.assertEqual(result.stderr, "")


if __name__ == "__main__":
    unittest.main()
