import { defineCollection, z } from 'astro:content';

const cakes = defineCollection({
  type: 'content',
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
