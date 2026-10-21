import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    // One line shown on cards and used as the meta description.
    subtitle: z.string().optional(),
    // Display label, e.g. "The Kalam (1 of 4)".
    series: z.string().optional(),
    // Stable grouping key. Must match a key in src/data/series.ts.
    seriesSlug: z.string().optional(),
    // Position in the series (lower first). Companions sit just after their part.
    seriesOrder: z.number().optional(),
    // Which part of the series this is, and whether it is a companion to that part.
    part: z.number().optional(),
    companion: z.boolean().optional(),
    tier: z.enum(['hub', 'spoke']).default('hub'),
    // Any status containing the word DRAFT hides the article from every listing.
    status: z.string().optional(),
    // Glossary keys to list even if the text does not mark them inline.
    glossaryExtra: z.array(z.string()).optional(),
  }),
});

export const collections = { articles };
