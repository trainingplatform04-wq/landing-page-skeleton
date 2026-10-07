import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import { type MapContext, toRichText, toSeo, unpublishedSeo } from '~/utils/content/content.utils'
import { formatDate } from '~/utils/date/date.utils'
import { q, richTextField, seoFragment } from '~/utils/groqd/groqd.utils'

import type { RichText, Seo } from '~/types/content.types'
import type { InferResultType } from 'groqd'

const legalQuery = q
  .parameters<{ locale: string; type: string }>()
  .star.filterByType('imprintPage', 'privacyPage')
  .filterRaw('_id == $type + "-" + $locale')
  .slice(0)
  .project((page) => ({
    title: z.string(),
    body: page.raw(...richTextField('body')),
    updatedAt: z.string().nullable(),
    seo: page.field('seo').project(seoFragment).nullable(true),
  }))
  .nullable(true)

/** Everything a legal page shows. */
export interface LegalView {
  seo: Seo
  title: string
  body: RichText
  /** "5. Oktober 2026" */
  updatedAt?: string
}

function toLegalView(
  page: InferResultType<typeof legalQuery> | undefined,
  context: MapContext,
): LegalView | null {
  if (!page) return null
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
 * The imprint or privacy policy in the active language: 503 on a CMS error, empty while
 * unpublished. Both are required by German law before the site goes live.
 */
export async function useLegal(type: 'imprintPage' | 'privacyPage'): Promise<LegalView> {
  const { runQuery, context } = useCms()
  const { t } = useI18n()

  const fetchLegal = () => runQuery(legalQuery, { parameters: { locale: context.locale, type } })
  const { data, error } = await useAsyncData(`${type}:${context.locale}`, fetchLegal)

  if (error.value) throw createError({ status: 503, fatal: true })

  const title = t(type === 'imprintPage' ? 'footer.imprint' : 'footer.privacy')
  return toLegalView(data.value, context) ?? { seo: unpublishedSeo(title), title, body: [] }
}
