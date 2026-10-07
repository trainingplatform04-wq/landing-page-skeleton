import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { defineField, defineType } from 'sanity'

import { languageField, seoField, titleField } from '../fields'

/** The FAQ page lists every FAQ item of its language; the items are edited under "FAQ". */
export const faqPageSchema = defineType({
  name: 'faqPage',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    languageField,
    titleField,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    seoField,
  ],
})
