// recipi smoke test: GitHub API はモックして静的な描画と主要な流れを確認する
const { chromium } = require(process.env.PW_ROOT ? require('path').join(process.env.PW_ROOT, 'playwright') : 'playwright');
const fs = require('fs');
const SHOTS = (process.env.SHOTS || '/tmp/recipi-shots');
const pantry = fs.readFileSync(require('path').join(__dirname, '..', 'fixtures', 'pantry.json'), 'utf8');
const b64 = s => Buffer.from(s, 'utf8').toString('base64');
const results = [];
const assert = (cond, label) => { results.push(`${cond ? 'PASS' : 'FAIL'}: ${label}`); if (!cond) process.exitCode = 1; };

async function setup(browser, viewport) {
  const ctx = await browser.newContext({ viewport, locale: 'ja-JP', timezoneId: 'Asia/Tokyo' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource: .* 404/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const puts = []; const store = {}; const mock = { recipe: null };   // mock.recipe = { id, text }: 一覧に無いがリポジトリにはあるレシピ
  await page.route('https://raw.githubusercontent.com/**', route => { const u = route.request().url(); if (mock.recipe && u.includes(`/recipes/${mock.recipe.id}.md`)) return route.fulfill({ status: 200, contentType: 'text/plain', body: mock.recipe.text }); if (u.includes('/recipes/')) return route.fulfill({ status: 404, body: '' }); return route.continue(); });
  await page.route('https://api.github.com/**', async route => {
    const req = route.request(); const url = req.url();
    if (req.method() === 'DELETE') { puts.push({ url, method: 'DELETE', body: JSON.parse(req.postData()) }); return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); }
    if (req.method() === 'GET' && url.includes('/contents/recipes/') && (url.includes('torimomo') || (mock.recipe && url.includes(mock.recipe.id))) && mock.serve) { const text = mock.recipe && url.includes(mock.recipe.id) ? mock.recipe.text : fs.readFileSync(require('path').join(__dirname, '..', 'fixtures', 'recipes', 'r-20261008-torimomo-teriyaki.md'), 'utf8'); return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'r1', content: b64(text) }) }); }
    if (req.method() === 'PUT') { const body = JSON.parse(req.postData()); puts.push({ url, body }); store[url.split('/contents/')[1].split('?')[0]] = body.content; return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ content: { sha: 'newsha' } }) }); }
    if (req.method() === 'POST' && url.endsWith('/dispatches')) { puts.push({ url, body: JSON.parse(req.postData()) }); return route.fulfill({ status: 204, body: '' }); }
    if (url.includes('/contents/pantry.json')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'p1', content: store['pantry.json'] || b64(pantry) }) });
    if (url.includes('/contents/logs/2026/10.jsonl')) {
      const line = JSON.stringify({ id: 'abcabcabcabc', date: '2026-10-06', ts: '2026-10-06T19:05:40+09:00', recipe_id: 'r-20261008-torimomo-teriyaki', version: 1, request_id: null, type: 'dinner', planned_minutes: 18, actual_minutes: 22, fidelity: 'minor', deviation: '醤油を減らした', finish: 4, ratings: { me: 4, partner: null, kid: 'all' }, photo: null, learned: '皮目は 2 分半で十分', pantry_used: [], r_score: 73, f_score: 4.5 });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'l1', content: store['logs/2026/10.jsonl'] || b64(line + '\nnot json\n') }) });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"message":"Not Found"}' });
  });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#order h2') && document.querySelector('#week .stat'));
  return { ctx, page, errors, puts, mock };
}

(async () => {
  const browser = await chromium.launch();
  // ---- デスクトップ ----
  {
    const { ctx, page, errors, puts } = await setup(browser, { width: 1280, height: 900 });
    assert(errors.length === 0, `no console errors (desktop)${errors.length ? ': ' + errors.join(' | ') : ''}`);
    const heads = await page.$$eval('#app .card > h2 .h-t', els => els.map(e => e.textContent.trim()));
    for (const h of ['今夜', 'レシピ', '記録', '在庫', '道具', '図鑑', 'レシピ一覧', '今週']) assert(heads.includes(h), `card heading present: ${h}`);
    assert(await page.$eval('#recipe .rc-title', e => e.textContent.includes('鶏もも肉の照り焼き')), 'sample recipe title rendered');
    const laneCols = await page.$$eval('#recipe table.tl thead th', ths => ths.length - 1);
    assert(laneCols === 3, `段取り表 has 3 lane columns (got ${laneCols})`);
    const laneLabels = await page.$$eval('#recipe table.tl thead th', ths => ths.map(t => t.textContent));
    assert(laneLabels.join('|') === '分|ガスコンロ右|レンジ|手', `lane labels in equipment order: ${laneLabels.join('|')}`);
    const tlRows = await page.$$eval('#recipe table.tl tbody tr', r => r.length);
    assert(tlRows === 11, `段取り表 rows = 11 (got ${tlRows})`);
    const steps = await page.$$eval('#recipe .step', s => s.length);
    assert(steps === 7, `7 steps rendered (got ${steps})`);
    assert(await page.$$eval('#recipe .step .heat', e => e.length) === 2, 'heat labels on 2 steps');
    assert(await page.$$eval('#recipe .step .tm', e => e.length) === 2, 'timer badges on 2 steps');
    assert(await page.$$eval('#recipe details.tip', e => e.length) >= 3, 'tips attached to steps');
    assert(await page.$$eval('#recipe table.ing tbody tr', r => r.length) === 12, 'ingredients table 12 rows');
    assert(await page.$eval('#recipe', e => e.textContent.includes('使い切り')), 'use_up mark shown');
    assert(await page.$eval('#recipe', e => /手洗い[^\n]*フライパン/.test(e.textContent)), 'cleanup uses equipment labels');
    const chips = await page.$$eval('#o-budget .chip[data-act="o-budget"]', c => c.map(x => x.dataset.v));
    assert(chips.join(',') === '15,20,30,45,60,0', `budget chips (0 = 無制限): ${chips.join(',')}`);
    assert(await page.$eval('#o-budget', e => !!e.querySelector('#o-free')), 'free budget input present');
    assert(await page.$eval('#o-free', e => e.value === '25'), 'default budget 25 in free input');
    assert(await page.$$eval('#order .chip[data-act="o-useup"]', c => c.length >= 2 && c.every(x => !x.classList.contains('is-on'))), 'use-up chips list pantry items, none preselected (no expiry)');
    assert(await page.$eval('#o-adults', e => e.textContent === '2') && await page.$eval('#o-kids', e => e.textContent === '1'), 'servings default 2/1 from family.json');
    // 在庫
    assert(await page.$$eval('#pantry .pitem', p => p.length) === 15, 'pantry items rendered (15)');
    assert(await page.$$eval('#pantry .staple', p => p.length) === 30, 'staples rendered (30)');
    assert(await page.$eval('#pantry', e => e.textContent.includes('kaji-quest の買い物を取り込む')), 'kaji-quest import button present (config flag)');
    // 今週
    assert(await page.$eval('#week', e => e.textContent.includes('聞いてない評価 1 件')), '聞いてない評価 computed from logs');
    assert(await page.$$eval('#week svg.bars', s => s.length) === 2, 'two 12-week bar charts');
    assert(await page.$$eval('#week svg.bars rect', r => r.length) === 24, '12 bars per chart');
    // 一覧・図鑑
    assert(await page.$eval('#list', e => e.textContent.includes('作った 1 回')), 'list stats from logs');
    assert(await page.$$eval('#zukan .zk', z => z.length) === 1, 'zukan shows placeholder tile for recipe without photo');
    // 検索
    await page.fill('#q', '小松菜');
    assert(await page.$$eval('#search-results .sr', r => r.length) === 1, 'search by ingredient finds recipe');
    // 調理モード
    await page.click('[data-act="cook-open"]');
    assert(await page.$eval('#cook', e => !e.hidden), 'cook mode overlay opens');
    const timers = await page.$$eval('#cook .timer-btn', t => t.length);
    assert(timers === 2, `timer buttons in cook mode (got ${timers})`);
    assert(await page.$$eval('#cook .ck-step', s => s.length) === 7 && await page.$$eval('#cook .ck-tl', s => s.length) === 11, 'cook mode shows 7 steps and 11 timeline rows');
    assert(await page.$eval('#cook .ck-step .ing', e => e.textContent.includes('片栗粉') && /小さじ 1/.test(e.textContent)) && await page.$eval('#recipe .step .ing', e => e.textContent.includes('片栗粉')), 'step shows its ingredients with amounts (matched from the step text for recipes without steps[].ingredients)');
    assert(await page.$$eval('#cook .ck-ing li', l => l.length) === 12 && await page.$eval('#cook .ck-ing', e => e.open && e.textContent.includes('鶏もも肉') && /300 g/.test(e.textContent)), 'cook mode lists all 12 ingredients with quantities (open by default)');
    await page.click('#cook .timer-btn');
    assert(await page.$eval('#cook .timer-btn', b => b.classList.contains('is-running')), 'timer starts on tap');
    await page.click('#cook .ck-step [data-act="ck-step"]');
    assert(await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('recipi.cook.r-20261008-torimomo-teriyaki')); return p && p.start > 0 && typeof p.done.s0 === 'number' && p.done.s0 > 0 && !!p.timers.s1; }), 'cook progress (start, step check timestamp, timer) saved in localStorage');
    await page.screenshot({ path: `${SHOTS}/cook-desktop.png` });
    await page.click('[data-act="cook-finish"]');
    assert(await page.$eval('#cook', e => e.hidden), 'cook mode closes on finish');
    // 記録
    assert(await page.$eval('#record', e => e.textContent.includes('手順どおり') && e.textContent.includes('仕上がり') && e.textContent.includes('パートナー') && e.textContent.includes('子ども')), 'record screen renders §9.1 fields');
    assert(await page.$$eval('#record .star', s => s.length) === 15, 'three star rows');
    assert(await page.$$eval('#record .pc-list li', l => l.length) === 2, 'pantry checklist lists 2 items in stock (鶏もも肉, 小松菜)');
    assert(await page.$eval('#record', e => e.textContent.includes('調理モードの実測')), 'actual minutes prefilled from cook mode');
    await page.click('[data-act="rec-fid"][data-v="minor"]');
    assert(await page.$eval('#rec-dev-row', e => !e.hidden), 'deviation input appears for minor');
    await page.click('.star[data-f="finish"][data-v="4"]'); await page.click('.star[data-f="me"][data-v="4"]'); await page.click('[data-act="rec-partner-later"]'); await page.click('[data-act="rec-kid"][data-v="all"]');
    await page.fill('#rec-dev', '醤油を減らした'); await page.fill('#rec-learned', 'テスト');
    await page.click('[data-act="rec-time"][data-d="5"]');
    await page.evaluate(() => { localStorage.setItem('recipi.token', 'test'); });
    await page.click('[data-act="rec-save"]');
    assert(await page.evaluate(() => document.querySelector('#toast').textContent.includes('トークン')), 'write without token shows ⚙ hint');
    await page.screenshot({ path: `${SHOTS}/record-desktop.png`, fullPage: false });
    await page.screenshot({ path: `${SHOTS}/full-desktop.png`, fullPage: true });
    await ctx.close();
  }
  // ---- 375px（トークンあり: 記録の書き込みをモックで通す） ----
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: 'ja-JP', timezoneId: 'Asia/Tokyo' });
    await ctx.addInitScript(() => { localStorage.setItem('recipi.token', 'github_pat_test'); });
    await ctx.close();
    const { ctx: c2, page, errors, puts, mock } = await (async () => { const b2 = browser; const r = await setup(b2, { width: 375, height: 812 }); return r; })();
    await page.evaluate(() => localStorage.setItem('recipi.token', 'github_pat_test'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#week .stat'));
    assert(errors.length === 0, `no console errors (375px)${errors.length ? ': ' + errors.join(' | ') : ''}`);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(sw <= 375, `no horizontal page scroll at 375px (scrollWidth=${sw})`);
    assert(await page.$eval('#recipe table.tl', e => e.closest('.tbl-wrap').scrollWidth >= e.closest('.tbl-wrap').clientWidth), '段取り表 scrolls inside its wrapper');
    const nav = await page.$eval('#nav', e => getComputedStyle(e).position);
    assert(nav === 'sticky', 'nav bar is sticky');
    await page.screenshot({ path: `${SHOTS}/top-375.png` });
    // 注文 → requests PUT → dispatch
    await page.click('#o-budget .chip[data-v="20"]'); await page.click('.chip[data-act="o-mood"][data-v="さっぱり"]'); await page.click('#order .chip[data-act="o-useup"]');
    await page.click('[data-act="o-submit"]');
    await page.waitForFunction(() => !!document.querySelector('#o-status .pending'));
    const reqPut = puts.find(p => p.url.includes('/contents/requests/'));
    assert(!!reqPut, 'order writes requests/<id>.json');
    const reqBody = reqPut ? JSON.parse(Buffer.from(reqPut.body.content, 'base64').toString('utf8')) : {};
    assert(reqBody.type === 'dinner' && reqBody.time_budget === 20 && reqBody.mood.includes('さっぱり') && reqBody.status === 'pending' && reqBody.use_up.length === 1 && /^req-\d{8}-\d{4}-[a-z0-9]{4}$/.test(reqBody.id) && reqBody.servings.adults === 2, `request body matches contract: ${JSON.stringify(reqBody).slice(0, 200)}`);
    assert(reqPut && reqPut.body.message.startsWith('[skip ci]'), 'request commit message has [skip ci]');
    const disp = puts.find(p => p.url.endsWith('/dispatches'));
    assert(disp && disp.body.event_type === 'agent' && disp.body.client_payload.request_id === reqBody.id, 'dispatch event_type=agent with request_id');
    assert(await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('recipi.pending')); return p && p.id && p.type === 'dinner'; }), 'pending request remembered in localStorage');
    await page.screenshot({ path: `${SHOTS}/order-pending-375.png` });
    // 記録の書き込み（ログ・メモ・在庫）
    await page.click('[data-act="pending-cancel"]');
    await page.click('[data-act="rec-open"]');
    await page.click('[data-act="rec-fid"][data-v="minor"]'); await page.fill('#rec-dev', '醤油を減らした');
    await page.click('.star[data-f="finish"][data-v="4"]'); await page.click('.star[data-f="me"][data-v="4"]'); await page.click('.star[data-f="partner"][data-v="5"]'); await page.click('[data-act="rec-kid"][data-v="all"]');
    await page.click('[data-act="rec-time"][data-d="5"]'); await page.click('[data-act="rec-time"][data-d="-1"]');
    await page.fill('#rec-learned', '皮目は 2 分半');
    const before = puts.length;
    await page.click('[data-act="rec-save"]');
    await page.waitForFunction(() => document.querySelector('#toast') && document.querySelector('#toast').textContent.includes('記録'));
    const logPut = puts.slice(before).find(p => p.url.includes('/contents/logs/2026/10.jsonl'));
    assert(!!logPut, 'record appends to logs/2026/10.jsonl');
    const logText = logPut ? Buffer.from(logPut.body.content, 'base64').toString('utf8') : '';
    const lines = logText.trim().split('\n'); const last = JSON.parse(lines[lines.length - 1]);
    assert(lines.length === 3 && lines[1] === 'not json', 'existing lines kept (including the malformed one), new line appended');
    assert(last.recipe_id === 'r-20261008-torimomo-teriyaki' && last.planned_minutes === 18 && last.actual_minutes === 22 && last.fidelity === 'minor' && last.deviation === '醤油を減らした' && last.finish === 4 && last.ratings.me === 4 && last.ratings.partner === 5 && last.ratings.kid === 'all' && last.learned === '皮目は 2 分半' && last.id.length === 12 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(last.ts) && last.pantry_used.length === 2, `log line matches contract: ${JSON.stringify(last)}`);
    assert(last.r_score === Math.round(40 * (1 - 4 / 18) + 20 + 22.5) && last.f_score === 4.7, `R=${last.r_score} (expected ${Math.round(40 * (1 - 4 / 18) + 20 + 22.5)}), F=${last.f_score} (expected 4.7)`);
    const memoPut = puts.slice(before).find(p => p.url.includes('/contents/recipes/'));
    assert(!memoPut, 'recipe memo skipped when recipes/<id>.md is 404 (no write to a missing file)');
    const pantryPut = puts.slice(before).find(p => p.url.includes('/contents/pantry.json'));
    const pantryBody = pantryPut ? JSON.parse(Buffer.from(pantryPut.body.content, 'base64').toString('utf8')) : null;
    assert(pantryBody && !pantryBody.items.some(i => i.name === '鶏もも肉') && !pantryBody.items.some(i => i.name === '小松菜') && pantryBody.items.length === 13, `pantry decremented: 鶏もも肉 300g-300g removed, 小松菜 1束-1束 removed (items=${pantryBody && pantryBody.items.length})`);
    assert(pantryBody && pantryBody.updated && Array.isArray(pantryBody.discarded), 'pantry.json keeps shape (updated, discarded)');
    assert(puts.slice(before).every(p => p.body.message.startsWith('[skip ci]')), 'all record commits are [skip ci]');
    assert(await page.$eval('#list .lrow', e => e.textContent.includes('作った')) && await page.evaluate(() => (JSON.parse(localStorage.getItem('recipi.list') || '{}').cooked || []).includes('r-20261008-torimomo-teriyaki')), 'recorded recipe shows as 作った in the list on this device (overlay cooked)');
    await page.screenshot({ path: `${SHOTS}/after-record-375.png` });
    // 在庫の追加（文字）と捨てた
    await page.fill('#p-add', 'とりもも 300g、しょうゆ、豆腐 1丁、新しい食材');
    const b2 = puts.length; await page.click('[data-act="p-add"]');
    await page.waitForFunction(n => window.__x = n, b2); await page.waitForTimeout(300);
    const addPut = puts.slice(b2).find(p => p.url.includes('/contents/pantry.json'));
    const addBody = addPut ? JSON.parse(Buffer.from(addPut.body.content, 'base64').toString('utf8')) : null;
    const tori = addBody && addBody.items.find(i => i.name === '鶏もも肉'); const tofu = addBody && addBody.items.find(i => i.name === '豆腐'); const neo = addBody && addBody.items.find(i => i.name === '新しい食材');
    assert(tori && tori.qty === 300 && tori.unit === 'g' && tori.loc === 'fridge' && !tori.use_by && tori.src === 'manual', `alias normalized (とりもも→鶏もも肉) with qty/unit, no use_by: ${JSON.stringify(tori)}`);
    assert(tofu && tofu.qty === 2 && tofu.unit === '丁', `same-name item merged (豆腐 1丁 + 1丁 = ${tofu && tofu.qty})`);
    assert(neo && neo.loc === 'fridge' && !neo.use_by, 'unknown name added as-is (fridge, no use_by)');
    assert(addBody && addBody.staples['醤油'] === 'ok', 'staple name (しょうゆ→醤油) sets staples, not items');
    // 一覧: 並び（レシピの次）、削除ボタン、追加ボタン
    assert(await page.evaluate(() => { const t = id => document.getElementById(id).getBoundingClientRect().top; return t('recipe') < t('list') && t('list') < t('record') && t('record') < t('pantry'); }), 'list card sits right after recipe on 375px');
    assert(await page.$$eval('#nav .nav-chip', c => c.map(x => x.textContent.trim()).slice(0, 5).join(',')) === '今夜,レシピ,調理,一覧,記録', 'nav chips follow the new order');
    assert(await page.$$eval('#list .lrow [data-act="list-del"]', b => b.length) === 1, 'each list row has a 削除 button');
    assert(await page.$('#recipe [data-act="list-del"]') !== null && await page.$('#recipe [data-act="list-add"]') === null, 'recipe card of a listed recipe offers 一覧から削除, not 追加');
    // 削除: 確認 → GET sha → DELETE（[skip ci] 無し）→ 端末の一覧から消え、上書きに残る
    mock.serve = true; page.once('dialog', d => d.accept());
    const b3 = puts.length; await page.click('#list .lrow [data-act="list-del"]');
    await page.waitForFunction(() => document.querySelector('#toast') && document.querySelector('#toast').textContent.includes('一覧から削除'));
    const del = puts.slice(b3).find(p => p.method === 'DELETE');
    assert(del && del.url.includes('/contents/recipes/r-20261008-torimomo-teriyaki.md') && del.body.sha === 'r1' && !del.body.message.includes('[skip ci]') && del.body.message.includes('一覧から削除'), `DELETE recipes/<id>.md without [skip ci]: ${del && del.body.message}`);
    assert(await page.$$eval('#list .lrow', r => r.length) === 0 && await page.evaluate(() => JSON.parse(localStorage.getItem('recipi.list')).del.includes('r-20261008-torimomo-teriyaki')), 'deleted recipe leaves the list on this device (overlay del)');
    assert(await page.$eval('#recipe', e => e.textContent.includes('まだレシピがない')), 'current recipe cleared when deleted');
    // 追加: 注文の結果にあるが同梱の一覧に無いレシピ → 「一覧に追加」→ 端末の一覧に出て、front matter に listed: が付く（[skip ci] 無し）
    const newRecipe = { id: 'r-20261009-test-new', title: 'テスト用の新しい一皿', status: 'draft', created: '2026-10-09', version: 1, type: 'dinner', time: { planned: 20, budget: 20, active: 12 }, servings: { adults: 2, kids: 1 }, dishes: [{ name: 'テスト', role: 'main' }], equipment: [], tags: ['テスト'], ingredients: [{ name: '卵', qty: 2, unit: '個', for: 'テスト' }], steps: [{ n: 1, dish: 'テスト', title: '焼く', minutes: 5, kind: 'heat', text: '焼く', cue: '色づく' }], timeline: [{ minute: 0, lane: 'hands', text: '焼く' }], memo: [] };
    mock.recipe = { id: newRecipe.id, text: `---\nid: ${newRecipe.id}\ntitle: ${newRecipe.title}\nstatus: draft\ncreated: 2026-10-09\n---\n\n# ${newRecipe.title}\n` };
    await page.evaluate(r => localStorage.setItem('recipi.current', JSON.stringify({ request: { id: 'req-20261009-0000-test', type: 'dinner', status: 'done', result: { feasible: true, recipe_id: r.id, recipe: r } } })), newRecipe);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => document.querySelector('#week .stat'));
    assert(await page.$('#recipe [data-act="list-add"]') !== null, 'recipe not in the bundled list offers 一覧に追加');
    const b4 = puts.length; await page.click('#recipe [data-act="list-add"]');
    await page.waitForFunction(() => document.querySelector('#toast') && document.querySelector('#toast').textContent.includes('一覧に入れた'));
    const addRecipePut = puts.slice(b4).find(p => p.url.includes('/contents/recipes/r-20261009-test-new.md'));
    const addText = addRecipePut ? Buffer.from(addRecipePut.body.content, 'base64').toString('utf8') : '';
    assert(addRecipePut && addRecipePut.body.sha === 'r1' && !addRecipePut.body.message.includes('[skip ci]') && /^---\nlisted: "\d{4}-\d{2}-\d{2}T/.test(addText) && addText.includes('title: テスト用の新しい一皿'), `一覧に追加 stamps listed: in front matter without [skip ci]: ${addText.slice(0, 60).replace(/\n/g, '|')}`);
    assert(await page.$$eval('#list .lrow', r => r.map(x => x.textContent).join('')).then(t => t.includes('テスト用の新しい一皿')) && await page.$eval('#recipe', e => e.textContent.includes('まだレシピがない')), 'added recipe appears in the list and leaves the recipe card (open it from the list)');
    await page.click('#list .lrow [data-act="open-recipe"]');
    assert(await page.$eval('#recipe', e => e.textContent.includes('テスト用の新しい一皿')) && await page.$('#recipe [data-act="list-del"]') !== null, 'opening from the list shows it in the recipe card with 削除');
    await page.screenshot({ path: `${SHOTS}/list-375.png` });
    // 時間チップの「無制限」→ 考えてもらう: 注文は time_budget 0、自由入力は空のまま
    await page.click('#o-budget .chip[data-v="0"]');
    assert(await page.$eval('#o-budget .chip[data-v="0"]', c => c.classList.contains('is-on')) && await page.$eval('#o-free', i => i.value === ''), '無制限 chip selects and clears the free input');
    const b5 = puts.length; await page.click('[data-act="o-submit"]');
    await page.waitForFunction(n => document.querySelectorAll('#o-status .pending').length > 0, b5);
    const unl = puts.slice(b5).find(p => p.url.includes('/contents/requests/'));
    const unlBody = unl ? JSON.parse(Buffer.from(unl.body.content, 'base64').toString('utf8')) : {};
    assert(unlBody.type === 'dinner' && unlBody.time_budget === 0 && unlBody.status === 'pending', `unlimited order writes time_budget 0: ${JSON.stringify({ type: unlBody.type, time_budget: unlBody.time_budget })}`);
    assert(await page.evaluate(() => document.querySelector('#toast').textContent.includes('時間無制限')), 'toast says 時間無制限');
    await page.click('[data-act="pending-cancel"]');
    await page.click('#o-budget .chip[data-v="30"]');
    assert(await page.$eval('#o-budget .chip[data-v="0"]', c => !c.classList.contains('is-on')) && await page.evaluate(() => { const o = JSON.parse(localStorage.getItem('recipi.order')); return o.time_budget === 0; }), 'picking a minutes chip again turns 無制限 off (stored order still 0 until next submit)');
    await ctx.close().catch(() => {}); await c2.close();
  }
  await browser.close();
  console.log(results.join('\n'));
  console.log(`\n${results.filter(r => r.startsWith('PASS')).length} passed, ${results.filter(r => r.startsWith('FAIL')).length} failed`);
})().catch(e => { console.error('TEST ERROR', e); process.exit(2); });
