import { BUSINESS_TIME_ZONE } from '~/constants/date.constants'
import { type MapContext, toImage } from '~/utils/content/content.utils'
import { formatShortDate } from '~/utils/date/date.utils'
import { readingMinutes } from '~/utils/readingTime/readingTime.utils'

import type { Author, PostCard, RichText } from '~/types/content.types'
import type { AuthorData, PostCardData } from '~/utils/groqd/groqd.utils'

/** An article on a card: its link, date and reading time ready to show. */
export function toPostCard(post: PostCardData, context: MapContext): PostCard {
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
    readingMinutes: readingMinutes(post.words),
  }
}

export function toAuthor(author: AuthorData | null | undefined): Author | undefined {
  if (!author) return undefined
  return {
    name: author.name,
    firstName: author.name.split(' ')[0] ?? author.name,
    role: author.role ?? undefined,
    bio: author.bio ?? undefined,
    photo: toImage(author.photo),
  }
}

/** The article's category, linking to the magazine filtered by it. */
export function toCategoryLink(
  category: { title: string; slug: string } | null | undefined,
  context: MapContext,
): { title: string; to: string } | undefined {
  if (!category) return undefined
  const to = `${context.localePath('magazine')}?category=${encodeURIComponent(category.slug)}`
  return { title: category.title, to }
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

/** The text of a Portable Text block: its spans joined. */
function plainText(block: RichText[number]): string {
  const children = Array.isArray(block.children) ? block.children : []
  return children.map((child) => (typeof child?.text === 'string' ? child.text : '')).join('')
}

/**
 * The article's H2s get an id (`anchor`, read by the renderer) and make the table of contents.
 */
export function withHeadingAnchors(blocks: RichText): {
  body: RichText
  toc: Array<{ id: string; text: string }>
} {
  const headings = blocks.filter((block) => block._type === 'block' && block.style === 'h2')
  const ids = headingIds(headings.map(plainText))
  const toc = headings.map((block, index) => ({
    key: block._key,
    id: ids[index] ?? '',
    text: plainText(block),
  }))
  const body = blocks.map((block) => {
    const entry = toc.find(({ key }) => key === block._key)
    return entry ? { ...block, anchor: entry.id } : block
  })
  return { body, toc: toc.map(({ id, text }) => ({ id, text })) }
}
