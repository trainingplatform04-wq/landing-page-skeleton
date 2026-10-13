---
status: 'To Do' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-13'
---

# Magazine article page: one template for every article

## 🔗 Resources

- **Design change**: [docs/design/changes/0002-article/](../design/changes/0002-article/) (from `/design`, approved at D2 on 2026-10-13)
- **Brief**: [docs/design/briefs/0002-article.md](../design/briefs/0002-article.md) (Part 2: content model and technical notes)
- **Related Issues**: —

## 👤 User Story

**As a** visitor arriving from search on an article,
**I want** a clear, readable article with key points, the author, answers to my questions and
what to read next,
**So that** I trust the coaches and request a free trial.

## ✅ Acceptance Criteria

- **Given** a published article, **when** I open `/magazin/<slug>` or `/en/magazine/<slug>`,
  **then** the seven sections of changeset `0002-article` render in order, with the article's
  content from Sanity in that language, and the language switcher leads to the same article in
  the other language.
- **Given** an article with key takeaways and questions (the seeded protein article), **then**
  "At a glance" and "Frequently asked questions" show them; **given** an article without them,
  **then** those sections are absent.
- **Given** the body has H2s, **then** the table of contents lists them (sticky at 1440, an
  accordion below 1440) and highlights the current one; the progress bar follows the text.
- **Given** the video block, **then** nothing loads from YouTube until "Load video" is clicked.
- **Given** "Copy link", **then** the article URL is copied and the toast "Link copied" shows;
  "Share" appears only where the browser supports native sharing.
- **Given** "Keep reading", **then** up to 3 other articles show: same category first, then the
  newest others.
- **Given** an unknown slug, **then** the page answers 404.
- **Given** search engines, **then** the page has one h1, `Article` structured data, `FAQPage`
  structured data when there are questions, canonical and hreflang; the sitemap lists every
  published article in both languages.
- **Given** the design gate, **then** `pnpm design:verify 0002-article` passes for every section,
  locale and width.
- **Given** PageSpeed Insights on the PR's dev deployment, **then** every score of this page is
  80 or more (gate) and aims for 90+, mobile and desktop.
- Editors can fill `keyTakeaways` and `faq` in the Studio on every article; the staging seed has
  the protein article's takeaways, questions, pull quote, figure and video in DE and EN.

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 2, under `.ai/shared/workflows/operating-model.md`. They stop only at Gate G1 (plan) and Gate G2 (production):_

1. **Plan → 🚦 Gate G1**: passed by the Tech Lead (design approved at D2, 2026-10-13); the plan is in this file's history and the PR.
2. **Branch**: `feat/article-page` from `develop`.
3. **Implement**: follow `docs/conventions/ARCHITECTURE.md` and `CODING_STANDARDS.md` and the
   changeset's section specs (never Lovable's code). Thin page: the content component renders
   with `hydrate-never`; only the progress bar and table of contents highlight, the share
   buttons and the video hydrate. FAQ and mobile table of contents on native `<details>`. After
   schema changes run `pnpm typegen` and update the demo content (`studio/seed/`).
4. **Local gates**: `docs/conventions/CODING_STANDARDS.md` §7 (`pnpm verify` + E2E), then
   `pnpm design:capture 0002-article`, the designer reviewer's check of the shots, and
   `pnpm design:verify 0002-article`; the screenshots are deleted before the commit.
5. **Commit & PR**: Conventional Commits, push, `gh pr create --base develop`, set `status: 'Review'` above.
6. **Code Review Loop**: `.ai/shared/workflows/code-review-loop.md`. Fresh reviewer subagent, signed inline GitHub review → Tech Lead triage → fixes → re-review until `APPROVED` (all comments resolved, max 5 rounds; in round 5 the Tech Lead decides and plans the fixes).
7. **Merge & Deploy**: green CI → squash-merge → verify the staging deploy → set `status: 'Done'`.

## 📋 Definition of Done

- [ ] Acceptance criteria met on staging.
- [ ] Code review `APPROVED`, every thread resolved.
- [ ] No `any`, no `console.*`, no `fetch`/`$fetch`, no `server/api/` routes.
- [ ] Data access only in composables. CMS types regenerated (`types/sanity.types.ts`).
- [ ] All UI text translated in every locale.
- [ ] Co-located unit/component tests (`*.spec.ts`) and E2E updated in `tests/e2e/`.
- [ ] `pnpm design:verify 0002-article` green; Web performance check green on the PR.
