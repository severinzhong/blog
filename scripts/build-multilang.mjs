import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const tmpRoot = path.join(projectRoot, ".dist-locales");

const siteUrl = process.env.SITE_URL ?? "https://example.com";
const rootBasePath = normalizeBasePath(process.env.BASE_PATH ?? "/");

const locales = [
	{ envLang: "en", pathSegment: "en" },
	{ envLang: "zh_CN", pathSegment: "zh-cn" },
];

function normalizeBasePath(basePath) {
	let normalized = basePath.trim();
	if (!normalized.startsWith("/")) normalized = `/${normalized}`;
	if (normalized.length > 1 && normalized.endsWith("/")) {
		normalized = normalized.slice(0, -1);
	}
	return normalized;
}

function getLocaleBasePath(basePath, segment) {
	return basePath === "/" ? `/${segment}` : `${basePath}/${segment}`;
}

function run(command, env = {}) {
	execSync(command, {
		cwd: projectRoot,
		stdio: "inherit",
		env: { ...process.env, ...env },
	});
}

function writeRootRedirect(filePath) {
	const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Redirecting...</title>
    <script>
      (function () {
        var lang = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
        var target = String(lang).toLowerCase().startsWith("zh") ? "zh-cn" : "en";
        var suffix = window.location.search + window.location.hash;
        window.location.replace("./" + target + "/" + suffix);
      })();
    </script>
  </head>
  <body>
    <p>Redirecting...</p>
    <noscript>
      <p><a href="./zh-cn/">中文</a> | <a href="./en/">English</a></p>
    </noscript>
  </body>
</html>
`;
	writeFileSync(filePath, html);
}

rmSync(tmpRoot, { recursive: true, force: true });
mkdirSync(tmpRoot, { recursive: true });

for (const locale of locales) {
	const localeBasePath = getLocaleBasePath(rootBasePath, locale.pathSegment);
	run("pnpm astro build", {
		SITE_URL: siteUrl,
		BASE_PATH: localeBasePath,
		SITE_LANG: locale.envLang,
		PUBLIC_SITE_LANG: locale.envLang,
	});
	run("pnpm pagefind --site dist");
	cpSync(distDir, path.join(tmpRoot, locale.pathSegment), { recursive: true });
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const locale of locales) {
	cpSync(path.join(tmpRoot, locale.pathSegment), path.join(distDir, locale.pathSegment), {
		recursive: true,
	});
}

writeRootRedirect(path.join(distDir, "index.html"));
writeRootRedirect(path.join(distDir, "404.html"));

rmSync(tmpRoot, { recursive: true, force: true });
