import { z } from 'zod'

import { businessQuery, q } from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

export const footerQuery = q.parameters<{ locale: string }>().project((root) => ({
  footerNote: root.star
    .filterByType('siteSettings')
    .filterRaw('language == $locale')
    .slice(0)
    .field('footerNote', z.string().nullable()),
  business: businessQuery,
}))

export type FooterData = InferResultType<typeof footerQuery>
