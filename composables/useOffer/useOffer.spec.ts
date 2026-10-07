import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thrownBy } from '~~/tests/helpers/cmsComposable'
import { noSeo, text } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useOffer } from './useOffer'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const offer = {
  title: 'Personal coaching',
  summary: 'One to one.',
  image: null,
  body: text('Start slowly.'),
  price: 60,
  cta: null,
  seo: noSeo,
  translations: [
    { language: 'de', slug: 'personal-training' },
    { language: 'en', slug: 'personal-coaching' },
  ],
}

describe('useOffer', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('requests the offer by slug in the active language', async () => {
    fetchMock.mockResolvedValue(offer)
    const view = await mountComposable(useOffer, { route: '/en/offers/personal-coaching' })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      locale: 'en',
      slug: 'personal-coaching',
    })
    expect(view).toMatchObject({
      title: 'Personal coaching',
      price: '€60.00',
      seo: { title: 'Personal coaching', description: 'One to one.', noIndex: false },
    })
  })

  it('gives the slug of every translation to the language switcher', async () => {
    fetchMock.mockResolvedValue(offer)
    const view = await mountComposable(useOffer, { route: '/en/offers/personal-coaching' })

    expect(view.slugs).toEqual({
      de: { slug: 'personal-training' },
      en: { slug: 'personal-coaching' },
    })
  })

  it('treats an offer without translations as existing in its own language only', async () => {
    fetchMock.mockResolvedValue({ ...offer, translations: null })
    const view = await mountComposable(useOffer, { route: '/angebote/online-coaching' })

    expect(view.slugs).toEqual({ de: { slug: 'online-coaching' } })
  })

  it('is a 404 for an unknown slug and a 503 when the CMS fails', async () => {
    fetchMock.mockResolvedValueOnce(null)
    expect(await thrownBy(useOffer, '/en/offers/nope')).toMatchObject({ status: 404 })

    clearNuxtData()
    fetchMock.mockRejectedValueOnce(new Error('Network failure'))
    expect(await thrownBy(useOffer, '/angebote/x')).toMatchObject({ status: 503 })
  })
})
