---
id: r-20261110-kabocha-to-daizu-no-miso-yogurt-salad
title: かぼちゃと大豆の味噌ヨーグルトサラダ
version: 1
supersedes: null
status: draft
created: '2026-11-10'
request: req-20261110-0008-lxvp
generated_by: {model: claude-code, prompt_version: 10}
type: prep
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 87, active: 17, raw_estimate: 77, speed_factor: 1.25}
image_text: 85℃でほくほくに仕上がったかぼちゃの黄色に、大豆のベージュがまざる。味噌ヨーグルトのやさしい白がかかり、黒こしょうをひとふり。
dishes:
- {name: かぼちゃと大豆の味噌ヨーグルトサラダ, role: side}
equipment: [sous-vide, bowl-m]
ingredients:
- {name: かぼちゃ, qty: 0.25, unit: 個, grams: 300, pantry: かぼちゃ, for: かぼちゃと大豆の味噌ヨーグルトサラダ, substitute: null, use_up: false}
- {name: 大豆水煮, qty: 0.5, unit: パック, grams: 100, pantry: 大豆水煮, for: かぼちゃと大豆の味噌ヨーグルトサラダ, substitute: null, use_up: false}
- {name: バター, qty: 10, unit: g, grams: 10, pantry: バター, for: かぼちゃと大豆の味噌ヨーグルトサラダ, substitute: null, use_up: false}
- {name: ヨーグルト, qty: 3, unit: 大さじ, grams: 45, pantry: ヨーグルト, for: かぼちゃと大豆の味噌ヨーグルトサラダ, substitute: null, use_up: false}
- {name: 味噌, qty: 1, unit: 小さじ, grams: 6, pantry: 味噌, for: かぼちゃと大豆の味噌ヨーグルトサラダ, substitute: null, use_up: false}
- {name: こしょう, qty: 1, unit: ふり, grams: 0.1, pantry: こしょう, for: かぼちゃと大豆の味噌ヨーグルトサラダ, substitute: null, use_up: false}
tags: [低温調理, 仕込み, 副菜, ヨーグルト]
salt: {total_g: 0.9, adult_per_serving_g: 0.5, kid_g: 0.1}
kid: {rule: separate, cut: かぼちゃは1cm角につぶす。大豆は丸のままにせずチョッパーでつぶす。, note: 味噌を入れる前に取り分ける。}
keep: {fridge_days: 2, freezer: false, reheat: 冷たいまま。出す前に軽く混ぜる。}
timeline:
- {minute: 0, lane: sous-vide, text: 低温調理器を85℃にセット、ケトルの湯を入れて温め始める}
- {minute: 0, lane: hands, text: かぼちゃを2cm角に切り、バターと袋に入れて空気を抜く}
- {minute: 8, lane: sous-vide, text: 湯が85℃になったら袋を沈める(1時間)}
- {minute: 8, lane: hands, text: 大豆を水切り。ヨーグルトと味噌をまぜる}
- {minute: 68, lane: hands, text: 袋を取り出し、子どもの分を取り分けてからあえる}
- {minute: 74, lane: hands, text: 冷まして冷蔵庫へ}
steps:
- dish: かぼちゃと大豆の味噌ヨーグルトサラダ
  n: 1
  title: かぼちゃを袋に入れる
  kind: prep
  tag: cut
  minutes: 6
  start: 0
  heat: null
  text: 低温調理器を85℃にセットしケトルの湯を入れる。かぼちゃ1/4個は種とわたを取り、2cm角に切る。耐熱の袋(湯せん可)にバター10gとかぼちゃを入れ、空気を抜いて口を閉じる。
  cue: かぼちゃが重ならず1層に並び、袋が閉じている。
  caution: null
  timer: null
  kid: null
  ingredients: [かぼちゃ, バター]
- dish: かぼちゃと大豆の味噌ヨーグルトサラダ
  n: 2
  title: 85℃で1時間
  kind: wait
  tag: wait
  minutes: 60
  start: 8
  heat: {equipment: sous-vide, level: 85℃}
  text: 湯が85℃になったら袋を沈め、1時間(60分)そのまま。
  cue: 竹串がすっと通り、角が崩れず中まで均一にやわらかい。
  caution: 袋は湯に完全に沈める。
  timer: 3600
  kid: null
  ingredients: [かぼちゃ]
- dish: かぼちゃと大豆の味噌ヨーグルトサラダ
  n: 3
  title: ソースを準備
  kind: prep
  tag: season
  minutes: 5
  start: 8
  heat: null
  text: 待っている間に、大豆水煮1/2パックをザルにあげて水を切る。ボウルにヨーグルト大さじ3と味噌小さじ1を混ぜる。
  cue: 味噌のかたまりが無く、なめらか。
  caution: null
  timer: null
  kid: null
  ingredients: [大豆水煮, ヨーグルト, 味噌]
- dish: かぼちゃと大豆の味噌ヨーグルトサラダ
  n: 4
  title: 取り分けてあえる
  kind: prep
  tag: season
  minutes: 6
  start: 68
  heat: null
  text: 袋を取り出して軽く冷ます。子ども用にかぼちゃ1/5と大豆をチョッパーに入れ、ヨーグルト大さじ1を足して粗くつぶす(味噌なし)。残りのかぼちゃをフォークで半分ほどつぶし、大豆と味噌ヨーグルトであえる。こしょうをひとふり。
  cue: かぼちゃがほろっと崩れ、ソースが全体にからむ。
  caution: null
  timer: null
  kid: 子ども用は1cm以下のやわらかさ。丸い大豆は必ずつぶす。
  ingredients: [かぼちゃ, 大豆水煮, ヨーグルト, 味噌, こしょう]
- dish: かぼちゃと大豆の味噌ヨーグルトサラダ
  n: 5
  title: 冷まして保存
  kind: serve
  tag: serve
  minutes: 3
  start: 74
  heat: null
  text: ボウルごと冷まし、ラップをして冷蔵庫へ。翌日は混ぜてそのまま出す。
  cue: 湯気が出ず冷たい。
  caution: null
  timer: null
  kid: null
  ingredients: []
cleanup:
  dishwasher: [bowl-m]
  hand: []
  note: null
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261110-sake-to-jagaimo-no-milk-gratin]
---

一緒に作る: `r-20261110-sake-to-jagaimo-no-milk-gratin`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（87 分）

| 分 | 低温調理器 | 手 |
|---|---|---|
| 0 | 低温調理器を85℃にセット、ケトルの湯を入れて温め始める | かぼちゃを2cm角に切り、バターと袋に入れて空気を抜く |
| 8 | 湯が85℃になったら袋を沈める(1時間) | 大豆を水切り。ヨーグルトと味噌をまぜる |
| 68 |  | 袋を取り出し、子どもの分を取り分けてからあえる |
| 74 |  | 冷まして冷蔵庫へ |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| かぼちゃ | 0.25 個（300g） | かぼちゃと大豆の味噌ヨーグルトサラダ | かぼちゃ |
| 大豆水煮 | 0.5 パック（100g） | かぼちゃと大豆の味噌ヨーグルトサラダ | 大豆水煮 |
| バター | 10 g | かぼちゃと大豆の味噌ヨーグルトサラダ | バター |
| ヨーグルト | 3 大さじ（45g） | かぼちゃと大豆の味噌ヨーグルトサラダ | ヨーグルト |
| 味噌 | 1 小さじ（6g） | かぼちゃと大豆の味噌ヨーグルトサラダ | 味噌 |
| こしょう | 1 ふり（0.1g） | かぼちゃと大豆の味噌ヨーグルトサラダ | こしょう |

塩分: 合計 0.9g ・ 大人 1 人分 0.5g ・ 子ども 0.1g

## 手順

### かぼちゃと大豆の味噌ヨーグルトサラダ
1. **かぼちゃを袋に入れる（6 分 / prep）** 低温調理器を85℃にセットしケトルの湯を入れる。かぼちゃ1/4個は種とわたを取り、2cm角に切る。耐熱の袋(湯せん可)にバター10gとかぼちゃを入れ、空気を抜いて口を閉じる。
   - 材料: かぼちゃ 1/4 個（300g）・バター 10 g
   - 目安: かぼちゃが重ならず1層に並び、袋が閉じている。
2. **85℃で1時間（60 分 / wait）** 低温調理器・85℃ 湯が85℃になったら袋を沈め、1時間(60分)そのまま。
   - 材料: かぼちゃ 1/4 個（300g）
   - 目安: 竹串がすっと通り、角が崩れず中まで均一にやわらかい。
   - ⏱ 60 分
   - ⚠ 袋は湯に完全に沈める。
3. **ソースを準備（5 分 / prep）** 待っている間に、大豆水煮1/2パックをザルにあげて水を切る。ボウルにヨーグルト大さじ3と味噌小さじ1を混ぜる。
   - 材料: 大豆水煮 1/2 パック（100g）・ヨーグルト 大さじ 3（45g）・味噌 小さじ 1（6g）
   - 目安: 味噌のかたまりが無く、なめらか。
4. **取り分けてあえる（6 分 / prep）** 袋を取り出して軽く冷ます。子ども用にかぼちゃ1/5と大豆をチョッパーに入れ、ヨーグルト大さじ1を足して粗くつぶす(味噌なし)。残りのかぼちゃをフォークで半分ほどつぶし、大豆と味噌ヨーグルトであえる。こしょうをひとふり。
   - 材料: かぼちゃ 1/4 個（300g）・大豆水煮 1/2 パック（100g）・ヨーグルト 大さじ 3（45g）・味噌 小さじ 1（6g）・こしょう 1 ふり（0.1g）
   - 目安: かぼちゃがほろっと崩れ、ソースが全体にからむ。
   - 🍼 子ども用は1cm以下のやわらかさ。丸い大豆は必ずつぶす。
5. **冷まして保存（3 分 / serve）** ボウルごと冷まし、ラップをして冷蔵庫へ。翌日は混ぜてそのまま出す。
   - 目安: 湯気が出ず冷たい。

## 子どもの分

- 取り分け: separate ・ 大きさ: かぼちゃは1cm角につぶす。大豆は丸のままにせずチョッパーでつぶす。
- 味噌を入れる前に取り分ける。

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 不向き
- 温め直し: 冷たいまま。出す前に軽く混ぜる。

## 片付け

- 食洗機: ボウル（中）
- 手洗い: —

## 作ったときのメモ

