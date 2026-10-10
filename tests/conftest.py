"""テストはリポジトリを一時ディレクトリに複製して、そこを RECIPI_ROOT にして動かす（本物の recipes/ や logs/ を汚さない）。"""
import os
import shutil
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = tempfile.mkdtemp(prefix="recipi-test-")
shutil.copytree(REPO, TMP, dirs_exist_ok=True, ignore=shutil.ignore_patterns(".git", "_site", "node_modules", ".pytest_cache", "__pycache__"))
# テスト用の在庫とレシピ（本物の pantry.json / recipes/ は家の状態なので使わない）
shutil.copy(os.path.join(REPO, "tests", "fixtures", "pantry.json"), os.path.join(TMP, "pantry.json"))
os.makedirs(os.path.join(TMP, "recipes"), exist_ok=True)
for name in os.listdir(os.path.join(REPO, "tests", "fixtures", "recipes")):
    shutil.copy(os.path.join(REPO, "tests", "fixtures", "recipes", name), os.path.join(TMP, "recipes", name))
for name in os.listdir(os.path.join(TMP, "requests")):
    if name.endswith(".json"):
        os.remove(os.path.join(TMP, "requests", name))
# 本物の記録（logs/）も使わない（テストは自分で書く）
shutil.rmtree(os.path.join(TMP, "logs"), ignore_errors=True)
os.makedirs(os.path.join(TMP, "logs"), exist_ok=True)
os.environ["RECIPI_ROOT"] = TMP
os.environ["RECIPI_MOCK"] = "1"
sys.path.insert(0, os.path.join(REPO, "scripts"))

import pytest  # noqa: E402


@pytest.fixture
def root():
    return TMP


@pytest.fixture
def fresh_recipes(root):
    """モックの Generator は毎回同じ料理名を返すので、前のテストが作ったレシピを消してから生成する（同じ料理名は重複として不合格になる）。"""
    keep = set(os.listdir(os.path.join(REPO, "tests", "fixtures", "recipes")))
    for name in os.listdir(os.path.join(root, "recipes")):
        if name.endswith(".md") and name not in keep:
            os.remove(os.path.join(root, "recipes", name))
    # 前のテストの注文も消す（結果に残った料理名は「一覧から消された料理」として不合格になるため）
    for name in os.listdir(os.path.join(root, "requests")):
        if name.endswith(".json"):
            os.remove(os.path.join(root, "requests", name))
    return root
