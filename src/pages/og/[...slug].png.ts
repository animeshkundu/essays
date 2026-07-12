import type { APIRoute } from 'astro';
import { getPublishedEssays, formatDate, formatMinutes, getMinutesRead } from '../../lib/content';
import { renderOgPng } from '../../lib/og';

export async function getStaticPaths() {
  const essays = await getPublishedEssays();
  return essays.map((essay) => ({ params: { slug: essay.id }, props: { essay } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { essay } = props as { essay: Awaited<ReturnType<typeof getPublishedEssays>>[number] };
  const meta = [formatDate(essay.data.pubDate), formatMinutes(getMinutesRead(essay))].filter(Boolean).join(' · ');
  const png = await renderOgPng({
    kicker: essay.data.category === 'essay' ? 'Essay' : essay.data.category,
    title: essay.data.title,
    meta,
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
