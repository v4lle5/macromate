"""Private transfer error paths; loopback transport fixture, not HA semantics."""
import contextlib
import json

import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch
from tools import macromate_transfer as transfer


@contextlib.contextmanager
def serve(body, *, status=200, location=None):
    records = []
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            records.append((self.command, self.path))
            self.send_response(status)
            if location:
                self.send_header("Location", location)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        def do_POST(self):
            raw = self.rfile.read(int(self.headers["Content-Length"]))
            records.append((self.command, self.path, raw))
            self.send_response(status)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        def log_message(self, format, *args):
            pass
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", records
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


class TransferBoundaryTests(unittest.TestCase):
    def test_redirect_is_refused_before_forwarding_credentials(self):
        with serve(b'{"data":{}}') as (target, targets):
            with serve(b"private server detail", status=307, location=target) as (origin, calls):
                with self.assertRaisesRegex(RuntimeError, "redirects are disabled"):
                    transfer.download_backup(origin, "synthetic-transfer-token", trusted_lan_http=True)
                self.assertEqual(calls, [("GET", "/api/macromate/backup")])
            self.assertEqual(targets, [])

    def test_invalid_duplicate_nonfinite_and_oversized_responses_fail_closed(self):
        cases = (b'{"data":{"id":1,"id":2}}', b'{"data":{"n":1e999}}', b'{"data":[]}', b'not json', b'"' + b'x' * 500 + b'"')
        for body in cases:
            with self.subTest(size=len(body)), serve(body) as (origin, calls):
                with patch.object(transfer, "MAX_TRANSFER_BYTES", 256), self.assertRaises(RuntimeError) as caught:
                    transfer.download_backup(origin, "synthetic-transfer-token", trusted_lan_http=True)
                self.assertNotIn("synthetic-transfer-token", str(caught.exception))
                self.assertEqual(len(calls), 1)

    def test_restore_depth32_root_does_not_relax_generic_client_depth(self):
        nested = "leaf"
        for _ in range(31):
            nested = [nested]
        data = {"deep": nested}
        transfer.client._validate_json_data(data)
        with self.assertRaisesRegex(ValueError, "nesting"):
            transfer.client._validate_json_data({"data": data})
        with serve(b'{"restored":true}') as (origin, calls):
            result = transfer.restore_backup(
                origin, "synthetic-transfer-token", data,
                request_id="depth32", confirm=True, trusted_lan_http=True,
            )
            self.assertEqual(result, {"restored": True})
            self.assertEqual(len(calls), 1)
            self.assertEqual(json.loads(calls[0][2]), {"data": data, "confirm": True, "request_id": "depth32"})
            with patch.object(transfer, "build_opener", wraps=transfer.build_opener) as opener:
                with self.assertRaisesRegex(ValueError, "transfer payload must be finite JSON data"):
                    transfer.restore_backup(
                        origin, "synthetic-transfer-token", {"deep": [nested]},
                        request_id="depth33", confirm=True, trusted_lan_http=True,
                    )
                opener.assert_not_called()
            self.assertEqual(len(calls), 1)

    def test_restore_encoded_body_limit_includes_envelope_and_utf8(self):
        self.assertEqual(transfer.MAX_DATA_BYTES, 64 * 1024 * 1024)
        self.assertEqual(transfer.MAX_STORAGE_BYTES, transfer.MAX_DATA_BYTES + 4 * 1024 * 1024)
        self.assertEqual(transfer.MAX_TRANSFER_BYTES, transfer.MAX_STORAGE_BYTES + 8192)
        data = {"notes": "é" * 100}
        payload = {"data": data, "confirm": True, "request_id": "stable-id"}
        encoded = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
        with serve(b'{"restored":true}') as (origin, calls):
            with patch.object(transfer, "MAX_TRANSFER_BYTES", len(encoded)):
                result = transfer.restore_backup(
                    origin, "synthetic-transfer-token", data,
                    request_id="stable-id", confirm=True, trusted_lan_http=True,
                )
                self.assertEqual(result, {"restored": True})
                self.assertEqual(calls, [("POST", "/api/macromate/restore", encoded)])
                with patch.object(transfer, "build_opener", wraps=transfer.build_opener) as opener:
                    with self.assertRaisesRegex(ValueError, "^transfer request exceeds the byte limit$"):
                        transfer.restore_backup(
                            origin, "synthetic-transfer-token", {"notes": data["notes"] + "x"},
                            request_id="stable-id", confirm=True, trusted_lan_http=True,
                        )
                    opener.assert_not_called()
                self.assertEqual(len(calls), 1)

    def test_unconfirmed_or_non_json_restore_never_sends(self):
        with serve(b'{"data":{}}') as (origin, calls):
            cases = [(dict(data={}, request_id="one", confirm=False)),
                     dict(data={1: "value"}, request_id="one", confirm=True),
                     dict(data={}, request_id="", confirm=True),
                     dict(data={}, request_id=" " * 4, confirm=True),
                     dict(data={}, request_id="x" * 129, confirm=True),
                     dict(data={"value": {1: "value"}}, request_id="one", confirm=True),
                     dict(data={"value": (1, 2)}, request_id="one", confirm=True),
                     dict(data={"value": float("inf")}, request_id="one", confirm=True),
                     dict(data={"value": float("nan")}, request_id="one", confirm=True)]
            for kwargs in cases:
                with self.subTest(case=tuple(kwargs)), self.assertRaises(ValueError):
                    transfer.restore_backup(origin, "synthetic-transfer-token", trusted_lan_http=True, **kwargs)
            self.assertEqual(calls, [])


if __name__ == "__main__":
    unittest.main()
