import { z } from 'zod'

import { closingFragment, postCardFragment, q, seoFragment } from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

/** The articles of the current view: this language, with a URL, in the category if one is picked. */
const POSTS_FILTER =
  'language == $locale && defined(slug.current) && ($category == "" || category->slug.current == $category)'

export const magazineQuery = q
  .parameters<{ locale: string; category: string; start: number; end: number }>()
  .project((root) => ({
    page: root.star
      .filterByType('magazinePage')
      .filterRaw('language == $locale')
      .slice(0)
      .project((page) => ({
        label: z.string().nullable(),
        title: z.string(),
        intro: z.string().nullable(),
        closing: page.field('closing').project(closingFragment).nullable(true),
        seo: page.field('seo').project(seoFragment).nullable(true),
      }))
      .nullable(true),
    categories: root.star
      .filterByType('category')
      .filterRaw('language == $locale && defined(slug.current)')
      .order('order asc')
      .project({ title: z.string(), slug: ['slug.current', z.string()] }),
    total: root.raw(`count(*[_type == "post" && ${POSTS_FILTER}])`, z.number()),
    posts: root.star
      .filterByType('post')
      .filterRaw(POSTS_FILTER)
      .order('publishedAt desc')
      .raw('[$start...$end]', 'passthrough')
      .project(postCardFragment),
  }))

export type MagazineData = InferResultType<typeof magazineQuery>
