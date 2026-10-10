import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { business } from '~~/tests/helpers/cmsData'

import SiteFooter from './SiteFooter.vue'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

describe('SiteFooter', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('shows the CMS footer note and the legal links', async () => {
    fetchMock.mockResolvedValue({ footerNote: 'Made in Berlin.', business })
    const wrapper = await mountSuspended(SiteFooter, { route: '/en' })

    expect(wrapper.text()).toContain('Made in Berlin.')
    expect(wrapper.find('a[href="/en/imprint"]').exists()).toBe(true)
  })
})
