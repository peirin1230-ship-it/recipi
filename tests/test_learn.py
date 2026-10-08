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
