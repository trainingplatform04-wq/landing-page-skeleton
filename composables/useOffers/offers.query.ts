import { z } from 'zod'

import { ctaFragment, offerCardFragment, q, seoFragment } from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

/** The page and the offers apart, so offers are listed even while the page isn't published. */
export const offersQuery = q.parameters<{ locale: string }>().project((root) => ({
  page: root.star
    .filterByType('offersPage')
    .filterRaw('language == $locale')
    .slice(0)
    .project((page) => ({
      title: z.string(),
      intro: z.string().nullable(),
      order: page.field('order[]').field('_ref').nullable(true),
      cta: page.field('cta').project(ctaFragment).nullable(true),
      seo: page.field('seo').project(seoFragment).nullable(true),
    }))
    .nullable(true),
  offers: root.star
    .filterByType('offer')
    .filterRaw('language == $locale && defined(slug.current)')
    .order('title asc')
    .project(offerCardFragment),
}))

export type OffersData = InferResultType<typeof offersQuery>
