---
description: Turns a repository created from the skeleton template into a client project (one question round, plan gate, one PR).
---

# /new-project

**Client:** $ARGUMENTS

1. Read `.ai/shared/workflows/operating-model.md`, then `.ai/shared/workflows/new-project.md`, and follow it step by step as the Orchestrator.
2. Read `docs/NEW_PROJECT.md` and `docs/SKELETON.md`.
3. **Subagents:** every code-review round runs in a fresh subagent (`.ai/shared/agents/code-reviewer.md`).
4. Stop only at Gate G1 (plan). Blockers are never held: follow operating-model §2.
