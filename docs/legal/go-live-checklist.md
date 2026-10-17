# Legal go-live checklist

One copy per client, completed before the first production release. **Release (Gate G2) is blocked until every item is ticked** (`.ai/shared/workflows/release.md`). The Privacy Officer (`.ai/shared/agents/privacy-officer.md`) prepares it; the client confirms the items only they can.

This checklist is not legal advice. The texts in this repository are drafts; the client's lawyer (or a generator such as eRecht24) has the last word.

Client: `<name>` · Production URL: `<url>` · Completed by: `<name>` on `<date>`

## 1. Imprint (§ 5 DDG)

- [ ] Name and legal form, full postal address (no PO box), email and phone, in every locale.
- [ ] Register and number (commercial register, association register) and VAT id, when they exist.
- [ ] Regulated profession: chamber, professional title, rules, when it applies.
- [ ] Person responsible for editorial content (§ 18(2) MStV), when the site has a magazine.
- [ ] Reachable in one click from every page (footer).

## 2. Privacy text

- [ ] Written by the editors in the **production** Studio, in every locale (the staging seed is only a draft).
- [ ] Controller data match the imprint.
- [ ] Every processor named with purpose, legal basis and any transfer outside the EU (§5).
- [ ] The contact form's service named with company and address.
- [ ] Supervisory authority of the client's federal state named.
- [ ] **Checked by a lawyer or eRecht24**; who checked and when: `<name, date>`.

## 3. Google Tag Manager and GA4 (`docs/analytics/GTM.md`)

- [ ] Two **Web** containers (production; staging/dev), imported from `docs/analytics/gtm-container.json`, the "GA4 measurement ID" variable filled in each.
- [ ] `NUXT_PUBLIC_GTM_ID` set in Vercel: production container for **Production**, staging container for **Preview** and **Development** (`docs/deployment/DEPLOYMENT.md` §11.1).
- [ ] GA4 standard property per environment; Google signals off; ads personalisation off; account data sharing off; event data retention 14 months.
- [ ] Google's data processing terms accepted in GA4 and GTM.
- [ ] Production container published and checked once with Tag Assistant Preview.

Without statistics: leave `NUXT_PUBLIC_GTM_ID` empty, remove the statistics section from the privacy text, and tick this block as not applicable.

Turning statistics on later (setting `NUXT_PUBLIC_GTM_ID` in an environment where it was empty) is a new tool, even without a code change: in the same release, complete this block, add the statistics section to the privacy text and raise `CONSENT_REVISION`, so visitors who already answered are asked again. Only then set the variable in Production.

## 4. Consent

- [ ] `CONSENT_REVISION` in `constants/consent.constants.ts` raised for every change of tools, cookies or purposes since the last release.
- [ ] The cookie table on the privacy page matches `constants/cookies.constants.ts` and what the browser actually stores (DevTools → Application → Cookies and Local storage, after "Accept all").
- [ ] **Reject all** and **Accept all** have the same size, style and row; no category is pre-ticked; the window is readable on a phone.
- [ ] **Rejected, nothing loads**: in a private window, "Reject all", then reload and visit every page type: DevTools → Network shows no request to `googletagmanager.com`, `google-analytics.com`, `youtube-nocookie.com`, `youtube.com` or any other third party; no `_ga*` cookie exists.
- [ ] **No choice yet, nothing loads**: the same check before clicking anything in the window.
- [ ] **Withdrawal works**: "Cookie settings" in the footer reopens the choice; switching Statistics off deletes the `_ga*` cookies.
- [ ] Videos show the "Load video" placeholder until clicked or until External media is allowed.

## 5. Processors

Each with a signed data processing agreement (Art. 28 GDPR) and a named transfer mechanism outside the EU.

| Processor                  | Purpose                       | DPA | Transfer outside the EU                   |
| -------------------------- | ----------------------------- | --- | ----------------------------------------- |
| Vercel Inc. (USA)          | Hosting, images, request logs | [ ] | EU–US Data Privacy Framework, SCCs        |
| Sanity (Norway, USA)       | Content management            | [ ] | EU–US Data Privacy Framework or SCCs      |
| Form service `<name>` (EU) | Contact form                  | [ ] | none expected (EU)                        |
| Google Ireland Limited     | GTM, GA4                      | [ ] | EU–US Data Privacy Framework (Google LLC) |

YouTube is not a processor: Google Ireland Limited is responsible for it in its own right (independent or joint controller, no data processing agreement; transfer under the EU–US Data Privacy Framework). Its role is a lawyer item (§ "Additional checks").

- [ ] Each US company's certification checked at <https://www.dataprivacyframework.gov/list>.
- [ ] Any other service added since the audit (`docs/legal/`) is in this table and in the privacy text.

## 6. Sign-off

- [ ] The client confirms in writing (email or ticket) that the imprint and privacy text are theirs and were checked; link: `<link>`.
- [ ] The release PR lists this checklist as complete.

## Additional checks (Privacy Officer, PR #17)

- [ ] Withdrawal: after "Cookie settings" → "Reject all", the page reloads, then navigate to at least three more pages: no request to googletagmanager.com, google-analytics.com or youtube(-nocookie).com, and no `_ga` / `_ga_*` cookie on the registrable domain (check the parent domain too).
- [ ] Lawyer: the first-layer wording of the consent window, the "necessary" classification of the colour-scheme cookie (`color-mode`, set only when the visitor picks a scheme with the header switch), YouTube (Google) as independent or joint controller, the legal basis for keeping the consent cookie, and the wording on GA4 and IP addresses.
- [ ] Vercel: the log retention of the client's plan and whether a data protection officer is required.
