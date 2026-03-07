import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import { siteConfig } from "@/config";

type DefaultPostEntry = CollectionEntry<"posts">;
type EnglishPostEntry = CollectionEntry<"posts_en">;
type AnyPostEntry = DefaultPostEntry | EnglishPostEntry;
export type LocalizedPostEntry = AnyPostEntry & {
	slug: string;
};

const ENGLISH_SUFFIX_REGEX = /_en$/i;
const MARKDOWN_EXTENSION_REGEX = /\.md$/i;
const INDEX_SUFFIX_REGEX = /\/index$/i;

function getCanonicalSlugFromId(id: string): string {
	const noExtension = id.replace(MARKDOWN_EXTENSION_REGEX, "");
	const noLangSuffix = noExtension.replace(ENGLISH_SUFFIX_REGEX, "");
	const noIndexSuffix = noLangSuffix.replace(INDEX_SUFFIX_REGEX, "");
	return noIndexSuffix;
}

function isEnglishSiteLanguage(): boolean {
	return siteConfig.lang.toLowerCase().startsWith("en");
}

function toLocalizedEntry(
	entry: AnyPostEntry,
	canonicalSlug: string,
): LocalizedPostEntry {
	return {
		...entry,
		slug: canonicalSlug,
	};
}

async function getDefaultPosts(): Promise<DefaultPostEntry[]> {
	return getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
}

async function getEnglishPosts(): Promise<EnglishPostEntry[]> {
	return getCollection("posts_en", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
}

function pickLocalizedPosts(
	defaultPosts: DefaultPostEntry[],
	englishPosts: EnglishPostEntry[],
): LocalizedPostEntry[] {
	const preferredEnglish = isEnglishSiteLanguage();

	const defaultPostMap = new Map<string, DefaultPostEntry>();
	for (const post of defaultPosts) {
		defaultPostMap.set(getCanonicalSlugFromId(post.id), post);
	}

	const englishPostMap = new Map<string, EnglishPostEntry>();
	for (const post of englishPosts) {
		englishPostMap.set(getCanonicalSlugFromId(post.id), post);
	}

	const canonicalSlugs = new Set<string>([
		...defaultPostMap.keys(),
		...englishPostMap.keys(),
	]);

	const resolvedPosts: LocalizedPostEntry[] = [];
	for (const canonicalSlug of canonicalSlugs) {
		const defaultPost = defaultPostMap.get(canonicalSlug);
		const englishPost = englishPostMap.get(canonicalSlug);

		let selectedPost: AnyPostEntry | undefined;
		if (preferredEnglish && englishPost) {
			selectedPost = englishPost;
		} else if (defaultPost) {
			selectedPost = defaultPost;
		} else if (englishPost) {
			selectedPost = englishPost;
		}

		if (!selectedPost) continue;
		resolvedPosts.push(toLocalizedEntry(selectedPost, canonicalSlug));
	}

	return resolvedPosts;
}

// Retrieve localized posts and sort them by publication date.
async function getRawSortedPosts(): Promise<LocalizedPostEntry[]> {
	const [defaultPosts, englishPosts] = await Promise.all([
		getDefaultPosts(),
		getEnglishPosts(),
	]);
	const localizedPosts = pickLocalizedPosts(defaultPosts, englishPosts);
	return localizedPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
}

export async function getSortedPosts(): Promise<LocalizedPostEntry[]> {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}

export type PostForList = {
	slug: string;
	data: LocalizedPostEntry["data"];
};

export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getRawSortedPosts();

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getRawSortedPosts();
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
