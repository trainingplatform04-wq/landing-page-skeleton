import type { ComponentType, ReactNode } from 'react'
import type { StructureBuilder, StructureResolver } from 'sanity/structure'

import { LOCALES } from '../constants/i18n.constants'
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

type Icon = ComponentType | ReactNode
type Schema = { name: string; title?: string; icon?: Icon }

/**
 * The desk. Every document with text opens as "<Type> → Deutsch / English";
 * the language-neutral business profile has one entry.
 */
export const structure: StructureResolver = (S) => {
  const byLanguage = (
    schema: Schema,
    child: (locale: (typeof LOCALES)[number]) => ReturnType<StructureBuilder['document']>,
  ) =>
    S.listItem()
      .id(schema.name)
      .title(schema.title ?? schema.name)
      .icon(schema.icon)
      .child(
        S.list()
          .title(schema.title ?? schema.name)
          .items(
            LOCALES.map((locale) =>
              S.listItem()
                .id(locale.code)
                .title(locale.name)
                .icon(schema.icon)
                .child(child(locale)),
            ),
          ),
      )

  /** A singleton opened by its fixed id; its template sets `language`. */
  const singleton = ({ name, title, icon }: Schema) =>
    byLanguage({ name, title, icon }, (locale) =>
      S.document()
        .schemaType(name)
        .documentId(singletonId(name, locale.code))
        .initialValueTemplate(languageTemplateId(name, locale.code))
        .title(`${title} (${locale.name})`),
    )

  /** The documents of one type and language, created with that language's template. */
  const listByLanguage = (
    schema: Schema,
    ordering: { field: string; direction: 'asc' | 'desc' } = { field: 'title', direction: 'asc' },
  ) =>
    S.listItem()
      .id(schema.name)
      .title(schema.title ?? schema.name)
      .icon(schema.icon)
      .child(
        S.list()
          .title(schema.title ?? schema.name)
          .items(
            LOCALES.map((locale) =>
              S.listItem()
                .id(locale.code)
                .title(locale.name)
                .icon(schema.icon)
                .child(
                  S.documentList()
                    .title(`${schema.title} (${locale.name})`)
                    .schemaType(schema.name)
                    .apiVersion(SANITY_API_VERSION)
                    .filter('_type == $type && language == $language')
                    .params({ type: schema.name, language: locale.code })
                    .defaultOrdering([ordering])
                    .initialValueTemplates([
                      S.initialValueTemplateItem(languageTemplateId(schema.name, locale.code)),
                    ]),
                ),
            ),
          ),
      )

  const pages = S.listItem()
    .id('pages')
    .title('Pages')
    .icon(PAGE_SCHEMAS[0]?.icon)
    .child(
      S.list()
        .title('Pages')
        .items(PAGE_SCHEMAS.map((schema) => singleton(schema))),
    )

  return S.list()
    .title('Content')
    .items([
      pages,
      S.divider(),
      listByLanguage(offerSchema),
      listByLanguage(testimonialSchema, { field: 'author', direction: 'asc' }),
      listByLanguage(faqItemSchema, { field: 'question', direction: 'asc' }),
      S.divider(),
      listByLanguage(postSchema, { field: 'publishedAt', direction: 'desc' }),
      listByLanguage(categorySchema, { field: 'order', direction: 'asc' }),
      listByLanguage(authorSchema, { field: 'name', direction: 'asc' }),
      S.divider(),
      S.listItem()
        .id(businessProfileSchema.name)
        .title(businessProfileSchema.title ?? 'Business profile')
        .icon(businessProfileSchema.icon)
        .child(
          S.document()
            .schemaType(businessProfileSchema.name)
            .documentId(singletonId(businessProfileSchema.name)),
        ),
      singleton(siteSettingsSchema),
    ])
}
