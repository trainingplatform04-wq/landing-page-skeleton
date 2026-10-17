# ADR 0001: Languages and translated URLs

- **Status**: Accepted (2026-10-02, last updated 2026-10-17 to match the code).

## Decision

| Topic               | Rule                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URLs                | German at `/…` (no prefix), English at `/en/…`. Every path is translated (`/angebote`, `/en/offers`).                                                                   |
| Page paths          | Declared once in code, `constants/routes.constants.ts` (`ROUTE_PATHS`): read by the router, the Studio's link picker, the sitemap and the tests.                        |
| Slugs               | Only offers and articles have one, set by the editor, unique per type and language. A changed slug makes the old URL answer 404 (no redirects).                         |
| Content             | **One document per language** for everything with text (`language` field). No field-level translation. Every query filters `language == $locale`.                       |
| Translations        | `@sanity/document-internationalization` links the language versions of collection documents (for hreflang and the language switcher).                                   |
| Missing language    | A page that isn't published renders empty with `noindex`. An offer or article without a translation disables the other language in the switcher and drops its hreflang. |
| Browser language    | No redirect (`detectBrowserLanguage: false`): `/` is German, `/en` English, the switcher is in the header.                                                              |
| hreflang, canonical | From `@nuxtjs/i18n` (`experimental.strictSeo`), with `x-default` (German).                                                                                              |

## Why

Google's rules: one language per URL, bidirectional hreflang to URLs that exist, a self-canonical per language, no forced redirect on deep links. One document per language gives editors a single model ("<Type> → Deutsch / English") and the code a single path (filter by `language`).

## Adding a locale

`constants/i18n.constants.ts` (`LOCALES`), a file in `i18n/locales/`, its path in every entry of `ROUTE_PATHS` (TypeScript flags the missing ones).
