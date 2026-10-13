import { useConsent } from '~/composables/useConsent/useConsent'
import {
  CONSENT_COOKIE,
  CONSENT_DAYS,
  CONSENT_REVISION,
  type ConsentCategory,
} from '~/constants/consent.constants'
import { cookiesOf } from '~/constants/cookies.constants'
import { type LocaleCode, LOCALES } from '~/constants/i18n.constants'

import type { CookieConsentConfig, Translation } from 'vanilla-cookieconsent'

/**
 * The consent window (CookieConsent v3, MIT): a centred modal, "Accept all" and "Reject all"
 * equal, "Settings" per category, the choice kept 6 months. It runs once the page is
 * interactive, so it never delays the first paint; nothing optional loads before a choice.
 * The footer's "Cookie settings" (`data-cc="show-preferencesModal"`) reopens it, even in
 * server-only HTML. Statistics is offered only when a GTM container is configured.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { public: config } = useRuntimeConfig()
  const consent = useConsent()
  const i18n = nuxtApp.$i18n
  const categories: ConsentCategory[] = config.gtmId
    ? ['necessary', 'statistics', 'externalMedia']
    : ['necessary', 'externalMedia']

  let api: typeof import('vanilla-cookieconsent') | undefined

  /** The window's texts in one language (i18n `consent.*`). */
  const translation = (locale: LocaleCode): Translation => {
    const t = (key: string) => i18n.t(key, {}, { locale })
    return {
      consentModal: {
        title: t('consent.title'),
        description: t('consent.description'),
        acceptAllBtn: t('consent.acceptAll'),
        acceptNecessaryBtn: t('consent.rejectAll'),
        showPreferencesBtn: t('consent.settings'),
        footer: `<a href="${nuxtApp.$localePath('privacy', locale)}">${t('footer.privacy')}</a><a href="${nuxtApp.$localePath('imprint', locale)}">${t('footer.imprint')}</a>`,
      },
      preferencesModal: {
        title: t('consent.settingsTitle'),
        acceptAllBtn: t('consent.acceptAll'),
        acceptNecessaryBtn: t('consent.rejectAll'),
        savePreferencesBtn: t('consent.save'),
        closeIconLabel: t('consent.close'),
        sections: [
          { description: t('consent.settingsIntro') },
          ...categories.map((category) => ({
            title: t(`consent.categories.${category}.title`),
            description: t(`consent.categories.${category}.description`),
            linkedCategory: category,
          })),
        ],
      },
    }
  }

  const record = () => {
    const accepted = (category: ConsentCategory) =>
      categories.includes(category) && api?.acceptedCategory(category) === true
    consent.record({ statistics: accepted('statistics'), externalMedia: accepted('externalMedia') })
  }

  const options: CookieConsentConfig = {
    revision: CONSENT_REVISION,
    cookie: { name: CONSENT_COOKIE, expiresAfterDays: CONSENT_DAYS, sameSite: 'Lax' },
    // Shown to every visitor, browsers driven by tools included: the consent tests and the
    // web performance audit see what a visitor sees.
    hideFromBots: false,
    disablePageInteraction: true,
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
            : { autoClear: clear.length ? { cookies: clear } : undefined },
        ]
      }),
    ),
    onConsent: record,
    onChange: record,
    language: {
      default: i18n.locale.value,
      translations: Object.fromEntries(LOCALES.map(({ code }) => [code, translation(code)])),
    },
  }

  nuxtApp.hook('app:mounted', async () => {
    const [library] = await Promise.all([
      import('vanilla-cookieconsent'),
      import('~/assets/css/consent.css'),
    ])
    api = library
    await api.run(options)
    // A visitor who already chose: their consent applies at once, without the window.
    if (api.validConsent()) record()
  })

  // The window follows the site's language.
  nuxtApp.hook('i18n:localeSwitched', ({ newLocale }) => {
    void api?.setLanguage(newLocale, true)
  })
})
