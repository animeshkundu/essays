import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export type Essay = CollectionEntry<'essays'>;

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
  const counts = new Map<string, number>();
  for (const essay of essays) {
    for (const tag of essay.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count, slug: getTagSlug(tag) })).sort((a, b) =>
    a.tag.localeCompare(b.tag),
  );
}

export function getMetaParts(essay: Essay) {
  return [formatDate(essay.data.pubDate), essay.data.category, formatMinutes(getMinutesRead(essay)), ...essay.data.tags].filter(
    Boolean,
  ) as string[];
}
