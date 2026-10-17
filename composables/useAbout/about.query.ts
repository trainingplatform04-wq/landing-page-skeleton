import { z } from 'zod'

import { closingFragment, imageFragment, q, seoFragment } from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

export const aboutQuery = q
  .parameters<{ locale: string }>()
  .star.filterByType('aboutPage')
  .filterRaw('language == $locale')
  .slice(0)
  .project((page) => ({
    label: z.string().nullable(),
    title: z.string(),
    description: z.string().nullable(),
    image: page.field('image').project(imageFragment).nullable(true),
    closing: page.field('closing').project(closingFragment).nullable(true),
    seo: page.field('seo').project(seoFragment).nullable(true),
  }))
  .nullable(true)

export type AboutData = NonNullable<InferResultType<typeof aboutQuery>>
