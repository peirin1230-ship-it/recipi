#!/usr/bin/env python3
"""site/ をそのままコピーし、設定・器具・家族・学習結果・レシピ・知識を JSON 化して data/ に置く。

使い方: python3 scripts/build_site.py [出力先=_site]
GitHub Actions（.github/workflows/build-pages.yml）が実行し、出力先を GitHub Pages へ配信する。
YAML やレシピが壊れていればここで失敗して配信されない（kaji-quest と同じ）。
"""
from __future__ import annotations

import glob
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402
import schema  # noqa: E402
import validate  # noqa: E402

try:
    import markdown
except ImportError:  # pragma: no cover
    markdown = None


def md_html(text: str) -> str:
    if markdown is None:
        common.fail("python-markdown が要る: pip install markdown")
    return markdown.markdown(text, extensions=["tables"], output_format="html")


def load_knowledge() -> dict:
    meta, body = common.split_front_matter(common.read_text("knowledge/safety.md"))
    safety = {"id": meta.get("id", "safety"), "title": meta.get("title", "安全"), "html": md_html(body)}
    basics = []
    for p in sorted(glob.glob(common.path("knowledge", "basics", "*.md"))):
        with open(p, encoding="utf-8") as f:
            m, b = common.split_front_matter(f.read())
        if not m.get("id") or not m.get("title"):
            common.fail(f"{p}: front matter に id と title が要る")
        basics.append({"id": m["id"], "title": m["title"], "html": md_html(b)})
    tips, seen = [], set()
    for p in sorted(glob.glob(common.path("knowledge", "tips", "*.md"))):
        with open(p, encoding="utf-8") as f:
            m, b = common.split_front_matter(f.read())
        for key in ("id", "title"):
            if key not in m:
                common.fail(f"{p}: {key} がない")
        if m["id"] in seen:
            common.fail(f"{p}: id が重複 {m['id']}")
        seen.add(m["id"])
        tips.append({"id": m["id"], "title": m["title"], "tags": m.get("tags") or [], "level": m.get("level", 1), "body": b.strip()})
    return {"safety": safety, "basics": basics, "tips": tips}


def load_digests(limit: int = 12) -> list[dict]:
    out = []
    for p in sorted(glob.glob(common.path("docs", "digests", "*.md")), reverse=True)[:limit]:
        with open(p, encoding="utf-8") as f:
            text = f.read()
        meta, body = common.split_front_matter(text)
        week = meta.get("week") or os.path.splitext(os.path.basename(p))[0]
        out.append({"week": week, "meta": {k: v for k, v in meta.items() if k != "week"}, "html": md_html(body), "md": body})
    return out


def load_recipes_for_site() -> list[dict]:
    recipes = common.load_recipes()
    out = []
    for rid, meta in recipes.items():
        errs = validate.validate_file(meta["_path"])
        if errs:
            common.fail(f"{meta['_path']}: " + "; ".join(errs))
        m = {k: v for k, v in meta.items() if k != "_path"}
        out.append(m)
    out.sort(key=lambda m: (str(m.get("created") or ""), m.get("id")), reverse=True)
    return out


def prompt_versions() -> dict:
    out = {}
    for p in glob.glob(common.path("prompts", "*.md")):
        name = os.path.splitext(os.path.basename(p))[0]
        v, _ = common.read_prompt(name)
        out[name] = v
    return out


def build(out_dir: str) -> None:
    cfg = common.load_config()
    equipment = common.read_yaml("equipment.yml", {}) or {}
    family = common.read_yaml("family.yml", {}) or {}
    learned = common.read_yaml("profile/learned.yml", {}) or {}
    overrides = common.read_yaml("profile/overrides.yml", {}) or {}
    ingredients = common.read_yaml("data/ingredients.yml", []) or []
    pantry = common.read_json("pantry.json", {"items": [], "staples": {}})
    if not isinstance(pantry.get("items"), list):
        common.fail("pantry.json: items はリスト")
    for key in ("heat", "appliances", "cookware"):
        for it in equipment.get(key) or []:
            if not isinstance(it, dict) or not it.get("id"):
                common.fail(f"equipment.yml: {key} の各項目に id が要る")
    for m in family.get("members") or []:
        if not isinstance(m, dict) or not m.get("role"):
            common.fail("family.yml: members の各項目に role が要る")
        for key in ("name", "birthdate", "birthday"):
            if key in m:
                common.fail(f"family.yml: {key} は書かない（公開リポジトリ。SPEC §15.1）")

    recipes = load_recipes_for_site()
    knowledge = load_knowledge()
    digests = load_digests()

    if os.path.isdir(out_dir):
        shutil.rmtree(out_dir)
    shutil.copytree(common.path("site"), out_dir)
    data_dir = os.path.join(out_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    def dump(name: str, obj) -> None:
        with open(os.path.join(data_dir, name), "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, separators=(",", ":"), default=str)   # YAML の日付は文字列に

    dump("config.json", cfg)
    dump("equipment.json", {**equipment, "lanes": schema.lanes_for(equipment),
                            "labels": {eid: schema.equipment_label(equipment, eid) for eid in schema.equipment_ids(equipment)}})
    dump("family.json", family)
    dump("learned.json", {"learned": learned, "overrides": overrides})
    dump("ingredients.json", ingredients)
    dump("recipes.json", recipes)
    dump("knowledge.json", knowledge)
    dump("digests.json", digests)
    dump("build.json", {"built_at": common.now().isoformat(timespec="seconds"), "recipes": len(recipes),
                        "prompt_versions": prompt_versions(), "sha": os.environ.get("GITHUB_SHA", "")})
    with open(os.path.join(out_dir, ".nojekyll"), "w") as f:
        f.write("")
    print(f"built {out_dir}: recipes={len(recipes)} tips={len(knowledge['tips'])} digests={len(digests)}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "_site")
