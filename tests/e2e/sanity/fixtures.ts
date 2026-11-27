/**
 * The test content of the E2E suite: the documents the Studio would publish, shaped like
 * the schemas in studio/schemas. Served by server.ts (groq-js, Sanity's GROQ engine).
 *
 * What the specs rely on:
 * - Every page exists in both languages, except the FAQ page and the imprint (German
 *   only): in English they render empty (the FAQ page still lists the English questions).
 *   The German FAQ page lists its editor-ordered question (prices) before the trial question.
 * - The About page has a title, a description and a closing band in both languages, and no
 *   picture (the test CMS holds no images).
 * - On the home page, one testimonial has the client's consent, one has not (never shown).
 */

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

const TEXT = {
  de: {
    hero: 'Klüger trainieren, nicht härter',
    cta: 'Mehr über mich',
    question: 'Gibt es ein Probetraining?',
  },
  en: {
    hero: 'Train smarter, not harder',
    cta: 'More about me',
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
      cta: routeCta(TEXT[language].cta, 'about'),
    },
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

const aboutIn = (language: 'de' | 'en') => [
  page('aboutPage', language, {
    label: language === 'de' ? 'Über mich' : 'About me',
    title: language === 'de' ? 'Hallo, ich bin Ihre Trainerin' : "Hi, I'm your coach",
    description: language === 'de' ? 'Seit 2010 an Ihrer Seite.' : 'By your side since 2010.',
    closing: {
      title: language === 'de' ? 'Bereit für die erste Einheit?' : 'Ready for your first session?',
      cta: routeCta(
        language === 'de' ? 'Probetraining anfragen' : 'Request a free trial',
        'contact',
      ),
    },
  }),
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
  ...aboutIn('de'),
  ...aboutIn('en'),
  // German only.
  // The editor put "prices" first: it is listed before the older trial question.
  page('faqPage', 'de', {
    title: 'Häufige Fragen',
    intro: 'Alles, was Sie wissen möchten.',
    order: keyed([reference('faq-prices-de')]),
  }),
  {
    _id: 'faq-prices-de',
    _type: 'faqItem',
    language: 'de',
    question: 'Was kostet eine Einheit?',
    answer: text('Ab 25 Euro.'),
  },
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
]
