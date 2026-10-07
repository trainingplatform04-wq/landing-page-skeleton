import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { q } from '~/utils/groqd/groqd.utils'
import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useCms } from './useCms'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const titlesQuery = q
  .parameters<{ locale: string }>()
  .star.filterByType('offer')
  .project({ title: z.string() })

describe('useCms', () => {
  beforeEach(() => fetchMock.mockReset())

  it('sends the GROQ and its parameters to Sanity and returns the checked answer', async () => {
    fetchMock.mockResolvedValue([{ title: 'Yoga' }])
    const { runQuery } = await mountComposable(async () => useCms())

    expect(await runQuery(titlesQuery, { parameters: { locale: 'de' } })).toEqual([
      { title: 'Yoga' },
    ])
    expect(fetchMock).toHaveBeenCalledWith(titlesQuery.query, { locale: 'de' })
  })

  it('rejects an answer that does not have the expected shape', async () => {
    fetchMock.mockResolvedValue([{ title: 42 }])
    const { runQuery } = await mountComposable(async () => useCms())

    await expect(runQuery(titlesQuery, { parameters: { locale: 'de' } })).rejects.toThrow()
  })

  it('gives the mappers the visitor language', async () => {
    const { context } = await mountComposable(async () => useCms(), { route: '/en' })

    expect(context.locale).toBe('en')
    expect(context.language).toBe('en-US')
    expect(context.localePath('contact')).toBe('/en/contact')
  })
})
