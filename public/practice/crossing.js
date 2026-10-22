/* The Crossing: engine.
 * Reads window.CROSSING (content file loaded first) and mounts into [data-crossing].
 * Two people build one bridge from opposite banks. Each claim lays a plank.
 * A claim that fails cracks its plank. Two cracked planks at once drop you into the river.
 * Move labels (Ask, Press, Give, Grant) are hidden until you choose, option order is
 * shuffled per run, and the skeptic's mood tracks the quality of your claims, not your manners. */
(function () {
  'use strict';
  var C = window.CROSSING;
  var root = document.querySelector('[data-crossing]');
  if (!C || !root) return;

  var LEVELS = {
    S: { name: 'Standard', slots: 14, blurb: 'The objections you will actually hear: Hume, “who made God?”, the tiger, the universe as exception, material causes, quantum physics, and “why ask at all?”' },
    A: { name: 'Advanced', slots: 20, blurb: 'Everything in Standard, plus the philosophers’ versions: Carnap on “nothing,” Grünbaum on time, Kant, Oppy’s parity, van Inwagen, Linford’s physics, and Lu’s clocks.' }
  };
  var KIND = { ask: 'Ask', press: 'Press', give: 'Give', grant: 'Grant', end: 'Close' };
  var KIND_HELP = { ask: 'to draw him out', press: 'on what he has just said', give: 'a claim of your own', grant: 'what is true in what he says' };

  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function pick(a, r) { return a[Math.floor((r || Math.random)() * a.length)]; }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(arr, seed) { var a = arr.slice(), r = rng(seed); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bare(s) { return String(s).replace(/[.。]$/, ''); }
  function flawOf(f) { return (C.FLAWS && C.FLAWS[f]) || ['Cracked', 'This claim did not hold.']; }

  /* ================= drawings ================= */
  function skFace() {
    return '<g class="cr-face">' +
      '<circle class="cr-f-ear" cx="19" cy="40" r="3.6"/><circle class="cr-f-ear" cx="61" cy="40" r="3.6"/>' +
      '<circle class="cr-f-head" cx="40" cy="38" r="21"/>' +
      '<path class="cr-f-hair" d="M19 35 Q18 15 40 14 Q62 15 61 35 Q58 24 48 23 Q40 27 32 23 Q22 24 19 35Z"/>' +
      '<g class="cr-eyes cr-e-dot"><circle cx="32" cy="38.5" r="2.1"/><circle cx="48" cy="38.5" r="2.1"/></g>' +
      '<g class="cr-eyes cr-e-wide"><circle cx="32" cy="38.5" r="3.6"/><circle cx="48" cy="38.5" r="3.6"/></g>' +
      '<g class="cr-eyes cr-e-shut"><path d="M28.5 39.5 Q32 36 35.5 39.5"/><path d="M44.5 39.5 Q48 36 51.5 39.5"/></g>' +
      '<g class="cr-f-glasses"><circle cx="32" cy="38.5" r="6.8"/><circle cx="48" cy="38.5" r="6.8"/>' +
      '<path d="M38.8 38 Q40 36.6 41.2 38"/><path d="M25.2 37 L19.5 35"/><path d="M54.8 37 L60.5 35"/></g>' +
      '<path class="cr-brow cr-brow-l" d="M25.5 29.5 L37 28.2"/><path class="cr-brow cr-brow-r" d="M43 28.2 L54.5 29.5"/>' +
      '<path class="cr-f-nose" d="M40.5 41.5 L38.3 46.5 L41.3 47"/>' +
      '<path class="cr-mouth cr-m-flat" d="M35 52.5 L45 52.5"/>' +
      '<path class="cr-mouth cr-m-smile" d="M33 50.5 Q40 58 47 50.5"/>' +
      '<path class="cr-mouth cr-m-hmm" d="M34 53.5 Q40 52 47 50"/>' +
      '<ellipse class="cr-mouth cr-m-o" cx="40" cy="53" rx="3.2" ry="4"/></g>';
  }
  function pFace() {
    return '<g class="cr-pface">' +
      '<circle class="cr-f-ear" cx="19" cy="40" r="3.6"/><circle class="cr-f-ear" cx="61" cy="40" r="3.6"/>' +
      '<circle class="cr-f-head" cx="40" cy="38" r="21"/>' +
      '<path class="cr-p-hair" d="M18.5 37 Q16 13 41 12.5 Q64 13.5 61.5 37 Q60 25 50 21.5 Q42 25 30 22 Q21 25 18.5 37Z"/>' +
      '<circle class="cr-p-eye" cx="32" cy="39" r="2.2"/><circle class="cr-p-eye" cx="48" cy="39" r="2.2"/>' +
      '<path class="cr-p-brow cr-p-brow-l" d="M26.5 31 L36.5 30"/><path class="cr-p-brow cr-p-brow-r" d="M43.5 30 L53.5 31"/>' +
      '<path class="cr-f-nose" d="M40.5 41.5 L38.3 46.5 L41.3 47"/>' +
      '<path class="cr-p-mouth cr-p-m-calm" d="M35 52 Q40 55.5 45 52"/>' +
      '<path class="cr-p-mouth cr-p-m-smile" d="M33 50.5 Q40 58 47 50.5"/>' +
      '<path class="cr-p-mouth cr-p-m-flat" d="M35.5 53.5 L44.5 52.5"/>' +
      '<ellipse class="cr-p-mouth cr-p-m-open" cx="40" cy="53" rx="3.4" ry="3"/></g>';
  }
  function skBust() { return '<path class="cr-f-coat" d="M6 80 Q8 63 27 58.5 L40 65 L53 58.5 Q72 63 74 80Z"/><path class="cr-f-collar" d="M32 58.5 L40 67 L48 58.5"/>' + skFace(); }
  function pBust() { return '<path class="cr-p-coat" d="M6 80 Q8 63 27 58.5 L40 65 L53 58.5 Q72 63 74 80Z"/><path class="cr-f-collar" d="M32 58.5 L40 67 L48 58.5"/>' + pFace(); }
  function skAvatar() { return '<svg class="cr-avatar" viewBox="0 0 80 80" aria-hidden="true">' + skBust() + '</svg>'; }
  function pAvatar() { return '<svg class="cr-avatar" viewBox="0 0 80 80" aria-hidden="true">' + pBust() + '</svg>'; }

  var DECK = { x0: 100, y0: 124, cx: 320, cy: 158, x1: 540, y1: 124 };
  function deckPoint(t) {
    t = Math.max(0, Math.min(1, t));
    var a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    return {
      x: a * DECK.x0 + b * DECK.cx + c * DECK.x1, y: a * DECK.y0 + b * DECK.cy + c * DECK.y1,
      ang: Math.atan2(2 * (1 - t) * (DECK.cy - DECK.y0) + 2 * t * (DECK.y1 - DECK.cy), 2 * (1 - t) * (DECK.cx - DECK.x0) + 2 * t * (DECK.x1 - DECK.cx)) * 180 / Math.PI
    };
  }
  function ropeY(t) { return (1 - t) * (1 - t) * 88 + 2 * (1 - t) * t * 126 + t * t * 88; }

  function buildScene(slots) {
    var s = '<svg class="cr-scene" viewBox="0 0 640 230" role="img" aria-label="A rope bridge between two banks. You stand on the left bank and the skeptic on the right, each laying planks toward the middle.">';
    s += '<defs><clipPath id="cr-clip"><circle cx="40" cy="40" r="38"/></clipPath></defs>';
    s += '<g class="cr-water"><rect x="0" y="188" width="640" height="42"/><path class="cr-wave" d="M0 196 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/></g>';
    s += '<path class="cr-cliff" d="M0 120 L96 120 L104 134 L92 160 L106 190 L0 190 Z"/><path class="cr-cliff" d="M640 120 L544 120 L536 136 L548 160 L534 190 L640 190 Z"/>';
    s += '<line class="cr-post" x1="100" y1="124" x2="100" y2="88"/><line class="cr-post" x1="540" y1="124" x2="540" y2="88"/><path class="cr-rope" d="M100 88 Q320 126 540 88"/>';
    s += '<g class="cr-planks">';
    var gap = 3, w = (440 / slots) - gap, hw = w / 2;
    for (var i = 0; i < slots; i++) {
      var t = (i + 0.5) / slots, p = deckPoint(t);
      s += '<g class="cr-plank cr-w' + (i % 4) + '" transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + p.ang.toFixed(1) + ')">' +
        '<line class="cr-hanger" x1="0" y1="0" x2="0" y2="' + (ropeY(t) - p.y).toFixed(1) + '"/>' +
        '<g class="cr-half-g cr-half-l"><rect class="cr-half" x="' + (-hw).toFixed(1) + '" y="-4" width="' + hw.toFixed(1) + '" height="10" rx="1.6"/>' +
        '<path class="cr-grain" d="M' + (-hw + 3).toFixed(1) + ' 0.2 H-1.5 M' + (-hw + 5).toFixed(1) + ' 3.4 H-3"/><circle class="cr-nail" cx="' + (-hw + 2.4).toFixed(1) + '" cy="1" r="0.9"/></g>' +
        '<g class="cr-half-g cr-half-r"><rect class="cr-half" x="0" y="-4" width="' + hw.toFixed(1) + '" height="10" rx="1.6"/>' +
        '<path class="cr-grain" d="M1.5 0.2 H' + (hw - 3).toFixed(1) + ' M3 3.4 H' + (hw - 5).toFixed(1) + '"/><circle class="cr-nail" cx="' + (hw - 2.4).toFixed(1) + '" cy="1" r="0.9"/></g>' +
        '<circle class="cr-dent" cx="0" cy="1" r="2.6"/></g>';
    }
    s += '</g><g class="cr-splash" transform="translate(320 196)"><circle r="6"/><circle r="12"/><circle r="18"/></g>';
    s += '<g class="cr-medal" transform="translate(12 24)"><circle class="cr-medal-bg" cx="40" cy="40" r="40"/><g clip-path="url(#cr-clip)">' + pBust() + '</g><circle class="cr-medal-ring" cx="40" cy="40" r="39"/></g>';
    s += '<text class="cr-medal-name" x="52" y="114" text-anchor="middle">You</text>';
    s += '<g class="cr-medal" transform="translate(548 24)"><circle class="cr-medal-bg" cx="40" cy="40" r="40"/><g clip-path="url(#cr-clip)">' + skBust() + '</g><circle class="cr-medal-ring" cx="40" cy="40" r="39"/></g>';
    s += '<text class="cr-medal-name" x="588" y="114" text-anchor="middle">The skeptic</text>';
    s += '</svg>';
    return s;
  }

  /* ================= state ================= */
  var ui = {}, st = null;

  function mount() {
    var sub = root.getAttribute('data-subtitle') || 'Premise 1: a conversation from both ends of the bridge';
    root.className = 'cr';
    root.setAttribute('data-mood', 'neutral');
    root.setAttribute('data-pmood', 'calm');
    root.innerHTML = '';
    var head = el('div', 'cr-head-row');
    head.appendChild(el('h3', 'cr-title', 'The Crossing'));
    head.appendChild(el('div', 'cr-subtitle', esc(sub)));
    root.appendChild(head);
    ui.bar = el('div', 'cr-bar');
    ui.level = el('div', 'cr-mode', '');
    ui.temper = el('div', 'cr-temper', '');
    ui.bar.appendChild(ui.temper); ui.bar.appendChild(ui.level);
    root.appendChild(ui.bar);
    ui.stage = el('div', 'cr-stage'); root.appendChild(ui.stage);
    ui.log = el('div', 'cr-log'); ui.log.setAttribute('aria-live', 'polite'); ui.log.setAttribute('role', 'log'); root.appendChild(ui.log);
    ui.opts = el('div', 'cr-optbox'); root.appendChild(ui.opts);
    ui.ledger = el('details', 'cr-books'); root.appendChild(ui.ledger);
    root.addEventListener('keydown', onKey);
    intro();
  }

  function onKey(e) {
    if (!st || st.over || st.busy || e.ctrlKey || e.metaKey || e.altKey) return;
    var n = parseInt(e.key, 10);
    if (!(n >= 1 && n <= 9)) return;
    var b = ui.opts.querySelectorAll('.cr-opt')[n - 1];
    if (b) { e.preventDefault(); b.click(); }
  }

  function intro() {
    st = null;
    root.setAttribute('data-mood', 'neutral'); root.setAttribute('data-pmood', 'calm');
    ui.level.textContent = ''; ui.temper.textContent = '';
    ui.stage.innerHTML = buildScene(LEVELS.S.slots); grab();
    ui.ledger.innerHTML = ''; ui.ledger.style.display = 'none';
    ui.log.innerHTML = '<div class="cr-intro">' +
      '<p>You and a skeptic are building one bridge from opposite banks. Each claim you make that holds lays a plank on your side, and each position he states lays one on his. A claim that fails cracks its plank. Two cracked planks at once drop you into the river. Nobody wins. What matters is whether you met, what moved, and where you honestly part.</p>' +
      '<p>You can <strong>ask</strong> a question, <strong>press</strong> on what he just said, <strong>give</strong> a claim of your own, or <strong>grant</strong> what is true in what he says. The labels appear only after you choose. He gives ground when your claims hold, not when you are polite, and sometimes he is right.</p></div>';
    var h = '<div class="cr-select-head">Choose a level</div><div class="cr-cards">';
    ['S', 'A'].forEach(function (k) { h += '<button type="button" class="cr-card" data-lvl="' + k + '"><strong>' + LEVELS[k].name + '</strong><span>' + LEVELS[k].blurb + '</span></button>'; });
    ui.opts.innerHTML = h + '</div>';
    ui.opts.querySelectorAll('.cr-card').forEach(function (b) { b.addEventListener('click', function () { start(b.getAttribute('data-lvl')); }); });
  }

  function grab() {
    ui.svg = ui.stage.querySelector('svg');
    ui.planks = ui.svg.querySelectorAll('.cr-plank');
  }

  function start(lvl) {
    var L = LEVELS[lvl];
    st = { lvl: lvl, slots: L.slots, left: 0, right: L.slots - 1, o: 0, flags: {}, visited: {}, his: {}, mine: [], cracks: [], lastKinds: [],
      thread: null, beat: null, over: false, covered: [], commit: {}, fired: {}, pressedHoles: {}, falls: 0, repaired: 0, snap: null,
      seed: Math.floor(Math.random() * 4294967295), thHold: {}, noAsk: false, transcript: [], met: false, closed: false, shown: {} };
    var P = pick([{ s: -7, why: 'church' }, { s: -4, why: 'evil' }, { s: -1, why: 'curious' }]);
    st.s = P.s; st.s0 = P.s; st.why = P.why;
    ui.level.textContent = L.name;
    ui.temper.innerHTML = 'He seems <em>' + temper() + '</em>';
    ui.stage.innerHTML = buildScene(L.slots); grab();
    ui.log.innerHTML = '';
    ui.ledger.style.display = '';
    enterThread('open', 'start');
  }

  /* ================= conditions & routing ================= */
  function cmp(v, expr) {
    var m = /^(>=|<=|>|<|==)?(-?\d+)$/.exec(String(expr)); if (!m) return true;
    var n = +m[2];
    switch (m[1] || '==') { case '>=': return v >= n; case '<=': return v <= n; case '>': return v > n; case '<': return v < n; default: return v === n; }
  }
  function test(cond) {
    if (!cond) return true;
    if (cond.o != null && !cmp(st.o, cond.o)) return false;
    if (cond.flag && !st.flags[cond.flag]) return false;
    if (cond.visited && !st.visited[cond.visited]) return false;
    if (cond.anyVisited && !cond.anyVisited.some(function (t) { return st.visited[t]; })) return false;
    return true;
  }
  function resolve(to) {
    if (!Array.isArray(to)) return to;
    for (var i = 0; i < to.length; i++) if (test(to[i].if)) return to[i].to;
    return 'END';
  }
  function lvlOK(x) { return !x.lvl || x.lvl === 'S' || st.lvl === 'A'; }
  function threadOK(id) {
    var t = C.THREADS[id];
    return t && lvlOK(t) && !st.visited[id] && test(t.req);
  }

  function temper() { return st.o >= 2 ? 'persuaded' : st.o >= 0 ? 'engaged' : st.o === -1 ? 'unconvinced' : 'frustrated'; }
  /* the hidden scale: -10 hostility toward God ... 0 neutral ... +10 wanting to be a Christian.
     Arguments move it more slowly the colder he starts. It is his position, never the player's score. */
  function bandOf(s) { return s <= -5 ? 'h' : s >= 5 ? 'o' : 'g'; }
  function gain(n) { if (n <= 0) return n; return n * (st.s <= -5 ? 0.5 : st.s <= -2 ? 0.75 : 1); }
  var CAP = { church: -5, evil: 2, curious: 8 };   /* argument alone only goes so far with a person who is hurt or grieving */
  function bump(n, bypass) { var v = st.s + gain(n); if (n > 0 && !bypass) v = Math.min(v, Math.max(st.s, CAP[st.why] == null ? 10 : CAP[st.why])); st.s = Math.max(-10, Math.min(C.MAXS || 10, v)); }
  function sWords(s) { return s <= -7 ? 'hostile to God' : s <= -4 ? 'cold toward the whole subject' : s <= -1 ? 'guarded' : s <= 1 ? 'neutral' : s <= 4 ? 'curious' : s <= 7 ? 'drawn in' : 'wanting to know more'; }
  function temperKey() { return st.o >= 2 ? 'open' : st.o <= -2 ? 'hard' : 'mid'; }

  /* ================= log ================= */
  function scrollLog() { ui.log.scrollTop = ui.log.scrollHeight; }
  function logHim(text) {
    st.transcript.push({ who: 'Skeptic', text: text });
    ui.log.appendChild(el('div', 'cr-line cr-line-him', skAvatar() + '<div class="cr-bubble"><div class="cr-speaker">Skeptic</div><p>' + esc(text) + '</p></div>')); scrollLog();
  }
  function logYou(kind, text) {
    st.transcript.push({ who: 'You (' + KIND[kind] + ')', text: text });
    ui.log.appendChild(el('div', 'cr-line cr-line-you', '<div class="cr-bubble"><div class="cr-speaker">You <span class="cr-kind cr-kind-' + kind + '">' + KIND[kind] + '</span></div><p>' + esc(text) + '</p></div>' + pAvatar())); scrollLog();
  }
  function logTag(cls, title, body) {
    st.transcript.push({ who: '[' + title + ']', text: body || '' });
    ui.log.appendChild(el('div', 'cr-tag ' + cls, '<strong>' + esc(title) + '</strong>' + (body ? '<p>' + esc(body) + '</p>' : ''))); scrollLog();
  }
  function sourceLink(id) {
    var T = C.THREADS[id]; if (!T || T.hide || !T.anchor || st.shown[id]) return;
    st.shown[id] = true;
    var href = (C.ART || '/articles/kalam-premise-1/') + '#' + T.anchor;
    ui.log.appendChild(el('div', 'cr-note cr-src', 'The argument behind this: <a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(T.title) + '</a>')); scrollLog();
  }
  function logNote(text) { ui.log.appendChild(el('div', 'cr-note', esc(text))); scrollLog(); }

  /* ================= planks ================= */
  function alloc(side) { if (st.left > st.right) return -1; return side === 'l' ? st.left++ : st.right--; }
  function lay(side, extra) {
    var i = alloc(side); if (i < 0) return -1;
    var p = ui.planks[i]; p.classList.add('cr-laid', side === 'l' ? 'cr-laid-l' : 'cr-laid-r');
    if (extra) p.classList.add(extra);
    if (st.left > st.right && !st.met) { st.met = true; setTimeout(function () { if (st && !st.over) logTag('cr-tag-rethink', 'You have met in the middle.', 'The bridge spans the gap. Keep talking if there is more to say.'); }, 300); }
    return i;
  }

  /* ================= flow ================= */
  function enterThread(id, beatId) {
    snapshot('@' + id + ':' + (beatId || 'start'));
    st.visited[id] = true; st.thread = id; st.covered.push(id);
    sourceLink(id);
    showBeat(beatId || 'start');
  }

  function go(to) {
    to = resolve(to);
    if (to === 'END') return junction();
    if (to === 'FINISH') return finish('closed');
    if (to.charAt(0) === '@') {
      var parts = to.slice(1).split(':');
      if (st.visited[parts[0]] && !parts[1]) { logHim('We have already been over that.'); return junction(); }
      if (st.thread !== parts[0]) { snapshot(to); st.visited[parts[0]] = true; st.thread = parts[0]; st.covered.push(parts[0]); sourceLink(parts[0]); }
      return showBeat(parts[1] || 'start');
    }
    showBeat(to);
  }

  function showBeat(id) {
    var T = C.THREADS[st.thread], b = T.beats[id];
    st.beat = id;
    var mood = st.o <= -2 ? 'point' : 'neutral';
    if (b.him) logHim(typeof b.him === 'function' ? b.him(ctxFor()) : b.him);
    if (b.s) bump(b.s, true);
    if (b.his) st.his[b.his] = st.his[b.his] || { status: 'stated', plank: lay('r') };
    if (b.rev && st.his[b.rev]) {
      st.his[b.rev].status = 'revised';
      var pi = st.his[b.rev].plank; if (pi >= 0) ui.planks[pi].classList.add('cr-revised');
      logTag('cr-tag-rethink', 'He gave ground.', C.BELIEFS[b.rev].rev ? 'Now: ' + C.BELIEFS[b.rev].rev : '');
      mood = 'hmm';
    } else if (b.def && st.his[b.def]) {
      st.his[b.def].status = 'defended';
      var pj = st.his[b.def].plank; if (pj >= 0) ui.planks[pj].classList.add('cr-dented');
      logTag('cr-tag-bullet', 'He held his position.', C.BELIEFS[b.def].open ? 'Where you part: ' + C.BELIEFS[b.def].open : '');
      mood = 'point';
    }
    if (st.lastWasShared && mood === 'neutral') mood = 'nod';
    st.lastWasShared = false;
    root.setAttribute('data-mood', mood);
    books();
    var opts = b.opts && b.opts.length ? b.opts : (b.next ? T.beats[b.next].opts : []);
    st.curOpts = expand(opts);
    renderOpts(st.curOpts);
  }

  function expand(opts) {
    var out = [];
    opts.forEach(function (o) {
      if (o.sup) {
        C.SUPPORTS.forEach(function (s) {
          var tid = s.to.slice(1).split(':')[0];
          if (lvlOK(s) && !st.visited[tid] && tid !== o.except) out.push(s);
        });
      } else if (lvlOK(o)) out.push(o);
    });
    if (st.noAsk) {
      var firm = out.filter(function (o) { return o.k !== 'ask'; });
      if (firm.length) out = firm;
    }
    if (!out.length) out.push({ k: 'ask', t: 'Go on.', to: 'END' });
    return out;
  }

  function holes() { return Object.keys(st.commit).filter(function (k) { return st.commit[k].cracked; }); }

  function renderOpts(opts) {
    ui.opts.innerHTML = '';
    var list = opts.slice();
    var hs = holes();
    var fixing = list.filter(function (o) { return o.fix && [].concat(o.fix).some(function (f) { return st.commit[f] && st.commit[f].cracked; }); });
    if (fixing.length && !list.some(function (o) { return o.p === 'crack'; })) {
      var f = fixing[0], fk = [].concat(f.fix).filter(function (x) { return st.commit[x] && st.commit[x].cracked; })[0];
      list.push({ k: 'give', t: 'I do not think that needs retracting. As I put it, the claim is defensible, and I would rather defend it than step back from it.', p: 'crack', f: 'doubledown', dd: fk, c: 'Doubled down: ' + bare(st.commit[fk].label), n: 'You stood on a claim he had just shown to be flawed, instead of repairing it.', o: -1, to: f.to });
    }
    var tail = list.filter(function (o) { return o.k === 'end'; });
    var body = list.filter(function (o) { return o.k !== 'end'; });
    var seed = hash(st.seed + '|' + body.map(function (o) { return String(o.t || '').slice(0, 28); }).join('|'));
    var shown = shuffle(body, seed).concat(tail);
    var box = el('div', 'cr-options');
    shown.forEach(function (o, i) {
      var b = el('button', 'cr-opt' + (o.fix ? ' cr-opt-fix' : ''), '<span class="cr-num" aria-hidden="true">' + (i + 1) + '</span><span class="cr-label">' + esc(o.t) + '</span>');
      b.type = 'button';
      b.addEventListener('click', function () { choose(o); });
      box.appendChild(b);
    });
    ui.opts.appendChild(box);
    if (hs.length) ui.opts.appendChild(el('p', 'cr-holes', 'One of your planks is cracked. Crack another before repairing it and you go through.'));
    var wrap = el('button', 'cr-linkbtn', 'Wrap up the conversation'); wrap.type = 'button';
    wrap.addEventListener('click', function () { toClose('wrap'); });
    ui.opts.appendChild(wrap);
  }

  function choose(o) {
    if (st.over || st.busy) return;
    if (o.k === 'end') return toClose('wrap');
    logYou(o.k, o.t);
    var pm = { ask: 'calm', press: 'speak', give: 'speak', grant: 'smile' }[o.k] || 'calm';
    var idx = -1, d = 0;
    var ds = 0;
    if (o.p) {
      var cls = { hold: '', dent: 'cr-dented', crack: 'cr-cracked', shared: 'cr-granted' }[o.p];
      if (!o.soft && (!o.np || o.p === 'crack')) idx = lay('l', cls);
      var entry = { c: o.c || o.t, p: o.p, n: o.n || '', f: o.f || '' };
      st.mine.push(entry);
      if (o.p === 'crack') {
        var better = o.b || betterOf(o);
        st.cracks.push({ c: o.c || o.t, t: o.t, n: o.n || '', f: o.f || 'overreach', b: better, thread: st.thread });
        var fl = flawOf(o.f);
        logTag('cr-tag-crack', 'Cracked. ' + fl[0] + '.', (o.n || fl[1]));
        pm = 'wince';
        d -= (o.f === 'doubledown' ? 2 : 1); ds -= (o.f === 'doubledown' ? 3 : 2);
      } else if (o.p === 'dent' && !o.fix) {
        logTag('cr-tag-bullet', 'Narrowed.', o.n || 'You gave up some reach to keep the plank. Often a fair trade.');
      } else if (o.p === 'shared') {
        st.lastWasShared = true; d += 1; ds += 1.5;
      } else if (o.p === 'hold' && !o.np && !st.thHold[st.thread]) {
        st.thHold[st.thread] = true; d += 1; ds += 1.5;
      } else if (o.p === 'hold' && !o.np) { ds += 0.75; }
      else if (o.p === 'dent') { ds += 0.5; }
    }
    (o.drop || []).forEach(function (k) { delete st.commit[k]; });
    [].concat(o.fix || []).forEach(function (fk) {
      var fc = st.commit[fk]; if (!fc) return;
      if (fc.cracked && fc.plank >= 0) { ui.planks[fc.plank].classList.remove('cr-cracked'); ui.planks[fc.plank].classList.add('cr-repaired'); }
      if (fc.cracked) { st.repaired++; d += 1; ds += 2; logTag('cr-tag-rethink', 'Repaired.', 'You took back “' + bare(fc.label) + '.” Admitting a mistake costs less than standing on it.'); }
      delete st.commit[fk];
    });
    var cms = o.cm ? [].concat(o.cm) : [];
    if (o.p === 'crack' && !cms.length) cms = [o.dd ? o.dd + '_dd' : 'crack' + st.cracks.length];
    if (!o.soft) cms.forEach(function (k) { st.commit[k] = { label: o.c || o.t, plank: idx, cracked: o.p === 'crack', at: st.lastKinds.length + 1 }; });
    root.setAttribute('data-pmood', pm);
    if (o.o != null) d += o.o;

    /* asking is free, but you cannot ask your way through: two questions in a row cost him patience */
    var prev = st.lastKinds[st.lastKinds.length - 1];
    if (o.k === 'ask' && prev === 'ask') { d -= 1; st.noAsk = true; logNote('Two questions in a row. He would like to hear a claim from you.'); }
    else if (o.k !== 'ask') st.noAsk = false;
    st.lastKinds.push(o.k);
    st.o = Math.max(-3, Math.min(2, st.o + d));
    bump(ds);
    if (o.s != null) bump(o.s, true);
    (o.set || []).forEach(function (f) { st.flags[f] = true; });
    ui.temper.innerHTML = 'He seems <em>' + temper() + '</em>';
    books();
    ui.opts.innerHTML = '';
    if (holes().length >= 2) return fall();
    if (st.o <= -3 && !st.closed) { logHim(C.LEAVE); return finish('left'); }
    var to = o.to;
    var rule = nextRule();
    st.busy = true;
    setTimeout(function () {
      st.busy = false;
      if (rule) return crossExam(rule, to);
      go(to);
    }, 250);
  }

  /* the sound option you passed, for the debrief */
  function betterOf(chosen) {
    var cands = (st.curOpts || []).filter(function (x) { return x !== chosen && (x.p === 'hold' || x.p === 'dent' || x.p === 'shared'); });
    return cands.length ? cands[0].t : '';
  }

  /* he cross-examines you on two things you have said */
  function nextRule() {
    if (st.closed) return null;
    var R = C.RULES || [];
    var now = st.lastKinds.length;
    if (st.lastX != null && now - st.lastX < 3) return null;
    for (var i = 0; i < R.length; i++) {
      if (st.fired[i]) continue;
      var a = st.commit[R[i].a];
      if (!a) continue;
      if (R[i].b) { if (!st.commit[R[i].b]) continue; }
      else if (now - (a.at || 0) < 4) continue;
      st.fired[i] = true; st.lastX = now; return R[i];
    }
    return null;
  }
  function crossExam(rule, resume) {
    root.setAttribute('data-mood', 'point');
    logHim(rule.him);
    var opts = rule.opts.map(function (o) { var c = {}; for (var k in o) c[k] = o[k]; c.to = resume; c.xr = true; return c; });
    st.curOpts = opts;
    renderOpts(opts);
  }

  /* falling through */
  function snapshot(target) {
    if (!st) return;
    var copy = JSON.parse(JSON.stringify(st, function (k, v) { return (k === 'mt' || k === 'snap' || k === 'curOpts') ? undefined : v; }));
    st.snap = { st: copy, log: ui.log.innerHTML, planks: Array.prototype.map.call(ui.planks, function (p) { return p.getAttribute('class'); }), target: target };
  }
  function fall() {
    st.busy = true;
    st.falls++;
    var hs = holes();
    var first = -1;
    hs.forEach(function (k) {
      var p = st.commit[k].plank;
      if (p >= 0) { ui.planks[p].classList.add('cr-dropping'); if (first < 0) first = p; }
    });
    var sp = ui.svg.querySelector('.cr-splash');
    var px = first >= 0 ? deckPoint((first + 0.5) / st.slots).x : 320;
    sp.setAttribute('transform', 'translate(' + px.toFixed(0) + ' 196)');
    setTimeout(function () { sp.classList.add('cr-splashing'); }, 650);
    ui.stage.classList.remove('cr-shake'); void ui.stage.offsetWidth; ui.stage.classList.add('cr-shake');
    root.setAttribute('data-mood', 'alarm'); root.setAttribute('data-pmood', 'wince');
    var names = hs.map(function (k) { return '“' + bare(st.commit[k].label) + '”'; }).join(' and ');
    logTag('cr-tag-crack', 'You went through the bridge.', 'Two cracked planks under you at once: ' + names + '. One mistake you can repair. Two you stand on will drop you.');
    var falls = st.falls;
    setTimeout(function () {
      st.busy = false;
      ui.opts.innerHTML = '';
      var box = el('div', 'cr-options');
      if (falls < 3 && st.snap) {
        var b = el('button', 'cr-opt', '<span class="cr-num" aria-hidden="true">1</span><span class="cr-label">Climb back to the last sound plank and take this topic again.</span>');
        b.type = 'button'; b.addEventListener('click', climb); box.appendChild(b);
      }
      var e = el('button', 'cr-opt', '<span class="cr-num" aria-hidden="true">' + (box.children.length + 1) + '</span><span class="cr-label">End the conversation here.</span>');
      e.type = 'button'; e.addEventListener('click', function () { finish('fell'); }); box.appendChild(e);
      ui.opts.appendChild(box);
      if (falls >= 3) ui.opts.appendChild(el('p', 'cr-holes', 'Three falls. The river wins this one.'));
    }, 1300);
  }
  function climb() {
    var sn = st.snap, falls = st.falls, cracks = st.cracks, rep = st.repaired;
    st = sn.st; st.falls = falls; st.repaired = rep; st.cracks = sn.st.cracks.concat(cracks.slice(sn.st.cracks.length));
    ui.log.innerHTML = sn.log;
    Array.prototype.forEach.call(ui.planks, function (p, i) { p.setAttribute('class', sn.planks[i]); });
    ui.svg.querySelector('.cr-splash').classList.remove('cr-splashing');
    ui.temper.innerHTML = 'He seems <em>' + temper() + '</em>';
    root.setAttribute('data-pmood', 'calm');
    logNote('You climb back onto the last sound plank. Falls: ' + falls + ' of 3.');
    var t = sn.target, parts = t.slice(1).split(':');
    snapshot(t); st.visited[parts[0]] = true; st.thread = parts[0]; st.covered.push(parts[0]);
    books();
    showBeat(parts[1] || 'start');
  }

  function junction() {
    st.thread = null;
    var hs = holes().filter(function (k) { return !st.pressedHoles[k]; });
    if (hs.length) {
      var k = hs[0]; st.pressedHoles[k] = true;
      root.setAttribute('data-mood', 'point');
      logHim('Before we move on. You said, “' + bare(st.commit[k].label) + '.” Do you still stand by that?');
      var back = [
        { k: 'grant', fix: k, p: 'dent', c: 'Took back: ' + st.commit[k].label, t: 'No. I should not have said that, and I would like to take it back.', o: 1, to: 'END' },
        { k: 'give', p: 'crack', f: 'doubledown', c: 'Doubled down: ' + bare(st.commit[k].label), n: 'You were given the chance to take it back and stood on it.', t: 'Yes. I considered it before saying it, and I stand by it.', dd: k, o: -1, to: 'END' }
      ];
      st.curOpts = back;
      return renderOpts(back);
    }
    var his = C.HIS_ORDER.filter(threadOK).filter(function (id) { return C.THREADS[id].by === 'him'; });
    var sups = C.SUPPORTS.filter(function (s) { return lvlOK(s) && !st.visited[s.to.slice(1).split(':')[0]]; });
    var nT = Object.keys(st.visited).filter(function (t) { return t !== 'open' && t !== 'close'; }).length;
    if ((!his.length && !sups.length) || nT >= (st.lvl === 'A' ? 6 : 4)) return toClose('done');
    var opts = [];
    if (his.length) {
      var next = his[0], T = C.THREADS[next];
      logHim(pick(C.JUNCTION[temperKey()]) + ' ' + T.lead);
      opts.push({ k: 'ask', t: 'Go on. I would like to hear it.', o: 0, to: '@' + next });
    } else {
      logHim('That is most of what I had.');
    }
    sups.slice(0, his.length ? 2 : 3).forEach(function (s) {
      var c = {}; for (var kk in s) c[kk] = s[kk];
      if (his.length) c.t = 'Before that: ' + s.t;
      opts.push(c);
    });
    opts.push({ k: 'end', t: 'Let us leave it there for tonight.' });
    root.setAttribute('data-mood', st.o >= 1 ? 'nod' : 'neutral');
    st.curOpts = opts;
    renderOpts(opts);
  }

  function ctxFor() {
    var revs = Object.keys(st.his).filter(function (k) { return st.his[k].status === 'revised' && C.BELIEFS[k].rev; }).map(function (k) { return C.BELIEFS[k].rev; });
    var defs = Object.keys(st.his).filter(function (k) { return st.his[k].status === 'defended' && C.BELIEFS[k].open; }).map(function (k) { return C.BELIEFS[k].open; });
    return { revs: revs, defs: defs, why: st.why, s: st.s, band: bandOf(st.s) };
  }
  /* the last exchange: what the argument did and did not do, said to the person */
  function toClose() {
    if (st.over) return;
    if (st.closed) return finish('closed');
    st.closed = true; st.busy = false; ui.opts.innerHTML = '';
    st.thread = 'close'; st.visited.close = true;
    var beat = { h: 'cl_h', g: 'cl_g', o: 'cl_o' }[bandOf(st.s)];
    snapshot('@close:' + beat);
    showBeat(beat);
  }

  /* ================= ledgers ================= */
  function books() {
    var hisKeys = Object.keys(st.his), h = '<summary>What each of you has put down</summary><div class="cr-cols"><div class="cr-col"><div class="cr-ledger-head">Him</div>';
    if (!hisKeys.length) h += '<div class="cr-empty">Nothing yet.</div>';
    else {
      h += '<ul>';
      hisKeys.forEach(function (k) {
        var b = st.his[k], B = C.BELIEFS[k];
        if (b.status === 'revised') h += '<li class="cr-st-revised">' + esc(B.rev || B.t) + '<small>Revised. Before: ' + esc(B.t) + '</small></li>';
        else if (b.status === 'defended') h += '<li class="cr-st-defended">' + esc(B.t) + '<small>Held.' + (B.open ? ' Where you part: ' + esc(B.open) : '') + '</small></li>';
        else h += '<li>' + esc(B.t) + '</li>';
      });
      h += '</ul>';
    }
    h += '</div><div class="cr-col"><div class="cr-ledger-head">You</div>';
    if (!st.mine.length) h += '<div class="cr-empty">Nothing yet.</div>';
    else {
      h += '<ul>';
      st.mine.forEach(function (m) {
        var cls = { hold: '', dent: 'cr-st-dented', crack: 'cr-st-cracked', shared: 'cr-st-granted' }[m.p];
        var lab = { hold: '', dent: 'Narrowed', crack: m.f ? 'Cracked: ' + flawOf(m.f)[0] : 'Cracked', shared: 'Granted' }[m.p];
        h += '<li class="' + cls + '">' + esc(m.c) + (lab ? '<small>' + esc(lab) + '</small>' : '') + '</li>';
      });
      h += '</ul>';
    }
    h += '</div></div>';
    var open = ui.ledger.open;
    ui.ledger.innerHTML = h; ui.ledger.open = open;
  }

  /* ================= ending ================= */
  function transcriptText() {
    return 'The Crossing: ' + (root.getAttribute('data-subtitle') || 'Premise 1') + '\n\n' + st.transcript.map(function (x) { return x.who + ': ' + x.text; }).join('\n\n');
  }
  function copyText(txt, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = o; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, fallback); } else fallback();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = 'Copy failed'; }
      document.body.removeChild(ta);
    }
  }

  function finish(why) {
    if (st.over) return; st.over = true; st.busy = false;
    ui.opts.innerHTML = '';
    var revs = Object.keys(st.his).filter(function (k) { return st.his[k].status === 'revised' && C.BELIEFS[k].rev; });
    var defs = Object.keys(st.his).filter(function (k) { return st.his[k].status === 'defended'; });
    var verdict;
    if (why === 'fell') verdict = 'You went into the river. Two mistakes stood at once, and neither was taken back.';
    else if (why === 'left') verdict = 'He walked away. Too many overreaches left him defending himself instead of thinking.';
    else if (revs.length >= 3 && st.cracks.length <= 1) verdict = 'He moved, and you stayed on your feet.';
    else if (revs.length + defs.length >= 2) verdict = 'The disagreement is clearer than when you began.';
    else verdict = 'Little moved. Answer what he asked, and say so when he is right.';
    if (why === 'done') logHim(st.o >= 1 ? 'That is everything I had. Thank you for listening to the questions as asked.' : 'That is everything I had.');
    root.setAttribute('data-mood', why === 'left' ? 'point' : (revs.length ? 'nod' : 'hmm'));
    var h = '<div class="cr-end"><h3>Where the two of you stand</h3><div class="cr-verdict">' + esc(verdict) + '</div>';
    if (st.met) h += '<p>' + (st.cracks.length ? 'You met in the middle, though ' + st.cracks.length + (st.cracks.length === 1 ? ' of your planks is' : ' of your planks are') + ' cracked.' : 'You met in the middle on a sound bridge.') + '</p>';
    if (st.falls) h += '<p class="cr-endnote">Falls: ' + st.falls + '. Repairs: ' + st.repaired + '.</p>';
    else if (st.repaired) h += '<p class="cr-endnote">You repaired ' + st.repaired + (st.repaired === 1 ? ' crack' : ' cracks') + ' by taking things back.</p>';
    h += '<p class="cr-endnote">Planks laid: ' + (st.left + (st.slots - 1 - st.right)) + ' of ' + st.slots + '.</p>';
    var sn = Math.round(st.s), band = bandOf(st.s);
    h += '<div class="cr-endsec cr-scale"><h4>Where he ended</h4><p>' + esc(C.CLOSING.where[band]) + '</p>' +
      '<div class="cr-meter" role="img" aria-label="Stance ' + sn + ' on a scale from minus ten to plus ten"><span class="cr-pin" style="left:' + ((st.s + 10) * 5) + '%"></span></div>' +
      '<p class="cr-endnote">He finished <strong>' + esc(sWords(st.s)) + '</strong> (' + (sn > 0 ? '+' : '') + sn + ' on a scale from −10, hostile to God, through 0, neutral, to +10, wanting to be a Christian). It is his position, not your grade. He began at ' + st.s0 + '.</p>' +
      '<p class="cr-insight">' + esc(C.CLOSING.insight) + '</p>' +
      (band !== 'h' ? '<p class="cr-next"><a href="' + esc(C.CLOSING.next.href) + '">' + esc(C.CLOSING.next.text) + '</a> <span class="cr-endnote">(to be continued)</span></p>' : '<p class="cr-endnote">' + esc(C.CLOSING.keep[band]) + '</p>') + '</div>';
    if (revs.length) {
      h += '<div class="cr-endsec"><h4>What he gave up</h4><ul class="cr-endlist">';
      revs.forEach(function (k) { h += '<li><em>Before:</em> ' + esc(C.BELIEFS[k].t) + '<br><em>Now:</em> ' + esc(C.BELIEFS[k].rev) + '</li>'; });
      h += '</ul></div>';
    }
    if (defs.length) {
      h += '<div class="cr-endsec"><h4>Where you honestly part</h4><ul class="cr-endlist">';
      defs.forEach(function (k) { if (C.BELIEFS[k].open) h += '<li>' + esc(C.BELIEFS[k].open) + '</li>'; });
      h += '</ul></div>';
    }
    if (st.cracks.length) {
      var seen = {}, tally = [];
      st.cracks.forEach(function (c) { var n = flawOf(c.f)[0]; seen[n] = (seen[n] || 0) + 1; });
      Object.keys(seen).forEach(function (n) { tally.push(n + (seen[n] > 1 ? ' ×' + seen[n] : '')); });
      h += '<div class="cr-endsec cr-endsec-crack"><h4>What cost you</h4><p class="cr-endnote">Patterns: ' + esc(tally.join(', ')) + '.</p><ul class="cr-endlist cr-crack-list">';
      st.cracks.forEach(function (c) {
        var fl = flawOf(c.f);
        h += '<li><strong>' + esc(fl[0]) + '.</strong> You said: <em>“' + esc(c.t) + '”</em><br>' + esc(c.n || fl[1]) +
          (c.b ? '<span class="cr-held"><b>What would have held:</b> ' + esc(c.b) + '</span>' : '') + '</li>';
      });
      h += '</ul></div>';
    }
    var cov = st.covered.filter(function (t, i, a) { return a.indexOf(t) === i && C.THREADS[t] && !C.THREADS[t].hide; });
    h += '<div class="cr-endsec"><h4>Ground you covered</h4><ul class="cr-endlist">';
    cov.forEach(function (t) {
      var T = C.THREADS[t], href = T.anchor ? '#' + T.anchor : (T.ref || '');
      var title = href ? '<a href="' + esc(href) + '">' + esc(T.title) + '</a>' : esc(T.title);
      h += '<li>' + title + ' <span class="cr-endnote">(' + esc(T.section) + ')</span></li>';
    });
    h += '</ul></div>';
    var missed = Object.keys(C.THREADS).filter(function (t) { return lvlOK(C.THREADS[t]) && !st.visited[t]; });
    if (missed.length) h += '<p class="cr-endnote">Never reached: ' + missed.map(function (t) { return esc(C.THREADS[t].title); }).join(' · ') + '. Play again and follow a different thread.</p>';
    h += '<div class="cr-actions"><button type="button" class="cr-btn cr-btn-primary" data-again="1">Talk again</button><button type="button" class="cr-btn" data-copy="1">Copy transcript</button></div></div>';
    ui.opts.innerHTML = h;
    ui.opts.querySelector('[data-again]').addEventListener('click', intro);
    var cp = ui.opts.querySelector('[data-copy]'); cp.addEventListener('click', function () { copyText(transcriptText(), cp); });
  }

  /* test hook: lets the lint and the smoke test read the live state */
  root.__crossing = { state: function () { return st; }, content: C };
  mount();
})();
