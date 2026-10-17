/**
 * What components receive: plain values, ready to render. Composables build them from
 * the CMS data (links resolved, prices and dates formatted, images flattened).
 */

export interface Image {
  url: string
  alt: string
  /** The editor's focal point as CSS `object-position` ("50% 30%"); centred when absent. */
  position?: string
}

/** A button or link: a localized path of this site or an external address. */
export interface Cta {
  label: string
  to: string
  external: boolean
}

/** The band that ends a page: a title or a button, and an optional text. */
export interface Closing {
  title?: string
  text?: string
  cta?: Cta
}

/** What a page puts in the `<head>` (see `usePageMeta`). */
export interface Seo {
  title: string
  description?: string
  image?: string
  noIndex: boolean
}

/**
 * Rich text in Portable Text format (Sanity's format for formatted text). The `_type` and
 * `_key` fields are part of that format; the renderer reads them, not our code.
 */
export type RichText = Array<{ _type: string; _key: string; [field: string]: unknown }>

export interface OfferCard {
  id: string
  title: string
  summary: string
  to: string
  image?: Image
  price?: string
}

export interface FaqItem {
  id: string
  question: string
  answer: RichText
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  photo?: Image
}

export interface Business {
  name: string
  email: string
  phone?: { label: string; href: string }
  addressLines: string[]
  socials: Array<{ platform: string; url: string }>
}

/** Who signs an article. */
export interface Author {
  name: string
  /** "More from Lena": the first word of the name. */
  firstName: string
  role?: string
  bio?: string
  photo?: Image
}

/** A magazine article on a card, its date already formatted. */
export interface PostCard {
  id: string
  title: string
  excerpt: string
  to: string
  category?: string
  image?: Image
  author?: { name: string; photo?: Image }
  /** Shown: "28 Sep 2026". */
  date: string
  /** Machine-readable, for `<time datetime>`. */
  dateTime: string
  readingMinutes: number
}

/** A filter tab of the magazine: "All" or one category. */
export interface MagazineTab {
  label: string
  to: string
  active: boolean
}
