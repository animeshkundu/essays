import rss from '@astrojs/rss';
import { getPublishedEssays } from '../lib/content';

export async function GET(context) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const site = new URL(base, context.site).toString();
  const essays = await getPublishedEssays();

  return rss({
    title: 'Essays',
    description: 'Essays by Animesh Kundu.',
    site,
    items: essays.map((essay) => ({
      title: essay.data.title,
      description: essay.data.description,
      pubDate: essay.data.pubDate,
      categories: essay.data.tags,
      link: `${essay.id}/`,
    })),
  });
}
