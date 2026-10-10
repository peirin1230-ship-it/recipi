"""レシピの機械検査（docs/SPEC.md §7.3 / §7.6）。

使い方:
  python3 scripts/validate.py recipes/<id>.md            # 構造・安全・器具の検査（在庫と時間は見ない）
  python3 scripts/validate.py --all                      # recipes/ 全部

agent.py は validate_recipe(recipe, ctx) を生成直後に呼び、不合格なら理由を添えてやり直す。
ctx: equipment / family / pantry / budget / speed_factor / config を持つ dict。無い物は検査しない。
"""
from __future__ import annotations

import re
import unicodedata
import sys

import common
import schema

SALT_LIMIT_ADULT = {"light": 2.0, "normal": 2.5}
SALT_LIMIT_KID = {"0-6m": 0.0, "6-12m": 0.5, "1-2y": 1.0, "2-3y": 1.0, "3-5y": 1.2, "6y+": 1.5}
SALT_TOLERANCE = 0.2

# 年齢帯ごとに子どもに使わない物（knowledge/safety.md §1）。帯の並び順で「この帯まで不可」
BANDS = ["0-6m", "6-12m", "1-2y", "2-3y", "3-5y", "6y+"]
NG_UNTIL = {
    "はちみつ": "6-12m", "蜂蜜": "6-12m", "ハチミツ": "6-12m",
    "生卵": "2-3y", "半熟": "2-3y", "温泉卵": "2-3y",
    "刺身": "1-2y", "生魚": "1-2y", "生肉": "1-2y", "ユッケ": "3-5y",
    "餅": "2-3y", "白玉": "2-3y", "団子": "2-3y",
    "ナッツ": "3-5y", "ピーナッツ": "3-5y", "アーモンド": "3-5y", "くるみ": "3-5y", "カシューナッツ": "3-5y",
    "飴": "3-5y", "こんにゃくゼリー": "3-5y",
    "唐辛子": "2-3y", "わさび": "2-3y", "豆板醤": "2-3y", "ラー油": "2-3y", "七味": "2-3y", "辛口": "2-3y",
    "明太子": "1-2y", "塩辛": "2-3y", "たらこ": "1-2y",
}
DEEP_FRY = re.compile(r"揚げる|揚げ油|油で揚げ|180\s*[℃度]の油|170\s*[℃度]の油|たっぷりの油")


def _band_index(band: str | None) -> int:
    return BANDS.index(band) if band in BANDS else len(BANDS) - 1


_TITLE_STRIP = str.maketrans("", "", " \u3000・、。，,.（）()「」『』【】!！?？")


def norm_title(t: str) -> str:
    """料理名の比較用: 全角半角をそろえ、小文字にし、空白と区切りの記号を外す。"""
    return unicodedata.normalize("NFKC", str(t or "")).lower().translate(_TITLE_STRIP)


def alternatives_errors(title: str, alternatives: list, taken: list[str]) -> list[str]:
    """別案の料理名が、本命・互い・一覧（taken）と同じなら不合格。"""
    errors: list[str] = []
    have = {norm_title(t) for t in taken if t}
    seen = {norm_title(title)} if title else set()
    for a in alternatives:
        t = (a or {}).get("title") if isinstance(a, dict) else None
        if not t:
            continue
        n = norm_title(t)
        if n in have:
            errors.append(f"別案「{t}」は一覧にある料理（または退けた料理）と同じ。別の料理にする")
        elif n in seen:
            errors.append(f"別案「{t}」が本命か別の別案と同じ。別の料理にする")
        seen.add(n)
    return errors


def validate_recipe(recipe: dict, ctx: dict | None = None) -> list[str]:
    """不合格の理由のリスト。空なら合格。"""
    ctx = ctx or {}
    errors: list[str] = []
    r = recipe

    # ---- 構造 ----
    for key in ("title", "dishes", "ingredients", "steps", "timeline", "equipment", "salt", "keep", "cleanup"):
        if not r.get(key):
            errors.append(f"{key} が無い")
    if errors:
        return errors
    dish_names = {d.get("name") for d in r["dishes"]}

    # ---- 重複（一覧にある料理名・退けた料理名と同じなら不合格。主菜の重複は指示で避ける） ----
    taken = {norm_title(t) for t in (ctx.get("existing_titles") or []) if t}
    if taken and norm_title(r["title"]) in taken:
        errors.append(f"「{r['title']}」は一覧にある料理（または退けた料理）と同じ。主材料か調理法を変えて別の料理にする")

    # ---- 器具 ----
    equipment = ctx.get("equipment")
    if equipment:
        ids = schema.equipment_ids(equipment)
        lane_ids = {l["id"] for l in schema.lanes_for(equipment)}
        for eid in r["equipment"]:
            if eid not in ids:
                errors.append(f"器具 {eid} は equipment.yml に無い（使える id: {', '.join(sorted(ids))}）")
        for st in r["steps"]:
            h = st.get("heat")
            if h and h.get("equipment") not in ids:
                errors.append(f"手順「{st.get('title')}」の火加減の器具 {h.get('equipment')} が equipment.yml に無い")
            if h and not (h.get("level") or "").strip():
                errors.append(f"手順「{st.get('title')}」の火加減（level）が空")
        for row in r["timeline"]:
            if row.get("lane") not in lane_ids:
                errors.append(f"段取り表のレーン {row.get('lane')} が無い（使えるレーン: {', '.join(sorted(lane_ids))}）")
        for eid in (r["cleanup"].get("dishwasher") or []) + (r["cleanup"].get("hand") or []):
            if eid not in ids:
                errors.append(f"片付けの器具 {eid} が equipment.yml に無い")
        texts = " ".join(st.get("text", "") + " " + (st.get("caution") or "") for st in r["steps"])
        texts += " ".join(row.get("text", "") for row in r["timeline"])
        for m in equipment.get("missing") or []:
            if m and m in texts:
                errors.append(f"無い道具「{m}」を使っている")
        prefs = equipment.get("preferences") or {}
        if prefs.get("avoid_deep_fry") and DEEP_FRY.search(texts):
            errors.append("揚げ物は提案しない設定（avoid_deep_fry）")
        max_pans = prefs.get("max_pans_at_once")
        if max_pans:
            heat_lanes = {row["lane"] for row in r["timeline"] if row.get("lane") in {l["id"] for l in schema.lanes_for(equipment) if l["kind"] == "heat"}}
            if len(heat_lanes) > max_pans:
                errors.append(f"同時に使うコンロが {len(heat_lanes)} 口（上限 {max_pans}）")

    # ---- 材料 ----
    ing = ctx.get("ingredients") or common.Ingredients()
    family = ctx.get("family") or {}
    allergies = [a for a in (family.get("allergies") or []) if a]
    never = [a for a in ((ctx.get("overrides") or {}).get("never") or []) if a]
    all_text = " ".join([r["title"], r.get("image_text", "")] + [i["name"] for i in r["ingredients"]] +
                        [st.get("text", "") for st in r["steps"]])
    for a in allergies:
        if a in all_text:
            errors.append(f"アレルギーの食材「{a}」が含まれている")
    for a in never:
        if a in all_text:
            errors.append(f"使わない食材「{a}」（overrides.never）が含まれている")

    pantry = ctx.get("pantry")
    if pantry is not None:
        item_names = {ing.normalize(it["name"]) for it in pantry.get("items", [])}
        staples = pantry.get("staples", {}) or {}
        for i in r["ingredients"]:
            name = i.get("name", "")
            pn = i.get("pantry")
            if name in schema.FREE_INGREDIENTS or (pn is None and ing.normalize(name) in schema.FREE_INGREDIENTS):
                continue
            key = ing.normalize(pn or name)
            if key in staples:
                if staples[key] == "none":
                    errors.append(f"「{name}」は切らしている（staples: none）")
                continue
            if key not in item_names:
                errors.append(f"「{name}」は在庫に無い（pantry: {pn}）。在庫の名前をそのまま使う")
    for i in r["ingredients"]:
        unit = (i.get("unit") or "")
        if unit in ("適量", "少々") and not re.search(r"塩|こしょう|胡椒|ペッパー", i.get("name", "")):
            errors.append(f"「{i.get('name')}」の分量が「{unit}」。塩・こしょう以外は量を書く")
        if i.get("qty") is None and i.get("name") not in schema.FREE_INGREDIENTS and unit not in ("適量", "少々"):
            errors.append(f"「{i.get('name')}」の分量（qty）が無い")
        if i.get("for") and i["for"] not in dish_names:
            errors.append(f"材料「{i.get('name')}」の for「{i['for']}」が dishes に無い")

    # ---- 手順 ----
    for st in r["steps"]:
        t = st.get("title") or "?"
        if st.get("kind") not in schema.STEP_KINDS:
            errors.append(f"手順「{t}」の kind が不正: {st.get('kind')}")
        if not isinstance(st.get("minutes"), (int, float)) or st["minutes"] <= 0:
            errors.append(f"手順「{t}」の minutes が無い")
        if not (st.get("cue") or "").strip():
            errors.append(f"手順「{t}」に仕上がりの目安（cue）が無い")
        if not (st.get("text") or "").strip():
            errors.append(f"手順「{t}」の text が空")
        if st.get("dish") not in dish_names:
            errors.append(f"手順「{t}」の dish「{st.get('dish')}」が dishes に無い")
        if st.get("kind") in ("heat", "wait") and st.get("tag") != "microwave" and not st.get("heat") and "レンジ" not in (st.get("text") or "") and "炊飯器" not in (st.get("text") or "") and "トースター" not in (st.get("text") or ""):
            errors.append(f"手順「{t}」は加熱なのに火加減（heat）が無い")

    # ---- 段取り表 ----
    last = -1
    for row in r["timeline"]:
        if not isinstance(row.get("minute"), int) or row["minute"] < last:
            errors.append("段取り表の分が昇順でない")
            break
        last = row["minute"]
    raw = r.get("raw_estimate")
    if raw is None:
        raw = (r.get("time") or {}).get("raw_estimate")   # recipes/<id>.md の front matter の形
    if not isinstance(raw, int) or raw <= 0:
        errors.append("raw_estimate が無い")
    elif r["timeline"] and raw < max(row.get("minute", 0) for row in r["timeline"]):
        errors.append("raw_estimate が段取り表の最後の分より小さい")

    # ---- 子ども ----
    servings = ctx.get("servings") or {}
    kids = servings.get("kids", 0)
    kid_members = [m for m in (family.get("members") or []) if str(m.get("role", "")).startswith("kid")]
    if kids and kid_members:
        if not r.get("kid"):
            errors.append("子どもがいるのに kid（取り分け）が無い")
        elif not (r["kid"].get("cut") and r["kid"].get("note")):
            errors.append("kid の cut と note を書く")
        if not any(st.get("kid") for st in r["steps"]):
            errors.append("子どもの分の一言（steps[].kid）がどの手順にも無い")
        band = kid_members[0].get("age_band")
        bi = _band_index(band)
        kid_text = " ".join([(r.get("kid") or {}).get("note", "")] + [st.get("kid") or "" for st in r["steps"]]
                            + [i["name"] for i in r["ingredients"]])
        for word, until in NG_UNTIL.items():
            if word in kid_text and bi <= _band_index(until):
                errors.append(f"{band} の子どもに「{word}」は使えない（knowledge/safety.md §1）")
        kg = (r.get("salt") or {}).get("kid_g")
        limit = SALT_LIMIT_KID.get(band, 1.5)
        if isinstance(kg, (int, float)) and kg > limit + SALT_TOLERANCE:
            errors.append(f"子どもの塩分 {kg}g が上限 {limit}g を超えている")

    # ---- 塩分（大人）----
    salt_mode = (family.get("seasoning") or {}).get("salt", "normal")
    ag = (r.get("salt") or {}).get("adult_per_serving_g")
    limit = SALT_LIMIT_ADULT.get(salt_mode, 2.5)
    if isinstance(ag, (int, float)) and ag > limit + SALT_TOLERANCE:
        errors.append(f"大人 1 人分の塩分 {ag}g が上限 {limit}g（salt: {salt_mode}）を超えている")

    # ---- 工程の材料（steps[].ingredients）: 材料表に無い名前は不合格。量のある材料はどこかの工程に出す ----
    if any("ingredients" in st for st in r["steps"]):
        names = {norm_title(i.get("name", "")): i for i in r["ingredients"]}
        used: set[str] = set()
        for st in r["steps"]:
            for nm in st.get("ingredients") or []:
                k = norm_title(nm)
                if k not in names:
                    errors.append(f"手順「{st.get('title')}」の ingredients「{nm}」が材料表に無い（材料表の name と同じ表記にする）")
                used.add(k)
        missing = [i.get("name") for k, i in names.items() if k not in used and i.get("qty") is not None and i.get("name") not in schema.FREE_INGREDIENTS]
        if missing:
            errors.append("材料がどの工程の ingredients にも出てこない: " + "、".join(missing) + "（使う工程の ingredients に name を入れる）")

    # ---- 時間 ----
    budget = ctx.get("budget")
    if budget and isinstance(raw, int):
        margin = float(((ctx.get("config") or {}).get("generation") or {}).get("time_margin", 0.9))
        planned = planned_minutes(r, ctx.get("speed_factor") or {})
        if planned > budget * margin:
            errors.append(f"見込み {planned} 分（素の見込み {raw} 分 × うちの速度係数）が予算 {budget} 分の {int(margin * 100)}% を超えている。工程を短くするか品数を減らす")

    return errors


def planned_minutes(recipe: dict, speed_factor: dict) -> int:
    """raw_estimate に、工程の種類ごとの速度係数を加重して掛ける（docs/SPEC.md §7.2）。wait には掛けない。"""
    raw = int(recipe.get("raw_estimate") or 0)
    total = 0.0
    scaled = 0.0
    for st in recipe.get("steps") or []:
        m = float(st.get("minutes") or 0)
        kind = st.get("kind")
        f = 1.0 if kind == "wait" else float(speed_factor.get(kind, speed_factor.get("overall", 1.0)) or 1.0)
        total += m
        scaled += m * f
    if total <= 0:
        return raw
    return int(round(raw * scaled / total))


def validate_file(p: str, ctx: dict | None = None) -> list[str]:
    meta, _ = common.read_recipe(p)
    base = {"equipment": common.read_yaml("equipment.yml", {}), "family": common.read_yaml("family.yml", {}),
            "servings": meta.get("servings") or {}}
    base.update(ctx or {})
    return validate_recipe(meta, base)


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__)
        return 2
    files = common.list_recipe_files() if argv[0] == "--all" else argv
    bad = 0
    for p in files:
        errs = validate_file(p)
        if errs:
            bad += 1
            print(f"✗ {p}")
            for e in errs:
                print(f"   - {e}")
        else:
            print(f"✓ {p}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
