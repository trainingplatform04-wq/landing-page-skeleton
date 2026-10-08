---
id: '0001'
page: offers
kind: change # existing code page (offers list + offer detail), new design and fields; includes a design-system change
status: approved # draft → approved (gate D1) → built → design-approved (gate D2) | discarded
lastUpdated: '2026-10-08'
---

# Brief 0001: offers, list and detail page in the FitFlow brand

## Intent

"I need to add a new page for offers to expose my training offers (private fitness, shared …)."
The site presents four training offers on the offers page and on one detail page per offer, in
the FitFlow look (Lovable), so that a visitor picks an offer and requests a free trial.

## Product (Product Owner)

- **Goal**: the visitor requests a **free trial** for one offer. Success: trial requests per offer
  (contact form submissions with the offer pre-selected).
- **Audience**: adults in Berlin looking for a coach, mostly from search and recommendations,
  **mobile first**.
- **Message**: "Your goals. Your pace." Four ways to train with a coach; every one starts with a
  free trial.
- **Calls to action**: primary on every card and on the detail page: "Request a free trial" →
  contact page with the offer pre-selected. Secondary on the list page band: "Talk to a coach" →
  contact page.

## Design system (Tech Lead, Frontend): the site adopts the FitFlow brand

The site adopts the FitFlow theme for **every page**, not only offers:

| Token        | FitFlow (Lovable)                                              | Code today      | Change                                                                                 |
| ------------ | -------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------- |
| Primary      | orange `oklch(0.67 0.22 42)` (dark mode `oklch(0.72 0.21 45)`) | Nuxt UI `green` | custom `@theme` scale in `assets/css/main.css`, `ui.colors.primary` in `app.config.ts` |
| Neutral      | warm grey (`oklch(… 55–75)` hues)                              | `slate`         | warm neutral scale (`stone` is the closest Tailwind scale)                             |
| Display font | Barlow Condensed, 900, uppercase (h1–h3)                       | Nuxt UI default | `@nuxt/fonts`, self-hosted                                                             |
| Body font    | Manrope                                                        | Nuxt UI default | `@nuxt/fonts`, self-hosted                                                             |
| Radius       | 0.5rem                                                         | Nuxt UI default | `--ui-radius`                                                                          |
| Surfaces     | dark band `surface-strong` `oklch(0.16 0.012 55)`              | none            | semantic token for dark sections                                                       |

The Lovable project knowledge then mirrors these tokens (DESIGN_WORKFLOW §6.3). **Recommended
split (Tech Lead):** two changesets and two tasks from this brief: `0001-design-system-fitflow`
(tokens and fonts, every page) first, then `0002-offers` (the two pages).

## Sections (Designer)

### Offers list (`/angebote`, `/en/offers`)

| Order | `data-section` | Purpose                                                           | Status                             |
| ----- | -------------- | ----------------------------------------------------------------- | ---------------------------------- |
| 1     | offers-hero    | Dark band: kicker "Training programs", display title, short intro | changed (FitFlow exists, new copy) |
| 2     | offers-grid    | The 4 offer cards                                                 | changed (3 → 4 cards, new fields)  |
| 3     | offers-help    | "Not sure what fits?" band + "Talk to a coach"                    | unchanged in layout, new copy      |

**offers-grid** layout: 1440: 4 cards in one row, the featured card raised (`-translate-y-4`),
orange border, badge "Most popular" on its top edge. 768: 2 × 2. 375: stacked, the featured card
first. Card: photo (16:10) → kicker → name (display, uppercase) → summary (2–3 lines) →
"from €X / unit" → separator → 4–5 features with check icons → full-width button (featured:
solid; others: outline). States: button hover, focus-visible; card hover lifts by 2px.

### Offer detail (`/angebote/<slug>`, `/en/offers/<slug>`), new in Lovable

| Order | `data-section` | Purpose                                                             | Status |
| ----- | -------------- | ------------------------------------------------------------------- | ------ |
| 1     | offer-hero     | Photo, kicker, name, pitch, price ("€89 per session"), trial button | new    |
| 2     | offer-included | "What's included": features with a one-line detail each             | new    |
| 3     | offer-steps    | "How it works": 4 numbered steps                                    | new    |
| 4     | offer-faq      | 3 questions about this offer (accordion)                            | new    |
| 5     | offer-closing  | Dark band: "Ready to start?" + trial button                         | new    |

**offer-hero** layout: 1440: two columns, text left, photo right (4:3), section height ≈ 560px.
768 and 375: photo on top, text below. **offer-steps**: 1440: 4 columns with large numbers
(display font); 375: vertical list. **offer-faq**: accordion, first item closed; states: open,
closed, focus-visible.

**Motion**: the existing FitFlow `reveal` (700 ms ease-out, 18px rise) on section entry, disabled
under `prefers-reduced-motion`; accordion open/close 200 ms. Nothing else moves.

**Media**: Lovable-generated placeholder photos (one per offer, used on the card and the detail
hero), no text inside images; they become the staging seed; real photos are uploaded later in
the Studio (min. 1600 × 1000).

## Content (every locale), drafted by the Product Owner, to validate at D1

### List page

| Element              | DE                                                                                               | EN                                                                              | Sanity field or i18n key                              |
| -------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Hero kicker          | Trainingsangebote                                                                                | Training programs                                                               | `offersPage.kicker` (new)                             |
| Hero title           | Deine Ziele. Dein Tempo.                                                                         | Your goals. Your pace.                                                          | `offersPage.title`                                    |
| Hero intro           | Wähle, wie viel Begleitung du willst. Jedes Angebot startet mit einem kostenlosen Probetraining. | Choose how much support you want. Every offer starts with a free trial session. | `offersPage.intro`                                    |
| Featured badge       | Am beliebtesten                                                                                  | Most popular                                                                    | i18n `offers.featured`                                |
| Price prefix / units | ab · € · pro Einheit / pro Monat / pro Person                                                    | from · € · per session / per month / per person                                 | i18n `offers.priceFrom`, `offers.unit.*`              |
| Card button          | Kostenloses Probetraining                                                                        | Request a free trial                                                            | i18n `offers.trialCta`                                |
| Help title           | Nicht sicher, was passt?                                                                         | Not sure what fits?                                                             | `offersPage.cta` (label) + new `offersPage.helpTitle` |
| Help text            | Erzähl uns, wo du gerade stehst. Wir helfen dir bei der Wahl.                                    | Tell us where you are now. We'll help you choose.                               | `offersPage.helpText` (new)                           |
| Help button          | Mit einem Coach sprechen → Kontakt                                                               | Talk to a coach → contact                                                       | `offersPage.cta`                                      |

### The four offers (collection `offer`, one document per language)

|              | Private                                                                                                              | Small group (featured)                                                                      | Online                                                                                                    | Duo                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Name DE / EN | Personal Training / Personal training                                                                                | Kleingruppe / Small group                                                                   | Online-Coaching / Online coaching                                                                         | Duo-Training / Duo training                                                                    |
| Slug DE / EN | personal-training / personal-training                                                                                | kleingruppe / small-group                                                                   | online-coaching / online-coaching                                                                         | duo-training / duo-training                                                                    |
| Kicker DE    | Ganz persönlich                                                                                                      | Gemeinsam stärker                                                                           | Trainiere überall                                                                                         | Zu zweit motivierter                                                                           |
| Kicker EN    | Fully personal                                                                                                       | Stronger together                                                                           | Train anywhere                                                                                            | Better as a pair                                                                               |
| Price        | ab 89 € pro Einheit                                                                                                  | ab 29 € pro Einheit                                                                         | ab 149 € pro Monat                                                                                        | ab 59 € pro Person                                                                             |
| Summary DE   | Eins-zu-eins-Coaching, abgestimmt auf deinen Körper, deinen Kalender und deine Ziele.                                | Coaching in kleinen Gruppen mit höchstens acht Personen: Technik, Energie, Verbindlichkeit. | Dein Plan in der App, wöchentliches Feedback und Antworten innerhalb von 24 Stunden.                      | Ihr teilt euch Coach und Einheit: persönliches Training mit Partnerin, Partner oder Freund.    |
| Summary EN   | One-to-one coaching built around your body, your schedule and your goals.                                            | Small-group coaching with eight people at most: technique, energy, commitment.              | Your plan in an app, weekly feedback and answers within 24 hours.                                         | Share one coach and one session: personal training with your partner or a friend.              |
| Features DE  | Bewegungsanalyse · Individueller Trainingsplan · Direkter Draht zum Coach · Ernährungs-Check-ins · Termine nach Wahl | 2 Einheiten pro Woche · Max. 8 Personen · Monatlicher Fortschritts-Check · Community        | Plan in der App, wöchentlich angepasst · Video-Feedback zur Technik · Antwort in 24 h · Monatlich kündbar | Gemeinsamer Plan für zwei · Ziele für jede Person · Flexible Termine · Halber Preis pro Person |
| Features EN  | Movement assessment · Tailored programme · Direct line to your coach · Nutrition check-ins · Sessions when you want  | 2 sessions a week · 8 people max · Monthly progress check · Community                       | Plan in the app, adjusted weekly · Video feedback on technique · Answers within 24 h · Cancel monthly     | One plan for two · Goals for each person · Flexible sessions · Half price per person           |

Fields: `title`, `slug`, `summary`, `image`, `price` (exists); **new**: `kicker`, `priceUnit`
(`session` · `month` · `person`), `features` (list of short strings), `featured` (boolean, one
offer at a time, editor's choice).

### Detail page (per offer, same structure; Private shown, the PO drafts the other three the same way)

| Element                   | DE                                                                               | EN                                                                 | Field                                                                               |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Pitch                     | Training, das sich nach dir richtet, nicht umgekehrt.                            | Training that fits you, not the other way round.                   | `offer.summary`                                                                     |
| Price line                | 89 € pro Einheit                                                                 | €89 per session                                                    | `offer.price` + `offer.priceUnit`                                                   |
| Included (title + detail) | Bewegungsanalyse: wir starten mit deinem Körper, nicht mit einem Plan. …         | Movement assessment: we start with your body, not with a plan. …   | `offer.features` (+ `offer.body` for longer text)                                   |
| Steps title               | So funktioniert's                                                                | How it works                                                       | i18n `offer.stepsTitle`                                                             |
| Steps 1–4                 | Probetraining · Analyse & Ziele · Dein Plan · Training & Check-ins               | Free trial · Assessment & goals · Your plan · Training & check-ins | `offer.steps` (new: title + one line each)                                          |
| FAQ title                 | Fragen zum Angebot                                                               | Questions about this offer                                         | i18n `offer.faqTitle`                                                               |
| FAQ (3)                   | Brauche ich Vorerfahrung? · Wie oft sollte ich trainieren? · Kann ich pausieren? | Do I need experience? · How often should I train? · Can I pause?   | `offer.faq` → `faqItem` references (as in `docs/tasks/add-faq-to-offer-example.md`) |
| Closing                   | Bereit loszulegen? · Kostenloses Probetraining                                   | Ready to start? · Request a free trial                             | i18n `offer.closingTitle`, `offers.trialCta`                                        |

## Technical notes (Tech Lead, Frontend)

- **Pages exist in code** (`pages/offers/index.vue`, `pages/offers/[slug].vue`, routes
  `offers` / `offers-slug`): no new route. The Lovable prototype adds the detail route.
- **Schema** (`studio/schemas/collections/offer.schema.ts`): new `kicker`, `priceUnit`,
  `features`, `featured`, `steps`, `faq` (references). `offersPage`: new `kicker`, `helpTitle`,
  `helpText`. Seed (`studio/seed/seed.data.ts`): the 4 offers × 2 languages, translation links,
  FAQ items, placeholder photos.
- **Trial pre-selection**: the card button links to `/kontakt?offer=<slug>`; the contact form
  reads it and pre-selects the offer (contact form change, no server code).
- **Featured**: if several offers are featured, the first by order wins; if none, no badge.
- **Nuxt UI mapping**: hero → `UPageHero`/custom dark `UPageSection`; grid → `UPageGrid` +
  `UPageCard`; badge → `UBadge`; features → list with `UIcon i-lucide-check`; button → `UButton`;
  FAQ → `UAccordion` (existing `FaqList`); steps → `UPageSection` with a grid.
- **Risks**: German words are long in uppercase display type (e.g. "TRAININGSANGEBOTE"): the
  hero title must wrap, never overflow at 375; fonts self-hosted (performance, GDPR, pixel
  parity); one `h1` per page.
- **Lovable prototype**: no backend for the prototype (its existing Supabase/Drizzle contact
  function stays untouched, not extended).

## Out of scope

- Online booking or payment; a calendar of group sessions; reviews per offer; a comparison table.
- Restyling the home, FAQ and contact pages in Lovable (the brand change reaches them in code
  through the tokens; their Lovable redesign is a later brief).

## Open questions

- Real prices and features per offer: the drafted ones are placeholders until you confirm them.
- Duo: price "per person" or "per session for two"? (drafted: per person)

## Definition of ready (gate D1)

- [x] Goal, audience and primary call to action are stated
- [x] Every section has a `data-section` name, a purpose and a status
- [x] Layout at 375 / 768 / 1440 is described for every new or changed section
- [x] States and motion are listed (or "none")
- [x] Content exists in every locale, or its provider and date are named
- [x] Every element is classified: Sanity field, i18n key, or decoration
- [x] Token changes are listed (or "none")
- [x] Out of scope is written; no open question blocks the build

## Compiled prompt (gate D1 approved, go given 2026-10-08)

Sent as-is by `/design` (Step 5) when the workspace has credits. The project knowledge
(conventions, theme) was written on 2026-10-08 and is not repeated here.

```text
Goal: redesign the offers page and add one detail page per offer, so a visitor picks an offer and requests a free trial. Follow the project knowledge (sections per file, content files per language, theme, breakpoints, states). Touch only what is listed here.

1. Header: add a DE | EN switch (search param ?lang=en, default de). Header/footer texts move to src/content/common.de.ts / common.en.ts. No other header change.

2. Offers list, route /offers, sections in this order:
   a) OffersHero (data-section="offers-hero"): keep today's dark band. Kicker "Trainingsangebote" / "Training programs"; title "Deine Ziele. Dein Tempo." / "Your goals. Your pace." (second sentence in primary); intro "Wähle, wie viel Begleitung du willst. Jedes Angebot startet mit einem kostenlosen Probetraining." / "Choose how much support you want. Every offer starts with a free trial session."
   b) OffersGrid (data-section="offers-grid"): 4 cards. 1440: one row of 4; 768: 2×2; 375: stacked, featured card first. Card: photo 16:10 (generate one fitting placeholder per offer) → kicker → name (display, uppercase) → summary → "ab 89 € pro Einheit" / "from €89 per session" → separator → features with check icons → full-width button "Kostenloses Probetraining" / "Request a free trial" linking to /contact?offer=<slug>. The featured card (field featured: true, first one wins, none = no badge) is raised (-translate-y-4), has a primary border, shadow-accent and the badge "Am beliebtesten" / "Most popular"; its button is solid, the others outline. Card hover: lift 2px. Offers (DE / EN):
      - Personal Training / Personal training · slug personal-training · kicker "Ganz persönlich" / "Fully personal" · ab 89 € pro Einheit · "Eins-zu-eins-Coaching, abgestimmt auf deinen Körper, deinen Kalender und deine Ziele." / "One-to-one coaching built around your body, your schedule and your goals." · Bewegungsanalyse, Individueller Trainingsplan, Direkter Draht zum Coach, Ernährungs-Check-ins, Termine nach Wahl / Movement assessment, Tailored programme, Direct line to your coach, Nutrition check-ins, Sessions when you want
      - Kleingruppe / Small group · slug kleingruppe / small-group · featured · "Gemeinsam stärker" / "Stronger together" · ab 29 € pro Einheit · "Coaching in kleinen Gruppen mit höchstens acht Personen: Technik, Energie, Verbindlichkeit." / "Small-group coaching with eight people at most: technique, energy, commitment." · 2 Einheiten pro Woche, Max. 8 Personen, Monatlicher Fortschritts-Check, Community / 2 sessions a week, 8 people max, Monthly progress check, Community
      - Online-Coaching / Online coaching · slug online-coaching · "Trainiere überall" / "Train anywhere" · ab 149 € pro Monat · "Dein Plan in der App, wöchentliches Feedback und Antworten innerhalb von 24 Stunden." / "Your plan in an app, weekly feedback and answers within 24 hours." · Plan in der App wöchentlich angepasst, Video-Feedback zur Technik, Antwort in 24 h, Monatlich kündbar / Plan in the app adjusted weekly, Video feedback on technique, Answers within 24 h, Cancel monthly
      - Duo-Training / Duo training · slug duo-training · "Zu zweit motivierter" / "Better as a pair" · ab 59 € pro Person · "Ihr teilt euch Coach und Einheit: persönliches Training mit Partnerin, Partner oder Freund." / "Share one coach and one session: personal training with your partner or a friend." · Gemeinsamer Plan für zwei, Ziele für jede Person, Flexible Termine, Halber Preis pro Person / One plan for two, Goals for each person, Flexible sessions, Half price per person
   c) OffersHelp (data-section="offers-help"): keep today's band. "Nicht sicher, was passt?" / "Not sure what fits?"; "Erzähl uns, wo du gerade stehst. Wir helfen dir bei der Wahl." / "Tell us where you are now. We'll help you choose."; button "Mit einem Coach sprechen" / "Talk to a coach" → /contact.
   Card names link to the detail page.

3. New route /offers/$slug, one page per offer, sections in this order:
   a) OfferHero (offer-hero): 1440 two columns, text left, the offer's photo right (4:3), ~560px high; 768/375 photo on top. Kicker, name (h1), pitch, price line "89 € pro Einheit" / "€89 per session", trial button → /contact?offer=<slug>.
   b) OfferIncluded (offer-included): title "Das ist enthalten" / "What's included"; each feature with a one-line explanation.
   c) OfferSteps (offer-steps): "So funktioniert's" / "How it works"; 4 numbered steps with large display numbers (1440: 4 columns; 375: vertical): Probetraining / Free trial · Analyse & Ziele / Assessment & goals · Dein Plan / Your plan · Training & Check-ins / Training & check-ins, each with one line.
   d) OfferFaq (offer-faq): "Fragen zum Angebot" / "Questions about this offer"; 3 questions as an accordion (first closed; ?state=open opens the first).
   e) OfferClosing (offer-closing): dark band "Bereit loszulegen?" / "Ready to start?" + trial button.
   Write the explanations, step lines and FAQ answers for each offer yourself, short, in the same tone, in DE and EN (placeholders the client will confirm).

Do not change: home, FAQ and contact pages, the theme, the footer, any backend code.
Acceptance: every listed section renders at 375/768/1440 in DE and EN; no raw colour values; no new dependency; content only in src/content/*.de.ts / *.en.ts.
```

## Iterations (Lovable)

| #   | Date       | Message id | Commit | Credits | Result                                                       |
| --- | ---------- | ---------- | ------ | ------- | ------------------------------------------------------------ |
| 1   | 2026-10-08 | —          | —      | 0       | Not sent: workspace out of credits; retry when credits renew |

## Approval (gate D2)

- Approved by, date, channel:
- Approved Lovable commit:
