import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thrownBy } from '~~/tests/helpers/cmsComposable'
import { noSeo, text } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useFaq } from './useFaq'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const items = [{ id: 'f1', question: 'Trial session?', answer: text('Yes.') }]

describe('useFaq', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('lists every question of the active language', async () => {
    fetchMock.mockResolvedValue({ page: { title: 'FAQ', intro: 'Ask us.', seo: noSeo }, items })
    const view = await mountComposable(useFaq, { route: '/en/faq' })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { locale: 'en' })
    expect(view).toMatchObject({ title: 'FAQ', intro: 'Ask us.', items: [{ id: 'f1' }] })
  })

  it('lists the questions on an empty page while the page is unpublished', async () => {
    fetchMock.mockResolvedValue({ page: null, items })
    const view = await mountComposable(useFaq, { route: '/faq' })

    expect(view).toMatchObject({ title: 'FAQ', seo: { noIndex: true }, items: [{ id: 'f1' }] })
  })

  it('is a 503 when the CMS fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))

    expect(await thrownBy(useFaq)).toMatchObject({ status: 503 })
  })
})
