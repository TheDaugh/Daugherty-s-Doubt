// One entry per series. The key must match `seriesSlug` in article frontmatter.
// `planned` lists articles that are linked from published pieces but not written yet.
// They show as unlaid courses until a file with that slug appears in src/content/articles.
export interface Planned {
  slug: string;
  title: string;
  part: number;
  order: number;
}

export interface SeriesMeta {
  title: string;
  description: string;
  planned: Planned[];
}

export const series: Record<string, SeriesMeta> = {
  kalam: {
    title: 'The Kalam',
    description:
      'The kalam cosmological argument one line at a time: whether whatever begins to exist has a cause, whether the universe began, and what kind of cause the conclusion delivers.',
    planned: [
      { slug: 'kalam-premise-2-philosophical', title: 'Can the Past Be Infinite?', part: 2, order: 3 },
      { slug: 'kalam-premise-2-scientific', title: "What Cosmology Does and Doesn't Show", part: 3, order: 4 },
      { slug: 'kalam-conclusion', title: 'Who Made God?', part: 4, order: 5 },
    ],
  },
};
