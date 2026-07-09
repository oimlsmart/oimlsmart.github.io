import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.union([z.string(), z.date(), z.number()]).transform(d => new Date(d).toISOString()),
    author: z.string().default('OIML SMART team'),
    summary: z.string().default(''),
    draft: z.boolean().default(true),
  }),
})

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    eyebrow: z.string().optional(),
    shortTitle: z.string().optional(),
    sidebar: z.boolean().default(true),
    order: z.number().optional(),
  }),
})

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    eyebrow: z.string().optional(),
    layout: z.string().optional(),
  }),
})

export const collections = { blog, docs, pages }