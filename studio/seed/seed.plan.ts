import type { SeedDocument } from './seed.data'

/**
 * What one run of the seed writes. Every seeded document has a fixed id, so running it again
 * never duplicates anything:
 *
 * - `add` (default, `pnpm studio:seed`, also the pipeline on every Development deploy): creates the
 *   missing documents and fills their empty top-level fields, on the published document and on
 *   its draft. A value an editor changed is kept; a field an editor emptied is filled again
 *   (the development dataset holds demo content). A document an editor deleted stays deleted.
 * - `reset` (`--reset`, deliberately, by hand): the dataset matches seed.data.ts afterwards.
 *   Seeded documents are replaced (an editor's change or draft on them is discarded), and the
 *   ones removed from seed.data.ts since the last run are deleted.
 *
 * Documents editors created themselves are never touched. The manifest remembers which
 * documents the seed wrote and which pictures it uploaded; its id has a dot, so it is private
 * (never served to the website).
 */
export type SeedMode = 'add' | 'reset'

export const MANIFEST_ID = 'seed.manifest'

/** Which address produced which Sanity asset: unchanged addresses are reused, never re-downloaded. */
export interface ManifestImage {
  _key: string
  name: string
  source: string
  assetId: string
}

// A type, not an interface: the Sanity client needs it assignable to a plain record.
export type SeedManifest = {
  _id: typeof MANIFEST_ID
  _type: 'seed.manifest'
  /** Ids of every document the seed has written, so `reset` can delete the removed ones. */
  documentIds: string[]
  images: ManifestImage[]
  /** The previous format's list of documents, read once so its knowledge isn't lost. */
  documents?: Array<{ id: string }>
}

export type SeedMutation =
  | { createOrReplace: SeedDocument | SeedManifest }
  | { createIfNotExists: SeedDocument }
  | { patch: { id: string; setIfMissing: Record<string, unknown> } }
  | { delete: { id: string } }

export interface SeedPlan {
  mutations: SeedMutation[]
  created: string[]
  removed: string[]
}

const draftId = (id: string) => `drafts.${id}`

/** The document's fields, without the ones Sanity owns (`_id`, `_type`, …). */
const fieldsOf = (document: SeedDocument) =>
  Object.fromEntries(Object.entries(document).filter(([key]) => !key.startsWith('_')))

export function planSeed(
  documents: SeedDocument[],
  manifest: SeedManifest | null,
  mode: SeedMode,
  /** Ids (published and `drafts.`) of the seeded documents that exist in the dataset. */
  existingIds: ReadonlySet<string>,
  /** The pictures of this run, recorded so the next run can reuse their assets. */
  images: ManifestImage[],
): SeedPlan {
  const ids = documents.map(({ _id }) => _id)
  const known = manifest?.documentIds ?? manifest?.documents?.map(({ id }) => id) ?? []
  const exists = (id: string) => existingIds.has(id) || existingIds.has(draftId(id))
  // New since the last run: neither written before nor in the dataset (an editor's deletion sticks).
  const created = ids.filter((id) => !known.includes(id) && !exists(id))
  const nextManifest: SeedManifest = {
    _id: MANIFEST_ID,
    _type: 'seed.manifest',
    documentIds: mode === 'reset' ? ids : [...new Set([...known, ...ids])],
    images,
  }

  if (mode === 'reset') {
    const removed = known.filter((id) => !ids.includes(id))
    return {
      mutations: [
        ...documents.flatMap((document) => [
          { createOrReplace: document },
          { delete: { id: draftId(document._id) } },
        ]),
        ...removed.flatMap((id) => [{ delete: { id } }, { delete: { id: draftId(id) } }]),
        { createOrReplace: nextManifest },
      ],
      created,
      removed,
    }
  }

  const mutations = documents.flatMap((document): SeedMutation[] => {
    if (created.includes(document._id)) return [{ createIfNotExists: document }]
    // A deleted document stays deleted; an unpublished one still gets its fields in the draft.
    return [document._id, draftId(document._id)]
      .filter((id) => existingIds.has(id))
      .map((id) => ({ patch: { id, setIfMissing: fieldsOf(document) } }))
  })
  return { mutations: [...mutations, { createOrReplace: nextManifest }], created, removed: [] }
}
