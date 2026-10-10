---
status: 'To Do' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: 'YYYY-MM-DD'
---

# [Feature Title]

## 🔗 Resources

- **Design change**: [docs/design/changes/NNNN-page/ (from `/design`), or none]
- **Related Issues**: [#123]

## 👤 User Story

**As a** [role],
**I want** [feature/action],
**So that** [benefit/value].

## ✅ Acceptance Criteria

- **Given** [context],
- **When** [action is taken],
- **Then** [expected result].

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 2, under `.ai/shared/workflows/operating-model.md`. They stop only at Gate G1 (plan) and Gate G2 (production):_

1. **Plan → 🚦 Gate G1**: the Tech Lead plan, approved by a human before any code.
2. **Branch**: `feat/[feature-name]` from `develop`.
3. **Implement**: follow `docs/conventions/ARCHITECTURE.md` and `CODING_STANDARDS.md`. After schema/query changes run `pnpm typegen` and update the demo content (`studio/seed/seed.data.ts`).
4. **Local gates**: `docs/conventions/CODING_STANDARDS.md` §7 (`pnpm verify` + E2E). Fix everything.
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
