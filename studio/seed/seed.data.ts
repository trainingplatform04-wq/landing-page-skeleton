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
  BusinessProfile,
  ContactPage,
  FaqItem,
  FaqPage,
  HomePage,
  ImprintPage,
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
  closing,
  cta,
  keyed,
  type Part,
  reference,
  richText,
  routeLink,
  type Stored,
} from './seed.builders'
import { COPY, FAQ, TESTIMONIALS } from './seed.copy'
import type { SeedImage } from './seed.images'

export type SeedDocument =
  | Stored<BusinessProfile>
  | Stored<SiteSettings>
  | Stored<HomePage>
  | Stored<FaqPage>
  | Stored<ContactPage>
  | Stored<ImprintPage>
  | Stored<PrivacyPage>
  | Stored<AboutPage>
  | Stored<Testimonial>
  | Stored<FaqItem>
  | Stored<TranslationMetadata>

/** The id of an uploaded demo picture (`image-…`), resolved by the seed script. */
export type ImageAssetId = (name: SeedImage) => string

const UPDATED_AT = '2026-10-01'

const EMAIL = 'demo@example.com'

const testimonialId = (key: string, locale: LocaleCode) => `testimonial-${key}-${locale}`
const faqId = (key: string, locale: LocaleCode) => `faq-${key}-${locale}`

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
        cta: cta(copy.home.heroCta, routeLink('about')),
      },
      about: {
        title: copy.home.aboutTitle,
        portrait: image('portrait', copy.home.portraitAlt),
        body: richText([
          {
            text: `${copy.home.about} `,
            linkText: copy.home.aboutLink,
            link: routeLink('about'),
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
      aboutPage,
      faqPage,
      contactPage,
      imprintPage,
      privacyPage,
      ...testimonials,
      ...faqItems,
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
    ...TESTIMONIALS.map(({ key }) => translation('testimonial', key, testimonialId)),
    ...FAQ.map(({ key }) => translation('faqItem', key, faqId)),
  ]
}
