# Section: about-closing (0003-about)

## Purpose

The page's primary call to action: a free trial.

## What changed (changes only)

New section, identical to `magazine-closing` (changeset 0001): same layout, typography, tokens,
states and motion. Only the `data-section` name and the copy differ.

## Layout (facts: measurements, no code)

As `docs/design/changes/0001-magazine/sections/magazine-closing.md`.

## Components (Nuxt UI first)

Reuse the component behind `magazine-closing` (`MagazineClosing`) with `section="about-closing"`
and the page's own title, text and button; no copy of the markup.

## Tokens

As `magazine-closing`.

## Content (Sanity field or i18n key) and seed values

| Element | Field / key              | Limit | DE (seed)                                                                         | EN (seed)                                                        |
| ------- | ------------------------ | ----- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Title   | `aboutPage.closingTitle` | 50    | Bereit für die erste Einheit?                                                     | Ready for your first session?                                    |
| Text    | `aboutPage.closingText`  | 140   | Schreiben Sie mir, und wir finden einen Termin für Ihr kostenloses Probetraining. | Write to me and we will find a date for your free trial session. |
| Button  | `aboutPage.cta` (cta)    | —     | Probetraining anfragen → contact page                                             | Request a free trial → contact page                              |

The section is hidden when title and button are both empty; the button only when incomplete
(ADR 0004).

## States

As `magazine-closing`.

## Motion

As `magazine-closing`.

## Accessibility

h2; the button is a link to the contact page.

## Open questions

None.
