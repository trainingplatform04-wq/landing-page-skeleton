import { HomeIcon } from '@sanity/icons/Home'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { languageField, referenceListField, seoField, toggleField } from '../fields'

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
    // The visible heading is the hero's; this title only names the page in the browser tab.
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      group: 'seo',
      description: 'Shown in the browser tab and in search results, not on the page.',
      validation: (rule) => rule.required(),
    }),
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
    {
      ...referenceListField({
        name: 'featuredOffers',
        title: 'Featured offers',
        to: 'offer',
        max: 3,
      }),
      group: 'sections',
    },
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
    {
      ...referenceListField({ name: 'testimonials', title: 'Testimonials', to: 'testimonial' }),
      group: 'sections',
    },
    { ...toggleField('showFaq', 'Show questions'), group: 'sections' },
    {
      ...referenceListField({ name: 'faq', title: 'Questions', to: 'faqItem', max: 5 }),
      group: 'sections',
    },
    defineField({ name: 'closing', title: 'Closing', type: 'closing', group: 'sections' }),
    { ...seoField, group: 'seo' },
  ],
})
