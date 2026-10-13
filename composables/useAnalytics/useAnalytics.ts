import type { AnalyticsEvent, AnalyticsParams } from '~/constants/analytics.constants'

/**
 * Sends an event to Google Tag Manager when the visitor allowed statistics; does nothing
 * otherwise, on the server, or without a configured container (`plugins/analytics.client.ts`).
 */
export function useAnalytics() {
  const nuxtApp = useNuxtApp()

  return {
    track: (event: AnalyticsEvent, params?: AnalyticsParams) =>
      nuxtApp.$analytics?.track(event, params),
  }
}
