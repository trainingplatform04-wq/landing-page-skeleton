# Section: article-related (0002-article)

## Purpose

"Keep reading": the next article, so readers stay on the site.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 375   | border top 1px; padding 40px top, 56px bottom; page container; cards in one row, horizontal scroll with snap (start), each card 85% wide, gap 20px, 12px padding below the row |
| 768   | padding 56px top, 80px bottom; grid 2 columns, gap 24px; the third card hidden                                                                                                 |
| 1440  | grid 3 columns, gap 24px; three cards                                                                                                                                          |

## Components (Nuxt UI first)

- Title (h2): display font 900 uppercase, line height 1; 36px (375), 48px (768+); 28px below.
- Cards: the magazine grid's `PostCard`, unchanged (image 16:10, badge, title, excerpt, meta),
  with its hover.

## Tokens

`border-default`, plus the card's tokens (changeset 0001).

## Content (Sanity field or i18n key) and seed values

| Element | Field / key                                                                                                                        | DE (seed)                                                                                                                             | EN (seed)                                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Title   | `article.related`                                                                                                                  | Weiterlesen                                                                                                                           | Keep reading                                                                                                             |
| Cards   | query: other posts of the same language, same category first (newest first), then the newest others; max 3; never the current post | for the protein article: Was du vor und nach dem Training essen solltest, Krafttraining ab 40, Dranbleiben, wenn die Motivation fehlt | What to eat before and after training, Strength training after 40: how to start safely, Keep going when motivation fades |

## States

Card hover (as the grid). Hidden when there is no other article.

## Motion

Card hover as the magazine grid; none under reduced motion.

## Accessibility

h2; cards are links with the article title as their name.

## Open questions

None.
