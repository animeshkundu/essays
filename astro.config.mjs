import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import readingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

function remarkReadingTime() {
  return (tree, file) => {
    const stats = readingTime(toString(tree));
    const minutesRead = Math.max(1, Math.ceil(stats.minutes));
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.minutesRead = minutesRead;
  };
}

function rehypeDropcap() {
  return (tree) => {
    const paragraph = findFirstParagraph(tree);
    if (!paragraph) return;
    paragraph.properties ??= {};
    const current = paragraph.properties.className;
    const className = Array.isArray(current) ? current : typeof current === 'string' ? current.split(' ') : [];
    if (!className.includes('dropcap')) className.push('dropcap');
    paragraph.properties.className = className;
  };
}

function findFirstParagraph(node) {
  if (!node || typeof node !== 'object') return undefined;
  if (node.type === 'element' && node.tagName === 'p') return node;
  if (!Array.isArray(node.children)) return undefined;
  for (const child of node.children) {
    const found = findFirstParagraph(child);
    if (found) return found;
  }
  return undefined;
}

export default defineConfig({
  site: 'https://animesh.kundus.in',
  base: '/essays',
  integrations: [expressiveCode(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: unified({
      smartypants: false,
      remarkPlugins: [remarkReadingTime],
      rehypePlugins: [rehypeDropcap],
    }),
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Newsreader',
      cssVariable: '--font-serif',
      weights: ['400', '500', '600', '700'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-sans',
      weights: ['400', '500', '600', '700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
