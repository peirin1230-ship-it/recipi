# ページのスモークテスト（Playwright）

GitHub API をモックして、ページの描画と主要な流れ（注文 → dispatch、調理モード、記録、在庫、写真の読み取り、kaji-quest の取り込み）を確認する。

```
npm i -g playwright && npx playwright install chromium   # 初回
python3 scripts/build_site.py _site
(cd _site && python3 -m http.server 8765 &)
node tests/site/smoke.js      # 静的な描画と記録（67 件）
node tests/site/smoke2.js     # 生成の流れ・写真・取り込み（21 件）
```

`PW_ROOT` に playwright の node_modules、`SHOTS` にスクリーンショットの出力先を指定できる。
