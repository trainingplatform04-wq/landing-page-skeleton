import { defineField, defineType } from 'sanity'

/** Image with alt text in the document's language: alt is required for accessibility. */
export const accessibleImageSchema = defineType({
  name: 'accessibleImage',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe the image for visitors who cannot see it.',
      validation: (rule) => rule.required(),
    }),
  ],
})
