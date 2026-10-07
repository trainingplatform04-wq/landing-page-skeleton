import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import { NAVIGATION } from '~/constants/navigation.constants'
import { toBusiness } from '~/utils/content/content.utils'
import { getZonedYear } from '~/utils/date/date.utils'
import { businessFragment, q } from '~/utils/groqd/groqd.utils'
import { toLocalBusiness } from '~/utils/seo/seo.utils'

import type { NavigationMenuItem } from '@nuxt/ui'
import type { Business } from '~/types/content.types'
import type { InferResultType } from 'groqd'

const layoutQuery = q.parameters<{ locale: string }>().project((root) => ({
  footerNote: root.star
    .filterByType('siteSettings')
    .filterRaw('_id == "siteSettings-" + $locale')
    .slice(0)
    .field('footerNote', z.string().nullable()),
  business: root.star
    .filterByType('businessProfile')
    .filterRaw('_id == "businessProfile"')
    .slice(0)
    .project(businessFragment)
    .nullable(true),
}))

/** Everything the frame of every page shows: header, footer, structured data. */
export interface LayoutView {
  siteName: string
  homePath: string
  navigation: NavigationMenuItem[]
  footer: {
    year: number
    note?: string
    business?: Business
    legalLinks: { imprint: string; privacy: string }
  }
  /** `LocalBusiness` structured data, when the business profile is filled in. */
  localBusiness?: ReturnType<typeof toLocalBusiness>
}

/**
 * The frame's data, following the language when the visitor switches it. Never throws:
 * on a CMS error the frame shows what the code knows (the page itself answers 503).
 */
export async function useLayout() {
  const { runQuery } = useCms()
  const { locale, t } = useI18n()
  const localePath = useLocalePath()
  const site = useSiteConfig()

  const fetchLayout = () =>
    runQuery(layoutQuery, { parameters: { locale: locale.value } }).catch(() => null)
  const { data } = await useAsyncData(() => `layout:${locale.value}`, fetchLayout)

  return computed<LayoutView>(() => {
    const layout: InferResultType<typeof layoutQuery> | null | undefined = data.value
    return {
      siteName: site.name,
      homePath: localePath('index'),
      navigation: NAVIGATION.map(({ route, label }) => ({
        label: t(label),
        to: localePath(route),
      })),
      footer: {
        year: getZonedYear(new Date(), BUSINESS_TIME_ZONE),
        note: layout?.footerNote ?? undefined,
        business: layout?.business ? toBusiness(layout.business) : undefined,
        legalLinks: { imprint: localePath('imprint'), privacy: localePath('privacy') },
      },
      localBusiness: layout?.business ? toLocalBusiness(layout.business, site.url) : undefined,
    }
  })
}
