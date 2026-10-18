"""Run the same private, pinned checks locally and in CI."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(*args, env):
    subprocess.run(args, cwd=ROOT, env=env, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--python-only", action="store_true", help="Skip JavaScript/browser checks")
    parser.add_argument("--pure", action="store_true", help="Run only framework-independent tests")
    args = parser.parse_args()
    if not args.pure and sys.version_info[:2] != (3, 14):
        parser.error("Use Python 3.14.2 with requirements-dev.txt, or select --pure")
    if not (ROOT / ".git").exists():
        parser.error("Run from a Git checkout with the historical compatibility fixtures available")
    history = subprocess.run(["git", "cat-file", "-e", "fbd6b18"], cwd=ROOT, capture_output=True)
    if history.returncode:
        parser.error("Fetch full Git history first: git fetch --unshallow")
    with tempfile.TemporaryDirectory(prefix="macromate-check-") as scratch:
        env = {**os.environ, "TMPDIR": scratch, "COVERAGE_FILE": str(Path(scratch) / ".coverage")}
        run(sys.executable, "-m", "ruff", "check", "custom_components/macromate", "tools", env=env)
        run(
            sys.executable,
            "-m",
            "ruff",
            "format",
            "--check",
            "custom_components/macromate",
            "tools",
            env=env,
        )
        if args.pure:
            run(sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v", env=env)
            return
        run(
            sys.executable,
            "-m",
            "coverage",
            "run",
            "-m",
            "unittest",
            "discover",
            "-s",
            "tests",
            "-v",
            env=env,
        )
        run(
            sys.executable,
            "-m",
            "coverage",
            "run",
            "--append",
            "-m",
            "unittest",
            "discover",
            "-s",
            "tests/ha",
            "-v",
            env=env,
        )
        run(sys.executable, "-m", "coverage", "report", env=env)
        if args.python_only:
            return
        if not shutil.which("node") or not env.get("FRONTEND_DEPS"):
            parser.error(
                "Set FRONTEND_DEPS to the installation of tests/frontend/deps.package*.json"
            )
        env["HA_PYTHON"] = sys.executable
        run("node", "tools/check_frontend.mjs", env=env)
        files = sorted(
            str(path.relative_to(ROOT)) for path in (ROOT / "tests/frontend").glob("*.test.mjs")
        )
        run("node", "--test", *files, env=env)
        env["EVIDENCE_DIR"] = str(Path(scratch) / "evidence")
        env["PLAYWRIGHT_DIR"] = str(Path(env["FRONTEND_DEPS"]) / "node_modules")
        run("node", "tests/frontend/macromate-unified-verify.mjs", env=env)
        run(sys.executable, "tests/ha/native_unified_browser.py", env=env)


if __name__ == "__main__":
    main()
