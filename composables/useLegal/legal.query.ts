import { z } from 'zod'

import { q, richTextField, seoFragment } from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

export const legalQuery = q
  .parameters<{ locale: string; type: 'imprintPage' | 'privacyPage' }>()
  .star.filterByType('imprintPage', 'privacyPage')
  .filterRaw('_type == $type && language == $locale')
  .slice(0)
  .project((page) => ({
    title: z.string(),
    body: page.raw(...richTextField('body')),
    updatedAt: z.string().nullable(),
    seo: page.field('seo').project(seoFragment).nullable(true),
  }))
  .nullable(true)

export type LegalData = NonNullable<InferResultType<typeof legalQuery>>
