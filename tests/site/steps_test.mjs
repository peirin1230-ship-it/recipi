// site/steps.js の単体テスト（node で直接）。手順の開始の分を、start → 段取り表との対応 → 前の手順から、の順に決める
import { stepStarts } from '../../site/steps.js';
import fs from 'fs';
const results = []; const assert = (c, l) => { results.push(`${c ? 'PASS' : 'FAIL'}: ${l}`); if (!c) process.exitCode = 1; };
const fx = JSON.parse(fs.readFileSync(new URL('../fixtures/recipe_teriyaki.json', import.meta.url), 'utf8')).recipe;
const st = stepStarts(fx);
assert(st.length === fx.steps.length, 'one start per step');
const byDish = {}; fx.steps.forEach((s, i) => { (byDish[s.dish] = byDish[s.dish] || []).push(st[i]); });
assert(Object.values(byDish).every(a => a[0] >= 0 && a.every((v, i) => i === 0 || v >= a[i - 1])), `starts keep the order inside each dish: ${JSON.stringify(byDish)}`);
assert(Object.values(byDish).length === 2 && Math.min(...Object.values(byDish)[1]) < Math.max(...Object.values(byDish)[0]), 'two dishes run side by side (the second dish does not wait for the first to end)');
// 手順に無い待ち（浸水 30 分）のあとも、段取り表の分に合わせる
const soak = { steps: [
  { dish: 'ご飯', n: 1, title: '米を研いで水に浸ける', text: '米を研いで内釜に入れ30分浸ける', minutes: 5 },
  { dish: 'ご飯', n: 2, title: 'かぼちゃを切る', text: 'かぼちゃを1.5cm角に切る', minutes: 6 },
  { dish: 'ご飯', n: 3, title: '調味料を加えて炊く', text: '酒と醤油を入れてかぼちゃをのせ通常炊飯', minutes: 3 },
  { dish: 'ご飯', n: 4, title: '炊き上がりを待つ', text: '通常炊飯（1時間）', minutes: 60 },
  { dish: 'ご飯', n: 5, title: '盛り付け', text: '茶碗に盛る', minutes: 3 } ],
  timeline: [ { minute: 0, text: '米を研ぐ・内釜に水を入れて浸ける' }, { minute: 6, text: 'かぼちゃを切る' }, { minute: 30, text: '酒・醤油を入れ、かぼちゃをのせて通常炊飯' }, { minute: 33, text: '炊飯中（60分）' } ] };
assert(JSON.stringify(stepStarts(soak)) === JSON.stringify([0, 6, 30, 33, 93]), `aligned to the timeline across an unlisted wait: ${JSON.stringify(stepStarts(soak))}`);
// start があればそれを使う
const explicit = { ...soak, steps: soak.steps.map((s, i) => ({ ...s, start: [0, 2, 28, 31, 91][i] })) };
assert(JSON.stringify(stepStarts(explicit)) === JSON.stringify([0, 2, 28, 31, 91]), 'explicit steps[].start wins over the timeline');
// 段取り表が無ければ前の手順から足していく
assert(JSON.stringify(stepStarts({ steps: soak.steps, timeline: [] })) === JSON.stringify([0, 5, 11, 14, 74]), 'without a timeline, starts are the running sum of minutes');
console.log(results.join('\n')); console.log(`\n${results.filter(r => r.startsWith('PASS')).length} passed, ${results.filter(r => r.startsWith('FAIL')).length} failed`);
