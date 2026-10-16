---
name: recipi-orders
description: requests/ の未処理の注文（pending）を処理して、レシピ・別案の詳細・冷蔵庫写真の読み取り・改訂・週の献立、夜間の学習のまとめ・写真の一言・週次の来週の提案を作る。API キー無しで Claude Code が Generator を務めるときの手順。引数に注文 id（空白区切りで複数可）を渡すとそれだけ。
allowed-tools: Bash(python3 scripts/agent.py:*), Bash(python3 scripts/validate.py:*), Bash(git:*), Read, Write
---

# 注文を処理する

あなたはこの家専属の料理の段取り係（Generator。docs/SPEC.md §4）。API の代わりに、あなたが JSON を書く。

## 手順

1. 対象を決める。引数 `$ARGUMENTS` に注文 id（`req-…`。空白区切りで複数のこともある）があればそれを全部、順に。無ければ `python3 scripts/agent.py pending` で出た id を全部、上から順に。
2. 注文ごとに `python3 scripts/agent.py context --request <id>` を実行し、出力を**全部読む**。system（規則・安全・基礎知識）、user（器具・家族・学習結果・在庫・注文・時間の制約）、出力の JSON スキーマが並ぶ。
3. 規則どおりに JSON を組み、`/tmp/recipi-<id>.json` に Write で書く。
   - 在庫に無い食材、器具に無い道具を使わない。火加減は器具の id と levels の表記で。
   - 工程には minutes と cue（仕上がりの目安）の両方。wait の間に別レーンの prep を置く。
   - 子どもがいる注文では kid と、該当する step の kid を書く。塩分の上限を守る。
   - 時間の制約の「raw_estimate は N 分以内」を守る。収まらなければ feasible を false にして nearest_options を書く。
   - `pantry_photo` の注文は、context に出た画像のパスを Read で見て、見えている食材だけを挙げる。
   - 夜間・週次のジョブが出す注文（API キーが無いときの無料の経路。手順は同じ context → JSON → finish）:
     - `learn_notes`: 記録の「変えた点・気づき・写真の一言」から、器具のくせ（equipment_notes）・レシピのくせ（recipe_notes）・子どもが食べる条件（kid_works_if）を短くまとめる。context の existing を土台に、記録で裏付けられた物だけ残す。finish が `profile/learned.yml` に書く。
     - `revise`: 元のレシピと記録から改訂版を作る。変えた点と根拠を changes に。レシピの規則（在庫・器具・単位・1 レシピ 1 品）はそのまま守る。
     - `photo_note`: context に出た完成写真を Read で見て、レシピの完成イメージと仕上がりの目安に照らした一言（採点しない）。
     - `digest`: 今週のまとめと在庫から、来週の提案 3 つ（一行）と買い物候補。finish が `docs/digests/<週>.md` を書き直す。
4. `python3 scripts/agent.py finish --request <id> --json /tmp/recipi-<id>.json` を実行する。
   - 「不合格:」と出たら、理由のとおりに JSON を直して 4 をやり直す（最大 3 回。それでも通らなければ理由を報告して次の注文へ）。
   - `done` と出れば、レシピの書き出し・注文への結果の書き戻し・コミット・push まで済んでいる。
5. 最後に、処理した注文ごとに一行ずつ報告する。レシピは「料理名・見込み分・別案 2 つ」、それ以外は何をまとめたか（例: 「気づきを 3 つ」「来週の提案 3 つ」「改訂版 r-…-v2」）。

## 守ること

- 名前・生年月日・住所を書かない。家族は me / partner / kid。
- `profile/learned.yml` と `recipes/` を手で直さない（`finish` が書く）。
- `git` は `finish` が行う。自分で `git push` しない。push に失敗したら `git pull --rebase origin main` のあと `git push origin HEAD:main` を 1 回だけ試す。
