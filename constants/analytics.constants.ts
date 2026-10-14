/**
 * The events the site sends to Google Tag Manager (only with consent to statistics). The GTM
 * container export in `docs/analytics/gtm-container.json` has a trigger and a GA4 event for
 * each. Parameters never carry personal data: no names, emails or messages.
 */
export const ANALYTICS_EVENTS = [
  'contact_submit',
  'cta_click',
  'article_read',
  'video_load',
  'share',
  'related_click',
  'offer_view',
  'offer_cta',
] as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

/** Short, non-personal values: a page path, a slug, a button label. */
export type AnalyticsParams = Record<string, string>
