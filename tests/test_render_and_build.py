import json
import os

import build_site
import common
import render_recipe
import validate


def test_render_roundtrip(root):
    with open(os.path.join(root, "tests", "fixtures", "recipe_teriyaki.json"), encoding="utf-8") as f:
        recipe = json.load(f)["recipe"]
    meta = render_recipe.build_meta(recipe, rid="r-test-render", request_id="req-x", budget=25, servings={"adults": 2, "kids": 1},
                                    rtype="dinner", speed_factor={"overall": 1.1, "prep": 1.3, "heat": 1.0, "serve": 1.0}, generated_by={"model": "mock", "prompt_version": 1})
    rel = render_recipe.write_recipe(meta)
    assert rel == "recipes/r-test-render.md"
    assert validate.validate_file(common.path(rel)) == []
    meta2, body = common.read_recipe(common.path(rel))
    assert meta2["time"]["planned"] == validate.planned_minutes(recipe, {"prep": 1.3, "heat": 1.0, "serve": 1.0, "overall": 1.1})
    assert "## 段取り表" in body and "## 作ったときのメモ" in body
    # メモを足して読み戻す
    with open(common.path(rel), "a", encoding="utf-8") as f:
        f.write("- 2026-10-08 ・ 26 分 ・ R 75\n")
    recipes = common.load_recipes()
    assert recipes["r-test-render"]["memo"] == ["2026-10-08 ・ 26 分 ・ R 75"]
    # 書き直してもメモが残る
    render_recipe.write_recipe(recipes["r-test-render"])
    assert common.load_recipes()["r-test-render"]["memo"] == ["2026-10-08 ・ 26 分 ・ R 75"]


def test_build_site(root, tmp_path):
    out = str(tmp_path / "site")
    build_site.build(out)
    data = os.path.join(out, "data")
    for name in ("config.json", "equipment.json", "family.json", "learned.json", "ingredients.json", "recipes.json", "knowledge.json", "digests.json", "build.json"):
        assert os.path.exists(os.path.join(data, name)), name
    with open(os.path.join(data, "recipes.json"), encoding="utf-8") as f:
        recipes = json.load(f)
    assert any(r["id"] == "r-20261008-torimomo-teriyaki" for r in recipes)
    with open(os.path.join(data, "equipment.json"), encoding="utf-8") as f:
        eq = json.load(f)
    assert [l["id"] for l in eq["lanes"]][-1] == "hands"
    assert "fp26" in eq["labels"]
