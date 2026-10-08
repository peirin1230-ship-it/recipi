"""Generator の JSON → recipes/<id>.md（docs/SPEC.md §6.5）。

使い方:
  python3 scripts/render_recipe.py <json ファイル> [--id <id>] [--request <req-id>] [--budget 25] [--servings 2,1]
front matter に構造化データを全部入れ、本文は人が読む形に整形する。ページは front matter（JSON 化した物）だけを読む。
"""
from __future__ import annotations

import argparse
import json
import sys

import common
import schema
import validate


def build_meta(recipe: dict, *, rid: str, request_id: str | None, budget: int | None, servings: dict,
               rtype: str, speed_factor: dict, generated_by: dict, version: int = 1, supersedes: str | None = None,
               changes: list | None = None, status: str = "draft") -> dict:
    planned = validate.planned_minutes(recipe, speed_factor)
    meta = {
        "id": rid,
        "title": recipe["title"],
        "version": version,
        "supersedes": supersedes,
        "status": status,
        "created": common.today(),
        "request": request_id,
        "generated_by": generated_by,
        "type": rtype,
        "servings": servings,
        "time": {
            "budget": budget,
            "planned": planned,
            "active": recipe.get("active_minutes"),
            "raw_estimate": recipe.get("raw_estimate"),
            "speed_factor": round(float(speed_factor.get("overall", 1.0) or 1.0), 2),
        },
        "image_text": recipe.get("image_text", ""),
        "dishes": recipe["dishes"],
        "equipment": recipe["equipment"],
        "ingredients": recipe["ingredients"],
        "tags": recipe.get("tags", []),
        "salt": recipe.get("salt"),
        "kid": recipe.get("kid"),
        "keep": recipe.get("keep"),
        "timeline": recipe["timeline"],
        "steps": recipe["steps"],
        "cleanup": recipe.get("cleanup"),
        "photo": None,
        "stats": {"cooked": 0, "r_avg": None, "f_avg": None, "last": None},
        "detail": "full",
    }
    if changes:
        meta["changes"] = changes
    return meta


def render_body(meta: dict, equipment: dict | None = None) -> str:
    equipment = equipment or common.read_yaml("equipment.yml", {}) or {}
    lanes = schema.lanes_for(equipment)
    lane_label = {l["id"]: l["label"] for l in lanes}
    used = []
    for row in meta.get("timeline") or []:
        if row["lane"] not in used:
            used.append(row["lane"])
    used.sort(key=lambda l: [x["id"] for x in lanes].index(l) if l in lane_label else 99)

    out = []
    t = meta.get("time") or {}
    out.append(f"## 段取り表（{t.get('planned') or t.get('raw_estimate')} 分）\n")
    out.append("| 分 | " + " | ".join(lane_label.get(l, l) for l in used) + " |")
    out.append("|---|" + "---|" * len(used))
    minutes = sorted({row["minute"] for row in meta.get("timeline") or []})
    for m in minutes:
        cells = []
        for l in used:
            cells.append(" / ".join(row["text"] for row in meta["timeline"] if row["minute"] == m and row["lane"] == l))
        out.append(f"| {m} | " + " | ".join(cells) + " |")
    out.append("")

    sv = meta.get("servings") or {}
    out.append(f"## 材料（大人 {sv.get('adults', '?')}・子 {sv.get('kids', 0)}）\n")
    out.append("| 材料 | 量 | 用途 | 在庫名 |")
    out.append("|---|---|---|---|")
    for i in meta.get("ingredients") or []:
        qty = "" if i.get("qty") is None else (f"{i['qty']:g}" if isinstance(i["qty"], (int, float)) else str(i["qty"]))
        amount = f"{qty} {i.get('unit') or ''}".strip()
        if i.get("grams") and (i.get("unit") or "") != "g":
            amount += f"（{i['grams']:g}g）"
        extra = ""
        if i.get("use_up"):
            extra += " 使い切り"
        if i.get("substitute"):
            extra += f" 代替: {i['substitute']}"
        out.append(f"| {i['name']} | {amount} | {i.get('for', '')}{extra} | {i.get('pantry') or '—'} |")
    salt = meta.get("salt") or {}
    if salt:
        out.append(f"\n塩分: 合計 {salt.get('total_g')}g ・ 大人 1 人分 {salt.get('adult_per_serving_g')}g ・ 子ども {salt.get('kid_g')}g")
    out.append("")

    out.append("## 手順\n")
    for d in meta.get("dishes") or []:
        out.append(f"### {d['name']}")
        for st in [s for s in meta.get("steps") or [] if s.get("dish") == d["name"]]:
            heat = ""
            if st.get("heat"):
                heat = f" {schema.equipment_label(equipment, st['heat']['equipment'])}・{st['heat']['level']}"
            out.append(f"{st['n']}. **{st['title']}（{st['minutes']:g} 分 / {st['kind']}）**{heat} {st['text']}")
            out.append(f"   - 目安: {st['cue']}")
            if st.get("timer"):
                out.append(f"   - ⏱ {st['timer'] // 60} 分{(' ' + str(st['timer'] % 60) + ' 秒') if st['timer'] % 60 else ''}")
            if st.get("caution"):
                out.append(f"   - ⚠ {st['caution']}")
            if st.get("kid"):
                out.append(f"   - 🍼 {st['kid']}")
        out.append("")

    kid = meta.get("kid")
    if kid:
        out.append("## 子どもの分\n")
        out.append(f"- 取り分け: {kid.get('rule')} ・ 大きさ: {kid.get('cut')}")
        out.append(f"- {kid.get('note')}")
        out.append("")

    keep = meta.get("keep") or {}
    if keep:
        out.append("## 保存・翌日\n")
        out.append(f"- 冷蔵 {keep.get('fridge_days')} 日 ・ 冷凍 {'可' if keep.get('freezer') else '不向き'}")
        out.append(f"- 温め直し: {keep.get('reheat')}")
        out.append("")

    cl = meta.get("cleanup") or {}
    if cl:
        out.append("## 片付け\n")
        dw = ", ".join(schema.equipment_label(equipment, e) for e in cl.get("dishwasher") or []) or "—"
        hd = ", ".join(schema.equipment_label(equipment, e) for e in cl.get("hand") or []) or "—"
        out.append(f"- 食洗機: {dw}")
        out.append(f"- 手洗い: {hd}")
        if cl.get("note"):
            out.append(f"- {cl['note']}")
        out.append("")

    if meta.get("changes"):
        out.append("## 改訂の内容\n")
        for c in meta["changes"]:
            out.append(f"- {c.get('what')} — {c.get('why')}")
        out.append("")

    out.append(common.MEMO_HEADING + "\n")
    for line in meta.get("memo") or []:
        out.append(f"- {line}")
    out.append("")
    return "\n".join(out)


def write_recipe(meta: dict, equipment: dict | None = None) -> str:
    """recipes/<id>.md を書く。memo は meta から外して本文に出す。返り値は相対パス。"""
    meta = dict(meta)
    memo = meta.pop("memo", []) or []
    meta.pop("_path", None)
    body = render_body({**meta, "memo": memo}, equipment)
    rel = f"recipes/{meta['id']}.md"
    common.write_text(rel, common.join_front_matter(meta, body))
    return rel


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("json_file")
    ap.add_argument("--id")
    ap.add_argument("--request")
    ap.add_argument("--budget", type=int)
    ap.add_argument("--servings", default="2,1", help="大人,子ども")
    ap.add_argument("--type", default="dinner")
    args = ap.parse_args(argv)
    with open(args.json_file, encoding="utf-8") as f:
        data = json.load(f)
    recipe = data.get("recipe", data)
    adults, kids = (int(x) for x in args.servings.split(","))
    learned = common.read_yaml("profile/learned.yml", {}) or {}
    speed = learned.get("speed_factor") or {}
    rid = args.id or common.recipe_id_for(recipe.get("title_roman") or recipe["title"])
    meta = build_meta(recipe, rid=rid, request_id=args.request, budget=args.budget, servings={"adults": adults, "kids": kids},
                      rtype=args.type, speed_factor=speed, generated_by={"model": "manual", "prompt_version": 0})
    rel = write_recipe(meta)
    print(rel)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
