import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thrownBy } from '~~/tests/helpers/cmsComposable'
import { cta, noSeo } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { magazineRange, useMagazine } from './useMagazine'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const page = {
  kicker: 'Magazine',
  title: 'Know-how that moves you forward.',
  intro: 'Articles from our coaches.',
  closingTitle: 'Ready?',
  closingText: 'Your first session is free.',
  cta: cta('Request a free trial', 'contact'),
  seo: noSeo,
}

const categories = [
  { title: 'Training', slug: 'training' },
  { title: 'Nutrition', slug: 'nutrition' },
]

const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ')

const post = (index: number) => ({
  id: `p${index}`,
  title: `Article ${index}`,
  slug: `article-${index}`,
  excerpt: `Excerpt ${index}`,
  publishedAt: '2026-09-27T23:30:00Z',
  cover: null,
  category: 'Training',
  author: { name: 'Lena Hoffmann', photo: null },
  words: [{ text: null, children: [{ text: words(250) }] }],
})

const posts = (count: number) => Array.from({ length: count }, (_, index) => post(index + 1))

describe('useMagazine', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('opens "All" with the 3 newest articles, then the grid', async () => {
    fetchMock.mockResolvedValue({ page, categories, total: 5, posts: posts(5) })
    const view = await mountComposable(useMagazine, { route: '/en/magazine' })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      locale: 'en',
      category: '',
      start: 0,
      end: 12,
    })
    expect(view.featured.map(({ id }) => id)).toEqual(['p1', 'p2', 'p3'])
    expect(view.posts.map(({ id }) => id)).toEqual(['p4', 'p5'])
    expect(view.pages).toEqual([])
    expect(view.closing).toEqual({
      title: 'Ready?',
      text: 'Your first session is free.',
      cta: { label: 'Request a free trial', to: '/en/contact', external: false },
    })
  })

  it('writes each card ready to show: link, date in Berlin, reading time', async () => {
    fetchMock.mockResolvedValue({ page, categories, total: 1, posts: posts(1) })
    const view = await mountComposable(useMagazine, { route: '/en/magazine' })

    expect(view.featured[0]).toEqual({
      id: 'p1',
      title: 'Article 1',
      excerpt: 'Excerpt 1',
      to: '/en/magazine/article-1',
      category: 'Training',
      image: undefined,
      author: { name: 'Lena Hoffmann', photo: undefined },
      date: '28 Sep 2026',
      dateTime: '2026-09-27T23:30:00Z',
      readingTime: '2 min read',
    })
  })

  it('filters by the category of the German URL and hides the featured block', async () => {
    fetchMock.mockResolvedValue({ page, categories, total: 2, posts: posts(2) })
    const view = await mountComposable(useMagazine, { route: '/magazin?category=training' })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      locale: 'de',
      category: 'training',
      start: 0,
      end: 9,
    })
    expect(view.featured).toEqual([])
    expect(view.posts).toHaveLength(2)
    expect(view.tabs).toEqual([
      { label: 'Alle', to: '/magazin', active: false },
      { label: 'Training', to: '/magazin?category=training', active: true },
      { label: 'Nutrition', to: '/magazin?category=nutrition', active: false },
    ])
  })

  it('links every page when the articles fill more than one', async () => {
    fetchMock.mockResolvedValue({ page, categories, total: 25, posts: posts(9) })
    const view = await mountComposable(useMagazine, { route: '/en/magazine?page=2' })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ start: 12, end: 21 }),
    )
    expect(view.featured).toEqual([])
    expect(view.page).toBe(2)
    expect(view.pages).toEqual(['/en/magazine', '/en/magazine?page=2', '/en/magazine?page=3'])
  })

  it('lists the articles on an empty page while the page is unpublished', async () => {
    fetchMock.mockResolvedValue({ page: null, categories: [], total: 1, posts: posts(1) })
    const view = await mountComposable(useMagazine, { route: '/magazin' })

    expect(view.seo).toEqual({ title: 'Magazin', noIndex: true })
    expect(view.title).toBe('Magazin')
    expect(view.closing).toBeUndefined()
    expect(view.featured).toHaveLength(1)
  })

  it('is a 404 for an unknown category', async () => {
    fetchMock.mockResolvedValue({ page, categories, total: 0, posts: [] })

    expect(await thrownBy(useMagazine, '/en/magazine?category=yoga')).toMatchObject({ status: 404 })
  })

  it('is a 404 for a page past the last one', async () => {
    fetchMock.mockResolvedValue({ page, categories, total: 5, posts: [] })

    expect(await thrownBy(useMagazine, '/en/magazine?page=3')).toMatchObject({
      status: 404,
    })
  })

  it('is a 404 for a page parameter that is not a page of its own', async () => {
    fetchMock.mockResolvedValue({ page, categories, total: 30, posts: [] })

    for (const value of ['1', '0', 'abc', '02', '2.0', '2e0']) {
      expect(await thrownBy(useMagazine, `/en/magazine?page=${value}`)).toMatchObject({
        status: 404,
      })
    }
  })

  it('keeps an empty magazine on its first page, without the link back', async () => {
    fetchMock.mockResolvedValue({ page, categories, total: 0, posts: [] })
    const view = await mountComposable(useMagazine, { route: '/en/magazine' })

    expect(view.posts).toEqual([])
    expect(view.filtered).toBe(false)
  })

  it('leaves out a closing that has only a text', async () => {
    fetchMock.mockResolvedValue({
      page: { ...page, closingTitle: null, cta: null },
      categories,
      total: 0,
      posts: [],
    })
    const view = await mountComposable(useMagazine, { route: '/en/magazine' })

    expect(view.closing).toBeUndefined()
  })

  it('is a 503 when the CMS fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))

    expect(await thrownBy(useMagazine)).toMatchObject({ status: 503 })
  })
})

describe('magazineRange', () => {
  it('fetches the featured articles with the first page of "All" only', () => {
    expect(magazineRange(1, '')).toEqual({ start: 0, end: 12 })
    expect(magazineRange(3, '')).toEqual({ start: 21, end: 30 })
    expect(magazineRange(2, 'training')).toEqual({ start: 9, end: 18 })
  })
})
