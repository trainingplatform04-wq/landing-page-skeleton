import { ANALYTICS_EVENTS, type AnalyticsEvent } from '~/constants/analytics.constants'

/** Only the events the GTM container knows are sent; anything else in `data-track` is ignored. */
export const isAnalyticsEvent = (name: string | undefined): name is AnalyticsEvent =>
  (ANALYTICS_EVENTS as readonly (string | undefined)[]).includes(name)

/**
 * The event parameters written on a tracked element: `data-track-label="Book"` is
 * `dataset.trackLabel`, sent as `{ label: 'Book' }`. `data-track` itself names the event.
 */
export function trackParams(dataset: DOMStringMap): Record<string, string> {
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(dataset)) {
    if (key === 'track' || !key.startsWith('track')) continue
    const name = key.slice('track'.length)
    params[name.charAt(0).toLowerCase() + name.slice(1)] = value ?? ''
  }
  return params
}
