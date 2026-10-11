import copy
import json
import os

import common
import validate


def load_fixture():
    with open(os.path.join(common.ROOT, "tests", "fixtures", "recipe_teriyaki.json"), encoding="utf-8") as f:
        return json.load(f)["recipe"]


def ctx(**kw):
    base = {"equipment": common.read_yaml("equipment.yml"), "family": common.read_yaml("family.yml"), "pantry": common.read_json("pantry.json"),
            "budget": 25, "speed_factor": {"overall": 1.0, "prep": 1.0, "heat": 1.0, "serve": 1.0}, "servings": {"adults": 2, "kids": 1}, "config": common.load_config()}
    base.update(kw)
    return base


def test_fixture_passes():
    assert validate.validate_recipe(load_fixture(), ctx()) == []


def test_missing_equipment_fails():
    r = load_fixture()
    r["equipment"].append("oven-x")
    errs = validate.validate_recipe(r, ctx())
    assert any("oven-x" in e for e in errs)


def test_missing_tool_in_text_fails():
    r = load_fixture()
    r["steps"][0]["text"] += " オーブンで焼く"
    assert any("オーブン" in e for e in validate.validate_recipe(r, ctx()))


def test_allergen_fails():
    r = load_fixture()
    fam = copy.deepcopy(common.read_yaml("family.yml"))
    fam["allergies"] = ["鶏"]
    assert any("アレルギー" in e for e in validate.validate_recipe(r, ctx(family=fam)))


def test_not_in_pantry_fails():
    r = load_fixture()
    r["ingredients"].append({"name": "鮭", "qty": 2, "unit": "切れ", "grams": 160, "pantry": "鮭", "for": "鶏もも肉の照り焼き", "substitute": None, "use_up": False})
    assert any("在庫に無い" in e for e in validate.validate_recipe(r, ctx()))


def test_staple_none_fails():
    r = load_fixture()
    p = copy.deepcopy(common.read_json("pantry.json"))
    p["staples"]["醤油"] = "none"
    assert any("切らしている" in e for e in validate.validate_recipe(r, ctx(pantry=p)))


def test_tekiryo_fails():
    r = load_fixture()
    r["ingredients"][0]["unit"] = "適量"
    assert any("適量" in e for e in validate.validate_recipe(r, ctx()))


def test_cue_required():
    r = load_fixture()
    r["steps"][2]["cue"] = ""
    assert any("目安" in e for e in validate.validate_recipe(r, ctx()))


def test_kid_ng_food():
    r = load_fixture()
    r["kid"]["note"] += " はちみつを少し"
    errs = validate.validate_recipe(r, ctx())
    assert not any("はちみつ" in e for e in errs)   # 1-2y は蜂蜜 OK
    fam = copy.deepcopy(common.read_yaml("family.yml"))
    fam["members"][2]["age_band"] = "6-12m"
    assert any("はちみつ" in e for e in validate.validate_recipe(r, ctx(family=fam)))


def test_budget_exceeded():
    r = load_fixture()
    errs = validate.validate_recipe(r, ctx(budget=15))
    assert any("予算" in e for e in errs)


def test_planned_minutes_scaling():
    r = load_fixture()
    assert validate.planned_minutes(r, {"overall": 1.0}) == 18
    assert validate.planned_minutes(r, {"prep": 2.0, "heat": 1.0, "serve": 1.0, "overall": 1.0}) > 18


def test_salt_limit():
    r = load_fixture()
    r["salt"]["adult_per_serving_g"] = 3.5
    assert any("塩分" in e for e in validate.validate_recipe(r, ctx()))


def test_budget_zero_means_unlimited():
    r = load_fixture()
    assert any("予算" in e for e in validate.validate_recipe(r, ctx(budget=10)))   # 10 分には収まらない
    assert validate.validate_recipe(r, ctx(budget=0)) == []                         # 0 = 時間無制限: 時間の検査をしない


def test_duplicate_title_rejected_only_against_existing():
    r = load_fixture()
    same = ["鶏もも肉の照り焼きと小松菜のごま和え"]
    assert any("同じ" in e for e in validate.validate_recipe(r, ctx(existing_titles=same)))
    assert any("同じ" in e for e in validate.validate_recipe(r, ctx(existing_titles=["鶏もも肉の照り焼き と 小松菜のごま和え（）"])))   # 表記ゆれも同じ
    assert validate.validate_recipe(r, ctx(existing_titles=["鶏もも肉の照り焼きと小松菜のおひたし"])) == []                       # 副菜が違えば別の料理
    assert validate.validate_recipe(r, ctx(existing_titles=[])) == []


def test_alternatives_must_differ():
    alts = [{"title": "豚こまの生姜焼きとキャベツの塩昆布和え"}, {"title": "鮭のムニエルとほうれん草のソテー"}]
    assert validate.alternatives_errors("鶏もも肉の照り焼きと小松菜のごま和え", alts, ["かぼちゃの煮物とみそ汁"]) == []
    errs = validate.alternatives_errors("鶏もも肉の照り焼きと小松菜のごま和え", alts + [{"title": "豚こまの生姜焼きとキャベツの塩昆布和え"}], ["鮭のムニエルとほうれん草のソテー"])
    assert len(errs) == 2 and any("一覧" in e for e in errs) and any("互い" in e or "別の別案" in e for e in errs)


def test_step_ingredients_checked_against_table():
    r = load_fixture()
    for st in r["steps"]:
        st["ingredients"] = []
    r["steps"][0]["ingredients"] = ["鶏もも肉", "片栗粉"]
    errs = validate.validate_recipe(r, ctx())
    assert any("どの工程の ingredients にも出てこない" in e for e in errs)          # 量のある材料は全部どこかに出す
    for st in r["steps"]:
        st["ingredients"] = [i["name"] for i in r["ingredients"]]
    assert validate.validate_recipe(r, ctx()) == []
    r["steps"][1]["ingredients"] = ["存在しない材料"]
    assert any("材料表に無い" in e for e in validate.validate_recipe(r, ctx()))
    r2 = load_fixture()                                                          # ingredients を持たない古い形は検査しない
    assert validate.validate_recipe(r2, ctx()) == []


def test_countable_items_must_not_use_grams():
    r = load_fixture()
    assert validate.validate_recipe(r, ctx(ingredients=common.Ingredients())) == []          # 鶏もも肉 g、小松菜 束 は合格
    bad = copy.deepcopy(r)
    k = next(i for i in bad["ingredients"] if i["name"] == "小松菜")
    k["unit"], k["qty"], k["grams"] = "g", 200, 200
    errs = validate.validate_recipe(bad, ctx(ingredients=common.Ingredients()))
    assert any("束" in e and "g ではなく" in e for e in errs)


def test_nearest_count_and_fraction():
    assert validate.nearest_count(0.4) == 0.333 and validate.nearest_count(0.45) == 0.5 and validate.nearest_count(0.27) == 0.25 and validate.nearest_count(0.125) == 0.125
    assert validate.nearest_count(0.34) == 0.333 and validate.nearest_count(1.3) == 1.5 and validate.nearest_count(2.1) == 2.0
    assert validate.fmt_fraction(0.5) == "1/2" and validate.fmt_fraction(1.5) == "1と1/2" and validate.fmt_fraction(2.0) == "2" and validate.fmt_fraction(0.125) == "1/8"


def test_convert_units_turns_grams_into_counts():
    import convert_units
    r = load_fixture()
    k = next(i for i in r["ingredients"] if i["name"] == "小松菜")
    k["unit"], k["qty"], k["grams"] = "g", 100, 100
    r["steps"][0]["text"] = "小松菜100gを切る。" + r["steps"][0]["text"]
    changes = convert_units.convert_ingredients(r, common.Ingredients())
    assert [c[0] for c in changes] == ["小松菜"] and k["unit"] == "束" and k["qty"] == 0.5 and k["grams"] == 100
    assert convert_units.rewrite_texts(r, changes) == 1 and r["steps"][0]["text"].startswith("小松菜 1/2 束（100g）を切る。")


def test_lean_meat_needs_tender_treatment():
    r = load_fixture()
    k = next(i for i in r["ingredients"] if i["name"] == "鶏もも肉")
    k["name"] = "鶏むね肉"; k["pantry"] = "鶏むね肉"
    for st in r["steps"]:
        for key in ("title", "text", "cue", "caution"):
            if st.get(key):
                st[key] = st[key].replace("片栗粉", "小麦粉").replace("弱火", "中火").replace("火を止め", "火を消し")
    errs = validate.validate_recipe(r, ctx())
    assert any("ぱさつきやすい" in e for e in errs), errs
    r["steps"][0]["text"] += " 塩と砂糖を揉み込んで 15 分おく（ブライン）。"
    assert not any("ぱさつきやすい" in e for e in validate.validate_recipe(r, ctx()))
    # 低温調理器を使っていれば手当ての言葉が無くても合格
    r2 = load_fixture(); k2 = next(i for i in r2["ingredients"] if i["name"] == "鶏もも肉"); k2["name"] = "ささみ"
    for st in r2["steps"]:
        for key in ("title", "text", "cue", "caution"):
            if st.get(key):
                st[key] = st[key].replace("片栗粉", "小麦粉").replace("弱火", "中火").replace("火を止め", "火を消し")
    r2["equipment"].append("sous-vide")
    assert not any("ぱさつきやすい" in e for e in validate.validate_recipe(r2, ctx()))


def test_one_dish_rule_only_when_generating():
    r = load_fixture()                                   # fixture は 2 品（古い形）
    assert validate.validate_recipe(r, ctx()) == []       # 普段の検査では通る
    errs = validate.validate_recipe(r, ctx(one_dish=True))
    assert any("1 レシピ 1 品" in e for e in errs)
