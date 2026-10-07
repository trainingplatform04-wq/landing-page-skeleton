import { TagIcon } from '@sanity/icons/Tag'
import { defineField, defineType } from 'sanity'

import { languageField, seoField, slugField, titleField } from '../fields'

/** An offer: `/angebote/<slug>` in German, `/en/offers/<slug>` in English. */
export const offerSchema = defineType({
  name: 'offer',
  title: 'Offer',
  type: 'document',
  icon: TagIcon,
  fields: [
    languageField,
    titleField,
    slugField,
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Shown on the offer cards.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({ name: 'image', title: 'Image', type: 'accessibleImage' }),
    defineField({ name: 'body', title: 'Description', type: 'richText' }),
    defineField({
      name: 'price',
      title: 'Price (EUR, VAT included)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'cta',
      title: 'Button',
      type: 'cta',
      options: { documentInternationalization: { exclude: true } },
    }),
    seoField,
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', language: 'language', media: 'image' },
    prepare: ({ title, slug, language, media }) => ({
      title,
      media,
      subtitle: [language?.toUpperCase(), slug].filter(Boolean).join(' · '),
    }),
  },
})
