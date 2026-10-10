---
listed: "2026-10-10T09:06:44+09:00"
id: r-20261010-corn-milk-potage-okra-tuna-yogurt
title: コーンのミルクポタージュとオクラとツナのヨーグルト和え（翌日分の仕込み）
version: 1
supersedes: null
status: draft
created: '2026-10-10'
request: req-20261010-0858-g8xb
generated_by: {model: claude-code, prompt_version: 3}
type: prep
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 28, active: 18, raw_estimate: 28, speed_factor: 1.0}
image_text: やさしい黄色のなめらかなポタージュに、取り置いたコーンの粒をのせる。緑のオクラの星形と白いヨーグルトにツナと塩昆布をあしらった和え物が添う。
dishes:
- {name: コーンのミルクポタージュ, role: soup}
- {name: オクラとツナのヨーグルト和え, role: side}
equipment: [gas-l, pot20, blender, microwave, bowl-m, kettle]
ingredients:
- {name: コーン缶（ホール）, qty: 1, unit: 缶, grams: 120, pantry: コーン缶, for: コーンのミルクポタージュ, substitute: null, use_up: false}
- {name: 牛乳, qty: 300, unit: ml, grams: 309, pantry: 牛乳, for: コーンのミルクポタージュ, substitute: null, use_up: true}
- {name: 水, qty: 50, unit: ml, grams: 50, pantry: null, for: コーンのミルクポタージュ, substitute: null, use_up: false}
- {name: バター, qty: 10, unit: g, grams: 10, pantry: バター, for: コーンのミルクポタージュ, substitute: null, use_up: false}
- {name: コンソメ, qty: 0.5, unit: 個, grams: null, pantry: コンソメ, for: コーンのミルクポタージュ, substitute: null, use_up: false}
- {name: 塩, qty: 1, unit: ひとつまみ, grams: 0.3, pantry: 塩, for: コーンのミルクポタージュ, substitute: null, use_up: false}
- {name: オクラ, qty: 3, unit: 本, grams: null, pantry: オクラ, for: オクラとツナのヨーグルト和え, substitute: null, use_up: true}
- {name: ツナ缶, qty: 1, unit: 缶, grams: 70, pantry: ツナ缶, for: オクラとツナのヨーグルト和え, substitute: null, use_up: false}
- {name: 無糖ヨーグルト, qty: 2, unit: 大さじ, grams: 30, pantry: 無糖ヨーグルト, for: オクラとツナのヨーグルト和え, substitute: null, use_up: true}
- {name: 塩昆布, qty: 5, unit: g, grams: 5, pantry: 塩昆布, for: オクラとツナのヨーグルト和え, substitute: null, use_up: false}
- {name: 酢, qty: 0.5, unit: 小さじ, grams: 2.5, pantry: 酢, for: オクラとツナのヨーグルト和え, substitute: null, use_up: false}
tags: [仕込み, 汁物, 和え物, ミキサー, 作り置き, やさしい味]
salt: {total_g: 2.4, adult_per_serving_g: 1.2, kid_g: 0.2}
kid: {rule: separate, cut: ポタージュは味付け前に100ml取り分ける。オクラは5mm角に刻み、ツナは熱湯で油と塩を流して細かくほぐす, note: コンソメ・塩・塩昆布を入れる前に取り分ける。熱いので冷ましてから出す。オクラは完全にやわらかくして粘りで窒息しないよう小さく。}
keep: {fridge_days: 2, freezer: false, reheat: ポタージュは鍋で弱火、湯気が立つまで温める（沸騰させない）。子どもの分は1日以内に、レンジ600Wで1分、混ぜて湯気が立つまで。和え物は食べる直前に混ぜる}
timeline:
- {minute: 0, lane: hands, text: コーンをザルにあけて汁を切る。大さじ2をトッピング用に取り置く}
- {minute: 2, lane: gas-l, text: 鍋にバターを溶かし、コーンを中火で炒める}
- {minute: 4, lane: gas-l, text: 牛乳300mlと水50mlを入れ、弱火で煮る（沸騰させない）}
- {minute: 4, lane: microwave, text: オクラ3本を900Wで1分加熱}
- {minute: 6, lane: hands, text: オクラのヘタを落として5mm幅に切り、ツナを缶から出して汁を切る}
- {minute: 9, lane: gas-l, text: 火を止めて粗熱を取る（10分）}
- {minute: 11, lane: hands, text: オクラとツナを別々の容器に入れて冷蔵。道具を洗う}
- {minute: 19, lane: hands, text: ミキサーでなめらかになるまで回す}
- {minute: 21, lane: hands, text: 子どもの分100mlを取り分ける}
- {minute: 22, lane: gas-l, text: 残りを鍋に戻し、コンソメ1/2個と塩を弱火で溶かす}
- {minute: 25, lane: hands, text: 浅い容器に移して粗熱を取り、冷蔵庫へ}
- {minute: 28, lane: hands, text: 片付け。ミキサーは手洗い}
steps:
- {dish: コーンのミルクポタージュ, n: 1, title: コーンの下ごしらえ, kind: prep, tag: cut, minutes: 2, heat: null, text: コーン缶をザルにあけて汁を切る。トッピング用に大さじ2を取り置く。,
  cue: ザルに水気が残らず、粒がばらけている, caution: null, timer: null, kid: null}
- dish: コーンのミルクポタージュ
  n: 2
  title: コーンを炒める
  kind: heat
  tag: stir-fry
  minutes: 2
  heat: {equipment: gas-l, level: 中火}
  text: 鍋(pot20)にバターを溶かし、コーン(トッピング以外)を中火で炒める。
  cue: バターの香りが立ち、コーンがつやつやする
  caution: 焦がすと苦くなる。バターが茶色になる前に次へ
  timer: null
  kid: null
- dish: コーンのミルクポタージュ
  n: 3
  title: 牛乳で煮る
  kind: wait
  tag: simmer
  minutes: 5
  heat: {equipment: gas-l, level: 弱火}
  text: 牛乳300mlと水50mlを加え、弱火で5分煮る。ときどき底から混ぜる。
  cue: 鍋の縁に細かい泡が出て、湯気が立つ。ぐらぐら沸かさない
  caution: 牛乳は吹きこぼれやすい。目を離さない
  timer: 300
  kid: null
- {dish: コーンのミルクポタージュ, n: 4, title: 粗熱を取ってミキサーにかける, kind: prep, tag: season, minutes: 12, heat: null, text: 火を止めて10分置き、人肌より少し温かいくらいに冷ます。ミキサーに移し、30〜40秒回す。,
  cue: 粒が見えず、とろりとなめらか, caution: 熱いままミキサーに入れない。ふたを手で押さえる, timer: null, kid: null}
- {dish: コーンのミルクポタージュ, n: 5, title: 子どもの分を取り分ける, kind: prep, tag: kid, minutes: 1, heat: null, text: 味付け前のポタージュを100ml、別の器に取り分ける。,
  cue: 器に移した量が約100ml, caution: null, timer: null, kid: 取り分けたら冷ましてから出す。小さいスプーンでとろみを確認。味付けなし}
- dish: コーンのミルクポタージュ
  n: 6
  title: 味付けして保存
  kind: heat
  tag: season
  minutes: 5
  heat: {equipment: gas-l, level: 弱火}
  text: 残りを鍋に戻し、コンソメ1/2個と塩ひとつまみを弱火で溶かす。浅い容器に移して粗熱を取り、30分以内に冷蔵。
  cue: コンソメが溶け、味見で甘みが引き立つ薄味
  caution: 常温に置き続けない
  timer: null
  kid: null
- dish: オクラとツナのヨーグルト和え
  n: 1
  title: オクラを加熱
  kind: wait
  tag: microwave
  minutes: 2
  heat: {equipment: microwave, level: 900W}
  text: オクラ3本をボウル(bowl-m)に入れ、水小さじ1とラップをして900Wで1分。ムラがあれば30秒追加。
  cue: 色が鮮やかな緑になり、竹串がすっと通る
  caution: 加熱後のラップは蒸気に注意
  timer: null
  kid: null
- {dish: オクラとツナのヨーグルト和え, n: 2, title: 切って保存, kind: prep, tag: cut, minutes: 3, heat: null, text: ヘタを落として5mm幅の小口切りにする。ツナは缶から出して汁を切る。別々の容器に入れて冷蔵。,
  cue: 断面が星形で、ぬめりが糸を引く, caution: null, timer: null, kid: null}
- dish: オクラとツナのヨーグルト和え
  n: 3
  title: 【当日の仕上げ】ポタージュを温める
  kind: heat
  tag: simmer
  minutes: 5
  heat: {equipment: gas-l, level: 弱火}
  text: 翌日、ポタージュを鍋に移して弱火で温め、湯気が立つまで混ぜる。器に盛り、取り置いたコーンをのせる。
  cue: 底までむらなく温かく、縁がふつふつする
  caution: 沸騰させると分離する
  timer: null
  kid: null
- {dish: オクラとツナのヨーグルト和え, n: 4, title: 【当日の仕上げ】和える, kind: prep, tag: season, minutes: 3, heat: null, text: オクラ、ツナ(大人分)、ヨーグルト大さじ2、塩昆布5g、酢小さじ1/2を和える。,
  cue: 全体にヨーグルトが絡み、塩昆布が混ざる, caution: null, timer: null, kid: 子どもの分は、和える前にオクラ約1/3本分とヨーグルト小さじ1だけ混ぜる。ツナは熱湯で油と塩を流した少量のみ}
cleanup:
  dishwasher: [bowl-m]
  hand: [pot20, blender]
  note: ミキサーは刃に注意。牛乳の鍋は先に水に浸す
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
---

## 段取り表（28 分）

| 分 | ガスコンロ左 | レンジ | 手 |
|---|---|---|---|
| 0 |  |  | コーンをザルにあけて汁を切る。大さじ2をトッピング用に取り置く |
| 2 | 鍋にバターを溶かし、コーンを中火で炒める |  |  |
| 4 | 牛乳300mlと水50mlを入れ、弱火で煮る（沸騰させない） | オクラ3本を900Wで1分加熱 |  |
| 6 |  |  | オクラのヘタを落として5mm幅に切り、ツナを缶から出して汁を切る |
| 9 | 火を止めて粗熱を取る（10分） |  |  |
| 11 |  |  | オクラとツナを別々の容器に入れて冷蔵。道具を洗う |
| 19 |  |  | ミキサーでなめらかになるまで回す |
| 21 |  |  | 子どもの分100mlを取り分ける |
| 22 | 残りを鍋に戻し、コンソメ1/2個と塩を弱火で溶かす |  |  |
| 25 |  |  | 浅い容器に移して粗熱を取り、冷蔵庫へ |
| 28 |  |  | 片付け。ミキサーは手洗い |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| コーン缶（ホール） | 1 缶（120g） | コーンのミルクポタージュ | コーン缶 |
| 牛乳 | 300 ml（309g） | コーンのミルクポタージュ 使い切り | 牛乳 |
| 水 | 50 ml（50g） | コーンのミルクポタージュ | — |
| バター | 10 g | コーンのミルクポタージュ | バター |
| コンソメ | 0.5 個 | コーンのミルクポタージュ | コンソメ |
| 塩 | 1 ひとつまみ（0.3g） | コーンのミルクポタージュ | 塩 |
| オクラ | 3 本 | オクラとツナのヨーグルト和え 使い切り | オクラ |
| ツナ缶 | 1 缶（70g） | オクラとツナのヨーグルト和え | ツナ缶 |
| 無糖ヨーグルト | 2 大さじ（30g） | オクラとツナのヨーグルト和え 使い切り | 無糖ヨーグルト |
| 塩昆布 | 5 g | オクラとツナのヨーグルト和え | 塩昆布 |
| 酢 | 0.5 小さじ（2.5g） | オクラとツナのヨーグルト和え | 酢 |

塩分: 合計 2.4g ・ 大人 1 人分 1.2g ・ 子ども 0.2g

## 手順

### コーンのミルクポタージュ
1. **コーンの下ごしらえ（2 分 / prep）** コーン缶をザルにあけて汁を切る。トッピング用に大さじ2を取り置く。
   - 目安: ザルに水気が残らず、粒がばらけている
2. **コーンを炒める（2 分 / heat）** ガスコンロ左・中火 鍋(pot20)にバターを溶かし、コーン(トッピング以外)を中火で炒める。
   - 目安: バターの香りが立ち、コーンがつやつやする
   - ⚠ 焦がすと苦くなる。バターが茶色になる前に次へ
3. **牛乳で煮る（5 分 / wait）** ガスコンロ左・弱火 牛乳300mlと水50mlを加え、弱火で5分煮る。ときどき底から混ぜる。
   - 目安: 鍋の縁に細かい泡が出て、湯気が立つ。ぐらぐら沸かさない
   - ⏱ 5 分
   - ⚠ 牛乳は吹きこぼれやすい。目を離さない
4. **粗熱を取ってミキサーにかける（12 分 / prep）** 火を止めて10分置き、人肌より少し温かいくらいに冷ます。ミキサーに移し、30〜40秒回す。
   - 目安: 粒が見えず、とろりとなめらか
   - ⚠ 熱いままミキサーに入れない。ふたを手で押さえる
5. **子どもの分を取り分ける（1 分 / prep）** 味付け前のポタージュを100ml、別の器に取り分ける。
   - 目安: 器に移した量が約100ml
   - 🍼 取り分けたら冷ましてから出す。小さいスプーンでとろみを確認。味付けなし
6. **味付けして保存（5 分 / heat）** ガスコンロ左・弱火 残りを鍋に戻し、コンソメ1/2個と塩ひとつまみを弱火で溶かす。浅い容器に移して粗熱を取り、30分以内に冷蔵。
   - 目安: コンソメが溶け、味見で甘みが引き立つ薄味
   - ⚠ 常温に置き続けない

### オクラとツナのヨーグルト和え
1. **オクラを加熱（2 分 / wait）** レンジ・900W オクラ3本をボウル(bowl-m)に入れ、水小さじ1とラップをして900Wで1分。ムラがあれば30秒追加。
   - 目安: 色が鮮やかな緑になり、竹串がすっと通る
   - ⚠ 加熱後のラップは蒸気に注意
2. **切って保存（3 分 / prep）** ヘタを落として5mm幅の小口切りにする。ツナは缶から出して汁を切る。別々の容器に入れて冷蔵。
   - 目安: 断面が星形で、ぬめりが糸を引く
3. **【当日の仕上げ】ポタージュを温める（5 分 / heat）** ガスコンロ左・弱火 翌日、ポタージュを鍋に移して弱火で温め、湯気が立つまで混ぜる。器に盛り、取り置いたコーンをのせる。
   - 目安: 底までむらなく温かく、縁がふつふつする
   - ⚠ 沸騰させると分離する
4. **【当日の仕上げ】和える（3 分 / prep）** オクラ、ツナ(大人分)、ヨーグルト大さじ2、塩昆布5g、酢小さじ1/2を和える。
   - 目安: 全体にヨーグルトが絡み、塩昆布が混ざる
   - 🍼 子どもの分は、和える前にオクラ約1/3本分とヨーグルト小さじ1だけ混ぜる。ツナは熱湯で油と塩を流した少量のみ

## 子どもの分

- 取り分け: separate ・ 大きさ: ポタージュは味付け前に100ml取り分ける。オクラは5mm角に刻み、ツナは熱湯で油と塩を流して細かくほぐす
- コンソメ・塩・塩昆布を入れる前に取り分ける。熱いので冷ましてから出す。オクラは完全にやわらかくして粘りで窒息しないよう小さく。

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 不向き
- 温め直し: ポタージュは鍋で弱火、湯気が立つまで温める（沸騰させない）。子どもの分は1日以内に、レンジ600Wで1分、混ぜて湯気が立つまで。和え物は食べる直前に混ぜる

## 片付け

- 食洗機: ボウル（中）
- 手洗い: 鍋, ミキサー
- ミキサーは刃に注意。牛乳の鍋は先に水に浸す

## 作ったときのメモ

