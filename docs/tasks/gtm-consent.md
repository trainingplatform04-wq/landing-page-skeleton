---
status: 'In Progress' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-13'
---

# Google Tag Manager with legally compliant consent (GDPR / TDDDG)

## 🔗 Resources

- **Design change**: none (the consent modal follows the site theme; no Lovable design)
- **Related Issues**: —
- **Gate G1**: plan approved by the owner on 2026-10-13 (decisions below were answered in one round; no further owner stop until G2).

## 👤 User Story

**As the** site owner (and every client who forks this skeleton),
**I want** to follow what visitors do on the site in Google Tag Manager and Google Analytics 4,
**So that** I can improve the site, while the site stays fully compliant with German and EU law
(nothing optional runs before the visitor consents).

## Decisions (owner, 2026-10-13: locked)

| Topic             | Decision                                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consent engine    | Open-source **CookieConsent v3** (Orest Bida, MIT), themed to our design; no paid CMP (Cookiebot would cost every client €7–15 a month; one known tool to declare)   |
| UI                | **Centred modal**, page dimmed; **Accept all** and **Reject all** equal (same component, size, row); **Settings** per category                                         |
| Categories        | **Necessary** (consent cookie only, always on) · **Statistics** (GTM → GA4) · **External media** (YouTube)                                                           |
| Duration          | Consent remembered **6 months**; a revision number re-asks when categories or tools change                                                                            |
| Loading           | Google Consent Mode v2 **basic**: GTM is downloaded **only after** Statistics is accepted; `ad_storage`, `ad_user_data`, `ad_personalization` are always **denied** |
| Module            | `@nuxt/scripts` (official), `useScriptGoogleTagManager` with a consent trigger                                                                                       |
| Containers        | Two: **production**, and **staging/dev** (shared). `NUXT_PUBLIC_GTM_ID` per Vercel environment, set with the Vercel CLI; empty = nothing loads (local, CI, E2E)       |
| GA4               | Configured inside GTM through a **"GA4 measurement ID" variable** in the exported container (placeholder, filled by the owner after creating GA4)                      |
| Events            | Conversions, magazine engagement, offers (list below); never personal data                                                                                            |
| Legal texts       | Drafted in DE + EN by the Privacy Officer from standard German practice; **each client has them checked** (lawyer or eRecht24) before production                      |
| Production texts  | Editors fill them in the Studio (ADR 0004: no sample content in production); built-in i18n fallbacks so the modal is never empty; go-live checklist blocks release    |
| Owner input left  | The two GTM container ids (`GTM-…`), for the local `.env` and Vercel. Everything else is built without them.                                                         |

### Events (`useAnalytics().track`)

| Event            | When                                                    | Parameters (no personal data) |
| ---------------- | ------------------------------------------------------- | ----------------------------- |
| `contact_submit` | contact form sent successfully                          | `page`                        |
| `cta_click`      | a CTA button (e.g. "Request a free trial")              | `label`, `page`               |
| `article_read`   | the article text read to the end                        | `article`                     |
| `video_load`     | "Load video" clicked (or a video loaded after consent)  | `video`, `page`               |
| `share`          | copy link or native share                               | `method`, `page`              |
| `related_click`  | a "Keep reading" card                                   | `article`, `target`           |
| `offer_view`     | an offer page viewed                                    | `offer`                       |
| `offer_cta`      | an offer's CTA clicked                                  | `offer`, `label`              |

Page views: GA4's own page view (history changes included), sent by GTM.

## ✅ Acceptance Criteria

- **Given** a first visit, **then** the consent modal shows (DE/EN), and **no** request goes to `googletagmanager.com`, `google-analytics.com` or YouTube, and **no** `_ga*` cookie exists, until the visitor chooses.
- **Given** "Reject all" (or closing Settings with everything off), **then** the same holds after reloads and navigation.
- **Given** "Accept all" (or Statistics on), **then** the Consent Mode defaults are set **before** GTM loads (ads denied), GTM loads with `NUXT_PUBLIC_GTM_ID`, and the events above land in `dataLayer`; never before consent.
- **Given** External media accepted, **then** videos load directly; otherwise the click-to-load poster stays.
- **Given** "Cookie settings" in the footer, **then** the visitor can change or withdraw consent at any time; withdrawing Statistics stops tracking and deletes the `_ga*` cookies.
- **Given** the privacy page, **then** it lists every tool and cookie (name, provider, purpose, duration, transfer to the USA under the EU–US Data Privacy Framework) from the single cookie inventory, in DE and EN.
- **Given** an empty `NUXT_PUBLIC_GTM_ID`, **then** nothing analytics-related loads and the Statistics category is not offered.
- **Given** the Web performance gate, **then** every page still meets the 80 minimum (aim 90+) with the modal.
- **Given** a new fork, **then** `docs/analytics/GTM.md`, the importable container and the legal go-live checklist let the client set it up without code.

## Architecture

- **Single cookie inventory** `constants/cookies.constants.ts`: technical facts (name, provider, category, duration). It feeds the modal's categories, the privacy table and the E2E tests.
- **Consent** (`plugins/consent.client.ts` + `composables/useConsent/`): wraps CookieConsent v3; exposes the current choice reactively; sets Consent Mode defaults; opens Settings from the footer.
- **GTM** (`@nuxt/scripts`): loaded only when Statistics is granted and `gtmId` is set.
- **Analytics** (`composables/useAnalytics/`): `track(name, params)` pushes to `dataLayer` only when granted; typed event names.
- **Sanity**: `consentSettings` per language (modal texts, category descriptions); privacy page gets the cookies and processors section; seed DE/EN; typegen.
- **YouTube**: the article video loads directly when External media is granted (ArticleEnhancer), else click-to-load as today.
- **Docs**: `docs/analytics/GTM.md` (click path: containers "Web", GA4 standard property, Signals off, data sharing off, retention), `docs/analytics/gtm-container.json` (importable), DEPLOYMENT.md (env per environment), README (fork steps), `docs/legal/go-live-checklist.md`.
- **Agents**: new persona `.ai/shared/agents/privacy-officer.md` (⚖️ Privacy Officer): owns the inventory, the privacy content model, consent categories and the legal checklist; reviews every PR that adds or changes a script, cookie, embed, font source, form target or tracking event (review loop, next to the Code Reviewer); asks the privacy questions in `/design` discovery.

## Steps (resume here after an interruption: tick what is done)

- [ ] 1. Task file and Privacy Officer persona (+ `/agents`, Antigravity pointers, drift guard, review loop, operating model)
- [ ] 2. Legal audit of the current site (fonts self-hosted, YouTube, contact form target, Vercel and Sanity as processors) → fixes or notes
- [ ] 3. Cookie inventory constant
- [ ] 4. Sanity: `consentSettings`, privacy section, seed DE/EN, typegen
- [ ] 5. `@nuxt/scripts` + consent plugin + `useConsent` + themed modal + footer link
- [ ] 6. `useAnalytics` + the 8 events wired
- [ ] 7. YouTube under External media
- [ ] 8. `.env.example`, local `.env` (staging/dev id), Vercel env (CLI) once the ids are given
- [ ] 9. Docs: GTM.md, container export, DEPLOYMENT, README, go-live checklist
- [ ] 10. Tests: E2E consent suite, unit tests, `pnpm verify`, E2E, Web performance
- [ ] 11. PR → review loop (Code Reviewer + Privacy Officer, fresh subagents) → merge into `develop` → staging check in GTM Preview

## 🤖 AI Execution Workflow (Claude / Antigravity)

_AI agents run `.ai/shared/workflows/feature-orchestration.md` from Step 3 (G1 approved above), under `.ai/shared/workflows/operating-model.md`. No owner stop until G2._

## 📋 Definition of Done

- [ ] Acceptance criteria met on staging (GTM Preview shows the events after Accept, nothing before).
- [ ] Code review and Privacy Officer review `APPROVED`, every thread resolved.
- [ ] No `any`, no `console.*`, no `fetch`/`$fetch`, no `server/api/` routes.
- [ ] All UI text translated in every locale; the privacy texts' legal check is on the go-live checklist.
- [ ] Co-located unit tests and E2E updated in `tests/e2e/`.
