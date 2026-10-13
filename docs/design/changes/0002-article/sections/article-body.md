# Section: article-body (0002-article)

## Purpose

The article itself, with a reading progress bar, a table of contents and a share row.

## What changed (changes only)

New section.

## Layout (facts: measurements, no code)

| Width | Layout                                                                                                                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 375   | one column, full width minus 32px; table of contents as a closed accordion above the text (border top and bottom, 20px below it); padding bottom 40px                                        |
| 768   | one column, max 760px, 24px gutters; same accordion; padding bottom 56px                                                                                                                     |
| 1440  | two columns inside 1120px centred: table of contents 240px, gap 80px, text column (max 68 characters); the table of contents is sticky 96px from the top. Without H2s: one column, max 760px |

## Components (Nuxt UI first)

- **Progress bar**: 3px high, full width, fixed right under the header (its top follows the
  header's height), above the page content (z 50). Fill `primary`, growing from the left: 0% when
  the top of the text reaches the header, 100% when its end reaches the bottom of the window
  (the text only, not the whole page). `role="progressbar"`, label `article.progress`, value 0–100.
- **Table of contents**: title "In this article" (sans 14px bold, 20px below it at 1440); one
  link per H2: 14px / 24px, padding 8px 0 8px 16px, 2px left border. Default: border
  `border-default`, `text-muted`; current (the last H2 whose top is above 120px from the top of
  the window): border and text `primary`, bold; hover `primary`. Mobile accordion trigger:
  "In this article", 16px bold (Nuxt UI `UAccordion` look, see article-faq).
- **Text**: 18px / 1.7, `text-default`; first paragraph no top margin; paragraphs 24px apart.
  - H2: display font, 900, uppercase, line height 1.1; 28px (375), 32px (768), 36px (1440);
    40px above, 20px below; anchor offset 104px (scroll-margin).
  - H3: display font, 900, uppercase; 24px (375), 28px (768); 32px above, 16px below.
  - Lists: 24px left padding, items 12px apart, markers `primary` bold.
  - Links: `primary`, underlined (offset 4px).
- **Coach tip**: margin 32px 0; left border 4px `primary`; background `bg-elevated`; padding
  20px (375), 24px (768+); label row 14px bold with lightbulb icon 20px `primary`, gap 8px,
  8px below; text 16px / 28px.
- **Pull quote**: margin 36px 0; border top and bottom 1px `border-default`, padding 28px 0; a
  large quotation mark (display font, 72px, `primary`, 40px box); quote display font 900
  uppercase, line height 1.25, 26px (375) / 32px (768+), 12px below the mark; attribution 14px
  `text-muted`, 16px below.
- **Figure**: margin 28px 0; image 3:2, full text width, radius 8px, lazy; caption 14px
  `text-muted`, 12px below.
- **Video**: margin 32px 0; 16:9, radius 8px, background `bg-inverted`, text `text-inverted`.
  Before the click: centred column, gap 8px (375) / 16px (768+): play icon 28px / 40px
  `primary`; title display font 900 uppercase 20px / 28px, max 384px; line "Playing sends data
  to YouTube." 12px / 14px muted; `UButton` size sm with play icon, "Load video". After the
  click: the YouTube player (youtube-nocookie.com) fills the box. Nothing from YouTube loads
  before the click.
- **Share row**: 40px below the text; bottom border 1px `border-default`, padding bottom 32px;
  gap 12px. "Share this article" 14px bold (its own line at 375, left of the buttons from 768,
  buttons pushed right). `UButton` outline, no shadow: copy icon + "Copy link"; share icon +
  "Share", shown only where the browser can share natively. Toast (`UToast`): bottom centre,
  24px from the bottom, max width viewport minus 32px, check icon `primary`, text 14px, close
  button "Dismiss notification"; disappears after 4s. Copy failure and share failure show their
  own message in the same toast; a cancelled native share shows nothing.

## Tokens

`primary`, `text-default`, `text-muted`, `border-default`, `bg-elevated`, `bg-inverted`,
`text-inverted`, `ring`.

## Content (Sanity field or i18n key) and seed values

| Element           | Field / key                                                                                                                                                                                                                                         | DE (seed)                     | EN (seed)                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------- |
| Text and blocks   | `post.body` (articleBody: block, coachTip, pullQuote, figure, video)                                                                                                                                                                                | seed + `content/article.json` | seed + `content/article.json` |
| Table of contents | the body's H2s (derived)                                                                                                                                                                                                                            | —                             | —                             |
| Labels            | `article.toc`, `article.progress`, `article.coachTip`, `article.videoConsent`, `article.loadVideo`, `article.shareLabel`, `article.copyLink`, `article.share`, `article.linkCopied`, `article.copyFailed`, `article.shareFailed`, `article.dismiss` | `content/article.json`        | `content/article.json`        |

Overflow: long German H2s wrap and hyphenate; table of contents links wrap.

## States

- Table of contents: current item; mobile accordion closed (default) and open.
- Video: poster (default) and player (after the click).
- Share: toast "Link copied", copy failed, share failed; "Share" button absent where native
  sharing is not supported.
- No H2 in the body: no table of contents, one column.
- Link hover and focus-visible (2px `ring`, offset 4px).

## Motion

Accordion open and close 200ms ease-out (height, chevron rotation). Toast enters from 16px below
with opacity 0 → 1 in 200ms ease-out. Table of contents colour change 200ms. Under reduced
motion: no transition or animation; the progress bar still follows the scroll.

## Accessibility

Table of contents is a `nav` labelled "In this article"; the current link has
`aria-current="location"`. Toast has `role="status"`. Icons decorative. The video iframe has the
video title as its title. H2s keep their ids for anchor links.

## Open questions

None.
