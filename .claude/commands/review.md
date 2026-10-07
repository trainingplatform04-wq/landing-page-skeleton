---
description: Runs the code review loop on a Pull Request (independent reviewer → triage → fixes → re-review → merge → deploy).
---

# /review

**Pull Request:** $ARGUMENTS (number)

1. Read `.ai/shared/workflows/operating-model.md` and `.ai/shared/workflows/code-review-loop.md`.
2. Run the loop on that PR, starting from its current state: if there are open threads, triage them; otherwise start the next review round.
3. Every review round runs in a **fresh subagent** briefed with `.ai/shared/agents/code-reviewer.md`, the PR number, the round number and links to previous rounds, and nothing else.
4. After `APPROVED` and green CI: squash-merge (feature PRs) and verify the staging deploy. Release PRs stop at Gate G2 (`.ai/shared/workflows/release.md`).
