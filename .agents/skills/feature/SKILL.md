---
name: feature
description: >-
  The end-to-end delivery pipeline for a feature: scope, plan (human gate G1),
  implementation, PR, independent review loop, merge and staging deploy.
---

# Feature Delivery Orchestration Skill

To execute this skill, you MUST read the shared orchestration workflow located at:
`.ai/shared/workflows/feature-orchestration.md`

Read `.ai/shared/workflows/operating-model.md` first. Follow the shared file exactly, using your native `invoke_subagent` tool. Code-review rounds always run in a separate subagent (`code-reviewer`).
