import { describe, expect, it } from 'vitest'

import type { MapContext } from '~/utils/content/content.utils'

import { headingIds, relatedPosts, toPostCard } from './post.utils'

const context: MapContext = {
  locale: 'en',
  language: 'en-US',
  localePath: (route) =>
    typeof route === 'string' ? `/en/${route}` : `/en/${route.name}/${route.params.slug}`,
}

const post = (id: string, categorySlug: string | null) => ({ id, categorySlug })

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

describe('relatedPosts', () => {
  const posts = [
    post('a', 'training'),
    post('b', 'nutrition'),
    post('current', 'nutrition'),
    post('c', 'mindset'),
    post('d', 'nutrition'),
  ]

  it('puts the same category first, keeps the order, and never the current article', () => {
    const related = relatedPosts(post('current', 'nutrition'), posts, 3)

    expect(related.map(({ id }) => id)).toEqual(['b', 'd', 'a'])
  })

  it('takes the newest others when the article has no category', () => {
    expect(relatedPosts(post('x', null), posts, 2).map(({ id }) => id)).toEqual(['a', 'b'])
  })
})

describe('toPostCard', () => {
  it('links the article page and words the date and the reading time', () => {
    const card = toPostCard(
      {
        id: 'p1',
        title: 'Protein without powder',
        slug: 'protein-without-powder',
        excerpt: 'Five meals.',
        publishedAt: '2026-09-21T06:00:00Z',
        cover: null,
        category: 'Nutrition',
        categorySlug: 'nutrition',
        author: { name: 'Jonas Weber', photo: null },
        words: [{ text: null, children: [{ text: 'one two three' }] }],
      },
      context,
      (minutes) => `${minutes} min read`,
    )

    expect(card).toMatchObject({
      to: '/en/magazine-slug/protein-without-powder',
      category: 'Nutrition',
      date: '21 Sep 2026',
      readingTime: '1 min read',
      author: { name: 'Jonas Weber' },
    })
  })
})
