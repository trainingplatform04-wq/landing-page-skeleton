import { z } from 'zod'

import {
  closingFragment,
  ctaFragment,
  imageFragment,
  offerCardFragment,
  q,
  richTextField,
  seoFragment,
} from '~/utils/groqd/groqd.utils'

import type { InferResultType } from 'groqd'

export const homeQuery = q
  .parameters<{ locale: string }>()
  .star.filterByType('homePage')
  .filterRaw('language == $locale')
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
    // Only testimonials whose clients agreed to publication.
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
    closing: home.field('closing').project(closingFragment).nullable(true),
    seo: home.field('seo').project(seoFragment).nullable(true),
  }))
  .nullable(true)

export type HomeData = NonNullable<InferResultType<typeof homeQuery>>
