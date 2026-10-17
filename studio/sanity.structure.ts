import { DocumentsIcon } from '@sanity/icons/Documents'

import type { ComponentType, ReactNode } from 'react'
import type { StructureBuilder, StructureResolver } from 'sanity/structure'

import { type LocaleCode, LOCALES } from '../constants/i18n.constants'
import { SANITY_API_VERSION } from '../constants/sanity.constants'
import { authorSchema } from './schemas/collections/author.schema'
import { categorySchema } from './schemas/collections/category.schema'
import { faqItemSchema } from './schemas/collections/faqItem.schema'
import { offerSchema } from './schemas/collections/offer.schema'
import { postSchema } from './schemas/collections/post.schema'
import { testimonialSchema } from './schemas/collections/testimonial.schema'
import { PAGE_SCHEMAS } from './schemas/index'
import { businessProfileSchema } from './schemas/settings/businessProfile.schema'
import { siteSettingsSchema } from './schemas/settings/siteSettings.schema'
import { languageTemplateId, singletonId } from './utils/singleton/singleton.utils'

type Schema = { name: string; title?: string; icon?: ComponentType | ReactNode }
type Ordering = { field: string; direction: 'asc' | 'desc' }
type Child = ReturnType<StructureBuilder['document']> | ReturnType<StructureBuilder['documentList']>

/**
 * The desk. Every document with text opens as "<Type> → Deutsch / English"; the
 * language-neutral business profile has one entry.
 */
export const structure: StructureResolver = (S) => {
  /** "<Type> → Deutsch / English", each language opening `child`. */
  const byLanguage = (schema: Schema, child: (locale: LocaleCode, title: string) => Child) => {
    const title = schema.title ?? schema.name
    return S.listItem()
      .id(schema.name)
      .title(title)
      .icon(schema.icon)
      .child(
        S.list()
          .title(title)
          .items(
            LOCALES.map(({ code, name }) =>
              S.listItem()
                .id(code)
                .title(name)
                .icon(schema.icon)
                .child(child(code, `${title} (${name})`)),
            ),
          ),
      )
  }

  /** A singleton opened by its fixed id; its template sets `language`. */
  const singleton = (schema: Schema) =>
    byLanguage(schema, (locale, title) =>
      S.document()
        .schemaType(schema.name)
        .documentId(singletonId(schema.name, locale))
        .initialValueTemplate(languageTemplateId(schema.name, locale))
        .title(title),
    )

  /** The documents of one type and language, created with that language's template. */
  const collection = (schema: Schema, ordering: Ordering = { field: 'title', direction: 'asc' }) =>
    byLanguage(schema, (locale, title) =>
      S.documentList()
        .title(title)
        .schemaType(schema.name)
        .apiVersion(SANITY_API_VERSION)
        .filter('_type == $type && language == $language')
        .params({ type: schema.name, language: locale })
        .defaultOrdering([ordering])
        .initialValueTemplates([
          S.initialValueTemplateItem(languageTemplateId(schema.name, locale)),
        ]),
    )

  const pages = S.listItem()
    .id('pages')
    .title('Pages')
    .icon(DocumentsIcon)
    .child(S.list().title('Pages').items(PAGE_SCHEMAS.map(singleton)))

  const businessProfile = S.listItem()
    .id(businessProfileSchema.name)
    .title(businessProfileSchema.title)
    .icon(businessProfileSchema.icon)
    .child(
      S.document()
        .schemaType(businessProfileSchema.name)
        .documentId(singletonId(businessProfileSchema.name)),
    )

  return S.list()
    .title('Content')
    .items([
      pages,
      S.divider(),
      collection(offerSchema),
      collection(testimonialSchema, { field: 'author', direction: 'asc' }),
      collection(faqItemSchema, { field: 'question', direction: 'asc' }),
      S.divider(),
      collection(postSchema, { field: 'publishedAt', direction: 'desc' }),
      collection(categorySchema, { field: 'order', direction: 'asc' }),
      collection(authorSchema, { field: 'name', direction: 'asc' }),
      S.divider(),
      businessProfile,
      singleton(siteSettingsSchema),
    ])
}
