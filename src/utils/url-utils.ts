import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

const POSTS_CONTENT_MARKER = "src/content/posts/";

export function pathsEqual(path1: string, path2: string) {
	const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
	const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizedPath1 === normalizedPath2;
}

function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

export function getPostUrlBySlug(slug: string): string {
	return url(`/posts/${slug}/`);
}

export function getTagUrl(tag: string): string {
	if (!tag) return url("/archive/");
	return url(`/archive/?tag=${encodeURIComponent(tag.trim())}`);
}

export function getCategoryUrl(category: string | null): string {
	if (
		!category ||
		category.trim() === "" ||
		category.trim().toLowerCase() === i18n(I18nKey.uncategorized).toLowerCase()
	)
		return url("/archive/?uncategorized=true");
	return url(`/archive/?category=${encodeURIComponent(category.trim())}`);
}

export function getDir(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return path.substring(0, lastSlashIndex + 1);
}

export function getPostAssetBasePath(
	entryId: string,
	filePath?: string,
): string {
	if (filePath) {
		const normalizedFilePath = filePath.replace(/\\/g, "/");
		const markerIndex = normalizedFilePath.lastIndexOf(POSTS_CONTENT_MARKER);

		if (markerIndex >= 0) {
			const relativeFilePath = normalizedFilePath.slice(
				markerIndex + POSTS_CONTENT_MARKER.length,
			);
			const fileDir = getDir(relativeFilePath);
			const normalizedFileDir = fileDir === "/" ? "" : fileDir;
			return joinUrl("content", "posts", normalizedFileDir);
		}
	}

	const fallbackDir = getDir(entryId);
	const normalizedFallbackDir = fallbackDir === "/" ? "" : fallbackDir;
	return joinUrl("content", "posts", normalizedFallbackDir);
}

export function url(path: string) {
	return joinUrl("", import.meta.env.BASE_URL, path);
}
