"""SDK legacy-upload transport boundaries (loopback, not migration semantics)."""
import json
import unittest
from unittest.mock import patch
from tests.test_agent_transfer import serve
from tools import macromate_transfer as sdk
from custom_components.macromate import storage_budget as budget


class LegacyTransferTransportTests(unittest.TestCase):
    def test_legacy_import_posts_exact_explicit_conservative_envelope(self):
        self.assertTrue(callable(getattr(sdk, "import_legacy", None)), "missing bounded legacy SDK transfer")
        for source, extra in (("recipe_manager", {}),):
            with self.subTest(source=source), serve(b'{"imported":true}') as (origin, calls):
                with patch.object(sdk, "build_opener", wraps=sdk.build_opener) as opener:
                    result = sdk.import_legacy(
                        origin, "synthetic-transfer-token", source=source, stores={"items": []},
                        request_id="stable-import", confirm=True, trusted_lan_http=True, **extra,
                    )
                    self.assertEqual(opener.call_count, 1)
                self.assertEqual(result, {"imported": True})
                self.assertEqual(len(calls), 1)
                self.assertEqual(calls[0][:2], ("POST", "/api/macromate/legacy-import"))
                self.assertEqual(json.loads(calls[0][2]), {
                    "source": source, "stores": {"items": []}, "images": {},
                    "preserve_permissions": False, "confirm": True, "request_id": "stable-import", **extra,
                })

    def test_transfer_cap_includes_only_bounded_receipt_reserve_and_envelope(self):
        self.assertEqual(sdk.MAX_TRANSFER_BYTES, budget.MAX_TRANSFER_BYTES)
        self.assertEqual(sdk.MAX_TRANSFER_BYTES, 71311360)

    def test_invalid_inputs_never_open_http(self):
        self.assertTrue(callable(getattr(sdk, "import_legacy", None)), "missing bounded legacy SDK transfer")
        defaults = dict(source="recipe_manager", stores={}, request_id="stable", confirm=True)
        cases = [dict(confirm=False), dict(source="unknown"), dict(stores=[]), dict(images=[]),
                 dict(country="de"), dict(source="shopping_list_manager"),
                 dict(source="shopping_list_manager", country=4), dict(preserve_permissions=1),
                 dict(request_id=""), dict(request_id="x" * 129), dict(request_id="bad\n"),
                 dict(stores={1: "bad"}), dict(stores={"bad": (1, 2)}),
                 dict(images={"bad": float("inf")})]
        nested = "leaf"
        for _ in range(32):
            nested = [nested]
        cases.append(dict(stores={"too_deep": nested}))
        with patch.object(sdk, "build_opener", wraps=sdk.build_opener) as opener:
            for change in cases:
                with self.subTest(change=list(change)), self.assertRaises(ValueError):
                    sdk.import_legacy("https://example.invalid", "synthetic-transfer-token", **{**defaults, **change})
            opener.assert_not_called()

    def test_explicit_permissions_images_and_finite_body_cap(self):
        self.assertTrue(callable(getattr(sdk, "import_legacy", None)), "missing bounded legacy SDK transfer")
        payload = {"source": "recipe_manager", "stores": {}, "images": {"one": "é" * 50},
                   "preserve_permissions": True, "confirm": True, "request_id": "chosen"}
        encoded = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
        with serve(b'{"imported":true}') as (origin, calls):
            kwargs = dict(source="recipe_manager", stores={}, images=payload["images"],
                          preserve_permissions=True, confirm=True, request_id="chosen", trusted_lan_http=True)
            with patch.object(sdk, "MAX_TRANSFER_BYTES", len(encoded)):
                sdk.import_legacy(origin, "synthetic-transfer-token", **kwargs)
                self.assertEqual(calls, [("POST", "/api/macromate/legacy-import", encoded)])
            with patch.object(sdk, "MAX_TRANSFER_BYTES", len(encoded) - 1):
                with self.assertRaisesRegex(ValueError, "byte limit"):
                    sdk.import_legacy(origin, "synthetic-transfer-token", **kwargs)
            self.assertEqual(len(calls), 1)


if __name__ == "__main__":
    unittest.main()
