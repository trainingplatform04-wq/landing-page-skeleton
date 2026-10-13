---
id: '0002'
page: magazine-slug # new page: one article of the magazine
kind: new-page
status: design-approved # draft → approved (gate D1) → built → design-approved (gate D2) | discarded
lastUpdated: '2026-10-13'
---

# Brief 0002: magazine-slug, the article page

## Intent

"I want to have /en/magazine/protein-without-powder page implemented for all articles details. I
am expecting title, big description, image, author, accordion with FAQs and provide more ideas to
make it good and professional." One page template renders every article of the magazine. It
starts from the article sections sketched in brief 0001 (delivered: the list page only) and adds
a key takeaways box, a reading progress bar and an FAQ accordion per article.

## Product (Product Owner)

- **Goal**: the reader finishes the article and requests a **free trial**. Success: contact form
  submissions coming from an article, scroll depth, and clicks on "Keep reading".
- **Audience**: adults in Berlin interested in fitness, arriving from **search** straight on the
  article, **mobile first**.
- **Message**: "Practical know-how from a named coach, readable in five minutes." Proof: the
  author's photo, role and bio; concrete numbers in the text.
- **Calls to action**: closing band "Request a free trial" → contact page (primary). "Keep
  reading" cards → other articles. Breadcrumb and category → the magazine.

---

# Part 1: Design (the only input of the Lovable prompt)

Lovable only designs. This part says **what** to build, in English, with nothing about how our
site works.

## Pages

| Page    | Prototype URL      | Menu                                         |
| ------- | ------------------ | -------------------------------------------- |
| Article | `/magazine/<slug>` | none (reached from the magazine cards, done) |

One template for every article. The design is judged on
`/magazine/protein-without-powder`, which has every element. The five other articles use the
same template with their own title, excerpt, cover, category, author and date; their body is
one paragraph (their excerpt), with no key takeaways and no FAQ, which shows the page without
those sections. An unknown slug shows the existing not-found page.

## Sections (Designer)

| Order | `data-section`    | Purpose                                                             | Status |
| ----- | ----------------- | ------------------------------------------------------------------- | ------ |
| 1     | article-hero      | Breadcrumb, category, title, lead, author row, cover image          | new    |
| 2     | article-takeaways | "At a glance": 3 to 5 key points                                    | new    |
| 3     | article-body      | Progress bar, table of contents, text and content blocks, share row | new    |
| 4     | article-faq       | Questions and answers about the article, as an accordion            | new    |
| 5     | article-author    | Author box                                                          | new    |
| 6     | article-related   | "Keep reading": up to 3 other articles                              | new    |
| 7     | article-closing   | The magazine's dark closing band                                    | new    |

- **article-hero**: light background, one column centred, max 760px of text. Breadcrumb
  "Magazine / Nutrition" (both links). Category badge. Title in display type, uppercase, the
  only h1 (≈ 56px at 1440, 40px at 768, 32px at 375). Lead (the excerpt) at 20px, muted. Author
  row: round photo 40px, name, role · date · reading time ("2 min read"). Cover image 16:9 below
  the text: 1120px wide and rounded at 1440, full content width at 768, edge to edge (no radius)
  at 375. The cover is the page's first image and loads first.
- **article-takeaways**: a card under the hero, same width as the text column: label "At a
  glance" with a small checklist icon, then the points as a checked list. Subtle tinted
  background (primary at low opacity), no shadow. Hidden when the article has no points.
- **article-body**:
  - **Reading progress bar**: 3px, primary colour, fixed directly under the header, full width,
    filling from left to right as the reader scrolls through the article text (not the whole
    page). It stays with reduced motion: it follows the scroll and is not an animation.
  - **1440**: two columns. Left: table of contents (240px, sticky 96px from the top), title "In
    this article", the H2s as links, the current one in primary with a 2px left border. Right:
    text column, max 68 characters wide.
  - **768 and 375**: the table of contents is a closed accordion "In this article" above the
    text; opening it lists the H2s.
  - **Text**: paragraphs 18px / 1.7; H2 in display type (≈ 36px at 1440, 28px at 375), H3;
    bullet and numbered lists; bold, italic; links in primary, underlined.
  - **Coach tip**: accent background, 4px primary left border, lightbulb icon, label "Coach tip".
  - **Pull quote**: large display text (≈ 32px, 26px at 375), a large primary quotation mark,
    attribution below in muted text.
  - **Figure**: image at text width, rounded, with a muted caption below.
  - **Video**: 16:9 dark placeholder with a play icon, the video title, the line "Playing sends
    data to YouTube." and a button "Load video". Clicking replaces it with the YouTube player
    (youtube-nocookie.com, video id given below). Nothing loads before the click.
  - **Share row** at the end of the text, above a thin divider: "Share this article", a "Copy
    link" button (toast "Link copied") and a "Share" button shown only where the browser
    supports native sharing. No third-party scripts.
- **article-faq**: title "Frequently asked questions" in display type, then an accordion: one
  row per question (question in 18px semibold, chevron on the right), the answer below when
  open. All closed at first; several can be open. Bordered rows, no card shadow. Same width as
  the text column. Hidden when the article has no questions.
- **article-author**: bordered card, text column width: round photo 96px, "Written by", name in
  display type, role, bio, link "More from Jonas" → the magazine. 375: photo above the text, centred.
- **article-related**: title "Keep reading". Up to 3 cards, the same card as the magazine grid:
  first the other articles of the same category, newest first, then the newest articles of
  other categories to fill 3. 1440: 3 columns; 768: 2 columns (the third hidden); 375:
  horizontal scroll with snap, cards 85% wide. Hidden when there is no other article.
- **article-closing**: identical to the magazine's closing band.

**States** (each reachable with `?state=` on the protein article):

| `?state=`      | Shows                                                     |
| -------------- | --------------------------------------------------------- |
| `toc-open`     | The mobile table of contents opened                       |
| `faq-open`     | The first FAQ question opened                             |
| `video-loaded` | The video after the click (player in place of the poster) |
| `link-copied`  | The "Link copied" toast                                   |

Also: link hover and focus-visible everywhere, current table of contents item, card hover (as
in the magazine grid).

**Motion**: accordion open and close 200ms ease-out (height and chevron rotation); toast slides
up 200ms; card hover as in the magazine grid. With reduced motion: no transitions, instant
open and close.

**Media**: the existing cover of each article and the existing author portraits. One new image
for the protein article's figure: six protein basics on a light kitchen counter (eggs, a tub of
Greek yoghurt, cottage cheese, a can of lentils, a salmon fillet, a chicken breast), photo, no
text in the image, 3:2.

## Content (English, in full)

Article `/magazine/protein-without-powder`:

- Breadcrumb: "Magazine" → `/magazine`, "Nutrition" → `/magazine?category=nutrition`
- Category: Nutrition
- Title: Protein without powder: 5 simple meals
- Lead: Enough protein without shakes. Five meals ready in 15 minutes.
- Author row: Jonas Weber · Nutrition coach · 21 September 2026 · 2 min read
- Cover alt: A bowl with salmon, eggs and vegetables

At a glance:

1. Most active adults need about 1.6 g of protein per kilo of body weight a day.
2. Spread it over three or four meals of 25 to 40 g each.
3. Five everyday meals get you there in 15 minutes, without shakes.
4. Six basics in your fridge make it easy every day.

Text, in order:

1. Paragraph: "You don't need shakes to eat enough protein. You need a few go-to meals that are
   quick, tasty and easy to repeat."
2. H2: "How much protein you need"
3. Paragraph: "Most active adults do well with 1.6 grams of protein per kilo of body weight a
   day. For someone who weighs 70 kilos, that's about 110 grams, spread over three or four
   meals."
4. Pull quote: "Protein is a habit, not a supplement." — Jonas Weber
5. H2: "Five meals in 15 minutes"
6. Bullet list:
   - Greek yoghurt with oats, berries and walnuts (about 30 g)
   - Scrambled eggs with spinach and wholegrain toast (about 28 g)
   - Lentil salad with feta and cherry tomatoes (about 26 g)
   - Salmon with rice and peas (about 38 g)
   - Wholegrain wrap with chicken, cottage cheese and peppers (about 40 g)
7. Coach tip: "Cook a double portion in the evening. Tomorrow's lunch is then already done."
8. Video: title "Three protein lunches in 15 minutes", YouTube id `M7lc1UVf-VE`
9. H2: "Your shopping list"
10. Figure: the six basics image, caption "Six basics, endless meals."
11. Paragraph: "Keep eggs, Greek yoghurt, cottage cheese, canned lentils, frozen salmon and
    chicken breast at home. With these six basics, a protein-rich meal is never more than 15
    minutes away."

Share row: "Share this article" · "Copy link" · "Share" · toast "Link copied"

Frequently asked questions:

1. **Is protein powder bad for me?** No. Powder is a convenient food, not a must. If your meals
   already give you enough protein, you don't need it.
2. **Can I get enough protein as a vegetarian?** Yes. Combine dairy, eggs, lentils, beans, tofu
   and wholegrains over the day. Two of the five meals above are vegetarian.
3. **Should I eat protein before or after training?** Your daily total matters most. A
   protein-rich meal within a few hours after training is a good habit.
4. **How do I know if I eat enough?** Track one normal day with an app or a food diary. If you
   are well below 1.6 g per kilo, add one of the five meals.

Author box: "Written by" · Jonas Weber · Nutrition coach · "Jonas is a nutrition scientist who
believes in food that tastes good and fits a busy calendar." · "More from Jonas"

Keep reading: "What to eat before and after training" (Nutrition), then "Strength training
after 40: how to start safely" (Training) and "Keep going when motivation fades" (Mindset).

Closing band: "Ready for the first step?" · "Try it: your first session with a coach is free." ·
button "Request a free trial" → contact page.

Video poster: "Playing sends data to YouTube." · "Load video"

Labels: "At a glance" · "In this article" · "Coach tip" · "Frequently asked questions" ·
"Written by" · "Keep reading" · "min read"

## Do not change

- The magazine list page (`/magazine`) and its four sections, the header, the footer, every
  other page, the theme.

---

# Part 2: Implementation (our side, never sent to Lovable)

## Content model (Tech Lead)

| Element                        | Sanity field, i18n key or decoration                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Breadcrumb labels              | "Magazine": i18n `article.breadcrumb`; category: `post.category->title`                                             |
| Category badge                 | `post.category->title`                                                                                              |
| Title (h1)                     | `post.title`                                                                                                        |
| Lead                           | `post.excerpt`                                                                                                      |
| Author row                     | `post.author->{name, role, photo}`, `post.publishedAt` (business time zone), reading time computed from `post.body` |
| Cover                          | `post.cover` (accessibleImage), `priority`                                                                          |
| At a glance points             | **new** `post.keyTakeaways` (array of string, 0–5, each ≤ 140); label i18n `article.takeaways`                      |
| Body and blocks                | `post.body` (articleBody: block, coachTip, pullQuote, figure, video), unchanged                                     |
| Table of contents              | derived from the body's H2s; label i18n `article.toc`                                                               |
| Share row, toast, video labels | i18n `article.share.*`, `article.video.*`                                                                           |
| FAQ                            | **new** `post.faq` (array of `{question: string, answer: text}`, 0–8); title i18n `article.faq`                     |
| Author box                     | `post.author->{name, role, bio, photo}`; "Written by", "More from" i18n                                             |
| Keep reading                   | query: same category first, newest first, then newest others, excluding this post, max 3                            |
| Closing band                   | `magazinePage` of the locale: `closingTitle`, `closingText`, `cta` (reused, no new field)                           |
| SEO                            | `post.seo` with fallbacks (title, excerpt, cover); structured data `Article` (+ `FAQPage` when `faq` is not empty)  |
| Progress bar, icons, borders   | decoration                                                                                                          |

## Other locales (Product Owner)

German (drafted by Claude, to correct at D1), article `/magazin/protein-ohne-pulver`:

- Auf einen Blick:
  1. Die meisten aktiven Erwachsenen brauchen etwa 1,6 g Protein pro Kilo Körpergewicht am Tag.
  2. Verteil es auf drei oder vier Mahlzeiten mit je 25 bis 40 g.
  3. Fünf alltägliche Mahlzeiten bringen dich in 15 Minuten ans Ziel, ganz ohne Shakes.
  4. Sechs Basics im Kühlschrank machen es jeden Tag leicht.
- Zitat: „Protein ist eine Gewohnheit, kein Supplement.“ — Jonas Weber
- Video: „Drei Eiweiß-Mittagessen in 15 Minuten“, YouTube-ID `M7lc1UVf-VE`
- Bild: Alt „Eier, griechischer Joghurt, Hüttenkäse, Linsen, Lachs und Hähnchen auf einer
  Küchenarbeitsplatte", Bildunterschrift „Sechs Basics, unzählige Mahlzeiten.“
- Häufige Fragen:
  1. **Ist Proteinpulver schlecht für mich?** Nein. Pulver ist ein praktisches Lebensmittel,
     kein Muss. Wenn deine Mahlzeiten dir schon genug Eiweiß liefern, brauchst du es nicht.
  2. **Bekomme ich als Vegetarier genug Protein?** Ja. Kombinier über den Tag Milchprodukte,
     Eier, Linsen, Bohnen, Tofu und Vollkorn. Zwei der fünf Mahlzeiten oben sind vegetarisch.
  3. **Sollte ich vor oder nach dem Training Protein essen?** Am wichtigsten ist die Menge pro
     Tag. Eine eiweißreiche Mahlzeit ein paar Stunden nach dem Training ist eine gute
     Gewohnheit.
  4. **Woran merke ich, ob ich genug esse?** Schreib einen normalen Tag mit einer App oder einem
     Ernährungstagebuch mit. Liegst du deutlich unter 1,6 g pro Kilo, ergänze eine der fünf
     Mahlzeiten.
- Labels: „Magazin“ · „Auf einen Blick“ · „In diesem Artikel“ · „Coach-Tipp“ · „Artikel teilen“ ·
  „Link kopieren“ · „Teilen“ · „Link kopiert“ · „Häufige Fragen“ · „Geschrieben von“ · „Mehr von
  Jonas" · „Weiterlesen“ · „Min. Lesezeit“ · „Beim Abspielen werden Daten an YouTube gesendet.“ ·
  „Video laden“

## Technical notes (Tech Lead, Frontend)

- **Route**: `magazine-slug` in `constants/routes.constants.ts` (`/magazin/[slug]`,
  `/magazine/[slug]`); the language switcher gets the other language's slug the way
  `offers-slug` does; unknown slug → 404; the sitemap lists published articles with their
  language versions.
- **Schema**: `post.keyTakeaways` and `post.faq` (studio/schemas/collections/post.schema.ts);
  `pnpm typegen`; seed: the protein article (DE + EN) gets takeaways, FAQ, a pull quote, a
  figure (new seed picture, stock photo matching the description) and the video, in the same PR.
- **Composable**: `useArticle(slug)` (query with groqd in the composable, view of plain values,
  reading time and table of contents computed in the mapper).
- **Performance (aim 90+)**: thin page. The page renders `ArticleContent` with `hydrate-never`
  (hero, takeaways, text, author, related, closing: no JavaScript). Small islands only: the FAQ
  and the mobile table of contents as native `<details>` (no JavaScript), the progress bar and
  table of contents highlight in one island `hydrate-on-idle`, share buttons and video
  `hydrate-on-interaction`. The cover has `priority`; every other image is lazy.
- **Nuxt UI**: `UBreadcrumb`, `UBadge`, `UAvatar`, `UUser` (author row), `UPageCard`
  (takeaways, author box), `UAccordion` look reproduced on `<details>` (frontend to confirm),
  `UToast`, the magazine `PostCard`.
- **SEO**: one h1, `Article` and `FAQPage` structured data (nuxt-schema-org), canonical and
  hreflang from `@nuxtjs/i18n`.
- **Tokens**: none new.
- **Risks**: long German titles in the hero (32px at 375), FAQ answers as plain text (no links)
  on purpose; the demo video id is the same placeholder video as the strength article.

## Out of scope

- Comments, likes, newsletter sign-up, author pages, article search, print view.
- Changes to the magazine list page.

## Open questions

- None blocking. Lovable credits: estimated 2 to 4 (7 new sections, 1 new image, existing
  covers and portraits reused); the free plan gives 5 a day.

## Definition of ready (gate D1)

- [x] Goal, audience and primary call to action are stated
- [x] Part 1 names every page with its URL, and every section with a `data-section`, a purpose and a status
- [x] Layout at 375 / 768 / 1440 is described for every new or changed section
- [x] States and motion are listed (or "none")
- [x] The English content is complete in Part 1; every other locale exists in Part 2, or its provider and date are named
- [x] Every element is classified: Sanity field, i18n key, or decoration
- [x] Token changes are listed (or "none")
- [x] Out of scope is written; no open question blocks the build

## Compiled prompt (gate D1 approved 2026-10-13)

```text
Build one new page: /magazine/<slug>, the article page. One template for every article of the magazine; the magazine cards and "Keep reading" cards link to it. Design it on /magazine/protein-without-powder, which has every element below. The five other articles use the same template with their own title, excerpt, cover, category, author and date; their text is one paragraph (their excerpt), with no "At a glance" and no questions, so those two sections are hidden there. An unknown slug shows the existing not-found page. Change nothing else.

Sections in this order:

1. ArticleHero (data-section="article-hero"): light background, one centred column, text max 760px. Breadcrumb "Magazine" (link to /magazine) / "Nutrition" (link to /magazine?category=nutrition). Category badge. Title in display type, uppercase, the only h1: about 56px at 1440, 40px at 768, 32px at 375. Lead at 20px, muted. Author row: round photo 40px, name, then role · date · reading time. Cover image 16:9 below the text: 1120px wide and rounded at 1440, full content width at 768, edge to edge with no radius at 375. The cover is the first image of the page and loads first.

2. ArticleTakeaways (data-section="article-takeaways"): a card under the hero, as wide as the text column. Label "At a glance" with a small checklist icon, then the points as a checked list. Light primary-tinted background, no shadow. Hidden when the article has no points.

3. ArticleBody (data-section="article-body"):
- Reading progress bar: 3px, primary, fixed right under the header, full width, filling left to right while the reader scrolls through the article text (not the whole page).
- 1440: two columns. Left: table of contents, 240px, sticky 96px from the top, title "In this article", the H2s as links, the current one in primary with a 2px left border. Right: text column, max 68 characters wide.
- 768 and 375: the table of contents is a closed accordion "In this article" above the text.
- Text: paragraphs 18px with line height 1.7; H2 in display type (about 36px at 1440, 28px at 375); H3; bullet and numbered lists; bold, italic; links in primary, underlined.
- Coach tip: accent background, 4px primary left border, lightbulb icon, label "Coach tip".
- Pull quote: large display text (about 32px, 26px at 375), a large primary quotation mark, attribution below in muted text.
- Figure: image at text width, rounded, muted caption below.
- Video: 16:9 dark poster with a play icon, the video title, the line "Playing sends data to YouTube." and a button "Load video". Clicking replaces it with the YouTube player from youtube-nocookie.com. Nothing loads before the click.
- Share row at the end of the text, above a thin divider: "Share this article", a "Copy link" button (toast "Link copied") and a "Share" button shown only where the browser supports native sharing. No third-party scripts.

4. ArticleFaq (data-section="article-faq"): title "Frequently asked questions" in display type, then an accordion as wide as the text column: one bordered row per question (question 18px semibold, chevron on the right), the answer below when open. All closed at first; several can be open at once. No card shadow. Hidden when the article has no questions.

5. ArticleAuthor (data-section="article-author"): bordered card, text column width. Round photo 96px, "Written by", name in display type, role, bio, link "More from Jonas" to /magazine. 375: photo above the text, centred.

6. ArticleRelated (data-section="article-related"): title "Keep reading". Up to 3 cards, the same card as the magazine grid: first the other articles of the same category, newest first, then the newest articles of other categories to fill 3; never the current article. 1440: 3 columns; 768: 2 columns (the third hidden); 375: horizontal scroll with snap, cards 85% wide. Hidden when there is no other article.

7. ArticleClosing (data-section="article-closing"): identical to the magazine's closing band: "Ready for the first step?", "Try it: your first session with a coach is free.", button "Request a free trial" to /contact.

States, on /magazine/protein-without-powder: ?state=toc-open opens the mobile table of contents; ?state=faq-open opens the first question; ?state=video-loaded shows the player instead of the poster; ?state=link-copied shows the toast. Also link hover and focus-visible everywhere, the current table of contents item, and card hover as in the magazine grid.

Motion: accordions open and close in 200ms ease-out (height and chevron rotation); the toast slides up in 200ms; card hover as in the magazine grid. With reduced motion: no transitions.

Content of /magazine/protein-without-powder:
- Category Nutrition. Title "Protein without powder: 5 simple meals". Lead "Enough protein without shakes. Five meals ready in 15 minutes." Author row: Jonas Weber · Nutrition coach · 21 Sep 2026 · 2 min read. Cover: the existing protein cover (alt "A bowl with salmon, eggs and vegetables").
- At a glance: "Most active adults need about 1.6 g of protein per kilo of body weight a day." / "Spread it over three or four meals of 25 to 40 g each." / "Five everyday meals get you there in 15 minutes, without shakes." / "Six basics in your fridge make it easy every day."
- Text, in order:
  1. Paragraph: "You don't need shakes to eat enough protein. You need a few go-to meals that are quick, tasty and easy to repeat."
  2. H2: "How much protein you need"
  3. Paragraph: "Most active adults do well with 1.6 grams of protein per kilo of body weight a day. For someone who weighs 70 kilos, that's about 110 grams, spread over three or four meals."
  4. Pull quote: "Protein is a habit, not a supplement." Attribution: Jonas Weber.
  5. H2: "Five meals in 15 minutes"
  6. Bullet list: "Greek yoghurt with oats, berries and walnuts (about 30 g)" / "Scrambled eggs with spinach and wholegrain toast (about 28 g)" / "Lentil salad with feta and cherry tomatoes (about 26 g)" / "Salmon with rice and peas (about 38 g)" / "Wholegrain wrap with chicken, cottage cheese and peppers (about 40 g)"
  7. Coach tip: "Cook a double portion in the evening. Tomorrow's lunch is then already done."
  8. Video: title "Three protein lunches in 15 minutes", YouTube id M7lc1UVf-VE.
  9. H2: "Your shopping list"
  10. Figure: a new photo, caption "Six basics, endless meals."
  11. Paragraph: "Keep eggs, Greek yoghurt, cottage cheese, canned lentils, frozen salmon and chicken breast at home. With these six basics, a protein-rich meal is never more than 15 minutes away."
- Questions:
  1. "Is protein powder bad for me?" — "No. Powder is a convenient food, not a must. If your meals already give you enough protein, you don't need it."
  2. "Can I get enough protein as a vegetarian?" — "Yes. Combine dairy, eggs, lentils, beans, tofu and wholegrains over the day. Two of the five meals above are vegetarian."
  3. "Should I eat protein before or after training?" — "Your daily total matters most. A protein-rich meal within a few hours after training is a good habit."
  4. "How do I know if I eat enough?" — "Track one normal day with an app or a food diary. If you are well below 1.6 g per kilo, add one of the five meals."
- Author box: Jonas Weber, Nutrition coach, "Jonas is a nutrition scientist who believes in food that tastes good and fits a busy calendar." For the other articles: Lena Hoffmann, Head coach, strength & technique, "Lena has coached in Berlin for twelve years and gets people of every age safely under the bar."; Mira Schulz, Mindset & habits coach, "Mira combines training with behavioural psychology so good intentions become habits." The link reads "More from <first name>".
- Keep reading on this article: "What to eat before and after training", "Strength training after 40: how to start safely", "Keep going when motivation fades".

Images: reuse the existing article covers and author portraits. Generate one new photo for the figure: six protein basics on a light kitchen counter (eggs, a tub of Greek yoghurt, cottage cheese, a can of lentils, a salmon fillet, a chicken breast), 3:2, no text in the image.

Do not change: the /magazine page and its four sections, the header, the footer, every other page, the theme, and the backend.
```

Expected credits: 2 to 4 (free plan: 5 a day).

## Iterations (Lovable)

| #   | Date       | Message id                      | Commit                                   | Credits | Result                                                                                                                                                                                         |
| --- | ---------- | ------------------------------- | ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 2026-10-13 | umsg_01m4v83f98fxyrg9dkch5917w8 | 7d7db3e3f6e8e5c8ace0ef12620a5b14b193c21f | 4.97    | Article template built: 7 sections in src/components/sections, content in src/content/article.ts, figure photo generated; /magazine only gained case-insensitive ?category= for the breadcrumb |

## Approval (gate D2)

- Approved by, date, channel: the project owner, 2026-10-13, Claude Code session (`/design`, "Approve")
- Approved Lovable commit: 7d7db3e3f6e8e5c8ace0ef12620a5b14b193c21f (changeset `0002-article`)
