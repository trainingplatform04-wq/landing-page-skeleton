# Architecture

Nuxt 4 with the **flat layout** (`srcDir: '.'`): Nuxt directories live at the repository root. This is a **skeleton** ([ADR 0004](../adr/0004-skeleton-scope-and-data-flow.md)): every pattern exists once, so a fork can copy it.

## Directory responsibilities

| Directory                | Contains                                                                                                                                                                                                        | Rule                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `pages/`                 | One file per route (`faq.vue`, `offers/[slug].vue`, …)                                                                                                                                                          | Call one composable, set the head, compose components. No data access.   |
| `layouts/`               | The page frame (header, main, footer)                                                                                                                                                                           | Single root element.                                                     |
| `components/<Name>/`     | `Name.vue` + `Name.spec.ts`, named after their content (`OfferCard`, `FaqList`)                                                                                                                                 | Props in, markup out. Props are plain values (`types/content.types.ts`). |
| `composables/<useName>/` | `useName.ts` (query, view type, mapper, composable) + `useName.spec.ts`                                                                                                                                         | The **only** place that fetches data (`useCms` + `useAsyncData`).        |
| `utils/<topic>/`         | `topic.utils.ts` + `topic.utils.spec.ts`                                                                                                                                                                        | Pure functions: no network, no Nuxt runtime.                             |
| `constants/`             | `routes.constants.ts`, `i18n.constants.ts`, `navigation.constants.ts`, `date.constants.ts`, `sanity.constants.ts`                                                                                               | Shared values (routes and locales also by the Studio).                   |
| `types/`                 | `content.types.ts` (what components receive), `sanity.types.ts` (**generated**)                                                                                                                                 | Never edit the generated file.                                           |
| `modules/`               | `sitemap.ts`: reads published pages and offers when building                                                                                                                                                    | Loaded before the `~/` alias exists: relative imports only.              |
| `i18n/locales/`          | `en.json`, `de.json`                                                                                                                                                                                            | The same keys in every language.                                         |
| `studio/`                | Sanity Studio: `schemas/{pages,collections,objects,settings}`, `sanity.structure.ts`, `utils/`, `seed/` (staging demo content)                                                                                  | Deployed as its own Vercel project.                                      |
| `tests/e2e/`             | Playwright specs against a test CMS (`sanity/fixtures.ts`); `smoke.spec.ts` also runs after deploys                                                                                                             |                                                                          |
| `tests/visual/`          | The design gate: `pnpm design:capture` / `pnpm design:verify` screenshot our sections (approved by the human against the Lovable preview) and catch later visual changes (`docs/design/DESIGN_WORKFLOW.md` §13) |                                                                          |

Enforced by ESLint (`eslint.config.mjs`): no data fetching in views, no CMS types in views, no server code, no `#imports`, no parent-relative imports, import groups, `<script>` → `<template>` → `<style>` block order.

**Imports**: Vue, Nuxt and module functions (`computed`, `useRoute`, `useI18n`, `useSeoMeta`, …) are auto-imported. Project code is imported explicitly from its `~/` file, so every name says where it comes from.

## Content model

**Code owns the pages, Sanity owns their content.** An editor fills in fields; they never assemble a page.

| Kind        | Documents                                                                                        | Language                                  |
| ----------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Pages       | `homePage`, `offersPage`, `magazinePage`, `faqPage`, `contactPage`, `imprintPage`, `privacyPage` | One per language, id `<type>-<language>`  |
| Collections | `offer` and `post` (have a slug), `category`, `author`, `testimonial`, `faqItem`                 | One language each, linked as translations |
| Settings    | `businessProfile` (no text to translate), `siteSettings` (footer note)                           | One in total / one per language           |

- The home page holds the about section (portrait, text, highlights) and the testimonials. Every button is optional: the site shows it only when it has a label and a link.
- The datasets start **empty**. In the Studio, **Pages → Home page → Deutsch** opens `homePage-de`; the first edit creates it with its language set. Pages can't be created from the menu, duplicated or deleted.
- A page that isn't published in a language **renders empty** there: its title from the UI texts, `noindex`, not in the sitemap. Its hreflang links stay: @nuxtjs/i18n leaves a language out only together with disabling the switcher, which is kept for offers without a translation (every page exists in every language). The footer links the legal pages in the language of the page.
- A testimonial is shown only with the client's recorded consent.

## Data flow

```
Sanity ──groqd query──▶ composable (useAsyncData) ──mapper──▶ view (plain values) ──▶ page ──props──▶ components
```

Every page composable has the same four parts, top to bottom (see `composables/useHome/useHome.ts`):

1. **The query**, written with groqd (`q` from `utils/groqd/groqd.utils.ts`). It is checked against the Sanity schema while typing, and the answer is validated when it arrives.
2. **The view type**: everything the page shows, in plain values (`HomeView`).
3. **The mapper**: a pure function from the CMS data to the view (links resolved, prices and dates formatted in the business time zone, images flattened). Tested through the composable's spec.
4. **The composable**: `await useAsyncData(key, fetch)`, then 503 on a CMS error (404 for an unknown offer slug), then the mapper.

- **Types**: `pnpm typegen` generates the Sanity schema types (`types/sanity.types.ts`) that groqd uses; query results are typed by groqd itself.
- **One language per request** ([ADR 0001](../adr/0001-i18n-translated-urls.md)): every query filters `language == $locale`.
- **`await` in `<script setup>`**: the server sends complete HTML with the right status code, which search engines need.
- **The layout** (`useLayout`) loads the footer note, the business profile and which legal pages exist. It never throws: on a CMS error the frame shows what the code knows.
- **Links** chosen by editors (a page, an offer, or an `https:`/`mailto:`/`tel:` address) are resolved in the mappers (`utils/link/link.utils.ts`); editors never type internal URLs.

## Routing & languages

- **URLs**: German at `/…`, English at `/en/…`, every URL translated. There is no redirect by browser language: `/` is German, `/en` English, and the language switcher is in the header.
- **Routes** are declared once in `constants/routes.constants.ts` (`ROUTE_PATHS`), read by `nuxt.config.ts` (`i18n.pages`), the Studio's link picker and the sitemap.

| Page     | File                      | German             | English             |
| -------- | ------------------------- | ------------------ | ------------------- |
| Home     | `pages/index.vue`         | `/`                | `/en`               |
| Offers   | `pages/offers/index.vue`  | `/angebote`        | `/en/offers`        |
| Offer    | `pages/offers/[slug].vue` | `/angebote/<slug>` | `/en/offers/<slug>` |
| Magazine | `pages/magazine.vue`      | `/magazin`         | `/en/magazine`      |
| FAQ      | `pages/faq.vue`           | `/faq`             | `/en/faq`           |
| Contact  | `pages/contact.vue`       | `/kontakt`         | `/en/contact`       |
| Imprint  | `pages/imprint.vue`       | `/impressum`       | `/en/imprint`       |
| Privacy  | `pages/privacy.vue`       | `/datenschutz`     | `/en/privacy`       |

- **The magazine** filters by category and pages in the URL (`?category=`, `?page=`, the same in every language), [ADR 0005](../adr/0005-magazine.md).
- **The menu** is a constant (`constants/navigation.constants.ts`): offers, magazine, FAQ, contact. The site name links home; the legal pages are in the footer.
- **An offer's slug** is set by the editor, unique per language. Changing it later makes the old URL answer 404 (no redirects).
- **hreflang, canonical and the language switcher** come from `@nuxtjs/i18n` (`experimental.strictSeo`). The offer page passes its translated slugs with `useSetI18nParams`; the switcher uses `<SwitchLocalePathLink>`, which is right from the first server render. An offer without a translation shows the other language disabled.

## Forms

The contact form (`UForm`, validated with zod) sends the message in the background to an EU form service (`NUXT_PUBLIC_CONTACT_FORM_ACTION`), which emails the site owner. A toast thanks the visitor or reports an error; the page never reloads. No server code and no secret key: this one call (`useContactForm`) is the only exception to the "no `fetch`" rule. The form renders in the browser only, since it needs JavaScript to send. Without a configured service the page shows an email link.

## SEO

- `useSiteHead()` (in `app.vue`/`error.vue`): the title template and Open Graph defaults. `@nuxtjs/i18n` adds `lang`, canonical, hreflang and og:locale.
- `usePageMeta(view.seo)` on every page: title, description, share image, `noindex` when asked or unpublished.
- **Structured data** (nuxt-schema-org): the module's `WebSite`/`WebPage` defaults plus one `LocalBusiness` from the business profile (registered by the layout).
- `/robots.txt` and `/sitemap.xml`: the sitemap lists the published pages and offers with their language versions, read from Sanity **when building** (`modules/sitemap.ts`). A CMS error fails the build instead of shipping an empty sitemap. Only `NUXT_SITE_ENV=production` is indexable.

## Rendering & platform

- SSR on Vercel (Node 24). Images through Vercel Image Optimization in deployments, IPX locally and in E2E. `sizes` use a breakpoint on every entry (`sm:100vw lg:50vw`).
- Security headers are declared in `nuxt.config.ts` (`routeRules`).
- **JavaScript on the first screen** (web performance budget, `lighthouse.config.ts`): only the entry chunk is preloaded (`build:manifest` hook in `nuxt.config.ts`). Components hydrate as little as possible, the server HTML being the same: links-only sections `hydrate-never` (cards, heroes, footer, legal text), interactive ones below the fold `hydrate-on-visible` (accordions), the header `hydrate-on-idle`. A new component picks the lightest mode that keeps it working.
- The largest image of a page loads first (`fetchpriority="high"` + preload); other images are `loading="lazy"`; images request WebP from the local image server (Vercel negotiates WebP/AVIF itself).
- Dates are formatted in the business time zone (`BUSINESS_TIME_ZONE`), so server and browser render the same text.
- `app.config.ts` holds only the Nuxt UI theme; environment values go in `runtimeConfig` (`NUXT_*`).

## Recipes

Each recipe is a short checklist. A complete earlier implementation of the removed features is in the git tag `reference-full-2026-10`.

- **Add a page**: a route in `ROUTE_PATHS` (+ `PAGE_TYPES` if the CMS fills it), a schema in `studio/schemas/pages/` (registered in `studio/schemas/index.ts`), a composable with its four parts, the page file, its UI texts, its test content in `tests/e2e/sanity/fixtures.ts`, its demo content in `studio/seed/seed.data.ts`, and the route in `tests/e2e/smoke.spec.ts`.
- **Add a collection with its own URL** (like offers): a schema with `languageField`, `titleField`, `slugField`; add it to `TRANSLATED_TYPES` (`studio/utils/singleton/singleton.utils.ts`) and to the desk; a list composable and a detail composable (404 for an unknown slug, `useSetI18nParams` for the switcher); add it to `modules/sitemap.ts`.
- **Add a list of references on a page** (like testimonials): `referenceListField` in the page schema, filter the references by language before `deref()` in the query, map them to a plain type in `types/content.types.ts`.
- **Add a dated, filterable collection**: see the magazine (`post`, `category`, `author`, `useMagazine`, [ADR 0005](../adr/0005-magazine.md)): ordered by date, filter and page in the URL.
- **Add redirects for changed slugs**: record the old URL when a slug changes (Studio publish action) and turn the records into 301 route rules when building (see the git tag).
- **Add a locale**: `LOCALES`, a file in `i18n/locales/`, its path in every entry of `ROUTE_PATHS` (TypeScript flags the missing ones).

## When to add…

- **Global client state** (cart, login shared across pages): add `@pinia/nuxt` with a `stores/` directory then.
- **Server routes**: not in this project. See CLAUDE.md.
