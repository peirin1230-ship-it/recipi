---
listed: "2026-11-25T22:56:50+09:00"
id: r-20261125-tako-to-ninjin-no-dashi-takikomi-gohan
title: たことにんじんのだし炊き込みご飯
version: 1
supersedes: null
status: draft
created: '2026-11-25'
request: req-20261125-2221-2wg9
generated_by: {model: claude-code, prompt_version: 11}
type: dinner
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 79, active: 15, raw_estimate: 77, speed_factor: 0.96}
image_text: 薄い醤油色のご飯に、赤紫のたこの角切りとオレンジ色の細かいにんじんが散る。湯気からだしの香りが立ち、白ごまが軽くかかっている。
dishes:
- {name: たことにんじんのだし炊き込みご飯, role: rice}
equipment: [rice-cooker, bowl-l]
ingredients:
- {name: 米, qty: 2, unit: 合, grams: 300, pantry: 米, for: たことにんじんのだし炊き込みご飯, substitute: null, use_up: false}
- {name: たこ, qty: 150, unit: g, grams: 150, pantry: たこ, for: たことにんじんのだし炊き込みご飯, substitute: null, use_up: true}
- {name: にんじん, qty: 0.33, unit: 本, grams: 50, pantry: にんじん, for: たことにんじんのだし炊き込みご飯, substitute: null, use_up: false}
- {name: 醤油, qty: 2, unit: 小さじ, grams: 12, pantry: 醤油, for: たことにんじんのだし炊き込みご飯, substitute: null, use_up: false}
- {name: 酒, qty: 1, unit: 大さじ, grams: 15, pantry: 酒, for: たことにんじんのだし炊き込みご飯, substitute: null, use_up: false}
- {name: みりん, qty: 1, unit: 小さじ, grams: 6, pantry: みりん, for: たことにんじんのだし炊き込みご飯, substitute: null, use_up: false}
- {name: だしパック, qty: 1, unit: 袋, grams: 8, pantry: だしパック, for: たことにんじんのだし炊き込みご飯, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 小さじ, grams: 3, pantry: 白ごま, for: たことにんじんのだし炊き込みご飯, substitute: null, use_up: false}
tags: [炊き込みご飯, 炊飯器, たこ, チョッパー, 子ども取り分け]
salt: {total_g: 2.0, adult_per_serving_g: 0.8, kid_g: 0.3}
kid: {rule: separate, cut: たこは弾力があり窒息しやすいので子どもの分からは全部取り除く。ご飯とにんじんだけを小さなおにぎりに, note: 炊き上がって混ぜる前に、たこの少ない所からよそい、たこを除く。熱いので冷ましてから出す}
keep: {fridge_days: 1, freezer: true, reheat: 1 膳ずつラップで包んで冷凍。600W で 1 膳 2 分、湯気が立つまで。たこは温め直すと固くなりやすいので早めに食べる}
timeline:
- {minute: 0, lane: hands, text: 米を研いでザルに上げる}
- {minute: 5, lane: hands, text: にんじんをぶんぶんチョッパーで米粒大に、たこを 1cm 角に切る}
- {minute: 10, lane: hands, text: 調味料と水を入れ、具とだしパックをのせて通常炊飯（60 分）}
- {minute: 12, lane: hands, text: 炊飯中は主菜の下ごしらえと焼きへ}
- {minute: 72, lane: hands, text: 炊き上がり。だしパックを出し、子どもの分を取ってから混ぜる}
- {minute: 75, lane: hands, text: 盛り付け・配膳}
- {minute: 77, lane: hands, text: できあがり}
steps:
- dish: たことにんじんのだし炊き込みご飯
  n: 1
  title: 米を研ぐ
  kind: prep
  tag: rice
  minutes: 5
  start: 0
  heat: null
  text: 米 2 合をボウル（大）で 3 回研ぎ、ザルに上げて水けを切る。
  cue: 研ぎ汁がうっすら白く、底の米が透けて見える
  caution: null
  timer: null
  kid: null
  ingredients: [米]
- dish: たことにんじんのだし炊き込みご飯
  n: 2
  title: 具を刻む
  kind: prep
  tag: cut
  minutes: 5
  start: 5
  heat: null
  text: にんじん 1/3 本は皮をむいて 3cm に切り、ぶんぶんチョッパーで 20 秒、米粒くらいに刻む。たこ 150g は 1cm 角に切る。
  cue: にんじんが米粒大にそろい、たこの角切りの大きさがそろっている
  caution: null
  timer: null
  kid: にんじんは米粒大なのでそのまま食べられる
  ingredients: [にんじん, たこ]
- dish: たことにんじんのだし炊き込みご飯
  n: 3
  title: 仕掛けて炊く
  kind: wait
  tag: rice
  minutes: 62
  start: 10
  heat: {equipment: rice-cooker, level: 通常炊飯}
  text: 内釜に米を入れ、醤油 小さじ 2・酒 大さじ 1・みりん 小さじ 1 を入れてから 2 合の目盛りまで水を足し、ひと混ぜする。にんじんを広げ、たことだしパック 1 袋を上にのせて（混ぜない）通常炊飯（60 分）。炊いている間に主菜を作る。
  cue: 炊き上がりの合図が鳴り、蓋を開けると表面に小さな穴があいて、だしと醤油の香りが立つ
  caution: 調味料を先に入れてから目盛りまで水を足す。後から入れると水が多くなりべちゃつく
  timer: 3600
  kid: null
  ingredients: [米, 醤油, 酒, みりん, にんじん, たこ, だしパック]
- dish: たことにんじんのだし炊き込みご飯
  n: 4
  title: 子どもの分を取ってから混ぜる
  kind: prep
  tag: kid
  minutes: 3
  start: 72
  heat: null
  text: だしパックを取り出す。混ぜる前に、たこの少ない所から子どもの分を茶碗に取り、たこを全部取り除いて小さなおにぎりにする。残りを底から切るように混ぜる。
  cue: ご飯全体が薄い醤油色にそろい、たこが全体に散っている。子どもの分にたこが残っていない
  caution: 子どもの分のたこは小さくても弾力があるので必ず除く
  timer: null
  kid: たこを除いた小さなおにぎりに。冷ましてから出す
  ingredients: []
- dish: たことにんじんのだし炊き込みご飯
  n: 5
  title: 盛り付け
  kind: serve
  tag: serve
  minutes: 2
  start: 75
  heat: null
  text: 大人の分を茶碗に盛り、白ごま 小さじ 1 を指でひねってふる。
  cue: ごまの香りが立ち、たことにんじんの色が表面に見える
  caution: null
  timer: null
  kid: null
  ingredients: [白ごま]
cleanup:
  dishwasher: [bowl-l]
  hand: [rice-cooker]
  note: 内釜は醤油が残るのでぬるま湯につけてから洗う。ザルとぶんぶんチョッパーの容器・刃も手洗い
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261125-butakata-rosu-no-saute-chopper-tamanegi-]
---

一緒に作る: `r-20261125-butakata-rosu-no-saute-chopper-tamanegi-`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（79 分）

| 分 | 手 |
|---|---|
| 0 | 米を研いでザルに上げる |
| 5 | にんじんをぶんぶんチョッパーで米粒大に、たこを 1cm 角に切る |
| 10 | 調味料と水を入れ、具とだしパックをのせて通常炊飯（60 分） |
| 12 | 炊飯中は主菜の下ごしらえと焼きへ |
| 72 | 炊き上がり。だしパックを出し、子どもの分を取ってから混ぜる |
| 75 | 盛り付け・配膳 |
| 77 | できあがり |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| 米 | 2 合（300g） | たことにんじんのだし炊き込みご飯 | 米 |
| たこ | 150 g | たことにんじんのだし炊き込みご飯 使い切り | たこ |
| にんじん | 0.33 本（50g） | たことにんじんのだし炊き込みご飯 | にんじん |
| 醤油 | 2 小さじ（12g） | たことにんじんのだし炊き込みご飯 | 醤油 |
| 酒 | 1 大さじ（15g） | たことにんじんのだし炊き込みご飯 | 酒 |
| みりん | 1 小さじ（6g） | たことにんじんのだし炊き込みご飯 | みりん |
| だしパック | 1 袋（8g） | たことにんじんのだし炊き込みご飯 | だしパック |
| 白ごま | 1 小さじ（3g） | たことにんじんのだし炊き込みご飯 | 白ごま |

塩分: 合計 2.0g ・ 大人 1 人分 0.8g ・ 子ども 0.3g

## 手順

### たことにんじんのだし炊き込みご飯
1. **米を研ぐ（5 分 / prep）** 米 2 合をボウル（大）で 3 回研ぎ、ザルに上げて水けを切る。
   - 材料: 米 2 合（300g）
   - 目安: 研ぎ汁がうっすら白く、底の米が透けて見える
2. **具を刻む（5 分 / prep）** にんじん 1/3 本は皮をむいて 3cm に切り、ぶんぶんチョッパーで 20 秒、米粒くらいに刻む。たこ 150g は 1cm 角に切る。
   - 材料: にんじん 1/3 本（50g）・たこ 150 g
   - 目安: にんじんが米粒大にそろい、たこの角切りの大きさがそろっている
   - 🍼 にんじんは米粒大なのでそのまま食べられる
3. **仕掛けて炊く（62 分 / wait）** 炊飯器・通常炊飯 内釜に米を入れ、醤油 小さじ 2・酒 大さじ 1・みりん 小さじ 1 を入れてから 2 合の目盛りまで水を足し、ひと混ぜする。にんじんを広げ、たことだしパック 1 袋を上にのせて（混ぜない）通常炊飯（60 分）。炊いている間に主菜を作る。
   - 材料: 米 2 合（300g）・醤油 小さじ 2（12g）・酒 大さじ 1（15g）・みりん 小さじ 1（6g）・にんじん 1/3 本（50g）・たこ 150 g・だしパック 1 袋（8g）
   - 目安: 炊き上がりの合図が鳴り、蓋を開けると表面に小さな穴があいて、だしと醤油の香りが立つ
   - ⏱ 60 分
   - ⚠ 調味料を先に入れてから目盛りまで水を足す。後から入れると水が多くなりべちゃつく
4. **子どもの分を取ってから混ぜる（3 分 / prep）** だしパックを取り出す。混ぜる前に、たこの少ない所から子どもの分を茶碗に取り、たこを全部取り除いて小さなおにぎりにする。残りを底から切るように混ぜる。
   - 目安: ご飯全体が薄い醤油色にそろい、たこが全体に散っている。子どもの分にたこが残っていない
   - ⚠ 子どもの分のたこは小さくても弾力があるので必ず除く
   - 🍼 たこを除いた小さなおにぎりに。冷ましてから出す
5. **盛り付け（2 分 / serve）** 大人の分を茶碗に盛り、白ごま 小さじ 1 を指でひねってふる。
   - 材料: 白ごま 小さじ 1（3g）
   - 目安: ごまの香りが立ち、たことにんじんの色が表面に見える

## 子どもの分

- 取り分け: separate ・ 大きさ: たこは弾力があり窒息しやすいので子どもの分からは全部取り除く。ご飯とにんじんだけを小さなおにぎりに
- 炊き上がって混ぜる前に、たこの少ない所からよそい、たこを除く。熱いので冷ましてから出す

## 保存・翌日

- 冷蔵 1 日 ・ 冷凍 可
- 温め直し: 1 膳ずつラップで包んで冷凍。600W で 1 膳 2 分、湯気が立つまで。たこは温め直すと固くなりやすいので早めに食べる

## 片付け

- 食洗機: ボウル（大）
- 手洗い: 炊飯器
- 内釜は醤油が残るのでぬるま湯につけてから洗う。ザルとぶんぶんチョッパーの容器・刃も手洗い

## 作ったときのメモ

