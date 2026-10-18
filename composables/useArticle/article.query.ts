import { z } from 'zod'

import {
  authorFragment,
  closingFragment,
  imageFragment,
  postCardFragment,
  q,
  richTextField,
  seoFragment,
  translationsField,
  wordCountField,
} from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

/**
 * "Keep reading": up to 3 other articles, the same category first, each group newest first.
 * Sorted by the CMS, so only these 3 cards reach the page.
 */
const RELATED_ORDER = `| order(
  (defined(category) && category._ref == *[_type == "post" && language == $locale && slug.current == $slug][0].category._ref) desc,
  publishedAt desc
)[0...3]`

export const articleQuery = q.parameters<{ locale: string; slug: string }>().project((root) => ({
  post: root.star
    .filterByType('post')
    .filterRaw('language == $locale && slug.current == $slug')
    .slice(0)
    .project((post) => ({
      title: z.string(),
      excerpt: z.string(),
      publishedAt: z.string(),
      cover: post.field('cover').project(imageFragment).nullable(true),
      category: post
        .field('category')
        .deref()
        .project({ title: z.string(), slug: ['slug.current', z.string()] })
        .nullable(true),
      author: post.field('author').deref().project(authorFragment).nullable(true),
      keyTakeaways: z.array(z.string()).nullable(),
      faq: post.field('faq[]').project({ question: z.string(), answer: z.string() }).nullable(true),
      body: post.raw(...richTextField('body')),
      words: post.raw(...wordCountField('body')),
      seo: post.field('seo').project(seoFragment).nullable(true),
      translations: post.raw(...translationsField),
    }))
    .nullable(true),
  related: root.star
    .filterByType('post')
    .filterRaw('language == $locale && defined(slug.current) && slug.current != $slug')
    .raw(RELATED_ORDER, 'passthrough')
    .project(postCardFragment),
  closing: root.star
    .filterByType('magazinePage')
    .filterRaw('language == $locale')
    .slice(0)
    .field('closing')
    .project(closingFragment)
    .nullable(true),
}))

export type ArticleData = InferResultType<typeof articleQuery>
