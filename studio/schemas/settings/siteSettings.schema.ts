import { CogIcon } from '@sanity/icons/Cog'
import { defineField, defineType } from 'sanity'

import { languageField } from '../fields'

/** Site-wide text in one language. Business facts live in the business profile. */
export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    languageField,
    defineField({ name: 'footerNote', title: 'Footer note', type: 'string' }),
  ],
  preview: {
    select: { language: 'language' },
    prepare: ({ language }) => ({ title: 'Site settings', subtitle: language?.toUpperCase() }),
  },
})
