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
