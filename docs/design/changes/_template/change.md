---
id: NNNN-page-what
page: home
brief: NNNN # docs/design/briefs/NNNN-page.md
parent: null # previous changeset of this page, or null for its first version
sections: [hero] # only the sections that are new or changed
source:
  tool: lovable
  project: '' # Lovable project id (docs/design/design-system.md)
  from: '' # previous approved commit of the page (empty for a first version)
  to: '' # approved commit
status: approved # approved → implemented (set by the merge) → superseded (by a later change)
---

# <Page>: <what>

## Approval

- Approved by, role:
- Date and channel:
- Preview at approval:

## Scope

The sections listed above, every locale, 375 / 768 / 1440. Unchanged sections are not part of this change.

## Tokens

None, or the list of changes for `app.config.ts` / `assets/css/main.css`.

## Acceptance

- Visual test within tolerance for every listed section, every locale and width (DESIGN_WORKFLOW §13), or "baselines pending" until the visual tooling exists.
- Every state in the section specs is covered.
- axe: no serious or critical issue.
- The demo content on staging equals the design content (seed).

## Deviations

Every accepted difference from the design, with its reason.

## Files

- `sections/<name>.md`: behaviour spec per section
- `sections/<name>.diff`: the Lovable diff of that section between `from` and `to`
- `content/<name>.json`: the section's content per locale
- `baseline/`: reference screenshots (when the visual tooling exists)
