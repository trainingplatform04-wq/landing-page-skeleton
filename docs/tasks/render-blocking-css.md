---
status: 'To Do' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-13'
---

# Mobile first paint: the stylesheet that blocks rendering

## 🔗 Resources

- **Design change**: none
- **Related Issues**: PR #16 review R3 (Tech Lead decision)

## 👤 User Story

**As a** visitor on a phone,
**I want** every page to paint at once,
**So that** the site meets the 90+ web performance aim on mobile, not only the 80 minimum.

## ✅ Acceptance Criteria

- **Given** PageSpeed Insights on mobile, **when** it measures any page (the article pages included), **then** First Contentful Paint and Largest Contentful Paint score 90+ (`webPerformance.config.ts` target).
- **Given** the change, **then** no page looks different (`pnpm design:verify` of the magazine and the article pages passes).

## Findings (PR #16, R3)

- On the article pages mobile FCP is 88 and LCP 82–85; `/` and `/magazin` show the same pattern. The cover already loads first (preloaded, high priority, not lazy, quality 70).
- Every page waits for one render-blocking stylesheet (≈ 29 KB, Nuxt UI + Tailwind). Options to measure: inline the critical CSS of the first screen, split route-specific styles, trim unused Nuxt UI component styles.

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 2, under `.ai/shared/workflows/operating-model.md`. They stop only at Gate G1 (plan) and Gate G2 (production)._

## 📋 Definition of Done

- [ ] Acceptance criteria met on the PR's dev deployment (Web performance job, no 🟡 on FCP/LCP).
- [ ] Code review `APPROVED`, every thread resolved.
