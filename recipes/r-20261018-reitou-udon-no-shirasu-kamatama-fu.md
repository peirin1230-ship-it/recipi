---
id: r-20261018-reitou-udon-no-shirasu-kamatama-fu
title: 冷凍うどんのしらす釜玉風
version: 1
supersedes: null
status: draft
created: '2026-10-18'
request: req-20261018-2228-qeg7
generated_by: {model: claude-code, prompt_version: 10}
type: recipe_detail
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 13, active: 7, raw_estimate: 11, speed_factor: 1.07}
image_text: 湯気の立つうどんに、ふんわり固まった黄色い卵と白いしらすがのり、白ごまが散る。ごま油と醤油がうっすら光る。
dishes:
- {name: 冷凍うどんのしらす釜玉風, role: onepot}
equipment: [microwave, kettle, bowl-l, bowl-m]
ingredients:
- {name: 冷凍うどん, qty: 3, unit: 玉, grams: 600, pantry: 冷凍うどん, for: 冷凍うどんのしらす釜玉風, substitute: null, use_up: false}
- {name: 卵, qty: 3, unit: 個, grams: 150, pantry: 卵, for: 冷凍うどんのしらす釜玉風, substitute: null, use_up: false}
- {name: しらす, qty: 35, unit: g, grams: 35, pantry: しらす, for: 冷凍うどんのしらす釜玉風, substitute: null, use_up: false}
- {name: 醤油, qty: 1, unit: 大さじ, grams: 18, pantry: 醤油, for: 冷凍うどんのしらす釜玉風, substitute: null, use_up: false}
- {name: ごま油, qty: 1, unit: 小さじ, grams: 4, pantry: ごま油, for: 冷凍うどんのしらす釜玉風, substitute: null, use_up: false}
- {name: 白ごま, qty: 1, unit: 小さじ, grams: 3, pantry: 白ごま, for: 冷凍うどんのしらす釜玉風, substitute: null, use_up: false}
- {name: かつお節, qty: 2, unit: g, grams: 2, pantry: かつお節, for: 冷凍うどんのしらす釜玉風, substitute: null, use_up: false}
tags: [火を使わない, レンジ, 子ども取り分け, 朝・軽食]
salt: {total_g: 3.5, adult_per_serving_g: 1.6, kid_g: 0.3}
kid: {rule: separate, cut: うどんは2cm長さに刻む。卵は完全に固めて5mm程度に刻む。しらすは熱湯をかけて塩抜き, note: 醤油・ごま油は入れない（味付け前に取り分け）。冷ましてから出す。初めての食材は無し}
keep: {fridge_days: 1, freezer: false, reheat: 作りたてを食べ切る。残ったらレンジ600Wで湯気が立つまで温める}
timeline:
- {minute: 0, lane: hands, text: ケトルに水 500ml を入れて沸かす。ボウル（中）に卵3個を割って溶く}
- {minute: 1, lane: microwave, text: 溶き卵を900Wで20秒→混ぜる→20秒→混ぜる→15秒（固まりきる）}
- {minute: 3, lane: microwave, text: ボウル（大）に冷凍うどん3玉をラップして900W 5分}
- {minute: 3, lane: hands, text: 卵の1/3を取り分けて細かく刻む。ザルにしらす5gを入れケトルの湯をかけて塩抜き}
- {minute: 6, lane: hands, text: 大人用のしらす30g・醤油・ごま油を小皿で合わせる}
- {minute: 8, lane: hands, text: うどんを出し、1/2玉を子ども用に取り分けて2cmに刻み、卵・しらすと合わせて冷ます}
- {minute: 9, lane: hands, text: 残りのうどんに卵・しらす・醤油・ごま油を和える}
- {minute: 11, lane: hands, text: 盛り付けて白ごま・かつお節をかけ、配膳}
steps:
- dish: 冷凍うどんのしらす釜玉風
  n: 1
  title: 湯を沸かして卵を溶く
  kind: prep
  tag: cut
  minutes: 1
  start: 0
  heat: null
  text: 電気ケトルに水 500ml を入れて沸かす。ボウル（中）に卵 3 個を割り、白身が切れるまで菜箸で溶く。
  cue: 卵液に白いかたまりが残っていない
  caution: null
  timer: null
  kid: null
  ingredients: [卵]
- dish: 冷凍うどんのしらす釜玉風
  n: 2
  title: 卵をレンジで固める
  kind: heat
  tag: microwave
  minutes: 2
  start: 1
  heat: {equipment: microwave, level: 900W}
  text: 溶き卵をふんわりラップし、レンジ 900W で 20 秒→取り出して混ぜる→20 秒→混ぜる→15 秒。（600W なら各 1.4 倍）
  cue: ぽろぽろの炒り卵状で、汁気が透明でなく黄色く固まっている
  caution: 生っぽい部分が残るときは 10 秒ずつ追加。ムラが出るので必ず途中で混ぜる
  timer: null
  kid: 子どもの分は特に、液が残らないまで固める
  ingredients: [卵]
- dish: 冷凍うどんのしらす釜玉風
  n: 3
  title: うどんをレンジで温める
  kind: wait
  tag: microwave
  minutes: 5
  start: 3
  heat: {equipment: microwave, level: 900W}
  text: ボウル（大）に冷凍うどん 3 玉を重ならないよう並べ、ふんわりラップしてレンジ 900W で 5 分。
  cue: ほぐすと塊が無く、全体が湯気を立てて熱い
  caution: ラップをはがすとき蒸気でやけどしやすい
  timer: 300
  kid: null
  ingredients: [冷凍うどん]
- dish: 冷凍うどんのしらす釜玉風
  n: 4
  title: 子どもの分を取り分けて準備する（うどん加熱中）
  kind: prep
  tag: kid
  minutes: 3
  start: 3
  heat: null
  text: 固めた卵の 1/3 を別の取り皿に取り、包丁で 5mm 程度に刻む。ザルにしらす 5g を入れ、ケトルの湯を回しかけて水を切る（塩抜き）。大人用の小皿に醤油 大さじ 1 とごま油 小さじ 1 を合わせ、しらす 30g を用意する。
  cue: しらすが白くふっくらして、湯気が上がる
  caution: null
  timer: null
  kid: 子ども用は醤油・ごま油を入れない
  ingredients: [卵, しらす, 醤油, ごま油]
- dish: 冷凍うどんのしらす釜玉風
  n: 5
  title: 子どもの分を取り分ける
  kind: prep
  tag: kid
  minutes: 1
  start: 8
  heat: null
  text: うどんを取り出し、味付け前に 1/2 玉（約 100g）を子ども用の皿へ。まな板で 2cm 長さに刻み、刻んだ卵と塩抜きしたしらすを混ぜて冷ます。
  cue: 手で触れる温度（人肌）まで冷めている
  caution: null
  timer: null
  kid: 冷ましてから出す。手づかみしたがるなら刻んだうどんと卵を平たくまとめてもよい
  ingredients: [冷凍うどん, 卵, しらす]
- dish: 冷凍うどんのしらす釜玉風
  n: 6
  title: 大人の分を和えて盛る
  kind: serve
  tag: serve
  minutes: 3
  start: 9
  heat: null
  text: 残りのうどん（約 2.5 玉）に、残りの卵・しらす 30g・醤油 大さじ 1・ごま油 小さじ 1 を加え、菜箸で全体を絡める。2 皿に盛り、白ごま 小さじ 1 とかつお節をかける。
  cue: うどん全体に卵としらすがまとわりつき、つややかに光る
  caution: null
  timer: null
  kid: null
  ingredients: [冷凍うどん, 卵, しらす, 醤油, ごま油, 白ごま, かつお節]
cleanup:
  dishwasher: [bowl-l, bowl-m]
  hand: []
  note: 火を使わないのでコンロの洗い物は無し
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
---

## 段取り表（13 分）

| 分 | レンジ | 手 |
|---|---|---|
| 0 |  | ケトルに水 500ml を入れて沸かす。ボウル（中）に卵3個を割って溶く |
| 1 | 溶き卵を900Wで20秒→混ぜる→20秒→混ぜる→15秒（固まりきる） |  |
| 3 | ボウル（大）に冷凍うどん3玉をラップして900W 5分 | 卵の1/3を取り分けて細かく刻む。ザルにしらす5gを入れケトルの湯をかけて塩抜き |
| 6 |  | 大人用のしらす30g・醤油・ごま油を小皿で合わせる |
| 8 |  | うどんを出し、1/2玉を子ども用に取り分けて2cmに刻み、卵・しらすと合わせて冷ます |
| 9 |  | 残りのうどんに卵・しらす・醤油・ごま油を和える |
| 11 |  | 盛り付けて白ごま・かつお節をかけ、配膳 |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| 冷凍うどん | 3 玉（600g） | 冷凍うどんのしらす釜玉風 | 冷凍うどん |
| 卵 | 3 個（150g） | 冷凍うどんのしらす釜玉風 | 卵 |
| しらす | 35 g | 冷凍うどんのしらす釜玉風 | しらす |
| 醤油 | 1 大さじ（18g） | 冷凍うどんのしらす釜玉風 | 醤油 |
| ごま油 | 1 小さじ（4g） | 冷凍うどんのしらす釜玉風 | ごま油 |
| 白ごま | 1 小さじ（3g） | 冷凍うどんのしらす釜玉風 | 白ごま |
| かつお節 | 2 g | 冷凍うどんのしらす釜玉風 | かつお節 |

塩分: 合計 3.5g ・ 大人 1 人分 1.6g ・ 子ども 0.3g

## 手順

### 冷凍うどんのしらす釜玉風
1. **湯を沸かして卵を溶く（1 分 / prep）** 電気ケトルに水 500ml を入れて沸かす。ボウル（中）に卵 3 個を割り、白身が切れるまで菜箸で溶く。
   - 材料: 卵 3 個（150g）
   - 目安: 卵液に白いかたまりが残っていない
2. **卵をレンジで固める（2 分 / heat）** レンジ・900W 溶き卵をふんわりラップし、レンジ 900W で 20 秒→取り出して混ぜる→20 秒→混ぜる→15 秒。（600W なら各 1.4 倍）
   - 材料: 卵 3 個（150g）
   - 目安: ぽろぽろの炒り卵状で、汁気が透明でなく黄色く固まっている
   - ⚠ 生っぽい部分が残るときは 10 秒ずつ追加。ムラが出るので必ず途中で混ぜる
   - 🍼 子どもの分は特に、液が残らないまで固める
3. **うどんをレンジで温める（5 分 / wait）** レンジ・900W ボウル（大）に冷凍うどん 3 玉を重ならないよう並べ、ふんわりラップしてレンジ 900W で 5 分。
   - 材料: 冷凍うどん 3 玉（600g）
   - 目安: ほぐすと塊が無く、全体が湯気を立てて熱い
   - ⏱ 5 分
   - ⚠ ラップをはがすとき蒸気でやけどしやすい
4. **子どもの分を取り分けて準備する（うどん加熱中）（3 分 / prep）** 固めた卵の 1/3 を別の取り皿に取り、包丁で 5mm 程度に刻む。ザルにしらす 5g を入れ、ケトルの湯を回しかけて水を切る（塩抜き）。大人用の小皿に醤油 大さじ 1 とごま油 小さじ 1 を合わせ、しらす 30g を用意する。
   - 材料: 卵 3 個（150g）・しらす 35 g・醤油 大さじ 1（18g）・ごま油 小さじ 1（4g）
   - 目安: しらすが白くふっくらして、湯気が上がる
   - 🍼 子ども用は醤油・ごま油を入れない
5. **子どもの分を取り分ける（1 分 / prep）** うどんを取り出し、味付け前に 1/2 玉（約 100g）を子ども用の皿へ。まな板で 2cm 長さに刻み、刻んだ卵と塩抜きしたしらすを混ぜて冷ます。
   - 材料: 冷凍うどん 3 玉（600g）・卵 3 個（150g）・しらす 35 g
   - 目安: 手で触れる温度（人肌）まで冷めている
   - 🍼 冷ましてから出す。手づかみしたがるなら刻んだうどんと卵を平たくまとめてもよい
6. **大人の分を和えて盛る（3 分 / serve）** 残りのうどん（約 2.5 玉）に、残りの卵・しらす 30g・醤油 大さじ 1・ごま油 小さじ 1 を加え、菜箸で全体を絡める。2 皿に盛り、白ごま 小さじ 1 とかつお節をかける。
   - 材料: 冷凍うどん 3 玉（600g）・卵 3 個（150g）・しらす 35 g・醤油 大さじ 1（18g）・ごま油 小さじ 1（4g）・白ごま 小さじ 1（3g）・かつお節 2 g
   - 目安: うどん全体に卵としらすがまとわりつき、つややかに光る

## 子どもの分

- 取り分け: separate ・ 大きさ: うどんは2cm長さに刻む。卵は完全に固めて5mm程度に刻む。しらすは熱湯をかけて塩抜き
- 醤油・ごま油は入れない（味付け前に取り分け）。冷ましてから出す。初めての食材は無し

## 保存・翌日

- 冷蔵 1 日 ・ 冷凍 不向き
- 温め直し: 作りたてを食べ切る。残ったらレンジ600Wで湯気が立つまで温める

## 片付け

- 食洗機: ボウル（大）, ボウル（中）
- 手洗い: —
- 火を使わないのでコンロの洗い物は無し

## 作ったときのメモ

