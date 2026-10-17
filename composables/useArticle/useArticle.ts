import { type ArticleData, articleQuery } from '~/composables/useArticle/article.query'
import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import {
  type MapContext,
  toClosing,
  toImage,
  toRichText,
  toSeo,
  toSlugs,
} from '~/utils/content/content.utils'
import { formatShortDate } from '~/utils/date/date.utils'
import { toAuthor, toCategoryLink, toPostCard, withHeadingAnchors } from '~/utils/post/post.utils'
import { readingMinutes } from '~/utils/readingTime/readingTime.utils'

import type { Author, Closing, Image, PostCard, RichText, Seo } from '~/types/content.types'

export interface ArticleView {
  seo: Seo
  title: string
  excerpt: string
  /** The breadcrumb's root: the magazine page. */
  magazineTo: string
  category?: { title: string; to: string }
  author?: Author
  /** Shown: "21 Sep 2026". */
  date: string
  /** Machine-readable, for `<time datetime>` and structured data. */
  dateTime: string
  readingMinutes: number
  cover?: Image
  takeaways: string[]
  /** The text's H2s, for the table of contents (their ids are on the blocks as `anchor`). */
  toc: Array<{ id: string; text: string }>
  body: RichText
  faq: Array<{ question: string; answer: string }>
  related: PostCard[]
  closing?: Closing
  /** For the language switcher: `{ de: { slug: 'protein-ohne-pulver' } }`, one per translation. */
  slugs: Record<string, { slug: string }>
}

function toArticleView(data: ArticleData, context: MapContext, slug: string): ArticleView | null {
  const { post } = data
  if (!post) return null

  const { body, toc } = withHeadingAnchors(toRichText(post.body, context))
  return {
    seo: toSeo(post.seo, {
      title: post.title,
      description: post.excerpt,
      image: toImage(post.cover)?.url,
    }),
    title: post.title,
    excerpt: post.excerpt,
    magazineTo: context.localePath('magazine'),
    category: toCategoryLink(post.category, context),
    author: toAuthor(post.author),
    date: formatShortDate(post.publishedAt, context.language, BUSINESS_TIME_ZONE),
    dateTime: post.publishedAt,
    readingMinutes: readingMinutes(post.words),
    cover: toImage(post.cover),
    takeaways: post.keyTakeaways ?? [],
    toc,
    body,
    faq: post.faq ?? [],
    related: data.related.map((card) => toPostCard(card, context)),
    closing: toClosing(data.closing, context),
    slugs: toSlugs(post.translations, { language: context.locale, slug }),
  }
}

/** The article at the current URL: 404 if it doesn't exist in this language, 503 on a CMS error. */
export async function useArticle(): Promise<ArticleView> {
  const context = useMapContext()
  const slug = String(useRoute().params.slug ?? '')

  const data = await useCmsQuery('article', articleQuery, { slug })
  const article = data && toArticleView(data, context, slug)
  if (!article) throw createError({ status: 404, fatal: true })
  return article
}
