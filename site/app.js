/* recipi — GitHub Pages 上で動く 1 画面アプリ（フレームワーク無し、ES modules）
 *
 * 読み: data/*.json（scripts/build_site.py が YAML / Markdown / recipes から生成。起動時に API を叩かない）
 *       pantry.json / logs/YYYY/MM.jsonl / requests/<id>.json（GitHub Contents API。公開リポジトリなのでトークン無しでも読める）
 * 書き: requests/・logs/・pantry.json・photos/・recipes/<id>.md のメモ（Contents API、全部 [skip ci]）
 *       生成は repository_dispatch で Actions（agent.yml）を起こし、requests/<id>.json を 5 秒ごとに読み直す（docs/SPEC.md §12.2）
 */
import * as gh from './api.js';
import { stepStarts } from './steps.js';
import { $, $$, esc, ic, head, md, toast, setBusy, lsGet, lsSet, lsDel, lsGetRaw, lsSetRaw, decorateCards, setCollapsed, isCollapsed, initNav, goTo, updateNav, stars, beep, unlockAudio } from './ui.js';

const TZ = 'Asia/Tokyo';
const TOKEN_KEY = 'recipi.token';
const LS = { order: 'recipi.order', pending: 'recipi.pending', current: 'recipi.current', weekly: 'recipi.weekly', suggest: 'recipi.suggest', cook: 'recipi.cook.', photo: 'recipi.pendingPhoto', inbox: 'recipi.inbox', detail: 'recipi.detail', zukan: 'recipi.zukanSort', tab: 'recipi.listTab', listOv: 'recipi.list' };
const MEMO_HEADING = '## 作ったときのメモ';
const MOODS = ['さっぱり', 'がっつり', '和', '洋', '中', '麺', '丼', '鍋', 'スープ', '時短'];
const TYPES = [['dinner', '夕食'], ['prep', '仕込み'], ['breakfast', '朝食'], ['lunchbox', '弁当']];
const DISHES = [['main', '主菜だけ'], ['main+side', '主菜＋副菜'], ['main+side+soup', '主菜＋副菜＋汁物'], ['onepot', '丼・麺の 1 品']];
const KID_JA = { all: '完食', half: '半分', little: '少し', none: '食べない', absent: 'いなかった' };
const KID_F = { all: 5, half: 3, little: 2, none: 1 };
const FID_JA = { exact: 'そのまま', minor: '少し変えた', major: 'かなり変えた' };
const STATUS_JA = { draft: '下書き', tried: '作った', standard: '定番', retired: '封印' };
const ROLE_JA = { main: '主菜', side: '副菜', soup: '汁物', onepot: '一品', rice: 'ご飯' };
const LOC_JA = { fridge: '冷蔵', freezer: '冷凍', pantry: '常温' };
const KIND_JA = { prep: '下ごしらえ', heat: '加熱', wait: '待つ', serve: '盛る' };
const DOW_JA = ['日', '月', '火', '水', '木', '金', '土'];
const WDAYS = [['mon', '月'], ['tue', '火'], ['wed', '水'], ['thu', '木'], ['fri', '金'], ['sat', '土'], ['sun', '日']];
const POLL_MS = 5000, POLL_SLOW_AFTER_MS = 6 * 60 * 1000, POLL_SLOW_MS = 60 * 1000, POLL_MAX_MS = 24 * 60 * 60 * 1000;   // 6 分までは 5 秒ごと、その後は 1 分ごとに 24 時間待つ

const emptyPantry = () => ({ updated: null, items: [], staples: {}, discarded: [], imported_shop_ids: [] });
function normalizePantry(d) {
  d = d && typeof d === 'object' ? d : {};
  const items = (Array.isArray(d.items) ? d.items.filter(i => i && i.name) : []).map(({ qty, unit, use_by, ...rest }) => rest);   // 在庫は「あるかないか」だけ。数・単位・期限は持たない
  const staples = {}; Object.entries(d.staples && typeof d.staples === 'object' ? d.staples : {}).forEach(([k, v]) => { staples[k] = v === 'none' ? 'none' : 'ok'; });
  return { ...d, items, staples, discarded: Array.isArray(d.discarded) ? d.discarded : [], imported_shop_ids: Array.isArray(d.imported_shop_ids) ? d.imported_shop_ids : [] };
}

const state = {
  config: {}, equipment: {}, family: {}, learned: {}, overrides: {}, ingredients: [], recipes: [], recipesBase: [], knowledge: { tips: [], basics: [], safety: null }, digests: [], build: {},
  token: '', pantry: { sha: null, data: emptyPantry() }, months: new Map(), loaded: false, busy: false, liveError: '', inbox: [],
  current: null,     // { recipe, request } 今の「レシピ」カード
  pending: [],     // 考え中の注文 { id, type, since, status }
  lastError: null,   // 直近の生成エラー { type, error }
  weekly: null,      // 週の献立の注文（result 入り）
  cost: null,        // 今月の API 費用（requests から集計）
  order: null, useUpOn: new Set(), detailView: '', zukanSort: 'new', listTab: 'all', listQ: '', q: '', diff: null, showDiffOf: new Set(), laterEdit: null, pAddDraft: '', cookPick: new Set(),
};

// ---- 日付（JST） ----
function nowParts(d = new Date()) {
  const p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(d).forEach(x => { p[x.type] = x.value; });
  const hour = String(+p.hour % 24).padStart(2, '0');
  return { date: `${p.year}-${p.month}-${p.day}`, hour: +hour, minute: +p.minute, hm: `${hour}${p.minute}`, iso: `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}:${p.second}+09:00` };
}
const today = () => nowParts().date;
const isoNow = () => nowParts().iso;
const toUTC = ds => new Date(ds + 'T00:00:00Z');
const fmtDate = d => d.toISOString().slice(0, 10);
const addDays = (ds, n) => fmtDate(new Date(toUTC(ds).getTime() + n * 86400000));
const dowOf = ds => toUTC(ds).getUTCDay();
const mondayOf = ds => addDays(ds, -((dowOf(ds) + 6) % 7));
const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / 86400000);
const ymOf = ds => ds.slice(0, 4) + '/' + ds.slice(5, 7);   // logs/YYYY/MM
const validDate = ds => /^\d{4}-\d{2}-\d{2}$/.test(String(ds || ''));
const jaShort = ds => validDate(ds) ? `${+ds.slice(5, 7)}/${+ds.slice(8, 10)}` : '';
const jaDate = ds => validDate(ds) ? `${jaShort(ds)}（${DOW_JA[dowOf(ds)] || ''}）` : '';
const jaDateTime = iso => { const s = String(iso || ''); return validDate(s.slice(0, 10)) ? `${jaShort(s.slice(0, 10))} ${s.slice(11, 16)}`.trim() : ''; };
const uid = (n = 12) => { const a = 'abcdefghijklmnopqrstuvwxyz0123456789'; const r = crypto.getRandomValues(new Uint8Array(n)); let s = ''; for (let i = 0; i < n; i++) s += a[r[i] % 36]; return s; };
const round1 = n => Math.round(n * 10) / 10;
const isNum = v => typeof v === 'number' && !isNaN(v);
const fmtSec = s => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const newRequestId = () => { const p = nowParts(); return `req-${p.date.replace(/-/g, '')}-${p.hm}-${uid(4)}`; };

// ---- 設定・マスタ ----
const cfg = () => state.config || {};
const kq = () => cfg().kaji_quest || {};
const kqRepo = () => gh.parseRepo(kq().repo, kq().branch);
const lanes = () => Array.isArray(state.equipment.lanes) ? state.equipment.lanes : [];
const equipLabel = id => (state.equipment.labels || {})[id] || (id === 'hands' ? '手' : String(id || ''));
// 食材マスタ（data/ingredients.json）で名前を正規化する: NFKC・空白除去で name / aliases と突き合わせる
let masterIdx = null;
const normName = s => String(s || '').normalize('NFKC').replace(/[\s　]+/g, '').toLowerCase();
function master(name) {
  if (!masterIdx) {
    masterIdx = new Map();
    state.ingredients.forEach(m => { if (!m || !m.name) return; masterIdx.set(normName(m.name), m); (m.aliases || []).forEach(a => { const k = normName(a); if (k && !masterIdx.has(k)) masterIdx.set(k, m); }); });
  }
  return masterIdx.get(normName(name)) || null;
}
const canonical = name => { const m = master(name); return m ? m.name : String(name || '').normalize('NFKC').trim(); };
const sameName = (a, b) => normName(a) === normName(b);

// ---- 共通の操作（busy の間は二重に動かさない） ----
async function run(fn, okMsg) {
  if (state.busy) { toast('処理中…'); return false; }
  state.busy = true; setBusy(true); let ok = false;
  try { await fn(); ok = true; } catch (e) { console.error(e); toast(e.message || String(e), true); }
  finally { state.busy = false; setBusy(false); }
  if (ok && okMsg) toast(okMsg);
  return ok;
}
const requireToken = () => { if (gh.hasToken()) return true; toast('⚙ でトークンを保存すると書き込める', true); return false; };

// ---- 記録（logs/YYYY/MM.jsonl）。壊れた行は無視する ----
const parseLine = l => { try { const e = JSON.parse(l); return e && typeof e === 'object' && e.recipe_id ? e : null; } catch { return null; } };
const appendLine = (text, line) => { const base = (text || '').replace(/\s+$/, ''); return (base ? base + '\n' : '') + line + '\n'; };
function allLogs() { return [...state.months.keys()].sort().flatMap(ym => state.months.get(ym).lines.map(parseLine).filter(Boolean)); }
const logsOf = rid => allLogs().filter(e => e.recipe_id === rid);
// 記録の料理名。レシピを消しても記録は残るので、記録に書いた名前（title）を使う。どちらも無ければ id
function logTitleHTML(e) {
  const r = recipeById(e.recipe_id);
  return r ? esc(r.title) : `${esc(e.title || e.recipe_id)} <span class="badge">削除済み</span>`;
}
const logKey = e => `${e.date || ''}${e.ts || ''}`;
async function fetchMonth(ym) { const f = await gh.getFile(`logs/${ym}.jsonl`); return { sha: f.sha, lines: (f.text || '').split('\n').filter(l => l.trim()) }; }
async function loadLogs() {
  const t = today(); const yms = [...new Set([ymOf(t), ymOf(addDays(t, -31)), ymOf(addDays(t, -62))])];
  await Promise.all(yms.map(async ym => { state.months.set(ym, await fetchMonth(ym)); }));
}
async function appendLog(entry) {
  const ym = ymOf(entry.date);
  const res = await gh.mutateFile(`logs/${ym}.jsonl`, text => appendLine(text, JSON.stringify(entry)), gh.msg(`log ${entry.recipe_id} ${entry.date}`));
  state.months.set(ym, { sha: res.sha, lines: res.text.split('\n').filter(l => l.trim()) });
}
// 同じ id の行を書き換える（あとで評価を足すとき）
async function rewriteLog(id, date, fn, label = '評価を追記') {
  const ym = ymOf(date);
  const res = await gh.mutateFile(`logs/${ym}.jsonl`, text => { let hit = false; const lines = (text || '').split('\n').filter(l => l.trim()).map(l => { const e = parseLine(l); if (e && e.id === id) { hit = true; return JSON.stringify(fn(e)); } return l; }); if (!hit) throw new Error('その記録が見つからない（↻ で更新）'); return lines.join('\n') + '\n'; }, gh.msg(`log ${id} ${label}`));
  state.months.set(ym, { sha: res.sha, lines: res.text.split('\n').filter(l => l.trim()) });
}

// ---- R（再現性）と F（家族）。docs/SPEC.md §9.2 / §9.3。scripts/learn.py と同じ式 ----
function rScore(planned, actual, fidelity, finish) {
  const t = isNum(planned) && planned > 0 && isNum(actual) ? 40 * Math.max(0, 1 - Math.abs(actual - planned) / planned) : 20;
  const f = { exact: 30, minor: 20, major: 5 }[fidelity] ?? 20;
  const s = isNum(finish) && finish >= 1 ? (finish - 1) / 4 * 30 : 20;
  return Math.round(t + f + s);
}
function fScore(r) {
  const v = []; r = r || {};
  if (isNum(r.me)) v.push(r.me); if (isNum(r.partner)) v.push(r.partner); if (r.kid && KID_F[r.kid]) v.push(KID_F[r.kid]);
  return v.length ? round1(v.reduce((a, b) => a + b, 0) / v.length) : null;
}

// ---- レシピの読み方 ----
// 注文の結果に入っているレシピ（主菜と、1 レシピ 1 品で分けた副菜・汁物）
function requestRecipes(req) { const res = req && req.result; if (!res) return []; return [res.recipe, ...(Array.isArray(res.side_recipes) ? res.side_recipes : [])].filter(r => r && r.id); }
const recipeById = id => state.recipes.find(r => r.id === id) || (state.current && state.current.recipe && state.current.recipe.id === id ? state.current.recipe : null) || requestRecipes(state.current && state.current.request).find(r => r.id === id) || state.inbox.flatMap(requestRecipes).find(r => r.id === id) || null;
function currentRecipe() { const c = state.current; if (!c || !c.recipe) return null; return state.recipes.find(x => x.id === c.recipe.id) || c.recipe; }
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
// 統計: 読み込んだ記録があればそこから（直近 5 回）、無ければ夜間ジョブが書いた stats
function statsOf(r) {
  const s = r.stats || {}; const ls = logsOf(r.id).sort((a, b) => logKey(a).localeCompare(logKey(b)));
  if (!ls.length) return { cooked: +s.cooked || 0, r_avg: isNum(s.r_avg) ? s.r_avg : null, f_avg: isNum(s.f_avg) ? s.f_avg : null, last: s.last ? String(s.last) : null };
  const recent = ls.slice(-5); const rs = recent.map(e => e.r_score).filter(isNum), fs = recent.map(e => e.f_score).filter(isNum);
  return { cooked: Math.max(+s.cooked || 0, ls.length), r_avg: rs.length ? Math.round(avg(rs)) : (isNum(s.r_avg) ? s.r_avg : null), f_avg: fs.length ? round1(avg(fs)) : (isNum(s.f_avg) ? s.f_avg : null), last: ls[ls.length - 1].date };
}
// 顔写真: finish ≥ 4 の中の最新を優先、無ければ最新（§8.4）
function photoOf(r) {
  const ls = logsOf(r.id).filter(e => e.photo); if (!ls.length) return r.photo || null;
  const good = ls.filter(e => (e.finish || 0) >= 4);
  return (good.length ? good : ls).sort((a, b) => logKey(b).localeCompare(logKey(a)))[0].photo;
}
function lanesUsed(r) {
  const ids = new Set((r.timeline || []).map(t => t.lane)); const known = lanes().filter(l => ids.has(l.id));
  const unknown = [...ids].filter(id => !lanes().some(l => l.id === id)).map(id => ({ id, label: equipLabel(id), kind: 'other' }));
  return [...known, ...unknown];
}
function tipFor(step, di) {
  if (!step || !step.tag) return null; const tips = (state.knowledge.tips || []).filter(t => Array.isArray(t.tags) && t.tags.includes(step.tag));
  return tips.length ? tips[((+step.n || 0) + (di || 0)) % tips.length] : null;
}
const statusBadge = s => `<span class="badge ${s === 'standard' ? 'std' : s === 'retired' ? 'bad' : s === 'tried' ? 'ok' : ''}">${esc(STATUS_JA[s] || s || '')}</span>`;
// 量の表記。大さじ・小さじ・カップは単位を先に（「小さじ 1（3g）」）、それ以外は数が先（「300 g」「1 束（200g）」）
// 数の表記: 整数はそのまま、1/4・1/3・1/2・2/3・3/4 は分数（1.5 → 1と1/2）、それ以外は小数 1 桁
const FRACTIONS = [[0.125, '1/8'], [0.25, '1/4'], [0.33, '1/3'], [0.5, '1/2'], [0.67, '2/3'], [0.75, '3/4']];
function fmtQty(q) { if (!isNum(q)) return String(q ?? ''); const whole = Math.trunc(q); const frac = Math.round((q - whole) * 100) / 100; if (frac === 0) return String(whole); const f = FRACTIONS.find(([k]) => Math.abs(frac - k) < 0.02); if (f) return whole ? `${whole}と${f[1]}` : f[1]; return String(Math.round(q * 10) / 10); }
const qtyText = i => { if (i.qty == null) return '適量'; const u = i.unit || ''; const g = isNum(i.grams) && u !== 'g' ? `（${i.grams}g）` : ''; return /^(大さじ|小さじ|カップ)$/.test(u) ? `${esc(u)} ${fmtQty(i.qty)}${g}` : `${fmtQty(i.qty)} ${esc(u)}${g}`; };
function pantryMark(i) {
  if (!i.pantry) return '<span class="sub">—</span>';
  const d = state.pantry.data; const it = d.items.find(x => sameName(x.name, i.pantry));
  if (it) return '<span class="badge ok">ある</span>';
  if (i.pantry in d.staples) { const st = d.staples[i.pantry]; return `<span class="badge ${st === 'none' ? 'bad' : 'ok'}">${st === 'none' ? 'ない' : 'ある'}</span>`; }
  return state.liveError ? '<span class="sub">?</span>' : '<span class="badge bad">無い</span>';
}
function matchRecipe(r, q) {
  if (!q) return true;
  const hay = [r.title, ...(r.tags || []), ...(r.ingredients || []).map(i => i.name), ...(r.dishes || []).map(d => d.name)].map(normName).join('\n');
  return q.split(/\s+/).filter(Boolean).every(w => hay.includes(w));
}
function detailViewOf(r) {
  if (state.detailView) return state.detailView;
  const pref = lsGetRaw(LS.detail); if (pref === 'full' || pref === 'compact') return pref;
  return r.detail === 'compact' ? 'compact' : 'full';
}
function setCurrent(recipe, request) {
  state.current = (recipe || request) ? { recipe: recipe || null, request: request || null } : null; state.detailView = '';
  if (request) lsSet(LS.current, { request }); else if (recipe) lsSet(LS.current, { recipe_id: recipe.id }); else lsDel(LS.current);
}
// 作り終えたレシピ（記録がある・status が tried/standard）は、立ち上げ直したときレシピカードに戻さない。一覧から開くのはその場だけ。
// ただし調理の途中（進み具合が端末にある）なら残す
function cookInProgress(id) { try { return Object.keys(localStorage).some(k => k.startsWith(LS.cook) && k.slice(LS.cook.length).split('+').includes(id)); } catch { return false; } }
function cookedAlready(c) {
  const r = c && c.recipe; if (!r || !r.id || cookInProgress(r.id)) return false;
  const l = state.recipes.find(x => x.id === r.id); if (l && (l.status === 'tried' || l.status === 'standard')) return true;
  if (logsOf(r.id).length) return true;
  return !!(c.request && c.request.id && allLogs().some(e => e.request_id === c.request.id));
}
function openRecipe(id) { const r = recipeById(id); if (!r) { toast('そのレシピが見つからない', true); return; } const req = state.current && state.current.request; const keep = req && requestRecipes(req).some(x => x.id === id) ? req : null; setCurrent(r, keep); if (keep) lsSet(LS.current, { request: keep, open: id }); renderRecipe(); decorateCards(); goTo('recipe'); }

// ======================================================================
// 今夜（注文フォーム → requests/<id>.json → repository_dispatch → 5 秒ごとに読み直す）
// ======================================================================
function defaultOrder() {
  const rq = cfg().request || {}; const dd = ((state.family.meals || {}).dinner_default) || {};
  return { type: rq.default_type || 'dinner', time_budget: +rq.default_budget || 25, servings: { adults: Number.isFinite(+dd.adults) ? +dd.adults : 2, kids: Number.isFinite(+dd.kids) ? +dd.kids : 1 }, dishes: dd.dishes || 'main+side', mood: [], note: '', mode: rq.default_mode || 'auto', dish: '' };
}
function loadOrder() {
  const d = defaultOrder(); const s = lsGet(LS.order) || {};
  state.order = { ...d, ...s, servings: { ...d.servings, ...(s.servings || {}) }, mood: Array.isArray(s.mood) ? s.mood : [] };
}
// 「使いたい物」の候補 = 在庫の品（新しく入れた順）。期限は管理しない。選んだ物だけ注文の use_up に入る
function useUpChoices() {
  const seen = new Set();
  return state.pantry.data.items.slice().sort((x, y) => String(y.added || '').localeCompare(String(x.added || ''))).map(i => i.name).filter(n => n && !seen.has(n) && seen.add(n));
}
const chip = (act, v, label, on, extra = '') => `<button type="button" class="chip${on ? ' is-on' : ''}" data-act="${act}" data-v="${esc(v)}"${extra}>${label}</button>`;
const stepper = (key, label, v) => `<span class="stepper"><span>${label}</span><button type="button" data-act="o-step" data-k="${key}" data-d="-1" aria-label="${label}を減らす">${ic('minus')}</button><b id="o-${key}">${v}</b><button type="button" data-act="o-step" data-k="${key}" data-d="1" aria-label="${label}を増やす">${ic('plus')}</button></span>`;

function renderOrder() {
  const o = state.order; const chips = ((cfg().request || {}).budget_chips || [15, 20, 30, 45, 60]).map(Number);
  const useUp = useUpChoices(); const w = state.weeklyForm || weeklyFormDefault();
  const html = head('flame', '今夜', '時間を選んで「考えてもらう」だけ。1〜2 分でレシピが出る') + `
  <div class="field"><label>時間（キッチンに立ってから盛り付けまで）</label><div class="chips" id="o-budget">${chips.map(m => chip('o-budget', m, `${m}<span class="sub">分</span>`, o.time_budget === m)).join('')}${chip('o-budget', 0, `${ic('infinity')}無制限`, o.time_budget === 0)}<label class="chip free"><input type="number" id="o-free" inputmode="numeric" min="5" max="180" placeholder="自由" value="${chips.includes(o.time_budget) || o.time_budget === 0 ? '' : o.time_budget}" aria-label="自由入力（分）"><span>分</span></label></div></div>
  <div class="field"><label>種類</label><div class="chips">${TYPES.map(([k, ja]) => chip('o-type', k, ja, o.type === k)).join('')}</div></div>
  <div class="field"><label for="o-dish">メニューを指定（任意。料理名を書くと、その料理のレシピを作る）</label><input type="text" id="o-dish" maxlength="60" placeholder="例: フライドポテト、ハンバーグ、だし巻き卵" value="${esc(o.dish || '')}"><span class="sub" id="o-dish-hint"${o.dish ? '' : ' hidden'}>指定した料理 1 本だけ作る（品数・候補の設定は使わない）。在庫に無い材料も使い、足りない物は一覧と買い物メモに出る</span></div>
  <div class="row2">
    <div class="field"><label>人数</label><div class="steppers">${stepper('adults', '大人', o.servings.adults)}${stepper('kids', '子ども', o.servings.kids)}</div></div>
    <div class="field"><label for="o-dishes">品数</label><select id="o-dishes" class="select">${DISHES.map(([k, ja]) => `<option value="${k}"${o.dishes === k ? ' selected' : ''}>${ja}</option>`).join('')}</select></div>
  </div>
  <div class="field"><label>気分（任意）</label><div class="chips">${MOODS.map(m => chip('o-mood', m, esc(m), o.mood.includes(m))).join('')}</div></div>
  ${useUp.length ? `<div class="field"><label>使いたい物（任意。在庫から選ぶ）</label><div class="chips">${useUp.map(n => chip('o-useup', n, esc(n), state.useUpOn.has(n))).join('')}</div></div>` : ''}
  <div class="field"><label for="o-note">一言（任意）</label><input type="text" id="o-note" maxlength="200" placeholder="妻は 20 時。子どもだけ先に" value="${esc(o.note)}"></div>
  <div class="field"><label>出し方</label><div class="chips">${chip('o-mode', 'auto', '本命 1 本＋別案 2 つ', o.mode === 'auto')}${chip('o-mode', 'pick', '候補 3 つから選ぶ', o.mode === 'pick')}</div></div>
  <div class="actions"><button type="button" class="ghost" data-act="o-weekly-toggle" aria-expanded="${state.showWeekly ? 'true' : 'false'}">${ic('calendar')}週の献立…</button><button type="button" class="primary big" data-act="o-submit">${ic('sparkle')}考えてもらう</button></div>
  <div id="o-status" class="status">${pendingHTML('order')}</div>
  <div id="o-weekly" ${state.showWeekly ? '' : 'hidden'}>
    <h3 class="group">週の献立（7 日分と買い物リスト）</h3>
    <div class="row2"><div class="field"><label for="w-start">開始日（月曜）</label><input type="date" id="w-start" value="${esc(w.start_date)}"></div></div>
    <div class="field"><label>曜日ごとの時間（分）</label><div class="wk-budgets">${WDAYS.map(([k, ja]) => `<label><span>${ja}</span><input type="number" inputmode="numeric" min="5" max="180" data-day="${k}" value="${w.budgets[k]}"></label>`).join('')}</div></div>
    <div class="actions left"><button type="button" class="primary" data-act="o-weekly-submit">${ic('sparkle')}週の献立を考えてもらう</button></div>
  </div>
  <div id="o-weekly-result">${weeklyHTML()}</div>`;
  $('#order').innerHTML = html;
}
function weeklyFormDefault() {
  const t = today(); const nextMon = addDays(mondayOf(t), 7); const b = +((cfg().request || {}).default_budget) || 25;
  return { start_date: nextMon, budgets: { mon: b, tue: b, wed: b, thu: b, fri: b, sat: 45, sun: 45 } };
}
// フォームの値を state.order に取り込む（チップは押したときに入る。文字と自由入力はここで）
function readOrder() {
  const o = state.order; if (!o || !$('#o-note')) return o;
  const free = parseInt(($('#o-free') || {}).value, 10); const on = $('#o-budget .chip.is-on');
  o.time_budget = free > 0 ? free : on ? +on.dataset.v : o.time_budget;
  o.note = (($('#o-note') || {}).value || '').trim().slice(0, 200);
  o.dish = (($('#o-dish') || {}).value || '').trim().slice(0, 60);
  o.dishes = ($('#o-dishes') || {}).value || o.dishes;
  const ws = $('#w-start'); if (ws) { const f = state.weeklyForm || weeklyFormDefault(); if (validDate(ws.value)) f.start_date = ws.value; $$('#o-weekly input[data-day]').forEach(i => { const v = parseInt(i.value, 10); if (v > 0) f.budgets[i.dataset.day] = v; }); state.weeklyForm = f; }
  return o;
}
function orderBase(o) {
  const dish = String(o.dish || '').trim();
  return { time_budget: o.time_budget, servings: { ...o.servings }, dishes: dish ? 'main' : o.dishes, mood: [...(o.mood || [])], use_up: [...(o.use_up || [])], exclude: [...(o.exclude || [])], note: o.note || '', mode: dish ? 'auto' : (o.mode || 'auto'), ...(dish ? { dish } : {}) };
}
async function submitOrder(extra = {}) {
  if (!requireToken()) return;
  const o = readOrder(); o.use_up = useUpChoices().filter(n => state.useUpOn.has(n)); lsSet(LS.order, o);
  const req = { id: newRequestId(), ts: isoNow(), type: o.type, ...orderBase(o), ...extra, status: 'pending', error: null, result: null };
  await startRequest(req);
  if (req.dish && state.pending.some(p => p.id === req.id)) { o.dish = ''; lsSet(LS.order, o); renderOrder(); decorateCards(); }   // 指定の料理は 1 回きり。次の注文は普通に
}
// 別案・週の献立の 1 日を詳細にする。親の注文の条件を引き継ぐ
async function submitDetail(parentId, alt) {
  if (!requireToken()) return;
  const cur = state.current && state.current.request; const parent = cur && cur.id === parentId ? cur : (state.weekly && state.weekly.id === parentId ? state.weekly : null);
  const base = orderBase(parent || readOrder());
  if (parent && parent.type === 'weekly') { const day = ((parent.result || {}).days || [])[+alt]; const dow = day && validDate(day.date) ? WDAYS[(dowOf(day.date) + 6) % 7][0] : null; if (dow && parent.budgets && parent.budgets[dow]) base.time_budget = +parent.budgets[dow]; }
  const req = { id: newRequestId(), ts: isoNow(), type: 'recipe_detail', ...base, parent: parentId, alternative: +alt, status: 'pending', error: null, result: null };
  await startRequest(req);
}
async function submitWeekly() {
  if (!requireToken()) return;
  const o = readOrder(); const f = state.weeklyForm || weeklyFormDefault(); lsSet(LS.order, o);
  const req = { id: newRequestId(), ts: isoNow(), type: 'weekly', ...orderBase(o), start_date: f.start_date, budgets: { ...f.budgets }, status: 'pending', error: null, result: null };
  await startRequest(req);
}
// 注文を書いて → 生成を起こして → 考え中にする。before は写真の PUT など、注文の前にやること
async function startRequest(req, before) {
  state.lastError = null;
  const ok = await run(async () => {
    if (before) await before();
    await gh.putFile(`requests/${req.id}.json`, JSON.stringify(req, null, 1) + '\n', gh.msg(`request ${req.id} (${req.type})`));
    await gh.dispatch(req.id);
  });
  if (!ok) { renderPending(); return; }
  addPending({ id: req.id, type: req.type, since: Date.now(), status: 'pending' });
  toast(req.type === 'pantry_photo' ? '写真を送った。読み取り中（2〜4 分）。閉じても大丈夫' : req.type === 'suggest_items' ? '買い足す物を考え中（2〜4 分）。閉じても大丈夫' : req.dish ? `「${req.dish}」を注文した。考え中（2〜4 分）。閉じても大丈夫` : req.time_budget === 0 ? '時間無制限で注文した。考え中（2〜4 分）。閉じても大丈夫' : '注文した。考え中（2〜4 分）。閉じても大丈夫');
  clearTimeout(pollTimer); pollTimer = setTimeout(pollTick, POLL_MS);
}
// 考え中の注文は何件でも持てる（別案 2 つを続けて「詳細に」しても、先の結果を取りこぼさない）。端末に覚える
function savePending() { if (state.pending.length) lsSet(LS.pending, state.pending); else lsDel(LS.pending); renderPending(); }
function addPending(p) { state.pending = state.pending.filter(x => x.id !== p.id); state.pending.push(p); savePending(); }
function dropPending(id) { state.pending = state.pending.filter(x => x.id !== id); savePending(); }
function loadPending() { const raw = lsGet(LS.pending); const list = Array.isArray(raw) ? raw : raw && raw.id ? [raw] : []; state.pending = list.filter(p => p && p.id && Date.now() - (+p.since || 0) < POLL_MAX_MS); savePending(); }
const PENDING_JA = { pantry_photo: '写真を読み取り中', suggest_items: '買い足す物を考え中', recipe_detail: '別案を詳しく考え中', weekly: '週の献立を考え中', prep: '仕込みを考え中' };
let pollTimer = 0;
async function pollTick() {
  clearTimeout(pollTimer); if (!state.pending.length) return;
  const done = [];
  for (const p of [...state.pending]) {
    if (Date.now() - p.since > POLL_MAX_MS) { dropPending(p.id); state.lastError = { type: p.type, error: '24 時間たっても結果が来ない。GitHub の Actions の実行ログを確認してからもう一度' }; toast(state.lastError.error, true); continue; }
    try {
      const { data } = await gh.getJson(`requests/${p.id}.json`);
      if (data && (data.status === 'done' || data.status === 'error')) { dropPending(p.id); done.push(data); continue; }
      if (data && data.status && data.status !== p.status) { p.status = data.status; savePending(); }
    } catch (e) { console.warn(e); }
  }
  done.forEach(onRequestDone);   // 同時に届いたら、あとの物がレシピカードに出る。先の物は「届いたレシピ」から開ける
  renderPending();
  if (!state.pending.length) return;
  const oldest = Math.min(...state.pending.map(p => +p.since || 0));
  pollTimer = setTimeout(pollTick, Date.now() - oldest > POLL_SLOW_AFTER_MS ? POLL_SLOW_MS : POLL_MS);
}
function pendingHTML(scope) {
  const err = state.lastError; const pantry = scope === 'pantry'; let html = '';
  state.pending.filter(p => (p.type === 'pantry_photo') === pantry).forEach(p => {
    const s = Math.max(0, Math.round((Date.now() - p.since) / 1000));
    const slow = s * 1000 > POLL_SLOW_AFTER_MS; const what = PENDING_JA[p.type] || '考え中';
    html += `<div class="pending"><span>${what}${slow ? '。処理が始まれば数分で出る' : '（2〜4 分）'}。閉じても大丈夫<br><span class="sub">${p.status === 'running' ? '生成中' : '順番待ち'} ・ ${fmtSec(s)}</span></span><button type="button" class="ghost tiny" data-act="pending-cancel" data-id="${esc(p.id)}">やめる</button></div>`;
  });
  if (err && ((err.type === 'pantry_photo') === pantry)) html += `<div class="errbox">生成できなかった: ${esc(err.error || '理由不明')}<br><button type="button" class="ghost tiny" data-act="error-clear">${ic('x')}閉じる</button></div>`;
  return html;
}
// 届いたレシピ（注文の結果）。一覧に載るまでの置き場。レシピカードの上に並び、タップで切り替える。一覧に入った物・作った物・古い物（7 日）は外す
const INBOX_MAX = 8;
function inboxAdd(req) { state.inbox = [req, ...state.inbox.filter(x => x.id !== req.id)].slice(0, INBOX_MAX); saveInbox(); }
function inboxDrop(id) { state.inbox = state.inbox.filter(x => x.id !== id); saveInbox(); }
function saveInbox() { if (state.inbox.length) lsSet(LS.inbox, state.inbox); else lsDel(LS.inbox); }
function inboxList() {
  const keep = req => { const res = req && req.result; if (!res) return false; const r = res.recipe; const ts = Date.parse(res.done_at || req.ts || '') || 0; if (ts && Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return false;
    if (r && r.id) return !inList(r.id) && !logsOf(r.id).length; return Array.isArray(res.alternatives) && res.alternatives.length > 0; };
  const list = state.inbox.filter(keep); if (list.length !== state.inbox.length) { state.inbox = list; saveInbox(); }
  return list;
}
function inboxLabel(req) { const res = req.result || {}; const r = res.recipe; if (r && r.title) return `${esc(r.title)}<span class="sub">${(r.time || {}).planned != null ? `${r.time.planned} 分` : ''}</span>`; const n = (res.alternatives || []).length; return `候補 ${n} つ<span class="sub">${esc(hhmm(req.ts))}</span>`; }
function inboxHTML() {
  const list = inboxList(); const cur = state.current && state.current.request; if (!list.length || (list.length === 1 && cur && list[0].id === cur.id)) return '';
  return `<div class="inbox"><span class="sub">届いたレシピ</span><div class="chips">${list.map(req => chip('inbox-open', req.id, inboxLabel(req), !!(cur && cur.id === req.id))).join('')}</div></div>`;
}
function inboxOpen(id) { const req = state.inbox.find(x => x.id === id); if (!req) return; const res = req.result || {}; setCurrent(res.recipe || null, req); renderRecipe(); decorateCards(); goTo('recipe'); }
const hhmm = iso => { const m = /T(\d{2}):(\d{2})/.exec(String(iso || '')); return m ? `${m[1]}:${m[2]}` : ''; };
function renderPending() { const o = $('#o-status'); if (o) o.innerHTML = pendingHTML('order'); const p = $('#p-status'); if (p) p.innerHTML = pendingHTML('pantry'); }
// Actions が書き戻した注文を受け取る
function onRequestDone(req) {
  if (req.status === 'error') { state.lastError = { type: req.type, error: req.error || '理由不明' }; renderPending(); toast(`生成できなかった: ${state.lastError.error}`, true); return; }
  const res = req.result || {};
  if (req.type === 'pantry_photo') { openDiff(photoDiffRows(res), 'photo', []); return; }
  if (req.type === 'suggest_items') { state.suggest = { req, checked: (res.items || []).map(() => true) }; lsSet(LS.suggest, state.suggest); render(); goTo('pantry'); toast('買い足すといい物を出した'); return; }
  if (req.type === 'weekly') { state.weekly = req; lsSet(LS.weekly, req); state.showWeekly = false; render(); goTo('order'); toast('週の献立ができた'); return; }
  if (res.recipe && !res.recipe.id && res.recipe_id) res.recipe.id = res.recipe_id;
  inboxAdd(req); setCurrent(res.recipe || null, req); render(); goTo('recipe');
  toast(res.feasible === false ? '時間に収まらなかった。近い案を出した' : res.recipe ? 'レシピができた' : '候補ができた');
}
function weeklyHTML() {
  const w = state.weekly; if (!w || !w.result) return ''; const res = w.result; const days = Array.isArray(res.days) ? res.days : [];
  return `<h3 class="group">週の献立（${esc(jaShort(w.start_date) || w.start_date || '')} の週）<button type="button" class="ghost tiny" data-act="weekly-clear" aria-label="消す">${ic('x')}</button></h3>
  ${days.map((d, i) => `<div class="wk-day"><div class="d">${esc(jaShort(d.date))}<br><span class="sub">${validDate(d.date) ? DOW_JA[dowOf(d.date)] : ''}</span></div><div class="t">${esc(d.title)} <span class="sub">${d.minutes != null ? `${d.minutes} 分` : ''}${d.kind === 'standard' ? '・定番' : d.kind === 'new' ? '・新しい' : ''}</span><small>${esc((d.main_ingredients || []).join('・'))}${d.why ? `${d.main_ingredients && d.main_ingredients.length ? ' ・ ' : ''}${esc(d.why)}` : ''}</small></div><button type="button" class="ghost small" data-act="o-detail" data-parent="${esc(w.id)}" data-alt="${i}">この案で作る</button></div>`).join('')}
  ${Array.isArray(res.shopping) && res.shopping.length ? `<h3 class="group">買い物リスト</h3><ul class="memo">${res.shopping.map(s => `<li>${esc(s.name)}${s.qty ? ` ${esc(s.qty)}` : ''}${s.reason ? `<span class="sub"> ・ ${esc(s.reason)}</span>` : ''}</li>`).join('')}</ul>${kq().push_shopping ? `<div class="actions left"><button type="button" class="ghost small" data-act="weekly-shop">${ic('cart')}買い物メモへ</button></div>` : ''}` : ''}`;
}

// ======================================================================
// レシピ（front matter の構造化フィールドから描く。Markdown は読まない）
// ======================================================================
function renderRecipe() {
  const c = state.current; const r = currentRecipe(); const req = c && c.request; const res = (req && req.result) || null;
  let html = head('bowl', 'レシピ', r && r.time ? `${r.time.planned} 分 ・ ${esc(r.title)}` : '') + inboxHTML();
  if (!c) { $('#recipe').innerHTML = html + '<p class="empty">まだレシピがない。「今夜」で考えてもらうか、一覧・図鑑から開く。</p>'; return; }
  if (res && res.feasible === false) {
    html += `<div class="infeasible"><b>${req.time_budget} 分には収まらなかった。</b><br>${esc(res.infeasible_reason || '')}</div>`;
    const near = Array.isArray(res.nearest_options) ? res.nearest_options : [];
    if (near.length) html += `<h3 class="group">近い案（タップで注文し直す）</h3><div class="chips">${near.map(o => chip('o-nearest', o.title, `${esc(o.title)}<span class="sub">${o.minutes != null ? `${o.minutes} 分` : ''}</span>`, false, ` data-min="${+o.minutes || (+req.time_budget + 10)}"`)).join('')}</div>${near.map(o => o.why ? `<p class="note">${esc(o.title)}: ${esc(o.why)}</p>` : '').join('')}`;
  }
  if (!r) {
    const alts = res && Array.isArray(res.alternatives) ? res.alternatives : [];
    if (alts.length) html += `<h3 class="group">候補（タップで詳細を作る）</h3>${altsHTML(alts, req.id)}`;
    else if (!(res && res.feasible === false)) html += '<p class="empty">レシピが入っていない。</p>';
    html += `<div class="actions left"><button type="button" class="ghost small" data-act="rc-later">${ic('x')}閉じる</button><button type="button" class="ghost small danger" data-act="cand-del">${ic('trash')}削除</button></div>`;
    $('#recipe').innerHTML = html; return;
  }
  $('#recipe').innerHTML = html + recipeBodyHTML(r, req, res);
}
function recipeBodyHTML(r, req, res) {
  const st = statsOf(r); const photo = photoOf(r); const view = detailViewOf(r); const t = r.time || {}; const sv = r.servings || {};
  const ls = logsOf(r.id).sort((a, b) => logKey(b).localeCompare(logKey(a)));
  const memo = ls.length ? ls.map(e => esc(memoLine(e)) + (e.photo || !e.id ? '' : latePhotoHTML(e))) : (r.memo || []).map(esc);
  let h = `<h3 class="rc-title">${esc(r.title)} ${statusBadge(r.status)}${r.version > 1 ? ` <span class="badge ind">v${r.version}</span>` : ''}</h3>
  ${photo ? `<img class="rc-photo" src="${esc(gh.rawUrl(photo))}" alt="${esc(r.title)}" loading="lazy">` : `<div class="ph">${ic('bowl')}<div>${esc(r.image_text || '完成イメージはまだ無い')}<br><span class="sub">作ると写真がここに入る</span></div></div>`}
  <div class="rc-meta"><span>${ic('clock')} <b>${t.planned ?? '—'}</b> 分 <span class="sub">／ ${t.budget === 0 ? '時間無制限' : `予算 ${t.budget ?? '—'} 分`}${isNum(t.active) ? `・手を動かす ${t.active} 分` : ''}</span></span><span>大人 ${sv.adults ?? '—'}・子 ${sv.kids ?? '—'}</span>${st.cooked ? `<span>作った ${st.cooked} 回${st.r_avg != null ? `・R ${st.r_avg}` : ''}${st.f_avg != null ? `・F ${st.f_avg}` : ''}</span>` : ''}</div>
  <div class="tags">${(r.dishes || []).map(d => `<span>${esc(d.name)}<span class="sub">　${ROLE_JA[d.role] || esc(d.role || '')}</span></span>`).join('')}</div>
  <div class="tags">${(r.equipment || []).map(e => `<span class="eq">${esc(equipLabel(e))}</span>`).join('')}</div>
  <div class="tags">${(r.tags || []).map(tg => `<span>#${esc(tg)}</span>`).join('')}</div>
  ${togetherHTML(r, req)}
  ${(() => { const miss = missingFor(r); return req && req.dish && miss.length ? `<p class="note">指定の料理なので在庫に無い物も使っている。足りない: ${miss.map(esc).join('・')}</p>` : ''; })()}
  <div class="actions left">
    <button type="button" class="primary big" data-act="cook-open">${ic('timer')}作る</button>
    ${(() => { const n = togetherIds(r, req).filter(id => recipeById(id)).length; return n ? `<button type="button" class="ghost" data-act="cook-together">${ic('timer')}一緒に作る（${n + 1} 品）</button>` : ''; })()}
    ${req && req.type !== 'weekly' ? `<button type="button" class="ghost" data-act="o-again">${ic('refresh')}ほかの案</button>` : ''}
    <button type="button" class="ghost" data-act="rc-later">${inList(r.id) ? `${ic('x')}閉じる` : 'あとで'}</button>
    ${inList(r.id) ? '' : `<button type="button" class="ghost small" data-act="list-add">${ic('list')}一覧に追加</button>`}
    <button type="button" class="ghost small" data-act="rec-open" data-id="${esc(r.id)}">${ic('camera')}作ったので記録</button>
    ${kq().push_shopping ? `<button type="button" class="ghost small" data-act="rc-shop">${ic('cart')}足りない物を買い物メモへ</button>` : ''}
    <button type="button" class="ghost small danger" data-act="list-del" data-id="${esc(r.id)}">${ic('trash')}削除</button>
  </div>
  <div class="actions left"><span class="toggle"><button type="button" data-act="rc-view" data-v="full" class="${view === 'full' ? 'is-on' : ''}">細かい版</button><button type="button" data-act="rc-view" data-v="compact" class="${view === 'compact' ? 'is-on' : ''}">短い版</button></span></div>
  <h3 class="group">材料（大人 ${sv.adults ?? '—'}・子 ${sv.kids ?? '—'}）</h3>
  <div class="tbl-wrap"><table class="tbl ing"><thead><tr><th>材料・用途</th><th>量</th><th>在庫</th></tr></thead><tbody>${(r.ingredients || []).map(i => `<tr><td class="n">${esc(i.name)}${i.use_up ? ' <span class="useup">使い切り</span>' : ''}<span class="sub">${esc(i.for || '')}${i.substitute ? ` ・ 代替: ${esc(i.substitute)}` : ''}</span></td><td class="q">${qtyText(i)}</td><td class="st">${pantryMark(i)}</td></tr>`).join('')}</tbody></table></div>
  ${r.salt ? `<p class="note">塩分: 合計 ${r.salt.total_g}g ・ 大人 1 人分 ${r.salt.adult_per_serving_g}g${r.salt.kid_g != null ? ` ・ 子ども ${r.salt.kid_g}g` : ''}</p>` : ''}
  <h3 class="group">段取り表（${t.planned ?? '—'} 分）</h3>${timelineHTML(r)}
  <h3 class="group">手順</h3>${stepsHTML(r, view)}`;
  if (r.kid) h += `<h3 class="group">子どもの分</h3><div class="kv"><b>取り分け</b><span>${r.kid.rule === 'separate' ? '味付け前に取り分ける' : r.kid.rule === 'shared' ? '全体を薄味で' : esc(r.kid.rule || '')}</span><b>大きさ</b><span>${esc(r.kid.cut || '')}</span><b>メモ</b><span>${esc(r.kid.note || '')}</span></div>`;
  if (r.keep) h += `<h3 class="group">保存・翌日</h3><div class="kv"><b>冷蔵</b><span>${r.keep.fridge_days ?? '—'} 日 ・ 冷凍 ${r.keep.freezer ? '可' : '不可'}</span><b>温め直し</b><span>${esc(r.keep.reheat || '')}</span></div>`;
  if (r.cleanup) h += `<h3 class="group">片付け</h3><div class="kv"><b>食洗機</b><span>${(r.cleanup.dishwasher || []).map(e => esc(equipLabel(e))).join('、') || '—'}</span><b>手洗い</b><span>${(r.cleanup.hand || []).map(e => esc(equipLabel(e))).join('、') || '—'}</span>${r.cleanup.note ? `<b>メモ</b><span>${esc(r.cleanup.note)}</span>` : ''}</div>`;
  if (Array.isArray(r.changes) && r.changes.length) { const sup = r.supersedes ? recipeById(r.supersedes) : null; h += `<h3 class="group">改訂の内容${sup ? `（改訂元: ${esc(sup.title)}）` : ''}</h3><ul class="changes">${r.changes.map(ch => `<li>${esc(ch.what)}<br><small>${esc(ch.why)}</small></li>`).join('')}</ul>`; }
  else if (r.supersedes) { const sup = recipeById(r.supersedes); h += `<p class="note">改訂元: ${sup ? `<button type="button" class="ghost tiny" data-act="open-recipe" data-id="${esc(sup.id)}">${esc(sup.title)}</button>` : esc(r.supersedes)}</p>`; }
  h += `<h3 class="group">作ったときのメモ</h3>${memo.length ? `<ul class="memo">${memo.map(m => `<li>${m}</li>`).join('')}</ul>` : '<p class="empty">まだ作っていない。作ったら「作る」→「できた！」で記録。</p>'}`;
  const alts = res && Array.isArray(res.alternatives) ? res.alternatives : [];
  if (alts.length && req) h += `<h3 class="group">別案（タップで詳細を作る）</h3>${altsHTML(alts, req.id)}`;
  return h;
}
// 一緒に作るレシピ（主菜と、分けた副菜・汁物）。together の id を一覧か注文の結果から引く
function togetherIds(r, req) { return Array.isArray(r.together) && r.together.length ? r.together : requestRecipes(req).filter(x => x.id !== r.id).map(x => x.id); }
function togetherHTML(r, req) {
  const ids = togetherIds(r, req).filter(id => recipeById(id));   // 消したレシピは出さない
  if (!ids.length) return '';
  const roleOf = x => { const d = (x.dishes || [])[0]; return d && ROLE_JA[d.role] ? ROLE_JA[d.role] : ''; };
  return `<div class="together"><span class="sub">一緒に作る</span>${ids.map(id => { const x = recipeById(id); return x ? `<button type="button" class="chip" data-act="open-recipe" data-id="${esc(id)}">${esc(x.title)}${roleOf(x) ? `<span class="sub">${roleOf(x)}</span>` : ''}</button>` : `<span class="chip">${esc(id)}</span>`; }).join('')}</div>`;
}
const altsHTML = (alts, parentId) => `<ul class="alts">${alts.map((a, i) => `<li class="alt"><div class="t">${esc(a.title)} <span class="sub">${a.minutes != null ? `${a.minutes} 分` : ''}${a.kind === 'standard' ? '・定番' : a.kind === 'new' ? '・新しい' : ''}</span><small>${esc(a.why || '')}</small></div><button type="button" class="ghost small" data-act="o-detail" data-parent="${esc(parentId)}" data-alt="${i}">${ic('arrow-r')}詳細に</button></li>`).join('')}</ul>`;
function timelineHTML(r) {
  const used = lanesUsed(r); const byMin = new Map();
  (r.timeline || []).slice().sort((a, b) => a.minute - b.minute).forEach(t => { if (!byMin.has(t.minute)) byMin.set(t.minute, {}); const m = byMin.get(t.minute); m[t.lane] = (m[t.lane] ? m[t.lane] + ' ／ ' : '') + (t.text || ''); });
  if (!byMin.size) return '<p class="empty">段取り表が無い</p>';
  return `<div class="tbl-wrap"><table class="tbl tl" style="min-width:${44 + 150 * used.length}px"><thead><tr><th>分</th>${used.map(l => `<th class="lane-${esc(l.kind)}">${esc(l.label)}</th>`).join('')}</tr></thead><tbody>${[...byMin.entries()].map(([m, row]) => `<tr><td class="n">${m}</td>${used.map(l => `<td>${esc(row[l.id] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function dishesOf(r) { const d = []; (r.steps || []).forEach(s => { if (!d.includes(s.dish)) d.push(s.dish); }); return d; }
function stepsHTML(r, view) {
  const steps = r.steps || []; if (!steps.length) return '<p class="empty">手順が無い</p>';
  return dishesOf(r).map((d, di) => `<h4 class="dish">${esc(d)}</h4><ol class="steps">${steps.filter(s => s.dish === d).map(s => stepHTML(s, di, view, r)).join('')}</ol>`).join('');
}
// 工程で使う材料（分量つき）。Generator が steps[].ingredients を出していればそれを材料表から引く。無ければ手順の文に出てくる材料名を拾う（長い名前から。重なりは数えない）
function stepIngredients(r, s) {
  const ings = r.ingredients || []; if (!ings.length) return [];
  if (Array.isArray(s.ingredients)) return s.ingredients.map(nm => ings.find(i => i.name === nm) || ings.find(i => normName(i.name) === normName(nm)) || { name: nm }).filter(Boolean);
  const text = String(s.text || ''); const taken = []; const out = [];
  const cands = ings.map(i => ({ i, keys: [i.name, i.pantry].filter(Boolean) })).sort((a, b) => Math.max(...b.keys.map(k => k.length)) - Math.max(...a.keys.map(k => k.length)));
  cands.forEach(({ i, keys }) => { for (const k of keys) { let at = text.indexOf(k); while (at >= 0) { const end = at + k.length; if (!taken.some(([a, b]) => at < b && end > a)) { taken.push([at, end]); if (!out.includes(i)) out.push(i); break; } at = text.indexOf(k, at + 1); } if (out.includes(i)) break; } });
  return out.sort((a, b) => ings.indexOf(a) - ings.indexOf(b));
}
const stepIngHTML = (r, s) => { const rows = stepIngredients(r, s); return rows.length ? `<div class="ing">${rows.map(i => `<span><b>${esc(i.name)}</b> ${i.qty !== undefined ? qtyText(i) : ''}</span>`).join('')}</div>` : ''; };
function stepHTML(s, di, view, r) {
  const tip = view === 'full' ? tipFor(s, di) : null;
  return `<li class="step"><span class="n">${s.n}</span><div class="t">${esc(s.title)}<span class="sub">${s.minutes} 分・${KIND_JA[s.kind] || esc(s.kind || '')}</span>${s.heat ? `<span class="heat">${ic('flame')}${esc(equipLabel(s.heat.equipment))}・${esc(s.heat.level)}</span>` : ''}${s.timer ? `<span class="tm">${ic('timer')}${fmtSec(+s.timer)}</span>` : ''}</div>
  ${r ? stepIngHTML(r, s) : ''}${view === 'full' && s.text ? `<div class="tx">${esc(s.text)}</div>` : ''}${s.cue ? `<div class="cue">${esc(s.cue)}</div>` : ''}${s.caution ? `<div class="caution">⚠ ${esc(s.caution)}</div>` : ''}${view === 'full' && s.kid ? `<div class="kid">🍼 ${esc(s.kid)}</div>` : ''}
  ${tip ? `<details class="tip"><summary>${ic('bulb')}コツ: ${esc(tip.title)}</summary><div class="body">${md(tip.body)}</div></details>` : ''}</li>`;
}
function memoLine(e) {
  const parts = [`${e.date} ・ ${e.actual_minutes ?? '—'} 分（見込み ${e.planned_minutes ?? '—'}）`, `R ${e.r_score ?? '—'}`];
  if (isNum(e.f_score)) parts.push(`F ${e.f_score}`);
  if (e.fidelity && FID_JA[e.fidelity]) parts.push(FID_JA[e.fidelity] + (e.deviation ? `: ${e.deviation}` : ''));
  if (e.learned) parts.push(`気づき: ${e.learned}`);
  if (e.photo_note) parts.push(`写真: ${e.photo_note}`);
  if (e.photo) parts.push(`📷 ${String(e.photo).split('/').pop()}`);
  return parts.join(' ・ ').replace('） ・ R', '）・ R');
}
// 在庫に無くてレシピに要る物（staples の none を含む）→ kaji-quest の買い物メモへ
function missingFor(r) {
  const d = state.pantry.data; const out = [];
  (r.ingredients || []).forEach(i => { if (!i.pantry) return; const n = i.pantry; if (n in d.staples) { if (d.staples[n] === 'none') out.push(n); return; } if (!d.items.some(it => sameName(it.name, n))) out.push(n); });
  return [...new Set(out)];
}
async function pushShopping(names) {
  if (!names.length) { toast('足りない物は無い'); return; }
  if (!requireToken()) return; const r = kqRepo(); if (!r.owner) { toast('config の kaji_quest.repo が無い', true); return; } const t = today();
  await run(() => gh.mutateFile('shopping.json', text => {
    let d = {}; try { d = text ? JSON.parse(text) : {}; } catch { d = {}; }
    d.items = Array.isArray(d.items) ? d.items : []; d.recent = Array.isArray(d.recent) ? d.recent : [];
    names.forEach(n => { if (!d.items.some(i => i && i.text === n)) d.items.push({ id: uid(12), text: n, added: t }); });
    return JSON.stringify(d, null, 1) + '\n';
  }, gh.msg('recipi: 買い物メモに追加'), r), `${names.length} 品を kaji-quest の買い物メモに足した`);
}

// ======================================================================
// 調理モード（全画面・大きな字・タイマー・Wake Lock・進み具合は端末に保存）
// ======================================================================
const cook = { recipe: null, recipes: [], offsets: [], request: null, start: 0, done: {}, tl: {}, timers: {}, fired: new Set(), tick: 0, lock: null };
const cookKey = rid => LS.cook + rid;
const cookKeyOf = recipes => cookKey(recipes.map(r => r.id).join('+'));
// 工程・段取りのキー: 1 本目は s0 / t1（前の版と同じ）、2 本目からは "1:s0" のように本の番号を付ける
const ck = (ri, k) => ri ? `${ri}:${k}` : k;
const plannedOf = r => isNum((r.time || {}).planned) ? r.time.planned : Math.max(0, ...(r.timeline || []).map(t => +t.minute || 0));
// 1 本でも複数でも同じ画面。複数なら段取り表を 1 つに合わせ、短い物は遅く始めて同時に仕上げる（開始のずらし = offsets）
function openCook(recipeOrList, request) {
  const recipes = (Array.isArray(recipeOrList) ? recipeOrList : [recipeOrList || currentRecipe()]).filter(Boolean);
  if (!recipes.length) { toast('先にレシピを選ぶ'); return; }
  const main = recipes[0]; const saved = lsGet(cookKeyOf(recipes)) || {};
  const offsets = recipes.map((r, i) => i === 0 ? 0 : Math.max(0, plannedOf(main) - plannedOf(r)));
  Object.assign(cook, { recipe: main, recipes, offsets: Array.isArray(saved.offsets) && saved.offsets.length === recipes.length ? saved.offsets.map(n => Math.max(0, +n || 0)) : offsets,
    request: request || (state.current && state.current.recipe && state.current.recipe.id === main.id ? state.current.request : null),
    start: +saved.start || Date.now(), done: saved.done && typeof saved.done === 'object' ? saved.done : {}, tl: saved.tl && typeof saved.tl === 'object' ? saved.tl : {}, timers: saved.timers && typeof saved.timers === 'object' ? saved.timers : {}, fired: new Set() });
  saveCook(); renderCook(); $('#cook').hidden = false; document.body.style.overflow = 'hidden'; requestWake(); startCookTick();
}
function saveCook() { if (cook.recipes.length) lsSet(cookKeyOf(cook.recipes), { start: cook.start, done: cook.done, tl: cook.tl, timers: cook.timers, offsets: cook.offsets }); }
function closeCook() { $('#cook').hidden = true; document.body.style.overflow = ''; releaseWake(); clearInterval(cook.tick); cook.tick = 0; }
function renderCook() {
  const rs = cook.recipes; const multi = rs.length > 1;
  const lanes = []; rs.forEach(r => lanesUsed(r).forEach(l => { if (!lanes.some(x => x.id === l.id)) lanes.push(l); }));
  const total = Math.max(...rs.map((r, ri) => (cook.offsets[ri] || 0) + plannedOf(r)));
  const mark = ri => multi ? `<span class="rk rk${ri % 4}">${ri + 1}</span>` : '';
  let h = multi
    ? `<h3>まとめて調理 <span class="sub">${rs.length} 品 ・ ${total} 分の段取り</span></h3><div class="ck-set">${rs.map((r, ri) => `<div class="ck-set-row">${mark(ri)}<b>${esc(r.title)}</b><span class="sub">${plannedOf(r)} 分</span><span class="ck-off"><button type="button" class="tiny-btn" data-act="ck-offset" data-ri="${ri}" data-d="-1" aria-label="早く始める">−</button><span class="num">開始 +${cook.offsets[ri] || 0} 分</span><button type="button" class="tiny-btn" data-act="ck-offset" data-ri="${ri}" data-d="1" aria-label="遅く始める">＋</button></span></div>`).join('')}<p class="sub">段取りは全部を 1 つの表にしてある。短い物は遅く始めて同時に仕上げる。ずらす分は ＋/− で直せる</p></div>`
    : `<h3>${esc(rs[0].title)} <span class="sub">${(rs[0].time || {}).planned ?? '—'} 分の段取り</span></h3>`;
  rs.forEach((r, ri) => { h += cookIngredientsHTML(r, multi ? `${ri + 1}. ${r.title}` : ''); });
  // 段取り: 全レシピの行に開始のずらしを足して、分の順に並べる
  const rows = []; rs.forEach((r, ri) => (r.timeline || []).forEach((t, i) => rows.push({ ...t, ri, i, at: (+t.minute || 0) + (cook.offsets[ri] || 0) })));
  rows.sort((a, b) => a.at - b.at || a.ri - b.ri);
  if (rows.length) h += '<h3 class="sec">段取り（分）</h3>' + rows.map(t => { const lane = lanes.find(l => l.id === t.lane) || { label: equipLabel(t.lane), kind: 'other' }; const k = ck(t.ri, 't' + t.i); const on = !!cook.tl[k];
    return `<div class="ck-tl${on ? ' is-done' : ''}" data-key="${k}"><div class="m">${t.at}</div><div>${mark(t.ri)}<span class="lane ${esc(lane.kind)}">${esc(lane.label)}</span><div>${esc(t.text)}</div></div><button type="button" class="tick-btn${on ? ' is-on' : ''}" data-act="ck-tl" data-key="${k}" aria-label="できた" aria-pressed="${on}">${ic('check')}</button></div>`; }).join('');
  // 手順の 1 枚。キーは前の版と同じ（1 本目は s0、2 本目からは "1:s0"）ので、途中の進み具合・タイマーはそのまま
  const stepCard = (r, ri, s, i, at = null) => { const k = ck(ri, 's' + i); const on = !!cook.done[k]; const sec = +s.timer || Math.round((+s.minutes || 0) * 60);
    return `<div class="ck-step${on ? ' is-done' : ''}" data-key="${k}">${at !== null ? `<div class="ck-at">${mark(ri)}<b class="num">${at} 分〜</b><span class="sub">${esc(dishesOf(r).length > 1 && s.dish ? s.dish : r.title)}</span></div>` : ''}<div class="hd"><button type="button" class="tick-btn big${on ? ' is-on' : ''}" data-act="ck-step" data-key="${k}" aria-label="できた" aria-pressed="${on}">${ic('check')}</button><div class="t">${s.n}. ${esc(s.title)}<small>${s.minutes} 分${s.heat ? ` ・ ${esc(equipLabel(s.heat.equipment))}・${esc(s.heat.level)}` : ''}${s.kind === 'wait' ? ' ・ 触らない' : ''}</small></div></div>
    ${stepIngHTML(r, s)}<p class="tx">${esc(s.text)}</p>${s.cue ? `<div class="cue">${esc(s.cue)}</div>` : ''}${s.caution ? `<div class="caution">⚠ ${esc(s.caution)}</div>` : ''}${s.kid ? `<div class="kid">🍼 ${esc(s.kid)}</div>` : ''}
    ${sec > 0 ? `<div class="row"><button type="button" class="timer-btn" data-act="ck-timer" data-key="${k}" data-sec="${sec}">${ic('timer')}<span class="tv">${fmtSec(sec)}</span></button>${s.timer ? '' : '<span class="sub">工程の目安</span>'}</div>` : ''}</div>`; };
  if (multi) {
    // まとめて調理: 全部のレシピの手順を、始める分（段取りと同じ時計 + 開始のずらし）の順に 1 列に並べる
    const items = []; rs.forEach((r, ri) => { const st = stepStarts(r); (r.steps || []).forEach((s, i) => items.push({ r, ri, s, i, at: (st[i] || 0) + (cook.offsets[ri] || 0) })); });
    items.sort((a, b) => a.at - b.at || a.ri - b.ri || a.i - b.i);
    h += '<h3 class="sec">手順（始める順）</h3><p class="sub ck-note">全部のレシピの手順を、段取りと同じ時計で始める順に並べた。番号はレシピの中の番号</p>' + items.map(x => stepCard(x.r, x.ri, x.s, x.i, x.at)).join('');
  } else {
    h += '<h3 class="sec">手順</h3>';
    rs.forEach((r, ri) => {
      const steps = r.steps || []; const dishes = dishesOf(r);
      dishes.forEach(d => { if (dishes.length > 1) h += `<h3>${esc(d)}</h3>`;
        h += steps.map((s, i) => ({ s, i })).filter(x => x.s.dish === d).map(({ s, i }) => stepCard(r, ri, s, i)).join(''); });
    });
  }
  $('#cook-body').innerHTML = h;
}
// 調理画面の材料（分量つき）。料理ごと（for が料理名なら）にまとめ、残りは用途ごと。閉じられる
function cookIngredientsHTML(r, title = '') {
  const ings = r.ingredients || []; if (!ings.length) return '';
  const dishes = dishesOf(r); const groups = new Map();
  ings.forEach(i => { const f = String(i.for || ''); const d = dishes.find(x => f && (f === x || x.includes(f) || f.includes(x))); const key = d || f || 'ほか'; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(i); });
  const sv = r.servings || {};
  const li = i => `<li><span class="n">${esc(i.name)}${i.substitute ? `<small>代替: ${esc(i.substitute)}</small>` : ''}</span><span class="q num">${qtyText(i)}</span></li>`;
  return `<details class="ck-ing" open><summary>${ic('list')}<span class="lb">材料</span>${title ? `<span class="ck-rt-s">${esc(title)}</span>` : ''}<span class="sub">大人 ${sv.adults ?? '—'}・子 ${sv.kids ?? '—'} ・ ${ings.length} 品</span></summary>
  ${[...groups.entries()].map(([k, rows]) => `${groups.size > 1 ? `<div class="g">${esc(k)}</div>` : ''}<ul>${rows.map(li).join('')}</ul>`).join('')}</details>`;
}
function startCookTick() { clearInterval(cook.tick); cook.tick = setInterval(cookTick, 1000); cookTick(); }
function cookTick() {
  const el = $('#cook-elapsed'); if (el) el.textContent = `${Math.floor((Date.now() - cook.start) / 60000)} 分`;
  const now = Date.now();
  $$('#cook .timer-btn').forEach(b => {
    const key = b.dataset.key; const end = cook.timers[key]; const tv = b.querySelector('.tv');
    if (!end) { b.classList.remove('is-running', 'is-done'); tv.textContent = fmtSec(+b.dataset.sec); return; }
    const rem = Math.ceil((end - now) / 1000);
    if (rem > 0) { b.classList.add('is-running'); b.classList.remove('is-done'); tv.textContent = fmtSec(rem); }
    else { b.classList.remove('is-running'); b.classList.add('is-done'); tv.textContent = '0:00 できた'; if (!cook.fired.has(key)) { cook.fired.add(key); timerDone(); } }
  });
}
function timerDone() { beep(3); const c = $('#cook'); c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); }
function toggleTimer(key, sec) {
  unlockAudio();
  if (cook.timers[key]) { delete cook.timers[key]; cook.fired.delete(key); } else cook.timers[key] = Date.now() + sec * 1000;
  saveCook(); cookTick();
}
async function requestWake() {
  try { if ('wakeLock' in navigator && !cook.lock) { cook.lock = await navigator.wakeLock.request('screen'); cook.lock.addEventListener('release', () => { cook.lock = null; }); } } catch { cook.lock = null; }
}
function releaseWake() { try { if (cook.lock) cook.lock.release(); } catch { /* */ } cook.lock = null; }
// 工程の種類ごとの実時間: 前のチェック（最初は開始）からこのチェックまでを、その工程の kind に入れる（学習の速度係数に使う）
function computeStepMinutes(r, start, done) {
  const checks = Object.entries(done || {}).filter(([k, ts]) => k.startsWith('s') && +ts > 0).map(([k, ts]) => ({ i: +k.slice(1), ts: +ts })).sort((a, b) => a.ts - b.ts);
  if (!checks.length) return null; const sum = {}; let prev = start;
  checks.forEach(c => { const s = (r.steps || [])[c.i]; const m = (c.ts - prev) / 60000; prev = c.ts; if (!s || !s.kind || m <= 0) return; sum[s.kind] = (sum[s.kind] || 0) + m; });
  const out = {}; Object.keys(sum).forEach(k => { const v = round1(sum[k]); if (v > 0) out[k] = v; });
  return Object.keys(out).length ? out : null;
}
function finishCook() {
  const rs = cook.recipes; const actual = Math.max(1, Math.round((Date.now() - cook.start) / 60000));
  const doneFor = ri => { const o = {}; Object.entries(cook.done).forEach(([k, v]) => { const m = /^(?:(\d+):)?(s\d+)$/.exec(k); if (m && (+m[1] || 0) === ri) o[m[2]] = v; }); return o; };
  const doneAt = Date.now();   // 調理が完成した時刻（kaji-quest の朝・昼・夜を決める）
  const items = rs.map((r, ri) => ({ recipe: r, step_minutes: computeStepMinutes(r, cook.start, doneFor(ri)), doneAt }));
  const key = cookKeyOf(rs); const request = cook.request;
  closeCook(); lsDel(key); rs.forEach(markCookedLocal);
  const [first, ...queue] = items;
  openRecord(first.recipe, { actual, request, step_minutes: first.step_minutes, fromCook: true, queue, queueTotal: items.length, doneAt }); goTo('record');
}

// ======================================================================
// 記録（docs/SPEC.md §9.1。必須は無し。写真 → ログ → メモ → 在庫 → kaji-quest の順。写真が失敗しても記録は残す）
// ======================================================================
let rec = null;
function openRecord(recipe, opts = {}) {
  const planned = recipe.time && isNum(recipe.time.planned) ? recipe.time.planned : null;
  if (rec && rec.photo && rec.photo.url) URL.revokeObjectURL(rec.photo.url);
  rec = { recipe, request: opts.request || null, doneAt: +opts.doneAt || null, kqLog: opts.kqLog !== false, actual: opts.actual || planned || 20, planned, fidelity: null, deviation: '', finish: null, me: null, partner: null, partnerLater: false, kid: null, kidLater: false, learned: '', photo: null, step_minutes: opts.step_minutes || null, fromCook: !!opts.fromCook, queue: Array.isArray(opts.queue) ? opts.queue : [], queueTotal: +opts.queueTotal || 0, startedAt: Date.now(), pantry: pantryRowsFor(recipe) };
  renderRecord(); decorateCards();
}
// 材料のうち在庫（items）にある物。作ってなくなった物にチェックすると在庫から外す（在庫はあるかないかだけ）
function pantryRowsFor(r) {
  const items = state.pantry.data.items; const rows = []; const seen = new Set();
  (r.ingredients || []).forEach(ing => {
    if (!ing.pantry) return; const item = items.find(it => sameName(it.name, ing.pantry)); if (!item || seen.has(item.id)) return; seen.add(item.id);
    rows.push({ ing, item, gone: false });
  });
  return rows;
}
function pendingPhotoHTML() { const p = lsGet(LS.photo); return p && p.path ? `<div class="errbox">送れていない写真がある（${esc(p.path.split('/').pop())}）<br><button type="button" class="ghost small" data-act="photo-retry">${ic('refresh')}写真を再送</button> <button type="button" class="ghost tiny" data-act="photo-drop">あきらめる</button></div>` : ''; }
function renderRecord() {
  const sec = $('#record');
  if (!rec) {
    const opts = state.recipes.filter(r => r.status !== 'retired').map(r => `<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');
    sec.innerHTML = head('camera', '記録', '作ったら写真 1 枚と星をつけるだけ。60 秒') + `<p class="empty">調理モードの「できた！」から来るか、レシピを選んで始める。</p>${opts ? `<div class="add-row"><select id="rec-pick" class="select" aria-label="記録するレシピ">${opts}</select><button type="button" class="primary" data-act="rec-start">始める</button></div>` : ''}${pendingPhotoHTML()}`;
    return;
  }
  const r = rec.recipe; const dev = rec.fidelity === 'minor' || rec.fidelity === 'major';
  sec.innerHTML = head('camera', '記録', `${rec.queueTotal > 1 ? `（${rec.queueTotal - rec.queue.length}/${rec.queueTotal}）` : ''}${esc(r.title)}`) + `
  <div class="rec-row full"><div class="v"><label class="ghost photo-btn">${ic('camera')}写真を撮る<input type="file" accept="image/*" capture="environment" id="rec-photo-cam"></label><label class="ghost photo-btn">${ic('image')}ライブラリ<input type="file" accept="image/*" id="rec-photo-lib"></label>${rec.photo ? `<button type="button" class="ghost tiny" data-act="rec-photo-clear">${ic('x')}消す</button>` : ''}</div>${rec.photo ? `<img class="rec-preview" src="${rec.photo.url}" alt="完成写真">` : ''}</div>
  <div class="rec-row"><div class="lb">${ic('clock')}時間</div><div class="v rec-time"><button type="button" class="tiny-btn" data-act="rec-time" data-d="-5">-5</button><button type="button" class="tiny-btn" data-act="rec-time" data-d="-1">-1</button><b id="rec-actual">${rec.actual}</b><span>分</span><button type="button" class="tiny-btn" data-act="rec-time" data-d="1">+1</button><button type="button" class="tiny-btn" data-act="rec-time" data-d="5">+5</button><span class="sub">見込み ${rec.planned ?? '—'} 分${rec.fromCook ? ' ・ 調理モードの実測' : ''}</span></div></div>
  <div class="rec-row"><div class="lb">${ic('list')}手順どおり？</div><div class="v">${['exact', 'minor', 'major'].map(f => `<button type="button" class="tiny-btn${rec.fidelity === f ? ' is-on' : ''}" data-act="rec-fid" data-v="${f}">${FID_JA[f]}</button>`).join('')}</div></div>
  <div class="rec-row full" id="rec-dev-row"${dev ? '' : ' hidden'}><input type="text" id="rec-dev" maxlength="140" placeholder="変えた点（1 行）" value="${esc(rec.deviation)}"></div>
  <div class="rec-row"><div class="lb">${ic('sparkle')}仕上がり</div><div class="v">${stars('rec-star', rec.finish, 'data-f="finish"')}</div></div>
  <div class="rec-row"><div class="lb">👤 自分</div><div class="v">${stars('rec-star', rec.me, 'data-f="me"')}</div></div>
  <div class="rec-row"><div class="lb">👤 パートナー</div><div class="v">${stars('rec-star', rec.partner, 'data-f="partner"')}<button type="button" class="tiny-btn${rec.partnerLater ? ' is-on' : ''}" data-act="rec-partner-later">あとで</button></div></div>
  <div class="rec-row"><div class="lb">🧒 子ども</div><div class="v">${['all', 'half', 'little', 'none', 'absent'].map(k => `<button type="button" class="tiny-btn${rec.kid === k ? ' is-on' : ''}" data-act="rec-kid" data-v="${k}">${KID_JA[k]}</button>`).join('')}<button type="button" class="tiny-btn${rec.kidLater ? ' is-on' : ''}" data-act="rec-kid-later">あとで</button></div></div>
  <div class="rec-row full"><div class="lb">${ic('bulb')}気づき（1 行、任意）</div><input type="text" id="rec-learned" maxlength="140" placeholder="皮目 3 分は長い。2 分半で十分" value="${esc(rec.learned)}"></div>
  ${rec.pantry.length ? `<div class="rec-row full"><div class="lb">${ic('fridge')}なくなった食材を在庫から外す</div><p class="sub">使い切った物にチェック。在庫はあるかないかだけ</p><ul class="pc-list">${rec.pantry.map((p, i) => pcRowHTML(p, i)).join('')}</ul></div>` : ''}
  ${kq().write_cook_log && kqRepo().owner ? `<p class="note rec-kq">${rec.kqLog ? `kaji-quest には「${esc(kqCookTask(rec.doneAt).title)}」で記録する（${rec.doneAt ? `完成 ${esc(kqCookTask(rec.doneAt).p.iso.slice(11, 16))}` : '記録した時刻'}で判断）` : 'kaji-quest には 1 本目の記録で書いた（まとめて調理は 1 回分）'}</p>` : ''}
  <div class="actions"><button type="button" class="ghost" data-act="rec-cancel">やめる</button><button type="button" class="primary big" data-act="rec-save">${ic('check')}記録する</button></div>
  ${pendingPhotoHTML()}`;
}
// 端末で縮小・JPEG に再エンコード（EXIF はここで落ちる）
async function resizeImage(file) {
  const ph = cfg().photos || {}; const maxEdge = +ph.max_edge_px || 1280, q = +ph.jpeg_quality || 0.8;
  let src, w, h, cleanup = () => {};
  try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); w = src.width; h = src.height; cleanup = () => { if (src.close) src.close(); }; }
  catch {
    src = await new Promise((res, rej) => { const img = new Image(); const u = URL.createObjectURL(file); img.onload = () => res(img); img.onerror = () => rej(new Error('画像を読めなかった')); img.src = u; cleanup = () => URL.revokeObjectURL(u); });
    w = src.naturalWidth; h = src.naturalHeight;
  }
  const sc = Math.min(1, maxEdge / Math.max(w, h, 1)); const cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(h * sc));
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; c.getContext('2d').drawImage(src, 0, 0, cw, ch); cleanup();
  const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', q)); if (!blob) throw new Error('画像を変換できなかった');
  return new Uint8Array(await blob.arrayBuffer());
}
async function setRecordPhoto(file) {
  if (!rec || !file) return;
  try { const bytes = await resizeImage(file); if (rec.photo && rec.photo.url) URL.revokeObjectURL(rec.photo.url); rec.photo = { bytes, url: URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' })) }; syncRecordInputs(); renderRecord(); }
  catch (e) { toast(e.message, true); }
}
function syncRecordInputs() { if (!rec) return; const d = $('#rec-dev'), l = $('#rec-learned'); if (d) rec.deviation = d.value.trim().slice(0, 140); if (l) rec.learned = l.value.trim().slice(0, 140); }
async function nextPhotoPath(rid, date) {
  const ymd = date.replace(/-/g, ''); let n = 0; const re = new RegExp(`^${ymd}-(\\d+)\\.jpg$`);
  try { (await gh.listDir(`photos/${rid}`)).forEach(f => { const m = String(f.name || '').match(re); if (m) n = Math.max(n, +m[1]); }); }
  catch { logsOf(rid).forEach(e => { const m = String(e.photo || '').split('/').pop().match(re); if (m) n = Math.max(n, +m[1]); }); }
  return `photos/${rid}/${ymd}-${n + 1}.jpg`;
}
function withMemo(text, line) {
  const base = text.replace(/\s+$/, ''); const idx = base.indexOf(MEMO_HEADING);
  if (idx < 0) return `${base}\n\n${MEMO_HEADING}\n\n- ${line}\n`;
  const after = base.indexOf('\n## ', idx + MEMO_HEADING.length);
  if (after < 0) return `${base}\n- ${line}\n`;
  return `${base.slice(0, after).replace(/\s+$/, '')}\n- ${line}\n${base.slice(after)}`;
}
// 作ったときのメモを足す。あわせて status を「作った」に。一覧（同梱）に無いレシピなら listed: も刻み、[skip ci] 無しでコミットして一覧を組み直す
async function appendMemo(r, line) {
  const listed = !state.recipesBase.some(x => x.id === r.id);
  await stampRecipe(r, { status: 'tried', listed, memo: line, message: listed ? `調理済みに追加: ${r.title}` : gh.msg(`memo ${r.id}`) });
}
function pcRowHTML(p, i) {
  return `<li><label class="chk"><input type="checkbox" data-act="rec-pc-gone" data-i="${i}"${p.gone ? ' checked' : ''}><span><b>${esc(p.item.name)}</b> なくなった<small>${esc(LOC_JA[p.item.loc] || '')}</small></span></label></li>`;
}
async function consumePantry(rows) {
  if (!rows.length) return;
  await savePantry(d => { rows.forEach(p => { d.items = d.items.filter(i => i.id !== p.item.id); }); }, 'なくなった物を外す');
}
// kaji-quest の「朝ごはんを作る」「昼ごはんを作る」「夜ご飯を作る」の完了としても書く（config.kaji_quest.write_cook_log）。
// どれにするかは調理が完成した時刻（調理モードの「できた！」。調理モードを通っていなければ記録した時刻）で決める。
// 時間帯の区切りは kaji-quest と同じ: 朝 4〜11 時・昼 11〜17 時・夜 17〜翌 4 時。タスクの id・名前・重みは config.kaji_quest.cook_tasks
const KQ_COOK = { morning: { task_id: 'breakfast-cook', title: '朝ごはんを作る', weight: 1.25 }, noon: { task_id: 'lunch-cook', title: '昼ごはんを作る', weight: 1.25 }, night: { task_id: 'dinner-cook', title: '夜ご飯を作る', weight: 1.35 } };
const mealSlotOfHour = h => (h >= 4 && h < 11 ? 'morning' : h >= 11 && h < 17 ? 'noon' : 'night');
function kqCookTask(at) {
  const p = nowParts(at ? new Date(at) : new Date()); const slot = mealSlotOfHour(p.hour);
  const c = (kq().cook_tasks || {})[slot] || {}; const d = KQ_COOK[slot];
  return { slot, p, task_id: c.task_id || d.task_id, title: c.title || d.title, weight: +c.weight || d.weight };
}
async function kqCookLog(e, at) {
  const r = kqRepo(); if (!r.owner) return null; const n = +e.actual_minutes || 0; const t = kqCookTask(at); const w = t.weight;
  const line = { date: t.p.date, ts: t.p.iso, task_id: t.task_id, title: t.title, area: 'cooking', slot: t.slot, status: 'done', mode: 'full', actual_minutes: n, weight: w, weighted_minutes: round1(n * w), xp: Math.round(n * w) };
  if (e.learned) line.learned = e.learned; line.id = uid(12);
  await gh.mutateFile(`logs/${ymOf(t.p.date)}.jsonl`, text => appendLine(text, JSON.stringify(line)), gh.msg(`recipi: ${t.title}`), r);
  return t;
}
async function saveRecord() {
  if (!rec || !requireToken()) return; syncRecordInputs();
  const r = rec.recipe; const p = nowParts(); const date = p.date;
  const ratings = { me: rec.me, partner: rec.partnerLater ? null : rec.partner, kid: rec.kid };
  const entry = { id: uid(12), date, ts: p.iso, recipe_id: r.id, title: r.title || null, version: +r.version || 1, request_id: rec.request ? rec.request.id : (r.request || null), type: r.type || (rec.request && rec.request.type) || 'dinner',
    planned_minutes: rec.planned, actual_minutes: rec.actual, fidelity: rec.fidelity, deviation: (rec.fidelity === 'minor' || rec.fidelity === 'major') && rec.deviation ? rec.deviation : null, finish: rec.finish, ratings, photo: null, learned: rec.learned || null,
    pantry_used: rec.pantry.map(x => x.item.id), r_score: rScore(rec.planned, rec.actual, rec.fidelity, rec.finish), f_score: fScore(ratings) };
  if (rec.step_minutes) entry.step_minutes = rec.step_minutes;
  if ((cfg().privacy || {}).log_time === false) delete entry.ts;
  let photoFailed = false, kqTask = null; const side = [];
  const ok = await run(async () => {
    if (rec.photo) {
      const path = await nextPhotoPath(r.id, date); entry.photo = path;
      try { await gh.putFile(path, rec.photo.bytes, gh.msg(`photo ${r.id} ${date}`)); }
      catch (e) { photoFailed = true; lsSet(LS.photo, { path, b64: gh.b64bytes(rec.photo.bytes), recipe_id: r.id }); console.warn(e); }
    }
    await appendLog(entry);
    try { await appendMemo(r, memoLine(entry)); } catch (e) { side.push('レシピのメモ: ' + e.message); }
    try { await consumePantry(rec.pantry.filter(x => x.gone)); } catch (e) { side.push('在庫: ' + e.message); }
    if (kq().write_cook_log && rec.kqLog) { try { kqTask = await kqCookLog(entry, rec.doneAt); } catch (e) { side.push('kaji-quest: ' + e.message); } }
  });
  if (!ok) return;
  lsDel(cookKey(r.id)); if (rec.photo && rec.photo.url) URL.revokeObjectURL(rec.photo.url);
  markCookedLocal(r);   // 一覧に「作った」として載せる
  setCurrent(null, null);   // 作り終えたレシピはレシピカードから消す。見るときは一覧から
  const secs = Math.round((Date.now() - rec.startedAt) / 1000); const queue = rec.queue || [], total = rec.queueTotal || 0, actual = rec.actual; rec = null; render();
  if (side.length) toast(`記録はした。残りは失敗: ${side.join(' / ')}`, true);
  else toast(photoFailed ? '記録した。写真は送れなかった → 記録カードの「写真を再送」' : `記録した。一覧に「作った」として残した${kqTask ? `。kaji-quest に「${kqTask.title}」` : ''}（${secs} 秒）`);
  // まとめて調理のあとは、残りのレシピの記録を続ける
  if (queue.length) { const nxt = queue[0]; openRecord(nxt.recipe, { actual, request: null, doneAt: nxt.doneAt, kqLog: false, step_minutes: nxt.step_minutes, fromCook: true, queue: queue.slice(1), queueTotal: total }); goTo('record'); toast(`続けて「${nxt.recipe.title}」の記録`); return; }
  goTo('list');
}
async function retryPhoto() {
  const p = lsGet(LS.photo); if (!p || !p.path || !p.b64) { lsDel(LS.photo); render(); return; }
  if (!requireToken()) return;
  const bytes = Uint8Array.from(atob(p.b64), c => c.charCodeAt(0));
  const ok = await run(async () => { const cur = await gh.getFile(p.path); await gh.putFile(p.path, bytes, gh.msg(`photo ${p.recipe_id || ''} 再送`), cur.sha); }, '写真を送った');
  if (ok) { lsDel(LS.photo); render(); }
}
// あとから写真を足す（§8.3）。記録の行（logs）の photo を書き換えるだけ。顔写真（§8.4）と図鑑はログから引くので、それで反映される
function latePhotoHTML(e, cls = 'tiny') {
  if (!e || !e.id || !validDate(e.date)) return '';
  const attrs = `data-act="late-photo" data-log="${esc(e.id)}" data-date="${esc(e.date)}"`;
  return `<span class="late-photo"><label class="ghost ${cls} photo-btn">${ic('image')}写真を足す<input type="file" accept="image/*" ${attrs} aria-label="ライブラリから写真を足す"></label><label class="ghost ${cls} photo-btn">${ic('camera')}撮る<input type="file" accept="image/*" capture="environment" ${attrs} aria-label="撮って写真を足す"></label></span>`;
}
async function addPhotoLater(id, date, file) {
  if (!file || !requireToken()) return;
  const e = allLogs().find(x => x.id === id); if (!e) { toast('その記録が見つからない（↻ で更新）', true); return; }
  let bytes; try { bytes = await resizeImage(file); } catch (err) { toast(err.message, true); return; }
  let photoFailed = false;
  const ok = await run(async () => {
    const path = await nextPhotoPath(e.recipe_id, date);
    try { await gh.putFile(path, bytes, gh.msg(`photo ${e.recipe_id} ${date}`)); }
    catch (err) { photoFailed = true; lsSet(LS.photo, { path, b64: gh.b64bytes(bytes), recipe_id: e.recipe_id }); console.warn(err); }
    await rewriteLog(id, date, x => { x.photo = path; return x; }, '写真を追記');
  });
  if (!ok) return; render();
  toast(photoFailed ? '記録に写真を付けた。写真は送れなかった → 記録カードの「写真を再送」' : '写真を足した。図鑑とレシピの顔に入る', photoFailed);
}

// ======================================================================
// 在庫（pantry.json はページが書く。文字・写真・kaji-quest の取り込み。正確さより「だいたい」）
// ======================================================================
async function savePantry(mutator, label) {
  const res = await gh.mutateFile('pantry.json', text => {
    let d = {}; try { d = text ? JSON.parse(text) : {}; } catch { d = {}; }
    d = normalizePantry(d); mutator(d); d.updated = isoNow(); return JSON.stringify(d, null, 1) + '\n';
  }, gh.msg(`pantry: ${label}`));
  state.pantry = { sha: res.sha, data: normalizePantry(JSON.parse(res.text)) };
}
// 買い足すといい食材（Generator に在庫・器具・家族・旬から出してもらう）
const PRIO_JA = { main: '今週の主菜に', new: '新しいレシピに（一覧に無い料理）', stock: '常備すると楽', kid: '子ども向け', season: '旬' };
function suggestItems() { if (!requireToken()) return; startRequest({ id: newRequestId(), ts: isoNow(), type: 'suggest_items', note: '', status: 'pending', error: null, result: null }); }
function sgSelected(s) { return ((s.req.result || {}).items || []).filter((_, i) => s.checked[i]); }
function suggestHTML() {
  const s = state.suggest; const res = s && s.req && s.req.result; const items = res && Array.isArray(res.items) ? res.items : [];
  const btn = `<div class="actions left"><button type="button" class="ghost small" data-act="p-suggest">${ic('bulb')}買い足すといい物を聞く</button></div>`;
  if (!items.length) return btn;
  const order = ['main', 'new', 'kid', 'stock', 'season']; const groups = order.map(p => [p, items.map((it, i) => ({ it, i })).filter(x => (x.it.priority || 'main') === p)]).filter(g => g[1].length);
  return btn + `<h3 class="group">買い足すといい物 <span class="sub">${esc(jaShort((s.req.ts || '').slice(0, 10)))}</span><button type="button" class="ghost tiny" data-act="sg-clear" aria-label="消す">${ic('x')}</button></h3>
  ${res.note ? `<p class="sub">${esc(res.note)}</p>` : ''}
  ${groups.map(([p, rows]) => `<div class="band soon">${PRIO_JA[p] || p}</div>` + rows.map(({ it, i }) => `<label class="sg-row"><input type="checkbox" data-act="sg-chk" data-i="${i}"${s.checked[i] ? ' checked' : ''}><span class="nm">${esc(it.name)}${it.qty ? ` <span class="sub">${esc(it.qty)}</span>` : ''}</span><span class="why">${esc(it.reason || '')}${(it.enables || []).length ? `<br><span class="sub">→ ${it.priority === 'new' ? '新しい料理: ' : ''}${it.enables.map(esc).join(' / ')}</span>` : ''}</span></label>`).join('')).join('')}
  <div class="actions left">${kq().push_shopping ? `<button type="button" class="primary small" data-act="sg-push">${ic('cart')}買い物メモへ（kaji-quest）</button>` : ''}<button type="button" class="ghost small" data-act="sg-copy">コピー</button></div>`;
}
async function copyText(text) { try { await navigator.clipboard.writeText(text); toast('コピーした'); } catch { toast(text); } }

function renderPantry() {
  const d = state.pantry.data;
  const items = d.items.slice().sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')) || String(a.name).localeCompare(String(b.name)));
  const row = i => { return `<div class="pitem" data-id="${esc(i.id)}">
    <div class="nm">${esc(i.name)} <span class="badge">${LOC_JA[i.loc] || esc(i.loc || '')}</span>${i.src === 'kaji-quest' ? '<span class="badge ind">kaji</span>' : i.src === 'photo' ? '<span class="badge ind">📷</span>' : ''}</div>
    <div class="meta">${validDate(i.added) ? `${jaShort(i.added)} に追加` : ''}</div>
    <div class="ops"><button type="button" class="ghost tiny" data-act="p-gone" data-id="${esc(i.id)}">なくなった</button></div></div>`; };
  let html = head('fridge', '在庫', `${items.length} 品${d.updated ? ` ・ ${jaDateTime(d.updated)} 更新` : ''}${state.liveError ? ' ・ 読めていない' : ''}`) + `
  <div class="add-row"><input type="text" class="inp" id="p-add" placeholder="鶏もも肉、小松菜、卵" autocomplete="off" value="${esc(state.pAddDraft)}" aria-label="在庫を追加（「、」区切り）"><button type="button" class="primary" data-act="p-add">${ic('plus')}追加</button></div>
  <div class="actions left"><label class="ghost small photo-btn">${ic('camera')}冷蔵庫の写真<input type="file" accept="image/*" capture="environment" id="p-photo"></label><select id="p-hint" class="select" style="width:auto;min-height:44px" aria-label="どこの写真"><option value="fridge">冷蔵</option><option value="freezer">冷凍</option><option value="pantry">常温</option></select>${kq().import_shopping ? `<button type="button" class="ghost small" data-act="p-import">${ic('import')}kaji-quest の買い物を取り込む</button>` : ''}</div>
  <div id="p-status" class="status">${pendingHTML('pantry')}</div>`;
  html += items.map(row).join('');
  if (!items.length) html += `<p class="empty">${state.liveError ? `在庫を読めなかった: ${esc(state.liveError)}` : '在庫が空。上の欄に「、」区切りで入れる。'}</p>`;
  html += suggestHTML();
  html += '<h3 class="group">調味料・乾物（ある / ない）</h3>' + staplesHTML(d.staples);
  $('#pantry').innerHTML = html;
}
function staplesHTML(staples) {
  const names = Object.keys(staples || {}); if (!names.length) return '<p class="empty">まだ無い。「醤油、みりん」のように入れるとここに入る。</p>';
  const groups = new Map(); names.forEach(nm => { const m = master(nm); const cat = (m && m.cat) || 'その他'; if (!groups.has(cat)) groups.set(cat, []); groups.get(cat).push(nm); });
  const order = ['調味料', '乾物', '主食', '麺粉', '缶詰', '加工品']; const cats = [...groups.keys()].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  return cats.map(cat => `${cats.length > 1 ? `<h3 class="group">${esc(cat)}</h3>` : ''}<div class="staples">${groups.get(cat).map(nm => { const st = staples[nm]; return `<div class="staple is-${esc(st)}"><span class="nm">${esc(nm)}</span><span class="seg state">${[['ok', 'ある'], ['none', 'ない']].map(([v, ja]) => `<button type="button" data-act="p-staple" data-name="${esc(nm)}" data-v="${v}" class="${st === v ? 'is-on' : ''}" aria-pressed="${st === v}">${ja}</button>`).join('')}</span></div>`; }).join('')}</div>`).join('');
}
// 「鶏もも 300g」「卵 6個」「小松菜」→ name（数は読み飛ばす。在庫はあるかないかだけ）
function parsePantryToken(tok) {
  const s = String(tok || '').normalize('NFKC').trim(); if (!s) return null;
  const m = s.match(/^(.*?)\s*(\d+(?:\.\d+)?)\s*([^\d\s]{0,8})$/);
  if (m && m[1].trim()) return { name: m[1].trim(), qty: +m[2], unit: m[3] || null };
  return { name: s, qty: null, unit: null };
}
function newItem(name, added, src, loc) {
  const m = master(name); const nm = m ? m.name : name;
  return { id: 'p' + uid(5), name: nm, loc: loc || (m && m.loc) || 'fridge', added, src };
}
// 同じ名前が既にあれば 1 つにまとめる（追加日と場所だけ更新）
function mergeItem(d, a) {
  const ex = d.items.find(i => sameName(i.name, a.name));
  if (!ex) { d.items.push(a); return; }
  ex.added = a.added; if (a.loc) ex.loc = a.loc;
}
async function pantryAdd(text) {
  const toks = String(text || '').split(/[、,，\n]+/).map(s => s.trim()).filter(Boolean); if (!toks.length) return; if (!requireToken()) return;
  const t = today(); const added = [], staples = [];
  toks.forEach(tok => { const p = parsePantryToken(tok); if (!p) return; const m = master(p.name); if (m && m.staple) staples.push(m.name); else added.push(newItem(p.name, t, 'manual')); });
  const ok = await run(() => savePantry(d => { added.forEach(a => mergeItem(d, a)); staples.forEach(nm => { d.staples[nm] = 'ok'; }); }, '追加'), `${added.length + staples.length} 品を入れた`);
  if (ok) { state.pAddDraft = ''; render(); }
}
async function pantryItemOp(id) {
  if (!requireToken()) return; const it = state.pantry.data.items.find(i => i.id === id); if (!it) return;
  const ok = await run(() => savePantry(d => { d.items = d.items.filter(i => i.id !== id); }, `${it.name} がなくなった`), `${it.name} を在庫から外した`);
  if (ok) render();
}
async function pantryStaple(name, v) {
  if (!requireToken()) return;
  const ok = await run(() => savePantry(d => { d.staples[name] = v; }, `${name}: ${v}`));
  if (ok) render();
}
// 冷蔵庫の写真 → inbox/<id>.jpg → pantry_photo の注文 → 差分を確認して反映
async function pantryPhoto(file) {
  if (!file || !requireToken()) return; const hint = ($('#p-hint') || {}).value || 'fridge';
  let bytes; try { bytes = await resizeImage(file); } catch (e) { toast(e.message, true); return; }
  const id = newRequestId(); const image = `inbox/${id}.jpg`;
  const req = { id, ts: isoNow(), type: 'pantry_photo', image, hint, status: 'pending', error: null, result: null };
  await startRequest(req, () => gh.putFile(image, bytes, gh.msg(`inbox ${id}`)));
}
function photoDiffRows(res) {
  const rows = [];
  (Array.isArray(res.items) ? res.items : []).forEach(it => { if (!it || !it.name) return; const m = master(it.name); const c = isNum(it.confidence) ? it.confidence : 0.5;
    if (m && m.staple) { rows.push({ kind: 'staple', name: m.name, state: 'ok', checked: c >= 0.6, sub: `調味料として「ある」に ・ 確度 ${Math.round(c * 100)}%` }); return; }
    rows.push({ kind: 'item', name: m ? m.name : String(it.name), loc: it.loc || (m && m.loc) || 'fridge', checked: c >= 0.6, src: 'photo', sub: `確度 ${Math.round(c * 100)}%${m ? '' : ' ・ マスタに無い名前'}` }); });
  (Array.isArray(res.staples) ? res.staples : []).forEach(s => { if (s && s.name) rows.push({ kind: 'staple', name: canonical(s.name), state: s.state === 'none' ? 'none' : 'ok', checked: true, sub: `調味料: ${s.state === 'none' ? 'ない' : 'ある'}` }); });
  return rows;
}
async function importKaji() {
  const r = kqRepo(); if (!r.owner) { toast('config の kaji_quest.repo が無い', true); return; }
  const t = today(); const yms = [...new Set([ymOf(t), ymOf(addDays(t, -31))])]; const lines = [];
  const ok = await run(async () => { for (const ym of yms) { const text = await gh.fetchRawText(`logs/${ym}.jsonl`, r); if (text) text.split('\n').forEach(l => { try { const e = JSON.parse(l); if (e && typeof e === 'object') lines.push(e); } catch { /* 壊れた行 */ } }); } });
  if (!ok) return;
  const done = new Set(state.pantry.data.imported_shop_ids);
  const shops = lines.filter(l => l.mode === 'shop' && l.id && !done.has(l.id) && Array.isArray(l.items));
  if (!shops.length) { toast('新しい買い物の記録は無い'); return; }
  const rows = [];
  shops.forEach(l => l.items.forEach(it => { if (typeof it !== 'string' || !it.trim()) return; const nm = (parsePantryToken(it) || {}).name || it.trim().normalize('NFKC'); const m = master(nm); const sub = `${jaShort(l.date)} の買い物${m ? '' : ' ・ マスタに無い（食材でなければ外す）'}`;   // 「鶏むね肉 300g」の数は読み飛ばす
    if (m && m.staple) rows.push({ kind: 'staple', name: m.name, state: 'ok', checked: true, sub });
    else rows.push({ kind: 'item', name: m ? m.name : nm, loc: (m && m.loc) || 'fridge', checked: !!m, src: 'kaji-quest', added: validDate(l.date) ? l.date : t, sub }); }));
  openDiff(rows, 'kaji', shops.map(l => l.id));
}
function openDiff(rows, kind, shopIds) {
  state.diff = { rows, kind, shopIds: shopIds || [] };
  $('#diff-title').textContent = kind === 'photo' ? '写真から読み取った物' : 'kaji-quest の買い物';
  $('#diff-help').textContent = kind === 'photo' ? '確度が低い物はチェックを外してある。合っている物だけ反映する。' : 'まだ取り込んでいない買い物。食材でない物は外す。';
  $('#diff-list').innerHTML = rows.length ? rows.map((r, i) => `<li><input type="checkbox" data-act="diff-chk" data-i="${i}"${r.checked ? ' checked' : ''} id="df${i}"><label for="df${i}" class="nm">${esc(r.name)}<small>${esc(r.sub || '')}</small></label>${r.kind === 'staple' ? '<span class="badge">調味料</span>' : `<span class="badge">${LOC_JA[r.loc] || ''}</span>`}</li>`).join('') : '<li class="empty">何も読み取れなかった</li>';
  const dlg = $('#dlg-diff'); if (!dlg.open) dlg.showModal();
}
async function applyDiff() {
  const d = state.diff; if (!d) return; $('#dlg-diff').close(); if (!requireToken()) return;
  const sel = d.rows.filter(r => r.checked); const t = today();
  const ok = await run(() => savePantry(data => {
    sel.forEach(r => { if (r.kind === 'staple') { data.staples[r.name] = r.state || 'ok'; return; } mergeItem(data, newItem(r.name, r.added || t, r.src, r.loc)); });
    if (d.shopIds.length) data.imported_shop_ids = [...new Set([...data.imported_shop_ids, ...d.shopIds])];
  }, d.kind === 'photo' ? '写真から反映' : 'kaji-quest から取り込み'), `${sel.length} 品を反映した`);
  if (ok) { state.diff = null; render(); }
}

// ======================================================================
// 道具（equipment.yml の表示だけ。直すのはファイル）
// ======================================================================
function renderEquipment() {
  const e = state.equipment || {}; const li = (b, s, note) => `<div class="eq-row"><b>${b}</b>${s ? `<span class="sub">${s}</span>` : ''}${note ? `<span class="note">${esc(note)}</span>` : ''}</div>`;
  let h = head('tools', '道具', `${(e.heat || []).length} 口 ・ 無い物 ${(e.missing || []).length}`);
  h += '<h3 class="group">コンロ</h3><div class="eq">' + (e.heat || []).map(x => li(esc(x.label || x.id), `${esc(x.type || '')}${x.levels ? ` ・ 目盛り ${esc(x.levels)}` : ''}`, x.note)).join('') + '</div>';
  h += '<h3 class="group">家電</h3><div class="eq">' + (e.appliances || []).map(x => li(esc(equipLabel(x.id)), [x.watts ? `${x.watts}W` : '', x.capacity_go ? `${x.capacity_go} 合` : '', x.normal_minutes ? `通常 ${x.normal_minutes} 分 / 早炊き ${x.fast_minutes} 分` : '', x.liters ? `${x.liters}L` : ''].filter(Boolean).join(' ・ '), x.note)).join('') + '</div>';
  h += '<h3 class="group">鍋・フライパン・ボウル</h3><div class="eq">' + (e.cookware || []).map(x => li(esc(equipLabel(x.id)), [x.liters ? `${x.liters}L` : '', x.lid === true ? 'ふた有' : x.lid === false ? 'ふた無' : '', x.material === 'fluoro' ? 'フッ素加工' : esc(x.material || ''), x.dishwasher === true ? '食洗機可' : x.dishwasher === false ? '食洗機不可' : ''].filter(Boolean).join(' ・ '), x.note)).join('') + '</div>';
  if ((e.tools || []).length) h += `<h3 class="group">道具</h3><div class="tags">${e.tools.map(x => `<span>${esc(x)}</span>`).join('')}</div>`;
  if ((e.storage || []).length) h += `<h3 class="group">保存</h3><div class="tags">${e.storage.map(x => `<span>${esc(x)}</span>`).join('')}</div>`;
  if ((e.missing || []).length) h += `<h3 class="group">無い物（レシピから除外）</h3><div class="tags">${e.missing.map(x => `<span class="eq">${esc(x)}</span>`).join('')}</div>`;
  const p = e.preferences || {}; const prefs = [p.avoid_deep_fry ? '揚げ物は出さない' : '', p.max_pans_at_once ? `同時に使う鍋は ${p.max_pans_at_once} つまで` : ''].filter(Boolean);
  if (prefs.length) h += `<p class="note">${prefs.join(' ・ ')}</p>`;
  $('#equipment').innerHTML = h;
}

// ======================================================================
// 図鑑（写真がある料理のグリッド。写真が無い物は絵）
// ======================================================================
function renderZukan() {
  const withPhoto = [], without = [];
  state.recipes.forEach(r => { if (r.status === 'retired' && !logsOf(r.id).length) return; const p = photoOf(r); (p ? withPhoto : without).push({ r, p, st: statsOf(r) }); });
  const sort = state.zukanSort;
  const cmp = { new: (a, b) => String(b.st.last || b.r.created || '').localeCompare(String(a.st.last || a.r.created || '')), f: (a, b) => (b.st.f_avg ?? -1) - (a.st.f_avg ?? -1) || String(b.st.last || '').localeCompare(String(a.st.last || '')), r: (a, b) => (b.st.r_avg ?? -1) - (a.st.r_avg ?? -1) || String(b.st.last || '').localeCompare(String(a.st.last || '')) }[sort] || (() => 0);
  withPhoto.sort(cmp); without.sort((a, b) => String(b.r.created || '').localeCompare(String(a.r.created || '')));
  const tile = ({ r, p, st }) => `<button type="button" class="zk" data-act="open-recipe" data-id="${esc(r.id)}">${p ? `<img src="${esc(gh.rawUrl(p))}" alt="" loading="lazy">` : `<span class="zph">${ic('bowl')}</span>`}<span class="nm">${esc(r.title)}<small>${st.last ? jaShort(st.last) : '未調理'}${st.f_avg != null ? ` ・ F ${st.f_avg}` : ''}${st.r_avg != null ? ` ・ R ${st.r_avg}` : ''}</small></span>${r.status === 'standard' ? `<span class="st">${ic('star')}定番</span>` : ''}</button>`;
  let h = head('image', '図鑑', `写真 ${withPhoto.length} 枚 ・ ${state.recipes.length} 本`);
  h += `<div class="chips">${[['new', '新しい順'], ['f', 'F 順'], ['r', 'R 順']].map(([k, ja]) => chip('zk-sort', k, ja, sort === k)).join('')}</div>`;
  h += withPhoto.length ? `<div class="zukan-grid" style="margin-top:12px">${withPhoto.map(tile).join('')}</div>` : '<p class="empty">まだ写真が無い。作って記録すると、ここに並ぶ。</p>';
  if (without.length) h += `<h3 class="group">まだ写真がない</h3><div class="zukan-grid">${without.map(tile).join('')}</div>`;
  $('#zukan').innerHTML = h;
}

// ======================================================================
// レシピ一覧（状態のタブ・検索・統計・改訂の差分）
// 一覧の元は Pages を組み立てたときの recipes.json（recipes/*.md）。Generator のコミットは [skip ci] なので、
// 「一覧に追加」「削除」はこの端末では即座に反映し（localStorage の上書き）、リポジトリには [skip ci] 無しで
// コミットして build-pages を走らせる。組み立てが終わって recipes.json に反映されたら上書きは消える
// ======================================================================
const inList = id => state.recipes.some(r => r.id === id);
function listOv() { const o = lsGet(LS.listOv) || {}; return { add: o.add && typeof o.add === 'object' ? o.add : {}, del: Array.isArray(o.del) ? o.del : [], cooked: Array.isArray(o.cooked) ? o.cooked : [] }; }
function saveListOv(ov) { if (Object.keys(ov.add).length || ov.del.length || ov.cooked.length) lsSet(LS.listOv, ov); else lsDel(LS.listOv); }
function mergeListOverlay() {
  const base = state.recipesBase; const ov = listOv();
  Object.keys(ov.add).forEach(id => { if (base.some(r => r.id === id) || !ov.add[id] || !ov.add[id].id) delete ov.add[id]; });
  ov.del = ov.del.filter(id => base.some(r => r.id === id));
  ov.cooked = ov.cooked.filter(id => base.some(r => r.id === id && r.status === 'draft'));   // 夜の学習が status を変えたら要らない
  saveListOv(ov);
  state.recipes = [...Object.values(ov.add), ...base.filter(r => !ov.del.includes(r.id)).map(r => ov.cooked.includes(r.id) ? { ...r, status: 'tried' } : r)]
    .sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')) || String(b.id).localeCompare(String(a.id)));
  masterIdx = null;
}
// front matter（--- で囲まれた部分）だけを書き換える。無ければ null
function withFrontMatter(text, fn) { const m = /^---\n([\s\S]*?)\n---\n?/.exec(text || ''); if (!m) return null; return `---\n${fn(m[1])}\n---\n` + text.slice(m[0].length); }
// recipes/<id>.md が無いとき（別の端末で消した後など）に、端末にあるレシピから作り直す。front matter は JSON（YAML として読める）
function recipeMarkdown(r) {
  const meta = { ...r }; delete meta.memo;
  const ing = (r.ingredients || []).map(i => `- ${i.name}${qtyText(i) ? ` ${qtyText(i)}` : ''}${i.for ? `（${i.for}）` : ''}`).join('\n');
  const steps = (r.steps || []).map(s => `${s.n}. **${s.title}**（${s.minutes} 分）${s.text ? ` ${s.text}` : ''}${s.cue ? ` 目安: ${s.cue}` : ''}`).join('\n');
  return `---\n${JSON.stringify(meta, null, 1)}\n---\n\n# ${r.title}\n\n${r.image_text ? `（絵）${r.image_text}\n\n` : ''}## 材料\n\n${ing}\n\n## 手順\n\n${steps}\n\n（ページの「一覧に追加」で作り直した版。段取り表などは front matter にある）\n`;
}
// 一覧に入れる: 端末の上書きに足し（status を渡せばその状態で）、リポジトリの recipes/<id>.md に listed: を刻む（[skip ci] 無し → 組み立てが走る）
async function listAddRecipe(r, { status, message, okMsg } = {}) {
  if (!r || !r.id) return false;
  const rr = status ? { ...r, status } : r;
  const ov = listOv(); ov.add[r.id] = rr; ov.del = ov.del.filter(id => id !== r.id); saveListOv(ov); mergeListOverlay(); render();
  if (!gh.hasToken()) { toast('この端末の一覧に入れた。⚙ でトークンを保存すると、リポジトリの一覧にも載る'); return true; }
  return run(() => stampRecipe(rr, { status, listed: true, message: message || `一覧に追加: ${r.title}` }), okMsg === undefined ? '一覧に追加した。1〜2 分でほかの端末にも載る' : okMsg);
}
// recipes/<id>.md の front matter を書き換える: listed:（一覧に載せた印）と status。ファイルが無ければ端末のレシピから作り直す
async function stampRecipe(r, { status, listed, message, memo } = {}) {
  const stamp = `listed: "${isoNow()}"`;
  const fix = fm => { let lines = fm.split('\n'); if (listed) lines = [stamp, ...lines.filter(l => !/^listed:/.test(l))]; if (status) lines = lines.map(l => /^status:/.test(l) ? `status: ${status}` : l); return lines.join('\n'); };
  return gh.mutateFile(`recipes/${r.id}.md`, text => { const t = text === null ? (listed ? recipeMarkdown(r) : null) : withFrontMatter(text, fix); return t === null ? null : memo ? withMemo(t, memo) : t; }, message);
}
async function listAdd() {
  const c = state.current; const r = c && c.recipe; if (!r || !r.id) { toast('追加するレシピが無い', true); return; }
  if (inList(r.id)) { toast('もう一覧にある'); return; }
  const ok = await listAddRecipe(r, { okMsg: '' });
  if (ok === false) return;
  // レシピカードからは消す。見るときは一覧から開く
  setCurrent(null, null); render(); goTo('list'); toast(gh.hasToken() ? '一覧に入れた。見るときは一覧から開く（1〜2 分でほかの端末にも載る）' : '一覧に入れた。見るときは一覧から開く');
}
// 作った（調理モードの「できた！」か記録）: 一覧に無ければ「作った」として入れ、あれば「作った」に
function markCookedLocal(r) {
  if (!r || !r.id) return;
  const ov = listOv();
  if (!state.recipesBase.some(x => x.id === r.id)) { ov.add[r.id] = { ...(ov.add[r.id] || r), status: 'tried' }; ov.del = ov.del.filter(id => id !== r.id); }
  else if (!ov.cooked.includes(r.id)) ov.cooked.push(r.id);
  saveListOv(ov); mergeListOverlay();
}
// レシピを削除（recipes/<id>.md を消す）。一覧にある物も、届いたばかりで一覧に無い物も消せる。作った記録と写真は残る。
// 一覧（同梱か、この端末で追加した物）にある物は [skip ci] 無しでコミットして一覧を組み直す。一覧に無い物は組み直さない（[skip ci]）
// 一緒に作るレシピ（together）があれば、それも消すか聞く。消した本命の別案はレシピカードに残る（別の案を選べる）
async function deleteRecipe(id) {
  const r = recipeById(id); if (!r) { toast('そのレシピが見つからない', true); return; }
  if (!requireToken()) return;
  const n = logsOf(id).length;
  if (!confirm(`「${r.title}」を削除する？${n ? `\n作った記録 ${n} 件と写真は残る。` : ''}`)) return;
  const mates = togetherIds(r, requestOf(id)).map(recipeById).filter(Boolean);
  const withMates = mates.length > 0 && confirm(`一緒に作る「${mates.map(x => x.title).join('」「')}」も削除する？\n（キャンセルなら「${r.title}」だけ削除）`);
  const targets = [r, ...(withMates ? mates : [])];
  const ov0 = listOv(); const listed = x => state.recipesBase.some(b => b.id === x.id) || !!ov0.add[x.id];
  const gone = [];
  const ok = await run(async () => {
    for (const x of targets) {
      const path = `recipes/${x.id}.md`; const f = await gh.getFile(path);
      if (f.sha) await gh.deleteFile(path, listed(x) ? `レシピを削除: ${x.title}` : gh.msg(`レシピを削除: ${x.title}`), f.sha);
      gone.push(x.id);
    }
  }, targets.length > 1 ? `${targets.length} 品を削除した` : '削除した');
  if (!gone.length) return;   // 途中で失敗しても、消せた物は端末からも外す
  const ov = listOv(); gone.forEach(g => { delete ov.add[g]; if (state.recipesBase.some(b => b.id === g) && !ov.del.includes(g)) ov.del.push(g); state.cookPick.delete(g); }); saveListOv(ov);
  forgetRecipes(gone); mergeListOverlay(); render();
  if (ok && state.current && !currentRecipe() && state.current.request) toast('削除した。別案から選び直せる');
}
// そのレシピが入っている注文（レシピカードのか、届いたレシピの）
function requestOf(id) {
  const cur = state.current && state.current.request;
  if (cur && requestRecipes(cur).some(x => x.id === id)) return cur;
  return state.inbox.find(req => requestRecipes(req).some(x => x.id === id)) || null;
}
// 候補だけの結果（候補 3 つ・本命を消したあとの別案・時間に収まらなかった近い案）を削除する。
// レシピのファイルは無いので、この端末の「届いたレシピ」とレシピカードから外すだけ（requests/ の注文は履歴として残る）
function deleteCandidates() {
  const req = state.current && state.current.request; if (!req) return;
  const n = ((req.result || {}).alternatives || []).length;
  if (!confirm(`${n ? `候補 ${n} つ` : 'この結果'}を削除する？`)) return;
  inboxDrop(req.id); setCurrent(null, null); renderRecipe(); decorateCards(); toast('候補を削除した');
}
// 消したレシピを、注文の結果（レシピカード・届いたレシピ）から外す。本命が消えたら残った副菜を本命の位置に、全部消えたら別案だけ残す
function forgetRecipes(ids) {
  const strip = req => {
    if (!req || !req.result) return req; const all = requestRecipes(req); if (!all.some(x => ids.includes(x.id))) return req;
    const rest = all.filter(x => !ids.includes(x.id));
    return { ...req, result: { ...req.result, recipe: rest[0] || null, recipe_id: rest[0] ? rest[0].id : null, side_recipes: rest.slice(1) } };
  };
  const alive = req => { const res = req && req.result; return !!res && (!!res.recipe || (Array.isArray(res.alternatives) && res.alternatives.length > 0)); };
  state.inbox = state.inbox.map(strip).filter(alive); saveInbox();
  const c = state.current; if (!c) return;
  const req2 = c.request ? strip(c.request) : null; const curId = c.recipe && c.recipe.id;
  if (curId && !ids.includes(curId) && !c.request) return;   // 一覧から開いた別のレシピ
  if (req2 && !alive(req2)) { setCurrent(null, null); return; }
  if (curId && ids.includes(curId)) { if (req2) setCurrent(req2.result.recipe, req2); else setCurrent(null, null); return; }
  if (req2) { setCurrent(c.recipe, req2); if (c.recipe) lsSet(LS.current, { request: req2, open: c.recipe.id }); }
}
function renderList() {
  const counts = {}; state.recipes.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
  const tabs = [['all', '全部'], ['standard', '定番'], ['tried', '作った'], ['draft', '下書き'], ['retired', '封印']];
  $('#list').innerHTML = head('list', 'レシピ一覧', `${state.recipes.length} 本${Object.keys(listOv().add).length || listOv().del.length ? ' ・ 組み立て待ちの変更あり' : ''}`) + `<div class="chips">${tabs.map(([k, ja]) => chip('list-tab', k, `${ja}${k === 'all' ? '' : counts[k] ? ` <span class="sub">${counts[k]}</span>` : ''}`, state.listTab === k)).join('')}</div>
  ${state.cookPick.size ? `<div class="pickbar"><span class="sub">${state.cookPick.size} 品を選択中</span><button type="button" class="primary small" data-act="cook-picked">${ic('timer')}まとめて調理</button><button type="button" class="ghost tiny" data-act="cook-pick-clear">解除</button></div>` : ''}
  <div class="field"><input type="text" class="inp" id="list-q" placeholder="料理名・タグ・材料で絞る" value="${esc(state.listQ)}" autocomplete="off"></div><div id="list-rows">${listRowsHTML()}</div>`;
}
function listRowsHTML() {
  const tab = state.listTab; const q = normName(state.listQ);
  const rows = state.recipes.filter(r => tab === 'all' ? r.status !== 'retired' : r.status === tab).filter(r => matchRecipe(r, q));
  if (!rows.length) return `<p class="empty">${state.recipes.length ? '該当なし' : 'レシピがまだ無い。「今夜」で考えてもらう。'}</p>`;
  // 今の在庫で作れる物と、足りない物がある物に分ける（在庫が変わるたびに描き直す）
  const can = rows.filter(r => !missingFor(r).length), cannot = rows.filter(r => missingFor(r).length);
  const sec = (title, list, empty) => `<h3 class="group">${title} <span class="sub">${list.length}</span></h3>` + (list.length ? list.map(row).join('') : `<p class="empty">${empty}</p>`);
  function row(r) { const st = statsOf(r); const sup = r.supersedes ? recipeById(r.supersedes) : null; const open = state.showDiffOf.has(r.id); const ch = Array.isArray(r.changes) ? r.changes : []; const miss = missingFor(r);
    return `<div class="lrow${miss.length ? ' is-short' : ''}"><div class="t">${esc(r.title)} ${statusBadge(r.status)}${r.version > 1 ? ` <span class="badge ind">v${r.version}</span>` : ''}</div>
    <div class="meta">${miss.length ? `<span class="miss">足りない: ${miss.map(esc).join('・')}</span> ・ ` : ''}${esc(String(r.created || ''))}${r.time ? ` ・ ${r.time.planned} 分` : ''}${st.cooked ? ` ・ 作った ${st.cooked} 回 ・ R ${st.r_avg ?? '—'} ・ F ${st.f_avg ?? '—'} ・ 最後 ${jaShort(st.last) || '—'}` : ' ・ まだ作っていない'}${sup ? ` ・ 改訂元: ${esc(sup.title)}` : r.supersedes ? ` ・ 改訂元: ${esc(r.supersedes)}` : ''}</div>
    <div class="ops"><button type="button" class="ghost small" data-act="open-recipe" data-id="${esc(r.id)}">開く</button><button type="button" class="tiny-btn${state.cookPick.has(r.id) ? ' is-on' : ''}" data-act="cook-pick" data-id="${esc(r.id)}" aria-pressed="${state.cookPick.has(r.id)}">${state.cookPick.has(r.id) ? '選択中' : '＋まとめて'}</button>${r.supersedes && ch.length ? `<button type="button" class="ghost small" data-act="list-diff" data-id="${esc(r.id)}" aria-expanded="${open}">差分</button>` : ''}<button type="button" class="ghost small danger" data-act="list-del" data-id="${esc(r.id)}" aria-label="${esc(r.title)} を削除">${ic('trash')}削除</button></div>
    ${open ? `<div class="diffbox"><b>v${r.version} で変えた点${sup ? `（元: ${esc(sup.title)} v${sup.version || 1}）` : ''}</b><ul class="changes">${ch.map(c => `<li>${esc(c.what)}<br><small>${esc(c.why)}</small></li>`).join('')}</ul></div>` : ''}</div>`; }
  return sec('今の在庫で作れる', can, '無し。在庫を足すか、「今夜」で在庫に合う物を考えてもらう') + sec('足りない物がある', cannot, '無し');
}

// ======================================================================
// 今週（ページを開くたびにログから計算。冪等）
// ======================================================================
const median = arr => { if (!arr.length) return null; const s = arr.slice().sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
function barsSVG(weeks, key, max) {
  return `<svg class="bars ${key}" viewBox="0 0 300 72" aria-hidden="true">${weeks.map((wk, i) => { const v = wk[key]; const h = v == null ? 2 : Math.max(2, (v / max) * 56); const x = i * 25 + 3;
    return `<rect class="${v == null ? 'none' : ''}${i === weeks.length - 1 ? ' cur' : ''}" x="${x}" y="${60 - h}" width="19" height="${h}" rx="3"/>${v != null ? `<text x="${x + 9.5}" y="${Math.max(8, 60 - h - 3)}" text-anchor="middle">${key === 'f' ? v.toFixed(1) : Math.round(v)}</text>` : ''}<text x="${x + 9.5}" y="70" text-anchor="middle">${jaShort(wk.a)}</text>`; }).join('')}</svg>`;
}
function renderWeek() {
  const logs = allLogs(); const t = today(); const mon = mondayOf(t); const sun = addDays(mon, 6);
  const wk = logs.filter(e => e.date >= mon && e.date <= sun);
  const fAvg = avg(wk.map(e => e.f_score).filter(isNum)), rAvg = avg(wk.map(e => e.r_score).filter(isNum));
  const errMed = median(wk.filter(e => isNum(e.planned_minutes) && e.planned_minutes > 0 && isNum(e.actual_minutes)).map(e => Math.abs(e.actual_minutes - e.planned_minutes) / e.planned_minutes));
  const weeks = []; for (let i = 11; i >= 0; i--) { const a = addDays(mon, -7 * i), b = addDays(a, 6); const es = logs.filter(e => e.date >= a && e.date <= b); weeks.push({ a, n: es.length, f: avg(es.map(e => e.f_score).filter(isNum)), r: avg(es.map(e => e.r_score).filter(isNum)) }); }
  const later = logs.filter(e => e.ratings && (e.ratings.partner == null || e.ratings.kid == null) && validDate(e.date) && daysBetween(e.date, t) <= 30).sort((a, b) => logKey(b).localeCompare(logKey(a)));
  const noPhoto = logs.filter(e => !e.photo && e.id && validDate(e.date) && daysBetween(e.date, t) <= 30).sort((a, b) => logKey(b).localeCompare(logKey(a)));
  const L = state.learned || {}; const budget = +((cfg().generation || {}).budget_usd_per_month) || 0; const digest = state.digests[0];
  const named = ids => (ids || []).map(id => { const r = recipeById(id); return r ? `<button type="button" class="ghost tiny" data-act="open-recipe" data-id="${esc(id)}">${esc(r.title)}</button>` : esc(id); }).join('、');
  let h = head('chart', '今週', `${jaShort(mon)}〜${jaShort(sun)}${state.liveError ? ' ・ 記録を読めていない' : ''}`) + `
  <div class="stats"><div class="stat"><b>${wk.length}</b><span>作った</span></div><div class="stat"><b>${fAvg != null ? fAvg.toFixed(1) : '—'}</b><span>F 平均</span></div><div class="stat"><b>${rAvg != null ? Math.round(rAvg) : '—'}</b><span>R 平均</span></div><div class="stat"><b>${errMed != null ? Math.round(errMed * 100) + '%' : '—'}</b><span>時間誤差</span></div></div>
  <h3 class="group">12 週の推移</h3><div class="bars-lb"><span>F（家族の評価 1〜5）</span><span>${weeks.reduce((s, w) => s + w.n, 0)} 回</span></div>${barsSVG(weeks, 'f', 5)}<div class="bars-lb"><span>R（再現性 0〜100）</span></div>${barsSVG(weeks, 'r', 100)}
  <h3 class="group">聞いてない評価 ${later.length} 件</h3>${later.length ? later.map(e => { const r = recipeById(e.recipe_id); const ed = state.laterEdit && state.laterEdit.id === e.id ? state.laterEdit.field : null; const need = [e.ratings.partner == null ? 'partner' : null, e.ratings.kid == null ? 'kid' : null].filter(Boolean);
    const ctl = ed === 'partner' ? stars('later-star', 0, `data-log="${esc(e.id)}" data-date="${esc(e.date)}"`)
      : ed === 'kid' ? `<span class="seg">${['all', 'half', 'little', 'none', 'absent'].map(k => `<button type="button" class="tiny-btn" data-act="later-kid" data-log="${esc(e.id)}" data-date="${esc(e.date)}" data-v="${k}">${KID_JA[k]}</button>`).join('')}</span>`
      : need.map(f => `<button type="button" class="ghost small" data-act="later-edit" data-id="${esc(e.id)}" data-field="${f}">${f === 'partner' ? 'パートナー' : '子ども'}の評価を入れる</button>`).join('');
    return `<div class="later"><div class="t">${logTitleHTML(e)}<small>${jaDate(e.date)}</small></div><div class="ops">${ctl}</div></div>`; }).join('') : '<p class="empty">無し</p>'}
  <h3 class="group">写真がない記録 ${noPhoto.length} 件</h3>${noPhoto.length ? `<p class="note">あとからでも足せる（30 日以内。古い物はレシピの「作ったときのメモ」から）</p>` + noPhoto.map(e => { const r = recipeById(e.recipe_id);
    return `<div class="later"><div class="t">${logTitleHTML(e)}<small>${jaDate(e.date)}</small></div><div class="ops">${latePhotoHTML(e, 'small')}</div></div>`; }).join('') : '<p class="empty">無し</p>'}
  <h3 class="group">今月</h3><div class="kv"><b>API 費用</b><span>${state.cost == null ? '—' : `$${state.cost.toFixed(2)}`}${budget ? ` ／ 上限 $${budget}` : ''}</span></div>`;
  if ((L.standards || []).length || (L.needs_revision || []).length || (L.retired || []).length) h += `<h3 class="group">学習の結果${L.updated ? ` <span class="sub">${esc(String(L.updated))}</span>` : ''}</h3><div class="kv">${(L.standards || []).length ? `<b>定番</b><span>${named(L.standards)}</span>` : ''}${(L.needs_revision || []).length ? `<b>改訂待ち</b><span>${named(L.needs_revision)}</span>` : ''}${(L.retired || []).length ? `<b>封印</b><span>${named(L.retired)}</span>` : ''}</div>`;
  if (digest) { const props = digest.meta && (digest.meta.proposals || digest.meta.next_week || digest.meta.suggestions);
    h += `<h3 class="group">週次ダイジェスト ${esc(String(digest.week || ''))}</h3>${Array.isArray(props) && props.length ? `<p class="note">来週の提案</p><ul class="memo">${props.map(p => `<li>${esc(typeof p === 'string' ? p : (p.title || JSON.stringify(p)))}${p && p.why ? `<span class="sub"> ・ ${esc(p.why)}</span>` : ''}</li>`).join('')}</ul>` : ''}<div class="digest">${digest.html || ''}</div>`; }
  else h += '<p class="note">週次ダイジェストはまだ無い（日曜の夜に生成される）。</p>';
  $('#week').innerHTML = h;
  const pill = $('#hero-pill'); if (pill) pill.innerHTML = `${ic('flame')}<b>${wk.length}</b><span>回<span class="vh">今週作った</span></span>`;
}
// あとから評価を足す（パートナーの ★、子どもの食べ具合）。ログの行を書き換えて F を出し直す
async function setLaterRating(id, date, field, v) {
  if (!requireToken()) return;
  const ok = await run(() => rewriteLog(id, date, e => { e.ratings = e.ratings || {}; e.ratings[field] = v; e.f_score = fScore(e.ratings); return e; }), field === 'kid' ? '子どもの評価を足した' : 'パートナーの評価を足した');
  if (ok) { state.laterEdit = null; render(); }
}
// 今月の API 費用: requests/ を一覧して result.cost_usd を足す（トークンがあるときだけ。無ければ「—」）
async function loadCost() {
  if (!gh.hasToken()) { state.cost = null; return; }
  try {
    const ym = today().slice(0, 7).replace('-', ''); const files = (await gh.listDir('requests')).filter(f => f.type === 'file' && String(f.name).startsWith(`req-${ym}`) && String(f.name).endsWith('.json')).slice(0, 60);
    const costs = await Promise.all(files.map(f => gh.getJson(f.path).then(j => (j.data && j.data.result && isNum(j.data.result.cost_usd)) ? j.data.result.cost_usd : 0).catch(() => 0)));
    state.cost = costs.reduce((a, b) => a + b, 0);
  } catch (e) { console.warn(e); state.cost = null; }
  if (state.loaded) renderWeek();
}

// ======================================================================
// 検索・設定・描画・イベント・起動
// ======================================================================
function renderSearch() {
  const q = normName(state.q); const box = $('#search-results'); if (!q) { box.innerHTML = ''; return; }
  const hits = state.recipes.filter(r => matchRecipe(r, q)).slice(0, 20);
  box.innerHTML = hits.length ? hits.map(r => `<button type="button" class="sr" data-act="open-recipe" data-id="${esc(r.id)}">${ic('bowl')}<span>${esc(r.title)} ${statusBadge(r.status)}<br><small>${(r.tags || []).slice(0, 5).map(t => '#' + esc(t)).join(' ')}</small></span></button>`).join('') : '<p class="empty">該当なし</p>';
}
function openSettings() {
  $('#token').value = state.token; $('#settings-status').textContent = state.token ? '保存済み（この端末のみ）' : '未設定';
  $('#detail-default').value = ['full', 'compact'].includes(lsGetRaw(LS.detail)) ? lsGetRaw(LS.detail) : 'auto';
  const k = kq(); const on = v => v ? 'on' : 'off';
  $('#settings-kq').innerHTML = `<b>リポジトリ</b><span>${esc(k.repo || '—')}</span><b>買い物の取り込み</b><span>${on(k.import_shopping)}</span><b>買い物メモへ追加</b><span>${on(k.push_shopping)}</span><b>調理の記録を書く</b><span>${on(k.write_cook_log)}</span>`;
  const b = state.build || {}; const pv = b.prompt_versions || {};
  $('#settings-build').innerHTML = `<b>組み立て</b><span>${esc(jaDateTime(b.built_at) || '—')}</span><b>レシピ</b><span>${b.recipes ?? '—'} 本</span><b>プロンプト</b><span>${Object.keys(pv).map(n => `${esc(n)} v${pv[n]}`).join('、') || '—'}</span><b>コミット</b><span>${esc(String(b.sha || '').slice(0, 7) || '—')}</span><b>モデル</b><span>${esc((cfg().generation || {}).model || '—')}</span>`;
  $('#dlg-settings').showModal();
}
function render() {
  if (!state.loaded) return;
  readOrder(); renderOrder(); renderRecipe(); renderRecord(); renderPantry(); renderEquipment(); renderZukan(); renderList(); renderWeek(); renderSearch();
  decorateCards(); requestAnimationFrame(updateNav);
}
const sib = (b, on) => $$('.chip, button', b.parentElement).forEach(c => { if (c.dataset.act === b.dataset.act) c.classList.toggle('is-on', on(c)); });
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]'); if (!b || b.disabled) return; const act = b.dataset.act; const o = state.order;
  if (state.busy && !/^(collapse-toggle|rc-view|list-tab|list-diff|zk-sort|open-recipe|ck-|cook-close|cook-pick|cook-together|o-weekly-toggle)/.test(act)) { toast('処理中…'); return; }
  switch (act) {
    case 'collapse-toggle': setCollapsed(b.dataset.card, !isCollapsed(b.dataset.card)); break;
    // 今夜
    case 'o-budget': o.time_budget = +b.dataset.v; { const f = $('#o-free'); if (f) f.value = ''; } sib(b, c => c === b); break;
    case 'o-type': o.type = b.dataset.v; sib(b, c => c === b); break;
    case 'o-mode': o.mode = b.dataset.v; sib(b, c => c === b); break;
    case 'o-mood': { const v = b.dataset.v; o.mood = o.mood.includes(v) ? o.mood.filter(m => m !== v) : [...o.mood, v]; b.classList.toggle('is-on', o.mood.includes(v)); break; }
    case 'o-useup': { const v = b.dataset.v; if (state.useUpOn.has(v)) state.useUpOn.delete(v); else state.useUpOn.add(v); b.classList.toggle('is-on', state.useUpOn.has(v)); break; }
    case 'o-step': { const k = b.dataset.k; o.servings[k] = Math.max(0, Math.min(9, (+o.servings[k] || 0) + +b.dataset.d)); $(`#o-${k}`).textContent = o.servings[k]; break; }
    case 'o-submit': submitOrder(); break;
    case 'o-again': { const r = currentRecipe(); const cur = state.current && state.current.request; const alts = ((cur && cur.result && cur.result.alternatives) || []).map(a => a && a.title); submitOrder({ exclude: [...new Set([...(o.exclude || []), r ? r.title : '', ...alts].filter(Boolean))].slice(-8) }); break; }   // 退けた本命と別案は次に出さない
    case 'o-nearest': readOrder(); o.time_budget = +b.dataset.min || o.time_budget; o.note = `「${b.dataset.v}」で。${o.note}`.trim().slice(0, 200); renderOrder(); decorateCards(); submitOrder(); break;
    case 'o-detail': submitDetail(b.dataset.parent, b.dataset.alt); break;
    case 'o-weekly-toggle': readOrder(); state.showWeekly = !state.showWeekly; renderOrder(); decorateCards(); break;
    case 'o-weekly-submit': submitWeekly(); break;
    case 'weekly-clear': state.weekly = null; lsDel(LS.weekly); render(); break;
    case 'weekly-shop': pushShopping(((state.weekly && state.weekly.result && state.weekly.result.shopping) || []).map(s => s.name).filter(Boolean)); break;
    case 'pending-cancel': if (b.dataset.id) dropPending(b.dataset.id); else { state.pending = []; savePending(); } if (!state.pending.length) clearTimeout(pollTimer); toast('ページでは待つのをやめた（生成は続く。↻ で確認）'); break;
    case 'inbox-open': inboxOpen(b.dataset.v); break;
    case 'cand-del': deleteCandidates(); break;
    case 'error-clear': state.lastError = null; renderPending(); break;
    // レシピ
    case 'open-recipe': openRecipe(b.dataset.id); break;
    case 'rc-view': state.detailView = b.dataset.v; renderRecipe(); decorateCards(); break;
    case 'rc-later': { const r = currentRecipe(); const listed = r && inList(r.id); setCurrent(null, null); renderRecipe(); decorateCards(); toast(listed ? '閉じた。見るときは一覧から' : '閉じた。「届いたレシピ」からまた開ける'); break; }
    case 'rc-shop': { const r = currentRecipe(); if (r) pushShopping(missingFor(r)); break; }
    case 'cook-open': openCook(); break;
    case 'cook-close': closeCook(); break;
    case 'cook-reset': if (cook.recipes.length) { lsDel(cookKeyOf(cook.recipes)); openCook(cook.recipes, cook.request); toast('最初から'); } break;
    case 'cook-together': { const r = currentRecipe(); const req = state.current && state.current.request; if (!r) break; openCook([r, ...togetherIds(r, req).map(recipeById).filter(Boolean)], req); break; }
    case 'ck-offset': { const ri = +b.dataset.ri; cook.offsets[ri] = Math.max(0, (cook.offsets[ri] || 0) + +b.dataset.d); saveCook(); renderCook(); cookTick(); break; }
    case 'cook-pick': { const id = b.dataset.id; if (state.cookPick.has(id)) state.cookPick.delete(id); else state.cookPick.add(id); renderList(); decorateCards(); break; }
    case 'cook-picked': { const rs = [...state.cookPick].map(recipeById).filter(Boolean); if (!rs.length) break; state.cookPick.clear(); renderList(); decorateCards(); openCook(rs, null); break; }
    case 'cook-pick-clear': state.cookPick.clear(); renderList(); decorateCards(); break;
    case 'cook-finish': finishCook(); break;
    case 'ck-tl': { const k = b.dataset.key; cook.tl[k] = cook.tl[k] ? 0 : Date.now(); const on = !!cook.tl[k]; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); b.closest('.ck-tl').classList.toggle('is-done', on); saveCook(); break; }
    case 'ck-step': { const k = b.dataset.key; cook.done[k] = cook.done[k] ? 0 : Date.now(); const on = !!cook.done[k]; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); b.closest('.ck-step').classList.toggle('is-done', on); saveCook(); break; }
    case 'ck-timer': toggleTimer(b.dataset.key, +b.dataset.sec); break;
    // 記録
    case 'rec-open': { const r = recipeById(b.dataset.id) || currentRecipe(); if (r) { openRecord(r, { request: state.current && state.current.recipe && state.current.recipe.id === r.id ? state.current.request : null }); goTo('record'); } break; }
    case 'rec-start': { const r = recipeById(($('#rec-pick') || {}).value); if (r) openRecord(r, {}); break; }
    case 'rec-cancel': if (rec && rec.photo && rec.photo.url) URL.revokeObjectURL(rec.photo.url); rec = null; renderRecord(); decorateCards(); break;
    case 'rec-time': rec.actual = Math.max(1, rec.actual + +b.dataset.d); $('#rec-actual').textContent = rec.actual; break;
    case 'rec-fid': rec.fidelity = rec.fidelity === b.dataset.v ? null : b.dataset.v; sib(b, c => c.dataset.v === rec.fidelity); $('#rec-dev-row').hidden = !(rec.fidelity === 'minor' || rec.fidelity === 'major'); break;
    case 'rec-star': { const f = b.dataset.f, v = +b.dataset.v; rec[f] = rec[f] === v ? null : v; $$('.star', b.parentElement).forEach(s => s.classList.toggle('is-on', +s.dataset.v <= (rec[f] || 0))); if (f === 'partner' && rec[f]) { rec.partnerLater = false; const l = $('[data-act="rec-partner-later"]'); if (l) l.classList.remove('is-on'); } break; }
    case 'rec-partner-later': rec.partnerLater = !rec.partnerLater; b.classList.toggle('is-on', rec.partnerLater); if (rec.partnerLater) { rec.partner = null; $$('.star[data-f="partner"]').forEach(s => s.classList.remove('is-on')); } break;
    case 'rec-kid': rec.kid = rec.kid === b.dataset.v ? null : b.dataset.v; rec.kidLater = false; sib(b, c => c.dataset.v === rec.kid); { const l = $('[data-act="rec-kid-later"]'); if (l) l.classList.remove('is-on'); } break;
    case 'rec-kid-later': rec.kidLater = !rec.kidLater; b.classList.toggle('is-on', rec.kidLater); if (rec.kidLater) { rec.kid = null; $$('[data-act="rec-kid"]').forEach(c => c.classList.remove('is-on')); } break;
    case 'rec-photo-clear': if (rec.photo && rec.photo.url) URL.revokeObjectURL(rec.photo.url); rec.photo = null; syncRecordInputs(); renderRecord(); break;
    case 'rec-save': saveRecord(); break;
    case 'photo-retry': retryPhoto(); break;
    case 'photo-drop': lsDel(LS.photo); render(); toast('写真はあきらめた'); break;
    // 在庫
    case 'p-add': pantryAdd(($('#p-add') || {}).value); break;
    case 'p-import': importKaji(); break;
    case 'p-suggest': suggestItems(); break;
    case 'sg-chk': { const s = state.suggest; if (s) { s.checked[+el.dataset.i] = el.checked; lsSet(LS.suggest, s); } break; }
    case 'sg-push': { const s = state.suggest; if (s) pushShopping(sgSelected(s).map(i => i.qty ? `${i.name} ${i.qty}` : i.name)); break; }
    case 'sg-copy': { const s = state.suggest; if (s) copyText(sgSelected(s).map(i => i.qty ? `${i.name} ${i.qty}` : i.name).join('、')); break; }
    case 'sg-clear': state.suggest = null; lsDel(LS.suggest); render(); break;
    case 'p-gone': pantryItemOp(b.dataset.id); break;
    case 'p-staple': pantryStaple(b.dataset.name, b.dataset.v); break;
    case 'diff-cancel': $('#dlg-diff').close(); state.diff = null; break;
    case 'diff-apply': applyDiff(); break;
    // 図鑑・一覧・今週
    case 'zk-sort': state.zukanSort = b.dataset.v; lsSetRaw(LS.zukan, state.zukanSort); renderZukan(); decorateCards(); break;
    case 'list-tab': state.listTab = b.dataset.v; lsSetRaw(LS.tab, state.listTab); renderList(); decorateCards(); break;
    case 'list-add': listAdd(); break;
    case 'list-del': deleteRecipe(b.dataset.id); break;
    case 'list-diff': if (state.showDiffOf.has(b.dataset.id)) state.showDiffOf.delete(b.dataset.id); else state.showDiffOf.add(b.dataset.id); $('#list-rows').innerHTML = listRowsHTML(); break;
    case 'later-edit': state.laterEdit = { id: b.dataset.id, field: b.dataset.field || 'partner' }; renderWeek(); decorateCards(); break;
    case 'later-star': setLaterRating(b.dataset.log, b.dataset.date, 'partner', +b.dataset.v); break;
    case 'later-kid': setLaterRating(b.dataset.log, b.dataset.date, 'kid', b.dataset.v); break;
  }
});
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'rec-photo-cam' || t.id === 'rec-photo-lib') { setRecordPhoto(t.files && t.files[0]); t.value = ''; }
  else if (t.id === 'p-photo') { pantryPhoto(t.files && t.files[0]); t.value = ''; }
  else if (t.dataset.act === 'late-photo') { addPhotoLater(t.dataset.log, t.dataset.date, t.files && t.files[0]); t.value = ''; }
  else if (t.dataset.act === 'diff-chk' && state.diff) { const r = state.diff.rows[+t.dataset.i]; if (r) r.checked = t.checked; }
  else if (t.dataset.act === 'rec-pc-gone' && rec) { const p = rec.pantry[+t.dataset.i]; if (p) p.gone = t.checked; }
  else if (t.id === 'detail-default') { lsSetRaw(LS.detail, t.value === 'auto' ? '' : t.value); state.detailView = ''; renderRecipe(); decorateCards(); }
  else if (t.id === 'o-dishes') state.order.dishes = t.value;
});
document.addEventListener('input', ev => {
  const t = ev.target;
  if (t.id === 'o-free') { const v = parseInt(t.value, 10); if (v > 0) { state.order.time_budget = v; $$('#o-budget .chip[data-act="o-budget"]').forEach(c => c.classList.remove('is-on')); } }
  else if (t.id === 'o-note') state.order.note = t.value;
  else if (t.id === 'o-dish') { state.order.dish = t.value; const h = $('#o-dish-hint'); if (h) h.hidden = !t.value.trim(); }
  else if (t.id === 'rec-dev' || t.id === 'rec-learned') syncRecordInputs();
  else if (t.id === 'p-add') state.pAddDraft = t.value;
  else if (t.id === 'list-q') { state.listQ = t.value; $('#list-rows').innerHTML = listRowsHTML(); }
  else if (t.id === 'q') { state.q = t.value; renderSearch(); }
});
document.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter') return; const t = ev.target;
  if (t.id === 'p-add') { ev.preventDefault(); pantryAdd(t.value); }
  else if (ev.key === 'Enter' && t.id === 'o-free') { ev.preventDefault(); t.blur(); }
});
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !$('#cook').hidden) closeCook(); });
$('#btn-settings').addEventListener('click', openSettings);
$('#settings-close').addEventListener('click', () => $('#dlg-settings').close());
$('#settings-save').addEventListener('click', () => {
  state.token = $('#token').value.trim(); lsSetRaw(TOKEN_KEY, state.token); gh.configure({ token: state.token });
  $('#dlg-settings').close(); toast(state.token ? 'トークンを保存した' : 'トークンを消した'); reload();
});
$('#settings-test').addEventListener('click', async () => {
  const tok = $('#token').value.trim(); const st = $('#settings-status'); if (!tok) { st.textContent = 'トークンが空'; return; }
  st.textContent = '確認中…';
  try {
    const line = r => r.ok ? `OK: ${r.name} ・ 書き込み ${r.push ? '可' : '不可（Permissions の Contents を Read and write にする）'}` : `NG（${r.status}）: ${r.hint}`;
    const r = await gh.checkToken(tok); let text = line(r);
    const k = kqRepo(); if (k.owner && (kq().push_shopping || kq().write_cook_log)) { const r2 = await gh.checkToken(tok, k); text += `\nkaji-quest: ${line(r2)}`; }
    st.textContent = text;
  }
  catch (e) { st.textContent = 'NG: ' + e.message; }
});
$('#dlg-diff').addEventListener('close', () => { if (state.diff && !state.busy) { /* やめた → 次に取り込むとき、また出る */ } });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { renderSky(); checkUpdate(false); }
  if (document.visibilityState !== 'visible') return;
  if (!$('#cook').hidden) requestWake();
  if (state.pending.length) pollTick();
});

// ---- 上の見出し（台所の窓）: 時刻で空・日と月・灯り・鍋の湯気・あいさつが変わる ----
// 朝 5〜10、昼 10〜16、夕焼け 16〜19（空だけ）、夜 19〜5。火は 6〜21 時、灯りは 16〜6 時。日付と時刻だけで描けるのでデータを待たない
let skyTick = 0;
function renderSky() {
  const hero = $('#hero'); if (!hero) return;
  const now = nowParts(); const h = now.hour + now.minute / 60;
  const slot = h < 5 ? 'night' : h < 10 ? 'morning' : h < 16 ? 'noon' : h < 19 ? 'noon' : 'night';
  const sky = h >= 16 && h < 19 ? 'dusk' : slot;
  hero.dataset.slot = slot; hero.dataset.sky = sky;
  hero.dataset.stove = h >= 6 && h < 21 ? 'on' : 'off'; hero.dataset.lamp = h >= 16 || h < 6 ? 'on' : 'off';
  // 日は 5〜19 時、月は 19〜5 時に、出てから沈むまでを 0〜1 で進む。高さは弧（sin）
  const day = h >= 5 && h < 19; const f = day ? (h - 5) / 14 : ((h - 19 + 24) % 24) / 10;
  hero.style.setProperty('--fx', f.toFixed(3)); hero.style.setProperty('--fy', Math.sin(Math.PI * f).toFixed(3));
  // ブラウザの上の帯も空の色に合わせる（明るい側・暗い側）
  const TOP = { morning: ['#fde8b4', '#3e2a2e'], noon: ['#cdeee7', '#1e3a44'], dusk: ['#f3b2ab', '#4a2238'], night: ['#2a1a3e', '#0d0718'] };
  document.querySelectorAll('meta[name="theme-color"]').forEach((el, i) => el.setAttribute('content', (TOP[sky] || TOP.noon)[i] || TOP.noon[0]));
  const G = { morning: ['今日は何を作る？', '朝のうちに決めておくと、夕方が楽。'], noon: ['今夜、何を作る？', '時間を選べば、家にある物で組み立てる。'], dusk: ['今夜、何を作る？', '時間を選べば、家にある物で組み立てる。作ったら記録を。'], night: ['おつかれさま', '作ったら記録を。明日の仕込みも、ここから。'] };
  const put = (sel, t) => { const el = $(sel); if (el && el.textContent !== t) el.textContent = t; };
  put('#greet', G[sky][0]); put('#greet-sub', G[sky][1]);
}

// ---- 起動 ----
async function loadLive() {
  state.liveError = '';
  const results = await Promise.allSettled([gh.getJson('pantry.json'), loadLogs()]);
  if (results[0].status === 'fulfilled') { const { sha, data } = results[0].value; state.pantry = { sha, data: normalizePantry(data || {}) }; }
  const err = results.find(r => r.status === 'rejected'); if (err) { state.liveError = err.reason && err.reason.message || String(err.reason); throw new Error(state.liveError); }
}
// 新しい組み立て（build.json の sha）が出ていたらページごと読み直す（ホーム画面のアプリは古い app.js を抱えやすい）
async function checkUpdate(force) {
  try {
    const res = await fetch('data/build.json?t=' + Date.now(), { cache: 'no-store' }); if (!res.ok) return false;
    const b = await res.json(); const cur = (state.build || {}).sha || '';
    if (b.sha && cur && b.sha !== cur && (force || $('#cook').hidden)) { toast('新しい版に更新する'); setTimeout(() => location.reload(), 400); return true; }
  } catch { /* オフラインなど */ }
  return false;
}
async function reload() { if (await checkUpdate(true)) return; await run(loadLive); render(); loadCost(); }
async function init() {
  state.token = lsGetRaw(TOKEN_KEY);
  const get = (u, fb) => fetch(u, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(`${u} ${r.status}`); return r.json(); }).catch(e => { if (fb === undefined) throw e; console.warn(e); return fb; });
  try {
    const [config, equipment, family, learned, ingredients, recipes, knowledge, digests, build] = await Promise.all([get('data/config.json'), get('data/equipment.json', {}), get('data/family.json', {}), get('data/learned.json', {}), get('data/ingredients.json', []), get('data/recipes.json', []), get('data/knowledge.json', {}), get('data/digests.json', []), get('data/build.json', {})]);
    state.config = config || {}; state.equipment = equipment || {}; state.family = family || {}; state.learned = (learned && learned.learned) || {}; state.overrides = (learned && learned.overrides) || {};
    state.ingredients = Array.isArray(ingredients) ? ingredients : []; state.recipesBase = Array.isArray(recipes) ? recipes.filter(r => r && r.id) : []; mergeListOverlay();
    state.knowledge = { tips: Array.isArray(knowledge && knowledge.tips) ? knowledge.tips : [], basics: Array.isArray(knowledge && knowledge.basics) ? knowledge.basics : [], safety: (knowledge && knowledge.safety) || null };
    state.digests = Array.isArray(digests) ? digests : []; state.build = build || {};
  } catch (e) { $('#order').innerHTML = `<p class="empty">設定の読み込みに失敗: ${esc(e.message)}</p>`; return; }
  const rp = cfg().repo || {}; gh.configure({ owner: rp.owner || '', name: rp.name || '', branch: rp.branch || 'main', token: state.token });
  $('#repo-link').href = `https://github.com/${rp.owner}/${rp.name}`; $('#spec-link').href = `https://github.com/${rp.owner}/${rp.name}/blob/${rp.branch || 'main'}/docs/SPEC.md`; $('#kq-link').href = `https://${(kq().repo || '').split('/')[0]}.github.io/${(kq().repo || '').split('/')[1] || ''}/`;
  loadOrder(); state.zukanSort = lsGetRaw(LS.zukan) || 'new'; state.listTab = lsGetRaw(LS.tab) || 'all';
  renderSky(); clearInterval(skyTick); skyTick = setInterval(renderSky, 5 * 60 * 1000);
  // 前回のレシピ・週の献立・考え中の注文を端末から戻す
  const cur = lsGet(LS.current); if (cur && cur.request) { const rs = requestRecipes(cur.request); setCurrent(rs.find(r => r.id === cur.open) || rs[0] || null, cur.request); if (cur.open) lsSet(LS.current, { request: cur.request, open: cur.open }); } else if (cur && cur.recipe_id && recipeById(cur.recipe_id)) setCurrent(recipeById(cur.recipe_id), null);
  // 何も開いていなければレシピカードは空のまま（一覧から開く。前は最新のレシピを勝手に出していたので、一覧に入れた物が復活して見えた）
  if (cookedAlready(state.current)) setCurrent(null, null);   // 一覧から開いた「作った」レシピは、立ち上げ直したら消す
  // 端末に残ったレシピがリポジトリから消されていたら捨てる（recipes/<id>.md が 404）
  { const rid = state.current && state.current.recipe && state.current.recipe.id; if (rid && !inList(rid)) { try { if ((await gh.fetchRawText(`recipes/${rid}.md`)) === null) setCurrent(null, null); } catch { /* 読めないときは残す */ } } }
  const w = lsGet(LS.weekly); if (w && w.result) state.weekly = w;
  const sg = lsGet(LS.suggest); if (sg && sg.req && sg.req.result) state.suggest = sg;
  loadPending(); state.inbox = (lsGet(LS.inbox) || []).filter(x => x && x.id && x.result);
  initNav(['order', 'recipe', 'list', 'record', 'pantry', 'week', 'zukan', 'equipment'], { cook: () => openCook(), settings: openSettings, top: () => window.scrollTo({ top: 0 }) });
  state.loaded = true; render();
  await run(loadLive); render();
  // 作って記録まで済んだレシピがレシピカードに残っていたら消す（別の端末で記録した場合など。記録はいま読んだ）
  if (cookedAlready(state.current)) { setCurrent(null, null); render(); }
  if (state.pending.length) pollTick();
  loadCost();
}
$('#btn-reload').addEventListener('click', reload);
init();
