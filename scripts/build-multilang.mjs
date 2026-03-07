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
	const zhPath = getLocaleBasePath(rootBasePath, "zh-cn");
	const enPath = getLocaleBasePath(rootBasePath, "en");
	const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Redirecting...</title>
    <script>
      (function () {
        var supported = ["en", "zh-cn"];
        var basePath = ${JSON.stringify(rootBasePath)};
        var lang = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
        var target = String(lang).toLowerCase().startsWith("zh") ? "zh-cn" : "en";

        function normalizeBase(path) {
          if (!path) return "/";
          var normalized = String(path).trim();
          if (!normalized.startsWith("/")) normalized = "/" + normalized;
          if (normalized.length > 1 && normalized.endsWith("/")) normalized = normalized.slice(0, -1);
          return normalized;
        }

        function ensureSlash(path) {
          return path.endsWith("/") ? path : path + "/";
        }

        function isLocaleLike(segment) {
          return /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segment);
        }

        function toPath(base, segments) {
          var basePrefix = base === "/" ? "" : base;
          return [basePrefix].concat(segments).join("/").replace(/\\/+/g, "/").replace(/^$/, "/") + "/";
        }

        function trimLocaleTail(segmentsList) {
          if (segmentsList.length > 1 && supported.includes(String(segmentsList[0]).toLowerCase())) {
            while (segmentsList.length > 1 && supported.includes(String(segmentsList[segmentsList.length - 1]).toLowerCase())) {
              segmentsList.pop();
            }
          }
        }

        var normalizedBase = normalizeBase(basePath);
        var pathname = window.location.pathname || "/";
        var relativePath = pathname;
        if (normalizedBase !== "/" && relativePath.startsWith(normalizedBase + "/")) {
          relativePath = relativePath.slice(normalizedBase.length + 1);
        } else if (normalizedBase !== "/" && relativePath === normalizedBase) {
          relativePath = "";
        } else {
          relativePath = relativePath.replace(/^\\/+|\\/+$/g, "");
        }

        var segments = relativePath ? relativePath.split("/").filter(Boolean) : [];

        // Recover from old buggy redirects that appended locale segments repeatedly.
        trimLocaleTail(segments);

        if (segments.length === 0) {
          segments = [target];
        } else {
          var first = String(segments[0]).toLowerCase();
          if (supported.includes(first)) {
            // keep as-is
          } else if (isLocaleLike(segments[0])) {
            segments[0] = target;
          } else {
            segments.unshift(target);
          }
        }
        trimLocaleTail(segments);

        var destination = toPath(normalizedBase, segments);
        var current = ensureSlash(pathname);
        if (destination === current) {
          destination = toPath(normalizedBase, [target]);
          if (destination === current) return;
        }

        var suffix = window.location.search + window.location.hash;
        window.location.replace(destination + suffix);
      })();
    </script>
  </head>
  <body>
    <p>Redirecting...</p>
    <noscript>
      <p><a href="${zhPath}/">中文</a> | <a href="${enPath}/">English</a></p>
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
