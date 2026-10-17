import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import { type OfferData, offerQuery } from '~/composables/useOffer/offer.query'
import {
  type MapContext,
  toCta,
  toImage,
  toRichText,
  toSeo,
  toSlugs,
} from '~/utils/content/content.utils'
import { formatPrice } from '~/utils/price/price.utils'

import type { Cta, Image, RichText, Seo } from '~/types/content.types'

export interface OfferView {
  seo: Seo
  slug: string
  title: string
  summary: string
  image?: Image
  body: RichText
  price?: string
  cta?: Cta
  /** For the language switcher: `{ en: { slug: 'yoga' } }`, one entry per translation. */
  slugs: Record<string, { slug: string }>
}

function toOfferView(offer: OfferData, context: MapContext, slug: string): OfferView {
  return {
    seo: toSeo(offer.seo, {
      title: offer.title,
      description: offer.summary,
      image: offer.image?.url,
    }),
    slug,
    title: offer.title,
    summary: offer.summary,
    image: toImage(offer.image),
    body: toRichText(offer.body, context),
    price: offer.price == null ? undefined : formatPrice(offer.price, context.language),
    cta: toCta(offer.cta, context),
    slugs: toSlugs(offer.translations, { language: context.locale, slug }),
  }
}

/** The offer at the current URL in the active language: 404 if unknown here, 503 on a CMS error. */
export async function useOffer(): Promise<OfferView> {
  const context = useMapContext()
  const slug = String(useRoute().params.slug ?? '')

  const offer = await useCmsQuery('offer', offerQuery, { slug })
  if (!offer) throw createError({ status: 404, fatal: true })
  return toOfferView(offer, context, slug)
}
