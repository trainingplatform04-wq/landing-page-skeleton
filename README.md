# Landing Page Base

A small, production-grade Nuxt 4 + Sanity skeleton for multi-language landing pages (DE/EN), built to be forked by people and AI agents. Code owns the pages, Sanity owns their content ([ADR 0004](docs/adr/0004-skeleton-scope-and-data-flow.md)).

## Stack

| Concern    | Choice                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| Framework  | [Nuxt 4](https://nuxt.com) (SSR, flat layout), Vue 3 `<script setup>`, TypeScript strict, Node 24             |
| UI         | [Nuxt UI v4](https://ui.nuxt.com) + Tailwind CSS v4 (light/dark via semantic colors)                          |
| CMS        | [Sanity v6](https://www.sanity.io) Studio in `studio/`, one document per language (DE/EN), queries with groqd |
| i18n / SEO | @nuxtjs/i18n v10 (`/` DE, `/en` EN, translated URLs), canonical + hreflang, @nuxtjs/robots, @nuxtjs/sitemap   |
| Quality    | ESLint (architecture rules enforced), Prettier, Vitest 5 (unit + Nuxt runtime), Playwright                    |
| Delivery   | GitHub Actions → Vercel (staging on `develop`, production on `main`), both apps per environment               |

## Quick start

```bash
nvm use 24                             # Node 24 (.nvmrc)
npm install --global pnpm              # once per machine: pnpm 10 or newer (see below)
pnpm install                           # installs the web app and the Studio (pnpm workspace)
cp .env.example .env                   # web app → staging dataset
cp studio/.env.example studio/.env     # Studio  → staging dataset
# then set your Sanity project ID: NUXT_PUBLIC_SANITY_PROJECT_ID in .env, SANITY_STUDIO_PROJECT_ID in studio/.env
pnpm exec sanity login                 # once, for the Studio
pnpm dev                               # web http://localhost:3000 · Studio http://localhost:3333
```

### Package manager: pnpm only

- **One version for everyone**: `package.json` pins pnpm (`packageManager` for pnpm ≤ 10, `devEngines` for pnpm ≥ 11). Any pnpm 10 or newer you have
  installed downloads and uses that exact version inside this repo, so nobody has to upgrade by hand.
  CI reads the same field.
- **npm is blocked**: `npm install` fails on purpose (`EBADDEVENGINES`, set by `devEngines`).
- **Workspace settings** (Studio workspace, `overrides`, dependencies allowed to run install
  scripts) live in `pnpm-workspace.yaml`. `pnpm-lock.yaml` is the same on every OS: commit it as is.

Switching a clone that was installed with npm (once, in the repo root, any OS):

```bash
node -e "for (const d of ['node_modules', 'studio/node_modules', 'package-lock.json']) require('fs').rmSync(d, { recursive: true, force: true })"
pnpm install
```

## Scripts

| Script                                       | What it does                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                                   | Web app + Studio in watch mode                                           |
| `pnpm build` / `pnpm preview`                | Production build of the web app / serve it locally                       |
| `pnpm build:e2e`                             | Production build against the fixture CMS, for `CI=1 pnpm test:e2e`       |
| `pnpm studio:build`                          | Production build of the Studio                                           |
| `pnpm typegen`                               | Regenerate `types/sanity.types.ts` (schema types) from the Studio schema |
| `pnpm lint` / `lint:fix`                     | ESLint                                                                   |
| `pnpm format` / `format:check`               | Prettier                                                                 |
| `pnpm typecheck`                             | `vue-tsc` for the web app + `tsc` for the Studio                         |
| `pnpm test` / `test:watch` / `test:coverage` | Vitest (`unit` + `nuxt` projects, coverage ≥ 80 %)                       |
| `pnpm test:e2e`                              | Playwright: dev server locally; `CI=1` after `pnpm build:e2e` (as in CI) |
| `pnpm test:smoke`                            | Playwright smoke suite against `PLAYWRIGHT_BASE_URL`                     |

## Documentation

- [Architecture](docs/conventions/ARCHITECTURE.md): directories, data flow, i18n, SEO
- [Coding standards](docs/conventions/CODING_STANDARDS.md): rules and what enforces them
- [Deployment & environments](docs/deployment/DEPLOYMENT.md): env contract, pipeline, runbooks
- [AI agents](CLAUDE.md): orchestration setup and the autonomous delivery workflow

## Delivery flow

- **PR** → `develop`/`main`: CI (lint, format, TypeGen drift, types, unit, both builds, E2E)
- **Merge to `develop`**: full CI → web app + Studio deployed to **staging** → smoke test
- **Merge to `main`**: full CI → web app + Studio deployed to **production** → smoke test

## License

Private repository. All rights reserved.
