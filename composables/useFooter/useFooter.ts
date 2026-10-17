import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { type FooterData, footerQuery } from '~/composables/useFooter/footer.query'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import { type MapContext, toBusiness } from '~/utils/content/content.utils'
import { getZonedYear } from '~/utils/date/date.utils'
import { toLocalBusiness } from '~/utils/seo/seo.utils'

import type { Business } from '~/types/content.types'

/** What the footer of every page shows, and the business's structured data. */
export interface FooterView {
  siteName: string
  year: number
  note?: string
  business?: Business
  /** Always shown: the imprint and privacy pages must be reachable from every page. */
  legalLinks: { imprint: string; privacy: string }
  /** `LocalBusiness` structured data, when the business profile is filled in. */
  localBusiness?: ReturnType<typeof toLocalBusiness>
}

function toFooterView(
  data: FooterData | null,
  context: MapContext,
  site: { name: string; url: string },
): FooterView {
  const business = data?.business ? toBusiness(data.business) : undefined
  return {
    siteName: site.name,
    year: getZonedYear(new Date(), BUSINESS_TIME_ZONE),
    note: data?.footerNote ?? undefined,
    business,
    legalLinks: {
      imprint: context.localePath('imprint'),
      privacy: context.localePath('privacy'),
    },
    localBusiness: data?.business ? toLocalBusiness(data.business, site.url) : undefined,
  }
}

/**
 * The footer in the active language. Never throws: on a CMS error it shows what the code knows
 * (the page itself answers 503).
 */
export async function useFooter(): Promise<FooterView> {
  const context = useMapContext()
  const site = useSiteConfig()

  const data = await useCmsQuery('footer', footerQuery, {}, { optional: true })
  return toFooterView(data, context, { name: site.name, url: site.url })
}
