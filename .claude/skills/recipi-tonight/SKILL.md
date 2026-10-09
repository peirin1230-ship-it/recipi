---
name: recipi-tonight
description: 「今夜 25 分、大人 2 子 1、さっぱり」のような一言から注文を作り、その場でレシピまで作る（無料の手動運用）。引数は 時間（分）・大人の人数・子どもの人数・気分・使い切りたい物・一言を自由な順で。
allowed-tools: Bash(python3 scripts/agent.py:*), Bash(python3 scripts/validate.py:*), Bash(git:*), Read, Write
---

# 今夜の注文

1. `$ARGUMENTS` を読み取る。時間（分。無ければ config.yml の default_budget。「無制限」「時間は気にしない」なら `--budget 0`）、`大人N` / `子N`（無ければ family.yml の既定）、気分（さっぱり・がっつり・和・洋・中・麺・丼・鍋・時短 など）、使い切りたい物、それ以外は一言（note）。種類は既定 `dinner`。「仕込み」なら `prep`、「朝」なら `breakfast`、「弁当」なら `lunchbox`。
2. `python3 scripts/agent.py new --type dinner --budget 25 --adults 2 --kids 1 --mood さっぱり --use-up 小松菜 --note "…"` のように注文を作る（出力が注文 id）。
3. その id で `/recipi-orders <id>` の手順（context → JSON → finish）を行う。
4. 料理名・見込み分・段取りの要点 3 行・別案 2 つを報告する。ページ（GitHub Pages）を開けば同じレシピが「レシピ」カードに出る。
