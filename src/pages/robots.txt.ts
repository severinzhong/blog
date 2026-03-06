import { withBase } from '../lib/site';

export async function GET() {
	const body = ['User-agent: *', 'Allow: /', `Sitemap: ${withBase('/sitemap-index.xml')}`].join('\n');
	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}
