# Progress

Update this at the end of every session. Newest entry first.

## 2026-10-26: harness setup

Added `CLAUDE.md`, `docs/VOICE.md`, `docs/voice-rules.json`, `scripts/check-voice.mjs`, and `npm run check` / `check:voice`. Fixed the README title ("Unshakable" to "Daugherty's Doubt"). No article text changed.

### Baseline (`npm run check:voice`)

- 1 error: `apologetic-methods.md:156`, "The reply is sound as far as it goes". Ian's rule is no self-talk phrasing of this kind. A one-sentence fix is waiting on Ian ("Craig's answer is sound as far as it goes" is the shape; his call).
- 1 warning: `apologetic-methods.md:237`, "for example,".
- The Crossing lint (`npm run check`) passes with warnings about words that skew toward sound or cracked options.
- Rhythm baseline is in `docs/VOICE.md`.

### What the checker does not catch

It finds named phrases and reports sentence rhythm. A "bloggy" draft with none of the listed phrases will pass it. The second line of defense is the review step in `docs/VOICE.md`: a separate session scores the draft against each rule and cites sentences. Until Ian pastes an exemplar into `docs/VOICE.md`, there is no exemplar; that is deliberate.

### Needs Ian

1. Choose one exemplar passage (150 words or fewer) for `docs/VOICE.md`.
2. Add any AI-chat phrase you have caught that the list misses, to `docs/voice-rules.json`.
3. Decide the `apologetic-methods.md:156` sentence.
4. `notes/Unshakable-Premise-1-Final.docx` still carries the old site name; rename if you want it consistent.

### Next work

Premise 2 (philosophical) per `src/data/series.ts`: outline first, Ian approves, then draft, then `npm run check`, then a separate review session.
