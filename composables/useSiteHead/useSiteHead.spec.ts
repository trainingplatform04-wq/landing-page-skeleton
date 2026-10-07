import { describe, expect, it } from 'vitest'

import { mountComposable } from '~~/tests/helpers/mountComposable'
import { renderedHead } from '~~/tests/helpers/renderedHead'

import { useSiteHead } from './useSiteHead'

describe('useSiteHead', () => {
  it('adds the site name to every page title and sets the Open Graph defaults', async () => {
    await mountComposable(async () => {
      useSiteHead()
      useSeoMeta({ title: 'Offers' })
    })
    const head = await renderedHead()
    const siteName = useSiteConfig().name

    expect(head.title).toBe(`Offers · ${siteName}`)
    expect(head.property('og:site_name')).toBe(siteName)
    expect(head.property('og:type')).toBe('website')
  })
})
