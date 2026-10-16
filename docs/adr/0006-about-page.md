# ADR 0006: About page

- **Status**: Accepted by the owner (2026-10-16, design track: brief `docs/design/briefs/0003-about.md`, changeset `docs/design/changes/0003-about/`). **Amends [ADR 0004](0004-skeleton-scope-and-data-flow.md)** (scope: the about page was merged into the home page) and [ADR 0005](0005-magazine.md) (page count).
- **Date**: 2026-10-16
- **Decision owner**: human.

## 1. Context

ADR 0004 merged the about page into the home page. The owner asked for a page of its own with a picture and a short description, as a first-class page that the menu links to.

## 2. Decisions

- **A ninth page**, `about` (`/ueber-uns`, `/en/about`), with its own Sanity document `aboutPage` (one per language): label, title, description, one picture with alt text, a closing call to action and SEO.
- **The home about section stays** (portrait, text, highlights) and links to the new page.
- **Menu**: "About" after "Magazine".
- **Reuse**: the closing band is the magazine's (`MagazineClosing`, `section="about-closing"`). The page is thin: its content renders on the server only (`hydrate-never`), the picture is the first image and loads first.
- Everything else of ADR 0004 stands: unpublished pages render empty with `noindex`, buttons are optional, the staging seed fills the page in both languages.

## 3. Consequences

- The skeleton has 9 pages (10 with the article page).
- Adding a page follows the same recipe: route, `PAGE_TYPES`, schema, composable, content component, seed, E2E.
