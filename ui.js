/* recipi — 画面の小道具（DOM・アイコン・知らせ・折りたたみ・上のチップ・端末保存）。kaji-quest と同じ作り */

export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ic = (name, cls = '') => `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
export const head = (icon, title, sub = '', after = '') => `<h2><span class="h-ic">${ic(icon)}</span><span class="h-t">${title}</span>${after}${sub ? `<span class="sub">${sub}</span>` : ''}</h2>`;
// 太字と改行だけの最小 Markdown（コツの本文など）
export const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
export const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

// ---- 端末保存（private mode などで失敗しても動く） ----
export function lsGet(key, fallback = null) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } }
export function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } }
export function lsDel(key) { try { localStorage.removeItem(key); } catch { /* 消せなくても動く */ } }
export function lsGetRaw(key) { try { return localStorage.getItem(key) || ''; } catch { return ''; } }
export function lsSetRaw(key, val) { try { if (val) localStorage.setItem(key, val); else localStorage.removeItem(key); } catch { /* private mode など */ } }
export function lsKeys(prefix) { try { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(prefix)) out.push(k); } return out; } catch { return []; } }

// ---- 知らせ ----
let toastTimer;
export function toast(msg, isErr) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.toggle('err', !!isErr); t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, isErr ? 6000 : 2800);
}
export function setBusy(on) { document.body.classList.toggle('busy', !!on); }

// ---- カードの折りたたみ（この端末に記憶） ----
const COLLAPSE_KEY = 'recipi.collapsed';
let collapsed = new Set(lsGet(COLLAPSE_KEY, []) || []);
export const isCollapsed = id => collapsed.has(id);
export function setCollapsed(id, on) {
  if (on) collapsed.add(id); else collapsed.delete(id);
  lsSet(COLLAPSE_KEY, [...collapsed]);
  const sec = document.getElementById(id); if (!sec) return;
  sec.classList.toggle('is-collapsed', on);
  const b = sec.querySelector(':scope > h2 > .collapse'); if (b) { b.setAttribute('aria-expanded', on ? 'false' : 'true'); b.setAttribute('aria-label', on ? '開く' : 'たたむ'); }
  updateNav();
}
// 各カードの見出しに折りたたみボタンを付け、記憶した状態を当てる（描画のたびに呼ぶ）
export function decorateCards() {
  document.querySelectorAll('#app .card').forEach(sec => {
    const h = sec.querySelector(':scope > h2'); if (!h) return;
    const on = collapsed.has(sec.id);
    if (!h.querySelector('.collapse')) h.insertAdjacentHTML('beforeend', `<button type="button" class="collapse" data-act="collapse-toggle" data-card="${esc(sec.id)}">${ic('chev-d')}</button>`);
    const b = h.querySelector('.collapse'); b.setAttribute('aria-expanded', on ? 'false' : 'true'); b.setAttribute('aria-label', on ? '開く' : 'たたむ');
    sec.classList.toggle('is-collapsed', on);
  });
}

// ---- ページ内ナビ（上に固定のチップ）。押すと見出しへ飛ぶ。スクロールすると今見ている見出しのチップが光る ----
let navIds = [], navActive = null, navJump = null, navSettleTimer = 0, navHooks = {};
const visible = el => !!el && el.offsetParent !== null;
function showChip(chip, smooth) {
  const strip = chip && chip.parentElement; if (!strip || strip.scrollWidth <= strip.clientWidth + 1) return;
  const sr = strip.getBoundingClientRect(), cr = chip.getBoundingClientRect();
  const to = Math.max(0, Math.min(strip.scrollWidth - strip.clientWidth, Math.round(strip.scrollLeft + (cr.left - sr.left) - (sr.width - cr.width) / 2)));
  if (Math.abs(to - strip.scrollLeft) >= 2) strip.scrollTo({ left: to, behavior: smooth && !reduceMotion() ? 'smooth' : 'auto' });
}
function setNavActive(id, smooth) {
  if (id === navActive) return; navActive = id;
  document.querySelectorAll('#nav .nav-chip').forEach(c => { const on = !!id && c.dataset.go === id; c.classList.toggle('is-active', on); if (on) c.setAttribute('aria-current', 'location'); else c.removeAttribute('aria-current'); });
  showChip(document.querySelector(id ? `#nav .nav-chip[data-go="${id}"]` : '#nav .nav-chip'), smooth);
}
export function goTo(id) {
  if (navHooks[id]) { navHooks[id](); return; }   // 調理モード・設定はカードではなく開く
  if (id === 'top') { navJump = null; setNavActive('', true); window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }); return; }
  const el = document.getElementById(id); if (!el) return;
  if (el.classList.contains('is-collapsed')) setCollapsed(id, false);
  if (!visible(el)) return;
  setNavActive(id, true); navJump = { id };
  el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  armNavSettle();
}
function armNavSettle() { clearTimeout(navSettleTimer); navSettleTimer = setTimeout(navSettled, 220); }
function navSettled() {
  const j = navJump; if (!j) return; const el = document.getElementById(j.id);
  if (visible(el) && !j.retried) {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const off = el.getBoundingClientRect().top - pad; const room = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    if (Math.abs(off) > 24 && (off < 0 || room > 2)) { j.retried = true; el.scrollIntoView({ block: 'start' }); armNavSettle(); return; }
  }
  navJump = null; updateNav();
}
export function updateNav() {
  if (navJump) return;
  const nav = $('#nav'); if (!nav) return; const limit = nav.getBoundingClientRect().bottom + 20;
  let active = '', best = -Infinity, last = '', lastTop = -Infinity;
  navIds.forEach(id => {
    const el = document.getElementById(id); if (!visible(el)) return; const t = el.getBoundingClientRect().top;
    if (t <= limit && t > best) { best = t; active = id; }
    if (t > lastTop) { lastTop = t; last = id; }
  });
  if (last && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) active = last;
  setNavActive(active, true);
}
export function initNav(ids, hooks) {
  navIds = ids; navHooks = hooks || {};
  ['wheel', 'touchstart', 'keydown'].forEach(t => window.addEventListener(t, ev => { if (navJump && !(ev.target.closest && ev.target.closest('#nav'))) { navJump = null; clearTimeout(navSettleTimer); } }, { passive: true }));
  let tick = false;
  window.addEventListener('scroll', () => { if (navJump) armNavSettle(); if (tick) return; tick = true; requestAnimationFrame(() => { tick = false; updateNav(); }); }, { passive: true });
  // チップは指を離した時点で飛ぶ（iPhone では慣性スクロール中のタップに click が来ないことがある）。キーボードは click で
  const nav = $('#nav'); if (!nav) return; let press = null, firedAt = 0;
  nav.addEventListener('pointerdown', ev => { const b = ev.target.closest('[data-go]'); press = b && ev.isPrimary ? { b, x: ev.clientX, y: ev.clientY } : null; });
  nav.addEventListener('pointercancel', () => { press = null; });
  nav.addEventListener('pointerup', ev => { const p = press; press = null; if (!p) return; const b = ev.target.closest('[data-go]'); if (b !== p.b || Math.hypot(ev.clientX - p.x, ev.clientY - p.y) > 12) return; firedAt = Date.now(); goTo(b.dataset.go); });
  nav.addEventListener('click', ev => { const b = ev.target.closest('[data-go]'); if (!b || Date.now() - firedAt < 700) return; goTo(b.dataset.go); });
}

// ---- 星（1〜5）。押した星までが点く。同じ星をもう一度押すと消す（app.js 側で扱う） ----
export const stars = (act, value, extra = '') => `<span class="stars" role="group">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star${n <= (value || 0) ? ' is-on' : ''}" data-act="${act}" data-v="${n}"${extra ? ' ' + extra : ''} aria-label="${n}">${ic('star')}</button>`).join('')}</span>`;

// ---- ビープ（WebAudio）。iPhone では操作の後でしか鳴らせないので、タイマーを押したときに unlock する ----
let audio = null;
export function unlockAudio() {
  try { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch { audio = null; }
}
export function beep(times = 3) {
  try {
    unlockAudio(); if (!audio) return;
    for (let i = 0; i < times; i++) {
      const o = audio.createOscillator(), g = audio.createGain(); const t0 = audio.currentTime + i * 0.5;
      o.type = 'sine'; o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
      o.start(t0); o.stop(t0 + 0.4);
    }
  } catch { /* 鳴らなくても画面が光る */ }
  if (navigator.vibrate) { try { navigator.vibrate([200, 100, 200, 100, 200]); } catch { /* */ } }
}
