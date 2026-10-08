---
name: design
description: >-
  The design track: a guided discovery conversation (Product Owner, Designer, Tech Lead,
  Frontend) → an approved brief (gate D1) → one compiled Lovable prompt → Lovable builds →
  human review → approved design (gate D2) → design changeset + task file → /feature.
  Entry point: /design.
---

# Design Orchestration

You are the **Orchestrator** of the design track. The reference document is `docs/design/DESIGN_WORKFLOW.md`: read §1–§4 once per session, and the section of the step you are on. Obey `.ai/shared/workflows/operating-model.md` (blockers, signatures). The design track is **human-driven**: its two gates, **D1 (brief)** and **D2 (design)**, are the human's, and they sit before the feature pipeline, whose own gates (G1, G2) are unchanged.

The design tool is **Lovable**, through the `lovable` MCP server. Lovable builds a **React prototype**, never production code: production is this Nuxt repository.

## Entry points

| You were given…                                                                            | Start at                                     |
| ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `/design` or `/design <idea>`                                                              | Step 1                                       |
| `/design approve <page>`                                                                   | Step 7 (the last Lovable result of the page) |
| `/design changes <page>`                                                                   | Step 2, in change mode, on that page         |
| `/design status`                                                                           | Print `docs/design/pages/` and open briefs   |
| `/design send <id>`, or `/design` while a brief is `approved` with a saved compiled prompt | Step 5 (the go was already given at Step 4)  |

## Steps

**Step 0: Setup check (no credits).** Read `docs/design/design-system.md`.

- If the Lovable workspace and project are not recorded there, call `get_me` and `list_workspaces`, show them, and ask which workspace to use. The project is created at Step 5 (its first build is the first credit spent).
- If the project knowledge is missing or older than `app.config.ts` / `assets/css/main.css`, regenerate it (DESIGN_WORKFLOW §6.3) and write it with `set_project_knowledge` (free). Record the date in `docs/design/design-system.md`.
- Never touch a Lovable project that is not listed in `docs/design/design-system.md`.
- If the registry says "Conventions applied: not yet" (a project bound before the conventions existed), check it with `list_files` (free): sections in `src/components/sections/` with `data-section`, pages composed of sections, content in `src/content/<page>.<locale>.ts`. When they are missing, propose **one** restructuring prompt that changes no visual, show it, and send it only after the human's go (credits). Then record "Conventions applied" with the date and the commit.

**Step 1: Intake.** Ask the human to describe the idea in their own words, if `/design` came without one. Classify it (DESIGN_WORKFLOW §9.1): content change (→ Sanity, stop here and say so), bug (→ fix PR, stop), design change or new design (→ continue), design-system change (→ continue, Step 2 focuses on tokens).

**Step 2: Discovery.** Play the four roles in your own context (no subagents), reading each persona's "Discovery questions" block in `.ai/shared/agents/`:

1. `product-owner`: goal, audience, message, call to action, content in every locale.
2. `designer-engineer`: layout, style, references, sections, states, breakpoints, motion.
3. `tech-lead`: scope against ADR 0004 (pages are code), CMS fields versus code text, routes, risks.
4. `frontend-engineer`: Nuxt UI equivalents, existing tokens, pixel-perfect risks.

Rules:

- **Rounds of at most 5 questions**, the most decisive first, multiple choice with a recommended option whenever possible (use the question tool when the platform has one). Never ask what the repository, the brief or an earlier answer already says.
- After each round, update the brief draft (Step 3) and show what is still open.
- Stop when the **definition of ready** of `docs/design/briefs/_template.md` is fully checked, or when the human says "enough": then the open points go into the brief's Open questions.

**Step 3: Brief → 🚦 Gate D1.** Write `docs/design/briefs/<id>-<page>.md` from `docs/design/briefs/_template.md` (ids are sequential, shared with changesets). Show it in full. **Stop and wait for the human's approval** of the brief. Changes requested → update the brief, show it again.

**Step 4: Compile the Lovable prompt.** The `designer-engineer` turns the brief into **one** prompt (DESIGN_WORKFLOW §7): self-contained, sections in order with their `data-section` names, the content of every locale, states, breakpoints, and what must not change. The conventions are already in the project knowledge: the prompt does not repeat them. Show the prompt and its expected credit use, and ask for the go. This is the **only** step that spends Lovable credits, so nothing is sent without that explicit go.

**Step 5: Build.**

- First build of the project: `create_project` with the prompt (and the workspace id), then `render_project_widget` when the client supports it. Record the project id in `docs/design/design-system.md`.
- Later builds: `send_message` with `wait=false`.
- If Lovable refuses the message for lack of credits, nothing was spent: save the compiled prompt in the brief (section "Compiled prompt"), log the attempt in its Iterations table, tell the human, and stop. The next `/design send <id>` (or `/design`) resumes here.
- Poll `get_message` until it finishes. A result with status `awaiting_input` is a Lovable tool approval: show `tool_id` and `params` to the human, ask, and answer with `respond_to_approval`. Never approve it on the human's behalf.
- When done, **notify the human** (push notification when the platform has one), with `get_project` (preview URL and screenshot) and a short summary of `get_diff` for that message. Record the message id and the commit in the brief's Iterations table.

**Step 6: Review.** Ask the human, with three choices: **Approve** · **Request changes** · **Discard**.

- **Request changes**: classify. A precise adjustment (spacing, a colour, a word) is made **without credits** as a Git commit on the synced Lovable repository, when Git sync is set up (DESIGN_WORKFLOW §8.3); anything larger updates the brief and goes back to Step 4 (one new compiled prompt). Never send small follow-up prompts one by one.
- **Discard**: mark the brief `discarded` with the reason. Nothing else changes.

**Step 7: Approval → 🚦 Gate D2.** Only after the human chose **Approve** (or typed `/design approve <page>`):

1. Record the approved Lovable commit of the page (`list_edits`) in `docs/design/pages/<page>.md` and, when Git sync is set up, tag it `design/<page>-v<n>` in the Lovable repository (tags only: never rewrite its history).
2. Create the changeset `docs/design/changes/<id>-<page>[-<what>]/` from `docs/design/changes/_template/` (DESIGN_WORKFLOW §10): for every section file that is new or changed since the page's previous approved commit, store its diff (one `get_diff` call with `base_sha` = the previous approved commit and `sha` = the new one, split per file; `read_file` at the new commit for a new section), the content per locale, and a section spec from `docs/design/changes/_template/section.md`. Unchanged sections are neither copied nor read.
3. Copy the client approval (who, when, channel) into the changeset's Approval block.
4. When the visual tooling exists (DESIGN_WORKFLOW §15), render the baselines; until then, note "baselines pending" in `change.md`.
5. Draft the task `docs/tasks/<name>.md` from `docs/tasks/template.md`, with the `Design change` field set.
6. Ask: "Start `/feature docs/tasks/<name>.md` now?" Yes → run `.ai/shared/workflows/feature-orchestration.md` from Step 2.

## Output discipline

- Print `--- Design step N complete ---` after each step.
- Lovable credit use is printed every time it happens: `Lovable: 1 message sent (credits used: see workspace balance)`.
- Everything written in the repository is in English.
