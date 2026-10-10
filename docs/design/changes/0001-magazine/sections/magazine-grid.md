# Section: magazine-grid (0001-magazine)

## Purpose

Category tabs, the grid of the other articles, pagination and the empty state.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                         |
| ----- | ------------------------------------------------------------------------------ |
| 375   | tabs on one line, scrolling horizontally (no visible scrollbar); grid 1 column |
| 768   | grid 2 columns                                                                 |
| 1440  | grid 3 columns (from 1280px)                                                   |

Padding 40px top and bottom (375), 56px (768), 64px (1440). Page container as in magazine-hero.
Tabs: gap 8px, 8px padding below, 32px space before the grid. Grid gap 24px. Pagination 40px
below the grid.

## Components (Nuxt UI first)

- **Tabs**: "All" + one per category, as buttons (`UButton` group or `UTabs` restyled), role
  tablist / tab, controlling the grid. Each: height 40px, padding 0 20px, fully round, sans 14px
  bold, no shadow, does not shrink. Active: solid `primary` background, `primary-foreground`
  text. Inactive: 1px `input` border, `background` fill; hover `accent` background and
  `accent-foreground` text. No lift on hover.
- **Grid card** (variant **grid**, common card rules in magazine-featured): body padding 24px,
  title 28px, 12px below the badge; excerpt 12px below, 14px / 24px, clamped to 2 lines; meta
  row 20px above, gap 8px, 11px / 20px, photo 24px.
- **Pagination** (`UPagination` with links, `?page=`): centred, gap 4px (375), 8px (from 768).
  "Previous" / "Next" as text buttons with a chevron (16px), height 36px, padding 0 8px (375),
  0 16px (from 768), hover `accent` background; disabled at the first / last page (50% opacity).
  Page numbers: 36 × 36px, radius 6px, current page solid `primary`, others outlined like the
  inactive tabs; current page has `aria-current="page"`.
- **Empty state**: min height 256px, centred column, gap 12px, 1px `border` lines above and below,
  padding 48px top and bottom; text in `muted-foreground`; a link "All articles" in `primary`
  (underline on hover) that resets the filter.

## Tokens

`primary`, `primary-foreground`, `input`, `background`, `accent`, `accent-foreground`,
`muted-foreground`, `border`, and the card tokens.

## Content (Sanity field or i18n key) and seed values

| Element                    | Field / key                       | Limit | DE (seed)                               | EN (seed)                         |
| -------------------------- | --------------------------------- | ----- | --------------------------------------- | --------------------------------- |
| Tab "All"                  | i18n `magazine.all`               | —     | Alle                                    | All                               |
| Category tabs              | `category.title` (all categories) | 20    | Training · Ernährung · Mindset          | Training · Nutrition · Mindset    |
| Tabs label (screen reader) | i18n `magazine.categoriesLabel`   | —     | Artikelkategorien                       | Article categories                |
| Cards                      | `post` (see magazine-featured)    | —     | posts 4–6 with "All"                    | idem                              |
| Empty text                 | i18n `magazine.empty`             | —     | Noch keine Artikel in dieser Kategorie. | No articles in this category yet. |
| Empty link                 | i18n `magazine.showAll`           | —     | Alle Artikel                            | All articles                      |
| Empty magazine text        | i18n `magazine.none`              | —     | Noch keine Artikel.                     | No articles yet.                  |
| Pagination label           | i18n `magazine.paginationLabel`   | —     | Artikelseiten                           | Article pages                     |

Filter in the URL: `?category=<slug>`, the same in every language; page `?page=<n>`.

## States

- "All", page 1: the posts after the 3 featured ones. Category selected: all posts of that
  category, newest first, featured section hidden. Page 2 and later: featured hidden.
- 9 cards per page; pagination hidden when there is one page.
- Empty: no post in the selected category (or no post at all).
- Tab hover, focus-visible (ring 2px `ring`, offset 2px), active tab; card hover and focus as in
  magazine-featured; pagination current page, disabled previous/next.
- Changing the tab or page keeps the scroll position (no jump to the top).

## Motion

Section `reveal`; tab colour transition 300ms; card hover as in magazine-featured; all off under
reduced motion.

## Accessibility

Tablist with an accessible name; each tab `aria-selected`; the grid is the tabpanel. Pagination
is a `nav` with an accessible name; page buttons named "Page {n}".

## Open questions

- Tabs as links (`?category=`) rather than buttons would be crawlable; the frontend may use
  links styled as tabs (same pixels).
