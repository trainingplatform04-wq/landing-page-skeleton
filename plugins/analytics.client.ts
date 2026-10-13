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
export default defineNuxtPlugin(() => {
  const { public: config } = useRuntimeConfig()
  const statistics = useConsent().allows('statistics')

  if (!config.gtmId) return { provide: { analytics: { track: () => {} } } }

  const trigger = useScriptTriggerConsent({ consent: statistics })
  const { proxy, consent } = useScriptGoogleTagManager({
    id: config.gtmId,
    defaultConsent: {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
    scriptOptions: { trigger },
  })

  watch(statistics, (allowed) => {
    if (!allowed) consent?.update({ analytics_storage: 'denied' })
  })

  const track = (event: AnalyticsEvent, params: AnalyticsParams = {}) => {
    if (!statistics.value) return
    proxy.dataLayer.push({ event, page: window.location.pathname, ...params })
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
