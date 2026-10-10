---
name: operating-model
description: >-
  Rules every agent and workflow obeys: where humans decide, what agents do
  autonomously, how blockers are handled, reviewer independence, and how every
  GitHub comment is signed. Overrides any conflicting wording elsewhere.
---

# Operating Model

This file is the single source of truth for **autonomy, human gates, blockers, reviewer independence and comment signatures**. If any agent persona or workflow disagrees with it, this file wins, and the disagreement is a bug to fix.

## 1. Human gates: agents stop exactly twice

| Gate                       | When                                        | Who stops    | What the human sees                            |
| -------------------------- | ------------------------------------------- | ------------ | ---------------------------------------------- |
| **G1: Plan approval**      | After the Tech Lead's plan, before any code | Tech Lead    | Plan, directory tree, owner → task list, risks |
| **G2: Production release** | Before `develop` → `main` is merged         | Orchestrator | Release PR, changelog, staging verification    |

Everything else is **autonomous**, with no permission requests: branching, implementation, tests, PR, the review loop, fixes, merge into `develop` (method per `.ai/shared/workflows/code-review-loop.md` §5), staging deploy and its verification. Agents never add stops of their own.

The **design track** (`.ai/shared/workflows/design-orchestration.md`, `/design`) is human-driven and runs before a feature: its gates **D1 (brief)** and **D2 (design)** belong to it, not to the feature pipeline, which keeps exactly G1 and G2.

The only exceptions are named ones:

- **E1: No subagents.** On a platform without subagents, the independent review can't run in the orchestrator's context (§3). The orchestrator stops at the PR and asks the human to run `/review <PR>` in a fresh session.
- **E2: Unverifiable PR.** A blocker that stops a PR check from running (§2 rule 4).

## 2. Blockers: never hold, always report

A **blocker** is anything only a human can do: dashboard settings, secrets, paid plans, third-party access.

1. **Code never waits for a blocker in a post-deploy check.** If the merge gates are met (`APPROVED` and green PR CI), merge. A post-deploy check the blocker breaks (the `Deploy` run's smoke test) must fail **loudly** (red, with its reason). It must never be skipped or softened.
2. The owning agent (usually DevOps) posts a **blocker comment** on the PR and tells the human: the exact click path, exact names and values, and what re-runs afterwards.
3. When the human confirms, the owning agent re-runs the failed job and reports the result.
4. **Exception E2:** if a blocker stops a **PR check** from running (for example, a missing env var the build needs), the code is **unverified**. Report the blocker the same way, but **don't merge** until that check has run green. Unverified code is never merged. Keep working on everything else meanwhile.

## 3. Independent review

- Every code-review round runs in a **separate subagent with fresh context**. The reviewer must never share the implementer's context, because it has to judge the diff, not the intent.
- Implementer personas (PO, Tech Lead, engineers, QA, DevOps) may be played in the orchestrator's own context when the platform has no subagents. **The Code Reviewer may not**: on such platforms, apply exception E1 (§1).
- The reviewer verifies fixes **in code**, not from replies, and may reopen threads.

## 4. Signed GitHub comments

Every comment, review and reply an agent posts on GitHub starts with a signature line and ends with a hidden marker:

```text
**<icon> <Role>** · <Stage> <Round> · <detail>
…body…
<!-- agent=<agent-name>; kind=<kind>; round=<n> -->
```

| Agent             | Icon | Typical stages                |
| ----------------- | ---- | ----------------------------- |
| Product Owner     | 📋   | Scope                         |
| Tech Lead         | 🧭   | Plan, Triage R<n>, Decision   |
| Designer Engineer | 🎨   | Design                        |
| Backend Engineer  | 🗄️   | Fix R<n>                      |
| Frontend Engineer | 🖥️   | Fix R<n>                      |
| QA Engineer       | 🧪   | Tests, Fix R<n>               |
| DevOps Engineer   | ⚙️   | CI, Deploy, Blocker, Fix R<n> |
| Code Reviewer     | 🔍   | Review R<n>                   |
| Orchestrator      | 🤖   | Merge, Release, Summary       |

Examples:

- Review body: `**🔍 Code Reviewer** · Review R2 · ✅ APPROVED` or `… · ❌ CHANGES REQUESTED`
- Inline comment: `**🔍 Code Reviewer** · R1 · [major] …`
- Thread reply: `**🖥️ Frontend Engineer** · Fix R1 · a62d670: …`
- Triage: `**🧭 Tech Lead** · Triage R1`
- Blocker: `**⚙️ DevOps Engineer** · Blocker · human action required`

`kind` is one of `review`, `comment`, `reply`, `triage`, `blocker`, `deploy`, `merge`, `release`. The marker makes the conversation between agents auditable, for example rounds per PR or fixes per agent.

## 5. Escalation

Escalate to the human, with a summary and the options, only when:

- the Tech Lead's round-5 verdict (`.ai/shared/workflows/code-review-loop.md` §2b) would change scope, architecture or cost beyond the approved plan; otherwise round 5 is settled by the Tech Lead alone;
- a decision changes scope, architecture or cost beyond the approved plan (the Tech Lead decides whether it does);
- two agents disagree after one exchange (the Tech Lead states both positions).
