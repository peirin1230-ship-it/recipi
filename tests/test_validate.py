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
