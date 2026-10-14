"""Installable HACS artifact contains the same local panel that is browser-tested."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PanelPackagingTests(unittest.TestCase):
    def test_hacs_component_contains_all_runtime_frontend_files(self):
        source = ROOT / "frontend"
        packaged = ROOT / "custom_components/macromate/frontend"
        files = [p for p in source.rglob("*") if p.is_file()]
        self.assertTrue(files)
        for p in files:
            target = packaged / p.relative_to(source)
            self.assertTrue(target.is_file(), str(target))
            self.assertEqual(p.read_bytes(),target.read_bytes(),str(target))


if __name__ == "__main__":
    unittest.main()
