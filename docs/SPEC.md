# recipi 仕様書 v1.1

> v1.1（2026-10-09）: 実装に合わせて §6.4 / §6.6 / §9.4 / §11 / §12 / §14 を更新。コードは `scripts/`・`site/`・`.github/workflows/`。

家にある**食材**と**調理器具**を登録しておくと、**今日使える時間**で作れるレシピを細かく組み立ててくれる GitHub リポジトリの仕様。
作るたびに写真・所要時間・再現できたか・家族の反応を記録し、その記録を次の提案に還流して、提案の質を上げ続ける。

[kaji-quest](https://github.com/peirin1230-ship-it/kaji-quest) の弟分。運用の型（GitHub Pages のページ 1 枚、Issue は使わない、記録は `logs/` にコミット、設定は YAML）は kaji-quest をそのまま踏襲する。
kaji-quest が「いつ・何をやるか」を回す道具なら、recipi は「今夜、何をどう作るか」を決める道具。

---

## 1. 目的とゴール

### 1.1 背景
- kaji-quest で「翌日の献立を決める」「夜ご飯を作る」「翌日分の仕込み」はタスクになった。しかし**何を作るか・どう作るか**は毎回ゼロから考えている。
- レシピサイトのレシピは、家にない道具（オーブン、圧力鍋）や食材を前提にしていて、そのままでは使えない。分量も「適量」「中火で」が多く、作るたびに味が変わる。
- 冷蔵庫に何があるか思い出せず、同じ物を買い足したり、使い切れずに捨てたりする。
- 家族が「おいしい」と言った料理も、子どもが食べなかった料理も、記録に残らないので次に活かせない。
- 平日の夜は 20〜30 分しかない。「60 分のレシピを急いで作る」ではなく、**最初から 20 分で成立するレシピ**がほしい。

### 1.2 このシステムが解くこと
| # | 課題 | 解 |
|---|------|-----|
| P1 | 何を作るか考えるのが面倒 | 在庫・道具・時間から Generator が候補を出す。自分は選ぶだけ |
| P2 | レシピが家の道具・食材に合わない | 家の器具一覧と在庫を制約として生成する。無い道具は使わない |
| P3 | 時間が読めず、夕食が遅れる | 時間を指定して生成。段取り表つき。うちの実測速度で補正する |
| P4 | 分量・火加減が曖昧で再現できない | g と大さじ併記、火加減は器具の目盛りで、仕上がりの目安（見た目・音）を書く |
| P5 | 作った料理の良し悪しが残らない | 写真 1 枚＋評価 1 タップで記録。レシピに「作ったときのメモ」が溜まる |
| P6 | 家族の好みが提案に反映されない | 家族の評価と子どもの食べ具合から好みを学習し、次の生成に渡す |
| P7 | 食材を使い切れない | 期限が近い物を「使い切り」として優先的に提案に入れる |

### 1.3 ゴール
| # | ゴール | 測り方 |
|---|--------|--------|
| G1 | 平日の夕食を、考えずに 30 分以内で出せる | 提案の採用率 70% 以上。時間誤差の中央値 ±20% 以内 |
| G2 | 家族がおいしいと言う回数が増える | 家族評価 F の 12 週移動平均が上向き。平均 4.0 以上 |
| G3 | 同じ料理を同じ味で作れる | 再現性 R の平均 75 以上。定番レシピが 3 か月で 10 本 |
| G4 | 食材を捨てない | 「期限切れで捨てた」記録が月 2 件以下 |
| G5 | 続く | 記録の所要 60 秒以内。12 週続けて週 3 回以上記録 |

### 1.4 非ゴール（明確にやらないこと）
- **栄養管理アプリにしない。** カロリー・PFC の厳密計算はしない。塩分の目安と幼児の取り分けだけ守る。
- **厳密な在庫管理をしない。** 調味料は「ある／少ない／ない」の 3 段階。グラム単位で追わない。棚卸しを義務にしない。
- **家族を採点しない。** 家族の評価は「次の提案を良くするため」にだけ使う。誰が何点をつけたかを並べて見せる画面は作らない。
- **家族に操作させない。** 利用者は自分だけ。家族の感想は自分が聞いて代わりに入れる。
- **レシピサイトをスクレイピングしない。** レシピは Generator が家の条件から組み立てる。外部レシピの転載はしない。
- **SNS に共有しない。** 写真は自分の記録と図鑑のため。

> 「家族の負担を減らす」は**動機**であって、システムの機能ではない。
> システムは「今夜の一皿を、時間内に、再現できる形で出す」ことだけを追う。

---

## 2. 設計思想（7 原則）

1. **家の条件が先、レシピが後**
   在庫・道具・時間・家族の制約を先に固定し、その中でレシピを生成する。レシピに家を合わせない。
2. **管理コストが新しい家事になってはいけない**
   在庫の登録は「、」区切りの入力か写真 1 枚。記録は 1 タップ×4 と写真 1 枚で 60 秒以内。迷ったら機能を削る。
3. **作るたびに賢くなる。設定は自分でいじらない**
   学習はログから自動で行う。自分が調整するのは `profile/overrides.yml` だけ。「学習結果が間違っている」ときだけ上書きする。
4. **再現性は数値で持つ**
   時間の誤差、手順どおりに作れたか、仕上がりの自己評価を記録し、レシピごとの再現性スコア R を出す。R が低いレシピは「自分が下手」ではなく「レシピがこの家に合っていない」と解釈し、改訂する。
5. **家族の評価は「次の提案」にだけ使う**
   子どもが食べなかったのは情報であって失敗ではない。評価を比較・集計して人を測らない。
6. **失敗は捨てない、改訂する**
   レシピはバージョン管理する。うまくいかなかったレシピは v2 を作る。消すのは「家族がはっきり嫌いだった」ときだけ（それも封印であって削除ではない）。
7. **小さく始めて育てる**
   Phase 0 は `pantry.json` / `equipment.yml` / `family.yml` を手で書いて、Claude Code に「今夜 20 分で」と聞くだけ。ページも Actions も、それが回ってから足す（§16）。

---

## 3. スコープ

| 領域 | 内容 | 時期 |
|------|------|------|
| `dinner` | 平日・休日の夕食。主菜＋副菜（＋汁物）。**ここが主戦場** | Phase 0〜 |
| `prep` | 翌日分の仕込み・作り置き（kaji-quest の `cooking-prep` に対応） | Phase 1〜 |
| `breakfast` | 朝食。5〜15 分。主食＋1 品 | Phase 2〜 |
| `lunchbox` | 弁当。前夜の残りの再構成 | Phase 3〜 |
| `weekly` | 週末に 1 週間分の献立と買い物リストを組む | Phase 3〜 |

初期に入れないもの: 来客・イベント料理、お菓子作り、外食の記録。

---

## 4. ロール

- **Operator（自分）**: 唯一の操作者。在庫登録、注文、調理、記録、`overrides.yml` の編集。
- **Generator（Claude API。GitHub Actions 上で動く）**: レシピ生成・改訂、冷蔵庫写真の読み取り、完成写真のフィードバック、学習結果の要約。
- **家族（妻・子）**: 食べる人。**システムを操作しない。** 名前はリポジトリに書かない（`me` / `partner` / `kid`）。

### 4.1 ユーザーストーリー

| ID | ストーリー |
|----|-----------|
| US-01 | 帰宅前に「今夜 25 分、大人 2 と子 1」と入れたら、家にある物で作れる主菜＋副菜が 1 つ出てきてほしい |
| US-02 | 出てきたレシピは、うちの IH の目盛りと、うちのフライパンの大きさで書いてあってほしい |
| US-03 | 「鶏肉を切る」のに自分は 8 分かかるので、その前提で時間を組んでほしい |
| US-04 | 作っている間はスマホを置いたまま、大きな字で次の手順とタイマーが見えてほしい |
| US-05 | 作り終えたら写真を 1 枚撮って、星をつけるだけで記録が終わってほしい |
| US-06 | 妻が「これ好き」と言った料理は、次から多めに出てきてほしい |
| US-07 | 子どもが食べなかった食材は、形を変えて（細かく・やわらかく）出してきてほしい |
| US-08 | 前回うまくいかなかったレシピは、何が悪かったかを踏まえた改訂版が出てきてほしい |
| US-09 | 期限が近い食材から使ってほしい。何があるか冷蔵庫の写真を撮るだけで登録したい |
| US-10 | 自分の作ったものが写真つきで並ぶ「図鑑」を眺めて、レパートリーが増えた実感がほしい |
| US-11 | 同じ料理を 3 回作ったら、手順は短い版で十分。でも初見の料理は細かく書いてほしい |
| US-12 | kaji-quest で記録した買い物が、そのまま在庫に入ってほしい |

---

## 5. 全体像（ループ）

```
  在庫 pantry.json ─────────┐
  器具 equipment.yml ───────┤
  家族 family.yml ──────────┼─→ 注文（時間・人数・気分）─→ 生成 ─→ レシピ ─→ 調理モード ─→ 記録
  学習 profile/learned.yml ─┘                                 │                              │
          ▲                                                   │      写真・実時間・手順どおり度・仕上がり・家族の反応・気づき
          │                                                   ▼                              │
          │                                           recipes/<id>.md                 logs/YYYY/MM.jsonl
          │                                                   ▲                              │
          └────── 夜間ジョブ: 統計・速度係数・好み・定番昇格・改訂案 ◀───────────────────────┘
```

1 回のサイクルは「注文 → 生成（1〜2 分）→ 調理 → 記録（60 秒）」。学習は夜間に自動で走る。自分がやるのは注文と記録だけ。

---

## 6. ドメインモデル

```
Pantry（在庫）─┐
Equipment ────┼─ 制約 ─→ Request（注文）─→ Recipe（レシピ, versioned）─→ CookLog（記録）
Family ───────┘                                   ▲                          │
Learned（学習結果）── プロンプトに注入 ───────────┘                          │
     ▲                                                                       │
     └─────────────────── nightly-learn ─────────────────────────────────────┘
Knowledge（基礎・安全・コツ）── Generator の根拠 ── 手順に添付
```

### 6.1 Pantry（食材在庫）— `pantry.json`

ページが書く。手で直してもよい。**正確さより「だいたい合っている」を優先する。**

```json
{
  "updated": "2026-10-08T17:02:00+09:00",
  "items": [
    { "id": "p1a2b", "name": "鶏もも肉", "qty": 300, "unit": "g", "loc": "fridge", "added": "2026-10-07", "use_by": "2026-10-09", "src": "kaji-quest" },
    { "id": "p3c4d", "name": "小松菜", "qty": 1, "unit": "束", "loc": "fridge", "added": "2026-10-06", "use_by": "2026-10-09" },
    { "id": "p5e6f", "name": "豆腐", "qty": 1, "unit": "丁", "loc": "fridge", "added": "2026-10-07", "use_by": "2026-10-10" },
    { "id": "p7g8h", "name": "冷凍ご飯", "qty": 4, "unit": "個", "loc": "freezer", "added": "2026-10-04" },
    { "id": "p9i0j", "name": "卵", "qty": 6, "unit": "個", "loc": "fridge", "added": "2026-10-05", "use_by": "2026-10-19" }
  ],
  "staples": {
    "醤油": "ok", "みりん": "ok", "酒": "low", "砂糖": "ok", "塩": "ok", "味噌": "ok",
    "サラダ油": "ok", "ごま油": "low", "酢": "ok", "めんつゆ": "none", "鶏がらスープの素": "ok",
    "片栗粉": "ok", "小麦粉": "ok", "だしパック": "ok", "にんにくチューブ": "ok", "しょうがチューブ": "ok"
  }
}
```

| 項目 | 内容 |
|------|------|
| `items` | 生鮮・日配・冷凍など**数が減る物**。`qty` と `unit` は任意（無ければ「ある」扱い） |
| `loc` | `fridge` / `freezer` / `pantry`（常温）。省略時は食材マスタ（`data/ingredients.yml`）の既定 |
| `use_by` | 目安。入力が無ければ `added` ＋ マスタの日持ち日数で自動。**期限管理ではなく優先順位づけ**のため |
| `staples` | 調味料・乾物など**減り方が緩い物**。`ok` / `low` / `none` の 3 段階だけ。`low` は買い物候補、`none` はレシピで使わない |
| `src` | どこから入ったか。`manual` / `photo` / `kaji-quest` |

**入力方法**（どれも 1 画面）
1. **文字**: 「鶏もも 300g、小松菜、豆腐」のように「、」区切り。数量は書けば入る、書かなければ「ある」。名前はマスタで正規化（「とりもも」→「鶏もも肉」）
2. **冷蔵庫の写真**: 1 枚撮って送る → Generator が読み取り → **差分を一覧で見せて自分が確認**してから反映する。勝手に書き換えない（§12.2 `pantry_photo`）
3. **kaji-quest の買い物記録**: kaji-quest の `logs/` の `mode: shop` の行（買った物）をページを開いたときに取り込む（§13）

**消費**: 調理の記録時に、レシピの材料のうち在庫にある物をチェック済みで並べ、1 タップで減らす。数量が無い物は「使い切った？」の 1 問だけ。
**期限**: `use_by` を過ぎた物は「期限ぎれ」の帯で出す。捨てたら「捨てた」を押す（G4 の計測に使う。責めない）。

### 6.2 Equipment（調理器具）— `equipment.yml`

手で書く。**無い物を明示する**のが大事。Generator は書いてある物しか使わない。

```yaml
# equipment.yml — 家の調理器具。Generator はここに無い道具を使わない。
# note: は Generator にそのまま渡る。「右は火力が弱い」「強火は焦げる」など、うちの癖を書く。

heat:
  - { id: ih-r, type: ih, label: IH 右（大）, levels: 1-9, note: "強火は 7 まで。8 以上は焦げる" }
  - { id: ih-l, type: ih, label: IH 左（小）, levels: 1-9, note: "火力弱め。汁物・保温向き" }

appliances:
  - { id: microwave, type: microwave, watts: 600, note: "" }
  - { id: toaster, type: toaster_oven, watts: 1000, note: "トースト 2 枚サイズ。グラタン皿は小なら入る" }
  - { id: rice-cooker, type: rice_cooker, capacity_go: 5, normal_minutes: 50, fast_minutes: 28 }
  - { id: kettle, type: kettle, liters: 1.0 }
  - { id: dishwasher, type: dishwasher, note: "フライパンは入らない" }

cookware:
  - { id: fp26, type: frying_pan, size_cm: 26, lid: true, material: fluoro, dishwasher: false }
  - { id: fp20, type: frying_pan, size_cm: 20, lid: false, material: fluoro, dishwasher: false }
  - { id: pot20, type: pot, size_cm: 20, liters: 3.0, lid: true, dishwasher: true }
  - { id: pot16, type: pot, size_cm: 16, liters: 1.5, lid: true, dishwasher: true }
  - { id: bowl-l, type: bowl, note: "耐熱。レンジ可" }
  - { id: bowl-m, type: bowl, note: "耐熱。レンジ可" }

tools: [包丁, まな板, ピーラー, おろし金, キッチンバサミ, 菜箸, トング, フライ返し, 計量スプーン, 計量カップ, キッチンスケール, ザル, ボウル]
storage: [保存容器 中×4, 保存容器 小×4, 冷凍用保存袋, ラップ]

missing: [オーブン, 圧力鍋, ミキサー, ホットクック, 魚焼きグリル, 揚げ物鍋]   # 使わない。レシピから除外される

preferences:
  avoid_deep_fry: true        # 揚げ物を提案しない（後片付けの理由）
  max_pans_at_once: 2         # 同時に使うフライパン・鍋の上限（口数と同じでよい）
```

Generator が導く制約:

| 器具の情報 | レシピへの影響 |
|---|---|
| コンロの口数 | 段取り表のレーン数。2 口なら同時加熱は 2 品まで |
| コンロの `note` | 火加減の表記（「右 IH の 6 で」）と焦げやすさの補正 |
| 電子レンジの W 数 | 加熱時間を W 数で書く（600W 基準。違えば換算） |
| 炊飯器の所要時間 | 時間予算が炊飯時間より短ければ「冷凍ご飯」か「炊けている前提」を明示する |
| フライパンの直径 | 1 回に焼ける量。4 人分なら 2 回に分けると書く |
| 食洗機の有無・可否 | 片付けの指示（「鍋は食洗機、フライパンは手洗い」） |
| `missing` | その道具を使う調理法を提案しない（オーブン焼き・圧力調理・揚げ物） |

### 6.3 Family（家族プロフィール）— `family.yml`

手で書く。**名前・生年月日は書かない。** 子どもは年齢帯だけ（変わったら手で更新）。

```yaml
# family.yml — 食べる人。名前は書かない。role は me / partner / kid（複数なら kid1, kid2）。
members:
  - { role: me,      portion: 1.0 }
  - { role: partner, portion: 0.9, dislikes: [セロリ, パクチー], notes: "辛いのは苦手。酸っぱいのは好き" }
  - { role: kid,     portion: 0.4, age_band: "1-2y", texture: soft, notes: "手づかみで食べたがる" }

allergies: []                 # 絶対に使わない（hard）。例: [卵, 乳]
avoid: [レバー]               # 使わない。注文で「今日は OK」と言えば使える（soft）

seasoning:
  salt: light                 # light / normal。大人の分の塩分の目安
  spicy: none                 # none / mild / normal。kid がいる限り none が既定
  kid_rule: separate          # separate: 味付け前に取り分け / shared: 全体を薄味で

meals:
  dinner_default: { adults: 2, kids: 1, dishes: "main+side" }
  partner_late_days: []       # 妻が遅い曜日。子どもだけ先に出す前提で組む（例: [tue, thu]）
```

`age_band` は `0-6m` / `6-12m` / `1-2y` / `2-3y` / `3-5y` / `6y+`。幼児食の基準（`knowledge/safety.md`）はこの帯で引く。

### 6.4 Request（注文）— `requests/<id>.json`

ページが書き、Generator が結果を書き戻す。処理の受け渡し用。30 日より古い物は夜間ジョブが消す。

```json
{
  "id": "req-20261008-1712",
  "ts": "2026-10-08T17:12:30+09:00",
  "type": "dinner",
  "time_budget": 25,
  "servings": { "adults": 2, "kids": 1 },
  "dishes": "main+side",
  "mood": ["さっぱり", "和"],
  "use_up": ["小松菜", "豆腐"],
  "exclude": [],
  "note": "妻は 20 時。子どもだけ先に食べる",
  "mode": "auto",
  "status": "pending",
  "error": null,
  "result": null
}
```

| 項目 | 内容 |
|------|------|
| `type` | `dinner` / `prep` / `breakfast` / `lunchbox`（レシピ生成）/ `recipe_detail`（別案や週の献立の 1 日を詳細化。`parent` に元の注文 id、`alternative` に番号）/ `pantry_photo`（`image` に `inbox/<id>.jpg`、`hint` に fridge / freezer / pantry）/ `revise`（`recipe_id`）/ `weekly`（`start_date`、曜日ごとの `budgets`）/ `suggest_items`（買い足すといい食材。`note` に一言） |
| `time_budget` | 分。**買い物を除き、キッチンに立ってから盛り付けまで**。`0` は**時間無制限**（予算の検査をしない。手間のかかる料理・仕込み・品数を増やす案も可。見込みは正直に書く） |
| `dishes` | `main` / `main+side` / `main+side+soup` / `onepot`（丼・麺の 1 品） |
| `mood` | 自由タグ。`さっぱり` `がっつり` `和` `洋` `中` `麺` `丼` `鍋` など。無くてもよい |
| `use_up` | 使い切りたい物。ページが期限順に自動で入れる。外してもよい |
| `mode` | `auto`: 最適な 1 本を詳細まで生成し、別案 2 つは一行で出す（既定、1 往復）。`pick`: 候補 3 つを一行で出し、選んでから詳細（2 往復） |
| `status` | `pending` → `running` → `done` / `error`（`error` に理由） |
| `result` | 共通: `model` / `prompt_version` / `tokens` / `cost_usd` / `seconds`。レシピ系: `recipe_id`、`recipe`（§6.5 の front matter と同じ物。ページはこれをそのまま描く）、`alternatives: [{title, minutes, why, kind}]`、`feasible` / `infeasible_reason` / `nearest_options`。`pantry_photo`: `items: [{name, qty, unit, loc, confidence, known}]`、`staples: [{name, state}]`。`weekly`: `days: [{date, title, main_ingredients, minutes, why, kind}]`、`shopping`、`plan_path` |

ページは注文ファイルを PUT したあと `POST /repos/{owner}/{repo}/dispatches` に `{"event_type": "agent", "client_payload": {"request_id": "<id>"}}` を送る。Actions（§12.2）が `type` を見て処理を分ける。

### 6.5 Recipe（レシピ）— `recipes/<id>.md`

1 レシピ 1 ファイル。front matter（機械が読む）＋本文（人が読む）。**Generator は JSON で返し、スクリプトが Markdown に整形する**（§7.3）。

```yaml
---
id: r-20261008-torimomo-teriyaki
title: 鶏もも肉の照り焼きと小松菜のおひたし
version: 1
supersedes: null                       # 改訂元の id（v2 以降）
status: draft                          # draft（未調理）/ tried（1 回以上）/ standard（定番）/ retired（封印）
created: 2026-10-08
request: req-20261008-1712
generated_by: { model: claude-opus-5-5, prompt_version: 3 }
type: dinner
servings: { adults: 2, kids: 1 }
time: { budget: 25, planned: 22, active: 18, raw_estimate: 19, speed_factor: 1.15 }
dishes:
  - { name: 鶏もも肉の照り焼き, role: main }
  - { name: 小松菜のおひたし, role: side }
equipment: [ih-r, ih-l, fp26, pot16, microwave]
ingredients:
  - { name: 鶏もも肉, qty: 300, unit: g, pantry: 鶏もも肉, for: main }
  - { name: 小松菜, qty: 1, unit: 束, pantry: 小松菜, for: side, use_up: true }
  - { name: 醤油, qty: 1.5, unit: 大さじ, grams: 27, pantry: 醤油, for: main }
  - { name: みりん, qty: 1.5, unit: 大さじ, pantry: みりん, for: main }
  - { name: 酒, qty: 1, unit: 大さじ, pantry: 酒, for: main, substitute: 水 }
  - { name: 砂糖, qty: 1, unit: 小さじ, pantry: 砂糖, for: main }
  - { name: 片栗粉, qty: 1, unit: 小さじ, pantry: 片栗粉, for: main }
  - { name: だしパック, qty: 1, unit: 個, pantry: だしパック, for: side }
tags: [和, 主菜, 副菜, 子ども向け, 使い切り, フライパン 1 つ]
salt: { total_g: 4.2, adult_per_serving_g: 1.8, kid_g: 0.4 }
kid: { rule: separate, cut: "1cm 角", note: "タレを絡める前に取り出す。皮は外す" }
keep: { fridge_days: 2, freezer: true, reheat: "レンジ 600W 1 分 30 秒" }
photo: null                            # 最後に作ったときの写真（記録で更新）
stats: { cooked: 0, r_avg: null, f_avg: null, last: null }   # 夜間ジョブが更新
detail: full                           # full / compact（定番になると compact が既定）
---
```

本文の章立て（Generator が必ずこの順で出す。§7.3 で中身を定める）:

```markdown
## 段取り表（22 分）
| 分 | IH 右（大）/ fp26 | IH 左（小）/ pot16 | 手・レンジ |
|---|---|---|---|
| 0 | | 湯 1L を沸かす（レベル 9） | 鶏ももを一口大（3cm）に切り、片栗粉をまぶす |
| 3 | 油 小さじ 1、皮目から並べる（レベル 6） | | 小松菜を 4cm に切る。タレを合わせる |
| 6 | 触らず焼く | 小松菜を入れて 1 分 | |
| ...

## 材料（大人 2・子 1）
...

## 手順
### 鶏もも肉の照り焼き
1. **切る（3 分）** 一口大（3cm 角）。厚い所は開く。片栗粉 小さじ 1 を全体に薄く。
2. **焼く（7 分）** IH 右・レベル 6。油 小さじ 1。皮目を下に並べて**3 分触らない**。目安: 縁が白くなり、皮がきつね色。返して 3 分。
   - 🍼 ここで子どもの分 60g を取り出し、1cm 角に切る。皮は外す。
3. **タレ（2 分）** 火を 4 に落とし、合わせダレを入れて煮絡める。目安: 泡が大きくなり、箸で線が引ける。
   - ⚠ うちの IH は 7 以上で焦げる。泡が黒ずんだら火を止める。
...

## 子どもの分
...

## 保存・翌日
...

## 片付け
...

## 作ったときのメモ
（記録のたびに末尾へ追記: 日付・実時間・R・F・変えた点・写真）
```

### 6.6 CookLog（調理の記録）— `logs/YYYY/MM.jsonl`

1 回作るごとに 1 行。kaji-quest と同じく**集計はページを開くたびにログから計算**する（冪等）。

```json
{
  "id": "mv3k9x2q1abc",
  "date": "2026-10-08",
  "ts": "2026-10-08T19:05:40+09:00",
  "recipe_id": "r-20261008-torimomo-teriyaki",
  "version": 1,
  "request_id": "req-20261008-1712",
  "type": "dinner",
  "planned_minutes": 22,
  "actual_minutes": 26,
  "fidelity": "minor",
  "deviation": "醤油を大さじ 1 に減らした。小松菜は茹でずにレンジ 2 分",
  "finish": 4,
  "ratings": { "me": 4, "partner": 5, "kid": "all" },
  "photo": "photos/r-20261008-torimomo-teriyaki/20261008-1.jpg",
  "learned": "皮目 3 分は長い。2 分半で十分だった",
  "pantry_used": ["p1a2b", "p3c4d"],
  "step_minutes": { "prep": 7.5, "wait": 8, "heat": 3.5, "serve": 4 },
  "r_score": 75,
  "f_score": 4.7
}
```

| 項目 | 値 | 入力 |
|------|----|------|
| `planned_minutes` / `actual_minutes` | レシピの見込み／調理モードの開始〜「できた」の実測。手で直せる | 自動 |
| `fidelity` | `exact`（そのまま）/ `minor`（少し変えた）/ `major`（かなり変えた） | 1 タップ |
| `deviation` | 変えた点 1 行。`minor` / `major` のとき | 任意 |
| `finish` | 仕上がりの自己評価 1〜5（見た目・火の通り・味が狙いどおりか） | 1 タップ |
| `ratings.me` / `ratings.partner` | 1〜5。聞けなければ `null`（後から足せる） | 1 タップ |
| `ratings.kid` | `all`（完食）/ `half` / `little` / `none` / `absent`（いなかった） | 1 タップ |
| `photo` | 完成写真のパス。無ければ `null` | 任意（推奨） |
| `learned` | 気づき 1 行 | 任意 |
| `step_minutes` | 調理モードで手順にチェックを入れた時刻から、工程の種類（kind）ごとに掛かった分を集計した物。速度係数の工程別の学習に使う（§9.4） | 自動 |
| `photo_note` | 完成写真の一言（§8.5。夜間ジョブが足す） | 自動 |
| `r_score` / `f_score` | §9.2 / §9.3 の式で記録時に計算。再計算可能（`scripts/learn.py` の `r_score` / `f_score` が正） | 自動 |

### 6.7 Learned（学習結果）— `profile/learned.yml`

**夜間ジョブが書く。手で直さない。** 直したいときは `profile/overrides.yml` に書く（常に優先される）。

```yaml
# profile/learned.yml — nightly-learn が logs/ から生成する。手で直さない（overrides.yml へ）。
updated: 2026-10-08
window_days: 90                       # この期間のログから計算
n_logs: 41

speed_factor:                         # うちの実時間 ÷ Generator の素の見込み。中央値。0.7〜2.0 に丸める
  overall: 1.15
  prep: 1.30                          # 切る・下ごしらえ
  heat: 1.00                          # 加熱
  serve: 1.10                         # 盛り付け・配膳

likes:                                # f_score が高い料理に共通する要素（材料・調理法・味）。score は -1〜1、n は根拠の件数
  - { key: 鶏もも肉, score: 0.8, n: 6 }
  - { key: 照り焼き, score: 0.7, n: 4 }
  - { key: 豆腐, score: 0.5, n: 5 }
dislikes:
  - { key: 魚の煮付け, score: -0.6, n: 3 }
partner:
  likes: [酸味, 生野菜]
  dislikes: [セロリ, パクチー, 甘辛すぎる味]
kid:
  eats_well: [豆腐, さつまいも, 鶏ひき肉, うどん]
  refuses: [ピーマン, 葉物（大きいまま）]
  works_if: ["葉物は刻んで卵に混ぜると食べる", "肉は 1cm 角・やわらかめ"]

equipment_notes:                      # deviation / learned から抽出した器具の癖。equipment.yml の note と重複してよい
  - "IH 右はレベル 7 以上で焦げる。照り焼きのタレは 4 で"
  - "レンジ 600W で葉物 1 束は 2 分（茹でるより早い）"
recipe_notes:                         # レシピ横断の傾向
  - "醤油はレシピの 7〜8 割で家族評価が上がる"
  - "皮目を焼く時間は見込みより 30 秒短くてよい"

standards: [r-20260921-buta-shogayaki, r-20260928-tofu-hambagu]    # 定番（§9.4）
needs_revision: [r-20261001-saba-misoni]                           # 改訂待ち（§9.4）
retired: [r-20260915-celery-soup]                                  # 封印（提案しない。頼めば出す）

quality:                              # 提案の質の指標（§9.6）。週ごと
  - { week: 2026-W40, generated: 6, cooked: 5, f_avg: 4.3, r_avg: 76, time_err_median: 0.14 }
  - { week: 2026-W41, generated: 5, cooked: 4, f_avg: 4.5, r_avg: 81, time_err_median: 0.09 }
```

`profile/overrides.yml`（手で書く。learned より優先）:

```yaml
speed_factor: { prep: 1.2 }           # 学習値を上書きしたいときだけ
force_likes: [カレー]                 # 好みとして必ず扱う
never: [納豆]                         # family.yml の avoid と同じ効き方。こちらは「学習に関係なく」
notes:
  - "平日は包丁を使う工程を 10 分以内に"
```

### 6.8 Knowledge（基礎知識・安全・コツ）— `knowledge/`

kaji-quest の `knowledge/` と同じ形式（front matter 付き Markdown）。Generator はプロンプトに `safety.md` と関連する `basics/` を入れ、`tips/` は手順に添付する。

- `knowledge/safety.md` — **必ず守る規則**。幼児食の NG 食材と年齢帯（はちみつ・生もの・餅・丸いままのナッツやぶどう・塩分の上限）、肉・魚・卵の加熱の目安、作り置きの日持ち、アレルギーの扱い。
- `knowledge/basics/` — 火加減と IH の目盛りの対応、塩分の計算（調味料ごとの塩分 g）、幼児の取り分けの基本、保存と再加熱、切り方の名前と大きさ。
- `knowledge/tips/` — 1 コツ 1 ファイル。`steps:` に添付先の工程の種類（`cut-chicken` / `sear` / `blanch` など）を書くと手順に付く。

---

## 7. レシピ生成仕様

### 7.1 Generator に渡す情報（コンテキスト）

| 順 | 内容 | 由来 | 変わる頻度 |
|---|---|---|---|
| 1 | 役割と出力形式（JSON スキーマ）、書き方の規則（§7.3） | `prompts/recipe.md` | ほぼ不変 |
| 2 | 安全規則、基礎知識 | `knowledge/safety.md`, `knowledge/basics/` | ほぼ不変 |
| 3 | 器具、家族 | `equipment.yml`, `family.yml` | 月に数回 |
| 4 | 学習結果（速度係数・好み・器具の癖・定番・封印）、上書き | `profile/learned.yml`, `profile/overrides.yml` | 毎晩 |
| 5 | 直近 14 日に作った料理の一覧（同じ物を続けて出さないため） | `logs/` | 毎日 |
| 6 | 在庫（期限順。`staples` は `ok`/`low` だけ渡し、`none` は渡さない） | `pantry.json` | 毎回 |
| 7 | 注文 | `requests/<id>.json` | 毎回 |

順番はこのまま固定する。変わりにくい物を前に置き、プロンプトキャッシュを効かせる（§7.7）。

### 7.2 時間指定の扱い（US-01, US-03）

**時間予算 B（分）は「キッチンに立ってから盛り付けまで」。** 炊飯・買い物・解凍の待ち時間は含めない（含めるなら注文の `note` に書く）。

1. Generator は素の見込み `raw_estimate` を出す。工程ごとに `kind`（`prep` / `heat` / `wait` / `serve`）を付ける。
2. スクリプトが `speed_factor` を工程の `kind` ごとに掛けて `planned` にする。`wait`（焼いている間・煮ている間）には掛けない。
3. **`planned ≤ B × 0.9`** を満たさない場合、Generator にやり直させる（最大 2 回）。やり直しでも満たせなければ「B では無理」と正直に返し、近い案（B＋10 分の案、品数を減らした案、レンジだけで済む案）を出す。**時間を偽らない。**
4. 段取り表はレーン制。レーン数 ＝ コンロの口数 ＋ レンジ ＋ 手。`wait` の工程中に他レーンの `prep` を割り当てる。並行しない直列版（初心者向け）は出さない。並行が前提。
5. 炊飯が必要で B < 炊飯器の `fast_minutes` のとき、在庫に `冷凍ご飯` があればそれを使い、無ければ「ご飯は炊けている前提」と明記する。
6. 下味や漬け込みの待ち時間（10 分以上）は B に収まらない限り使わない。
7. 各工程に `timer`（秒）を付けられる。調理モードがそのままタイマーにする。

時間の既定チップ: **15 / 20 / 30 / 45 / 60 分**、自由入力。平日の既定は `config.yml` の `request.default_budget`（初期 25）。

### 7.3 出力フォーマットと「細かさ」の定義（US-02, P4）

Generator は JSON（structured output。`output_config.format` で JSON スキーマを固定する）で返し、`scripts/agent.py` が §6.5 の Markdown に整形する。**人が読むのは Markdown、機械が読むのは front matter。**

「細かい」とは次を満たすこと。1 つでも欠けたら不合格（スクリプトが機械的に検査し、欠けていれば再生成）:

| 要素 | 規則 |
|------|------|
| 分量 | 固形は g。液体の調味料は大さじ・小さじ＋g 併記。「適量」「少々」は塩・こしょうの仕上げ以外で使わない |
| 切り方 | 名前＋大きさ（「一口大（3cm 角）」「小口切り（5mm）」）。子どもの分は別に |
| 火加減 | **器具の目盛りで**（「IH 右・レベル 6」）。レンジは W 数と秒 |
| 時間 | 工程ごとに分。あわせて**仕上がりの目安**（見た目・音・匂い・触感）を必ず 1 つ書く。時間だけに頼らせない |
| 順序 | 段取り表（レーン×分）と手順（料理ごと）の両方。段取り表が正 |
| 待ち時間 | 「触らない」「放っておく」と明記し、その間にやる他の工程を書く |
| 失敗しやすい点 | 工程ごとに最大 1 つ。学習済みの器具の癖（`equipment_notes`）を優先して使う |
| 代替 | 在庫に無い物は使わない。使う場合は `substitute` に在庫の物を書く |
| 塩分 | 料理ごとの総塩分 g と大人 1 人分。幼児の分は `knowledge/safety.md` の上限以下 |
| 子どもの分 | いつ取り分けるか、大きさ、固さ、味付けの差 |
| 保存 | 冷蔵日数、冷凍可否、温め直し方 |
| 片付け | 使った器具と、食洗機に入れる物／手洗いの物 |

**細かさのレベル**: `full`（上の全部）と `compact`（段取り表＋材料＋手順の要点。目安と失敗ポイントは残す）。
レシピが `standard` になり R 平均 ≥ 80 なら `compact` を既定にする（US-11）。ページで `full` に切り替えられる。

### 7.4 提案のしかた（候補の出し方）

既定は `mode: auto`。**1 往復**で詳細レシピ 1 本＋別案 2 つ（一行）を返す。別案をタップすると、その案で詳細を生成する（もう 1 往復）。

1 本の選び方と、別案の構成:

| 枠 | 中身 | ねらい |
|---|---|---|
| 本命 | 在庫・時間・好みの全部に最も合う 1 本。`use_up` を必ず使う | 採用率 |
| 別案 A | 定番（`standards`）から時間に合う物。あれば | 安心・再現性 |
| 別案 B | 新しい料理（直近 30 日に無い調理法か主材料） | レパートリー |

本命が定番に偏らないよう、`config.yml` の `suggest.explore_ratio`（初期 0.3）の割合で本命を「新しい料理」にする。週に 1 回は必ず新しい物が本命になる。

直近 14 日に作った料理は出さない（`ratings` が高くても）。同じ主材料が 3 日続かないようにする。

### 7.5 改訂（US-08）

再現性 R が低い、または `deviation` が同じ内容で 2 回続いたレシピは `needs_revision` に入る（§9.4）。夜間ジョブが **改訂版 v(n+1)** を `recipes/<id>-v2.md`（`supersedes: <元 id>`、`status: draft`）として生成する。

改訂のプロンプトには元のレシピ、そのレシピの全ログ（R・F・`deviation`・`learned`・写真があれば写真）、`equipment_notes` を渡し、**変えた点とその根拠を front matter の `changes:` に列挙**させる。

```yaml
changes:
  - { what: "皮目を焼く時間 3 分 → 2 分 30 秒", why: "2 回とも『長い』の記録。IH 右はレベル 6 でも火が強い" }
  - { what: "醤油 大さじ 1.5 → 大さじ 1", why: "3 回中 2 回で減らしていた。partner の評価が減らした回で高い" }
```

ページでは元と改訂版を並べて差分を見られる。改訂版を 1 回作って R が元より上がれば、元は `retired`（改訂済み）、改訂版が `tried` になる。上がらなければ両方残して次の改訂を待つ。**改訂は 3 回まで。** それでも R < 50 なら封印候補として自分に聞く。

### 7.6 安全規則（hard constraints）

- `family.yml` の `allergies` の食材は**プロンプトに渡す前にスクリプトが在庫から除外**し、さらに Generator の出力を検査して含まれていれば再生成する。二重に守る。
- `age_band` に応じた NG 食材・大きさ・塩分は `knowledge/safety.md` から引く。出力検査で子どもの分に NG があれば再生成。
- 肉・魚・卵の加熱は「中心まで火を通す目安」を必ず書く。
- 作り置きの日持ちは `knowledge/safety.md` の上限を超えない。
- `missing` の器具を使う工程があれば不合格。

### 7.7 モデルと呼び方

| 用途 | モデル | 理由 |
|------|--------|------|
| レシピ生成・改訂・週の献立 | `claude-opus-5-5` | 制約が多い（在庫×器具×時間×家族×安全）。質で選ぶ |
| 冷蔵庫写真の読み取り | `claude-opus-5-5` | 画像から品名と数を読む。誤読は在庫の質に直結する |
| 完成写真のフィードバック（§8.5） | `claude-opus-5-5` | 月に数回。安さより一言の質 |
| 夜間の要約（`equipment_notes` 等の抽出） | `claude-opus-5-5` | 1 日 1 回。入力は小さい |

- 思考は adaptive（既定）。`output_config.effort` はレシピ生成が `high`、要約が `medium`。
- 出力は structured output（JSON スキーマ）。
- プロンプトキャッシュ: §7.1 の 1〜4 の末尾に `cache_control` を置く。4 は毎晩変わるので、キャッシュが効くのは同じ日の 2 回目以降（別案の詳細生成、やり直し）。
- 1 回の生成の目安: 入力 6〜8K トークン、出力 3〜4K トークン → **1 回 0.1 USD 前後**（2026-10 時点の単価。§15.2）。
- `stop_reason` が `refusal` のときは「生成できなかった」としてエラーに落とす。料理で起きる想定はないが、握りつぶさない。
- **ブラウザから API を直接呼ぶ案は採らない。** API キーを端末に置くことになる。生成は必ず Actions（§12）で行い、キーは GitHub Secrets にだけ置く。

**無料の経路（Claude Code が Generator を務める）**: API キーの代わりに Claude の定額契約（Pro / Max / Team）の OAuth トークン（`claude setup-token`）を Secrets `CLAUDE_CODE_OAUTH_TOKEN` に置くと、`agent.yml` は `anthropics/claude-code-action` で Claude Code を起動し、スキル `.claude/skills/recipi-orders` の手順で同じ注文を処理する。API 課金は無く、契約の利用枠を使う。所要は 2〜4 分。
仕組みは `scripts/agent.py context`（§7.1 の文脈と JSON スキーマをそのまま表示）→ Claude Code が JSON を書く → `scripts/agent.py finish`（§7.3 の検査・整形・結果の書き戻し・コミット）。検査に通らなければ理由を返して書き直させる。API の経路と**同じ検査・同じファイル形式**なので、どちらで作ったレシピも区別なく学習に入る（`generated_by.model: claude-code`）。
手元の Claude Code からは `/recipi-tonight`（注文からレシピまで）と `/recipi-orders`（ページの注文をまとめて処理）で同じ事ができる。

### 7.8 プロンプトの管理

`prompts/*.md` にプロンプトを置き、`prompt_version` を front matter で持つ。変えたら版を上げる。レシピの `generated_by.prompt_version` と、§9.6 の週次指標を版ごとに見られるようにし、**プロンプトの変更が提案の質を上げたか下げたかを数字で判断する**。感覚で戻さない。

---

## 8. 完成写真（US-05, US-10）

### 8.1 写真の役割

| 役割 | 内容 |
|------|------|
| 記録 | 「この日こう仕上がった」。再現性の証拠。レシピの「作ったときのメモ」に並ぶ |
| カードの顔 | レシピ一覧・図鑑のサムネイル。**うちで作った実物**が顔になる。レシピサイトの写真は使わない |
| 図鑑 | 作った料理が写真つきで並ぶ。レパートリーが増える実感（§10 の図鑑カード） |
| 仕上がりの判定補助 | 写真をレシピと突き合わせて一言返す（§8.5。任意、Phase 4） |

**生成したレシピに最初から写真は無い。** 作るまで写真は付かない。それが正しい。作る前は料理の種類ごとの絵（SVG。kaji-quest のアイコンと同じ作り）を仮の顔にし、Generator が書く「完成イメージ」（見た目を 2 行で。「照りのある濃い茶色、白ごまが散る」）を添える。

### 8.2 保存

```
photos/<recipe-id>/<YYYYMMDD>-<n>.jpg
```

- ページで撮る／選ぶ → **端末側で長辺 1280px・JPEG 品質 0.8 に縮小**（canvas で再エンコード。EXIF の位置情報もこれで落ちる）→ GitHub Contents API で PUT（`[skip ci]`）。
- 1 枚 150〜300KB。1 日 1 枚で年 100MB 弱。Git LFS は使わない（Pages と Contents API で素直に扱えるため）。
- リポジトリが 1GB に近づいたら、2 年より古い写真を `photos-archive` リポジトリへ移す（§15.4）。急がない。
- **料理だけを撮る。** 顔・名前の書かれた物・住所の分かる物を写さない（公開リポジトリ前提。§15.1）。

### 8.3 記録の流れ

調理モードで「できた」→ 記録画面 → 一番上に「写真」ボタン（カメラ／ライブラリ）→ 撮ったらその場で縮小とプレビュー → 評価の 1 タップ群 → 「記録する」。
写真のアップロードは評価の入力中にバックグラウンドで進める。失敗しても記録は保存し、写真だけ後で再送できる。

### 8.4 レシピの顔写真の決め方

レシピの `photo` は「**最後に作ったときの写真**」。ただし `finish ≥ 4` の写真があれば、より新しい `finish < 4` の写真で上書きしない（失敗作を顔にしない）。図鑑では全部の写真を時系列で見られる。

### 8.5 仕上がりのフィードバック（任意、Phase 4）

記録に写真があるとき、夜間ジョブが写真とレシピの「完成イメージ」「仕上がりの目安」を Generator に渡し、**一言**（「照りは十分。小松菜は刻みが大きめで子ども向けには細かく」）を `logs` の行に `photo_note` として足す。レシピの「作ったときのメモ」にも出る。
採点はしない。R の計算にも入れない（主観の自己評価 `finish` で十分）。**自分で気づけない仕上がりの差を言葉にする**のが目的。

---

## 9. 再現性と家族の評価（学習ループ）

### 9.1 記録画面（60 秒以内）

```
📷 写真を撮る                       [カメラ] [ライブラリ]

⏱ 時間  26 分（見込み 22）         [-5] [-1] [+1] [+5]
📋 手順どおり？   [そのまま] [少し変えた] [かなり変えた]
    └ 変えた点（1 行）: ______________________
✨ 仕上がり      ★ ★ ★ ★ ☆
👤 自分          ★ ★ ★ ★ ☆
👤 パートナー    ★ ★ ★ ★ ★   [あとで]
🧒 子ども        [完食] [半分] [少し] [食べない] [いなかった]
💡 気づき（1 行、任意）: ______________________

🧺 使った食材を在庫から減らす  ☑ 鶏もも肉 300g  ☑ 小松菜  ☐ 豆腐
                                                        [記録する]
```

- 時間は調理モードの開始〜「できた」で自動。手で直せる。
- 必須は無し。押さなかった項目は `null`。**空でも記録は成立する**（記録漏れ前提の集計）。
- 「あとで」は `ratings.partner = null` で保存し、ページの「今週」に「聞いてない評価 1 件」として残る。タップで追記。
- 子どもの `absent`（いなかった）は F に入れない。

### 9.2 再現性スコア R（0〜100）

「このレシピは、この家で、書いてあるとおりに作れるか」の指標。**自分の腕前ではなく、レシピと家の相性**を測る。

```
R = 時間 40 点 + 手順どおり 30 点 + 仕上がり 30 点

  時間      = 40 × max(0, 1 − |actual − planned| ÷ planned)     （誤差 0 で 40、誤差 100% で 0）
  手順どおり = exact 30 / minor 20 / major 5
  仕上がり   = (finish − 1) ÷ 4 × 30                              （finish 1〜5）

  finish が null なら仕上がりの項は 20（中立）。fidelity が null なら 20。
```

| 例 | actual/planned | fidelity | finish | R |
|---|---|---|---|---|
| 狙いどおり | 22/22 | exact | 5 | 100 |
| 少し遅れて少し変えた | 26/22 | minor | 4 | 33 + 20 + 22.5 = **75** |
| 大幅に変えた | 35/22 | major | 3 | 16 + 5 + 15 = **36** |

レシピごとに直近 5 回の平均 `r_avg` を持つ。R は「作りやすさ」の数字なので、**低いときに責めるのは自分ではなくレシピ**（原則 4）。

### 9.3 家族スコア F（1〜5）

```
F = その回に食べた人の評価の平均
  me / partner: 1〜5 をそのまま
  kid: all 5 / half 3 / little 2 / none 1。absent は除外
  null（聞いていない）は除外。全員 null なら F は null
```

レシピごとに直近 5 回の平均 `f_avg`。**個人別の集計は持たない。** 画面に出すのは F だけ。`partner` と `kid` の好みは §9.4 で「要素」に変換され、人の点数としては残らない。

### 9.4 夜間ジョブ（nightly-learn）の規則

毎晩 03:30 JST。新しいログがある日だけ動く。**統計は Python の決定的な計算、言葉の抽出だけ Generator** に任せる。

| 処理 | 規則 | 出力先 |
|------|------|--------|
| レシピ統計 | `cooked` / `r_avg` / `f_avg` / `last` を直近 5 回から | `recipes/<id>.md` の `stats` と `photo` |
| 速度係数 | `overall` は `actual_minutes ÷ raw_estimate` の中央値。工程別（`prep` / `heat` / `serve`）は記録に `step_minutes` があるときだけ「その工程の実測 ÷ レシピの見込み」の中央値、無ければ `overall` と同じ。直近 90 日、20 件以上で確定（それまでは 1.0 からの加重平均）。0.7〜2.0 に丸める | `learned.yml` の `speed_factor` |
| 好みの要素 | 各レシピの主材料・調理法・味のタグ（front matter の `tags` と `ingredients`）に F を配り、要素ごとに平均と件数。n ≥ 3 で採用。`score = (平均 − 3.5) ÷ 1.5` | `likes` / `dislikes` |
| 子どもの食べ具合 | `ratings.kid` を要素に配る。`all`/`half` が 2 回以上 → `eats_well`。`none` が 2 回以上 → `refuses`。`learned` の文に「刻んだら食べた」等があれば Generator が `works_if` に要約 | `kid` |
| 器具の癖・傾向 | `deviation` と `learned` の全文を Generator に渡し、器具・時間・味付けに関する**再現性のある一般則**だけを 10 行以内で抽出。1 件だけの話は入れない | `equipment_notes` / `recipe_notes` |
| 定番昇格 | `cooked ≥ 3` かつ `r_avg ≥ 70` かつ `f_avg ≥ 4.0` → `status: standard` | `standards` |
| 改訂待ち | 直近 2 回の R がともに < 50、または同じ趣旨の `deviation` が 2 回 → `needs_revision` → 改訂版を生成（§7.5） | `needs_revision`, `recipes/<id>-v2.md` |
| 封印 | `f_avg ≤ 2.0` が 2 回連続（F を付けた回だけ数える）→ `retired` に入れ、理由を書く。提案しない。頼めば出す | `retired` |
| 掃除 | 30 日より古い `requests/`、処理済みの `inbox/` を消す | — |
| 週次指標 | 週ごとの生成数・調理数・F・R・時間誤差を追記 | `quality` |

### 9.5 学習結果の提案への反映

| 学習結果 | 生成への渡し方 |
|---|---|
| `speed_factor` | 「この家では切る作業は見込みの 1.3 倍かかる」と伝え、スクリプト側でも掛ける（§7.2） |
| `likes` / `dislikes` | 「好まれる要素」「避ける要素」として列挙。`score` の絶対値が大きい順に各 10 件まで |
| `partner.*` / `kid.*` | 「大人の一人は酸味を好む」「子どもは葉物を刻めば食べる」のように**役割で**書く |
| `equipment_notes` / `recipe_notes` | 「失敗しやすい点」と火加減の指定に優先して使わせる |
| `standards` | 別案 A の候補。本命にも `explore_ratio` の残りで入る |
| `needs_revision` / `retired` | 提案しない。`retired` は注文の `note` で名指しされたときだけ |
| `overrides.yml` | learned と同じ項目は上書き。`notes` は規則として最上位に置く |

### 9.6 提案の質の指標（KPI の内訳）

毎週 `quality` に 1 行。ページの「今週」と週次ダイジェスト（§12.4）に出す。**上がっているかを見る。** 絶対値に一喜一憂しない。

| 指標 | 定義 | 良い方向 |
|------|------|----------|
| 採用率 | 生成したレシピのうち、調理モードを開始した割合 | ↑ |
| 完走率 | 調理モードを開始して記録まで行った割合 | ↑ |
| F 平均 | その週の F の平均 | ↑ |
| R 平均 | その週の R の平均 | ↑ |
| 時間誤差 | `|actual − planned| ÷ planned` の中央値 | ↓ |
| 新規率 | 作った料理のうち初めての物の割合（0.2〜0.4 が健全。高すぎると定番が育たない） | 範囲内 |
| 定番数 | `standards` の数 | ↑ |

### 9.7 プロンプト版ごとの比較

`quality` に `prompt_version` の内訳を持ち、版を上げた前後 4 週を並べて見る。悪化していれば戻す。**学習データ（ログ）は版に依存しないので、プロンプトを変えても学習は壊れない。**

### 9.8 やらないこと
- ❌ 家族の点数を一覧で見せる。個人別の平均を出す
- ❌ 「子どもが食べなかった回数」を数える画面
- ❌ 低い評価のレシピを自動で削除する（封印は提案から外すだけ。ファイルは残る）
- ❌ 自分の R を他人と比べる。R は腕前の点数ではない
- ❌ 評価を促す通知。聞けたときに入れればよい

---

## 10. ページ（UI）仕様

kaji-quest と同じ: 静的 1 ページ（`site/`）、PWA、スマホ優先、上に固定チップで各カードへ移動、カードは右上でたたむ。GitHub の fine-grained PAT を ⚙ に保存し、記録と在庫はページから `main` に直接コミットする。

| カード | 内容 |
|--------|------|
| **今夜** | 注文フォーム。時間チップ（15/20/30/45/60/無制限/自由）、人数（既定は `family.yml`）、品数、気分チップ、使い切り（期限順に自動選択、外せる）、一言。「考えてもらう」で生成（1〜2 分。「考え中」のまま閉じてよい。できたら上に出る）。時間チップの「無制限」は `time_budget: 0`（予算なし。手間のかかる料理も出る）。前回の注文が初期値 |
| **レシピ** | 生成結果。顔写真（無ければ絵と完成イメージ）、時間、材料、段取り表、別案 2 つ。「作る」で調理モード、「ほかの案」で再生成、「あとで」で保留（`status: draft` のまま一覧に残る）。「一覧に追加」（同梱の一覧にまだ無いとき。端末では即座に出し、リポジトリには `[skip ci]` 無しでコミットして `build-pages` を走らせる）／「一覧から削除」（`recipes/<id>.md` を消す。記録と写真は残る） |
| **調理モード** | 大きな字。段取り表を分刻みで上から。工程ごとにタイマー（`timer`）と「できた」チェック。画面を消さない（Wake Lock）。進み具合は端末に保存（途中で閉じても戻れる）。最後の「できた」で記録画面へ |
| **記録** | §9.1 |
| **在庫** | `items` を期限順。`staples` は 3 段階のトグル。入力欄（「、」区切り）、📷（冷蔵庫の写真 → 差分の確認 → 反映）、「kaji-quest の買い物を取り込む」。期限切れは帯で表示、「捨てた」ボタン。「買い足すといい物を聞く」（`suggest_items`）: 在庫・器具・家族・学習結果・旬から 8〜12 品を「今週の主菜に／常備すると楽／子ども向け／旬」に分けて理由と作れる料理つきで出す。チェックして kaji-quest の買い物メモへ送るかコピーする |
| **道具** | `equipment.yml` の表示のみ（編集はファイル）。`note` が見える |
| **図鑑** | 作った料理の写真グリッド（新しい順／F 順／R 順）。タップでレシピ。定番には印。写真の無い物は絵 |
| **レシピ一覧** | `standard` / `tried` / `draft` / `retired` のタブ。検索。改訂版は元と並べて差分。各行に「削除」（確認してから `recipes/<id>.md` を消す）。スマホではレシピの次に置く |
| **今週** | 作った回数、F・R の推移（12 週）、時間誤差、「聞いてない評価」、定番になった物、改訂された物、来週の提案 3 つ（週次ダイジェストから） |
| ⚙ | トークン、kaji-quest 連携の on/off、`detail` の既定、表示の設定 |

**操作の上限**: 注文は 3 タップ以内（時間チップ → 考えてもらう、で 2 タップ）。記録は 60 秒以内。これを超える機能は入れない。

---

## 11. リポジトリ構成

```
recipi/                          # 公開リポジトリ（Pages のため）。§15.1 の規則を守る
├── README.md                    # 自分用の操作マニュアル
├── CLAUDE.md                    # Phase 0 で Claude Code が Generator を務めるための指示（付録 D）
├── config.yml                   # 設定（§14）
├── pantry.json                  # 在庫（ページが書く）
├── equipment.yml                # 調理器具（手で書く）
├── family.yml                   # 家族プロフィール（手で書く。名前を書かない）
├── profile/
│   ├── learned.yml              # 夜間ジョブが書く。手で直さない
│   └── overrides.yml            # 手で書く。learned より優先
├── data/
│   └── ingredients.yml          # 食材マスタ（正規化名・別名・分類・既定の保存場所・日持ち目安・単位）
├── requests/                    # 注文と結果の受け渡し。30 日で掃除
├── recipes/                     # 1 レシピ 1 ファイル（front matter + Markdown）
├── photos/<recipe-id>/          # 完成写真（縮小済み JPEG）
├── inbox/                       # 冷蔵庫写真など処理待ち。処理後に削除
├── logs/
│   └── 2026/10.jsonl            # 調理の記録（1 回 1 行）
├── knowledge/
│   ├── safety.md                # 必ず守る規則（幼児食・加熱・日持ち・アレルギー）
│   ├── basics/                  # 火加減・塩分・取り分け・保存・切り方
│   └── tips/                    # 1 コツ 1 ファイル。手順に添付
├── prompts/
│   ├── recipe.md                # 生成（prompt_version 付き）
│   ├── revise.md                # 改訂
│   ├── pantry_photo.md          # 冷蔵庫写真の読み取り
│   ├── photo_note.md            # 完成写真の一言
│   ├── learn.md                 # 夜間の要約
│   ├── weekly.md                # 週の献立
│   └── digest.md                # 週次ダイジェストの提案
├── docs/
│   ├── SPEC.md                  # 本ファイル
│   └── digests/                 # 週次ダイジェスト（2026-W41.md）
├── scripts/
│   ├── common.py                # 読み書き・front matter・食材の正規化・git
│   ├── schema.py                # Generator の出力 JSON スキーマ、段取り表のレーン
│   ├── llm.py                   # Claude API の呼び出し（structured output・キャッシュ・mock）
│   ├── build_site.py            # site/ を組み立て、YAML を JSON 化（kaji-quest と同じ）
│   ├── agent.py                 # Actions から呼ぶ。注文の type ごとに分岐（recipe / recipe_detail / pantry_photo / revise / weekly / photo_note）
│   ├── learn.py                 # 夜間の統計（決定的）＋要約（Generator）
│   ├── digest.py                # 週次ダイジェスト
│   ├── render_recipe.py         # JSON → recipes/<id>.md
│   └── validate.py              # レシピの機械検査（§7.3 の規則、安全規則、器具）
├── tests/                       # pytest（API は呼ばない。fixtures/ に Generator の応答例）
├── site/                        # index.html / app.js / style.css / manifest / icon
└── .github/workflows/
    ├── build-pages.yml          # site/ と設定を gh-pages へ
    ├── agent.yml                # repository_dispatch で生成系を実行
    ├── nightly-learn.yml        # 03:30 JST
    └── weekly-digest.yml        # 日曜 20:00 JST
```

---

## 12. GitHub 機能マッピングとワークフロー

| 機能 | 用途 |
|------|------|
| **Pages** | ページ 1 枚。`gh-pages` ブランチへ `build-pages.yml` が配信 |
| **Contents API** | ページからの書き込み（`logs/`、`pantry.json`、`requests/`、`photos/`）。fine-grained PAT（Contents: Read and write） |
| **repository_dispatch** | ページから生成を起動（同じ PAT で `POST /repos/{owner}/{repo}/dispatches`） |
| **Actions** | 生成・学習・配信。API キーは **Secrets の `ANTHROPIC_API_KEY`** にだけ置く |
| **Pull Requests** | プロンプト・知識・マスタの変更。レシピの手直し |
| Issues / Projects / Discussions | **使わない**（kaji-quest と同じ） |

### 12.1 `build-pages.yml`
kaji-quest と同じ。`site/**`, `config.yml`, `equipment.yml`, `family.yml`, `data/**`, `knowledge/**`, `recipes/**`, `profile/**` の push で動き、`_site/` を `gh-pages` へ。ページが書くコミットは `[skip ci]`（例外は「一覧に追加」「一覧から削除」: `recipes/` を変えるので付けず、この workflow で同梱の一覧を作り直す）。
`recipes/` と `profile/` は JSON 化してページに同梱する（ページ起動時に API を叩かないため）。`logs/` と `pantry.json` と `photos/` はページが API で直接読む（最新が要るため）。

### 12.2 `agent.yml` — 生成系（`repository_dispatch`）

`event_type` は `agent` の 1 つだけ。`client_payload.request_id` の注文ファイルを読み、その `type` で処理を分ける（`scripts/agent.py auto --request <id>`）。

| 注文の `type` | 入力 | 処理 | 出力 |
|---|---|---|---|
| `dinner` / `prep` / `breakfast` / `lunchbox` | `requests/<id>.json` | §7.1 のコンテキストを組み、生成 → 検査（`validate.py`）→ 不合格なら最大 2 回やり直し → 整形 | `recipes/<id>.md`、`requests/<id>.json` の `result` |
| `recipe_detail` | `parent`（元の注文）＋ `alternative`（別案の番号、または週の献立の日の番号） | その料理で詳細を生成。予算・人数は元の注文から引き継ぐ | 同上 |
| `revise` | `recipe_id` | §7.5 | `recipes/<id>-vN.md` |
| `pantry_photo` | `inbox/<id>.jpg` | 画像を渡し、品名・数量・保存場所の JSON を得る → マスタで正規化 | `requests/<id>.json` の `result`（差分）。ページが確認後に `pantry.json` へ反映。`inbox/` の写真は削除 |
| `weekly` | `start_date`、曜日ごとの `budgets` | 1 週間分の献立（7 日分の料理名・主材料・分・理由）＋買い物リスト。**詳細レシピは当日に `recipe_detail` で作る**（7 本を先に作ると費用と改訂の手間が増えるため） | `requests/<id>.json` の `result`（`days` / `shopping`）＋ `docs/digests/<week>-plan.md` |

- 所要: Actions の起動 10〜30 秒 ＋ 依存の導入 10〜20 秒 ＋ 生成 30〜60 秒 ＋ コミット → **おおむね 1〜2 分**。ページは「考え中（1〜2 分）」と出し、5 秒ごとに `requests/<id>.json` を読み直す。
- 同時実行は 1（`concurrency: agent`）。連打しても最後の注文だけが残る。
- 失敗（API エラー、検査 3 回不合格、月の費用上限）は `status: error` と理由を書く。ページは理由を見せて「もう一度」。
- 開始時に `status: running` を 1 回コミットする（ページが「考え中」を出せるように）。ページの書き込みと競合したら `pull --rebase` してやり直す。
- 書き込みは `[skip ci]`。`build-pages` は `recipes/` の変更で動くが、`agent.yml` のコミットは `paths` から外す（ページは `recipes/` を API でも読めるため、配信の再構築は夜間に 1 回で十分）。

### 12.3 `nightly-learn.yml`
- **トリガー**: 03:30 JST（`30 18 * * *` UTC）＋ `workflow_dispatch`
- **処理**: §9.4。新しいログが無ければ即終了。
- **出力**: `profile/learned.yml`、`recipes/*.md` の `stats` / `photo` / `status`、改訂版、`requests/` と `inbox/` の掃除。1 コミット（`[skip ci]` は付けない → `build-pages` が走り、ページの同梱データが更新される）。

### 12.4 `weekly-digest.yml`
- **トリガー**: 日曜 20:00 JST（`0 11 * * 0` UTC）。kaji-quest の週報（21:00）の前に出す
- **処理**: `quality` の今週分、作った料理と写真、定番・改訂・封印の変化、在庫と季節から**来週の提案 3 つ**（一行）、買い物候補（`staples` の `low`/`none` と提案に要る物）
- **出力**: `docs/digests/2026-W41.md`（`scripts/digest.py`。front matter に数字と提案を持ち、ページの「今週」はそれを読む）。通知はしない（kaji-quest の 17:00 帰宅前の通知からページへ飛ぶ運用で足りる）

### 12.5 cron の注意
kaji-quest §8.4 と同じ。UTC 表記、数十分の遅延あり、長期間動きが無いと scheduled workflow が止まりうる（毎日ログを書くので実質問題ない）。

---

## 13. kaji-quest との連携

両方とも同じ型（Pages、PAT、`logs/*.jsonl`、`[skip ci]`）なので、連携はファイルの読み書きだけで済む。**どちらも相手が無くても単体で動く。**

| 向き | 内容 | 方法 | 設定 |
|------|------|------|------|
| kaji-quest → recipi | 買い物の記録（`mode: shop` の `items`）を在庫に取り込む | ページを開いたとき、または「取り込む」で kaji-quest の `logs/` を読む（公開リポジトリなので `raw.githubusercontent.com` から取得。未取込の行だけ `src: kaji-quest` で追加） | `kaji_quest.import_shopping: true` |
| recipi → kaji-quest | 在庫に無くてレシピに要る物、`staples` の `none` を買い物メモに足す | kaji-quest の `shopping.json` に Contents API で追記（PAT の Repository access に両方を選ぶ） | `kaji_quest.push_shopping: true` |
| recipi → kaji-quest | 調理の記録を kaji-quest の `dinner-cook`（夜ご飯を作る）の完了としても書く | kaji-quest の `logs/` に 1 行追記（`actual_minutes` は recipi の実測、`learned` は気づき） | `kaji_quest.write_cook_log: false`（既定 off。kaji-quest 側で手順ごとに記録する運用と二重になるため） |
| kaji-quest → recipi | 「翌日の献立を決める」「夜ご飯を作る」の詳細に recipi のページへのリンク | kaji-quest の `routines/daily.yml` の `checklist` に URL を書く | kaji-quest 側 |

XP・バッジ・ストリークは recipi に持たない。料理の継続は kaji-quest が数える。recipi が持つのは**料理の中身の記録**だけ。

---

## 14. `config.yml`

```yaml
# config.yml — recipi の設定。★ 公開リポジトリ。名前・生年月日・住所・顔写真はここにも他にも書かない。

repo:
  owner: peirin1230-ship-it
  name: recipi
  branch: main

request:
  default_type: dinner
  default_budget: 25              # 分。「今夜」の初期値
  budget_chips: [15, 20, 30, 45, 60]
  default_mode: auto              # auto / pick（§6.4）

suggest:
  explore_ratio: 0.3              # 本命を「新しい料理」にする割合
  no_repeat_days: 14              # 同じ料理を出さない日数
  same_main_ingredient_max_days: 2
  use_up_days: 3                  # use_by まで N 日以内の物を「使い切り」に自動で入れる

generation:
  model: claude-opus-5-5
  effort: high
  max_retries: 2                  # 検査不合格のやり直し回数
  time_margin: 0.9                # planned ≤ budget × この値
  fallbacks: default              # 安全機構で断られたときに別モデルへ（server-side fallback）。off で無効
  budget_usd_per_month: 15        # 月の API 費用の上限。超えたら生成を止める

learn:
  window_days: 90
  min_logs_for_speed: 20
  recent_n: 5                     # レシピの統計に使う直近の回数
  standard: { cooked: 3, r_avg: 70, f_avg: 4.0 }
  revision: { r_below: 50, times: 2, max_revisions: 3 }
  retire: { f_at_most: 2.0, times: 2 }
  photo_note: false               # 完成写真の一言（§8.5）。Phase 4 で true

photos:
  max_edge_px: 1280
  jpeg_quality: 0.8

kaji_quest:
  repo: peirin1230-ship-it/kaji-quest
  branch: main
  import_shopping: true
  push_shopping: false
  write_cook_log: false

privacy:
  log_time: true                  # false で記録の ts を日付だけにする
```

---

## 15. 非機能要件

### 15.1 プライバシー（公開リポジトリ前提）
- Pages を無料で使うため**公開リポジトリ**とする。そのため次を守る。気になるなら Private（Pages は有料プラン）。
- 名前・生年月日・住所・学校や園・顔を**どのファイルにも書かない、写さない**。家族は `me` / `partner` / `kid`、子どもは `age_band` だけ。
- 写真は料理だけ。端末で縮小・再エンコードし、EXIF（位置情報）を落としてから上げる。
- 冷蔵庫の写真（`inbox/`）は処理後に削除する。履歴には残るので、**写すのは庫内だけ**にする。
- `logs/` に残るのは日付・時刻・レシピ id・時間・評価・一言だけ。`privacy.log_time: false` で時刻を落とせる。
- PAT は端末の localStorage にだけ。API キーは Secrets にだけ。ページのコードにもログにも出さない。

### 15.2 コスト
- Actions: 生成 1 回 2〜3 分、夜間 1〜2 分、週次 2 分 → 月 150 分前後。公開リポジトリの Actions は無料（分数の上限なし）。
- Claude API（2026-10 の単価、`claude-opus-5-5` 入力 4 USD / 出力 20 USD per 1M トークン）:

| 処理 | 回数の目安 | 1 回 | 月 |
|------|-----------|------|-----|
| レシピ生成（やり直し込み） | 25 回/月 | 0.10 USD | 2.5 USD |
| 別案の詳細・改訂 | 8 回/月 | 0.08 USD | 0.6 USD |
| 冷蔵庫の写真 | 6 回/月 | 0.03 USD | 0.2 USD |
| 夜間の要約 | 20 回/月 | 0.05 USD | 1.0 USD |
| 週次 | 4 回/月 | 0.10 USD | 0.4 USD |
| **合計** | | | **5 USD 前後** |

`requests/<id>.json` の `result.cost_usd` に毎回の実費を書き、「今週」に月の累計を出す。上限（`config.yml` に `budget_usd_per_month`、初期 15）を超えたら生成を止めて知らせる。
**無料の経路**（§7.7。`CLAUDE_CODE_OAUTH_TOKEN`）なら API 費用は 0。Claude の契約の利用枠（5 時間ごとの上限）を 1 注文あたり数分ぶん使う。Actions の分数は公開リポジトリなので無料。

### 15.3 可用性・フォールバック
- **Actions が落ちても手で回せる**: `pantry.json` / `equipment.yml` / `family.yml` / `profile/learned.yml` を読んで Claude Code（または Claude アプリ）に聞けば同じレシピが作れる（付録 D）。レシピは手で書いた Markdown でもページに出る。
- 記録はページが無くても `logs/` に 1 行足せば成立する。集計はログから再計算（冪等）。
- 生成が失敗したら理由を見せて終わる。黙って古い候補を出さない。

### 15.4 保守性・容量
- 器具・家族・設定・プロンプトは YAML / Markdown 1 ファイルで完結。コード変更を伴わない。
- `scripts/validate.py` は `build_site.py` からも呼ぶ。壊れたレシピ・YAML があれば配信しない（kaji-quest と同じ）。
- 写真で年 100MB 弱。1GB に近づいたら 2 年より古い物を別リポジトリへ。`recipes/` の `photo` のパスは URL のままにしておけばページは変わらない。

### 15.5 Generator への入力の扱い
- 冷蔵庫の写真や `learned` の自由記述は Generator への入力になる。**出力は必ず JSON スキーマで受け、`validate.py` で検査する**。自由文が規則を上書きできる作りにしない。
- `pantry_photo` の結果は差分として見せ、自分が確認してから反映する。自動反映しない。

---

## 16. 段階的導入ロードマップ

> **最重要**: Phase 0 を 2 週間回してから Phase 1 へ。ページも Actions も、レシピの形が固まってから作る。

### Phase 0 — ファイルと Claude Code だけ（Week 1-2）
- [ ] 公開リポジトリ作成。`equipment.yml` / `family.yml` / `config.yml` を書く（30 分）
- [ ] `pantry.json` を手で書く（冷蔵庫を開けて 10 分。`staples` は `ok` だけでよい）
- [ ] `knowledge/safety.md` を書く（幼児食の NG と塩分だけ）
- [ ] `CLAUDE.md`（付録 D）を置き、Claude Code のセッションで「今夜 25 分、大人 2 子 1」と頼む → `recipes/<id>.md` ができる
- [ ] 作ったら `logs/` に 1 行を**手で**書く（写真はまだ無くてよい）
- **判定**: 2 週間で 6 回作れたら Phase 1。レシピの形（§6.5）に不足があればここで直す。この面倒さがページの設計になる。

### Phase 1 — ページと生成（Week 3-6）
- [ ] `site/`（今夜・レシピ・調理モード・記録・在庫）と `build-pages.yml`
- [ ] `agent.yml`（`recipe` / `recipe_detail`）、`validate.py`、`render_recipe.py`
- [ ] 写真の縮小とアップロード、図鑑（グリッドだけ）
- [ ] `data/ingredients.yml` に 100 品目
- **判定**: 注文 3 タップ、記録 60 秒が守れているか。守れていなければ機能を削る。

### Phase 2 — 学習ループ（Week 7-10）
- [ ] `nightly-learn.yml` の決定的な部分（統計・速度係数・定番・封印）
- [ ] 要約（`equipment_notes` / `recipe_notes` / `kid.works_if`）
- [ ] 改訂（`revise`）と差分表示
- [ ] 「今週」カードと `quality`
- **判定**: 速度係数が効いて時間誤差の中央値が縮んだか。定番が 1 本できたか。

### Phase 3 — 在庫を楽に、連携（Week 11-14）
- [ ] 冷蔵庫の写真 → 差分確認 → 反映
- [ ] kaji-quest の買い物取り込み、買い物メモへの追加
- [ ] 週の献立（`weekly`）と `weekly-digest.yml`
- [ ] `prep`（翌日分の仕込み）と `breakfast`

### Phase 4 — 仕上がりと季節（Week 15〜）
- [ ] 完成写真の一言（§8.5）
- [ ] `compact` の自動切替、`lunchbox`
- [ ] 季節・行事（在庫の旬と `digests` の提案に反映）
- [ ] 写真のアーカイブ運用

---

## 17. 成功指標（KPI）

| 指標 | 目標 | 測定 |
|------|------|------|
| 提案の採用率 | 70% 以上 | 週次自動 |
| 完走率（調理開始 → 記録） | 90% 以上 | 週次自動 |
| 時間誤差の中央値 | ±20% 以内（Phase 2 以降 ±15%） | 週次自動 |
| 家族評価 F の平均 | 4.0 以上、12 週移動平均が上向き | 週次自動 |
| 再現性 R の平均 | 75 以上 | 週次自動 |
| 定番レシピ数 | 3 か月で 10 本 | 自動 |
| 新規率 | 0.2〜0.4 | 週次自動 |
| 期限切れで捨てた記録 | 月 2 件以下 | 自動 |
| 記録の所要 | 60 秒以内（記録画面を開いてから保存まで） | 自動（ページが計測） |
| 月のコスト | API 5 USD 前後、上限 15 USD | 自動 |
| 続いているか | 12 週続けて週 3 回以上の記録 | 自動 |

> 数字が全部 🟢 でも、夕食の時間が楽しくなければ設計が間違っている。KPI は計器であって目的ではない。

---

## 18. 継続の仕掛けとアンチパターン

### 18.1 続けるための仕掛け

| 仕掛け | 意図 |
|--------|------|
| 注文 3 タップ、記録 60 秒 | 考える手間と記録の手間を限界まで削る |
| 本命 1 本（候補で迷わせない） | 「選ぶ」も判断疲れ。別案は後ろに |
| 時間を偽らない | 「20 分」と書いて 35 分かかるレシピは信用を失う。無理なら無理と言う |
| 写真が図鑑に並ぶ | 増えていく実感。失敗作も並ぶ（顔にはしない） |
| R は「レシピの相性」 | うまくいかない原因をレシピに置き、改訂で返す。自分を責めない |
| 定番の昇格 | 「これは間違いない」が溜まる。忙しい日の逃げ道になる |
| 使い切りの自動選択 | 冷蔵庫を開けて悩む時間が消える |
| 学習は自動、上書きは 1 ファイル | 設定をいじる家事を作らない |
| 新規率の下限 | 定番だけに収束して飽きるのを防ぐ |

### 18.2 アンチパターン

| ❌ | なぜダメか |
|----|-----------|
| 在庫をグラム単位で正確に保とうとする | 棚卸しが家事になる。3 段階と「だいたい」で十分 |
| 家族の点数を並べて見せる | 評価を頼む行為が家族の負担になる。F は提案のためだけ |
| 子どもが食べないレシピを「失敗」扱いする | 情報であって失敗ではない。形を変えて再提案する |
| 時間に収めるために工程を省いて「20 分」と書く | 再現できない。信用を失い、採用率が落ちる |
| レシピサイトの写真をカードの顔にする | うちの実物と違う。図鑑の意味が無くなる |
| 全機能を作ってから運用開始 | Phase 0 の手運用でレシピの形を固める。形が固まらないままページを作ると作り直す |
| 評価を促す通知 | 通知が敵になる。聞けたときに入れる |
| 学習結果を手で細かく直す | `overrides.yml` に 1 行書けば済む。learned を直すと次の夜に消える |

---

## 19. 将来拡張

- **音声で注文**: iOS ショートカット → `repository_dispatch`。「25 分、さっぱり」と言うだけ。
- **仕込みと夕食の連結**: `prep` で仕込んだ物を翌日の `dinner` の在庫として扱い、「温めるだけ」のレシピを優先する。
- **季節の旬マスタ**: `data/ingredients.yml` に旬の月を持ち、提案と週の献立に反映。
- **来客モード**: 人数と「子ども無し」で一時的に塩分・辛さの制約を外す。
- **塩分の週次集計**: `salt` を週で合計し、「今週は濃いめが続いた」とだけ出す（栄養管理には踏み込まない）。
- **kaji-quest のバッジ連携**: 「新しい料理 10 種」「定番 5 本」を kaji-quest 側のバッジ条件に `custom` で足す（recipi はバッジを持たない原則のまま）。

---

## 付録 A: レシピファイルの完全例

`recipes/r-20261008-torimomo-teriyaki.md`

```markdown
---
id: r-20261008-torimomo-teriyaki
title: 鶏もも肉の照り焼きと小松菜のおひたし
version: 1
supersedes: null
status: tried
created: 2026-10-08
request: req-20261008-1712
generated_by: { model: claude-opus-5-5, prompt_version: 3 }
type: dinner
servings: { adults: 2, kids: 1 }
time: { budget: 25, planned: 22, active: 18, raw_estimate: 19, speed_factor: 1.15 }
dishes:
  - { name: 鶏もも肉の照り焼き, role: main }
  - { name: 小松菜のおひたし, role: side }
equipment: [ih-r, ih-l, fp26, pot16, microwave]
ingredients:
  - { name: 鶏もも肉, qty: 300, unit: g, pantry: 鶏もも肉, for: main }
  - { name: 片栗粉, qty: 1, unit: 小さじ, grams: 3, pantry: 片栗粉, for: main }
  - { name: サラダ油, qty: 1, unit: 小さじ, grams: 4, pantry: サラダ油, for: main }
  - { name: 醤油, qty: 1.5, unit: 大さじ, grams: 27, pantry: 醤油, for: main }
  - { name: みりん, qty: 1.5, unit: 大さじ, grams: 27, pantry: みりん, for: main }
  - { name: 酒, qty: 1, unit: 大さじ, grams: 15, pantry: 酒, for: main, substitute: 水 }
  - { name: 砂糖, qty: 1, unit: 小さじ, grams: 3, pantry: 砂糖, for: main }
  - { name: 小松菜, qty: 1, unit: 束, grams: 200, pantry: 小松菜, for: side, use_up: true }
  - { name: だしパック, qty: 1, unit: 個, pantry: だしパック, for: side }
  - { name: 醤油, qty: 1, unit: 小さじ, grams: 6, pantry: 醤油, for: side }
tags: [和, 主菜, 副菜, 子ども向け, 使い切り, 鶏もも肉, 照り焼き, おひたし]
salt: { total_g: 4.4, adult_per_serving_g: 1.9, kid_g: 0.4 }
kid: { rule: separate, cut: "1cm 角", note: "タレを絡める前に取り出す。皮は外す。小松菜は葉先だけを 5mm に刻む" }
keep: { fridge_days: 2, freezer: true, reheat: "レンジ 600W 1 分 30 秒。タレが煮詰まるので水 小さじ 1 を足す" }
photo: photos/r-20261008-torimomo-teriyaki/20261008-1.jpg
stats: { cooked: 1, r_avg: 75, f_avg: 4.7, last: 2026-10-08 }
detail: full
image_text: "照りのある濃い茶色の鶏肉に白ごま。横に濃い緑のおひたし、上にかつお節"
---

## 段取り表（22 分）

| 分 | IH 右（大）/ fp26 | IH 左（小）/ pot16 | 手・レンジ |
|---|---|---|---|
| 0 | | 水 1L を入れ、レベル 9 で沸かす | 鶏ももを一口大（3cm 角）に。厚い所は開く。片栗粉を薄くまぶす |
| 3 | 油 小さじ 1。皮目を下に並べ、レベル 6 | | タレを合わせる（醤油・みりん・酒・砂糖） |
| 4 | **3 分触らない** | 沸いたら小松菜を茎から入れて 1 分、葉を入れて 30 秒 | 小松菜を 4cm に切る（先に茎・葉を分ける） |
| 6 | | 小松菜をザルに。水で冷まし、絞る | |
| 7 | 返して 3 分（目安: 皮がきつね色） | 鍋に水 150ml とだしパック、レベル 5 で 3 分 | 🍼 子どもの分 60g を取り出す |
| 10 | レベル 4 に落とし、タレを入れる | 火を止め、だしに醤油 小さじ 1 | 子どもの分を 1cm 角に。皮は外す |
| 12 | 煮絡める（目安: 泡が大きく、箸で線が引ける） | 小松菜を 4cm → 器へ。だしを回しかける | 🍼 小松菜の葉先を 5mm に刻んで子どもの器へ |
| 14 | 火を止める | | 盛り付け。鶏に白ごま |
| 16 | | | 配膳。子どもの分は冷ましておく |

## 材料（大人 2・子 1）
（front matter と同じ。ページは front matter から表にする）

## 手順

### 鶏もも肉の照り焼き
1. **切る（3 分 / prep）** 一口大（3cm 角）。厚い所は包丁を寝かせて開く。片栗粉 小さじ 1 を全体に薄く（ボウルで和えると早い）。
2. **焼く（7 分 / heat）** IH 右・レベル 6。油 小さじ 1。皮目を下に、重ならないように並べて**3 分触らない**。
   - 目安: 縁が白くなり、皮がきつね色。油がはねる音が小さくなる。
   - ⚠ うちの IH 右は 7 以上で焦げる。6 を上限に。
   - 返して 3 分。🍼 ここで子どもの分 60g を取り出す。
3. **タレ（3 分 / heat）** レベル 4 に落としてからタレを入れる（高いと一気に焦げる）。
   - 目安: 泡が大きくなり、箸で底に線が引ける。黒ずんだら火を止める。
4. **盛る（2 分 / serve）** 白ごまを振る。

### 小松菜のおひたし
1. **切る（2 分 / prep）** 根元を落とし、茎と葉に分けて 4cm。
2. **茹でる（2 分 / heat）** 沸いた湯に茎 → 1 分 → 葉 → 30 秒。目安: 色が濃くなり、茎が曲がる。
   - 代替: 耐熱ボウルに入れてラップ、レンジ 600W 2 分でも可（`recipe_notes` より）。
3. **冷ます・絞る（1 分 / prep）** 水で冷まして固く絞る。
4. **だし（3 分 / wait）** 水 150ml とだしパック、レベル 5 で 3 分。火を止めて醤油 小さじ 1。
5. **盛る（1 分 / serve）** 器に小松菜、だしを回しかける。

## 子どもの分
- 鶏: タレの前に 60g を取り出し、皮を外して 1cm 角。タレは付けない（塩分 0.1g 以下）。
- 小松菜: 葉先だけ 5mm に刻む。だしを小さじ 1 だけ。
- 冷ましてから出す（配膳の 2 分前に取り分けておく）。

## 保存・翌日
- 鶏は冷蔵 2 日。冷凍可（タレごと保存袋で平らに）。温め直しはレンジ 600W 1 分 30 秒、水 小さじ 1 を足す。
- おひたしは冷蔵 2 日。だしは別に保存すると水っぽくならない。

## 片付け
- 食洗機: pot16、ボウル、器
- 手洗い: fp26（食洗機不可）。タレが焦げ付く前に、火を止めたらすぐ湯を張る

## 作ったときのメモ
- 2026-10-08 ・ 26 分（見込み 22）・ R 75 ・ F 4.7 ・ 少し変えた: 醤油を大さじ 1 に減らした。小松菜は茹でずにレンジ 2 分 ・ 気づき: 皮目 3 分は長い。2 分半で十分 ・ 📷 20261008-1.jpg
```

---

## 付録 B: 生成プロンプトの骨子（`prompts/recipe.md`）

```markdown
---
prompt_version: 3
---
あなたは、この家専属の料理の段取り係です。レシピサイトの一般的なレシピではなく、
**この家の器具・在庫・家族・時間**の中で、確実に再現できるレシピを 1 本組み立てます。

## 絶対に守ること
- 在庫に無い食材を使わない。staples が none の物を使わない。
- equipment に無い道具、missing の道具を使わない。火加減は器具の目盛りで書く。
- safety.md の規則（アレルギー、年齢帯の NG 食材、塩分、加熱）に反しない。
- 時間予算に収まらないときは、収まる案だけを出す。収まらないなら「収まらない」と答える。
- 分量は g（液体の調味料は大さじ・小さじ併記）。「適量」は仕上げの塩・こしょう以外で使わない。
- 各工程に、時間と「仕上がりの目安（見た目・音・匂い・触感）」の両方を書く。

## この家について
（equipment.yml / family.yml / learned.yml / overrides.yml をここに展開。
 learned の equipment_notes と recipe_notes は「失敗しやすい点」に優先して使う。
 家族の好みは役割で書く。「大人の一人は酸味を好む」「子どもは葉物を刻めば食べる」）

## 最近作った物（出さない）
（直近 14 日のレシピ名と主材料）

## 在庫
（pantry.json を期限順に。use_up の物は必ず使う）

## 注文
（requests/<id>.json）

## 出力
JSON スキーマに従う。段取り表はレーン（コンロの口ごと・レンジ・手）×分で、
wait の工程中に他レーンの prep を割り当てる。工程には kind（prep/heat/wait/serve）と、
あれば timer（秒）を付ける。本命 1 本に加えて別案 2 つ（title / minutes / why の一行）。
```

---

## 付録 C: 注文から記録までの画面の流れ（文言例）

```
[今夜]
  時間   (15) (20) [25] (30) (45) (60) (___)
  人数   大人 2 ・ 子ども 1                      品数 [主菜+副菜 ▾]
  気分   (さっぱり) (がっつり) (和) (洋) (中) (麺) (丼)
  使い切り ☑ 小松菜（あと 1 日） ☑ 豆腐（あと 2 日） ☐ 卵
  一言   妻は 20 時。子どもだけ先に
                                            [ 考えてもらう ]
  …考え中（1〜2 分）。閉じても大丈夫。

[レシピ]
  🍗 鶏もも肉の照り焼きと小松菜のおひたし           22 分 ・ 大人 2 子 1
  （絵）照りのある濃い茶色の鶏肉に白ごま。横に濃い緑のおひたし
  材料 10 ・ 使い切り: 小松菜 ・ 器具: IH 右・左 / fp26 / pot16
  [ 作る ]   [ ほかの案 ]   [ あとで ]
  別案: 豆腐と鶏ひき肉のあんかけ（20 分・定番）／ 小松菜と卵の中華炒め（15 分・新しい）

[調理モード]
  3 分  IH 右  油 小さじ 1、皮目を下に、レベル 6
        ⏱ 3:00  触らない                                   [できた]
        手      タレを合わせる
  …
                                        [ できた！ → 記録へ ]

[記録]  （§9.1）
  記録した。図鑑に 1 枚増えた。
```

---

## 付録 D: Phase 0 — Claude Code を Generator にする（`CLAUDE.md` の内容案）

```markdown
# recipi — Claude Code への指示

このリポジトリは家の料理のための道具。あなたは Generator（docs/SPEC.md §4）を務める。

## 頼まれたらやること
「今夜 25 分、大人 2 子 1」のように頼まれたら:
1. `equipment.yml` / `family.yml` / `pantry.json` / `profile/learned.yml` / `profile/overrides.yml` / `knowledge/safety.md` を読む
2. `logs/` の直近 14 日のレシピ id を見て、同じ物を出さない
3. docs/SPEC.md §7 の規則で、§6.5 の形式のレシピを 1 本 `recipes/<id>.md` に書く（id は `r-YYYYMMDD-<ローマ字>`）
4. 別案 2 つは一行で答える（ファイルにしない）
5. 時間予算に収まらないなら、収まらないと言い、近い案を出す

## 作った後に頼まれたら
「作った。26 分、少し変えた（醤油を減らした）、仕上がり 4、自分 4、妻 5、子ども完食」と言われたら:
1. `logs/YYYY/MM.jsonl` に §6.6 の 1 行を足す（R と F は §9.2 / §9.3 の式で計算）
2. レシピの「作ったときのメモ」に 1 行足し、`stats` を更新する
3. 使った食材を `pantry.json` から減らす（聞かれたら）

## 守ること
- 名前・生年月日・住所を書かない。家族は me / partner / kid
- `profile/learned.yml` は手で直さない（Phase 2 で夜間ジョブが書く。それまでは空でよい）
- 在庫に無い物、器具に無い物を使わない
```
