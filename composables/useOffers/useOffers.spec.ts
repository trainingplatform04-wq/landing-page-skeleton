import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thrownBy } from '~~/tests/helpers/cmsComposable'
import { noSeo, offerCard } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useOffers } from './useOffers'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const page = { title: 'Offers', intro: 'All we do.', cta: null, seo: noSeo }

describe('useOffers', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('lists the ordered offers first, then the others', async () => {
    fetchMock.mockResolvedValue({
      page,
      ordered: [offerCard('o2', 'Strength', 'strength')],
      others: [offerCard('o1', 'Yoga', 'yoga')],
    })
    const view = await mountComposable(useOffers, { route: '/en/offers' })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { locale: 'en' })
    expect(view.title).toBe('Offers')
    expect(view.intro).toBe('All we do.')
    expect(view.offers.map(({ title }) => title)).toEqual(['Strength', 'Yoga'])
  })

  it('lists the offers on an empty page while the page is unpublished', async () => {
    fetchMock.mockResolvedValue({
      page: null,
      ordered: null,
      others: [offerCard('o1', 'Yoga', 'yoga')],
    })
    const view = await mountComposable(useOffers, { route: '/angebote' })

    expect(view).toEqual({
      seo: { title: 'Angebote', noIndex: true },
      title: 'Angebote',
      offers: [expect.objectContaining({ to: '/angebote/yoga' })],
    })
  })

  it('is a 503 when the CMS fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))

    expect(await thrownBy(useOffers)).toMatchObject({ status: 503 })
  })
})
