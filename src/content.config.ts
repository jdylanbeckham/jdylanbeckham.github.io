// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

// 2. Import loader(s)
import { glob } from 'astro/loaders'

// 3. Define your collection(s)
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
})

const writing = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    publishedDate: z.coerce.date(),
    publication: z.string().optional(),
    series: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    historical: z.boolean().default(false),
    originalUrl: z.string().url().optional(),
    archivePdf: z.string().optional(),
  }),
})

// 4. Export a single `collections` object to register your collection(s)
export const collections = { projects, writing }
