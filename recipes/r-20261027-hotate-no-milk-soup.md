---
id: r-20261027-hotate-no-milk-soup
title: ホタテのミルクスープ
version: 1
supersedes: null
status: draft
created: '2026-10-27'
request: req-20261027-1857-zfdd
generated_by: {model: claude-code, prompt_version: 10}
type: recipe_detail
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 176, active: 15, raw_estimate: 150, speed_factor: 1.12}
image_text: 乳白色のスープに、ほんのり赤橙のにんじんとコーンの黄色、ぷっくりしたホタテが浮かぶ。湯気がやさしく立つ。
dishes:
- {name: ホタテのミルクスープ, role: side}
equipment: [pot20, gas-l, bowl-m]
ingredients:
- {name: 冷凍ホタテ, qty: 100, unit: g, grams: 100, pantry: 冷凍ホタテ, for: ホタテのミルクスープ, substitute: null, use_up: true}
- {name: にんじん, qty: 0.5, unit: 本, grams: 75, pantry: にんじん, for: ホタテのミルクスープ, substitute: null, use_up: false}
- {name: 牛乳, qty: 1.5, unit: カップ, grams: 300, pantry: 牛乳, for: ホタテのミルクスープ, substitute: null, use_up: false}
- {name: コーン缶, qty: 3, unit: 大さじ, grams: 45, pantry: コーン缶, for: ホタテのミルクスープ, substitute: null, use_up: false}
- {name: 水, qty: 0.5, unit: カップ, grams: 100, pantry: null, for: ホタテのミルクスープ, substitute: null, use_up: false}
- {name: 塩, qty: 0.25, unit: 小さじ, grams: 1.5, pantry: 塩, for: ホタテのミルクスープ, substitute: null, use_up: false}
tags: [副菜, スープ, 子ども取り分け, 使い切り]
salt: {total_g: 1.5, adult_per_serving_g: 0.75, kid_g: 0.1}
kid: {rule: separate, cut: ホタテは 5mm 角、にんじんは薄く切って柔らかく煮る, note: 塩を入れる前にお玉で子どもの分を取り分ける。ホタテは完全に火が通ってから刻む。冷ましてから出す}
keep: {fridge_days: 1, freezer: false, reheat: 鍋で弱火で温め直す（沸騰させない）。温めたら 1 日以内に食べ切る}
timeline:
- {minute: 116, lane: hands, text: ホタテを水に浸けて解凍}
- {minute: 126, lane: hands, text: ホタテ・にんじんを切る}
- {minute: 131, lane: gas-l, text: にんじんを煮てから牛乳を加え温める}
- {minute: 139, lane: gas-l, text: 子どもの分を取り分けて、塩で味を調える}
- {minute: 144, lane: hands, text: 盛り付ける}
steps:
- dish: ホタテのミルクスープ
  n: 1
  title: 冷凍ホタテを解凍する
  kind: prep
  tag: cut
  minutes: 3
  start: 116
  heat: null
  text: ボウル（中）に水 カップ 1 を張り、冷凍ホタテ 100g を入れて 10 分おく（主菜の待ち時間）。
  cue: 指で押すとほぼ柔らかく、凍った芯が残らない
  caution: null
  timer: null
  kid: null
  ingredients: [冷凍ホタテ]
- dish: ホタテのミルクスープ
  n: 2
  title: ホタテとにんじんを切る
  kind: prep
  tag: cut
  minutes: 5
  start: 126
  heat: null
  text: 解凍したホタテを水気を拭いて 1cm 角に切る。にんじん 1/2 本は薄いいちょう切りにする。
  cue: ホタテの断面が白く、にんじんが 2mm の薄さにそろう
  caution: null
  timer: null
  kid: null
  ingredients: [冷凍ホタテ, にんじん]
- dish: ホタテのミルクスープ
  n: 3
  title: にんじんを煮て、牛乳・ホタテを加える
  kind: heat
  tag: simmer
  minutes: 10
  start: 131
  heat: {equipment: gas-l, level: 弱火}
  text: 鍋（pot20）に水 カップ 1/2 とにんじんを入れて中火で 4 分、柔らかくなったら牛乳 カップ 1.5・コーン 大さじ 3・ホタテを加え、弱火で 4 分温める（沸騰させない）。
  cue: にんじんが指でつぶれるほど柔らかく、ホタテが白く縮んで固まる
  caution: 沸騰させると牛乳が膜を張って吹きこぼれる
  timer: null
  kid: null
  ingredients: [水, にんじん, 牛乳, コーン缶, 冷凍ホタテ]
- dish: ホタテのミルクスープ
  n: 4
  title: 子どもの分を取り分け、味を調える
  kind: heat
  tag: season
  minutes: 3
  start: 139
  heat: {equipment: gas-l, level: 弱火}
  text: 塩を入れる前に、お玉 1 杯（ホタテ 3 切れ・にんじん・牛乳）をボウル（中）に取り分け、ホタテを 5mm 角にほぐす。鍋に塩 小さじ 1/4 を加えて混ぜ、1 分温める。
  cue: 塩がなじみ、湯気が立つ。ホタテの中心まで白い
  caution: null
  timer: null
  kid: 取り分けた分は冷ましてから出す
  ingredients: [塩]
- dish: ホタテのミルクスープ
  n: 5
  title: 盛り付ける
  kind: serve
  tag: serve
  minutes: 3
  start: 144
  heat: null
  text: スープを椀によそう。
  cue: 湯気が立ち、コーンの黄色が見える
  caution: null
  timer: null
  kid: null
  ingredients: []
cleanup:
  dishwasher: [bowl-m]
  hand: [pot20]
  note: null
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261027-tori-momo-no-teion-chouri-oyakoni-fu-tor]
---

一緒に作る: `r-20261027-tori-momo-no-teion-chouri-oyakoni-fu-tor`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（176 分）

| 分 | ガスコンロ左 | 手 |
|---|---|---|
| 116 |  | ホタテを水に浸けて解凍 |
| 126 |  | ホタテ・にんじんを切る |
| 131 | にんじんを煮てから牛乳を加え温める |  |
| 139 | 子どもの分を取り分けて、塩で味を調える |  |
| 144 |  | 盛り付ける |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| 冷凍ホタテ | 100 g | ホタテのミルクスープ 使い切り | 冷凍ホタテ |
| にんじん | 0.5 本（75g） | ホタテのミルクスープ | にんじん |
| 牛乳 | 1.5 カップ（300g） | ホタテのミルクスープ | 牛乳 |
| コーン缶 | 3 大さじ（45g） | ホタテのミルクスープ | コーン缶 |
| 水 | 0.5 カップ（100g） | ホタテのミルクスープ | — |
| 塩 | 0.25 小さじ（1.5g） | ホタテのミルクスープ | 塩 |

塩分: 合計 1.5g ・ 大人 1 人分 0.75g ・ 子ども 0.1g

## 手順

### ホタテのミルクスープ
1. **冷凍ホタテを解凍する（3 分 / prep）** ボウル（中）に水 カップ 1 を張り、冷凍ホタテ 100g を入れて 10 分おく（主菜の待ち時間）。
   - 材料: 冷凍ホタテ 100 g
   - 目安: 指で押すとほぼ柔らかく、凍った芯が残らない
2. **ホタテとにんじんを切る（5 分 / prep）** 解凍したホタテを水気を拭いて 1cm 角に切る。にんじん 1/2 本は薄いいちょう切りにする。
   - 材料: 冷凍ホタテ 100 g・にんじん 1/2 本（75g）
   - 目安: ホタテの断面が白く、にんじんが 2mm の薄さにそろう
3. **にんじんを煮て、牛乳・ホタテを加える（10 分 / heat）** ガスコンロ左・弱火 鍋（pot20）に水 カップ 1/2 とにんじんを入れて中火で 4 分、柔らかくなったら牛乳 カップ 1.5・コーン 大さじ 3・ホタテを加え、弱火で 4 分温める（沸騰させない）。
   - 材料: 水 カップ 1/2（100g）・にんじん 1/2 本（75g）・牛乳 カップ 1と1/2（300g）・コーン缶 大さじ 3（45g）・冷凍ホタテ 100 g
   - 目安: にんじんが指でつぶれるほど柔らかく、ホタテが白く縮んで固まる
   - ⚠ 沸騰させると牛乳が膜を張って吹きこぼれる
4. **子どもの分を取り分け、味を調える（3 分 / heat）** ガスコンロ左・弱火 塩を入れる前に、お玉 1 杯（ホタテ 3 切れ・にんじん・牛乳）をボウル（中）に取り分け、ホタテを 5mm 角にほぐす。鍋に塩 小さじ 1/4 を加えて混ぜ、1 分温める。
   - 材料: 塩 小さじ 1/4（1.5g）
   - 目安: 塩がなじみ、湯気が立つ。ホタテの中心まで白い
   - 🍼 取り分けた分は冷ましてから出す
5. **盛り付ける（3 分 / serve）** スープを椀によそう。
   - 目安: 湯気が立ち、コーンの黄色が見える

## 子どもの分

- 取り分け: separate ・ 大きさ: ホタテは 5mm 角、にんじんは薄く切って柔らかく煮る
- 塩を入れる前にお玉で子どもの分を取り分ける。ホタテは完全に火が通ってから刻む。冷ましてから出す

## 保存・翌日

- 冷蔵 1 日 ・ 冷凍 不向き
- 温め直し: 鍋で弱火で温め直す（沸騰させない）。温めたら 1 日以内に食べ切る

## 片付け

- 食洗機: ボウル（中）
- 手洗い: 鍋

## 作ったときのメモ

