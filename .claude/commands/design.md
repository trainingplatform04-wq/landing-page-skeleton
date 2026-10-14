---
description: Runs the design track with Lovable (discovery with PO, Designer, Tech Lead, Frontend → brief gate D1 → one Lovable prompt → review → design gate D2 → changeset + task).
---

# /design

**Request:** $ARGUMENTS (an idea, `approve <page>`, `changes <page>`, `send <brief id>`, `status`, or nothing)

1. Read `.ai/shared/workflows/operating-model.md`, then `.ai/shared/workflows/design-orchestration.md`, and follow it step by step as the Orchestrator.
2. Read the persona in `.ai/shared/agents/<name>.md` (its "Discovery questions" block) before asking questions as that role. The roles (four, plus the Privacy Officer when the design adds tracking, embeds, forms or third parties) run in your own context: no subagents.
3. Use the `lovable` MCP server only for the project recorded in `docs/design/design-system.md`. Send the Lovable prompt as soon as the human approves the brief (D1 is the go, design-orchestration Steps 3–5), never for a brief that is not approved, and never answer a Lovable tool approval on the human's behalf.
4. Stop at Gate D1 (brief) and Gate D2 (design), nowhere else. After D2, start `/feature` with the drafted task at once (the Tech Lead passes G1; no human stop until G2).
