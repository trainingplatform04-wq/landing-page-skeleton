/**
 * `pnpm studio:seed`: writes the demo content (seed.data.ts) to the `staging` dataset.
 * Run with `sanity exec … --with-user-token`: it writes as the logged-in Sanity user
 * (`pnpm exec sanity login`, inside studio/), or with `SANITY_AUTH_TOKEN` in the pipeline.
 *
 *   pnpm studio:seed                  add what is new, keep editors' changes (also the pipeline)
 *   pnpm studio:seed --reset          staging matches seed.data.ts, editors' changes discarded
 *   pnpm studio:seed --dry-run        print the plan, write nothing (with either mode)
 */
import { getCliClient } from 'sanity/cli'

import { SANITY_API_VERSION } from '../../constants/sanity.constants'
import { seedDocuments } from './seed.data'
import { SEED_IMAGES, seedImageUrl } from './seed.images'
import { MANIFEST_ID, type ManifestImage, planSeed, type SeedManifest } from './seed.plan'

/** Demo content never reaches production: editors write it there. */
const SEEDABLE_DATASETS = ['staging']

const args = process.argv.slice(2)
// The destructive mode is never the default: staging is shared with the client.
const mode = args.includes('--reset') ? 'reset' : 'add'
const dryRun = args.includes('--dry-run')
const log = (line: string) => process.stdout.write(`${line}\n`)
const list = (items: string[]) => (items.length ? items.join(', ') : 'none')

const client = getCliClient({ apiVersion: SANITY_API_VERSION })
const { projectId, dataset = '' } = client.config()

if (!SEEDABLE_DATASETS.includes(dataset)) {
  throw new Error(
    `[seed] Refusing to seed dataset "${dataset}": only ${SEEDABLE_DATASETS.join(', ')}. ` +
      'Set SANITY_STUDIO_DATASET=staging in studio/.env.',
  )
}

const manifest = await client.getDocument<SeedManifest>(MANIFEST_ID)

/**
 * The demo pictures as Sanity assets. An address the manifest already knows is reused as is (no
 * download), as long as its asset still exists: an address that stops answering later (e.g. a
 * prototype rebuilt in Lovable) never breaks the seed. New or changed addresses are downloaded
 * and uploaded; Sanity keeps one asset per file content.
 */
async function resolveImages(): Promise<ManifestImage[]> {
  const known = manifest?.images ?? []
  const stillThere = new Set(
    await client.fetch<string[]>(
      '*[_id in $ids]._id',
      { ids: known.map(({ assetId }) => assetId) },
      { perspective: 'raw' },
    ),
  )
  return Promise.all(
    SEED_IMAGES.map(async (name): Promise<ManifestImage> => {
      const source = seedImageUrl(name)
      const reusable = known.find(
        (image) => image.name === name && image.source === source && stillThere.has(image.assetId),
      )
      if (reusable) return reusable
      if (dryRun) return { _key: name, name, source, assetId: `image-dry-run-${name}` }
      // Downloaded from its address and uploaded to the dataset: the picture lives in Sanity only.
      const response = await fetch(source)
      if (!response.ok) throw new Error(`[seed] ${name}: HTTP ${response.status} from ${source}`)
      const asset = await client.assets.upload('image', Buffer.from(await response.arrayBuffer()), {
        filename: `seed-${name}.jpg`,
        contentType: response.headers.get('content-type') ?? 'image/jpeg',
      })
      return { _key: name, name, source, assetId: asset._id }
    }),
  )
}

const images = await resolveImages()
const assetOf = new Map(images.map(({ name, assetId }) => [name, assetId]))
const documents = seedDocuments((name) => assetOf.get(name) ?? '')
const candidates = documents.flatMap(({ _id }) => [_id, `drafts.${_id}`])
// `raw`: drafts included (the default perspective only returns published documents).
const existing = await client.fetch<string[]>(
  '*[_id in $ids]._id',
  { ids: candidates },
  { perspective: 'raw' },
)
const plan = planSeed(documents, manifest ?? null, mode, new Set(existing), images)

log(`[seed] ${projectId}/${dataset} · mode ${mode}${dryRun ? ' · dry run' : ''}`)
const downloaded = images.filter(
  (image) => !manifest?.images?.some(({ assetId }) => assetId === image.assetId),
)
log(
  `[seed] ${documents.length} documents, ${images.length} images (${downloaded.length} new, ${images.length - downloaded.length} reused)`,
)
log(`[seed] new documents: ${list(plan.created)}`)
if (mode === 'add') log(`[seed] new fields: ${list(plan.filled)}`)
if (mode === 'reset') log(`[seed] deleted (removed from seed.data.ts): ${list(plan.removed)}`)

if (!dryRun) {
  // One transaction: the dataset gets the whole seed or nothing.
  await client.mutate<Record<string, unknown>>(plan.mutations)
  log('[seed] done: open the Studio to see the content.')
}
