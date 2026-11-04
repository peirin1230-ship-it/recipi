---
id: r-20261104-iwashi-tsumire-to-hakusai-no-dashi-ni
title: いわしつみれと白菜のだし煮
version: 1
supersedes: null
status: draft
created: '2026-11-04'
request: req-20261104-2332-r3eq
generated_by: {model: claude-code, prompt_version: 10}
type: prep
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 52, active: 24, raw_estimate: 44, speed_factor: 1.15}
image_text: だし色に染まった白菜の上に、まるいいわしつみれがごろごろとのり、ほくほくのじゃがいもが添う。表面に塩昆布のつやと小ねぎ代わりの細かい昆布が散る。
dishes:
- {name: いわしつみれと白菜のだし煮, role: main}
equipment: [pot20, gas-l, kettle, bowl-m]
ingredients:
- {name: いわしつみれ, qty: 8, unit: 個, grams: 240, pantry: いわしつみれ, for: いわしつみれと白菜のだし煮, substitute: null, use_up: true}
- {name: 白菜 1/, qty: 0.25, unit: 株, grams: null, pantry: 白菜 1/, for: いわしつみれと白菜のだし煮, substitute: null, use_up: false}
- {name: じゃがいも, qty: 2, unit: 個, grams: 300, pantry: じゃがいも, for: いわしつみれと白菜のだし煮, substitute: null, use_up: false}
- {name: だしパック, qty: 1, unit: 袋, grams: 8, pantry: null, for: いわしつみれと白菜のだし煮, substitute: null, use_up: false}
- {name: 水, qty: 400, unit: ml, grams: 400, pantry: null, for: いわしつみれと白菜のだし煮, substitute: null, use_up: false}
- {name: 酒, qty: 1, unit: 大さじ, grams: 15, pantry: null, for: いわしつみれと白菜のだし煮, substitute: null, use_up: false}
- {name: みりん, qty: 1, unit: 大さじ, grams: 18, pantry: null, for: いわしつみれと白菜のだし煮, substitute: null, use_up: false}
- {name: 醤油, qty: 1, unit: 小さじ, grams: 6, pantry: null, for: いわしつみれと白菜のだし煮, substitute: null, use_up: false}
- {name: 塩昆布, qty: 5, unit: g, grams: 5, pantry: 塩昆布, for: いわしつみれと白菜のだし煮, substitute: null, use_up: false}
tags: [いわしつみれ, 白菜, 煮物, だし, 仕込み, 子ども取り分け, 前日仕込み]
salt: {total_g: 2.4, adult_per_serving_g: 1.0, kid_g: 0.6}
kid: {rule: separate, cut: じゃがいもと白菜は1cm角に刻む。つみれは1cm以下に崩す, note: 塩昆布と醤油を入れる前、だしで煮えた段階で取り分ける。つみれ自体の塩気で十分。粗熱を取ってから出す}
keep: {fridge_days: 2, freezer: false, reheat: 鍋に移し弱火で煮汁ごと温め、湯気が立つまで。または耐熱ボウルにラップで600W 2分、途中で混ぜる}
timeline:
- {minute: 0, lane: hands, text: 電気ケトルで湯を沸かす（鍋用）}
- {minute: 0, lane: hands, text: じゃがいもを皮をむいて3cm角、白菜を4cmざく切りにする}
- {minute: 8, lane: gas-l, text: 鍋にだしパック・水・じゃがいも・酒を入れ中火にかける}
- {minute: 14, lane: gas-l, text: 沸いたら弱火。白菜とつみれを加えて蓋をして煮る}
- {minute: 15, lane: hands, text: （待ち時間）副菜を作る}
- {minute: 28, lane: gas-l, text: 子どもの分を取り分け、みりん・醤油・塩昆布を加えて5分煮る}
- {minute: 36, lane: hands, text: 粗熱を取り、保存容器に移して冷蔵}
steps:
- dish: いわしつみれと白菜のだし煮
  n: 1
  title: 切る
  kind: prep
  tag: cut
  minutes: 8
  start: 0
  heat: null
  text: じゃがいも 2個の皮をむき3cm角に切って水にさらす。白菜 1/4株を4cmのざく切りにする。ケトルで湯を沸かしておく。
  cue: じゃがいもの切り口がそろっている
  caution: null
  timer: null
  kid: null
  ingredients: [じゃがいも, 白菜 1/]
- dish: いわしつみれと白菜のだし煮
  n: 2
  title: じゃがいもを煮る
  kind: heat
  tag: boil
  minutes: 6
  start: 8
  heat: {equipment: gas-l, level: 中火}
  text: 鍋20cmにだしパック 1袋、湯（ケトルの湯）400ml、酒 大さじ1、水気を切ったじゃがいもを入れ中火にかける。
  cue: ふつふつと小さな泡が立つ
  caution: だしパックは沸く前に取り出す
  timer: null
  kid: null
  ingredients: [だしパック, 水, 酒, じゃがいも]
- dish: いわしつみれと白菜のだし煮
  n: 3
  title: 白菜とつみれを煮る
  kind: wait
  tag: simmer
  minutes: 14
  start: 14
  heat: {equipment: gas-l, level: 弱火}
  text: だしパックを取り出し、白菜とつみれ 8個を加えて蓋をし、弱火で煮る。つみれは中心まで火を通す。
  cue: つみれが浮いて、割ると中まで白く熱い。白菜がしんなりする
  caution: つみれは中心まで火を通す
  timer: 840
  kid: 煮えた段階でじゃがいも・白菜・つみれを取り分ける
  ingredients: [いわしつみれ, 白菜 1/]
- dish: いわしつみれと白菜のだし煮
  n: 4
  title: 子どもの分を取り分ける
  kind: prep
  tag: kid
  minutes: 3
  start: 28
  heat: null
  text: 味付け前に、じゃがいも・白菜・つみれ1個と煮汁少々を別の器へ。1cm角以下に刻み、つみれは崩す。
  cue: 箸で簡単につぶれる固さ
  caution: null
  timer: null
  kid: 冷ましてから出す。味付けはしない
  ingredients: [いわしつみれ, じゃがいも, 白菜 1/]
- dish: いわしつみれと白菜のだし煮
  n: 5
  title: 味を付ける
  kind: heat
  tag: simmer
  minutes: 5
  start: 31
  heat: {equipment: gas-l, level: 弱火}
  text: 残りにみりん 大さじ1、醤油 小さじ1、塩昆布 5gを加え、蓋なしで5分煮る。
  cue: 煮汁が少しとろみを帯び、塩昆布が柔らかくなる
  caution: null
  timer: null
  kid: null
  ingredients: [みりん, 醤油, 塩昆布]
- dish: いわしつみれと白菜のだし煮
  n: 6
  title: 冷まして保存
  kind: serve
  tag: cleanup
  minutes: 8
  start: 36
  heat: null
  text: 火を止め、30分以内に粗熱を取って保存容器へ移し冷蔵する。翌日は鍋で温め直すだけ。
  cue: 容器の底まで冷たい
  caution: 鍋のまま常温に置かない
  timer: null
  kid: null
  ingredients: []
cleanup:
  dishwasher: [bowl-m]
  hand: [pot20]
  note: 鍋は手洗い
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261104-daizu-to-corn-no-shiokonbu-marinade]
---

一緒に作る: `r-20261104-daizu-to-corn-no-shiokonbu-marinade`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（52 分）

| 分 | ガスコンロ左 | 手 |
|---|---|---|
| 0 |  | 電気ケトルで湯を沸かす（鍋用） / じゃがいもを皮をむいて3cm角、白菜を4cmざく切りにする |
| 8 | 鍋にだしパック・水・じゃがいも・酒を入れ中火にかける |  |
| 14 | 沸いたら弱火。白菜とつみれを加えて蓋をして煮る |  |
| 15 |  | （待ち時間）副菜を作る |
| 28 | 子どもの分を取り分け、みりん・醤油・塩昆布を加えて5分煮る |  |
| 36 |  | 粗熱を取り、保存容器に移して冷蔵 |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| いわしつみれ | 8 個（240g） | いわしつみれと白菜のだし煮 使い切り | いわしつみれ |
| 白菜 1/ | 0.25 株 | いわしつみれと白菜のだし煮 | 白菜 1/ |
| じゃがいも | 2 個（300g） | いわしつみれと白菜のだし煮 | じゃがいも |
| だしパック | 1 袋（8g） | いわしつみれと白菜のだし煮 | — |
| 水 | 400 ml（400g） | いわしつみれと白菜のだし煮 | — |
| 酒 | 1 大さじ（15g） | いわしつみれと白菜のだし煮 | — |
| みりん | 1 大さじ（18g） | いわしつみれと白菜のだし煮 | — |
| 醤油 | 1 小さじ（6g） | いわしつみれと白菜のだし煮 | — |
| 塩昆布 | 5 g | いわしつみれと白菜のだし煮 | 塩昆布 |

塩分: 合計 2.4g ・ 大人 1 人分 1.0g ・ 子ども 0.6g

## 手順

### いわしつみれと白菜のだし煮
1. **切る（8 分 / prep）** じゃがいも 2個の皮をむき3cm角に切って水にさらす。白菜 1/4株を4cmのざく切りにする。ケトルで湯を沸かしておく。
   - 材料: じゃがいも 2 個（300g）・白菜 1/ 1/4 株
   - 目安: じゃがいもの切り口がそろっている
2. **じゃがいもを煮る（6 分 / heat）** ガスコンロ左・中火 鍋20cmにだしパック 1袋、湯（ケトルの湯）400ml、酒 大さじ1、水気を切ったじゃがいもを入れ中火にかける。
   - 材料: だしパック 1 袋（8g）・水 400 ml（400g）・酒 大さじ 1（15g）・じゃがいも 2 個（300g）
   - 目安: ふつふつと小さな泡が立つ
   - ⚠ だしパックは沸く前に取り出す
3. **白菜とつみれを煮る（14 分 / wait）** ガスコンロ左・弱火 だしパックを取り出し、白菜とつみれ 8個を加えて蓋をし、弱火で煮る。つみれは中心まで火を通す。
   - 材料: いわしつみれ 8 個（240g）・白菜 1/ 1/4 株
   - 目安: つみれが浮いて、割ると中まで白く熱い。白菜がしんなりする
   - ⏱ 14 分
   - ⚠ つみれは中心まで火を通す
   - 🍼 煮えた段階でじゃがいも・白菜・つみれを取り分ける
4. **子どもの分を取り分ける（3 分 / prep）** 味付け前に、じゃがいも・白菜・つみれ1個と煮汁少々を別の器へ。1cm角以下に刻み、つみれは崩す。
   - 材料: いわしつみれ 8 個（240g）・じゃがいも 2 個（300g）・白菜 1/ 1/4 株
   - 目安: 箸で簡単につぶれる固さ
   - 🍼 冷ましてから出す。味付けはしない
5. **味を付ける（5 分 / heat）** ガスコンロ左・弱火 残りにみりん 大さじ1、醤油 小さじ1、塩昆布 5gを加え、蓋なしで5分煮る。
   - 材料: みりん 大さじ 1（18g）・醤油 小さじ 1（6g）・塩昆布 5 g
   - 目安: 煮汁が少しとろみを帯び、塩昆布が柔らかくなる
6. **冷まして保存（8 分 / serve）** 火を止め、30分以内に粗熱を取って保存容器へ移し冷蔵する。翌日は鍋で温め直すだけ。
   - 目安: 容器の底まで冷たい
   - ⚠ 鍋のまま常温に置かない

## 子どもの分

- 取り分け: separate ・ 大きさ: じゃがいもと白菜は1cm角に刻む。つみれは1cm以下に崩す
- 塩昆布と醤油を入れる前、だしで煮えた段階で取り分ける。つみれ自体の塩気で十分。粗熱を取ってから出す

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 不向き
- 温め直し: 鍋に移し弱火で煮汁ごと温め、湯気が立つまで。または耐熱ボウルにラップで600W 2分、途中で混ぜる

## 片付け

- 食洗機: ボウル（中）
- 手洗い: 鍋
- 鍋は手洗い

## 作ったときのメモ

