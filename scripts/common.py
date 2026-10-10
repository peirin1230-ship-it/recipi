"""recipi の共通処理: ファイルの読み書き、front matter、食材の正規化、日付、ログ。

docs/SPEC.md §6 のデータ形式はここを通して読み書きする。
"""
from __future__ import annotations

import datetime as dt
import glob
import json
import os
import re
import secrets
import string
import sys
import unicodedata

import yaml

ROOT = os.environ.get("RECIPI_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # テストは RECIPI_ROOT で別の場所を指す
JST = dt.timezone(dt.timedelta(hours=9))
FRONT_MATTER = re.compile(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", re.S)
MEMO_HEADING = "## 作ったときのメモ"


def fail(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def path(*parts: str) -> str:
    return os.path.join(ROOT, *parts)


def now() -> dt.datetime:
    return dt.datetime.now(JST)


def today() -> str:
    return now().strftime("%Y-%m-%d")


def new_id(n: int = 12) -> str:
    alphabet = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(n))


# ---- YAML / JSON ----

def read_yaml(rel: str, default=None):
    p = path(rel)
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return default if data is None else data


def write_yaml(rel: str, data, header: str | None = None) -> None:
    p = path(rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        if header:
            f.write(header.rstrip("\n") + "\n")
        yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False, default_flow_style=None, width=120)


def read_json(rel: str, default=None):
    p = path(rel)
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def write_json(rel: str, data) -> None:
    p = path(rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1, default=str)
        f.write("\n")


def read_text(rel: str, default: str = "") -> str:
    p = path(rel)
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        return f.read()


def write_text(rel: str, text: str) -> None:
    p = path(rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(text)


# ---- front matter ----

def split_front_matter(text: str) -> tuple[dict, str]:
    """`---` で囲まれた front matter と本文に分ける。front matter が無ければ ({}, text)。"""
    m = FRONT_MATTER.match(text)
    if not m:
        return {}, text
    meta = yaml.safe_load(m.group(1)) or {}
    return meta, m.group(2)


def join_front_matter(meta: dict, body: str) -> str:
    fm = yaml.safe_dump(meta, allow_unicode=True, sort_keys=False, default_flow_style=None, width=120).rstrip("\n")
    return f"---\n{fm}\n---\n\n{body.lstrip(chr(10))}"


def read_prompt(name: str) -> tuple[int, str]:
    """prompts/<name>.md → (prompt_version, 本文)。"""
    meta, body = split_front_matter(read_text(f"prompts/{name}.md"))
    return int(meta.get("prompt_version", 0)), body.strip()


# ---- config ----

def load_config() -> dict:
    cfg = read_yaml("config.yml", {})
    cfg.setdefault("repo", {})
    cfg.setdefault("request", {})
    cfg.setdefault("suggest", {})
    cfg.setdefault("generation", {})
    cfg.setdefault("learn", {})
    cfg.setdefault("photos", {})
    cfg.setdefault("kaji_quest", {})
    cfg.setdefault("privacy", {})
    return cfg


# ---- ingredients master ----

def _norm_key(s: str) -> str:
    s = unicodedata.normalize("NFKC", str(s)).strip().lower()
    s = re.sub(r"[\s　・/／\-－_（）()]+", "", s)
    return s


class Ingredients:
    """data/ingredients.yml の検索。別名 → 正規化名。"""

    def __init__(self, items: list[dict] | None = None):
        self.items = items if items is not None else (read_yaml("data/ingredients.yml", []) or [])
        self.by_name = {it["name"]: it for it in self.items}
        self.index: dict[str, str] = {}
        for it in self.items:
            self.index[_norm_key(it["name"])] = it["name"]
            for a in it.get("aliases") or []:
                self.index.setdefault(_norm_key(a), it["name"])

    def normalize(self, name: str) -> str:
        """マスタにあれば正規化名、無ければ入力をそのまま（前後の空白だけ落とす）。"""
        if not name:
            return name
        key = _norm_key(name)
        if key in self.index:
            return self.index[key]
        # 前方・部分一致（「鶏もも肉 300g」「国産鶏もも」など）
        for k, v in self.index.items():
            if len(k) >= 2 and (key.startswith(k) or k in key):
                return v
        return unicodedata.normalize("NFKC", name).strip()

    def get(self, name: str) -> dict | None:
        return self.by_name.get(self.normalize(name))

    def is_staple(self, name: str) -> bool:
        it = self.get(name)
        return bool(it and it.get("staple"))

    def default_loc(self, name: str) -> str:
        it = self.get(name)
        return (it or {}).get("loc", "fridge")


    def unit(self, name: str) -> str | None:
        it = self.get(name)
        return (it or {}).get("unit")


# ---- logs ----

def iter_logs(since: str | None = None) -> list[dict]:
    """logs/YYYY/MM.jsonl を全部読む。壊れた行は飛ばす。since（YYYY-MM-DD）以降だけにもできる。"""
    out = []
    for p in sorted(glob.glob(path("logs", "*", "*.jsonl"))):
        with open(p, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    e = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if since and e.get("date", "") < since:
                    continue
                out.append(e)
    out.sort(key=lambda e: (e.get("date", ""), e.get("ts", "")))
    return out


def append_log(entry: dict) -> str:
    """logs/YYYY/MM.jsonl に 1 行足す。返り値は書いたファイルの相対パス。"""
    date = entry.get("date") or today()
    rel = f"logs/{date[:4]}/{date[5:7]}.jsonl"
    p = path(rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return rel


# ---- recipes ----

def list_recipe_files() -> list[str]:
    return sorted(glob.glob(path("recipes", "*.md")))


def read_recipe(p: str) -> tuple[dict, str]:
    with open(p, encoding="utf-8") as f:
        meta, body = split_front_matter(f.read())
    if not meta.get("id"):
        meta["id"] = os.path.splitext(os.path.basename(p))[0]
    return meta, body


def load_recipes() -> dict[str, dict]:
    """recipes/*.md の front matter を id → meta で返す。memo（作ったときのメモ）は meta["memo"] に行のリストで足す。"""
    out = {}
    for p in list_recipe_files():
        meta, body = read_recipe(p)
        meta["memo"] = extract_memo(body)
        meta["_path"] = p
        out[meta["id"]] = meta
    return out


def extract_memo(body: str) -> list[str]:
    if MEMO_HEADING not in body:
        return []
    tail = body.split(MEMO_HEADING, 1)[1]
    lines = []
    for line in tail.splitlines():
        line = line.strip()
        if line.startswith("## "):
            break
        if line.startswith("- "):
            lines.append(line[2:].strip())
    return lines


def recipe_id_for(title_roman: str, date: str | None = None) -> str:
    date = (date or today()).replace("-", "")
    slug = re.sub(r"[^a-z0-9]+", "-", title_roman.lower()).strip("-")[:40] or new_id(6)
    return f"r-{date}-{slug}"


# ---- misc ----

def week_key(date: str) -> str:
    """YYYY-MM-DD → ISO 週 'YYYY-Www'。"""
    y, w, _ = dt.date.fromisoformat(date).isocalendar()
    return f"{y}-W{w:02d}"


def days_between(a: str, b: str) -> int:
    return (dt.date.fromisoformat(b) - dt.date.fromisoformat(a)).days


# ---- git（Actions の中から使う）----

def git(*args: str, check: bool = True) -> str:
    import subprocess
    r = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)}: {r.stderr.strip()}")
    return r.stdout


def git_commit_push(paths: list[str], message: str, branch: str | None = None, push: bool = True, retries: int = 4) -> bool:
    """paths を add してコミットし、push する。ページからの書き込みと競合したら pull --rebase してやり直す。
    変更が無ければ False。"""
    import subprocess
    import time as _t
    for p in paths:
        if os.path.exists(path(p)):
            git("add", "-A", "--", p)
        else:
            subprocess.run(["git", "rm", "-q", "--cached", "--ignore-unmatch", "--", p], cwd=ROOT, capture_output=True)
    if not git("status", "--porcelain", "--", *paths).strip():
        return False
    if not git("config", "user.email", check=False).strip():
        git("config", "user.name", "recipi-bot")
        git("config", "user.email", "recipi-bot@users.noreply.github.com")
    git("commit", "-q", "-m", message)
    if not push:
        return True
    branch = branch or git("rev-parse", "--abbrev-ref", "HEAD").strip()
    delay = 2
    for i in range(retries):
        r = subprocess.run(["git", "push", "origin", f"HEAD:{branch}"], cwd=ROOT, capture_output=True, text=True)
        if r.returncode == 0:
            return True
        subprocess.run(["git", "pull", "--rebase", "-q", "origin", branch], cwd=ROOT, capture_output=True, text=True)
        _t.sleep(delay)
        delay *= 2
    raise RuntimeError("git push に失敗した")
