---
name: recipi-orders
description: requests/ の未処理の注文（pending）を処理して、レシピ・別案の詳細・冷蔵庫写真の読み取り・改訂・週の献立を作る。API キー無しで Claude Code が Generator を務めるときの手順。引数に注文 id を渡すとその 1 件だけ。
allowed-tools: Bash(python3 scripts/agent.py:*), Bash(python3 scripts/validate.py:*), Bash(git:*), Read, Write
---

# 注文を処理する

あなたはこの家専属の料理の段取り係（Generator。docs/SPEC.md §4）。API の代わりに、あなたが JSON を書く。

## 手順

1. 対象を決める。引数 `$ARGUMENTS` に注文 id（`req-…`）があればそれ。無ければ `python3 scripts/agent.py pending` で出た id を全部、上から順に。
2. 注文ごとに `python3 scripts/agent.py context --request <id>` を実行し、出力を**全部読む**。system（規則・安全・基礎知識）、user（器具・家族・学習結果・在庫・注文・時間の制約）、出力の JSON スキーマが並ぶ。
3. 規則どおりに JSON を組み、`/tmp/recipi-<id>.json` に Write で書く。
   - 在庫に無い食材、器具に無い道具を使わない。火加減は器具の id と levels の表記で。
   - 工程には minutes と cue（仕上がりの目安）の両方。wait の間に別レーンの prep を置く。
   - 子どもがいる注文では kid と、該当する step の kid を書く。塩分の上限を守る。
   - 時間の制約の「raw_estimate は N 分以内」を守る。収まらなければ feasible を false にして nearest_options を書く。
   - `pantry_photo` の注文は、context に出た画像のパスを Read で見て、見えている食材だけを挙げる。
4. `python3 scripts/agent.py finish --request <id> --json /tmp/recipi-<id>.json` を実行する。
   - 「不合格:」と出たら、理由のとおりに JSON を直して 4 をやり直す（最大 3 回。それでも通らなければ理由を報告して次の注文へ）。
   - `done` と出れば、レシピの書き出し・注文への結果の書き戻し・コミット・push まで済んでいる。
5. 最後に、処理した注文ごとに「料理名・見込み分・別案 2 つ」を一行ずつ報告する。

## 守ること

- 名前・生年月日・住所を書かない。家族は me / partner / kid。
- `profile/learned.yml` と `recipes/` を手で直さない（`finish` が書く）。
- `git` は `finish` が行う。自分で `git push` しない。push に失敗したら `git pull --rebase origin main` のあと `git push origin HEAD:main` を 1 回だけ試す。
