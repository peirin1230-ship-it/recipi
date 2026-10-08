---
id: r-20261008-torimomo-teriyaki
title: 鶏もも肉の照り焼きと小松菜のおひたし
version: 1
supersedes: null
status: draft
created: '2026-10-08'
request: null
generated_by: {model: manual, prompt_version: 0}
type: dinner
servings: {adults: 2, kids: 1}
time: {budget: 25, planned: 18, active: 14, raw_estimate: 18, speed_factor: 1.0}
image_text: 照りのある濃い茶色の鶏肉に白ごまが散る。横に濃い緑の小松菜、上にかつお節。
dishes:
- {name: 鶏もも肉の照り焼き, role: main}
- {name: 小松菜のおひたし, role: side}
equipment: [gas-r, fp26, microwave, bowl-l]
ingredients:
- {name: 鶏もも肉, qty: 300, unit: g, grams: 300, pantry: 鶏もも肉, for: 鶏もも肉の照り焼き, substitute: null, use_up: false}
- {name: 片栗粉, qty: 1, unit: 小さじ, grams: 3, pantry: 片栗粉, for: 鶏もも肉の照り焼き, substitute: null, use_up: false}
- {name: サラダ油, qty: 1, unit: 小さじ, grams: 4, pantry: サラダ油, for: 鶏もも肉の照り焼き, substitute: null, use_up: false}
- {name: 醤油, qty: 1.5, unit: 大さじ, grams: 27, pantry: 醤油, for: 鶏もも肉の照り焼き, substitute: null, use_up: false}
- {name: みりん, qty: 1.5, unit: 大さじ, grams: 27, pantry: みりん, for: 鶏もも肉の照り焼き, substitute: null, use_up: false}
- {name: 酒, qty: 1, unit: 大さじ, grams: 15, pantry: 酒, for: 鶏もも肉の照り焼き, substitute: 水, use_up: false}
- {name: 砂糖, qty: 1, unit: 小さじ, grams: 3, pantry: 砂糖, for: 鶏もも肉の照り焼き, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 小さじ, grams: 2, pantry: 白ごま, for: 鶏もも肉の照り焼き, substitute: null, use_up: false}
- {name: 小松菜, qty: 1, unit: 束, grams: 200, pantry: 小松菜, for: 小松菜のおひたし, substitute: null, use_up: true}
- {name: めんつゆ, qty: 1, unit: 大さじ, grams: 18, pantry: めんつゆ, for: 小松菜のおひたし, substitute: null, use_up: false}
- {name: かつお節, qty: 2, unit: g, grams: 2, pantry: かつお節, for: 小松菜のおひたし, substitute: null, use_up: false}
- {name: 水, qty: 2, unit: 大さじ, grams: 30, pantry: null, for: 小松菜のおひたし, substitute: null, use_up: false}
tags: [和, 主菜, 副菜, 子ども向け, 使い切り, 鶏もも肉, 照り焼き, おひたし, フライパン1つ]
salt: {total_g: 5.4, adult_per_serving_g: 2.0, kid_g: 0.3}
kid: {rule: separate, cut: 1cm 角, note: タレを絡める前に 60g を取り出す。皮は外す。小松菜は葉先だけを 5mm に刻み、めんつゆは小さじ 1/4 だけ}
keep: {fridge_days: 2, freezer: true, reheat: レンジ 600W 1 分 30 秒。水 小さじ 1 を足す}
timeline:
- {minute: 0, lane: hands, text: 鶏ももを一口大（3cm 角）に切り、片栗粉 小さじ 1 をまぶす}
- {minute: 3, lane: gas-r, text: フライパンに油 小さじ 1、皮目を下に並べて中火}
- {minute: 4, lane: hands, text: 小松菜を 4cm に切って耐熱ボウルへ。タレを合わせる}
- {minute: 6, lane: microwave, text: 小松菜にふんわりラップ、600W 2 分}
- {minute: 7, lane: gas-r, text: 返して 3 分。子どもの分 60g を取り出す}
- {minute: 8, lane: hands, text: 小松菜を水で冷まして絞る。めんつゆと水を回しかける}
- {minute: 10, lane: gas-r, text: 弱火にしてタレを入れ、煮絡める}
- {minute: 12, lane: hands, text: 子どもの分を 1cm 角に。小松菜の葉先を刻む}
- {minute: 14, lane: gas-r, text: 火を止める}
- {minute: 15, lane: hands, text: 盛り付け。鶏に白ごま、小松菜にかつお節}
- {minute: 18, lane: hands, text: 配膳。子どもの分は冷ましておく}
steps:
- {dish: 鶏もも肉の照り焼き, n: 1, title: 切る, kind: prep, tag: cut, minutes: 3, heat: null, text: 一口大（3cm 角）に切る。厚い所は包丁を寝かせて開く。ボウルで片栗粉
    小さじ 1 を全体に薄くまぶす。, cue: 全体がうっすら白くなる程度, caution: null, timer: null, kid: null}
- dish: 鶏もも肉の照り焼き
  n: 2
  title: 焼く
  kind: wait
  tag: sear
  minutes: 6
  heat: {equipment: gas-r, level: 中火}
  text: フライパンに油 小さじ 1。皮目を下に、重ならないように並べて 3 分触らない。返して 3 分。
  cue: 縁が白くなり、皮がきつね色。油のはねる音が小さくなる
  caution: 強火にしない。右のコンロは火が強いので中火で十分
  timer: 180
  kid: 返して 3 分たったら子どもの分 60g を取り出す
- dish: 鶏もも肉の照り焼き
  n: 3
  title: タレ
  kind: heat
  tag: season
  minutes: 3
  heat: {equipment: gas-r, level: 弱火}
  text: 弱火に落としてから、合わせたタレ（醤油・みりん・酒・砂糖）を入れ、煮絡める。
  cue: 泡が大きくなり、箸で底に線が引ける。黒ずんだら火を止める
  caution: タレは必ず火を落としてから。糖分が焦げる
  timer: null
  kid: null
- {dish: 鶏もも肉の照り焼き, n: 4, title: 盛る, kind: serve, tag: serve, minutes: 2, heat: null, text: 器に盛り、白ごまを振る。, cue: 照りが全体に回っている,
  caution: null, timer: null, kid: 子どもの分は皮を外して 1cm 角。タレは付けない}
- {dish: 小松菜のおひたし, n: 1, title: 切る, kind: prep, tag: cut, minutes: 2, heat: null, text: 根元を落として 4cm に切り、耐熱ボウルに入れる。, cue: 茎と葉が同じ長さにそろう,
  caution: null, timer: null, kid: null}
- {dish: 小松菜のおひたし, n: 2, title: レンジ, kind: wait, tag: microwave, minutes: 2, heat: null, text: ふんわりラップをして 600W 2 分。, cue: 色が濃くなり、茎が曲がる,
  caution: null, timer: 120, kid: null}
- {dish: 小松菜のおひたし, n: 3, title: 冷ます・和える, kind: prep, tag: season, minutes: 2, heat: null, text: 水で冷まして固く絞る。めんつゆ 大さじ 1 と水 大さじ
    2 を回しかけ、かつお節をのせる。, cue: 水気が出ない程度に絞れている, caution: null, timer: null, kid: 葉先だけを 5mm に刻み、めんつゆは小さじ 1/4}
cleanup:
  dishwasher: [bowl-l]
  hand: [fp26]
  note: フライパンは火を止めたらすぐ湯を張る。タレが固まる前に
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
---

## 段取り表（18 分）

| 分 | ガスコンロ右（強火力） | レンジ | 手 |
|---|---|---|---|
| 0 |  |  | 鶏ももを一口大（3cm 角）に切り、片栗粉 小さじ 1 をまぶす |
| 3 | フライパンに油 小さじ 1、皮目を下に並べて中火 |  |  |
| 4 |  |  | 小松菜を 4cm に切って耐熱ボウルへ。タレを合わせる |
| 6 |  | 小松菜にふんわりラップ、600W 2 分 |  |
| 7 | 返して 3 分。子どもの分 60g を取り出す |  |  |
| 8 |  |  | 小松菜を水で冷まして絞る。めんつゆと水を回しかける |
| 10 | 弱火にしてタレを入れ、煮絡める |  |  |
| 12 |  |  | 子どもの分を 1cm 角に。小松菜の葉先を刻む |
| 14 | 火を止める |  |  |
| 15 |  |  | 盛り付け。鶏に白ごま、小松菜にかつお節 |
| 18 |  |  | 配膳。子どもの分は冷ましておく |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| 鶏もも肉 | 300 g | 鶏もも肉の照り焼き | 鶏もも肉 |
| 片栗粉 | 1 小さじ（3g） | 鶏もも肉の照り焼き | 片栗粉 |
| サラダ油 | 1 小さじ（4g） | 鶏もも肉の照り焼き | サラダ油 |
| 醤油 | 1.5 大さじ（27g） | 鶏もも肉の照り焼き | 醤油 |
| みりん | 1.5 大さじ（27g） | 鶏もも肉の照り焼き | みりん |
| 酒 | 1 大さじ（15g） | 鶏もも肉の照り焼き 代替: 水 | 酒 |
| 砂糖 | 1 小さじ（3g） | 鶏もも肉の照り焼き | 砂糖 |
| 白ごま | 1 小さじ（2g） | 鶏もも肉の照り焼き | 白ごま |
| 小松菜 | 1 束（200g） | 小松菜のおひたし 使い切り | 小松菜 |
| めんつゆ | 1 大さじ（18g） | 小松菜のおひたし | めんつゆ |
| かつお節 | 2 g | 小松菜のおひたし | かつお節 |
| 水 | 2 大さじ（30g） | 小松菜のおひたし | — |

塩分: 合計 5.4g ・ 大人 1 人分 2.0g ・ 子ども 0.3g

## 手順

### 鶏もも肉の照り焼き
1. **切る（3 分 / prep）** 一口大（3cm 角）に切る。厚い所は包丁を寝かせて開く。ボウルで片栗粉 小さじ 1 を全体に薄くまぶす。
   - 目安: 全体がうっすら白くなる程度
2. **焼く（6 分 / wait）** ガスコンロ右（強火力）・中火 フライパンに油 小さじ 1。皮目を下に、重ならないように並べて 3 分触らない。返して 3 分。
   - 目安: 縁が白くなり、皮がきつね色。油のはねる音が小さくなる
   - ⏱ 3 分
   - ⚠ 強火にしない。右のコンロは火が強いので中火で十分
   - 🍼 返して 3 分たったら子どもの分 60g を取り出す
3. **タレ（3 分 / heat）** ガスコンロ右（強火力）・弱火 弱火に落としてから、合わせたタレ（醤油・みりん・酒・砂糖）を入れ、煮絡める。
   - 目安: 泡が大きくなり、箸で底に線が引ける。黒ずんだら火を止める
   - ⚠ タレは必ず火を落としてから。糖分が焦げる
4. **盛る（2 分 / serve）** 器に盛り、白ごまを振る。
   - 目安: 照りが全体に回っている
   - 🍼 子どもの分は皮を外して 1cm 角。タレは付けない

### 小松菜のおひたし
1. **切る（2 分 / prep）** 根元を落として 4cm に切り、耐熱ボウルに入れる。
   - 目安: 茎と葉が同じ長さにそろう
2. **レンジ（2 分 / wait）** ふんわりラップをして 600W 2 分。
   - 目安: 色が濃くなり、茎が曲がる
   - ⏱ 2 分
3. **冷ます・和える（2 分 / prep）** 水で冷まして固く絞る。めんつゆ 大さじ 1 と水 大さじ 2 を回しかけ、かつお節をのせる。
   - 目安: 水気が出ない程度に絞れている
   - 🍼 葉先だけを 5mm に刻み、めんつゆは小さじ 1/4

## 子どもの分

- 取り分け: separate ・ 大きさ: 1cm 角
- タレを絡める前に 60g を取り出す。皮は外す。小松菜は葉先だけを 5mm に刻み、めんつゆは小さじ 1/4 だけ

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 可
- 温め直し: レンジ 600W 1 分 30 秒。水 小さじ 1 を足す

## 片付け

- 食洗機: ボウル
- 手洗い: フライパン 26cm
- フライパンは火を止めたらすぐ湯を張る。タレが固まる前に

## 作ったときのメモ

