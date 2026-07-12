import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export type Essay = CollectionEntry<'essays'>;

// Fixed locale so tag ordering is stable across build hosts / ICU versions.
const collator = new Intl.Collator('en');

export function isPublished(data: Essay['data']) {
  return !data.draft && data.pubDate <= new Date();
}

export function sortByNewest(a: Essay, b: Essay) {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

export async function getPublishedEssays() {
  const essays = await getCollection('essays');
  return essays.filter((essay) => isPublished(essay.data)).sort(sortByNewest);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatMinutes(minutes?: number) {
  if (!minutes) return undefined;
  return `${minutes} min`;
}

export function getMinutesRead(essay: Essay) {
  if (essay.data.minutesRead) return essay.data.minutesRead;
  return Math.max(1, Math.ceil(readingTime(essay.body ?? '').minutes));
}

export function getTagSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getAllTags(essays: Essay[]) {
  // Group by canonical slug so case variants (ai / AI) collapse into one entry.
  const groups = new Map<string, { count: number; labels: Map<string, number> }>();
  for (const essay of essays) {
    for (const tag of essay.data.tags) {
      const slug = getTagSlug(tag);
      if (!slug) continue;
      const group = groups.get(slug) ?? { count: 0, labels: new Map<string, number>() };
      group.count += 1;
      group.labels.set(tag, (group.labels.get(tag) ?? 0) + 1);
      groups.set(slug, group);
    }
  }
  return Array.from(groups, ([slug, { count, labels }]) => {
    // Display the most-used casing; break ties alphabetically for stability.
    const tag = Array.from(labels).sort((a, b) => b[1] - a[1] || collator.compare(a[0], b[0]))[0][0];
    return { tag, count, slug };
  }).sort((a, b) => b.count - a.count || collator.compare(a.tag, b.tag));
}

// Related essays: most shared tags first, then recency; fall back to nearest dates.
export function getRelated(essay: Essay, all: Essay[], limit = 3) {
  const slugs = new Set(essay.data.tags.map(getTagSlug).filter(Boolean));
  const scored = all
    .filter((e) => e.id !== essay.id)
    .map((e) => ({ e, shared: new Set(e.data.tags.map(getTagSlug).filter((s) => slugs.has(s))).size }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.e.data.pubDate.valueOf() - a.e.data.pubDate.valueOf());
  const picks = scored.slice(0, limit).map((x) => x.e);
  if (picks.length < limit) {
    const chosen = new Set([essay.id, ...picks.map((p) => p.id)]);
    const target = essay.data.pubDate.valueOf();
    const byDate = all
      .filter((e) => !chosen.has(e.id))
      .sort((a, b) => Math.abs(a.data.pubDate.valueOf() - target) - Math.abs(b.data.pubDate.valueOf() - target));
    picks.push(...byDate.slice(0, limit - picks.length));
  }
  return picks;
}

export function getMetaParts(essay: Essay) {
  return [formatDate(essay.data.pubDate), essay.data.category, formatMinutes(getMinutesRead(essay)), ...essay.data.tags].filter(
    Boolean,
  ) as string[];
}
