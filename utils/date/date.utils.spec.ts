import { describe, expect, it } from 'vitest'

import { formatDate, formatShortDate, getZonedYear } from './date.utils'

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

describe('formatShortDate', () => {
  it('writes the short card date of each language', () => {
    expect(formatShortDate('2026-09-28T08:00:00+02:00', 'en-US', 'Europe/Berlin')).toBe(
      '28 Sep 2026',
    )
    expect(formatShortDate('2026-09-28T08:00:00+02:00', 'de-DE', 'Europe/Berlin')).toBe(
      '28. Sept. 2026',
    )
  })

  it('reads the date in the given time zone', () => {
    // 23:30 UTC on 27 September is already 28 September in Berlin.
    expect(formatShortDate('2026-09-27T23:30:00Z', 'en-US', 'Europe/Berlin')).toBe('28 Sep 2026')
  })
})

describe('getZonedYear', () => {
  it('uses the year of the time zone, not of the server', () => {
    expect(getZonedYear(new Date('2026-12-31T23:30:00Z'), 'Europe/Berlin')).toBe(2027)
  })
})
