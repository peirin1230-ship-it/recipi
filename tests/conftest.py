"""テストはリポジトリを一時ディレクトリに複製して、そこを RECIPI_ROOT にして動かす（本物の recipes/ や logs/ を汚さない）。"""
import os
import shutil
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = tempfile.mkdtemp(prefix="recipi-test-")
shutil.copytree(REPO, TMP, dirs_exist_ok=True, ignore=shutil.ignore_patterns(".git", "_site", "node_modules", ".pytest_cache", "__pycache__"))
os.environ["RECIPI_ROOT"] = TMP
os.environ["RECIPI_MOCK"] = "1"
sys.path.insert(0, os.path.join(REPO, "scripts"))

import pytest  # noqa: E402


@pytest.fixture
def root():
    return TMP
