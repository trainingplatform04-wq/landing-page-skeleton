# The skeleton: what is core, what is an example

Every project built from this repository keeps the **core** and chooses its **examples**. An example is a finished feature that shows one pattern; keep it, adapt it, or remove it with its checklist below. Starting a project: [`NEW_PROJECT.md`](NEW_PROJECT.md).

## Core (every project keeps it)

| Area         | Files                                                                                                                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frame        | `app.vue`, `error.vue`, `layouts/default.vue`, `components/{AppHeader,AppFooter,SiteFooter,LocaleSwitcher}`, `composables/{useLayout,useFooter,useSiteHead,usePageMeta}`                                                                                     |
| Pages        | Home (`pages/index.vue`, `useHome`, `HomeHero`), contact (`pages/contact.vue`, `useContact`, `useContactForm`, `ContactForm`), imprint and privacy (`pages/{imprint,privacy}.vue`, `useLegal`, `LegalDocument`, `LegalContent`): legally required in Germany |
| CMS access   | `composables/useCmsQuery`, `composables/useMapContext`, `utils/groqd`, `utils/content`, `utils/link`, `types/`                                                                                                                                               |
| Shared UI    | `components/{CtaLink,RichText,ClosingBand}`                                                                                                                                                                                                                  |
| i18n and SEO | `constants/{i18n,routes,navigation}.constants.ts`, `i18n/locales/`, `modules/sitemap.ts`, `utils/seo`                                                                                                                                                        |
| Privacy      | `plugins/`, `components/{ConsentBanner,CookieTable}`, `composables/{useConsent,useAnalytics}`, `constants/{consent,cookies,analytics}.constants.ts`, `utils/{consent,analytics}`, `docs/analytics/`, `docs/legal/`                                           |
| Helpers      | `utils/{date,price,pagination}`                                                                                                                                                                                                                              |
| Studio       | `studio/sanity.*.ts`, `studio/utils/`, `studio/schemas/{fields.ts,objects/,settings/}`, the page schemas of the core pages, `studio/seed/` (builders, runner)                                                                                                |
| Quality      | `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `tests/` (helpers, fixture CMS, smoke, orchestration, web performance, design gate), `.github/`                                                                                             |
| AI agents    | `CLAUDE.md`, `.ai/`, `.claude/`, `.agents/`                                                                                                                                                                                                                  |

## Examples (keep, adapt or remove)

| Example           | Pattern it shows                                                    |
| ----------------- | ------------------------------------------------------------------- |
| **About**         | A simple page from an approved design (picture, text, closing band) |
| **FAQ**           | A collection listed on its own page and picked for another (home)   |
| **Testimonials**  | References with consent, shown on the home page                     |
| **Home sections** | Optional sections switched on and off by the editor                 |

## Removing an example

Remove every line of its row, then run `pnpm typegen`, `pnpm verify` and E2E. The removed code stays in git history.

| Example      | Files and entries to remove                                                                                                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| About        | `pages/about.vue`; `components/{AboutContent,AboutHero}`; `composables/useAbout`; schema `aboutPage`; `ROUTE_PATHS.about`; `PAGE_TYPES.about`; menu entry; the home "About" link; its seed copy and document; `tests/e2e/about.spec.ts` and fixture |
| FAQ          | `pages/faq.vue`; `components/FaqList`; `composables/useFaq`; schemas `faqPage`, `faqItem`; `ROUTE_PATHS.faq`; `PAGE_TYPES.faq`; menu entry; the home FAQ section; `FAQ` in `seed.copy.ts`; `tests/e2e/faq.spec.ts` and fixtures; `faq.*` i18n keys  |
| Testimonials | `components/TestimonialList`; schema `testimonial`; the home testimonials section; `TESTIMONIALS` in `seed.copy.ts`; fixtures                                                                                                                       |

A collection removed from the Studio also leaves `COLLECTION_SCHEMAS` (`studio/schemas/index.ts`) and `TRANSLATED_TYPES` (`studio/utils/singleton/singleton.utils.ts`); a page leaves `PAGE_SCHEMAS`. `studio/schemas/schemas.spec.ts` fails until the lists agree.
