import { BlockquoteIcon } from '@sanity/icons/Blockquote'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { ImageIcon } from '@sanity/icons/Image'
import { PlayIcon } from '@sanity/icons/Play'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { textBlock } from './textBlock.schema'

const coachTip = defineArrayMember({
  name: 'coachTip',
  title: 'Coach tip',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { subtitle: 'text' },
    prepare: ({ subtitle }) => ({ title: 'Coach tip', subtitle }),
  },
})

const pullQuote = defineArrayMember({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Quote',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'attribution', title: 'Said by', type: 'string' }),
  ],
  preview: { select: { title: 'text', subtitle: 'attribution' } },
})

const figure = defineArrayMember({
  name: 'figure',
  title: 'Image with caption',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'accessibleImage',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
  ],
  preview: { select: { title: 'caption', media: 'image' } },
})

const youtubeVideo = defineArrayMember({
  name: 'youtubeVideo',
  title: 'YouTube video',
  type: 'object',
  icon: PlayIcon,
  description: 'Loaded only after the visitor clicks it (privacy).',
  fields: [
    defineField({
      name: 'videoId',
      title: 'Video id',
      type: 'string',
      description: 'The part after "v=" in the YouTube address.',
      validation: (rule) => rule.required().regex(/^[\w-]{11}$/, { name: 'YouTube id' }),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'videoId' } },
})

/** An article's text: paragraphs and lists like the site's rich text, plus four magazine blocks. */
export const articleBodySchema = defineType({
  name: 'articleBody',
  title: 'Article text',
  type: 'array',
  of: [textBlock, coachTip, pullQuote, figure, youtubeVideo],
})
