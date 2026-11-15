---
id: r-20261115-sasami-to-ninjin-no-hosogiri-namul
title: ささみとにんじんの細切りナムル
version: 1
supersedes: null
status: draft
created: '2026-11-15'
request: req-20261115-1848-hbmx
generated_by: {model: claude-code, prompt_version: 10}
type: prep
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 186, active: 20, raw_estimate: 128, speed_factor: 1.23}
image_text: オレンジのにんじんの細切りに、ほぐした白いささみが絡む。白ごまとごま油のつやが見える。
dishes:
- {name: ささみとにんじんの細切りナムル, role: side}
equipment: [sous-vide, gas-r, fp26, bowl-m]
ingredients:
- {name: ささみ, qty: 2, unit: 本, grams: 100, pantry: ささみ, for: ささみとにんじんの細切りナムル, substitute: null, use_up: true}
- {name: 酒, qty: 1, unit: 小さじ, grams: 5, pantry: 酒, for: ささみとにんじんの細切りナムル, substitute: null, use_up: false}
- {name: にんじん, qty: 1, unit: 本, grams: 150, pantry: にんじん, for: ささみとにんじんの細切りナムル, substitute: null, use_up: false}
- {name: ごま油, qty: 1, unit: 小さじ, grams: 4, pantry: ごま油, for: ささみとにんじんの細切りナムル, substitute: null, use_up: false}
- {name: 醤油, qty: 1, unit: 小さじ, grams: 6, pantry: 醤油, for: ささみとにんじんの細切りナムル, substitute: null, use_up: false}
- {name: 酢, qty: 1, unit: 小さじ, grams: 5, pantry: 酢, for: ささみとにんじんの細切りナムル, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 小さじ, grams: 3, pantry: 白ごま, for: ささみとにんじんの細切りナムル, substitute: null, use_up: false}
tags: [prep, sous-vide, 低温調理, ささみ, スライサー, 子ども取り分け, light]
salt: {total_g: 0.9, adult_per_serving_g: 0.45, kid_g: 0.0}
kid: {rule: separate, cut: にんじんを 2cm 長さに切る, note: 子どもには味付け前のにんじんだけを取り分ける（低温調理のささみは使わない）。炒めてしんなりさせた物を冷まして出す。}
keep: {fridge_days: 2, freezer: false, reheat: 冷たいまま食べる。水気が出たら軽く切る。}
timeline:
- {minute: 0, lane: hands, text: ささみ 2 本の筋を取り、酒をもみ込んで袋へ}
- {minute: 15, lane: sous-vide, text: 主菜と一緒に 63℃ で 1 時間 30 分}
- {minute: 30, lane: hands, text: にんじんをスライサーで細切り}
- {minute: 36, lane: gas-r, text: ごま油でにんじんを炒める}
- {minute: 40, lane: hands, text: 子どもの分を取り分け、残りを冷ます}
- {minute: 120, lane: hands, text: ささみをほぐして和え、冷蔵}
- {minute: 126, lane: hands, text: （翌日）盛り付け}
steps:
- dish: ささみとにんじんの細切りナムル
  n: 1
  title: ささみの下ごしらえ
  kind: prep
  tag: marinate
  minutes: 3
  start: 0
  heat: null
  text: ささみ 2 本の筋を取り、酒 小さじ 1 をもみ込んで主菜とは別の耐熱袋に入れる。主菜と同じ湯（63℃）に 15 分から 1 時間 30 分沈める。
  cue: 中心まで白く、切ると透明な汁がにじむ（取り出したとき）
  caution: 塩はしない。味付けは和えるときに
  timer: 5400
  kid: null
  ingredients: [ささみ, 酒]
- dish: ささみとにんじんの細切りナムル
  n: 2
  title: にんじんを細切り
  kind: prep
  tag: cut
  minutes: 6
  start: 30
  heat: null
  text: にんじん 1 本の皮をピーラーでむき、スライサー 1.2mm 細切りで細切りにする。最後の 2cm は包丁で細く切る。
  cue: 1.2mm の細い線がそろい、長さ 5cm ほど
  caution: 指を守るため最後の 2cm はスライサーを使わない
  timer: null
  kid: null
  ingredients: [にんじん]
- dish: ささみとにんじんの細切りナムル
  n: 3
  title: にんじんを炒める
  kind: heat
  tag: stir-fry
  minutes: 4
  start: 36
  heat: {equipment: gas-r, level: 中火}
  text: フライパン（fp26）を中火で 1 分予熱し、ごま油 小さじ 1 を入れてにんじんを 3 分炒める（レンジだと固く残るのでフライパンで）。
  cue: 全体がしんなりし、鮮やかなオレンジになって甘い匂いが立つ
  caution: null
  timer: null
  kid: ここで味付け前に大さじ 2 を取り分け、2cm 長さに切って冷ます
  ingredients: [ごま油]
- dish: ささみとにんじんの細切りナムル
  n: 4
  title: 和えて保存
  kind: prep
  tag: season
  minutes: 5
  start: 120
  heat: null
  text: 冷めたにんじんをボウル（中）に入れ、低温調理したささみ 2 本を手で細くほぐして加える。醤油 小さじ 1・酢 小さじ 1・白ごま 小さじ 1 で和え、保存容器に入れて冷蔵する。
  cue: ささみがにんじんに絡み、底に汁がほとんどたまらない
  caution: null
  timer: null
  kid: null
  ingredients: [醤油, 酢, 白ごま]
- dish: ささみとにんじんの細切りナムル
  n: 5
  title: 当日の仕上げ
  kind: serve
  tag: serve
  minutes: 2
  start: 126
  heat: null
  text: 食べる直前に軽く混ぜて小鉢に盛る。
  cue: にんじんにつやがあり、ごまの香りがする
  caution: null
  timer: null
  kid: 取り分けたにんじんを冷たすぎない温度で出す
  ingredients: []
cleanup:
  dishwasher: [bowl-m]
  hand: [fp26]
  note: スライサーの刃は手で洗う。フライパンはにんじんを炒めた後すぐ洗う（待ち時間中に）。
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261115-sasami-no-teion-chori-goma-miso-yogurt-d]
---

一緒に作る: `r-20261115-sasami-no-teion-chori-goma-miso-yogurt-d`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（186 分）

| 分 | ガスコンロ右 | 低温調理器 | 手 |
|---|---|---|---|
| 0 |  |  | ささみ 2 本の筋を取り、酒をもみ込んで袋へ |
| 15 |  | 主菜と一緒に 63℃ で 1 時間 30 分 |  |
| 30 |  |  | にんじんをスライサーで細切り |
| 36 | ごま油でにんじんを炒める |  |  |
| 40 |  |  | 子どもの分を取り分け、残りを冷ます |
| 120 |  |  | ささみをほぐして和え、冷蔵 |
| 126 |  |  | （翌日）盛り付け |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| ささみ | 2 本（100g） | ささみとにんじんの細切りナムル 使い切り | ささみ |
| 酒 | 1 小さじ（5g） | ささみとにんじんの細切りナムル | 酒 |
| にんじん | 1 本（150g） | ささみとにんじんの細切りナムル | にんじん |
| ごま油 | 1 小さじ（4g） | ささみとにんじんの細切りナムル | ごま油 |
| 醤油 | 1 小さじ（6g） | ささみとにんじんの細切りナムル | 醤油 |
| 酢 | 1 小さじ（5g） | ささみとにんじんの細切りナムル | 酢 |
| 白ごま | 1 小さじ（3g） | ささみとにんじんの細切りナムル | 白ごま |

塩分: 合計 0.9g ・ 大人 1 人分 0.45g ・ 子ども 0.0g

## 手順

### ささみとにんじんの細切りナムル
1. **ささみの下ごしらえ（3 分 / prep）** ささみ 2 本の筋を取り、酒 小さじ 1 をもみ込んで主菜とは別の耐熱袋に入れる。主菜と同じ湯（63℃）に 15 分から 1 時間 30 分沈める。
   - 材料: ささみ 2 本（100g）・酒 小さじ 1（5g）
   - 目安: 中心まで白く、切ると透明な汁がにじむ（取り出したとき）
   - ⏱ 90 分
   - ⚠ 塩はしない。味付けは和えるときに
2. **にんじんを細切り（6 分 / prep）** にんじん 1 本の皮をピーラーでむき、スライサー 1.2mm 細切りで細切りにする。最後の 2cm は包丁で細く切る。
   - 材料: にんじん 1 本（150g）
   - 目安: 1.2mm の細い線がそろい、長さ 5cm ほど
   - ⚠ 指を守るため最後の 2cm はスライサーを使わない
3. **にんじんを炒める（4 分 / heat）** ガスコンロ右・中火 フライパン（fp26）を中火で 1 分予熱し、ごま油 小さじ 1 を入れてにんじんを 3 分炒める（レンジだと固く残るのでフライパンで）。
   - 材料: ごま油 小さじ 1（4g）
   - 目安: 全体がしんなりし、鮮やかなオレンジになって甘い匂いが立つ
   - 🍼 ここで味付け前に大さじ 2 を取り分け、2cm 長さに切って冷ます
4. **和えて保存（5 分 / prep）** 冷めたにんじんをボウル（中）に入れ、低温調理したささみ 2 本を手で細くほぐして加える。醤油 小さじ 1・酢 小さじ 1・白ごま 小さじ 1 で和え、保存容器に入れて冷蔵する。
   - 材料: 醤油 小さじ 1（6g）・酢 小さじ 1（5g）・白ごま 小さじ 1（3g）
   - 目安: ささみがにんじんに絡み、底に汁がほとんどたまらない
5. **当日の仕上げ（2 分 / serve）** 食べる直前に軽く混ぜて小鉢に盛る。
   - 目安: にんじんにつやがあり、ごまの香りがする
   - 🍼 取り分けたにんじんを冷たすぎない温度で出す

## 子どもの分

- 取り分け: separate ・ 大きさ: にんじんを 2cm 長さに切る
- 子どもには味付け前のにんじんだけを取り分ける（低温調理のささみは使わない）。炒めてしんなりさせた物を冷まして出す。

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 不向き
- 温め直し: 冷たいまま食べる。水気が出たら軽く切る。

## 片付け

- 食洗機: ボウル（中）
- 手洗い: フライパン
- スライサーの刃は手で洗う。フライパンはにんじんを炒めた後すぐ洗う（待ち時間中に）。

## 作ったときのメモ

