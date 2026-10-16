"""Fresh interpreter restart/revocation on a disposable real HA configuration."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


class AgentRestartTests(unittest.TestCase):
    def test_native_lifecycle_cli_and_revocation_survive_fresh_processes(self):
        repo = Path(__file__).parents[2]
        script = Path(__file__).with_name('agent_runtime_process.py')
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR')) as directory:
            reports = []
            for stage in ('mint', 'reload_revoke', 'revoked'):
                result = subprocess.run([sys.executable, '-B', str(script), directory, stage],
                                        cwd=repo, env={**os.environ, 'PYTHONPATH': str(repo)},
                                        text=True, capture_output=True, timeout=120)
                self.assertEqual(result.returncode, 0, stage + '\n' + result.stderr[-10000:])
                reports.append(json.loads(result.stdout.splitlines()[-1]))
            self.assertEqual(len({report['pid'] for report in reports}), 3)
            self.assertEqual([report['revoked'] for report in reports], [False, True, True])
            self.assertTrue(all(report['entry_loaded'] and report['disk_equal'] for report in reports))
            print('Scoped fresh-process acceptance: ' + json.dumps(reports, sort_keys=True))
