# ADR 0004: Skeleton scope and data flow

- **Status**: Accepted by the owner (2026-10-06). **Amends [ADR 0003](0003-structured-content.md)** (scope, queries, redirects, unpublished pages) and drops rule G-6 of [ADR 0001](0001-i18n-translated-urls.md).
- **Date**: 2026-10-06
- **Decision owner**: human. The decisions come from the owner's line-by-line review and the Tech Lead's audit (48 questions). The audit file is kept in git history (commit `26784db`); the full previous implementation is kept in the git tag `reference-full-2026-10`.

## 1. Context

This repository is a **skeleton**: a small, exemplary starter that AI agents and students fork to build real landing-page projects. After ADR 0003 it had grown into a real project (11 pages, recurring classes, blog, pricing, automatic redirects, a custom hreflang system, GROQ string fragments). A junior developer could not see the core patterns through the volume.

## 2. Decisions

### Scope ("Balanced")

- **7 pages**: home (with the about section), offers, offer (by slug), FAQ, contact (with the form), imprint, privacy. Imprint and privacy are required by German law. Menu: offers, FAQ, contact; the site name links home. (Owner's review of 2026-10-06: the about page merged into the home page, the FAQ got its own page.)
- **Kept collections**: offers (the reference collection with a slug and translations), testimonials (with recorded consent), FAQ items. **Kept settings**: business profile (language-neutral), site settings (footer note).
- **Removed**: pricing, blog, schedule (recurring classes), automatic redirects. They can be read in the git tag `reference-full-2026-10`.
- **Empty skeleton**: no seed, no sample content in any dataset. A page exists because the code defines it; while it is not published it renders empty, with `noindex`, and it is not in the sitemap. Its hreflang links stay (accepted, review R1): with `strictSeo`, @nuxtjs/i18n removes a language from hreflang only together with disabling the switcher, and a page of the code exists in every language. The footer links the legal pages in the language of the page. An unknown offer slug answers 404; a CMS error answers 503.

### Data flow

- **Queries are written with [groqd](https://commerce.nearform.com/open-source/groqd/)**: a TypeScript query builder checked against the Sanity schema; every answer is validated with zod when it arrives (a wrong shape becomes a 503). Shared pieces are groqd fragments (`utils/groqd/groqd.utils.ts`). TypeGen only generates the schema types groqd needs; `defineQuery` and the GROQ string fragments are gone.
- **One pattern per page composable**, in this order: the query, the view type (everything the page shows), a pure mapper (CMS data → view), then the composable (`await useAsyncData`, 503 on error). Names have no `Page` suffix (`useHome`, `useOffer`).
- **`await` in `<script setup>` stays**: the server sends complete HTML and the right status code (SEO). Nuxt's `useAsyncData` waits for the data on the server either way; awaiting it is what makes 404/503 possible.
- **Components declare their own simple props** (`types/content.types.ts`): no CMS types, no `_id`/`_type`, no formatting or link resolution in components.

### Language and SEO

- **hreflang, canonical and the language switcher come from `@nuxtjs/i18n`** (`experimental.strictSeo`, `useSetI18nParams` on the offer page, `<SwitchLocalePathLink>`). The custom alternates code is removed. An offer without a translation shows the other language as disabled.
- **Structured data**: the module's defaults plus one `LocalBusiness` from the business profile. No other JSON-LD.
- **No redirects**: an offer's URL is `/angebote/<slug>`; if an editor changes the slug, the old URL answers 404. The Studio warns about it. This drops ADR 0001 rule G-6 ("301 on slug change").

### UI

- **Nuxt UI everywhere**, the contact form included (`UForm`). One documented exception: the language switcher uses `<SwitchLocalePathLink>` from @nuxtjs/i18n, which is right from the first server render.
- **Buttons are optional** everywhere: a button is valid empty or complete (label and link), and the site shows it only when complete.

### Contact form

- The form sends in the background to an EU-hosted form service (`NUXT_PUBLIC_CONTACT_FORM_ACTION`), which emails the owner; a toast thanks the visitor (or reports an error). No page reload, no email app, no server code, no secret key. This is the one call outside Sanity, a documented exception to the "no `fetch`" rule (in `useContactForm` only).
- Resend was considered: its API key is secret and it refuses calls from browsers, so it needs a server route, which this skeleton does not have.
- The form renders in the browser only (`<ClientOnly>`): it needs JavaScript to send, and this keeps Nuxt UI's generated field ids the same for labels and fields.

### Code hygiene

- `utils/` holds only pure helpers with their spec; the build-time sitemap lives in a local Nuxt module (`modules/sitemap.ts`).
- Comments explain why, briefly; no use-case narration, no ADR references in code.
- `i18n/locales/locales.spec.ts` is removed.

## 3. Consequences

- About half of the previous app and Studio code is gone; every pattern exists once.
- Adding a feature removed here starts from the recipes in `docs/conventions/ARCHITECTURE.md` and the git tag.
- groqd is a second API next to GROQ: students read GROQ in Sanity's docs and in the generated query (`query.query`).
