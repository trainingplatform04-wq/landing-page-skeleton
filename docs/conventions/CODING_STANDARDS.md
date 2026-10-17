# Coding Standards

✅ = enforced automatically (ESLint, TypeScript, tests or CI). The rest is enforced in review.

## 1. TypeScript & Vue

- ✅ TypeScript `strict`, **no `any`**, **no non-null `!`** (handle the empty case instead).
- ✅ SFC block order: `<script setup lang="ts">` → `<template>` → `<style>`.
- ✅ Imports in four groups, sorted: ① Vue, Nuxt and libraries ② project files (`~/…`) ③ type-only imports ④ siblings (`./…`). Use the `~/` alias, never `../` (except where the alias doesn't exist: `modules/`, `studio/`, `tests/e2e/`, `tests/webPerformance/`).
- ✅ No server code: `server/` and `api/` folders fail lint and the drift guard.
- ✅ Vue, Nuxt and module APIs are auto-imported (never from `#imports`). **Project code is imported explicitly** from its file, so an unknown name fails `typecheck`.
- ✅ No `console.*`.
- Early returns (Bouncer Pattern) over nested `if/else`.
- Names: `PascalCase` components, `camelCase` everything else; files carry their role (`x.utils.ts`, `x.constants.ts`, `x.query.ts`, `x.schema.ts`, `x.client.ts` for a browser-only plugin).

## 2. Data

- ✅ `useAsyncData`, `useFetch` and `useSanity` never in views (`components/`, `pages/`, `layouts/`). ✅ `useSanity` only in `composables/useCmsQuery`. No `fetch`/`$fetch`, with one documented exception: `useContactForm` posts to the form service.
- **Queries** are groqd (`q` from `utils/groqd/groqd.utils.ts`), one per page in `composables/<useName>/<name>.query.ts`. Reused pieces are fragments in `groqd.utils.ts`. Find a page document with `filterRaw('language == $locale')`, never by its id.
- **Optional fields**: an object or list that may be missing ends with `.nullable(true)`; otherwise groqd rejects the answer (a 503).
- **Filter a list of references before following it**: `.field('faq[]').filterRaw('@->language == $locale').deref()`.
- **A page composable**: `useMapContext()`, then `await useCmsQuery(name, query, params)`, then a pure mapper to the view. The view holds plain values (`types/content.types.ts`): no `null`, no CMS field names. `null` from the query = unpublished (empty `noindex` view) or unknown slug (404); a CMS error is already a 503.
- Nuxt composables are called **before** the first `await` in a composable (`<script setup>` restores the context, composables don't).
- After a schema change: `pnpm typegen`, commit `types/sanity.types.ts`, update the seed (`studio/seed/`) and the E2E fixtures in the same PR. ✅ CI checks the types are current.

## 3. i18n & text

- No hardcoded UI text: `t('key')`; every key exists in every locale file.
- CMS content is one document per language: every query filters `language == $locale` ([ADR 0001](../adr/0001-i18n-translated-urls.md)).

## 4. Dates & hydration

- Never render `new Date()` directly. Format dates in the mapper with `utils/date/date.utils.ts` and `BUSINESS_TIME_ZONE`.

## 5. Styling

- Nuxt UI components everywhere (`UPageHero`, `UPageSection`, `UEmpty`, …). Anything else only where Nuxt UI can't do the job, with a comment saying why (the language switcher, native `<details>` disclosures on never-hydrated pages).
- Nuxt UI semantic colors only (`text-muted`, `bg-elevated`, `bg-inverted`, `text-dimmed`), never a fixed palette color: dark mode works without `dark:` variants.

## 6. Tests

- ✅ Co-located `*.spec.ts`; coverage ≥ 80 % (`pnpm test:coverage`).
- Pure functions → `unit` project (plain Node). Components and composables → `nuxt` project with `mountSuspended`. Mock only the CMS (`useSanity`, answers built with `tests/helpers/cmsData.ts`). Never mock Nuxt runtime APIs; assert their real output (`tests/helpers/renderedHead.ts`).
- Assert rendered text, attributes and returned values. Test behaviour, not constants.
- Content components that only call a composable and compose components (`*Content`, `LegalDocument`) are covered by the composable's spec and E2E.
- **E2E is hermetic**: the app reads `tests/e2e/sanity/fixtures.ts` through a local GROQ server (`server.ts`, groq-js), which also stands in for the form service. A new page or query gets its test documents there. CI runs E2E on a production build (`pnpm build:e2e`, then `CI=1 pnpm test:e2e`).
- **Live Sanity** is covered by `smoke.spec.ts` on every deployment (every page answers, no console error).

## 7. Local gates (single definition)

Every agent and human runs exactly these before opening or updating a PR. CI runs the same checks.

```bash
pnpm verify                          # lint · format:check · typecheck · unit/component tests + coverage
pnpm build:e2e && CI=1 pnpm test:e2e # E2E on a production build against the fixture CMS
```

PageSpeed runs in CI on the PR's deployment (§7.1).

### 7.1 Web performance budget

- **Aim 90+, block under 80**: every page, mobile and desktop, every category (Performance, Accessibility, Best Practices, SEO) and performance metric. 80–89 passes and is flagged "below target" in the PR report.
- `webPerformance.config.ts` is the only place these numbers live. Raising one is free; lowering one is a Tech Lead decision recorded in the PR.
- Measured by Google PageSpeed Insights on the deployed PR (never a laptop): `pnpm web-performance --url=<deployed URL>` (needs `PAGESPEED_API_KEY`). The median of 3 runs decides; a page under 80 gets 2 confirmation runs, so noise never blocks a PR.
- Anything large painted late by JavaScript can become the page's Largest Contentful Paint: large elements on the first screen are server-rendered.

## 8. Comments

- **JSDoc** (`/** … */`, one line, three at most) on every export whose name and type don't say it all: what it returns and the non-obvious edge (`undefined when…`, `404 if…`). Never restate the name.
- **`//` inside a body only for a why**: a constraint (privacy, SEO, hydration, performance), a workaround, a non-obvious order. Two lines at most.
- **Templates**: no HTML comments; explain a template choice in the `<script>` block.
- **Never**: history ("was", "PR #", dates, "decided by"), measurements, notes to agents or reviewers, links to dated documents, a copy of a doc (link its section instead).

## 9. Documentation

- **One home per fact.** Code rules here; directories and data flow in ARCHITECTURE; agent process in `.ai/shared/workflows/operating-model.md`; environments in `docs/deployment/DEPLOYMENT.md`. Everything else links.
- **The code is the truth.** A doc names the file, never copies its content. A change to code that a doc describes updates the doc in the same PR.
- **Short and factual**: tables and bullets, present tense, no paragraph over three lines, no "why we chose" essays (one line of rationale in an ADR).
- **No feature docs**: features are documented by their code. Task files are working files; ADRs hold only active decisions. Design briefs and changesets are kept as the record of the design track.
- ✅ The drift guard (`tests/orchestration/orchestration.spec.ts`) fails when a doc points at a path that doesn't exist.
