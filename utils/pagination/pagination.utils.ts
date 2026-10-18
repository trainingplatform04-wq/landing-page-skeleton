/**
 * Numbered pages of a list, read from and written to the URL (`?page=2`). The CMS sends only the
 * items of the current page (`[$start...$end]` in GROQ) and their total.
 */

/** The page in the URL: none is page 1; only 2, 3, … name a page. `null` for anything else. */
export function parsePageParam(value: unknown): number | null {
  if (value === undefined) return 1
  const page = Number(value)
  return String(page) === value && page >= 2 ? page : null
}

/**
 * Where a page starts and ends in the whole list. `firstPageExtra` items more on page 1 (the
 * magazine's featured articles); every page after it holds `pageSize`.
 */
export function pageRange(
  page: number,
  pageSize: number,
  firstPageExtra = 0,
): { start: number; end: number } {
  if (page === 1) return { start: 0, end: firstPageExtra + pageSize }
  const start = firstPageExtra + (page - 1) * pageSize
  return { start, end: start + pageSize }
}

/** How many pages `total` items fill (at least one, an empty list included). */
export function pageCount(total: number, pageSize: number, firstPageExtra = 0): number {
  return Math.max(1, Math.ceil(Math.max(total - firstPageExtra, 0) / pageSize))
}

/** A page's address, its filters kept: `/magazin?category=nutrition&page=2`. Page 1 has no `page`. */
export function pageHref(base: string, filters: Record<string, string>, page: number): string {
  const search = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
  if (page > 1) search.set('page', String(page))
  const text = search.toString()
  return text ? `${base}?${text}` : base
}
