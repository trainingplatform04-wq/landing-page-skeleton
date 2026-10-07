import type { SeedDocument } from './seed.data'

/**
 * What one run of the seed writes. Every seeded document has a fixed id, so running it
 * again never duplicates anything:
 *
 * - `sync` (default): the dataset matches seed.data.ts afterwards. Seeded documents are
 *   replaced (an editor's change or draft on them is discarded), new ones are created, and
 *   the ones removed from seed.data.ts since the last run are deleted.
 * - `missing`: only creates the seeded documents that do not exist yet; everything an
 *   editor changed stays. Removed ones are kept until the next `sync`.
 *
 * Documents editors created themselves are never touched. The manifest remembers which
 * ids the seed owns; its id has a dot, so it is private (never served to the website).
 */
export type SeedMode = 'sync' | 'missing'

export const MANIFEST_ID = 'seed.manifest'

export type SeedManifest = {
  _id: typeof MANIFEST_ID
  _type: 'seed.manifest'
  ids: string[]
}

export type SeedMutation =
  | { createOrReplace: SeedDocument | SeedManifest }
  | { createIfNotExists: SeedDocument }
  | { delete: { id: string } }

export interface SeedPlan {
  mutations: SeedMutation[]
  created: string[]
  removed: string[]
}

const draftId = (id: string) => `drafts.${id}`

export function planSeed(
  documents: SeedDocument[],
  previousIds: readonly string[],
  mode: SeedMode,
): SeedPlan {
  const ids = documents.map(({ _id }) => _id)
  const current = new Set(ids)
  const removed = previousIds.filter((id) => !current.has(id))
  const created = ids.filter((id) => !previousIds.includes(id))

  if (mode === 'missing') {
    const manifestIds = [...new Set([...previousIds, ...ids])]
    return {
      mutations: [
        ...documents.map((document) => ({ createIfNotExists: document })),
        { createOrReplace: { _id: MANIFEST_ID, _type: 'seed.manifest', ids: manifestIds } },
      ],
      created,
      removed: [],
    }
  }

  return {
    mutations: [
      ...documents.flatMap((document) => [
        { createOrReplace: document },
        { delete: { id: draftId(document._id) } },
      ]),
      ...removed.flatMap((id) => [{ delete: { id } }, { delete: { id: draftId(id) } }]),
      { createOrReplace: { _id: MANIFEST_ID, _type: 'seed.manifest', ids } },
    ],
    created,
    removed,
  }
}
