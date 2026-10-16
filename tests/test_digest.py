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


def test_digest_main_without_api_key(root, monkeypatch, capsys):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)
    monkeypatch.delenv("RECIPI_MOCK", raising=False)
    assert digest.main(["--week", "2026-W42", "--no-git"]) == 0
    assert "ANTHROPIC_API_KEY が無い" in capsys.readouterr().out
    assert os.path.exists(common.path("docs", "digests", "2026-W42.md"))
