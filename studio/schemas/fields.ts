import { defineField, type ReferenceFilterResolver } from 'sanity'

import { isUniqueInTypeAndLanguage } from '../utils/slug/slug.utils'

/** Every document with text is written in one language; the desk sets it when creating. */
export const languageField = defineField({
  name: 'language',
  title: 'Language',
  type: 'string',
  readOnly: true,
  hidden: true,
})

export const titleField = defineField({
  name: 'title',
  title: 'Title',
  type: 'string',
  validation: (rule) => rule.required(),
})

export const seoField = defineField({ name: 'seo', title: 'SEO', type: 'seo' })

/**
 * The last part of an offer's URL, in its own language. Sanity's generator turns the
 * title into a slug (umlauts included: "Über uns" → "ueber-uns").
 */
export const slugField = defineField({
  name: 'slug',
  title: 'URL',
  type: 'slug',
  description:
    'Click "Generate" to create it from the title. Changing it after publishing breaks existing links (the old address shows "page not found").',
  options: {
    source: 'title',
    maxLength: 96,
    isUnique: isUniqueInTypeAndLanguage,
    documentInternationalization: { exclude: true },
  },
  validation: (rule) => rule.required(),
})

/** References only list documents in the editing document's language. */
export const sameLanguageFilter: ReferenceFilterResolver = ({ document }) => ({
  filter: 'language == $language',
  params: { language: (document as { language?: string }).language ?? null },
})

/** A list of references to documents of `type` in the same language. */
export const referenceListField = (name: string, title: string, type: string, max?: number) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      { type: 'reference', to: [{ type }], weak: true, options: { filter: sameLanguageFilter } },
    ],
    options: { documentInternationalization: { exclude: true } },
    validation: (rule) => (max ? rule.unique().max(max) : rule.unique()),
  })

/** A show/hide switch for an optional section of a page. */
export const toggleField = (name: string, title: string) =>
  defineField({ name, title, type: 'boolean', initialValue: true })
