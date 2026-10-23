import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cakes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cakes' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.literal('tortas'),
      image: image(),
      imageHover: image().optional(),
      alt: z.string(),
    }),
});

export const collections = { cakes };
