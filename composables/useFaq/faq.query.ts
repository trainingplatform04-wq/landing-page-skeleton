import { z } from 'zod'

import { q, richTextField, seoFragment } from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

/** The page and the questions apart: questions are listed even while the page is unpublished. */
export const faqQuery = q.parameters<{ locale: string }>().project((root) => ({
  page: root.star
    .filterByType('faqPage')
    .filterRaw('language == $locale')
    .slice(0)
    .project((page) => ({
      title: z.string(),
      intro: z.string().nullable(),
      order: page.field('order[]').field('_ref').nullable(true),
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

export type FaqData = InferResultType<typeof faqQuery>
