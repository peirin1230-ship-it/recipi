# recipi — Claude Code への指示

このリポジトリは家の料理のための道具。仕様は `docs/SPEC.md`。
Actions が動いていないとき（Phase 0、または障害時）は、あなたが Generator（SPEC §4）を務める。

## 頼まれたらやること（レシピ）
「今夜 25 分、大人 2 子 1」のように頼まれたら:
1. `equipment.yml` / `family.yml` / `pantry.json` / `profile/learned.yml` / `profile/overrides.yml` / `knowledge/safety.md` / `knowledge/basics/*.md` を読む
2. `logs/` の直近 14 日の `recipe_id` を見て、同じ物を出さない
3. `prompts/recipe.md` の規則と `scripts/schema.py` の JSON スキーマに従ってレシピを JSON で組み、
   `python3 scripts/render_recipe.py <json ファイル>` で `recipes/<id>.md` を書く（id は `r-YYYYMMDD-<ローマ字>`）。
   手で書くなら SPEC §6.5 の形式で、front matter に全項目を入れる
4. `python3 scripts/validate.py recipes/<id>.md` が通ることを確認する
5. 別案 2 つは一行で答える（ファイルにしない）
6. 時間予算に収まらないなら、収まらないと言い、近い案を出す

## 作った後に頼まれたら（記録）
「作った。26 分、少し変えた（醤油を減らした）、仕上がり 4、自分 4、妻 5、子ども完食」と言われたら:
1. `logs/YYYY/MM.jsonl` に SPEC §6.6 の 1 行を足す（R と F は `scripts/learn.py` の `r_score` / `f_score` と同じ式）
2. レシピの「作ったときのメモ」に 1 行足す
3. 使った食材を `pantry.json` から減らす（聞かれたら）
4. `python3 scripts/learn.py --no-llm` を実行して統計を更新する

## 開発
- 依存: `pip install pyyaml markdown anthropic pytest`
- ページの組み立て: `python3 scripts/build_site.py _site` → `_site/` を静的サーバで開く
- テスト: `python3 -m pytest -q`
- Generator の動作確認（API を呼ばない）: `python3 scripts/agent.py recipe --request <id> --mock`
- 夜間ジョブの動作確認: `python3 scripts/learn.py --no-llm --dry-run`

## 守ること
- 名前・生年月日・住所を書かない。家族は me / partner / kid
- `profile/learned.yml` は手で直さない（`scripts/learn.py` が書く）
- 在庫に無い物、器具に無い物を使わない
- コミットメッセージにモデル名を書かない
