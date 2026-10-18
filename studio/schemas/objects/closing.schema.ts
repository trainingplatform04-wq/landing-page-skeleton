import { defineField, defineType } from 'sanity'

/** The band that ends a page. Shown with a title or a button; a text alone is not shown. */
export const closingSchema = defineType({
  name: 'closing',
  title: 'Closing call to action',
  type: 'object',
  options: { collapsible: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.max(50),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(140),
    }),
    defineField({ name: 'cta', title: 'Button', type: 'cta' }),
  ],
})
