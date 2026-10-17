import { useConsent } from '~/composables/useConsent/useConsent'
import {
  CONSENT_COOKIE,
  CONSENT_DAYS,
  CONSENT_QUEUE,
  CONSENT_REVISION,
  type ConsentCategory,
  offeredCategories,
} from '~/constants/consent.constants'
import { cookiesOf } from '~/constants/cookies.constants'
import { LOCALES } from '~/constants/i18n.constants'
import { consentTranslation } from '~/utils/consent/consent.utils'

import type { CookieConsentConfig } from 'vanilla-cookieconsent'

type ConsentAction = 'accept-all' | 'reject-all' | 'settings'

declare global {
  interface Window {
    /** Answers given before this plugin ran (ConsentBanner's head script); `undefined` after. */
    [CONSENT_QUEUE]?: string[]
  }
}

const isAction = (value: string | undefined): value is ConsentAction =>
  value === 'accept-all' || value === 'reject-all' || value === 'settings'

/**
 * Consent, with CookieConsent v3 as the engine. The first window is our server-rendered
 * ConsentBanner; the library stores the choice, shows the "Settings" window and clears cookies on
 * withdrawal. Buttons with `data-consent="accept-all | reject-all | settings"` work anywhere,
 * never-hydrated HTML included; a click before the library has loaded is kept and applied.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { public: config } = useRuntimeConfig()
  const consent = useConsent()
  const i18n = nuxtApp.$i18n
  const categories = offeredCategories(config.gtmId)

  let api: typeof import('vanilla-cookieconsent') | undefined

  const record = () => {
    const accepted = (category: ConsentCategory) =>
      categories.includes(category) && api?.acceptedCategory(category) === true
    consent.record({ statistics: accepted('statistics'), externalMedia: accepted('externalMedia') })
    document.getElementById('consent-banner')?.remove()
  }

  const options: CookieConsentConfig = {
    revision: CONSENT_REVISION,
    cookie: { name: CONSENT_COOKIE, expiresAfterDays: CONSENT_DAYS, sameSite: 'Lax' },
    // Shown to every visitor, browsers driven by tools included: the consent tests and the
    // web performance audit see what a visitor sees.
    hideFromBots: false,
    // The first window is ConsentBanner (server HTML); the library shows only "Settings".
    autoShow: false,
    guiOptions: {
      consentModal: { layout: 'box', position: 'middle center', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    categories: Object.fromEntries(
      categories.map((category) => {
        const clear = cookiesOf(category).flatMap(({ clear }) => (clear ? [{ name: clear }] : []))
        return [
          category,
          category === 'necessary'
            ? { enabled: true, readOnly: true }
            : // Withdrawing a granted category reloads the page: its scripts and players
              // (GTM, YouTube) stop at once, nothing keeps running without consent.
              { autoClear: { cookies: clear, reloadPage: true } },
        ]
      }),
    ),
    onConsent: record,
    onChange: record,
    language: {
      default: i18n.locale.value,
      translations: Object.fromEntries(
        LOCALES.map(({ code }) => [
          code,
          consentTranslation((key) => i18n.t(key, {}, { locale: code }), categories, {
            privacy: nuxtApp.$localePath('privacy', code),
            imprint: nuxtApp.$localePath('imprint', code),
          }),
        ]),
      ),
    },
  }

  let resolveReady: () => void = () => {}
  const ready = new Promise<void>((resolve) => (resolveReady = resolve))

  const apply = async (action: ConsentAction) => {
    await ready
    if (action === 'accept-all') api?.acceptCategory('all')
    else if (action === 'reject-all') api?.acceptCategory([])
    else api?.showPreferences()
  }

  // Answers given before this plugin ran: apply the last one, then stop queueing.
  const early = window[CONSENT_QUEUE]?.filter(isAction).at(-1)
  window[CONSENT_QUEUE] = undefined
  if (early) void apply(early)

  document.addEventListener('click', (click) => {
    if (!(click.target instanceof Element)) return
    const action = click.target.closest<HTMLElement>('[data-consent]')?.dataset.consent
    if (!isAction(action)) return
    click.preventDefault()
    void apply(action)
  })

  nuxtApp.hook('app:mounted', async () => {
    const [library] = await Promise.all([
      import('vanilla-cookieconsent'),
      import('~/assets/css/consent.css'),
    ])
    api = library
    await api.run(options)
    resolveReady()
    // A visitor who already chose: their consent applies at once, without the window. Without
    // a choice and without the server window (a cached page), the library shows its own.
    if (api.validConsent()) record()
    else if (!document.getElementById('consent-banner')) api.show()
  })

  // The window follows the site's language.
  nuxtApp.hook('i18n:localeSwitched', ({ newLocale }) => {
    void api?.setLanguage(newLocale, true)
  })
})
