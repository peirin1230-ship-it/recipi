import os

import common
import digest


def test_digest_mock(root):
    text, meta = digest.build_digest("2026-W41", use_llm=True, mock=True)
    assert meta["week"] == "2026-W41" and len(meta["proposals"]) == 3
    assert "## 来週の提案" in text and "鮭のムニエル" in text
    common.write_text("docs/digests/2026-W41.md", text)
    m, body = common.split_front_matter(common.read_text("docs/digests/2026-W41.md"))
    assert m["proposals"][0]["title"] == "鮭のムニエル"


def test_digest_without_llm(root):
    text, meta = digest.build_digest("2026-W40", use_llm=False, mock=True)
    assert meta["proposals"] == [] and "提案なし" in text


def test_digest_main_without_api_key(root, monkeypatch, capsys, tmp_path):
    """鍵が無ければ数字のまとめを書き、来週の提案は digest の注文にしてルーティンに回す。"""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)
    monkeypatch.delenv("RECIPI_MOCK", raising=False)
    out = tmp_path / "gh_output"
    monkeypatch.setenv("GITHUB_OUTPUT", str(out))
    assert digest.main(["--week", "2026-W42", "--no-git"]) == 0
    assert "ANTHROPIC_API_KEY が無い" in capsys.readouterr().out
    assert os.path.exists(common.path("docs", "digests", "2026-W42.md"))
    rid = out.read_text(encoding="utf-8").strip()[len("fire="):]
    req = common.read_json(f"requests/{rid}.json")
    assert req["type"] == "digest" and req["week"] == "2026-W42" and req["status"] == "pending"
    assert digest.main(["--week", "2026-W42", "--no-git"]) == 0   # 2 回目は出さない（処理待ちがある）
    assert len([n for n in os.listdir(common.path("requests")) if n.endswith(".json") and (common.read_json(f"requests/{n}") or {}).get("type") == "digest"]) == 1
