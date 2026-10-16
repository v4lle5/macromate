"""Real process restart on one disposable native HA configuration."""

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


class UnifiedRestartTests(unittest.TestCase):
    def test_actual_config_entry_and_store_survive_process_restart(self):
        repo = Path(__file__).parents[2]
        script = Path(__file__).with_name("unified_runtime_process.py")
        with tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR")) as path:
            reports = []
            for mode in ("write", "read"):
                result = subprocess.run(
                    [sys.executable, str(script), path, mode],
                    cwd=repo,
                    env={**os.environ, "PYTHONPATH": str(repo)},
                    text=True,
                    capture_output=True,
                    timeout=90,
                )
                self.assertEqual(result.returncode, 0, result.stderr[-8000:])
                reports.append(json.loads(result.stdout.splitlines()[-1]))
            self.assertEqual(reports[0]["recipes"], reports[1]["recipes"])
            self.assertEqual(reports[0]["diary_entries"], reports[1]["diary_entries"])
            self.assertEqual(reports[0]["ledger"], reports[1]["ledger"])
            self.assertTrue(all(row["entry_loaded"] for row in reports))
