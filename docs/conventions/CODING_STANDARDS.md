# Coding Standards

✅ = enforced automatically (ESLint, TypeScript, tests or CI). The rest is enforced in review.

## 1. TypeScript & Vue

- ✅ TypeScript `strict`, **no `any`** (`@typescript-eslint/no-explicit-any`).
- ✅ SFC block order: `<script setup lang="ts">` → `<template>` → `<style>` (`vue/block-order`).
- ✅ Imports in four groups, sorted (`simple-import-sort`): ① Vue, Nuxt and libraries ② project files (`~/…`) ③ type-only imports (`import type`) ④ sibling files (`./…`). Use the `~/` alias, never `../` (`no-restricted-imports`).
- ✅ No server code: `server/` and `api/` folders fail lint and the drift guard.
- ✅ Vue, Nuxt and module APIs are auto-imported (never import from `#imports`). **Project code is imported explicitly** from its file (`import { useHome } from '~/composables/useHome/useHome'`): composables and utils are not auto-imported, so an unknown name fails `typecheck`.
- ✅ No `console.*` (`no-console`).
- Early returns (Bouncer Pattern) over nested `if/else`.
- Names: `PascalCase` components, `camelCase` everything else; files carry their role (`x.utils.ts`, `x.types.ts`, `x.constants.ts`, `x.schema.ts`).
- **Comments explain why, never what.** No banners, no commented-out code, no instructions to agents. One place explains a rule; others link to it.

## 2. Data

- ✅ `useSanity`, `useAsyncData`, `useFetch` only in `composables/` (`no-restricted-syntax` on views); no `fetch`/`$fetch`, with one documented exception: `useContactForm` sends the contact form to the form service (it has no SDK).
- Queries are written with **groqd** (`q` from `utils/groqd/groqd.utils.ts`) at the top of the composable that runs them. Reused pieces are groqd fragments in that file. CI checks the generated schema types are current.
- **Optional fields**: an object or list that may be missing ends with `.nullable(true)`; otherwise groqd rejects the answer (a 503).
- **Filter a list of references before following it**: `.field('faq[]').filterRaw('@->language == $locale').deref()`.
- A page composable has four parts, in this order: query, view type, mapper, composable ([ARCHITECTURE](ARCHITECTURE.md#data-flow)). It returns the view: plain values only (`types/content.types.ts`), no `null`, no CMS field names.
- `useAsyncData` is called during `setup` and awaited (in the composable and in `<script setup>`), so the server answers with complete HTML and the right status: 503 on a CMS error, 404 for an unknown offer slug; a page renders empty while unpublished. Keys are explicit and unique (`` `offer:${locale}:${slug}` ``).
- After an `await`, call Nuxt composables only in `<script setup>` (it restores the Nuxt context); in a composable, call them before the `await`.

## 3. i18n & text

- No hardcoded UI text: `t('key')`; every key exists in every locale file.
- CMS content is fetched in the active language only: every query filters `language == $locale` ([ADR 0001](../adr/0001-i18n-translated-urls.md)). No field-level `{ de, en }` objects.

## 4. Dates & hydration

- Never render `new Date()` directly. Format dates in the mapper with `utils/date/date.utils.ts` and an explicit time zone (`BUSINESS_TIME_ZONE`).

## 5. Styling

- Nuxt UI components everywhere (`UPageHero`, `UPageSection`, `UEmpty`, `UAlert`, …). Anything else only where Nuxt UI can't do the job, with a comment saying why (today: the language switcher, which uses `<SwitchLocalePathLink>` from @nuxtjs/i18n).
- Use Nuxt UI semantic colors (`text-muted`, `text-highlighted`, `bg-elevated`) so dark mode works without `dark:` variants.

## 6. Tests

- ✅ Co-located `*.spec.ts`; coverage ≥ 80 % (`pnpm test:coverage`).
- Pure functions → `unit` project (plain Node). Components/composables → `nuxt` project with `mountSuspended` (real i18n, real Nuxt UI). Mock only external boundaries: the CMS (`useSanity`; answers shaped like `tests/helpers/cmsData.ts`). Never mock Nuxt runtime APIs (`useHead`, `useSeoMeta`, …); assert their real output (`tests/helpers/renderedHead.ts`).
- Assert rendered text and attributes, not `wrapper.exists()`.
- Test behaviour, not constants: a list or a config value is covered by the tests of the code that uses it.
- E2E (`tests/e2e/`): CI (and `CI=1 pnpm test:e2e` after `pnpm build:e2e`) runs against a production build; plain `pnpm test:e2e` uses the dev server for speed.
- **E2E is hermetic.** The app reads its CMS content from `tests/e2e/sanity/server.ts`: the real queries run through groq-js (Sanity's GROQ engine) against the documents of `tests/e2e/sanity/fixtures.ts`, which also stands in for the contact form service. Tests never depend on what editors published. A new page or query gets its test documents there.
- **Live Sanity** is covered by `smoke.spec.ts`, which runs against every deployment on every page and only checks things that don't depend on content (our app answered, no errors).

## 7. Local gates (single definition)

Every agent and human runs exactly these before opening or updating a PR. CI runs the same checks.

```bash
pnpm verify                         # lint · format:check · typecheck · unit/component tests + coverage
pnpm build:e2e && CI=1 pnpm test:e2e # E2E on a production build built against the fixture CMS
pnpm lighthouse                     # web performance budget, once the two above pass
```

After a schema change, run `pnpm typegen` first and commit `types/sanity.types.ts`.

### 7.1 Web performance budget

- `lighthouse.config.ts` is the **only** place thresholds live: the minimum Lighthouse score (0–100) of the four categories (Performance, Accessibility, Best Practices, SEO) and of the five performance metrics (FCP, LCP, TBT, CLS, Speed Index), per form factor (mobile, desktop), and the number of runs (the median run is judged).
- `pnpm lighthouse [mobile|desktop]` builds this commit for production with the `.env` content (staging) and the **production robots settings** (inside the build only: every SEO audit counts), then audits every page of `ROUTE_PATHS` without a slug, in every language, in Playwright's Chromium. Reports: `.lighthouseci/<form factor>/`.
- In CI the Lighthouse jobs run only after **Lint · Format · Types · Unit** and **Build · E2E** pass: one build (`--build-only`), 8 parallel audits (`--skip-build --shard=k/4`, mobile and desktop), one summary check **Lighthouse**. After a staging deploy the same budget runs against the live staging URL (there "page is crawlable" is skipped: staging is noindex on purpose).
- 3 runs per page, the median judged: a single Lighthouse run moves ±3–5 points on an unchanged page.
- Raising a minimum is free; lowering one is a Tech Lead decision recorded in the PR.
