import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Placeholder schema matching the draft's current frontmatter.
// Swap in the real site's schema when it's available.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    // Display label, e.g. "The Kalam (1 of 4)" — shown in the header and on the homepage.
    series: z.string().optional(),
    // Stable grouping key, e.g. "kalam" — used to group articles on the homepage
    // and to build series links. Keep this the same across every article in a series
    // even if the display label (`series`) changes wording later.
    seriesSlug: z.string().optional(),
    // Where an article sits within its series, for ordering on the series' section
    // of the homepage. Lower numbers come first; omit for series without an order.
    seriesOrder: z.number().optional(),
    tier: z.enum(['hub', 'spoke']).default('hub'),
    status: z.string().optional(),
  }),
});

export const collections = { articles };
