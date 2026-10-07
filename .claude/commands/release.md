---
description: Prepares a production release (develop → main) or a hotfix, stopping at human Gate G2.
---

# /release

**Arguments:** $ARGUMENTS (empty for a release, or `hotfix <name>`)

1. Read `.ai/shared/workflows/operating-model.md` and `.ai/shared/workflows/release.md`.
2. Follow the release or hotfix path exactly, including the review loop with a fresh reviewer subagent.
3. **Stop at Gate G2** and wait for the human's explicit "go" before merging into `main`.
