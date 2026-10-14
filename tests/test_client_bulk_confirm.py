import contextlib
import io
import unittest
from tools.macromate_client import parser, _payload


class BulkClearClientTests(unittest.TestCase):
    def test_bulk_clear_requires_explicit_date_and_confirmation(self):
        for args in (["clear-day"],["clear-day","--date","2026-10-14"]):
            with self.subTest(args=args),contextlib.redirect_stderr(io.StringIO()),self.assertRaises(SystemExit):
                parser().parse_args(args)
        action,payload = _payload(parser().parse_args(["clear-day","--date","2026-10-14","--confirm","--request-id","clear1"]))
        self.assertEqual(action,"clear_day")
        self.assertEqual(payload,{"date":"2026-10-14","confirm":True,"request_id":"clear1"})


if __name__ == "__main__":
    unittest.main()
