import { z } from 'zod'

import {
  ctaFragment,
  imageFragment,
  q,
  richTextField,
  seoFragment,
  translationsField,
} from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

export const offerQuery = q
  .parameters<{ locale: string; slug: string }>()
  .star.filterByType('offer')
  .filterRaw('language == $locale && slug.current == $slug')
  .slice(0)
  .project((offer) => ({
    title: z.string(),
    summary: z.string(),
    image: offer.field('image').project(imageFragment).nullable(true),
    body: offer.raw(...richTextField('body')),
    price: z.number().nullable(),
    cta: offer.field('cta').project(ctaFragment).nullable(true),
    seo: offer.field('seo').project(seoFragment).nullable(true),
    translations: offer.raw(...translationsField),
  }))
  .nullable(true)

export type OfferData = NonNullable<InferResultType<typeof offerQuery>>
