# Repository Guidelines

## Project Structure & Module Organization
This repository is currently documentation-first.
- `docs/development-requirements.md`: product and engineering requirements.
- `docs/site-setup-guide.md`: setup and deployment guidance for the planned Astro site.

When scaffolding begins, follow the structure defined in `docs/site-setup-guide.md`:
- `src/content/posts/{zh,en}/` for multilingual Markdown posts.
- `src/pages/{zh,en}/` for language-specific routes.
- `.github/workflows/` for CI/CD deployment to GitHub Pages.

## Build, Test, and Development Commands
No runnable app is committed yet, so there is no active `package.json` in this directory.
Use these commands once Astro is initialized:
- `npm create astro@latest .`: scaffold the site in this repo.
- `npm install`: install dependencies.
- `npm run dev`: start local dev server.
- `npm run build`: produce static build artifacts.
- `npm run publish`: build, commit, and push (as defined in setup docs).

## Coding Style & Naming Conventions
- Use Markdown for planning/product docs under `docs/`.
- Keep prose concise, imperative, and scannable; prefer short sections and bullet lists.
- Use lowercase kebab-case file names (for example, `site-setup-guide.md`).
- For planned Astro code, prefer default formatter/linter from Astro init and TypeScript-enabled setup.

## Testing Guidelines
There is no test framework configured yet.
- Current quality gate: documentation accuracy + successful `npm run build` after scaffolding.
- Add tests with the app scaffold (for example, unit/component tests) and document new commands here.
- Name tests by behavior (for example, `post-list-renders-locale-links`).

## Commit & Pull Request Guidelines
Git history is not available in this workspace yet, so use these conventions going forward:
- Commit format: Conventional Commits (for example, `feat: add zh/en route skeleton`, `docs: refine setup guide`).
- Keep commits focused and atomic.
- PRs should include: purpose, scope, verification steps, linked issue (if any), and screenshots for UI changes.

## Agent-Specific Notes
If working with Codex agents in this repo, run:
- `~/.codex/superpowers/.codex/superpowers-codex bootstrap`
Then apply relevant skills before implementation work.
