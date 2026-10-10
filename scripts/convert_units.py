"""古いレシピの分量を、g から本・個・丁などの数えられる単位に直す。

  python3 scripts/convert_units.py            # recipes/*.md を全部（書き換えた物だけ保存）
  python3 scripts/convert_units.py --dry-run  # 変更点を出すだけ

マスタ（data/ingredients.yml）の unit が本・個などで、per_unit_g があり、レシピが g で書いている材料だけ直す。
qty は 1 未満なら 1/8・1/4・1/3・1/2・2/3・3/4、1 以上は 1/2 刻みに丸め、元の g は grams に残す。
手順・段取り表の文に「豆腐150g」「豆腐（150g）」のように書かれていれば「豆腐 1/2 丁（150g）」に直す。
本文（Markdown）は front matter から作り直す（作ったときのメモは残す）。
"""
from __future__ import annotations

import argparse
import re
import sys

import common
import render_recipe
import validate


def convert_ingredients(meta: dict, ing: common.Ingredients) -> list[tuple[str, str, str]]:
    """g → 数えられる単位。返り値は (材料名, 前, 後) の一覧。"""
    changes: list[tuple[str, str, str]] = []
    for i in meta.get("ingredients") or []:
        if (i.get("unit") or "") != "g" or not isinstance(i.get("qty"), (int, float)):
            continue
        m = ing.get(ing.normalize(i.get("name", "")))
        unit, per = (m or {}).get("unit"), (m or {}).get("per_unit_g")
        if unit not in validate.COUNT_UNITS or not per:
            continue
        grams = float(i["qty"])
        qty = validate.nearest_count(grams / per)
        if qty <= 0:
            continue
        before = f"{grams:g} g"
        i["grams"] = i.get("grams") if isinstance(i.get("grams"), (int, float)) else grams
        i["qty"], i["unit"] = qty, unit
        after = render_recipe.qty_text(i)
        changes.append((i["name"], before, after))
    return changes


def rewrite_texts(meta: dict, changes: list[tuple[str, str, str]]) -> int:
    """手順・段取り表の「豆腐150g」を「豆腐 1/2 丁（150g）」に。返り値は直した箇所の数。"""
    n = 0
    for name, before, after in changes:
        g = before.replace(" g", "")
        pat = re.compile(r"%s\s*[（(]?\s*%s\s*g\s*[）)]?" % (re.escape(name), re.escape(g)))
        rep = f"{name} {after}" if "（" in after else f"{name} {after}（{g}g）"
        for st in meta.get("steps") or []:
            for key in ("text", "cue", "caution", "kid"):
                if st.get(key) and pat.search(st[key]):
                    st[key], k = pat.subn(rep, st[key]); n += k
        for row in meta.get("timeline") or []:
            if row.get("text") and pat.search(row["text"]):
                row["text"], k = pat.subn(rep, row["text"]); n += k
    return n


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)
    ing = common.Ingredients()
    equipment = common.read_yaml("equipment.yml", {}) or {}
    touched = 0
    for p in common.list_recipe_files():
        meta, body = common.read_recipe(p)
        meta["memo"] = common.extract_memo(body)
        changes = convert_ingredients(meta, ing)
        if not changes:
            continue
        n = rewrite_texts(meta, changes)
        print(f"{meta['id']}: " + "、".join(f"{a} {b} → {c}" for a, b, c in changes) + f"（文 {n} 箇所）")
        errs = validate.validate_file(p) if args.dry_run else []
        if args.dry_run:
            continue
        render_recipe.write_recipe(meta, equipment)
        errs = validate.validate_file(p)
        if errs:
            print("  検査: " + "; ".join(errs), file=sys.stderr)
            return 2
        touched += 1
    print(f"{touched} 本を書き換えた" if not args.dry_run else "（dry-run）")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
