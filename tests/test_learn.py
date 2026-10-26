import os

import common
import learn

RID = "r-20261008-torimomo-teriyaki"


def test_scores():
    assert learn.r_score(22, 22, "exact", 5) == 100
    assert learn.r_score(22, 26, "minor", 4) == 75
    assert learn.r_score(22, 35, "major", 3) == 36
    assert learn.r_score(None, None, None, None) == 60
    assert learn.f_score({"me": 4, "partner": 5, "kid": "all"}) == 4.67
    assert learn.f_score({"me": None, "partner": None, "kid": "absent"}) is None
    assert learn.f_score({"kid": "none"}) == 1.0


def add_log(i, **kw):
    e = {"id": f"log{i:03d}", "date": f"2026-10-{i + 1:02d}", "recipe_id": RID, "version": 1, "type": "dinner",
         "planned_minutes": 18, "actual_minutes": 20, "fidelity": "exact", "finish": 5, "ratings": {"me": 5, "partner": 4, "kid": "all"},
         "photo": None, "learned": None, "pantry_used": []}
    e.update(kw)
    e["r_score"] = learn.r_score(e["planned_minutes"], e["actual_minutes"], e["fidelity"], e["finish"])
    e["f_score"] = learn.f_score(e["ratings"])
    common.append_log(e)
    return e


def test_learn_promotes_standard(root):
    for i in range(3):
        add_log(i, photo=f"photos/{RID}/2026100{i + 1}-1.jpg" if i == 1 else None)
    cfg = common.load_config()
    L = learn.Learner(cfg, use_llm=False, mock=True)
    learned = L.run(dry_run=False)
    assert RID in learned["standards"]
    meta = common.load_recipes()[RID]
    assert meta["status"] == "standard" and meta["stats"]["cooked"] == 3 and meta["stats"]["f_avg"] == 4.7
    assert meta["photo"] == f"photos/{RID}/20261002-1.jpg"
    assert 1.0 < learned["speed_factor"]["overall"] < 1.2     # 20/18 を 1.0 の事前値と混ぜる
    assert learned["likes"] and learned["likes"][0]["n"] == 3
    assert "鶏もも肉" in learned["kid"]["eats_well"]
    assert any(row["cooked"] >= 3 and row["f_avg"] == 4.67 for row in learned["quality"])
    assert common.read_yaml("profile/learned.yml")["updated"] == common.today()


def test_learn_retires_and_flags_revision(root):
    # 家族評価が低い回が 2 回 → 封印。R が低い回が 2 回 → 改訂待ち（封印が優先）
    for i in range(3, 5):
        add_log(i, actual_minutes=40, fidelity="major", finish=2, ratings={"me": 2, "partner": 1, "kid": "none"})
    L = learn.Learner(common.load_config(), use_llm=False, mock=True)
    learned = L.run(dry_run=False)
    assert RID in learned["retired"]
    assert common.load_recipes()[RID]["status"] == "retired"
    assert RID not in learned["standards"]


def test_has_new_logs_guard(root):
    learned = common.read_yaml("profile/learned.yml")
    assert not learn.has_new_logs(learned, common.iter_logs())
    add_log(9)
    assert learn.has_new_logs(learned, common.iter_logs())


def test_pick_photo():
    entries = [{"photo": "a.jpg", "finish": 5}, {"photo": "b.jpg", "finish": 2}]
    assert learn.pick_photo(entries) == "a.jpg"
    assert learn.pick_photo([{"photo": "a.jpg", "finish": 2}, {"photo": "b.jpg", "finish": 3}]) == "b.jpg"
    assert learn.pick_photo([{"photo": None}]) is None


def test_nightly_without_api_key_skips_claude_and_updates_stats(root, monkeypatch, capsys):
    """Secrets に ANTHROPIC_API_KEY が無い（Generator はルーティン）。言葉の抽出が要る記録があっても落ちずに、統計だけ更新する。"""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)
    monkeypatch.delenv("RECIPI_MOCK", raising=False)
    add_log(7, learned="皮目は 2 分半で十分", deviation="醤油を減らした")
    assert learn.main(["--no-git", "--force"]) == 0
    out = capsys.readouterr().out
    assert "ANTHROPIC_API_KEY が無い" in out
    learned = common.read_yaml("profile/learned.yml")
    assert learned["updated"] == common.today() and learned["last_log_id"] == list(common.iter_logs())[-1]["id"]   # 統計は最後の記録まで進んだ


def test_llm_client_without_key_is_an_llm_error(monkeypatch):
    import llm
    monkeypatch.delenv("RECIPI_MOCK", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)
    L = llm.LLM(common.load_config(), mock=False)
    try:
        L.structured(name="learn", system="x", blocks=[{"type": "text", "text": "y"}], schema={"type": "object"})
    except llm.LLMError as e:
        assert "ANTHROPIC_API_KEY" in str(e)
    else:
        raise AssertionError("LLMError が出ない")


def test_water_is_not_a_preference():
    r = {"tags": ["和"], "ingredients": [{"name": "水", "pantry": None, "grams": 400}, {"name": "鶏もも肉", "pantry": "鶏もも肉", "grams": 300}, {"name": "湯", "pantry": None, "grams": 200}]}
    assert learn.elements(r) == ["和", "鶏もも肉"]


def test_queue_free_orders_once_and_marks_stale(root):
    """API キーが無いとき、言葉の抽出・改訂を注文にしてルーティンに回す。同じ物は二重に出さない。古い注文はあきらめる。"""
    import agent
    for name in [n for n in os.listdir(common.path("requests")) if n.endswith(".json")]:
        os.remove(common.path("requests", name))
    add_log(20, learned="強火は焦げる")
    L = learn.Learner(common.load_config(), use_llm=False, mock=True)
    L.run(dry_run=True)
    L.needs_revision = [RID]
    q1 = learn.queue_free_orders(L)
    types = sorted(common.read_json(f"requests/{i}.json")["type"] for i in q1)
    assert types == ["learn_notes", "revise"]
    assert learn.queue_free_orders(L) == []   # 処理待ちがあれば出さない
    # 3 日より古い処理待ちは error にして、次に出し直す
    for i in q1:
        d = common.read_json(f"requests/{i}.json"); d["ts"] = "2026-01-01T00:00:00+09:00"; agent.save_request(d)
    q2 = learn.queue_free_orders(L)
    assert len(q2) == 2 and all(common.read_json(f"requests/{i}.json")["status"] == "error" for i in q1)
    # まとめ済み（notes_log_id が最新）なら learn_notes は出さない
    for i in q2:
        os.remove(common.path("requests", f"{i}.json"))
    L.notes_log_id = L.newest_text_log_id(); L.needs_revision = []
    assert learn.queue_free_orders(L) == []


def test_nightly_without_key_hands_orders_to_the_routine(root, monkeypatch, tmp_path):
    for k in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "RECIPI_MOCK"):
        monkeypatch.delenv(k, raising=False)
    for name in [n for n in os.listdir(common.path("requests")) if n.endswith(".json")]:
        os.remove(common.path("requests", name))
    out = tmp_path / "gh_output"
    monkeypatch.setenv("GITHUB_OUTPUT", str(out))
    add_log(21, deviation="醤油を減らした")
    assert learn.main(["--no-git", "--force"]) == 0
    fire = out.read_text(encoding="utf-8").strip()
    assert fire.startswith("fire=req-")
    ids = fire[len("fire="):].split()
    assert any(common.read_json(f"requests/{i}.json")["type"] == "learn_notes" for i in ids)


def test_scaled_cooks_do_not_move_the_speed_factor(root):
    """分量を ×2 にした回は時間が長くなるので、速度係数に使わない。"""
    L = learn.Learner(common.load_config(), use_llm=False, mock=True)
    before = L.speed_factor()["overall"]
    add_log(30, actual_minutes=60, scale=2)
    L2 = learn.Learner(common.load_config(), use_llm=False, mock=True)
    assert L2.speed_factor()["overall"] == before
