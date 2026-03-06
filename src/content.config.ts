import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const authors = defineCollection({
	loader: glob({ base: './src/content/authors', pattern: '**/*.md' }),
	schema: z.object({
		name: z.string(),
		role: z.string(),
		bio: z.string(),
		github: z.string().optional(),
	}),
});

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		publishedAt: z.coerce.date(),
		updatedAt: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		language: z.enum(['zh', 'en']),
		authors: z.array(reference('authors')).min(1),
		draft: z.boolean().default(false),
	}),
});

export const collections = { authors, posts };
