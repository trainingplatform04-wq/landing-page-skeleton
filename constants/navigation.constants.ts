import type { RouteName } from '~/constants/routes.constants'

/** The main menu, in order: each page with the key of its label in `i18n/locales/`. */
export const NAVIGATION: ReadonlyArray<{ route: RouteName; label: string }> = [
  { route: 'about', label: 'nav.about' },
  { route: 'faq', label: 'nav.faq' },
  { route: 'contact', label: 'nav.contact' },
]
