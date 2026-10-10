import { describe, expect, it, vi } from 'vitest'

import { isUniqueInTypeAndLanguage, matchesTranslations } from './slug.utils'

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

describe('matchesTranslations', () => {
  const context = (slugs: Array<string | null> | null) => {
    const fetch = vi.fn().mockResolvedValue(slugs)
    return {
      fetch,
      context: {
        document: { _id: 'drafts.category-nutrition-de', _type: 'category' },
        getClient: () => ({ fetch }),
      } as unknown as Parameters<typeof matchesTranslations>[1],
    }
  }

  it('accepts the slug the other language uses, never comparing with itself', async () => {
    const { fetch, context: ctx } = context(['nutrition'])

    expect(await matchesTranslations({ current: 'nutrition' }, ctx)).toBe(true)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('value._ref != $id'), {
      id: 'category-nutrition-de',
    })
  })

  it('names the slug of the other language while a rename is in progress', async () => {
    // German renamed to "food" first; English still says "nutrition" until it is renamed too.
    const { context: ctx } = context(['nutrition'])

    expect(await matchesTranslations({ current: 'food' }, ctx)).toBe(
      'The other language uses "nutrition": use the same key in both, so their pages link to each other.',
    )
  })

  it('accepts any slug while the category has no translation yet', async () => {
    const { context: ctx } = context(null)

    expect(await matchesTranslations({ current: 'training' }, ctx)).toBe(true)
  })
})
