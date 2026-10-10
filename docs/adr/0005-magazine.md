# ADR 0005: Magazine

- **Status**: Accepted by the owner (2026-10-10, Gate G1 of `docs/tasks/magazine-page.md`). **Amends [ADR 0004](0004-skeleton-scope-and-data-flow.md)** (scope: 7 pages, blog removed).
- **Date**: 2026-10-10
- **Decision owner**: human, through the design track (brief `docs/design/briefs/0001-magazine.md`, changeset `docs/design/changes/0001-magazine/`).

## 1. Context

The owner wants a content-heavy page to test the design track end to end (Lovable design → approved changeset → Nuxt). ADR 0004 removed the blog to keep the skeleton small. The magazine brings it back as the reference for a dated, filterable collection, delivered **page by page**: the list first, the article page with its own design later.

## 2. Decisions

- **Route**: `magazine` (`/magazin`, `/en/magazine`) in `ROUTE_PATHS`, with the page document `magazinePage`. Menu: offers, magazine, FAQ, contact.
- **Collections**: `post` (title, slug, excerpt, cover, category, author, `publishedAt`, body, SEO), `category` (title, slug, `order`) and `author` (name, role, bio, photo). One document per language, linked as translations like offers.
- **Body**: `articleBody` = the site's rich text plus four blocks (coach tip, pull quote, image with caption, YouTube video). The video loads only after a click (privacy); the article page renders it.
- **Filter and pages in the URL**: `?category=<slug>` and `?page=<n>` (page 1 has none), the same in every language: a category's slug is an identifier shared by its language versions, because @nuxtjs/i18n copies the query into hreflang and the language switcher unchanged. Both parameters are part of the canonical URL (`strictSeo.canonicalQueries`); an unknown category or page answers 404. Filters are links rather than buttons, so every view can be crawled and shared. "All", page 1 shows the 3 newest articles, then 9 per page.
- **No article route yet**: cards link to `/magazin/<slug>`, which answers 404 until the article page's design is approved. Its route (`magazine-slug`), sitemap entries and `useSetI18nParams` come with it.
- **Reading time** is computed from the body text (200 words per minute); dates use `formatShortDate` in the business time zone.

## 3. Consequences

- A category's slug is one value for every language: the Studio checks it against the category's translations and copies it to a new one.
- `?page=n` is copied to the other language as it is: when that language has fewer articles, its page n answers 404 (accepted: both languages are written together, and the switcher still reaches the magazine).
- The skeleton has 8 pages (9 with the article page). The blog recipe in ARCHITECTURE.md is now an example in the code.
- Structured data stays as in ADR 0004 (no `Article` JSON-LD until a later decision).
