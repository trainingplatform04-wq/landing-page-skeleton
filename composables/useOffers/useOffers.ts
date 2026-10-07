import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import {
  type MapContext,
  toCta,
  toOfferCard,
  toSeo,
  unpublishedSeo,
} from '~/utils/content/content.utils'
import { ctaFragment, offerCardFragment, q, seoFragment } from '~/utils/groqd/groqd.utils'

import type { Cta, OfferCard, Seo } from '~/types/content.types'
import type { InferResultType } from 'groqd'

const OFFERS_PAGE_ID = '_id == "offersPage-" + $locale'

/**
 * The page and the offers apart, so offers are listed even while the page isn't
 * published. The offers the editor ordered come first, the others follow by title.
 */
const offersQuery = q.parameters<{ locale: string }>().project((root) => ({
  page: root.star
    .filterByType('offersPage')
    .filterRaw(OFFERS_PAGE_ID)
    .slice(0)
    .project((page) => ({
      title: z.string(),
      intro: z.string().nullable(),
      cta: page.field('cta').project(ctaFragment).nullable(true),
      seo: page.field('seo').project(seoFragment).nullable(true),
    }))
    .nullable(true),
  ordered: root.star
    .filterByType('offersPage')
    .filterRaw(OFFERS_PAGE_ID)
    .slice(0)
    .field('order[]')
    .filterRaw('@->language == $locale && defined(@->slug.current)')
    .deref()
    .project(offerCardFragment)
    .nullable(true),
  others: root.star
    .filterByType('offer')
    .filterRaw('language == $locale && defined(slug.current)')
    // Not already listed by the editor's order.
    .filterRaw(
      `!(_id in coalesce(*[_type == "offersPage" && ${OFFERS_PAGE_ID}][0].order[]._ref, []))`,
    )
    .order('title asc')
    .project(offerCardFragment),
}))

/** Everything the offers page shows. */
export interface OffersView {
  seo: Seo
  title: string
  intro?: string
  offers: OfferCard[]
  cta?: Cta
}

function toOffersView(
  data: InferResultType<typeof offersQuery>,
  context: MapContext,
  emptyTitle: string,
): OffersView {
  const offers = [...(data.ordered ?? []), ...data.others].map((offer) =>
    toOfferCard(offer, context),
  )
  if (!data.page) return { seo: unpublishedSeo(emptyTitle), title: emptyTitle, offers }
  return {
    seo: toSeo(data.page.seo, { title: data.page.title, description: data.page.intro }),
    title: data.page.title,
    intro: data.page.intro ?? undefined,
    offers,
    cta: toCta(data.page.cta, context),
  }
}

/** The offers page and every offer in the active language: 503 on a CMS error. */
export async function useOffers(): Promise<OffersView> {
  const { runQuery, context } = useCms()
  const { t } = useI18n()

  const fetchOffers = () => runQuery(offersQuery, { parameters: { locale: context.locale } })
  const { data, error } = await useAsyncData(`offers:${context.locale}`, fetchOffers)

  if (error.value || !data.value) throw createError({ status: 503, fatal: true })

  return toOffersView(data.value, context, t('nav.offers'))
}
