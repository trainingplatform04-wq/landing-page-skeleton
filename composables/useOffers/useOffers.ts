import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import { type OffersData, offersQuery } from '~/composables/useOffers/offers.query'
import {
  editorOrder,
  type MapContext,
  toCta,
  toOfferCard,
  toSeo,
  unpublishedSeo,
} from '~/utils/content/content.utils'

import type { Cta, OfferCard, Seo } from '~/types/content.types'

export interface OffersView {
  seo: Seo
  title: string
  intro?: string
  offers: OfferCard[]
  cta?: Cta
}

function toOffersView(data: OffersData, context: MapContext, emptyTitle: string): OffersView {
  const offers = editorOrder(data.offers, data.page?.order ?? []).map((offer) =>
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

/**
 * The offers page with every offer of the active language: the editor's order first, then the
 * others by title. 503 on a CMS error.
 */
export async function useOffers(): Promise<OffersView> {
  const context = useMapContext()
  const { t } = useI18n()

  const data = await useCmsQuery('offers', offersQuery)
  return toOffersView(data ?? { page: null, offers: [] }, context, t('nav.offers'))
}
