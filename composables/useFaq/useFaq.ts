import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { type FaqData, faqQuery } from '~/composables/useFaq/faq.query'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import {
  editorOrder,
  type MapContext,
  toRichText,
  toSeo,
  unpublishedSeo,
} from '~/utils/content/content.utils'

import type { FaqItem, Seo } from '~/types/content.types'

export interface FaqView {
  seo: Seo
  title: string
  intro?: string
  items: FaqItem[]
}

function toFaqView(data: FaqData, context: MapContext, emptyTitle: string): FaqView {
  const items = editorOrder(data.items, data.page?.order ?? []).map((item) => ({
    ...item,
    answer: toRichText(item.answer, context),
  }))
  if (!data.page) return { seo: unpublishedSeo(emptyTitle), title: emptyTitle, items }
  return {
    seo: toSeo(data.page.seo, { title: data.page.title, description: data.page.intro }),
    title: data.page.title,
    intro: data.page.intro ?? undefined,
    items,
  }
}

/**
 * The FAQ page with every question of the active language: the editor's order first, then the
 * others oldest first. 503 on a CMS error.
 */
export async function useFaq(): Promise<FaqView> {
  const context = useMapContext()
  const { t } = useI18n()

  const data = await useCmsQuery('faq', faqQuery)
  return toFaqView(data ?? { page: null, items: [] }, context, t('nav.faq'))
}
