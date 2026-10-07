# ADR 0003: Structured content (code-owned pages, CMS-owned content)

- **Status**: Accepted by the owner at Gate G1 (2026-10-05). **Supersedes [ADR 0002](0002-sections-routing.md)**. Amends [ADR 0001](0001-i18n-translated-urls.md) (see § 11). **Amended by [ADR 0004](0004-skeleton-scope-and-data-flow.md)** (2026-10-06): smaller scope, groqd queries, no redirects, unpublished pages render empty.
- **Date**: 2026-10-05
- **Task**: `docs/tasks/structured-content.md` (removed; in git history and the tag `reference-full-2026-10`)
- **Decision owner**: human. Every decision below was confirmed by the owner; the questions and the rejected options are listed in § 12.
- **Inputs**: research on Sanity structured content vs page builders, three read-only Tech Lead audits (proposal, existing code, end state) and four Tech Lead plans (Studio, web app, cross-cutting, documentation).

## 1. Context

ADR 0002 let editors create pages under code-owned sections. The owner rejected both extremes: a page builder (the CMS composes pages: "a website builder, not a CMS") and a fully hard-coded site. This is a **skeleton for a fitness/training coach website**: the client edits content and adds offers, posts and classes, but does not build pages.

## 2. Decision in one table

| Code (Nuxt) owns                                                          | Sanity owns                                                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Every page file, its translated URL, the layout, section order and design | The texts, images and SEO of every page (one typed document per page and language)                |
| The menu (entries hidden automatically when their data is empty)          | Collections editors create freely: offers, blog posts, recurring classes, testimonials, FAQ items |
| Features: schedule rendering, contact form, JSON-LD, language switcher    | Choices inside fixed slots: show/hide toggles, ordered lists, featured references, CTA targets    |
| The prefix of collection URLs (`angebote`/`offers`, `blog`)               | The last URL segment of an offer or post, one per language                                        |

Editors cannot create pages, choose a page URL, or change layout or colours. A new training type is a new `offer` document (no code). A new page type needs code (schema, page, composable, route, menu entry, fixtures, specs): that is the deliberate cost of structured content.

## 3. Pages and URLs

| Route name    | Page file                 | German             | English             | Content                              |
| ------------- | ------------------------- | ------------------ | ------------------- | ------------------------------------ |
| `index`       | `pages/index.vue`         | `/`                | `/en`               | `homePage-<lang>`                    |
| `about`       | `pages/about.vue`         | `/ueber-mich`      | `/en/about`         | `aboutPage-<lang>`                   |
| `offers`      | `pages/offers/index.vue`  | `/angebote`        | `/en/offers`        | `offersPage-<lang>` + offers         |
| `offers-slug` | `pages/offers/[slug].vue` | `/angebote/<slug>` | `/en/offers/<slug>` | `offer` by slug + language           |
| `schedule`    | `pages/schedule.vue`      | `/kursplan`        | `/en/schedule`      | `schedulePage-<lang>` + events       |
| `pricing`     | `pages/pricing.vue`       | `/preise`          | `/en/pricing`       | `pricingPage-<lang>`                 |
| `contact`     | `pages/contact.vue`       | `/kontakt`         | `/en/contact`       | `contactPage-<lang>` + business data |
| `imprint`     | `pages/imprint.vue`       | `/impressum`       | `/en/imprint`       | `imprintPage-<lang>`                 |
| `privacy`     | `pages/privacy.vue`       | `/datenschutz`     | `/en/privacy`       | `privacyPage-<lang>`                 |
| `blog`        | `pages/blog/index.vue`    | `/blog`            | `/en/blog`          | `blogPage-<lang>` + posts            |
| `blog-slug`   | `pages/blog/[slug].vue`   | `/blog/<slug>`     | `/en/blog/<slug>`   | `post` by slug + language            |

- File and route names are English. Translated paths are declared **once** in `ROUTE_PATHS` (`constants/routes.constants.ts`), read by `nuxt.config.ts` (`i18n.pages`, `customRoutes: 'config'`), the Studio (CTA route options) and the sitemap. `@nuxtjs/i18n` adds the `/en` prefix. A lone `src/` folder was rejected: the project uses the flat layout.
- `[slug].vue` is one dynamic URL segment (Nuxt 2's `_slug.vue`). A static file always wins over a dynamic one.

## 4. Content model (Sanity)

### Page singletons: one document per page **and** language

Fixed id `<type>-<lang>` (`homePage-de`). Each has a hidden read-only `language`, `title` and `seo`. The desk opens each one by its fixed id, so the editor's first edit creates it (no seed in production; staging can get demo content, [ADR 0004](0004-skeleton-scope-and-data-flow.md)); they cannot be created from the menu, duplicated or deleted. Validation blocks publishing an empty imprint.

| Type           | Fields (besides `language`, `title`, `seo`)                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `homePage`     | `hero { title, text, image, cta }`, `showOffers`, `featuredOffers[]` (max 3), `showTestimonials`, `testimonials[]`, `showFaq`, `faq[]`, `finalCta` |
| `aboutPage`    | `portrait`, `body`, `qualifications[]`, `showTestimonials`, `testimonials[]`, `cta`                                                                |
| `offersPage`   | `intro`, `order[]` (offers shown first, in this order; the others follow by title), `cta`                                                          |
| `schedulePage` | `intro`, `emptyText`, `bookingCta`                                                                                                                 |
| `pricingPage`  | `intro`, `plans[]`, `notes`, `showFaq`, `faq[]`                                                                                                    |
| `contactPage`  | `intro`, `successText`                                                                                                                             |
| `imprintPage`  | `body` (required), `updatedAt`                                                                                                                     |
| `privacyPage`  | `body` (required), `updatedAt`                                                                                                                     |
| `blogPage`     | `intro`, `emptyText`                                                                                                                               |
| `siteSettings` | `tagline`, `defaultSeo`, `footerNote` (text only)                                                                                                  |

### Collections

| Type          | Language                                         | Fields                                                                                                                                                         |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `offer`       | one per language, translations linked by plugin  | `title`, `slug`, `summary`, `image`, `body`, `format` (one-on-one / group / online), `duration` (minutes), `price { amount, unit, vatIncluded }`, `cta`, `seo` |
| `post`        | one per language, translations linked by plugin  | `title`, `slug`, `publishedAt`, `excerpt`, `cover`, `body`, `relatedOffers[]` (max 3), `seo`                                                                   |
| `testimonial` | one per language, translations linked by plugin  | `quote`, `author`, `photo`, `offer`, `consentConfirmed` (must be true)                                                                                         |
| `faqItem`     | one per language, translations linked by plugin  | `question`, `answer`                                                                                                                                           |
| `event`       | **language-neutral** (no text)                   | `offer`, `weekday` (1–7), `startTime`, `endTime`, `validFrom`, `validUntil`, `exceptions[]`, `location`, `status` (scheduled / full / cancelled), `capacity`   |
| `redirect`    | **language-neutral**, created by the Studio only | `from` (old path with locale prefix), `to` (reference to an offer or post), `createdAt`                                                                        |

### Settings and objects

- `businessProfile` (**language-neutral**, id `businessProfile`): `name`, `email`, `phone`, `address`, `openingHours[]`, `socials[]`, `geo`. Used by the footer, the contact page and JSON-LD: facts are entered once.
- Objects: `seo` (title, description, image, noIndex), `accessibleImage` (required alt), `link` (kind: route key from `ROUTE_PATHS` without `[slug]` routes / reference to an offer or post in the same language / external `https:`, `mailto:`, `tel:`), `cta` (label + link), `richText` (paragraphs, h2/h3, lists, bold/italic, link annotation, image), `pricingPlan` (name, price, unit, features, highlighted, cta; prices are gross).
- Every reference only lists documents in the same language; reference fields and slugs are excluded from the plugin's "create translation" copy.

## 5. Routing, translations, language switcher

- Static pages: the URL in each language comes from the router. A language whose singleton is not published gets no hreflang and the switcher sends to that language's home.
- Offers and posts: the detail composable reports the slug of each published translation (from `translation.metadata`). A missing translation gets no hreflang and the switcher sends to the **list page** in that language (`/en/offers`, `/en/blog`).
- Which routes report translations is explicit (a route → content map next to `ROUTE_PATHS`), not inferred from a `slug` route param.
- `useSetI18nParams` is not used: `switchLocalePath` merges the current params and produces a 404 link for a missing translation (checked in `@nuxtjs/i18n` 10.6).
- **Slug changes create redirects automatically.** Slugs stay editable; publishing an offer or post whose published slug differs creates a `redirect` document (deterministic id per old path, so no duplicates; `to` is a reference, so no chains; a path that becomes live again stops redirecting). Release and scheduled publishing are disabled so the publish action is the only way to publish. Redirects are applied as **301** `routeRules` at build time (no server code); a Sanity publish webhook triggers the redeploy.

## 6. Data loading and queries

- Each `defineQuery` lives at the top of the composable that runs it (TypeGen scans `composables/**`; it resolves `~/` fragment imports through the Studio tsconfig paths, verified in `@sanity/codegen` 8.1.1). Query names are unique across the repo. Shared fragments live in `constants/groq.constants.ts`. Singleton queries filter on `_type` **and** `_id` (TypeGen narrows on `_type`).
- **One exception**: the build-time query read by `nuxt.config.ts` (sitemap pages and redirects) lives in `utils/sitemap/sitemap.queries.ts` with its fragments inlined, because the config loader cannot resolve `~/`. A spec keeps the inlined fragments equal to the shared ones.
- **`await useAsyncData` everywhere.** No `useLazyAsyncData`, no `lazy: true` (enforced by ESLint).
- The layout loads its data in **one** query (`useLayoutData`: site settings, business profile, menu visibility, published legal pages). It never throws: on a CMS error the footer renders without CMS data and the menu shows its defaults.
- Pages: CMS error → 503, unknown offer or post slug → 404. An unpublished singleton renders the page empty (title from the UI texts, `noindex`, no hreflang, not in the sitemap), legal pages included: the code owns the page, the CMS fills it. Empty lists render an empty state.

## 7. Schedule

Classes are **recurring**: one `event` per class (weekday, start/end time, validity, exceptions). The week view is computed in pure utils in the business time zone (DST-safe). The class title comes from the linked offer's translation in the current language; a class whose offer has no translation in that language is hidden there.

## 8. Contact form

A native HTML form (`<form method="POST" action>`) posts to an EU-hosted form service whose URL comes from `NUXT_PUBLIC_CONTACT_FORM_ACTION`. No server code, no `fetch`, works without JavaScript; fields and labels in code/i18n; honeypot; a native GDPR consent checkbox linking the privacy page; the service redirects back with `?sent=1` to show `successText`. When the variable is empty, the form is replaced by an email link. CSP `form-action` allows only the site and the configured service. Nuxt UI's `UForm` and `UCheckbox` are not used here (they need JavaScript to submit/toggle).

## 9. SEO

- `nuxt-schema-org`: `LocalBusiness` and `WebSite` (layout, from `businessProfile`), `Person` (about), `Service` + `Offer` + `BreadcrumbList` (offer), `Event` per occurrence (schedule, offer), `BlogPosting` + `BreadcrumbList` (post). Builders are pure functions in `utils/seo`.
- Sitemap built at deploy time from Sanity only (`excludeAppSources`): published singletons per language and offers/posts with their alternates; `noIndex` documents and redirect sources excluded.
- Legal (Germany): imprint (§ 5 DDG) and privacy linked from every page footer, in code; when an English legal page is missing, the English footer links to the German page. Prices include VAT (`vatIncluded`). Testimonials require confirmed consent. No third-party embeds without a consent pattern.

## 10. Code organisation

- `constants/`: `routes.constants.ts`, `groq.constants.ts`, `i18n.constants.ts`, `calendar.constants.ts`, `sanity.constants.ts`.
- `composables/<useName>/`, `components/<Name>/`, `utils/<topic>/` with co-located specs; components named after their page/content (`HomeHero`, `OfferCard`, `ScheduleWeek`, `ContactForm`…).
- Studio: `sanity.config.ts`, `sanity.cli.ts`, `sanity.structure.ts`; `schemas/{pages,collections,objects,settings}/`; `utils/slug/`, `utils/singleton/`, `utils/redirect/`. Translation plugin for offer, post, testimonial, faqItem (weak references, its delete action on every translated type).
- ESLint enforces: import order (① Vue/Nuxt/libraries ② project `~/` ③ `import type` ④ siblings `./`), no lazy data loading, no data access in views, no `server/` or `api/` code.
- Portable Text: `@portabletext/vue` (same major as `@nuxtjs/sanity`), wrapped by `RichText`.
- Removed: everything about kids/family/women/men sections, `sectionPage`, `sectionLanding`, `globalFooter`, the per-language `trainerEvent`, the `queries/` folder, `i18n/routes.ts`.

## 11. Amendments to ADR 0001

1. Pages are code-owned singletons `<type>-<lang>` without slugs. Offer and post slugs are one segment, unique per type and language (replaces policy 3).
2. `@sanity/document-internationalization` links the language versions of offers, posts, testimonials and FAQ items (the "upgrade path" ADR 0001 planned).
3. A third class of documents: **language-neutral, no text** (`businessProfile`, `event`, `redirect`). Everything with text stays one document per language (replaces the § 5 trade-off for the footer and events).
4. Missing translation: offers/posts → list page in that language; page singletons → no hreflang (extends policy 1).
5. Slug changes create 301 redirects automatically (replaces policy 4; satisfies G-6). The publish webhook becomes a required setup step.
6. Orphaned old documents (`sectionPage`, `sectionLanding`, `globalFooter`, `trainerEvent`) are removed with a documented one-off command; no migration (no dataset holds real content).

## 12. Questions and answers (2026-10-05)

| #   | Question                              | Chosen                                                                                                                                                     | Rejected                                                         |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| —   | Page model                            | typed singleton per page and language                                                                                                                      | generic page content type; field-level translation; page builder |
| Q1  | Routes file                           | `constants/routes.constants.ts`                                                                                                                            | `i18n/routes.ts`; `src/routes/`                                  |
| Q2  | Contact form submission               | EU form service via native form action                                                                                                                     | one server route with Resend; mailto                             |
| Q3  | Business facts                        | one language-neutral `businessProfile`                                                                                                                     | per language                                                     |
| Q4  | Schedule                              | recurring classes                                                                                                                                          | one document per session                                         |
| Q5  | Class whose offer lacks a translation | hidden in that language                                                                                                                                    | shown with the German title                                      |
| Q6  | Unpublished singleton                 | created from the desk on first edit (staging: or by `pnpm studio:seed`, amended 2026-10-07); missing → empty page, `noindex` (amended 2026-10-06, was 404) | i18n placeholder content                                         |
| Q7  | Layout CMS error                      | degrade silently                                                                                                                                           | 503 for the whole site                                           |
| Q8  | Slug change                           | automatic 301 redirects                                                                                                                                    | read-only slugs; no redirects                                    |
| Q9  | Blog                                  | MVP now (list, post, rich text)                                                                                                                            | full blog; later                                                 |
| Q10 | English legal page missing            | English footer links to the German page                                                                                                                    | required in both languages                                       |
| Q11 | Orphaned old content                  | documented cleanup command                                                                                                                                 | migration script                                                 |
| Q12 | JSON-LD                               | `nuxt-schema-org`                                                                                                                                          | hand-written                                                     |
| Q13 | GROQ fragments                        | `constants/groq.constants.ts`                                                                                                                              | in `sanity.constants.ts`; inline only                            |
| Q14 | Featured offers on home               | manual references, max 3                                                                                                                                   | first N by order                                                 |
| Q15 | Portable Text                         | `@portabletext/vue`                                                                                                                                        | hand-written renderer                                            |
| Q16 | Import-order tooling                  | `simple-import-sort` with custom groups                                                                                                                    | `eslint-plugin-perfectionist`                                    |
| Q17 | Site name                             | "Coach Studio" placeholder, configurable by env                                                                                                            | "Landing Page"                                                   |
| —   | Data loading                          | `await useAsyncData` everywhere                                                                                                                            | lazy loading for secondary data                                  |
| —   | Visual editing                        | later                                                                                                                                                      | now                                                              |

## 13. Consequences

- Editors get a predictable Studio (Pages, Offers, Blog posts, Events, Testimonials, FAQ, Business profile, Site settings, Redirects) and cannot break layout or URLs.
- Every page has its own schema, query, types and composable: more files, but each one is obvious and fully typed.
- E2E fixtures cover every singleton in both languages; the test suite grows accordingly.
- Deployments need the publish webhook (sitemap and redirects are built at deploy time) and, for the contact form, `NUXT_PUBLIC_CONTACT_FORM_ACTION`.
