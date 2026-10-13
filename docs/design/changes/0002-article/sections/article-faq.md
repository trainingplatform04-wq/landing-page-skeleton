# Section: article-faq (0002-article)

## Purpose

Answers the reader's follow-up questions on the article; also feeds the `FAQPage` structured
data for search.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                   |
| ----- | -------------------------------------------------------- |
| 375   | text column (full width minus 32px); padding bottom 48px |
| 768   | text column (max 760px, centred); padding bottom 64px    |
| 1440  | as 768                                                   |

## Components (Nuxt UI first)

Accordion with the `UAccordion` look, built on native `<details>` / `<summary>` so it works
without JavaScript (performance rule: frontend confirms the look matches).

- Title (h2): display font 900 uppercase, line height 1.25, breaks long words; 32px (375), 36px
  (768+); 28px below it.
- List: border top 1px `border-default`; each row has a border bottom 1px `border-default`.
- Question row: sans 18px / 28px semibold, padding 20px 0, gap 20px, chevron-down 16px on the
  right, rotates 180° when open.
- Answer: 16px / 28px `text-muted`, padding bottom 20px, padding right 24px.
- All closed at first; several can be open at once.

## Tokens

`border-default`, `text-default`, `text-muted`, `ring`.

## Content (Sanity field or i18n key) and seed values

| Element   | Field / key                                             | Limit                             | DE (seed)              | EN (seed)                  |
| --------- | ------------------------------------------------------- | --------------------------------- | ---------------------- | -------------------------- |
| Title     | `article.faq`                                           | —                                 | Häufige Fragen         | Frequently asked questions |
| Questions | **new** `post.faq[]` `{question: string, answer: text}` | 0–8; question ≤ 120, answer ≤ 600 | `content/article.json` | `content/article.json`     |

## States

Row closed (default), open, hover (question underlined), focus-visible (2px `ring`, offset
4px). Hidden when `faq` is empty.

## Motion

Open and close 200ms ease-out (height, chevron rotation); none under reduced motion.

## Accessibility

h2; each question is a `summary` (keyboard and screen readers get open/closed for free).
Answers are plain text (no links), on purpose.

## Open questions

None.
