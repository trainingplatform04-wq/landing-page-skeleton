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

/** e.g. "28. Sept. 2026" / "28 Sep 2026": the short date of article cards. */
export function formatShortDate(isoDate: string, language: string, timeZone: string): string {
  const format = new Intl.DateTimeFormat(language, {
    timeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const date = new Date(isoDate)
  if (!language.startsWith('en')) return toPlainSpaces(format.format(date))
  // English as in the design, day first with the US month ("Sep"): en-GB writes "Sept".
  const parts = format.formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value
  return `${part('day')} ${part('month')} ${part('year')}`
}

/** The year of `now` in `timeZone` (for the copyright line). */
export function getZonedYear(now: Date, timeZone: string): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' }).format(now))
}
