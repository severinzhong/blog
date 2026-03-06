import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const SITE_META = {
	title: SITE_TITLE,
	description: SITE_DESCRIPTION,
};

export const NAV_COPY: Record<Locale, { home: string; posts: string; about: string; latestProjects: string; latestPosts: string; readMore: string }> = {
	zh: {
		home: '首页',
		posts: '文章',
		about: '关于',
		latestProjects: '项目动态',
		latestPosts: '最新文章',
		readMore: '阅读全文',
	},
	en: {
		home: 'Home',
		posts: 'Posts',
		about: 'About',
		latestProjects: 'Project Updates',
		latestPosts: 'Latest Posts',
		readMore: 'Read more',
	},
};

export function isLocale(value: string): value is Locale {
	return LOCALES.includes(value as Locale);
}

export function formatPostSlug(id: string, locale: Locale): string {
	if (id.startsWith(`${locale}/`)) {
		return id.slice(locale.length + 1);
	}
	return id;
}
