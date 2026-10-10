# recipi

家にある食材と調理器具を登録しておくと、今日使える時間で作れるレシピを細かく組み立ててくれる道具。
作るたびに写真・所要時間・再現できたか・家族の反応を記録し、次の提案に活かす。
仕様は [docs/SPEC.md](docs/SPEC.md)。[kaji-quest](https://github.com/peirin1230-ship-it/kaji-quest) の弟分で、運用の型（GitHub Pages のページ 1 枚、Issue は使わない、記録は `logs/` にコミット）は同じ。

| | URL |
|---|---|
| **ページ**（ホーム画面に追加して使う） | https://peirin1230-ship-it.github.io/recipi/ |
| リポジトリ | https://github.com/peirin1230-ship-it/recipi |
| Actions の実行ログ（ページの組み立て・生成・夜間の学習） | https://github.com/peirin1230-ship-it/recipi/actions |
| ルーティン（ページのボタンで呼ばれる Claude Code の実行） | https://claude.ai/code/routines →「recipi: 注文を処理（ページのボタンで起動）」 |
| kaji-quest のページ | https://peirin1230-ship-it.github.io/kaji-quest/ |

## 使い方

1. ページを開く。スマホなら「ホーム画面に追加」（iPhone: Safari の共有 → ホーム画面に追加 / Android: Chrome のメニュー → ホーム画面に追加）。アプリのように全画面で開く。初回だけ ⚙ から GitHub トークンを保存する（下記）
2. **今夜** で時間（15/20/30/45/60 分）を選んで「考えてもらう」。休みの日など時間を気にしないなら時間の「無制限」を選ぶ（手間のかかる料理も出る）。本命のレシピ 1 本と別案 2 つが出る（閉じても大丈夫。開き直せば続きから）。別案をタップすると、その案で詳細を作る。「ほかの案」でもう一度
3. **レシピ** は、うちの器具の火加減・分量（g と大さじ）・段取り表（コンロの口ごとのレーン×分）・仕上がりの目安・子どもの取り分け・保存・片付けまで書いてある。「作る」で **調理モード**（大きな字、タイマー、画面が消えない）
4. 作り終えたら **記録**: 写真 1 枚、時間（自動）、手順どおり？、仕上がり ★、自分と家族の ★、子どもは完食／半分／少し／食べない、気づき 1 行。全部任意。60 秒で終わる
5. **在庫** は「鶏もも肉、小松菜、卵」のように「、」区切りで足す（あるかないかだけ。数は持たない）。📷 で冷蔵庫の写真から読み取り（差分を確認してから反映）。kaji-quest で記録した買い物も取り込める。調味料は「ある／少ない／ない」の 3 段階だけ。「買い足すといい物を聞く」を押すと、在庫・器具・家族・旬から買い足す食材を理由つきで出す（「今週の主菜に」「常備すると楽」「子ども向け」「旬」）。チェックして kaji-quest の買い物メモへ送れる
6. **図鑑** に作った料理が写真つきで並ぶ。**レシピ一覧** で定番・試した・下書き・封印を見る。できたレシピが一覧に無ければ、レシピの「一覧に追加」で載せる（レシピカードからは消え、見るときは一覧から開く。1〜2 分でほかの端末にも出る）。追加せずにそのまま作ったら、記録のときに「作った」として一覧に入る。要らない物は「削除」（記録と写真は残る）。**今週** に家族評価 F・再現性 R・時間誤差の推移と、週次ダイジェストの「来週の提案」が出る
7. 夜中に学習が走る（`profile/learned.yml`）。速度係数・好み・器具の癖・定番の昇格は自動。学習が間違っていたら `profile/overrides.yml` に 1 行書く

記録は `logs/YYYY/MM.jsonl` に 1 行ずつ、レシピは `recipes/<id>.md` に 1 ファイルずつコミットされる。集計はページを開くたびにログから計算する。

## 初回セットアップ（スマホのブラウザだけでできる）

github.com にログインしておく。ターミナルは要らない。

1. **Pages を有効にする（1 回だけ）**: https://github.com/peirin1230-ship-it/recipi/settings/pages → Build and deployment → Source: **Deploy from a branch** → Branch: **gh-pages** / (root) → Save。数分後に https://peirin1230-ship-it.github.io/recipi/ が開く（`main` に push するたびに `build-pages` が `gh-pages` を作り直す）
2. **ページ用トークン（1 回だけ）**: https://github.com/settings/personal-access-tokens/new
   - Repository access: Only select repositories → `recipi` と `kaji-quest`（買い物メモと夜ご飯の記録を kaji-quest に書くため）
   - Permissions → Repository permissions: **Contents → Read and write**
   - 発行した `github_pat_…` をページの ⚙ に貼って保存する。トークンはそのブラウザにだけ残り、GitHub API 以外には送られない
3. **ホーム画面に追加**: iPhone は Safari の共有 → 「ホーム画面に追加」。Android は Chrome のメニュー → 「ホーム画面に追加」
4. **家の情報を直す**（github.com の鉛筆マークで編集できる）
   - 器具: https://github.com/peirin1230-ship-it/recipi/edit/main/equipment.yml（コンロの種類と口数、レンジの W 数、フライパンの大きさ、無い道具）
   - 家族: https://github.com/peirin1230-ship-it/recipi/edit/main/family.yml（人数、子どもの年齢帯、アレルギー、塩分の方針）
   - 在庫: ページの「在庫」から（`pantry.json`）
   - **名前・生年月日は書かない**（公開リポジトリ）

## レシピ生成の設定（スマホだけでできる。コマンド不要）

ページの「考えてもらう」を押すと `requests/<id>.json` ができ、GitHub Actions が Claude Code の**ルーティン**を呼ぶ。ルーティンのセッションがその注文を処理して push し、2〜4 分でページのレシピカードに出る。費用はかからない（Claude の契約の枠内）。定期実行は無く、ボタンを押したときだけ動く。

初回に 1 回だけ、ルーティンに「リポジトリ」と「API トリガー」を付け、その URL とトークンを GitHub の Secrets に入れる（5 分）。

1. https://claude.ai/code/routines を開き、「recipi: 注文を処理（ページのボタンで起動）」→ 名前の横のメニュー → **Edit**
2. **Repositories**（リポジトリ）に `peirin1230-ship-it/recipi` を追加する（ルーティンが push できるようにするため。これが無いと「403」で失敗する）
3. **Select a trigger** の **Add another trigger** → **API** を選び、保存する
4. 表示された **URL** をコピーし、**Generate token** を押してトークン（`sk-ant-oat01-…`）をコピーする（1 回しか表示されない）
5. https://github.com/peirin1230-ship-it/recipi/settings/secrets/actions で **New repository secret** を 2 つ作る: `ROUTINE_FIRE_URL`（URL）と `ROUTINE_FIRE_TOKEN`（トークン）
6. ページで注文して試す。失敗したときは注文のところに理由が出る（Actions の実行ログは https://github.com/peirin1230-ship-it/recipi/actions ）

| 経路 | 費用 | 待ち時間 | 要るもの |
|---|---|---|---|
| **ページのボタン → ルーティン**（上の設定） | 無料 | 2〜4 分 | 上の 1 回の設定 |
| 手動 `/recipi-orders` | 無料 | 2〜4 分 | スマホの Claude アプリで Claude Code のセッションを開いて打つ（ページで注文したあと） |
| Actions（契約トークン） | 無料 | 2〜4 分 | PC で `claude setup-token` を 1 回実行し、[Secrets](https://github.com/peirin1230-ship-it/recipi/settings/secrets/actions) に `CLAUDE_CODE_OAUTH_TOKEN`。あればルーティンより優先 |
| Actions（API キー） | 従量課金。1 回 0.1 USD 前後 | 1〜2 分 | [Secrets](https://github.com/peirin1230-ship-it/recipi/settings/secrets/actions) に `ANTHROPIC_API_KEY`。あれば最優先。上限は `config.yml` の `generation.budget_usd_per_month` |

- どの経路で作っても同じ検査・同じファイル形式で、学習は区別しない
- ページは注文の結果を 6 分までは 5 秒ごと、その後は 1 分ごとに最長 24 時間確認する。閉じても、開き直せば続きから
- 手元の Claude Code からは `/recipi-tonight 25 大人2 子1 さっぱり` で、注文からレシピまでその場で作れる
- 中身は `python3 scripts/agent.py context --request <id>`（Generator に渡す物を全部表示）→ Claude Code が JSON を書く → `python3 scripts/agent.py finish --request <id> --json …`（検査・整形・保存・push）。API キーがあるときは `scripts/agent.py auto` が同じことを API で行う

## kaji-quest との連携

| 向き | 何が起きるか | 設定 |
|---|---|---|
| kaji-quest → recipi | kaji-quest で「買い物を記録」した物を、ページの「在庫」の「kaji-quest の買い物を取り込む」で在庫に入れる（確認してから反映） | `config.yml` の `kaji_quest.import_shopping`（on） |
| recipi → kaji-quest | レシピカードの「足りない物を買い物メモへ」で、在庫に無い材料を kaji-quest の買い物メモに足す | `kaji_quest.push_shopping`（on。ページ用トークンに kaji-quest も含める） |
| recipi → kaji-quest | 調理を記録すると、kaji-quest の「夜ご飯を作る」も実時間つきで完了として記録される（kaji-quest 側で重ねて記録しなくてよい） | `kaji_quest.write_cook_log`（on） |
| kaji-quest → recipi | kaji-quest のページ右上の家のアイコン横にある 🍳 から recipi へ。「翌日の献立を決める」「夜ご飯を作る」「翌日分の仕込み」の詳細にも recipi の URL | kaji-quest 側 |
| recipi → kaji-quest | recipi のページ右上の家のアイコンから kaji-quest へ | — |

XP・バッジ・ストリークは kaji-quest が数える。recipi は料理の中身（レシピ・写真・評価）だけを持つ。

## 変えたいとき

| したいこと | 場所 |
|---|---|
| 器具を足す・減らす・癖（火が強い等）を書く・無い道具を明示する | `equipment.yml` |
| 人数・子どもの年齢帯・アレルギー・塩分の方針・パートナーが遅い曜日 | `family.yml` |
| 在庫 | ページの「在庫」（`pantry.json` に保存。手で直してもよい） |
| 食材の別名・分類・日持ちの目安を足す | `data/ingredients.yml` |
| 学習結果を上書きする（速度係数、必ず好み扱い、絶対に使わない物、規則） | `profile/overrides.yml` |
| 時間の既定値・候補の出し方・定番や封印の基準・写真の大きさ・kaji-quest 連携 | `config.yml` |
| レシピの書き方の規則、改訂・写真読み取り・要約・週次の指示 | `prompts/*.md`（`prompt_version` を上げると「今週」で版ごとに比べられる） |
| 幼児食の NG・塩分の上限・加熱・日持ち | `knowledge/safety.md`（Generator が必ず守る。`scripts/validate.py` も検査する） |
| 火加減・塩分の計算・取り分け・保存・切り方・段取りの基礎 | `knowledge/basics/*.md` |
| 手順に付くコツ | `knowledge/tips/*.md`（1 コツ 1 ファイル。`tags:` に工程の種類） |
| レシピを手で直す | `recipes/<id>.md`（front matter が本体。本文は人が読む用） |
| 見た目や動き | `site/`（`index.html` / `app.js` / `style.css`） |
| 学習・ダイジェストの時刻 | `.github/workflows/nightly-learn.yml`（03:30 JST）/ `weekly-digest.yml`（日曜 20:00 JST） |
| ルーティンの指示文 | https://claude.ai/code/routines（Edit。定期実行は無し） |

## 開発

```
pip install pyyaml markdown anthropic pytest
python3 scripts/build_site.py _site      # _site/ を静的サーバで開く
python3 -m pytest -q                     # テスト（API は呼ばない）
python3 scripts/agent.py auto --request <req-id> --mock --no-git   # Generator の動作確認
python3 scripts/learn.py --no-llm --dry-run --force                # 夜間ジョブの動作確認
python3 scripts/validate.py --all                                  # レシピの検査
node tests/site/smoke.js                                           # ページのスモークテスト（tests/site/README.md）
```

## 公開リポジトリでの注意

名前・生年月日・住所・顔は書かない、写さない。家族は `me` / `partner` / `kid`、子どもは年齢帯だけ。写真は料理だけ（端末で縮小し、位置情報を落としてから上げる）。冷蔵庫の写真は処理後に消す（履歴には残るので庫内だけを写す）。詳しくは仕様書 §15.1。
