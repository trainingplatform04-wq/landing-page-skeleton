import { UserIcon } from '@sanity/icons/User'
import { defineField, defineType } from 'sanity'

import { languageField, seoField, titleField } from '../fields'

/** The About page: one picture and a short description, then the closing call to action. */
export const aboutPageSchema = defineType({
  name: 'aboutPage',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  fields: [
    languageField,
    defineField({
      name: 'label',
      title: 'Label',
      description: 'The small line above the title.',
      type: 'string',
      validation: (rule) => rule.max(30),
    }),
    titleField,
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.max(300),
    }),
    defineField({ name: 'image', title: 'Image', type: 'accessibleImage' }),
    defineField({
      name: 'closingTitle',
      title: 'Closing title',
      type: 'string',
      validation: (rule) => rule.max(50),
    }),
    defineField({
      name: 'closingText',
      title: 'Closing text',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(140),
    }),
    defineField({ name: 'cta', title: 'Closing button', type: 'cta' }),
    seoField,
  ],
})
