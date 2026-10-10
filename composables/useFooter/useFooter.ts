import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import { toBusiness } from '~/utils/content/content.utils'
import { getZonedYear } from '~/utils/date/date.utils'
import { businessFragment, q } from '~/utils/groqd/groqd.utils'
import { toLocalBusiness } from '~/utils/seo/seo.utils'

import type { Business } from '~/types/content.types'
import type { InferResultType } from 'groqd'

const footerQuery = q.parameters<{ locale: string }>().project((root) => ({
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

/** Everything the footer of every page shows, and the business's structured data. */
export interface FooterView {
  footer: {
    siteName: string
    year: number
    note?: string
    business?: Business
    legalLinks: { imprint: string; privacy: string }
  }
  /** `LocalBusiness` structured data, when the business profile is filled in. */
  localBusiness?: ReturnType<typeof toLocalBusiness>
}

/**
 * The footer's data in the active language. Never throws: on a CMS error the footer shows what
 * the code knows (the page itself answers 503).
 */
export async function useFooter() {
  const { runQuery } = useCms()
  const { locale } = useI18n()
  const localePath = useLocalePath()
  const site = useSiteConfig()

  const fetchFooter = () =>
    runQuery(footerQuery, { parameters: { locale: locale.value } }).catch(() => null)
  const { data } = await useAsyncData(() => `footer:${locale.value}`, fetchFooter)

  return computed<FooterView>(() => {
    const footer: InferResultType<typeof footerQuery> | null | undefined = data.value
    return {
      footer: {
        siteName: site.name,
        year: getZonedYear(new Date(), BUSINESS_TIME_ZONE),
        note: footer?.footerNote ?? undefined,
        business: footer?.business ? toBusiness(footer.business) : undefined,
        legalLinks: { imprint: localePath('imprint'), privacy: localePath('privacy') },
      },
      localBusiness: footer?.business ? toLocalBusiness(footer.business, site.url) : undefined,
    }
  })
}
