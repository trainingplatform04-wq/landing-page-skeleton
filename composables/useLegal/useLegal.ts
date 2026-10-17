import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { type LegalData, legalQuery } from '~/composables/useLegal/legal.query'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import { type MapContext, toRichText, toSeo, unpublishedSeo } from '~/utils/content/content.utils'
import { formatDate } from '~/utils/date/date.utils'

import type { RichText, Seo } from '~/types/content.types'

export interface LegalView {
  seo: Seo
  title: string
  body: RichText
  /** "5. Oktober 2026" */
  updatedAt?: string
}

function toLegalView(page: LegalData, context: MapContext): LegalView {
  return {
    seo: toSeo(page.seo, { title: page.title }),
    title: page.title,
    body: toRichText(page.body, context),
    updatedAt: page.updatedAt
      ? formatDate(page.updatedAt, context.language, BUSINESS_TIME_ZONE)
      : undefined,
  }
}

/**
 * The imprint or the privacy policy in the active language (both required by German law): 503
 * on a CMS error, empty while unpublished.
 */
export async function useLegal(type: 'imprintPage' | 'privacyPage'): Promise<LegalView> {
  const context = useMapContext()
  const { t } = useI18n()

  const page = await useCmsQuery(type, legalQuery, { type })
  if (page) return toLegalView(page, context)
  const title = t(type === 'imprintPage' ? 'footer.imprint' : 'footer.privacy')
  return { seo: unpublishedSeo(title), title, body: [] }
}
