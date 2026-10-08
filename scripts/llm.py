"""Claude API の呼び出し（1 か所にまとめる）。

- structured output（output_config.format）で JSON を受ける
- 思考は adaptive、深さは output_config.effort
- プロンプトキャッシュ: system と最初の文脈ブロックに cache_control
- 安全機構で断られた（stop_reason: refusal）ときは例外にする
- --mock / RECIPI_MOCK=1 のときは API を呼ばず、固定の応答を返す（テストと Phase 0 の動作確認用）
"""
from __future__ import annotations

import base64
import json
import mimetypes
import os
import time

import common

PRICES_USD_PER_MTOK = {   # 2026-10 時点。input / output / cache_read
    "claude-opus-5-5": (4.0, 20.0, 0.20),
    "claude-sonnet-5-5": (2.0, 10.0, 0.20),
    "claude-haiku-5-5": (0.10, 0.50, 0.01),
}


class LLMError(RuntimeError):
    pass


class Refused(LLMError):
    pass


def cost_usd(model: str, usage: dict) -> float:
    pin, pout, pcache = PRICES_USD_PER_MTOK.get(model, (5.0, 25.0, 0.5))
    return round(
        usage.get("input", 0) / 1e6 * pin
        + usage.get("output", 0) / 1e6 * pout
        + usage.get("cache_read", 0) / 1e6 * pcache
        + usage.get("cache_write", 0) / 1e6 * pin * 1.25,
        4,
    )


def image_block(rel_path: str) -> dict:
    p = common.path(rel_path)
    mt = mimetypes.guess_type(p)[0] or "image/jpeg"
    with open(p, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("ascii")
    return {"type": "image", "source": {"type": "base64", "media_type": mt, "data": data}}


class LLM:
    def __init__(self, cfg: dict, mock: bool = False, mock_responses: dict | None = None):
        gen = cfg.get("generation") or {}
        self.model = gen.get("model", "claude-opus-5-5")
        self.effort = gen.get("effort", "high")
        self.fallbacks = gen.get("fallbacks", "default")
        self.mock = mock or os.environ.get("RECIPI_MOCK") == "1"
        self.mock_responses = mock_responses or {}
        self.calls: list[dict] = []
        self._client = None

    @property
    def client(self):
        if self._client is None:
            try:
                import anthropic  # 遅延 import（mock のときは要らない）
                self._client = anthropic.Anthropic()
            except Exception as e:  # API キーが無い・SDK が無い
                raise LLMError(f"Claude API を使えない（ANTHROPIC_API_KEY を Secrets に置く）: {e}") from e
        return self._client

    def structured(self, *, name: str, system: str, blocks: list, schema: dict, max_tokens: int = 16000,
                   effort: str | None = None) -> tuple[dict, dict]:
        """JSON を 1 つ返す呼び出し。blocks は user content のリスト（text / image）。返り値は (data, usage)。

        blocks のうち cache: True を付けた text ブロックに cache_control を置く（固定しやすい物を先頭に並べる）。
        """
        started = time.time()
        if self.mock:
            data = self._mock(name)
            usage = {"input": 0, "output": 0, "cache_read": 0, "cache_write": 0, "seconds": round(time.time() - started, 1), "model": "mock"}
            self.calls.append({"name": name, "usage": usage})
            return data, usage

        content = []
        for b in blocks:
            if b.get("type") == "image":
                content.append({k: v for k, v in b.items() if k != "cache"})
            else:
                blk = {"type": "text", "text": b["text"]}
                if b.get("cache"):
                    blk["cache_control"] = {"type": "ephemeral"}
                content.append(blk)
        kwargs = dict(
            model=self.model,
            max_tokens=max_tokens,
            system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": content}],
            thinking={"type": "adaptive"},
            output_config={"effort": effort or self.effort, "format": {"type": "json_schema", "schema": schema}},
        )
        resp = self._create(kwargs)
        if resp.stop_reason == "refusal":
            detail = getattr(resp, "stop_details", None)
            raise Refused(f"生成が断られた: {getattr(detail, 'category', None)} {getattr(detail, 'explanation', '')}".strip())
        if resp.stop_reason == "max_tokens":
            raise LLMError("出力が長すぎて途中で切れた（max_tokens）")
        text = next((b.text for b in resp.content if getattr(b, "type", "") == "text"), None)
        if text is None:
            raise LLMError("テキストの応答が無い")
        try:
            data = json.loads(text)
        except json.JSONDecodeError as e:
            raise LLMError(f"JSON として読めない: {e}") from e
        u = resp.usage
        usage = {
            "input": getattr(u, "input_tokens", 0) or 0,
            "output": getattr(u, "output_tokens", 0) or 0,
            "cache_read": getattr(u, "cache_read_input_tokens", 0) or 0,
            "cache_write": getattr(u, "cache_creation_input_tokens", 0) or 0,
            "seconds": round(time.time() - started, 1),
            "model": getattr(resp, "model", self.model),
        }
        self.calls.append({"name": name, "usage": usage})
        return data, usage

    def _create(self, kwargs: dict):
        import anthropic

        use_fallback = self.fallbacks and self.fallbacks != "off"
        try:
            if use_fallback:
                return self.client.beta.messages.create(betas=["server-side-fallback-2026-07-01"], fallbacks="default", **kwargs)
            return self.client.messages.create(**kwargs)
        except anthropic.BadRequestError as e:
            # fallbacks が使えない環境（古い SDK・別プラットフォーム）では無しでやり直す
            if use_fallback and "fallback" in str(e).lower():
                return self.client.messages.create(**kwargs)
            raise LLMError(f"API の不正な要求: {e.message}") from e
        except anthropic.RateLimitError as e:
            raise LLMError("API のレート制限。しばらくしてからもう一度") from e
        except anthropic.APIStatusError as e:
            raise LLMError(f"API エラー {e.status_code}: {e.message}") from e
        except anthropic.APIConnectionError as e:
            raise LLMError("API に接続できない") from e

    def _mock(self, name: str) -> dict:
        if name in self.mock_responses:
            r = self.mock_responses[name]
            return r.pop(0) if isinstance(r, list) else r
        fixtures = {
            "recipe": "tests/fixtures/recipe_teriyaki.json",
            "recipe_detail": "tests/fixtures/recipe_teriyaki.json",
            "revise": "tests/fixtures/revise_teriyaki.json",
            "pantry_photo": "tests/fixtures/pantry_photo.json",
            "photo_note": "tests/fixtures/photo_note.json",
            "learn": "tests/fixtures/learn.json",
            "weekly": "tests/fixtures/weekly.json",
        }
        rel = fixtures.get(name)
        if not rel or not os.path.exists(common.path(rel)):
            raise LLMError(f"mock の応答が無い: {name}")
        return common.read_json(rel)

    def total_usage(self) -> dict:
        tot = {"input": 0, "output": 0, "cache_read": 0, "cache_write": 0}
        for c in self.calls:
            for k in tot:
                tot[k] += c["usage"].get(k, 0)
        return tot
