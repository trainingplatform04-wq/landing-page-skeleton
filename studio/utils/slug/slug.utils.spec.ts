import { describe, expect, it, vi } from 'vitest'

import { isUniqueInTypeAndLanguage } from './slug.utils'

describe('isUniqueInTypeAndLanguage', () => {
  const context = (document: { _id: string; _type: string; language?: string } | undefined) => {
    const fetch = vi.fn().mockResolvedValue(true)
    return {
      fetch,
      context: { document, getClient: () => ({ fetch }) } as unknown as Parameters<
        typeof isUniqueInTypeAndLanguage
      >[1],
    }
  }

  it('checks the same type and language, ignoring the draft and published copy itself', async () => {
    const { fetch, context: ctx } = context({
      _id: 'drafts.offer-1',
      _type: 'offer',
      language: 'de',
    })

    expect(await isUniqueInTypeAndLanguage('yoga', ctx)).toBe(true)
    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      type: 'offer',
      language: 'de',
      slug: 'yoga',
      id: 'offer-1',
    })
  })

  it('accepts anything while there is no document yet', async () => {
    const { fetch, context: ctx } = context(undefined)

    expect(await isUniqueInTypeAndLanguage('yoga', ctx)).toBe(true)
    expect(fetch).not.toHaveBeenCalled()
  })
})
