import type { LocaleCode } from '~/constants/i18n.constants'

type LocalizedPaths = Record<LocaleCode, `/${string}`>

/**
 * The translated URL of every page, keyed by route name (the page file's name).
 * Used by the router (`i18n.pages` in nuxt.config.ts), the Studio's link picker and the
 * sitemap. @nuxtjs/i18n adds the `/en` prefix.
 */
export const ROUTE_PATHS = {
  index: { de: '/', en: '/' },
  offers: { de: '/angebote', en: '/offers' },
  'offers-slug': { de: '/angebote/[slug]', en: '/offers/[slug]' },
  faq: { de: '/faq', en: '/faq' },
  contact: { de: '/kontakt', en: '/contact' },
  imprint: { de: '/impressum', en: '/imprint' },
  privacy: { de: '/datenschutz', en: '/privacy' },
} as const satisfies Record<string, LocalizedPaths>

export type RouteName = keyof typeof ROUTE_PATHS

/** The Sanity document behind each page, one per language (id `<type>-<locale>`). */
export const PAGE_TYPES = {
  index: 'homePage',
  offers: 'offersPage',
  faq: 'faqPage',
  contact: 'contactPage',
  imprint: 'imprintPage',
  privacy: 'privacyPage',
} as const satisfies Partial<Record<RouteName, string>>
