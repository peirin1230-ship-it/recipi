---
listed: "2026-11-28T16:20:52+09:00"
id: r-20261128-ninjin-to-jagaimo-no-slicer-hosogiri-gom
title: にんじんとじゃがいものスライサー細切り ごま酢炒め
version: 1
supersedes: null
status: draft
created: '2026-11-28'
request: req-20261128-1550-kw5x
generated_by: {model: claude-code, prompt_version: 11}
type: dinner
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 13, active: 9, raw_estimate: 12, speed_factor: 0.96}
image_text: オレンジと淡い黄色の細切りがしんなりと絡み、白ごまが散っている。ごま油のつやがあり、酢の香りがふわっと立つ。
dishes:
- {name: にんじんとじゃがいものスライサー細切り ごま酢炒め, role: side}
equipment: [fp26, gas-r]
ingredients:
- {name: にんじん, qty: 1, unit: 本, grams: 150, pantry: にんじん, for: にんじんとじゃがいものスライサー細切り ごま酢炒め, substitute: null, use_up: false}
- {name: じゃがいも, qty: 1, unit: 個, grams: 130, pantry: じゃがいも, for: にんじんとじゃがいものスライサー細切り ごま酢炒め, substitute: null, use_up: false}
- {name: ごま油, qty: 2, unit: 小さじ, grams: 8, pantry: ごま油, for: にんじんとじゃがいものスライサー細切り ごま酢炒め, substitute: null, use_up: false}
- {name: 水, qty: 2, unit: 大さじ, grams: 30, pantry: null, for: にんじんとじゃがいものスライサー細切り ごま酢炒め, substitute: null, use_up: false}
- {name: 酢, qty: 2, unit: 小さじ, grams: 10, pantry: 酢, for: にんじんとじゃがいものスライサー細切り ごま酢炒め, substitute: null, use_up: false}
- {name: 醤油, qty: 1, unit: 小さじ, grams: 6, pantry: 醤油, for: にんじんとじゃがいものスライサー細切り ごま酢炒め, substitute: null, use_up: false}
- {name: 砂糖, qty: 0.5, unit: 小さじ, grams: 1.5, pantry: 砂糖, for: にんじんとじゃがいものスライサー細切り ごま酢炒め, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 小さじ, grams: 3, pantry: 白ごま, for: にんじんとじゃがいものスライサー細切り ごま酢炒め, substitute: null, use_up: false}
tags: [副菜, 時短, にんじん, 子ども取り分け]
salt: {total_g: 0.9, adult_per_serving_g: 0.45, kid_g: 0.0}
kid: {rule: separate, cut: 細切りを 1cm の長さに切る, note: 味付け前に取り分ける。にんじんは指でつぶせるくらいまで蒸し焼きにしてから。冷ましてから出す}
keep: {fridge_days: 2, freezer: false, reheat: 冷たいままでもおいしい。温めるならレンジ 600W 30 秒}
timeline:
- {minute: 0, lane: hands, text: にんじん・じゃがいもをスライサーで細切り。じゃがいもは水にさらす}
- {minute: 4, lane: gas-r, text: フライパンにごま油、にんじんを中火で 2 分}
- {minute: 6, lane: gas-r, text: じゃがいもと水を入れ、蓋をして弱火 3 分}
- {minute: 9, lane: hands, text: 子どもの分を取り分けて刻む}
- {minute: 10, lane: gas-r, text: 酢・醤油・砂糖で 1 分炒め、白ごま}
- {minute: 11, lane: hands, text: 盛り付け}
- {minute: 12, lane: hands, text: 完成}
steps:
- dish: にんじんとじゃがいものスライサー細切り ごま酢炒め
  n: 1
  title: スライサーで細切り
  kind: prep
  tag: cut
  minutes: 4
  start: 0
  heat: null
  text: にんじん 1 本とじゃがいも 1 個の皮をピーラーでむき、スライサー（1.2mm 細切り）で細切りにする。じゃがいもは水に 1 分さらしてザルで水けを切る。
  cue: 細切りの太さがそろっている。じゃがいもの水が軽く白く濁る
  caution: 最後の 2cm はスライサーを使わず包丁で切る（指を守る）
  timer: null
  kid: null
  ingredients: [にんじん, じゃがいも]
- dish: にんじんとじゃがいものスライサー細切り ごま酢炒め
  n: 2
  title: にんじんを炒める
  kind: heat
  tag: stir-fry
  minutes: 2
  start: 4
  heat: {equipment: gas-r, level: 中火}
  text: フライパン（fp26）を中火で 1 分予熱し、ごま油 小さじ 2 を入れてにんじんを 2 分炒める。
  cue: にんじんの色が濃くなり、しんなりしてかさが減る
  caution: null
  timer: null
  kid: null
  ingredients: [ごま油]
- dish: にんじんとじゃがいものスライサー細切り ごま酢炒め
  n: 3
  title: じゃがいもを入れて蒸し焼き
  kind: wait
  tag: simmer
  minutes: 3
  start: 6
  heat: {equipment: gas-r, level: 弱火}
  text: じゃがいもと水 大さじ 2 を入れてさっと混ぜ、蓋をして弱火で 3 分蒸し焼きにする。
  cue: じゃがいもが透き通り、にんじんが指でつぶせるくらい柔らかい。水けがほぼ無い
  caution: にんじんが固ければ水 大さじ 1 を足して 1 分延ばす（レンジより炒め蒸しの方が柔らかくなる）
  timer: 180
  kid: null
  ingredients: [水]
- dish: にんじんとじゃがいものスライサー細切り ごま酢炒め
  n: 4
  title: 子どもの分を取り分ける
  kind: prep
  tag: kid
  minutes: 1
  start: 9
  heat: null
  text: 味付け前に、子どもの分をひとつかみ小皿に取る。
  cue: 湯気が落ち着いた温かさ
  caution: null
  timer: null
  kid: キッチンばさみで 1cm の長さに切る。味付けはしない。冷ましてから出す
  ingredients: []
- dish: にんじんとじゃがいものスライサー細切り ごま酢炒め
  n: 5
  title: ごま酢で味付け
  kind: heat
  tag: season
  minutes: 1
  start: 10
  heat: {equipment: gas-r, level: 中火}
  text: 中火にして酢 小さじ 2・醤油 小さじ 1・砂糖 小さじ 1/2 を回し入れ、1 分炒めて汁けを飛ばす。火を止めて白ごま 小さじ 1 をふる。
  cue: 酢のツンとした匂いがやわらぎ、鍋底に汁が残らない
  caution: null
  timer: null
  kid: null
  ingredients: [酢, 醤油, 砂糖, 白ごま]
- dish: にんじんとじゃがいものスライサー細切り ごま酢炒め
  n: 6
  title: 盛り付け
  kind: serve
  tag: serve
  minutes: 1
  start: 11
  heat: null
  text: 小鉢にふんわり盛る。
  cue: 細切りがからまってこんもり盛れている
  caution: null
  timer: null
  kid: null
  ingredients: []
cleanup:
  dishwasher: []
  hand: [fp26]
  note: スライサーとザルも手洗い。スライサーの刃はスポンジで刃の向きに沿って洗う
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261128-hotate-to-kabocha-no-milk-cream-nikomi]
---

一緒に作る: `r-20261128-hotate-to-kabocha-no-milk-cream-nikomi`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（13 分）

| 分 | ガスコンロ右 | 手 |
|---|---|---|
| 0 |  | にんじん・じゃがいもをスライサーで細切り。じゃがいもは水にさらす |
| 4 | フライパンにごま油、にんじんを中火で 2 分 |  |
| 6 | じゃがいもと水を入れ、蓋をして弱火 3 分 |  |
| 9 |  | 子どもの分を取り分けて刻む |
| 10 | 酢・醤油・砂糖で 1 分炒め、白ごま |  |
| 11 |  | 盛り付け |
| 12 |  | 完成 |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| にんじん | 1 本（150g） | にんじんとじゃがいものスライサー細切り ごま酢炒め | にんじん |
| じゃがいも | 1 個（130g） | にんじんとじゃがいものスライサー細切り ごま酢炒め | じゃがいも |
| ごま油 | 2 小さじ（8g） | にんじんとじゃがいものスライサー細切り ごま酢炒め | ごま油 |
| 水 | 2 大さじ（30g） | にんじんとじゃがいものスライサー細切り ごま酢炒め | — |
| 酢 | 2 小さじ（10g） | にんじんとじゃがいものスライサー細切り ごま酢炒め | 酢 |
| 醤油 | 1 小さじ（6g） | にんじんとじゃがいものスライサー細切り ごま酢炒め | 醤油 |
| 砂糖 | 0.5 小さじ（1.5g） | にんじんとじゃがいものスライサー細切り ごま酢炒め | 砂糖 |
| 白ごま | 1 小さじ（3g） | にんじんとじゃがいものスライサー細切り ごま酢炒め | 白ごま |

塩分: 合計 0.9g ・ 大人 1 人分 0.45g ・ 子ども 0.0g

## 手順

### にんじんとじゃがいものスライサー細切り ごま酢炒め
1. **スライサーで細切り（4 分 / prep）** にんじん 1 本とじゃがいも 1 個の皮をピーラーでむき、スライサー（1.2mm 細切り）で細切りにする。じゃがいもは水に 1 分さらしてザルで水けを切る。
   - 材料: にんじん 1 本（150g）・じゃがいも 1 個（130g）
   - 目安: 細切りの太さがそろっている。じゃがいもの水が軽く白く濁る
   - ⚠ 最後の 2cm はスライサーを使わず包丁で切る（指を守る）
2. **にんじんを炒める（2 分 / heat）** ガスコンロ右・中火 フライパン（fp26）を中火で 1 分予熱し、ごま油 小さじ 2 を入れてにんじんを 2 分炒める。
   - 材料: ごま油 小さじ 2（8g）
   - 目安: にんじんの色が濃くなり、しんなりしてかさが減る
3. **じゃがいもを入れて蒸し焼き（3 分 / wait）** ガスコンロ右・弱火 じゃがいもと水 大さじ 2 を入れてさっと混ぜ、蓋をして弱火で 3 分蒸し焼きにする。
   - 材料: 水 大さじ 2（30g）
   - 目安: じゃがいもが透き通り、にんじんが指でつぶせるくらい柔らかい。水けがほぼ無い
   - ⏱ 3 分
   - ⚠ にんじんが固ければ水 大さじ 1 を足して 1 分延ばす（レンジより炒め蒸しの方が柔らかくなる）
4. **子どもの分を取り分ける（1 分 / prep）** 味付け前に、子どもの分をひとつかみ小皿に取る。
   - 目安: 湯気が落ち着いた温かさ
   - 🍼 キッチンばさみで 1cm の長さに切る。味付けはしない。冷ましてから出す
5. **ごま酢で味付け（1 分 / heat）** ガスコンロ右・中火 中火にして酢 小さじ 2・醤油 小さじ 1・砂糖 小さじ 1/2 を回し入れ、1 分炒めて汁けを飛ばす。火を止めて白ごま 小さじ 1 をふる。
   - 材料: 酢 小さじ 2（10g）・醤油 小さじ 1（6g）・砂糖 小さじ 1/2（1.5g）・白ごま 小さじ 1（3g）
   - 目安: 酢のツンとした匂いがやわらぎ、鍋底に汁が残らない
6. **盛り付け（1 分 / serve）** 小鉢にふんわり盛る。
   - 目安: 細切りがからまってこんもり盛れている

## 子どもの分

- 取り分け: separate ・ 大きさ: 細切りを 1cm の長さに切る
- 味付け前に取り分ける。にんじんは指でつぶせるくらいまで蒸し焼きにしてから。冷ましてから出す

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 不向き
- 温め直し: 冷たいままでもおいしい。温めるならレンジ 600W 30 秒

## 片付け

- 食洗機: —
- 手洗い: フライパン
- スライサーとザルも手洗い。スライサーの刃はスポンジで刃の向きに沿って洗う

## 作ったときのメモ

