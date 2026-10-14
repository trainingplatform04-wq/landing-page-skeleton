import { useConsent } from '~/composables/useConsent/useConsent'
import {
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
  type AnalyticsParams,
} from '~/constants/analytics.constants'

const isEvent = (name: string): name is AnalyticsEvent =>
  (ANALYTICS_EVENTS as readonly string[]).includes(name)

/**
 * Google Tag Manager, only with the visitor's consent to statistics (Consent Mode v2 "basic":
 * GTM is not even downloaded before). Advertising is always denied: this site runs no ads.
 * Withdrawing consent stops measuring at once (the consent window also deletes `_ga*`).
 *
 * Events go to GTM's dataLayer through `useAnalytics().track`, or from server-only HTML through
 * `data-track` attributes (`data-track="cta_click" data-track-label="…"`): one click listener
 * here, so links in components that never hydrate are measured too. Never personal data.
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

  // GTM is created only once the visitor allows statistics, with that consent already in its
  // defaults: GTM's first event never sees "denied" (Consent Mode v2, "basic"). Advertising is
  // always denied. Withdrawing reloads the page (plugins/consent.client.ts), so GTM never runs
  // on without consent.
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
    if (!element || !event || !isEvent(event)) return
    const { track: _event, ...data } = element.dataset
    const params = Object.fromEntries(
      Object.entries(data)
        .filter(([key]) => key.startsWith('track'))
        .map(([key, value]) => [key.charAt(5).toLowerCase() + key.slice(6), value ?? '']),
    )
    track(event, params)
  })

  return { provide: { analytics: { track } } }
})
