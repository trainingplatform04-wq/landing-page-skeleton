# Design ↔ Code Workflow

> **Status: Accepted direction (2026-10-08), tooling in progress.** Decided with the owner:
> **Lovable** is the design tool, `/design` runs a discovery with four roles, approval is offered
> as buttons in the chat (and `/design approve <page>`), the workflow is optimised for the
> **Lovable free plan**. The command, workflow, personas and templates exist; the visual tooling
> of §15 is the next phase. ADR: `docs/adr/0005-design-track-lovable.md`.

This document defines how **design** (Lovable), **content** (Sanity), **code** (this repository)
and **client validation** work together, from the first page to the tenth change request, with:

- **one source of truth per concern**, never two;
- **pixel-perfect** implementation, **measured** by a test, not judged by eye;
- **minimal token and credit consumption**: agents read the validated change, never the whole
  design; Lovable receives one compiled prompt per iteration;
- **the human out of the loop** between "the design is approved" and "staging is ready to show".

---

## Table of contents

1. [Principles](#1-principles)
2. [Who owns what](#2-who-owns-what)
3. [The two tracks](#3-the-two-tracks)
4. [Where things live](#4-where-things-live)
5. [Tools, accounts and limits](#5-tools-accounts-and-limits)
6. [Setting up once](#6-setting-up-once)
7. [`/design`: discovery, brief, compiled prompt](#7-design-discovery-brief-compiled-prompt)
8. [Build, review, iterate](#8-build-review-iterate)
9. [Scenarios](#9-scenarios)
10. [Approval and changesets (gate D2)](#10-approval-and-changesets-gate-d2)
11. [From changeset to feature](#11-from-changeset-to-feature)
12. [Lovable (React, shadcn) → Nuxt UI](#12-lovable-react-shadcn--nuxt-ui)
13. [Pixel-perfect: the design gate](#13-pixel-perfect-the-design-gate)
14. [Token and credit economy](#14-token-and-credit-economy)
15. [Tooling](#15-tooling)
16. [Running on the Lovable free plan](#16-running-on-the-lovable-free-plan)
17. [Alternatives](#17-alternatives)
18. [Risks and mitigations](#18-risks-and-mitigations)
19. [Decisions](#19-decisions)
20. [Rollout](#20-rollout)

---

## 1. Principles

1. **Design is a track of its own, not a step of the feature pipeline.** Designing needs human
   iterations (ideas, client comments, second thoughts). The feature pipeline is autonomous. The
   design track runs **ahead** and hands the pipeline only **validated, frozen** design.
2. **Talk to Claude, not to Lovable.** The human expresses the idea once, in the `/design`
   conversation. Four roles ask what is missing. Lovable receives one compiled, complete prompt.
3. **Lovable builds a prototype, never production.** Lovable generates React (TypeScript,
   Tailwind, shadcn). Production is this Nuxt repository. The prototype is the visual contract.
4. **A validated design is a commit.** Lovable commits every change. Gate D2 records the approved
   commit of a page; a later approval of the same page produces a changeset that contains only
   the sections changed between the two approved commits.
5. **Agents read deltas.** A change to one section is one section spec and one section diff.
   Nobody re-reads unchanged sections, other pages or the design history.
6. **Lovable through MCP, Playwright on our code.** The prototype is read only through the
   `lovable` MCP server (files, diffs), never opened in a browser. Playwright screenshots **our**
   sections; the human compares them with the Lovable preview, and once approved they are the
   baselines every later change must match within a tolerance.
7. **Design content is the staging seed.** The copy of the prototype (and stock pictures that
   match its picture descriptions) become the
   demo content of `studio/seed/seed.data.ts`: staging looks like the design and the visual test
   runs on the same content.
8. **Code owns tokens.** Colours, fonts, radii and spacing live in `app.config.ts` and
   `assets/css/main.css`. The Lovable project knowledge mirrors them, so prototypes use the
   tokens the site already has.
9. **Scripts do what scripts can do.** Diffs, token extraction, section cutting and screenshots
   cost zero LLM tokens and zero Lovable credits. Agents do what needs judgement.

---

## 2. Who owns what

| Concern                            | Source of truth                                             | Edited by                                              | Read by agents as                         |
| ---------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| Tokens and components (runtime)    | Code: `app.config.ts`, `assets/css/main.css`, `components/` | Frontend engineer                                      | the files                                 |
| Lovable conventions                | Lovable **project knowledge**, generated from code (§6.3)   | Designer engineer, with `set_project_knowledge`        | `get_project_knowledge` when needed       |
| The idea, decisions, content       | `docs/design/briefs/<id>-<page>.md`                         | `/design` discovery, approved at **D1**                | the brief                                 |
| The prototype being explored       | Lovable project (one per site)                              | Lovable, from compiled prompts; precise tweaks via Git | `get_project`, `get_diff`                 |
| The approved design (the contract) | `docs/design/changes/<id>/`                                 | `/design` at **D2**                                    | `change.md` and the touched section specs |
| Current approved state of a page   | `docs/design/pages/<page>.md`                               | `/design` at **D2**                                    | one small index                           |
| Demo content (staging)             | `studio/seed/seed.data.ts`                                  | Backend engineer, from the changeset's content         | the file                                  |
| Real content (production)          | Sanity `production`                                         | Editors, by hand                                       | never                                     |
| Pages, routes, fields              | Code (`constants/routes.constants.ts`, `studio/schemas/`)   | Backend engineer                                       | the files                                 |
| Client approval                    | Brief → Approval, changeset → Approval                      | `/design` at **D2**                                    | the block                                 |

If two places can disagree, one of them is a mirror and says so.

---

## 3. The two tracks

```
            DESIGN TRACK (/design, human-driven)                    FEATURE TRACK (/feature, autonomous)
 ┌─────────────────────────────────────────────────────────┐  ┌─────────────────────────────────────────┐
 │ 1 Intake      the idea, in your words                    │  │ task docs/tasks/<name>.md               │
 │ 2 Discovery   PO · Designer · Tech Lead · Frontend       │  │  PO scope → Tech Lead plan              │
 │               rounds of ≤5 questions                     │  │  🚦 G1  plan approved                   │
 │ 3 Brief       🚦 D1  brief approved                      │  │  backend: schema + seed (design copy)   │
 │ 4 Prompt      ONE compiled prompt → your go → 1 credit   │  │  frontend: sections (component map)     │
 │ 5 Build       Lovable builds → you are notified          │  │  QA: visual + E2E, agents loop          │
 │ 6 Review      Approve · Request changes · Discard        │  │  PR → fresh reviewer → merge            │
 │               small tweaks via Git (0 credits)           │  │  staging deploy + seed                  │
 │ 7 Approval    🚦 D2  design approved                     │──▶  🚦 G2  production                     │
 │               → changeset (delta) + task drafted         │  └─────────────────────────────────────────┘
 └─────────────────────────────────────────────────────────┘
```

- **D1 and D2 belong to the design track.** The operating model's feature gates stay exactly G1
  and G2. A design approved at D2 still passes G1, where the plan shows its scope.
- From D2 on, the only human touch points are G1, looking at staging, and G2.

---

## 4. Where things live

Inside `docs/` and `tests/` only.

```
docs/design/
├── DESIGN_WORKFLOW.md          ← this document
├── design-system.md            ← Lovable workspace, project, Git sync, knowledge date (the registry)
├── briefs/
│   ├── _template.md            ← brief + definition of ready (gate D1)
│   └── 0001-home.md
├── pages/
│   ├── README.md               ← format of the page index
│   └── home.md                 ← sections, current changeset per section, approved commit
└── changes/
    ├── _template/
    │   ├── change.md
    │   └── section.md
    ├── 0001-home/              ← first approved version of the home page
    │   ├── change.md           ← scope, source commits, approval, acceptance, deviations
    │   ├── sections/
    │   │   ├── hero.md         ← behaviour spec
    │   │   └── hero.diff       ← Lovable diff of that section (whole file for a first version)
    │   ├── content/hero.json   ← the section's content per locale (→ seed)
    │   ├── verify.json         ← what the design gate renders (our app's paths, sections, widths)
    │   └── baseline/           ← approved screenshots of our sections (§13)
    └── 0002-home-testimonials/ ← a later change: only the changed sections

tests/visual/                   ← the design gate: pnpm design:capture / design:verify (§13)
```

Ids are sequential and shared by briefs and changesets (`0001`, `0002`, …). Changesets are
append-only: once implemented they are never edited; a correction is a new changeset.

The Lovable prototype itself lives in Lovable and, with Git sync (§6.4), in **its own GitHub
repository** (Lovable creates a new repository per project and cannot import an existing one).
That repository is a design artefact, never deployed by our pipeline.

---

## 5. Tools, accounts and limits

### 5.1 Lovable MCP server

- Endpoint `https://mcp.lovable.dev`, OAuth login (no API key), supported by Claude Code.
  Connected with `claude mcp add --transport http lovable "https://mcp.lovable.dev"`, checked with
  `/mcp`. Available on all plans; on Enterprise an admin enables it.
- Tools the design track uses:

| Purpose                        | Tools                                                                     | Lovable credits        |
| ------------------------------ | ------------------------------------------------------------------------- | ---------------------- |
| Identity, workspace, balance   | `get_me`, `list_workspaces`, `get_workspace`                              | free                   |
| Create or change the prototype | `create_project`, `send_message` (plan mode, `wait=false`), `get_message` | **yes** (create, send) |
| Tool approvals inside Lovable  | `respond_to_approval` (the human decides)                                 | —                      |
| Conventions                    | `get_project_knowledge`, `set_project_knowledge`, workspace knowledge     | free                   |
| Look at the result             | `get_project` (preview URL, screenshot), `render_project_widget`          | free                   |
| Track changes                  | `list_edits`, `get_diff`, `list_files`, `read_file` (at a git ref)        | free                   |
| Publish for the client         | `deploy_project` (public `lovable.app` link on Free and Pro)              | free, **asked first**  |

### 5.2 Security rules

- The MCP connection has **the whole Lovable account**, not one project. Agents only touch the
  project recorded in `docs/design/design-system.md`.
- Credits are real money or real daily quota: nothing that spends credits is sent without the
  human's explicit go (`/design` Step 4).
- `deploy_project` publishes a link anyone can open on Free and Pro: asked every time.
- `query_database` and `enable_database` are never used: the prototype has no backend; content is
  static in the prototype and real content lives in Sanity.
- A Lovable tool approval (`awaiting_input`) is shown to the human and answered only with their
  decision.

### 5.3 Plans and credits

- `create_project` and `send_message` use the workspace's credits like prompts typed in Lovable;
  all other tools are free.
- Free plan: about 5 credits a day, not carried over, capped around 30 a month (third-party
  sources disagree; check the workspace balance with `get_workspace`). A large build can cost more
  than one credit. §16 explains how the workflow fits in that budget.

### 5.4 Figma (alternative, not used now)

The official Figma MCP server can write to the canvas from Claude Code, but writing needs a paid
**Full** seat, and the free Starter plan allows only about **6 MCP tool calls per month**: not
viable for an agent workflow. Figma stays the alternative when a human designer joins (§17).

---

## 6. Setting up once

### 6.1 Connect

1. Lovable account (free is fine).
2. In Claude Code: `claude mcp add --transport http lovable "https://mcp.lovable.dev"`, then
   `/mcp` → authenticate in the browser.
3. Run `/design status`: it reads the registry and asks which workspace to use.

### 6.2 Conventions every Lovable build follows

They make the prototype machine-readable and close to our code. They live in the **project
knowledge** (free to write), never in prompts:

| Convention                                                                                                                                                       | Why                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| One React component per section: `src/components/sections/<Name>.tsx`, root element `data-section="<name>"`, names equal to our component names                  | Section-level diffs and screenshots                                |
| Route files in `src/routes/<route>.tsx` (TanStack Start, as Lovable generates) only compose section components, in order                                         | One page = one ordered list of sections                            |
| **Content separated from markup**: `src/content/<page>.ts`, sections read their text from there                                                                  | Content goes straight into the seed and the changeset's `content/` |
| **English only**: no language switch, no translations; other locales exist only in our code and seed                                                             | No credits spent on translations                                   |
| Colours, radii, spacing, fonts only from the theme mirrored from our tokens (§6.3); shadcn components restyled through those variables; no raw hex in components | Token changes are explicit                                         |
| Tailwind breakpoints used as 375 / 768 / 1440 designs (`md:`, `xl:`); every section checked at the three widths                                                  | Same widths as the visual tests                                    |
| States visible on demand (`?state=error`, `?state=open`) for forms, menus, empty lists                                                                           | States get baselines too                                           |
| Motion only with CSS transitions/animations up to 700 ms (the existing `reveal`), disabled under `prefers-reduced-motion`                                        | Reproducible in Nuxt with the same values                          |
| Images as files in `src/assets/`, imported by components, no hot-linked URLs, no text inside images                                                              | They become seed images                                            |
| No new or changed backend code (an existing one, like FitFlow's contact function, stays untouched), no auth, no payments, no analytics                           | A prototype, not an app                                            |

### 6.3 Project knowledge from our tokens

The designer engineer generates the knowledge text from `app.config.ts` (Nuxt UI `primary`,
`neutral` colours) and `assets/css/main.css` (`@theme` fonts, radii, spacing) and writes it with
`set_project_knowledge`. It contains §6.2 and the token table, for example:

```
Theme (mirror of the production site, do not invent other values):
- primary: Tailwind "green" scale (primary = green-500, hover = green-600)
- neutral: Tailwind "slate" scale
- radius: 0.375rem; font: system-ui stack
Map shadcn variables: --primary → green-500, --muted → slate-100, --border → slate-200 …
```

`docs/design/design-system.md` records the date. `/design` regenerates it whenever the theme
files are newer, before any build.

### 6.4 Git sync (recommended, needed for free adjustments)

In Lovable, link the project to GitHub (one new repository, e.g. `<site>-design`). Edits in
Lovable are committed and pushed; commits pushed to the synced branch come back into Lovable.
Rules from Lovable's documentation: one synced branch at a time, **never force-push, rebase or
squash** on it, revert with a new commit. Tags are fine: `/design` tags approved commits
`design/<page>-v<n>`. Record the repository in the registry.

Without Git sync the workflow still works: change tracking only needs the MCP (`list_edits` gives
every commit, `get_diff` with `base_sha` and `sha` returns the diff between two commits). Only
precise adjustments then cost credits, because they must go through a Lovable prompt.

### 6.5 Client access

| Option         | How                                  | Note                                                      |
| -------------- | ------------------------------------ | --------------------------------------------------------- |
| Preview link   | `get_project` preview URL            | May require a Lovable login depending on visibility       |
| Published link | `deploy_project` → `lovable.app` URL | Public on Free/Pro; asked first; unpublish after approval |
| Screen-share   | You drive the prototype live         | Fast iterations                                           |

The approval is written down (email, message) and copied into the brief and the changeset.

---

## 7. `/design`: discovery, brief, compiled prompt

### 7.1 Discovery

`/design` (or `/design <idea>`) starts the conversation. The orchestrator plays four roles in its
own context (no subagents: one thread, cheap), each with its "Discovery questions" block:

| Role              | Asks about                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| Product Owner     | goal, audience, message, call to action, content in every locale, out of scope                            |
| Designer engineer | sections and `data-section` names, style and references, layout per width, states, media, motion          |
| Tech Lead         | existing or new page (ADR 0004: code owns pages), CMS field vs i18n key vs decoration, reuse, risks, size |
| Frontend engineer | Nuxt UI equivalents, missing tokens, breakpoints and states, motion, pixel-perfect risks                  |

Rules:

- Rounds of **at most five questions**, most decisive first, multiple choice with a recommended
  option, so most answers are one click.
- Never ask what the repository, the brief or an earlier answer already says.
- After each round the brief draft is updated and the remaining gaps are shown.
- The discovery ends when the brief's **definition of ready** is fully checked, or when you say
  "enough" (open points then go into Open questions).

Example of a first round for "a home page for a personal trainer":

```
1. Primary goal of the page?            [Book a free trial (Recommended)] [Contact form] [Read offers]
2. Sections, in order?                  [hero · offers · about · testimonials · faq · closing (Recommended)] [Other]
3. Style reference?                     [Clean, lots of white, green accents (Recommended)] [Dark, bold] [Paste a link]
4. Do you have the real copy in DE/EN?  [Yes, I paste it] [Draft it, client validates (Recommended)] [DE only]
5. Photos?                              [Placeholders now, real ones later (Recommended)] [I upload them]
```

### 7.2 The brief and gate D1

The brief (`docs/design/briefs/_template.md`) holds everything the discovery decided: intent,
product, sections, content per locale, technical notes, out of scope, open questions, the
definition of ready, the Lovable iterations and the approval. It is shown in full; **D1** is your
approval of it. Nothing is sent to Lovable before D1.

The brief is persistent: a later `/design changes home` starts from it and from the page index,
so nothing is asked twice.

### 7.3 The compiled prompt

The designer engineer turns the brief into **one** Lovable prompt. Structure:

```
Goal: <one line: what the page is for>
Page: <Page>, URL <path> (new route). Menu: <where the link goes, if any>.
Sections in this order:
1. <Name> (data-section="<name>"): <what it shows and why>
   Layout: 1440 … / 768 … / 375 …
   Content: <the exact English text, every item>
   States: … (?state=<name> where needed). Motion: …
2. …
Do not change: <other pages, sections or files>
```

Lovable only designs. The prompt describes **what to build** (page, URL, sections, layout, states, the full English content) and nothing about **how our site works**: no Sanity, no Nuxt, no field names, no translations, no theme values, no conventions (those are in the project knowledge). The brief's Implementation part stays on our side. For a change, it names
only the sections to change and lists what must stay identical. It is shown to you with the
expected credit use; you give the go; it is sent once.

---

## 8. Build, review, iterate

### 8.1 Build and notification

- First build: `create_project` (the workspace id from the registry), then `render_project_widget`
  when the client shows widgets. The project id is written to the registry.
- Later builds: `send_message` with `wait=false`, then `get_message` until it finishes.
- When it is done you are **notified** (push notification when the platform supports it) with the
  preview URL, the screenshot from `get_project` and a short summary of `get_diff`. The iteration
  is logged in the brief (message id, commit, credits, result).

### 8.2 Review: three buttons

**Approve** → gate D2 (§10). **Request changes** → §8.3. **Discard** → the brief is marked
`discarded` with the reason. The same review can be resumed later with `/design approve <page>` or
`/design changes <page>`.

### 8.3 Request changes: the cheapest path first

| Change                                                         | Path                                                                                       | Lovable credits              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------- |
| Precise: a spacing, a colour token, a word, an image swap      | Claude Code edits the synced Lovable repository and pushes one commit; Lovable picks it up | **0**                        |
| Several precise ones                                           | One commit with all of them                                                                | **0**                        |
| Structural: a new section, a new layout, a different component | The brief is updated, one new compiled prompt (§7.3) after your go                         | 1 (or more for large builds) |

Small prompts are never sent one by one.

### 8.4 Lovable tool approvals

If Lovable pauses (`awaiting_input`), you see the tool and its parameters and decide; the agent
answers with `respond_to_approval`. It never decides for you.

---

## 9. Scenarios

### 9.1 Classify first

| The request is…   | Example                                       | Goes to                                                     | Changeset?        |
| ----------------- | --------------------------------------------- | ----------------------------------------------------------- | ----------------- |
| **Content**       | new wording, another photo, reorder offers    | Editors in the Studio (staging to try, production for real) | no                |
| **Design + data** | a rating on testimonials, a "trusted by" line | `/design` → feature                                         | yes               |
| **Design**        | a section's look or layout                    | `/design` → feature                                         | yes               |
| **Design system** | a warmer primary colour, rounder buttons      | `/design` (design-system brief) → small feature             | yes (tokens only) |
| **Bug**           | text overflow, broken link                    | fix PR                                                      | no                |

### 9.2 The first page

1. `/design a home page for the personal trainer site` → discovery (two or three rounds) → brief
   `0001-home` → **D1**.
2. Compiled prompt shown → go → `create_project` → notification with preview.
3. You and the client review. Two precise adjustments → one Git commit (0 credits). One
   structural change → updated brief, one new prompt.
4. Client approves (email) → **Approve** → **D2**:
   - approved commit recorded, tag `design/home-v1`;
   - `docs/design/changes/0001-home/` with every section (first version: the whole section files
     as "diff"), specs, content per locale, `verify.json` (baselines come after implementation);
   - `docs/design/pages/home.md` created;
   - task `docs/tasks/home-page.md` drafted with `Design change: docs/design/changes/0001-home/`.
5. "Start `/feature` now?" → yes → plan → **G1** → implementation, visual loop, PR, review, merge →
   staging, seeded with the design content.

### 9.3 Two days later the client changes a section

The client wants the testimonials as a carousel with a star rating, and a "trusted by" line.

1. `/design changes home` → the brief and the page index are loaded → one short round ("rating out
   of 5 or 10?", "carousel autoplay?") → brief `0002-home-trust-testimonials` → **D1**.
2. One compiled prompt naming only `trust` (new) and `testimonials` (changed), with "do not change"
   for the rest → go → build → review → approve → **D2**.
3. The changeset compares the page's approved commits `design/home-v1` → `design/home-v2`,
   section file by section file:

| Section file                                                    | Result                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| `Hero.tsx`, `Offers.tsx`, `About.tsx`, `Faq.tsx`, `Closing.tsx` | unchanged → **not copied, not read**                                  |
| `Trust.tsx`                                                     | new → stored whole                                                    |
| `Testimonials.tsx`                                              | changed → only its diff                                               |
| `content/home.de.ts`, `home.en.ts`                              | changed keys only → `content/testimonials.json`, `content/trust.json` |

4. The page index now points `trust` and `testimonials` to `0002-…`, the other sections still to
   `0001-home`.
5. The feature reads two section specs and two diffs. The backend adds `testimonial.rating` and
   `homePage.trust`, updates the seed (the staging seed adds the new fields without touching what
   the client edited). The visual test checks **every** section of the page (the unchanged ones
   against their 0001 baselines: the regression net), but agents only open the failing ones.

### 9.4 A change of mind before implementation

Not merged yet: the change is applied to the same brief and changeset (`/design changes home`
updates `0002`), the feature branch picks it up. Already merged: a new changeset (`0003`).

### 9.5 A new page

`/design an offers page` → the Tech Lead's questions decide whether the route exists in code
(`constants/routes.constants.ts`) or is new; the task then includes everything a page needs
(ARCHITECTURE "Add a page"): route, schema, composable, page, i18n keys, seed documents with the
design content, E2E fixtures, smoke route, visual test entries. Shared sections (e.g. `closing`)
are reused, with page-specific baselines.

### 9.6 A design-system change

`/design warmer primary colour` → a design-system brief → the project knowledge is updated (free)
→ one compiled prompt "apply the new theme everywhere" → approve → a changeset with **tokens only**
→ a small feature changes `app.config.ts` / `assets/css/main.css`; every page's baselines are
re-rendered from the new approved commit.

### 9.7 The implementation reveals a design problem

Small and obvious: the frontend applies the spec's overflow rule and records a **deviation**.
A real design question: a signed **blocker** comment on the PR with a screenshot; `/design changes`
fixes it in the same changeset.

### 9.8 Feedback on staging

Classify with §9.1. Staging feedback never goes into code without that classification.

### 9.9 Production content differs from the design

Expected. Pixel-perfect is defined on the demo content (seed). On real content the section
specs' limits and overflow rules apply, enforced as Studio validation where possible.

---

## 10. Approval and changesets (gate D2)

### 10.1 Recording the approved commit

At **Approve**, `/design` reads `list_edits`, takes the latest commit of the project, writes it to
`docs/design/pages/<page>.md` (`Approved commit: <sha> (design/<page>-v<n>)`) and to the brief,
and tags it in the synced repository when Git sync is set up (tags only).

### 10.2 What the design gate will render

`/design` writes `verify.json` in the changeset (`docs/design/changes/_template/verify.json`): our
app's path per locale (from `constants/routes.constants.ts`), the new or changed sections, the
widths, the tolerance. Nothing is captured from Lovable: the approved commit (§10.1) and the
MCP-read facts (§10.3) are the record. Baselines are made from our app once it is built (§13).

### 10.3 Extracting the delta, as facts

Only the **designer engineer** reads Lovable code. The page's files are derived from its route file:
`src/routes/<route>.tsx`, the section components it imports (`src/components/sections/*.tsx`) and
its content files (`src/content/<page>.ts`). The project knowledge in Lovable is the
reference for these paths; this document mirrors it.

- **One** `get_diff` call: `base_sha` = the previous approved commit, `sha` = the new one (free,
  computed by Lovable, no Git sync needed), split per file; a new section file is read whole with
  `read_file` at the new commit. Unchanged sections are skipped.
- The diff is kept as evidence (`sections/<name>.diff`) for the designer and the reviewer.
- From it, the designer writes **facts** into `sections/<name>.md` (`docs/design/changes/_template/section.md`):
  layout per width with measurements (column counts, gaps, paddings, max widths, heights, image
  ratios), typography (font, size, weight, case, line height per width), colours **as our tokens**,
  borders, radii, shadows, states, motion (duration, easing, trigger), accessibility. **No React,
  no JSX, no class list**: values only.
- Content: the changed keys → `content/<section>.json`: English from the prototype, the other locales drafted by the product owner (for the seed and i18n).

First version of a page: every section is "new".

### 10.4 Writing the changeset and the task

From `docs/design/changes/_template/`: `change.md` (source commits, sections, approval, acceptance,
deviations), the section specs, `verify.json`, `baseline/` (after implementation). Anything the designer
cannot infer goes under Open questions, answered at G1. Then the task `docs/tasks/<name>.md` from
`docs/tasks/template.md`, `Design change: docs/design/changes/<id>/`, acceptance from `change.md`,
and: "Start `/feature` now?"

---

## 11. From changeset to feature

| Step              | Agent                                   | Reads                                                         | Produces                                                                |
| ----------------- | --------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Scope             | Product Owner                           | task, `change.md`                                             | scope confirmation                                                      |
| Plan              | Tech Lead                               | `change.md`, page index, specs' Components and Content tables | plan → **G1**                                                           |
| Design map        | Designer engineer                       | section specs (facts)                                         | component map (§12), token changes                                      |
| Data              | Backend engineer                        | Content tables, `content/*.json`                              | schema fields, `pnpm typegen`, seed = design content and pictures       |
| UI                | Frontend engineer                       | one section spec at a time + its baselines                    | section components with `data-section`, **under our architecture only** |
| **Design gate**   | QA engineer                             | `verify.json`                                                 | `pnpm design:verify <change>` green (§13), plus E2E and axe             |
| Loop              | Frontend ↔ design gate                  | the failing section's diff image only                         | fixes; deviations recorded                                              |
| PR, review, merge | Tech Lead, fresh reviewer, Orchestrator | diff, gate report, deviations                                 | merge → staging, seeded with the design content and pictures            |

**Strict architecture.** The frontend engineer **never reads Lovable code** (`.diff` files, the
Lovable project). It implements from the section spec and the baselines, following
`docs/conventions/ARCHITECTURE.md` and `docs/conventions/CODING_STANDARDS.md` exactly: Nuxt UI
first, composables own data, components get plain props, every text through Sanity or i18n, the
project's file layout. The design gate proves the result is pixel-perfect; resemblance to the
Lovable code is never a goal. The reviewer blocks code shaped like the prototype (JSX-like
structure, copied class lists, hard-coded texts, a file layout that is not ours).

Reading rules for every agent:

1. `change.md` first, then only the section specs you are assigned.
2. Only the designer reads Lovable code, and only the changed sections.
3. Screenshots only when the design gate failed on that section (the diff image).
4. Never older changesets: the page index says what is current.
5. Never the whole Lovable project.

---

## 12. Lovable (React, shadcn) → Nuxt UI

### 12.1 The designer's component map

Used by the designer to write the component map, never as code to translate line by line:

| Lovable / shadcn                             | Nuxt UI v4                                                       |
| -------------------------------------------- | ---------------------------------------------------------------- |
| Hero section (heading, text, buttons, image) | `UPageHero` (`title`, `description`, `links`, default slot)      |
| Content section with title                   | `UPageSection`                                                   |
| Grid of cards                                | `UPageGrid` + `UPageCard`                                        |
| `Button`                                     | `UButton` (`color`, `variant`, `size`, `to`)                     |
| `Card`                                       | `UCard` / `UPageCard`                                            |
| `Badge`                                      | `UBadge`                                                         |
| `Accordion`                                  | `UAccordion`                                                     |
| `Carousel` (embla)                           | `UCarousel`                                                      |
| `Dialog` / `Sheet`                           | `UModal` / `USlideover`                                          |
| `DropdownMenu`                               | `UDropdownMenu`                                                  |
| `Tabs`                                       | `UTabs`                                                          |
| `Input`, `Textarea`, `Select`, form + zod    | `UInput`, `UTextarea`, `USelect`, `UForm` + `UFormField` (zod)   |
| `Avatar`                                     | `UAvatar`                                                        |
| `Separator`                                  | `USeparator`                                                     |
| `lucide-react` icons                         | `UIcon name="i-lucide-…"` (same icon set)                        |
| Toasts (`sonner`)                            | `useToast()`                                                     |
| Static text from `src/content/*.ts`          | Sanity fields or i18n keys, per the section spec's Content table |

### 12.2 Styling

Values from the spec are expressed with Nuxt UI props first, then the project's semantic tokens
and Tailwind utilities written for our components (never a class list copied from the prototype),
custom CSS last, with a note in the spec.

### 12.3 Pictures: from Lovable to Sanity

- The prototype's generated pictures stay in Lovable (its preview needs a login and is never
  opened by our tools). The seed uses real stock photos chosen to match each picture's
  description (the alt texts in the prototype's content file, read through MCP); addresses in
  `studio/seed/seed.images.ts`. The seed downloads each one and uploads it to the **Sanity
  dataset** (`staging`), where editors and the client see and replace them. No picture is ever
  committed.
- Because the seed's add mode never overwrites an existing field, replacing pictures that are
  already in staging takes one deliberate `pnpm studio:seed --reset`.

---

## 13. Pixel-perfect: the design gate

### 13.1 Capture (after implementation, approved by the human) and verify (before every PR)

|                   | `pnpm design:capture <change>`                                                        | `pnpm design:verify <change>`                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Renders           | our app, same server as verify; the human compares the shots with the Lovable preview | our app: a **production build** (`nuxt build`, Node server) on the developer's `.env` (staging, seeded with the design content) |
| Per               | section × locale × width (375 / 768 / 1440)                                           | the same                                                                                                                        |
| Writes / compares | stable screenshots → `baseline/`                                                      | `toHaveScreenshot()` against `baseline/`, tolerance from `verify.json`                                                          |
| Output            | baselines, committed once the human approves them                                     | pass/fail per section, diff images, HTML report (`playwright-report/design/`)                                                   |

Rendering: fonts loaded, animations and transitions off, reduced motion, lazy images loaded,
network idle. Baselines captured on one operating system are compared on the same one (font
rasterisation differs between systems). Playwright never opens the Lovable preview.

### 13.2 Rules

- Tolerance: `maxDiffPixelRatio: 0.002`, `threshold: 0.1` (template defaults); masks only when
  declared in the spec.
- The task is not done, and no PR is opened, until `pnpm design:verify <change>` passes.
- At most 4 fix iterations per section; then the agent proposes a deviation for the reviewer.
- The gate was proven both ways on this repository: identical pages pass (8/8), a page in the wrong
  language fails (1 % of pixels different).

### 13.3 Not covered by pixels, covered otherwise

| Aspect                   | Covered by                                            |
| ------------------------ | ----------------------------------------------------- |
| Motion                   | spec Motion block, reviewed in the PR                 |
| Widths between the three | spec's fluid rules (+ optional 1024 in `verify.json`) |
| Interactive states       | spec States block; `?state=` captures later (T8)      |
| Long real content        | spec limits, Studio validation, E2E with long texts   |
| Accessibility            | axe, Lighthouse ≥ 95                                  |
| Performance              | Lighthouse on staging after deploy                    |

### 13.4 Why the loop converges

Same tokens (knowledge mirrors code), same content and pictures (seed), same fonts, same browser.
The remaining differences are layout ones, visible in a diff image.

---

## 14. Token and credit economy

| Waste avoided                                                     | How                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Many small Lovable prompts                                        | One compiled prompt per iteration, after the discovery                                    |
| Repeating conventions in every prompt                             | Project knowledge (free)                                                                  |
| Paying credits for tweaks                                         | Git commits on the synced repository (0 credits)                                          |
| Agents reading the whole prototype (often 20–60k tokens per page) | Only the designer reads the changed sections' diff (1–4k each); everyone else reads facts |
| Agents looking at screenshots (≈1.5k tokens per image)            | Spec tables carry the facts; images only when the gate fails                              |
| Agents re-reading design history                                  | The page index points to the current changeset per section                                |
| Extracting values or comparing visuals by reading                 | The designer extracts once; the gate compares (0 tokens)                                  |
| Asking the same question twice                                    | The brief is persistent                                                                   |

Order of magnitude (to be measured in the pilot):

| Scenario               | Lovable credits         | Agent tokens (design reading) |
| ---------------------- | ----------------------- | ----------------------------- |
| First page             | 1–3 builds              | ~25–40k                       |
| Change of 1–2 sections | 1 build (+ free tweaks) | ~5–10k                        |
| Precise tweaks only    | 0                       | ~1–3k                         |
| Design-system change   | 1 build                 | <2k (tokens)                  |

---

## 15. Tooling

| #   | Item                                                                             | Status                        |
| --- | -------------------------------------------------------------------------------- | ----------------------------- |
| T1  | `/design` command, design workflow, personas, templates, registry                | **done**                      |
| T2  | ADR 0005                                                                         | **done**                      |
| T3  | Design gate: `pnpm design:capture` / `pnpm design:verify` (`tests/visual/`)      | **done**                      |
| T4  | Seed pictures by address, uploaded to Sanity (stock photos now, Lovable's later) | **done**                      |
| T5  | `data-section` on every section component root in Nuxt                           | with the first design feature |
| T6  | Design gate in CI (Linux baselines, report artifact)                             | later                         |
| T7  | `@axe-core/playwright` in the gate                                               | later                         |
| T8  | Interactive states (`?state=`) captured and compared                             | later                         |
| T9  | Token extraction from the prototype theme → diff with the code theme             | later                         |

---

## 16. Running on the Lovable free plan

- **About one substantial build a day.** The discovery happens in Claude (no credits) and ends in
  one compiled prompt. A day's ideas go into the next prompt, not into several.
- **Tweaks are free** through Git sync (§8.3). Set it up before the first page.
- **Tracking is free**: `list_edits`, `get_diff`, `read_file`, `get_project`.
- **Plan mode** (`send_message` with `plan_mode`) is used only when a structural change is
  ambiguous; check its credit use in your workspace before relying on it.
- **Check the balance** with `get_workspace` before Step 4; if it is too low, the prompt is saved in
  the brief and sent the next day.
- **When to upgrade**: when several structural iterations a day are needed (live client sessions).
  The workflow does not change, only the pace.

---

## 17. Alternatives

| Option                              | Generation                                                     | Client validation                    | Change tracking                       | Cost                     | When                                       |
| ----------------------------------- | -------------------------------------------------------------- | ------------------------------------ | ------------------------------------- | ------------------------ | ------------------------------------------ |
| **Lovable** (chosen)                | Best tested                                                    | Real clickable site                  | Git commits, diffs, MCP               | Free with ~5 credits/day | Now                                        |
| Figma paid (Full seat)              | Agent writes canvas via Plugin API; strong for human designers | Prototype frames, excellent comments | Version history, frame links          | Paid seat                | A human designer joins                     |
| Figma free                          | —                                                              | —                                    | —                                     | Free                     | Not viable for agents (≈6 MCP calls/month) |
| Claude Design                       | Tested, results below expectations                             | Org links, PDF/HTML export           | Handoff bundles (format undocumented) | Included in Claude plans | Not now                                    |
| Design in code (Nuxt UI + previews) | The site is the design                                         | Preview URL per change               | Git                                   | Lowest                   | Small changes once a page is live          |

The changeset format is tool-independent: a Figma or code-first change produces the same
`docs/design/changes/<id>/`, so the tool can change without changing the feature pipeline.

---

## 18. Risks and mitigations

| Risk                                                | Mitigation                                                                                                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lovable ignores a convention (§6.2)                 | The approval step checks `data-section`, sections per file and content files; it lists what is missing and proposes one fix prompt or a free Git fix |
| React prototype patterns with no Nuxt UI equivalent | Frontend questions at discovery; mapping table (§12); flagged at G1                                                                                  |
| The MCP has the whole account                       | Registry-only project rule; credits and publishing always asked                                                                                      |
| Credits run out mid-iteration                       | Prompt saved in the brief; tweaks through Git; upgrade when the pace requires it                                                                     |
| Git sync history rewritten                          | Never force-push, rebase or squash the synced branch; tags only                                                                                      |
| Font rendering differences                          | Baselines and CI on Linux only                                                                                                                       |
| Real content breaks layouts                         | Spec limits, overflow rules, Studio validation, E2E with long texts                                                                                  |
| Lovable changes its MCP tools                       | The workflow names the tools in one place (this document §5.1); adapt there                                                                          |
| Public preview links on the free plan               | Published only on request, unpublished after approval                                                                                                |

---

## 19. Decisions

| #   | Decision                                                                                  | Status                                   |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| D1  | Design tool: Lovable (Figma later, if a human designer joins)                             | **decided**                              |
| D2  | Discovery with PO, Designer, Tech Lead, Frontend, in the main context                     | **decided**                              |
| D3  | Approval: buttons in the chat + `/design approve <page>`                                  | **decided**                              |
| D4  | Optimised for the Lovable free plan                                                       | **decided**                              |
| D5  | Approved designs as Git changesets in `docs/design/changes/`, committed in the feature PR | **decided** (follows from D1–D4)         |
| D6  | Viewports 375 / 768 / 1440                                                                | proposed                                 |
| D7  | Visual tolerance 0.2 % pixels, threshold 0.1, max 4 iterations                            | proposed                                 |
| D8  | Git sync for the Lovable project, tags `design/<page>-v<n>`                               | proposed (recommended for the free plan) |

---

## 20. Rollout

| Phase             | Content                                       | Exit criterion                                                                                                |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1. Track and gate | T1–T4 (done)                                  | `/design` runs discovery → brief → prompt → build → D2 → changeset; the design gate proven on this repository |
| 2. Pilot          | First brief through §9.2–§10, Git sync set up | Approved changeset and task; `pnpm design:verify` green; feature merged; staging shows the design             |
| 3. Harden         | T5–T8                                         | Gate in CI on Linux, axe, states                                                                              |
| 4. Generalise     | Remaining pages, T9                           | Every page has a page index and baselines                                                                     |
