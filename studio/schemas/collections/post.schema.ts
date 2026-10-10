import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineField, defineType } from 'sanity'

import { languageField, sameLanguageFilter, seoField, slugField, titleField } from '../fields'

/** A magazine article: listed on `/magazin`, newest first. */
export const postSchema = defineType({
  name: 'post',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    languageField,
    titleField,
    slugField,
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Shown on the article cards.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({ name: 'cover', title: 'Cover image', type: 'accessibleImage' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      weak: true,
      options: { filter: sameLanguageFilter, documentInternationalization: { exclude: true } },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      weak: true,
      options: { filter: sameLanguageFilter, documentInternationalization: { exclude: true } },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published on',
      type: 'datetime',
      description: 'Articles are listed by this date, newest first.',
      validation: (rule) => rule.required(),
      options: { documentInternationalization: { exclude: true } },
    }),
    defineField({ name: 'body', title: 'Text', type: 'articleBody' }),
    seoField,
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', language: 'language', date: 'publishedAt', media: 'cover' },
    prepare: ({ title, language, date, media }) => ({
      title,
      media,
      subtitle: [language?.toUpperCase(), date?.slice(0, 10)].filter(Boolean).join(' · '),
    }),
  },
})
