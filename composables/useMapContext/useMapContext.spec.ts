import { describe, expect, it } from 'vitest'

import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useMapContext } from './useMapContext'

describe('useMapContext', () => {
  it("gives the mappers the visitor's language", async () => {
    const context = await mountComposable(async () => useMapContext(), { route: '/en' })

    expect(context.locale).toBe('en')
    expect(context.language).toBe('en-US')
    expect(context.localePath('contact')).toBe('/en/contact')
  })
})
