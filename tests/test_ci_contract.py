"""Publication contracts that reproduce previously failing CI configuration."""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import stat
import subprocess
import tempfile
import textwrap
import unittest

ROOT = Path(__file__).resolve().parents[1]
COMPONENT = ROOT / "custom_components/macromate"


class CIContractTests(unittest.TestCase):
    def test_optional_http_use_is_declared_without_forcing_headless_http(self):
        manifest = json.loads((COMPONENT / "manifest.json").read_text())
        self.assertIn("http", manifest.get("after_dependencies", []))
        self.assertNotIn("http", manifest.get("dependencies", []))

    def test_service_translations_have_names_and_descriptions_for_all_actions(self):
        services = set(re.findall(r"^([a-z_]+):$", (COMPONENT / "services.yaml").read_text(), re.M))
        self.assertTrue(services)
        for path in (COMPONENT / "strings.json", *sorted((COMPONENT / "translations").glob("*.json"))):
            translated = json.loads(path.read_text())["services"]
            self.assertEqual(set(translated), services, path.name)
            for action in services:
                with self.subTest(language=path.name, action=action):
                    self.assertTrue(translated[action].get("name", "").strip())
                    self.assertTrue(translated[action].get("description", "").strip())

    def test_approved_mit_license_is_present_and_shipped_with_the_component(self):
        license_path = ROOT / "LICENSE"
        self.assertTrue(license_path.is_file(), "HACS requires a repository license")
        text = license_path.read_text()
        self.assertIn("MIT License", text)
        self.assertIn("Permission is hereby granted, free of charge", text)
        self.assertIn('THE SOFTWARE IS PROVIDED "AS IS"', text)
        self.assertEqual(text, (COMPONENT / "LICENSE").read_text())

    def test_each_test_job_creates_and_exports_private_scratch(self):
        workflow = (ROOT / ".github/workflows/validate.yml").read_text()
        for job in ("pure-tests", "ha-runtime", "frontend"):
            with self.subTest(job=job):
                match = re.search(rf"^  {re.escape(job)}:\n(.*?)(?=^  [\w-]+:|\Z)", workflow, re.M | re.S)
                assert match is not None, f"missing CI job: {job}"
                block = match.group(1)
                marker = "      - name: Prepare private test scratch\n"
                self.assertIn(marker, block, f"{job} must initialize TMPDIR before tests")
                step = block.split(marker, 1)[1].split("\n      - ", 1)[0]
                self.assertIn("        run: |\n", step)
                script = textwrap.dedent(step.split("        run: |\n", 1)[1])
                with tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"]) as directory:
                    runner_temp = Path(directory)
                    github_env = runner_temp / "github-env"
                    env = {**os.environ, "RUNNER_TEMP": str(runner_temp), "GITHUB_ENV": str(github_env)}
                    env.pop("TMPDIR", None)
                    subprocess.run(["bash", "-eu", "-c", script], env=env, check=True, capture_output=True, text=True)
                    exported = dict(line.split("=", 1) for line in github_env.read_text().splitlines())
                    scratch = Path(exported["TMPDIR"])
                    self.assertTrue(scratch.is_dir())
                    self.assertTrue(scratch.resolve().is_relative_to(runner_temp.resolve()))
                    self.assertEqual(stat.S_IMODE(scratch.stat().st_mode), 0o700)


if __name__ == "__main__":
    unittest.main()
