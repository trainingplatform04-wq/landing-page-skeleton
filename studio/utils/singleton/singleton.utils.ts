import type { DocumentActionComponent, Template } from 'sanity'

import { LOCALES } from '../../../constants/i18n.constants'
import { PAGE_TYPES } from '../../../constants/routes.constants'

/**
 * Singletons: documents with a fixed id, opened from the desk (the first edit creates
 * them), never created from the menu, duplicated or deleted. One per language for the
 * pages and the site settings (`homePage-de`), one in total for the business profile.
 */
const LANGUAGE_SINGLETON_TYPES: readonly string[] = [...Object.values(PAGE_TYPES), 'siteSettings']

const GLOBAL_SINGLETON_TYPES: readonly string[] = ['businessProfile']

/** Translated collections: editors create them per language, linked by the translation plugin. */
export const TRANSLATED_TYPES: readonly string[] = ['offer', 'testimonial', 'faqItem']

const SINGLETON_TYPES = new Set([...LANGUAGE_SINGLETON_TYPES, ...GLOBAL_SINGLETON_TYPES])

/** `homePage-de`; `businessProfile` for a language-neutral singleton. */
export const singletonId = (type: string, locale?: string) => (locale ? `${type}-${locale}` : type)

/** One template per language singleton and translated collection, setting `language`. */
const LANGUAGE_TEMPLATE_TYPES = [...LANGUAGE_SINGLETON_TYPES, ...TRANSLATED_TYPES]

export const languageTemplateId = (schemaType: string, locale: string) => `${schemaType}-${locale}`

/** Template ids of every singleton (language templates + the business profile's default). */
const SINGLETON_TEMPLATE_IDS = new Set([
  ...LANGUAGE_SINGLETON_TYPES.flatMap((type) =>
    LOCALES.map(({ code }) => languageTemplateId(type, code)),
  ),
  ...GLOBAL_SINGLETON_TYPES,
])

/** Types whose default template would create a document without `language`, or by hand. */
const NO_DEFAULT_TEMPLATE = new Set([
  ...LANGUAGE_SINGLETON_TYPES,
  ...TRANSLATED_TYPES,
  'translation.metadata',
])

/** Our language templates replace the defaults: no document is created without `language`. */
export function filterTemplates(templates: Template[]): Template[] {
  const titleOf = new Map(templates.map(({ schemaType, title }) => [schemaType, title]))
  const languageTemplates = LANGUAGE_TEMPLATE_TYPES.flatMap((schemaType) =>
    LOCALES.map((locale) => ({
      id: languageTemplateId(schemaType, locale.code),
      title: `${titleOf.get(schemaType) ?? schemaType} (${locale.name})`,
      schemaType,
      value: { language: locale.code },
    })),
  )
  return [
    ...templates.filter(({ schemaType }) => !NO_DEFAULT_TEMPLATE.has(schemaType)),
    ...languageTemplates,
  ]
}

/** "Create new" outside the desk never offers a singleton (the desk opens them by id). */
export function isCreatableFromMenu(templateId: string) {
  return !SINGLETON_TEMPLATE_IDS.has(templateId)
}

/** Singletons are edited, published or taken offline, never duplicated or deleted. */
const SINGLETON_ACTIONS = new Set(['publish', 'unpublish', 'discardChanges', 'restore'])

export function isSingletonType(schemaType: string) {
  return SINGLETON_TYPES.has(schemaType)
}

export function filterSingletonActions(actions: DocumentActionComponent[]) {
  return actions.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
}
