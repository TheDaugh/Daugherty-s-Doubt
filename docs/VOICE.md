# Voice

Ian's voice in published articles. Everything here is something Ian has said; nothing is inferred. The mechanical part lives in `docs/voice-rules.json` and `scripts/check-voice.mjs`. The rest needs a reader.

## Rules for every article

- Plain, direct prose. Ian pushes back on ornate language.
- Academically lively. Claude's default register is not, and Ian notices.
- No AI-chat vocabulary: "the point is real", "this is where this comes in", and their relatives. Add each new one to `voice-rules.json` the first time it slips through.
- State the claim or the argumentative move in your own words before any quotation or citation. Never lead with the quote and unpack it afterwards.
- Vary sentence rhythm on purpose. After a longer sentence that builds an idea, land a genuinely short one.
- No hedging verbs ("it might be argued", "some would say") and no throat-clearing ("it's worth noting that", "what this reveals is"). Say it.
- When steelmanning an opponent, let the fair statement do argumentative work: it should expose something the thesis needs, not sit as a courtesy paragraph before the rebuttal.
- Concrete, homely illustrations with no ceremony. The illustration arrives as the next clause; no "to illustrate this, consider".
- No architectural narration ("this section will", "having established X").

## Theology articles (legalism, lordship, and the like)

Lay-academic register. Scripture is quoted, then commented on and applied. Narrated in first-person plural exhortation ("Paul tells us", "we"). No self-talk such as "the reply is". The salvation, lordship and works article is also written to be readable without offense by family.

## Exemplars

Earlier drafting from project exemplars kept producing bloggy voices, so the exemplar set is kept small and chosen by Ian, not by Claude.

Ian: choose one passage, 150 words or fewer, from your own writing that is exactly right, and paste it here with the article name. Until then, there is no exemplar; do not substitute one from an existing article.

- (empty)

## How a draft gets reviewed

1. The drafting session works from an approved outline, not from a topic.
2. `npm run check:voice` must show no ERROR.
3. A separate session that did not write the draft reads it against the rules above and returns, for each rule, either "met" with the sentence that shows it or "missed" with the sentence that breaks it. It does not rewrite. The drafting session fixes only the missed sentences, surgically.
4. Ian reads last.

The checker catches phrases and reports rhythm. It cannot tell lively from flat, so step 3 is not optional.

## Rhythm baseline (2026-10-26)

Share of sentences of eight words or fewer: `apologetic-methods` 28%, `kalam-premise-1-debate` 32%, `kalam-premise-1` 36%. A new draft far below these probably has the long-sentence monotone the rules warn about. This is a signal, not a gate.
