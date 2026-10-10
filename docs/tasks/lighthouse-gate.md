       ---

status: 'To Do' # To Do | In Progress | Review | Done
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
- **Given** any page, form factor and category (Performance, Accessibility, Best Practices, SEO), **when** its median score over 3 runs is below 95, **then** the check fails and names the page, the form factor, the category and the score.
- **Given** the check fails, **then** the PR cannot be merged (required status check), and the Lighthouse reports are downloadable from the run.
- **Given** a developer, **when** they run `pnpm lighthouse`, **then** the same audit runs locally on a production build.
- **Given** the current site, **when** the gate is added, **then** every page already scores 95+ on mobile and desktop (the pages are fixed in this task, without changing how they look).

## Edge cases

- Staging and previews are `noindex` by design (only production is indexable): the SEO audit "page is crawlable" is skipped in the gate, every other SEO audit counts.
- Empty CMS pages (unpublished in a language) are audited as they render.
- Scores vary between runs: the median of 3 runs is asserted.

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
