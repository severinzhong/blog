# AI and Digital Notes (Astro)

A bilingual (`zh` / `en`) Astro blog with:

- Multi-author posts via Astro Content Collections
- Language-prefixed routes (`/zh`, `/en`)
- Build-time GitHub project status sync
- GitHub Pages deploy via GitHub Actions

## Local Development

```bash
npm install
npm run dev
```

Build locally:

```bash
npm run build
```

## Content Structure

```text
src/content/
  authors/
    zhong.md
    guest-editor.md
  posts/
    zh/
    en/
```

Post frontmatter example:

```yaml
---
title: Launching Astro Blog V1
summary: Scope of v1
publishedAt: 2026-03-06
tags: [astro, blog]
language: en
authors: [zhong, guest-editor]
---
```

## Project Status Data (GitHub)

Project status is fetched at build time from GitHub API.

Use either one of these repo-level variables in GitHub:

- `PROJECT_REPOS`: comma-separated list like `owner/repo-a,owner/repo-b`
- `PROJECT_OWNER`: owner name to fetch latest updated repos automatically

Optional:

- `GITHUB_TOKEN`: defaults to `${{ secrets.GITHUB_TOKEN }}` in Actions, can raise API limits

## Deploy to GitHub Pages

Workflow file: `.github/workflows/deploy.yml`

Triggers:

- Push to `main`
- Manual run
- Scheduled rebuild every 6 hours (`cron`), so project status stays fresh

Set repository variables:

- `SITE_URL`: e.g. `https://<username>.github.io`
- `BASE_PATH`: `/` for user site repo, or `/<repo>` for project site repo

## Scripts

- `npm run dev`: local development
- `npm run build`: production build
- `npm run preview`: preview built site
- `npm run check`: Astro type/content checks
- `npm run publish`: build + commit + push
