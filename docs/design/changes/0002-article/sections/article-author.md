# Section: article-author (0002-article)

## Purpose

Proof of expertise: the named coach behind the article.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                                                      |
| ----- | ----------------------------------------------------------------------------------------------------------- |
| 375   | card in the text column; column, centred, gap 24px: photo above the text; padding 24px; 56px below the card |
| 768   | row, top-aligned, text left-aligned, gap 24px; padding 32px; 80px below the card                            |
| 1440  | as 768                                                                                                      |

## Components (Nuxt UI first)

`UCard` (border 1px `border-default`, radius 8px, no shadow).

- Photo: 96px round, object position 50% 35%, never shrinks, lazy.
- "Written by": 12px semibold `text-muted`.
- Name (h2): display font 900 uppercase, 32px, line height 1, 8px below.
- Role: 14px semibold `primary`, 8px below.
- Bio: 14px / 24px `text-muted`, 16px below.
- Link "More from <first name>" with arrow-right 16px, 14px bold, underlined (offset 4px), hover
  `primary`, 20px below, to the magazine page.

## Tokens

`border-default`, `primary`, `text-muted`, `ring`.

## Content (Sanity field or i18n key) and seed values

| Element | Field / key                            | DE (seed)                                                                                     | EN (seed)                                                                                      |
| ------- | -------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Label   | `article.writtenBy`                    | Geschrieben von                                                                               | Written by                                                                                     |
| Name    | `post.author->name`                    | Jonas Weber                                                                                   | Jonas Weber                                                                                    |
| Role    | `post.author->role`                    | Ernährungscoach                                                                               | Nutrition coach                                                                                |
| Bio     | `post.author->bio`                     | Jonas ist Ökotrophologe und glaubt an Essen, das schmeckt und in einen vollen Kalender passt. | Jonas is a nutrition scientist who believes in food that tastes good and fits a busy calendar. |
| Photo   | `post.author->photo`                   | (seed, unchanged)                                                                             | (seed, unchanged)                                                                              |
| Link    | `article.moreFrom` with the first name | Mehr von Jonas                                                                                | More from Jonas                                                                                |

## States

Link hover and focus-visible. Hidden when the article has no author. No bio or no role: that
line is hidden.

## Motion

None.

## Accessibility

The name is an h2 (the section's heading); the photo's alt is the author's name.

## Open questions

None.
