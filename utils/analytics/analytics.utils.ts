import { ANALYTICS_EVENTS, type AnalyticsEvent } from '~/constants/analytics.constants'

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
    const name = key.slice('track'.length) // "trackLabel" → "Label"
    params[name.charAt(0).toLowerCase() + name.slice(1)] = value ?? ''
  }
  return params
}
