import { describe, expect, it } from 'vitest'

import type { MapContext } from '~/utils/content/content.utils'

import { headingIds, toAuthor, toCategoryLink, toPostCard, withHeadingAnchors } from './post.utils'

const context: MapContext = {
  locale: 'en',
  language: 'en-US',
  localePath: (route) =>
    typeof route === 'string' ? `/en/${route}` : `/en/${route.name}/${route.params.slug}`,
}

const block = (key: string, text: string, style = 'normal') => ({
  _type: 'block',
  _key: key,
  style,
  children: [{ _type: 'span', text }],
})

describe('headingIds', () => {
  it('turns headings into lowercase ids without accents', () => {
    expect(headingIds(['Fünf Mahlzeiten in 15 Minuten', 'How much protein you need?'])).toEqual([
      'funf-mahlzeiten-in-15-minuten',
      'how-much-protein-you-need',
    ])
  })

  it('numbers repeated headings and names an empty one', () => {
    expect(headingIds(['Tips', 'Tips', '!!!'])).toEqual(['tips', 'tips-2', 'section'])
  })
})

describe('withHeadingAnchors', () => {
  it('lists the H2s for the table of contents and puts their ids on the text', () => {
    const { body, toc } = withHeadingAnchors([
      block('b0', 'Intro.'),
      block('b1', 'How much', 'h2'),
      block('b2', 'Detail', 'h3'),
      block('b3', 'How much', 'h2'),
    ])

    expect(toc).toEqual([
      { id: 'how-much', text: 'How much' },
      { id: 'how-much-2', text: 'How much' },
    ])
    expect(body[1]).toMatchObject({ anchor: 'how-much' })
    expect(body[3]).toMatchObject({ anchor: 'how-much-2' })
    expect(body[0]).not.toHaveProperty('anchor')
  })
})

describe('toPostCard', () => {
  it('links the article page and gives the date and the reading time', () => {
    const card = toPostCard(
      {
        id: 'p1',
        title: 'Protein without powder',
        slug: 'protein-without-powder',
        excerpt: 'Five meals.',
        publishedAt: '2026-09-21T06:00:00Z',
        cover: null,
        category: 'Nutrition',
        author: { name: 'Jonas Weber', photo: null },
        words: 3,
      },
      context,
    )

    expect(card).toMatchObject({
      to: '/en/magazine-slug/protein-without-powder',
      category: 'Nutrition',
      date: '21 Sep 2026',
      readingMinutes: 1,
      author: { name: 'Jonas Weber' },
    })
  })
})

describe('toAuthor', () => {
  it('gives the first name for "More from" and leaves out what is empty', () => {
    expect(toAuthor({ name: 'Lena Hoffmann', role: null, bio: null, photo: null })).toEqual({
      name: 'Lena Hoffmann',
      firstName: 'Lena',
      role: undefined,
      bio: undefined,
      photo: undefined,
    })
    expect(toAuthor(null)).toBeUndefined()
  })
})

describe('toCategoryLink', () => {
  it('links the magazine filtered by the category', () => {
    expect(toCategoryLink({ title: 'Nutrition', slug: 'nutrition' }, context)).toEqual({
      title: 'Nutrition',
      to: '/en/magazine?category=nutrition',
    })
    expect(toCategoryLink(null, context)).toBeUndefined()
  })
})
