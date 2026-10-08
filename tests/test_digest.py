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
