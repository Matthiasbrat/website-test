import { defineCollection, z } from 'astro:content';

// Schema for blog and docs posts
const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  updated: z.date().optional(),
  banner: z.string().optional(),
  draft: z.boolean().default(false),
  pdf: z.string().optional(),
  excerpt: z.string().optional(),
});

// Blog collection
const blog = defineCollection({
  type: 'content',
  schema: postSchema,
});

// Docs collection
const docs = defineCollection({
  type: 'content',
  schema: postSchema,
});

// Referrals collection
const referrals = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    company: z.string().optional(),
    description: z.string(),
    avatar: z.string().optional(),
    website: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
  }),
});

// Topics metadata (loaded separately)
export const topicSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  banner: z.string().optional(),
});

export type Topic = z.infer<typeof topicSchema>;
export type Post = z.infer<typeof postSchema>;

export const collections = {
  blog,
  docs,
  referrals,
};
