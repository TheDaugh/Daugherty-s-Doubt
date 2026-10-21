# Daugherty's Doubt

    npm install
    npm run dev      # then open http://localhost:4321

## Adding a new article

Drop a markdown file into `src/content/articles/` with this frontmatter:

```yaml
---
title: "Your Article Title"
subtitle: "An optional one-line subtitle"
series: "Series Display Name (1 of N)"   # shown in the header and homepage section title
seriesSlug: series-key                    # stable, lowercase, no spaces — groups articles
seriesOrder: 1                            # position within the series on the homepage
tier: hub                                 # or: spoke
status: DRAFT                             # include the word DRAFT to hide it from the homepage;
                                           # omit this field entirely once it's ready to publish
---
```

- **`seriesSlug` is the important one.** It's what groups articles together on the homepage and must stay
  identical across every article in a series, even if you later reword the display `series` label.
- Starting a brand-new series? Just pick a new `seriesSlug` (e.g. `eaan`, `grounds`) — no code changes needed.
  It'll get its own section on the homepage automatically.
- Standalone articles (no series) are fine too — omit `series`/`seriesSlug` and they'll land in a
  "Standalone" section.
- Leave `status: DRAFT ...` on anything not ready for readers. The homepage filters out any article whose
  `status` contains the word DRAFT. Remove the `status` field (or make sure it doesn't contain "DRAFT")
  when it's ready to go live.

## Publishing

Push to the connected GitHub repo's `main` branch — Netlify rebuilds and redeploys automatically.

## Structure

- `src/content/articles/` — all articles, flat, grouped by `seriesSlug` in frontmatter
- `src/content.config.ts` — the frontmatter schema (add fields here if you need new ones)
- `src/layouts/Article.astro` — shared page shell, header, and styling
- `src/pages/index.astro` — homepage, groups and lists articles by series
- `src/pages/articles/[...slug].astro` — renders each article at `/articles/<id>/`
- `notes/` — sourcing notes and scratch material, kept off the published site
