import { defineArrayMember } from 'sanity'

/** A paragraph of formatted text: two heading levels, lists, bold, italic and links. */
export const textBlock = defineArrayMember({
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
})
