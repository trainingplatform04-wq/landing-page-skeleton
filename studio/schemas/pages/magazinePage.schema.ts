import { BookIcon } from '@sanity/icons/Book'
import { defineField, defineType } from 'sanity'

import { languageField, seoField, titleField } from '../fields'

/** The magazine list: its texts only; the articles are `post` documents. */
export const magazinePageSchema = defineType({
  name: 'magazinePage',
  title: 'Magazine',
  type: 'document',
  icon: BookIcon,
  fields: [
    languageField,
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      validation: (rule) => rule.max(30),
    }),
    titleField,
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160),
    }),
    defineField({ name: 'closingTitle', title: 'Closing title', type: 'string' }),
    defineField({ name: 'closingText', title: 'Closing text', type: 'text', rows: 2 }),
    defineField({ name: 'cta', title: 'Closing button', type: 'cta' }),
    seoField,
  ],
})
