import { PackageIcon } from '@sanity/icons/Package'
import { defineField, defineType } from 'sanity'

import { introField, languageField, referenceListField, seoField, titleField } from '../fields'

/** The list of every offer of its language; the offers are edited under "Offers". */
export const offersPageSchema = defineType({
  name: 'offersPage',
  title: 'Offers',
  type: 'document',
  icon: PackageIcon,
  fields: [
    languageField,
    titleField,
    introField,
    referenceListField({
      name: 'order',
      title: 'Order',
      to: 'offer',
      description: 'Offers listed here come first, in this order. The others follow by title.',
    }),
    defineField({ name: 'cta', title: 'Button', type: 'cta' }),
    seoField,
  ],
})
