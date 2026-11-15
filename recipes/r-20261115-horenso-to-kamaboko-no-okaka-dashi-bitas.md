---
id: r-20261115-horenso-to-kamaboko-no-okaka-dashi-bitas
title: ほうれん草とかまぼこのおかかだし浸し
version: 1
supersedes: null
status: draft
created: '2026-11-15'
request: req-20261115-1754-ppqa
generated_by: {model: claude-code, prompt_version: 10}
type: dinner
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 19, active: 11, raw_estimate: 13, speed_factor: 1.23}
image_text: 濃い緑のほうれん草と、ピンクのふちのかまぼこの細切りがだしに浸かる。かつお節をふわりとのせる。
dishes:
- {name: ほうれん草とかまぼこのおかかだし浸し, role: side}
equipment: [kettle, gas-l, pot20, bowl-l]
ingredients:
- {name: ほうれん草, qty: 1, unit: 束, grams: 200, pantry: ほうれん草, for: ほうれん草とかまぼこのおかかだし浸し, substitute: null, use_up: false}
- {name: かまぼこ, qty: 2, unit: 切れ, grams: 20, pantry: かまぼこ, for: ほうれん草とかまぼこのおかかだし浸し, substitute: null, use_up: false}
- {name: めんつゆ, qty: 2, unit: 小さじ, grams: 12, pantry: めんつゆ, for: ほうれん草とかまぼこのおかかだし浸し, substitute: null, use_up: false}
- {name: 水, qty: 2, unit: 大さじ, grams: 30, pantry: null, for: ほうれん草とかまぼこのおかかだし浸し, substitute: null, use_up: false}
- {name: かつお節, qty: 1, unit: 袋, grams: 2, pantry: かつお節, for: ほうれん草とかまぼこのおかかだし浸し, substitute: null, use_up: false}
tags: [和え物, お浸し, 電気ケトル, 子ども取り分け]
salt: {total_g: 1.5, adult_per_serving_g: 0.75, kid_g: 0.0}
kid: {rule: separate, cut: 葉先だけを 5mm に刻む, note: めんつゆに浸す前に葉先を取り分け、かつお節を少しまぶすだけ。かまぼこは弾力があるので子どもの分には入れない。}
keep: {fridge_days: 2, freezer: false, reheat: 冷たいまま。汁気を切ってから盛る}
timeline:
- {minute: 0, lane: hands, text: 電気ケトルで湯 1L を沸かす・ほうれん草を洗う}
- {minute: 3, lane: gas-l, text: 鍋に湯を移し強火 → ほうれん草を茎から茹でる}
- {minute: 5, lane: hands, text: 水に取って絞り、4cm に切る。かまぼこを細切り}
- {minute: 9, lane: hands, text: 子どもの分を取り分け → めんつゆ・水で浸し、かつお節}
- {minute: 11, lane: hands, text: 盛り付け}
steps:
- dish: ほうれん草とかまぼこのおかかだし浸し
  n: 1
  title: 湯を沸かす
  kind: prep
  tag: boil
  minutes: 3
  start: 0
  heat: null
  text: 電気ケトルで湯 1L を沸かす。その間にほうれん草 1 束を根元の土までよく洗う。
  cue: ケトルのスイッチが切れ、ほうれん草の根元に土が残っていない
  caution: null
  timer: null
  kid: null
  ingredients: [ほうれん草]
- dish: ほうれん草とかまぼこのおかかだし浸し
  n: 2
  title: 茹でる
  kind: heat
  tag: boil
  minutes: 2
  start: 3
  heat: {equipment: gas-l, level: 強火}
  text: 湯を鍋に移して強火にかけ、ほうれん草を茎から入れて 30 秒、葉も沈めて 1 分茹でる。
  cue: 葉が鮮やかな濃い緑になり、茎を指でつまむとしなる
  caution: 茹ですぎると色がくすむ。1 分 30 秒で上げる
  timer: null
  kid: null
  ingredients: []
- dish: ほうれん草とかまぼこのおかかだし浸し
  n: 3
  title: 絞って切る
  kind: prep
  tag: cut
  minutes: 4
  start: 5
  heat: null
  text: ザルに上げて水にさらし、根元をそろえて固く絞る。4cm に切る。かまぼこ 2 切れを 5mm の細切りにする。
  cue: 握っても水が垂れず、切り口がそろう
  caution: 根元の赤い部分は甘いので切り落とさず縦に割る
  timer: null
  kid: 葉先を 5mm に刻んで取り分ける
  ingredients: [かまぼこ]
- dish: ほうれん草とかまぼこのおかかだし浸し
  n: 4
  title: 浸す
  kind: prep
  tag: season
  minutes: 2
  start: 9
  heat: null
  text: ボウル（大）でめんつゆ 小さじ 2 と水 大さじ 2 を混ぜ、ほうれん草とかまぼこを和える。器に盛ってかつお節 1 袋をのせる。
  cue: 全体にだしが回り、かつお節がふわっと揺れる
  caution: null
  timer: null
  kid: 子どもの分はめんつゆ無しでかつお節を少しだけ
  ingredients: [めんつゆ, 水, かつお節]
- dish: ほうれん草とかまぼこのおかかだし浸し
  n: 5
  title: 盛り付け
  kind: serve
  tag: serve
  minutes: 2
  start: 11
  heat: null
  text: 汁ごと小鉢に盛る。
  cue: 汁が器の底に少し溜まる程度
  caution: null
  timer: null
  kid: null
  ingredients: []
cleanup:
  dishwasher: [bowl-l]
  hand: [pot20]
  note: 鍋は湯だけなのですすいで終わり
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261115-iwashi-tsumire-to-ninjin-no-amazu-an]
---

一緒に作る: `r-20261115-iwashi-tsumire-to-ninjin-no-amazu-an`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（19 分）

| 分 | ガスコンロ左 | 手 |
|---|---|---|
| 0 |  | 電気ケトルで湯 1L を沸かす・ほうれん草を洗う |
| 3 | 鍋に湯を移し強火 → ほうれん草を茎から茹でる |  |
| 5 |  | 水に取って絞り、4cm に切る。かまぼこを細切り |
| 9 |  | 子どもの分を取り分け → めんつゆ・水で浸し、かつお節 |
| 11 |  | 盛り付け |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| ほうれん草 | 1 束（200g） | ほうれん草とかまぼこのおかかだし浸し | ほうれん草 |
| かまぼこ | 2 切れ（20g） | ほうれん草とかまぼこのおかかだし浸し | かまぼこ |
| めんつゆ | 2 小さじ（12g） | ほうれん草とかまぼこのおかかだし浸し | めんつゆ |
| 水 | 2 大さじ（30g） | ほうれん草とかまぼこのおかかだし浸し | — |
| かつお節 | 1 袋（2g） | ほうれん草とかまぼこのおかかだし浸し | かつお節 |

塩分: 合計 1.5g ・ 大人 1 人分 0.75g ・ 子ども 0.0g

## 手順

### ほうれん草とかまぼこのおかかだし浸し
1. **湯を沸かす（3 分 / prep）** 電気ケトルで湯 1L を沸かす。その間にほうれん草 1 束を根元の土までよく洗う。
   - 材料: ほうれん草 1 束（200g）
   - 目安: ケトルのスイッチが切れ、ほうれん草の根元に土が残っていない
2. **茹でる（2 分 / heat）** ガスコンロ左・強火 湯を鍋に移して強火にかけ、ほうれん草を茎から入れて 30 秒、葉も沈めて 1 分茹でる。
   - 目安: 葉が鮮やかな濃い緑になり、茎を指でつまむとしなる
   - ⚠ 茹ですぎると色がくすむ。1 分 30 秒で上げる
3. **絞って切る（4 分 / prep）** ザルに上げて水にさらし、根元をそろえて固く絞る。4cm に切る。かまぼこ 2 切れを 5mm の細切りにする。
   - 材料: かまぼこ 2 切れ（20g）
   - 目安: 握っても水が垂れず、切り口がそろう
   - ⚠ 根元の赤い部分は甘いので切り落とさず縦に割る
   - 🍼 葉先を 5mm に刻んで取り分ける
4. **浸す（2 分 / prep）** ボウル（大）でめんつゆ 小さじ 2 と水 大さじ 2 を混ぜ、ほうれん草とかまぼこを和える。器に盛ってかつお節 1 袋をのせる。
   - 材料: めんつゆ 小さじ 2（12g）・水 大さじ 2（30g）・かつお節 1 袋（2g）
   - 目安: 全体にだしが回り、かつお節がふわっと揺れる
   - 🍼 子どもの分はめんつゆ無しでかつお節を少しだけ
5. **盛り付け（2 分 / serve）** 汁ごと小鉢に盛る。
   - 目安: 汁が器の底に少し溜まる程度

## 子どもの分

- 取り分け: separate ・ 大きさ: 葉先だけを 5mm に刻む
- めんつゆに浸す前に葉先を取り分け、かつお節を少しまぶすだけ。かまぼこは弾力があるので子どもの分には入れない。

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 不向き
- 温め直し: 冷たいまま。汁気を切ってから盛る

## 片付け

- 食洗機: ボウル（大）
- 手洗い: 鍋
- 鍋は湯だけなのですすいで終わり

## 作ったときのメモ

