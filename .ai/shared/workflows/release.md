---
name: release
description: >-
  Production release (develop → main) behind human Gate G2, and the hotfix path
  (hotfix/* → main → back-merge to develop). Owned by the orchestrator + devops-engineer.
---

# Release & Hotfix

Obey `.ai/shared/workflows/operating-model.md`. A production release is **Gate G2**: nothing reaches `main` without an explicit human "go".

## Release (`develop` → `main`)

1. **Pre-flight (devops-engineer).** The latest `Deploy` run on `develop` is green (CI → both apps → smoke), and there are no open blockers.
2. **Release PR (orchestrator).**

   The body is what the human reads at Gate G2: the changes since the last release, the staging URLs, and every env-var or dashboard change production needs **before** the deploy.

   ```bash
   notes="$(mktemp)"   # outside the repo: never commit release notes by accident
   {
     echo "**🤖 Orchestrator** · Release · <yyyy-mm-dd>"
     echo; echo "## Changes"; git log origin/main..origin/develop --first-parent --format='- %s'
     echo; echo "## Staging (verified)"; echo "- Web: \$STAGING_WEBAPP_URL"; echo "- Studio: \$STAGING_STUDIO_URL"
     echo; echo "## Production prerequisites"; echo "- <env vars / dashboard changes, or 'none'>"
     echo; echo "<!-- agent=orchestrator; kind=release; round=0 -->"
   } > "$notes"
   gh pr create --base main --head develop --title "release: <yyyy-mm-dd>" --body-file "$notes"
   ```

   Replace the two placeholders before creating the PR. The PR must never open with an empty body.

3. **Review loop.** Run `.ai/shared/workflows/code-review-loop.md` on the release PR. The review focuses on release risk: env contract, migrations, config drift between staging and production.
4. **🚦 Gate G2.** After `APPROVED` and green CI, post the signed comment below and **stop**. Continue only when the human says go.

   ```text
   **🤖 Orchestrator** · Release · 🚦 awaiting human go
   …summary, staging URLs, production prerequisites…
   <!-- agent=orchestrator; kind=release; round=0 -->
   ```

5. **Merge with a merge commit** (keeps the release boundary in history):

   ```bash
   gh pr merge <PR> --merge
   ```

6. **Verify production (devops-engineer).** Watch the `Deploy` run on `main` (CI → both apps → production smoke) and report the production URLs. If it fails because of code: roll back per `docs/deployment/DEPLOYMENT.md` (Instant Rollback), then fix forward via a hotfix.

## Hotfix (`hotfix/*` → `main`)

1. Branch from `main`: `git checkout -b hotfix/<name> origin/main`. Keep the change minimal.
2. PR into `main` (the branch policy only allows `develop` and `hotfix/*`), then the full review loop.
3. **Gate G2** as above, then `gh pr merge <PR> --merge` and verify production.
4. **Back-merge** so staging never regresses: PR `main` → `develop`, run the review loop (usually trivial), then merge with **`--merge`**, never squash. A squash would give `develop` a new commit instead of `main`'s, and the next release PR would conflict on every line the hotfix touched.
