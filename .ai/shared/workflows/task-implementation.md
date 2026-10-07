---
description: 'Entry point when the user asks to implement a task file from docs/tasks/.'
globs: '*'
---

# Task Implementation

When the user asks you to implement a task file (e.g. "Implement `docs/tasks/<name>.md`"):

1. Read the task file. It is the Product Owner's output.
2. Run the single delivery pipeline `.ai/shared/workflows/feature-orchestration.md` **from Step 2** (Tech Lead plan → Gate G1 → … → staging).
3. Obey `.ai/shared/workflows/operating-model.md`: stop only at Gate G1 (plan) and Gate G2 (production). Everything else is autonomous.
