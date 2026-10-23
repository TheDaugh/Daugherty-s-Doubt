#!/usr/bin/env node
/* Lint for The Crossing content.
 * usage: node crossing-lint.mjs path/to/crossing-premise-1.js
 * Exit code 1 on any ERROR. WARN lines are advice. Run it every time you add a beat.
 *
 * What it guards against (the "robot oversight" tells):
 *   - the sound option being longer, more detailed or more hedged than the cracks
 *   - one move label (press, grant...) that is always right or always wrong
 *   - lexical tells: words that turn up almost only in sound options or only in cracks
 *   - crude options (appeals to scripture, "beyond logic") and slangy skeptic tics
 *   - structural slips: dead links, missing flaw types, unreachable threads
 */
import fs from 'node:fs';
import vm from 'node:vm';

const file = process.argv[2];
if (!file) { console.error('usage: node crossing-lint.mjs <crossing content .js>'); process.exit(2); }
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
const C = sandbox.window.CROSSING;

let errors = 0, warns = 0;
const err = (m) => { errors++; console.log('ERROR ' + m); };
const warn = (m) => { warns++; console.log('WARN  ' + m); };
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const sound = (o) => o.p === 'hold' || o.p === 'dent' || o.p === 'shared';

/* ---------- gather every choice beat ---------- */
const beats = [];
const allOpts = [];
for (const [tid, T] of Object.entries(C.THREADS)) {
  for (const [bid, b] of Object.entries(T.beats)) {
    const opts = (b.opts || []).filter((o) => !o.sup);
    beats.push({ id: tid + ':' + bid, tid, bid, b, opts, hasSup: (b.opts || []).some((o) => o.sup) });
    opts.forEach((o) => allOpts.push({ o, where: tid + ':' + bid }));
  }
}
C.SUPPORTS.forEach((o, i) => allOpts.push({ o, where: 'SUPPORTS[' + i + ']' }));
C.RULES.forEach((r, i) => r.opts.forEach((o) => allOpts.push({ o, where: 'RULES[' + i + ']:' + r.a + (r.b ? '+' + r.b : '') })));

/* ---------- structure ---------- */
const targets = new Set();
const checkTo = (to, T, where) => {
  const list = Array.isArray(to) ? to.map((x) => x.to) : [to];
  for (const t of list) {
    if (t == null) continue;
    if (t === 'END') continue;
    if (typeof t !== 'string') { err(where + ': bad target ' + JSON.stringify(t)); continue; }
    if (t.startsWith('@')) {
      const [tid, bid] = t.slice(1).split(':');
      targets.add(tid);
      if (!C.THREADS[tid]) err(where + ': unknown thread ' + t);
      else if (bid && !C.THREADS[tid].beats[bid]) err(where + ': unknown beat ' + t);
    } else if (t === 'FINISH' || t === 'END') {
    } else if (!T || !T.beats[t]) err(where + ': unknown beat "' + t + '"');
  }
};
for (const { id, tid, b, opts } of beats) {
  const T = C.THREADS[tid];
  if (!b.opts || (!b.opts.length && !b.next)) err(id + ': no options');
  if (b.next && !T.beats[b.next]) err(id + ': next beat missing');
  for (const k of ['his', 'rev', 'def']) if (b[k] && !C.BELIEFS[b[k]]) err(id + ': ' + k + ' "' + b[k] + '" not in BELIEFS');
  if (b.rev && b.def) err(id + ': has both rev and def');
  opts.forEach((o, i) => checkTo(o.to, T, id + '#' + i));
}
C.SUPPORTS.forEach((o, i) => checkTo(o.to, null, 'SUPPORTS[' + i + ']'));
for (const tid of Object.keys(C.THREADS)) {
  if (tid !== 'open' && !C.THREADS[tid].hide && !targets.has(tid) && !C.HIS_ORDER.includes(tid)) warn('thread "' + tid + '" is never targeted or listed in HIS_ORDER');
}
C.HIS_ORDER.forEach((t) => { if (!C.THREADS[t]) err('HIS_ORDER has unknown thread ' + t); });
Object.entries(C.THREADS).forEach(([tid, T]) => {
  if (C.HIS_ORDER.includes(tid) && T.by !== 'him') warn(tid + ' is in HIS_ORDER but has no by:"him"');
  if (T.by === 'him' && !T.lead) err(tid + ': by:"him" thread needs a lead line');
  if (!T.anchor && !T.ref && tid !== 'open' && !T.hide) warn(tid + ': no anchor or ref for the debrief link');
});

/* ---------- commitments, fixes, rules ---------- */
const cms = new Map(), crackCms = new Set();
for (const { o } of allOpts) for (const k of [].concat(o.cm || [])) { cms.set(k, (cms.get(k) || 0) + 1); if (o.p === 'crack') crackCms.add(k); }
for (const { o, where } of allOpts) for (const k of [].concat(o.fix || [])) {
  if (!crackCms.has(k)) warn(where + ': fix "' + k + '" repairs a commitment that no crack creates');
}
C.RULES.forEach((r, i) => {
  for (const k of [r.a, r.b].filter(Boolean)) if (!cms.has(k)) err('RULES[' + i + ']: commitment "' + k + '" is never made by any option');
  if (!r.opts.some((o) => o.p === 'crack')) warn('RULES[' + i + ']: no crack option');
  if (!r.opts.some(sound)) err('RULES[' + i + ']: no sound option');
});

/* ---------- flaws ---------- */
for (const { o, where } of allOpts) {
  if (o.p === 'crack') {
    if (!o.f || !C.FLAWS[o.f]) err(where + ': crack without a known flaw type (f)');
    if (!o.n || words(o.n) < 8) err(where + ': crack needs an explanation (n) of at least 8 words');
    if (!o.c) err(where + ': crack needs a ledger line (c)');
  } else if (o.k !== 'ask' && o.k !== 'end' && !o.c && o.p) warn(where + ': claim without a ledger line (c)');
}

/* ---------- craft: length, position, labels, lexicon ---------- */
const choice = beats.filter((x) => x.opts.filter((o) => o.k !== 'ask').length >= 2 || x.opts.length >= 2);
let firstSound = 0, firstTotal = 0, longestSound = 0, longestTotal = 0;
const perBeatNoCrack = [];
const soundW = [], crackW = [];
const kindStats = {};
for (const { id, opts } of choice) {
  const scored = opts.filter((o) => o.p);
  const s = scored.filter(sound), c = scored.filter((o) => o.p === 'crack');
  if (s.length && c.length) {
    firstTotal++; if (sound(scored[0])) firstSound++;
    const lens = scored.map((o) => words(o.t));
    const max = Math.max(...lens);
    const longest = scored.filter((o, i) => lens[i] === max);
    longestTotal++; if (longest.every(sound)) longestSound++;
    const med = lens.slice().sort((a, b) => a - b)[Math.floor(lens.length / 2)];
    for (const o of scored) {
      const w = words(o.t);
      if (w > med * 1.45 + 2) warn(id + ': an option runs ' + w + ' words against a median of ' + med + ': "' + o.t.slice(0, 50) + '..."');
    }
  } else if (scored.length >= 2 && !c.length) perBeatNoCrack.push(id);
  scored.forEach((o) => (sound(o) ? soundW : crackW).push(words(o.t)));
  for (const o of opts) { const k = o.k; kindStats[k] = kindStats[k] || { sound: 0, crack: 0 }; if (o.p) kindStats[k][sound(o) ? 'sound' : 'crack']++; }
}
const ms = mean(soundW), mc = mean(crackW);
console.log('\n--- craft report ---');
console.log('choice beats with both sound and cracked options: ' + firstTotal);
console.log('authoring order: first option is sound in ' + firstSound + '/' + firstTotal + ' (' + Math.round(100 * firstSound / Math.max(1, firstTotal)) + '%). The engine shuffles, so this is advisory.');
console.log('longest option is sound in ' + longestSound + '/' + longestTotal + ' beats (' + Math.round(100 * longestSound / Math.max(1, longestTotal)) + '%). Chance would be near the share of sound options.');
console.log('mean words: sound ' + ms.toFixed(1) + ', cracked ' + mc.toFixed(1) + ', ratio ' + (ms / mc).toFixed(2));
console.log('move labels, sound vs cracked: ' + Object.entries(kindStats).map(([k, v]) => k + ' ' + v.sound + '/' + v.crack).join(', '));
if (ms / mc > 1.1 || ms / mc < 0.9) err('sound and cracked options differ in length by more than 10% (ratio ' + (ms / mc).toFixed(2) + ')');
if (longestTotal && longestSound / longestTotal > 0.62) err('the longest option is the sound one in ' + Math.round(100 * longestSound / longestTotal) + '% of beats');
for (const [k, v] of Object.entries(kindStats)) {
  const n = v.sound + v.crack;
  if (['press', 'give'].includes(k) && n >= 8 && (v.sound / n > 0.85 || v.sound / n < 0.2)) err('move label "' + k + '" is nearly always ' + (v.sound / n > 0.5 ? 'sound' : 'cracked') + ' (' + v.sound + '/' + n + ')');
  if (k === 'grant' && n >= 8 && v.crack / n < 0.15) warn('"grant" almost never cracks: add over-granting cracks (' + v.crack + '/' + n + ')');
}
const crackShare = crackW.length / (crackW.length + soundW.length);
console.log('cracked options: ' + crackW.length + ' of ' + (crackW.length + soundW.length) + ' scored options (' + Math.round(100 * crackShare) + '%)');
if (crackShare < 0.3 || crackShare > 0.6) warn('cracked share ' + Math.round(100 * crackShare) + '% is outside the 30-60% band');
if (perBeatNoCrack.length) console.log('beats with several sound options and no crack: ' + perBeatNoCrack.length + ' (fine where the beat is a repair or a close)');

/* lexical tells */
const STOP = new Set('that this with from they have will would what when which their there about because could should where while those these been into than then them were your yours some such only also more most very does done just like make made over under before after again still being each other both same'.split(' '));
const tok = (s) => (String(s).toLowerCase().match(/[a-z’']{4,}/g) || []).filter((w) => !STOP.has(w));
const freq = { sound: new Map(), crack: new Map() };
let nS = 0, nC = 0;
for (const { o } of allOpts) {
  if (!o.p || !o.t) continue;
  const cls = sound(o) ? 'sound' : 'crack'; cls === 'sound' ? nS++ : nC++;
  new Set(tok(o.t)).forEach((w) => freq[cls].set(w, (freq[cls].get(w) || 0) + 1));
}
const tells = [];
for (const w of new Set([...freq.sound.keys(), ...freq.crack.keys()])) {
  const a = freq.sound.get(w) || 0, b = freq.crack.get(w) || 0;
  if (a + b < 7) continue;
  const ra = a / nS, rb = b / nC;
  if (ra > 2.2 * rb || rb > 2.2 * ra) tells.push([w, a, b]);
}
if (tells.length) {
  console.log('lexical tells (word, sound count, cracked count): ' + tells.map(([w, a, b]) => w + ' ' + a + '/' + b).join(', '));
  warn('words that skew toward one class: ' + tells.map((t) => t[0]).join(', ') + '. Vary them across both classes.');
}
/* confidence markers */
const MARK = [/\bbecause\b/i, /\bsince\b/i, /\bso\b/i, /\bthen\b/i];
for (const m of MARK) {
  const a = allOpts.filter(({ o }) => o.p && sound(o) && m.test(o.t)).length / Math.max(1, nS);
  const b = allOpts.filter(({ o }) => o.p === 'crack' && m.test(o.t)).length / Math.max(1, nC);
  if (Math.abs(a - b) > 0.2) warn('"' + m.source + '" appears in ' + Math.round(a * 100) + '% of sound options and ' + Math.round(b * 100) + '% of cracks');
}

/* ---------- tone ---------- */
const BAN = [/\bbible\b/i, /\bscripture\b/i, /\bbeyond logic\b/i, /\bpsychological\b/i, /\bwhere are the tigers\b/i, /\bthat[’']s all i wanted\b/i, /^cute\b/i, /^vivid\b/i, /^huh\b/i, /\bobviously\b/i];
const texts = [];
for (const { o, where } of allOpts) texts.push([o.t, where], [o.n, where], [o.c, where]);
for (const { id, b } of beats) texts.push([b.him, id]);
C.RULES.forEach((r, i) => texts.push([r.him, 'RULES[' + i + ']']));
for (const [t, where] of texts) { if (!t) continue; for (const re of BAN) if (re.test(t)) err(where + ': banned phrase ' + re + ' in "' + t.slice(0, 60) + '..."'); }
for (const { id, b } of beats) if (b.him && /!\s*$/.test(b.him)) warn(id + ': skeptic line ends with "!"');

console.log('\n' + errors + ' error(s), ' + warns + ' warning(s)');
process.exit(errors ? 1 : 0);
