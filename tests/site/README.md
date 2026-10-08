# ページのスモークテスト（Playwright）

GitHub API をモックして、ページの描画と主要な流れ（注文 → dispatch、調理モード、記録、在庫、写真の読み取り、kaji-quest の取り込み）を確認する。

```
npm i -g playwright && npx playwright install chromium   # 初回
tests/site/run.sh             # tests/fixtures の在庫とレシピで _site_test/ を組み立て、smoke.js（67 件）と smoke2.js（21 件）を実行
```

本物の `pantry.json` と `recipes/` は家の状態なので使わない。

`PW_ROOT` に playwright の node_modules、`SHOTS` にスクリーンショットの出力先を指定できる。
