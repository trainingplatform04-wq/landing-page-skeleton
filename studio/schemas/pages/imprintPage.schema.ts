import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineField, defineType } from 'sanity'

import { languageField, seoField, titleField } from '../fields'

/** Legally required in Germany (§ 5 DDG): linked from every page footer. */
export const imprintPageSchema = defineType({
  name: 'imprintPage',
  title: 'Imprint',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    languageField,
    titleField,
    defineField({
      name: 'body',
      title: 'Text',
      type: 'richText',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'updatedAt', title: 'Last updated', type: 'date' }),
    seoField,
  ],
})
