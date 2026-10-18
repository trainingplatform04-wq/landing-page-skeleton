---
id: 0002-article
page: magazine-slug
brief: '0002' # docs/design/briefs/0002-article.md
parent: null # first version of the page
sections:
  [
    article-hero,
    article-takeaways,
    article-body,
    article-faq,
    article-author,
    article-related,
    article-closing,
  ]
source:
  tool: lovable
  project: 'c69a43a6-c055-4de5-9929-e1aad1913e87'
  from: '06635773527081b4baaa25a5074840a725aca3d6' # project state before the page existed (magazine v1)
  to: '7d7db3e3f6e8e5c8ace0ef12620a5b14b193c21f' # approved commit
status: approved # approved → implemented (set by the merge) → superseded (by a later change)
---

# Magazine article: one template for every article, first version

## Approval

- Approved by, role: the project owner (client role)
- Date and channel: 2026-10-13, Claude Code session (`/design`, gate D2: "Approve")
- Preview at approval:
  https://id-preview--c69a43a6-c055-4de5-9929-e1aad1913e87.lovable.app/magazine/protein-without-powder
  (Lovable message `umsg_01m4v83f98fxyrg9dkch5917w8`, 4.97 credits)

## Scope

The seven sections above, 375 / 768 / 1440, compared in English on
`/en/magazine/protein-without-powder` (the article that has every element); German is checked by
E2E and by its own baselines on `/magazin/protein-ohne-pulver`. The other articles use the same
template without takeaways and FAQ: checked by E2E (sections absent), not by pixels.

The magazine list page is unchanged. The prototype's one-line change there (the `?category=`
filter now ignores letter case, for the breadcrumb link) is a behaviour our app already has
(category slugs are lowercase).

## Tokens

None. Built with **our current theme** (Nuxt UI `green` / `slate`, default fonts), as the
magazine (owner, 2026-10-10). The specs name the prototype's tokens; the frontend maps each to
our closest Nuxt UI semantic token and keeps every measurement: `primary` → `primary`,
`muted-foreground` → `text-muted`, `border` → `border-default`, `accent` (coach tip, category
badge) → `bg-elevated` with `text-highlighted`, `surface-strong` (video poster, closing band) →
`bg-inverted` with `text-inverted`, `card` (toast) → Nuxt UI toast.

## Acceptance

- Our screenshots (`pnpm design:capture 0002-article`, our app only) are checked against the
  section specs by an independent designer reviewer, then `pnpm design:verify 0002-article`
  passes (DESIGN_WORKFLOW §13). The screenshots are not committed.
- Every state in the section specs is covered (E2E: table of contents open and current item,
  FAQ open, video loaded only after the click, link copied toast, sections hidden on an article
  without takeaways or questions, unknown slug answers 404).
- axe: no serious or critical issue.
- The demo content on Development equals the design content (seed: `content/article.json`; one new
  stock photo matching the figure's description).
- Web performance: the page meets 90+ (aim) and never under 80 on PageSpeed Insights, mobile and
  desktop (`webPerformance.config.ts`).

## Deviations

- The prototype's `?state=` previews are design aids. Our app shows the real states (E2E opens
  the accordions, clicks the video, copies the link); the baselines are the default states.
- Reading time is computed from the seeded text (the prototype typed "2 min read").
- The copy and share failure messages and the toast's close button come from the prototype
  (brief had only "Link copied"): kept, as i18n keys.
- Pictures are stock photos matching the prototype's descriptions (Lovable's generated pictures
  are not downloaded). The figure's photo is the closest free match: fresh ingredients in bowls
  on a counter (vegetables, beans, cheese, chicken) rather than the six exact basics; its alt
  text describes what it shows.
- The share toast is Nuxt UI's toast (`useToast`, through `UApp`), at the toaster's position
  for the whole site (bottom right), not bottom centre: one toast style everywhere.
- The FAQ and the mobile table of contents are native `<details>` (no JavaScript): their 200ms
  height animation runs in browsers that can animate to `height: auto` (`.disclosure` in
  `assets/css/main.css`); elsewhere they open at once. The chevron always rotates.
- German titles hyphenate (`hyphens: auto`) so long uppercase words never overflow at 375.

## Files

- `sections/<name>.md`: behaviour spec per section (facts only)
- Evidence: the Lovable diff between `from` and `to` (`get_diff` with those two commits, free).
  Files: `src/routes/magazine_.$slug.tsx`, `src/components/sections/Article{Hero,Takeaways,Body,Faq,Author,Related,Closing}.tsx`,
  `src/components/article-share.tsx`, `src/components/article-video.tsx`,
  `src/components/article.css`, `src/content/article.ts`, `src/lib/article.ts`. The frontend
  never reads it.
- `verify.json`: what the design gate compares
- `content/article.json`: the page's content, English from the prototype and German
- `baseline/`: our screenshots for the design gate, local only (gitignored)
