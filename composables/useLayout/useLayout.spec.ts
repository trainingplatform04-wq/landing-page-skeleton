import { describe, expect, it } from 'vitest'

import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useLayout } from './useLayout'

describe('useLayout', () => {
  it('builds the header in the active language, from the code alone', async () => {
    const view = await mountComposable(async () => useLayout(), { route: '/en' })

    expect(view.value.homePath).toBe('/en')
    expect(view.value.navigation).toEqual([
      { label: 'Offers', to: '/en/offers' },
      { label: 'Magazine', to: '/en/magazine' },
      { label: 'FAQ', to: '/en/faq' },
      { label: 'Contact', to: '/en/contact' },
    ])
  })
})
