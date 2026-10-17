import { BookIcon } from '@sanity/icons/Book'
import { defineField, defineType } from 'sanity'

import { introField, labelField, languageField, seoField, titleField } from '../fields'

/** The magazine list: its texts only; the articles are `post` documents. */
export const magazinePageSchema = defineType({
  name: 'magazinePage',
  title: 'Magazine',
  type: 'document',
  icon: BookIcon,
  fields: [
    languageField,
    labelField,
    titleField,
    introField,
    defineField({ name: 'closing', title: 'Closing', type: 'closing' }),
    seoField,
  ],
})
