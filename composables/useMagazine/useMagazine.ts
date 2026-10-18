import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { type MagazineData, magazineQuery } from '~/composables/useMagazine/magazine.query'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import { type MapContext, toClosing, toSeo, unpublishedSeo } from '~/utils/content/content.utils'
import { pageCount, pageHref, pageRange, parsePageParam } from '~/utils/pagination/pagination.utils'
import { toPostCard } from '~/utils/post/post.utils'

import type { Closing, MagazineTab, PostCard, Seo } from '~/types/content.types'

/** On "All", page 1 opens with the 3 newest articles; every page lists 9 more. */
const FEATURED_COUNT = 3
const PAGE_SIZE = 9

export interface MagazineView {
  seo: Seo
  label?: string
  title: string
  intro?: string
  closing?: Closing
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

/**
 * The category and page in the URL. `null` for a URL that is not a view of its own: an empty or
 * repeated category (a duplicate of "All") or a page that is not 2, 3, ….
 */
function parseFilter(query: { category?: unknown; page?: unknown }) {
  const { category = '' } = query
  const page = parsePageParam(query.page)
  if (typeof category !== 'string' || (query.category !== undefined && !category)) return null
  return page ? { category, page } : null
}

/** `null` for a view that doesn't exist: an unknown category or a page past the last one. */
function toMagazineView(
  data: MagazineData,
  context: MapContext,
  { category, page }: { category: string; page: number },
  texts: { emptyTitle: string; all: string },
): MagazineView | null {
  const known = !category || data.categories.some(({ slug }) => slug === category)
  const pages = pageCount(data.total, PAGE_SIZE, category ? 0 : FEATURED_COUNT)
  if (!known || page > pages) return null

  const base = context.localePath('magazine')
  const cards = data.posts.map((post) => toPostCard(post, context))
  const opening = !category && page === 1
  const tabs: MagazineTab[] = [
    { label: texts.all, to: base, active: !category },
    ...data.categories.map(({ title, slug }) => ({
      label: title,
      to: pageHref(base, { category: slug }, 1),
      active: slug === category,
    })),
  ]
  const shared = {
    tabs,
    featured: opening ? cards.slice(0, FEATURED_COUNT) : [],
    posts: opening ? cards.slice(FEATURED_COUNT) : cards,
    pages:
      pages > 1
        ? Array.from({ length: pages }, (_, index) => pageHref(base, { category }, index + 1))
        : [],
    page,
    filtered: Boolean(category),
    allTo: base,
  }

  if (!data.page)
    return { seo: unpublishedSeo(texts.emptyTitle), title: texts.emptyTitle, ...shared }
  return {
    seo: toSeo(data.page.seo, { title: data.page.title, description: data.page.intro }),
    label: data.page.label ?? undefined,
    title: data.page.title,
    intro: data.page.intro ?? undefined,
    closing: toClosing(data.page.closing, context),
    ...shared,
  }
}

/**
 * The magazine page in the active language, filtered and paginated by the URL: 404 for an
 * unknown category or page, 503 on a CMS error.
 */
export async function useMagazine(): Promise<MagazineView> {
  const context = useMapContext()
  const { t } = useI18n()
  const filter = parseFilter(useRoute().query)
  if (!filter) throw createError({ status: 404, fatal: true })

  const { category, page } = filter
  const data = await useCmsQuery('magazine', magazineQuery, {
    category,
    ...pageRange(page, PAGE_SIZE, category ? 0 : FEATURED_COUNT),
  })
  const magazine =
    data &&
    toMagazineView(data, context, filter, { emptyTitle: t('nav.magazine'), all: t('magazine.all') })
  if (!magazine) throw createError({ status: 404, fatal: true })
  return magazine
}
