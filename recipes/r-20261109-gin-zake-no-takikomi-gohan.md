---
listed: "2026-11-09T22:50:18+09:00"
id: r-20261109-gin-zake-no-takikomi-gohan
title: 銀鮭の炊き込みご飯
version: 1
supersedes: null
status: tried
created: '2026-11-09'
request: req-20261109-2247-13zr
generated_by: {model: claude-code, prompt_version: 10}
type: prep
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 180, active: 35, raw_estimate: 139, speed_factor: 1.25}
image_text: ふっくらほぐした銀鮭のピンクとにんじんの橙が、薄い醤油色のご飯に散る。白ごまをふり、湯気が立つ。
dishes:
- {name: 銀鮭の炊き込みご飯, role: onepot}
equipment: [rice-cooker, grill, microwave, bowl-l]
ingredients:
- {name: 米, qty: 3, unit: 合, grams: 450, pantry: 米, for: 銀鮭の炊き込みご飯, substitute: null, use_up: false}
- {name: 鮭, qty: 2, unit: 切れ, grams: 160, pantry: 鮭, for: 銀鮭の炊き込みご飯, substitute: 銀鮭, use_up: false}
- {name: にんじん, qty: 0.5, unit: 本, grams: 80, pantry: null, for: 銀鮭の炊き込みご飯, substitute: null, use_up: false}
- {name: だしパック, qty: 1, unit: 個, grams: null, pantry: だしパック, for: 銀鮭の炊き込みご飯, substitute: null, use_up: false}
- {name: 酒, qty: 2, unit: 大さじ, grams: 30, pantry: 酒, for: 銀鮭の炊き込みご飯, substitute: null, use_up: false}
- {name: 醤油, qty: 2, unit: 小さじ, grams: 12, pantry: 醤油, for: 銀鮭の炊き込みご飯, substitute: null, use_up: false}
- {name: 塩, qty: 0.25, unit: 小さじ, grams: 1.5, pantry: 塩, for: 銀鮭の炊き込みご飯, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 小さじ, grams: 3, pantry: 白ごま, for: 銀鮭の炊き込みご飯, substitute: null, use_up: false}
tags: [炊飯器, 仕込み, 鮭, one-pot]
salt: {total_g: 3.8, adult_per_serving_g: 1.9, kid_g: 0.7}
kid: {rule: shared, cut: 鮭は骨を取って 1cm 以下、にんじんは細切りのまま柔らかい, note: 全体を薄味（塩分 3.8g を 3 合で）にし、子どもは茶碗 1/3 杯で約 0.7g。小さなおにぎりにすると手づかみしやすい。}
keep: {fridge_days: 2, freezer: true, reheat: ラップのまま 900W で 1 分 10 秒、混ぜて 20 秒追加。冷凍は 2 分。中心まで湯気が立つまで}
timeline:
- {minute: 0, lane: hands, text: 米を研いで浸水を始める}
- {minute: 4, lane: hands, text: にんじんを切る}
- {minute: 10, lane: hands, text: 浸水の待ち（30 分）}
- {minute: 22, lane: grill, text: 予熱 2 分 → 銀鮭 7 分}
- {minute: 32, lane: hands, text: 鮭をほぐす・骨を取る}
- {minute: 34, lane: hands, text: 調味して炊飯スイッチ}
- {minute: 36, lane: hands, text: 炊飯 60 分（他の家事）}
- {minute: 96, lane: hands, text: 蒸らし 10 分}
- {minute: 106, lane: hands, text: 鮭とごまを混ぜ、子どもの分を取る}
- {minute: 114, lane: hands, text: 小分けにして冷ます}
- {minute: 139, lane: hands, text: 冷蔵・冷凍に仕舞う}
steps:
- dish: 銀鮭の炊き込みご飯
  n: 1
  title: 米を洗って浸水
  kind: prep
  tag: rice
  minutes: 4
  start: 0
  heat: null
  text: 米 3 合をボウルで 3 回研ぎ、ザルで水を切って炊飯器の内釜に入れる。水を 3 合の目盛りより少し下まで注ぎ、だしパック 1 個を沈めて 30 分浸水する。
  cue: 研ぎ汁が薄い白（ほぼ透明）になる
  caution: null
  timer: null
  kid: null
  ingredients: [米, だしパック]
- dish: 銀鮭の炊き込みご飯
  n: 2
  title: 浸水の待ち
  kind: prep
  tag: wait
  minutes: 30
  start: 4
  heat: null
  text: そのまま 30 分置く（この間に次の 2 つを進める）。
  cue: 米粒が白く不透明になり、芯が見えない
  caution: null
  timer: 1800
  kid: null
  ingredients: []
- dish: 銀鮭の炊き込みご飯
  n: 3
  title: にんじんを切る
  kind: prep
  tag: cut
  minutes: 5
  start: 4
  heat: null
  text: にんじん 1/2 本の皮をむき、スライサー 1.2mm 細切りで千切りにし、包丁で 3cm の長さに切りそろえる。最後の 2cm は包丁で。
  cue: 細く短いそろった千切り
  caution: スライサーは最後の 2cm を包丁で切る（指を守る）
  timer: null
  kid: null
  ingredients: [にんじん]
- dish: 銀鮭の炊き込みご飯
  n: 4
  title: 銀鮭をグリルで焼く
  kind: heat
  tag: sear
  minutes: 10
  start: 22
  heat: {equipment: grill, level: 両面焼き}
  text: 魚焼きグリルを 2 分予熱し、銀鮭 2 切れを皮目を上にして両面焼きで 7 分焼く。返さない。
  cue: 身の中心まで白く、箸で押すと透明な汁が出ない。皮目に軽い焼き目
  caution: 使ったら受け皿を洗う
  timer: null
  kid: null
  ingredients: [鮭]
- dish: 銀鮭の炊き込みご飯
  n: 5
  title: 鮭をほぐす
  kind: prep
  tag: cut
  minutes: 4
  start: 32
  heat: null
  text: 焼いた鮭の皮と骨を外し、身を 1cm 角にほぐす。骨が残っていないか指で 2 回なぞって確かめる。
  cue: 身がふっくら大きめのフレーク状、小骨なし
  caution: null
  timer: null
  kid: 子どもの分は特に骨を探し、1cm 以下にほぐす
  ingredients: []
- dish: 銀鮭の炊き込みご飯
  n: 6
  title: 調味して炊飯を始める
  kind: heat
  tag: rice
  minutes: 2
  start: 34
  heat: {equipment: rice-cooker, level: 通常炊き}
  text: だしパックを取り出し、内釜に酒 大さじ 2、醤油 小さじ 2、塩 小さじ 1/4 を入れる。3 合の目盛りまで水を足して軽く混ぜ、にんじんをのせて混ぜずに通常炊きを押す。
  cue: スイッチが入り、通常 60 分の表示
  caution: null
  timer: null
  kid: null
  ingredients: [酒, 醤油, 塩, にんじん]
- dish: 銀鮭の炊き込みご飯
  n: 7
  title: 炊飯
  kind: wait
  tag: wait
  minutes: 60
  start: 36
  heat: {equipment: rice-cooker, level: 通常炊き}
  text: 通常炊き 60 分。炊飯器に任せる。
  cue: 炊飯完了の合図
  caution: null
  timer: 3600
  kid: null
  ingredients: []
- dish: 銀鮭の炊き込みご飯
  n: 8
  title: 蒸らす
  kind: wait
  tag: wait
  minutes: 10
  start: 96
  heat: {equipment: rice-cooker, level: 保温（蓋は開けない）}
  text: 炊けても蓋を開けず 10 分蒸らす。
  cue: 蓋を開けると湯気が立ち、ご飯の表面がつやつや
  caution: null
  timer: 600
  kid: null
  ingredients: []
- dish: 銀鮭の炊き込みご飯
  n: 9
  title: 鮭を混ぜて小分けにする
  kind: prep
  tag: season
  minutes: 8
  start: 106
  heat: null
  text: 蓋を開け、鮭と白ごま 小さじ 1 をのせて、しゃもじで底から切るように混ぜる。子ども用の取り分け（茶碗 1/3 杯）を別にしておく。
  cue: 全体に鮭とにんじんが回り、ご飯が潰れていない
  caution: null
  timer: null
  kid: 子どもの分は鮭を 1cm 以下に、粒を軽くほぐして手づかみ用に小さなおにぎりにしてもよい
  ingredients: [鮭, 白ごま]
- dish: 銀鮭の炊き込みご飯
  n: 10
  title: 冷まして保存
  kind: prep
  tag: cleanup
  minutes: 25
  start: 114
  heat: null
  text: 1 食分（茶碗 1 杯、約 150g）ずつラップに平らに包み、浅い容器に並べて 30 分以内に粗熱を取る。冷めたら冷蔵（翌日に食べる分）と冷凍（残り）に分ける。
  cue: 手で触れて熱くない、ラップの内側に水滴が付かない
  caution: 鍋や炊飯器のまま常温に置かない（30 分以内に冷蔵）
  timer: null
  kid: null
  ingredients: []
- dish: 銀鮭の炊き込みご飯
  n: 11
  title: 翌日の仕上げ：温める
  kind: heat
  tag: microwave
  minutes: 3
  start: null
  heat: {equipment: microwave, level: 900W}
  text: ラップのまま皿にのせ、1 食分を 900W で 1 分 10 秒温め、全体を混ぜて 20 秒追加する。冷凍は 900W で 2 分、混ぜて 30 秒追加。水 小さじ 1 を振ると乾かない。
  cue: 中心まで湯気が立つ（ぬるい所が無い）
  caution: null
  timer: null
  kid: 子どもの分は温めた後、ほぐして広げ、手で触れて冷めてから出す
  ingredients: []
cleanup:
  dishwasher: [bowl-l]
  hand: [rice-cooker, grill]
  note: グリルの受け皿を洗う
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
---

## 段取り表（180 分）

| 分 | 魚焼きグリル | 手 |
|---|---|---|
| 0 |  | 米を研いで浸水を始める |
| 4 |  | にんじんを切る |
| 10 |  | 浸水の待ち（30 分） |
| 22 | 予熱 2 分 → 銀鮭 7 分 |  |
| 32 |  | 鮭をほぐす・骨を取る |
| 34 |  | 調味して炊飯スイッチ |
| 36 |  | 炊飯 60 分（他の家事） |
| 96 |  | 蒸らし 10 分 |
| 106 |  | 鮭とごまを混ぜ、子どもの分を取る |
| 114 |  | 小分けにして冷ます |
| 139 |  | 冷蔵・冷凍に仕舞う |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| 米 | 3 合（450g） | 銀鮭の炊き込みご飯 | 米 |
| 鮭 | 2 切れ（160g） | 銀鮭の炊き込みご飯 代替: 銀鮭 | 鮭 |
| にんじん | 0.5 本（80g） | 銀鮭の炊き込みご飯 | — |
| だしパック | 1 個 | 銀鮭の炊き込みご飯 | だしパック |
| 酒 | 2 大さじ（30g） | 銀鮭の炊き込みご飯 | 酒 |
| 醤油 | 2 小さじ（12g） | 銀鮭の炊き込みご飯 | 醤油 |
| 塩 | 0.25 小さじ（1.5g） | 銀鮭の炊き込みご飯 | 塩 |
| 白ごま | 1 小さじ（3g） | 銀鮭の炊き込みご飯 | 白ごま |

塩分: 合計 3.8g ・ 大人 1 人分 1.9g ・ 子ども 0.7g

## 手順

### 銀鮭の炊き込みご飯
1. **米を洗って浸水（4 分 / prep）** 米 3 合をボウルで 3 回研ぎ、ザルで水を切って炊飯器の内釜に入れる。水を 3 合の目盛りより少し下まで注ぎ、だしパック 1 個を沈めて 30 分浸水する。
   - 材料: 米 3 合（450g）・だしパック 1 個
   - 目安: 研ぎ汁が薄い白（ほぼ透明）になる
2. **浸水の待ち（30 分 / prep）** そのまま 30 分置く（この間に次の 2 つを進める）。
   - 目安: 米粒が白く不透明になり、芯が見えない
   - ⏱ 30 分
3. **にんじんを切る（5 分 / prep）** にんじん 1/2 本の皮をむき、スライサー 1.2mm 細切りで千切りにし、包丁で 3cm の長さに切りそろえる。最後の 2cm は包丁で。
   - 材料: にんじん 1/2 本（80g）
   - 目安: 細く短いそろった千切り
   - ⚠ スライサーは最後の 2cm を包丁で切る（指を守る）
4. **銀鮭をグリルで焼く（10 分 / heat）** 魚焼きグリル・両面焼き 魚焼きグリルを 2 分予熱し、銀鮭 2 切れを皮目を上にして両面焼きで 7 分焼く。返さない。
   - 材料: 鮭 2 切れ（160g）
   - 目安: 身の中心まで白く、箸で押すと透明な汁が出ない。皮目に軽い焼き目
   - ⚠ 使ったら受け皿を洗う
5. **鮭をほぐす（4 分 / prep）** 焼いた鮭の皮と骨を外し、身を 1cm 角にほぐす。骨が残っていないか指で 2 回なぞって確かめる。
   - 目安: 身がふっくら大きめのフレーク状、小骨なし
   - 🍼 子どもの分は特に骨を探し、1cm 以下にほぐす
6. **調味して炊飯を始める（2 分 / heat）** 炊飯器・通常炊き だしパックを取り出し、内釜に酒 大さじ 2、醤油 小さじ 2、塩 小さじ 1/4 を入れる。3 合の目盛りまで水を足して軽く混ぜ、にんじんをのせて混ぜずに通常炊きを押す。
   - 材料: 酒 大さじ 2（30g）・醤油 小さじ 2（12g）・塩 小さじ 1/4（1.5g）・にんじん 1/2 本（80g）
   - 目安: スイッチが入り、通常 60 分の表示
7. **炊飯（60 分 / wait）** 炊飯器・通常炊き 通常炊き 60 分。炊飯器に任せる。
   - 目安: 炊飯完了の合図
   - ⏱ 60 分
8. **蒸らす（10 分 / wait）** 炊飯器・保温（蓋は開けない） 炊けても蓋を開けず 10 分蒸らす。
   - 目安: 蓋を開けると湯気が立ち、ご飯の表面がつやつや
   - ⏱ 10 分
9. **鮭を混ぜて小分けにする（8 分 / prep）** 蓋を開け、鮭と白ごま 小さじ 1 をのせて、しゃもじで底から切るように混ぜる。子ども用の取り分け（茶碗 1/3 杯）を別にしておく。
   - 材料: 鮭 2 切れ（160g）・白ごま 小さじ 1（3g）
   - 目安: 全体に鮭とにんじんが回り、ご飯が潰れていない
   - 🍼 子どもの分は鮭を 1cm 以下に、粒を軽くほぐして手づかみ用に小さなおにぎりにしてもよい
10. **冷まして保存（25 分 / prep）** 1 食分（茶碗 1 杯、約 150g）ずつラップに平らに包み、浅い容器に並べて 30 分以内に粗熱を取る。冷めたら冷蔵（翌日に食べる分）と冷凍（残り）に分ける。
   - 目安: 手で触れて熱くない、ラップの内側に水滴が付かない
   - ⚠ 鍋や炊飯器のまま常温に置かない（30 分以内に冷蔵）
11. **翌日の仕上げ：温める（3 分 / heat）** レンジ・900W ラップのまま皿にのせ、1 食分を 900W で 1 分 10 秒温め、全体を混ぜて 20 秒追加する。冷凍は 900W で 2 分、混ぜて 30 秒追加。水 小さじ 1 を振ると乾かない。
   - 目安: 中心まで湯気が立つ（ぬるい所が無い）
   - 🍼 子どもの分は温めた後、ほぐして広げ、手で触れて冷めてから出す

## 子どもの分

- 取り分け: shared ・ 大きさ: 鮭は骨を取って 1cm 以下、にんじんは細切りのまま柔らかい
- 全体を薄味（塩分 3.8g を 3 合で）にし、子どもは茶碗 1/3 杯で約 0.7g。小さなおにぎりにすると手づかみしやすい。

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 可
- 温め直し: ラップのまま 900W で 1 分 10 秒、混ぜて 20 秒追加。冷凍は 2 分。中心まで湯気が立つまで

## 片付け

- 食洗機: ボウル（大）
- 手洗い: 炊飯器, 魚焼きグリル
- グリルの受け皿を洗う

## 作ったときのメモ
- 2026-11-10 ・ 99 分（見込み 180）・ R 82 ・ F 4 ・ そのまま ・ 分量 ×0.75 ・ 📷 20261110-1.jpg
