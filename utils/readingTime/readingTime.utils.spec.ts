import { describe, expect, it } from 'vitest'

import { readingMinutes } from './readingTime.utils'

describe('readingMinutes', () => {
  it('reads 200 words per minute, rounded up', () => {
    expect(readingMinutes(210)).toBe(2)
    expect(readingMinutes(200)).toBe(1)
  })

  it('is at least one minute, even without text', () => {
    expect(readingMinutes(0)).toBe(1)
    expect(readingMinutes(null)).toBe(1)
  })
})
