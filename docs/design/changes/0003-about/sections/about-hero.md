# Section: about-hero (0003-about)

## Purpose

Introduces the coach: one large picture, a short label, the page's h1 and a short description.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 375   | page background; padding 32px top, 56px bottom. Picture edge to edge, 4:3, no radius. 32px below it: text block centred                                   |
| 768   | padding 48px top, 80px bottom. Picture 16:9, width = viewport − 48px (24px each side), max 1120px, centred, radius 8px. 48px below it: text block centred |
| 1440  | as 768, picture 21:9 (from 1280 up), width 1120px, centred, radius 8px                                                                                    |

Between widths: the picture switches 4:3 → 16:9 at 768 and 16:9 → 21:9 at 1280, always full
width of its box, `object-fit: cover` (the subject sits near the centre). Text block is inside
the page container, centred.

## Components (Nuxt UI first)

`UPageSection` (or a plain section) with an image and a `UContainer`; no custom component needed
beyond the picture.

- Picture: first image of the page, loads first (`priority`), explicit width and height
  (1680 × 720) so nothing shifts; `sizes` per width above.
- Label: sans 12px, weight 700, uppercase, `primary`.
- h1 (the page's only one): display font, weight 900, uppercase, line height 1.05, breaks long
  words; 32px (375), 40px (768), 56px (from 1280); 16px below the label.
- Description: one paragraph, sans 20px / 32px, `text-muted`, max width 640px, centred; 20px
  below the h1.
- No buttons, no cards.

## Tokens

`primary`, `text-muted`, page background, display font (existing).

## Content (Sanity field or i18n key) and seed values

| Element     | Field / key             | Limit | DE (seed)                                                                                                                                                                                                                                                        | EN (seed)                                                                                                                                                                                                                             |
| ----------- | ----------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label       | `aboutPage.label`       | 30    | Über mich                                                                                                                                                                                                                                                        | About me                                                                                                                                                                                                                              |
| Title (h1)  | `aboutPage.title`       | 50    | Hallo, ich bin Ihre Trainerin                                                                                                                                                                                                                                    | Hi, I'm your coach                                                                                                                                                                                                                    |
| Description | `aboutPage.description` | 300   | Seit 2010 helfe ich Menschen, stärker zu werden und sich schmerzfrei zu bewegen. In meinem Studio in Berlin-Mitte dreht sich jede Einheit um Sie: Ihr Ziel, Ihr Tempo, Ihr Rücken. Keine großen Geräte, kein Druck, sondern Training, das zu Ihrem Alltag passt. | Since 2010 I have helped people get stronger and move without pain. In my studio in Berlin-Mitte every session is built around you: your goal, your pace, your back. No big machines, no pressure, just training that fits your life. |
| Picture     | `aboutPage.image`       | —     | generated demo picture (DEMO)                                                                                                                                                                                                                                    | same                                                                                                                                                                                                                                  |
| Picture alt | `aboutPage.imageAlt`    | 125   | Trainerin im Gespräch mit einer Kundin nach dem Training                                                                                                                                                                                                         | Coach talking to a client after a training session                                                                                                                                                                                    |

Overflow with longer real content: the title wraps and hyphenates (`hyphens: auto`) so long
German words never overflow at 375; the description wraps within 640px.

## States

None (static). The picture is optional (ADR 0004: every field is valid empty): without it the text block
shows alone, so the page always keeps its h1.

## Motion

None.

## Accessibility

One h1; the picture's alt text comes from Sanity; text contrast of `text-muted` on the page
background meets AA.

## Open questions

None.
