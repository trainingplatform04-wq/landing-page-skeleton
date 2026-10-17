# Architecture

Nuxt 4 with the **flat layout** (`srcDir: '.'`): Nuxt directories live at the repository root. Code owns the pages, Sanity owns their content ([ADR 0004](../adr/0004-skeleton-scope-and-data-flow.md)). What is core and what is an example: [`docs/SKELETON.md`](../SKELETON.md).

## Directories

| Directory                | Contains                                                                                         | Rule                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `pages/`                 | One file per route                                                                               | Call one composable (or render one content component), set the head.                |
| `layouts/`               | The frame: header, main, footer, consent window                                                  | Single root element.                                                                |
| `components/<Name>/`     | `Name.vue` + `Name.spec.ts`                                                                      | Plain props in (`types/content.types.ts`), markup out. Never fetch.                 |
| `composables/<useName>/` | `useName.ts` (view type, mapper, composable), `name.query.ts` (its query), `useName.spec.ts`     | The **only** place that reads the CMS, through `useCmsQuery`.                       |
| `utils/<topic>/`         | `topic.utils.ts` + `topic.utils.spec.ts`                                                         | Pure functions (no network, no Nuxt runtime). `groqd/` holds the fragments.         |
| `constants/`             | Routes, locales, menu, consent, cookies, analytics events, time zone, Sanity settings            | Shared values; routes, locales and Sanity settings also by the Studio.              |
| `types/`                 | `content.types.ts` (what components receive), `sanity.types.ts` (**generated**)                  | Never edit the generated file.                                                      |
| `plugins/`               | `consent.client.ts`, `analytics.client.ts` (browser only, `.client` suffix)                      | One document-wide click listener each; logic in `utils/consent`, `utils/analytics`. |
| `modules/`               | `sitemap.ts`: reads published pages, offers and articles when building                           | Loaded before the `~/` alias exists: relative imports.                              |
| `i18n/locales/`          | `de.json`, `en.json`                                                                             | The same keys in every language.                                                    |
| `studio/`                | Sanity Studio, its schemas and the staging seed ([`docs/sanity/SANITY.md`](../sanity/SANITY.md)) | Its own workspace and Vercel project.                                               |
| `tests/`                 | `e2e/` (Playwright, fixture CMS), `visual/` (design gate), `webPerformance/`, `orchestration/`   | See CODING_STANDARDS §6.                                                            |

Vue, Nuxt and module functions are auto-imported. Project code is imported explicitly from its `~/` file. ESLint enforces the rules it can (`eslint.config.mjs`, CODING_STANDARDS §1–2).

## Data flow

```
Sanity ─▶ useCmsQuery(name, query, params) ─▶ mapper ─▶ view (plain values) ─▶ page ─▶ components
```

A page composable reads top to bottom (`composables/useArticle/` is the full example):

1. **The query**, in `<name>.query.ts`: groqd (`q` from `utils/groqd/groqd.utils.ts`), checked against the schema types, its answer validated when it arrives. Shared pieces are fragments in `groqd.utils.ts` (`imageFragment`, `ctaFragment`, `closingFragment`, `seoFragment`, `richTextField`, `translationsField`, …).
2. **The view type**: everything the page shows, in plain values (`ArticleView`).
3. **The mapper**: a pure function from the answer to the view. Shared mappers are in `utils/content` (`toImage`, `toCta`, `toClosing`, `toSeo`, `toSlugs`, `toRichText`, `editorOrder`) and `utils/post`.
4. **The composable**: `useMapContext()` (the visitor's language), `await useCmsQuery(...)`, then the mapper. `null` from the query means unpublished (an empty `noindex` view) or an unknown slug (404).

`useCmsQuery` sends `$locale` with every query, caches the answer per query and parameters (`useAsyncData`), and answers **503** on a CMS error (`{ optional: true }` returns `null` instead: the footer). It is the only caller of the Sanity client (ESLint).

## Rendering

- **Server first**: `await` in `<script setup>` sends complete HTML with the right status (SEO).
- **Thin pages**: a page without interaction renders one content component with `hydrate-never` (`OffersContent`, `MagazineContent`, `AboutContent`, `LegalDocument`, `ArticleContent`). It calls the composable on the server; its data and code never reach the browser's first JavaScript.
- **Interactions on thin pages**: one small component without CMS data adds them through `data-` attributes (`ArticleEnhancer`, `hydrate-on-idle`: progress bar, current heading, video, share). Disclosures are native `<details>`.
- **Hydration modes**: header `hydrate-on-idle`, accordions `hydrate-on-visible`, cards and heroes `hydrate-never`. A new component takes the lightest mode that works.
- **Footer**: `SiteFooter` runs `useFooter` on the server, never hydrated; it is keyed by the locale, so a language switch renders a new one.
- **Images**: the largest one loads first (`fetchpriority="high"` + preload), the others lazily. The editor's crop is cut by Sanity's CDN and the focal point becomes `object-position` (`toImage`). Vercel Image Optimization in deployments, IPX locally and in E2E.
- **Web performance: aim 90+, never under 80** on PageSpeed Insights (CODING_STANDARDS §7.1). Only the entry chunk is preloaded and links prefetch on interaction (`nuxt.config.ts`).

## Routing and languages

German at `/…`, English at `/en/…`, every path translated ([ADR 0001](../adr/0001-i18n-translated-urls.md)). Paths are declared once in `constants/routes.constants.ts`.

| Page     | File                        | German             | English               |
| -------- | --------------------------- | ------------------ | --------------------- |
| Home     | `pages/index.vue`           | `/`                | `/en`                 |
| Offers   | `pages/offers/index.vue`    | `/angebote`        | `/en/offers`          |
| Offer    | `pages/offers/[slug].vue`   | `/angebote/<slug>` | `/en/offers/<slug>`   |
| Magazine | `pages/magazine/index.vue`  | `/magazin`         | `/en/magazine`        |
| Article  | `pages/magazine/[slug].vue` | `/magazin/<slug>`  | `/en/magazine/<slug>` |
| About    | `pages/about.vue`           | `/ueber-uns`       | `/en/about`           |
| FAQ      | `pages/faq.vue`             | `/faq`             | `/en/faq`             |
| Contact  | `pages/contact.vue`         | `/kontakt`         | `/en/contact`         |
| Imprint  | `pages/imprint.vue`         | `/impressum`       | `/en/imprint`         |
| Privacy  | `pages/privacy.vue`         | `/datenschutz`     | `/en/privacy`         |

- **Menu**: `constants/navigation.constants.ts`. The legal pages are in the footer.
- **Language switcher**: `<SwitchLocalePathLink>` (right from the server render). Offer and article pages pass their translated slugs with `useSetI18nParams`.
- **Lists with pages** (the magazine): the filter and the page are in the URL; the CMS sends only the current page (`utils/pagination`).
- **Editor links** (a page, an offer or an `https:`/`mailto:`/`tel:` address) are resolved by the mappers (`utils/link`); editors never type internal URLs.

## Consent and analytics

Nothing optional loads before the visitor agrees (GDPR, TDDDG §25). Developer guide: [`docs/analytics/DEVELOPER_GUIDE.md`](../analytics/DEVELOPER_GUIDE.md).

- `ConsentBanner` (server HTML, never hydrated) is the first window; a head script keeps a click made before the app runs.
- `plugins/consent.client.ts` runs CookieConsent as the engine (stored choice, Settings window, cookie clearing) and records the choice in `useConsent`. Buttons anywhere use `data-consent="accept-all | reject-all | settings"`.
- `plugins/analytics.client.ts` loads Google Tag Manager only once Statistics is granted (`NUXT_PUBLIC_GTM_ID`; empty = no statistics offered). Events: `useAnalytics().track()` or `data-track="<event>"` + `data-track-<param>` attributes. Never personal data.
- `constants/cookies.constants.ts` is the one cookie inventory (window, privacy page table, tests). A new cookie raises `CONSENT_REVISION`.
- **Color mode**: the `color-mode` cookie (necessary) holds `system` until the visitor uses the header switch; an inline head script applies the scheme before the first paint.

## Forms

The contact form (`UForm` + zod) sends in the background to an EU form service (`NUXT_PUBLIC_CONTACT_FORM_ACTION`), the one documented exception to "no `$fetch`" (`useContactForm`). It renders in the browser only; without a configured service the page shows an email link.

## SEO

- `useSiteHead()` (app and error page): title template, Open Graph defaults. `@nuxtjs/i18n` adds `lang`, canonical, hreflang, og:locale.
- `usePageMeta(view.seo)` on every page: title, description, share image, `noindex` when asked or unpublished.
- Structured data: the module's defaults, `LocalBusiness` (footer), `Article` and `Question` (article page).
- `/sitemap.xml` lists the published pages, offers and articles with their language versions, read from Sanity when building (`modules/sitemap.ts`). Only `NUXT_SITE_ENV=production` is indexable.

## Recipes

- **Add a page**: a route in `ROUTE_PATHS` (+ `PAGE_TYPES`), a schema in `studio/schemas/pages/` (registered in `studio/schemas/index.ts`), a composable with its query file, the page file, its i18n keys, its demo content in `studio/seed/`, its test content in `tests/e2e/sanity/fixtures.ts`, an E2E spec.
- **Add a collection with its own URL** (like offers): a schema with `languageField`, `titleField`, `slugField`, added to `COLLECTION_SCHEMAS` and `TRANSLATED_TYPES`; a list and a detail composable (404 for an unknown slug, `toSlugs` for the switcher); add it to `modules/sitemap.ts`.
- **Add a list of references on a page** (like testimonials): `referenceListField` in the schema; in the query filter by language before `deref()`.
- **Add a paginated list**: see `useMagazine` with `utils/pagination`.
- **Add a locale**: [ADR 0001](../adr/0001-i18n-translated-urls.md).
- **Global client state** (cart, login): add `@pinia/nuxt` then. **Server routes**: never in this project.
