# Landing Page Skeleton

A production-grade Nuxt 4 + Sanity skeleton for multi-language landing pages (DE/EN), built to start client projects from, by people and AI agents. Code owns the pages, Sanity owns their content.

- **Start a project**: [`docs/NEW_PROJECT.md`](docs/NEW_PROJECT.md) (or `/new-project` with Claude Code).
- **What's core, what's an example**: [`docs/SKELETON.md`](docs/SKELETON.md).

## Stack

| Concern    | Choice                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Framework  | [Nuxt 4](https://nuxt.com) (SSR, flat layout), Vue 3 `<script setup>`, TypeScript strict, Node 24 |
| UI         | [Nuxt UI v4](https://ui.nuxt.com) + Tailwind CSS v4, light and dark                               |
| CMS        | [Sanity v6](https://www.sanity.io) Studio in `studio/`, one document per language, groqd queries  |
| i18n / SEO | @nuxtjs/i18n v10 (`/` DE, `/en` EN, translated URLs), hreflang, sitemap, robots, schema.org       |
| Quality    | ESLint (architecture rules), Prettier, Vitest 5, Playwright, PageSpeed Insights gate              |
| Delivery   | GitHub Actions → Vercel; staging on `develop`, production on `main`                               |

## Quick start

```bash
nvm use 24                             # Node 24 (.nvmrc)
npm install --global pnpm              # once per machine; the repo pins the exact pnpm version
pnpm install                           # web app and Studio (pnpm workspace)
cp .env.example .env                   # web app → staging dataset
cp studio/.env.example studio/.env     # Studio  → staging dataset
# set NUXT_PUBLIC_SANITY_PROJECT_ID in .env and SANITY_STUDIO_PROJECT_ID in studio/.env
pnpm exec sanity login                 # once, inside studio/
pnpm studio:seed                       # optional: demo content in the staging dataset
pnpm dev                               # web http://localhost:3000 · Studio http://localhost:3333
```

**pnpm only**: `npm install` fails on purpose (`devEngines`). A clone installed with npm: delete `node_modules`, `studio/node_modules` and `package-lock.json`, then `pnpm install`.

## Scripts

| Script                                       | What it does                                                         |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm dev`                                   | Web app + Studio in watch mode                                       |
| `pnpm build` / `pnpm preview`                | Production build of the web app / serve it locally                   |
| `pnpm build:e2e`                             | Production build against the fixture CMS, for `CI=1 pnpm test:e2e`   |
| `pnpm verify`                                | Lint, format check, types, unit and component tests with coverage    |
| `pnpm test` / `test:watch` / `test:coverage` | Vitest                                                               |
| `pnpm test:e2e` / `test:smoke`               | Playwright (E2E on the fixture CMS / smoke on `PLAYWRIGHT_BASE_URL`) |
| `pnpm typegen`                               | Regenerate `types/sanity.types.ts` from the Studio schema            |
| `pnpm studio:seed`                           | Demo content in the `staging` dataset (`--reset`, `--dry-run`)       |
| `pnpm studio:build`                          | Production build of the Studio                                       |
| `pnpm web-performance --url=<URL>`           | PageSpeed Insights on every page (needs `PAGESPEED_API_KEY`)         |
| `pnpm design:capture` / `design:verify`      | The design gate (`docs/design/DESIGN_WORKFLOW.md`)                   |

## Documentation

| Doc                                                                                          | For                                                  |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [Architecture](docs/conventions/ARCHITECTURE.md)                                             | Directories, data flow, rendering, i18n, SEO         |
| [Coding standards](docs/conventions/CODING_STANDARDS.md)                                     | Every rule and what enforces it; local gates         |
| [Sanity](docs/sanity/SANITY.md)                                                              | Content model, queries, the seed                     |
| [Deployment](docs/deployment/DEPLOYMENT.md)                                                  | Accounts, environments, env vars, pipeline, runbooks |
| [Consent & analytics](docs/analytics/DEVELOPER_GUIDE.md), [GTM setup](docs/analytics/GTM.md) | Adding a tool, cookie or event; GA4 setup            |
| [Legal go-live checklist](docs/legal/go-live-checklist.md)                                   | Before the first production release                  |
| [Design workflow](docs/design/DESIGN_WORKFLOW.md)                                            | Designing pages with Lovable                         |
| [Decisions](docs/adr/)                                                                       | Why the main choices were made                       |
| [AI agents](CLAUDE.md)                                                                       | The agent team and the delivery workflow             |

## Environments

Every link is on the repository's **Deployments** panel and in the report comment of every pull request.

| Environment    | Deployed from                        | Content                          |
| -------------- | ------------------------------------ | -------------------------------- |
| **dev**        | every pull request, after its checks | `staging` dataset                |
| **staging**    | every merge into `develop`           | `staging` dataset (demo content) |
| **production** | every merge into `main` (Gate G2)    | `production` dataset             |

A pull request runs CI (lint, types, tests, both builds, E2E), deploys the web app to **dev** and audits every page with PageSpeed Insights: 90+ is the aim, under 80 blocks. Details: [`docs/deployment/DEPLOYMENT.md`](docs/deployment/DEPLOYMENT.md).

## License

Private repository. All rights reserved.
