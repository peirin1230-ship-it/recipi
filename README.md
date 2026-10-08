# recipi

家にある食材と調理器具を登録しておくと、今日使える時間で作れるレシピを細かく組み立ててくれる道具。
作るたびに写真・所要時間・再現できたか・家族の反応を記録し、次の提案に活かす。

仕様は [docs/SPEC.md](docs/SPEC.md)。[kaji-quest](https://github.com/peirin1230-ship-it/kaji-quest) の弟分で、運用の型（GitHub Pages のページ 1 枚、Issue は使わない、記録は `logs/` にコミット）は同じ。

## いまの状態

仕様だけ。実装は仕様書の §16 のロードマップに沿って進める。
Phase 0 は `equipment.yml` / `family.yml` / `pantry.json` を手で書き、Claude Code に「今夜 25 分、大人 2 子 1」と頼むところから（付録 D）。

## 公開リポジトリでの注意

名前・生年月日・住所・顔は書かない、写さない。家族は `me` / `partner` / `kid`、子どもは年齢帯だけ。写真は料理だけ（仕様書 §15.1）。
