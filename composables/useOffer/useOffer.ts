import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import { type MapContext, toCta, toImage, toRichText, toSeo } from '~/utils/content/content.utils'
import {
  ctaFragment,
  imageFragment,
  q,
  richTextField,
  seoFragment,
} from '~/utils/groqd/groqd.utils'
import { formatPrice } from '~/utils/price/price.utils'

import type { Cta, Image, RichText, Seo } from '~/types/content.types'
import type { InferResultType } from 'groqd'

const offerQuery = q
  .parameters<{ locale: string; slug: string }>()
  .star.filterByType('offer')
  .filterRaw('language == $locale && slug.current == $slug')
  .slice(0)
  .project((offer) => ({
    title: z.string(),
    summary: z.string(),
    image: offer.field('image').project(imageFragment).nullable(true),
    body: offer.raw(...richTextField('body')),
    price: z.number().nullable(),
    cta: offer.field('cta').project(ctaFragment).nullable(true),
    seo: offer.field('seo').project(seoFragment).nullable(true),
    // The slug of this offer in every language it is translated into.
    translations: offer.raw(
      '*[_type == "translation.metadata" && references(^._id)][0].translations[].value->{ language, "slug": slug.current }',
      z.array(z.object({ language: z.string(), slug: z.string() }).nullable()).nullable(),
    ),
  }))
  .nullable(true)

/** Everything the offer page shows. */
export interface OfferView {
  seo: Seo
  title: string
  summary: string
  image?: Image
  body: RichText
  price?: string
  cta?: Cta
  /** For the language switcher: `{ en: { slug: 'yoga' } }`, one entry per translation. */
  slugs: Record<string, { slug: string }>
}

function toOfferView(
  offer: InferResultType<typeof offerQuery> | undefined,
  context: MapContext,
  slug: string,
): OfferView | null {
  if (!offer) return null
  // Not linked to any translation yet: the offer exists in this language only.
  const translations = offer.translations ?? [{ language: context.locale, slug }]
  return {
    seo: toSeo(offer.seo, {
      title: offer.title,
      description: offer.summary,
      image: offer.image?.url ?? undefined,
    }),
    title: offer.title,
    summary: offer.summary,
    image: toImage(offer.image),
    body: toRichText(offer.body, context),
    price: offer.price == null ? undefined : formatPrice(offer.price, context.language),
    cta: toCta(offer.cta, context),
    slugs: Object.fromEntries(
      translations.flatMap((version) =>
        version ? [[version.language, { slug: version.slug }]] : [],
      ),
    ),
  }
}

/** The offer at the current URL in the active language: 404 if unknown here, 503 on a CMS error. */
export async function useOffer(): Promise<OfferView> {
  const { runQuery, context } = useCms()
  const slug = String(useRoute().params.slug ?? '')

  const fetchOffer = () => runQuery(offerQuery, { parameters: { locale: context.locale, slug } })
  const { data, error } = await useAsyncData(`offer:${context.locale}:${slug}`, fetchOffer)

  if (error.value) throw createError({ status: 503, fatal: true })

  const offer = toOfferView(data.value, context, slug)
  if (!offer) throw createError({ status: 404, fatal: true })
  return offer
}
