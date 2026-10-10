import { NAVIGATION } from '~/constants/navigation.constants'

import type { NavigationMenuItem } from '@nuxt/ui'

/** What the header of every page shows: known from the code, no CMS (the footer has its data). */
export interface LayoutView {
  siteName: string
  homePath: string
  navigation: NavigationMenuItem[]
}

/** The header's site name, home link and menu, following the language when it changes. */
export function useLayout() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const site = useSiteConfig()

  return computed<LayoutView>(() => ({
    siteName: site.name,
    homePath: localePath('index'),
    navigation: NAVIGATION.map(({ route, label }) => ({ label: t(label), to: localePath(route) })),
  }))
}
