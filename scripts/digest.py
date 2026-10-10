#!/usr/bin/env python3
"""週次ダイジェスト（docs/SPEC.md §12.4）。docs/digests/YYYY-Www.md を書く。

使い方: python3 scripts/digest.py [--week 2026-W41] [--no-llm] [--no-git] [--mock]
今週の数字（quality）、作った物と写真、定番・改訂・封印の変化、来週の提案 3 つ（Generator）、買い物候補。通知はしない。
"""
from __future__ import annotations

import argparse
import datetime as dt
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import agent  # noqa: E402
import common  # noqa: E402
import learn  # noqa: E402
import llm as llmmod  # noqa: E402
import schema  # noqa: E402


def week_range(week: str) -> tuple[str, str]:
    y, w = week.split("-W")
    start = dt.date.fromisocalendar(int(y), int(w), 1)
    return start.isoformat(), (start + dt.timedelta(days=6)).isoformat()


def build_digest(week: str, *, use_llm: bool, mock: bool) -> tuple[str, dict]:
    cfg = common.load_config()
    start, end = week_range(week)
    ctx = agent.Context()
    learner = learn.Learner(cfg, use_llm=False, mock=mock)
    rows = {r["week"]: r for r in learner.quality()}
    q = rows.get(week) or {}
    prev = rows.get(common.week_key((dt.date.fromisoformat(start) - dt.timedelta(days=7)).isoformat())) or {}
    logs = [e for e in ctx.logs if start <= e.get("date", "") <= end]
    cooked = []
    for e in logs:
        r = ctx.recipes.get(e.get("recipe_id") or "") or {}
        cooked.append({"date": e.get("date"), "title": r.get("title") or e.get("recipe_id"), "r": e.get("r_score"), "f": e.get("f_score"),
                       "minutes": e.get("actual_minutes"), "photo": e.get("photo"), "learned": e.get("learned")})
    learned = ctx.learned
    pantry = ctx.pantry_for_prompt()
    low = [k for k, v in (ctx.pantry.get("staples") or {}).items() if v == "none"]   # 切らしている調味料
    unrated = [e for e in logs if (e.get("ratings") or {}).get("partner") is None]

    proposals, shopping, comment = [], [], ""
    if use_llm:
        version, body = common.read_prompt("digest")
        summary = {"week": week, "quality": q, "previous_week": prev, "cooked": cooked, "standards": ctx.standards(),
                   "recent_30d": ctx.recent(30), "staples_low": low, "today": common.today()}
        blocks = agent.house_blocks(ctx) + [{"type": "text", "text": "# 今週のまとめ\n" + agent.ydump(summary) + "\n\n# 在庫\n" + agent.ydump(pantry)}]
        L = llmmod.LLM(cfg, mock=mock, mock_responses={"digest": {"comment": "来週は魚を 1 回入れてみる。", "proposals": [{"title": "鮭のムニエル", "minutes": 25, "why": "魚が 2 週間出ていない"}, {"title": "豚こまと野菜の味噌炒め", "minutes": 20, "why": "にんじんの使い切り"}, {"title": "カレーライス", "minutes": 45, "why": "日曜にまとめて作って月曜も"}], "shopping": [{"name": "鮭", "qty": "2 切れ", "reason": "ムニエル"}]}})
        try:
            data, _ = L.structured(name="digest", system=body, blocks=blocks, schema=schema.DIGEST_OUTPUT, effort="medium", max_tokens=4000)
            proposals, shopping, comment = data.get("proposals") or [], data.get("shopping") or [], data.get("comment") or ""
        except llmmod.LLMError as e:
            comment = f"（提案を作れなかった: {e}）"

    def pct(x):
        return "—" if x is None else f"{int(round(x * 100))}%"

    meta = {"week": week, "start": start, "end": end, "cooked": q.get("cooked", len(logs)), "generated": q.get("generated", 0),
            "f_avg": q.get("f_avg"), "r_avg": q.get("r_avg"), "time_err_median": q.get("time_err_median"), "new_ratio": q.get("new_ratio"),
            "adoption": q.get("adoption"), "proposals": proposals, "shopping": shopping, "comment": comment}
    lines = ["---", agent.ydump({k: v for k, v in meta.items()}), "---", "", f"# {week}（{start[5:]}〜{end[5:]}）のまとめ", ""]
    lines += ["| 指標 | 今週 | 先週 |", "|---|---|---|",
              f"| 作った回数 | {q.get('cooked', len(logs))} | {prev.get('cooked', '—')} |",
              f"| 提案の採用率 | {pct(q.get('adoption'))} | {pct(prev.get('adoption'))} |",
              f"| 家族評価 F | {q.get('f_avg') if q.get('f_avg') is not None else '—'} | {prev.get('f_avg') if prev.get('f_avg') is not None else '—'} |",
              f"| 再現性 R | {q.get('r_avg') if q.get('r_avg') is not None else '—'} | {prev.get('r_avg') if prev.get('r_avg') is not None else '—'} |",
              f"| 時間誤差（中央値） | {pct(q.get('time_err_median'))} | {pct(prev.get('time_err_median'))} |",
              f"| 新規率 | {pct(q.get('new_ratio'))} | {pct(prev.get('new_ratio'))} |", ""]
    if comment:
        lines += [f"> {comment}", ""]
    lines += ["## 作った物", ""]
    if cooked:
        for c in cooked:
            extra = []
            if c["r"] is not None:
                extra.append(f"R {c['r']}")
            if c["f"] is not None:
                extra.append(f"F {c['f']}")
            if c["minutes"]:
                extra.append(f"{c['minutes']} 分")
            photo = f" ![]({c['photo']})" if c["photo"] else ""
            lines.append(f"- {c['date'][5:]} {c['title']}（{' ・ '.join(extra)}）{photo}" + (f" — {c['learned']}" if c.get("learned") else ""))
    else:
        lines.append("- （記録なし）")
    lines += ["", "## 変化", ""]
    lines.append(f"- 定番: {len(learned.get('standards') or [])} 本（{', '.join(ctx.recipes[r]['title'] for r in learned.get('standards') or [] if r in ctx.recipes) or '—'}）")
    lines.append(f"- 改訂版: {', '.join(learned.get('revised') or []) or '—'}")
    lines.append(f"- 封印: {len(learned.get('retired') or [])} 本")
    lines.append(f"- 聞いてない評価: {len(unrated)} 件")
    lines += ["", "## 来週の提案", ""]
    lines += [f"- {p['title']}（{p.get('minutes')} 分）— {p.get('why', '')}" for p in proposals] or ["- （提案なし。Generator を使わずに作った）"]
    lines += ["", "## 買い物候補", ""]
    lines += [f"- {s['name']} {s.get('qty') or ''}（{s.get('reason', '')}）" for s in shopping]
    lines += [f"- {k}（切らしている）" for k in low]
    lines.append("")
    return "\n".join(lines), meta


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--week")
    ap.add_argument("--no-llm", action="store_true")
    ap.add_argument("--no-git", action="store_true")
    ap.add_argument("--mock", action="store_true")
    a = ap.parse_args(argv)
    week = a.week or common.week_key(common.today())
    text, meta = build_digest(week, use_llm=not a.no_llm, mock=a.mock)
    rel = f"docs/digests/{week}.md"
    common.write_text(rel, text)
    print(rel)
    if not a.no_git:
        common.git_commit_push([rel], f"digest: {week}", common.load_config()["repo"].get("branch", "main"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
