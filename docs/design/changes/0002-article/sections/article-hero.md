# Section: article-hero (0002-article)

## Purpose

Tells the reader what the article is and who wrote it, and shows the cover: the page's largest
image.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

Text block first, cover below (the text comes first in the reading order).

| Width | Layout                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 375   | padding 32px top, 32px bottom; text column full width minus 16px each side; cover 32px below the text, edge to edge, no radius              |
| 768   | padding 48px top and bottom; text column max 760px, centred (24px side gutters); cover 40px below, content width (24px gutters), radius 8px |
| 1440  | padding 64px top, 48px bottom; text column 760px centred; cover 48px below, 1120px wide centred, radius 8px                                 |

Between widths: the text column is `min(760px, 100% - gutters)`; the cover keeps 16:9.

## Components (Nuxt UI first)

- Breadcrumb (`UBreadcrumb`): "Magazine" → magazine page, then the category → magazine page
  filtered by that category; separator chevron-right 12px; 14px, `text-muted`, links underlined
  (offset 4px), hover `primary`. 28px below it: the badge.
- Category badge (`UBadge`): 12px bold uppercase, padding 4px 12px, radius 2px, background
  `bg-elevated`, text `text-highlighted`.
- Title (h1, the only one): display font, weight 900, uppercase, line height 1.05, breaks long
  words; 32px (375), 40px (768), 56px (1440); 16px below the badge.
- Lead: 20px / 32px, `text-muted`, 20px below the title.
- Author row (`UUser`), 24px below the lead: photo 40px round (object position 50% 35%), gap
  12px; name 14px bold `text-highlighted`; second line 12px / 20px `text-muted`: role · date ·
  reading time (reading time never wraps).
- Cover (`NuxtImg`): 16:9, object-fit cover, position 50% 35%, `priority` (fetchpriority high,
  preloaded, not lazy). Author photo lazy.

## Tokens

`primary`, `text-muted`, `text-highlighted`, `bg-elevated`, `ring`.

## Content (Sanity field or i18n key) and seed values

| Element         | Field / key                                      | Limit | DE (seed)                                  | EN (seed)                                                      |
| --------------- | ------------------------------------------------ | ----- | ------------------------------------------ | -------------------------------------------------------------- |
| Breadcrumb root | `article.breadcrumb`                             | —     | Magazin                                    | Magazine                                                       |
| Category        | `post.category->title`                           | 30    | Ernährung                                  | Nutrition                                                      |
| Title           | `post.title`                                     | 90    | Protein ohne Pulver: 5 einfache Mahlzeiten | Protein without powder: 5 simple meals                         |
| Lead            | `post.excerpt`                                   | 160   | (seed, unchanged)                          | Enough protein without shakes. Five meals ready in 15 minutes. |
| Author          | `post.author->{name, role, photo}`               | —     | Jonas Weber, Ernährungscoach               | Jonas Weber, Nutrition coach                                   |
| Date            | `post.publishedAt` (business time zone)          | —     | 21. Sept. 2026                             | 21 Sep 2026                                                    |
| Reading time    | computed from `post.body`; `article.readingTime` | —     | 2 Min. Lesezeit                            | 2 min read                                                     |
| Cover           | `post.cover` (accessibleImage)                   | —     | (seed, unchanged)                          | alt: A bowl with salmon, eggs and vegetables                   |

Overflow: long German words in the title hyphenate (`hyphens: auto`); the breadcrumb wraps.

## States

Link hover (`primary`) and focus-visible (2px `ring`, offset 4px). No category: breadcrumb and
badge are hidden. No author: the author row is hidden. No cover: the cover block is hidden.

## Motion

Text block `reveal` on entry (as the magazine); none for the cover; off under reduced motion.

## Accessibility

One h1. Breadcrumb is a `nav` labelled "Magazine"; separators are hidden from screen readers;
the date is a `<time datetime>`.

## Open questions

None.
