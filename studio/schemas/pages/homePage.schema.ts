import { HomeIcon } from '@sanity/icons/Home'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { languageField, referenceListField, seoField, titleField, toggleField } from '../fields'

/** The landing page, top to bottom. Every section after the hero is optional. */
export const homePageSchema = defineType({
  name: 'homePage',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'sections', title: 'Sections' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    languageField,
    { ...titleField, group: 'seo', description: 'Used in the browser tab and search results.' },
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'title',
          title: 'Headline',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
        defineField({ name: 'image', title: 'Image', type: 'accessibleImage' }),
        defineField({ name: 'cta', title: 'Button', type: 'cta' }),
      ],
      validation: (rule) => rule.required(),
    }),
    { ...toggleField('showOffers', 'Show featured offers'), group: 'sections' },
    { ...referenceListField('featuredOffers', 'Featured offers', 'offer', 3), group: 'sections' },
    defineField({
      name: 'about',
      title: 'About',
      type: 'object',
      group: 'sections',
      options: { collapsible: true },
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'portrait', title: 'Portrait', type: 'accessibleImage' }),
        defineField({ name: 'body', title: 'Text', type: 'richText' }),
        defineField({
          name: 'highlights',
          title: 'Highlights',
          description: 'Short points, e.g. qualifications.',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
        }),
      ],
    }),
    { ...toggleField('showTestimonials', 'Show testimonials'), group: 'sections' },
    { ...referenceListField('testimonials', 'Testimonials', 'testimonial'), group: 'sections' },
    { ...toggleField('showFaq', 'Show FAQ'), group: 'sections' },
    { ...referenceListField('faq', 'FAQ', 'faqItem', 5), group: 'sections' },
    defineField({
      name: 'closing',
      title: 'Closing call to action',
      type: 'object',
      group: 'sections',
      options: { collapsible: true },
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
        defineField({ name: 'cta', title: 'Button', type: 'cta' }),
      ],
    }),
    { ...seoField, group: 'seo' },
  ],
})
