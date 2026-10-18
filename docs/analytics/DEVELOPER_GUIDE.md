# Consent and analytics: developer guide

For developers. The GTM and GA4 setup for a site owner is in [`GTM.md`](GTM.md); the architecture in [`ARCHITECTURE.md`](../conventions/ARCHITECTURE.md#consent-and-analytics).

## Try it locally

1. Set `NUXT_PUBLIC_GTM_ID` in `.env` to a test container id. Empty (the default): nothing loads and the consent window does not offer statistics.
2. Run `pnpm dev` and open the site: the consent window appears.
3. **Accept all** or accept **Statistics** in **Settings**: GTM is requested only now. Check the Network tab (before the answer there is no request to Google) and, in the console, `window.dataLayer`.
4. **Reject all** keeps everything optional off.
5. To be asked again, delete the `cc_cookie` cookie, or use **Cookie settings** in the footer.

Local runs use no container by default. E2E uses a fake one (`GTM-E2ETEST`) and stubs `googletagmanager.com`, so tests never send data to Google.

## Add something optional

Anything that talks to a third party only after the visitor agrees. Change these together, in one PR:

| You add…                          | Change                                                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A cookie or browser storage entry | An entry in `constants/cookies.constants.ts`, its `cookies.<id>.*` texts in every locale, `CONSENT_REVISION` raised                          |
| A tool, embed or tracker          | The category it belongs to (or a new one in `constants/consent.constants.ts`), loaded only through `useConsent`, plus the above              |
| An analytics event                | Its name in `constants/analytics.constants.ts`, a trigger and GA4 tag in `docs/analytics/gtm-container.json`, a row in the table in `GTM.md` |

Then:

- Send events with `useAnalytics().track()` in hydrated code, or `data-track="<event>"` with `data-track-<param>` attributes in server-only HTML. Parameters are labels, slugs and paths, never personal data.
- Raise `CONSENT_REVISION` whenever a category, tool or cookie changes, so every visitor is asked again.
- Update the privacy text in `studio/seed/seed.copy.ts` (development) and tell the client's lawyer; the checklist is `docs/legal/go-live-checklist.md`.
- The PR gets a Privacy Officer review next to the code review (`.ai/shared/workflows/code-review-loop.md`).
