---
id: r-20261009-kamaboko-tamagoyaki-to-okura-natto
title: かまぼこ入りふんわり卵焼きとオクラの納豆和え
version: 1
supersedes: null
status: draft
created: '2026-10-09'
request: req-20261009-1227-0k6s
generated_by: {model: claude-code, prompt_version: 1}
type: dinner
servings: {adults: 2, kids: 1}
time: {budget: 25, planned: 15, active: 13, raw_estimate: 15, speed_factor: 1.0}
image_text: 黄色くふっくら焼けた卵焼きに、ピンクのかまぼこの角切りが散っている。横に緑のオクラの小口切りと納豆を和えた小鉢を添える。
dishes:
- {name: かまぼこ入りふんわり卵焼き, role: main}
- {name: オクラの納豆和え, role: side}
equipment: [fp26, microwave, bowl-m, bowl-l]
ingredients:
- {name: 卵, qty: 4, unit: 個, grams: 200, pantry: 卵, for: かまぼこ入りふんわり卵焼き, substitute: null, use_up: false}
- {name: かまぼこ, qty: 40, unit: g, grams: 40, pantry: かまぼこ, for: かまぼこ入りふんわり卵焼き, substitute: null, use_up: false}
- {name: 牛乳, qty: 4, unit: 大さじ, grams: 60, pantry: 牛乳, for: かまぼこ入りふんわり卵焼き, substitute: 水, use_up: false}
- {name: 醤油, qty: 1, unit: 小さじ, grams: 6, pantry: 醤油, for: かまぼこ入りふんわり卵焼き, substitute: null, use_up: false}
- {name: みりん, qty: 1, unit: 小さじ, grams: 6, pantry: みりん, for: かまぼこ入りふんわり卵焼き, substitute: null, use_up: false}
- {name: サラダ油, qty: 1, unit: 小さじ, grams: 4, pantry: サラダ油, for: かまぼこ入りふんわり卵焼き, substitute: null, use_up: false}
- {name: オクラ, qty: 3, unit: 本, grams: 30, pantry: オクラ, for: オクラの納豆和え, substitute: null, use_up: false}
- {name: 納豆, qty: 1, unit: パック, grams: 40, pantry: 納豆, for: オクラの納豆和え, substitute: null, use_up: false}
- {name: ごま油, qty: 1, unit: 小さじ, grams: 4, pantry: ごま油, for: オクラの納豆和え, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 小さじ, grams: 3, pantry: 白ごま, for: オクラの納豆和え, substitute: null, use_up: false}
tags: [15分, フライパン1つ, レンジ, 子ども取り分け, 在庫だけ]
salt: {total_g: 1.9, adult_per_serving_g: 0.9, kid_g: 0.3}
kid: {rule: '味付けの前に取り分ける（kid_rule: separate）', cut: かまぼこは 3mm のみじん、オクラは 5mm の小口切りを細かく、納豆は包丁で軽く刻む（1cm 以下）, note: 卵は子ども用を別のボウルでレンジで完全に固める。納豆と卵が初めてなら少量から。納豆のタレと醤油は使わない。熱い物は冷ましてから出し、手づかみしやすいよう卵はほぐして小さな塊にする。}
keep: {fridge_days: 1, freezer: false, reheat: 食べる直前に 600W で 30 秒、湯気が立つまで。納豆和えは作り置きしない}
timeline:
- {minute: 0, lane: hands, text: オクラを洗ってヘタを落とし、耐熱皿に並べてふんわりラップ}
- {minute: 1, lane: microwave, text: オクラを 900W で 45 秒}
- {minute: 2, lane: hands, text: オクラを取り出して粗熱を取り、小口切り。子ども用 1 本分はさらに細かく}
- {minute: 4, lane: hands, text: 納豆を子ども用 15g と大人用 25g に分け、子ども用は刻む。大人用に醤油小さじ 1/2・ごま油・白ごま・オクラを混ぜる}
- {minute: 6, lane: hands, text: かまぼこを大人 30g は 5mm 角、子ども 10g は 3mm みじんに切る。卵を子ども用ボウルに 1 個、大人用ボウルに 3 個割る}
- {minute: 8, lane: hands, text: 子ども用に牛乳大さじ 1・かまぼこを、大人用に牛乳大さじ 3・醤油小さじ 1/2・みりん・かまぼこを混ぜる}
- {minute: 9, lane: microwave, text: 子ども用卵液を 900W で 40 秒 → 混ぜる → さらに 20 秒（液が残らない）}
- {minute: 9, lane: gas-r, text: フライパン中火で 1 分予熱し、油をなじませる}
- {minute: 10, lane: gas-r, text: 大人用卵液を流し入れ、周りが固まるまで 20 秒、大きく混ぜて半分に折る}
- {minute: 11, lane: gas-r, text: 蓋をして弱火で 2 分（中まで固める）}
- {minute: 11, lane: hands, text: 子ども用の卵をほぐして皿に広げて冷ます}
- {minute: 13, lane: gas-r, text: 火を止め、まな板に移して 4 等分に切る}
- {minute: 14, lane: hands, text: 盛り付けて配膳}
- {minute: 15, lane: hands, text: 完成・配膳}
steps:
- dish: オクラの納豆和え
  n: 1
  title: オクラをレンジにかける
  kind: heat
  tag: microwave
  minutes: 3
  heat: {equipment: microwave, level: 900W}
  text: オクラ 3 本を洗い、ヘタの先を落として耐熱皿に並べ、ふんわりラップをして 900W で 45 秒加熱する。
  cue: 鮮やかな緑色になり、押すと少しやわらかい
  caution: null
  timer: 45
  kid: null
- {dish: オクラの納豆和え, n: 2, title: オクラを切る, kind: prep, tag: cut, minutes: 2, heat: null, text: 粗熱を取ったオクラを 5mm の小口切りにする。子ども用に
    1 本分を取り、さらに細かく刻む。, cue: 断面が星形に揃う, caution: null, timer: null, kid: 子ども用は 5mm 以下に刻む。}
- {dish: オクラの納豆和え, n: 3, title: 納豆を和える, kind: prep, tag: season, minutes: 2, heat: null, text: 納豆 40g から 15g を子ども用に取り、包丁で軽く刻む。大人用
    25g にオクラ、醤油小さじ 1/2、ごま油小さじ 1、白ごまを混ぜる。タレは使わない。, cue: 糸が引いてオクラが全体に絡む, caution: null, timer: null, kid: 子ども用は味付けの前に取り分け、タレ・醤油なしでオクラを混ぜるだけ。初めてなら少量から。}
- {dish: かまぼこ入りふんわり卵焼き, n: 1, title: かまぼこを切り、卵を割る, kind: prep, tag: cut, minutes: 2, heat: null, text: かまぼこ 30g を 5mm 角、10g
    を 3mm のみじんに切る。ボウル（中）に卵 1 個（子ども用）、ボウル（大）に卵 3 個（大人用）を割る。, cue: かまぼこの角がそろう, caution: null, timer: null, kid: 3mm のみじんは子ども用ボウルへ。}
- {dish: かまぼこ入りふんわり卵焼き, n: 2, title: 卵液を作る, kind: prep, tag: season, minutes: 1, heat: null, text: 子ども用に牛乳大さじ 1 とみじんのかまぼこを混ぜる。大人用に牛乳大さじ
    3、醤油小さじ 1/2、みりん小さじ 1、5mm 角のかまぼこを加えて混ぜる。, cue: 卵白のかたまりが見えない, caution: null, timer: null, kid: 子ども用は醤油・みりんなし。}
- dish: かまぼこ入りふんわり卵焼き
  n: 3
  title: 子ども用の卵をレンジで固める
  kind: heat
  tag: kid
  minutes: 2
  heat: {equipment: microwave, level: 900W}
  text: ボウル（中）にふんわりラップをし、900W で 40 秒加熱。取り出して混ぜ、さらに 20 秒加熱する。
  cue: 液体が残らず全体が固まっている
  caution: 加熱ムラが出るので必ず途中で混ぜる
  timer: 60
  kid: 完全に固まってから、ほぐして皿に広げて冷ます。
- dish: かまぼこ入りふんわり卵焼き
  n: 4
  title: 大人用を焼く
  kind: heat
  tag: sear
  minutes: 5
  heat: {equipment: gas-r, level: 中火}
  text: フライパンを中火で 1 分予熱して油をなじませ、大人用卵液を流す。周りが固まったら大きく混ぜ、半分に折る。蓋をして弱火で 2 分蒸し焼きにする。
  cue: 表面にとろみが無く、竹串を刺して透明な汁が出ない
  caution: フッ素加工なので強火にしない
  timer: 120
  kid: null
- {dish: かまぼこ入りふんわり卵焼き, n: 5, title: 切って盛る, kind: serve, tag: serve, minutes: 2, heat: null, text: まな板に移して 4 等分に切り、納豆和えと一緒に盛り付ける。,
  cue: 断面まで黄色く固まっている, caution: null, timer: null, kid: 熱い物は冷ましてから出す。}
cleanup:
  dishwasher: [bowl-l, bowl-m]
  hand: [fp26]
  note: null
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
---

## 段取り表（15 分）

| 分 | ガスコンロ右 | レンジ | 手 |
|---|---|---|---|
| 0 |  |  | オクラを洗ってヘタを落とし、耐熱皿に並べてふんわりラップ |
| 1 |  | オクラを 900W で 45 秒 |  |
| 2 |  |  | オクラを取り出して粗熱を取り、小口切り。子ども用 1 本分はさらに細かく |
| 4 |  |  | 納豆を子ども用 15g と大人用 25g に分け、子ども用は刻む。大人用に醤油小さじ 1/2・ごま油・白ごま・オクラを混ぜる |
| 6 |  |  | かまぼこを大人 30g は 5mm 角、子ども 10g は 3mm みじんに切る。卵を子ども用ボウルに 1 個、大人用ボウルに 3 個割る |
| 8 |  |  | 子ども用に牛乳大さじ 1・かまぼこを、大人用に牛乳大さじ 3・醤油小さじ 1/2・みりん・かまぼこを混ぜる |
| 9 | フライパン中火で 1 分予熱し、油をなじませる | 子ども用卵液を 900W で 40 秒 → 混ぜる → さらに 20 秒（液が残らない） |  |
| 10 | 大人用卵液を流し入れ、周りが固まるまで 20 秒、大きく混ぜて半分に折る |  |  |
| 11 | 蓋をして弱火で 2 分（中まで固める） |  | 子ども用の卵をほぐして皿に広げて冷ます |
| 13 | 火を止め、まな板に移して 4 等分に切る |  |  |
| 14 |  |  | 盛り付けて配膳 |
| 15 |  |  | 完成・配膳 |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| 卵 | 4 個（200g） | かまぼこ入りふんわり卵焼き | 卵 |
| かまぼこ | 40 g | かまぼこ入りふんわり卵焼き | かまぼこ |
| 牛乳 | 4 大さじ（60g） | かまぼこ入りふんわり卵焼き 代替: 水 | 牛乳 |
| 醤油 | 1 小さじ（6g） | かまぼこ入りふんわり卵焼き | 醤油 |
| みりん | 1 小さじ（6g） | かまぼこ入りふんわり卵焼き | みりん |
| サラダ油 | 1 小さじ（4g） | かまぼこ入りふんわり卵焼き | サラダ油 |
| オクラ | 3 本（30g） | オクラの納豆和え | オクラ |
| 納豆 | 1 パック（40g） | オクラの納豆和え | 納豆 |
| ごま油 | 1 小さじ（4g） | オクラの納豆和え | ごま油 |
| 白ごま | 1 小さじ（3g） | オクラの納豆和え | 白ごま |

塩分: 合計 1.9g ・ 大人 1 人分 0.9g ・ 子ども 0.3g

## 手順

### かまぼこ入りふんわり卵焼き
1. **かまぼこを切り、卵を割る（2 分 / prep）** かまぼこ 30g を 5mm 角、10g を 3mm のみじんに切る。ボウル（中）に卵 1 個（子ども用）、ボウル（大）に卵 3 個（大人用）を割る。
   - 目安: かまぼこの角がそろう
   - 🍼 3mm のみじんは子ども用ボウルへ。
2. **卵液を作る（1 分 / prep）** 子ども用に牛乳大さじ 1 とみじんのかまぼこを混ぜる。大人用に牛乳大さじ 3、醤油小さじ 1/2、みりん小さじ 1、5mm 角のかまぼこを加えて混ぜる。
   - 目安: 卵白のかたまりが見えない
   - 🍼 子ども用は醤油・みりんなし。
3. **子ども用の卵をレンジで固める（2 分 / heat）** レンジ・900W ボウル（中）にふんわりラップをし、900W で 40 秒加熱。取り出して混ぜ、さらに 20 秒加熱する。
   - 目安: 液体が残らず全体が固まっている
   - ⏱ 1 分
   - ⚠ 加熱ムラが出るので必ず途中で混ぜる
   - 🍼 完全に固まってから、ほぐして皿に広げて冷ます。
4. **大人用を焼く（5 分 / heat）** ガスコンロ右・中火 フライパンを中火で 1 分予熱して油をなじませ、大人用卵液を流す。周りが固まったら大きく混ぜ、半分に折る。蓋をして弱火で 2 分蒸し焼きにする。
   - 目安: 表面にとろみが無く、竹串を刺して透明な汁が出ない
   - ⏱ 2 分
   - ⚠ フッ素加工なので強火にしない
5. **切って盛る（2 分 / serve）** まな板に移して 4 等分に切り、納豆和えと一緒に盛り付ける。
   - 目安: 断面まで黄色く固まっている
   - 🍼 熱い物は冷ましてから出す。

### オクラの納豆和え
1. **オクラをレンジにかける（3 分 / heat）** レンジ・900W オクラ 3 本を洗い、ヘタの先を落として耐熱皿に並べ、ふんわりラップをして 900W で 45 秒加熱する。
   - 目安: 鮮やかな緑色になり、押すと少しやわらかい
   - ⏱ 0 分 45 秒
2. **オクラを切る（2 分 / prep）** 粗熱を取ったオクラを 5mm の小口切りにする。子ども用に 1 本分を取り、さらに細かく刻む。
   - 目安: 断面が星形に揃う
   - 🍼 子ども用は 5mm 以下に刻む。
3. **納豆を和える（2 分 / prep）** 納豆 40g から 15g を子ども用に取り、包丁で軽く刻む。大人用 25g にオクラ、醤油小さじ 1/2、ごま油小さじ 1、白ごまを混ぜる。タレは使わない。
   - 目安: 糸が引いてオクラが全体に絡む
   - 🍼 子ども用は味付けの前に取り分け、タレ・醤油なしでオクラを混ぜるだけ。初めてなら少量から。

## 子どもの分

- 取り分け: 味付けの前に取り分ける（kid_rule: separate） ・ 大きさ: かまぼこは 3mm のみじん、オクラは 5mm の小口切りを細かく、納豆は包丁で軽く刻む（1cm 以下）
- 卵は子ども用を別のボウルでレンジで完全に固める。納豆と卵が初めてなら少量から。納豆のタレと醤油は使わない。熱い物は冷ましてから出し、手づかみしやすいよう卵はほぐして小さな塊にする。

## 保存・翌日

- 冷蔵 1 日 ・ 冷凍 不向き
- 温め直し: 食べる直前に 600W で 30 秒、湯気が立つまで。納豆和えは作り置きしない

## 片付け

- 食洗機: ボウル（大）, ボウル（中）
- 手洗い: フライパン

## 作ったときのメモ

