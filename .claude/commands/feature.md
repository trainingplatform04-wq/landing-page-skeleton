---
description: Delivers a feature end-to-end (scope → plan gate → implement → PR → independent review → merge → staging).
---

# /feature

**Feature request:** $ARGUMENTS

1. Read `.ai/shared/workflows/operating-model.md`, then `.ai/shared/workflows/feature-orchestration.md`, and follow it step by step as the Orchestrator.
2. Read the persona in `.ai/shared/agents/<name>.md` before acting as, or delegating to, each specialist.
3. **Subagents:** implementer personas may run in your own context. **Every code-review round must run in a fresh subagent** (Agent tool, a general-purpose agent briefed with `.ai/shared/agents/code-reviewer.md`), never in your context.
4. Stop only at Gate G1 (plan) and Gate G2 (production). Blockers are never held: follow operating-model §2.
5. Sign every GitHub comment per operating-model §4.
