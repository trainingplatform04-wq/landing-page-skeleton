import { defineArrayMember, defineType } from 'sanity'

import { textBlock } from './textBlock.schema'

/** Body text: paragraphs, two heading levels, lists, emphasis, links and images. No layout. */
export const richTextSchema = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [textBlock, defineArrayMember({ type: 'accessibleImage' })],
})
