/**
 * What components receive: plain values, ready to render. Composables build them from
 * the CMS data (links resolved, prices and dates formatted, images flattened).
 */

export interface Image {
  url: string
  alt: string
}

/** A button or link: a localized path of this site or an external address. */
export interface Cta {
  label: string
  to: string
  external: boolean
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

/** A magazine article on a card: date already formatted, reading time already worded. */
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
  readingTime: string
}

/** A filter tab of the magazine: "All" or one category. */
export interface MagazineTab {
  label: string
  to: string
  active: boolean
}
