# Daugherty's Doubt

Ian's philosophical and theological article site. Astro, published through Netlify from `main`. The site is called Daugherty's Doubt (not "Unshakable"). Articles live in `src/content/articles/`; series are defined in `src/data/series.ts`; each kalam article has a companion debate and an end-of-article game, The Crossing, in `public/practice/`.

## Voice comes first

Getting Ian's own voice into AI-assisted drafts is the most important thing about this repo. Read `docs/VOICE.md` before drafting or editing any article prose. Do not draft from a topic; draft from an outline Ian has approved. Do not edit his published prose beyond the sentence a rule or he points at: surgical edits, not rewrites.

## Commands

```
npm run dev              # http://localhost:4321
npm run build            # must pass before any push
npm run check            # voice check + The Crossing lint; no ERROR allowed
npm run check:voice      # voice check alone; accepts file paths
```

`npm run check` is the gate for "done". Report what it printed. If a phrase in `docs/voice-rules.json` is right in context, end that line with `<!-- voice-ok -->` and say why; do not weaken the rule.

## Adding an article

Frontmatter and series rules are in `README.md`. Keep `seriesSlug` identical across a series, leave `DRAFT` in `status` until Ian says publish, and add the article's planned neighbours to `src/data/series.ts` so links resolve.

## The Crossing (end-of-article debate game)

Content is `public/practice/crossing-<article>.js`; the engine is `crossing.js`. `notes/crossing-lint.mjs` guards against the tells of robot-written options (the sound answer longer or more hedged than the cracked ones, one move label always right, lexical tells). Run it on every new beat. Build a new Crossing with the `build-crossing-game` skill when it is available; do not hand-copy an old one.

## Working rules

- One article or one game per session. End by updating `PROGRESS.md`.
- Sourcing notes and scratch material go in `notes/`, never in `src/`.
- Cite as the existing articles do (author and year in parentheses; the † marks in the text are Ian's, so leave them alone and ask what one means before adding any). Do not invent a citation; if a source cannot be verified, say so and leave the sentence out.
