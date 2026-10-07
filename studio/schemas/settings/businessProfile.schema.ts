import { PinIcon } from '@sanity/icons/Pin'
import { defineArrayMember, defineField, defineType } from 'sanity'

const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'youtube', 'linkedin', 'tiktok']

/** The business facts, entered once for every language: footer, contact page, structured data. */
export const businessProfileSchema = defineType({
  name: 'businessProfile',
  title: 'Business profile',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'International format, e.g. +49 30 1234567.',
      validation: (rule) =>
        rule.custom((phone) =>
          !phone || /^[+0-9 ()/-]+$/.test(phone) ? true : 'Digits, spaces, + ( ) / - only',
        ),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        defineField({ name: 'street', title: 'Street', type: 'string' }),
        defineField({ name: 'postalCode', title: 'Postal code', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'country', title: 'Country code', type: 'string', initialValue: 'DE' }),
      ],
    }),
    defineField({
      name: 'socials',
      title: 'Social media',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: { list: SOCIAL_PLATFORMS },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Address',
              type: 'url',
              validation: (rule) => rule.required().uri({ scheme: ['https'] }),
            }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
  ],
})
