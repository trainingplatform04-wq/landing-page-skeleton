/**
 * The demo content of the `staging` dataset (`pnpm studio:seed`): every page in every
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
  AccessibleImage,
  BusinessProfile,
  ContactPage,
  Cta,
  FaqItem,
  FaqPage,
  HomePage,
  ImprintPage,
  Link,
  Offer,
  OffersPage,
  PrivacyPage,
  RichText,
  Seo,
  SiteSettings,
  Testimonial,
  TranslationMetadata,
} from '~/types/sanity.types'

import { type LocaleCode, LOCALES } from '../../constants/i18n.constants'
import { PAGE_TYPES } from '../../constants/routes.constants'
import { singletonId } from '../utils/singleton/singleton.utils'
import type { SeedImage } from './seed.images'

/** A document as it is written: Sanity adds the timestamps and the revision. */
type Stored<T> = Omit<T, '_createdAt' | '_updatedAt' | '_rev'>

export type SeedDocument =
  | Stored<BusinessProfile>
  | Stored<SiteSettings>
  | Stored<HomePage>
  | Stored<OffersPage>
  | Stored<FaqPage>
  | Stored<ContactPage>
  | Stored<ImprintPage>
  | Stored<PrivacyPage>
  | Stored<Offer>
  | Stored<Testimonial>
  | Stored<FaqItem>
  | Stored<TranslationMetadata>

/** The id of an uploaded demo picture (`image-…`), resolved by the seed script. */
export type ImageAssetId = (name: SeedImage) => string

const UPDATED_AT = '2026-10-01'

const EMAIL = 'demo@example.com'

// ─── Building blocks ────────────────────────────────────────────────────────────

const reference = (id: string) => ({ _type: 'reference' as const, _ref: id, _weak: true })

const keyed = <T extends object>(items: T[]) =>
  items.map((item, index) => ({ _key: `k${index}`, ...item }))

const routeLink = (route: NonNullable<Link['route']>): Link => ({
  _type: 'link',
  kind: 'route',
  route,
})

const offerLink = (id: string): Link => ({
  _type: 'link',
  kind: 'reference',
  reference: reference(id),
})

const externalLink = (href: string): Link => ({ _type: 'link', kind: 'external', href })

const cta = (label: string, link: Link): Cta => ({ _type: 'cta', label, link })

type Part =
  | { text: string; style?: 'normal' | 'h2' | 'h3'; listItem?: 'bullet' | 'number' }
  | { text: string; linkText: string; link: Link }
  | { image: AccessibleImage }

/** Rich text from short parts: paragraphs, headings, list items, a linked phrase, images. */
function richText(parts: Part[]): RichText {
  return parts.map((part, index) => {
    const _key = `b${index}`
    if ('image' in part) return { _key, ...part.image }
    const span = (text: string, marks: string[] = [], key = 's0') => ({
      _type: 'span' as const,
      _key: key,
      text,
      marks,
    })
    if ('link' in part) {
      return {
        _type: 'block' as const,
        _key,
        style: 'normal' as const,
        markDefs: [{ _key: 'l0', ...part.link }],
        children: [span(part.text), span(part.linkText, ['l0'], 's1')],
      }
    }
    return {
      _type: 'block' as const,
      _key,
      style: part.style ?? 'normal',
      ...(part.listItem && { listItem: part.listItem, level: 1 }),
      markDefs: [],
      children: [span(part.text)],
    }
  })
}

// ─── Copy ───────────────────────────────────────────────────────────────────────

const OFFERS = [
  {
    key: 'personal',
    image: 'offerPersonal',
    price: 89,
    de: {
      title: 'Personal Training',
      slug: 'personal-training',
      summary:
        '60 Minuten Eins-zu-eins-Training, abgestimmt auf Ihre Ziele, Ihren Körper und Ihren Kalender.',
      body: 'Wir starten mit einer Bewegungsanalyse und bauen daraus Ihren Plan. Jede Einheit ist vorbereitet, jede Übung erklärt.',
      points: [
        'Bewegungsanalyse in der ersten Stunde',
        'Trainingsplan für zu Hause',
        'Termine morgens, mittags und abends',
      ],
    },
    en: {
      title: 'Personal coaching',
      slug: 'personal-coaching',
      summary:
        '60 minutes of one-to-one training, matched to your goals, your body and your calendar.',
      body: 'We start with a movement assessment and build your plan from it. Every session is prepared, every exercise explained.',
      points: [
        'Movement assessment in the first session',
        'Training plan for home',
        'Sessions in the morning, at lunch and in the evening',
      ],
    },
  },
  {
    key: 'strength',
    image: 'offerStrength',
    price: 25,
    de: {
      title: 'Kraftgruppe',
      slug: 'kraftgruppe',
      summary:
        'Kleingruppe mit höchstens sechs Personen: Grundübungen sauber lernen und gemeinsam stärker werden.',
      body: 'Zweimal pro Woche trainieren wir Kniebeuge, Kreuzheben, Drücken und Ziehen, mit Technik vor Gewicht.',
      points: [
        'Maximal sechs Teilnehmende',
        'Dienstag und Donnerstag, 18:30',
        'Für Einsteiger und Fortgeschrittene',
      ],
    },
    en: {
      title: 'Strength group',
      slug: 'strength-group',
      summary:
        'A small group of six people at most: learn the main lifts properly and get stronger together.',
      body: 'Twice a week we train squats, deadlifts, presses and pulls, with technique before load.',
      points: [
        'Six participants at most',
        'Tuesday and Thursday, 6:30 pm',
        'For beginners and advanced lifters',
      ],
    },
  },
  {
    key: 'online',
    image: 'offerOnline',
    price: 149,
    de: {
      title: 'Online-Coaching',
      slug: 'online-coaching',
      summary:
        'Ihr Trainingsplan per App, wöchentliches Feedback per Video und Antworten innerhalb von 24 Stunden.',
      body: 'Für alle, die selbstständig trainieren und trotzdem jemanden an ihrer Seite wollen.',
      points: [
        'Plan in der App, jede Woche angepasst',
        'Video-Feedback zu Ihrer Technik',
        'Monatlich kündbar',
      ],
    },
    en: {
      title: 'Online coaching',
      slug: 'online-coaching',
      summary: 'Your training plan in an app, weekly video feedback and answers within 24 hours.',
      body: 'For people who train on their own and still want someone at their side.',
      points: [
        'Plan in the app, adjusted every week',
        'Video feedback on your technique',
        'Cancel monthly',
      ],
    },
  },
] as const

const TESTIMONIALS = [
  {
    key: 'anna',
    image: 'clientAnna',
    author: 'Anna M. (Demo)',
    de: 'Nach drei Monaten trainiere ich endlich ohne Rückenschmerzen. Jede Einheit war perfekt vorbereitet.',
    en: 'After three months I finally train without back pain. Every session was perfectly prepared.',
  },
  {
    key: 'jonas',
    image: 'clientJonas',
    author: 'Jonas K. (Demo)',
    de: 'Die Kraftgruppe ist der Termin, den ich nie ausfallen lasse. Ich hebe heute doppelt so viel wie am Anfang.',
    en: 'The strength group is the one appointment I never skip. Today I lift twice as much as when I started.',
  },
  {
    key: 'mira',
    image: 'clientMira',
    author: 'Mira S. (Demo)',
    de: 'Online-Coaching neben Job und Kindern: endlich ein Plan, der in meinen Alltag passt.',
    en: 'Online coaching next to my job and kids: finally a plan that fits my everyday life.',
  },
] as const

const FAQ = [
  {
    key: 'trial',
    de: ['Gibt es ein Probetraining?', 'Ja. Die erste Einheit ist kostenlos und unverbindlich.'],
    en: ['Is there a trial session?', 'Yes. The first session is free and without obligation.'],
  },
  {
    key: 'beginner',
    de: [
      'Ich habe noch nie trainiert. Ist das ein Problem?',
      'Nein. Wir beginnen dort, wo Sie stehen, und steigern uns Schritt für Schritt.',
    ],
    en: [
      'I have never trained before. Is that a problem?',
      'No. We start where you are and progress step by step.',
    ],
  },
  {
    key: 'cancel',
    de: [
      'Wie kurzfristig kann ich absagen?',
      'Bis 24 Stunden vorher kostenlos. Danach berechnen wir die Einheit.',
    ],
    en: [
      'How late can I cancel?',
      'Free of charge up to 24 hours before. After that the session is charged.',
    ],
  },
  {
    key: 'bring',
    de: [
      'Was muss ich mitbringen?',
      'Sportkleidung, saubere Hallenschuhe und eine Wasserflasche. Handtücher liegen bereit.',
    ],
    en: [
      'What do I need to bring?',
      'Sportswear, clean indoor shoes and a water bottle. Towels are provided.',
    ],
  },
] as const

const COPY = {
  de: {
    footerNote: 'Demo-Inhalte für Staging. Personal Training in Berlin-Mitte.',
    seoSuffix: 'Demo Studio Berlin',
    home: {
      title: 'Startseite',
      heroTitle: 'Klüger trainieren, nicht härter',
      heroText:
        'Personal Training und Kleingruppen in Berlin-Mitte: mit Plan, mit Technik und mit Spaß.',
      heroCta: 'Angebote ansehen',
      heroAlt: 'Trainerin zeigt einer Kundin eine Kniebeuge',
      aboutTitle: 'Über mich',
      portraitAlt: 'Porträt der Trainerin',
      about:
        'Seit 2010 helfe ich Menschen, stärker und schmerzfrei zu werden. Mein Lieblingsangebot zum Einstieg:',
      aboutLink: 'Personal Training',
      highlights: [
        'Zertifizierte Trainerin (Demo)',
        'Über 500 betreute Kundinnen und Kunden',
        'Spezialisiert auf Rücken und Haltung',
      ],
      closingTitle: 'Bereit für die erste Einheit?',
      closingText:
        'Schreiben Sie mir, und wir finden einen Termin für Ihr kostenloses Probetraining.',
      closingCta: 'Kontakt aufnehmen',
      seoDescription: 'Demo: Personal Training, Kraftgruppe und Online-Coaching in Berlin-Mitte.',
    },
    offers: {
      title: 'Angebote',
      intro: 'Drei Wege zu Ihrem Ziel. Alle beginnen mit einem kostenlosen Probetraining.',
      cta: 'Frage per E-Mail stellen',
      offerCta: 'Probetraining anfragen',
      pointsTitle: 'Das ist enthalten',
      imageAlt: 'Trainingssituation im Studio',
      price: 'Preis pro Einheit beziehungsweise Monat, inklusive Mehrwertsteuer.',
    },
    faq: {
      title: 'Häufige Fragen',
      intro: 'Alles, was Sie vor dem ersten Training wissen möchten.',
    },
    contact: {
      title: 'Kontakt',
      intro: 'Erzählen Sie mir kurz von Ihrem Ziel. Ich antworte innerhalb eines Werktags.',
      success: 'Danke für Ihre Nachricht! Ich melde mich innerhalb eines Werktags.',
    },
    imprint: {
      title: 'Impressum',
      heading: 'Angaben gemäß § 5 DDG',
      body: 'Demo Studio Berlin, Musterstraße 1, 10115 Berlin. Beispieltext: vor dem Livegang durch das echte Impressum ersetzen.',
      contact: 'E-Mail: demo@example.com, Telefon: +49 30 0000000',
    },
    privacy: {
      title: 'Datenschutzerklärung',
      heading: 'Verantwortliche Stelle',
      body: 'Beispieltext: vor dem Livegang durch die echte Datenschutzerklärung ersetzen. Sie muss jeden Dienst nennen, den die Website nutzt, auch den Formulardienst.',
      list: ['Hosting der Website', 'Kontaktformular', 'Content-Management (Sanity)'],
      linkText: 'Fragen? Nutzen Sie das Kontaktformular.',
      link: 'Zum Kontakt',
    },
    testimonialAlt: 'Foto der Kundin oder des Kunden',
  },
  en: {
    footerNote: 'Demo content for staging. Personal training in Berlin-Mitte.',
    seoSuffix: 'Demo Studio Berlin',
    home: {
      title: 'Home',
      heroTitle: 'Train smarter, not harder',
      heroText:
        'Personal training and small groups in Berlin-Mitte: with a plan, with technique and with fun.',
      heroCta: 'See the offers',
      heroAlt: 'Coach showing a client a squat',
      aboutTitle: 'About me',
      portraitAlt: 'Portrait of the coach',
      about:
        'Since 2010 I have been helping people get stronger and pain-free. My favourite way to start:',
      aboutLink: 'Personal coaching',
      highlights: [
        'Certified coach (demo)',
        'More than 500 clients coached',
        'Specialised in back and posture',
      ],
      closingTitle: 'Ready for your first session?',
      closingText: 'Write to me and we will find a date for your free trial session.',
      closingCta: 'Get in touch',
      seoDescription:
        'Demo: personal coaching, strength group and online coaching in Berlin-Mitte.',
    },
    offers: {
      title: 'Offers',
      intro: 'Three ways to your goal. All of them start with a free trial session.',
      cta: 'Ask by email',
      offerCta: 'Request a trial session',
      pointsTitle: 'What is included',
      imageAlt: 'Training in the studio',
      price: 'Price per session or month, VAT included.',
    },
    faq: { title: 'FAQ', intro: 'Everything you want to know before your first session.' },
    contact: {
      title: 'Contact',
      intro: 'Tell me briefly about your goal. I answer within one working day.',
      success: 'Thank you for your message! I will get back to you within one working day.',
    },
    imprint: {
      title: 'Imprint',
      heading: 'Information according to § 5 DDG',
      body: 'Demo Studio Berlin, Musterstraße 1, 10115 Berlin. Sample text: replace it with the real imprint before going live.',
      contact: 'Email: demo@example.com, phone: +49 30 0000000',
    },
    privacy: {
      title: 'Privacy policy',
      heading: 'Controller',
      body: 'Sample text: replace it with the real privacy policy before going live. It must name every service the site uses, the form service included.',
      list: ['Website hosting', 'Contact form', 'Content management (Sanity)'],
      linkText: 'Questions? Use the contact form.',
      link: 'Go to contact',
    },
    testimonialAlt: 'Photo of the client',
  },
} as const satisfies Record<LocaleCode, unknown>

// ─── Documents ──────────────────────────────────────────────────────────────────

const offerId = (key: string, locale: LocaleCode) => `offer-${key}-${locale}`
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
      closing: {
        title: copy.home.closingTitle,
        text: copy.home.closingText,
        cta: cta(copy.home.closingCta, routeLink('contact')),
      },
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
        { text: copy.privacy.heading, style: 'h2' },
        { text: copy.privacy.body },
        ...copy.privacy.list.map((item) => ({ text: item, listItem: 'bullet' as const })),
        {
          text: `${copy.privacy.linkText} `,
          linkText: copy.privacy.link,
          link: routeLink('contact'),
        },
      ]),
      updatedAt: UPDATED_AT,
      seo: pageSeo(locale, copy.privacy.title, copy.privacy.heading),
    }

    const siteSettings: Stored<SiteSettings> = {
      ...page('siteSettings', locale),
      footerNote: copy.footerNote,
    }

    return [
      siteSettings,
      home,
      offersPage,
      faqPage,
      contactPage,
      imprintPage,
      privacyPage,
      ...offers,
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
    ...OFFERS.map(({ key }) => translation('offer', key, offerId)),
    ...TESTIMONIALS.map(({ key }) => translation('testimonial', key, testimonialId)),
    ...FAQ.map(({ key }) => translation('faqItem', key, faqId)),
  ]
}
