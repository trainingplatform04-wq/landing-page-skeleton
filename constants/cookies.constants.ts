import { CONSENT_COOKIE, type ConsentCategory } from '~/constants/consent.constants'

/**
 * Every cookie the site can set or cause, the single source for the consent window, the
 * cookie table on the privacy page and the consent tests. A new tool or cookie is added here
 * first, with `CONSENT_REVISION` raised (the Privacy Officer reviews it). Purpose and duration
 * are i18n keys (`cookies.<id>.*`): facts in code, words per language.
 */
export interface CookieEntry {
  /** Key of the i18n texts: `cookies.<id>.purpose`, `cookies.<id>.duration`. */
  id: string
  /** The cookie's name as the browser shows it (`*` stands for a variable part). */
  name: string
  provider: 'site' | 'google' | 'youtube'
  category: ConsentCategory
  /** Removed from the browser when the visitor withdraws the category (`autoClear`). */
  clear?: RegExp
}

export const COOKIES: CookieEntry[] = [
  { id: 'consent', name: CONSENT_COOKIE, provider: 'site', category: 'necessary' },
  // Not a cookie: the colour scheme (light/dark, following the device) in localStorage.
  { id: 'colorMode', name: 'nuxt-color-mode', provider: 'site', category: 'necessary' },
  { id: 'ga', name: '_ga', provider: 'google', category: 'statistics', clear: /^_ga$/ },
  { id: 'gaSession', name: '_ga_*', provider: 'google', category: 'statistics', clear: /^_ga_/ },
  {
    id: 'youtubeVisitor',
    name: 'VISITOR_INFO1_LIVE',
    provider: 'youtube',
    category: 'externalMedia',
  },
  { id: 'youtubeSession', name: 'YSC', provider: 'youtube', category: 'externalMedia' },
]

/** The cookies of one category. */
export const cookiesOf = (category: ConsentCategory) =>
  COOKIES.filter((cookie) => cookie.category === category)
