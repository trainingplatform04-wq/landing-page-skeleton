import { type LocalePath, resolveLink, toTelHref } from '~/utils/link/link.utils'
import { formatPrice } from '~/utils/price/price.utils'

import type { Business, Closing, Cta, Image, OfferCard, RichText, Seo } from '~/types/content.types'
import type {
  BusinessData,
  ClosingData,
  CtaData,
  ImageData,
  OfferCardData,
  RichTextData,
  SeoData,
  TranslationsData,
} from '~/utils/groqd/groqd.utils'

/** What the mappers need to know about the visitor's language. */
export interface MapContext {
  /** Locale code: `de`, `en`. */
  locale: string
  /** Language tag for formatting: `de-DE`, `en-US`. */
  language: string
  localePath: LocalePath
}

const percent = (value: number) => `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`

/**
 * A picture as the editor framed it: the crop is cut by Sanity's image CDN (`rect`), the focal
 * point becomes the CSS `object-position` that keeps it visible in every shape the page uses.
 * `undefined` when the picture has no file.
 */
export function toImage(image: ImageData | null | undefined): Image | undefined {
  if (!image?.url) return undefined
  const size = image.dimensions
  // Cut only when the picture's size is known; the focal point then moves with the cut.
  const crop = (size && image.crop) || { top: 0, bottom: 0, left: 0, right: 0 }
  const width = 1 - crop.left - crop.right
  const height = 1 - crop.top - crop.bottom

  const url =
    size && (width < 1 || height < 1)
      ? `${image.url}?rect=${[
          Math.round(crop.left * size.width),
          Math.round(crop.top * size.height),
          Math.round(width * size.width),
          Math.round(height * size.height),
        ].join(',')}`
      : image.url
  const position = image.hotspot
    ? `${percent((image.hotspot.x - crop.left) / width)} ${percent((image.hotspot.y - crop.top) / height)}`
    : undefined
  return { url, alt: image.alt, position }
}

/** `undefined` when the button's target can't be shown in this language. */
export function toCta(cta: CtaData | null | undefined, context: MapContext): Cta | undefined {
  const link = cta?.link ? resolveLink(cta.link, context) : null
  if (!cta?.label || !link) return undefined
  return { label: cta.label, ...link }
}

/** The band that ends a page: shown with a title or a button, a text alone leads nowhere. */
export function toClosing(
  closing: ClosingData | null | undefined,
  context: MapContext,
): Closing | undefined {
  const cta = toCta(closing?.cta, context)
  if (!closing?.title && !cta) return undefined
  return { title: closing?.title ?? undefined, text: closing?.text ?? undefined, cta }
}

/** The editor's SEO fields first, then the page's own title, text and image. */
export function toSeo(
  seo: SeoData | null | undefined,
  page: { title: string; description?: string | null; image?: string | null },
): Seo {
  return {
    title: seo?.title || page.title,
    description: seo?.description || page.description || undefined,
    image: seo?.image || page.image || undefined,
    noIndex: seo?.noIndex ?? false,
  }
}

/** A page that isn't published in this language: its title only, out of search engines. */
export function unpublishedSeo(title: string): Seo {
  return { title, noIndex: true }
}

/**
 * The slug of a document in each language, for the language switcher and hreflang:
 * `{ en: { slug: 'yoga' } }`. A document not linked to any translation has only its own.
 */
export function toSlugs(
  translations: TranslationsData,
  own: { language: string; slug: string },
): Record<string, { slug: string }> {
  const versions = (translations ?? [own]).flatMap((version) => (version ? [version] : []))
  return Object.fromEntries(versions.map(({ language, slug }) => [language, { slug }]))
}

/** Rich text with its links resolved; a link that can't be shown renders as plain text. */
export function toRichText(blocks: RichTextData | null | undefined, context: MapContext): RichText {
  return (blocks ?? []).map((block) => {
    if (!block.markDefs) return block
    const markDefs = block.markDefs.map((mark) => {
      if (mark._type !== 'link') return mark
      const link = resolveLink(mark, context)
      return { _type: 'link', _key: mark._key, href: link?.to, external: link?.external ?? false }
    })
    return { ...block, markDefs }
  })
}

/** An offer on a card: its link in this language and its price formatted for the visitor. */
export function toOfferCard(offer: OfferCardData, context: MapContext): OfferCard {
  return {
    id: offer.id,
    title: offer.title,
    summary: offer.summary,
    to: context.localePath({ name: 'offers-slug', params: { slug: offer.slug } }),
    image: toImage(offer.image),
    price: offer.price == null ? undefined : formatPrice(offer.price, context.language),
  }
}

/** The business facts ready to show: address lines and a dialable phone link. */
export function toBusiness(business: BusinessData): Business {
  const { street, postalCode, city } = business.address ?? {}
  return {
    name: business.name,
    email: business.email,
    phone: business.phone ? { label: business.phone, href: toTelHref(business.phone) } : undefined,
    addressLines: [street, [postalCode, city].filter(Boolean).join(' ')].filter(
      (line): line is string => Boolean(line),
    ),
    socials: business.socials ?? [],
  }
}

/**
 * Documents in the editor's order first (a page's `order` list), then the others in the order
 * the query returned them.
 */
export function editorOrder<T extends { id: string }>(items: T[], order: string[]): T[] {
  const rank = (item: T) => {
    const index = order.indexOf(item.id)
    return index === -1 ? order.length : index
  }
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index)
    .map(({ item }) => item)
}
