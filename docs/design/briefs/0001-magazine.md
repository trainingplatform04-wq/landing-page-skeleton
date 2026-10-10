---
id: '0001'
page: magazine # new pages: magazine (list) + magazine-slug (article)
kind: new-page # Part 2 also brings the FitFlow theme into the code
status: design-approved # draft → approved (gate D1) → built → design-approved (gate D2) | discarded
lastUpdated: '2026-10-10'
---

# Brief 0001: magazine, list and article pages

> **Delivered page by page (2026-10-10).** This brief delivered the **list page** only
> (`/magazine`, approved at D2, changeset `0001-magazine`). The article page gets its own brief;
> Part 1's article page sections and the full article texts are its starting point.

## Intent

"Let's have ideas of other pages, really heavy content pages, that we add in Lovable and then
implement in the code to see the result." We add a **Magazine**: an editorial list of articles
about training, nutrition and mindset, and one page per article, so that a visitor who arrives
from search trusts the coaches and requests a free trial. It is the heaviest content page of the
site and the first one built end to end through the design track.

## Product (Product Owner)

- **Goal**: the reader requests a **free trial** after reading. Success: contact form
  submissions coming from an article, and articles read per visit.
- **Audience**: adults in Berlin interested in fitness, arriving mostly from **search** on an
  article page, **mobile first**.
- **Message**: "Know-how from our coaches, for real life." Proof: every article is signed by a
  named coach with a photo, a role and a short bio.
- **Calls to action**: the closing band of both pages, "Request a free trial" → contact page
  (primary). Cards and related articles → the article.

---

# Part 1: Design (the only input of the Lovable prompt)

## Pages

| Page            | Prototype URL      | Menu                                                    |
| --------------- | ------------------ | ------------------------------------------------------- |
| Magazine (list) | `/magazine`        | new header and footer link "Magazine", after "Programs" |
| Article         | `/magazine/<slug>` | none (reached from the cards)                           |

## Sections (Designer)

### Magazine (`/magazine`)

| Order | `data-section`    | Purpose                                                      | Status |
| ----- | ----------------- | ------------------------------------------------------------ | ------ |
| 1     | magazine-hero     | Dark band: kicker, display title, intro                      | new    |
| 2     | magazine-featured | The 3 newest articles: 1 large + 2 stacked                   | new    |
| 3     | magazine-grid     | Category tabs, grid of the other articles, pagination, empty | new    |
| 4     | magazine-closing  | Dark band: free trial call to action                         | new    |

- **magazine-hero**: same dark band as the offers hero. Kicker in primary, title in display
  type, intro below. 1440: ≈ 360px high, left-aligned; 375: ≈ 280px.
- **magazine-featured**: only on "All" and page 1. 1440: grid 2/3 + 1/3. Left: large card,
  image 16:10, category badge, title in display type (≈ 48px), excerpt, meta row (author photo
  32px, name, date, reading time). Right: two stacked compact cards (image 16:10, category,
  title, meta). 768: large card full width, the two compact cards side by side below. 375: all
  stacked; compact cards become rows (square image 96px left, text right).
- **magazine-grid**: category tabs as pill buttons ("All", "Training", "Nutrition", "Mindset"),
  active tab solid primary, scrolling horizontally at 375 without a visible scrollbar. Grid of
  cards: 3 columns at 1440, 2 at 768, 1 at 375. Card: image 16:10 → category badge → title
  (display, uppercase, ≈ 28px) → excerpt (2 lines, clamped) → meta row (author photo 24px,
  name · date · reading time). 9 cards per page; numbered pagination below ("Previous", page
  numbers, "Next"), hidden when there is one page. A tab filters the cards (featured block hidden
  while a category is active).
  States: card hover (lift 2px, image zoom 1.03, 300ms), tab hover and focus-visible, active
  tab, current page; **empty**: "No articles in this category yet." + link "All articles".
  `?state=empty` shows the empty state; `?state=paginated` shows the pagination with 3 pages.
- **magazine-closing**: dark band: title, one line, button. 1440: text left, button right; 375:
  stacked, button full width.

### Article (`/magazine/<slug>`)

| Order | `data-section`  | Purpose                                                 | Status |
| ----- | --------------- | ------------------------------------------------------- | ------ |
| 1     | article-hero    | Breadcrumb, category, title, excerpt, meta, cover image | new    |
| 2     | article-body    | Table of contents + text and blocks + share row         | new    |
| 3     | article-author  | Author box                                              | new    |
| 4     | article-related | Up to 3 other articles of the same category             | new    |
| 5     | article-closing | Same dark band as magazine-closing                      | new    |

- **article-hero**: light background. Breadcrumb "Magazine / <category>". Category badge,
  title (display, uppercase, the only h1), excerpt as a 20px lead, meta row (author photo 40px,
  name, role · date · reading time). Cover image 16:9 below: content width and rounded at 1440,
  edge to edge at 375.
- **article-body**: 1440: two columns. Left: table of contents (240px, sticky 96px from the
  top) listing the H2s, the current one highlighted in primary while scrolling. Right: text
  column, max 68 characters wide. 768 and 375: the table of contents is a closed accordion "In
  this article" above the text. Text: paragraphs 18px / 1.7, H2 in display type (≈ 36px), H3,
  bullet and numbered lists, bold, italic, links in primary, underlined. Blocks:
  - **Coach tip**: accent background, 4px primary left border, lightbulb icon, label "Coach tip".
  - **Pull quote**: large display text (≈ 32px), a primary quotation mark, attribution below.
  - **Figure**: image at text width with a muted caption below.
  - **Video**: 16:9 dark placeholder with a play icon, the video title, the line "Playing sends
    data to YouTube." and a button "Load video". Clicking replaces it with the YouTube player
    (youtube-nocookie.com, id given in the content). Nothing loads before the click.
  - **Share row** at the end: "Share", a "Copy link" button (toast "Link copied") and a native
    share button shown only where the browser supports it. No third-party scripts.
    States: link hover and focus-visible, current table of contents item, accordion open and
    closed (`?state=toc-open` opens it), video before and after the click, toast.
- **article-author**: bordered card: round photo 96px, "Written by", name in display type, role,
  bio. 375: photo above the text.
- **article-related**: title "Keep reading", the newest other articles of the same category (up
  to 3; section hidden when there is none), same card as the grid. 1440: 3 columns; 768: 2
  (third hidden); 375: horizontal scroll with snap.
- **article-closing**: same as magazine-closing.

**Motion**: the existing `reveal` on section entry (not on the body blocks), card hover 300ms,
accordion 200ms. Everything off under reduced motion.

**Media**: generated photos, no text inside: 6 article covers (fitting each title), 3 author
portraits, 2 figures (articles 1 and 4).

## Content (English, in full)

### Page texts

| Where             | Text                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| Menu link         | Magazine                                                                   |
| Hero kicker       | Magazine                                                                   |
| Hero title        | Know-how that moves you forward.                                           |
| Hero intro        | Training, nutrition and mindset: articles from our coaches, for real life. |
| Tabs              | All · Training · Nutrition · Mindset                                       |
| Empty state       | No articles in this category yet. · All articles                           |
| Reading time      | {n} min read                                                               |
| Pagination        | Previous · Next                                                            |
| Closing title     | Ready for the first step?                                                  |
| Closing text      | Try it: your first session with a coach is free.                           |
| Closing button    | Request a free trial → /contact                                            |
| Table of contents | In this article                                                            |
| Author label      | Written by                                                                 |
| Related title     | Keep reading                                                               |
| Share             | Share · Copy link · Link copied                                            |
| Video             | Playing sends data to YouTube. · Load video                                |
| Tip label         | Coach tip                                                                  |

Dates are shown as "28 Sep 2026". Reading time: words ÷ 200, rounded up.

### Authors

| Name          | Role                             | Bio                                                                                            |
| ------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Lena Hoffmann | Head coach, strength & technique | Lena has coached in Berlin for twelve years and gets people of every age safely under the bar. |
| Jonas Weber   | Nutrition coach                  | Jonas is a nutrition scientist who believes in food that tastes good and fits a busy calendar. |
| Mira Schulz   | Mindset & habits coach           | Mira combines training with behavioural psychology so good intentions become habits.           |

### Articles (newest first)

| #   | Slug                             | Category  | Author        | Date        |
| --- | -------------------------------- | --------- | ------------- | ----------- |
| 1   | strength-training-after-40       | Training  | Lena Hoffmann | 28 Sep 2026 |
| 2   | protein-without-powder           | Nutrition | Jonas Weber   | 21 Sep 2026 |
| 3   | keep-going-without-motivation    | Mindset   | Mira Schulz   | 14 Sep 2026 |
| 4   | morning-mobility                 | Training  | Lena Hoffmann | 7 Sep 2026  |
| 5   | eating-before-and-after-training | Nutrition | Jonas Weber   | 31 Aug 2026 |
| 6   | sleep-as-a-training-tool         | Mindset   | Mira Schulz   | 24 Aug 2026 |

#### 1. Strength training after 40: how to start safely

Excerpt: Muscles respond to training at any age. Here is how to build a safe foundation in four
weeks.

> At 40, it isn't too late to start strength training. It's exactly the right time. Muscles,
> bones and joints respond to training at any age, as long as you start smart.
>
> **H2 Why strength matters after 40**
> Without training, we lose muscle mass every decade from around 30. Strength training slows
> that loss, strengthens your bones and makes everyday life easier: stairs, shopping, lifting
> your kids.
>
> **Pull quote:** "The best time to start was ten years ago. The second best is today." (Lena
> Hoffmann)
>
> **H2 The first four weeks**
> Start with two full-body sessions a week. Pick five basic exercises and learn the technique
> before you add weight:
>
> - Box squat
> - Hip thrust
> - Cable row
> - Incline push-up
> - Farmer's walk
>
> **Coach tip:** Stop before your technique breaks down. Keeping two reps in reserve is just
> right at the start.
>
> **Figure:** (photo of a box squat) "Box squat: the box sets the depth and keeps you safe."
>
> **H2 How to progress**
> Only add weight once you complete every set cleanly. Small steps of one to two kilos are
> enough. Log every session: progress you can see in black and white keeps you going.
>
> **Video:** "The box squat, step by step" (YouTube id `M7lc1UVf-VE`).
>
> **H2 When to ask a coach**
> If something hurts, after an old injury, or if you're stuck after four weeks. A free trial
> session shows you in one hour where you stand and what comes next.

#### 2. Protein without powder: 5 simple meals

Excerpt: Enough protein without shakes. Five meals ready in 15 minutes.

> You don't need shakes to eat enough protein. You need a few go-to meals that are quick, tasty
> and easy to repeat.
>
> **H2 How much protein you need**
> Most active adults do well with 1.6 grams of protein per kilo of body weight a day. For
> someone who weighs 70 kilos, that's about 110 grams, spread over three or four meals.
>
> **H2 Five meals in 15 minutes**
>
> - Greek yoghurt with oats, berries and walnuts (about 30 g)
> - Scrambled eggs with spinach and wholegrain toast (about 28 g)
> - Lentil salad with feta and cherry tomatoes (about 26 g)
> - Salmon with rice and peas (about 38 g)
> - Wholegrain wrap with chicken, cottage cheese and peppers (about 40 g)
>
> **Coach tip:** Cook a double portion in the evening. Tomorrow's lunch is then already done.
>
> **H2 Your shopping list**
> Keep eggs, Greek yoghurt, cottage cheese, canned lentils, frozen salmon and chicken breast at
> home. With these six basics, a protein-rich meal is never more than 15 minutes away.

#### 3. Keep going when motivation fades

Excerpt: Motivation comes and goes. Habits stay. Three strategies for the weak weeks.

> Motivation is a great starter but a poor engine. The people who make progress aren't more
> motivated. They have built habits that carry them through the weak weeks.
>
> **H2 Why motivation isn't enough**
> Motivation depends on mood, sleep and stress. If you only train when you feel like it, you
> won't train often. A habit runs on a cue and a routine, not on a feeling.
>
> **Pull quote:** "Don't wait to feel ready. Start, and the feeling follows." (Mira Schulz)
>
> **H2 Three strategies**
>
> 1. Fix the time: same days, same hour, in your calendar like a meeting.
> 2. Make it small: on bad days, do ten minutes. Ten minutes still count.
> 3. Train with someone: a partner or a group expects you, and that changes everything.
>
> **H2 When you miss a week**
> Missing one week changes nothing. Missing the restart does. Don't make up for lost sessions:
> just do the next planned one.

#### 4. 10-minute morning mobility

Excerpt: Stiff after waking up? This routine wakes up your hips, back and shoulders.

> Stiff after waking up? Ten minutes are enough to wake up your hips, back and shoulders, with no
> equipment and no warm-up.
>
> **H2 Why in the morning**
> After a night of lying still, your joints need movement to feel free again. A short routine
> also wakes up your mind, without the stress of a workout.
>
> **H2 The routine**
> One minute per exercise, calmly, breathing through your nose:
>
> 1. Cat-cow on all fours
> 2. World's greatest stretch, both sides
> 3. Standing hip circles
> 4. Upper-back rotations, both sides
> 5. Deep squat hold, holding a door frame
> 6. Arm circles and shoulder rolls
>
> **Figure:** (photo of the world's greatest stretch) "World's greatest stretch: hips, back and
> shoulders in one move."
>
> **H2 When you need more**
> If one area stays stiff or painful for more than two weeks, have it checked. A coach finds the
> cause in a movement assessment.

#### 5. What to eat before and after training

Excerpt: Timing matters less than you think, but it still matters. What really counts.

> Timing matters less than you think, but it still matters. Here is what really counts around
> your sessions.
>
> **H2 Before training**
> Eat a normal meal two to three hours before, or a small snack 30 to 60 minutes before: a
> banana, bread with honey, or a yoghurt. Avoid a lot of fat and fibre right before training.
>
> **H2 After training**
> Within a few hours, eat a meal with protein and carbohydrates: rice with chicken and
> vegetables, an omelette with potatoes, or yoghurt with fruit and oats.
>
> **Coach tip:** Drink a large glass of water before and after every session. Many people
> mistake thirst for tiredness.
>
> **H2 Myths**
> The 30-minute "anabolic window" is a myth for most people. What counts is what you eat across
> the whole day.

#### 6. Sleep: the underrated training tool

Excerpt: Progress happens during recovery. Why good sleep beats an extra session.

> Your muscles don't grow during training. They grow while you recover, and most of that
> recovery happens at night.
>
> **H2 What happens while you sleep**
> In deep sleep your body releases growth hormone, repairs muscle tissue and stores what you
> practised, movement patterns included.
>
> **Pull quote:** "An extra hour of sleep often does more than an extra session." (Mira Schulz)
>
> **H2 Five rules for better sleep**
>
> - The same bedtime and wake-up time, weekends included
> - No screens for 30 minutes before bed
> - A cool, dark bedroom (16 to 19 °C)
> - No caffeine after 2 pm
> - Hard sessions before 8 pm
>
> **H2 Planning sleep and training**
> After a short night, train lighter and focus on technique. Progress comes from what you can
> recover from, not from what you can endure.

## Do not change

- The home, programs, FAQ and contact pages and their sections; the theme; the backend. In the
  header and footer, only the new "Magazine" link is added.

---

# Part 2: Implementation (our side, never sent to Lovable)

## Content model (Tech Lead)

| Element                                                                                                              | Sanity field, i18n key or decoration                                   |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Hero kicker, title, intro                                                                                            | `magazinePage.kicker`, `.title`, `.intro`                              |
| Closing title, text, button                                                                                          | `magazinePage.closingTitle`, `.closingText`, `.cta` (both pages)       |
| SEO of the list page                                                                                                 | `magazinePage.seo`                                                     |
| Article title, slug, excerpt, cover, date, body                                                                      | `post.title`, `.slug`, `.excerpt`, `.cover`, `.publishedAt`, `.body`   |
| Article category, author                                                                                             | `post.category` → `category`, `post.author` → `author` (references)    |
| Category name and slug                                                                                               | `category.title`, `.slug`                                              |
| Author name, role, bio, photo                                                                                        | `author.name`, `.role`, `.bio`, `.photo`                               |
| Coach tip, pull quote, figure, video                                                                                 | `articleBody` blocks `coachTip`, `pullQuote`, `figure`, `youtubeVideo` |
| Menu label                                                                                                           | i18n `nav.magazine`                                                    |
| Tabs "All", empty state, reading time, pagination, toc, author label, related title, share, video consent, tip label | i18n `magazine.*`                                                      |
| Reading time value, date format                                                                                      | computed (`utils/readingTime/`, `utils/date/date.utils.ts`)            |
| Quotation mark, icons, play icon                                                                                     | decoration                                                             |

## Other locales (Product Owner): German

| Element              | DE                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menu, kicker         | Magazin                                                                                                                                                   |
| Hero title           | Wissen, das dich weiterbringt.                                                                                                                            |
| Hero intro           | Training, Ernährung und Mindset: Artikel von unseren Coaches, fürs echte Leben.                                                                           |
| Tabs                 | Alle · Training · Ernährung · Mindset                                                                                                                     |
| Empty state          | Noch keine Artikel in dieser Kategorie. · Alle Artikel                                                                                                    |
| Reading time         | {n} Min. Lesezeit                                                                                                                                         |
| Pagination           | Zurück · Weiter                                                                                                                                           |
| Closing              | Bereit für den ersten Schritt? · Probier es aus: Das erste Training mit einem Coach ist kostenlos. · Kostenloses Probetraining                            |
| Toc, author, related | In diesem Artikel · Geschrieben von · Weiterlesen                                                                                                         |
| Share, video, tip    | Teilen · Link kopieren · Link kopiert · Beim Abspielen werden Daten an YouTube übertragen. · Video laden · Coach-Tipp                                     |
| Category slugs       | training · nutrition · mindset (the same in every language)                                                                                               |
| Author roles         | Head Coach, Kraft & Technik · Ernährungscoach · Coach für Mindset & Gewohnheiten                                                                          |
| Article slugs        | krafttraining-ab-40 · protein-ohne-pulver · dranbleiben-ohne-motivation · mobility-am-morgen · essen-vor-und-nach-dem-training · schlaf-als-trainingstool |

Article 1 in German (seed):

> Mit 40 ist es nicht zu spät für Krafttraining. Es ist genau der richtige Zeitpunkt. Muskeln,
> Knochen und Gelenke reagieren in jedem Alter auf Training, wenn du klug startest.
> **Warum Kraft ab 40 zählt** · Ohne Training verlieren wir ab etwa 30 mit jedem Jahrzehnt
> Muskelmasse. Krafttraining bremst diesen Verlust, stärkt die Knochen und macht den Alltag
> leichter: Treppen, Einkäufe, Kinder hochheben. · Zitat: „Der beste Zeitpunkt für den Start war
> vor zehn Jahren. Der zweitbeste ist heute.“ · **Die ersten vier Wochen** · Starte mit zwei
> Ganzkörper-Einheiten pro Woche. Wähle fünf Grundübungen und lerne die Technik, bevor du das
> Gewicht steigerst: Kniebeuge an der Box, Hüftheben, Rudern am Kabel, Liegestütz an der Bank,
> Farmer's Walk. · Coach-Tipp: Hör auf, bevor die Technik bricht. Zwei Wiederholungen Reserve
> sind am Anfang genau richtig. · Bildunterschrift: Kniebeuge an der Box: Die Box gibt Tiefe und
> Sicherheit vor. · **So steigerst du dich** · Erhöhe das Gewicht erst, wenn du alle Sätze
> sauber schaffst. Kleine Schritte von ein bis zwei Kilo reichen. Notiere jede Einheit:
> Fortschritt, den du schwarz auf weiß siehst, motiviert. · Video: Die Kniebeuge an der Box,
> Schritt für Schritt · **Wann du einen Coach fragen solltest** · Bei Schmerzen, nach alten
> Verletzungen oder wenn du nach vier Wochen nicht weiterkommst. Ein Probetraining zeigt dir in
> einer Stunde, wo du stehst und was als Nächstes kommt.

Articles 2–6 in German, author bios in German: the Product Owner translates the approved English
at gate D2, into the changeset's `content/` (seed), before the task starts.

## Technical notes (Tech Lead, Frontend)

- **Two tasks, in this order.** (1) `design-system-fitflow`: the code adopts the FitFlow theme
  already used by the prototype (today the code has Nuxt UI `green` / `slate` and no fonts):
  primary `oklch(0.67 0.22 42)` (dark `oklch(0.72 0.21 45)`), warm neutrals, `surface-strong`
  dark band tokens, Barlow Condensed 900 uppercase for h1–h3 and Manrope for text (self-hosted
  with `@nuxt/fonts`), radius 0.5rem, `--shadow-accent`, the `reveal` animation, brand
  "FitFlow". Values from the prototype's `src/styles.css`. Every page; all existing E2E tests
  re-checked. (2) `magazine`: the two pages below. The pixel check of the magazine runs on the
  themed code.
- **ADR 0005** amends ADR 0004 (7 pages, blog removed): the magazine adds two routes.
- **Routes** (`constants/routes.constants.ts`): `magazine` (`/magazin`, `/magazine`),
  `magazine-slug` (`/magazin/[slug]`, `/magazine/[slug]`); `PAGE_TYPES.magazine =
'magazinePage'`; `NAVIGATION`: offers, **magazine**, faq, contact. Category filter as a search
  param `?category=` (same in every language), pagination `?page=`.
- **Schema**: page `magazinePage`; collections `post`, `category`, `author` (one document per
  language, translation links as offers, references with `sameLanguageFilter`); body type
  `articleBody` = `richText` + the four blocks. `pnpm typegen`, `types/sanity.types.ts`.
- **Seed** (`studio/seed/seed.data.ts`): magazine page, 3 categories, 3 authors, 6 posts × 2
  languages, stock photos matching the prototype's pictures, in the same PR.
- **Composables**: `useMagazine` (featured 3, category filter, GROQ slice + count for
  pagination) and `useArticle` (article, related, 404 on unknown slug, `useSetI18nParams`).
  Reading time util with spec; dates in Europe/Berlin.
- **Nuxt UI**: `UPageSection`, `UBlogPost` / `UBlogPosts`, `UTabs` or a `UButton` group,
  `UPagination` with links, `UBreadcrumb`, `UAccordion` (mobile table of contents), `UUser` in
  a `UCard`, `useToast`; the `RichText` component extended with the four blocks. Check whether
  `UContentToc` works without Nuxt Content, else a small component.
- **Sitemap**: posts in `modules/sitemap.ts`, both languages.
- **Design gate**: `verify.json` compares in English (`/magazine…` on the prototype,
  `/en/magazine…` in our app); German is covered by E2E (long uppercase words must wrap at 375).
- **Risks**: sticky table of contents under the sticky header; YouTube must not load before the
  click (CSP if any); self-hosted fonts (GDPR, pixel parity); many images (lazy loading, Sanity
  image sizes).

## Out of scope

- Newsletter, comments, search, RSS, tags, category pages with their own URL.
- Article structured data (ADR 0004 allows `LocalBusiness` only): a later ADR.
- Redesigning the other pages in Lovable; the light/dark switch of the prototype header.

## Open questions

- Real articles, authors, photos and video: placeholders for staging; the client writes the real
  ones in the Studio (production starts empty).

## Definition of ready (gate D1)

- [x] Goal, audience and primary call to action are stated
- [x] Part 1 names every page with its URL, and every section with a `data-section`, a purpose and a status
- [x] Layout at 375 / 768 / 1440 is described for every new or changed section
- [x] States and motion are listed (or "none")
- [x] The English content is complete in Part 1; every other locale exists in Part 2, or its provider and date are named
- [x] Every element is classified: Sanity field, i18n key, or decoration
- [x] Token changes are listed (or "none")
- [x] Out of scope is written; no open question blocks the build

## Compiled prompts (gate D1 approved 2026-10-10)

The free plan gives 5 credits a day, so the build is split in two prompts, one per page, each
sized to fit one day's credits. Prompt 2 (the article page, with the six full texts of Part 1)
is compiled after prompt 1 is reviewed.

### Prompt 1: `/magazine` (sent 2026-10-10, built)

```text
Build one new page: /magazine, a list of articles. Add a "Magazine" link to the header and footer navigation, right after "Programs". Change nothing else.

Sections in this order:

1. MagazineHero (data-section="magazine-hero"): the same dark band as the programs hero. Kicker "Magazine" (primary), display title "Know-how that moves you forward.", intro "Training, nutrition and mindset: articles from our coaches, for real life." 1440: about 360px high, left-aligned. 375: about 280px.

2. MagazineFeatured (data-section="magazine-featured"): articles 1 to 3 below, shown only when the "All" tab is active. 1440: grid 2/3 + 1/3. Left: a large card for article 1 (image 16:10, category badge, display title about 48px, excerpt, meta row: author photo 32px, name, date, reading time). Right: two stacked compact cards for articles 2 and 3 (image 16:10, category, title, meta). 768: large card full width, the two compact cards side by side below it. 375: all stacked; compact cards become rows (square image 96px left, text right).

3. MagazineGrid (data-section="magazine-grid"): pill tabs "All", "Training", "Nutrition", "Mindset" (active tab solid primary; horizontal scroll at 375 with no visible scrollbar). With "All", the grid shows articles 4 to 6; a category tab hides the featured block and shows all articles of that category. Cards: 3 columns at 1440, 2 at 768, 1 at 375. Card: image 16:10, category badge, title (display, uppercase, about 28px), excerpt clamped to 2 lines, meta row (author photo 24px, name · date · reading time). Numbered pagination below ("Previous", page numbers, "Next"), hidden when there is only one page. States: card hover (lift 2px, image zoom 1.03, 300ms), tab hover and focus-visible, active tab, current page. Empty state: "No articles in this category yet." with a link "All articles". ?state=empty shows the empty state; ?state=paginated shows the pagination with 3 pages. Cards link to /magazine/<slug> (that page comes later).

4. MagazineClosing (data-section="magazine-closing"): dark band. Title "Ready for the first step?", text "Try it: your first session with a coach is free.", button "Request a free trial" to /contact. 1440: text left, button right. 375: stacked, button full width.

Motion: the existing reveal animation on section entry; card hover 300ms.

Articles (title · excerpt · category · author · date · reading time · slug):
1. Strength training after 40: how to start safely · Muscles respond to training at any age. Here is how to build a safe foundation in four weeks. · Training · Lena Hoffmann · 28 Sep 2026 · 2 min read · strength-training-after-40
2. Protein without powder: 5 simple meals · Enough protein without shakes. Five meals ready in 15 minutes. · Nutrition · Jonas Weber · 21 Sep 2026 · 1 min read · protein-without-powder
3. Keep going when motivation fades · Motivation comes and goes. Habits stay. Three strategies for the weak weeks. · Mindset · Mira Schulz · 14 Sep 2026 · 1 min read · keep-going-without-motivation
4. 10-minute morning mobility · Stiff after waking up? This routine wakes up your hips, back and shoulders. · Training · Lena Hoffmann · 7 Sep 2026 · 1 min read · morning-mobility
5. What to eat before and after training · Timing matters less than you think, but it still matters. What really counts. · Nutrition · Jonas Weber · 31 Aug 2026 · 1 min read · eating-before-and-after-training
6. Sleep: the underrated training tool · Progress happens during recovery. Why good sleep beats an extra session. · Mindset · Mira Schulz · 24 Aug 2026 · 1 min read · sleep-as-a-training-tool

Images: generate one cover photo per article that fits its title, and one portrait per author (Lena Hoffmann, Jonas Weber, Mira Schulz). No text in any image.

Do not change: the home, programs, FAQ and contact pages, the theme, and the backend. In the header and footer, only add the "Magazine" link.
```

### Prompt 2: `/magazine/<slug>` (after prompt 1)

Not compiled yet.

## Iterations (Lovable)

| #   | Date       | Message id                      | Commit                                   | Credits | Result                                                                                                 |
| --- | ---------- | ------------------------------- | ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| 1   | 2026-10-10 | umsg_01m4jkpm12fcdvh5j2we1hp6fn | 06635773527081b4baaa25a5074840a725aca3d6 | 4.3     | Prompt 1 built: /magazine, 4 sections, 9 images, header and footer link; article URLs answer not found |

## Approval (gate D2)

- Approved by, date, channel: the project owner, 2026-10-10, Claude Code session (list page only)
- Approved Lovable commit: 06635773527081b4baaa25a5074840a725aca3d6
