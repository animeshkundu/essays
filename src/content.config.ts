import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const essays = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: './src/content/essays',
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.mdx$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(280),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum(['essay', 'note', 'review']).default('essay'),
    draft: z.boolean().default(false),
    minutesRead: z.number().optional(),
    hero: z.string().optional(),
    heroAlt: z.string().optional(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    register: z.string().optional(),
  }),
});

export const collections = { essays };
