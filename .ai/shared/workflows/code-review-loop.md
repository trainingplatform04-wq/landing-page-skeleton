---
name: code-review-loop
description: >-
  Mandatory review → fix → re-review → merge → deploy loop for every Pull Request.
  Referenced by every feature/task workflow. Single source of truth.
---

# Code Review Loop

Every PR goes through this loop. No step may be skipped, and nothing is merged with an open review thread. Autonomy, blockers, reviewer independence and comment signatures follow `.ai/shared/workflows/operating-model.md`.

## Roles

| Role            | Agent file                              | Responsibility                                                                                                               |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Code Reviewer   | `.ai/shared/agents/code-reviewer.md`    | Runs as a **fresh subagent** every round. Reviews the diff, posts **one signed GitHub review** per round, gives the verdict. |
| Tech Lead       | `.ai/shared/agents/tech-lead.md`        | Triages every comment, assigns it to an engineer, or answers with a rationale the reviewer must accept.                      |
| Engineers       | `backend-engineer`, `frontend-engineer` | Fix, push, reply on each thread with the commit SHA.                                                                         |
| DevOps Engineer | `.ai/shared/agents/devops-engineer.md`  | Keeps CI green: fixes platform failures (install, lockfile, env, deploy), routes code failures to the Tech Lead.             |

## Policy

- **Every comment must be resolved before approval**, including `[nit]`. Nothing is deferred silently.
- Comment labels: `[blocking]` (bug, security, data loss, broken build) · `[major]` (architecture/standards violation, missing test) · `[nit]` (naming, wording, style).
- Maximum **5 review rounds**:
  - **Rounds 1–3**: the reviewer's verdict decides; the Tech Lead triages, engineers fix.
  - **Rounds 4–5: Tech Lead arbitration.** A fresh reviewer still reviews, but the **Tech Lead gives the binding verdict** on every finding (§2b) and writes the fix plan before any engineer works. A finding the Tech Lead rejects is closed: the reviewer may not reopen it.
  - If round 5 still has an accepted finding open, stop and escalate to the human with a summary of the open threads.
- Reviews are posted from the operator's GitHub account, and GitHub forbids approving your own PR. Every review is therefore submitted with `event: COMMENT`, and the **verdict is in the signed first line of the review body** (operating-model §4):
  - `**🔍 Code Reviewer** · Review R<n> · ❌ CHANGES REQUESTED`
  - `**🔍 Code Reviewer** · Review R<n> · ✅ APPROVED`
- Every inline comment, reply, triage and blocker is signed the same way, for example `**🖥️ Frontend Engineer** · Fix R1 · <sha>: …`.

## Protocol

Set once: `PR=<number>`, `REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)`.

### 0. Preconditions (engineers)

The local gates (`docs/conventions/CODING_STANDARDS.md` §7) are green. The PR is open against `develop` with a description. No PR is opened with known failures.

### 1. Review round N (Code Reviewer, fresh subagent)

The orchestrator spawns a **new** reviewer subagent for every round and passes it only the PR number, the round number and links to previous rounds. It never passes its own reasoning about the change.

1. Read `docs/conventions/ARCHITECTURE.md`, `docs/conventions/CODING_STANDARDS.md` and the reviewer checklist.
2. Read the diff: `gh pr diff $PR` (round ≥ 2: also the commits pushed since the last round and every thread reply).
3. Write `review.json` and submit it:

   ```json
   {
     "event": "COMMENT",
     "body": "**🔍 Code Reviewer** · Review R1 · ❌ CHANGES REQUESTED\n\nSummary…\n\n<!-- agent=code-reviewer; kind=review; round=1 -->",
     "comments": [
       {
         "path": "composables/useHome/useHome.ts",
         "line": 12,
         "side": "RIGHT",
         "body": "**🔍 Code Reviewer** · R1 · [major] …why… **Suggested fix:** …"
       }
     ]
   }
   ```

   ```bash
   gh api "repos/$REPO/pulls/$PR/reviews" --method POST --input review.json
   ```

   Inline comments must target lines that are part of the diff. Findings on unchanged lines go in the body.

### 2. Triage and fix (Tech Lead → Engineers)

1. List the open threads:

   ```bash
   gh api graphql -F owner="${REPO%/*}" -F name="${REPO#*/}" -F pr=$PR -f query='
     query($owner:String!,$name:String!,$pr:Int!){ repository(owner:$owner,name:$name){ pullRequest(number:$pr){
       reviewThreads(first:100){ nodes{ id isResolved comments(first:1){ nodes{ databaseId path line body } } } } } } }'
   ```

2. For each thread the Tech Lead either assigns a fix, or replies with a rationale when the comment is wrong. The reviewer must then accept it explicitly in the next round.
3. Engineers fix. Commit messages use `fix(review): <what>`. Run the local gates again, then `git push`.
4. Reply on the thread and resolve it:

   ```bash
   gh api "repos/$REPO/pulls/$PR/comments/<databaseId>/replies" --method POST -f body="**🖥️ Frontend Engineer** · Fix R1 · <sha>: <one line>"
   gh api graphql -F id=<threadId> -f query='mutation($id:ID!){ resolveReviewThread(input:{threadId:$id}){ thread{ isResolved } } }'
   ```

### 2b. Tech Lead arbitration (rounds 4 and 5)

After the reviewer's round 4 or 5, the Tech Lead decides alone, in one signed comment:

```text
**🧭 Tech Lead** · Verdict R<n> · ✅ MERGE | 🔧 FIX
| Finding | Decision (accept / reject + rationale) | Plan: files, exact change, test | Owner |
<!-- agent=tech-lead; kind=verdict; round=<n> -->
```

- **Accept** → the plan says exactly what changes in which file and which test proves it; the engineer implements the plan as written (no redesign), runs the local gates, replies on the thread with the SHA and resolves it.
- **Reject** → the rationale is final; the Tech Lead resolves the thread.
- **✅ MERGE**: every finding is rejected or a `[nit]` already fixed; the PR merges once CI is green (§5), without another review round.
- **🔧 FIX**: after the fixes, round 5 runs (fresh reviewer, then this verdict again). There is no round 6.

### 3. Re-review (Code Reviewer)

- Verify every thread is resolved **and** actually fixed in code. Reopen (reply + unresolve) anything that isn't.
- Review the new commits as well. New problems become new threads.
- Submit round N+1. Repeat until `APPROVED`, or until the Tech Lead's verdict decides (rounds 4–5, §2b).

### 4. CI green (DevOps Engineer)

CI runs on every push. If a check fails, the **DevOps Engineer** reads `gh run view <id> --log-failed`. Platform failures (install, lockfile, env vars, runners) are fixed by DevOps. Code failures (lint, types, tests) go to the Tech Lead with the failing step and log excerpt. Fixes follow the same commit, push and reply flow. Never re-run a job hoping for green.

### 5. Merge (after `APPROVED`, or the Tech Lead's `✅ MERGE` in rounds 4–5, and green CI)

```bash
gh pr checks $PR --watch --fail-fast          # CI must be fully green
gh pr merge $PR --squash --delete-branch      # feature PRs → develop
```

Merge as soon as both gates are met. **Never hold a merge for a human-only prerequisite that only a post-deploy check depends on** (dashboard, secret): merge, let that check fail loudly, and post a signed blocker comment (operating-model §2). If a blocker stops a **PR check** from running, the code is unverified: report it the same way and wait for that check (exception E2).

| PR                                                                         | Merge method                                                                     |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Feature / fix → `develop`                                                  | `--squash --delete-branch`                                                       |
| Release `develop` → `main`, hotfix → `main`, back-merge `main` → `develop` | `--merge` (keeps shared history; see `.ai/shared/workflows/release.md`, Gate G2) |

### 6. Deploy verification (DevOps Engineer)

The merge triggers `Deploy` (full CI → web app + Studio → smoke test).

```bash
gh run list --workflow Deploy --branch develop --limit 1
gh run watch <run-id> --exit-status
```

Report the staging URLs from the run summary. A deploy failing because of **code** is fixed forward in a new PR through this same loop. One failing because of a **blocker** gets a signed blocker comment and is re-run once the human confirms.
