import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import { type MapContext, toCta, toImage, toRichText, toSeo } from '~/utils/content/content.utils'
import { formatShortDate } from '~/utils/date/date.utils'
import {
  bodyWordsField,
  ctaFragment,
  imageFragment,
  postCardFragment,
  q,
  richTextBlock,
  seoFragment,
} from '~/utils/groqd/groqd.utils'
import { headingIds, toPostCard } from '~/utils/post/post.utils'
import { readingMinutes } from '~/utils/readingTime/readingTime.utils'

import type { Cta, Image, PostCard, RichText, Seo } from '~/types/content.types'
import type { InferResultType } from 'groqd'

/**
 * "Keep reading": up to 3 other articles, those of the same category first, each group newest
 * first. Picked by the query, so only these 3 cards reach the page.
 */
const RELATED = `| order(
  (defined(category) && category._ref == *[_type == "post" && language == $locale && slug.current == $slug][0].category._ref) desc,
  publishedAt desc
)[0...3]`

/**
 * The article text with what the page needs added: linked offers' slug and language, and the
 * URL of figure images.
 */
const ARTICLE_BODY = [
  `body[]{
    ...,
    markDefs[]{ ..., "offerSlug": reference->slug.current, "offerLanguage": reference->language },
    _type == "figure" => { "image": { "alt": image.alt, "url": image.asset->url } }
  }`,
  z.array(richTextBlock).nullable(),
] as const

const articleQuery = q.parameters<{ locale: string; slug: string }>().project((root) => ({
  post: root.star
    .filterByType('post')
    .filterRaw('language == $locale && slug.current == $slug')
    .slice(0)
    .project((post) => ({
      id: ['_id', z.string()],
      title: z.string(),
      excerpt: z.string(),
      publishedAt: z.string(),
      cover: post.field('cover').project(imageFragment).nullable(true),
      category: post
        .field('category')
        .deref()
        .project({ title: z.string(), slug: ['slug.current', z.string()] })
        .nullable(true),
      author: post
        .field('author')
        .deref()
        .project((author) => ({
          name: z.string(),
          role: z.string().nullable(),
          bio: z.string().nullable(),
          photo: author.field('photo').project(imageFragment).nullable(true),
        }))
        .nullable(true),
      keyTakeaways: z.array(z.string()).nullable(),
      faq: post.field('faq[]').project({ question: z.string(), answer: z.string() }).nullable(true),
      body: post.raw(...ARTICLE_BODY),
      words: post.raw(...bodyWordsField),
      seo: post.field('seo').project(seoFragment).nullable(true),
      // The slug of this article in every language it is translated into.
      translations: post.raw(
        '*[_type == "translation.metadata" && references(^._id)][0].translations[].value->{ language, "slug": slug.current }',
        z.array(z.object({ language: z.string(), slug: z.string() }).nullable()).nullable(),
      ),
    }))
    .nullable(true),
  related: root.star
    .filterByType('post')
    .filterRaw('language == $locale && defined(slug.current) && slug.current != $slug')
    .raw(RELATED, 'passthrough')
    .project(postCardFragment),
  closing: root.star
    .filterByType('magazinePage')
    .filterRaw('_id == "magazinePage-" + $locale')
    .slice(0)
    .project((page) => ({
      title: ['closingTitle', z.string().nullable()],
      text: ['closingText', z.string().nullable()],
      cta: page.field('cta').project(ctaFragment).nullable(true),
    }))
    .nullable(true),
}))

type ArticleData = InferResultType<typeof articleQuery>

/** Everything the article page shows. */
export interface ArticleView {
  seo: Seo
  title: string
  excerpt: string
  /** The breadcrumb's root: the magazine page. */
  magazineTo: string
  category?: { title: string; to: string }
  author?: { name: string; firstName: string; role?: string; bio?: string; photo?: Image }
  /** Shown: "21 Sep 2026". */
  date: string
  /** Machine-readable, for `<time datetime>` and structured data. */
  dateTime: string
  readingTime: string
  cover?: Image
  takeaways: string[]
  /** The text's H2s, for the table of contents (their ids are on the blocks as `anchor`). */
  toc: Array<{ id: string; text: string }>
  body: RichText
  faq: Array<{ question: string; answer: string }>
  related: PostCard[]
  closing?: { title?: string; text?: string; cta?: Cta }
  /** For the language switcher: `{ de: { slug: 'protein-ohne-pulver' } }`, one per translation. */
  slugs: Record<string, { slug: string }>
}

const plainText = (block: RichText[number]) =>
  ((block.children as Array<{ text?: string }> | undefined) ?? [])
    .map(({ text }) => text ?? '')
    .join('')

function toArticleView(
  data: ArticleData,
  context: MapContext,
  slug: string,
  readingTime: (minutes: number) => string,
): ArticleView | null {
  const { post } = data
  if (!post) return null

  const blocks = toRichText(post.body, context)
  const headings = blocks.filter((block) => block._type === 'block' && block.style === 'h2')
  const ids = headingIds(headings.map(plainText))
  const anchors = new Map(headings.map((block, index) => [block._key, ids[index]!]))
  const body = blocks.map((block) =>
    anchors.has(block._key) ? { ...block, anchor: anchors.get(block._key) } : block,
  )

  const cta = toCta(data.closing?.cta, context)
  const closingTitle = data.closing?.title ?? undefined
  const translations = post.translations ?? [{ language: context.locale, slug }]

  return {
    seo: toSeo(post.seo, {
      title: post.title,
      description: post.excerpt,
      image: post.cover?.url ?? undefined,
    }),
    title: post.title,
    excerpt: post.excerpt,
    magazineTo: context.localePath('magazine'),
    category: post.category
      ? {
          title: post.category.title,
          to: `${context.localePath('magazine')}?category=${encodeURIComponent(post.category.slug)}`,
        }
      : undefined,
    author: post.author
      ? {
          name: post.author.name,
          firstName: post.author.name.split(' ')[0] ?? post.author.name,
          role: post.author.role ?? undefined,
          bio: post.author.bio ?? undefined,
          photo: toImage(post.author.photo),
        }
      : undefined,
    date: formatShortDate(post.publishedAt, context.language, BUSINESS_TIME_ZONE),
    dateTime: post.publishedAt,
    readingTime: readingTime(readingMinutes(post.words ?? [])),
    cover: toImage(post.cover),
    takeaways: post.keyTakeaways ?? [],
    toc: headings.map((block, index) => ({ id: ids[index]!, text: plainText(block) })),
    body,
    faq: post.faq ?? [],
    related: data.related.map((card) => toPostCard(card, context, readingTime)),
    // Shown with a title or a button; a text alone has nothing to lead to.
    closing:
      closingTitle || cta
        ? { title: closingTitle, text: data.closing?.text ?? undefined, cta }
        : undefined,
    slugs: Object.fromEntries(
      translations.flatMap((version) =>
        version ? [[version.language, { slug: version.slug }]] : [],
      ),
    ),
  }
}

/** The article at the current URL in the active language: 404 if unknown here, 503 on a CMS error. */
export async function useArticle(): Promise<ArticleView> {
  const { runQuery, context } = useCms()
  const { t } = useI18n()
  const slug = String(useRoute().params.slug ?? '')

  const fetchArticle = () =>
    runQuery(articleQuery, { parameters: { locale: context.locale, slug } })
  const { data, error } = await useAsyncData(`article:${context.locale}:${slug}`, fetchArticle)

  if (error.value || !data.value) throw createError({ status: 503, fatal: true })

  const article = toArticleView(data.value, context, slug, (minutes) =>
    t('magazine.readingTime', { n: minutes }),
  )
  if (!article) throw createError({ status: 404, fatal: true })
  return article
}
