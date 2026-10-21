"""Protected client behavior without sockets or a Home Assistant installation."""

from contextlib import redirect_stderr, redirect_stdout
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

from tools import macromate_scoped_client as client

TOKEN = "mm1." + "a" * 32 + "." + "b" * 43


class Response(io.BytesIO):
    def __init__(self, data, *, length=None):
        super().__init__(data)
        self.headers = {"Content-Length": str(len(data) if length is None else length)}


class ScopedClientTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.secret = Path(self.tmp.name) / "agent.secret"
        self.secret.write_text(TOKEN + "\n")
        self.secret.chmod(0o600)

    def test_lan_call_is_explicit_and_carries_unchanged_replay_id(self):
        payload = {"name": "Oats", "request_id": "Breakfast: 2026-10-21"}
        with patch.object(client, "build_opener") as build:
            with self.assertRaises(ValueError):
                client.call_action("http://192.168.1.42:8123", TOKEN, "recipes_add", payload)
            build.assert_not_called()
            build.return_value.open.return_value = Response(b'{"recipe":{"id":"literal-id"}}')
            result = client.call_action("http://192.168.1.42:8123", TOKEN, "recipes_add",
                                        payload, trusted_lan_http=True)
            request = build.return_value.open.call_args.args[0]
            self.assertEqual(request.full_url,
                             "http://192.168.1.42:8123/api/macromate/agent/action/recipes_add")
            self.assertEqual(request.get_header("Authorization"), "Bearer " + TOKEN)
            self.assertEqual(json.loads(request.data), payload)
            self.assertEqual(result, {"recipe": {"id": "literal-id"}})
            self.assertEqual(build.return_value.open.call_count, 1)

    def test_http_refusal_is_reported_without_body_token_or_retry(self):
        request_file = Path(self.tmp.name) / "request.json"
        request_file.write_text('{"name":"Oats","request_id":"keep-this-id"}')
        for status in (401, 403, 429, 503):
            with self.subTest(status=status), patch.object(client, "build_opener") as build:
                build.return_value.open.side_effect = HTTPError(
                    "https://ha.invalid/secret-path", status, TOKEN, {},
                    io.BytesIO(("sensitive server body " + TOKEN).encode()))
                stdout, stderr = io.StringIO(), io.StringIO()
                with redirect_stdout(stdout), redirect_stderr(stderr):
                    code = client.main(["--origin", "https://ha.invalid", "--secret-file",
                                        str(self.secret), "call", "recipes_add", "--json-file",
                                        str(request_file)])
                self.assertEqual(code, 1)
                self.assertEqual(stdout.getvalue(), "")
                self.assertIn(f"HTTP {status}", stderr.getvalue())
                self.assertIn("no retry", stderr.getvalue())
                for sensitive in (TOKEN, "sensitive server body", "secret-path"):
                    self.assertNotIn(sensitive, stderr.getvalue())
                self.assertEqual(build.return_value.open.call_count, 1)

    def test_uncertain_transport_and_malformed_responses_do_not_retry(self):
        failures = [URLError(TOKEN)]
        responses = [Response(b'{"id":1,"id":2}'), Response(b'{"value":NaN}'),
                     Response(b'{"ok":true}', length=100), Response(b'[]')]
        for failure in failures + responses:
            with self.subTest(failure=type(failure).__name__), patch.object(client, "build_opener") as build:
                if isinstance(failure, Exception):
                    build.return_value.open.side_effect = failure
                else:
                    build.return_value.open.return_value = failure
                with self.assertRaisesRegex(RuntimeError, "outcome uncertain; retain request_id") as raised:
                    client.call_action("https://ha.invalid", TOKEN, "recipes_add",
                                       {"name": "Oats", "request_id": "keep-this-id"})
                self.assertNotIn(TOKEN, str(raised.exception))
                self.assertEqual(build.return_value.open.call_count, 1)

    def test_protected_secret_refuses_symlinks_fifo_and_shared_permissions(self):
        self.assertEqual(client.read_secret(self.secret), TOKEN)
        self.secret.chmod(0o640)
        with self.assertRaises(ValueError):
            client.read_secret(self.secret)
        self.secret.chmod(0o600)
        link = Path(self.tmp.name) / "linked.secret"
        link.symlink_to(self.secret)
        with self.assertRaises(OSError):
            client.read_secret(link)
        fifo = Path(self.tmp.name) / "fifo.secret"
        os.mkfifo(fifo, 0o600)
        with self.assertRaises(ValueError):
            client.read_secret(fifo)

    def test_mint_stores_only_protected_token_and_never_overwrites(self):
        output = Path(self.tmp.name) / "new.secret"
        with patch.object(client, "_request", return_value={"id": "a" * 32, "token": TOKEN}) as request:
            metadata = client.mint_to_file("https://ha.invalid", self.secret, output,
                                           {"label": "Recipe agent"})
            self.assertEqual(metadata, {"id": "a" * 32})
            self.assertEqual(client.read_secret(output), TOKEN)
            self.assertEqual(output.stat().st_mode & 0o777, 0o600)
            with self.assertRaises(FileExistsError):
                client.mint_to_file("https://ha.invalid", self.secret, output,
                                    {"label": "Recipe agent"})
            self.assertEqual(request.call_count, 1)


if __name__ == "__main__":
    unittest.main()
