import { type LocalePath, resolveLink, toTelHref } from '~/utils/link/link.utils'
import { formatPrice } from '~/utils/price/price.utils'

import type { Business, Cta, Image, OfferCard, RichText, Seo } from '~/types/content.types'
import type {
  BusinessData,
  CtaData,
  ImageData,
  OfferCardData,
  RichTextData,
  SeoData,
} from '~/utils/groqd/groqd.utils'

/** What the mappers need to know about the visitor's language. */
export interface MapContext {
  /** Locale code: `de`, `en`. */
  locale: string
  /** Language tag for formatting: `de-DE`, `en-US`. */
  language: string
  localePath: LocalePath
}

export function toImage(image: ImageData | null | undefined): Image | undefined {
  if (!image?.url) return undefined
  return { url: image.url, alt: image.alt }
}

/** `undefined` when the button's target can't be shown in this language. */
export function toCta(cta: CtaData | null | undefined, context: MapContext): Cta | undefined {
  const link = cta?.link ? resolveLink(cta.link, context) : null
  if (!cta?.label || !link) return undefined
  return { label: cta.label, ...link }
}

/** The editor's SEO fields first, then the page's own title, text and image. */
export function toSeo(
  seo: SeoData | null | undefined,
  page: { title: string; description?: string | null; image?: string },
): Seo {
  return {
    title: seo?.title || page.title,
    description: seo?.description || page.description || undefined,
    image: seo?.image || page.image,
    noIndex: seo?.noIndex ?? false,
  }
}

/** A page that isn't published in this language: its title only, out of search engines. */
export function unpublishedSeo(title: string): Seo {
  return { title, noIndex: true }
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
