# Section: magazine-closing (0001-magazine)

## Purpose

Dark closing band with the page's primary call to action: a free trial.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                                                            |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| 375   | column, gap 28px: title and text, then the button full width; padding 48px top and bottom                         |
| 768   | row: text block left, button right (auto width, does not shrink), vertically centred, space between; padding 64px |
| 1440  | as 768, within the page container                                                                                 |

## Components (Nuxt UI first)

`UPageSection` / `UPageCTA` restyled, background `surface-strong`, text
`surface-strong-foreground`.

- Title (h2): display font, weight 900, uppercase, line height 1, breaks long words; 36px (375),
  48px (from 768).
- Text: 16px below the title, sans 14px / 24px (375), 16px (from 768), `surface-muted`.
- Button (`UButton`, size lg): height 48px, padding 0 28px, radius 6px, sans 16px bold, `primary`
  background, `primary-foreground` text, small shadow; arrow-right icon (16px) after the label,
  gap 8px. Hover: lifts 2px, background `primary` at 90%, shadow `--shadow-accent`.
  Focus-visible: ring 2px `ring`, offset 2px.

## Tokens

`surface-strong`, `surface-strong-foreground`, `surface-muted`, `primary`, `primary-foreground`,
`ring`, `--shadow-accent`.

## Content (Sanity field or i18n key) and seed values

| Element | Field / key                 | Limit | DE (seed)                                                         | EN (seed)                                        |
| ------- | --------------------------- | ----- | ----------------------------------------------------------------- | ------------------------------------------------ |
| Title   | `magazinePage.closingTitle` | 50    | Bereit für den ersten Schritt?                                    | Ready for the first step?                        |
| Text    | `magazinePage.closingText`  | 140   | Probier es aus: Das erste Training mit einem Coach ist kostenlos. | Try it: your first session with a coach is free. |
| Button  | `magazinePage.cta` (cta)    | —     | Kostenloses Probetraining → contact page                          | Request a free trial → contact page              |

The section is hidden when title and button are both empty; the button only when incomplete
(ADR 0004: buttons are optional).

## States

Button hover and focus-visible.

## Motion

Section `reveal`; button hover transition; off under reduced motion.

## Accessibility

h2; the button is a link to the contact page.

## Open questions

None.
