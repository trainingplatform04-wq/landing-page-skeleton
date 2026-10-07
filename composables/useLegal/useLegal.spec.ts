import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thrownBy } from '~~/tests/helpers/cmsComposable'
import { noSeo, text } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useLegal } from './useLegal'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

describe('useLegal', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('returns the imprint of the active language with its date formatted', async () => {
    fetchMock.mockResolvedValue({
      title: 'Impressum',
      body: text('Angaben gemäß § 5 DDG'),
      updatedAt: '2026-09-01',
      seo: noSeo,
    })
    const view = await mountComposable(() => useLegal('imprintPage'), { route: '/impressum' })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      locale: 'de',
      type: 'imprintPage',
    })
    expect(view).toMatchObject({ title: 'Impressum', updatedAt: '1. September 2026' })
  })

  it('is an empty page, hidden from search engines, while unpublished', async () => {
    fetchMock.mockResolvedValue(null)
    const view = await mountComposable(() => useLegal('privacyPage'), { route: '/en/privacy' })

    expect(view).toEqual({ seo: { title: 'Privacy', noIndex: true }, title: 'Privacy', body: [] })
  })

  it('is a 503 when the CMS fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))

    expect(await thrownBy(() => useLegal('privacyPage'))).toMatchObject({ status: 503 })
  })
})
