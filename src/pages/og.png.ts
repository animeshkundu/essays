import type { APIRoute } from 'astro';
import { renderOgPng } from '../lib/og';

// The default share card for non-essay surfaces (home, tags, about).
export const GET: APIRoute = async () => {
  const png = await renderOgPng({
    kicker: 'Essays',
    title: 'The words are the interface.',
    meta: 'animesh.kundus.in/essays',
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
