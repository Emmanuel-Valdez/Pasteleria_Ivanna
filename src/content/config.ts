import { defineCollection, z } from 'astro:content';

const cakes = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.literal('tortas'),
      image: image(),
      alt: z.string(),
    }),
});

export const collections = { cakes };
