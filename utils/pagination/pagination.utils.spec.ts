import { describe, expect, it } from 'vitest'

import { pageCount, pageHref, pageRange, parsePageParam } from './pagination.utils'

describe('parsePageParam', () => {
  it('reads page 2 and later; no parameter is page 1', () => {
    expect(parsePageParam(undefined)).toBe(1)
    expect(parsePageParam('2')).toBe(2)
  })

  it('refuses a value that duplicates or does not name a page', () => {
    for (const value of ['1', '0', '02', '2.0', '2e0', 'two', ['2'], null]) {
      expect(parsePageParam(value)).toBeNull()
    }
  })
})

describe('pageRange', () => {
  it('slices pages of the same size', () => {
    expect(pageRange(1, 9)).toEqual({ start: 0, end: 9 })
    expect(pageRange(2, 9)).toEqual({ start: 9, end: 18 })
  })

  it('gives page 1 its extra items and shifts the next pages', () => {
    expect(pageRange(1, 9, 3)).toEqual({ start: 0, end: 12 })
    expect(pageRange(3, 9, 3)).toEqual({ start: 21, end: 30 })
  })
})

describe('pageCount', () => {
  it('counts the pages the items fill, at least one', () => {
    expect(pageCount(10, 9)).toBe(2)
    expect(pageCount(0, 9)).toBe(1)
    expect(pageCount(14, 9, 3)).toBe(2)
    expect(pageCount(12, 9, 3)).toBe(1)
  })
})

describe('pageHref', () => {
  it('keeps the filters and names pages after the first', () => {
    expect(pageHref('/magazin', { category: '' }, 1)).toBe('/magazin')
    expect(pageHref('/magazin', { category: 'nutrition' }, 2)).toBe(
      '/magazin?category=nutrition&page=2',
    )
  })
})
