# Personal Blog Site Setup Guide

## 1. Goal

Build a zero-cost personal blog with:

- static hosting on GitHub Pages (`<username>.github.io`)
- content authored locally in Markdown
- one-command publish workflow
- multilingual pages (at least `zh` and `en`)
- future-ready structure for ads and analytics

## 2. Recommended Stack

- Framework: `Astro`
- Content source: `Markdown` (or Astro Content Collections)
- Hosting: `GitHub Pages` (free)
- CI/CD: `GitHub Actions`
- Analytics: `Plausible`/`GA4` (optional at launch)
- Ads: `Google AdSense` (only after traffic/content maturity)

## 3. Initial Setup Steps

## 3.1 Create Repository

1. Create GitHub repository, suggested name: `blog`.
2. Push local project to `main`.
3. In GitHub repo settings:
- enable Pages via `GitHub Actions`.

## 3.2 Initialize Astro Project

Run inside `/Users/zhong/Code/blog`:

```bash
npm create astro@latest .
npm install
```

Recommended options:

- TypeScript: yes
- Lint/format: yes
- Use `src/content` for posts

## 3.3 Standard Content Structure

```text
src/
  content/
    posts/
      zh/
      en/
  pages/
    index.astro
    zh/
      index.astro
    en/
      index.astro
```

## 3.4 One-Command Publish

In `package.json` add:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "publish": "npm run build && git add . && git commit -m \"chore: publish\" && git push"
  }
}
```

Usage:

```bash
npm run publish
```

Note: this command assumes all generated/updated files should be committed.

## 3.5 GitHub Pages Deployment Workflow

Create `.github/workflows/deploy.yml` using Astro official GitHub Pages template:

- trigger on push to `main`
- build static site
- deploy to Pages artifact

After first successful run, site should be available at:

- `https://<username>.github.io/<repo>/`
- if user site repo is `<username>.github.io`, URL can be root domain path.

## 4. Multilingual Delivery Strategy

## 4.1 URL Strategy

- Chinese: `/zh/...`
- English: `/en/...`
- default root `/` redirects or links to preferred locale.

## 4.2 SEO Signals

Per page include:

- `hreflang` alternate links (`zh-CN`, `en`)
- canonical URL
- language-specific title/description
- sitemap with both locales

## 4.3 Cache and Rendering

- prebuild static pages for both languages in CI
- browser locale detection only for first-entry UX (do not hide URL language)
- avoid serving one URL with dynamic language swap for crawlers

## 5. SEO Baseline Checklist

- clean semantic headings (`h1`, `h2`, `h3`)
- unique title/description per post
- internal links between related posts
- image alt text
- `robots.txt` and `sitemap.xml`
- page speed optimization (compressed images, limited JS)

## 6. Ads Readiness (Post-Launch)

Do not add ads on day one. First reach content and traffic baseline:

- at least 20-30 quality posts
- consistent update cadence for 2-3 months
- stable search impressions and clicks
- clear About/Privacy/Contact pages

Then integrate AdSense script and verify policy compliance.

## 7. Suggested 2-Week Launch Plan

1. Day 1-2: Astro scaffolding + Pages CI deploy
2. Day 3-5: layout, post template, language routing
3. Day 6-9: publish first 6-8 posts (`zh` primary, `en` selected)
4. Day 10-12: SEO base (sitemap, robots, metadata)
5. Day 13-14: analytics + content calendar for next 4 weeks

## 8. Definition of Setup Done

Setup is done when:

- local `npm run dev` works
- `npm run build` passes
- `main` push triggers successful GitHub Pages deployment
- at least one post available in `zh` and `en`
- one-command publish workflow verified end-to-end

## 9. V1 Implementation Notes (2026-03-06)

- route model uses `/zh/` and `/en/` as language roots
- content model uses two collections:
- `authors`: author profiles
- `posts`: bilingual posts referencing one or more authors
- GitHub project status is fetched at build time from:
- `PROJECT_REPOS` (explicit list), or
- `PROJECT_OWNER` (latest repos by owner)
- deploy workflow runs on `main` push plus scheduled rebuild every 6 hours for fresher project status
