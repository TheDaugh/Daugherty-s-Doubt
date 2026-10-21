import { getCollection, type CollectionEntry } from 'astro:content';
import { series as seriesMeta, type Planned } from '../data/series';

export type Entry = CollectionEntry<'articles'>;

export async function published(): Promise<Entry[]> {
  const all = await getCollection('articles');
  return all.filter((a) => !a.data.status?.toUpperCase().includes('DRAFT'));
}

export type Item =
  | { kind: 'article'; order: number; entry: Entry }
  | { kind: 'planned'; order: number; planned: Planned };

export async function seriesItems(slug: string): Promise<Item[]> {
  const entries = (await published()).filter((e) => e.data.seriesSlug === slug);
  const have = new Set(entries.map((e) => e.id));
  const items: Item[] = entries.map((entry) => ({ kind: 'article', order: entry.data.seriesOrder ?? 99, entry }));
  for (const p of seriesMeta[slug]?.planned ?? []) {
    if (!have.has(p.slug)) items.push({ kind: 'planned', order: p.order, planned: p });
  }
  return items.sort((a, b) => a.order - b.order);
}

export const titleOf = (i: Item) => (i.kind === 'article' ? i.entry.data.title : i.planned.title);
