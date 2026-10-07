---
name: review
description: >-
  Runs the code review loop on a Pull Request: independent reviewer, Tech Lead
  triage, fixes, re-review, merge and deploy verification.
---

# Code Review Loop Skill

Read `.ai/shared/workflows/operating-model.md`, then follow `.ai/shared/workflows/code-review-loop.md` exactly. Run every review round with a separate `invoke_subagent` call using the `code-reviewer` agent.
