# Welcome, AI Agents (Claude, Gemini, OpenAI)

A **Nuxt 4 + Sanity skeleton** for multi-language landing pages, delivered by **autonomous AI orchestration**. Start a client project from it with `/new-project` ([`docs/NEW_PROJECT.md`](docs/NEW_PROJECT.md)); what is core and what is an example: [`docs/SKELETON.md`](docs/SKELETON.md).

## 1. AI configuration

- `.ai/shared/agents/*.md`: the personas (Tech Lead, engineers, Code Reviewer, Privacy Officer, …). Single source of truth.
- `.ai/shared/workflows/*.md`: the workflows. **[`operating-model.md`](.ai/shared/workflows/operating-model.md) overrides anything conflicting**: two human gates (G1 plan, G2 production), blockers reported never held, an independent reviewer subagent each round, signed GitHub comments.
- `.claude/commands/`, `.agents/` (Antigravity): thin pointers to the shared files.
- **Commands**: `/new-project <client>`, `/design [idea]`, `/feature <request>`, `/review <PR>`, `/release [hotfix <name>]`, `/agents`.
- **Design track** ([`docs/design/DESIGN_WORKFLOW.md`](docs/design/DESIGN_WORKFLOW.md)): brief (gate D1) → one Lovable prompt → approved design (gate D2) → a changeset in `docs/design/changes/`. Lovable builds a React prototype only; the frontend implements the changeset's facts under our architecture and `pnpm design:verify <change>` passes before the PR.
- **Drift guard**: `tests/orchestration/orchestration.spec.ts` fails CI when personas, pointers or referenced paths drift.

## 2. Read before writing code

- [`docs/conventions/ARCHITECTURE.md`](docs/conventions/ARCHITECTURE.md): directories, data flow, rendering, i18n, SEO.
- [`docs/conventions/CODING_STANDARDS.md`](docs/conventions/CODING_STANDARDS.md): every rule, most **enforced by ESLint**; the local gates (§7); comments (§8); docs (§9).
- [`docs/sanity/SANITY.md`](docs/sanity/SANITY.md): the content model, queries, the seed.
- [`docs/deployment/DEPLOYMENT.md`](docs/deployment/DEPLOYMENT.md): environments, env vars, pipeline.

## 3. Stack

Nuxt 4 (SSR, flat layout), Vue 3 `<script setup>`, TypeScript strict, Node 24 · Nuxt UI v4 + Tailwind v4 · Sanity v6 (`studio/`), groqd queries, TypeGen schema types · @nuxtjs/i18n v10 · Vitest 5 + Playwright · Vercel + GitHub Actions.

## 4. Hard rules

- **No server code** (`server/`, `api/`): this is a frontend layer.
- **One door to the CMS**: page composables call `useCmsQuery`; views never fetch (ESLint).
- **One document per language**: every query filters `language == $locale` ([ADR 0001](docs/adr/0001-i18n-translated-urls.md)).
- **Code owns pages, Sanity owns content** ([ADR 0004](docs/adr/0004-skeleton-scope-and-data-flow.md)). Every schema change updates `types/sanity.types.ts` (`pnpm typegen`), the seed (`studio/seed/`) and the E2E fixtures in the same PR.
- **No hardcoded text**, no `any`, no `!`, no `console.*`, no `fetch`/`$fetch`, no `../` imports; dates with an explicit time zone.
- **Web performance: aim 90+, block under 80** (PageSpeed Insights, every page, mobile and desktop).
- **The code is the truth**: a doc that describes code changes with it.

## 5. Feature delivery

For a request, `/feature`, or a task file (`docs/tasks/<name>.md`), run [`feature-orchestration.md`](.ai/shared/workflows/feature-orchestration.md): scope → plan (🚦 G1, passed by the Tech Lead for a design approved at D2) → implement on `feat/<name>` from `develop` → local gates → PR into `develop` → [review loop](.ai/shared/workflows/code-review-loop.md) with a fresh reviewer each round → squash-merge after green CI → Development. Production: [`release.md`](.ai/shared/workflows/release.md), 🚦 G2.
