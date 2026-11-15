---
id: r-20261115-daizu-to-ninjin-no-hosogiri-kinpira
title: 大豆とにんじんの細切りきんぴら
version: 1
supersedes: null
status: draft
created: '2026-11-15'
request: req-20261115-1839-yqsd
generated_by: {model: claude-code, prompt_version: 10}
type: prep
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 15, active: 13, raw_estimate: 13, speed_factor: 1.23}
image_text: 1.2mm の細いにんじんがつやつやのオレンジ色で、ふっくらした大豆と絡む。白ごまが散り、ごま油の照りがある。
dishes:
- {name: 大豆とにんじんの細切りきんぴら, role: side}
equipment: [fp26]
ingredients:
- {name: にんじん, qty: 1, unit: 本, grams: 150, pantry: にんじん, for: 大豆とにんじんの細切りきんぴら, substitute: null, use_up: false}
- {name: 大豆水煮, qty: 0.5, unit: 袋, grams: 75, pantry: 大豆水煮, for: 大豆とにんじんの細切りきんぴら, substitute: null, use_up: false}
- {name: ごま油, qty: 1, unit: 小さじ, grams: 4, pantry: ごま油, for: 大豆とにんじんの細切りきんぴら, substitute: null, use_up: false}
- {name: 水, qty: 2, unit: 大さじ, grams: 30, pantry: null, for: 大豆とにんじんの細切りきんぴら, substitute: null, use_up: false}
- {name: みりん, qty: 1, unit: 小さじ, grams: 6, pantry: みりん, for: 大豆とにんじんの細切りきんぴら, substitute: null, use_up: false}
- {name: 醤油, qty: 1, unit: 小さじ, grams: 6, pantry: 醤油, for: 大豆とにんじんの細切りきんぴら, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 小さじ, grams: 3, pantry: 白ごま, for: 大豆とにんじんの細切りきんぴら, substitute: null, use_up: false}
tags: [副菜, スライサー, 作り置き, 和風, 子ども取り分け]
salt: {total_g: 0.9, adult_per_serving_g: 0.45, kid_g: 0}
kid: {rule: separate, cut: にんじんは 1cm 長さに刻む。大豆はフォークで半分につぶす, note: 醤油を入れる前に取り分ける。大豆は丸いまま出さない}
keep: {fridge_days: 2, freezer: true, reheat: 冷たいままでよい。温めるならレンジ 600W 40 秒、子どもの分は湯気が立つまで}
timeline:
- {minute: 0, lane: hands, text: スライサーでにんじんを細切り、大豆の水気を切る}
- {minute: 4, lane: gas-r, text: ごま油でにんじんを炒め、水を入れて蓋で蒸し焼き}
- {minute: 8, lane: gas-r, text: 大豆を加え、子どもの分を取り分けてから調味}
- {minute: 11, lane: hands, text: 保存容器に移して冷ます}
- {minute: 13, lane: hands, text: 終わり}
steps:
- dish: 大豆とにんじんの細切りきんぴら
  n: 1
  title: にんじんを細切り
  kind: prep
  tag: cut
  minutes: 4
  start: 0
  heat: null
  text: にんじん 1 本の皮をピーラーでむき、スライサー（1.2mm 細切り）で細切りにする。最後の 2cm は包丁で細く切る。大豆水煮 1/2 袋（75g） はザルで水気を切る。
  cue: にんじんが均一な細い糸状になっている
  caution: 指を守るため最後の 2cm はスライサーを使わない
  timer: null
  kid: null
  ingredients: [にんじん, 大豆水煮]
- dish: 大豆とにんじんの細切りきんぴら
  n: 2
  title: 炒めて蒸し焼き
  kind: heat
  tag: stir-fry
  minutes: 4
  start: 4
  heat: {equipment: gas-r, level: 中火}
  text: フライパンを中火で 1 分予熱し、ごま油 小さじ 1 でにんじんを 1 分炒める。水 大さじ 2 を入れて蓋をし、弱火で 2 分蒸し焼きにする。
  cue: にんじんがしんなりして色が鮮やかになり、箸でつまむとくたっと曲がる
  caution: レンジだとにんじんが固く残るので、ここはフライパンで蒸し焼きにする
  timer: 120
  kid: null
  ingredients: [ごま油, 水]
- dish: 大豆とにんじんの細切りきんぴら
  n: 3
  title: 大豆を加えて取り分け・調味
  kind: heat
  tag: season
  minutes: 3
  start: 8
  heat: {equipment: gas-r, level: 中火}
  text: 大豆を加えて 1 分炒め合わせる。子どもの分（大さじ 3 ほど）を先に取り出す。残りにみりん 小さじ 1・醤油 小さじ 1 を入れて汁気が無くなるまで炒め、白ごま 小さじ 1 をふる。
  cue: フライパンの底に汁気が残らず、にんじんにつやが出る
  caution: null
  timer: null
  kid: 味付け前に取り分け、にんじんを 1cm に刻み、大豆はフォークでつぶす。冷ましてから出す
  ingredients: [みりん, 醤油, 白ごま]
- dish: 大豆とにんじんの細切りきんぴら
  n: 4
  title: 保存
  kind: serve
  tag: serve
  minutes: 2
  start: 11
  heat: null
  text: 保存容器に浅く広げて粗熱を取り、30 分以内に冷蔵する。翌日はささみの横に盛るだけ。
  cue: 湯気が落ち着き、容器の底が手で触れるくらいになっている
  caution: null
  timer: null
  kid: 子どもの分は別の容器に
  ingredients: []
cleanup:
  dishwasher: []
  hand: [fp26]
  note: スライサーは刃に気をつけて手洗い
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261115-sasami-teion-chori-tamanegi-su-joyu-dare]
---

一緒に作る: `r-20261115-sasami-teion-chori-tamanegi-su-joyu-dare`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（15 分）

| 分 | ガスコンロ右 | 手 |
|---|---|---|
| 0 |  | スライサーでにんじんを細切り、大豆の水気を切る |
| 4 | ごま油でにんじんを炒め、水を入れて蓋で蒸し焼き |  |
| 8 | 大豆を加え、子どもの分を取り分けてから調味 |  |
| 11 |  | 保存容器に移して冷ます |
| 13 |  | 終わり |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| にんじん | 1 本（150g） | 大豆とにんじんの細切りきんぴら | にんじん |
| 大豆水煮 | 0.5 袋（75g） | 大豆とにんじんの細切りきんぴら | 大豆水煮 |
| ごま油 | 1 小さじ（4g） | 大豆とにんじんの細切りきんぴら | ごま油 |
| 水 | 2 大さじ（30g） | 大豆とにんじんの細切りきんぴら | — |
| みりん | 1 小さじ（6g） | 大豆とにんじんの細切りきんぴら | みりん |
| 醤油 | 1 小さじ（6g） | 大豆とにんじんの細切りきんぴら | 醤油 |
| 白ごま | 1 小さじ（3g） | 大豆とにんじんの細切りきんぴら | 白ごま |

塩分: 合計 0.9g ・ 大人 1 人分 0.45g ・ 子ども 0g

## 手順

### 大豆とにんじんの細切りきんぴら
1. **にんじんを細切り（4 分 / prep）** にんじん 1 本の皮をピーラーでむき、スライサー（1.2mm 細切り）で細切りにする。最後の 2cm は包丁で細く切る。大豆水煮 1/2 袋（75g） はザルで水気を切る。
   - 材料: にんじん 1 本（150g）・大豆水煮 1/2 袋（75g）
   - 目安: にんじんが均一な細い糸状になっている
   - ⚠ 指を守るため最後の 2cm はスライサーを使わない
2. **炒めて蒸し焼き（4 分 / heat）** ガスコンロ右・中火 フライパンを中火で 1 分予熱し、ごま油 小さじ 1 でにんじんを 1 分炒める。水 大さじ 2 を入れて蓋をし、弱火で 2 分蒸し焼きにする。
   - 材料: ごま油 小さじ 1（4g）・水 大さじ 2（30g）
   - 目安: にんじんがしんなりして色が鮮やかになり、箸でつまむとくたっと曲がる
   - ⏱ 2 分
   - ⚠ レンジだとにんじんが固く残るので、ここはフライパンで蒸し焼きにする
3. **大豆を加えて取り分け・調味（3 分 / heat）** ガスコンロ右・中火 大豆を加えて 1 分炒め合わせる。子どもの分（大さじ 3 ほど）を先に取り出す。残りにみりん 小さじ 1・醤油 小さじ 1 を入れて汁気が無くなるまで炒め、白ごま 小さじ 1 をふる。
   - 材料: みりん 小さじ 1（6g）・醤油 小さじ 1（6g）・白ごま 小さじ 1（3g）
   - 目安: フライパンの底に汁気が残らず、にんじんにつやが出る
   - 🍼 味付け前に取り分け、にんじんを 1cm に刻み、大豆はフォークでつぶす。冷ましてから出す
4. **保存（2 分 / serve）** 保存容器に浅く広げて粗熱を取り、30 分以内に冷蔵する。翌日はささみの横に盛るだけ。
   - 目安: 湯気が落ち着き、容器の底が手で触れるくらいになっている
   - 🍼 子どもの分は別の容器に

## 子どもの分

- 取り分け: separate ・ 大きさ: にんじんは 1cm 長さに刻む。大豆はフォークで半分につぶす
- 醤油を入れる前に取り分ける。大豆は丸いまま出さない

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 可
- 温め直し: 冷たいままでよい。温めるならレンジ 600W 40 秒、子どもの分は湯気が立つまで

## 片付け

- 食洗機: —
- 手洗い: フライパン
- スライサーは刃に気をつけて手洗い

## 作ったときのメモ

