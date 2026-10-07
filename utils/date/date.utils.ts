/**
 * Node and browsers emit different Unicode spaces in formatted dates; plain spaces keep
 * the server and browser HTML identical.
 */
const toPlainSpaces = (text: string) => text.replace(/\p{Zs}/gu, ' ')

/** e.g. "5. Oktober 2026" / "October 5, 2026". A plain day (`2026-10-05`) never shifts. */
export function formatDate(isoDate: string, language: string, timeZone: string): string {
  const isDay = isoDate.length === 10
  const date = new Date(isDay ? `${isoDate}T12:00:00Z` : isoDate)
  const format = new Intl.DateTimeFormat(language, {
    timeZone: isDay ? 'UTC' : timeZone,
    dateStyle: 'long',
  })
  return toPlainSpaces(format.format(date))
}

/** The year of `now` in `timeZone` (for the copyright line). */
export function getZonedYear(now: Date, timeZone: string): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' }).format(now))
}
