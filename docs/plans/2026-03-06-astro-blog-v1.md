# Astro Blog V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multilingual Astro blog (zh/en) with multi-author posts and build-time GitHub project status.

**Architecture:** Use Astro static generation with Content Collections for posts/authors. Use language-prefixed routes (`/zh`, `/en`) and dynamic post routes by locale. Fetch GitHub repo status in server frontmatter during build and render as static HTML.

**Tech Stack:** Astro 5, TypeScript, Markdown/MDX, GitHub Actions Pages deploy.

### Task 1: Scaffold and baseline

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`

1. Confirm Astro scaffold and dependencies.
2. Add publish/check scripts.
3. Configure `site` and `base` from env for Pages.

### Task 2: Content model for multi-author + multilingual

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/authors/*.md`
- Create: `src/content/posts/{zh,en}/*.md`

1. Define `authors` and `posts` collections.
2. Use author references in post frontmatter.
3. Add seed content for both languages.

### Task 3: UI routes and rendering

**Files:**
- Create: `src/pages/[lang]/index.astro`
- Create: `src/pages/[lang]/posts/index.astro`
- Create: `src/pages/[lang]/posts/[...slug].astro`
- Modify/Create shared components/layouts.

1. Build language home and post listing/detail.
2. Render author cards from references.
3. Add localized labels and metadata.

### Task 4: Build-time project status integration

**Files:**
- Create: `src/lib/project-status.ts`
- Modify: home pages/components.

1. Pull GitHub repo status from API at build-time.
2. Support env-configured owner/repo list.
3. Gracefully fallback on API errors.

### Task 5: CI/CD and docs

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Modify: `docs/site-setup-guide.md` (append usage note)

1. Add deploy workflow on push + scheduled rebuild.
2. Document env vars and local run.
3. Run `npm run build` for verification.
