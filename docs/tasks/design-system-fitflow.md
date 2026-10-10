---
status: 'To Do' # deferred by the owner (2026-10-10): the initial step of the design track, done later # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-10'
---

# FitFlow theme for every page

## 🔗 Resources

- **Design change**: none (theme only; values from brief `docs/design/briefs/0001-magazine.md`,
  Part 2, and the Lovable prototype's `src/styles.css`). Done later as the initial step that
  brings the code to 100 % of the Lovable theme; the magazine page ships with our current theme first.
- **Related Issues**: —

## 👤 User Story

**As a** visitor,
**I want** the site to look like the approved FitFlow design (orange primary, warm greys,
Barlow Condensed headings, Manrope text),
**So that** every page, and the magazine built next, matches the approved prototype.

## ✅ Acceptance Criteria

- **Given** any page, **when** it renders, **then** the primary colour is `oklch(0.67 0.22 42)`
  (dark mode `oklch(0.72 0.21 45)`), neutrals are the warm FitFlow greys, the radius base is
  0.5rem, h1–h3 use Barlow Condensed 900 uppercase and the text uses Manrope.
- **Given** the fonts, **when** a page loads, **then** they are self-hosted (`@nuxt/fonts`), no
  request goes to Google.
- **Given** a dark band, **when** a section needs one, **then** the semantic tokens
  `surface-strong`, `surface-strong-foreground`, `surface-muted`, `surface-line` exist (light and
  dark values from the prototype), as do `--shadow-accent` and the `reveal` animation (700ms
  ease-out, 18px rise, off under reduced motion).
- **Given** the brand, **when** the header, footer and titles render, **then** the name is
  "FitFlow" (Sanity business profile and seed).
- **Given** the existing pages, **when** E2E and unit tests run, **then** they pass; contrast of
  text on the new colours meets WCAG AA (axe).

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 2, under `.ai/shared/workflows/operating-model.md`. They stop only at Gate G1 (plan) and Gate G2 (production):_

1. **Plan → 🚦 Gate G1**: the Tech Lead plan, approved by a human before any code.
2. **Branch**: `feat/design-system-fitflow` from `develop`.
3. **Implement**: `app.config.ts` (Nuxt UI colours), `assets/css/main.css` (`@theme`, Nuxt UI CSS
   variables, surfaces, shadow, `reveal`), `@nuxt/fonts`. Follow `docs/conventions/ARCHITECTURE.md`
   and `CODING_STANDARDS.md`.
4. **Local gates**: `docs/conventions/CODING_STANDARDS.md` §7 (`pnpm verify` + E2E).
5. **Commit & PR**, 6. **Code Review Loop**, 7. **Merge & Deploy**: as in the template.

## 📋 Definition of Done

- [ ] Acceptance criteria met on staging.
- [ ] Code review `APPROVED`, every thread resolved.
- [ ] No `any`, no `console.*`, no `fetch`/`$fetch`, no `server/api/` routes.
- [ ] Lovable project knowledge still matches the tokens (DESIGN_WORKFLOW §6.3); registry date updated.
- [ ] E2E updated where the visual change affects them.
