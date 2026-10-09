import json
import os

import agent
import common


def write_request(req):
    common.write_json(f"requests/{req['id']}.json", {"status": "pending", "error": None, "result": None, **req})


def test_recipe_mock(fresh_recipes):
    write_request({"id": "req-t-dinner", "ts": "2026-10-08T17:12:30+09:00", "type": "dinner", "time_budget": 25, "servings": {"adults": 2, "kids": 1}, "dishes": "main+side", "mood": [], "use_up": ["小松菜"], "mode": "auto"})
    assert agent.run("auto", "req-t-dinner", mock=True, use_git=False) == 0
    req = common.read_json("requests/req-t-dinner.json")
    assert req["status"] == "done"
    res = req["result"]
    assert res["recipe_id"].startswith("r-")
    assert os.path.exists(common.path("recipes", res["recipe_id"] + ".md"))
    assert res["recipe"]["time"]["budget"] == 25
    assert len(res["alternatives"]) == 2
    assert res["cost_usd"] == 0.0


def test_recipe_detail_mock(fresh_recipes):
    write_request({"id": "req-t-dinner2", "ts": "2026-10-08T17:12:30+09:00", "type": "dinner", "time_budget": 30, "servings": {"adults": 2, "kids": 1}, "dishes": "main+side", "mode": "auto"})
    assert agent.run("auto", "req-t-dinner2", mock=True, use_git=False) == 0
    write_request({"id": "req-t-detail", "ts": "2026-10-08T17:20:00+09:00", "type": "recipe_detail", "parent": "req-t-dinner2", "alternative": 1})
    assert agent.run("auto", "req-t-detail", mock=True, use_git=False) == 0
    req = common.read_json("requests/req-t-detail.json")
    assert req["status"] == "done" and req["result"]["recipe_id"]
    assert req["time_budget"] == 30   # 親から引き継ぐ


def test_pantry_photo_mock(root):
    with open(common.path("inbox", "t.png"), "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
    write_request({"id": "req-t-photo", "ts": "2026-10-08T17:30:00+09:00", "type": "pantry_photo", "image": "inbox/t.png", "hint": "fridge"})
    assert agent.run("auto", "req-t-photo", mock=True, use_git=False) == 0
    req = common.read_json("requests/req-t-photo.json")
    names = [i["name"] for i in req["result"]["items"]]
    assert "鶏もも肉" in names and "キャベツ" in names
    assert any(not i["known"] for i in req["result"]["items"])        # 不明な物は known: false
    assert {"name": "マヨネーズ", "state": "low"} in req["result"]["staples"]
    assert not os.path.exists(common.path("inbox", "t.png"))          # 処理後に消す


def test_revise_mock(root):
    write_request({"id": "req-t-revise", "ts": "2026-10-08T17:40:00+09:00", "type": "revise", "recipe_id": "r-20261008-torimomo-teriyaki"})
    assert agent.run("auto", "req-t-revise", mock=True, use_git=False) == 0
    req = common.read_json("requests/req-t-revise.json")
    assert req["result"]["recipe_id"] == "r-20261008-torimomo-teriyaki-v2"
    meta, body = common.read_recipe(common.path("recipes", "r-20261008-torimomo-teriyaki-v2.md"))
    assert meta["supersedes"] == "r-20261008-torimomo-teriyaki" and meta["version"] == 2 and len(meta["changes"]) == 2
    assert "## 改訂の内容" in body


def test_weekly_mock(root):
    write_request({"id": "req-t-weekly", "ts": "2026-10-08T17:50:00+09:00", "type": "weekly", "start_date": "2026-10-13"})
    assert agent.run("auto", "req-t-weekly", mock=True, use_git=False) == 0
    req = common.read_json("requests/req-t-weekly.json")
    assert len(req["result"]["days"]) == 7 and os.path.exists(common.path(req["result"]["plan_path"]))
    write_request({"id": "req-t-wd", "ts": "2026-10-08T18:00:00+09:00", "type": "recipe_detail", "parent": "req-t-weekly", "alternative": 4})
    assert agent.run("auto", "req-t-wd", mock=True, use_git=False) == 0
    assert common.read_json("requests/req-t-wd.json")["time_budget"] == 25


def test_bad_type_is_error(root):
    write_request({"id": "req-t-bad", "ts": "2026-10-08T17:50:00+09:00", "type": "nonsense"})
    assert agent.run("auto", "req-t-bad", mock=True, use_git=False) == 1
    req = common.read_json("requests/req-t-bad.json")
    assert req["status"] == "error" and "type" in req["error"]


def test_validation_failure_retries_then_errors(root, monkeypatch):
    import llm as llmmod
    with open(common.path("tests", "fixtures", "recipe_teriyaki.json"), encoding="utf-8") as f:
        bad = json.load(f)
    bad["recipe"]["equipment"].append("oven-x")
    monkeypatch.setattr(llmmod.LLM, "_mock", lambda self, name: json.loads(json.dumps(bad)))
    write_request({"id": "req-t-fail", "ts": "2026-10-08T17:12:30+09:00", "type": "dinner", "time_budget": 25, "servings": {"adults": 2, "kids": 1}, "mode": "auto"})
    assert agent.run("auto", "req-t-fail", mock=True, use_git=False) == 1
    req = common.read_json("requests/req-t-fail.json")
    assert req["status"] == "error" and "oven-x" in req["error"]


def test_suggest_items_mock(root):
    write_request({"id": "req-t-suggest", "ts": "2026-10-09T10:00:00+09:00", "type": "suggest_items", "note": "来週は魚も"})
    assert agent.run("auto", "req-t-suggest", mock=True, use_git=False) == 0
    req = common.read_json("requests/req-t-suggest.json")
    names = [i["name"] for i in req["result"]["items"]]
    assert "鶏むね肉" in names and "さつまいも" in names and req["result"]["note"]
    assert all(i["priority"] in ("main", "stock", "kid", "season") for i in req["result"]["items"])
    assert "買い足す" in agent.context_text("req-t-suggest")


def test_proposed_splits_deleted_and_alternatives(fresh_recipes):
    # 本命が一覧から消されている注文と、採られなかった別案
    write_request({"id": "req-t-gone", "ts": common.now().isoformat(timespec="seconds"), "type": "dinner", "status": "done",
                   "result": {"recipe_id": "r-gone", "recipe": {"title": "消した一皿とサラダ"}, "alternatives": [{"title": "別案 A"}, {"title": "鶏もも肉の照り焼きと小松菜のおひたし"}]}})
    ctx = agent.Context()
    p = ctx.proposed(14)
    assert p["deleted"] == ["消した一皿とサラダ"]
    assert p["alternatives"] == ["別案 A"]   # 一覧にある物は入れない
    block = agent.request_block(ctx, {"type": "dinner", "time_budget": 25})["text"]
    assert "一覧から消された料理" in block and "消した一皿とサラダ" in block and "別案 A" in block
