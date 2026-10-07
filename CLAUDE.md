# Welcome, AI Agents (Claude, Gemini, OpenAI)

This is an **Enterprise Nuxt 4 Starter Skeleton** designed to support **Autonomous AI Orchestration workflows**.

## 1. AI Configuration & Roles

- `.ai/shared/agents/*.md`: Core system prompts and agent personas (Tech Lead, Frontend Engineer, etc.). Single source of truth.
- `.ai/shared/workflows/*.md`: Shared business logic for AI orchestration (e.g. feature delivery).
- `.claude/commands/`: Claude Code slash commands pointing to the shared workflows and agents.
- `.agents/rules/` & `skills/`: Google Antigravity rules and skills pointing to the shared workflows.
- `.agents/agents/`: Flat YAML pointers for Antigravity's native agent UI.
- **Tools (MCP)**: Agents use the Model Context Protocol for GitHub, Sanity and Jira.
- **Operating model** ([`.ai/shared/workflows/operating-model.md`](.ai/shared/workflows/operating-model.md)): the two human gates (G1 plan, G2 production), blockers (never hold, report), mandatory independent reviewer subagent, and signed GitHub comments. It overrides anything conflicting.
- **Commands**: `/feature <request>`, `/review <PR>`, `/release [hotfix <name>]`, `/agents`.
- **Drift guard**: `tests/orchestration/orchestration.spec.ts` fails CI if personas, pointers or referenced paths drift.

## 2. Architecture (read before writing code)

- [`docs/conventions/ARCHITECTURE.md`](docs/conventions/ARCHITECTURE.md) — directories, data flow, i18n, SEO.
- [`docs/conventions/CODING_STANDARDS.md`](docs/conventions/CODING_STANDARDS.md) — rules, most of them **enforced by ESLint**.
- [`docs/deployment/DEPLOYMENT.md`](docs/deployment/DEPLOYMENT.md) — environments, env vars, pipeline.

Principles: **KISS & SOLID**, **co-location** (`composables/<useName>/<useName>.ts` + its `.spec.ts`), flat Nuxt layout (no `app/`).
**Two-Case Rule**: `PascalCase` for Vue components, `camelCase` for everything else.

## 3. Tech Stack

- **Nuxt 4** (SSR, flat layout via `srcDir: '.'`), Vue 3 `<script setup>`, TypeScript strict — Node 24
- **Nuxt UI v4** + Tailwind CSS v4
- **Sanity v6** (Studio in `studio/`, one document per language (DE/EN)); queries with **groqd**, schema types from TypeGen
- **@nuxtjs/i18n v10**, **@nuxtjs/robots** + **@nuxtjs/sitemap**
- **Vitest 5** (`unit` + `nuxt` projects) & **Playwright**

## 4. Rules to Enforce

- **No APIs**: never create `server/api/` routes. This is a frontend layer.
- **Data access only in composables**: `useSanity()` + `useAsyncData` live in `composables/`. Components, pages and layouts calling them fail lint.
- **Queries** are written with groqd at the top of the composable that runs them; shared pieces are fragments in `utils/groqd/groqd.utils.ts`. A page composable returns one view of plain values; components never see CMS types. After changing a schema: `npm run typegen` and commit `types/sanity.types.ts`.
- **Translated content** ([ADR 0001](docs/adr/0001-i18n-translated-urls.md)): **every document with text is in one language** (`language` field; every query filters `language == $locale`). No field-level translation.
- **Skeleton** ([ADR 0003](docs/adr/0003-structured-content.md), [ADR 0004](docs/adr/0004-skeleton-scope-and-data-flow.md)): 7 pages; code owns pages, routes, layout and menu; Sanity owns their content (one document per page and language) and the collections editors create (offers, testimonials, FAQ). No page builder, no seed, no sample content. Translated paths are declared once in `constants/routes.constants.ts`; editors own only the slug of an offer.
- **Imports**: Vue/Nuxt APIs are auto-imported; project code (composables, utils, constants) is imported explicitly from its `~/` file.
- **No `fetch`/`$fetch`, no `console.*`, no `any`**, no parent-relative imports (`~/` alias).
- **Early returns** (Bouncer Pattern). No deeply nested `if/else`.
- **No hardcoded text**: `t()` / `$t()`; every key exists in every locale.
- **Dates**: always pass an explicit time zone (`utils/date/date.utils.ts`); never render `new Date()` output directly.

## 5. Autonomous Feature Delivery Workflow

For a request, `/feature`, or a task file (e.g. "Implement `docs/tasks/<name>.md`"), run the single pipeline [`.ai/shared/workflows/feature-orchestration.md`](.ai/shared/workflows/feature-orchestration.md):

1. **Scope** (task file) → **Plan** → 🚦 **Gate G1: wait for human approval**.
2. **Implement** on `feat/<name>` from `develop` → local gates (`npm run verify` + E2E, defined once in `docs/conventions/CODING_STANDARDS.md` §7).
3. **PR** into `develop` → [review loop](.ai/shared/workflows/code-review-loop.md) with a **fresh reviewer subagent** each round, until `APPROVED` (every comment resolved, max 3 rounds).
4. **Merge** (squash) after green CI → verify the staging deploy. Blockers are reported, never held.
5. **Production**: [`release.md`](.ai/shared/workflows/release.md), 🚦 **Gate G2: human "go"**.
