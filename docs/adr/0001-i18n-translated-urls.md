# ADR 0001: Multilingual Sanity + Nuxt with translated URLs

- **Status**: Accepted at Gate G1 (2026-10-02): D′, German default, `/en/` prefix for English. Amended 2026-10-03 (§5): one document per language for **all** content. **Amended by [ADR 0003](0003-structured-content.md)** (2026-10-05): code-owned pages, the translation plugin for collections, language-neutral documents without text, list-page fallback and automatic redirects (see § 6). ADR 0002 is superseded.
- **Date**: 2026-10-02
- **Task**: [`docs/tasks/i18n-translated-urls.md`](../tasks/i18n-translated-urls.md)
- **Decision owner**: Tech Lead (recommendation), human (approval)

## 1. Problem

Content is localized **field-level** (`{ en, de }`) on singletons, and paths are code-owned and untranslated (`/training-program`, `/de/training-program`). We want:

1. Editors own **all** content per language, **including the URL slug**.
2. The app fetches **one language** per request.
3. Translated URLs: `/training-program` ↔ `/de/schulungsprogramm`.
4. **One** page, component and composable for every locale.
5. **Easy for clients**: an editor who has never seen Sanity must find "the German version" without training.

## 2. Google baseline (non-negotiable)

| #   | Rule                                                                  |
| --- | --------------------------------------------------------------------- |
| G-1 | One language per URL, locale in the path. No `?lang=`, no cookie-only |
| G-2 | Bidirectional hreflang between translations, plus `x-default`         |
| G-3 | Never hreflang to a URL that 404s                                     |
| G-4 | Self-referencing canonical per language                               |
| G-5 | No forced redirect on deep links                                      |
| G-6 | Localized slugs allowed; keep them stable (301 on change)             |
| G-7 | `<html lang>`, and the sitemap carries the alternates                 |
| G-8 | No unreviewed machine translation served as a language                |

## 3. Options considered (scored /100: SEO 25, editor 20, DRY 15, scale 15, perf 10, maintenance 15)

| Option                                                                  | Score  | Verdict                                        |
| ----------------------------------------------------------------------- | ------ | ---------------------------------------------- |
| A. Field-level + code-owned translated paths                            | 68     | Editors can't own URLs                         |
| B. Field-level internationalized arrays + per-locale slug               | 78     | Languages still publish together               |
| C. Document-level everywhere (plugin)                                   | 87     | Global facts (phone, email) drift per language |
| D. Hybrid: document-level for pages, field-level for globals (plugin)   | 93     | Right model, but heavier than this site needs  |
| **D′. Hybrid, "one document per page per language", no plugin (final)** | **95** | ⭐ Same model as D, fewer moving parts         |
| E. Dataset per market                                                   | 63     | Only for autonomous country organizations      |

### Why D′ instead of D

D is the right **model** (if it has a URL, each language is its own document; global facts stay single). What D adds on top is `@sanity/document-internationalization`, which links translations through extra `translation.metadata` documents. For this site that costs more than it gives:

| Concern                 | D (plugin)                                                                                               | D′ (this decision)                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Editor finds a language | Opens a document, then a "Translations" menu                                                             | Sidebar: **Training program → English / Deutsch**. Nothing to learn                                                             |
| Linking translations    | Hidden metadata documents that can be orphaned or half-linked                                            | Implicit: the language versions of a page share a type and a fixed id (`trainingProgram-de`)                                    |
| Dependencies            | Plugin + `sanity-plugin-internationalized-array` + its peers `@sanity/assist`, `@sanity/language-filter` | **None added** to the Studio                                                                                                    |
| Migration               | Split documents **and** create metadata documents                                                        | Split documents                                                                                                                 |
| Adding a locale         | Config in the plugin                                                                                     | Add it to `LOCALES`; the Studio menu, routes and sitemap follow                                                                 |
| Unlimited page lists    | ✅ built for it                                                                                          | Not needed yet. **Upgrade path**: add the plugin when a collection type (blog, pages) arrives; queries keep `language` + `slug` |

D′ scores like D on SEO, DRY and performance, and higher on editor experience (20/20) and maintenance (14/15).

## 4. Decision

| Content class                            | Localization                                                            | URL                                            |
| ---------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| **Pages** (home, training program)       | **One document per language**, fixed id `<type>-<locale>`, plain fields | Editor-owned `slug` (home is `/` and `/en`)    |
| **Global data** (footer, trainer events) | **One document per language** (amended 2026-10-03, see §5)              | n/a                                            |
| **App pages** (trainer calendar)         | UI via `t()`                                                            | Code-owned translated paths (`definePageMeta`) |

URLs: **German is the default and has no prefix**, English is under `/en/`, and every slug is translated:

| Page             | German (default)     | English                |
| ---------------- | -------------------- | ---------------------- |
| Home             | `/`                  | `/en`                  |
| Training program | `/schulungsprogramm` | `/en/training-program` |
| Trainer calendar | `/trainer-kalender`  | `/en/trainer-calendar` |

A fully prefix-free variant (`/training-program` and `/schulungsprogramm` side by side) was considered and rejected at G1: it ranks the same, but the language would be unknown until a CMS lookup (error pages, caching), slugs would have to be unique across languages, and per-language filtering in Search Console would be lost.

Loading every language per request and switching only in the browser was rejected too: switching language changes the URL anyway (a new page), and every visitor would download every language.

Policies:

1. **No cross-language fallback for pages.** `/en/x` without an English document is a 404, and no `en` hreflang is emitted (G-1, G-3). The switcher then links to the English home page.
2. **No field-level translation anywhere** (amended 2026-10-03, see §5). Every document has a `language`; every query filters by it.
3. **Slugs**: lowercase `a-z`, `0-9`, `-`, optional `/` segments; unique per language across all pages; app paths are reserved. "Generate" transliterates umlauts (`ü` → `ue`).
4. Slug changes don't redirect yet (Later).
5. The root-only browser-language redirect stays (G-5).
6. Sitemap entries for pages are built at deploy time. Optional: a Sanity publish webhook starts the Deploy workflow (`workflow_dispatch`) so new pages are listed right away.
7. **No migration, no legacy redirects**: no dataset holds content in the old model (checked 2026-10-02), so none are built (YAGNI).

## 5. Amendment (2026-10-03): one document per language for everything

**Decision (human, Gate-level):** the footer and trainer events also become one document per language. Field-level translation (`localeString`, `localeText`, `localize()`) is removed from the codebase.

- **Why:** a single model for editors. Every sidebar entry reads "<Type> → Deutsch / English", and every document is written in one language. Clients find this clearer than two models, and the code keeps one path: every query filters by `language`.
- **Studio:** singletons (home, training program, footer) have a fixed id per language (`globalFooter-de`). Collections (trainer events) list and create documents per language. No template creates a document without a `language`.
- **Accepted trade-off:** shared facts are entered once per language. A trainer event's date and time live in each language's document, so editors update both when an event moves. The same applies to the footer's phone and email (one footer per language), the drift risk §3 noted for option C, accepted for the sake of a single model. A missing translation simply doesn't appear in that language (no fallback), consistent with policy 1.

## 6. Amendment (2026-10-05): structured content (ADR 0003)

ADR 0003 §§ 4–5 and § 11 are authoritative. In short:

1. **Pages are code-owned singletons** (`homePage-de`, `aboutPage-en`…) without slugs; page URLs are translated in code. Only offers and blog posts have editor-owned slugs: one segment, unique per type and language (replaces policy 3 and the "Pages" row of § 4).
2. **Translation linking**: `@sanity/document-internationalization` links the language versions of offers, posts, testimonials and FAQ items (the D′ "upgrade path" of § 3).
3. **Language-neutral documents without text**: `businessProfile`, `event` (recurring classes) and `redirect`. Everything that carries text stays one document per language (replaces the § 5 trade-off for the footer facts and trainer events).
4. **Missing translation** (policy 1, extended): an offer or post links the switcher to that language's list page; a page singleton that isn't published gets no hreflang.
5. **Slug changes** (policy 4, replaced): the Studio creates a redirect, applied as a 301 at build time (G-6). The publish webhook (policy 6) becomes a required setup step.
6. **No migration** (policy 7): orphaned `sectionPage`, `sectionLanding`, `globalFooter` and `trainerEvent` documents are removed with the cleanup command in the deployment guide.
