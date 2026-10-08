---
description: Runs the design track with Lovable (discovery with PO, Designer, Tech Lead, Frontend → brief gate D1 → one Lovable prompt → review → design gate D2 → changeset + task).
---

# /design

**Request:** $ARGUMENTS (an idea, `approve <page>`, `changes <page>`, `status`, or nothing)

1. Read `.ai/shared/workflows/operating-model.md`, then `.ai/shared/workflows/design-orchestration.md`, and follow it step by step as the Orchestrator.
2. Read the persona in `.ai/shared/agents/<name>.md` (its "Discovery questions" block) before asking questions as that role. The four roles run in your own context: no subagents.
3. Use the `lovable` MCP server only for the project recorded in `docs/design/design-system.md`. Never send a message that spends Lovable credits without the human's explicit go (design-orchestration Step 4), and never answer a Lovable tool approval on the human's behalf.
4. Stop at Gate D1 (brief) and Gate D2 (design). After D2, offer to start `/feature` with the drafted task.
