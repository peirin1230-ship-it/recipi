"""Claude Code のルーティン「recipi: 注文を処理」を API トリガーで呼ぶ（無料の経路。docs/SPEC.md §12.3 / §12.4）。

使い方: python3 scripts/fire_routine.py req-a req-b ...
  夜間の学習・週次ダイジェストが API キー無しのときに置いた注文（learn_notes / revise / photo_note / digest）の id を渡す。
  ROUTINE_FIRE_URL / ROUTINE_FIRE_TOKEN（Secrets）が無ければ呼ばずに 0 で終わる（注文は処理待ちのまま残り、3 日でやめる）。
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def main(argv: list[str]) -> int:
    ids = [a for a in " ".join(argv).split() if a.startswith("req-")]
    if not ids:
        print("ルーティンに渡す注文が無い")
        return 0
    # Secrets に混ざった改行・空白を落とす（スマホで貼ると末尾に改行が入りやすい）
    url = "".join((os.environ.get("ROUTINE_FIRE_URL") or "").split())
    token = "".join((os.environ.get("ROUTINE_FIRE_TOKEN") or "").split())
    if not url or not token:
        print("ルーティンの設定（Secrets の ROUTINE_FIRE_URL / ROUTINE_FIRE_TOKEN）が無いので呼ばない。注文は処理待ちのまま残る")
        return 0
    req = urllib.request.Request(url, method="POST", data=json.dumps({"text": " ".join(ids)}).encode("utf-8"), headers={
        "Authorization": f"Bearer {token}", "anthropic-beta": "experimental-cc-routine-2026-04-01",
        "anthropic-version": "2023-06-01", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f"ルーティンを呼んだ: HTTP {r.status}（{' '.join(ids)}）")
            return 0
    except urllib.error.HTTPError as e:
        why = {401: "トークンが違う（ROUTINE_FIRE_TOKEN）", 404: "URL のルーティン id が違う（ROUTINE_FIRE_URL）"}.get(e.code, "")
        print(f"ルーティンを呼べなかった: HTTP {e.code} {why} {e.read()[:300].decode('utf-8', 'replace')}")
        return 1
    except Exception as e:  # URL が不正・ネットワーク
        print(f"ルーティンを呼べなかった: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
