import { TagsIcon } from '@sanity/icons/Tags'
import { defineField, defineType } from 'sanity'

import { isUniqueInTypeAndLanguage, matchesTranslations } from '../../utils/slug/slug.utils'
import { languageField, titleField } from '../fields'

/** A magazine category: a tab on the magazine page (`?category=<slug>`). */
export const categorySchema = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagsIcon,
  fields: [
    languageField,
    titleField,
    // Not generated from the title and copied to new translations: one value for every language.
    defineField({
      name: 'slug',
      title: 'Address key',
      type: 'slug',
      description:
        'The same in every language (e.g. "nutrition"): it identifies the category in the address (?category=…), so the German and English pages link to each other.',
      options: { maxLength: 48, isUnique: isUniqueInTypeAndLanguage },
      validation: (rule) =>
        rule.required().custom((slug, context) => matchesTranslations(slug, context)),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Tabs are shown from the lowest number to the highest.',
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(0),
      options: { documentInternationalization: { exclude: true } },
    }),
  ],
  preview: {
    select: { title: 'title', language: 'language', order: 'order' },
    prepare: ({ title, language, order }) => ({
      title,
      subtitle: [language?.toUpperCase(), order].filter((part) => part != null).join(' · '),
    }),
  },
})
