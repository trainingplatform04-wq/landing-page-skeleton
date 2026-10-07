import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineField, defineType } from 'sanity'

import { languageField, seoField, titleField } from '../fields'

/** The form's fields live in code; address, email and phone come from the business profile. */
export const contactPageSchema = defineType({
  name: 'contactPage',
  title: 'Contact',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    languageField,
    titleField,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    defineField({
      name: 'successText',
      title: 'Message after sending the form',
      description: 'Optional: a standard thank-you message is shown otherwise.',
      type: 'string',
    }),
    seoField,
  ],
})
