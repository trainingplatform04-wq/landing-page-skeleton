/**
 * The demo content of the `development` dataset (`pnpm studio:seed`): every page in every
 * language, with every field filled, so a client sees the finished site before writing a
 * word. Production never gets it: editors write their own content there.
 *
 * Every schema change updates this file in the same PR: a new type, field or section is
 * filled here, a removed one is removed here. The documents are typed by TypeGen
 * (types/sanity.types.ts), so a removed, renamed or newly required field fails
 * `pnpm typecheck`. Ids are fixed, so a re-run updates these documents instead of
 * duplicating them.
 */
import type {
  AboutPage,
  AccessibleImage,
  Author,
  BusinessProfile,
  Category,
  ContactPage,
  FaqItem,
  FaqPage,
  HomePage,
  ImprintPage,
  MagazinePage,
  Offer,
  OffersPage,
  Post,
  PrivacyPage,
  Seo,
  SiteSettings,
  Testimonial,
  TranslationMetadata,
} from '~/types/sanity.types'

import { type LocaleCode, LOCALES } from '../../constants/i18n.constants'
import { PAGE_TYPES } from '../../constants/routes.constants'
import { singletonId } from '../utils/singleton/singleton.utils'
import {
  articleBody,
  closing,
  cta,
  externalLink,
  keyed,
  offerLink,
  type Part,
  reference,
  richText,
  routeLink,
  type Stored,
} from './seed.builders'
import { COPY, FAQ, OFFERS, TESTIMONIALS } from './seed.copy'
import type { SeedImage } from './seed.images'
import { AUTHORS, CATEGORIES, MAGAZINE_PAGE, POSTS } from './seed.magazine'

export type SeedDocument =
  | Stored<BusinessProfile>
  | Stored<SiteSettings>
  | Stored<HomePage>
  | Stored<OffersPage>
  | Stored<FaqPage>
  | Stored<ContactPage>
  | Stored<ImprintPage>
  | Stored<PrivacyPage>
  | Stored<MagazinePage>
  | Stored<AboutPage>
  | Stored<Offer>
  | Stored<Testimonial>
  | Stored<FaqItem>
  | Stored<Post>
  | Stored<Category>
  | Stored<Author>
  | Stored<TranslationMetadata>

/** The id of an uploaded demo picture (`image-…`), resolved by the seed script. */
export type ImageAssetId = (name: SeedImage) => string

const UPDATED_AT = '2026-10-01'

const EMAIL = 'demo@example.com'

const offerId = (key: string, locale: LocaleCode) => `offer-${key}-${locale}`
const testimonialId = (key: string, locale: LocaleCode) => `testimonial-${key}-${locale}`
const faqId = (key: string, locale: LocaleCode) => `faq-${key}-${locale}`
const postId = (key: string, locale: LocaleCode) => `post-${key}-${locale}`
const categoryId = (key: string, locale: LocaleCode) => `category-${key}-${locale}`
const authorId = (key: string, locale: LocaleCode) => `author-${key}-${locale}`

/** Public ids (no dot): the web app reads the translations for hreflang and the switcher. */
const translationId = (type: string, key: string) => `seed-translation-${type}-${key}`

export function seedDocuments(imageAssetId: ImageAssetId): SeedDocument[] {
  const image = (name: SeedImage, alt: string): AccessibleImage => ({
    _type: 'accessibleImage',
    asset: { _type: 'reference', _ref: imageAssetId(name) },
    alt,
  })

  const seo = (title: string, description: string): Seo => ({
    _type: 'seo',
    title,
    description,
    image: { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId('share') } },
    noIndex: false,
  })

  const pageSeo = (locale: LocaleCode, title: string, description: string) =>
    seo(`${title} | ${COPY[locale].seoSuffix}`, description)

  const page = <T extends string>(type: T, locale: LocaleCode) => ({
    _id: singletonId(type, locale),
    _type: type,
    language: locale,
  })

  const businessProfile: Stored<BusinessProfile> = {
    _id: singletonId('businessProfile'),
    _type: 'businessProfile',
    name: 'Demo Studio Berlin',
    email: EMAIL,
    phone: '+49 30 0000000',
    address: { street: 'Musterstraße 1', postalCode: '10115', city: 'Berlin', country: 'DE' },
    socials: keyed([
      { platform: 'instagram' as const, url: 'https://www.instagram.com/' },
      { platform: 'youtube' as const, url: 'https://www.youtube.com/' },
    ]),
  }

  const inLocale = (locale: LocaleCode): SeedDocument[] => {
    const copy = COPY[locale]

    const offers = OFFERS.map(({ key, image: picture, price, [locale]: offer }) => ({
      _id: offerId(key, locale),
      _type: 'offer' as const,
      language: locale,
      title: offer.title,
      slug: { _type: 'slug' as const, current: offer.slug },
      summary: offer.summary,
      image: image(picture, `${offer.title}: ${copy.offers.imageAlt}`),
      body: richText([
        { text: offer.body },
        { text: copy.offers.pointsTitle, style: 'h2' },
        ...offer.points.map((point) => ({ text: point, listItem: 'bullet' as const })),
        { image: image('training', copy.offers.imageAlt) },
        { text: copy.offers.price },
      ]),
      price,
      cta: cta(copy.offers.offerCta, routeLink('contact')),
      seo: pageSeo(locale, offer.title, offer.summary),
    }))

    const testimonials = TESTIMONIALS.map(({ key, image: picture, author, [locale]: quote }) => ({
      _id: testimonialId(key, locale),
      _type: 'testimonial' as const,
      language: locale,
      quote,
      author,
      photo: image(picture, copy.testimonialAlt),
      // Demo quotes, marked "(Demo)": production only ever gets real ones with consent.
      consentConfirmed: true,
    }))

    const faqItems = FAQ.map(({ key, [locale]: [question, answer] }) => ({
      _id: faqId(key, locale),
      _type: 'faqItem' as const,
      language: locale,
      question,
      answer: richText([{ text: answer }]),
    }))

    const home: Stored<HomePage> = {
      ...page(PAGE_TYPES.index, locale),
      title: copy.home.title,
      hero: {
        title: copy.home.heroTitle,
        text: copy.home.heroText,
        image: image('hero', copy.home.heroAlt),
        cta: cta(copy.home.heroCta, routeLink('offers')),
      },
      showOffers: true,
      featuredOffers: keyed(offers.map(({ _id }) => reference(_id))),
      about: {
        title: copy.home.aboutTitle,
        portrait: image('portrait', copy.home.portraitAlt),
        body: richText([
          {
            text: `${copy.home.about} `,
            linkText: copy.home.aboutLink,
            link: offerLink(offerId('personal', locale)),
          },
        ]),
        highlights: [...copy.home.highlights],
      },
      showTestimonials: true,
      testimonials: keyed(testimonials.map(({ _id }) => reference(_id))),
      showFaq: true,
      faq: keyed(faqItems.map(({ _id }) => reference(_id))),
      closing: closing(copy.home.closingTitle, copy.home.closingText, copy.home.closingCta),
      seo: pageSeo(locale, copy.home.title, copy.home.seoDescription),
    }

    const offersPage: Stored<OffersPage> = {
      ...page(PAGE_TYPES.offers, locale),
      title: copy.offers.title,
      intro: copy.offers.intro,
      order: keyed(offers.map(({ _id }) => reference(_id))),
      cta: cta(copy.offers.cta, externalLink(`mailto:${EMAIL}`)),
      seo: pageSeo(locale, copy.offers.title, copy.offers.intro),
    }

    const faqPage: Stored<FaqPage> = {
      ...page(PAGE_TYPES.faq, locale),
      title: copy.faq.title,
      intro: copy.faq.intro,
      order: keyed(faqItems.map(({ _id }) => reference(_id))),
      seo: pageSeo(locale, copy.faq.title, copy.faq.intro),
    }

    const contactPage: Stored<ContactPage> = {
      ...page(PAGE_TYPES.contact, locale),
      title: copy.contact.title,
      intro: copy.contact.intro,
      successText: copy.contact.success,
      seo: pageSeo(locale, copy.contact.title, copy.contact.intro),
    }

    const imprintPage: Stored<ImprintPage> = {
      ...page(PAGE_TYPES.imprint, locale),
      title: copy.imprint.title,
      body: richText([
        { text: copy.imprint.heading, style: 'h2' },
        { text: copy.imprint.body },
        { text: copy.imprint.contact },
      ]),
      updatedAt: UPDATED_AT,
      seo: pageSeo(locale, copy.imprint.title, copy.imprint.heading),
    }

    const privacyPage: Stored<PrivacyPage> = {
      ...page(PAGE_TYPES.privacy, locale),
      title: copy.privacy.title,
      body: richText([
        { text: copy.privacy.intro },
        ...copy.privacy.sections.flatMap((section): Part[] => [
          { text: section.heading, style: 'h2' },
          ...section.text.map((text) => ({ text })),
          ...('list' in section ? section.list : []).map((item) => ({
            text: item,
            listItem: 'bullet' as const,
          })),
        ]),
        {
          text: `${copy.privacy.linkText} `,
          linkText: copy.privacy.link,
          link: routeLink('contact'),
        },
      ]),
      updatedAt: UPDATED_AT,
      seo: pageSeo(locale, copy.privacy.title, copy.privacy.description),
    }

    const categories = CATEGORIES.map(({ key, order, [locale]: category }) => ({
      _id: categoryId(key, locale),
      _type: 'category' as const,
      language: locale,
      title: category.title,
      slug: { _type: 'slug' as const, current: category.slug },
      order,
    }))

    const authors = AUTHORS.map(({ key, name, image: picture, [locale]: author }) => ({
      _id: authorId(key, locale),
      _type: 'author' as const,
      language: locale,
      name,
      role: author.role,
      bio: author.bio,
      photo: image(picture, name),
    }))

    const posts = POSTS.map(
      ({ key, category, author, publishedAt, image: picture, [locale]: post }) => ({
        _id: postId(key, locale),
        _type: 'post' as const,
        language: locale,
        title: post.title,
        slug: { _type: 'slug' as const, current: post.slug },
        excerpt: post.excerpt,
        cover: image(picture, post.imageAlt),
        category: reference(categoryId(category, locale)),
        author: reference(authorId(author, locale)),
        publishedAt,
        keyTakeaways: post.keyTakeaways,
        body: articleBody(post.body, image),
        faq: post.faq?.map((item, index) => ({
          _key: `q${index}`,
          _type: 'question' as const,
          ...item,
        })),
        seo: pageSeo(locale, post.title, post.excerpt),
      }),
    )

    const magazine = MAGAZINE_PAGE[locale]
    const magazinePage: Stored<MagazinePage> = {
      ...page(PAGE_TYPES.magazine, locale),
      label: magazine.label,
      title: magazine.title,
      intro: magazine.intro,
      closing: closing(magazine.closingTitle, magazine.closingText, magazine.cta),
      seo: pageSeo(locale, magazine.label, magazine.seoDescription),
    }

    const about = copy.about
    const aboutPage: Stored<AboutPage> = {
      ...page(PAGE_TYPES.about, locale),
      label: about.label,
      title: about.title,
      description: about.description,
      image: image('about', about.imageAlt),
      closing: closing(about.closingTitle, about.closingText, about.cta),
      seo: pageSeo(locale, about.label, about.seoDescription),
    }

    const siteSettings: Stored<SiteSettings> = {
      ...page('siteSettings', locale),
      footerNote: copy.footerNote,
    }

    return [
      siteSettings,
      home,
      offersPage,
      magazinePage,
      aboutPage,
      faqPage,
      contactPage,
      imprintPage,
      privacyPage,
      ...offers,
      ...testimonials,
      ...faqItems,
      ...categories,
      ...authors,
      ...posts,
    ]
  }

  /** Links the language versions of a translated document, as the Studio's plugin does. */
  const translation = (
    type: string,
    key: string,
    idOf: (key: string, locale: LocaleCode) => string,
  ) =>
    ({
      _id: translationId(type, key),
      _type: 'translation.metadata',
      schemaTypes: [type],
      translations: LOCALES.map(({ code }) => ({
        _key: code,
        _type: 'internationalizedArrayReferenceValue' as const,
        language: code,
        value: reference(idOf(key, code)),
      })),
    }) satisfies Stored<TranslationMetadata>

  return [
    businessProfile,
    ...LOCALES.flatMap(({ code }) => inLocale(code)),
    ...OFFERS.map(({ key }) => translation('offer', key, offerId)),
    ...TESTIMONIALS.map(({ key }) => translation('testimonial', key, testimonialId)),
    ...FAQ.map(({ key }) => translation('faqItem', key, faqId)),
    ...POSTS.map(({ key }) => translation('post', key, postId)),
    ...CATEGORIES.map(({ key }) => translation('category', key, categoryId)),
    ...AUTHORS.map(({ key }) => translation('author', key, authorId)),
  ]
}
