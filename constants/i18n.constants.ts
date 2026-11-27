/**
 * Supported locales, for the web app and the Studio.
 * Adding a locale: here, a file in `i18n/locales/`, and its paths in `constants/routes.constants.ts`.
 */
export const LOCALES = [
  { code: 'de', language: 'de-DE', name: 'Deutsch' },
  { code: 'en', language: 'en-US', name: 'English' },
] as const

export type LocaleCode = (typeof LOCALES)[number]['code']

/** Served without a URL prefix (`/kontakt`); others are prefixed (`/en/contact`). */
export const DEFAULT_LOCALE: LocaleCode = 'de'
