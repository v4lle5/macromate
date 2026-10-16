"""Ensure the unified platform is exercised, not omitted by legacy CI globs."""
from __future__ import annotations

import json
from pathlib import Path
import re
import shlex
import unittest

ROOT = Path(__file__).resolve().parents[1]


def job(name: str) -> str:
    workflow = (ROOT / ".github/workflows/validate.yml").read_text()
    found = re.search(rf"^  {re.escape(name)}:\n(.*?)(?=^  [\w-]+:|\Z)", workflow, re.M | re.S)
    if found is None:
        raise AssertionError(f"Missing CI job: {name}")
    return found.group(1)


class UnifiedCIContractTests(unittest.TestCase):
    def test_native_jobs_install_the_components_actual_pinned_requirements(self):
        requirements = json.loads((ROOT / "custom_components/macromate/manifest.json").read_text())["requirements"]
        for name in ("ha-runtime", "frontend"):
            with self.subTest(job=name):
                commands = re.findall(r"python -m pip install ([^\n]+)", job(name))
                installed = {argument for command in commands for argument in shlex.split(command)}
                self.assertTrue(set(requirements) <= installed,
                                f"{name} must install manifest requirements, not depend on a developer's venv")
                self.assertIn("homeassistant==2026.10.1", installed)

    def test_unified_source_build_is_installed_without_upstream_install_hooks(self):
        block = job("frontend")
        self.assertIn("frontend/unified-src/package.json", block)
        self.assertIn("frontend/unified-src/package-lock.json", block)
        self.assertRegex(block, r"npm ci[^\n]*--ignore-scripts[^\n]*MACROMATE_BUILD_DEPS")

    def test_unified_and_native_acceptance_are_not_lost_by_test_glob(self):
        block = job("frontend")
        self.assertIn("node tests/frontend/macromate-unified-verify.mjs", block)
        self.assertIn("python tests/ha/native_unified_browser.py", block)
        self.assertIn("PLAYWRIGHT_DIR", block)
        self.assertIn("EVIDENCE_DIR", block)
        self.assertIn("MACROMATE_BUILD_DEPS", block)
        # Rebuilding must not leave the old package equality check as the only one.
        after_build = block.split("node tests/frontend/macromate-unified-verify.mjs", 1)[1]
        self.assertIn("node --test tests/frontend/macromate-card.test.mjs", after_build)
        self.assertIn("tests/frontend/macromate-artifact.test.mjs", after_build,
                      "Rerun the pre-existing complete Node artifact gate after rebuilding too")
        equality = "python -m unittest discover -s tests -p test_unified_packaging.py -v"
        self.assertIn(equality, after_build,
                      "Rebuild must be followed by exhaustive source/package inventory and byte equality")
        self.assertLess(after_build.index(equality), after_build.index("python tests/ha/native_unified_browser.py"),
                        "Do not launch installed/native acceptance against stale packaged assets")

    def test_cross_directory_build_regression_is_executed_with_build_dependencies(self):
        block = job("frontend")
        self.assertIn("node --test tests/frontend/macromate-unified-build.test.mjs", block)
        self.assertIn("MACROMATE_BUILD_DEPS", block)

    def test_headless_harnesses_honor_the_ci_browser_executable(self):
        for suffix in ("browser", "domain-browser", "nutrition-browser", "workflows", "refresh-browser", "native"):
            path = ROOT / f"tests/frontend/macromate-unified-{suffix}.mjs"
            with self.subTest(script=path.name):
                self.assertTrue("CHROMIUM_PATH" in path.read_text(),
                                "Use the CI-provided Playwright executable, not a host-specific system path")


if __name__ == "__main__":
    unittest.main()
