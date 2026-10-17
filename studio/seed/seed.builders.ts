/** Small builders that write Sanity documents the way the Studio stores them. */
import type {
  AccessibleImage,
  ArticleBody,
  Closing,
  Cta,
  Link,
  RichText,
} from '~/types/sanity.types'

import type { SeedImage } from './seed.images'
import type { BodyPart } from './seed.magazine'

/** A document as it is written: Sanity adds the timestamps and the revision. */
export type Stored<T> = Omit<T, '_createdAt' | '_updatedAt' | '_rev'>

export const reference = (id: string) => ({ _type: 'reference' as const, _ref: id, _weak: true })

export const keyed = <T extends object>(items: T[]) =>
  items.map((item, index) => ({ _key: `k${index}`, ...item }))

export const routeLink = (route: NonNullable<Link['route']>): Link => ({
  _type: 'link',
  kind: 'route',
  route,
})

export const offerLink = (id: string): Link => ({
  _type: 'link',
  kind: 'reference',
  reference: reference(id),
})

export const externalLink = (href: string): Link => ({ _type: 'link', kind: 'external', href })

export const cta = (label: string, link: Link): Cta => ({ _type: 'cta', label, link })

/** A page's closing band, its button leading to the contact page. */
export const closing = (title: string, text: string, button: string): Closing => ({
  _type: 'closing',
  title,
  text,
  cta: cta(button, routeLink('contact')),
})

export type Part =
  | { text: string; style?: 'normal' | 'h2' | 'h3'; listItem?: 'bullet' | 'number' }
  | { text: string; linkText: string; link: Link }
  | { image: AccessibleImage }

/** Rich text from short parts: paragraphs, headings, list items, a linked phrase, images. */
export function richText(parts: Part[]): RichText {
  return parts.map((part, index) => {
    const _key = `b${index}`
    if ('image' in part) return { _key, ...part.image }
    const span = (text: string, marks: string[] = [], key = 's0') => ({
      _type: 'span' as const,
      _key: key,
      text,
      marks,
    })
    if ('link' in part) {
      return {
        _type: 'block' as const,
        _key,
        style: 'normal' as const,
        markDefs: [{ _key: 'l0', ...part.link }],
        children: [span(part.text), span(part.linkText, ['l0'], 's1')],
      }
    }
    return {
      _type: 'block' as const,
      _key,
      style: part.style ?? 'normal',
      ...(part.listItem && { listItem: part.listItem, level: 1 }),
      markDefs: [],
      children: [span(part.text)],
    }
  })
}

/** An article's text from short parts: paragraphs, headings, lists and the magazine blocks. */
export function articleBody(
  parts: BodyPart[],
  image: (name: SeedImage, alt: string) => AccessibleImage,
): ArticleBody {
  const span = (text: string) => ({ _type: 'span' as const, _key: 's0', text, marks: [] })
  const block = (_key: string, text: string, style: 'normal' | 'h2' = 'normal') => ({
    _type: 'block' as const,
    _key,
    style,
    markDefs: [],
    children: [span(text)],
  })
  return parts.flatMap((part, index): ArticleBody => {
    const _key = `b${index}`
    if ('p' in part) return [block(_key, part.p)]
    if ('h2' in part) return [block(_key, part.h2, 'h2')]
    if ('tip' in part) return [{ _type: 'coachTip', _key, text: part.tip }]
    if ('quote' in part) {
      return [{ _type: 'pullQuote', _key, text: part.quote, attribution: part.attribution }]
    }
    if ('video' in part)
      return [{ _type: 'youtubeVideo', _key, videoId: part.video, title: part.title }]
    if ('figure' in part) {
      return [{ _type: 'figure', _key, image: image(part.figure, part.alt), caption: part.caption }]
    }
    const listItem = 'ul' in part ? 'bullet' : 'number'
    const items = 'ul' in part ? part.ul : part.ol
    return items.map((text, item) => ({
      ...block(`${_key}i${item}`, text),
      listItem,
      level: 1,
    }))
  })
}
