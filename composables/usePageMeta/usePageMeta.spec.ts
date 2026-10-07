import { describe, expect, it } from 'vitest'

import { mountComposable } from '~~/tests/helpers/mountComposable'
import { renderedHead } from '~~/tests/helpers/renderedHead'

import { usePageMeta } from './usePageMeta'

describe('usePageMeta', () => {
  it('writes the title, description and share image, mirrored to Open Graph', async () => {
    await mountComposable(async () =>
      usePageMeta({
        title: 'Offers',
        description: 'All offers.',
        image: 'https://cdn/share.jpg',
        noIndex: false,
      }),
    )
    const head = await renderedHead()

    expect(head.title).toContain('Offers')
    expect(head.property('og:title')).toBe('Offers')
    expect(head.meta('description')).toBe('All offers.')
    expect(head.property('og:image')).toBe('https://cdn/share.jpg')
    expect(head.meta('robots') ?? '').not.toContain('noindex')
  })

  it('hides a page from search engines on request', async () => {
    await mountComposable(async () => usePageMeta({ title: 'Hidden', noIndex: true }))

    expect((await renderedHead()).meta('robots')).toContain('noindex')
  })
})
