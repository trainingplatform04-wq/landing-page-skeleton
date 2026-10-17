import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { defineType } from 'sanity'

import { introField, languageField, referenceListField, seoField, titleField } from '../fields'

/** The FAQ page lists every question of its language; they are edited under "Questions". */
export const faqPageSchema = defineType({
  name: 'faqPage',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    languageField,
    titleField,
    introField,
    referenceListField({
      name: 'order',
      title: 'Order',
      to: 'faqItem',
      description:
        'Questions listed here come first, in this order. The others follow, oldest first.',
    }),
    seoField,
  ],
})
