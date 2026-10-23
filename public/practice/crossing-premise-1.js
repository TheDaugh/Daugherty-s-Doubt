/* The Crossing: Premise 1. Conversation content.
 *
 * Authoring rules (crossing-lint.mjs checks the ones a machine can check):
 *  - Every option is a careful claim with a reason attached, or a pointed question.
 *  - An option that fails is a move a published defender could make, with one real flaw,
 *    named by type (f) and explained (n). No slogans, no strawmen, no appeals to authority.
 *  - Sound options and cracked options run to the same length and the same confidence.
 *  - Order is irrelevant: the engine shuffles. Sometimes the sound move is the bold one,
 *    sometimes the one that grants. Sometimes the skeptic is right and the player must say so.
 *
 * Option fields:
 *   k  kind (ask | press | give | grant), shown only after the player chooses
 *   p  hold | dent | crack | shared      t  text      c  one-line version for the ledger
 *   f  flaw type (cracks)                n  why it fails      b  what would have held (optional)
 *   cm commitment key(s) he remembers    fix  commitment this option repairs
 *   np no plank    o  mood nudge    set  flags    lvl 'A' = Advanced only    to  next beat
 */
(function () {
  'use strict';
  var C = window.CROSSING = { BELIEFS: {}, SUPPORTS: [], THREADS: {}, RULES: [], HIS_ORDER: [], JUNCTION: {}, LEAVE: '', FLAWS: {} };

  C.FLAWS = {
    overreach: ['Overreach', 'You claimed more than your argument delivers.'],
    neighbor: ['Wrong target', 'You answered a neighbouring question, not the one he asked.'],
    burden: ['Burden shift', 'You asked him to disprove the claim instead of supporting it.'],
    toomuch: ['Proves too much', 'The same reasoning would also support something you reject.'],
    circular: ['Circular', 'The conclusion is doing the work of a premise.'],
    assert: ['Asserted the hard part', 'You stated the point in dispute instead of arguing for it.'],
    concede: ['Over-granted', 'You gave away something the argument needs.'],
    reify: ['Treated “nothing” as a thing', 'You spoke of nothing as though it were an object with features.'],
    equivocate: ['Equivocation', 'A word changed its meaning in the middle of the argument.'],
    strawman: ['Strawman', 'You answered a weaker view than the one he holds.'],
    inconsistent: ['Inconsistent', 'This contradicts something you said earlier.'],
    rushed: ['Answered before listening', 'He told you what was really in the way, and you moved to your own answer before he had finished.'],
    motive: ['Judged his motives', 'You answered his doubt by guessing why he holds it, which does not reply to the doubt.'],
    doubledown: ['Doubled down', 'You stood on a claim you had been shown to be wrong about.']
  };

  function X(o, x) { if (x) for (var k in x) o[k] = x[k]; return o; }
  function ask(t, to, x) { return X({ k: 'ask', t: t, to: to }, x); }
  function hold(t, c, to, x) { return X({ k: 'give', p: 'hold', t: t, c: c, to: to }, x); }
  function press(t, c, to, x) { return X({ k: 'press', p: 'hold', t: t, c: c, to: to }, x); }
  function dent(t, c, to, x) { return X({ k: 'give', p: 'dent', t: t, c: c, to: to }, x); }
  function grant(t, c, to, x) { return X({ k: 'grant', p: 'dent', t: t, c: c, to: to }, x); }
  function shared(t, c, to, x) { return X({ k: 'grant', p: 'shared', t: t, c: c, to: to }, x); }
  function crack(t, c, f, n, to, x) { return X({ k: 'give', p: 'crack', t: t, c: c, f: f, n: n, to: to }, x); }

  var ART = '/articles/kalam-premise-1/';
  var T = C.THREADS;

  /* ------------------------------------------------------------------ his beliefs */
  C.BELIEFS = {
    godcause: { t: 'If the universe needs a cause, so does whatever caused it.', rev: 'The premise is about whatever begins. A being that never began is outside its scope.', open: '' },
    imagine: { t: 'What can be conceived without contradiction is possible, so an uncaused beginning is possible.', rev: 'A picture of something appearing is silent about its cause. It does not show an uncaused beginning.', open: 'Whether conceivability is good evidence of real possibility.' },
    circular: { t: '“Being cannot come from non-being” only restates the premise.', rev: 'It clarifies the premise instead of proving it, which is what a first principle does.', open: 'Whether a first principle can be known by understanding its terms.' },
    onlyonce: { t: 'Perhaps uncaused beginnings are confined to one case, the beginning of everything.', rev: 'I cannot say what lets the universe begin uncaused while my own experiences may not.', open: 'What, if anything, lets the universe begin uncaused when nothing else may.' },
    physics: { t: 'Physics, not a metaphysical principle, keeps tigers out of kitchens.', rev: '', open: '' },
    firstfree: { t: 'At the first moment nothing is there to restrict what begins.', rev: 'At the first moment nothing explains why this state and not a hostile one. I call that the limit of explanation.', open: 'What, if anything, selects the first state of the universe.' },
    container: { t: 'A rule learned from the universe’s contents need not govern the universe itself.', rev: 'I cannot name what exempts the universe. I only suspect that it is exempt.', open: 'Whether having no before and no outside exempts the universe from the premise.' },
    material: { t: 'The evidence for the premise equally supports “every beginning has material,” so it counts against creation from nothing.', rev: 'My sample contains only finite causes. It cannot rule an infinite cause in or out.', open: 'Whether the material regularity is an accident of the sample or part of what causing is.' },
    nihil: { t: '“Nothing comes from nothing” and “God made the world from nothing” contradict each other.', rev: 'One denies a beginning with no cause. The other denies a beginning with no material. They can be held together.', open: '' },
    vacuum: { t: 'Quantum physics shows particles beginning to exist from nothing.', rev: 'The vacuum is not nothing, and whether its events are unexplained depends on the interpretation.', open: 'Whether quantum events are unexplained or only unpredictable.' },
    rock: { t: 'A rock in a field has an explanation even if no one ever finds it.', rev: '', open: '' },
    brute: { t: 'The universe may be a brute fact, and no explanation is owed.', rev: '“No explanation is owed” is where I choose to stop. I have not shown it.', open: 'Whether “no explanation is owed” is a finding or a choice.' },
    parity: { t: 'Every worldview stops explaining somewhere, and stopping at the universe is simpler than stopping at God.', rev: 'A first state with such specific features does not look necessary.', open: 'Whether a personal stopping point explains better than a physical one.' },
    nothingname: { t: '“Nothing” is not a name, so arguments about what nothing can do are errors of grammar.', rev: 'The premise can be stated without the noun, and “only logic and experience give knowledge” does not survive its own test.', open: 'Whether anything besides logic and experience shows what could exist.' },
    before: { t: 'Causes precede their effects, and there is no before the first moment.', rev: 'Causing does not strictly need a time gap. The hard part is what sort of cause would act without a moment of its own.', open: 'Whether a cause with no moment of its own is coherent.' },
    kant: { t: 'Causality is the form of our experience, and the universe as a whole is never experienced.', rev: 'If Kant’s limit holds, it stops my denial as much as your affirmation.', open: 'Whether causation is a real feature of things or a form of the mind.' },
    bccf: { t: 'If every fact needs an explanation, everything turns out to be necessary.', rev: 'The premise asks for less than the full principle, and the line it draws is not arbitrary.', open: 'Why explanation is owed to beginnings and not to everything.' },
    nocause: { t: 'Fundamental physics contains no causes, only laws and probabilities.', rev: 'Laws plus an initial state explain a great deal. Whether they explain the initial state is the live question.', open: 'Whether laws can explain an initial state.' },
    measure: { t: 'Probabilities spread over infinitely many starting states mean nothing.', rev: 'The numbers are shaky, and the qualitative point may be all that survives.', open: 'Whether the argument survives without a probability measure.' }
  };

  /* ------------------------------------------------------------------ lines the player can offer as their own */
  C.SUPPORTS = [
    hold('A beginning with no source would be a thing that is, with nothing at all, no cause, ground or reason, to make the difference between its being and its not being. That is being from non-being.', 'Being cannot come from non-being.', '@circle', { cm: 'fp' }),
    hold('If things could begin with no cause, nothing would limit what began: universes, tigers, bicycles, anywhere and at any time. Beginnings are not indiscriminate, so they are not uncaused.', 'Nothing would limit what begins uncaused.', '@tiger', { cm: 'reductio' }),
    hold('Every beginning anyone has observed has had a cause, and every laboratory depends on that. The principle is confirmed without exception across the whole of experience.', 'Every observed beginning has had a cause.', '@morriston', { cm: 'induct' }),
    hold('If things can begin with no cause, so can your experiences, and from the inside they would look just the same. Your perceptions would stop being evidence for anything.', 'Denying the premise costs you your perceptions.', '@price', { cm: 'priceclaim' }),
    hold('Independent measurements of the age of the universe agree on about 13.8 billion years. An unexplained beginning gives no reason to expect that agreement.', 'The clocks agree (Lu).', '@lu', { cm: 'lu', lvl: 'A' }),
    crack('Nothing has no properties and no powers, so it cannot bring anything about. A beginning out of nothing therefore has no possible source.', 'Nothing has no powers, so it cannot produce anything.', 'reify', 'This treats “nothing” as a thing with a peculiar property. Stated with quantifiers, the argument needs no such noun: if the premise is false, something begins and nothing explains it.', '@tiger:reify', { cm: 'nothingprops' }),
    crack('The Big Bang is a beginning, and it was caused, since a universe cannot start itself. So physics itself supplies the evidence that beginnings have causes.', 'The Big Bang is evidence that beginnings have causes.', 'neighbor', 'The Big Bang bears on whether the universe began, which is the second premise. It is silent on whether beginnings need causes.', '@open:bb', { cm: 'bigbang' })
  ];

  C.__helpers = { ask: ask, hold: hold, press: press, dent: dent, grant: grant, shared: shared, crack: crack, ART: ART };
}());
(function () {
  'use strict';
  var C = window.CROSSING, H = C.__helpers, T = C.THREADS;
  var ask = H.ask, hold = H.hold, press = H.press, dent = H.dent, grant = H.grant, shared = H.shared, crack = H.crack, ART = H.ART;

  /* ============================================================ the opening */
  T.open = {
    title: 'The opening', section: 'Premise 1: The Debate', anchor: '', lvl: 'S',
    beats: {
      start: { him: 'Let me check that I have the pitch. Whatever begins to exist has a cause, the universe began to exist, so the universe has a cause, and that cause is God. Which of those steps does the first line carry?', opts: [
        hold('Only the first. It says that whatever begins to exist has a cause or an explanation. Whether the universe began, and what its cause is like, each take a further argument.', 'The first line says only that beginnings have a cause or explanation.', 'who', { cm: 'modest' }),
        crack('All three, in effect. A cause of the whole universe has to be timeless, immensely powerful and personal, which is what the word God has always meant, so the first line already points there.', 'The first line already points to God.', 'overreach', 'The first line says only that beginnings have a cause or explanation. The attributes come from the conclusion article’s argument, and the name God from further argument still. Claiming them at once lets him reject the whole package.', 'over', { cm: 'theism' }),
        crack('The first two. The Big Bang shows that the universe began, and whatever begins needs a cause, so the physics and the principle confirm each other.', 'The Big Bang confirms the principle.', 'neighbor', 'The Big Bang is evidence for the second premise. It says nothing about whether beginnings need causes, which is the point he doubts.', 'bb', { cm: 'bigbang' }),
        ask('Which of the three would you like to press first? I can take them in whatever order suits you.', 'what')
      ] },
      over: { him: 'You moved from “a cause” to “God” in a single step. I will grant a cause for the sake of argument. What I want defended is the first line.', opts: [
        grant('That is fair. The argument reaches a cause, and who or what that cause is takes more than this premise can supply. So, the first line.', 'Separated the cause from the God of theism.', 'who', { fix: 'theism' }),
        ask('What troubles you about the first line? I would rather start from your objection than from my summary.', '@hume')
      ] },
      who: { him: 'Then the obvious question. If whatever begins needs a cause, what caused God?', his: 'godcause', opts: [
        hold('Nothing did. The premise covers whatever begins, and a being who never began falls outside it. The question assumes a premise I did not state.', 'God did not begin, so the premise does not ask for his cause.', 'god2', { cm: 'godnever' }),
        crack('The premise is a principle about physical things inside the universe. God is not a physical thing inside it, so the principle was never meant to reach him.', 'The premise is about things inside the universe.', 'toomuch', 'If the premise were a rule for the universe’s contents, it would not reach the universe either, and the whole argument would lose its target. God needs no cause because he did not begin, not because of where he is.', 'outside', { cm: 'outside' }),
        crack('God is self-caused. His existence flows from his own nature, which is the strongest sense of “cause” there is, so even by your standard he is accounted for.', 'God is self-caused.', 'equivocate', 'The premise says “cause or explanation,” and a necessary being has an explanation without a cause. Calling that self-causation invites the reply that nothing can bring itself into existence.', 'selfc', { cm: 'selfcaused' })
      ] },
      selfc: { him: 'Self-caused? A thing would have to exist before it could cause itself to exist. Does that not reverse the order of cause and effect?', opts: [
        grant('The word was wrong. A necessary being is not caused at all. Its existence has an explanation without a cause, and that is why the premise says “cause or explanation.”', 'Uncaused with an explanation, not self-caused.', 'god2', { fix: 'selfcaused', cm: 'godnever' }),
        crack('Causes need not come earlier than their effects. A ball resting on a cushion causes the dent at the same moment, so simultaneous self-causation is not circular.', 'Causes can be simultaneous, so self-causation is possible.', 'neighbor', 'Simultaneous causation has two distinct things, the ball and the cushion. A thing that causes itself has one, and it would have to be there to do the causing before it existed.', 'god2')
      ] },
      outside: { him: 'Then I will place the first moment of the universe outside the universe’s rules too. It is not inside the universe either, is it?', opts: [
        grant('Fair. Where God is was never the point. What matters is that the universe began and the God of classical theism did not.', 'The difference is beginning, not location.', 'god2', { fix: 'outside', cm: 'godnever' }),
        ask('Why would the first moment sit outside the rules? What feature of it would exempt it?', '@exception:alt')
      ] },
      god2: { him: 'That is a narrower claim than I expected, and “who made God” does not touch it. My trouble is with the first line itself.', rev: 'godcause', opts: [
        ask('Then what is the trouble? I would rather hear the objection than guess at it.', '@hume')
      ] },
      what: { him: 'The first. I do not find it obvious that every beginning has a cause, and I would like to know why you do.', opts: [
        ask('What makes it less than obvious to you? Is it something you can picture, or something you have read?', '@hume'),
        crack('Because the Big Bang is precisely the fingerprint of a cause. A universe with a beginning is a universe that something began, and cosmology already says so.', 'Cosmology says something began the universe.', 'neighbor', 'That is premise 2’s evidence. The Big Bang supports the claim that the universe began, and is silent on whether beginnings need causes.', 'bb', { cm: 'bigbang' }),
        hold('It is close to obvious once you ask what a beginning with no source would be: a thing with nothing at all making the difference between its being and its not being.', 'Being cannot come from non-being.', '@circle', { cm: 'fp' })
      ] },
      bb: { him: 'The Big Bang is evidence that the universe began. My question was why anything that begins needs a cause. Are those the same question?', opts: [
        grant('They are different questions. The Big Bang bears on whether the universe began, and the first line is about what any beginning requires. Let me take the second.', 'Kept premise 1 and premise 2 apart.', '@hume', { fix: 'bigbang' }),
        crack('They are linked. If the universe began, the burden falls on you to explain how it could have done so with no cause, so the evidence already favours me.', 'If it began, the burden is on him to show how.', 'burden', 'He asked for a reason to believe the premise. Handing him the burden does not supply one, and the Big Bang does not touch it.', '@hume')
      ] }
    }
  };

  /* ============================================================ Hume */
  T.hume = {
    title: 'Hume: we can imagine it', section: 'Hume: we can imagine it', anchor: 'hume-we-can-imagine-it', lvl: 'S', by: 'him',
    lead: 'Let me begin with what makes the premise hard for me to accept.',
    beats: {
      start: { him: 'I can form a clear idea of a thing beginning to exist and, separately, a clear idea of its cause. If the two ideas come apart without contradiction, why should I think the first requires the second?', his: 'imagine', opts: [
        ask('When you form that idea of a beginning, what does the picture contain? I would like to see what is in it before I answer.', 'see', { o: 0 }),
        hold('A picture free of contradiction shows logical possibility only. Whether such a beginning could really occur depends on what a beginning is, and that is what the first line is about.', 'Logical possibility is not real possibility.', 'what', { cm: 'logmeta' }),
        crack('I accept that an uncaused beginning is possible. My claim is that it never happens, and that the regularity of experience gives us confidence it never will.', 'Possible, but it never happens.', 'concede', 'Granting real possibility turns the premise into a generalization, and the universe could be the one case. The distinction you needed was logical versus metaphysical possibility.', 'improb', { cm: 'possible' }),
        crack('Conceivability is no evidence of possibility at all, so your picture proves nothing. The premise rests on its intuitive force, which nobody needs to picture.', 'Conceivability is no evidence of possibility.', 'toomuch', 'If conceivability is no evidence, intuitive force is not either, since the faculty is the same. He will ask why he should trust your intuition when he cannot trust his picture.', 'unrel', { cm: 'imagunrel' })
      ] },
      improb: { him: 'If an uncaused beginning is possible, the universe may be that one improbable case. Improbability cannot exclude a single event that happens once. What excludes it?', opts: [
        grant('Nothing, on the terms I granted, and I granted too much. There is no contradiction in it, which is logical possibility, but I deny that it could really happen.', 'Logically possible, metaphysically impossible.', 'what', { fix: 'possible', cm: 'logmeta' }),
        crack('The probability is effectively zero. An event that improbable is one a reasonable person treats as impossible, and no reasonable person plans around it.', 'Improbable enough to treat as impossible.', 'overreach', 'Probability cannot rule out a single unrepeatable case, and there is no measure over beginnings to make the number meaningful. The distinction you needed was between logical and metaphysical possibility.', 'what', { cm: 'ignoreit' })
      ] },
      unrel: { him: 'Then why should I trust the intuition that everything needs a cause? It is the same faculty you have just dismissed.', opts: [
        grant('You are right. I should be narrower. Your picture leaves the cause out of the frame. It does not show that there is none, and that is all I need.', 'Narrowed: the picture leaves the cause out.', 'seec', { fix: 'imagunrel' }),
        crack('Conceivability misleads, but intuition about necessity does not. We see that two and two make four without picturing anything, and the same faculty sees that beginnings need sources.', 'Intuition about necessity is reliable.', 'assert', 'That asserts the faculty’s reliability for this case, which is what he is questioning. The parity with perception is the argument that supports it.', 'seer')
      ] },
      see: { him: 'A rabbit, say. One moment there is nothing on the table, the next moment there is a rabbit.', opts: [
        press('Does your picture show that no cause is present, or does it leave the cause out of the frame?', 'The picture is silent about causes.', [{ if: { o: '>=1' }, to: 'seec' }, { to: 'seer' }]),
        hold('Anscombe’s point applies. When I picture a rabbit appearing, I picture a rabbit appearing, out of a hat perhaps. The picture is silent about causes, so it cannot show their absence.', 'A picture cannot depict the absence of a cause.', 'seec', { cm: 'anscombe' }),
        crack('There must be a trapdoor or a conjuror you are not picturing. Rabbits do not appear from nothing, so your picture already contains a cause that you have not drawn.', 'There is a cause you have not pictured.', 'assert', 'That asserts the premise instead of showing what his picture lacks. The point is that the picture is silent about causes, not that it secretly contains one.', 'seer', { cm: 'magician' })
      ] },
      seec: { him: 'It leaves the cause out, I suppose, and a picture cannot show an absence. That is Anscombe’s point. I will grant it.', rev: 'imagine', opts: [
        hold('It cuts one way only. Imagination cannot disprove the premise, but it does not prove it either, so I still owe you a positive reason.', 'Imagining is not evidence of possibility.', 'what', { np: true }),
        crack('It cuts in my favour, and decisively: no one can coherently picture a beginning with no cause, so the premise is established.', 'Anscombe establishes the premise.', 'overreach', 'Anscombe blocks Hume’s argument against the premise. Removing a disproof is not a proof.', 'what', { cm: 'proved' })
      ] },
      seer: { him: 'Perhaps imagination is silent. Then so is the intuition that everything needs a cause. Why trust that feeling any more than my picture?', def: 'imagine', opts: [
        hold('On the same basis you trust memory and perception. Neither can be vouched for without using it, so if you single out this principle you owe a reason for the line.', 'The causal principle has the credentials perception has.', 'reid', { cm: 'parityreid' }),
        crack('Because an orderly world is the product of a rational source, and a mind made by such a source is built to track how things are, causes included.', 'Our minds are built to track causes.', 'circular', 'It uses the existence of a rational source, the conclusion of the argument, to support a premise of the argument. He will not grant the source in order to grant the premise.', 'reid', { cm: 'assumegod' })
      ] },
      reid: { him: 'Perception has a long record of success. What is the record for a principle about beginnings?', opts: [
        press('The record is as good. No beginning anyone has checked has lacked a cause, and every laboratory is built on the assumption that none will.', 'No observed beginning has lacked a cause.', '@morriston', { cm: ['noexception', 'induct'] }),
        hold('The record is better than perception’s, which fails in illusions and hallucinations. The causal principle has never failed, so it is certain.', 'The causal principle is certain.', '@morriston', { cm: 'certain' }),
        crack('A track record is the wrong test for a first principle. Nobody checks the law of non-contradiction against experience, and the causal principle belongs in the same class.', 'First principles need no track record.', 'overreach', 'Premise 1 is not a law of logic. Denying it produces no contradiction on paper, which is exactly Hume’s point, so it cannot borrow the standing of non-contradiction.', '@morriston', { cm: 'logiclaw' })
      ] },
      what: { him: 'Then give me your reason. Whatever I can picture, what makes you think a beginning with no cause could not really happen?', opts: [{ sup: true }] }
    }
  };

  /* ============================================================ the first principle */
  T.circle = {
    title: 'Is the first principle circular?', section: 'From what being is', anchor: '', lvl: 'S', ref: ART + '#from-what-being-is',
    beats: {
      start: { him: '“Being cannot come from non-being.” Is that not your premise in a different coat? Saying it twice is not an argument.', his: 'circular', opts: [
        hold('A first principle clarifies more than it proves. “No effect exceeds its cause” and “you cannot get blood from a stone” are one claim, and the proverb shows what the principle means.', 'A first principle clarifies; it does not derive.', [{ if: { o: '>=1' }, to: 'clar' }, { to: 'clarr' }]),
        crack('It is not circular, because “nothing comes from nothing” is a law of logic. To deny it is to contradict oneself, and no one can coherently deny a contradiction.', '“Nothing comes from nothing” is a law of logic.', 'overreach', 'Denying it produces no contradiction on paper. It is a metaphysical first principle, known by seeing what a beginning with no source would be, not a theorem of logic.', 'show', { cm: 'logiclaw' }),
        crack('It is not circular, since every observation we have ever made confirms it. The evidence is independent of how the principle happens to be worded.', 'Every observation confirms it.', 'neighbor', 'That is a different support with its own weakness, Morriston’s. Say which support you are offering.', 'swap', { cm: 'induct' })
      ] },
      swap: { him: 'So it is induction after all, and not a first principle? Then it inherits induction’s limit: a sample taken from inside the universe.', opts: [
        hold('They are two routes. The first principle is seen by understanding what a source-less beginning would be, and induction confirms it wherever we look. Each has to stand on its own.', 'Two independent routes to the premise.', 'clarr', { np: true }),
        crack('Then let induction carry it alone. Whatever its limits, a sample as large and uniform as ours is the strongest evidence anyone has for any law.', 'Let induction carry it alone.', 'concede', 'Dropping the first principle leaves the premise on the one support that has Morriston’s problem and Mackie’s. The nine arguments are meant to cover one another’s seams.', 'clarr', { cm: 'g_indalone' })
      ] },
      clar: { him: 'Clarifying a claim does not make it true. But I see what you are doing with it.', rev: 'circular', opts: [
        hold('Then here is a line that does not need you to see it. If things can begin uncaused, so can your experiences, and you could not tell.', 'Denying the premise costs you your perceptions.', '@price', { cm: 'priceclaim' }),
        hold('Then consider selectivity. If things could begin uncaused, nothing would limit what began, and beginnings would be indiscriminate. They are not.', 'Nothing would limit what begins uncaused.', '@tiger', { cm: 'reductio' }),
        crack('Then it is self-evident, and a self-evident claim needs no further argument from anyone who understands its terms. The failure to see it is a failure of the hearer.', 'The principle is self-evident.', 'burden', 'Self-evidence that one party cannot see is not a reason for that party. Offering the principle again, louder, leaves him with nothing new to weigh.', 'clarr')
      ] },
      clarr: { him: 'Clarifying a claim does not make it true, and I still do not see it. What else do you have?', def: 'circular', opts: [
        hold('Then here is a line that does not need you to see it. If things can begin uncaused, so can your experiences, and you could not tell.', 'Denying the premise costs you your perceptions.', '@price', { cm: 'priceclaim' }),
        hold('Then consider selectivity. If things could begin uncaused, nothing would limit what began, and beginnings would be indiscriminate. They are not.', 'Nothing would limit what begins uncaused.', '@tiger', { cm: 'reductio' })
      ] },
      show: { him: 'A contradiction? Show me one. “Something began and nothing caused it.” Where exactly is the contradiction?', def: 'circular', opts: [
        grant('There is none on paper, and I overstated it. The principle concerns what a beginning with no source would be, which is a metaphysical matter, not a matter of logical form.', 'It is metaphysical, not logical.', 'clarr', { fix: 'logiclaw' }),
        crack('The contradiction lies in “began.” A beginning is a transition from not-being to being, and a transition with nothing to effect it is no transition at all.', 'A causeless transition is a contradiction in terms.', 'circular', 'That builds the premise into the meaning of “began” and then reads it back as a contradiction. He will say it is the principle again in a different word.', 'clarr')
      ] }
    }
  };

  /* ============================================================ the price of denial */
  T.price = {
    title: 'The price of denial', section: 'From what denial would permit', anchor: '', lvl: 'S', ref: ART + '#from-what-denial-would-permit',
    beats: {
      start: { him: 'If things can begin uncaused, then my experience of this coffee cup might have no cause, and I could not tell. That is a steep price. But I may need only one uncaused beginning: the universe.', his: 'onlyonce', opts: [
        press('Then you need a line. What lets the universe begin uncaused but not your experiences?', 'He needs a line between the universe and his experiences.', [{ if: { o: '>=1' }, to: 'linec' }, { to: 'liner' }]),
        hold('A smoke alarm that sometimes sounds for no reason at all cannot tell you there is smoke, even on the nights there is. That is the price: perception stops being evidence.', 'An alarm that can sound uncaused tells you nothing.', 'alarm', { cm: 'alarm' }),
        crack('Then you cannot trust anything you see. Since that is absurd, the denial fails, and what takes its place is a world with a source, which is God.', 'The price of denial proves God.', 'neighbor', 'The argument prices the denial. It shows that denying the premise is expensive, and says nothing about God.', 'god', { cm: 'pricegod' })
      ] },
      god: { him: 'I was following you until the last step. You have shown that denial is costly. You have not shown anything about God.', opts: [
        grant('That is fair. I overreached. The argument prices the denial and no more. Which brings us back to your line: why only the universe?', 'The argument prices the denial; it does not prove God.', 'alarm', { fix: 'pricegod' }),
        crack('The step is small. Once a world with a source is the only alternative to an unreliable one, the source is a fair description of the God the theist means.', 'A source is a fair description of God.', 'doubledown', 'A source of the universe is not yet the God of theism. That step belongs to the conclusion article, and taking it here costs you the ground you had.', 'alarm')
      ] },
      alarm: { him: 'A vivid image, but my reply stands. Only the universe is allowed one.', opts: [
        press('Then what lets the universe begin uncaused but not your experiences? Name the difference.', 'He needs a line between the universe and his experiences.', [{ if: { o: '>=1' }, to: 'linec' }, { to: 'liner' }]),
        crack('There is no difference. The universe is simply the largest thing that began, and size cannot be the difference between needing a cause and not.', 'The universe is not different from other beginnings.', 'overreach', 'It is unlike every other beginning: no before, no outside. Denying that costs credibility. Grant the difference, then ask why it helps him.', 'liner', { cm: 'notspecial' })
      ] },
      linec: { him: 'I would have to say that nothing comes before the universe to do the restricting. Said aloud, that is an odd thing to lean on.', rev: 'onlyonce', opts: [
        ask('Go on. Why would having nothing before it be a reason for it to begin uncaused?', '@exception:alt'),
        hold('It sounds like a reason to expect fewer restrictions, which is what the premise denies. With nothing before it, nothing is there to limit what could begin.', 'No before means nothing to restrict what begins.', '@exception:alt', { np: true })
      ] },
      liner: { him: 'Because it is the universe, the whole thing and not a part of it.', def: 'onlyonce', opts: [
        ask('Say more. Why does being the whole thing matter to whether it needs an explanation?', '@exception:alt'),
        hold('Being the whole is a difference, but a difference is not yet a reason. A reason would say why the whole may begin unexplained when each of its parts may not.', 'A difference is not a reason for exemption.', '@exception:alt', { np: true })
      ] }
    }
  };
}());
(function () {
  'use strict';
  var C = window.CROSSING, H = C.__helpers, T = C.THREADS;
  var ask = H.ask, hold = H.hold, press = H.press, dent = H.dent, grant = H.grant, shared = H.shared, crack = H.crack, ART = H.ART;

  /* ============================================================ the reductio */
  T.tiger = {
    title: 'Why not a tiger?', section: 'From what denial would permit', anchor: '', lvl: 'S', ref: ART + '#from-what-denial-would-permit',
    beats: {
      start: { him: 'I follow the tiger. But tigers stay out of kitchens because of physics: matter, energy, conservation laws and probabilities. Why does your premise need to do any of that work?', his: 'physics', opts: [
        press('Then physics is what explains why there are no tigers, and an explanation is exactly what the premise asks for. On your view there is a restriction, and a restriction is an explanation.', 'Laws are an explanation.', 'first', { cm: 'lawsexplain' }),
        crack('And what accounts for the laws? An orderly physics is itself evidence of a lawgiver, so the premise is doing work after all, one level up.', 'Orderly laws point to a lawgiver.', 'circular', 'That is a design argument for the conclusion, offered in defence of the premise. He said physics does the work without the premise. The reply that works is that physics doing the work is itself an explanation.', 'wrote', { cm: 'godlaws' }),
        crack('Physics cannot touch the question. Nothing has no properties, so it cannot favour tigers over universes, and nothing can restrict an uncaused beginning.', 'Nothing has no properties, so it cannot restrict anything.', 'reify', 'That treats “nothing” as an object with a property, which is Carnap’s charge. Stated with quantifiers: if the premise is false, something begins with nothing explaining it, so nothing limits which things begin.', 'reify', { cm: 'nothingprops' })
      ] },
      alt: { him: 'Matter, energy, conservation laws, probabilities. A tiger assembling itself in a kitchen is astronomically improbable. No principle is needed.', his: 'physics', opts: [
        press('Then physics is what explains why there are no tigers, and an explanation is exactly what the premise asks for. On your view there is a restriction, and a restriction is an explanation.', 'Laws are an explanation.', 'first', { cm: 'lawsexplain' }),
        crack('And what accounts for the laws? An orderly physics is itself evidence of a lawgiver, so the premise is doing work after all, one level up.', 'Orderly laws point to a lawgiver.', 'circular', 'That is a design argument for the conclusion, offered in defence of the premise. The reply that works is that physics doing the work is itself an explanation.', 'wrote', { cm: 'godlaws' })
      ] },
      wrote: { him: 'You are using a lawgiver to defend a premise in an argument for a lawgiver. Is that not circular?', opts: [
        grant('It is, and I withdraw it. If physics keeps tigers out, physics is an explanation, and the premise asks only for one.', 'Laws are an explanation.', 'first', { fix: 'godlaws', cm: 'lawsexplain' }),
        crack('It is not circular. I am not assuming the lawgiver, I am pointing to a fact, lawful order, that the lawgiver best explains.', 'Order is the fact; the lawgiver explains it.', 'neighbor', 'That is a separate argument from design, with its own premises. It does not answer how a premise about beginnings is supposed to be supported.', 'first')
      ] },
      reify: { him: 'You are speaking of nothing as though it were a thing with features: no properties, no preferences. Is that not a mistake of grammar?', opts: [
        grant('Fair. Put without the noun: if the premise is false, something begins with nothing explaining it, so nothing limits which things begin.', 'Restated the reductio without the noun.', 'alt', { fix: 'nothingprops' })
      ] },
      first: { him: 'Within the universe, yes. But the first moment has no physics before it. What is there to keep anything out?', his: 'firstfree', opts: [
        press('Then at that first moment, what keeps a tiger from being what begins? If nothing does, the order we find needs an account.', 'What keeps a tiger from being what begins?', [{ if: { o: '>=1' }, to: 'limc' }, { to: 'limr' }]),
        crack('God was there at the first moment, and his will is what restricts what begins. That is how the premise gets its grip on a moment with no physics.', 'God restricts what begins.', 'circular', 'That puts the conclusion inside the premise. The point is that if the beginning is unexplained, nothing restricts what begins.', 'assume', { cm: 'assumegod' }),
        crack('I grant that nothing restricts the first moment. But the reductio concerns what happens inside the universe, and it was never meant to settle that case.', 'The reductio does not apply at the first moment.', 'concede', 'The first moment is exactly the case that matters, so granting it hands over the argument. Your reply should be that the absence of restriction is the problem, not an exemption.', 'limr', { cm: 'g_first' })
      ] },
      assume: { him: 'You are assuming what you set out to prove.', opts: [
        grant('You are right. Leave God out. If nothing explains the beginning, what keeps a tiger from being what begins?', 'Kept the conclusion out of the premise.', [{ if: { o: '>=1' }, to: 'limc' }, { to: 'limr' }], { fix: 'assumegod' })
      ] },
      limc: { him: 'Nothing does, on my view. I would call that the limit of explanation, not evidence of a cause.', rev: 'firstfree', opts: [
        hold('That is the whole question. An orderly start with nothing behind it is what the premise denies, so the disagreement is now about whether to accept such a start.', 'An unexplained orderly start is what the premise denies.', 'END'),
        ask('On your view, are there causes at all at the level of fundamental physics?', '@linford', { lvl: 'A' }),
        crack('If nothing explains the order, then the order is inexplicable on your view, and an inexplicable order is itself evidence that something stands behind it.', 'Inexplicable order points to something behind it.', 'overreach', 'Failing to explain something on one view is not evidence of an orderer. It shows what the view leaves open.', 'END')
      ] },
      limr: { him: 'Nothing has to. The first state is simply whatever it was.', def: 'firstfree', opts: [
        press('Then an orderly universe began for no reason, with nothing to stop it beginning as chaos. Why should you expect order at all?', 'An unexplained start gives no reason to expect order.', 'order'),
        crack('Then the order itself shows design, and the premise is not needed. Anything that begins in such an orderly way was arranged.', 'Order shows design.', 'neighbor', 'Perhaps, but that is a design argument, not premise 1. Stay on whether an unexplained start gives any reason to expect order.', 'order', { cm: 'designjump' })
      ] },
      order: { him: 'I do not expect the order. I observe it.', opts: [
        hold('That is my point. Your view permits the order we observe without predicting it, while a source with reasons would produce it.', 'Order is permitted on his view, not expected.', 'END', { np: true }),
        hold('Look at how much order there is: independent clocks agree on a single age for the universe. An unexplained start gives no reason to expect that.', 'The clocks agree (Lu).', '@lu', { lvl: 'A' })
      ] }
    }
  };

  /* ============================================================ Mackie and Oppy */
  T.exception = {
    title: 'The universe is the exception', section: 'Mackie and Oppy: the universe is the exception', anchor: 'mackie-and-oppy-the-universe-is-the-exception', lvl: 'S', by: 'him',
    lead: 'Let me put my real worry on the table.',
    beats: {
      start: { him: 'Everything we have seen begin was a rearrangement of something already there. The universe is not one more item inside the universe. Why stretch a rule learned from the contents to the container?', his: 'container', opts: [
        hold('A rule holds by default until you name a reason for an exception. Water boils at 100°C except in Denver, and Denver has a reason. What is the universe’s Denver?', 'Exceptions need a stated reason.', 'denver', { cm: 'noexc' }),
        ask('What would make it the exception? Which feature of the universe bears on whether it needs a cause?', 'diff'),
        crack('Nothing about the universe makes it different in a way that matters. Size and totality are not features that exempt anything from needing a cause.', 'Nothing about the universe is different.', 'overreach', 'It is unlike every other beginning: no before, no outside. He is right about that. Grant the difference and ask why it helps him.', 'special0', { cm: 'notspecial' }),
        hold('The rule has never failed once anywhere we can check, so it is certain, and a certain rule reaches the container as well as the contents.', 'The causal principle is certain.', 'diff', { cm: 'certain' })
      ] },
      alt: { him: 'Because every beginning we have seen happened inside a world that was already there. The universe is that world, not something in it. A rule learned from the contents may not reach the container.', his: 'container', opts: [
        hold('A rule holds by default until you name a reason for an exception. Water boils at 100°C except in Denver, and Denver has a reason. What is the universe’s Denver?', 'Exceptions need a stated reason.', 'denver', { cm: 'noexc' }),
        ask('What would make it the exception? Which feature of the universe bears on whether it needs a cause?', 'diff'),
        crack('Nothing about the universe makes it different in a way that matters. Size and totality are not features that exempt anything from needing a cause.', 'Nothing about the universe is different.', 'overreach', 'It is unlike every other beginning: no before, no outside. He is right about that. Grant the difference and ask why it helps him.', 'special0', { cm: 'notspecial' })
      ] },
      special0: { him: 'It began with no before and no outside, and nothing else did. That is special by any measure.', opts: [
        grant('Fair. It is unlike every other beginning. The question is whether that difference gives you a reason for exemption.', 'Granted the universe is unlike other beginnings.', 'diff', { fix: 'notspecial', cm: 'g_cont' })
      ] },
      diff: { him: 'No before and no outside. Everything else that begins has a world around it. The universe does not.', opts: [
        press('Those features make an unexplained beginning worse. With no before and no outside, nothing is there to restrict what begins, which is the tiger problem at full strength.', 'No before, no outside: nothing restricts what begins.', [{ if: { o: '>=2' }, to: 'exc' }, { if: { flag: 'pinned_rock' }, to: 'exc' }, { to: 'exr' }]),
        crack('Then God is the before and the outside. He supplies what the universe lacks, which is why it can begin without anything in the world around it.', 'God is the before and the outside.', 'circular', 'That answers an objection to the premise with the conclusion. Show why his difference cuts against him, not that God fills it.', 'exr', { cm: 'assumegod' }),
        crack('A difference in setting is not a difference in kind. Beginnings inside a world and beginnings of a world are both beginnings, so the rule should cover both alike.', 'A beginning is a beginning, whatever the setting.', 'assert', 'That states the conclusion he is questioning, that the rule reaches the container. The setting is exactly what he claims makes a difference.', 'exr')
      ] },
      denver: { him: 'No before and no outside. That is my Denver.', opts: [
        press('Altitude is a reason water boils lower. “No before” is not a reason something begins unexplained. It removes everything that could restrict what begins.', 'No before, no outside: nothing restricts what begins.', [{ if: { o: '>=2' }, to: 'exc' }, { if: { flag: 'pinned_rock' }, to: 'exc' }, { to: 'exr' }]),
        crack('Then there are no exceptions, which is what it means to be a law. A rule with an exception is not a rule, and Denver shows only that the rule was mis-stated.', 'A law has no exceptions.', 'overreach', 'Defaults do have exceptions. That was the point of Denver. The claim is that each exception needs a reason, and his feature is not one.', 'exr', { cm: 'noexcever' })
      ] },
      exc: { him: 'Then I cannot name what makes it exempt. I suspect that it is, but I cannot say why.', rev: 'container', opts: [
        hold('A suspicion is a respectable place to stand. It is not a reason, and the premise asks for reasons.', 'A suspicion is not a reason.', 'END'),
        ask('Then why stop explaining at the universe rather than at something that never began?', '@parity', { lvl: 'A' }),
        crack('Then you concede that the universe is not exempt, and with it the premise applies to the universe. The first line is settled, and only the second remains.', 'He concedes the first line is settled.', 'overreach', 'Failing to name an exemption on one occasion is not conceding the premise. He has a suspicion and the other supports still have to be made.', 'END')
      ] },
      exr: { him: 'Or the rule simply does not apply there, and you cannot show that it does.', def: 'container', opts: [
        hold('Nor can you show that it does not. So compare them: a rule with no known exception against an exception with no known reason. Which is more reasonable to believe?', 'A rule with no exception against an exception with no reason.', 'END'),
        ask('Is that because you think causation applies only inside experience?', '@kant', { lvl: 'A' })
      ] }
    }
  };

  /* ============================================================ Morriston */
  T.morriston = {
    title: 'The induction proves too much', section: 'Morriston: the induction proves too much', anchor: 'morriston-the-induction-proves-too-much', lvl: 'S', by: 'him',
    lead: 'There is a problem with your evidence, actually.',
    beats: {
      start: { him: 'Every beginning anyone has observed had a cause. It also had material behind it: tables from wood, stars from gas. The same evidence says that whatever begins has a material cause. By your own induction, God could not have made the world from nothing.', his: 'material', opts: [
        ask('Does your sample include people? Carpenters, parents? What did they start from?', 'people', { set: ['pinned_people'] }),
        hold('Every cause in that sample is finite, and finite causes rearrange what already exists. The material is a feature of the kind of cause sampled, and the sample says nothing about an infinite cause.', 'The sample contains only finite causes.', [{ if: { flag: 'pinned_people' }, to: 'either' }, { if: { o: '>=1' }, to: 'either' }, { to: 'eitherr' }]),
        crack('God is spirit and needs no material, so he is the difference. The sample has only bodies, and spirit is a different kind of cause altogether.', 'God is spirit, so he needs no material.', 'assert', 'True as theology, but it answers by asserting what the sample cannot show. The question was whether your evidence supports a material-cause rule. Say why the sample is limited, not that God is the exception to it.', 'spirit', { cm: 'spirit' }),
        grant('Fair. Induction alone cannot separate “has a cause” from “has a material cause.” I need another support, and I will look for one.', 'Induction alone cannot separate the two rules.', 'apart', { cm: 'g_indalone' })
      ] },
      spirit: { him: 'You are telling me what God is like. I am asking what your evidence shows.', opts: [
        grant('Fair. The evidence shows finite causes rearranging what is there. It cannot speak to an infinite cause, either way.', 'Answered from the sample, not from God’s nature.', 'either', { fix: 'spirit' })
      ] },
      people: { him: 'Sure. And every one of them works from material too. The carpenter needs wood.', opts: [
        hold('Which tells you something about carpenters. Every cause you have seen is finite, and finite causes rearrange. The sample cannot say anything about an infinite cause, either way.', 'The sample contains only finite causes.', 'either'),
        crack('But the carpenter’s design comes from his mind, not from the wood. The idea is created from nothing, so a mind can originate without material.', 'Ideas come from nothing.', 'equivocate', 'Ideas do not come from nothing either. They come from a mind, a memory, a prior state. The cleaner point is that every cause in the sample is finite.', 'either', { cm: 'mindmatter' })
      ] },
      either: { him: 'Either way. So your evidence does not rule God in, either.', rev: 'material', opts: [
        hold('It does not. It reaches a cause. That God made the world without material is something I accept on other grounds, and the argument does not claim to prove it.', 'The argument reaches a cause; creation from nothing is revealed.', 'nihil', { np: true }),
        crack('It does, indirectly. If every beginning has a cause and the universe had no material before it, then the cause made it from nothing.', 'The induction proves creation from nothing.', 'overreach', 'That needs a further premise, that the universe is all of physical reality, and it has to survive Morriston’s point. The bare syllogism gets a cause, not the doctrine.', 'nihil', { cm: 'indproves' })
      ] },
      eitherr: { him: 'Perhaps. Or material is simply part of what causing is, and you have not shown it is an accident of the sample.', def: 'material', opts: [
        hold('Every swan Europeans had seen was white, until they reached Australia. A regularity can hold everywhere we looked without belonging to the nature of the thing.', 'Exceptionless is not the same as essential.', 'nihil'),
        hold('The causal principle is certain, and the material principle is not. The two do not stand or fall together, and the first has more support than the second.', 'The causal principle is certain.', 'nihil', { cm: 'certain' })
      ] },
      apart: { him: 'Then what tells them apart?', opts: [
        hold('What kind of cause is in the sample. Every one is finite, and finite causes rearrange what is there. Nothing like that explains why every beginning had a cause at all.', 'The material regularity belongs to finite causes.', [{ if: { o: '>=1' }, to: 'either' }, { to: 'eitherr' }]),
        { sup: true, except: 'morriston' }
      ] },
      nihil: { him: 'One more thing. You say nothing comes from nothing. You also say God made the world from nothing. How is that not a contradiction?', his: 'nihil', opts: [
        hold('They are two claims. “Nothing comes from nothing” denies a beginning with no cause. Creation from nothing denies a beginning with no pre-existing material. God is the cause.', 'No cause versus no material.', 'nihc', { cm: 'twonothings' }),
        crack('Creation is the one exception to “nothing comes from nothing.” Only God can bring something from nothing, so the principle holds for everything else.', 'Creation is the exception.', 'concede', 'No exception is needed. “Nothing comes from nothing” denies a beginning with no cause. Creation from nothing has a cause, God, and lacks only material. Granting an exception invites him to find more.', 'nihx', { cm: 'creatioexc' }),
        crack('The phrase has two senses. The principle is about what can be made out of nothing by a creature, and the doctrine is about what can be made by a Creator.', 'Two senses of “from nothing”: creature and Creator.', 'equivocate', 'That keeps the same word in play and changes the agent. The real difference is what is denied: a cause in one case, material in the other.', 'nihx', { cm: 'outofgod' })
      ] },
      nihc: { him: 'So the slogan is about causes and the doctrine is about materials. I had not put it that way.', rev: 'nihil', opts: [
        hold('Yes. And if a missing material cause is strange, a beginning missing every kind of cause is stranger still, which is the comparison that matters.', 'Creation keeps an agent and a reason.', 'END')
      ] },
      nihx: { him: 'Then you have contradicted yourself. Either nothing comes from nothing, or it does.', opts: [
        grant('Let me put it properly. The slogan denies a beginning with no cause. The doctrine denies a beginning with pre-existing material. God is the cause, so there is no contradiction.', 'No cause versus no material.', 'nihc', { fix: ['creatioexc', 'outofgod'], cm: 'twonothings' })
      ] }
    }
  };

  /* ============================================================ quantum events */
  T.quantum = {
    title: 'Quantum events', section: 'Quantum events: things do pop into being', anchor: 'quantum-events-things-do-pop-into-being', lvl: 'S', by: 'him',
    lead: 'Besides, physics already supplies counterexamples.',
    beats: {
      start: { him: 'Quantum physics. Particles appear out of the vacuum all the time, and radioactive atoms decay at moments nothing fixes. Is that not the premise refuted in a laboratory?', his: 'vacuum', opts: [
        ask('Appear out of what? Where exactly do the particles come from, and what is the vacuum they come from?', 'from'),
        crack('Each of those events is directly caused by God, who upholds every quantum event at every moment. Physics describes the pattern and God supplies the cause.', 'God causes each quantum event.', 'neighbor', 'That is a gap argument. If physics finds a mechanism, the cause shrinks. The point that holds is narrower: the vacuum is not nothing, and unpredictable is not unexplained.', 'qg', { cm: 'qgod' }),
        crack('The particles come from the quantum vacuum, which is something, so they are caused. The vacuum is a cause in the ordinary sense.', 'Vacuum events are caused.', 'overreach', 'Right that the vacuum is something, but on standard interpretations the events are indeterministic. Say “not unexplained,” not “caused.”', 'notn', { cm: 'qcaused' })
      ] },
      qg: { him: 'So God personally pops each particle into being? And when physics finds the mechanism, what then?', opts: [
        grant('Fair. That was a gap argument. My point should be narrower. Where do the particles come from?', 'Dropped the gap argument.', 'from', { fix: 'qgod' })
      ] },
      from: { him: 'From the quantum vacuum.', opts: [
        press('Is the vacuum nothing? It has energy, fields and laws, and it takes up space. It is a physical state.', 'The vacuum is not nothing.', [{ if: { o: '>=1' }, to: 'notn' }, { to: 'still' }])
      ] },
      notn: { him: 'No, it is not nothing. Krauss oversold that, and David Albert said so in his review. But the events themselves are still random.', rev: 'vacuum', opts: [
        hold('Unpredictable is not unexplained. The field, its laws and its state all figure in why the event happens, even if they do not fix the moment.', 'Unpredictable is not unexplained.', 'END', { cm: 'g_unpred' }),
        crack('Then quantum physics actually supports my premise, since its events turn out to have a setting, a field and a law behind them.', 'Quantum physics supports premise 1.', 'overreach', 'It settles nothing either way. Whether quantum events are caused depends on the interpretation, and physicists do not agree.', 'interp', { cm: 'qproves' })
      ] },
      interp: { him: 'On which interpretation? Physicists do not agree.', opts: [
        grant('You are right. Quantum physics does not decide the matter, and it is not where the question gets settled.', 'Quantum physics does not decide it.', 'END', { fix: 'qproves', cm: 'g_unpred' })
      ] },
      still: { him: 'It is not literally nothing, fine. But the events themselves are still uncaused.', def: 'vacuum', opts: [
        hold('Indeterministic is not unexplained. The field, its laws and its state explain the event, and on Bohm’s interpretation every event is determined.', 'Unpredictable is not unexplained.', 'END', { cm: 'g_unpred' }),
        crack('They only look uncaused. There are hidden causes that physics has not found yet, so the apparent randomness is a gap in our knowledge.', 'There are hidden causes.', 'overreach', 'Possible on some interpretations, but you are betting on future physics to protect a premise. The safer point is that indeterministic is not the same as unexplained.', 'END', { cm: 'hiddenvars' })
      ] }
    }
  };

  /* ============================================================ Carroll */
  T.brute = {
    title: 'Why ask at all?', section: 'Carroll: we don’t need an answer', anchor: 'carroll-we-dont-need-an-answer', lvl: 'S', by: 'him',
    lead: 'Can I ask something more basic?',
    beats: {
      start: { him: 'Why should the universe need an explanation at all? Physics describes. At some point explanation bottoms out, and I would sooner it bottomed out in the universe than in a person.', his: 'brute', opts: [
        ask('Take a rock in a field. Does it have an explanation, even if nobody ever finds it?', 'rock'),
        hold('Explanation does not bottom out. Every contingent fact has an explanation, which is the principle of sufficient reason, and the universe is one more contingent fact.', 'Every contingent fact has an explanation.', 'psr', { cm: 'fullpsr' }),
        crack('It sounds as though you would rather there be no God at the bottom of things. That preference, not the physics, is what is driving the objection.', 'You would rather there be no God.', 'strawman', 'You cannot see his heart, and the charge gives him a reason to defend himself instead of thinking. Answer the argument, not the motive.', 'motive', { o: -2 })
      ] },
      motive: { him: 'Now we are doing psychology? I could say you want there to be one.', opts: [
        grant('Fair. That was out of line. Let me answer the argument instead. Does a rock in a field have an explanation, even if no one finds it?', 'Withdrew the motive charge.', 'rock', { fix: 'motive' })
      ] },
      psr: { him: 'Everything? Then why did God create this universe and not another, or none? If something fully explains his choice, he had to make it.', opts: [
        hold('A free choice is explained by the chooser’s reasons without being forced. And my premise asks for less: an explanation for things that begin, not for every fact.', 'A free choice explains without necessitating.', 'whose', { cm: 'freechoice' }),
        crack('He had to. A perfectly good being creates the best world, so the choice is explained by his nature, and the explanation is complete.', 'God had to create the best world.', 'concede', 'Then creation is necessary and nothing could have been otherwise: modal collapse. Explanation by free choice does not necessitate.', 'whose', { cm: 'necessary' })
      ] },
      rock: { him: 'Sure. A glacier dropped it, or a wall fell down. Whether or not anyone knows.', his: 'rock', opts: [
        press('Then what changes when the thing is the universe? The rock’s explanation is not an extra assumption, just the ordinary expectation.', 'Rocks have explanations; why not the universe?', [{ if: { visited: 'exception' }, to: 'been' }, { to: '@exception:alt' }], { set: ['pinned_rock'] })
      ] },
      been: { him: 'We have been over that. No before and no outside.', opts: [
        hold('And with no before and no outside, nothing keeps anything out. That is why I cannot stop where you stop.', 'No before, no outside: nothing restricts what begins.', [{ if: { o: '>=2' }, to: 'stopc' }, { if: { flag: 'pinned_rock', o: '>=1' }, to: 'stopc' }, { to: 'stopr' }])
      ] },
      whose: { him: 'Fine. But physics describes. It does not owe you a why.', opts: [
        hold('You may stop asking, but “we do not need to ask” is a decision, not a discovery. A question every other science treats as legitimate has been exempted at one point.', 'Stopping is a decision, not a discovery.', [{ if: { o: '>=2' }, to: 'stopc' }, { if: { flag: 'pinned_rock', o: '>=1' }, to: 'stopc' }, { to: 'stopr' }], { cm: 'stopdecision' }),
        crack('Agreed, physics only describes. The why is a different kind of question, so no physical theory can answer it and none can be faulted for leaving it open.', 'Physics only describes.', 'concede', 'You conceded that no physical answer to the why-question exists, which is what he wanted. And you leaned on physics to explain tigers a moment ago. Say what it cannot reach, and no more.', [{ if: { o: '>=2' }, to: 'stopc' }, { to: 'stopr' }], { cm: 'physdesc' })
      ] },
      stopc: { him: 'Fair. “No explanation is owed” is where I choose to stop. I have not shown it is a finding.', rev: 'brute', opts: [
        hold('A choice is something we can discuss, which is more than can be said for a result. Let us compare the stopping points on what each leaves unanswered.', 'His stopping point is a choice.', 'END')
      ] },
      stopr: { him: 'Then I decide to stop. You said that is allowed.', def: 'brute', opts: [
        hold('It is allowed. I would only ask that you hold it as a decision and not as a result, and that you tell people which one it is.', 'His stopping point is a choice.', 'END')
      ] }
    }
  };
}());
(function () {
  'use strict';
  var C = window.CROSSING, H = C.__helpers, T = C.THREADS;
  var ask = H.ask, hold = H.hold, press = H.press, dent = H.dent, grant = H.grant, shared = H.shared, crack = H.crack, ART = H.ART;

  /* ============================================================ Carnap and Wittgenstein */
  T.nothing = {
    title: '“Nothing” is not a name', section: 'Carnap and Wittgenstein: “nothing” is not a name', anchor: 'carnap-and-the-early-wittgenstein-nothing-is-not-a-name', lvl: 'A', by: 'him', req: { anyVisited: ['tiger', 'circle'] },
    lead: 'Something has been bothering me about how you talk.',
    beats: {
      start: { him: 'You keep saying that nothing has no properties and no potential. But “nothing” is not a name. “Nothing is in the box” means only that there is not anything in the box. Are you treating an absence as a thing?', his: 'nothingname', opts: [
        hold('Then drop the noun. For anything at all, if it begins to exist, something causes or explains it. No word in that sentence names a void, and the argument survives the translation.', 'The premise survives without the noun.', 'logic', { cm: 'quantified' }),
        crack('The point is substantive. Nothing really has no properties, and that is exactly why it cannot produce anything: a thing with no features has no capacity to act.', 'Nothing has no properties, so it produces nothing.', 'reify', 'That repeats the move he objected to. The quantified version does not need it.', 'again', { cm: 'nothingprops' }),
        crack('That may be right, and if so Arguments 2 to 4 fail as stated. The premise does not depend on them, since the induction and the price of denial stand without the word.', 'Arguments 2 to 4 fail as stated.', 'concede', 'The translation answers the charge, so granting it gave away three arguments for nothing. The quantified versions survive intact.', 'logic', { cm: 'g_reify' })
      ] },
      again: { him: 'You have just done it again.', opts: [
        grant('You are right. Put without the noun: for anything at all, if it begins to exist, something causes or explains it.', 'Restated without the noun.', 'logic', { fix: 'nothingprops', cm: 'quantified' })
      ] },
      logic: { him: 'The grammar works, then. But logic cannot tell you what is possible. Logic shows structure. It does not tell you which world exists.', opts: [
        press('Is logic the only road? Nobody learns by surveying triangles that a triangle cannot have four sides, and chemistry taught us that water is necessarily H₂O.', 'There are routes to necessity besides logic.', 'only'),
        crack('Logic can rule it out. Anything impossible is self-contradictory, and an uncaused beginning is impossible, so it must contain a contradiction.', 'Whatever is impossible is self-contradictory.', 'overreach', 'An uncaused beginning is not self-contradictory, as he has just shown. If it is impossible, it is metaphysically so, and logic is not the road that shows it.', 'only', { cm: 'logiclaw' }),
        hold('I agree that logic reaches structure only. The premise was never offered as a theorem of logic, so what matters is what else shows what could exist.', 'The premise is not a theorem of logic.', 'only', { np: true })
      ] },
      only: { him: 'A positivist would say that logic and experience are the only roads, and that anything neither can check has no meaning.', opts: [
        press('Is that rule itself a truth of logic, or something checked by experience? By its own test it would be meaningless.', 'The verification principle fails its own test.', [{ if: { o: '>=1' }, to: 'nc' }, { to: 'nr' }]),
        crack('Then it refutes itself, and the premise wins by default. Its denial is now as meaningless as its assertion, and a premise no one can challenge is established.', 'The premise wins by default.', 'overreach', 'Refuting an objection does not establish the premise. Self-defeat arguments clear ground. They do not build on it.', 'nr', { cm: 'proved' })
      ] },
      nc: { him: 'Neither. That is the classic problem, and Carnap spent years loosening the principle.', rev: 'nothingname', opts: [
        hold('And clearing it does not prove my premise. It means only that you cannot call the premise meaningless and then also deny it.', 'Self-refutation clears ground; it does not prove.', 'END'),
        crack('Then the premise has the field to itself. With the objection gone nothing else stands in its way, so it can be treated as established.', 'The field is clear, so the premise is established.', 'overreach', 'The other objections are still standing. Clearing one lane does not establish the premise.', 'END', { cm: 'proved' })
      ] },
      nr: { him: 'Then take a milder version. Our ideas of what is possible come from experience and carry no authority at the first moment of everything.', def: 'nothingname', opts: [
        ask('That sounds like Kant rather than Carnap. Is that where you stand?', '@kant'),
        hold('That is a respectable position, but it is no longer Carnap’s. It is a claim about the reach of our concepts, which is a different dispute with a different reply.', 'The milder claim is Kant’s, not Carnap’s.', 'END')
      ] }
    }
  };

  /* ============================================================ Grünbaum */
  T.before = {
    title: 'Causes need a before', section: 'Grünbaum: causes need a before', anchor: 'grünbaum-causes-need-a-before', lvl: 'A', by: 'him',
    lead: 'Here is a cleaner problem.',
    beats: {
      start: { him: 'Causes come before their effects. If time begins with the universe, there is no earlier time in which a cause could act. Asking what caused the Big Bang is like asking what lies north of the North Pole.', his: 'before', opts: [
        hold('Causes need not come first in time. A ball resting on a cushion causes the dent at the same moment the dent exists, so what a cause needs is explanatory priority, not temporal priority.', 'Causes can be simultaneous with effects.', 'inside', { cm: 'sim' }),
        hold('The premise asks for a cause or an explanation, and explanation has never needed a before. The axioms of geometry explain why a triangle’s angles sum to 180 degrees, and they did not come first on any calendar.', 'Explanation needs no before.', 'inside', { cm: 'explnobefore' }),
        crack('God existed before creation, from eternity past. He was there before the Big Bang and acted on the first moment from the time that preceded it.', 'God existed before the Big Bang.', 'equivocate', 'If time begins with the universe there is no “before” in which he could have been. Say the cause is prior in explanation, not earlier in time.', 'pole', { cm: 'godbefore' }),
        crack('A timeless cause needs no before. God is timeless, so time does not constrain him, and the objection concerns a kind of cause that I am not proposing.', 'God is timeless, so he needs no before.', 'assert', 'Possibly right, but you asserted the hard part. Say what it means for a cause with no moment of its own to act.', 'br', { cm: 'timelessasserted' })
      ] },
      pole: { him: 'Before time began? That is the North Pole again.', opts: [
        grant('Fair. Not before in time. Prior in explanation. The ball and the cushion show how a cause can be simultaneous with its effect.', 'Prior in explanation, not in time.', 'inside', { fix: 'godbefore', cm: 'sim' })
      ] },
      inside: { him: 'The ball and the cushion both last through time. Your cause would have no moment of its own. Is that not a different animal?', opts: [
        press('The relation of causing does not require a time gap, and the cushion shows the two come apart. What remains is what kind of cause could lack a moment, and that is a question about the cause, not about causation.', 'Causing needs no time gap.', [{ if: { o: '>=1' }, to: 'bc' }, { to: 'br' }]),
        shared('That is fair. Every example of simultaneous causation I can give sits inside time, so the analogy by itself does not reach a cause with no moment of its own.', 'Simultaneous examples sit inside time.', 'bc'),
        crack('God is timeless, so time does not constrain him. A timeless agent can stand in the causal relation without having a moment of his own.', 'A timeless agent can cause.', 'assert', 'You asserted the hard part. Say what it means for a cause with no moment of its own to act on a first moment.', 'br', { cm: 'timelessasserted' })
      ] },
      bc: { him: 'So the question is not meaningless. It is hard.', rev: 'before', opts: [
        hold('Hard, yes. What kind of cause could stand in that relation to the first moment is the next conversation.', 'The question is hard, not meaningless.', 'END')
      ] },
      br: { him: 'That works inside time. Whether it works outside time is exactly what I doubt.', def: 'before', opts: [
        hold('Fair. Whether a cause can act without a moment of its own is where we part, and it belongs to the question of what kind of cause the conclusion delivers.', 'Where we part: a cause without a moment.', 'END')
      ] }
    }
  };

  /* ============================================================ Kant */
  T.kant = {
    title: 'Kant: a rule learned from kettles', section: 'Kant: a rule learned from kettles', anchor: 'kant-a-rule-learned-from-kettles', lvl: 'A', by: 'him', req: { visited: 'exception' },
    lead: 'Let me put it in Kant’s terms.',
    beats: {
      start: { him: 'Causality is the way the mind organizes experience. The universe as a whole is never given in experience, so the principle has no grip on it.', his: 'kant', opts: [
        ask('Do you hold Kant’s whole system, with space, time and causality as forms the mind imposes on appearances?', 'system'),
        hold('Then you cannot say the universe began without a cause either. The wall that stops me extending causality stops you denying it.', 'Kant’s wall blocks denial too.', [{ if: { o: '>=1' }, to: 'kc' }, { to: 'kr' }], { cm: 'kantwall' }),
        crack('Our minds were made to track reality, so the principle holds wherever our reasoning reaches, the whole universe included. Kant’s wall is a limit on us, not on the world.', 'Our minds track reality, so it applies everywhere.', 'circular', 'That uses a mind-maker to defend a premise of the argument for one. Against Kant, ask whether he holds the system, or note that his wall blocks denial too.', 'kr', { cm: 'assumegod' }),
        crack('Modern physics applies laws to the universe as a whole, and models of it work. Kant’s wall has been crossed by science, so it no longer stands.', 'Science has crossed Kant’s wall.', 'neighbor', 'The success of models does not answer a claim about what causal concepts can be applied to. And if physics may cross the wall, so may the skeptic’s physics, to his advantage.', 'kr')
      ] },
      system: { him: 'Not the whole of it, no. Very few people hold the whole of it now.', opts: [
        press('Then if causation is a real feature of things and not a form of the mind, why should it switch off at the largest scale?', 'Real causation would not switch off at the largest scale.', [{ if: { o: '>=1' }, to: 'kc' }, { to: 'kr' }]),
        crack('Then the objection falls with the system. Without transcendental idealism nothing is left of the wall, so nothing blocks the premise.', 'Without Kant’s system nothing blocks the premise.', 'overreach', 'Removing his reason leaves the inductive question open. It does not establish that the principle reaches the first moment.', 'kr')
      ] },
      kc: { him: 'If causation is real, I cannot say why it would switch off. And if it is Kant’s limit, it stops my denial as much as your affirmation.', rev: 'kant', opts: [
        hold('Then we are standing at the same wall, and you have lost your denial. What remains is agnosticism, which does not deny the premise.', 'Kant yields agnosticism, not denial.', 'END'),
        crack('Then agnosticism is a defeat for you and a victory for me. A premise that cannot be denied is a premise that must be accepted.', 'A premise that cannot be denied must be accepted.', 'overreach', 'Agnosticism does not hand the premise a win. It leaves the premise unsupported by Kant’s lights, and the other supports have to do the work.', 'END')
      ] },
      kr: { him: 'Agnosticism is a perfectly good place to stand.', def: 'kant', opts: [
        hold('It is a better place than denial, and I will take that. A rule we are bound to follow everywhere, and have never seen fail, is reasonable to believe.', 'Kant yields agnosticism, not denial.', 'END')
      ] }
    }
  };

  /* ============================================================ Oppy's parity */
  T.parity = {
    title: 'Everyone stops somewhere', section: 'Mackie and Oppy: the universe is the exception', anchor: 'mackie-and-oppy-the-universe-is-the-exception', lvl: 'A', by: 'him', req: { visited: 'exception' },
    lead: 'Here is the fairest way I can put it.',
    beats: {
      start: { him: 'Every worldview stops explaining somewhere. You stop at God. I stop at the universe’s initial state. Mine is simpler: one fewer entity, and not a person.', his: 'parity', opts: [
        press('Your stopping point began. Mine did not. Beginnings are exactly what the premise is about, so the question “why then?” has a grip on yours and none on mine.', 'His stopping point began; God did not.', 'nec'),
        crack('God is the simpler stopping point, since he has no parts. A being of that kind needs less explaining than a physical state with its many features.', 'God is simpler than the universe.', 'assert', 'Contested, and he will contest it: a mind with knowledge and will is not clearly simpler than a physical state. The firmer point is that his stopping point began and God did not.', 'simp', { cm: 'simpler' })
      ] },
      simp: { him: 'A mind that knows everything is simpler than a few fields? I do not accept that.', opts: [
        grant('Fair, that is contested. Here is the firmer point: your stopping point began, and mine did not.', 'Moved from simplicity to beginning.', 'nec', { fix: 'simpler' })
      ] },
      nec: { him: 'Then I will make the first state necessary. If God can exist necessarily, so can the first state of the universe.', opts: [
        press('A state with this much energy, this low an entropy and these constants? Those are the very features that could have been otherwise. Calling it necessary does not make it look necessary.', 'A specific first state does not look necessary.', [{ if: { o: '>=1' }, to: 'pc' }, { to: 'pr' }]),
        crack('A necessary first state is impossible. A necessary being must be simple and a physical state is composite, so that route is closed to him from the start.', 'A necessary being must be simple.', 'assert', 'That assumes a theory of necessity he does not share. The firmer point is that this particular state does not look necessary.', 'pr')
      ] },
      pc: { him: 'It does not look necessary, I agree. But your God chose this universe. Was that choice necessary, or a brute fact?', rev: 'parity', opts: [], next: 'choice' },
      pr: { him: 'Looks can mislead. And your God chose this universe. Was that choice necessary, or a brute fact?', def: 'parity', opts: [], next: 'choice' },
      choice: { him: null, opts: [
        hold('Neither. A free choice explains without necessitating. When you choose coffee over tea, your reasons explain the choice without forcing it.', 'A free choice explains without necessitating.', 'person', { cm: 'freechoice' }),
        crack('Necessary. God is perfectly good, so he had to create the best world, and a necessary choice needs no further explanation.', 'God had to create the best world.', 'concede', 'Then everything is necessary, which is modal collapse, and creation stops being a free act.', 'collapse', { cm: 'necessary' }),
        crack('A brute fact, and I accept that. Every stopping point has one, so the theist is no worse off than the naturalist and the parity stands.', 'God’s choice is a brute fact; the parity stands.', 'concede', 'You gave away the asymmetry the premise rests on. A free choice is explained by reasons without being forced, which a physical state cannot do.', 'person')
      ] },
      collapse: { him: 'Then nothing could have been otherwise. That is worse than my brute fact.', opts: [
        grant('You are right, and I withdraw it. The choice was free, explained by reasons without being forced.', 'The choice was free.', 'person', { fix: 'necessary', cm: 'freechoice' })
      ] },
      person: { him: 'A person can do what a physical state cannot. That is your real bet, is it not?', opts: [
        hold('It is. Whether a person stops the questions better than a state does is where we part, and the conclusion article takes it up.', 'A personal stopping point against a physical one.', 'END')
      ] }
    }
  };

  /* ============================================================ van Inwagen */
  T.vaninwagen = {
    title: 'The collapse of possibility', section: 'van Inwagen: the collapse of possibility', anchor: 'van-inwagen-the-collapse-of-possibility', lvl: 'A', by: 'him', req: { anyVisited: ['brute', 'parity'] },
    lead: 'There is a technical problem with your whole approach.',
    beats: {
      start: { him: 'Take every contingent fact and join them into one enormous fact. If every fact needs an explanation, so does that one, and nothing can explain it without making everything necessary.', his: 'bccf', opts: [
        hold('My premise does not ask for every fact to be explained. It asks about things that begin, a far smaller class than the full principle van Inwagen attacks.', 'Premise 1 is narrower than the full PSR.', 'line'),
        crack('God’s nature explains the whole conjunction, so nothing is left unexplained, and explanation by a necessary being does not make the world’s contents necessary.', 'God’s nature explains everything.', 'assert', 'If God’s nature fully explains the world, the world follows necessarily, which is the collapse he described. The claim needs free choice, and you have not said so.', 'free', { cm: 'necessary' }),
        crack('That is a strong argument, and I accept that the full principle fails. Premise 1 is only that principle restricted to a class of facts, so it fails with it.', 'The full PSR fails, so premise 1 fails.', 'concede', 'Premise 1 never needed the full principle. Conceding that it falls with the PSR gave away the argument for nothing.', 'line', { cm: 'g_psr' })
      ] },
      free: { him: 'Then the world follows from God’s nature, and nothing could have been otherwise. Not even God had a choice.', opts: [
        grant('I withdraw that. God’s free choice explains the world without necessitating it, and my premise asks for less than the full principle anyway.', 'A free choice explains without necessitating.', 'line', { fix: 'necessary', cm: 'freechoice' })
      ] },
      line: { him: 'Then your line looks arbitrary. Why should explanation be owed to beginnings and not to everything?', opts: [
        hold('A thing that begins has no nature yet to answer “why then?” Before it began there was nothing of it to do the explaining, so the demand for explanation is clearest there.', 'Beginnings are where explanation is clearly owed.', [{ if: { o: '>=1' }, to: 'vc' }, { to: 'vr' }]),
        crack('Because that is the line the argument needs. A modest premise must stop somewhere, and beginnings are the point where the kalam applies it.', 'The line is where my argument needs it.', 'concede', 'That concedes his charge that the line is arbitrary. The principled reason is that a beginner has no prior nature to explain why it began.', 'vr', { cm: 'convenient' }),
        hold('It need not be owed to beginnings alone. Argument 9 asks only that a cause outside contingent things be possible, so it never mentions the enormous conjunction.', 'Argument 9 does not need the line.', 'rasm')
      ] },
      vc: { him: 'That is a principled line. I do not love it, but it is not arbitrary.', rev: 'bccf', opts: [
        hold('You need not love it. It sits where the demand for explanation is clearest, and I would ask you to find a better line if you think there is one.', 'The line is principled.', 'END')
      ] },
      vr: { him: 'Clever, but I am not convinced the line is principled.', def: 'bccf', opts: [
        hold('Fair. Whether the line is principled is where we part, and Argument 9 does not depend on it.', 'Where we part: why beginnings.', 'END')
      ] },
      rasm: { him: 'Then we are fighting over the modal logic of its last step, and that is exactly where I would push.', def: 'bccf', opts: [
        hold('Agreed. That is a narrower fight than the one you started with, and it is the right one to have.', 'The fight moves to the modal logic of Argument 9.', 'END')
      ] }
    }
  };

  /* ============================================================ Russell, Norton, Linford */
  T.linford = {
    title: 'Nothing down there to explain with', section: 'Russell, Norton, Linford: there is nothing down there to explain with', anchor: 'russell-norton-linford-there-is-nothing-down-there-to-explain-with', lvl: 'A', by: 'him', req: { visited: 'tiger' },
    lead: 'Let me push the physics further.',
    beats: {
      start: { him: 'Fundamental physics contains no causes at all. Its equations relate states symmetrically. Causation is folk science, like centrifugal force on a merry-go-round. So what is your premise about?', his: 'nocause', opts: [
        press('When you said laws and probabilities keep tigers out of the glove box, you gave an explanation, and the premise asks for a cause or an explanation. You may have eliminated causes. You have not eliminated explanation.', 'Eliminating causes is not eliminating explanation.', 'chain', { cm: 'lawsexplain' }),
        crack('Physics only describes. Real causes are metaphysical, so physics cannot touch them, and the premise stays safely outside the reach of its equations.', 'Physics only describes.', 'concede', 'You leaned on physics to explain tigers. Do not throw physics out; say what it cannot reach.', 'chain', { cm: 'physdesc' }),
        crack('Eliminativism is simply false. Cartwright and the powers theorists have shown that causation is fundamental, so the objection has already been answered.', 'Eliminativism has been refuted.', 'overreach', 'The view is contested inside philosophy of science, not refuted. Cite the dispute, not a victory.', 'chain')
      ] },
      chain: { him: 'Very well, explanation. In physics that means placing a state under laws and earlier states. The first state has no earlier state, and a chain can have a first link without scandal.', opts: [
        press('Then on your view nothing explains why this first state and not a hostile one. The question that kept paraphernalia out of the glove box is the question the first state faces.', 'Nothing explains this first state rather than another.', 'law'),
        press('And if you call the low-entropy start a law, you only move the brute fact. If laws summarize what happens, a summary cannot explain what it summarizes.', 'A summary law cannot explain its instances.', [{ if: { o: '>=1' }, to: 'fc' }, { to: 'fr' }]),
        crack('Then a first link is an uncaused beginning by definition, and uncaused beginnings are impossible. So the chain cannot have a first link without contradiction.', 'A first link is impossible.', 'circular', 'That assumes the premise in order to defend it. The first link is exactly what he is questioning.', 'fr')
      ] },
      law: { him: 'Or the initial condition is itself a law. That is how the Mentaculus treats it, Albert and Loewer’s package of statistical-mechanical laws.', opts: [
        press('Then the law is true because the first state was low in entropy. It describes the beginning. It gives no reason for it.', 'A summary law cannot explain its instances.', [{ if: { o: '>=1' }, to: 'fc' }, { to: 'fr' }]),
        crack('The Mentaculus is a bookkeeping device. No working physicist treats a postulate about the initial state as a real law, so it carries no explanatory weight.', 'The Mentaculus is only bookkeeping.', 'strawman', 'Albert and Loewer defend it as a law. The reply is that a summary-style law describes the beginning without explaining it.', 'fr')
      ] },
      fc: { him: 'That is the standard objection to summary views of laws, and it is a good one. So can laws explain an initial state? That is the live question.', rev: 'nocause', opts: [
        hold('Agreed, and that is where the matter gets settled. It cannot be settled by saying the question is optional.', 'Can laws explain an initial state?', 'END')
      ] },
      fr: { him: 'Or I take a stronger view of laws. That is a research programme, not a defeat.', def: 'nocause', opts: [
        hold('Fair. Neither of us has settled it, and the question has moved to the metaphysics of laws, which is the right place for it.', 'Can laws explain an initial state?', 'END')
      ] }
    }
  };

  /* ============================================================ Lu */
  T.lu = {
    title: 'The clocks agree', section: 'Probability needs a measure', anchor: 'probability-needs-a-measure', lvl: 'A', ref: ART + '#from-what-denial-would-permit',
    beats: {
      start: { him: 'If the beginning were unexplained, nothing would select the starting state, and most starts would not yield clocks that agree. But you are spreading probability over infinitely many possible starting states, and there is no natural way to do that.', his: 'measure', opts: [
        shared('That is a fair hit against the numbers. A uniform measure over an infinite space does not exist, so the formal version needs more than I can give. The qualitative point is what I would keep.', 'Conceded the measure; kept the qualitative point.', 'left', { cm: 'g_measure' }),
        crack('A measure exists. Any physicist can choose the natural one, and your objection shows only that you have not tried. The numbers stand as they are.', 'A natural measure exists.', 'burden', 'No uniform measure over an infinite space exists. Asking him to supply one does not supply it.', 'left', { cm: 'measureclaim' }),
        crack('It is the same as fine-tuning, and fine-tuning is strong: the universe is plainly designed, so the measure is beside the point.', 'It is like fine-tuning.', 'neighbor', 'A different argument with its own disputes. Lu’s point is about the clocks agreeing and an unexplained start.', 'left', { cm: 'finetune' })
      ] },
      left: { him: 'So what is left once the numbers are gone?', opts: [
        press('On your view the agreement of the clocks is merely compatible with the evidence. On mine, it is what a cause with reasons would produce. A hypothesis that expects the evidence beats one that merely allows it.', 'Expected beats merely compatible.', [{ if: { o: '>=1' }, to: 'lc' }, { to: 'lr' }]),
        hold('Argument 5 needs no measure at all. It asks about the knower, and an unexplained beginning would make the very measurements you rely on uninformative.', 'Argument 5 carries the weight and needs no measure.', 'lc', { np: true }),
        crack('The numbers were never the point. If the beginning had no explanation, anything might have resulted, and that the result is so orderly settles the matter.', 'Order settles it.', 'overreach', 'Without a measure, “so orderly” is no longer a quantity. That order is merely allowed on his view and expected on yours is the comparison, and it is thinner than a settlement.', 'lr')
      ] },
      lc: { him: 'That is weaker than the paper, but it is not nothing.', rev: 'measure', opts: [
        hold('Weaker and sturdier. I would take sturdier.', 'The qualitative point survives.', 'END')
      ] },
      lr: { him: 'Expected by whom? That sounds like smuggling in a designer. And the objection runs against you too: you have no measure over what such a cause would choose.', def: 'measure', opts: [
        dent('That is fair, and it is the best objection to the comparison. A unified cause is at least the kind of thing that could account for agreement among independent measurements. An unexplained beginning is not.', 'A unified cause could account for agreement; an unexplained start could not.', 'END'),
        crack('Then the matter is a draw, and a draw favours the premise, since it is the default that things have explanations.', 'A draw favours the premise.', 'burden', 'That treats the premise as the default, which is what he is questioning. A draw does not favour either side.', 'END')
      ] }
    }
  };
}());
/* The ending: what the argument did and did not do, said to the person.
 * Band is chosen by the hidden stance scale: h (hostile or hurt), g (guarded to curious), o (open). */
(function () {
  'use strict';
  var C = window.CROSSING, H = C.__helpers;
  function low(s) { s = String(s).replace(/[.]$/, ''); return s.charAt(0).toLowerCase() + s.slice(1); }
  function gv(t, c, to, x) { var o = { k: 'give', p: 'hold', np: true, t: t, c: c, to: to }; for (var k in x) o[k] = x[k]; return o; }
  function soft(t, c, f, n, to, b, x) { var o = { k: 'give', p: 'crack', soft: true, t: t, c: c, f: f, n: n, b: b, to: to }; for (var k in x) o[k] = x[k]; return o; }
  function leave(t, s) { return { k: 'grant', t: t, to: 'FINISH', s: s || 0 }; }

  C.CLOSING = {
    where: {
      h: 'He is still far from this, and the argument is not the reason. What stands between you is something an argument was never going to move.',
      g: 'He is nearer to the argument than to its conclusion. The premise costs him something to deny now, and that is as far as it reaches.',
      o: 'He is leaning in. The argument cleared away one of his reasons for saying no, and he wants to see what is on the other side of it.'
    },
    insight: 'Winning the points is not winning the person. A good argument removes a reason for saying no; it cannot supply a reason for saying yes, and a skeptic who grants everything just to be done with you has not moved at all. The aim is to be someone worth talking to while he decides.',
    keep: {
      h: 'If he told you what was really in the way, you were right to stop arguing. The argument will keep until he asks for it.',
      g: 'Nothing is settled, and that is an honest place to stop.'
    },
    next: { text: 'Premise 2: did the universe begin at all?', href: '/series/kalam/' }
  };

  C.MAXS = 6;   /* one premise of one argument does not carry anyone to +10 */
  var T = C.THREADS;
  T.close = {
    title: 'The close', section: 'Ending', by: 'sys', hide: true, beats: {
      cl_h: {
        him: function (x) {
          if (x.why === 'church') return 'I will be straight with you. I could grant every one of these points and it would not touch me. What I carry is not philosophy. It is what I watched people do in the name of God, and who they were to me afterward.';
          if (x.why === 'evil') return 'The first cause was never my trouble. It is the suffering. If there is a mind behind all this, then it watched what I have watched, and I cannot get past that with an argument about beginnings.';
          return 'I think I stopped arguing a while ago. I have been waiting to feel heard, and I am not sure I am the one you have been talking to.';
        },
        opts: [
          { k: 'ask', t: 'That sounds like it matters more than anything we covered tonight. Would you tell me about it, whenever you are ready?', c: 'Asked about the real obstacle', to: 'cl_h_a', s: 4 },
          soft('I am sorry that happened. The answer to that is Jesus, who was angrier about hypocrisy than you are. May I tell you who he is?', 'Moved to the gospel as he finished speaking', 'rushed', 'Jesus may be the answer, but he had just handed you something painful and you replied with a pitch before asking anything. A person in that spot hears that your answer matters more than his story.', 'cl_h_b', 'Asking about it, and listening before you answer.', { s: -1 }),
          soft('What people do has no bearing on whether the premise is true, and the premise stands whatever Christians have done. Shall we finish the argument?', 'Returned to the argument', 'neighbor', 'You were right about the logic and wrong about the moment. He said what was in the way, and you answered a question he was not asking.', 'cl_h_c', 'Asking about it, and listening before you answer.', { s: -1 })
        ]
      },
      cl_h_a: { him: 'Thank you for asking. It is longer than tonight allows. But it was hard to say, and you are the first person in a while who asked instead of answering.', opts: [leave('I am glad you told me. Whenever you want to keep talking, about this or about the argument, I would like to.', 2)] },
      cl_h_b: { him: 'I did not come for a sermon. I came because I thought someone might actually talk with me.', opts: [leave('I am sorry. I should have listened first.', 1)] },
      cl_h_c: { him: 'Of course the premise does not depend on them. That is not why I said it.', opts: [leave('You are right. I should have asked about it first.', 1)] },

      cl_g: {
        him: function (x) {
          var give = x.revs.length ? 'Here is what I will give you: ' + x.revs.slice(0, 2).join(' ') : 'I cannot say you moved me much.';
          var hold = x.defs.length ? ' And here is what I still cannot follow: I do not know ' + low(x.defs[0]) + (x.defs[1] ? ', or ' + low(x.defs[1]) : '') + '.' : ' I do not have one point I am holding on to, which surprises me.';
          return 'Let me say where I am, which is fairer than “I am not convinced.” ' + give + hold;
        },
        opts: [
          { k: 'ask', t: 'What would you need to see on that last point before it stopped bothering you? I would rather know than guess.', c: 'Asked what would move him', to: 'cl_g_a', s: 3 },
          soft('You have granted a first cause, so you are one step from the Christian God, and everything else is a matter of filling in detail.', 'Called the rest “detail”', 'overreach', 'A first cause is the start of a long road. That it is personal, good, and the God of Israel are further claims, each with its own case, and none of them is a detail.', 'cl_g_b', 'Asking what would move him on the point that is still open.', { s: -1 }),
          soft('Then the real obstacle is not the argument. You would prefer not to believe, and that is what holds you at that last point.', 'Judged his motives', 'motive', 'Guessing at why he holds a doubt does not answer it, and he can say the same of you. The doubt he named still needs a reply.', 'cl_g_c', 'Asking what would move him on the point that is still open.', { s: -2 })
        ]
      },
      cl_g_a: { him: 'Honestly, a reason that does not just restate the premise. I do not know that one exists. I would rather keep looking than pretend I have decided.', opts: [leave('That is a fair place to leave it. I would like to keep looking with you.', 1)] },
      cl_g_b: { him: 'That is a long walk to call a detail. Each of those steps would need a case of its own, and I have not seen them.', opts: [leave('You are right. Each of those deserves its own conversation.', 1)] },
      cl_g_c: { him: 'Maybe. But saying so does not answer the point, and I would rather you answered it.', opts: [leave('Fair. The point deserves an answer, not a diagnosis.', 1)] },

      cl_o: {
        him: 'I did not expect to say this, but I would like to know where it goes. A first cause is not yet a God, and certainly not the one your church worships. I would still like to keep going.',
        opts: [
          gv('A first cause is only the first step. Whether the universe began at all is the next question, and it deserves a slow look.', 'Named the next step honestly', 'cl_o_a', { s: 2 }),
          { k: 'ask', t: 'What would you want to know next? I would sooner follow your question than my own outline of the argument.', c: 'Asked what he wants to know', to: 'cl_o_b', s: 2 },
          soft('Then you are nearly there. A first cause is the Christian God, and all that is left is to trust him.', 'Closed the gap for him', 'rushed', 'He was leaning in on his own, and you pulled. A first cause is not yet the Christian God, and trust is not the next step an argument can take for him.', 'cl_o_c', 'Naming the next step honestly and letting him take it.', { s: -2 })
        ]
      },
      cl_o_a: { him: 'Then that is the next conversation.', opts: [leave('Good. I will bring the best case I have.', 0)] },
      cl_o_b: { him: 'Whether it actually began. Everything seems to hang on that.', opts: [leave('It does. Let us start there.', 0)] },
      cl_o_c: { him: 'That is the part I cannot see yet. I would have to follow it step by step, not be pulled across.', opts: [leave('You are right. One step at a time.', 0)] }
    }
  };
}());
(function () {
  'use strict';
  var C = window.CROSSING, H = C.__helpers;
  var hold = H.hold, grant = H.grant, dent = H.dent, crack = H.crack;
  function R(a, b, him, opts) { var r = { a: a, him: him, opts: opts }; if (b) r.b = b; return r; }

  /* He cross-examines you when two of your standing commitments pull apart,
     or, for a single-claim rule, a few moves after you made it. Resume point is added by the engine. */
  C.RULES = [
    R('possible', 'fp', 'Hold on. Earlier you granted that an uncaused beginning is possible. Now you say that being cannot come from non-being. If it is possible, how can it be impossible?', [
      hold('I granted too loosely. There is no contradiction in it, so it is logically possible. Given what a beginning with no source would be, it cannot really happen. That is metaphysical impossibility.', 'Logically possible, metaphysically impossible.', null, { fix: 'possible' }),
      crack('Both hold, because “possible” meant only that no one can prove it impossible. In the second claim I mean that it cannot happen, and the two claims are about different things.', 'Two meanings of “possible.”', 'equivocate', 'You switched senses without saying so. The distinction you needed was logical versus metaphysical possibility, stated at the start.', null)
    ]),
    R('possible', 'priceclaim', 'Wait. You granted that uncaused beginnings are possible, and then argued that if they were possible my perceptions would be worthless. You have made your own perceptions worthless.', [
      hold('I granted logical possibility, which is no contradiction. Pruss’s point concerns real possibility: if uncaused beginnings could really happen, perception would be in trouble, and that is why I deny they can.', 'Logically possible, metaphysically impossible.', null, { fix: 'possible' }),
      crack('They are possible but so rare that perception is safe for practical purposes. Nobody’s coffee cup has ever turned out to be uncaused.', 'Possible, but too rare to matter.', 'overreach', 'Rarity does not help. From the inside an uncaused experience looks just like a caused one, so you cannot tell which kind you are having.', null)
    ]),
    R('possible', 'reductio', 'You granted that uncaused beginnings are possible. Then you asked why tigers do not appear in kitchens. If they are possible, perhaps they simply have not happened yet.', [
      hold('I conceded too much. There is no contradiction in it, but if such beginnings could really happen, nothing would keep them rare. That is the force of the tiger.', 'Logically possible, metaphysically impossible.', null, { fix: 'possible' }),
      crack('They are possible and extremely rare, which is just what the tiger argument predicts. The absence of tigers is evidence of the rarity.', 'Possible, and rare.', 'inconsistent', 'If they were really possible and nothing restricted them, there would be no reason for rarity. You needed logical versus metaphysical possibility.', null)
    ]),
    R('reductio', 'lawsexplain', 'I notice something. Your tiger argument says things cannot begin with no cause. When I said physics keeps tigers out, you said that is an explanation and explanations count. Is your premise about causes or about explanations? Each time I push it seems to get weaker.', [
      hold('It was always “cause or explanation,” and I need only one. Inside the universe physics supplies an explanation. At the first moment, on your view, there is neither.', 'It was always “cause or explanation.”', null),
      crack('It is about causes. “Explanation” was a slip, and I should have kept to the plain causal reading from the outset.', 'It is about causes; “explanation” was a slip.', 'concede', 'You gave away the answer you just gave him, and the premise becomes easier to attack. The broad wording was deliberate.', null)
    ]),
    R('certain', 'g_indalone', 'You said the causal principle is certain. You also granted that induction alone cannot carry it. Certain on what basis?', [
      grant('“Certain” was too strong. It is more plausible than its denial by several independent routes, and that is all the argument needs.', 'More plausible than its denial, not certain.', null, { fix: 'certain' }),
      crack('Certain because no instance has ever failed. That is a basis, and the grant about induction concerned only the material rule.', 'Certain because it has never failed.', 'equivocate', 'Never failing in the sample does not make it certain beyond the sample. That was Morriston’s point, which you granted.', null)
    ]),
    R('certain', 'g_cont', 'You granted that the universe is unlike every other beginning. You also called the causal principle certain. How certain can a rule be about the one case it was never tested on?', [
      grant('Fair. Not certain: more plausible than its denial. And an exception still needs a reason.', 'More plausible than its denial, not certain.', null, { fix: 'certain' }),
      crack('Certain. It applies to every case, tested or not, which is what it means to be a principle and not a generalization.', 'Certain even for untested cases.', 'assert', 'You granted that the universe is unlike the sample. Certainty over an untested case is exactly what he can deny.', null)
    ]),
    R('certain', 'induct', 'You called the causal principle certain, yet the same evidence supports the material rule and you will not call that certain. What makes one certain and the other not?', [
      grant('“Certain” overstated it. The difference is not certainty. The material regularity has an explanation tied to the sample, finite causes, and the causal regularity has none.', 'More plausible than its denial, not certain.', null, { fix: 'certain' }),
      crack('The causal rule is simply more obvious, and obviousness is what certainty comes to for a principle of this kind.', 'The causal rule is more obvious.', 'equivocate', 'Obviousness is not certainty and does not separate the two rules. The real difference is that the material regularity is explained by the finitude of the causes sampled.', null)
    ]),
    R('assumegod', 'modest', 'You told me the argument reaches only a cause. When I pressed, you defended a step by appeal to a lawgiver. Which is it?', [
      hold('The first. I withdraw the appeal. The argument works from standards we share, and a lawgiver is not one of them.', 'The argument uses shared ground.', null, { fix: 'assumegod' }),
      crack('Both are consistent. The argument reaches a cause, and its later steps may draw on what that cause turns out to be.', 'Later steps may draw on what the cause is.', 'circular', 'Then the premise depends on the conclusion. He has no reason to engage an argument whose first line borrows from its last.', null)
    ]),
    R('sim', 'godbefore', 'You said a cause can act at the same moment as its effect, like the ball and the cushion. You also said God existed before the Big Bang. Which is it?', [
      grant('The first. “Before” was the wrong word. Prior in explanation, not earlier in time.', 'Prior in explanation, not in time.', null, { fix: 'godbefore' }),
      crack('Both. He was before the Big Bang in the sense that matters and simultaneous with it in the sense that causes are.', 'Both before and simultaneous.', 'equivocate', 'With no time before the first moment, “before” has nothing to mean. Pick explanatory priority.', null)
    ]),
    R('lawsexplain', 'physdesc', 'Something does not fit. Earlier you said that laws keeping tigers out count as an explanation. Then you said that physics only describes. Which is it?', [
      hold('Both, in different places. Inside the universe physics explains by laws and earlier states. At the first state there is no earlier state, so physics describes and cannot explain.', 'Physics explains inside the universe, not the first state.', null, { fix: 'physdesc' }),
      crack('Physics does not really explain anything. Explanation is a metaphysical notion, and the tiger answer was only a courtesy.', 'Physics does not really explain.', 'inconsistent', 'Then you have given away your own answer to the tiger.', null)
    ]),
    R('noexception', 'g_unpred', 'You said the causal principle has no exception anywhere we can check. You also granted that quantum events are unpredictable. Are those not exceptions?', [
      hold('No. Unpredictable is not uncaused. The field, its laws and its state explain the event, even if they do not fix exactly when it happens.', 'Unpredictable is not uncaused.', null),
      crack('They would be exceptions if they were uncaused, but quantum events are caused just as billiard balls are. We cannot yet see how.', 'Quantum events are caused like billiard balls.', 'overreach', 'On standard interpretations they are indeterministic. Claiming more than physics shows invites the reply.', null)
    ]),
    R('noexception', 'qcaused', 'You said there is no exception to the causal principle anywhere we can check, and that vacuum events are caused. Most physicists call them indeterministic. Are you overriding physics?', [
      grant('No. I should have said “not unexplained,” not “caused.” Indeterministic events still have a field, laws and a state behind them.', 'Unpredictable is not unexplained.', null, { fix: 'qcaused' }),
      crack('Physics will find the causes eventually. Until it does, the principle stands, and a principle should not yield to a gap in current theory.', 'Physics will find the causes.', 'overreach', 'You are betting on future physics to protect a premise. Say what you can defend now: unpredictable is not unexplained.', null)
    ]),
    R('induct', 'fp', 'Help me understand. You said you know the principle from experience, and you also said it is a first principle seen by understanding the terms. Which is it?', [
      hold('Both. Some people see it directly, and experience confirms it wherever we look. Two independent routes make it stronger, not weaker.', 'Two independent routes to the same claim.', null),
      crack('Experience only, I suppose. The first principle was never my main support, and induction is the best evidence anyone has.', 'Only experience.', 'concede', 'Giving up the first principle leaves induction to carry the premise alone, and induction has Morriston’s problem.', null)
    ]),
    R('stopdecision', 'godnever', 'You told me that stopping at the universe is a decision, not a discovery. Is stopping at God not a decision too?', [
      hold('No. The premise asks about things that begin. God did not begin and the universe did, and that asymmetry is the difference between the two stopping points.', 'God did not begin; the universe did.', null),
      crack('Yes, both are decisions. Neither of us can do better, so the question becomes which stopping point is the more fruitful.', 'Both stopping points are decisions.', 'concede', 'You gave away the asymmetry the premise was built on.', null)
    ]),
    R('twonothings', 'induct', 'Then explain this. Your evidence is that every observed beginning had a cause, and every one also had material. If the slogan concerns causes only, why does your evidence count for causes and not for materials?', [
      hold('Because the material regularity has an explanation tied to the sample: every cause in it is finite, and finite causes rearrange. Nothing like that explains why every beginning had a cause at all.', 'The material regularity belongs to finite causes.', null),
      crack('Because God is the exception to the material rule, and the sample cannot show otherwise since it contains no divine causes.', 'God is the exception to the material rule.', 'circular', 'That answers with the conclusion. The sample-based reason is that every observed cause is finite.', null)
    ]),
    R('g_first', 'reductio', 'You granted that nothing restricts the first moment, and you argued that unrestricted beginnings would be indiscriminate. Do those two claims fit together?', [
      grant('They do not, and I should not have granted it. At the first moment the absence of restriction is the problem for him, not an exemption for the argument.', 'The absence of restriction is the problem, not an exemption.', null, { fix: 'g_first' }),
      crack('They fit. The reductio concerns what is allowed inside the universe, and the first moment is a separate case that needs its own argument.', 'The first moment is a separate case.', 'inconsistent', 'Then the reductio does not reach the one beginning that matters, and you have said so yourself.', null)
    ]),
    R('godnever', null, 'You keep saying God never began. How do you know that? It sounds convenient.', [
      hold('It is not a dodge invented for the argument. Whatever caused the first beginning cannot itself have begun, or it would need a cause too. Whether that cause is God takes more argument.', 'A cause of all beginnings cannot itself have begun.', null),
      crack('Because a being who began would be a creature, and creatures are what the premise covers. So the definition of God settles it.', 'The definition of God settles it.', 'circular', 'Defining God as the one who did not begin does not show that anything fits the definition. The question was how you know.', null)
    ]),
    R('noexc', null, 'About your Denver rule. Is “being the very first thing” not a perfectly good reason for an exception?', [
      hold('It is a feature, not a reason. A reason would say why being first lets something begin with nothing explaining it, and being first removes everything that could restrict what begins.', 'Being first is a feature, not a reason.', null),
      crack('There is only one first thing, so a rule about the many cannot be applied to it, and the Denver comparison does not reach the case.', 'A rule about the many does not apply to the one.', 'concede', 'That concedes the exemption he wanted. Uniqueness is a feature, not a reason.', null)
    ]),
    R('fp', null, 'You rely on nothing coming from nothing. People once thought it obvious that the sun goes around the earth. Why trust this kind of obviousness?', [
      hold('Obvious claims can be wrong, so I do not rest on that alone. The sun belief was corrected by evidence. Here, denying the principle costs you the evidence itself, since your perceptions could begin uncaused.', 'Obvious claims can be wrong; this one costs too much to deny.', null),
      crack('This is a different kind of obvious. The sun’s motion was empirical, and this principle is known by reason, which does not err.', 'Rational insight does not err.', 'overreach', 'Reason errs too. Say what kind of obvious this is, and pair it with an argument that does not depend on his sharing the intuition.', null)
    ])
  ];

  C.HIS_ORDER = ['hume', 'exception', 'morriston', 'quantum', 'brute', 'nothing', 'linford', 'parity', 'kant', 'before', 'vaninwagen'];

  C.JUNCTION = {
    open: ['That moved me on the last point. What I still cannot square is this.', 'You gave a real answer there. The one place I am still stuck is this.'],
    mid: ['I think we are circling, so let me name the thing that actually bothers me.', 'Let me say where I still feel the pull the other way.'],
    hard: ['I am not persuaded, and I would rather say why than keep saying so.', 'Then let me be plain about the difficulty I cannot get past.']
  };
  C.LEAVE = 'I think I should stop for tonight. You have given me plenty to think about.';
  
  /* move labels for plausible cracks: some press, some over-grant */
  (function () {
    var PRESS = ['And what accounts for the laws?', 'Physics cannot touch the question.', 'Then the order itself shows design', 'Then you concede that the universe', 'Then there are no exceptions', 'Then quantum physics actually', 'Then God is the before', 'A difference in setting', 'The phrase has two senses', 'It does, indirectly.'];
    var GRANT = ['I grant that nothing restricts', 'Agreed, physics only describes', 'I accept that an uncaused beginning is possible'];
    function mark(o) {
      if (o.p !== 'crack' || !o.t) return;
      PRESS.forEach(function (q) { if (o.t.indexOf(q) === 0) o.k = 'press'; });
      GRANT.forEach(function (q) { if (o.t.indexOf(q) === 0) o.k = 'grant'; });
    }
    function walk(x) { if (!x || typeof x !== 'object') return; if (Array.isArray(x)) { x.forEach(walk); return; } mark(x); for (var k in x) if (x[k] && typeof x[k] === 'object') walk(x[k]); }
    walk(C.THREADS); walk(C.SUPPORTS);
  }());
  delete C.__helpers;
}());
