import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thrownBy } from '~~/tests/helpers/cmsComposable'
import { cta, noSeo } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useArticle } from './useArticle'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const block = (key: string, text: string, style = 'normal') => ({
  _type: 'block',
  _key: key,
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
})

const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ')

const card = (id: string, categorySlug: string) => ({
  id,
  title: `Article ${id}`,
  slug: `article-${id}`,
  excerpt: `Excerpt ${id}`,
  publishedAt: '2026-09-01T06:00:00Z',
  cover: null,
  category: categorySlug,
  categorySlug,
  author: null,
  words: null,
})

const post = {
  id: 'post-protein-en',
  title: 'Protein without powder',
  excerpt: 'Five meals ready in 15 minutes.',
  publishedAt: '2026-09-21T06:00:00Z',
  cover: { alt: 'A bowl', url: 'https://cdn.sanity.io/cover.jpg' },
  category: { title: 'Nutrition', slug: 'nutrition' },
  author: { name: 'Jonas Weber', role: 'Nutrition coach', bio: 'Food that fits.', photo: null },
  keyTakeaways: ['About 1.6 g per kilo.'],
  faq: [{ question: 'Is powder bad?', answer: 'No.' }],
  body: [
    block('b0', 'Intro.'),
    block('b1', 'How much protein you need', 'h2'),
    { _type: 'coachTip', _key: 'b2', text: 'Cook twice.' },
    block('b3', 'Your shopping list', 'h2'),
  ],
  words: [{ text: null, children: [{ text: words(350) }] }],
  seo: noSeo,
  translations: [
    { language: 'de', slug: 'protein-ohne-pulver' },
    { language: 'en', slug: 'protein-without-powder' },
  ],
}

const answer = {
  post,
  others: [card('a', 'training'), card('b', 'nutrition'), card('c', 'mindset')],
  closing: {
    title: 'Ready?',
    text: 'Your first session is free.',
    cta: cta('Request a free trial', 'contact'),
  },
}

describe('useArticle', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('requests the article by slug in the active language', async () => {
    fetchMock.mockResolvedValue(answer)
    const view = await mountComposable(useArticle, {
      route: '/en/magazine/protein-without-powder',
    })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      locale: 'en',
      slug: 'protein-without-powder',
    })
    expect(view).toMatchObject({
      title: 'Protein without powder',
      magazineTo: '/en/magazine',
      category: { title: 'Nutrition', to: '/en/magazine?category=nutrition' },
      author: { name: 'Jonas Weber', firstName: 'Jonas', role: 'Nutrition coach' },
      date: '21 Sep 2026',
      readingTime: '2 min read',
      cover: { url: 'https://cdn.sanity.io/cover.jpg', alt: 'A bowl' },
      takeaways: ['About 1.6 g per kilo.'],
      faq: [{ question: 'Is powder bad?', answer: 'No.' }],
      closing: { title: 'Ready?', cta: { label: 'Request a free trial', to: '/en/contact' } },
      seo: {
        title: 'Protein without powder',
        description: 'Five meals ready in 15 minutes.',
        image: 'https://cdn.sanity.io/cover.jpg',
      },
    })
  })

  it('lists the H2s for the table of contents and puts their ids on the text', async () => {
    fetchMock.mockResolvedValue(answer)
    const view = await mountComposable(useArticle, {
      route: '/en/magazine/protein-without-powder',
    })

    expect(view.toc).toEqual([
      { id: 'how-much-protein-you-need', text: 'How much protein you need' },
      { id: 'your-shopping-list', text: 'Your shopping list' },
    ])
    expect(view.body[1]).toMatchObject({ anchor: 'how-much-protein-you-need' })
    expect(view.body[0]).not.toHaveProperty('anchor')
  })

  it('suggests the same category first in "Keep reading", up to 3', async () => {
    fetchMock.mockResolvedValue(answer)
    const view = await mountComposable(useArticle, {
      route: '/en/magazine/protein-without-powder',
    })

    expect(view.related.map(({ title }) => title)).toEqual(['Article b', 'Article a', 'Article c'])
    expect(view.related[0]?.to).toBe('/en/magazine/article-b')
  })

  it('gives the slug of every translation to the language switcher', async () => {
    fetchMock.mockResolvedValue(answer)
    const view = await mountComposable(useArticle, {
      route: '/en/magazine/protein-without-powder',
    })

    expect(view.slugs).toEqual({
      de: { slug: 'protein-ohne-pulver' },
      en: { slug: 'protein-without-powder' },
    })
  })

  it('leaves out what the editor left empty', async () => {
    fetchMock.mockResolvedValue({
      ...answer,
      post: {
        ...post,
        category: null,
        author: null,
        cover: null,
        keyTakeaways: null,
        faq: null,
        translations: null,
      },
      closing: null,
    })
    const view = await mountComposable(useArticle, { route: '/magazin/nur-deutsch' })

    expect(view).toMatchObject({ takeaways: [], faq: [], slugs: { de: { slug: 'nur-deutsch' } } })
    expect(view.category).toBeUndefined()
    expect(view.author).toBeUndefined()
    expect(view.closing).toBeUndefined()
  })

  it('is a 404 for an unknown slug and a 503 when the CMS fails', async () => {
    fetchMock.mockResolvedValueOnce({ ...answer, post: null })
    expect(await thrownBy(useArticle, '/en/magazine/nope')).toMatchObject({ status: 404 })

    clearNuxtData()
    fetchMock.mockRejectedValueOnce(new Error('Network failure'))
    expect(await thrownBy(useArticle, '/magazin/x')).toMatchObject({ status: 503 })
  })
})
