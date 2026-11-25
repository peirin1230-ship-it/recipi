---
id: r-20261125-kabocha-no-butter-shoyu-yaki-okaka-mabus
title: かぼちゃのバター醤油焼き おかかまぶし
version: 1
supersedes: null
status: draft
created: '2026-11-25'
request: req-20261125-2215-j6ib
generated_by: {model: claude-code, prompt_version: 11}
type: dinner
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 17, active: 10, raw_estimate: 16, speed_factor: 0.96}
image_text: こんがり焼き色の付いた三日月形のかぼちゃに、バター醤油の照りが薄くまとい、かつお節がふわりと踊る。鮮やかな黄色の断面がほくほくに見える。
dishes:
- {name: かぼちゃのバター醤油焼き おかかまぶし, role: side}
equipment: [fp26, gas-r]
ingredients:
- {name: かぼちゃ, qty: 0.25, unit: 個, grams: 300, pantry: かぼちゃ, substitute: null, use_up: false, for: かぼちゃのバター醤油焼き おかかまぶし}
- {name: バター, qty: 10, unit: g, grams: 10, pantry: バター, substitute: null, use_up: false, for: かぼちゃのバター醤油焼き おかかまぶし}
- {name: 水, qty: 2, unit: 大さじ, grams: 30, pantry: null, substitute: null, use_up: false, for: かぼちゃのバター醤油焼き おかかまぶし}
- {name: 醤油, qty: 1, unit: 小さじ, grams: 6, pantry: 醤油, substitute: null, use_up: false, for: かぼちゃのバター醤油焼き おかかまぶし}
- {name: みりん, qty: 1, unit: 小さじ, grams: 6, pantry: みりん, substitute: null, use_up: false, for: かぼちゃのバター醤油焼き おかかまぶし}
- {name: かつお節, qty: 2, unit: g, grams: 2, pantry: かつお節, substitute: null, use_up: false, for: かぼちゃのバター醤油焼き おかかまぶし}
tags: [かぼちゃ, 焼き物, 子ども取り分け, 副菜, 手づかみ]
salt: {total_g: 1.0, adult_per_serving_g: 0.5, kid_g: 0.05}
kid: {rule: separate, cut: 1cm 幅 × 4cm の棒状（手づかみ用）。皮は外す, note: 醤油を入れる前に 3 切れ取り出し、皮を外して棒状に切る。バターの味だけで甘い。冷ましてから出す。}
keep: {fridge_days: 2, freezer: true, reheat: レンジ 600W で 1 人分 40 秒、またはフライパンで弱火 2 分。冷凍は 2 週間}
timeline:
- {minute: 0, lane: hands, text: かぼちゃの種とわたを取り、1cm 厚に切る}
- {minute: 5, lane: gas-r, text: バターで並べ、水を入れて蓋、弱火で蒸し焼き 6 分}
- {minute: 11, lane: gas-r, text: 返して蓋を取り、中火で 2 分焼く}
- {minute: 13, lane: hands, text: 子どもの分を取り出す}
- {minute: 14, lane: gas-r, text: 醤油・みりんをからめ、かつお節をまぶして盛る}
- {minute: 16, lane: hands, text: 配膳}
steps:
- dish: かぼちゃのバター醤油焼き おかかまぶし
  n: 1
  title: かぼちゃを切る
  kind: prep
  tag: cut
  minutes: 5
  start: 0
  heat: null
  text: かぼちゃ 1/4 個の種とわたをスプーンで取り、1cm 厚のくし形に切る。
  cue: 厚さがそろい、断面が平らになっている
  caution: かぼちゃは固いので、まな板に平らな面を下にして置き、包丁の背に手を添えて体重をかけて切る
  timer: null
  kid: null
  ingredients: [かぼちゃ]
- dish: かぼちゃのバター醤油焼き おかかまぶし
  n: 2
  title: バターで蒸し焼きにする
  kind: wait
  tag: sear
  minutes: 6
  start: 5
  heat: {equipment: gas-r, level: 弱火}
  text: フライパン（fp26）を中火で温めてバター 10g を溶かし、かぼちゃを並べる。水 大さじ 2 を入れてすぐ蓋をし、弱火で 6 分蒸し焼きにする。
  cue: 竹串がすっと通り、下の面にきつね色の焼き色が付いている
  caution: null
  timer: 360
  kid: null
  ingredients: [バター, 水, かぼちゃ]
- dish: かぼちゃのバター醤油焼き おかかまぶし
  n: 3
  title: 返して焼き色を付ける
  kind: heat
  tag: sear
  minutes: 2
  start: 11
  heat: {equipment: gas-r, level: 中火}
  text: 蓋を取ってかぼちゃを返し、中火で 2 分、水けを飛ばしながらもう片面を焼く。
  cue: 両面にこんがり焼き色が付き、フライパンの水けが無くなる
  caution: null
  timer: null
  kid: null
  ingredients: [かぼちゃ]
- dish: かぼちゃのバター醤油焼き おかかまぶし
  n: 4
  title: 子どもの分を取り出す
  kind: prep
  tag: kid
  minutes: 1
  start: 13
  heat: null
  text: 味付けの前に 3 切れを取り出し、皮を外して 1cm 幅の棒状に切る。
  cue: 指で押すとほろっと崩れるくらい柔らかい
  caution: null
  timer: null
  kid: 手づかみ用の棒状に。冷ましてから出す
  ingredients: []
- dish: かぼちゃのバター醤油焼き おかかまぶし
  n: 5
  title: バター醤油をからめて仕上げる
  kind: heat
  tag: season
  minutes: 2
  start: 14
  heat: {equipment: gas-r, level: 弱火}
  text: 火を弱火に落とし、醤油 小さじ 1 とみりん 小さじ 1 を回し入れて全体にからめる。皿に盛り、かつお節 2g をまぶす。
  cue: 醤油が焦げる香ばしい匂いがして、表面に薄く照りが出る
  caution: 醤油とみりんは焦げやすいので、必ず弱火にしてから入れ、30 秒ほどで火を止める
  timer: null
  kid: null
  ingredients: [醤油, みりん, かつお節]
cleanup:
  dishwasher: []
  hand: [fp26]
  note: null
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261125-buta-kata-rosu-to-tako-no-pot-au-feu-fu-]
---

一緒に作る: `r-20261125-buta-kata-rosu-to-tako-no-pot-au-feu-fu-`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（17 分）

| 分 | ガスコンロ右 | 手 |
|---|---|---|
| 0 |  | かぼちゃの種とわたを取り、1cm 厚に切る |
| 5 | バターで並べ、水を入れて蓋、弱火で蒸し焼き 6 分 |  |
| 11 | 返して蓋を取り、中火で 2 分焼く |  |
| 13 |  | 子どもの分を取り出す |
| 14 | 醤油・みりんをからめ、かつお節をまぶして盛る |  |
| 16 |  | 配膳 |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| かぼちゃ | 0.25 個（300g） | かぼちゃのバター醤油焼き おかかまぶし | かぼちゃ |
| バター | 10 g | かぼちゃのバター醤油焼き おかかまぶし | バター |
| 水 | 2 大さじ（30g） | かぼちゃのバター醤油焼き おかかまぶし | — |
| 醤油 | 1 小さじ（6g） | かぼちゃのバター醤油焼き おかかまぶし | 醤油 |
| みりん | 1 小さじ（6g） | かぼちゃのバター醤油焼き おかかまぶし | みりん |
| かつお節 | 2 g | かぼちゃのバター醤油焼き おかかまぶし | かつお節 |

塩分: 合計 1.0g ・ 大人 1 人分 0.5g ・ 子ども 0.05g

## 手順

### かぼちゃのバター醤油焼き おかかまぶし
1. **かぼちゃを切る（5 分 / prep）** かぼちゃ 1/4 個の種とわたをスプーンで取り、1cm 厚のくし形に切る。
   - 材料: かぼちゃ 1/4 個（300g）
   - 目安: 厚さがそろい、断面が平らになっている
   - ⚠ かぼちゃは固いので、まな板に平らな面を下にして置き、包丁の背に手を添えて体重をかけて切る
2. **バターで蒸し焼きにする（6 分 / wait）** ガスコンロ右・弱火 フライパン（fp26）を中火で温めてバター 10g を溶かし、かぼちゃを並べる。水 大さじ 2 を入れてすぐ蓋をし、弱火で 6 分蒸し焼きにする。
   - 材料: バター 10 g・水 大さじ 2（30g）・かぼちゃ 1/4 個（300g）
   - 目安: 竹串がすっと通り、下の面にきつね色の焼き色が付いている
   - ⏱ 6 分
3. **返して焼き色を付ける（2 分 / heat）** ガスコンロ右・中火 蓋を取ってかぼちゃを返し、中火で 2 分、水けを飛ばしながらもう片面を焼く。
   - 材料: かぼちゃ 1/4 個（300g）
   - 目安: 両面にこんがり焼き色が付き、フライパンの水けが無くなる
4. **子どもの分を取り出す（1 分 / prep）** 味付けの前に 3 切れを取り出し、皮を外して 1cm 幅の棒状に切る。
   - 目安: 指で押すとほろっと崩れるくらい柔らかい
   - 🍼 手づかみ用の棒状に。冷ましてから出す
5. **バター醤油をからめて仕上げる（2 分 / heat）** ガスコンロ右・弱火 火を弱火に落とし、醤油 小さじ 1 とみりん 小さじ 1 を回し入れて全体にからめる。皿に盛り、かつお節 2g をまぶす。
   - 材料: 醤油 小さじ 1（6g）・みりん 小さじ 1（6g）・かつお節 2 g
   - 目安: 醤油が焦げる香ばしい匂いがして、表面に薄く照りが出る
   - ⚠ 醤油とみりんは焦げやすいので、必ず弱火にしてから入れ、30 秒ほどで火を止める

## 子どもの分

- 取り分け: separate ・ 大きさ: 1cm 幅 × 4cm の棒状（手づかみ用）。皮は外す
- 醤油を入れる前に 3 切れ取り出し、皮を外して棒状に切る。バターの味だけで甘い。冷ましてから出す。

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 可
- 温め直し: レンジ 600W で 1 人分 40 秒、またはフライパンで弱火 2 分。冷凍は 2 週間

## 片付け

- 食洗機: —
- 手洗い: フライパン

## 作ったときのメモ

