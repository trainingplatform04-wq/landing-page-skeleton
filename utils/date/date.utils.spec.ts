import { describe, expect, it } from 'vitest'

import { formatDate, getZonedYear } from './date.utils'

describe('formatDate', () => {
  it('shows a plain day as that day in every language', () => {
    expect(formatDate('2026-10-05', 'de-DE', 'Europe/Berlin')).toBe('5. Oktober 2026')
    expect(formatDate('2026-10-05', 'en-US', 'Europe/Berlin')).toBe('October 5, 2026')
  })

  it('reads a date-time in the given time zone', () => {
    // 23:30 UTC on 4 October is already 5 October in Berlin.
    expect(formatDate('2026-10-04T23:30:00Z', 'en-US', 'Europe/Berlin')).toBe('October 5, 2026')
  })
})

describe('getZonedYear', () => {
  it('uses the year of the time zone, not of the server', () => {
    expect(getZonedYear(new Date('2026-12-31T23:30:00Z'), 'Europe/Berlin')).toBe(2027)
  })
})
