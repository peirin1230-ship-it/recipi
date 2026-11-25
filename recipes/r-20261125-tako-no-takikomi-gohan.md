---
listed: "2026-11-25T22:59:17+09:00"
id: r-20261125-tako-no-takikomi-gohan
title: たこの炊き込みご飯
version: 1
supersedes: null
status: draft
created: '2026-11-25'
request: req-20261125-2256-9j1c
generated_by: {model: claude-code, prompt_version: 11}
type: recipe_detail
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 84, active: 11, raw_estimate: 81, speed_factor: 0.96}
image_text: 薄い醤油色のご飯に、赤紫のたこと米粒ほどのにんじんのオレンジが全体に散っている。だしの香りが立つ炊きたて。
dishes:
- {name: たこの炊き込みご飯, role: rice}
equipment: [rice-cooker]
ingredients:
- {name: 米, qty: 2, unit: 合, grams: 300, pantry: 米, for: たこの炊き込みご飯, substitute: null, use_up: false}
- {name: たこ, qty: 150, unit: g, grams: 150, pantry: たこ, for: たこの炊き込みご飯, substitute: null, use_up: true}
- {name: にんじん, qty: 0.33, unit: 本, grams: 50, pantry: にんじん, for: たこの炊き込みご飯, substitute: null, use_up: false}
- {name: 醤油, qty: 2, unit: 小さじ, grams: 12, pantry: 醤油, for: たこの炊き込みご飯, substitute: null, use_up: false}
- {name: 酒, qty: 1, unit: 大さじ, grams: 15, pantry: 酒, for: たこの炊き込みご飯, substitute: null, use_up: false}
- {name: みりん, qty: 1, unit: 大さじ, grams: 18, pantry: みりん, for: たこの炊き込みご飯, substitute: null, use_up: false}
- {name: だしパック, qty: 1, unit: 袋, grams: null, pantry: だしパック, for: たこの炊き込みご飯, substitute: null, use_up: false}
tags: [炊き込みご飯, 炊飯器, たこ, チョッパー, にんじん]
salt: {total_g: 2.0, adult_per_serving_g: 0.8, kid_g: 0.3}
kid: {rule: shared, cut: たこは取り除き、ご飯とにんじんだけを小さいおにぎりにする, note: たこは弾力があり 1-2 歳は窒息のおそれがあるので出さない。茶碗 1/3 杯で塩分 約 0.3g。冷ましてから}
keep: {fridge_days: 1, freezer: true, reheat: 1 杯分ずつラップで包んで冷凍。600W 2 分、途中で混ぜ、湯気が立つまで}
timeline:
- {minute: 0, lane: hands, text: 米 2 合を研いで内釜へ}
- {minute: 3, lane: hands, text: にんじんをチョッパーで刻む、たこを切る}
- {minute: 7, lane: hands, text: 調味料と水を入れ、具とだしパックをのせて炊飯開始}
- {minute: 8, lane: hands, text: 炊飯（通常 60 分）}
- {minute: 68, lane: hands, text: だしパックを出して混ぜ、10 分蒸らす}
- {minute: 78, lane: hands, text: 子どもの分を取り分けて盛り付け}
steps:
- dish: たこの炊き込みご飯
  n: 1
  title: 米を研ぐ
  kind: prep
  tag: rice
  minutes: 3
  start: 0
  heat: null
  text: 米 2 合を研いで水けを切り、炊飯器の内釜に入れる。
  cue: 研ぎ汁がうっすら白い程度に澄む
  caution: null
  timer: null
  kid: null
  ingredients: [米]
- dish: たこの炊き込みご飯
  n: 2
  title: 具を刻む
  kind: prep
  tag: cut
  minutes: 4
  start: 3
  heat: null
  text: にんじん 1/3 本を大きめに切ってぶんぶんチョッパーで米粒くらいに刻む。たこ 150g は包丁で 1cm 角に切る。
  cue: にんじんが米粒大にそろっている
  caution: null
  timer: null
  kid: にんじんは細かいほど全体に甘さが回り、子どもが食べやすい
  ingredients: [にんじん, たこ]
- dish: たこの炊き込みご飯
  n: 3
  title: 炊飯器に仕掛ける
  kind: prep
  tag: rice
  minutes: 1
  start: 7
  heat: null
  text: 醤油 小さじ 2・酒 大さじ 1・みりん 大さじ 1 を内釜に入れ、2 合の目盛りまで水を足して軽く混ぜる。にんじんとたこを平らにのせ、だしパック 1 袋を上に置いて通常炊飯を始める。
  cue: 具が米の上に平らにのり、混ぜていない
  caution: 調味料を入れてから目盛りまで水を足す（先に水を入れると水っぽくなる）。具は混ぜずにのせる
  timer: null
  kid: null
  ingredients: [醤油, 酒, みりん, にんじん, たこ, だしパック]
- dish: たこの炊き込みご飯
  n: 4
  title: 炊く
  kind: wait
  tag: rice
  minutes: 60
  start: 8
  heat: {equipment: rice-cooker, level: 通常炊飯}
  text: 通常炊飯で 60 分。この間に主菜を進める。
  cue: 炊き上がりの音が鳴り、だしの香りがする
  caution: null
  timer: 3600
  kid: null
  ingredients: []
- dish: たこの炊き込みご飯
  n: 5
  title: 混ぜて蒸らす
  kind: prep
  tag: serve
  minutes: 10
  start: 68
  heat: null
  text: だしパックを取り出し、しゃもじで底から大きく混ぜて、蓋をして 10 分蒸らす。
  cue: たこが赤紫色で、ご飯に薄い醤油色が均一
  caution: null
  timer: 600
  kid: null
  ingredients: []
- dish: たこの炊き込みご飯
  n: 6
  title: 盛り付け
  kind: serve
  tag: serve
  minutes: 3
  start: 78
  heat: null
  text: 子どもの分は、たこを取り除いてご飯とにんじんだけを小さいおにぎり 2 つにする。大人は茶碗に盛る。
  cue: 子どもの器にたこが残っていない
  caution: null
  timer: null
  kid: たこは除く。おにぎりは手づかみしやすい大きさにして、冷ましてから出す
  ingredients: []
cleanup:
  dishwasher: [bowl-m]
  hand: [rice-cooker]
  note: チョッパーは刃を外して手洗い。内釜は水につけておくとこびりつきが取れる
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261125-butakata-rosu-niku-to-jagaimo-no-german-]
---

一緒に作る: `r-20261125-butakata-rosu-niku-to-jagaimo-no-german-`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（84 分）

| 分 | 手 |
|---|---|
| 0 | 米 2 合を研いで内釜へ |
| 3 | にんじんをチョッパーで刻む、たこを切る |
| 7 | 調味料と水を入れ、具とだしパックをのせて炊飯開始 |
| 8 | 炊飯（通常 60 分） |
| 68 | だしパックを出して混ぜ、10 分蒸らす |
| 78 | 子どもの分を取り分けて盛り付け |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| 米 | 2 合（300g） | たこの炊き込みご飯 | 米 |
| たこ | 150 g | たこの炊き込みご飯 使い切り | たこ |
| にんじん | 0.33 本（50g） | たこの炊き込みご飯 | にんじん |
| 醤油 | 2 小さじ（12g） | たこの炊き込みご飯 | 醤油 |
| 酒 | 1 大さじ（15g） | たこの炊き込みご飯 | 酒 |
| みりん | 1 大さじ（18g） | たこの炊き込みご飯 | みりん |
| だしパック | 1 袋 | たこの炊き込みご飯 | だしパック |

塩分: 合計 2.0g ・ 大人 1 人分 0.8g ・ 子ども 0.3g

## 手順

### たこの炊き込みご飯
1. **米を研ぐ（3 分 / prep）** 米 2 合を研いで水けを切り、炊飯器の内釜に入れる。
   - 材料: 米 2 合（300g）
   - 目安: 研ぎ汁がうっすら白い程度に澄む
2. **具を刻む（4 分 / prep）** にんじん 1/3 本を大きめに切ってぶんぶんチョッパーで米粒くらいに刻む。たこ 150g は包丁で 1cm 角に切る。
   - 材料: にんじん 1/3 本（50g）・たこ 150 g
   - 目安: にんじんが米粒大にそろっている
   - 🍼 にんじんは細かいほど全体に甘さが回り、子どもが食べやすい
3. **炊飯器に仕掛ける（1 分 / prep）** 醤油 小さじ 2・酒 大さじ 1・みりん 大さじ 1 を内釜に入れ、2 合の目盛りまで水を足して軽く混ぜる。にんじんとたこを平らにのせ、だしパック 1 袋を上に置いて通常炊飯を始める。
   - 材料: 醤油 小さじ 2（12g）・酒 大さじ 1（15g）・みりん 大さじ 1（18g）・にんじん 1/3 本（50g）・たこ 150 g・だしパック 1 袋
   - 目安: 具が米の上に平らにのり、混ぜていない
   - ⚠ 調味料を入れてから目盛りまで水を足す（先に水を入れると水っぽくなる）。具は混ぜずにのせる
4. **炊く（60 分 / wait）** 炊飯器・通常炊飯 通常炊飯で 60 分。この間に主菜を進める。
   - 目安: 炊き上がりの音が鳴り、だしの香りがする
   - ⏱ 60 分
5. **混ぜて蒸らす（10 分 / prep）** だしパックを取り出し、しゃもじで底から大きく混ぜて、蓋をして 10 分蒸らす。
   - 目安: たこが赤紫色で、ご飯に薄い醤油色が均一
   - ⏱ 10 分
6. **盛り付け（3 分 / serve）** 子どもの分は、たこを取り除いてご飯とにんじんだけを小さいおにぎり 2 つにする。大人は茶碗に盛る。
   - 目安: 子どもの器にたこが残っていない
   - 🍼 たこは除く。おにぎりは手づかみしやすい大きさにして、冷ましてから出す

## 子どもの分

- 取り分け: shared ・ 大きさ: たこは取り除き、ご飯とにんじんだけを小さいおにぎりにする
- たこは弾力があり 1-2 歳は窒息のおそれがあるので出さない。茶碗 1/3 杯で塩分 約 0.3g。冷ましてから

## 保存・翌日

- 冷蔵 1 日 ・ 冷凍 可
- 温め直し: 1 杯分ずつラップで包んで冷凍。600W 2 分、途中で混ぜ、湯気が立つまで

## 片付け

- 食洗機: ボウル（中）
- 手洗い: 炊飯器
- チョッパーは刃を外して手洗い。内釜は水につけておくとこびりつきが取れる

## 作ったときのメモ

