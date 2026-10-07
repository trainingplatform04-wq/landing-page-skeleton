# ADR 0002: Code-owned sections with CMS pages under them

- **Status**: **Superseded by [ADR 0003](0003-structured-content.md)** (2026-10-05). Kept for history. Was: accepted by the owner (2026-10-03, codebase audit). Supersedes the URL table, slug policy 3 and the "no plugin" choice for pages of [ADR 0001](0001-i18n-translated-urls.md). Everything else in ADR 0001 stays (one document per language, Google rules G-1 to G-8).
- **Date**: 2026-10-03
- **Task**: [`docs/tasks/codebase-audit-refactor.md`](../tasks/codebase-audit-refactor.md)

## 1. Problem

One catch-all route (`pages/[...slug].vue`) served every CMS page from a slug owned by editors, at any depth. As a result:

- Code and CMS shared one flat URL space, so app paths had to be reserved by hand (`RESERVED_SLUGS`) and a regex test checked the copy.
- Editors, not code, decided the site structure: even a menu page's URL came from the CMS.
- Every unknown URL cost a CMS request before its 404.
- Language versions of a page were found as "the documents of the same type", which only holds for one page per type. A second page would have listed every other page as its translation (hreflang, sitemap).

The owner's rule: **the menu and the structure are fixed in code** (sections such as Kids, Family, Women, Men, with translated URLs); **some pages under a section are dynamic**, created by editors.

## 2. Decision

| Concern                     | Decision                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages tree                  | One folder per section: `pages/<section>/index.vue` (landing) and `pages/<section>/[slug].vue` (CMS pages). The catch-all route is deleted.  |
| Translated paths            | Declared once in `i18n/routes.ts` (`SECTIONS`, `PAGE_PATHS`), passed to `i18n.pages` (`customRoutes: 'config'`) and read by the sitemap.     |
| Menu                        | Built from code (`useNavigation`), no CMS call.                                                                                              |
| Section landing             | Code route; an optional CMS singleton per section and language (`sectionLanding-kids-de`) supplies the intro; translated defaults otherwise. |
| CMS pages                   | One type, `sectionPage`, with a `section` field (set by the desk), one document per language.                                                |
| Slugs                       | One segment, translated per language, unique per section and language. They can't collide with a code route.                                 |
| Linking language versions   | `@sanity/document-internationalization` ("Translations" menu). The slug is excluded from the copy, so each language gets its own.            |
| Language switcher, hreflang | `useLocaleAlternates` (kept): the page reports its URL per published language; other languages get no hreflang (G-3).                        |
| Sitemap                     | Code routes from the router (with i18n alternates); CMS pages from Sanity at build time, alternates from the translation links.              |
| 404                         | Unknown top-level path: no route, no CMS call. Unknown slug, or slug of another language: 404 thrown by `useSectionPage`. CMS error: 503.    |

URLs:

| Page             | German                | English                    |
| ---------------- | --------------------- | -------------------------- |
| Section landing  | `/kinder`             | `/en/kids`                 |
| Section page     | `/kinder/schwimmkurs` | `/en/kids/swimming-course` |
| Trainer calendar | `/trainer-kalender`   | `/en/trainer-calendar`     |

## 3. Options considered

| Option                                                       | Verdict                                                                                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| A. Keep the catch-all, add a parent reference in Sanity      | Rejected: editors keep owning the structure, reserved slugs stay, a CMS call per URL.                                              |
| B. One generic `pages/[section]/[slug].vue`                  | Rejected: translating the section segment needs custom route generation; the menu routes become implicit. Fewer files, more magic. |
| C. One Sanity type per section                               | Rejected for now: 4× schemas and queries for identical fields. Revisit if sections need different content models.                  |
| **D. Section folders + one `sectionPage` type + the plugin** | ⭐ Chosen.                                                                                                                         |

### Why the plugin now

ADR 0001 chose "no plugin" because every page was a singleton, linked implicitly by its fixed id. Sections hold **lists** of pages, which ADR 0001 named as the moment to add it. A hand-made `translationKey` field was considered: it needs no dependency but lets editors mistype keys and gives no "create translation" button.

### Why `useSetI18nParams` is not used

`switchLocalePath` merges the current route's params into the target, so a language without a translation would get `/en/kids/<german-slug>`, a 404 (checked in `@nuxtjs/i18n` 10.6 source). `useLocaleAlternates` already answers "is this page published in that language?", which is what G-3 needs.

## 4. Consequences

- New section: add it to `SECTIONS`, copy a section folder in `pages/`, add its texts. The Studio desk and the sitemap follow.
- Editors create a page from "Sections → Kids → Deutsch → Pages", then its translation from the document's "Translations" menu.
- No migration: no dataset holds content in the old model (ADR 0001 §4.7).
