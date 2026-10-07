import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import { type MapContext, toRichText, toSeo, unpublishedSeo } from '~/utils/content/content.utils'
import { q, richTextField, seoFragment } from '~/utils/groqd/groqd.utils'

import type { FaqItem, Seo } from '~/types/content.types'
import type { InferResultType } from 'groqd'

/** The page and the questions apart: questions are listed even while the page is unpublished. */
const faqQuery = q.parameters<{ locale: string }>().project((root) => ({
  page: root.star
    .filterByType('faqPage')
    .filterRaw('_id == "faqPage-" + $locale')
    .slice(0)
    .project((page) => ({
      title: z.string(),
      intro: z.string().nullable(),
      seo: page.field('seo').project(seoFragment).nullable(true),
    }))
    .nullable(true),
  items: root.star
    .filterByType('faqItem')
    .filterRaw('language == $locale')
    .order('_createdAt asc')
    .project((item) => ({
      id: ['_id', z.string()],
      question: z.string(),
      answer: item.raw(...richTextField('answer')),
    })),
}))

/** Everything the FAQ page shows. */
export interface FaqView {
  seo: Seo
  title: string
  intro?: string
  items: FaqItem[]
}

function toFaqView(
  data: InferResultType<typeof faqQuery>,
  context: MapContext,
  emptyTitle: string,
): FaqView {
  const items = data.items.map((item) => ({ ...item, answer: toRichText(item.answer, context) }))
  if (!data.page) return { seo: unpublishedSeo(emptyTitle), title: emptyTitle, items }
  return {
    seo: toSeo(data.page.seo, { title: data.page.title, description: data.page.intro }),
    title: data.page.title,
    intro: data.page.intro ?? undefined,
    items,
  }
}

/** The FAQ page with every question of the active language, oldest first: 503 on a CMS error. */
export async function useFaq(): Promise<FaqView> {
  const { runQuery, context } = useCms()
  const { t } = useI18n()

  const fetchFaq = () => runQuery(faqQuery, { parameters: { locale: context.locale } })
  const { data, error } = await useAsyncData(`faq:${context.locale}`, fetchFaq)

  if (error.value || !data.value) throw createError({ status: 503, fatal: true })

  return toFaqView(data.value, context, t('nav.faq'))
}
