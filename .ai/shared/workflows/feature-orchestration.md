---
name: feature
description: >-
  The single end-to-end delivery pipeline for a feature: scope → plan (human gate) →
  design → implement → PR → independent review loop → merge → staging deploy.
  Entry points: /feature, a task file in docs/tasks/, or a user request.
---

# Feature Delivery Pipeline

You are the **Orchestrator**. Route the work through the specialists in `.ai/shared/agents/`, in this order. Obey `.ai/shared/workflows/operating-model.md` (human gates, blockers, reviewer independence, signed comments) at every step.

For each step, declare the delegation (`→ tech-lead: …`) and print `--- Step N complete ---` when it's done.

## Entry points

| You were given…                                             | Start at                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------- |
| A raw idea or request (`/feature …`)                        | Step 1                                                            |
| A task file `docs/tasks/<name>.md` with acceptance criteria | Step 2 (the file is the PO output). Set its `status: In Progress` |

## Steps

**Step 1: Scope (product-owner).** Write `docs/tasks/<name>.md` from `docs/tasks/template.md`: user story, acceptance criteria, edge cases (empty CMS fields, errors, both locales).

**Step 2: Plan (tech-lead) → 🚦 Gate G1.** Produce the plan: contracts (view types, composable signatures, groqd queries, schema changes), directory tree, owner → task list, risks. **Stop and wait for human approval.** This is the only stop before production.

**Step 3: Design (designer-engineer), only if the task has a `Design change`.** Read the changeset (made by `.ai/shared/workflows/design-orchestration.md`, gate D2): `change.md`, then only the touched section specs. Produce the component map (Nuxt UI first, Tailwind second) and the token changes for the frontend. Without a design change, skip to Step 4.

**Step 4: Implement (backend → frontend → qa)**

1. `backend-engineer`: Studio schemas (`studio/schemas/`), groqd queries in their composable, `pnpm typegen`, the staging demo content in `studio/seed/seed.data.ts` updated to match the schema, composables returning plain views.
2. `frontend-engineer`: pages and components consuming those composables, with i18n keys in **every** locale. With a design change: from the section specs and baselines only, never Lovable's code, under `docs/conventions/ARCHITECTURE.md` and `docs/conventions/CODING_STANDARDS.md` exactly.
3. `qa-engineer`: co-located specs plus E2E for every new page, then the local gates (`docs/conventions/CODING_STANDARDS.md` §7). With a design change, the **design gate** too: seed staging (`pnpm studio:seed`), then `pnpm design:capture <change>` (our app only) for new or changed sections, the human's visual approval of those shots against the Lovable preview, then `pnpm design:verify <change>` must pass for every section, locale and width (`docs/design/DESIGN_WORKFLOW.md` §13). The task is not done, and no PR is opened, before it passes.

**Step 5: Pull Request.** Conventional Commits, `git push -u origin HEAD`, `gh pr create --base develop` with a description (what, why, verification). Set the task `status: Review`.

**Step 6: Review loop.** Run `.ai/shared/workflows/code-review-loop.md`: independent reviewer subagent → Tech Lead triage → fixes → replies and resolved threads → re-review, until `APPROVED` (max 3 rounds).

**Step 7: Merge & staging (devops-engineer).** After `APPROVED` and green CI: squash-merge, watch the `Deploy` run and verify staging. Blockers follow operating-model §2 (never hold, report).

**Step 8: Report (orchestrator).** PR link, review rounds, staging URLs, open blockers. Set the task `status: Done`. Production follows `.ai/shared/workflows/release.md` (Gate G2).
