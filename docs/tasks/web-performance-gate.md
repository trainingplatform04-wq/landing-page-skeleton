---
status: 'Review' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-10'
---

# Web performance gate: every page, mobile and desktop, measured by PageSpeed Insights

## 🔗 Resources

- **Design change**: none
- **Related Issues**: —
- **Baseline (2026-10-10, staging `/en/magazine`, clean profile)**: desktop 99 (LCP 0.8 s, TBT 20 ms); mobile 86 (LCP 3.4 s: the featured cover, not prioritised and oversized; TBT 220 ms). The owner's 81 came from a Chrome profile with extensions.

## 👤 User Story

**As the** site owner,
**I want** every pull request checked with Google PageSpeed Insights on every page, on mobile and desktop,
**So that** every page aims for 90+ in Performance, Accessibility, Best Practices and SEO, and no change ships that drops one below 80.

## ✅ Acceptance Criteria

- **Given** a PR to `develop` or `main`, **when** CI runs, **then** PageSpeed Insights audits every page of the site (deployed to dev) in both languages (every route of `ROUTE_PATHS` without a slug: home, offers, magazine, FAQ, contact, imprint, privacy), with the mobile and the desktop settings.
- **Given** any page and form factor, **when** a category score (Performance, Accessibility, Best Practices, SEO) **or** a performance metric score (FCP, LCP, TBT, CLS, Speed Index) is under 80, **then** the page is measured twice more, and if the median is still under 80 the check fails and names the page, the form factor, the category or metric and the score.
- **Given** a score from 80 to 89, **then** the check passes and the PR report flags the page 🟡 "below target": 90+ is the aim.
- **Given** the PR check, **then** it audits the PR's real deployment on Vercel (`-dev`, Development variables), with SEO computed without "page is crawlable" (previews are noindex on purpose).
- **Given** a deploy to staging, **when** it finishes, **then** the same audit runs on the real staging URLs (SEO without "crawlable", staging stays noindex) and fails the deploy run loudly if anything drops under 80.
- **Given** the check fails, **then** the PR cannot be merged (required status check), and the web performance reports are downloadable from the run.
- **Given** a developer, **when** they run `pnpm web-performance --url=<deployment>`, **then** the same audit runs locally on a production build.
- **Given** the current site, **when** the gate is added, **then** every page already passes 80 on mobile and desktop (the pages are fixed in this task, without changing how they look).

## Edge cases

- Dev and staging are `noindex` on purpose (@nuxtjs/robots: header, meta, `robots.txt`; Vercel also marks non-production deployments): they must never compete with production in search, so both audits skip "page is crawlable".
- Empty CMS pages (unpublished in a language) are audited as they render.
- Scores vary 10–25 points between runs on an unchanged page: a page under 80 is measured twice more and the median of each score decides.

## Findings (Tech Lead, 2026-10-10)

- **The owner's 81** came from a Chrome profile with extensions (Lighthouse's own warning). Clean runs on staging `/en/magazine`: desktop 99, mobile 86.
- **Fixed in this task**:
  - The repository imported `tailwindcss` without declaring it (it only resolved through pnpm hoisting); it is now a direct dependency.
  - Built assets are pre-compressed (`nitro.compressPublicAssets`): the Node server used by E2E and local audits sent 927 KB more than Vercel does.
  - Dark mode turned the magazine's dark bands white (semantic "inverted" colours): kicker contrast 1.77:1 (Accessibility 96). The bands now keep the light-mode colours in both modes; light mode is pixel-identical (`design:verify` 24/24).
  - The magazine's largest image (the featured cover) loads first (`fetchpriority`, preload); the other covers and author photos load lazily.
- **First budget** (owner, 2026-10-10, since revised below): desktop 95 everywhere; mobile 95, mobile Performance and its metrics 90.
- **Also fixed**: only the entry chunk is preloaded (30 preloads before the first paint); lazy hydration (`hydrate-never` links-only sections, `hydrate-on-visible` accordions, header `hydrate-on-idle`); the largest image of each page first, others lazy, WebP locally; no redirect by browser language (owner).
- **Result** (local, median of 3): desktop 99 on every page, every metric ≥ 95. Mobile: Accessibility, Best Practices, SEO 100; Performance 63–87 (was 33–57).
- **Still below the mobile budget, measured precisely**: pages paint fast (measured mobile LCP 1.7–2.2 s, score 94–99), but every page runs ≈ 850 KB raw (≈ 255 KB compressed) of JavaScript at start: the data layer (`zod`, `groqd`, `@sanity/client`: 280 KB raw, needed only for client-side navigation), Nuxt UI/Reka and colour mode (150 KB), Vue (96 KB), i18n (50 KB), tailwind-merge (47 KB). Lighthouse charges it to LCP (simulated) or to TBT (measured).
- **Next task: client JavaScript diet** (an architecture decision): load the data layer only on the server (full-page navigation between pages, or a lazily imported query runner), lighter header without Reka's navigation menu, then the offers page's layout shift.

- **Budget revised** (owner, 2026-10-10): aim 90+ everywhere, block under 80, with confirmation runs. Measured noise on one unchanged deployment: 25 failures at the old numbers in one run, 8 in the next.
- **Measurement moved to Google PageSpeed Insights** (owner, 2026-10-10): audits run on the PR's real Vercel deployment (`-dev`) through the PageSpeed Insights API, never on localhost. On Vercel the magazine scores mobile Performance 94 and desktop 100 (pagespeed.web.dev). Accessibility 96 there comes from the green theme's contrast (badges, active tab): fixed with the FitFlow theme task (owner).

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 2, under `.ai/shared/workflows/operating-model.md`. They stop only at Gate G1 (plan) and Gate G2 (production):_

1. **Plan → 🚦 Gate G1**: the Tech Lead plan, approved by a human before any code.
2. **Branch**: `feat/lighthouse-gate` from `develop`.
3. **Implement**: follow `docs/conventions/ARCHITECTURE.md` and `CODING_STANDARDS.md`.
4. **Local gates**: `docs/conventions/CODING_STANDARDS.md` §7 (`pnpm verify` + E2E, and now `pnpm web-performance --url=<deployment>`).
5. **Commit & PR**, 6. **Code Review Loop**, 7. **Merge & Deploy**: as in the template.

## 📋 Definition of Done

- [ ] Acceptance criteria met; CI shows the Web performance check green on the PR.
- [ ] Code review `APPROVED`, every thread resolved.
- [ ] No `any`, no `console.*`, no `fetch`/`$fetch`, no `server/api/` routes.
- [ ] `docs/conventions/CODING_STANDARDS.md` §7 and `docs/deployment/DEPLOYMENT.md` describe the gate.
- [ ] Visual baselines unchanged (`pnpm design:verify 0001-magazine` green).
