# Google Tag Manager and Google Analytics 4

How a fork sets up statistics for its site, without code. Everything here is free. The legal side (consent, privacy text) is in `docs/legal/go-live-checklist.md`.

## 1. What they are

- **Google Analytics 4 (GA4)** counts what visitors do: pages viewed, buttons clicked, forms sent. It shows reports in its own dashboard.
- **Google Tag Manager (GTM)** is the box the site loads. It contains the tags (GA4 and the events below) and decides when each one fires. Changing what is measured is done in GTM, not in our code.
- **The site** loads GTM **only after the visitor accepts "Statistics"** in the consent window (Google Consent Mode v2, basic: nothing from Google is downloaded before). Advertising signals (`ad_storage`, `ad_user_data`, `ad_personalization`) are always denied. Events are pushed to GTM's `dataLayer` only with that consent.
- The site needs one value per environment: the **container id** `GTM-XXXXXXX`, in the env var `NUXT_PUBLIC_GTM_ID`. Empty: nothing loads and the consent window does not offer statistics.

## 2. Two containers, two GA4 properties

| Environment                      | GTM container       | GA4 property        | `NUXT_PUBLIC_GTM_ID` in Vercel |
| -------------------------------- | ------------------- | ------------------- | ------------------------------ |
| Production                       | `<site> production` | `<site> production` | Production                     |
| Staging and development (shared) | `<site> staging`    | `<site> staging`    | Preview, Development           |
| Local, CI, E2E                   | none                | none                | empty                          |

Two of each keep test traffic out of the real numbers. How to set the variable in Vercel: `docs/deployment/DEPLOYMENT.md` §11.1.

## 3. Create GA4 (free)

1. Open <https://analytics.google.com> with the client's Google account → **Start measuring**.
2. **Account**: the client's company name. Untick every "data sharing" option on that screen → **Next**.
3. **Property**: `<site> production`, time zone **Germany**, currency **Euro** → **Next**. This is a **standard** property: never upgrade to Analytics 360 (paid). No Google Cloud project or billing is needed.
4. Business details and objectives: any answer → **Create** → accept the terms (with the **data processing terms** for the EU).
5. **Data stream**: **Web** → the production URL, stream name `Web` → **Create stream**. Keep **Enhanced measurement** on and check, under its gear, that **Page changes based on browser history events** is on (our page views on navigation).
6. Copy the **Measurement ID** (`G-…`). It goes into GTM (step 6), not into our code.
7. Repeat steps 3 to 6 for `<site> staging` (the staging URL).

### GA4 settings (both properties)

Admin (gear, bottom left) →

- **Data collection and modification → Data collection**: **Google signals data collection** off; under **Advanced settings to allow for ads personalisation**, ads personalisation off for every region. **Granular location and device data collection** may stay on (GA4 does not store IP addresses either way; see §8).
- **Data collection and modification → Data retention**: **Event data retention** = **14 months**, **Reset user data on new activity** off → **Save**.
- **Account settings → Data sharing settings** (account level): untick every option (Google products and services, Modelling contributions, Technical support, Recommendations for your business).
- **Product links → Google Ads links**: none.
- **Account settings → Data processing terms**: accepted; add the client as controller and its data protection contact.

## 4. Create the GTM containers (free)

1. Open <https://tagmanager.google.com> → **Create account**.
2. Account name: the client's company; country **Germany**.
3. Container name: `<site> production`; target platform **Web**. Never **Server** (a server container needs a paid Cloud project and is not used here).
4. **Create** → accept the terms (with the GDPR data processing terms).
5. Close the "Install Google Tag Manager" window: the site installs GTM itself. Copy the id at the top (`GTM-…`).
6. **Admin → Create container** for `<site> staging` (Web), same steps.

## 5. Import the container

For each container (production and staging):

1. **Admin → Import container** → **Choose container file**: `docs/analytics/gtm-container.json`.
2. **Choose workspace**: **Existing** → `Default Workspace`.
3. **Choose an import option**: **Merge** → **Overwrite conflicting tags, triggers and variables**.
4. **Confirm**. The workspace now has:
   - Variable **GA4 measurement ID** (Constant, `G-XXXXXXXXXX`) and seven Data Layer variables `DLV - <parameter>`.
   - Tag **Google tag - GA4** on All Pages, and one tag **GA4 event - `<event>`** per event, each on its Custom Event trigger **Event - `<event>`**.
   - Every tag requires the consent `analytics_storage` (Tag → Advanced settings → Consent settings).

## 6. Fill in the measurement ID

**Variables → GA4 measurement ID** → Value: the `G-…` id of the matching property (production container → production property; staging container → staging property) → **Save**.

## 7. Verify on staging, then publish

1. In the **staging** container: **Preview** → enter the staging URL → **Connect**. Tag Assistant opens the site in a new tab.
2. Before choosing in the consent window, Tag Assistant shows **no** connection: GTM is not loaded yet. That is correct.
3. Click **Accept all**. Tag Assistant connects; **Google tag - GA4** fires on the page view.
4. Trigger each event (§9): click a call to action, read an article to the end, load a video, share, open a related article, open an offer and its button, send the contact form. Each one appears in the left column; its **GA4 event** tag shows **Fired**, with its parameters under **Variables**.
5. In GA4: **Admin → DebugView** shows the same events within seconds.
6. Reload, open **Cookie settings** in the footer, switch **Statistics** off → **Save**: nothing more arrives, the `_ga` cookies are gone (DevTools → Application → Cookies).
7. **Submit** → Version name `Initial setup` → **Publish**. Do the same in the production container after the release; check it once with **Preview** on the production URL.

A change later (a new event) is made in the staging container first, verified the same way, then repeated in production. Our code changes only when the site pushes a new event (§9).

## 8. Privacy settings, in one place

| Setting                               | Value                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Container type                        | Web                                                                     |
| GA4 property                          | Standard (free)                                                         |
| Google signals                        | Off                                                                     |
| Ads personalisation, Google Ads links | Off, none                                                               |
| Account data sharing                  | All off                                                                 |
| Event data retention                  | 14 months                                                               |
| IP addresses                          | Not logged or stored by GA4; used briefly for coarse location in the EU |
| Consent Mode (set by the site)        | `analytics_storage` granted with consent; `ad_*` always denied          |
| Tags                                  | Require `analytics_storage`                                             |

## 9. Events

The site pushes `{ event, page, …parameters }` to the `dataLayer` (`composables/useAnalytics/useAnalytics.ts`, `plugins/analytics.client.ts`, names in `constants/analytics.constants.ts`). Every push carries `page`, the current path. Parameters are labels, slugs and paths: **never** names, email addresses or message text.

| Event            | When                                                  | Parameters sent to GA4 |
| ---------------- | ----------------------------------------------------- | ---------------------- |
| `contact_submit` | the contact form was sent successfully                | `page`                 |
| `cta_click`      | a call-to-action button                               | `label`, `page`        |
| `article_read`   | the article text read to the end                      | `article`              |
| `video_load`     | "Load video" clicked, or a video loaded after consent | `video`, `page`        |
| `share`          | copy link or native share                             | `method`, `page`       |
| `related_click`  | a "Keep reading" card                                 | `article`, `target`    |
| `offer_view`     | an offer page viewed                                  | `offer`                |
| `offer_cta`      | an offer's call to action                             | `offer`, `label`       |

Page views are GA4's own (`page_view`, browser history changes included), sent by the Google tag.

To see a parameter in GA4 reports (not only in DebugView), register it once per property: **Admin → Data display → Custom definitions → Create custom dimension**, scope **Event**, event parameter `label` (then `article`, `video`, `method`, `target`, `offer`, `page`).

A new event: add its name to `constants/analytics.constants.ts`, a trigger and a GA4 event tag to `docs/analytics/gtm-container.json` and this table, in the same PR. The Privacy Officer reviews it.
