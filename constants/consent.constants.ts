/**
 * Consent (GDPR, TDDDG §25): what the visitor can allow, and for how long. The texts are i18n
 * keys (`consent.*`); the cookies behind each category are in `constants/cookies.constants.ts`.
 */

/** The categories of the consent window, in the order shown. */
export const CONSENT_CATEGORIES = ['necessary', 'statistics', 'externalMedia'] as const

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number]

/** The categories this site offers: statistics only with a GTM container (`NUXT_PUBLIC_GTM_ID`). */
export const offeredCategories = (gtmId: string): ConsentCategory[] =>
  CONSENT_CATEGORIES.filter((category) => category !== 'statistics' || Boolean(gtmId))

/** Optional categories: off until the visitor allows them. */
export type OptionalCategory = Exclude<ConsentCategory, 'necessary'>

/**
 * Raise it whenever a category, a tool or a cookie changes: every visitor is asked again
 * (their earlier consent no longer covers what the site does).
 */
export const CONSENT_REVISION = 2

/** A choice is remembered 6 months, then the visitor is asked again. */
export const CONSENT_DAYS = 182

/** The cookie that stores the choice (necessary: it is what makes "no" stick). */
export const CONSENT_COOKIE = 'cc_cookie'

/** The light or dark scheme the visitor picked with the header switch; never a default. */
export const COLOR_MODE_COOKIE = 'color-mode'

/**
 * Where a click on the consent window waits until the site's JavaScript runs: the window is in
 * the server HTML, so a visitor can answer before the app has loaded (see ConsentBanner).
 */
export const CONSENT_QUEUE = '__consentQueue'
