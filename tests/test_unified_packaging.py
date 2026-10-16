"""Fail closed on any build/test/install frontend split, including stale extra chunks."""
from __future__ import annotations

from hashlib import sha256
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def frontend_inventory(directory: Path) -> dict[str, bytes]:
    if not directory.is_dir() or directory.is_symlink():
        raise AssertionError(f"Invalid frontend inventory directory: {directory}")
    files = {}
    for path in sorted(directory.rglob("*")):
        if path.is_symlink() or not (path.is_file() or path.is_dir()):
            raise AssertionError(f"Non-regular frontend inventory entry: {path}")
        if path.is_file():
            files[path.relative_to(directory).as_posix()] = path.read_bytes()
    if not files:
        raise AssertionError(f"Empty frontend inventory: {directory}")
    return files


def assert_complete_frontend(root: Path) -> None:
    source = frontend_inventory(root / "frontend")
    packaged = frontend_inventory(root / "custom_components/macromate/frontend")
    if source.keys() != packaged.keys():
        raise AssertionError(f"Frontend inventory differs: missing={sorted(source.keys() - packaged.keys())}; "
                             f"packaged-only={sorted(packaged.keys() - source.keys())}")
    changed = [name for name in source if source[name] != packaged[name]]
    if changed:
        raise AssertionError(f"Frontend bytes differ: {changed}")


class UnifiedPackagingTests(unittest.TestCase):
    def test_complete_postbuild_frontend_equals_the_installable_package(self):
        assert_complete_frontend(ROOT)


class UnifiedPackagingGateRegressionTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix="macromate-package-gate-")
        self.addCleanup(self.scratch.cleanup)
        self.root = Path(self.scratch.name)
        self.put("frontend/card.js", "export const card = 1;\n")
        self.put("frontend/unified-src/app.js", "export const app = 1;\n")
        self.put("tests/frontend/macromate-unified-fixture.mjs", "// input\n")
        self.put("frontend/unified/app.js", "export const app = 1;\n")
        artifact = self.record("frontend/unified/app.js")
        self.put("frontend/unified/build-manifest.json", json.dumps({"artifacts": [artifact]}))
        inputs = [self.record(path) for path in (
            "frontend/card.js", "frontend/unified-src/app.js",
            "tests/frontend/macromate-unified-fixture.mjs",
        )]
        self.put("frontend/unified-src/source-manifest.json", json.dumps({"files": inputs}))
        for path in (self.root / "frontend").rglob("*"):
            if path.is_file():
                self.put("custom_components/macromate/frontend/" + str(path.relative_to(self.root / "frontend")), path.read_bytes())

    def put(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content.encode() if isinstance(content, str) else content)

    def record(self, name):
        data = (self.root / name).read_bytes()
        return {"path": name, "bytes": len(data), "sha256": sha256(data).hexdigest()}

    def test_matching_complete_artifact_passes(self):
        assert_complete_frontend(self.root)

    def test_packaged_only_stale_chunk_fails(self):
        self.put("custom_components/macromate/frontend/unified/chunks/stale.js", "// stale\n")
        with self.assertRaisesRegex(AssertionError, "inventory"):
            assert_complete_frontend(self.root)

    def test_source_only_file_fails(self):
        self.put("frontend/unified/chunks/new.js", "// new\n")
        with self.assertRaisesRegex(AssertionError, "inventory"):
            assert_complete_frontend(self.root)

    def test_changed_bytes_in_every_artifact_class_fail(self):
        for name in ("card.js", "unified/app.js", "unified/build-manifest.json",
                     "unified-src/app.js", "unified-src/source-manifest.json"):
            path = self.root / "custom_components/macromate/frontend" / name
            original = path.read_bytes()
            with self.subTest(file=name):
                # Same length: neither a size-only gate nor a root-card-only gate suffices.
                path.write_bytes(b"!" + original[1:])
                with self.assertRaisesRegex(AssertionError, "bytes differ"):
                    assert_complete_frontend(self.root)
                path.write_bytes(original)

    def test_symlinked_packaged_asset_fails_even_when_bytes_match(self):
        target = self.root / "custom_components/macromate/frontend/card.js"
        target.unlink()
        target.symlink_to(self.root / "frontend/card.js")
        with self.assertRaisesRegex(AssertionError, "Non-regular"):
            assert_complete_frontend(self.root)

    def test_empty_inventory_fails(self):
        empty = self.root / "empty"
        empty.mkdir()
        with self.assertRaisesRegex(AssertionError, "Empty"):
            frontend_inventory(empty)


if __name__ == "__main__":
    unittest.main()
