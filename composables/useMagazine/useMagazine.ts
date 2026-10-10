import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import {
  type MapContext,
  toCta,
  toImage,
  toSeo,
  unpublishedSeo,
} from '~/utils/content/content.utils'
import { formatShortDate } from '~/utils/date/date.utils'
import { ctaFragment, imageFragment, q, seoFragment } from '~/utils/groqd/groqd.utils'
import { readingMinutes } from '~/utils/readingTime/readingTime.utils'

import type { Cta, MagazineTab, PostCard, Seo } from '~/types/content.types'
import type { InferResultType } from 'groqd'

/** On "All", page 1 opens with the 3 newest articles; every page lists 9 more. */
const FEATURED_COUNT = 3
const PAGE_SIZE = 9

/**
 * The filter, the same in every language (a category's slug is too): @nuxtjs/i18n copies the
 * query into the other language's links (hreflang, language switcher) unchanged.
 */
const CATEGORY_PARAM = 'category'

const POSTS_FILTER =
  'language == $locale && defined(slug.current) && ($category == "" || category->slug.current == $category)'

const magazineQuery = q
  .parameters<{ locale: string; category: string; start: number; end: number }>()
  .project((root) => ({
    page: root.star
      .filterByType('magazinePage')
      .filterRaw('_id == "magazinePage-" + $locale')
      .slice(0)
      .project((page) => ({
        kicker: z.string().nullable(),
        title: z.string(),
        intro: z.string().nullable(),
        closingTitle: z.string().nullable(),
        closingText: z.string().nullable(),
        cta: page.field('cta').project(ctaFragment).nullable(true),
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
      .project((post) => ({
        id: ['_id', z.string()],
        title: z.string(),
        slug: ['slug.current', z.string()],
        excerpt: z.string(),
        publishedAt: z.string(),
        cover: post.field('cover').project(imageFragment).nullable(true),
        category: post.field('category').deref().field('title', z.string()).nullable(true),
        author: post
          .field('author')
          .deref()
          .project((author) => ({
            name: z.string(),
            photo: author.field('photo').project(imageFragment).nullable(true),
          }))
          .nullable(true),
        // The text of every block, for the reading time.
        words: post.raw(
          'body[]{ text, children[]{ text } }',
          z
            .array(
              z.object({
                text: z.string().nullish(),
                children: z.array(z.object({ text: z.string().nullish() })).nullish(),
              }),
            )
            .nullable(),
        ),
      })),
  }))

type MagazineData = InferResultType<typeof magazineQuery>

/** Everything the magazine page shows. */
export interface MagazineView {
  seo: Seo
  kicker?: string
  title: string
  intro?: string
  closing?: { title?: string; text?: string; cta?: Cta }
  tabs: MagazineTab[]
  /** The 3 newest articles: on "All", page 1 only. */
  featured: PostCard[]
  posts: PostCard[]
  /** Page links, the first page at index 0; one page shows no pagination. */
  pages: string[]
  page: number
  /** A category is selected: an empty list then offers the link back to all articles. */
  filtered: boolean
  /** The link that resets the filter (empty state). */
  allTo: string
}

/** Where the current page starts in the list of articles, and how many it fetches. */
export function magazineRange(page: number, category: string): { start: number; end: number } {
  if (category) return { start: (page - 1) * PAGE_SIZE, end: page * PAGE_SIZE }
  if (page === 1) return { start: 0, end: FEATURED_COUNT + PAGE_SIZE }
  const start = FEATURED_COUNT + (page - 1) * PAGE_SIZE
  return { start, end: start + PAGE_SIZE }
}

function toPostCard(
  post: MagazineData['posts'][number],
  context: MapContext,
  readingTime: (minutes: number) => string,
): PostCard {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    to: `${context.localePath('magazine')}/${post.slug}`,
    category: post.category ?? undefined,
    image: toImage(post.cover),
    author: post.author ? { name: post.author.name, photo: toImage(post.author.photo) } : undefined,
    date: formatShortDate(post.publishedAt, context.language, BUSINESS_TIME_ZONE),
    dateTime: post.publishedAt,
    readingTime: readingTime(readingMinutes(post.words ?? [])),
  }
}

function toMagazineView(
  data: MagazineData,
  context: MapContext,
  filter: { page: number; category: string },
  texts: { emptyTitle: string; all: string; readingTime: (minutes: number) => string },
): MagazineView | null {
  const known = !filter.category || data.categories.some(({ slug }) => slug === filter.category)
  if (!known) return null
  const base = context.localePath('magazine')
  const query = (category: string, page: number) => {
    const search = new URLSearchParams()
    if (category) search.set(CATEGORY_PARAM, category)
    if (page > 1) search.set('page', String(page))
    const text = search.toString()
    return text ? `${base}?${text}` : base
  }

  const cards = data.posts.map((post) => toPostCard(post, context, texts.readingTime))
  const opening = !filter.category && filter.page === 1
  const listed = filter.category ? data.total : Math.max(data.total - FEATURED_COUNT, 0)
  const pageCount = Math.max(1, Math.ceil(listed / PAGE_SIZE))
  if (filter.page > pageCount) return null

  const tabs: MagazineTab[] = [
    { label: texts.all, to: base, active: !filter.category },
    ...data.categories.map(({ title, slug }) => ({
      label: title,
      to: query(slug, 1),
      active: slug === filter.category,
    })),
  ]
  const shared = {
    tabs,
    featured: opening ? cards.slice(0, FEATURED_COUNT) : [],
    posts: opening ? cards.slice(FEATURED_COUNT) : cards,
    pages:
      pageCount > 1
        ? Array.from({ length: pageCount }, (_, index) => query(filter.category, index + 1))
        : [],
    page: filter.page,
    filtered: Boolean(filter.category),
    allTo: base,
  }

  if (!data.page)
    return { seo: unpublishedSeo(texts.emptyTitle), title: texts.emptyTitle, ...shared }
  const { page } = data
  const cta = toCta(page.cta, context)
  // Shown with a title or a button; a text alone has nothing to lead to.
  const closing =
    page.closingTitle || cta
      ? { title: page.closingTitle ?? undefined, text: page.closingText ?? undefined, cta }
      : undefined
  return {
    seo: toSeo(page.seo, { title: page.title, description: page.intro }),
    kicker: page.kicker ?? undefined,
    title: page.title,
    intro: page.intro ?? undefined,
    closing,
    ...shared,
  }
}

/**
 * The magazine page in the active language, filtered and paginated by the URL: 404 for an
 * unknown category or a page past the last one, 503 on a CMS error.
 */
export async function useMagazine(): Promise<MagazineView> {
  const { runQuery, context } = useCms()
  const { t } = useI18n()
  const route = useRoute()

  const filter = route.query[CATEGORY_PARAM]
  const category = typeof filter === 'string' ? filter : ''
  // Page 1 has no `page` parameter: only 2, 3, … are pages of their own (no duplicates).
  const page = route.query.page === undefined ? 1 : Number(route.query.page)
  if (!Number.isInteger(page) || page < 2) {
    if (route.query.page !== undefined) throw createError({ status: 404, fatal: true })
  }
  const range = magazineRange(page, category)

  const fetchMagazine = () =>
    runQuery(magazineQuery, { parameters: { locale: context.locale, category, ...range } })
  const { data, error } = await useAsyncData(
    `magazine:${context.locale}:${category}:${page}`,
    fetchMagazine,
  )

  if (error.value || !data.value) throw createError({ status: 503, fatal: true })

  const magazine = toMagazineView(
    data.value,
    context,
    { page, category },
    {
      emptyTitle: t('nav.magazine'),
      all: t('magazine.all'),
      readingTime: (minutes) => t('magazine.readingTime', { n: minutes }),
    },
  )
  if (!magazine) throw createError({ status: 404, fatal: true })
  return magazine
}
