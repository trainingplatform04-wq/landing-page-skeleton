import { authorSchema } from './collections/author.schema'
import { categorySchema } from './collections/category.schema'
import { faqItemSchema } from './collections/faqItem.schema'
import { offerSchema } from './collections/offer.schema'
import { postSchema } from './collections/post.schema'
import { testimonialSchema } from './collections/testimonial.schema'
import { accessibleImageSchema } from './objects/accessibleImage.schema'
import { articleBodySchema } from './objects/articleBody.schema'
import { closingSchema } from './objects/closing.schema'
import { ctaSchema } from './objects/cta.schema'
import { linkSchema } from './objects/link.schema'
import { richTextSchema } from './objects/richText.schema'
import { seoSchema } from './objects/seo.schema'
import { aboutPageSchema } from './pages/aboutPage.schema'
import { contactPageSchema } from './pages/contactPage.schema'
import { faqPageSchema } from './pages/faqPage.schema'
import { homePageSchema } from './pages/homePage.schema'
import { imprintPageSchema } from './pages/imprintPage.schema'
import { magazinePageSchema } from './pages/magazinePage.schema'
import { offersPageSchema } from './pages/offersPage.schema'
import { privacyPageSchema } from './pages/privacyPage.schema'
import { businessProfileSchema } from './settings/businessProfile.schema'
import { siteSettingsSchema } from './settings/siteSettings.schema'

/** One document per page and language, in menu order. */
export const PAGE_SCHEMAS = [
  homePageSchema,
  offersPageSchema,
  magazinePageSchema,
  aboutPageSchema,
  faqPageSchema,
  contactPageSchema,
  imprintPageSchema,
  privacyPageSchema,
]

/** Collections editors create per language, linked by the translation plugin. */
export const COLLECTION_SCHEMAS = [
  offerSchema,
  testimonialSchema,
  faqItemSchema,
  postSchema,
  categorySchema,
  authorSchema,
]

export const schemaTypes = [
  // Objects
  accessibleImageSchema,
  seoSchema,
  linkSchema,
  ctaSchema,
  closingSchema,
  richTextSchema,
  articleBodySchema,
  // Pages
  ...PAGE_SCHEMAS,
  // Collections
  ...COLLECTION_SCHEMAS,
  // Settings
  businessProfileSchema,
  siteSettingsSchema,
]
