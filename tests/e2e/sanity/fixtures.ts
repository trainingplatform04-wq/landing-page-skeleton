/**
 * The test content of the E2E suite: the documents the Studio would publish, shaped like
 * the schemas in studio/schemas. Served by server.ts (groq-js, Sanity's GROQ engine).
 *
 * What the specs rely on:
 * - Every page exists in both languages, except the FAQ page and the imprint (German
 *   only): in English they render empty (the FAQ page still lists the English questions).
 * - "Personal training" and "Strength group" are translated with different slugs;
 *   "Online coaching" is German only (no English link, no hreflang).
 * - On the home page, one testimonial has the client's consent, one has not (never shown).
 * - An offer slug that makes the CMS fail, for the 503 page.
 * - The German magazine has 14 articles (Training and Ernährung): page 1 shows the 3 newest
 *   and 9 more, page 2 the last 2. "Mindset" has no article (empty state).
 */

/** The slug that answers an error from server.ts: the page must answer 503. */
export const CMS_ERROR_SLUG = 'cms-error'

const UPDATED = '2026-10-01T00:00:00Z'

const reference = (id: string) => ({ _type: 'reference', _ref: id, _weak: true })

const keyed = <T extends object>(items: T[]) =>
  items.map((item, index) => ({ _key: `k${index}`, ...item }))

const text = (value: string) => [
  {
    _type: 'block',
    _key: 'b',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 's', text: value, marks: [] }],
  },
]

const routeCta = (label: string, route: string) => ({
  _type: 'cta',
  label,
  link: { _type: 'link', kind: 'route', route },
})

/** A page in one language, with the id the Studio gives it: `<type>-<language>`. */
const page = (type: string, language: string, fields: object) => ({
  _id: `${type}-${language}`,
  _type: type,
  _updatedAt: UPDATED,
  language,
  ...fields,
})

/** Links language versions, as the Studio's translation plugin does. */
const translations = (id: string, versions: Record<string, string>) => ({
  _id: `translation.metadata.${id}`,
  _type: 'translation.metadata',
  schemaTypes: ['offer'],
  translations: Object.entries(versions).map(([language, ref]) => ({
    _key: language,
    _type: 'internationalizedArrayReferenceValue',
    language,
    value: reference(ref),
  })),
})

const offer = (id: string, language: string, title: string, slug: string) => ({
  _id: id,
  _type: 'offer',
  _updatedAt: UPDATED,
  language,
  title,
  slug: { _type: 'slug', current: slug },
  summary: `${title} in Berlin.`,
  price: 25,
})

const TEXT = {
  de: {
    hero: 'Klüger trainieren, nicht härter',
    cta: 'Angebote ansehen',
    question: 'Gibt es ein Probetraining?',
  },
  en: {
    hero: 'Train smarter, not harder',
    cta: 'See the offers',
    question: 'Is there a trial session?',
  },
}

const pagesIn = (language: 'de' | 'en') => [
  page('siteSettings', language, { footerNote: 'Training in Berlin-Mitte.' }),
  page('homePage', language, {
    title: language === 'de' ? 'Startseite' : 'Home',
    hero: {
      title: TEXT[language].hero,
      text: 'Personal coaching.',
      cta: routeCta(TEXT[language].cta, 'offers'),
    },
    showOffers: true,
    featuredOffers: keyed([reference(`offer-strength-${language}`)]),
    about: {
      title: language === 'de' ? 'Über mich' : 'About me',
      body: text(language === 'de' ? 'Trainerin seit 2010.' : 'Coach since 2010.'),
      highlights: [language === 'de' ? 'Zertifizierte Trainerin' : 'Certified coach'],
    },
    showTestimonials: true,
    testimonials: keyed([reference('testimonial-anna'), reference('testimonial-ben')]),
    showFaq: true,
    faq: keyed([reference(`faq-trial-${language}`)]),
    closing: {
      title: language === 'de' ? 'Bereit?' : 'Ready?',
      cta: routeCta(language === 'de' ? 'Schreiben Sie mir' : 'Write to me', 'contact'),
    },
    seo: {
      _type: 'seo',
      title: language === 'de' ? 'Startseite' : 'Home',
      description: 'Personal training in Berlin.',
    },
  }),
  page('offersPage', language, {
    title: language === 'de' ? 'Angebote' : 'Offers',
    order: keyed([reference(`offer-strength-${language}`)]),
  }),
  // The English page keeps the standard thank-you message.
  page('contactPage', language, {
    title: language === 'de' ? 'Kontakt' : 'Contact',
    ...(language === 'de' && { successText: 'Danke, bis bald!' }),
  }),
  page('privacyPage', language, {
    title: language === 'de' ? 'Datenschutzerklärung' : 'Privacy policy',
    body: text(language === 'de' ? 'Datenschutzerklärung' : 'Privacy policy'),
    updatedAt: '2026-09-01',
  }),
  {
    _id: `faq-trial-${language}`,
    _type: 'faqItem',
    language,
    question: TEXT[language].question,
    answer: text(language === 'de' ? 'Ja, kostenlos.' : 'Yes, free of charge.'),
  },
]

const category = (key: string, language: string, title: string, slug: string, order: number) => ({
  _id: `category-${key}-${language}`,
  _type: 'category',
  language,
  title,
  slug: { _type: 'slug', current: slug },
  order,
})

/** Article `index` of the German magazine: the higher the index, the older it is. */
const post = (index: number, language: string, categoryKey: string) => ({
  _id: `post-${index}-${language}`,
  _type: 'post',
  _updatedAt: UPDATED,
  language,
  title: `${language === 'de' ? 'Artikel' : 'Article'} ${index}`,
  slug: { _type: 'slug', current: `${language === 'de' ? 'artikel' : 'article'}-${index}` },
  excerpt: `Excerpt ${index}.`,
  category: reference(`category-${categoryKey}-${language}`),
  author: reference(`author-lena-${language}`),
  publishedAt: `2026-09-${String(29 - index).padStart(2, '0')}T08:00:00Z`,
  body: text('Kraft beginnt mit Technik.'),
})

const magazineIn = (language: 'de' | 'en') => [
  page('magazinePage', language, {
    kicker: language === 'de' ? 'Magazin' : 'Magazine',
    title:
      language === 'de' ? 'Wissen, das dich weiterbringt.' : 'Know-how that moves you forward.',
    closingTitle: language === 'de' ? 'Bereit?' : 'Ready?',
    cta: routeCta(language === 'de' ? 'Probetraining' : 'Free trial', 'contact'),
  }),
  category('training', language, 'Training', 'training', 1),
  category(
    'nutrition',
    language,
    language === 'de' ? 'Ernährung' : 'Nutrition',
    language === 'de' ? 'ernaehrung' : 'nutrition',
    2,
  ),
  category('mindset', language, 'Mindset', 'mindset', 3),
  { _id: `author-lena-${language}`, _type: 'author', language, name: 'Lena Hoffmann' },
]

/** The whole dataset. */
export const documents = () => [
  {
    _id: 'businessProfile',
    _type: 'businessProfile',
    name: 'Studio Berlin',
    email: 'hallo@example.com',
    phone: '+49 30 1234567',
    address: { street: 'Torstraße 1', postalCode: '10119', city: 'Berlin', country: 'DE' },
  },
  ...pagesIn('de'),
  ...pagesIn('en'),
  ...magazineIn('de'),
  ...magazineIn('en'),
  ...Array.from({ length: 14 }, (_, index) =>
    post(index + 1, 'de', index % 2 ? 'nutrition' : 'training'),
  ),
  post(1, 'en', 'training'),
  post(2, 'en', 'nutrition'),

  // German only.
  page('faqPage', 'de', { title: 'Häufige Fragen', intro: 'Alles, was Sie wissen möchten.' }),
  page('imprintPage', 'de', { title: 'Impressum', body: text('Angaben gemäß § 5 DDG') }),
  {
    _id: 'testimonial-anna',
    _type: 'testimonial',
    language: 'de',
    quote: 'Endlich schmerzfrei trainieren.',
    author: 'Anna',
    consentConfirmed: true,
  },
  // Without the client's consent: never shown.
  {
    _id: 'testimonial-ben',
    _type: 'testimonial',
    language: 'de',
    quote: 'Unpublished quote',
    author: 'Ben',
    consentConfirmed: false,
  },

  offer('offer-personal-de', 'de', 'Personal Training', 'personal-training'),
  offer('offer-personal-en', 'en', 'Personal coaching', 'personal-coaching'),
  translations('personal', { de: 'offer-personal-de', en: 'offer-personal-en' }),
  offer('offer-strength-de', 'de', 'Kraftgruppe', 'kraftgruppe'),
  offer('offer-strength-en', 'en', 'Strength group', 'strength-group'),
  translations('strength', { de: 'offer-strength-de', en: 'offer-strength-en' }),
  offer('offer-online-de', 'de', 'Online-Coaching', 'online-coaching'),
]
