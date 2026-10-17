import { describe, expect, it } from 'vitest'

import type { SeedDocument } from './seed.data'
import { MANIFEST_ID, planSeed, type SeedManifest } from './seed.plan'

const home = {
  _id: 'homePage-de',
  _type: 'homePage',
  language: 'de',
  title: 'Start',
  hero: { title: 'Hallo' },
} as SeedDocument
const faq = { _id: 'faqPage-de', _type: 'faqPage', language: 'de', title: 'FAQ' } as SeedDocument

const manifest = (documentIds: string[]): SeedManifest => ({
  _id: MANIFEST_ID,
  _type: 'seed.manifest',
  documentIds,
  images: [],
})

describe('planSeed in add mode', () => {
  it('creates a document the dataset does not have yet', () => {
    const plan = planSeed([home], null, 'add', new Set(), [])

    expect(plan.created).toEqual(['homePage-de'])
    expect(plan.mutations[0]).toEqual({ createIfNotExists: home })
  })

  it('fills the empty fields of an existing document and of its draft', () => {
    const plan = planSeed(
      [home],
      manifest(['homePage-de']),
      'add',
      new Set(['homePage-de', 'drafts.homePage-de']),
      [],
    )

    expect(plan.created).toEqual([])
    expect(plan.mutations.slice(0, 2)).toEqual([
      {
        patch: {
          id: 'homePage-de',
          setIfMissing: { language: 'de', title: 'Start', hero: { title: 'Hallo' } },
        },
      },
      {
        patch: {
          id: 'drafts.homePage-de',
          setIfMissing: { language: 'de', title: 'Start', hero: { title: 'Hallo' } },
        },
      },
    ])
  })

  it('leaves a document an editor deleted deleted', () => {
    const plan = planSeed([home], manifest(['homePage-de']), 'add', new Set(), [])

    expect(plan.mutations).toEqual([{ createOrReplace: manifest(['homePage-de']) }])
  })

  it('remembers every document it ever wrote', () => {
    const plan = planSeed([faq], manifest(['homePage-de']), 'add', new Set(), [])

    expect(plan.mutations.at(-1)).toEqual({
      createOrReplace: manifest(['homePage-de', 'faqPage-de']),
    })
  })
})

describe('planSeed in reset mode', () => {
  it('replaces every document, drops its draft and deletes the removed ones', () => {
    const plan = planSeed([faq], manifest(['homePage-de', 'faqPage-de']), 'reset', new Set(), [])

    expect(plan.removed).toEqual(['homePage-de'])
    expect(plan.mutations).toEqual([
      { createOrReplace: faq },
      { delete: { id: 'drafts.faqPage-de' } },
      { delete: { id: 'homePage-de' } },
      { delete: { id: 'drafts.homePage-de' } },
      { createOrReplace: manifest(['faqPage-de']) },
    ])
  })
})
