import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { business } from '~~/tests/helpers/cmsData'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useFooter } from './useFooter'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

describe('useFooter', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('builds the footer and the business data in the active language', async () => {
    fetchMock.mockResolvedValue({ footerNote: 'Made in Berlin.', business })
    const view = await mountComposable(useFooter, { route: '/en' })

    expect(view.value.footer).toMatchObject({
      note: 'Made in Berlin.',
      business: { name: 'Landing Page' },
      legalLinks: { imprint: '/en/imprint', privacy: '/en/privacy' },
    })
    expect(view.value.localBusiness).toMatchObject({ name: 'Landing Page' })
  })

  it('never throws: on a CMS error the footer shows what the code knows', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))
    const view = await mountComposable(useFooter, { route: '/en' })

    expect(view.value.footer).toMatchObject({
      note: undefined,
      business: undefined,
      legalLinks: { imprint: '/en/imprint', privacy: '/en/privacy' },
    })
    expect(view.value.localBusiness).toBeUndefined()
  })
})
