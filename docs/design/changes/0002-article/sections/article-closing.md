# Section: article-closing (0002-article)

## Purpose

The page's primary call to action: a free trial.

## What changed (changes only)

New section, identical to `magazine-closing` (changeset 0001): same layout, typography, tokens,
states and motion. Only the `data-section` name differs, so the design gate compares it on the
article page.

## Layout (facts: measurements, no code)

As `docs/design/changes/0001-magazine/sections/magazine-closing.md`.

## Components (Nuxt UI first)

Reuse the component behind `magazine-closing` with the `data-section` name as a prop; no copy.

## Tokens

As `magazine-closing`.

## Content (Sanity field or i18n key) and seed values

| Element | Field / key                                 | DE (seed)                                                         | EN (seed)                                        |
| ------- | ------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------ |
| Title   | `magazinePage.closingTitle` (of the locale) | Bereit für den ersten Schritt?                                    | Ready for the first step?                        |
| Text    | `magazinePage.closingText`                  | Probier es aus: Das erste Training mit einem Coach ist kostenlos. | Try it: your first session with a coach is free. |
| Button  | `magazinePage.cta`                          | Kostenloses Probetraining → contact page                          | Request a free trial → contact page              |

No new field: the article page reads the closing band of the magazine page of its language.

## States

As `magazine-closing`.

## Motion

As `magazine-closing`.

## Accessibility

h2; the button is a link to the contact page.

## Open questions

None.
