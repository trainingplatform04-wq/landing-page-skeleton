import { z } from 'zod'

import { businessQuery, q, seoFragment } from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

/** The page and the business facts apart: the facts show even while the page is unpublished. */
export const contactQuery = q.parameters<{ locale: string }>().project((root) => ({
  page: root.star
    .filterByType('contactPage')
    .filterRaw('language == $locale')
    .slice(0)
    .project((page) => ({
      title: z.string(),
      intro: z.string().nullable(),
      successText: z.string().nullable(),
      seo: page.field('seo').project(seoFragment).nullable(true),
    }))
    .nullable(true),
  business: businessQuery,
}))

export type ContactData = InferResultType<typeof contactQuery>
