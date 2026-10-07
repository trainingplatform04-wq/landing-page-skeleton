import { defineArrayMember, defineType } from 'sanity'

/** Body text: paragraphs, two heading levels, lists, emphasis, links and images. No layout. */
export const richTextSchema = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h2' },
        { title: 'Subheading', value: 'h3' },
      ],
      lists: [
        { title: 'Bullets', value: 'bullet' },
        { title: 'Numbers', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [defineArrayMember({ type: 'link' })],
      },
    }),
    defineArrayMember({ type: 'accessibleImage' }),
  ],
})
