import { UnknownIcon } from '@sanity/icons/Unknown'
import { defineField, defineType } from 'sanity'

import { languageField } from '../fields'

/** One question and its answer: listed on the FAQ page, picked for the home page. */
export const faqItemSchema = defineType({
  name: 'faqItem',
  title: 'Question',
  type: 'document',
  icon: UnknownIcon,
  fields: [
    languageField,
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'richText',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'question', subtitle: 'language' } },
})
