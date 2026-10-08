"""Generator（Claude API）の出力 JSON スキーマと、レーン・工程の語彙。

structured output（output_config.format）に渡す。全項目を required にし、任意の物は null を許す。
ページ（site/app.js）も同じ形を読むので、変えるときは両方を直す。
"""
from __future__ import annotations

STEP_KINDS = ["prep", "heat", "wait", "serve"]
STEP_TAGS = ["sear", "stir-fry", "boil", "simmer", "microwave", "cut", "marinate", "season", "serve", "cleanup", "kid", "wait", "rice"]
DISH_ROLES = ["main", "side", "soup", "onepot", "rice"]
ALT_KINDS = ["standard", "new"]
RECIPE_STATUSES = ["draft", "tried", "standard", "retired"]
FREE_INGREDIENTS = {"水", "湯", "お湯", "熱湯", "氷", "ぬるま湯"}


def _s(nullable: bool = False) -> dict:
    return {"type": ["string", "null"]} if nullable else {"type": "string"}


def _n(nullable: bool = False) -> dict:
    return {"type": ["number", "null"]} if nullable else {"type": "number"}


def _i(nullable: bool = False) -> dict:
    return {"type": ["integer", "null"]} if nullable else {"type": "integer"}


def _obj(props: dict, required: list[str] | None = None) -> dict:
    return {
        "type": "object",
        "properties": props,
        "required": required if required is not None else list(props.keys()),
        "additionalProperties": False,
    }


def _arr(items: dict) -> dict:
    return {"type": "array", "items": items}


INGREDIENT = _obj({
    "name": _s(),
    "qty": _n(True),
    "unit": _s(True),
    "grams": _n(True),
    "pantry": _s(True),            # pantry.json の name（正規化名）。水・湯など在庫に無い物は null
    "for": _s(),                   # どの料理に使うか（dishes の name）
    "substitute": _s(True),        # 在庫の物で代わりにできる物
    "use_up": {"type": "boolean"},
})

STEP = _obj({
    "dish": _s(),
    "n": _i(),
    "title": _s(),
    "kind": {"type": "string", "enum": STEP_KINDS},
    "tag": {"type": ["string", "null"], "enum": STEP_TAGS + [None]},
    "minutes": _n(),
    "heat": {"anyOf": [_obj({"equipment": _s(), "level": _s()}), {"type": "null"}]},
    "text": _s(),
    "cue": _s(),
    "caution": _s(True),
    "timer": _i(True),             # 秒。放っておく時間
    "kid": _s(True),               # 子どもの分の一言
})

TIMELINE_ROW = _obj({"minute": _i(), "lane": _s(), "text": _s()})

RECIPE = _obj({
    "title": _s(),
    "title_roman": _s(),           # id のスラッグ用（例: torimomo-teriyaki）
    "image_text": _s(),
    "dishes": _arr(_obj({"name": _s(), "role": {"type": "string", "enum": DISH_ROLES}})),
    "equipment": _arr(_s()),
    "ingredients": _arr(INGREDIENT),
    "tags": _arr(_s()),
    "salt": _obj({"total_g": _n(), "adult_per_serving_g": _n(), "kid_g": _n(True)}),
    "kid": {"anyOf": [_obj({"rule": _s(), "cut": _s(), "note": _s()}), {"type": "null"}]},
    "keep": _obj({"fridge_days": _i(), "freezer": {"type": "boolean"}, "reheat": _s()}),
    "timeline": _arr(TIMELINE_ROW),
    "steps": _arr(STEP),
    "cleanup": _obj({"dishwasher": _arr(_s()), "hand": _arr(_s()), "note": _s(True)}),
    "raw_estimate": _i(),          # 段取り表の最後の分（盛り付け・配膳を含む）
    "active_minutes": _i(),        # 手を動かしている分
})

ALTERNATIVE = _obj({"title": _s(), "minutes": _i(), "why": _s(), "kind": {"type": "string", "enum": ALT_KINDS}})

RECIPE_OUTPUT = _obj({
    "feasible": {"type": "boolean"},
    "infeasible_reason": _s(True),
    "nearest_options": _arr(_obj({"title": _s(), "minutes": _i(), "why": _s()})),
    "recipe": {"anyOf": [RECIPE, {"type": "null"}]},
    "alternatives": _arr(ALTERNATIVE),
})

REVISE_OUTPUT = _obj({
    "recipe": RECIPE,
    "changes": _arr(_obj({"what": _s(), "why": _s()})),
})

PANTRY_PHOTO_OUTPUT = _obj({
    "items": _arr(_obj({
        "name": _s(),
        "qty": _n(True),
        "unit": _s(True),
        "loc": {"type": "string", "enum": ["fridge", "freezer", "pantry"]},
        "confidence": _n(),
    })),
    "staples": _arr(_obj({"name": _s(), "state": {"type": "string", "enum": ["ok", "low", "none"]}})),
})

PHOTO_NOTE_OUTPUT = _obj({"note": _s()})

LEARN_OUTPUT = _obj({
    "equipment_notes": _arr(_s()),
    "recipe_notes": _arr(_s()),
    "kid_works_if": _arr(_s()),
})

WEEKLY_OUTPUT = _obj({
    "days": _arr(_obj({
        "date": _s(),
        "title": _s(),
        "main_ingredients": _arr(_s()),
        "minutes": _i(),
        "why": _s(),
        "kind": {"type": "string", "enum": ALT_KINDS},
    })),
    "shopping": _arr(_obj({"name": _s(), "qty": _s(True), "reason": _s()})),
})


# ---- レーン ----

def lanes_for(equipment: dict) -> list[dict]:
    """equipment.yml から段取り表のレーンを作る: 各コンロ、レンジ（あれば）、手。"""
    lanes = []
    for h in equipment.get("heat") or []:
        lanes.append({"id": h["id"], "label": h.get("label", h["id"]), "kind": "heat"})
    for a in equipment.get("appliances") or []:
        if a.get("type") == "microwave":
            lanes.append({"id": a["id"], "label": "レンジ", "kind": "microwave"})
            break
    lanes.append({"id": "hands", "label": "手", "kind": "hands"})
    return lanes


def equipment_ids(equipment: dict) -> set[str]:
    ids = set()
    for key in ("heat", "appliances", "cookware"):
        for it in equipment.get(key) or []:
            if isinstance(it, dict) and it.get("id"):
                ids.add(it["id"])
    return ids


def equipment_label(equipment: dict, eid: str) -> str:
    for key in ("heat", "appliances", "cookware"):
        for it in equipment.get(key) or []:
            if isinstance(it, dict) and it.get("id") == eid:
                if it.get("label"):
                    return it["label"]
                t = it.get("type", "")
                size = f" {it['size_cm']}cm" if it.get("size_cm") else ""
                names = {"frying_pan": "フライパン", "pot": "鍋", "bowl": "ボウル", "microwave": "レンジ",
                         "toaster_oven": "トースター", "rice_cooker": "炊飯器", "kettle": "ケトル", "dishwasher": "食洗機"}
                return f"{names.get(t, t)}{size}"
    if eid == "hands":
        return "手"
    return eid


DIGEST_OUTPUT = _obj({
    "comment": _s(),                                   # 今週の一言（60 字以内）
    "proposals": _arr(_obj({"title": _s(), "minutes": _i(), "why": _s()})),   # 来週の提案 3 つ
    "shopping": _arr(_obj({"name": _s(), "qty": _s(True), "reason": _s()})),
})
