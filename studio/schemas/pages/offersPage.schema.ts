import { PackageIcon } from '@sanity/icons/Package'
import { defineField, defineType } from 'sanity'

import { languageField, referenceListField, seoField, titleField } from '../fields'

export const offersPageSchema = defineType({
  name: 'offersPage',
  title: 'Offers',
  type: 'document',
  icon: PackageIcon,
  fields: [
    languageField,
    titleField,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    {
      ...referenceListField('order', 'Order', 'offer'),
      description: 'Offers listed here come first, in this order. The others follow by title.',
    },
    defineField({ name: 'cta', title: 'Button', type: 'cta' }),
    seoField,
  ],
})
