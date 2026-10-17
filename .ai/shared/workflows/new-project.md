---
name: new-project
description: >-
  Turns a fresh repository created from the skeleton template into a client project:
  renames it, removes the examples the client doesn't need, sets the brand and lists
  what the human must set up. One question round, then one PR.
---

# New Project

Obey `.ai/shared/workflows/operating-model.md`. The checklist is `docs/NEW_PROJECT.md`; what each example contains is `docs/SKELETON.md`.

## Steps

1. **Questions (one round, multiple choice with a recommendation).** The client's name and site name; the languages; which examples to keep (offers, magazine and article, About, FAQ, testimonials, home sections); brand colors and fonts if known; analytics yes or no.
2. **Plan → 🚦 Gate G1 (tech-lead).** The examples to remove (their rows of `docs/SKELETON.md`), the renames, the brand changes, and the human's setup list (`docs/deployment/DEPLOYMENT.md`: Sanity project and datasets, Vercel projects, GitHub secrets). Wait for the human's approval.
3. **Implement** on `feat/new-project` from `develop`: the renames of `docs/NEW_PROJECT.md` §1, the removals (one commit per example), the brand (§4). Then `pnpm typegen` and the local gates (`docs/conventions/CODING_STANDARDS.md` §7).
4. **PR and review loop** (`.ai/shared/workflows/code-review-loop.md`), then merge and staging as in `.ai/shared/workflows/feature-orchestration.md` Steps 5–8.
5. **Hand-back.** The human's setup list as blockers (operating-model §2), with exact click paths.
