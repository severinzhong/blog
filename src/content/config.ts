import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const postSchema = z.object({
	title: z.string(),
	published: z.date(),
	updated: z.date().optional(),
	draft: z.boolean().optional().default(false),
	description: z.string().optional().default(""),
	image: z.string().optional().default(""),
	tags: z.array(z.string()).optional().default([]),
	category: z.string().optional().nullable().default(""),
	lang: z.string().optional().default(""),

	/* For internal use */
	prevTitle: z.string().default(""),
	prevSlug: z.string().default(""),
	nextTitle: z.string().default(""),
	nextSlug: z.string().default(""),
});

const postsCollection = defineCollection({
	loader: glob({
		base: "./src/content/posts",
		pattern: "**/!(*_en).md",
	}),
	schema: postSchema,
});

const postsEnCollection = defineCollection({
	loader: glob({
		base: "./src/content/posts",
		pattern: "**/*_en.md",
	}),
	schema: z.object({
		...postSchema.shape,
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	posts_en: postsEnCollection,
	spec: specCollection,
};
