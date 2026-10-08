#!/usr/bin/env bash
# ページのスモークテスト。本物の在庫・レシピは使わず、tests/fixtures の在庫とレシピで _site_test/ を組み立てて確認する。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="$(mktemp -d)"
python3 - "$ROOT" "$TMP" <<'PY'
import os, shutil, sys
root, tmp = sys.argv[1], sys.argv[2]
shutil.copytree(root, tmp, dirs_exist_ok=True, ignore=shutil.ignore_patterns(".git", "_site", "_site_test", "node_modules", ".pytest_cache", "__pycache__"))
shutil.copy(os.path.join(root, "tests", "fixtures", "pantry.json"), os.path.join(tmp, "pantry.json"))
os.makedirs(os.path.join(tmp, "recipes"), exist_ok=True)
for n in os.listdir(os.path.join(root, "tests", "fixtures", "recipes")):
    shutil.copy(os.path.join(root, "tests", "fixtures", "recipes", n), os.path.join(tmp, "recipes", n))
PY
RECIPI_ROOT="$TMP" python3 "$ROOT/scripts/build_site.py" "$ROOT/_site_test" >/dev/null
(cd "$ROOT/_site_test" && python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 1
status=0
node "$ROOT/tests/site/smoke.js" | tail -1 || status=1
node "$ROOT/tests/site/smoke2.js" | tail -1 || status=1
fuser -k 8765/tcp >/dev/null 2>&1 || true
rm -rf "$TMP"
exit $status
