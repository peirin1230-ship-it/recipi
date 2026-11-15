---
id: r-20261115-ninjin-no-teion-chori-butter-glace
title: にんじんの低温調理バターグラッセ
version: 1
supersedes: null
status: draft
created: '2026-11-15'
request: req-20261115-1845-jxp2
generated_by: {model: claude-code, prompt_version: 10}
type: prep
servings: {adults: 2, kids: 1}
time: {budget: 0, planned: 90, active: 18, raw_estimate: 80, speed_factor: 1.23}
image_text: つやのあるオレンジのにんじんがバターをまとって角を残したまま並ぶ。持ちやすい棒状で、表面にうっすら照りが出ている。
dishes:
- {name: にんじんの低温調理バターグラッセ, role: side}
equipment: [sous-vide, fp26, gas-r]
ingredients:
- {name: にんじん, qty: 2, unit: 本, grams: 300, pantry: にんじん, for: にんじんの低温調理バターグラッセ, substitute: null, use_up: false}
- {name: バター, qty: 10, unit: g, grams: 10, pantry: バター, for: にんじんの低温調理バターグラッセ, substitute: null, use_up: false}
- {name: 砂糖, qty: 1, unit: 小さじ, grams: 3, pantry: 砂糖, for: にんじんの低温調理バターグラッセ, substitute: null, use_up: false}
- {name: 塩, qty: 0.125, unit: 小さじ, grams: 0.8, pantry: 塩, for: にんじんの低温調理バターグラッセ, substitute: null, use_up: false}
tags: [低温調理, 仕込み, 子ども取り分け, 手づかみ]
salt: {total_g: 0.9, adult_per_serving_g: 0.4, kid_g: 0.05}
kid: {rule: separate, cut: 1cm × 5cm の棒状（手づかみ用）, note: 子どもの分は塩を入れない別の小さい袋に、バター少しだけで入れる。85℃ 1 時間で歯ぐきでつぶせる柔らかさになる}
keep: {fridge_days: 2, freezer: true, reheat: 袋のまま冷蔵。翌日はフライパン 中火で袋の汁ごと 2 分、汁がとろりと照りが出るまで。子どもの分は湯気が立つまで温めて冷ます}
timeline:
- {minute: 0, lane: hands, text: にんじんの皮をむき、5cm 長さ × 1cm 角の棒状に切る}
- {minute: 6, lane: hands, text: 大人用の袋（バター・砂糖・塩）と子ども用の袋（バター少し）に分けて入れる}
- {minute: 8, lane: sous-vide, text: ささみを出した後の湯を 85℃ に上げ、袋を沈めて 1 時間}
- {minute: 68, lane: hands, text: 袋ごと氷水で冷まして冷蔵}
- {minute: 75, lane: gas-r, text: '翌日: フライパンで汁ごと温めて照りを出す'}
- {minute: 78, lane: hands, text: 盛り付け}
steps:
- dish: にんじんの低温調理バターグラッセ
  n: 1
  title: 切る
  kind: prep
  tag: cut
  minutes: 6
  start: 0
  heat: null
  text: にんじん 2 本の皮をピーラーでむき、長さ 5cm に切ってから 1cm 角の棒状に切る（ささみの低温調理の待ち時間にやる）。
  cue: 太さがそろった 1cm 角の棒
  caution: null
  timer: null
  kid: 子どもの分は 6〜8 本を別にしておく
  ingredients: [にんじん]
- dish: にんじんの低温調理バターグラッセ
  n: 2
  title: 袋に入れる
  kind: prep
  tag: season
  minutes: 2
  start: 6
  heat: null
  text: 耐熱の袋（湯せん可。85℃ に耐える物）に大人の分のにんじん・バター 8g・砂糖 小さじ 1・塩 小さじ 1/8 を入れる。子どもの分は小さい袋にバター 2g だけ入れる。どちらも平らにして空気を抜く。
  cue: 袋の中でにんじんが重ならず一層に並ぶ
  caution: null
  timer: null
  kid: 子どもの袋には塩と砂糖を入れない
  ingredients: [バター, 砂糖, 塩]
- dish: にんじんの低温調理バターグラッセ
  n: 3
  title: 85℃ で 1 時間
  kind: wait
  tag: wait
  minutes: 60
  start: 8
  heat: {equipment: sous-vide, level: 85℃}
  text: ささみを取り出した後、低温調理器を 85℃ に上げ、湯が 85℃ に届いたら 2 袋を沈めて 1 時間。
  cue: 竹串がすっと通り、角は崩れていない
  caution: ささみ（63℃）と同時には入れない。湯が 85℃ に届いてから入れる
  timer: 3600
  kid: null
  ingredients: []
- dish: にんじんの低温調理バターグラッセ
  n: 4
  title: 急冷して冷蔵
  kind: prep
  tag: cleanup
  minutes: 7
  start: 68
  heat: null
  text: 袋ごと氷水で 5 分冷まし、袋のまま冷蔵庫へ。
  cue: 袋が冷たい
  caution: null
  timer: null
  kid: null
  ingredients: []
- dish: にんじんの低温調理バターグラッセ
  n: 5
  title: '翌日: 照りを出す'
  kind: heat
  tag: stir-fry
  minutes: 3
  start: 75
  heat: {equipment: gas-r, level: 中火}
  text: 大人の袋の中身を汁ごとフライパン（fp26）に入れ、中火で 2 分転がして汁を煮詰める。子どもの袋は別に小皿でレンジ 600W 30 秒か、同じフライパンで先に 1 分温める。
  cue: 汁がとろりとしてにんじんに照りが付く。湯気が立つ
  caution: null
  timer: null
  kid: 子どもの分を先に温めて取り出し、冷ます
  ingredients: []
- dish: にんじんの低温調理バターグラッセ
  n: 6
  title: '翌日: 盛る'
  kind: serve
  tag: serve
  minutes: 2
  start: 78
  heat: null
  text: 大人は主菜の皿の横に盛る。子どもは手で持てるよう皿に並べる。
  cue: にんじんが崩れず並び、照りが残っている
  caution: null
  timer: null
  kid: 冷ましてから出す。手づかみで持てる棒状のまま
  ingredients: []
cleanup:
  dishwasher: []
  hand: [fp26]
  note: 低温調理の湯は主菜と共通。終わったら低温調理器を拭いて乾かす
photo: null
stats: {cooked: 0, r_avg: null, f_avg: null, last: null}
detail: full
together: [r-20261115-sasami-no-teion-chori-avocado-yogurt-sau]
---

一緒に作る: `r-20261115-sasami-no-teion-chori-avocado-yogurt-sau`（1 レシピ 1 品。副菜・汁物は別のレシピ）

## 段取り表（90 分）

| 分 | ガスコンロ右 | 低温調理器 | 手 |
|---|---|---|---|
| 0 |  |  | にんじんの皮をむき、5cm 長さ × 1cm 角の棒状に切る |
| 6 |  |  | 大人用の袋（バター・砂糖・塩）と子ども用の袋（バター少し）に分けて入れる |
| 8 |  | ささみを出した後の湯を 85℃ に上げ、袋を沈めて 1 時間 |  |
| 68 |  |  | 袋ごと氷水で冷まして冷蔵 |
| 75 | 翌日: フライパンで汁ごと温めて照りを出す |  |  |
| 78 |  |  | 盛り付け |

## 材料（大人 2・子 1）

| 材料 | 量 | 用途 | 在庫名 |
|---|---|---|---|
| にんじん | 2 本（300g） | にんじんの低温調理バターグラッセ | にんじん |
| バター | 10 g | にんじんの低温調理バターグラッセ | バター |
| 砂糖 | 1 小さじ（3g） | にんじんの低温調理バターグラッセ | 砂糖 |
| 塩 | 0.125 小さじ（0.8g） | にんじんの低温調理バターグラッセ | 塩 |

塩分: 合計 0.9g ・ 大人 1 人分 0.4g ・ 子ども 0.05g

## 手順

### にんじんの低温調理バターグラッセ
1. **切る（6 分 / prep）** にんじん 2 本の皮をピーラーでむき、長さ 5cm に切ってから 1cm 角の棒状に切る（ささみの低温調理の待ち時間にやる）。
   - 材料: にんじん 2 本（300g）
   - 目安: 太さがそろった 1cm 角の棒
   - 🍼 子どもの分は 6〜8 本を別にしておく
2. **袋に入れる（2 分 / prep）** 耐熱の袋（湯せん可。85℃ に耐える物）に大人の分のにんじん・バター 8g・砂糖 小さじ 1・塩 小さじ 1/8 を入れる。子どもの分は小さい袋にバター 2g だけ入れる。どちらも平らにして空気を抜く。
   - 材料: バター 10 g・砂糖 小さじ 1（3g）・塩 小さじ 1/8（0.8g）
   - 目安: 袋の中でにんじんが重ならず一層に並ぶ
   - 🍼 子どもの袋には塩と砂糖を入れない
3. **85℃ で 1 時間（60 分 / wait）** 低温調理器・85℃ ささみを取り出した後、低温調理器を 85℃ に上げ、湯が 85℃ に届いたら 2 袋を沈めて 1 時間。
   - 目安: 竹串がすっと通り、角は崩れていない
   - ⏱ 60 分
   - ⚠ ささみ（63℃）と同時には入れない。湯が 85℃ に届いてから入れる
4. **急冷して冷蔵（7 分 / prep）** 袋ごと氷水で 5 分冷まし、袋のまま冷蔵庫へ。
   - 目安: 袋が冷たい
5. **翌日: 照りを出す（3 分 / heat）** ガスコンロ右・中火 大人の袋の中身を汁ごとフライパン（fp26）に入れ、中火で 2 分転がして汁を煮詰める。子どもの袋は別に小皿でレンジ 600W 30 秒か、同じフライパンで先に 1 分温める。
   - 目安: 汁がとろりとしてにんじんに照りが付く。湯気が立つ
   - 🍼 子どもの分を先に温めて取り出し、冷ます
6. **翌日: 盛る（2 分 / serve）** 大人は主菜の皿の横に盛る。子どもは手で持てるよう皿に並べる。
   - 目安: にんじんが崩れず並び、照りが残っている
   - 🍼 冷ましてから出す。手づかみで持てる棒状のまま

## 子どもの分

- 取り分け: separate ・ 大きさ: 1cm × 5cm の棒状（手づかみ用）
- 子どもの分は塩を入れない別の小さい袋に、バター少しだけで入れる。85℃ 1 時間で歯ぐきでつぶせる柔らかさになる

## 保存・翌日

- 冷蔵 2 日 ・ 冷凍 可
- 温め直し: 袋のまま冷蔵。翌日はフライパン 中火で袋の汁ごと 2 分、汁がとろりと照りが出るまで。子どもの分は湯気が立つまで温めて冷ます

## 片付け

- 食洗機: —
- 手洗い: フライパン
- 低温調理の湯は主菜と共通。終わったら低温調理器を拭いて乾かす

## 作ったときのメモ

