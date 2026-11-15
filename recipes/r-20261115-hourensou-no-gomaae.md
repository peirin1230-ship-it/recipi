---
id: r-20261115-hourensou-no-gomaae
title: ほうれん草のごま和え
version: 1
supersedes: null
status: draft
created: '2026-11-15'
request: req-20261115-1748-bu58
generated_by: {model: claude-code, prompt_version: 10}
type: dinner
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 18, active: 10, raw_estimate: 12, speed_factor: 1.23}
image_text: 濃い緑のほうれん草が 4cm にそろい、白ごまとかつお節がまぶさってふんわりした小鉢。醤油はほんのりで、ごまの香りが立つ。
dishes:
- {name: ほうれん草のごま和え, role: side}
equipment: [gas-r, fp26, kettle, bowl-m]
ingredients:
- {name: ほうれん草, qty: 1, unit: 束, grams: 200, pantry: ほうれん草, for: ほうれん草のごま和え, substitute: null, use_up: false}
- {name: 水, qty: 800, unit: ml, grams: 800, pantry: null, for: ほうれん草のごま和え, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 大さじ, grams: 9, pantry: 白ごま, for: ほうれん草のごま和え, substitute: null, use_up: false}
- {name: 砂糖, qty: 1, unit: 小さじ, grams: 3, pantry: 砂糖, for: ほうれん草のごま和え, substitute: null, use_up: false}
- {name: 醤油, qty: 1, unit: 小さじ, grams: 6, pantry: 醤油, for: ほうれん草のごま和え, substitute: null, use_up: false}
- {name: かつお節, qty: 2, unit: g, grams: 2, pantry: かつお節, for: ほうれん草のごま和え, substitute: null, use_up: false}
tags: [副菜, 和え物, 子ども取り分け]
salt: {total_g: 0.9, adult_per_serving_g: 0.45, kid_g: 0.0}
kid: {rule: separate, cut: 茹でて絞ったら、味付け前に葉先を 5mm に刻んで取り分ける, note: 1-2y。茎は大人へ。かつお節だけまぶすと食べやすい。冷ましてから出す}
keep: {fridge_days: 1, freezer: false, reheat: 冷たいまま食べる。和えた物は当日中に}
timeline:
- {minute: 0, lane: hands, text: 電気ケトルで水 800ml を沸かす。ほうれん草の根元を洗う}
- {minute: 3, lane: gas-r, text: フライパンに湯を移して強火で再沸騰、ほうれん草を茹でる}
- {minute: 5, lane: hands, text: 冷水に取り、絞って 4cm に切る。子どもの分を刻んで取り分ける}
- {minute: 9, lane: hands, text: ごま・砂糖・醤油・かつお節で和える}
- {minute: 11, lane: hands, text: 小鉢に盛る}
steps:
- dish: ほうれん草のごま和え
  n: 1
  title: 湯を沸かし、ほうれん草を洗う
  kind: prep
  tag: cut
  minutes: 3
  start: 0
  heat: null
  text: 電気ケトルで水 800ml を沸かす。ほうれん草 1 束は根元に十字の切り込みを入れ、ボウル（中）の水で根元の土をよく洗う。
  cue: 根元の間に土が残っていない
  caution: null
  timer: null
  kid: null
  ingredients: [ほうれん草, 水]
- dish: ほうれん草のごま和え
  n: 2
  title: 茹でる
  kind: heat
  tag: boil
  minutes: 2
  start: 3
  heat: {equipment: gas-r, level: 強火}
  text: フライパン（fp26）にケトルの湯を入れて gas-r の強火で再び沸かし、ほうれん草を根元から入れて 30 秒、葉も沈めて 30 秒茹でる。
  cue: 葉が鮮やかな濃い緑になり、茎を指で押すと少しへこむ
  caution: 茹ですぎると色が茶色くなり水っぽくなる
  timer: 60
  kid: null
  ingredients: []
- dish: ほうれん草のごま和え
  n: 3
  title: 冷まして絞って切る
  kind: prep
  tag: cut
  minutes: 4
  start: 5
  heat: null
  text: ザルに上げてすぐボウル（中）の冷水に取り、根元をそろえて両手でしっかり絞る。根元を切り落として 4cm に切る。
  cue: 握っても水がほとんど落ちない
  caution: null
  timer: null
  kid: 味付け前に葉先を一つまみ取り、5mm に刻む。かつお節を少しまぶしてもよい
  ingredients: []
- dish: ほうれん草のごま和え
  n: 4
  title: 和える
  kind: prep
  tag: season
  minutes: 2
  start: 9
  heat: null
  text: 水気を拭いたボウル（中）に白ごま 大さじ 1（指でひねってつぶしながら）、砂糖 小さじ 1、醤油 小さじ 1、かつお節 2g を合わせ、ほうれん草をほぐしながら和える。
  cue: ごまとかつお節が全体に散り、ボウルの底に汁がたまらない
  caution: null
  timer: null
  kid: null
  ingredients: [白ごま, 砂糖, 醤油, かつお節]
- dish: ほうれん草のごま和え
  n: 5
  title: 盛る
  kind: serve
  tag: serve
  minutes: 1
  start: 11
  heat: null
  text: 小鉢 2 つにふんわり盛る。
  cue: 高さが出てごまが上に見える
  caution: null
  timer: null
  kid: null
  ingredients: []
cleanup:
  dishwasher: [bowl-m]
  hand: [fp26]
  note: 包丁・まな板・ザルは手洗い。フライパンは湯を捨てるだけでほぼきれい
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261115-butakata-rosu-no-nikujaga]
---

一緒に作る: `r-20261115-butakata-rosu-no-nikujaga`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（18 分）

| 分 | ガスコンロ右 | 手 |
|---|---|---|
| 0 |  | 電気ケトルで水 800ml を沸かす。ほうれん草の根元を洗う |
| 3 | フライパンに湯を移して強火で再沸騰、ほうれん草を茹でる |  |
| 5 |  | 冷水に取り、絞って 4cm に切る。子どもの分を刻んで取り分ける |
| 9 |  | ごま・砂糖・醤油・かつお節で和える |
| 11 |  | 小鉢に盛る |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| ほうれん草 | 1 束（200g） | ほうれん草のごま和え | ほうれん草 |
| 水 | 800 ml（800g） | ほうれん草のごま和え | — |
| 白ごま | 1 大さじ（9g） | ほうれん草のごま和え | 白ごま |
| 砂糖 | 1 小さじ（3g） | ほうれん草のごま和え | 砂糖 |
| 醤油 | 1 小さじ（6g） | ほうれん草のごま和え | 醤油 |
| かつお節 | 2 g | ほうれん草のごま和え | かつお節 |

塩分: 合計 0.9g ・ 大人 1 人分 0.45g ・ 子ども 0.0g

## 手順

### ほうれん草のごま和え
1. **湯を沸かし、ほうれん草を洗う（3 分 / prep）** 電気ケトルで水 800ml を沸かす。ほうれん草 1 束は根元に十字の切り込みを入れ、ボウル（中）の水で根元の土をよく洗う。
   - 材料: ほうれん草 1 束（200g）・水 800 ml（800g）
   - 目安: 根元の間に土が残っていない
2. **茹でる（2 分 / heat）** ガスコンロ右・強火 フライパン（fp26）にケトルの湯を入れて gas-r の強火で再び沸かし、ほうれん草を根元から入れて 30 秒、葉も沈めて 30 秒茹でる。
   - 目安: 葉が鮮やかな濃い緑になり、茎を指で押すと少しへこむ
   - ⏱ 1 分
   - ⚠ 茹ですぎると色が茶色くなり水っぽくなる
3. **冷まして絞って切る（4 分 / prep）** ザルに上げてすぐボウル（中）の冷水に取り、根元をそろえて両手でしっかり絞る。根元を切り落として 4cm に切る。
   - 目安: 握っても水がほとんど落ちない
   - 🍼 味付け前に葉先を一つまみ取り、5mm に刻む。かつお節を少しまぶしてもよい
4. **和える（2 分 / prep）** 水気を拭いたボウル（中）に白ごま 大さじ 1（指でひねってつぶしながら）、砂糖 小さじ 1、醤油 小さじ 1、かつお節 2g を合わせ、ほうれん草をほぐしながら和える。
   - 材料: 白ごま 大さじ 1（9g）・砂糖 小さじ 1（3g）・醤油 小さじ 1（6g）・かつお節 2 g
   - 目安: ごまとかつお節が全体に散り、ボウルの底に汁がたまらない
5. **盛る（1 分 / serve）** 小鉢 2 つにふんわり盛る。
   - 目安: 高さが出てごまが上に見える

## 子どもの分

- 取り分け: separate ・ 大きさ: 茹でて絞ったら、味付け前に葉先を 5mm に刻んで取り分ける
- 1-2y。茎は大人へ。かつお節だけまぶすと食べやすい。冷ましてから出す

## 保存・翌日

- 冷蔵 1 日 ・ 冷凍 不向き
- 温め直し: 冷たいまま食べる。和えた物は当日中に

## 片付け

- 食洗機: ボウル（中）
- 手洗い: フライパン
- 包丁・まな板・ザルは手洗い。フライパンは湯を捨てるだけでほぼきれい

## 作ったときのメモ

