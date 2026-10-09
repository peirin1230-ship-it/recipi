/* recipi — GitHub の読み書き（Contents API / repository_dispatch / raw.githubusercontent.com）。
 * トークンはこの端末の localStorage にだけ置き、GitHub API 以外には送らない（docs/SPEC.md §12, §15.1）。
 * 書き込みのコミットは [skip ci]（ページの書き込みで Pages を組み直さない）。
 * 例外は「一覧に追加」「一覧から削除」: recipes/ を変えるので [skip ci] を付けず、build-pages を走らせて同梱の一覧を作り直す。
 */

const API = 'https://api.github.com';
const RAW = 'https://raw.githubusercontent.com';

const cfg = { owner: '', name: '', branch: 'main', token: '' };
export function configure(o) { Object.assign(cfg, o); }
export const hasToken = () => !!cfg.token;
export const mainRepo = () => ({ owner: cfg.owner, name: cfg.name, branch: cfg.branch || 'main' });
// "owner/name"（config.kaji_quest.repo）→ { owner, name, branch }
export function parseRepo(full, branch) { const [owner, name] = String(full || '').split('/'); return { owner: owner || '', name: name || '', branch: branch || 'main' }; }
export const msg = s => `[skip ci] ${s}`;

function headers(json) {
  const h = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (cfg.token) h.Authorization = 'Bearer ' + cfg.token;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}
export const b64decode = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0)));
export function b64bytes(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
export const b64encode = s => b64bytes(new TextEncoder().encode(s));

const encPath = path => path.split('/').map(encodeURIComponent).join('/');
const fileUrl = (path, r) => `${API}/repos/${r.owner}/${r.name}/contents/${encPath(path)}`;
export const rawUrl = (path, r = mainRepo()) => `${RAW}/${r.owner}/${r.name}/${r.branch}/${encPath(path)}`;

// GitHub の応答から、何を直せばよいかが分かる文にする（401: トークンが違う / 403: 権限 / 404: トークンの対象外）
async function writeError(res, path, r, what = '書き込み') {
  let msg = ''; try { msg = (await res.json()).message || ''; } catch { msg = ''; }
  if (res.status === 401) return new Error(`トークンが違う（${msg || 'Bad credentials'}）。⚙ に github_pat_ で始まるトークンを貼る（ルーティンの sk-ant-… ではない）`);
  if (res.status === 403) return new Error(`${r.owner}/${r.name} に${what}できない（${msg || '403'}）。トークンの Repository access に ${r.name} を入れ、Permissions の Contents を Read and write にする`);
  if (res.status === 404) return new Error(`${r.owner}/${r.name} に${what}できない（404）。トークンの Repository access に ${r.name} が入っていない`);
  return new Error(`${path} の${what}に失敗（${res.status} ${msg}）`);
}

// ファイルを読む。無ければ { sha: null, text: null }
export async function getFile(path, r = mainRepo()) {
  const res = await fetch(`${fileUrl(path, r)}?ref=${encodeURIComponent(r.branch)}`, { headers: headers(false), cache: 'no-store' });
  if (res.status === 404) return { sha: null, text: null };
  if (res.status === 403 && !cfg.token) throw new Error('GitHub API の回数制限。⚙ でトークンを保存すると上限が上がる');
  if (!res.ok) throw new Error(`${path} の取得に失敗（${res.status}）`);
  const j = await res.json();
  return { sha: j.sha, text: j.content ? b64decode(j.content) : '' };
}
export async function getJson(path, r) {
  const f = await getFile(path, r); let data = null;
  if (f.text !== null) { try { data = JSON.parse(f.text); } catch { data = null; } }
  return { sha: f.sha, data };
}
// ディレクトリの一覧（[{name,path,type,size}]）。無ければ []
export async function listDir(path, r = mainRepo()) {
  const res = await fetch(`${fileUrl(path, r)}?ref=${encodeURIComponent(r.branch)}`, { headers: headers(false), cache: 'no-store' });
  if (res.status === 404) return [];
  if (res.status === 403 && !cfg.token) throw new Error('GitHub API の回数制限。⚙ でトークンを保存すると上限が上がる');
  if (!res.ok) throw new Error(`${path} の一覧に失敗（${res.status}）`);
  const j = await res.json(); return Array.isArray(j) ? j : [];
}
// 書く。content は文字列か Uint8Array（写真）。sha は更新のときだけ。競合（409/422）は e.conflict = true で投げる
export async function putFile(path, content, message, sha, r = mainRepo()) {
  const body = { message, content: typeof content === 'string' ? b64encode(content) : b64bytes(content), branch: r.branch };
  if (sha) body.sha = sha;
  const res = await fetch(fileUrl(path, r), { method: 'PUT', headers: headers(true), body: JSON.stringify(body) });
  if (res.status === 409 || res.status === 422) { const e = new Error(`${path} が同時に書き換えられた`); e.conflict = true; throw e; }
  if (!res.ok) throw await writeError(res, path, r);
  const j = await res.json(); return (j.content && j.content.sha) || null;
}
// 消す（sha が要る）。無ければ何もしない
export async function deleteFile(path, message, sha, r = mainRepo()) {
  if (!sha) return;
  const res = await fetch(fileUrl(path, r), { method: 'DELETE', headers: headers(true), body: JSON.stringify({ message, sha, branch: r.branch }) });
  if (res.status === 404) return;
  if (res.status === 409 || res.status === 422) { const e = new Error(`${path} が同時に書き換えられた`); e.conflict = true; throw e; }
  if (!res.ok) throw await writeError(res, path, r, '削除');
}
// 読んで → 変換して → 書く。sha 競合なら読み直して最大 3 回。fn が null を返したら書かない
export async function mutateFile(path, fn, message, r = mainRepo()) {
  let last = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const cur = await getFile(path, r);
    const next = fn(cur.text);
    if (next === null || next === undefined) return { sha: cur.sha, text: cur.text, skipped: true };
    try { const sha = await putFile(path, next, message, cur.sha, r); return { sha, text: next }; }
    catch (e) { if (!e.conflict) throw e; last = e; }
  }
  throw new Error(`競合が解消できなかった（${path}）。↻ で更新してもう一度` + (last ? '' : ''));
}
// 生成を起こす（Actions の agent.yml）。204 が返れば受け付けられた
export async function dispatch(requestId, r = mainRepo()) {
  const res = await fetch(`${API}/repos/${r.owner}/${r.name}/dispatches`, { method: 'POST', headers: headers(true), body: JSON.stringify({ event_type: 'agent', client_payload: { request_id: requestId } }) });
  if (res.status === 204) return;
  throw await writeError(res, 'dispatches', r, '生成の起動');
}
// raw.githubusercontent.com から読む（公開リポジトリ。トークン不要）。無ければ null
export async function fetchRawText(path, r = mainRepo()) {
  const res = await fetch(rawUrl(path, r), { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path} の取得に失敗（${res.status}）`);
  return res.text();
}
// トークンの確認: リポジトリが見えて push できるか
export async function checkToken(token, r = mainRepo()) {
  const res = await fetch(`${API}/repos/${r.owner}/${r.name}`, { headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token }, cache: 'no-store' });
  let j = {}; try { j = await res.json(); } catch { j = {}; }
  const hint = res.status === 401 ? 'トークンが違う。github_pat_ で始まる物を貼る（ルーティンの sk-ant-… ではない）'
    : res.status === 404 ? `トークンの Repository access に ${r.name} が入っていない`
    : res.status === 403 ? `権限不足（${j.message || '403'}）。Contents を Read and write にする`
    : res.ok ? '' : `GitHub が ${res.status} を返した`;
  return { ok: res.ok, status: res.status, name: j.full_name || '', push: !!(j.permissions && j.permissions.push), hint };
}
