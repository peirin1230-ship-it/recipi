---
id: r-20261012-makku-mitaina-poteto
title: マックみたいなポテト
version: 1
supersedes: null
status: draft
created: '2026-10-12'
request: req-20261012-2037-8swn
generated_by: {model: claude-code, prompt_version: 8}
type: dinner
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 69, active: 28, raw_estimate: 68, speed_factor: 1.01}
image_text: 細くまっすぐなきつね色のポテトが、塩をまとってカリッと山盛り。皿の端にケチャップを添える。
dishes:
- {name: マックみたいなポテト, role: main}
equipment: [microwave, fp26, bowl-l, bowl-m, gas-r]
ingredients:
- {name: じゃがいも, qty: 3, unit: 個, grams: 450, pantry: じゃがいも, for: マックみたいなポテト, substitute: null, use_up: false}
- {name: 片栗粉, qty: 1, unit: 大さじ, grams: 9, pantry: 片栗粉, for: マックみたいなポテト, substitute: null, use_up: false}
- {name: サラダ油, qty: 6, unit: 大さじ, grams: 72, pantry: サラダ油, for: マックみたいなポテト, substitute: null, use_up: false}
- {name: 塩, qty: 0.33, unit: 小さじ, grams: 2, pantry: 塩, for: マックみたいなポテト, substitute: null, use_up: false}
tags: [ポテト, 揚げ焼き, 子ども向け, 時間無制限]
salt: {total_g: 2.0, adult_per_serving_g: 1.0, kid_g: 0.0}
kid: {rule: separate, cut: 7mm 棒を 5cm 程度に短くする。1-2歳は柔らかい中心の部分を選ぶ, note: 塩をふる前に取り分ける。冷ましてから出す。のどに詰めないよう座って食べる}
keep: {fridge_days: 1, freezer: false, reheat: トースターで 3〜4 分温め直す（揚げたてが一番）。}
timeline:
- {minute: 0, lane: hands, text: じゃがいもを7mm棒に切り水にさらす}
- {minute: 6, lane: hands, text: 10分さらしている間に油・皿を用意}
- {minute: 16, lane: microwave, text: 水を切って900W 1分30秒→混ぜて1分}
- {minute: 21, lane: hands, text: 水気を拭いて片栗粉をまぶす}
- {minute: 24, lane: hands, text: 冷凍庫へ（30分）}
- {minute: 54, lane: gas-r, text: 油を中火で熱し半量ずつ揚げ焼き}
- {minute: 64, lane: hands, text: 子どもの分を取り分け、塩をふって盛る}
steps:
- dish: マックみたいなポテト
  n: 1
  title: 細く切って水にさらす
  kind: prep
  tag: cut
  minutes: 6
  heat: null
  text: じゃがいも 3個は皮をむき、7mm 角×7cm の棒に切る（マックの細さ）。ボウル（大）に水を張って 10 分さらす。
  cue: 切り口が角張り、水が白く濁る。
  caution: 包丁はまな板に固定して、手を添える指は丸める。
  timer: null
  kid: null
  ingredients: [じゃがいも]
- dish: マックみたいなポテト
  n: 2
  title: レンジで下ゆで
  kind: heat
  tag: microwave
  minutes: 5
  heat: {equipment: microwave, level: 900W}
  text: ざるで水を切り、耐熱のボウル（中）に入れてラップをふんわりかける。900W で 1分30秒→全体を混ぜてさらに 1分。
  cue: 竹串がすっと入る手前、端が少し透き通る。煮崩れる前で止める。
  caution: ムラが出るので必ず途中で混ぜる。
  timer: null
  kid: null
  ingredients: [じゃがいも]
- dish: マックみたいなポテト
  n: 3
  title: 水気を拭いて粉をまぶす
  kind: prep
  tag: season
  minutes: 3
  heat: null
  text: キッチンペーパーに広げて 2 分ほど冷まし、表面の水気をよく拭く。ボウルに戻して片栗粉 大さじ1 を薄くまぶす。
  cue: 表面がさらっとして粉が白く付く。
  caution: null
  timer: null
  kid: null
  ingredients: [じゃがいも, 片栗粉]
- dish: マックみたいなポテト
  n: 4
  title: 冷凍庫で固める（マック風）
  kind: prep
  tag: wait
  minutes: 30
  heat: null
  text: バットかお皿に重ならないよう並べ、冷凍庫に 30 分入れる。この間にフライパンまわりと皿を用意する。
  cue: 触ると表面が固く、くっつかない。
  caution: null
  timer: 1800
  kid: null
  ingredients: [じゃがいも]
- dish: マックみたいなポテト
  n: 5
  title: 揚げ焼きにする
  kind: heat
  tag: sear
  minutes: 10
  heat: {equipment: gas-r, level: 中火}
  text: フライパン26cm にサラダ油 大さじ6 を入れ中火。菜箸の先から小さな泡が出たら（約160℃）半量ずつ入れ、最初の 2 分は触らず、その後ときどき転がして計 5〜6 分。残りも同様に。
  cue: 全体がきつね色でカリッと軽い音がする。
  caution: 油がはねるので水気は必ず拭く。強火にしない（フッ素加工）。鍋に油を張る揚げ方はしない。
  timer: null
  kid: 大人が塩をふる前に、子どもの分を先に取り分ける（次の工程）。
  ingredients: [じゃがいも, サラダ油]
- dish: マックみたいなポテト
  n: 6
  title: 取り分けて塩をふる・盛る
  kind: serve
  tag: serve
  minutes: 4
  heat: null
  text: キッチンペーパーに上げて油を切る。先に子どもの分（約 1/4 量）を別の皿に取り分けて冷ます。残りに塩 小さじ1/3 をふり、全体を揺すって混ぜ、盛る。
  cue: 塩が均一に付き、湯気が立つ。
  caution: null
  timer: null
  kid: 子どもの分は塩なし。7mm 棒は手づかみ向きだが、1cm以下の長さに折るか短めに切り、冷めてから出す。
  ingredients: [じゃがいも, 塩]
cleanup:
  dishwasher: [bowl-l, bowl-m]
  hand: [fp26]
  note: 油は冷めてからキッチンペーパーで拭き取る
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
---

## 段取り表（69 分）

| 分 | ガスコンロ右 | レンジ | 手 |
|---|---|---|---|
| 0 |  |  | じゃがいもを7mm棒に切り水にさらす |
| 6 |  |  | 10分さらしている間に油・皿を用意 |
| 16 |  | 水を切って900W 1分30秒→混ぜて1分 |  |
| 21 |  |  | 水気を拭いて片栗粉をまぶす |
| 24 |  |  | 冷凍庫へ（30分） |
| 54 | 油を中火で熱し半量ずつ揚げ焼き |  |  |
| 64 |  |  | 子どもの分を取り分け、塩をふって盛る |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| じゃがいも | 3 個（450g） | マックみたいなポテト | じゃがいも |
| 片栗粉 | 1 大さじ（9g） | マックみたいなポテト | 片栗粉 |
| サラダ油 | 6 大さじ（72g） | マックみたいなポテト | サラダ油 |
| 塩 | 0.33 小さじ（2g） | マックみたいなポテト | 塩 |

塩分: 合計 2.0g ・ 大人 1 人分 1.0g ・ 子ども 0.0g

## 手順

### マックみたいなポテト
1. **細く切って水にさらす（6 分 / prep）** じゃがいも 3個は皮をむき、7mm 角×7cm の棒に切る（マックの細さ）。ボウル（大）に水を張って 10 分さらす。
   - 材料: じゃがいも 3 個（450g）
   - 目安: 切り口が角張り、水が白く濁る。
   - ⚠ 包丁はまな板に固定して、手を添える指は丸める。
2. **レンジで下ゆで（5 分 / heat）** レンジ・900W ざるで水を切り、耐熱のボウル（中）に入れてラップをふんわりかける。900W で 1分30秒→全体を混ぜてさらに 1分。
   - 材料: じゃがいも 3 個（450g）
   - 目安: 竹串がすっと入る手前、端が少し透き通る。煮崩れる前で止める。
   - ⚠ ムラが出るので必ず途中で混ぜる。
3. **水気を拭いて粉をまぶす（3 分 / prep）** キッチンペーパーに広げて 2 分ほど冷まし、表面の水気をよく拭く。ボウルに戻して片栗粉 大さじ1 を薄くまぶす。
   - 材料: じゃがいも 3 個（450g）・片栗粉 大さじ 1（9g）
   - 目安: 表面がさらっとして粉が白く付く。
4. **冷凍庫で固める（マック風）（30 分 / prep）** バットかお皿に重ならないよう並べ、冷凍庫に 30 分入れる。この間にフライパンまわりと皿を用意する。
   - 材料: じゃがいも 3 個（450g）
   - 目安: 触ると表面が固く、くっつかない。
   - ⏱ 30 分
5. **揚げ焼きにする（10 分 / heat）** ガスコンロ右・中火 フライパン26cm にサラダ油 大さじ6 を入れ中火。菜箸の先から小さな泡が出たら（約160℃）半量ずつ入れ、最初の 2 分は触らず、その後ときどき転がして計 5〜6 分。残りも同様に。
   - 材料: じゃがいも 3 個（450g）・サラダ油 大さじ 6（72g）
   - 目安: 全体がきつね色でカリッと軽い音がする。
   - ⚠ 油がはねるので水気は必ず拭く。強火にしない（フッ素加工）。鍋に油を張る揚げ方はしない。
   - 🍼 大人が塩をふる前に、子どもの分を先に取り分ける（次の工程）。
6. **取り分けて塩をふる・盛る（4 分 / serve）** キッチンペーパーに上げて油を切る。先に子どもの分（約 1/4 量）を別の皿に取り分けて冷ます。残りに塩 小さじ1/3 をふり、全体を揺すって混ぜ、盛る。
   - 材料: じゃがいも 3 個（450g）・塩 小さじ 1/3（2g）
   - 目安: 塩が均一に付き、湯気が立つ。
   - 🍼 子どもの分は塩なし。7mm 棒は手づかみ向きだが、1cm以下の長さに折るか短めに切り、冷めてから出す。

## 子どもの分

- 取り分け: separate ・ 大きさ: 7mm 棒を 5cm 程度に短くする。1-2歳は柔らかい中心の部分を選ぶ
- 塩をふる前に取り分ける。冷ましてから出す。のどに詰めないよう座って食べる

## 保存・翌日

- 冷蔵 1 日 ・ 冷凍 不向き
- 温め直し: トースターで 3〜4 分温め直す（揚げたてが一番）。

## 片付け

- 食洗機: ボウル（大）, ボウル（中）
- 手洗い: フライパン
- 油は冷めてからキッチンペーパーで拭き取る

## 作ったときのメモ

