"""無料の経路（Claude Code が Generator を務める）: new → context → finish。"""
import json
import os
import subprocess
import sys

import agent
import common


def run_cli(*args):
    env = dict(os.environ, RECIPI_ROOT=common.ROOT)
    return subprocess.run([sys.executable, os.path.join(os.path.dirname(agent.__file__), "agent.py"), *args],
                          capture_output=True, text=True, env=env, cwd=common.ROOT)


def test_new_context_finish(fresh_recipes):
    r = run_cli("new", "--type", "dinner", "--budget", "25", "--adults", "2", "--kids", "1", "--mood", "和、時短", "--use-up", "小松菜", "--note", "妻は遅い")
    assert r.returncode == 0, r.stderr
    rid = r.stdout.strip()
    req = common.read_json(f"requests/{rid}.json")
    assert req["type"] == "dinner" and req["time_budget"] == 25 and req["mood"] == ["和", "時短"] and req["use_up"] == ["小松菜"]
    assert rid in agent.pending_ids()

    text = agent.context_text(rid)
    assert "## system" in text and "## user" in text and "出力の JSON スキーマ" in text
    assert "equipment.yml" in text and "raw_estimate" in text and rid in text
    assert "/tmp/recipi-" + rid in text

    fixture = os.path.join(common.ROOT, "tests", "fixtures", "recipe_teriyaki.json")
    assert agent.finish(rid, fixture, use_git=False) == 0
    req = common.read_json(f"requests/{rid}.json")
    assert req["status"] == "done" and req["result"]["model"] == "claude-code" and req["result"]["cost_usd"] == 0.0
    assert os.path.exists(common.path("recipes", req["result"]["recipe_id"] + ".md"))
    assert rid not in agent.pending_ids()


def test_finish_rejects_invalid_json_without_touching_request(root, tmp_path):
    rid = run_cli("new", "--type", "dinner", "--budget", "25").stdout.strip()
    with open(os.path.join(common.ROOT, "tests", "fixtures", "recipe_teriyaki.json"), encoding="utf-8") as f:
        bad = json.load(f)
    bad["recipe"]["steps"][0]["cue"] = ""
    p = tmp_path / "bad.json"
    p.write_text(json.dumps(bad, ensure_ascii=False), encoding="utf-8")
    assert agent.finish(rid, str(p), use_git=False) == 2
    assert common.read_json(f"requests/{rid}.json")["status"] == "pending"


def test_context_for_pantry_photo_shows_image_path(root):
    with open(common.path("inbox", "ctx.png"), "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
    rid = run_cli("new", "--type", "pantry_photo", "--image", "inbox/ctx.png", "--hint", "freezer").stdout.strip()
    text = agent.context_text(rid)
    assert "inbox/ctx.png" in text and "freezer" in text and "base64" not in text.lower()
    assert os.path.exists(common.path("inbox", "ctx.png"))   # context は写真を消さない


def test_new_revise_and_weekly(root):
    rid = run_cli("new", "--type", "revise", "--recipe", "r-20261008-torimomo-teriyaki").stdout.strip()
    assert common.read_json(f"requests/{rid}.json")["recipe_id"] == "r-20261008-torimomo-teriyaki"
    assert "元のレシピ" in agent.context_text(rid)
    rid = run_cli("new", "--type", "weekly", "--start", "2026-10-13").stdout.strip()
    assert "注文（1 週間）" in agent.context_text(rid)


def test_new_budget_zero_is_unlimited(root):
    rid = run_cli("new", "--type", "dinner", "--budget", "0").stdout.strip()
    req = common.read_json(f"requests/{rid}.json")
    assert req["time_budget"] == 0
    assert agent.unlimited_budget(req) and not agent.unlimited_budget({"time_budget": 25}) and not agent.unlimited_budget({})
    text = agent.context_text(rid)
    assert "時間無制限" in text and "分以内**にする" not in text   # 予算の制約の文が無い（安全の表の「30 分以内」は別）


def test_context_lists_existing_recipes_and_finish_rejects_duplicate(root, tmp_path):
    rid = run_cli("new", "--type", "dinner", "--budget", "25").stdout.strip()
    text = agent.context_text(rid)
    assert "一覧にあるレシピ" in text and "鶏もも肉の照り焼きと小松菜のおひたし" in text and "重複を避ける" in text
    with open(os.path.join(common.ROOT, "tests", "fixtures", "recipe_teriyaki.json"), encoding="utf-8") as f:
        dup = json.load(f)
    dup["recipe"]["title"] = "鶏もも肉の照り焼きと小松菜のおひたし"   # 一覧にある料理名そのまま
    p = tmp_path / "dup.json"
    p.write_text(json.dumps(dup, ensure_ascii=False), encoding="utf-8")
    assert agent.finish(rid, str(p), use_git=False) == 2
    assert common.read_json(f"requests/{rid}.json")["status"] == "pending"
