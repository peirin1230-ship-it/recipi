// 手順の開始の分（段取り表と同じ時計）。まとめて調理で手順を時系列に並べるのに使う。
// 1) 手順に start（Generator が書く。prompt_version 10 から）があればそれを使う。
// 2) 無い手順は、段取り表の行と文の重なりで対応を取る（順番を崩さない並べ方の中で一番よく重なる組み合わせ）。
// 3) 対応が取れない手順は、前の手順の開始 + 前の手順の分。次に決まっている手順の開始は超えない。
const STRIP = /[\s、。・，．,.()（）「」『』:：→⇒\-ー〜~/／0-9０-９A-Za-z%％]/g;
function bigrams(t) {
  const s = String(t || '').replace(STRIP, ''); const out = new Set();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}
// 段取り表の行の 2 文字の組のうち、手順の題と文に出てくる割合
function overlap(rowSet, stepSet) {
  if (!rowSet.size) return 0; let hit = 0; rowSet.forEach(b => { if (stepSet.has(b)) hit++; }); return hit / rowSet.size;
}
const MIN_SCORE = 0.34;
const isNum = v => typeof v === 'number' && Number.isFinite(v);

// 料理（dish）ごとに順番を守って求める。古い 2 品のレシピは手順が料理ごとに並んでいて、料理どうしは同時に進むため
export function stepStarts(r) {
  const steps = Array.isArray(r && r.steps) ? r.steps : []; const rows = Array.isArray(r && r.timeline) ? r.timeline : [];
  const out = new Array(steps.length).fill(0); const groups = new Map();
  steps.forEach((s, i) => { const d = String(s.dish || ''); if (!groups.has(d)) groups.set(d, []); groups.get(d).push(i); });
  groups.forEach(idx => { const st = startsOf(idx.map(i => steps[i]), rows); idx.forEach((i, j) => { out[i] = st[j]; }); });
  return out;
}
function startsOf(steps, rows) {
  const n = steps.length, k = rows.length; if (!n) return [];
  const fixed = steps.map(s => (isNum(s.start) && s.start >= 0 ? s.start : null));
  // 段取り表との対応（start の無い手順だけ）。dp[i][j] = 手順 i 本・行 j 本までで重なりの合計の最大
  const match = new Array(n).fill(null);
  if (k && fixed.some(v => v === null)) {
    const sb = steps.map(s => bigrams(`${s.title || ''}${s.text || ''}`)); const rb = rows.map(t => bigrams(t.text));
    const sc = steps.map((_, i) => rows.map((_, j) => (fixed[i] === null ? overlap(rb[j], sb[i]) : 0)));
    const dp = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= k; j++) {
      const m = sc[i - 1][j - 1] >= MIN_SCORE ? dp[i - 1][j - 1] + sc[i - 1][j - 1] : -1;
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], m);
    }
    for (let i = n, j = k; i > 0 && j > 0;) {
      if (sc[i - 1][j - 1] >= MIN_SCORE && dp[i][j] === dp[i - 1][j - 1] + sc[i - 1][j - 1]) { match[i - 1] = j - 1; i--; j--; }
      else if (dp[i][j] === dp[i - 1][j]) i--; else j--;
    }
  }
  const anchor = steps.map((_, i) => (fixed[i] !== null ? fixed[i] : match[i] !== null ? (+rows[match[i]].minute || 0) : null));
  const out = []; let prev = null;
  for (let i = 0; i < n; i++) {
    let at = anchor[i];
    if (at === null) {
      at = prev === null ? 0 : out[prev] + (+steps[prev].minutes || 0);
      const next = anchor.slice(i + 1).find(v => v !== null);
      if (next !== undefined && next !== null) at = Math.min(at, next);
    }
    if (prev !== null) at = Math.max(at, out[prev]);   // 手順の順番は崩さない
    out.push(Math.max(0, Math.round(at))); prev = i;
  }
  return out;
}
