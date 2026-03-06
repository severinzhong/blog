import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { formatPostSlug, LOCALES } from '../lib/site';

export async function GET(context) {
	const posts = await getCollection('posts', ({ data }) => !data.draft);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts
			.map((post) => {
				const locale = LOCALES.find((item) => post.id.startsWith(`${item}/`));
				if (!locale) {
					return null;
				}
				return {
					title: post.data.title,
					description: post.data.summary,
					pubDate: post.data.publishedAt,
					link: `/${locale}/posts/${formatPostSlug(post.id, locale)}/`,
				};
			})
			.filter(Boolean),
	});
}
