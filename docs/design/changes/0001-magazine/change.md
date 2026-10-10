---
id: 0001-magazine
page: magazine
brief: '0001' # docs/design/briefs/0001-magazine.md
parent: null # first version of the page
sections: [magazine-hero, magazine-featured, magazine-grid, magazine-closing]
source:
  tool: lovable
  project: 'c69a43a6-c055-4de5-9929-e1aad1913e87'
  from: 'f497fdaec5d65dee7088cc1076f71f28df367670' # project state before the page existed
  to: '06635773527081b4baaa25a5074840a725aca3d6' # approved commit
status: approved # approved → implemented (set by the merge) → superseded (by a later change)
---

# Magazine: list page, first version

## Approval

- Approved by, role: the project owner (client role)
- Date and channel: 2026-10-10, Claude Code session (`/design`): "stop from Lovable to do the work
  of this page", page-by-page delivery
- Preview at approval: https://id-preview--c69a43a6-c055-4de5-9929-e1aad1913e87.lovable.app/magazine
  (Lovable message `umsg_01m4jkpm12fcdvh5j2we1hp6fn`, 4.3 credits)

## Scope

The sections listed above, 375 / 768 / 1440, compared in English (the prototype's only
language, colours from our theme); German is checked by E2E and by its own baselines. The article page (`/magazine/<slug>`) is **not** part of
this change: it gets its own brief. Until then, the cards link to `/magazine/<slug>` and our app
answers 404 there, like the prototype.

The header and footer get a "Magazine" link (menu order: offers, magazine, FAQ, contact). They
are not compared by pixels (outside the sections).

## Tokens

None. The page is built with **our current theme** (Nuxt UI `green` / `slate`, default fonts),
decided by the owner on 2026-10-10. Bringing the code to the Lovable theme is a separate first
step done later (`docs/tasks/design-system-fitflow.md`). The section specs name the prototype's
tokens; the frontend maps each to our closest Nuxt UI semantic token (`primary`, `text-muted`,
`bg-elevated`, `bg-inverted` for the dark bands, …) and keeps every measurement.

## Acceptance

- The owner approves our screenshots (`pnpm design:capture 0001-magazine`, our app only) against
  the Lovable preview for layout, sizes and content; they become the baselines and
  `pnpm design:verify 0001-magazine` passes (DESIGN_WORKFLOW §13).
- Every state in the section specs is covered (E2E: category filter, empty state, pagination).
- axe: no serious or critical issue.
- The demo content on staging equals the design content (seed: `content/magazine.json`; stock
  photos matching the prototype's picture descriptions).
- German page `/magazin` renders every section; long words wrap at 375.

## Deviations

- Pagination preview: the prototype fakes 3 pages with `?state=paginated`. Our app paginates for
  real (9 articles per page, `?page=`), so the paginated state is checked by E2E with more
  articles, not by pixels.
- The prototype's page title says "Pulse Training"; ours comes from Sanity (SEO fields).
- Colours and fonts are our current theme (Nuxt UI green / slate, default font), by the owner's
  decision: the Lovable theme comes with `docs/tasks/design-system-fitflow.md`. Layout, sizes,
  spacing and content follow the specs.
- Reading time is computed from the seeded text: article 1 reads "1 min" (the prototype typed
  "2 min" by hand, counting the figure and video captions that come with the article page).
- German titles hyphenate (`hyphens: auto`) so long uppercase words never overflow at 375; the
  English prototype has no such words.
- Pictures are stock photos matching the prototype's picture descriptions (Lovable's generated
  pictures are not downloaded).

## Files

- `sections/<name>.md`: behaviour spec per section (facts only)
- Evidence: the Lovable diff between `from` and `to` (`get_diff` with those two commits, free).
  Files: `src/routes/magazine.tsx`, `src/components/sections/Magazine{Hero,Featured,Grid,Closing}.tsx`,
  `src/components/magazine-card.tsx`, `src/lib/magazine.ts`, `src/content/magazine.ts`. The
  frontend never reads it.
- `verify.json`: what the design gate compares
- `content/magazine.json`: the page's content, English from the prototype and German
- `baseline/`: approved screenshots of our sections (`pnpm design:capture`, after implementation)
