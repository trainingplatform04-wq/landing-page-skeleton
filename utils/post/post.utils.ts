import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import { type MapContext, toImage } from '~/utils/content/content.utils'
import { formatShortDate } from '~/utils/date/date.utils'
import { readingMinutes } from '~/utils/readingTime/readingTime.utils'

import type { PostCard } from '~/types/content.types'
import type { PostCardData } from '~/utils/groqd/groqd.utils'

/** An article on a card: its link, date and reading time ready to show. */
export function toPostCard(
  post: PostCardData,
  context: MapContext,
  readingTime: (minutes: number) => string,
): PostCard {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    to: context.localePath({ name: 'magazine-slug', params: { slug: post.slug } }),
    category: post.category ?? undefined,
    image: toImage(post.cover),
    author: post.author ? { name: post.author.name, photo: toImage(post.author.photo) } : undefined,
    date: formatShortDate(post.publishedAt, context.language, BUSINESS_TIME_ZONE),
    dateTime: post.publishedAt,
    readingTime: readingTime(readingMinutes(post.words ?? [])),
  }
}

/**
 * Anchor ids for headings, in order: lowercase words without accents joined by hyphens
 * ("Fünf Mahlzeiten" → "funf-mahlzeiten"); a repeated id gets "-2", "-3", ….
 */
export function headingIds(texts: string[]): string[] {
  const seen = new Map<string, number>()
  return texts.map((text) => {
    const base =
      text
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'section'
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  })
}
