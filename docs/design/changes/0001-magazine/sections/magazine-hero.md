# Section: magazine-hero (0001-magazine)

## Purpose

Dark opening band of the magazine: kicker, the page's h1, a short intro.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                                 |
| ----- | -------------------------------------------------------------------------------------- |
| 375   | min height 280px, content vertically centred, padding 28px top and bottom, gutter 16px |
| 768   | min height 280px, padding 40px top and bottom, gutter 24px                             |
| 1440  | min height 360px, padding 56px top and bottom; content width max 80rem, gutter 32px    |

Between widths: gutter 16px below 640px, 24px from 640px, 32px from 1024px (the page container,
max 80rem, centred). Bottom border 1px `border`.

## Components (Nuxt UI first)

`UPageSection` (or a plain `<section>` in the page container) with a dark background.

- Background `surface-strong`, text `surface-strong-foreground`.
- Kicker: sans, 12px, bold, uppercase, colour `primary`.
- Title (h1): display font, weight 900, uppercase, line height 0.95, 16px below the kicker, max
  width 64rem, breaks long words. Size 44px (375), 60px (768), 80px (1440, from 1280px).
- Intro: sans, 14px / 24px (375), 18px / 32px (from 768), colour `surface-muted`, 20px below the
  title, max width 42rem.

## Tokens

`surface-strong`, `surface-strong-foreground`, `surface-muted`, `primary`, `border`.

## Content (Sanity field or i18n key) and seed values

| Element | Field / key           | Limit | DE (seed)                                                                       | EN (seed)                                                                  |
| ------- | --------------------- | ----- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Kicker  | `magazinePage.kicker` | 30    | Magazin                                                                         | Magazine                                                                   |
| Title   | `magazinePage.title`  | 60    | Wissen, das dich weiterbringt.                                                  | Know-how that moves you forward.                                           |
| Intro   | `magazinePage.intro`  | 160   | Training, Ernährung und Mindset: Artikel von unseren Coaches, fürs echte Leben. | Training, nutrition and mindset: articles from our coaches, for real life. |

Overflow with longer real content: the title wraps (German "WEITERBRINGT." fits 375 at 44px);
the band grows in height.

## States

None.

## Motion

`reveal` on the content (700ms ease-out, 18px rise), off under reduced motion.

## Accessibility

The only h1 of the page. Contrast: `surface-muted` on `surface-strong` (check ≥ 4.5:1 for 14px).

## Open questions

None.
