import { CommentIcon } from '@sanity/icons/Comment'
import { defineField, defineType } from 'sanity'

import { languageField } from '../fields'

export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  fields: [
    languageField,
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'photo', title: 'Photo', type: 'accessibleImage' }),
    defineField({
      name: 'consentConfirmed',
      title: 'The client agreed to publication',
      type: 'boolean',
      description: 'Only genuine testimonials published with consent (German law).',
      initialValue: false,
      validation: (rule) =>
        rule.custom((confirmed) => (confirmed ? true : 'Confirm the client agreed')),
    }),
  ],
  preview: { select: { title: 'author', subtitle: 'quote', media: 'photo' } },
})
