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

/** The small line above a page's title. */
export const labelField = defineField({
  name: 'label',
  title: 'Label',
  type: 'string',
  description: 'The small line above the title.',
  validation: (rule) => rule.max(30),
})

export const introField = defineField({
  name: 'intro',
  title: 'Intro',
  type: 'text',
  rows: 3,
  description: 'Shown under the title and used as the search-engine description.',
  validation: (rule) => rule.max(160).warning('Search engines cut it after about 160 characters.'),
})

export const seoField = defineField({ name: 'seo', title: 'SEO', type: 'seo' })

/** The last part of an offer's or article's URL (`/angebote/<slug>`), unique per language. */
export const slugField = defineField({
  name: 'slug',
  title: 'URL segment',
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

/** A list of references to documents of one type, in the same language. */
export const referenceListField = ({
  name,
  title,
  to,
  max,
  description,
}: {
  name: string
  title: string
  to: string
  max?: number
  description?: string
}) =>
  defineField({
    name,
    title,
    description,
    type: 'array',
    of: [
      {
        type: 'reference',
        to: [{ type: to }],
        weak: true,
        options: { filter: sameLanguageFilter },
      },
    ],
    options: { documentInternationalization: { exclude: true } },
    validation: (rule) => (max ? rule.unique().max(max) : rule.unique()),
  })

/** A show/hide switch for an optional section of a page. */
export const toggleField = (name: string, title: string) =>
  defineField({ name, title, type: 'boolean', initialValue: true })
