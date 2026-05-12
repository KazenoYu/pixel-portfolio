import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().optional(),
        readMin: z.number().optional(),
      }),
    }),
  },
})
