# recipi — Claude Code への指示

このリポジトリは家の料理のための道具。仕様は `docs/SPEC.md`。
Actions が動いていないとき（Phase 0、または障害時）は、あなたが Generator（SPEC §4）を務める。

## 頼まれたらやること（レシピ）
「今夜 25 分、大人 2 子 1」のように頼まれたら `/recipi-tonight` の手順（`.claude/skills/recipi-tonight/SKILL.md`）:
1. `python3 scripts/agent.py new --type dinner --budget 25 --adults 2 --kids 1 ...` で注文を作る（出力が注文 id）
2. `python3 scripts/agent.py context --request <id>` の出力（規則・安全・器具・家族・学習結果・在庫・注文・JSON スキーマ）を全部読む
3. JSON を `/tmp/recipi-<id>.json` に書き、`python3 scripts/agent.py finish --request <id> --json /tmp/recipi-<id>.json` を実行する
   （検査・`recipes/<id>.md` の書き出し・注文への結果の書き戻し・コミット・push まで行う。不合格なら理由が出るので直してやり直す）
4. 別案 2 つは一行で答える
5. 時間予算に収まらないなら feasible を false にし、近い案を出す

ページから来た注文（`requests/` の pending）をまとめて処理するなら `/recipi-orders`。

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
