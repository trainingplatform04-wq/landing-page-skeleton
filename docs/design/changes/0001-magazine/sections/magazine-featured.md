# Section: magazine-featured (0001-magazine)

## Purpose

The three newest articles, editorial layout: one large card and two compact cards.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| 375   | one column, gap 20px: large card, then the two compact cards as rows (image left, text right)                         |
| 768   | large card full width; below it the two compact cards side by side (2 columns, gap 20px), image on top                |
| 1440  | two columns 2fr / 1fr, gap 24px: large card left; right column the two compact cards stacked (gap 24px), image on top |

Padding top 40px (375), 56px (768), 64px (1440); no bottom padding (the grid section follows).
Page container as in magazine-hero. The 2fr / 1fr split starts at 1280px.

## Components (Nuxt UI first)

`UBlogPost` (or a card component of ours) in three variants: **large**, **compact**, **grid**
(the grid variant is specified in magazine-grid; this section uses large and compact).

Common card:

- Whole card is one link to the article (`/magazin/<slug>`, `/en/magazine/<slug>`), an
  `<article>` filling the cell height.
- Box: border 1px `border`, radius 8px, background `card`, text `card-foreground`, overflow
  hidden, content in a column.
- Image: ratio 16:10, cover, focal point at 35% from the top.
- Category badge: background `accent`, text `accent-foreground`, 10px, bold, uppercase, padding
  4px × 10px, radius 4px, fits its content.
- Title (h2): display font, weight 900, uppercase, line height 1.05, breaks long words.
- Meta row at the bottom of the card: author photo (round, cover, focal point 35%), then
  "**Name** · date · reading time" in `muted-foreground` (name in `foreground`, semibold; reading
  time never wraps).

**Large**: body padding 24px (375), 32px (768), 36px (1440). Title 12px below the badge, 36px
(375), 48px (from 768). Excerpt 12px below the title, 14px / 24px, `muted-foreground`, not
clamped. Meta row: 20px above, gap 12px, 12px / 20px text, photo 32px.

**Compact**: below 768 a row: image square 96px with 12px margin and radius 4px, text padding
12px top/bottom/right, 0 left; from 768 a column: image full width 16:10, no margin, no radius,
body padding 20px. Title 8px below the badge, 24px (375), 28px (from 768). No excerpt. Meta row:
12px above, gap 8px, 10px / 20px text, photo 24px.

## Tokens

`card`, `card-foreground`, `border`, `accent`, `accent-foreground`, `muted-foreground`,
`foreground`, `primary`, `ring`, `background`.

## Content (Sanity field or i18n key) and seed values

| Element            | Field / key                                                        | Limit   | DE (seed)                   | EN (seed)          |
| ------------------ | ------------------------------------------------------------------ | ------- | --------------------------- | ------------------ |
| The 3 newest posts | `post` ordered by `publishedAt` desc, first 3                      | —       | posts 1–3                   | posts 1–3          |
| Image, alt         | `post.cover` (accessibleImage)                                     | —       | stock photo (seed)          | stock photo (seed) |
| Category           | `post.category->title`                                             | 20      | see `content/magazine.json` | idem               |
| Title, excerpt     | `post.title`, `post.excerpt`                                       | 80, 140 | idem                        | idem               |
| Author name, photo | `post.author->name`, `post.author->photo`                          | —       | idem                        | idem               |
| Date               | `post.publishedAt`, Europe/Berlin, "28 Sep 2026" / "28. Sep. 2026" | —       | computed                    | computed           |
| Reading time       | computed from `post.body`, i18n `magazine.readingTime`             | —       | "{n} Min. Lesezeit"         | "{n} min read"     |

Overflow with longer real content: titles wrap; the large card's excerpt is not clamped, the
compact cards have none; cards in one row stretch to the same height.

## States

- Hidden when a category is selected or on page 2 and later (only "All", page 1).
- Hidden when fewer than 1 post exists (the grid shows the empty state).
- Card hover: lifts 2px (300ms), image zooms to 1.03 (300ms), title turns `primary` (300ms).
- Card focus-visible: ring 2px `ring`, offset 2px `background`.

## Motion

Section `reveal`; hover transitions 300ms; all off under reduced motion.

## Accessibility

One link per card (the whole card); title is an h2; image alt from Sanity; date in a `<time>`
with an ISO `datetime`; the separators " · " hidden from screen readers.

## Open questions

None.
