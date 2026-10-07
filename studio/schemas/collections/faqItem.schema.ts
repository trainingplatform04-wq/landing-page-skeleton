import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { defineField, defineType } from 'sanity'

import { languageField } from '../fields'

export const faqItemSchema = defineType({
  name: 'faqItem',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
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
