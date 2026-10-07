import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import {
  type MapContext,
  toCta,
  toImage,
  toOfferCard,
  toRichText,
  toSeo,
  unpublishedSeo,
} from '~/utils/content/content.utils'
import {
  ctaFragment,
  imageFragment,
  offerCardFragment,
  q,
  richTextField,
  seoFragment,
} from '~/utils/groqd/groqd.utils'

import type {
  Cta,
  FaqItem,
  Image,
  OfferCard,
  RichText,
  Seo,
  Testimonial,
} from '~/types/content.types'
import type { InferResultType } from 'groqd'

const homeQuery = q
  .parameters<{ locale: string }>()
  .star.filterByType('homePage')
  .filterRaw('_id == "homePage-" + $locale')
  .slice(0)
  .project((home) => ({
    title: z.string(),
    hero: home.field('hero').project((hero) => ({
      title: z.string(),
      text: z.string().nullable(),
      image: hero.field('image').project(imageFragment).nullable(true),
      cta: hero.field('cta').project(ctaFragment).nullable(true),
    })),
    showOffers: z.boolean().nullable(),
    featuredOffers: home
      .field('featuredOffers[]')
      .filterRaw('@->language == $locale && defined(@->slug.current)')
      .deref()
      .project(offerCardFragment)
      .nullable(true),
    about: home
      .field('about')
      .project((about) => ({
        title: z.string().nullable(),
        portrait: about.field('portrait').project(imageFragment).nullable(true),
        body: about.raw(...richTextField('body')),
        highlights: z.array(z.string()).nullable(),
      }))
      .nullable(true),
    showTestimonials: z.boolean().nullable(),
    // Only testimonials in this language whose clients agreed to publication.
    testimonials: home
      .field('testimonials[]')
      .filterRaw('@->language == $locale && @->consentConfirmed == true')
      .deref()
      .project((testimonial) => ({
        id: ['_id', z.string()],
        quote: z.string(),
        author: z.string(),
        photo: testimonial.field('photo').project(imageFragment).nullable(true),
      }))
      .nullable(true),
    showFaq: z.boolean().nullable(),
    faq: home
      .field('faq[]')
      .filterRaw('@->language == $locale')
      .deref()
      .project((item) => ({
        id: ['_id', z.string()],
        question: z.string(),
        answer: item.raw(...richTextField('answer')),
      }))
      .nullable(true),
    closing: home
      .field('closing')
      .project((closing) => ({
        title: z.string().nullable(),
        text: z.string().nullable(),
        cta: closing.field('cta').project(ctaFragment).nullable(true),
      }))
      .nullable(true),
    seo: home.field('seo').project(seoFragment).nullable(true),
  }))
  .nullable(true)

/** Everything the home page shows, section by section; an empty section is left out. */
export interface HomeView {
  seo: Seo
  hero: { title: string; text?: string; image?: Image; cta?: Cta }
  offers: OfferCard[]
  about?: { title?: string; portrait?: Image; body: RichText; highlights: string[] }
  testimonials: Testimonial[]
  faq: FaqItem[]
  closing?: { title?: string; text?: string; cta?: Cta }
}

type HomeData = NonNullable<InferResultType<typeof homeQuery>>

function toAbout(about: HomeData['about'], context: MapContext): HomeView['about'] {
  const body = toRichText(about?.body, context)
  const highlights = about?.highlights ?? []
  if (!about?.title && !about?.portrait?.url && !body.length && !highlights.length) return undefined
  return { title: about?.title ?? undefined, portrait: toImage(about?.portrait), body, highlights }
}

function toClosing(closing: HomeData['closing'], context: MapContext): HomeView['closing'] {
  const cta = toCta(closing?.cta, context)
  if (!closing?.title && !cta) return undefined
  return { title: closing?.title ?? undefined, text: closing?.text ?? undefined, cta }
}

function toHomeView(home: HomeData | null | undefined, context: MapContext): HomeView | null {
  if (!home) return null
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
  const { runQuery, context } = useCms()
  const { t } = useI18n()
  const site = useSiteConfig()

  const fetchHome = () => runQuery(homeQuery, { parameters: { locale: context.locale } })
  const { data, error } = await useAsyncData(`home:${context.locale}`, fetchHome)

  if (error.value) throw createError({ status: 503, fatal: true })

  return (
    toHomeView(data.value, context) ?? {
      seo: unpublishedSeo(t('nav.home')),
      hero: { title: site.name },
      offers: [],
      testimonials: [],
      faq: [],
    }
  )
}
