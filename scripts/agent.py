#!/usr/bin/env python3
"""Generator（docs/SPEC.md §7, §12.2）。GitHub Actions の agent.yml から呼ばれる。

使い方:
  python3 scripts/agent.py auto --request <req-id> [--mock] [--no-git]
  python3 scripts/agent.py recipe|recipe_detail|pantry_photo|revise|weekly --request <req-id>
  python3 scripts/agent.py photo_note --log <log-id>
  python3 scripts/agent.py revise --recipe <recipe-id>        # 注文ファイル無しで改訂（learn.py から使う）

requests/<id>.json を読み、結果を同じファイルの result に書き戻す。レシピは recipes/<id>.md に書く。
--mock で API を呼ばず tests/fixtures の応答を使う。--no-git でコミットしない。
"""
from __future__ import annotations

import argparse
import datetime as dt
import glob
import json
import os
import sys
import traceback

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402
import llm as llmmod  # noqa: E402
import render_recipe  # noqa: E402
import schema  # noqa: E402
import validate  # noqa: E402

TYPE_TO_ACTION = {
    "dinner": "recipe", "prep": "recipe", "breakfast": "recipe", "lunchbox": "recipe",
    "recipe_detail": "recipe_detail", "pantry_photo": "pantry_photo", "revise": "revise", "weekly": "weekly",
}
TYPE_NOTES = {
    "dinner": "夕食。主菜＋副菜（注文の dishes に従う）。",
    "prep": "翌日分の仕込み。翌日に「温めるだけ・焼くだけ」で出せる所まで作る。日持ち（keep）を必ず書き、当日の仕上げ工程を最後の手順に分けて書く。",
    "breakfast": "朝食。5〜15 分。主食＋1 品。火を使う工程は 1 つまで。",
    "lunchbox": "弁当。冷めてもおいしい物。汁気を出さない。前夜の残りがあれば使う。詰め方を最後の手順に書く。",
}
WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


class Context:
    """生成に要る家の情報をまとめて読む。"""

    def __init__(self):
        self.cfg = common.load_config()
        self.equipment = common.read_yaml("equipment.yml", {}) or {}
        self.family = common.read_yaml("family.yml", {}) or {}
        self.learned = common.read_yaml("profile/learned.yml", {}) or {}
        self.overrides = common.read_yaml("profile/overrides.yml", {}) or {}
        self.ingredients = common.Ingredients()
        self.pantry = common.read_json("pantry.json", {"items": [], "staples": {}})
        self.recipes = common.load_recipes()
        self.logs = common.iter_logs()
        self.safety = common.read_text("knowledge/safety.md")
        self.basics = [common.read_text(p.replace(common.ROOT + os.sep, "")) for p in sorted(glob.glob(common.path("knowledge", "basics", "*.md")))]
        self.lanes = schema.lanes_for(self.equipment)

    @property
    def speed_factor(self) -> dict:
        sf = dict(self.learned.get("speed_factor") or {})
        sf.update(self.overrides.get("speed_factor") or {})
        for k in ("overall", "prep", "heat", "serve"):
            sf.setdefault(k, 1.0)
        return sf

    def allergens(self) -> list[str]:
        return [a for a in (self.family.get("allergies") or []) if a] + [a for a in (self.overrides.get("never") or []) if a]

    def pantry_for_prompt(self) -> dict:
        """アレルギー・never を除き、期限順に並べ、staples は ok/low だけ渡す。"""
        bad = self.allergens() + [a for a in (self.family.get("avoid") or []) if a]
        items = []
        for it in self.pantry.get("items", []):
            name = self.ingredients.normalize(it["name"])
            if any(b in name for b in bad):
                continue
            items.append({k: v for k, v in it.items() if k in ("name", "qty", "unit", "loc", "use_by")})
        items.sort(key=lambda x: x.get("use_by") or "9999")
        staples = {k: v for k, v in (self.pantry.get("staples") or {}).items() if v in ("ok", "low") and not any(b in k for b in bad)}
        return {"items": items, "staples": staples}

    def recent(self, days: int) -> list[dict]:
        since = (common.now() - dt.timedelta(days=days)).strftime("%Y-%m-%d")
        out, seen = [], set()
        for e in reversed(self.logs):
            if e.get("date", "") < since:
                break
            rid = e.get("recipe_id")
            if not rid or rid in seen:
                continue
            seen.add(rid)
            r = self.recipes.get(rid) or {}
            mains = [i.get("pantry") or i.get("name") for i in (r.get("ingredients") or []) if i.get("grams", 0) and i["grams"] >= 100]
            out.append({"date": e.get("date"), "title": r.get("title") or rid, "main_ingredients": mains[:3]})
        return out

    def standards(self) -> list[dict]:
        out = []
        for rid in self.learned.get("standards") or []:
            r = self.recipes.get(rid)
            if r and r.get("status") != "retired":
                out.append({"id": rid, "title": r.get("title"), "planned_minutes": (r.get("time") or {}).get("planned"),
                            "f_avg": (r.get("stats") or {}).get("f_avg")})
        return out

    def month_cost(self) -> float:
        ym = common.today()[:7]
        total = 0.0
        for p in glob.glob(common.path("requests", "*.json")):
            try:
                d = common.read_json(p.replace(common.ROOT + os.sep, ""))
            except Exception:
                continue
            if (d.get("ts") or "")[:7] == ym and d.get("result"):
                total += float(d["result"].get("cost_usd") or 0)
        return round(total, 2)


def ydump(obj) -> str:
    return yaml.safe_dump(obj, allow_unicode=True, sort_keys=False, default_flow_style=None, width=100).strip()


def system_text(ctx: Context, prompt_name: str) -> tuple[int, str]:
    version, body = common.read_prompt(prompt_name)
    parts = [body, "\n\n# 規則（knowledge/safety.md）\n", ctx.safety.strip(), "\n\n# 基礎知識\n"]
    parts += [b.strip() + "\n" for b in ctx.basics]
    return version, "\n".join(parts)


def house_blocks(ctx: Context) -> list[dict]:
    """§7.1 の 3〜4。変わりにくい順。"""
    learned = {k: v for k, v in ctx.learned.items() if k in ("speed_factor", "likes", "dislikes", "partner", "kid", "equipment_notes", "recipe_notes")}
    overrides = {k: v for k, v in ctx.overrides.items() if v}
    return [
        {"type": "text", "cache": True, "text": "# 器具（equipment.yml）\n" + ydump(ctx.equipment) + "\n\n# 段取り表のレーン（timeline の lane に使う id）\n" + ydump(ctx.lanes) + "\n\n# 家族（family.yml）\n" + ydump(ctx.family)},
        {"type": "text", "cache": True, "text": "# 学習結果（profile/learned.yml）\n" + ydump(learned) + "\n\n# 上書き（profile/overrides.yml。学習結果より優先）\n" + (ydump(overrides) if overrides else "（無し）") + "\n\n# 定番（standards）\n" + (ydump(ctx.standards()) or "（まだ無い）")},
    ]


def request_block(ctx: Context, req: dict, extra: str = "") -> dict:
    cfg = ctx.cfg
    budget = int(req.get("time_budget") or cfg["request"].get("default_budget", 25))
    margin = float(cfg["generation"].get("time_margin", 0.9))
    sf = ctx.speed_factor
    raw_limit = int(budget * margin / max(float(sf.get("overall", 1.0)), 0.5))
    recent = ctx.recent(int(cfg["suggest"].get("no_repeat_days", 14)))
    pantry = ctx.pantry_for_prompt()
    order = {k: v for k, v in req.items() if k in ("type", "time_budget", "servings", "dishes", "mood", "use_up", "exclude", "note", "mode")}
    text = (
        "# 最近作った物（出さない）\n" + (ydump(recent) or "（無し）") +
        "\n\n# 在庫（pantry.json。期限順。staples は ok/low の物だけ。無い物は使えない）\n" + ydump(pantry) +
        "\n\n# 注文\n" + ydump(order) +
        f"\n\n# 時間の制約\n- 時間予算 {budget} 分。うちの速度係数は {ydump(sf)} なので、段取り表の最後の分（raw_estimate）は **{raw_limit} 分以内**にする。"
        f"\n- 注文の種類: {TYPE_NOTES.get(req.get('type'), '')}"
        f"\n- 今日: {common.today()}（旬の判断に使う）"
    )
    if req.get("mode") == "pick":
        text += "\n- mode が pick なので、recipe は null にし、alternatives に候補を 3 つ（title / minutes / why / kind）だけ出す。"
    else:
        explore = float(cfg["suggest"].get("explore_ratio", 0.3))
        text += f"\n- 本命は在庫・時間・好みに最も合う 1 本。ただし全体の {int(explore * 100)}% 程度は「新しい料理」を本命にしてよい。"
    if extra:
        text += "\n\n" + extra
    return {"type": "text", "text": text}


def make_meta(ctx: Context, recipe: dict, req: dict, version_info: dict, *, rid: str | None = None, **kw) -> dict:
    rid = rid or unique_recipe_id(recipe.get("title_roman") or recipe["title"])
    servings = req.get("servings") or ctx.family.get("meals", {}).get("dinner_default", {"adults": 2, "kids": 1})
    servings = {"adults": int(servings.get("adults", 2)), "kids": int(servings.get("kids", 0))}
    return render_recipe.build_meta(
        recipe, rid=rid, request_id=req.get("id"), budget=req.get("time_budget"), servings=servings,
        rtype=req.get("type", "dinner"), speed_factor=ctx.speed_factor, generated_by=version_info, **kw)


def unique_recipe_id(title_roman: str) -> str:
    base = common.recipe_id_for(title_roman)
    rid, n = base, 2
    while os.path.exists(common.path("recipes", f"{rid}.md")):
        rid = f"{base}-{n}"
        n += 1
    return rid


def generate_recipe(ctx: Context, L: llmmod.LLM, req: dict, *, name: str = "recipe", extra: str = "",
                    validate_ctx_extra: dict | None = None) -> tuple[dict, dict, list[str]]:
    """生成 → 検査 → やり直し。返り値は (出力 JSON, usage 合計, 最後の不合格理由)。"""
    version, system = system_text(ctx, "recipe")
    blocks = house_blocks(ctx) + [request_block(ctx, req, extra)]
    servings = req.get("servings") or ctx.family.get("meals", {}).get("dinner_default", {})
    vctx = {"equipment": ctx.equipment, "family": ctx.family, "pantry": ctx.pantry, "ingredients": ctx.ingredients,
            "overrides": ctx.overrides, "budget": req.get("time_budget"), "speed_factor": ctx.speed_factor,
            "servings": servings, "config": ctx.cfg}
    vctx.update(validate_ctx_extra or {})
    retries = int(ctx.cfg["generation"].get("max_retries", 2))
    errors: list[str] = []
    data: dict = {}
    for attempt in range(retries + 1):
        data, _ = L.structured(name=name, system=system, blocks=blocks, schema=schema.RECIPE_OUTPUT)
        if not data.get("feasible") or not data.get("recipe"):
            return data, L.total_usage(), []
        errors = validate.validate_recipe(data["recipe"], vctx)
        if not errors:
            break
        print(f"attempt {attempt + 1}: 不合格 {len(errors)} 件", file=sys.stderr)
        blocks = house_blocks(ctx) + [request_block(ctx, req, extra + "\n\n# 前回の出力の不合格点（直して出し直す）\n- " + "\n- ".join(errors))]
    data["_prompt_version"] = version
    return data, L.total_usage(), errors


# ---- actions ----

def action_recipe(ctx: Context, L: llmmod.LLM, req: dict) -> dict:
    data, usage, errors = generate_recipe(ctx, L, req)
    return finish_recipe(ctx, L, req, data, usage, errors)


def action_recipe_detail(ctx: Context, L: llmmod.LLM, req: dict) -> dict:
    parent = common.read_json(f"requests/{req.get('parent')}.json")
    if not parent:
        raise ValueError(f"親の注文 {req.get('parent')} が無い")
    pres = parent.get("result") or {}
    idx = int(req.get("alternative") or 0)
    if parent.get("type") == "weekly":
        day = (pres.get("days") or [])[idx]
        title, why, minutes = day["title"], day.get("why", ""), day.get("minutes")
        wd = WEEKDAYS[dt.date.fromisoformat(day["date"]).weekday()]
        if not req.get("time_budget"):   # その曜日の予算。計画の分数が予算より長ければ計画の方を採る（計画時に承知の上）
            wd_budget = int((parent.get("budgets") or {}).get(wd) or ctx.cfg["request"].get("default_budget", 25))
            req["time_budget"] = max(wd_budget, int(minutes or 0))
    else:
        alt = (pres.get("alternatives") or [])[idx]
        title, why, minutes = alt["title"], alt.get("why", ""), alt.get("minutes")
    for k in ("time_budget", "servings", "dishes", "note"):
        if req.get(k) in (None, "", []) and parent.get(k) not in (None, ""):
            req[k] = parent[k]
    req.setdefault("type", parent.get("type") if parent.get("type") in TYPE_NOTES else "dinner")
    req["mode"] = "auto"
    extra = f"# この料理を作る\n- {title}（{minutes} 分の見込み。{why}）\n- 料理は変えない。この家の器具・在庫・家族・時間に合わせて詳細を組む。"
    data, usage, errors = generate_recipe(ctx, L, req, name="recipe_detail", extra=extra)
    return finish_recipe(ctx, L, req, data, usage, errors)


def finish_recipe(ctx: Context, L: llmmod.LLM, req: dict, data: dict, usage: dict, errors: list[str]) -> dict:
    result = {
        "feasible": bool(data.get("feasible")),
        "infeasible_reason": data.get("infeasible_reason"),
        "nearest_options": data.get("nearest_options") or [],
        "alternatives": data.get("alternatives") or [],
        "recipe_id": None, "recipe": None,
    }
    if errors:
        raise ValueError("検査に通らなかった: " + "; ".join(errors[:6]))
    if data.get("feasible") and data.get("recipe"):
        version_info = {"model": L.model if not L.mock else "mock", "prompt_version": data.get("_prompt_version", 0)}
        meta = make_meta(ctx, data["recipe"], req, version_info)
        rel = render_recipe.write_recipe(meta, ctx.equipment)
        meta["memo"] = []
        result["recipe_id"] = meta["id"]
        result["recipe"] = meta
        result["_paths"] = [rel]
    return result


def action_pantry_photo(ctx: Context, L: llmmod.LLM, req: dict) -> dict:
    image = req.get("image")
    if not image or not os.path.exists(common.path(image)):
        raise ValueError(f"写真 {image} が無い")
    _, body = common.read_prompt("pantry_photo")
    blocks = [llmmod.image_block(image), {"type": "text", "text": f"この写真は {req.get('hint') or 'fridge'}（hint）。見えている食材を JSON で。"}]
    data, _ = L.structured(name="pantry_photo", system=body, blocks=blocks, schema=schema.PANTRY_PHOTO_OUTPUT, effort="medium")
    items = []
    for it in data.get("items") or []:
        name = ctx.ingredients.normalize(it.get("name", ""))
        if not name:
            continue
        master = ctx.ingredients.get(name)
        if master and master.get("staple"):
            data.setdefault("staples", []).append({"name": name, "state": "ok"})
            continue
        items.append({"name": name, "qty": it.get("qty"), "unit": it.get("unit") or (master or {}).get("unit"),
                      "loc": it.get("loc") or (master or {}).get("loc", "fridge"), "confidence": it.get("confidence", 0.5),
                      "known": bool(master)})
    staples = []
    seen = set()
    for s in data.get("staples") or []:
        name = ctx.ingredients.normalize(s.get("name", ""))
        if name and name not in seen:
            seen.add(name)
            staples.append({"name": name, "state": s.get("state", "ok")})
    # 処理済みの写真は消す（履歴には残る。SPEC §15.1）
    try:
        os.remove(common.path(image))
    except OSError:
        pass
    return {"items": items, "staples": staples, "_paths": [image]}


def action_revise(ctx: Context, L: llmmod.LLM, req: dict) -> dict:
    rid = req.get("recipe_id")
    orig = ctx.recipes.get(rid)
    if not orig:
        raise ValueError(f"レシピ {rid} が無い")
    rlogs = [e for e in ctx.logs if e.get("recipe_id") == rid]
    version, body = common.read_prompt("revise")
    _, rules = common.read_prompt("recipe")
    system = body + "\n\n# recipe.md の規則\n" + rules + "\n\n# 規則（knowledge/safety.md）\n" + ctx.safety
    orig_clean = {k: v for k, v in orig.items() if k not in ("_path", "memo", "stats", "photo")}
    blocks = house_blocks(ctx) + [{"type": "text", "text": "# 元のレシピ（original）\n" + ydump(orig_clean) + "\n\n# このレシピの記録（logs）\n" + (ydump(rlogs) or "（無し）") + "\n\n# 作ったときのメモ\n" + ("\n".join("- " + m for m in orig.get("memo") or []) or "（無し）")}]
    vctx = {"equipment": ctx.equipment, "family": ctx.family, "ingredients": ctx.ingredients, "overrides": ctx.overrides,
            "budget": (orig.get("time") or {}).get("budget"), "speed_factor": ctx.speed_factor, "servings": orig.get("servings") or {}, "config": ctx.cfg}
    retries = int(ctx.cfg["generation"].get("max_retries", 2))
    errors: list[str] = []
    for attempt in range(retries + 1):
        data, _ = L.structured(name="revise", system=system, blocks=blocks, schema=schema.REVISE_OUTPUT)
        errors = validate.validate_recipe(data["recipe"], vctx)
        if not errors:
            break
        blocks = blocks[:-1] + [{"type": "text", "text": blocks[-1]["text"] + "\n\n# 前回の出力の不合格点（直して出し直す）\n- " + "\n- ".join(errors)}]
    if errors:
        raise ValueError("改訂が検査に通らなかった: " + "; ".join(errors[:6]))
    new_version = int(orig.get("version") or 1) + 1
    base = rid.split("-v")[0] if "-v" in rid[-4:] else rid
    new_id = f"{base}-v{new_version}"
    while os.path.exists(common.path("recipes", f"{new_id}.md")):
        new_version += 1
        new_id = f"{base}-v{new_version}"
    pseudo_req = {"id": req.get("id"), "time_budget": (orig.get("time") or {}).get("budget"), "servings": orig.get("servings"), "type": orig.get("type", "dinner")}
    meta = make_meta(ctx, data["recipe"], pseudo_req, {"model": L.model if not L.mock else "mock", "prompt_version": version},
                     rid=new_id, version=new_version, supersedes=rid, changes=data.get("changes") or [])
    rel = render_recipe.write_recipe(meta, ctx.equipment)
    meta["memo"] = []
    return {"recipe_id": new_id, "recipe": meta, "changes": data.get("changes") or [], "feasible": True, "_paths": [rel]}


def action_weekly(ctx: Context, L: llmmod.LLM, req: dict) -> dict:
    version, body = common.read_prompt("weekly")
    system = body + "\n\n# 規則（knowledge/safety.md）\n" + ctx.safety
    start = req.get("start_date") or (common.now() + dt.timedelta(days=(7 - common.now().weekday()) % 7 or 7)).strftime("%Y-%m-%d")
    budgets = req.get("budgets") or {d: int(ctx.cfg["request"].get("default_budget", 25)) for d in WEEKDAYS}
    req["start_date"], req["budgets"] = start, budgets   # 後の recipe_detail が使うので注文に残す
    days = [(dt.date.fromisoformat(start) + dt.timedelta(days=i)).isoformat() for i in range(7)]
    order = {"start_date": start, "dates": days, "budgets": budgets, "servings": req.get("servings") or ctx.family.get("meals", {}).get("dinner_default"),
             "note": req.get("note", ""), "partner_late_days": ctx.family.get("meals", {}).get("partner_late_days") or []}
    blocks = house_blocks(ctx) + [{"type": "text", "text": "# 最近作った物\n" + (ydump(ctx.recent(14)) or "（無し）") + "\n\n# 在庫\n" + ydump(ctx.pantry_for_prompt()) + "\n\n# 注文（1 週間）\n" + ydump(order)}]
    data, _ = L.structured(name="weekly", system=system, blocks=blocks, schema=schema.WEEKLY_OUTPUT)
    week = common.week_key(start)
    lines = [f"---\nweek: {week}\nkind: plan\nstart: '{start}'\n---\n", f"# {week} の献立（{start} の週）\n", "| 日 | 料理 | 分 | 主材料 | なぜ |", "|---|---|---|---|---|"]
    for d in data.get("days") or []:
        lines.append(f"| {d['date'][5:]} | {d['title']} | {d['minutes']} | {', '.join(d.get('main_ingredients') or [])} | {d.get('why', '')} |")
    lines += ["", "## 買い物", ""] + [f"- {s['name']} {s.get('qty') or ''}（{s.get('reason', '')}）" for s in data.get("shopping") or []] + [""]
    rel = f"docs/digests/{week}-plan.md"
    common.write_text(rel, "\n".join(lines))
    return {"days": data.get("days") or [], "shopping": data.get("shopping") or [], "plan_path": rel, "feasible": True, "_paths": [rel]}


def action_photo_note(ctx: Context, L: llmmod.LLM, log_id: str) -> dict | None:
    """ログの写真に一言を付け、ログの行を書き換える。learn.py から呼ぶ。"""
    entry = next((e for e in ctx.logs if e.get("id") == log_id), None)
    if not entry or not entry.get("photo") or not os.path.exists(common.path(entry["photo"])):
        return None
    recipe = ctx.recipes.get(entry.get("recipe_id")) or {}
    _, body = common.read_prompt("photo_note")
    cues = [f"{s.get('title')}: {s.get('cue')}" for s in recipe.get("steps") or []]
    blocks = [llmmod.image_block(entry["photo"]), {"type": "text", "text": f"# レシピ\n- {recipe.get('title')}\n- 完成イメージ: {recipe.get('image_text')}\n- 仕上がりの目安:\n" + "\n".join("  - " + c for c in cues) + f"\n- 子どもの年齢帯: {next((m.get('age_band') for m in ctx.family.get('members') or [] if str(m.get('role', '')).startswith('kid')), '無し')}"}]
    data, _ = L.structured(name="photo_note", system=body, blocks=blocks, schema=schema.PHOTO_NOTE_OUTPUT, effort="low", max_tokens=2000)
    note = (data.get("note") or "").strip()
    if note:
        rewrite_log(log_id, {"photo_note": note})
    return {"note": note}


def rewrite_log(log_id: str, patch: dict) -> bool:
    """logs/ の該当 id の行に patch を足して書き戻す。"""
    for p in sorted(glob.glob(common.path("logs", "*", "*.jsonl"))):
        with open(p, encoding="utf-8") as f:
            lines = f.read().splitlines()
        changed = False
        for i, line in enumerate(lines):
            try:
                e = json.loads(line)
            except json.JSONDecodeError:
                continue
            if e.get("id") == log_id:
                e.update(patch)
                lines[i] = json.dumps(e, ensure_ascii=False)
                changed = True
        if changed:
            with open(p, "w", encoding="utf-8") as f:
                f.write("\n".join(lines) + "\n")
            return True
    return False


# ---- main ----

def load_request(rid: str) -> dict:
    req = common.read_json(f"requests/{rid}.json")
    if not req:
        raise ValueError(f"注文 requests/{rid}.json が無い")
    req.setdefault("id", rid)
    return req


def save_request(req: dict) -> str:
    rel = f"requests/{req['id']}.json"
    common.write_json(rel, req)
    return rel


def run(action: str, rid: str | None, *, mock: bool, use_git: bool, recipe_id: str | None = None, log_id: str | None = None) -> int:
    ctx = Context()
    L = llmmod.LLM(ctx.cfg, mock=mock)
    branch = ctx.cfg["repo"].get("branch", "main")
    if action == "photo_note":
        out = action_photo_note(ctx, L, log_id or "")
        print(json.dumps(out, ensure_ascii=False))
        if use_git and out:
            common.git_commit_push(["logs"], f"agent: photo_note {log_id} [skip ci]", branch)
        return 0

    req = load_request(rid) if rid else {"id": f"req-{common.now().strftime('%Y%m%d-%H%M')}-{common.new_id(4)}", "ts": common.now().isoformat(timespec="seconds"), "type": action}
    if recipe_id:
        req["recipe_id"] = recipe_id
    if action == "auto":
        action = TYPE_TO_ACTION.get(req.get("type"), "")
    paths = [save_request({**req, "status": "running", "error": None})]
    if use_git and rid:
        try:
            common.git_commit_push(paths, f"agent: start {req['id']} [skip ci]", branch)
        except Exception as e:  # 開始の印は失敗してもよい
            print(f"warn: {e}", file=sys.stderr)

    limit = float(ctx.cfg["generation"].get("budget_usd_per_month", 0) or 0)
    started = common.now()
    try:
        if not action:
            raise ValueError(f"注文の type が不正: {req.get('type')}")
        if limit and ctx.month_cost() >= limit and not mock:
            raise ValueError(f"今月の API 費用が上限 {limit} USD に達した（config.yml の generation.budget_usd_per_month）")
        fn = {"recipe": action_recipe, "recipe_detail": action_recipe_detail, "pantry_photo": action_pantry_photo,
              "revise": action_revise, "weekly": action_weekly}[action]
        result = fn(ctx, L, req)
        extra_paths = result.pop("_paths", [])
        usage = L.total_usage()
        model = L.calls[-1]["usage"].get("model", L.model) if L.calls else L.model
        result.update({"model": model, "prompt_version": common.read_prompt(action if action in ("revise", "weekly", "pantry_photo") else "recipe")[0],
                       "tokens": usage, "cost_usd": llmmod.cost_usd(L.model, usage) if not L.mock else 0.0,
                       "seconds": round((common.now() - started).total_seconds())})
        req.update({"status": "done", "error": None, "result": result, "finished": common.now().isoformat(timespec="seconds")})
        paths = [save_request(req)] + extra_paths
        print(json.dumps({"status": "done", "recipe_id": result.get("recipe_id"), "cost_usd": result["cost_usd"]}, ensure_ascii=False))
        code = 0
    except Exception as e:  # 失敗は注文ファイルに書いて終わる（黙って古い候補を出さない）
        traceback.print_exc()
        req.update({"status": "error", "error": str(e), "finished": common.now().isoformat(timespec="seconds")})
        paths = [save_request(req)]
        code = 1
    if use_git:
        common.git_commit_push(paths, f"agent: {action} {req['id']} {'done' if code == 0 else 'error'} [skip ci]", branch)
    return code


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("action", choices=["auto", "recipe", "recipe_detail", "pantry_photo", "revise", "weekly", "photo_note"])
    ap.add_argument("--request")
    ap.add_argument("--recipe")
    ap.add_argument("--log")
    ap.add_argument("--mock", action="store_true")
    ap.add_argument("--no-git", action="store_true")
    a = ap.parse_args(argv)
    if a.action not in ("photo_note", "revise") and not a.request:
        ap.error("--request が要る")
    return run(a.action, a.request, mock=a.mock, use_git=not a.no_git, recipe_id=a.recipe, log_id=a.log)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
