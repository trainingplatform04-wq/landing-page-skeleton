---
status: 'Review' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-10'
---

# Magazine list page

## 🔗 Resources

- **Design change**: `docs/design/changes/0001-magazine/` (from `/design`, approved 2026-10-10)
- **Brief**: `docs/design/briefs/0001-magazine.md` (Part 2: content model, routes, risks)
- **Theme**: our current theme; the Lovable theme comes later (`docs/tasks/design-system-fitflow.md`)
- **Related Issues**: —

## 👤 User Story

**As a** visitor interested in fitness,
**I want** a magazine of articles from the coaches, filterable by category,
**So that** I trust the coaches and request a free trial.

**As an** editor,
**I want** to write articles, categories and author profiles in the Studio, in German and English,
**So that** the magazine grows without a developer.

## ✅ Acceptance Criteria

- **Given** `/magazin` and `/en/magazine`, **when** they render, **then** the four sections of
  `docs/design/changes/0001-magazine/` appear in order with the specs' layout and sizes (our
  colours); the owner approves the screenshots and `pnpm design:verify 0001-magazine` passes.
- **Given** the menu, **when** any page renders, **then** it shows offers, **magazine**, FAQ,
  contact (header and footer).
- **Given** "All" on page 1, **when** the page renders, **then** the 3 newest posts are in the
  featured block and the others in the grid; **given** a category (`?category=`, the same in every language),
  **then** the featured block is hidden and the grid shows that category's posts, newest first.
- **Given** more than 9 grid posts, **when** the page renders, **then** numbered pagination
  (`?page=`) appears; with one page it is hidden.
- **Given** a category without posts, **then** the empty state with "All articles" appears.
- **Given** a card, **then** it shows category, title, excerpt (not compact), author photo and
  name, the date in Europe/Berlin and the reading time (all body text ÷ 200, rounded up; the
  seed gives 2, 1, 1, 1, 1, 1 minutes), and links to `/magazin/<slug>` / `/en/magazine/<slug>`
  (404 until the article page exists).
- **Given** the Studio, **then** editors can create `post`, `category` and `author` in each
  language, linked as translations, and edit the `magazinePage` singleton.
- **Given** the staging seed, **then** it contains exactly the design content
  (`content/magazine.json`) with stock photos matching the prototype's pictures.
- **Given** the sitemap, **then** it lists the magazine page in both languages.

## Notes for the plan (Tech Lead)

- ADR 0005 (magazine) amends ADR 0004: two new routes (`magazine`, and `magazine-slug` reserved
  for the next design), new collections.
- Schema now: `magazinePage`, `post` (body `articleBody` with the four blocks of the brief),
  `category`, `author`. Figure pictures of the bodies come with the article page design: the seed
  leaves those figure blocks out until then.
- The article route answers 404 for now (no page file until its design is approved), or is left
  out entirely: Tech Lead's call at G1.

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 2, under `.ai/shared/workflows/operating-model.md`. They stop only at Gate G1 (plan) and Gate G2 (production):_

1. **Plan → 🚦 Gate G1**: the Tech Lead plan, approved by a human before any code.
2. **Branch**: `feat/magazine-page` from `develop`.
3. **Implement**: from the section specs and baselines only (never the Lovable code), following
   `docs/conventions/ARCHITECTURE.md` and `CODING_STANDARDS.md`. After schema/query changes run
   `pnpm typegen` and update the demo content (`studio/seed/seed.data.ts`).
4. **Local gates**: `pnpm verify` + E2E, then the design gate (`pnpm studio:seed`,
   `pnpm design:capture 0001-magazine`, owner approval, `pnpm design:verify 0001-magazine`).
5. **Commit & PR**, 6. **Code Review Loop**, 7. **Merge & Deploy**: as in the template.

## 📋 Definition of Done

- [ ] Acceptance criteria met on staging.
- [ ] `pnpm design:verify 0001-magazine` green; deviations recorded in `change.md`.
- [ ] Code review `APPROVED`, every thread resolved.
- [ ] No `any`, no `console.*`, no `fetch`/`$fetch`, no `server/api/` routes.
- [ ] Data access only in composables. CMS types regenerated (`types/sanity.types.ts`).
- [ ] All UI text translated in every locale.
- [ ] Co-located unit/component tests (`*.spec.ts`) and E2E updated in `tests/e2e/`.
