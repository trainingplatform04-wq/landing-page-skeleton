import { describe, expect, it } from 'vitest'

import { formatPrice } from './price.utils'

describe('formatPrice', () => {
  it('formats euros for the locale with plain spaces', () => {
    expect(formatPrice(45, 'de-DE')).toBe('45,00 €')
    expect(formatPrice(45, 'en-US')).toBe('€45.00')
    expect(formatPrice(1234.5, 'de-DE')).toBe('1.234,50 €')
  })
})
