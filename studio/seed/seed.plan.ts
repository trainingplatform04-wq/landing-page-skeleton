import type { SeedDocument } from './seed.data'

/**
 * What one run of the seed writes. Every seeded document has a fixed id, so running it
 * again never duplicates anything:
 *
 * - `sync` (`pnpm studio:seed`, by hand): the dataset matches seed.data.ts afterwards.
 *   Seeded documents are replaced (an editor's change or draft on them is discarded), new
 *   ones are created, and the ones removed from seed.data.ts since the last run are deleted.
 * - `missing` (`--missing`, also the pipeline on every staging deploy): adds only what is
 *   new in seed.data.ts since the last run, and keeps everything editors did. A new
 *   document is created; a new field (or section) is set on the existing document and on
 *   its draft, where it is still empty. A field an editor emptied, a document an editor
 *   deleted and every edited value stay as they are. Nothing is deleted.
 *
 * Documents editors created themselves are never touched. The manifest remembers which
 * documents and fields the seed wrote; its id has a dot, so it is private (never served to
 * the website).
 */
export type SeedMode = 'sync' | 'missing'

export const MANIFEST_ID = 'seed.manifest'

interface ManifestEntry {
  _key: string
  id: string
  /** Field paths written to the document, `hero` and `hero.title` alike. */
  paths: string[]
}

export type SeedManifest = {
  _id: typeof MANIFEST_ID
  _type: 'seed.manifest'
  documents: ManifestEntry[]
  /** Written by the first version of the seed (ids only): their fields count as known. */
  ids?: string[]
}

type Patch = { id: string; setIfMissing: Record<string, unknown> }

export type SeedMutation =
  | { createOrReplace: SeedDocument | SeedManifest }
  | { createIfNotExists: SeedDocument }
  | { patch: Patch }
  | { delete: { id: string } }

export interface SeedPlan {
  mutations: SeedMutation[]
  created: string[]
  /** `homePage-de: hero.subtitle`, in `missing` mode. */
  filled: string[]
  removed: string[]
}

const draftId = (id: string) => `drafts.${id}`

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Every field path of a document, parents first. Arrays and references are leaves. */
export function fieldPaths(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    if (key.startsWith('_')) return []
    const path = prefix ? `${prefix}.${key}` : key
    const nested = isObject(child) && !('_ref' in child) ? fieldPaths(child, path) : []
    return [path, ...nested]
  })
}

const valueAt = (document: object, path: string) =>
  path
    .split('.')
    .reduce<unknown>((value, key) => (isObject(value) ? value[key] : undefined), document)

const ancestors = (path: string) =>
  path
    .split('.')
    .slice(0, -1)
    .map((_, index, keys) => keys.slice(0, index + 1).join('.'))

function previousState(manifest: SeedManifest | null) {
  const entries = new Map((manifest?.documents ?? []).map((entry) => [entry.id, entry.paths]))
  const legacyIds = manifest?.ids ?? []
  const ids = [...new Set([...entries.keys(), ...legacyIds])]
  /** Known paths of a document; `undefined` (legacy manifest) means "all of them". */
  const pathsOf = (id: string) => entries.get(id)
  return { ids, pathsOf }
}

const manifestOf = (entries: ManifestEntry[]): SeedManifest => ({
  _id: MANIFEST_ID,
  _type: 'seed.manifest',
  documents: entries,
})

const entryOf = (document: SeedDocument): ManifestEntry => ({
  _key: document._id,
  id: document._id,
  paths: fieldPaths(document),
})

/**
 * The fields of `document` that are new since the last run, as two patches: first the
 * parents a new field needs (an empty object, typed like the seed's), then the fields.
 * A new field whose parent is new too comes with its parent.
 */
function newFieldPatches(document: SeedDocument, known: readonly string[], targetId: string) {
  const knownPaths = new Set(known)
  const fresh = fieldPaths(document).filter((path) => !knownPaths.has(path))
  const freshSet = new Set(fresh)
  const roots = fresh.filter((path) => !ancestors(path).some((parent) => freshSet.has(parent)))
  if (!roots.length) return { patches: [], roots }

  const parents = [...new Set(roots.flatMap(ancestors))]
  const parentValues = Object.fromEntries(
    parents.map((path) => {
      const value = valueAt(document, path)
      return [path, isObject(value) && value._type ? { _type: value._type } : {}]
    }),
  )
  const fieldValues = Object.fromEntries(roots.map((path) => [path, valueAt(document, path)]))
  const patches: SeedMutation[] = [
    ...(parents.length ? [{ patch: { id: targetId, setIfMissing: parentValues } }] : []),
    { patch: { id: targetId, setIfMissing: fieldValues } },
  ]
  return { patches, roots }
}

export function planSeed(
  documents: SeedDocument[],
  manifest: SeedManifest | null,
  mode: SeedMode,
  /** Ids (published and `drafts.`) of the seeded documents that exist in the dataset. */
  existingIds: ReadonlySet<string> = new Set(),
): SeedPlan {
  const previous = previousState(manifest)
  const ids = documents.map(({ _id }) => _id)
  const current = new Set(ids)
  const removed = previous.ids.filter((id) => !current.has(id))
  const created = ids.filter((id) => !previous.ids.includes(id))

  if (mode === 'sync') {
    return {
      mutations: [
        ...documents.flatMap((document) => [
          { createOrReplace: document },
          { delete: { id: draftId(document._id) } },
        ]),
        ...removed.flatMap((id) => [{ delete: { id } }, { delete: { id: draftId(id) } }]),
        { createOrReplace: manifestOf(documents.map(entryOf)) },
      ],
      created,
      filled: [],
      removed,
    }
  }

  const filled: string[] = []
  const mutations = documents.flatMap((document): SeedMutation[] => {
    if (created.includes(document._id)) return [{ createIfNotExists: document }]
    const known = previous.pathsOf(document._id) ?? fieldPaths(document)
    // A deleted document stays deleted; an unpublished one still gets the field in its draft.
    const targets = [document._id, draftId(document._id)].filter((id) => existingIds.has(id))
    return targets.flatMap((targetId) => {
      const { patches, roots } = newFieldPatches(document, known, targetId)
      if (targetId === targets[0]) filled.push(...roots.map((path) => `${document._id}: ${path}`))
      return patches
    })
  })

  // Removed documents stay recorded, so the next sync deletes them.
  const kept = (manifest?.documents ?? []).filter(({ id }) => !current.has(id))
  const legacy = removed
    .filter((id) => !kept.some((entry) => entry.id === id))
    .map((id) => ({ _key: id, id, paths: [] }))

  return {
    mutations: [
      ...mutations,
      { createOrReplace: manifestOf([...documents.map(entryOf), ...kept, ...legacy]) },
    ],
    created,
    filled,
    removed: [],
  }
}
