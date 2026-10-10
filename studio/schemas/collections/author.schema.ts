import { UserIcon } from '@sanity/icons/User'
import { defineField, defineType } from 'sanity'

import { languageField } from '../fields'

/** Who signs an article: the role and the bio are text, so an author exists per language. */
export const authorSchema = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    languageField,
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({ name: 'photo', title: 'Photo', type: 'accessibleImage' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})
