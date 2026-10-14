"""Client boundary tests with synthetic tokens and loopback HTTP only."""
from __future__ import annotations

import contextlib
import json
import os
import subprocess
import sys
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch

from tools import macromate_client as client

TOKEN = "synthetic-test-token"


@contextlib.contextmanager
def server(*, status=200, body=b'{"service_response":{"ok":true}}', location=None,
           declared_length=None):
    records = []

    class Handler(BaseHTTPRequestHandler):
        def handle_request(self):
            length = int(self.headers.get("Content-Length", 0))
            records.append({"method": self.command, "path": self.path,
                            "headers": dict(self.headers), "body": self.rfile.read(length)})
            self.send_response(status)
            if location:
                self.send_header("Location", location)
            self.send_header("Content-Type", "application/json")
            if declared_length is not None:
                self.send_header("Content-Length", str(declared_length))
            self.end_headers()
            self.wfile.write(body)

        do_POST = handle_request
        do_GET = handle_request

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


class ClientSecurityTests(unittest.TestCase):
    def test_truncated_http_response_is_sanitized(self):
        with server(body=b'{}', declared_length=100) as (url, records):
            with self.assertRaisesRegex(RuntimeError, "invalid HTTP response") as caught:
                client.call_service(url, TOKEN, "list_meals", {}, trusted_lan_http=True)
            self.assertTrue(caught.exception.__suppress_context__)

    def run_cli(self, url, *args, token=TOKEN):
        env = {"PATH": os.environ.get("PATH", ""), "HA_URL": url, "HA_TOKEN": token,
               "PYTHONDONTWRITEBYTECODE": "1"}
        return subprocess.run([sys.executable, client.__file__, *args], env=env,
                              capture_output=True, text=True, timeout=10)

    def test_existing_cli_command_payloads_and_exit_codes(self):
        cases = [(["list"], "list_meals", {}),
                 (["list", "--date", "2026-10-14"], "list_meals", {"date": "2026-10-14"}),
                 (["update", "m", "--protein", "0", "--carbs", "10", "--fat", "5",
                   "--meal-type", "snack", "--eaten-at", "2026-10-14T10:00:00+02:00"],
                  "update_meal", {"entry_id": "m", "protein": 0, "carbs": 10, "fat": 5,
                                  "meal_type": "snack", "eaten_at": "2026-10-14T10:00:00+02:00"}),
                 (["delete", "m"], "delete_meal", {"entry_id": "m"}),
                 (["clear-day","--date","2026-10-14","--confirm"], "clear_day", {"date":"2026-10-14","confirm":True})]
        for args, action, payload in cases:
            with self.subTest(args=args), server() as (url, records):
                result = self.run_cli(url, "--trusted-lan-http", *args)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads(result.stdout), {"ok": True})
                self.assertEqual(result.stderr, "")
                self.assertEqual(len(records), 1)
                self.assertEqual(json.loads(records[0]["body"]), payload)
                self.assertEqual(records[0]["path"], f"/api/services/macromate/{action}?return_response")
        for url, token in (("", TOKEN), ("https://ha.example", "")):
            result = self.run_cli(url, "list", token=token)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(result.stdout, "")
            self.assertEqual(result.stderr.strip(), "HA_URL and HA_TOKEN must be set")
        result = self.run_cli("https://ha.example", "add")
        self.assertEqual(result.returncode, 2)
        for status, body, location, message in (
            (401, TOKEN.encode(), None, "HTTP 401"),
            (302, b"", "/elsewhere", "redirects are disabled"),
            (200, TOKEN.encode(), None, "invalid JSON"),
        ):
            with self.subTest(status=status), server(status=status, body=body, location=location) as (url, records):
                result = self.run_cli(url, "--trusted-lan-http", "list")
                self.assertEqual(result.returncode, 1)
                self.assertEqual(result.stdout, "")
                self.assertIn(message, result.stderr)
                self.assertNotIn(TOKEN, result.stderr)
                self.assertNotIn("Traceback", result.stderr)

    def test_nonresponse_request_preserves_raw_state_change_list(self):
        with server(body=b'[{"entity_id":"sensor.synthetic"}]') as (url, records):
            result = client.call_service(url, TOKEN, "delete_meal", {"entry_id": "m"},
                                         response=False, trusted_lan_http=True)
            self.assertEqual(result, {"result": [{"entity_id": "sensor.synthetic"}]})
            self.assertEqual(records[0]["path"], "/api/services/macromate/delete_meal")

    def test_invalid_auth_or_payload_never_reaches_transport(self):
        for token, data, message in (("", {}, "HA_TOKEN"), (TOKEN + "\nsecret", {}, "HA_TOKEN"),
                                     ("token with spaces", {}, "HA_TOKEN"),
                                     (TOKEN, [], "payload"), (TOKEN, {"n": float("nan")}, "payload"),
                                     (TOKEN, {"bad": object()}, "payload")):
            with self.subTest(message=message), patch.object(client, "build_opener") as factory:
                factory.return_value.open.return_value.__enter__.return_value.read.return_value = b"{}"
                with self.assertRaisesRegex(ValueError, message) as caught:
                    client.call_service("https://ha.example", token, "log_meal", data)
                self.assertNotIn(TOKEN, str(caught.exception))
                factory.assert_not_called()

    def test_every_mutation_cli_forwards_optional_request_id(self):
        cases = [(["update", "m", "--name", "Corrected", "--calories", "600", "--request-id", "u"],
                  "update_meal", {"entry_id": "m", "name": "Corrected", "calories": 600, "request_id": "u"}),
                 (["delete", "m", "--request-id", "d"], "delete_meal", {"entry_id": "m", "request_id": "d"}),
                 (["clear-day", "--date", "2026-10-14", "--confirm", "--request-id", "c"], "clear_day",
                  {"date": "2026-10-14", "confirm":True, "request_id": "c"})]
        for args, action, expected in cases:
            with self.subTest(command=args[0]), server() as (url, records):
                result = self.run_cli(url, "--trusted-lan-http", *args)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads(records[0]["body"]), expected)
                self.assertEqual(records[0]["path"], f"/api/services/macromate/{action}?return_response")

    def test_cli_trusted_lan_flag_is_explicit_and_not_sent_in_payload(self):
        with server() as (url, records):
            result = self.run_cli(url, "--trusted-lan-http", "add", "--name", "Müsli",
                                  "--meal-type", "breakfast", "--calories", "500",
                                  "--request-id", "r")
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout), {"ok": True})
            self.assertEqual(result.stderr, "")
            self.assertEqual(json.loads(records[0]["body"]),
                             {"name": "Müsli", "meal_type": "breakfast", "calories": 500,
                              "protein": 0, "carbs": 0, "fat": 0, "request_id": "r"})

    def test_cli_rejects_insecure_or_invalid_url_without_traceback(self):
        with server() as (url, records):
            result = self.run_cli(url, "list")
            self.assertEqual(result.returncode, 1)
            self.assertEqual(result.stdout, "")
            self.assertIn("HTTPS", result.stderr)
            self.assertNotIn("Traceback", result.stderr)
            self.assertNotIn(TOKEN, result.stderr)
            self.assertEqual(records, [])
        result = self.run_cli("https://user:secret@ha.example", "list")
        self.assertEqual(result.returncode, 1)
        self.assertNotIn("secret", result.stderr)
        self.assertNotIn("Traceback", result.stderr)

    def test_response_unwrapping_always_returns_a_dictionary(self):
        cases = [( {"service_response": {"entries": []}, "changed_states": []}, {"entries": []}),
                 ({"entries": []}, {"entries": []}), ([], {"result": []}),
                 ({"service_response": [1]}, {"result": [1]}),
                 ({"service_response": None}, {"result": None}),
                 (False, {"result": False})]
        for body, expected in cases:
            with self.subTest(body=body), server(body=json.dumps(body).encode()) as (url, records):
                self.assertEqual(client.call_service(url, TOKEN, "list_meals", {},
                                                     trusted_lan_http=True), expected)
                self.assertEqual(records[0]["method"], "POST")
                self.assertEqual(records[0]["headers"]["Authorization"], f"Bearer {TOKEN}")
                self.assertEqual(records[0]["headers"]["Content-Type"], "application/json")
                self.assertEqual(records[0]["path"], "/api/services/macromate/list_meals?return_response")

    def test_invalid_json_response_is_a_sanitized_runtime_error(self):
        for body in (b"not json " + TOKEN.encode(), b"\xff", b'{"n":NaN}', b'{"n":Infinity}',
                     b'{"nested":[1e999]}'):
            with self.subTest(body=body), server(body=body) as (url, records):
                with self.assertRaisesRegex(RuntimeError, "invalid JSON") as caught:
                    client.call_service(url, TOKEN, "list_meals", {}, trusted_lan_http=True)
                self.assertNotIn(TOKEN, str(caught.exception))
                self.assertTrue(caught.exception.__suppress_context__)

    def test_network_and_timeout_errors_are_sanitized(self):
        from urllib.error import URLError
        for error, message in ((URLError(TOKEN + " secret URL"), "Home Assistant is unreachable"),
                               (TimeoutError(TOKEN), "Home Assistant request timed out"),
                               (OSError(TOKEN), "Home Assistant is unreachable")):
            with self.subTest(error=type(error).__name__):
                with patch.object(client, "build_opener") as factory:
                    factory.return_value.open.side_effect = error
                    with self.assertRaises(RuntimeError) as caught:
                        client.call_service("https://ha.example", TOKEN, "list_meals", {})
                    self.assertEqual(str(caught.exception), message)
                    self.assertTrue(caught.exception.__suppress_context__)
                    self.assertEqual(factory.return_value.open.call_args.kwargs["timeout"], 20)

    def test_http_errors_do_not_echo_response_body_or_request_secrets(self):
        for status in (400, 401, 403, 404, 500):
            with self.subTest(status=status):
                with server(status=status, body=(TOKEN + " private meal text").encode()) as (url, records):
                    with self.assertRaises(RuntimeError) as caught:
                        client.call_service(url, TOKEN, "list_meals", {}, trusted_lan_http=True)
                    self.assertEqual(str(caught.exception), f"Home Assistant returned HTTP {status}")
                    self.assertTrue(caught.exception.__suppress_context__)
                    self.assertEqual(len(records), 1)

    def test_redirects_never_forward_bearer_or_issue_a_second_request(self):
        with server() as (target, target_records):
            for status in (301, 302, 303, 307, 308):
                for location in (target + "/stolen", "/same-origin", "https://localhost:1/",
                                 target.replace("127.0.0.1", "localhost") + "/chain"):
                    with self.subTest(status=status, location=location):
                        with server(status=status, location=location) as (url, records):
                            with self.assertRaisesRegex(RuntimeError, "redirects are disabled"):
                                client.call_service(url, TOKEN, "log_meal", {"name": "test"},
                                                    trusted_lan_http=True)
                            self.assertEqual(len(records), 1)
                        self.assertEqual(target_records, [])

    def test_rejects_ambiguous_origins_and_endpoint_injection(self):
        invalid = ["https://user:secret@ha.example", "https://ha.example@evil.example",
                   "https:///missing", "https://", "https://ha.example:bad",
                   "https://ha.example:0", "https://ha.example:65536", "https://ha.example:",
                   "https://ha.example/path", "https://ha.example?secret=value",
                   "https://ha.example#fragment", "https://ha.example?", "https://ha.example#",
                   " https://ha.example", "https://ha.example\n", "https://ha.example\\evil",
                   "https://ha%2eexample", "https://ha..example", "https://[invalid]",
                   "https://ha.example..", "https://[::1]ignored", "https://ha.example:١٢",
                   "https://" + ".".join(["a" * 63] * 5),
                   "file:///secret", "//ha.example", None]
        for url in invalid:
            with self.subTest(url=url), self.assertRaises(ValueError):
                client.service_url(url, "list_meals", response=True, trusted_lan_http=True)
        for service in ("../delete", "list_meals?other", "https://evil", "", "x/y"):
            with self.subTest(service=service), self.assertRaises(ValueError):
                client.service_url("https://ha.example", service, response=True)
        self.assertEqual(client.service_url("https://[::1]:8123/", "list_meals", response=True),
                         "https://[::1]:8123/api/services/macromate/list_meals?return_response")

    def test_https_required_unless_explicit_trusted_lan_opt_in(self):
        with self.assertRaisesRegex(ValueError, "HTTPS"):
            client.service_url("http://homeassistant.local:8123", "list_meals", response=True)
        self.assertEqual(
            client.service_url("http://homeassistant.local:8123/", "list_meals",
                               response=True, trusted_lan_http=True),
            "http://homeassistant.local:8123/api/services/macromate/list_meals?return_response")
