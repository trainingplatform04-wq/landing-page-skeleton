import { useConsent } from '~/composables/useConsent/useConsent'
import { isAnalyticsEvent, trackParams } from '~/utils/analytics/analytics.utils'

import type { AnalyticsEvent, AnalyticsParams } from '~/constants/analytics.constants'

/**
 * Google Tag Manager, loaded only once the visitor allows statistics (Consent Mode v2 "basic").
 * Events come from `useAnalytics().track` or from `data-track` attributes: one click listener for
 * the whole page, so links in never-hydrated HTML are measured too. Never personal data.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { public: config } = useRuntimeConfig()
  const consent = useConsent()
  const statistics = consent.allows('statistics')

  if (!config.gtmId) return { provide: { analytics: { track: () => {} } } }

  type Push = (entry: Record<string, unknown>) => void
  let push: Push | undefined
  /** Events sent before the visitor answered: sent once Statistics is granted, else dropped. */
  let waiting: Array<Record<string, unknown>> = []

  // Created with statistics already granted, so GTM's first event never sees "denied". This site
  // runs no ads. Withdrawing reloads the page (plugins/consent.client.ts): GTM stops at once.
  const start = () => {
    if (push) return
    nuxtApp.runWithContext(() => {
      const { proxy } = useScriptGoogleTagManager({
        id: config.gtmId,
        defaultConsent: {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        },
      })
      const send: Push = (entry) => proxy.dataLayer.push(entry)
      push = send
      for (const entry of waiting) send(entry)
      waiting = []
    })
  }

  watch(
    () => consent.state.value.decided,
    (decided) => {
      if (!decided) return
      if (statistics.value) start()
      else waiting = []
    },
    { immediate: true },
  )
  watch(statistics, (allowed) => allowed && start())

  const track = (event: AnalyticsEvent, params: AnalyticsParams = {}) => {
    const entry = { event, page: window.location.pathname, ...params }
    if (push) return push(entry)
    if (!consent.state.value.decided) waiting.push(entry)
  }

  document.addEventListener('click', (click) => {
    if (!(click.target instanceof Element)) return
    const element = click.target.closest<HTMLElement>('[data-track]')
    const event = element?.dataset.track
    if (element && isAnalyticsEvent(event)) track(event, trackParams(element.dataset))
  })

  return { provide: { analytics: { track } } }
})
