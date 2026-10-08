# ADR 0005: Design track with Lovable

- **Status**: Accepted by the owner (2026-10-08).
- **Date**: 2026-10-08
- **Decision owner**: human. Reference: `docs/design/DESIGN_WORKFLOW.md`.

## 1. Context

The feature pipeline (`/feature`) is autonomous from a task to staging. Design was a Figma-only optional step inside it (Step 3), and no design existed yet. Designing needs many human iterations (ideas, client comments, changes of mind), which an autonomous pipeline cannot absorb. The owner tested Claude Design (results below expectations) and Lovable (best results), and wants to talk only to Claude, with only the validated changes reaching the code agents.

## 2. Decisions

- **A design track of its own**, `/design` (`.ai/shared/workflows/design-orchestration.md`), ahead of the feature pipeline. It has two human gates: **D1** (brief approved) and **D2** (design approved). The feature pipeline keeps exactly G1 and G2.
- **Lovable is the design tool**, driven through its MCP server. It builds a **React prototype** (TypeScript, Tailwind, shadcn), never production code. Production stays this Nuxt repository.
- **Discovery before any prompt**: the Product Owner, Designer engineer, Tech Lead and Frontend engineer ask their questions in one conversation (main context, no subagents), in rounds of at most five, until the brief's definition of ready is met.
- **One compiled prompt per iteration**, sent only after the human's explicit go (credits). Conventions live in the Lovable project knowledge, generated from our tokens. Precise tweaks are Git commits on the synced Lovable repository (no credits).
- **Approval as buttons in the chat** (Approve, Request changes, Discard), and `/design approve <page>` for later sessions.
- **A validated design is a commit**: D2 records the approved Lovable commit of the page and produces a changeset in `docs/design/changes/` with only the sections changed since the previous approved commit. Tasks point to a changeset (`Design change` field). The changeset format is tool-independent.
- **Design content becomes the staging seed** (`studio/seed/seed.data.ts`), and pixel-perfect is measured by visual tests against baselines rendered from the prototype (tooling: DESIGN_WORKFLOW §15).
- **Strict architecture** (amended 2026-10-09): only the designer engineer reads Lovable code and turns it into facts (measurements, typography, tokens, states, content); the frontend implements from those facts and the baselines under ARCHITECTURE and CODING_STANDARDS only, never from the React code; the reviewer blocks prototype-shaped code.
- **Design gate before the PR** (amended 2026-10-09): `pnpm design:capture` freezes the approved prototype as section screenshots at gate D2; `pnpm design:verify` compares our production build with them, section by section, locale by locale, at 375 / 768 / 1440. A design task is not done, and no PR is opened, until it passes.
- **Pictures live in Sanity only** (amended 2026-10-09): the seed downloads pictures from their addresses (stock photos now, the prototype's at D2) and uploads them to the dataset; no picture file is committed.
- **Optimised for the Lovable free plan**; upgrading changes the pace, not the workflow.
- **Security**: agents only touch the Lovable project recorded in `docs/design/design-system.md`; credits, publishing and Lovable tool approvals always go through the human.

## 3. Consequences

- The designer-engineer persona, the feature workflow's Step 3, the task template, the operating model (design gates), `/agents`, CLAUDE.md and the four discovery personas change accordingly.
- A design artefact repository (Lovable's Git sync) exists next to this one; it is never deployed by our pipeline.
- Until the visual tooling exists, changesets state "baselines pending" and staging is compared with the prototype by eye.
- Figma stays an alternative source (paid Full seat; the free plan's MCP limits rule it out for agents).
