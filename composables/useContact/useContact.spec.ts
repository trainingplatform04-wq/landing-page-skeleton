import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thrownBy } from '~~/tests/helpers/cmsComposable'
import { business, noSeo } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useContact } from './useContact'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

describe('useContact', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('returns the contact page and the business facts', async () => {
    fetchMock.mockResolvedValue({
      page: { title: 'Contact', intro: null, successText: 'Thanks!', seo: noSeo },
      business,
    })
    const view = await mountComposable(useContact, { route: '/en/contact' })

    expect(view).toMatchObject({
      title: 'Contact',
      successText: 'Thanks!',
      business: { name: 'Landing Page', email: 'hi@example.com', addressLines: [] },
    })
  })

  it('thanks the visitor with a standard message when the editor left it empty', async () => {
    fetchMock.mockResolvedValue({
      page: { title: 'Contact', intro: null, successText: null, seo: noSeo },
      business: null,
    })
    const view = await mountComposable(useContact, { route: '/en/contact' })

    expect(view.successText).toBe('Thank you! We will get back to you shortly.')
  })

  it('is an empty page, hidden from search engines, while unpublished', async () => {
    fetchMock.mockResolvedValue({ page: null, business: null })
    const view = await mountComposable(useContact, { route: '/kontakt' })

    expect(view).toMatchObject({ title: 'Kontakt', seo: { noIndex: true }, business: undefined })
    expect(view.successText).toBeTruthy()
  })

  it('is a 503 when the CMS fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))

    expect(await thrownBy(useContact)).toMatchObject({ status: 503 })
  })
})
