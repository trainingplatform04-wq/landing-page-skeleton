---
status: 'Review' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-16'
---

# About page: image and short description

## 🔗 Resources

- **Design change**: [docs/design/changes/0003-about/](../design/changes/0003-about/) (from `/design`, approved at D2 on 2026-10-16)
- **Brief**: [docs/design/briefs/0003-about.md](../design/briefs/0003-about.md) (Part 2: content model and technical notes)
- **Related Issues**: —

## 👤 User Story

**As a** visitor who found the studio through search or a recommendation,
**I want** to see who my coach is, with a picture and a short description,
**So that** I trust them and request a free trial.

## ✅ Acceptance Criteria

- **Given** the site, **when** I open `/ueber-uns` or `/en/about`, **then** the two sections of
  changeset `0003-about` render in order (`about-hero`, `about-closing`), with the content of
  the page's Sanity document in that language, and the language switcher leads to the same page
  in the other language.
- **Given** the main menu, **then** "About" / "Über mich" appears after
  "Magazine" in both languages.
- **Given** the home page, **then** its about section links to the About page.
- **Given** a page document that is not published, **then** the page renders
  empty with `noindex` and is not in the sitemap (ADR 0004).
- **Given** search engines, **then** the page has one h1, canonical and hreflang, and the
  sitemap lists it in both languages.
- **Given** the closing band, **then** its button leads to the contact page; the button shows
  only when it has a label and a link.
- **Given** the design gate, **then** `pnpm design:verify 0003-about` passes for both sections,
  locales and widths.
- **Given** PageSpeed Insights on the PR's dev deployment, **then** every score of this page is
  80 or more (gate) and aims for 90+, mobile and desktop. The picture is the LCP element, has
  `priority` and explicit dimensions; the page sends no client JavaScript of its own.
- Editors can edit label, title, description, picture, alt text, closing band and SEO in the
  Studio (document `aboutPage`, one per language); the staging seed has them in DE and EN.

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 2, under `.ai/shared/workflows/operating-model.md`. They stop only at Gate G1 (plan) and Gate G2 (production):_

1. **Plan → 🚦 Gate G1**: passed by the Tech Lead (design approved at D2, 2026-10-16); the plan is in this file's history and the PR.
2. **Branch**: `feat/about-page` from `develop`.
3. **Implement**: follow `docs/conventions/ARCHITECTURE.md` and `CODING_STANDARDS.md` and the
   changeset's section specs (never Lovable's code). New route `about` (`/ueber-uns`, `/about`)
   in `constants/routes.constants.ts` with `PAGE_TYPES.about = 'aboutPage'`, `pages/about.vue`,
   `composables/useAbout/` (groqd query, view, mapper), menu entry in
   `constants/navigation.constants.ts` and `nav.about` in every locale, a link from
   the home about section, `MagazineClosing` reused with `section="about-closing"`. Thin page:
   `hydrate-never` content. Schema `aboutPage` and Studio structure; run `pnpm typegen`; update
   the demo content (`studio/seed/seed.data.ts`, with a stock demo photo). The page count
   changes from 8 to 9: ADR 0006 records it; `CLAUDE.md` and
   `docs/conventions/ARCHITECTURE.md` are updated.
4. **Local gates**: `docs/conventions/CODING_STANDARDS.md` §7 (`pnpm verify` + E2E), then
   `pnpm design:capture 0003-about`, the designer reviewer's check of the shots, and
   `pnpm design:verify 0003-about`; the screenshots are deleted before the commit.
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
- [ ] `pnpm design:verify 0003-about` green; Web performance check green on the PR.
