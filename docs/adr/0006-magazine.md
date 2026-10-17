# ADR 0006: Magazine

- **Status**: Accepted (2026-10-10, last updated 2026-10-17 to match the code). Designed through the design track (briefs `0001-magazine`, `0002-article`).

## Decision

- **Routes**: the list `magazine` (`/magazin`, `/en/magazine`) and the article `magazine-slug` (`/magazin/<slug>`, `/en/magazine/<slug>`).
- **Documents**: `magazinePage` (one per language), `post`, `category` and `author` (one per language, linked as translations).
- **Article text** (`articleBody`): the site's text blocks plus a coach tip, a pull quote, a picture with a caption and a YouTube video that loads only after a click or with consent to external media.
- **Filter and pages in the URL**: `?category=<slug>&page=<n>` (page 1 has no `page`). A category's slug is the same in every language: @nuxtjs/i18n copies the query into hreflang and the language switcher unchanged. Both are part of the canonical URL; an unknown category or page answers 404. Filters are links, so every view is crawlable.
- **Pagination on the server**: the CMS sends only the current page's cards (`[$start...$end]`) and the total. "All", page 1 shows the 3 newest articles, then 9 per page (`utils/pagination`).
- **Reading time**: the CMS counts the words of the text (`wordCountField`), 200 words per minute.
- **"Keep reading"**: 3 other articles, the same category first, sorted by the CMS.

## Consequences

- `?page=n` is copied to the other language as is: when that language has fewer articles, its page n answers 404 (accepted).
- Numbered pages make Sanity skip `start` documents per request: fine up to a few thousand articles. Beyond that, paginate by date (`publishedAt < $last`) instead.
