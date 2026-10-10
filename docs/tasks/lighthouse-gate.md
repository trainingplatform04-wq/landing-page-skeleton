---
status: 'Review' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-10'
---

# Lighthouse gate: 95+ in every category, every page, mobile and desktop

## 🔗 Resources

- **Design change**: none
- **Related Issues**: —
- **Baseline (2026-10-10, staging `/en/magazine`, clean profile)**: desktop 99 (LCP 0.8 s, TBT 20 ms); mobile 86 (LCP 3.4 s: the featured cover, not prioritised and oversized; TBT 220 ms). The owner's 81 came from a Chrome profile with extensions.

## 👤 User Story

**As the** site owner,
**I want** every pull request checked with Lighthouse on every page, on mobile and desktop,
**So that** no change ships that drops Performance, Accessibility, Best Practices or SEO below 95.

## ✅ Acceptance Criteria

- **Given** a PR to `develop` or `main`, **when** CI runs, **then** Lighthouse audits every page of the site in both languages (every route of `ROUTE_PATHS` without a slug: home, offers, magazine, FAQ, contact, imprint, privacy), with the mobile and the desktop settings.
- **Given** any page and form factor, **when** the median of 3 runs has a category score (Performance, Accessibility, Best Practices, SEO) **or** a performance metric score (FCP, LCP, TBT, CLS, Speed Index) below 95, **then** the check fails and names the page, the form factor, the category or metric and the score. 100 is the target; the report shows the gap.
- **Given** the PR check, **then** it audits the PR's production build with the **staging content** and the **production robots settings** (`NUXT_SITE_ENV=production`, inside CI only, never deployed): every SEO audit counts, "page is crawlable" included.
- **Given** a deploy to staging, **when** it finishes, **then** the same audit runs on the real staging URLs (SEO without "crawlable", staging stays noindex) and fails the deploy run loudly if anything drops below 95.
- **Given** the check fails, **then** the PR cannot be merged (required status check), and the Lighthouse reports are downloadable from the run.
- **Given** a developer, **when** they run `pnpm lighthouse`, **then** the same audit runs locally on a production build.
- **Given** the current site, **when** the gate is added, **then** every page already scores 95+ on mobile and desktop (the pages are fixed in this task, without changing how they look).

## Edge cases

- Staging is `noindex` on purpose (@nuxtjs/robots with `NUXT_SITE_ENV=staging`: header, meta, `robots.txt`; Vercel also marks non-production deployments): it must never compete with production in search. The PR gate therefore audits a CI-only build with the production robots settings; only the post-deploy staging audit skips "page is crawlable".
- Empty CMS pages (unpublished in a language) are audited as they render.
- Scores vary between runs: the median of 3 runs is asserted.

## Findings (Tech Lead, 2026-10-10)

- **The owner's 81** came from a Chrome profile with extensions (Lighthouse's own warning). Clean runs on staging `/en/magazine`: desktop 99, mobile 86.
- **Fixed in this task**:
  - The repository imported `tailwindcss` without declaring it (it only resolved through pnpm hoisting); it is now a direct dependency.
  - Built assets are pre-compressed (`nitro.compressPublicAssets`): the Node server used by E2E and Lighthouse sent 927 KB more than Vercel does.
  - Dark mode turned the magazine's dark bands white (semantic "inverted" colours): kicker contrast 1.77:1 (Accessibility 96). The bands now keep the light-mode colours in both modes; light mode is pixel-identical (`design:verify` 24/24).
  - The magazine's largest image (the featured cover) loads first (`fetchpriority`, preload); the other covers and author photos load lazily.
- **Still below the mobile budget** (see the PR for the per-page table): Lighthouse's mobile run simulates a slow 4G phone and charges every request made before the first paint. Every page preloads about 35 requests / 600 KB raw (≈250 KB compressed) of JavaScript (Vue, Nuxt UI/Reka, i18n, head manager, icons): simulated FCP ≈ 3.0 s for a real first paint of 0.4 s. Compressing the HTML as well changes FCP by 0.15 s only.
- **Next task: mobile performance** (owner's decision on scope): cut the JavaScript of the first screen (Nuxt UI components only where interactive, lazy hydration of below-the-fold sections, smaller i18n and icon bundles, no client-side work for SEO helpers), find the offers page's layout shift (the second offer card moves while the first one settles), then lower nothing: the budget stays at 95.

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 2, under `.ai/shared/workflows/operating-model.md`. They stop only at Gate G1 (plan) and Gate G2 (production):_

1. **Plan → 🚦 Gate G1**: the Tech Lead plan, approved by a human before any code.
2. **Branch**: `feat/lighthouse-gate` from `develop`.
3. **Implement**: follow `docs/conventions/ARCHITECTURE.md` and `CODING_STANDARDS.md`.
4. **Local gates**: `docs/conventions/CODING_STANDARDS.md` §7 (`pnpm verify` + E2E, and now `pnpm lighthouse`).
5. **Commit & PR**, 6. **Code Review Loop**, 7. **Merge & Deploy**: as in the template.

## 📋 Definition of Done

- [ ] Acceptance criteria met; CI shows the Lighthouse check green on the PR.
- [ ] Code review `APPROVED`, every thread resolved.
- [ ] No `any`, no `console.*`, no `fetch`/`$fetch`, no `server/api/` routes.
- [ ] `docs/conventions/CODING_STANDARDS.md` §7 and `docs/deployment/DEPLOYMENT.md` describe the gate.
- [ ] Visual baselines unchanged (`pnpm design:verify 0001-magazine` green).
