import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thrownBy } from '~~/tests/helpers/cmsComposable'
import { cta, noSeo, offerCard, text } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useHome } from './useHome'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const home = {
  title: 'Home',
  hero: {
    title: 'Train smarter',
    text: 'Personal coaching.',
    image: null,
    cta: cta('See the offers', 'offers'),
  },
  showOffers: true,
  featuredOffers: [offerCard('o1', 'Yoga', 'yoga')],
  about: {
    title: 'About me',
    portrait: { alt: 'Portrait', url: 'https://cdn/me.jpg' },
    body: text('Coach since 2010.'),
    highlights: ['Certified trainer'],
  },
  showTestimonials: true,
  testimonials: [{ id: 't1', quote: 'Great.', author: 'Anna', photo: null }],
  showFaq: true,
  faq: [{ id: 'f1', question: 'Trial session?', answer: text('Yes.') }],
  closing: { title: 'Ready?', text: null, cta: cta('Write to us', 'contact') },
  seo: noSeo,
}

const empty = { title: null, portrait: null, body: null, highlights: null }

describe('useHome', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('returns every section of the home page, in the active language', async () => {
    fetchMock.mockResolvedValue(home)
    const view = await mountComposable(useHome, { route: '/en' })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { locale: 'en' })
    expect(view.hero).toEqual({
      title: 'Train smarter',
      text: 'Personal coaching.',
      image: undefined,
      cta: { label: 'See the offers', to: '/en/offers', external: false },
    })
    expect(view.offers.map(({ to }) => to)).toEqual(['/en/offers/yoga'])
    expect(view.about).toMatchObject({
      title: 'About me',
      portrait: { url: 'https://cdn/me.jpg', alt: 'Portrait' },
      highlights: ['Certified trainer'],
    })
    expect(view.testimonials).toEqual([
      { id: 't1', quote: 'Great.', author: 'Anna', photo: undefined },
    ])
    expect(view.faq.map(({ question }) => question)).toEqual(['Trial session?'])
    expect(view.closing).toEqual({
      title: 'Ready?',
      text: undefined,
      cta: { label: 'Write to us', to: '/en/contact', external: false },
    })
    expect(view.seo).toMatchObject({ title: 'Home', description: 'Personal coaching.' })
  })

  it('leaves out the sections the editor switched off or left empty', async () => {
    fetchMock.mockResolvedValue({
      ...home,
      showOffers: false,
      showTestimonials: false,
      showFaq: false,
      about: empty,
      closing: { title: null, text: null, cta: null },
    })
    const view = await mountComposable(useHome)

    expect(view.offers).toEqual([])
    expect(view.testimonials).toEqual([])
    expect(view.faq).toEqual([])
    expect(view.about).toBeUndefined()
    expect(view.closing).toBeUndefined()
  })

  it('drops a button the editor left half filled in', async () => {
    fetchMock.mockResolvedValue({
      ...home,
      hero: { ...home.hero, cta: { label: 'Go', link: null } },
    })
    const view = await mountComposable(useHome)

    expect(view.hero.cta).toBeUndefined()
  })

  it('is an empty page, hidden from search engines, while nothing is published', async () => {
    fetchMock.mockResolvedValue(null)
    const view = await mountComposable(useHome, { route: '/en' })

    expect(view).toEqual({
      seo: { title: 'Home', noIndex: true },
      hero: { title: useSiteConfig().name },
      offers: [],
      testimonials: [],
      faq: [],
    })
  })

  it('is a 503 when the CMS fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))

    expect(await thrownBy(useHome)).toMatchObject({ status: 503 })
  })
})
