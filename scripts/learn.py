#!/usr/bin/env python3
"""夜間の学習（docs/SPEC.md §9.4）。logs/ から統計を出し、profile/learned.yml と recipes/*.md の stats を更新する。

使い方:
  python3 scripts/learn.py [--no-llm] [--dry-run] [--no-git] [--force] [--mock]

- 統計（レシピの stats・速度係数・好み・定番・改訂待ち・封印・週次指標）は決定的な計算。
- 言葉の抽出（equipment_notes / recipe_notes / kid.works_if）と改訂版の生成だけ Generator を使う。--no-llm で飛ばす。
- 新しい記録が無ければ何もしない（--force で実行）。
"""
from __future__ import annotations

import argparse
import datetime as dt
import glob
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import agent  # noqa: E402
import common  # noqa: E402
import llm as llmmod  # noqa: E402
import render_recipe  # noqa: E402
import schema  # noqa: E402

LEARNED_HEADER = "# profile/learned.yml — nightly-learn（scripts/learn.py）が logs/ から生成する。手で直さない（直すなら profile/overrides.yml）。"
KID_SCORE = {"all": 5, "half": 3, "little": 2, "none": 1}
FIDELITY_PTS = {"exact": 30, "minor": 20, "major": 5}
RECIPE_TYPES = {"dinner", "prep", "breakfast", "lunchbox"}


# ---- 式（docs/SPEC.md §9.2 / §9.3。ページ側 site/app.js と同じ）----

def r_score(planned: float | None, actual: float | None, fidelity: str | None, finish: int | None) -> int | None:
    if not planned or not actual:
        time_pts = 20.0
    else:
        time_pts = 40.0 * max(0.0, 1.0 - abs(actual - planned) / planned)
    fid = FIDELITY_PTS.get(fidelity or "", 20)
    fin = 20.0 if finish is None else (float(finish) - 1) / 4 * 30
    return int(round(time_pts + fid + fin))


def f_score(ratings: dict | None) -> float | None:
    vals = []
    for role, v in (ratings or {}).items():
        if v is None:
            continue
        if str(role).startswith("kid"):
            if v in KID_SCORE:
                vals.append(KID_SCORE[v])
        elif isinstance(v, (int, float)):
            vals.append(float(v))
    return round(sum(vals) / len(vals), 2) if vals else None


def _bigrams(s: str) -> set[str]:
    s = "".join(s.split())
    return {s[i:i + 2] for i in range(len(s) - 1)}


def similar(a: str, b: str) -> bool:
    A, B = _bigrams(a or ""), _bigrams(b or "")
    if not A or not B:
        return False
    return len(A & B) / len(A | B) >= 0.4


# ---- 要素（好みの学習に使う）----

def elements(recipe: dict) -> list[str]:
    out = []
    for t in recipe.get("tags") or []:
        if t and t not in out:
            out.append(t)
    for i in recipe.get("ingredients") or []:
        name = i.get("pantry") or i.get("name")
        if name and (i.get("grams") or 0) >= 100 and name not in out:
            out.append(name)
    return out


class Learner:
    def __init__(self, cfg: dict, *, use_llm: bool, mock: bool):
        self.cfg = cfg
        self.lc = cfg.get("learn") or {}
        self.window = int(self.lc.get("window_days", 90))
        self.recent_n = int(self.lc.get("recent_n", 5))
        self.since = (common.now() - dt.timedelta(days=self.window)).strftime("%Y-%m-%d")
        self.logs_all = common.iter_logs()
        self.logs = [e for e in self.logs_all if e.get("date", "") >= self.since]
        self.recipes = common.load_recipes()
        self.learned = common.read_yaml("profile/learned.yml", {}) or {}
        self.family = common.read_yaml("family.yml", {}) or {}
        self.equipment = common.read_yaml("equipment.yml", {}) or {}
        self.use_llm = use_llm
        self.L = llmmod.LLM(cfg, mock=mock)
        self.changed_recipes: set[str] = set()
        self.changed_paths: set[str] = set()
        self.notes: list[str] = []

    # ---- 1. レシピの統計 ----
    def recipe_stats(self) -> None:
        by_recipe: dict[str, list[dict]] = {}
        for e in self.logs_all:
            if e.get("recipe_id"):
                by_recipe.setdefault(e["recipe_id"], []).append(e)
        std = self.lc.get("standard") or {}
        ret = self.lc.get("retire") or {}
        rev = self.lc.get("revision") or {}
        self.needs_revision: list[str] = []
        self.retired: list[str] = list(self.learned.get("retired") or [])
        self.standards: list[str] = []
        for rid, meta in self.recipes.items():
            entries = by_recipe.get(rid, [])
            recent = entries[-self.recent_n:]
            rs = [e.get("r_score") for e in recent if isinstance(e.get("r_score"), (int, float))]
            fs = [e.get("f_score") for e in recent if isinstance(e.get("f_score"), (int, float))]
            stats = {
                "cooked": len(entries),
                "r_avg": int(round(sum(rs) / len(rs))) if rs else None,
                "f_avg": round(sum(fs) / len(fs), 1) if fs else None,
                "last": entries[-1].get("date") if entries else None,
            }
            photo = pick_photo(entries)
            status = meta.get("status") or "draft"
            new_status = status
            if status == "draft" and entries:
                new_status = "tried"
            if status != "retired" and rid not in self.retired:
                if stats["cooked"] >= int(std.get("cooked", 3)) and (stats["r_avg"] or 0) >= float(std.get("r_avg", 70)) and (stats["f_avg"] or 0) >= float(std.get("f_avg", 4.0)):
                    new_status = "standard"
                elif new_status == "standard":
                    new_status = "tried"   # 基準を割ったら戻す（封印ではない）
            # 封印: F が低い回が連続
            rated = [e.get("f_score") for e in entries if isinstance(e.get("f_score"), (int, float))]
            times = int(ret.get("times", 2))
            if len(rated) >= times and all(f <= float(ret.get("f_at_most", 2.0)) for f in rated[-times:]) and rid not in self.retired:
                self.retired.append(rid)
                self.notes.append(f"封印: {meta.get('title')}（F が {times} 回続けて {ret.get('f_at_most', 2.0)} 以下）")
            if rid in self.retired:
                new_status = "retired"
            # 改訂待ち: R が低い回が連続、または同じ趣旨の変更が 2 回
            rsc = [e.get("r_score") for e in entries if isinstance(e.get("r_score"), (int, float))]
            devs = [e.get("deviation") for e in entries if e.get("deviation")]
            low = len(rsc) >= int(rev.get("times", 2)) and all(r < float(rev.get("r_below", 50)) for r in rsc[-int(rev.get("times", 2)):])
            same_dev = any(similar(a, b) for i, a in enumerate(devs) for b in devs[i + 1:])
            if (low or same_dev) and new_status not in ("retired",) and not self.has_uncooked_successor(rid) and self.revision_count(rid) < int(rev.get("max_revisions", 3)):
                self.needs_revision.append(rid)
            if new_status == "standard":
                self.standards.append(rid)
            if stats != meta.get("stats") or photo != meta.get("photo") or new_status != status:
                meta["stats"], meta["photo"], meta["status"] = stats, photo, new_status
                self.changed_recipes.add(rid)
        # 改訂版が元より良ければ元を「改訂済み」にする
        for rid, meta in self.recipes.items():
            sup = meta.get("supersedes")
            if sup and sup in self.recipes and (meta.get("stats") or {}).get("cooked"):
                orig = self.recipes[sup]
                if (meta["stats"].get("r_avg") or 0) > ((orig.get("stats") or {}).get("r_avg") or 0) and orig.get("status") != "retired":
                    orig["status"] = "retired"
                    orig["retired_reason"] = f"改訂版 {rid} に置き換え"
                    self.changed_recipes.add(sup)
                    if sup in self.standards:
                        self.standards.remove(sup)
                    if sup in self.needs_revision:
                        self.needs_revision.remove(sup)

    def has_uncooked_successor(self, rid: str) -> bool:
        return any(m.get("supersedes") == rid and not (m.get("stats") or {}).get("cooked") for m in self.recipes.values())

    def revision_count(self, rid: str) -> int:
        n, cur = 0, rid
        while True:
            nxt = next((m["id"] for m in self.recipes.values() if m.get("supersedes") == cur), None)
            if not nxt:
                return n
            n, cur = n + 1, nxt

    # ---- 2. 速度係数 ----
    def speed_factor(self) -> dict:
        min_n = int(self.lc.get("min_logs_for_speed", 20))
        ratios = []
        per_kind: dict[str, list[float]] = {"prep": [], "heat": [], "serve": []}
        for e in self.logs:
            meta = self.recipes.get(e.get("recipe_id") or "")
            raw = ((meta or {}).get("time") or {}).get("raw_estimate")
            act = e.get("actual_minutes")
            if raw and act and raw > 0 and 0 < act < raw * 4:
                ratios.append(act / raw)
            sm = e.get("step_minutes") or {}
            if meta and sm:
                planned_by_kind: dict[str, float] = {}
                for st in meta.get("steps") or []:
                    planned_by_kind[st.get("kind")] = planned_by_kind.get(st.get("kind"), 0) + float(st.get("minutes") or 0)
                for kind in per_kind:
                    if planned_by_kind.get(kind) and sm.get(kind):
                        per_kind[kind].append(float(sm[kind]) / planned_by_kind[kind])

        def settle(vals: list[float]) -> float:
            if not vals:
                return 1.0
            med = statistics.median(vals)
            n = len(vals)
            f = med if n >= min_n else (n * med + (min_n - n) * 1.0) / min_n
            return round(min(2.0, max(0.7, f)), 2)

        overall = settle(ratios)
        out = {"overall": overall}
        for kind, vals in per_kind.items():
            out[kind] = settle(vals) if vals else overall
        return out

    # ---- 3. 好み ----
    def preferences(self) -> dict:
        agg: dict[str, list[float]] = {}
        partner: dict[str, list[float]] = {}
        kid_ok: dict[str, int] = {}
        kid_ng: dict[str, int] = {}
        for e in self.logs:
            meta = self.recipes.get(e.get("recipe_id") or "")
            if not meta:
                continue
            els = elements(meta)
            f = e.get("f_score")
            r = e.get("ratings") or {}
            for el in els:
                if isinstance(f, (int, float)):
                    agg.setdefault(el, []).append(float(f))
                if isinstance(r.get("partner"), (int, float)):
                    partner.setdefault(el, []).append(float(r["partner"]))
                kid = r.get("kid")
                if kid in ("all", "half"):
                    kid_ok[el] = kid_ok.get(el, 0) + 1
                elif kid == "none":
                    kid_ng[el] = kid_ng.get(el, 0) + 1

        def scored(d: dict[str, list[float]], min_n: int) -> list[dict]:
            rows = []
            for el, vals in d.items():
                if len(vals) >= min_n:
                    mean = sum(vals) / len(vals)
                    rows.append({"key": el, "score": round(max(-1.0, min(1.0, (mean - 3.5) / 1.5)), 2), "n": len(vals)})
            return rows

        rows = scored(agg, 3)
        likes = sorted([r for r in rows if r["score"] > 0.2], key=lambda r: (-r["score"], -r["n"]))[:15]
        dislikes = sorted([r for r in rows if r["score"] < -0.2], key=lambda r: (r["score"], -r["n"]))[:15]
        prow = scored(partner, 2)
        eats_well = sorted([el for el, n in kid_ok.items() if n >= 2 and n > kid_ng.get(el, 0)], key=lambda el: -kid_ok[el])[:12]
        refuses = sorted([el for el, n in kid_ng.items() if n >= 2 and n > kid_ok.get(el, 0)], key=lambda el: -kid_ng[el])[:12]
        return {
            "likes": likes, "dislikes": dislikes,
            "partner": {"likes": [r["key"] for r in sorted(prow, key=lambda r: -r["score"]) if r["score"] > 0.2][:8],
                        "dislikes": [r["key"] for r in sorted(prow, key=lambda r: r["score"]) if r["score"] < -0.2][:8]},
            "kid": {"eats_well": eats_well, "refuses": refuses, "works_if": list((self.learned.get("kid") or {}).get("works_if") or [])},
        }

    # ---- 4. 言葉の抽出（Generator）----
    def summarize(self) -> dict:
        existing = {k: list(self.learned.get(k) or []) for k in ("equipment_notes", "recipe_notes")}
        existing["kid_works_if"] = list((self.learned.get("kid") or {}).get("works_if") or [])
        texts = []
        for e in self.logs:
            meta = self.recipes.get(e.get("recipe_id") or "") or {}
            for key in ("deviation", "learned", "photo_note"):
                if e.get(key):
                    texts.append({"date": e.get("date"), "recipe": meta.get("title") or e.get("recipe_id"), "kind": key, "text": e[key],
                                  "r": e.get("r_score"), "f": e.get("f_score"), "kid": (e.get("ratings") or {}).get("kid")})
        if not texts or not self.use_llm:
            return existing
        _, body = common.read_prompt("learn")
        blocks = [{"type": "text", "text": "# 器具\n" + agent.ydump(self.equipment) + "\n\n# 既存の notes（existing）\n" + agent.ydump(existing) + "\n\n# 記録（新しい順）\n" + agent.ydump(list(reversed(texts))[:120])}]
        try:
            data, _ = self.L.structured(name="learn", system=body, blocks=blocks, schema=schema.LEARN_OUTPUT, effort="medium", max_tokens=4000)
        except llmmod.LLMError as e:
            self.notes.append(f"要約を飛ばした: {e}")
            return existing
        return {"equipment_notes": (data.get("equipment_notes") or [])[:10], "recipe_notes": (data.get("recipe_notes") or [])[:10], "kid_works_if": (data.get("kid_works_if") or [])[:5]}

    # ---- 5. 改訂 ----
    def revise(self) -> list[str]:
        made = []
        if not self.use_llm:
            return made
        for rid in list(self.needs_revision):
            try:
                ctx = agent.Context()
                res = agent.action_revise(ctx, self.L, {"id": None, "recipe_id": rid})
                made.append(res["recipe_id"])
                self.changed_paths.update(res.get("_paths") or [])
                self.notes.append(f"改訂版: {res['recipe_id']}（{rid}）")
            except Exception as e:
                self.notes.append(f"改訂に失敗 {rid}: {e}")
        return made

    # ---- 6. 写真の一言 ----
    def photo_notes(self) -> None:
        if not self.use_llm or not self.lc.get("photo_note"):
            return
        ctx = None
        for e in self.logs:
            if e.get("photo") and not e.get("photo_note"):
                ctx = ctx or agent.Context()
                try:
                    if agent.action_photo_note(ctx, self.L, e["id"]):
                        self.changed_paths.add("logs")
                except Exception as ex:
                    self.notes.append(f"写真の一言に失敗 {e.get('id')}: {ex}")

    # ---- 7. 掃除 ----
    def cleanup(self) -> None:
        cutoff = (common.now() - dt.timedelta(days=30)).strftime("%Y-%m-%d")
        for p in glob.glob(common.path("requests", "*.json")):
            rel = os.path.relpath(p, common.ROOT)
            d = common.read_json(rel) or {}
            if (d.get("ts") or "")[:10] < cutoff:
                os.remove(p)
                self.changed_paths.add(rel)
        day_ago = common.now().timestamp() - 86400
        for p in glob.glob(common.path("inbox", "*")):
            if os.path.isfile(p) and os.path.getmtime(p) < day_ago and not p.endswith(".keep"):
                os.remove(p)
                self.changed_paths.add(os.path.relpath(p, common.ROOT))

    # ---- 8. 週次指標 ----
    def quality(self) -> list[dict]:
        weeks: dict[str, dict] = {}
        for p in glob.glob(common.path("requests", "*.json")):
            d = common.read_json(os.path.relpath(p, common.ROOT)) or {}
            if d.get("type") in RECIPE_TYPES and d.get("status") == "done" and (d.get("result") or {}).get("recipe_id"):
                w = common.week_key(d["ts"][:10])
                weeks.setdefault(w, {"generated": 0, "cooked": 0, "f": [], "r": [], "err": [], "new": 0, "pv": {}})["generated"] += 1
                pv = str((d.get("result") or {}).get("prompt_version", "?"))
                weeks[w]["pv"][pv] = weeks[w]["pv"].get(pv, 0) + 1
        seen_recipes: set[str] = set()
        for e in self.logs_all:
            if e.get("date", "") < self.since:
                seen_recipes.add(e.get("recipe_id") or "")
                continue
            w = common.week_key(e["date"])
            row = weeks.setdefault(w, {"generated": 0, "cooked": 0, "f": [], "r": [], "err": [], "new": 0, "pv": {}})
            row["cooked"] += 1
            if isinstance(e.get("f_score"), (int, float)):
                row["f"].append(e["f_score"])
            if isinstance(e.get("r_score"), (int, float)):
                row["r"].append(e["r_score"])
            if e.get("planned_minutes") and e.get("actual_minutes"):
                row["err"].append(abs(e["actual_minutes"] - e["planned_minutes"]) / e["planned_minutes"])
            if e.get("recipe_id") not in seen_recipes:
                row["new"] += 1
                seen_recipes.add(e.get("recipe_id"))
        out = []
        for w in sorted(weeks):
            r = weeks[w]
            out.append({
                "week": w, "generated": r["generated"], "cooked": r["cooked"],
                "f_avg": round(sum(r["f"]) / len(r["f"]), 2) if r["f"] else None,
                "r_avg": int(round(sum(r["r"]) / len(r["r"]))) if r["r"] else None,
                "time_err_median": round(statistics.median(r["err"]), 2) if r["err"] else None,
                "new_ratio": round(r["new"] / r["cooked"], 2) if r["cooked"] else None,
                "adoption": round(r["cooked"] / r["generated"], 2) if r["generated"] else None,
                "prompt_versions": r["pv"],
            })
        return out[-16:]

    # ---- まとめ ----
    def run(self, *, dry_run: bool) -> dict:
        self.recipe_stats()
        sf = self.speed_factor()
        prefs = self.preferences()
        summary = self.summarize()
        prefs["kid"]["works_if"] = summary.get("kid_works_if") or []
        revised = self.revise()
        self.photo_notes()
        self.cleanup()
        learned = {
            "updated": common.today(),
            "window_days": self.window,
            "n_logs": len(self.logs),
            "last_log_id": self.logs_all[-1].get("id") if self.logs_all else None,
            "speed_factor": sf,
            "likes": prefs["likes"], "dislikes": prefs["dislikes"],
            "partner": prefs["partner"], "kid": prefs["kid"],
            "equipment_notes": summary.get("equipment_notes") or [],
            "recipe_notes": summary.get("recipe_notes") or [],
            "standards": self.standards,
            "needs_revision": [r for r in self.needs_revision],
            "revised": revised,
            "retired": self.retired,
            "quality": self.quality(),
        }
        if dry_run:
            print(agent.ydump(learned))
            print("\n".join(self.notes), file=sys.stderr)
            return learned
        common.write_yaml("profile/learned.yml", learned, header=LEARNED_HEADER)
        self.changed_paths.add("profile/learned.yml")
        for rid in self.changed_recipes:
            rel = render_recipe.write_recipe(self.recipes[rid], self.equipment)
            self.changed_paths.add(rel)
        return learned


def pick_photo(entries: list[dict]) -> str | None:
    """最後に作ったときの写真。finish ≥ 4 の写真があれば、それより新しい finish < 4 の写真で上書きしない（§8.4）。"""
    best = None
    for e in entries:
        if not e.get("photo"):
            continue
        if best is None or (e.get("finish") or 0) >= 4 or (best.get("finish") or 0) < 4:
            best = e
    return best.get("photo") if best else None


def has_new_logs(learned: dict, logs: list[dict]) -> bool:
    if not logs:
        return False
    return learned.get("last_log_id") != logs[-1].get("id")


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-llm", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-git", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--mock", action="store_true")
    a = ap.parse_args(argv)
    cfg = common.load_config()
    learner = Learner(cfg, use_llm=not a.no_llm, mock=a.mock)
    if not a.force and not has_new_logs(learner.learned, learner.logs_all):
        print("新しい記録が無いので何もしない")
        return 0
    learner.run(dry_run=a.dry_run)
    for n in learner.notes:
        print(n)
    if a.dry_run or a.no_git:
        return 0
    paths = sorted(learner.changed_paths | {"profile/learned.yml", "recipes", "requests", "inbox", "logs"})
    if common.git_commit_push(paths, f"learn: {common.today()}", cfg["repo"].get("branch", "main")):
        print("committed")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
