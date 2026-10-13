# Section: article-takeaways (0002-article)

## Purpose

"At a glance": the article's value in 10 seconds for readers who skim.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                       |
| ----- | ---------------------------------------------------------------------------- |
| 375   | card in the text column (full width minus 32px), padding 24px; 32px below it |
| 768   | card in the text column (max 760px), padding 32px; 48px below it             |
| 1440  | as 768                                                                       |

## Components (Nuxt UI first)

`UCard` restyled (or a plain `div`): radius 8px, border 1px `primary` at 15% opacity,
background `primary` at 5% opacity, no shadow.

- Title (h2): sans 16px bold, list-checks icon 20px `primary` before it, gap 8px.
- List: 20px below the title, items 12px apart; each item: check icon 16px `primary` (4px from
  the top, never shrinks), gap 12px, text 15px / 24px `text-default`.

## Tokens

`primary`, `text-default`.

## Content (Sanity field or i18n key) and seed values

| Element | Field / key                                   | Limit           | DE (seed)              | EN (seed)              |
| ------- | --------------------------------------------- | --------------- | ---------------------- | ---------------------- |
| Title   | `article.takeaways`                           | —               | Auf einen Blick        | At a glance            |
| Points  | **new** `post.keyTakeaways` (array of string) | 0–5, each ≤ 140 | `content/article.json` | `content/article.json` |

## States

Hidden when `keyTakeaways` is empty (the five other seeded articles).

## Motion

None.

## Accessibility

h2 + `ul`; the icons are decorative (hidden from screen readers).

## Open questions

None.
