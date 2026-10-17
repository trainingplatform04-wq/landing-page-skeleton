import { UserIcon } from '@sanity/icons/User'
import { defineField, defineType } from 'sanity'

import { labelField, languageField, seoField, titleField } from '../fields'

/** The About page: one picture and a short description, then the closing band. */
export const aboutPageSchema = defineType({
  name: 'aboutPage',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  fields: [
    languageField,
    labelField,
    titleField,
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.max(300),
    }),
    defineField({ name: 'image', title: 'Image', type: 'accessibleImage' }),
    defineField({ name: 'closing', title: 'Closing', type: 'closing' }),
    seoField,
  ],
})
