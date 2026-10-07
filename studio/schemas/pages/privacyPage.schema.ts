import { LockIcon } from '@sanity/icons/Lock'
import { defineField, defineType } from 'sanity'

import { languageField, seoField, titleField } from '../fields'

/** Legally required (GDPR art. 13): names every service the site uses, the form service included. */
export const privacyPageSchema = defineType({
  name: 'privacyPage',
  title: 'Privacy',
  type: 'document',
  icon: LockIcon,
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
