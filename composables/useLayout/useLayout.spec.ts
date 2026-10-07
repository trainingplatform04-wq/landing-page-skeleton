import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { business } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useLayout } from './useLayout'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const layout = { footerNote: 'Made in Berlin.', business }

describe('useLayout', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('builds the header and footer in the active language', async () => {
    fetchMock.mockResolvedValue(layout)
    const view = await mountComposable(useLayout, { route: '/en' })

    expect(view.value.homePath).toBe('/en')
    expect(view.value.navigation).toEqual([
      { label: 'Offers', to: '/en/offers' },
      { label: 'FAQ', to: '/en/faq' },
      { label: 'Contact', to: '/en/contact' },
    ])
    expect(view.value.footer).toMatchObject({
      note: 'Made in Berlin.',
      business: { name: 'Landing Page' },
      legalLinks: { imprint: '/en/imprint', privacy: '/en/privacy' },
    })
    expect(view.value.localBusiness).toMatchObject({ name: 'Landing Page' })
  })

  it('never throws: on a CMS error the frame shows what the code knows', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))
    const view = await mountComposable(useLayout, { route: '/en' })

    expect(view.value.footer).toMatchObject({
      note: undefined,
      business: undefined,
      legalLinks: { imprint: '/en/imprint', privacy: '/en/privacy' },
    })
    expect(view.value.navigation).toHaveLength(3)
  })
})
