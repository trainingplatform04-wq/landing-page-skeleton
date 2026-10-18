---
id: '0003'
page: about # new page: the About page
kind: new-page
status: design-approved # draft → approved (gate D1) → built → design-approved (gate D2) | discarded
lastUpdated: '2026-10-16'
---

# Brief 0003: about, the About page

## Intent

"Create a new about page. It should contain image, short description." A page of its own that
introduces the coach with one big picture and a short text. The about section of the home page
stays as a teaser and links to this page.

## Product (Product Owner)

- **Goal**: the visitor trusts the coach as a person and requests a **free trial**. Success:
  clicks on the closing call to action, contact form submissions coming from this page.
- **Audience**: adults in Berlin who found the studio through search or a recommendation and
  want to know who they would train with, **mobile first**.
- **Message**: "A certified coach who helps you get stronger and pain-free, since 2010."
  Proof: the portrait, the years of experience, the number of clients (from the home highlights).
- **Calls to action**: closing band "Request a free trial" → contact page (primary, one on the
  page). Menu entry "About" → this page.

---

# Part 1: Design (the only input of the Lovable prompt)

Lovable only designs. This part says **what** to build, in English, with nothing about how our
site works.

## Pages

| Page  | Prototype URL | Menu                            |
| ----- | ------------- | ------------------------------- |
| About | `/about`      | "About", after "Magazine" (new) |

The existing menu (Offers, Magazine, FAQ, Contact), header, footer and the magazine's closing
band are reused unchanged. Only the menu gets one more entry.

## Sections (Designer)

| Order | `data-section` | Purpose                                              | Status |
| ----- | -------------- | ---------------------------------------------------- | ------ |
| 1     | about-hero     | Big picture, title and the short description         | new    |
| 2     | about-closing  | The magazine's dark closing band: free trial request | new    |

- **about-hero**: light background, one column. The picture comes first and is the page's first
  image (it loads first): full content width (1120px max, rounded corners) at 1440 with a
  21:9 ratio, 16:9 at 768 (content width, rounded), edge to edge at 375 with a 4:3 ratio and no
  radius. Below it, centred, with 48px of space at 1440 (32px at 375): a small uppercase label
  "About me" in the primary colour, the title as the page's only h1 in display type, uppercase
  (≈ 56px at 1440, 40px at 768, 32px at 375), and the description as one paragraph at 20px / 1.6,
  muted colour, max 640px wide, centred. No other element: no buttons, no cards.
- **about-closing**: identical to the magazine's closing band (title, text, one primary
  button).

**States**: none beyond link and button hover and focus-visible, as on the other pages.

**Motion**: none. The picture and the text are static; nothing animates on load or on scroll,
so reduced motion needs no variant.

**Media**: one picture of the coach at work: a coach in a bright gym talking to a client after
a session, natural light, photo, no text in the image, wide composition that still reads when
cropped to 4:3 (subject near the centre).

## Content (English, in full)

Page `/about`:

- Label: About me
- Title: Hi, I'm your coach
- Description: Since 2010 I have helped people get stronger and move without pain. In my
  studio in Berlin-Mitte every session is built around you: your goal, your pace, your back.
  No big machines, no pressure, just training that fits your life.
- Picture alt: Coach talking to a client after a training session

Closing band (as on the magazine):

- Title: Ready for your first session?
- Text: Write to me and we will find a date for your free trial session.
- Button: Request a free trial → `/contact`

Menu entry: About

## Do not change

- Header, footer, the other menu entries, the home page and all magazine pages.

---

# Part 2: Implementation (our side, never sent to Lovable)

## Content model (Tech Lead)

| Element                  | Sanity field, i18n key or decoration                             |
| ------------------------ | ---------------------------------------------------------------- |
| Page document            | new `aboutPage` (one per language, id `aboutPage-<locale>`)      |
| Label "About me"         | field `label`                                                    |
| Title (h1)               | field `title`                                                    |
| Description              | field `description` (text, short, max about 300 characters)      |
| Picture and alt text     | fields `image` (required) and `imageAlt`; uploaded by the seed   |
| Closing band             | same fields as the magazine's closing band (title, text, button) |
| SEO title / description  | the shared `seo` object                                          |
| Menu label               | i18n key `nav.about` in every locale                             |
| Radius, spacing, colours | decoration, existing tokens                                      |

## Other locales (Product Owner)

German, for the i18n files and the development seed:

- Menu: Über mich
- Label: Über mich
- Title: Hallo, ich bin Ihre Trainerin
- Description: Seit 2010 helfe ich Menschen, stärker zu werden und sich schmerzfrei zu bewegen.
  In meinem Studio in Berlin-Mitte dreht sich jede Einheit um Sie: Ihr Ziel, Ihr Tempo, Ihr
  Rücken. Keine großen Geräte, kein Druck, sondern Training, das zu Ihrem Alltag passt.
- Picture alt: Trainerin im Gespräch mit einer Kundin nach dem Training
- Closing: Bereit für die erste Einheit? / Schreiben Sie mir, und wir finden einen Termin für
  Ihr kostenloses Probetraining. / Probetraining anfragen

## Technical notes (Tech Lead, Frontend)

- **Scope**: a new page of the code (ADR 0004 counted 8 pages; this makes 9, so the scope line in
  `CLAUDE.md`, ADR 0004 and ARCHITECTURE is updated by an amending note in the same PR). The home
  about section stays and gets a link to this page.
- **Route**: `about` → DE `/ueber-uns`, EN `/about` in `ROUTE_PATHS`; `PAGE_TYPES.about =
'aboutPage'`; `pages/about.vue`; entry in `NAVIGATION` after `magazine`.
- **Studio**: `aboutPage` schema, registered in the Studio structure like the other page
  documents; `pnpm typegen` and commit `types/sanity.types.ts`.
- **Seed**: `studio/seed/seed.data.ts` gets the page in both languages and a generated demo
  picture labelled "DEMO", in the same PR.
- **Composable**: `composables/useAbout/useAbout.ts` with its spec (query with groqd, view,
  mapper, `useAsyncData`).
- **Components** (Nuxt UI first): `AboutHero` (`NuxtImg`/`UPageSection`; the picture takes
  `priority`), closing band reused from the magazine. The page is thin: both sections are
  `hydrate-never`, no client JavaScript.
- **SEO**: one h1, sitemap and hreflang from the existing modules, picture alt from Sanity.
- **Performance**: the picture is the LCP; AVIF/WebP with explicit `sizes`, 21:9 / 16:9 / 4:3 via
  `art direction` (`<picture>`), no layout shift.
- **Tokens**: none new.
- **Privacy**: no tracking, embed, form or third party added; the Privacy Officer is not needed.
- **Size**: one feature, one changeset, one task.

## Out of scope

- A team section, values, timeline, certificates or testimonials on this page.
- Changing the home about section beyond adding a link to this page.
- A contact form on this page.

## Open questions

- None blocking. The real photo and the real text are replaced by the editors in Sanity; the
  design uses placeholder copy and a stock-style picture.

## Definition of ready (gate D1)

- [x] Goal, audience and primary call to action are stated
- [x] Part 1 names every page with its URL, and every section with a `data-section`, a purpose and a status
- [x] Layout at 375 / 768 / 1440 is described for every new or changed section
- [x] States and motion are listed (or "none")
- [x] The English content is complete in Part 1; every other locale exists in Part 2, or its provider and date are named
- [x] Every element is classified: Sanity field, i18n key, or decoration
- [x] Token changes are listed (or "none")
- [x] Out of scope is written; no open question blocks the build

## Compiled prompt

Expected credit use: 1 message (one page, two sections).

> Add a new page "About" at `/about` and a menu entry "About" after "Magazine". Reuse the existing header, footer and the magazine's dark closing band unchanged; do not change any other page.
>
> Section 1, `data-section="about-hero"`: light background, one column. First, a picture of a coach in a bright gym talking to a client after a session (natural light, photo, no text in the image, subject near the centre), alt "Coach talking to a client after a training session". Size: content width (max 1120px) with rounded corners and a 21:9 ratio at 1440; 16:9 at 768 (content width, rounded); edge to edge with a 4:3 ratio and no radius at 375. Below it, centred, 48px of space (32px at 375): a small uppercase label "About me" in the primary colour; the page's only h1 "Hi, I'm your coach" in display type, uppercase (about 56px at 1440, 40px at 768, 32px at 375); one paragraph, 20px / 1.6, muted, max 640px wide, centred: "Since 2010 I have helped people get stronger and move without pain. In my studio in Berlin-Mitte every session is built around you: your goal, your pace, your back. No big machines, no pressure, just training that fits your life." No buttons or cards.
>
> Section 2, `data-section="about-closing"`: identical to the magazine's closing band. Title "Ready for your first session?", text "Write to me and we will find a date for your free trial session.", primary button "Request a free trial" linking to `/contact`.
>
> No animation. Link and button hover and focus-visible as on the other pages.

## Iterations (Lovable)

| #   | Date       | Message id                      | Commit  | Credits | Result                                                                   |
| --- | ---------- | ------------------------------- | ------- | ------- | ------------------------------------------------------------------------ |
| 1   | 2026-10-16 | umsg_01m52zkspqfz9tb8ykdcdfh976 | cdebe49 | 1.8     | Built: `/about` with about-hero and about-closing, menu and footer entry |

## Approval (gate D2)

- Approved by, date, channel: the project owner (client role), 2026-10-16, Claude Code session (`/design`, gate D2: "Approve")
- Approved Lovable commit: cdebe4929d00c9bb2eea8451c5188f91e2ddd41e
