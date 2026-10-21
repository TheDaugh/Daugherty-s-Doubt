/* Term and concept drills for the Premise 1 survey. One card at a time; misses return later in the round. */
(function () {
  'use strict';
  var DECK = [
    { id: 'begin', term: 'Begins to exist', q: 'A pond freezes over in January and thaws in March. A skeptic says the ice began to exist in January. Which description fits the survey’s definition of beginning?', o: [
      ['It exists at some time, and there was no earlier time at which it existed.', 1],
      ['It exists now, and there is some earlier time at which something else existed.', 0],
      ['It exists at some time, and something existed earlier that was made of the same water.', 0],
      ['It exists at some time, and nobody has observed it at an earlier time.', 0]],
      e: 'The definition is about the thing, not the stuff. Ice made of old water still begins, because the ice itself did not exist earlier. Absence of observation is not absence of existence.' },
    { id: 'btheory', term: 'Begins to exist', q: 'On the B-theory of time every moment is equally real. What follows for a universe with a first moment?', o: [
      ['It has a first edge, like a yardstick’s first inch, but nothing comes into being there.', 1],
      ['It has a first edge, and the edge is the moment when a cause must have acted on it.', 0],
      ['It has no first edge, because every moment is real and so none can come earlier than another.', 0],
      ['It has a first edge, and every later moment depends on that edge as an effect depends on its cause.', 0]],
      e: 'The yardstick has a front end without ever having been made at that end. Whether the universe “begins” in the sense premise 1 needs depends on the A-theory.' },
    { id: 'cause', term: 'Cause and explanation', q: 'A mathematician proves that no integer lies between 3 and 4. Which statement is accurate?', o: [
      ['The proof explains why the fact holds, though nothing ever caused the fact to hold.', 1],
      ['The proof caused the fact, so the fact depends on the one who proved it.', 0],
      ['The fact has neither explanation nor cause, since it is a necessity.', 0],
      ['The fact has a cause in the axioms and no explanation, since axioms never answer “why.”', 0]],
      e: 'Every cause explains, but not every explanation is a cause. Premise 1 asks for either, which is why it can be stated without claiming that everything is produced.' },
    { id: 'efficient', term: 'Efficient and material cause', q: 'A potter throws a bowl on a wheel. Which pairing is right?', o: [
      ['The potter is the efficient cause and the clay is the material cause.', 1],
      ['The wheel is the efficient cause and the potter is the material cause.', 0],
      ['The clay is the efficient cause and the potter is the material cause.', 0],
      ['The potter is the material cause and the bowl is the efficient cause.', 0]],
      e: 'The efficient cause does the making and the material cause is what it is made from. Creation from nothing has the first and lacks the second.' },
    { id: 'principle', term: 'Ex nihilo nihil fit', q: 'A vending machine drops a candy bar with no coin, no fault and no technician. Which principle does that violate?', o: [
      ['Ex nihilo nihil fit: nothing begins without a cause or explanation.', 1],
      ['Creatio ex nihilo: nothing is made without God’s causing it.', 0],
      ['The material principle: nothing begins without something to make it from.', 0],
      ['The principle of sufficient reason in its full form: every fact has an explanation.', 0]],
      e: 'The candy bar is ordinary and the machine is ordinary. The violation is the absence of any reason at all. The full PSR is a broader claim than the one broken here, which is why the survey calls premise 1 a restricted version.' },
    { id: 'doctrine', term: 'Creatio ex nihilo', q: 'A critic says: “Christians believe God made the world from nothing, and the kalam says nothing comes from nothing, so they contradict.” What went wrong?', o: [
      ['The doctrine denies a material cause, and the principle denies a missing cause altogether, so both can stand.', 1],
      ['The doctrine and the principle say the same thing, so the critic should simply drop the objection.', 0],
      ['The principle applies only to physical things, and God is not physical, so it does not reach the doctrine.', 0],
      ['The doctrine is a matter of revelation, and the principle is a matter of reason, so they never meet.', 0]],
      e: 'God supplies the efficient cause. What is missing is the material cause. A beginning with no cause at all is what the principle forbids, and the doctrine does not describe one.' },
    { id: 'psr', term: 'Principle of Sufficient Reason', q: 'You find a boulder in a field. Which attitude expresses the PSR?', o: [
      ['There is some answer to why it is there, whether or not anyone finds it.', 1],
      ['There must be an answer, and it will be found if we dig long enough.', 0],
      ['There is an answer if the boulder is of a kind that could have been moved.', 0],
      ['There is an answer if the boulder began to exist at some time.', 0]],
      e: 'The PSR is about existence of an explanation, not its discovery. The last option is premise 1’s restriction, which is narrower than the PSR.' },
    { id: 'brute', term: 'Brute fact', q: 'Which case describes a brute fact rather than an unknown one?', o: [
      ['The boulder is there and has no explanation at all, even in principle.', 1],
      ['The boulder is there and no one will ever learn what put it there.', 0],
      ['The boulder is there and the explanation involves a free choice that cannot be predicted.', 0],
      ['The boulder is there and the explanation is too complicated for any person to follow.', 0]],
      e: 'A brute fact is an absence of explanation, not an absence of knowledge. A free choice, an unknown history and a tangled one all have explanations.' },
    { id: 'possible', term: 'Three kinds of possibility', q: '“The Prime Minister is a prime number” has no internal contradiction. What does the survey conclude?', o: [
      ['It is logically possible and metaphysically impossible.', 1],
      ['It is metaphysically possible and physically impossible.', 0],
      ['It is logically impossible and physically impossible.', 0],
      ['It is physically possible and metaphysically impossible.', 0]],
      e: 'A description can avoid contradiction and still pair kinds of thing that cannot go together. That gap is the room defenders use against Hume.' },
    { id: 'whichpossible', term: 'Three kinds of possibility', q: 'Defenders of premise 1 say an uncaused beginning is impossible. Which kind of impossibility do they need?', o: [
      ['Metaphysical: given what things are, such a thing could not really exist.', 1],
      ['Logical: the idea contains a contradiction, as “a married bachelor” does.', 0],
      ['Physical: the laws of nature forbid it in this universe.', 0],
      ['Epistemic: nobody could ever know that such a thing happened.', 0]],
      e: 'Logical impossibility is more than the argument can show, and physical impossibility is less than it needs, since the laws might not hold at a first moment.' },
    { id: 'conceive', term: 'Conceivability', q: 'Someone pictures a lamp appearing in an empty room with no cause, and calls it possible. What does the survey say about this move?', o: [
      ['Whether a coherent picture is good evidence of real possibility is itself disputed.', 1],
      ['It settles the matter, since whatever can be pictured without contradiction is possible.', 0],
      ['It settles nothing, since pictures never bear on what is possible.', 0],
      ['It shows only physical possibility, since the picture is of a physical thing.', 0]],
      e: 'The picture is silent about the lamp’s cause, so it may fail to show that none exists. Treating it as proof or as irrelevant both overstate.' },
    { id: 'restricted', term: 'Principle of Sufficient Reason', q: 'Premise 1 on the survey’s wording differs from the full PSR in which way?', o: [
      ['It asks for an explanation only of things that begin.', 1],
      ['It asks for a cause only of things that are physical.', 0],
      ['It asks for an explanation only of things that are observed.', 0],
      ['It asks for a cause only of things that are contingent.', 0]],
      e: 'The restriction to beginnings is what keeps the premise from making everything necessary, and what the defenders answer to the collapse objection.' }
  ];

  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }

  function mount(host) {
    var r = rng(Date.now());
    var queue = shuffle(DECK, r), seen = {}, missed = {}, total = DECK.length, done = 0, right = 0, tries = 0;
    host.className = 'dr'; host.innerHTML = '';
    var head = el('div', 'dr-head'), bar = el('div', 'dr-bar'), fill = el('span', ''); bar.appendChild(fill);
    var prog = el('span', 'dr-prog');
    head.appendChild(el('b', '', 'Term drills')); head.appendChild(prog); host.appendChild(head); host.appendChild(bar);
    var card = el('div', 'dr-card'); host.appendChild(card);

    function upd() { prog.textContent = done + ' of ' + total + ' mastered'; fill.style.width = (100 * done / total) + '%'; }

    function show() {
      upd(); card.innerHTML = '';
      if (!queue.length) return end();
      var it = queue[0];
      card.appendChild(el('div', 'dr-term', it.term));
      card.appendChild(el('p', 'dr-q', it.q));
      var opts = shuffle(it.o, r), list = el('div', 'dr-opts'), fb = el('div', 'dr-fb'); fb.setAttribute('aria-live', 'polite');
      opts.forEach(function (o, i) {
        var b = el('button', 'dr-opt', o[0]); b.type = 'button';
        b.addEventListener('click', function () {
          if (card.getAttribute('data-done')) return;
          card.setAttribute('data-done', '1'); tries++;
          Array.prototype.forEach.call(list.children, function (c, k) { c.disabled = true; if (opts[k][1]) c.classList.add('ok'); });
          if (o[1]) { b.classList.add('ok'); right++; fb.appendChild(el('b', '', missed[it.id] ? 'Right, and it is yours now. ' : 'Right. ')); queue.shift(); done++; }
          else { b.classList.add('no'); missed[it.id] = 1; fb.appendChild(el('b', '', 'Not that one. ')); queue.push(queue.shift()); }
          seen[it.id] = 1; fb.appendChild(document.createTextNode(it.e));
          var nx = el('button', 'dr-next', queue.length ? 'Next' : 'Finish'); nx.type = 'button'; nx.addEventListener('click', function () { card.removeAttribute('data-done'); show(); });
          fb.appendChild(nx); upd(); nx.focus();
        });
        list.appendChild(b);
      });
      card.appendChild(list); card.appendChild(fb);
    }

    function end() {
      upd(); card.innerHTML = '';
      card.appendChild(el('div', 'dr-term', 'Round complete'));
      var m = Object.keys(missed).length;
      card.appendChild(el('p', 'dr-q', 'You answered ' + right + ' of ' + tries + ' on the first or a repeat pass. ' + (m ? m + ' term' + (m > 1 ? 's' : '') + ' came back at least once, which is where the definitions are slipperiest.' : 'Nothing came back for a second pass.')));
      var b = el('button', 'dr-next', 'Run again'); b.type = 'button'; b.addEventListener('click', function () { mount(host); }); card.appendChild(b);
    }
    show();
  }

  function boot() { var h = document.getElementById('term-drills'); if (h) mount(h); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.__drills = { DECK: DECK };
}());
