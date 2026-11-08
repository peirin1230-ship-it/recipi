---
id: r-20261108-butakatarosu-teion-butter-shoyu-saute
title: 豚肩ロースの低温調理 バター醤油ソテー
version: 1
supersedes: null
status: draft
created: '2026-11-08'
request: req-20261108-1721-btvi
generated_by: {model: claude-code, prompt_version: 10}
type: prep
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 191, active: 40, raw_estimate: 170, speed_factor: 1.15}
image_text: こんがり焼き色の付いた厚めの豚肩ロースに、バター醤油のつやがかかり、断面はほんのり桜色でしっとり。白い皿に切り分けて盛る。
dishes:
- {name: 豚肩ロースの低温調理 バター醤油ソテー, role: main}
equipment: [sous-vide, fp26, gas-r, bowl-l, bowl-m]
ingredients:
- {name: 豚肩ロース肉, qty: 300, unit: g, grams: 300, pantry: 豚肩ロース肉, for: 豚肩ロースの低温調理 バター醤油ソテー, substitute: null, use_up: true}
- {name: 塩, qty: 0.25, unit: 小さじ, grams: 1.5, pantry: null, for: 豚肩ロースの低温調理 バター醤油ソテー, substitute: null, use_up: false}
- {name: 砂糖, qty: 0.25, unit: 小さじ, grams: 0.8, pantry: null, for: 豚肩ロースの低温調理 バター醤油ソテー, substitute: null, use_up: false}
- {name: バター, qty: 10, unit: g, grams: 10, pantry: null, for: 豚肩ロースの低温調理 バター醤油ソテー, substitute: null, use_up: false}
- {name: 醤油, qty: 0.5, unit: 小さじ, grams: 3, pantry: null, for: 豚肩ロースの低温調理 バター醤油ソテー, substitute: null, use_up: false}
- {name: みりん, qty: 1, unit: 小さじ, grams: 6, pantry: null, for: 豚肩ロースの低温調理 バター醤油ソテー, substitute: null, use_up: false}
- {name: サラダ油, qty: 0.5, unit: 小さじ, grams: 2, pantry: null, for: 豚肩ロースの低温調理 バター醤油ソテー, substitute: null, use_up: false}
tags: [豚肩ロース, 低温調理, 仕込み, バター醤油, 子ども取り分け]
salt: {total_g: 2.1, adult_per_serving_g: 1.05, kid_g: 0.2}
kid: {rule: separate, cut: 低温調理の肉は使わず、ソテー前に取り分けた生の肉 約50gを1cm角以下に切り、フライパンで中まで焼く, note: タレを付ける前に取り分ける。塩は肉の下味のみ。中が白くなるまで両面1分ずつ焼き、冷ましてから出す}
keep: {fridge_days: 2, freezer: false, reheat: 袋のまま冷蔵。翌日フライパンで焼き目を付け、中心まで湯気が立つくらい温める}
timeline:
- {minute: 0, lane: sous-vide, text: 水を張り63℃にセット}
- {minute: 2, lane: hands, text: 豚肩ロースを2つに切り、塩・砂糖を揉み込む（15分置く）}
- {minute: 17, lane: hands, text: 袋に入れ空気を抜いて密閉}
- {minute: 20, lane: sous-vide, text: 湯に沈めて2時間}
- {minute: 140, lane: hands, text: 氷水で急冷し冷蔵（ここまでが仕込み）}
- {minute: 160, lane: gas-r, text: （翌日）フライパンで焼き目を付け、バター醤油をからめる}
- {minute: 166, lane: hands, text: 切り分けて盛り付け・配膳}
steps:
- dish: 豚肩ロースの低温調理 バター醤油ソテー
  n: 1
  title: 低温調理器を温める
  kind: prep
  tag: wait
  minutes: 2
  start: 0
  heat: {equipment: sous-vide, level: 63℃}
  text: 低温調理器に水を張り、63℃にセットして温め始める。
  cue: 水温が63℃に届くと表示が安定する
  caution: null
  timer: null
  kid: null
  ingredients: []
- dish: 豚肩ロースの低温調理 バター醤油ソテー
  n: 2
  title: 下味
  kind: prep
  tag: marinate
  minutes: 15
  start: 2
  heat: null
  text: 豚肩ロース肉300gを厚さ3cm以内の2つに切る。塩 小さじ1/4、砂糖 小さじ1/4を全体に揉み込み、ボウル（中）に15分置く。その間に子どもの分として端から約50gを切り分けて別皿に取り、冷蔵しておく（味付けはこの下味のみ）。
  cue: 表面がしっとり湿り、塩砂糖が溶けて見えなくなる
  caution: 厚さ3cm以内にする（それ以上は時間が足りず危険）
  timer: 900
  kid: 取り分けた50gは翌日、中まで焼く
  ingredients: [豚肩ロース肉, 塩, 砂糖]
- dish: 豚肩ロースの低温調理 バター醤油ソテー
  n: 3
  title: 袋に入れる
  kind: prep
  tag: cut
  minutes: 3
  start: 17
  heat: null
  text: 耐熱の袋に肉を重ならないよう入れ、空気を抜いて密閉する。
  cue: 袋が肉に張り付き、空気が見えない
  caution: null
  timer: null
  kid: null
  ingredients: [豚肩ロース肉]
- dish: 豚肩ロースの低温調理 バター醤油ソテー
  n: 4
  title: 低温調理
  kind: wait
  tag: wait
  minutes: 120
  start: 20
  heat: {equipment: sous-vide, level: 63℃}
  text: 水温が63℃になっているのを確かめて袋を沈め、2時間おく。その間に副菜を作る。
  cue: 2時間たつと肉の表面が白く、触ると弾力がある
  caution: 63℃2時間未満では出さない
  timer: 7200
  kid: null
  ingredients: []
- dish: 豚肩ロースの低温調理 バター醤油ソテー
  n: 5
  title: 急冷・保存
  kind: prep
  tag: cleanup
  minutes: 10
  start: 140
  heat: null
  text: 袋ごと氷水に10分つけて急冷し、水気を拭いて冷蔵する。
  cue: 袋の中心まで冷たくなる
  caution: null
  timer: null
  kid: null
  ingredients: []
- dish: 豚肩ロースの低温調理 バター醤油ソテー
  n: 6
  title: 翌日：焼いてからめる
  kind: heat
  tag: sear
  minutes: 6
  start: 160
  heat: {equipment: gas-r, level: 中火}
  text: 翌日、袋から出して水気を拭く。フライパン（fp26）にサラダ油 小さじ1/2を入れ中火で予熱1分、肉を入れて各面1分半ずつ焼き色を付ける。火を弱火にし、バター10g、醤油 小さじ1/2、みりん 小さじ1を入れて20秒からめる。取り分けた子どもの分は1cm以下に切り、別に両面1分ずつ中まで焼く。
  cue: 表面にこんがり焼き色が付き、たれが泡立ってとろりと絡む。子どもの分は切って白く、赤みが無い
  caution: たれは焦げやすい。弱火にしてから入れる
  timer: null
  kid: 子どもの分は切って白くなるまで焼いて冷ます
  ingredients: [豚肩ロース肉, サラダ油, バター, 醤油, みりん]
- dish: 豚肩ロースの低温調理 バター醤油ソテー
  n: 7
  title: 切って盛る
  kind: serve
  tag: serve
  minutes: 4
  start: 166
  heat: null
  text: 1cm弱の厚さに切って皿に盛り、フライパンのたれをかける。子どもの分は冷ましてから出す。
  cue: 断面がほんのり桜色でしっとり、肉汁が透明
  caution: null
  timer: null
  kid: 熱いまま出さない
  ingredients: [豚肩ロース肉]
cleanup:
  dishwasher: [bowl-m, bowl-l]
  hand: [fp26]
  note: 袋は洗って干す
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261108-tsumire-kabocha-nasu-no-misoni-broccoli]
---

一緒に作る: `r-20261108-tsumire-kabocha-nasu-no-misoni-broccoli`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（191 分）

| 分 | ガスコンロ右 | 低温調理器 | 手 |
|---|---|---|---|
| 0 |  | 水を張り63℃にセット |  |
| 2 |  |  | 豚肩ロースを2つに切り、塩・砂糖を揉み込む（15分置く） |
| 17 |  |  | 袋に入れ空気を抜いて密閉 |
| 20 |  | 湯に沈めて2時間 |  |
| 140 |  |  | 氷水で急冷し冷蔵（ここまでが仕込み） |
| 160 | （翌日）フライパンで焼き目を付け、バター醤油をからめる |  |  |
| 166 |  |  | 切り分けて盛り付け・配膳 |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| 豚肩ロース肉 | 300 g | 豚肩ロースの低温調理 バター醤油ソテー 使い切り | 豚肩ロース肉 |
| 塩 | 0.25 小さじ（1.5g） | 豚肩ロースの低温調理 バター醤油ソテー | — |
| 砂糖 | 0.25 小さじ（0.8g） | 豚肩ロースの低温調理 バター醤油ソテー | — |
| バター | 10 g | 豚肩ロースの低温調理 バター醤油ソテー | — |
| 醤油 | 0.5 小さじ（3g） | 豚肩ロースの低温調理 バター醤油ソテー | — |
| みりん | 1 小さじ（6g） | 豚肩ロースの低温調理 バター醤油ソテー | — |
| サラダ油 | 0.5 小さじ（2g） | 豚肩ロースの低温調理 バター醤油ソテー | — |

塩分: 合計 2.1g ・ 大人 1 人分 1.05g ・ 子ども 0.2g

## 手順

### 豚肩ロースの低温調理 バター醤油ソテー
1. **低温調理器を温める（2 分 / prep）** 低温調理器・63℃ 低温調理器に水を張り、63℃にセットして温め始める。
   - 目安: 水温が63℃に届くと表示が安定する
2. **下味（15 分 / prep）** 豚肩ロース肉300gを厚さ3cm以内の2つに切る。塩 小さじ1/4、砂糖 小さじ1/4を全体に揉み込み、ボウル（中）に15分置く。その間に子どもの分として端から約50gを切り分けて別皿に取り、冷蔵しておく（味付けはこの下味のみ）。
   - 材料: 豚肩ロース肉 300 g・塩 小さじ 1/4（1.5g）・砂糖 小さじ 1/4（0.8g）
   - 目安: 表面がしっとり湿り、塩砂糖が溶けて見えなくなる
   - ⏱ 15 分
   - ⚠ 厚さ3cm以内にする（それ以上は時間が足りず危険）
   - 🍼 取り分けた50gは翌日、中まで焼く
3. **袋に入れる（3 分 / prep）** 耐熱の袋に肉を重ならないよう入れ、空気を抜いて密閉する。
   - 材料: 豚肩ロース肉 300 g
   - 目安: 袋が肉に張り付き、空気が見えない
4. **低温調理（120 分 / wait）** 低温調理器・63℃ 水温が63℃になっているのを確かめて袋を沈め、2時間おく。その間に副菜を作る。
   - 目安: 2時間たつと肉の表面が白く、触ると弾力がある
   - ⏱ 120 分
   - ⚠ 63℃2時間未満では出さない
5. **急冷・保存（10 分 / prep）** 袋ごと氷水に10分つけて急冷し、水気を拭いて冷蔵する。
   - 目安: 袋の中心まで冷たくなる
6. **翌日：焼いてからめる（6 分 / heat）** ガスコンロ右・中火 翌日、袋から出して水気を拭く。フライパン（fp26）にサラダ油 小さじ1/2を入れ中火で予熱1分、肉を入れて各面1分半ずつ焼き色を付ける。火を弱火にし、バター10g、醤油 小さじ1/2、みりん 小さじ1を入れて20秒からめる。取り分けた子どもの分は1cm以下に切り、別に両面1分ずつ中まで焼く。
   - 材料: 豚肩ロース肉 300 g・サラダ油 小さじ 1/2（2g）・バター 10 g・醤油 小さじ 1/2（3g）・みりん 小さじ 1（6g）
   - 目安: 表面にこんがり焼き色が付き、たれが泡立ってとろりと絡む。子どもの分は切って白く、赤みが無い
   - ⚠ たれは焦げやすい。弱火にしてから入れる
   - 🍼 子どもの分は切って白くなるまで焼いて冷ます
7. **切って盛る（4 分 / serve）** 1cm弱の厚さに切って皿に盛り、フライパンのたれをかける。子どもの分は冷ましてから出す。
   - 材料: 豚肩ロース肉 300 g
   - 目安: 断面がほんのり桜色でしっとり、肉汁が透明
   - 🍼 熱いまま出さない

## 子どもの分

- 取り分け: separate ・ 大きさ: 低温調理の肉は使わず、ソテー前に取り分けた生の肉 約50gを1cm角以下に切り、フライパンで中まで焼く
- タレを付ける前に取り分ける。塩は肉の下味のみ。中が白くなるまで両面1分ずつ焼き、冷ましてから出す

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 不向き
- 温め直し: 袋のまま冷蔵。翌日フライパンで焼き目を付け、中心まで湯気が立つくらい温める

## 片付け

- 食洗機: ボウル（中）, ボウル（大）
- 手洗い: フライパン
- 袋は洗って干す

## 作ったときのメモ

