import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { type HomeData, homeQuery } from '~/composables/useHome/home.query'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import {
  type MapContext,
  toClosing,
  toCta,
  toImage,
  toOfferCard,
  toRichText,
  toSeo,
  unpublishedSeo,
} from '~/utils/content/content.utils'

import type {
  Closing,
  Cta,
  FaqItem,
  Image,
  OfferCard,
  RichText,
  Seo,
  Testimonial,
} from '~/types/content.types'

/** Everything the home page shows, section by section; an empty section is left out. */
export interface HomeView {
  seo: Seo
  hero: { title: string; text?: string; image?: Image; cta?: Cta }
  offers: OfferCard[]
  about?: { title?: string; portrait?: Image; body: RichText; highlights: string[] }
  testimonials: Testimonial[]
  faq: FaqItem[]
  closing?: Closing
}

function toAbout(about: HomeData['about'], context: MapContext): HomeView['about'] {
  const body = toRichText(about?.body, context)
  const highlights = about?.highlights ?? []
  if (!about?.title && !about?.portrait?.url && !body.length && !highlights.length) return undefined
  return { title: about?.title ?? undefined, portrait: toImage(about?.portrait), body, highlights }
}

function toHomeView(home: HomeData, context: MapContext): HomeView {
  return {
    seo: toSeo(home.seo, { title: home.title, description: home.hero.text }),
    hero: {
      title: home.hero.title,
      text: home.hero.text ?? undefined,
      image: toImage(home.hero.image),
      cta: toCta(home.hero.cta, context),
    },
    offers: home.showOffers
      ? (home.featuredOffers ?? []).map((offer) => toOfferCard(offer, context))
      : [],
    about: toAbout(home.about, context),
    testimonials: home.showTestimonials
      ? (home.testimonials ?? []).map((testimonial) => ({
          id: testimonial.id,
          quote: testimonial.quote,
          author: testimonial.author,
          photo: toImage(testimonial.photo),
        }))
      : [],
    faq: home.showFaq
      ? (home.faq ?? []).map((item) => ({ ...item, answer: toRichText(item.answer, context) }))
      : [],
    closing: toClosing(home.closing, context),
  }
}

/** The home page in the active language: 503 on a CMS error, empty while unpublished. */
export async function useHome(): Promise<HomeView> {
  const context = useMapContext()
  const { t } = useI18n()

  const home = await useCmsQuery('home', homeQuery)
  if (!home) {
    const title = t('nav.home')
    return { seo: unpublishedSeo(title), hero: { title }, offers: [], testimonials: [], faq: [] }
  }
  return toHomeView(home, context)
}
