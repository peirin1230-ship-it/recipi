// 流れのテスト: 注文→生成完了→レシピ表示 / 冷蔵庫写真→差分→反映 / kaji-quest 取り込み→差分→反映 / 聞いてない評価の追記
const { chromium } = require(process.env.PW_ROOT ? require('path').join(process.env.PW_ROOT, 'playwright') : 'playwright');
const fs = require('fs'); const SHOTS = (process.env.SHOTS || '/tmp/recipi-shots');
const pantry = fs.readFileSync(require('path').join(__dirname, '..', 'fixtures', 'pantry.json'), 'utf8');
const fixture = JSON.parse(fs.readFileSync('/home/user/recipi/tests/fixtures/recipe_teriyaki.json', 'utf8'));
const b64 = s => Buffer.from(s, 'utf8').toString('base64'); const unb64 = s => Buffer.from(s, 'base64').toString('utf8');
const results = []; const assert = (c, l) => { results.push(`${c ? 'PASS' : 'FAIL'}: ${l}`); if (!c) process.exitCode = 1; };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGP4z8DwHwyBNAMDACrKBP8Bm0FCAAAAAElFTkSuQmCC', 'base64');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: 'ja-JP', timezoneId: 'Asia/Tokyo' });
  await ctx.addInitScript(() => { try { localStorage.setItem('recipi.token', 'github_pat_test'); } catch {} });
  const page = await ctx.newPage(); const errors = []; const puts = []; const store = {};
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource: .* 404/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.route('https://raw.githubusercontent.com/**', route => { const url = route.request().url();
    if (url.includes('kaji-quest/main/logs/2026/10.jsonl')) return route.fulfill({ status: 200, contentType: 'text/plain', body: JSON.stringify({ date: '2026-10-06', mode: 'shop', status: 'done', items: ['卵', 'キュレル', 'しょうゆ', 'ほうれん草'], id: 'shop0001aaaa' }) + '\n' + JSON.stringify({ date: '2026-10-05', mode: 'full', task_id: 'dishes', id: 'x' }) + '\n' });
    return route.fulfill({ status: 404, body: '' }); });
  await page.route('https://api.github.com/**', route => { const req = route.request(); const url = req.url(); const path = (url.split('/contents/')[1] || '').split('?')[0];
    if (req.method() === 'PUT') { const body = JSON.parse(req.postData()); puts.push({ path, body }); store[path] = body.content; return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ content: { sha: 's' + puts.length } }) }); }
    if (req.method() === 'POST' && url.endsWith('/dispatches')) { puts.push({ path: 'dispatch', body: JSON.parse(req.postData()) }); return route.fulfill({ status: 204, body: '' }); }
    if (path.startsWith('requests/') && store[path]) { const r = JSON.parse(unb64(store[path])); r.status = 'done';
      if (r.type === 'pantry_photo') r.result = { items: [{ name: 'とりむね', qty: 250, unit: 'g', loc: 'fridge', confidence: 0.9 }, { name: '謎の物', qty: null, unit: null, loc: 'fridge', confidence: 0.3 }], staples: [{ name: 'ごま油', state: 'low' }], cost_usd: 0.03 };
      else r.result = { ...fixture, recipe_id: 'r-20261009-test', recipe: { ...fixture.recipe, id: 'r-20261009-test', version: 1, status: 'draft', created: '2026-10-09', time: { budget: 20, planned: 18, active: 14, raw_estimate: 18, speed_factor: 1.0 }, photo: null, stats: { cooked: 0 }, detail: 'full', memo: [] }, cost_usd: 0.1 };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'r1', content: b64(JSON.stringify(r)) }) }); }
    if (path === 'pantry.json') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'p1', content: store['pantry.json'] || b64(pantry) }) });
    if (path === 'logs/2026/10.jsonl') { const line = JSON.stringify({ id: 'abcabcabcabc', date: '2026-10-06', ts: '2026-10-06T19:05:40+09:00', recipe_id: 'r-20261008-torimomo-teriyaki', version: 1, type: 'dinner', planned_minutes: 18, actual_minutes: 22, fidelity: 'minor', finish: 4, ratings: { me: 4, partner: null, kid: 'all' }, photo: null, r_score: 73, f_score: 4.5 }); return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'l1', content: store[path] || b64(line + '\n') }) }); }
    if (path === 'requests' && req.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"message":"Not Found"}' }); });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' }); await page.waitForFunction(() => document.querySelector('#week .stat'));
  // 1) 注文 → 生成完了 → レシピ表示
  await page.click('[data-act="o-submit"]'); await page.waitForFunction(() => !!document.querySelector('#o-status .pending'));
  await page.waitForFunction(() => document.querySelector('#recipe .rc-title') && document.querySelector('#recipe').textContent.includes('別案'), null, { timeout: 15000 });
  assert(await page.$$eval('#recipe .alt', a => a.length) === 2, 'result alternatives rendered (2) after poll → done');
  assert(await page.$$eval('#recipe .step', s => s.length) === 7, 'generated recipe (from result.recipe) renders 7 steps');
  assert(await page.evaluate(() => !localStorage.getItem('recipi.pending') && JSON.parse(localStorage.getItem('recipi.current')).request.result.recipe.id === 'r-20261009-test'), 'pending cleared, current request remembered');
  assert(await page.$eval('#o-status', e => !e.querySelector('.pending')), 'pending indicator removed');
  await page.click('#recipe [data-act="o-detail"]');
  await page.waitForFunction(n => n, true); await page.waitForTimeout(500);
  const det = puts.filter(p => p.path.startsWith('requests/')).map(p => JSON.parse(unb64(p.body.content))).find(r => r.type === 'recipe_detail');
  assert(det && det.alternative === 0 && det.parent && det.parent.startsWith('req-') && det.time_budget === 25, `recipe_detail request has parent/alternative: ${det && JSON.stringify({ parent: det.parent, alternative: det.alternative })}`);
  await page.waitForFunction(() => !document.querySelector('#o-status .pending'), null, { timeout: 15000 });
  // 2) 冷蔵庫の写真 → 差分 → 反映
  await page.setInputFiles('#p-photo', { name: 'fridge.png', mimeType: 'image/png', buffer: PNG });
  await page.waitForFunction(() => !!document.querySelector('#p-status .pending'), null, { timeout: 10000 });
  const inbox = puts.find(p => p.path.startsWith('inbox/')); assert(!!inbox && inbox.path.endsWith('.jpg'), 'fridge photo PUT to inbox/<id>.jpg');
  const preq = puts.filter(p => p.path.startsWith('requests/')).map(p => JSON.parse(unb64(p.body.content))).find(r => r.type === 'pantry_photo');
  assert(preq && preq.image === inbox.path && preq.hint === 'fridge', 'pantry_photo request has image + hint');
  await page.waitForFunction(() => document.querySelector('#dlg-diff').open, null, { timeout: 15000 });
  const rows = await page.$$eval('#diff-list li', l => l.map(x => ({ t: x.textContent, c: x.querySelector('input').checked })));
  assert(rows.length === 3 && rows[0].t.includes('鶏むね肉') && rows[0].c && rows[1].t.includes('謎の物') && !rows[1].c && rows[2].t.includes('ごま油') && rows[2].c, `diff rows normalized, low-confidence unchecked: ${JSON.stringify(rows)}`);
  await page.screenshot({ path: `${SHOTS}/diff-photo-375.png` });
  const before = puts.length; await page.click('[data-act="diff-apply"]');
  await page.waitForFunction(() => !document.querySelector('#dlg-diff').open); await page.waitForTimeout(400);
  const pp = puts.slice(before).find(p => p.path === 'pantry.json'); const pb = pp && JSON.parse(unb64(pp.body.content));
  assert(pb && pb.items.some(i => i.name === '鶏むね肉' && i.qty === 250 && i.src === 'photo') && !pb.items.some(i => i.name === '謎の物') && pb.staples['ごま油'] === 'low', 'photo diff applied (checked only, src photo, staple state)');
  // 3) kaji-quest の買い物取り込み
  const b3 = puts.length; await page.click('[data-act="p-import"]');
  await page.waitForFunction(() => document.querySelector('#dlg-diff').open, null, { timeout: 10000 });
  const rows2 = await page.$$eval('#diff-list li', l => l.map(x => ({ t: x.textContent, c: x.querySelector('input').checked })));
  assert(rows2.length === 4 && rows2[0].t.includes('卵') && rows2[0].c && rows2[1].t.includes('キュレル') && !rows2[1].c && rows2[2].t.includes('醤油') && rows2[3].t.includes('ほうれん草') && rows2[3].c, `kaji rows: known checked, unknown unchecked: ${JSON.stringify(rows2)}`);
  await page.click('[data-act="diff-apply"]'); await page.waitForFunction(() => !document.querySelector('#dlg-diff').open); await page.waitForTimeout(400);
  const kp = puts.slice(b3).find(p => p.path === 'pantry.json'); const kb = kp && JSON.parse(unb64(kp.body.content));
  assert(kb && kb.imported_shop_ids.includes('shop0001aaaa') && kb.items.some(i => i.name === 'ほうれん草' && i.src === 'kaji-quest' && i.added === '2026-10-06') && !kb.items.some(i => i.name === 'キュレル'), 'kaji import applied: shop id recorded, added=line.date, use_by from master');
  assert(kb && kb.items.find(i => i.name === '卵').qty === 6, 'qty-less kaji item merged into existing 卵 without changing qty');
  // 4) 聞いてない評価 → 行を書き換え
  const b4 = puts.length; await page.click('[data-act="later-edit"]'); await page.click('.star[data-act="later-star"][data-v="5"]');
  await page.waitForFunction(() => document.querySelector('#toast') && document.querySelector('#toast').textContent.includes('評価')); await page.waitForTimeout(300);
  const lp = puts.slice(b4).find(p => p.path === 'logs/2026/10.jsonl'); const ll = lp && unb64(lp.body.content).trim().split('\n').map(l => JSON.parse(l));
  assert(ll && ll.length === 1 && ll[0].id === 'abcabcabcabc' && ll[0].ratings.partner === 5 && ll[0].f_score === 4.7, `log line rewritten in place with new F: ${ll && JSON.stringify(ll[0].ratings)} F=${ll && ll[0].f_score}`);
  assert(await page.$eval('#week', e => e.textContent.includes('聞いてない評価 0 件')), '聞いてない評価 count updates');
  // 5) 使い切った（期限は管理しないので「捨てた」は無い）
  assert(await page.$('#pantry [data-act="p-discard"]') === null && !(await page.$eval('#pantry', e => /期限|捨てた/.test(e.textContent))), 'pantry has no discard button and no expiry text');
  const nItems = await page.$$eval('#pantry .pitem', p => p.length);
  const b5 = puts.length; await page.click('#pantry [data-act="p-useup"]'); await page.waitForTimeout(400);
  const dp = puts.slice(b5).find(p => p.path === 'pantry.json'); const db = dp && JSON.parse(unb64(dp.body.content));
  assert(db && db.items.length === nItems - 1 && Array.isArray(db.discarded) && db.discarded.length === 0, `使い切った removes the item (${nItems} → ${db && db.items.length}) without a discarded entry`);
  assert(!(await page.$eval('#week', e => /捨てた/.test(e.textContent))), '今週 no longer shows 捨てた');
  // 6) 調理モードのチェック時刻 → step_minutes（start=10 分前、s0 を 6 分前、s1 を 2 分前にチェック済み → prep 4.0 / wait 4.0）
  await page.evaluate(() => { const now = Date.now(); localStorage.setItem('recipi.cook.r-20261009-test', JSON.stringify({ start: now - 600000, done: { s0: now - 360000, s1: now - 120000 }, tl: {}, timers: {} })); });
  await page.click('[data-act="cook-open"]'); await page.waitForFunction(() => !document.querySelector('#cook').hidden);
  assert(await page.$$eval('#cook .ck-step.is-done', s => s.length) === 2, 'cook mode resumes saved progress (2 steps done)');
  await page.click('[data-act="cook-finish"]'); await page.waitForFunction(() => document.querySelector('#rec-actual'));
  assert(await page.$eval('#rec-actual', e => e.textContent === '10'), 'actual minutes computed from start time (10)');
  const b6 = puts.length; await page.click('[data-act="rec-save"]');
  await page.waitForFunction(() => document.querySelector('#toast') && document.querySelector('#toast').textContent.includes('記録した')); await page.waitForTimeout(300);
  const lp6 = puts.slice(b6).find(p => p.path === 'logs/2026/10.jsonl'); const last6 = lp6 && JSON.parse(unb64(lp6.body.content).trim().split('\n').pop());
  assert(last6 && last6.recipe_id === 'r-20261009-test' && last6.request_id && last6.step_minutes && last6.step_minutes.prep === 4 && last6.step_minutes.wait === 4 && Object.keys(last6.step_minutes).length === 2, `step_minutes per kind from check timestamps: ${last6 && JSON.stringify(last6.step_minutes)} request_id=${last6 && last6.request_id}`);
  assert(await page.evaluate(() => !localStorage.getItem('recipi.cook.r-20261009-test')), 'cook progress cleared after record');
  assert(errors.length === 0, `no console errors (flows)${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close(); await browser.close();
  console.log(results.join('\n')); console.log(`\n${results.filter(r => r.startsWith('PASS')).length} passed, ${results.filter(r => r.startsWith('FAIL')).length} failed`);
})().catch(e => { console.error('TEST ERROR', e); process.exit(2); });
