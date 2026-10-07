/**
 * `pnpm studio:seed`: writes the demo content (seed.data.ts) to the `staging` dataset.
 * Run with `sanity exec … --with-user-token`: it writes as the logged-in Sanity user
 * (`pnpm exec sanity login`, inside studio/), or with `SANITY_AUTH_TOKEN` in the pipeline.
 *
 *   pnpm studio:seed                  sync: staging matches seed.data.ts (see seed.plan.ts)
 *   pnpm studio:seed --missing        only add what is new, keep editors' changes (pipeline)
 *   pnpm studio:seed --dry-run        print the plan, write nothing
 */
import { getCliClient } from 'sanity/cli'

import { SANITY_API_VERSION } from '../../constants/sanity.constants'
import { seedDocuments } from './seed.data'
import { SEED_IMAGES, type SeedImage, seedImageFile } from './seed.images'
import { MANIFEST_ID, planSeed, type SeedManifest } from './seed.plan'

/** Demo content never reaches production: editors write it there. */
const SEEDABLE_DATASETS = ['staging']

const args = process.argv.slice(2)
const mode = args.includes('--missing') ? 'missing' : 'sync'
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

/** Uploads the demo pictures. Sanity keeps one asset per file content, so re-runs reuse them. */
async function uploadImages(): Promise<Record<SeedImage, string>> {
  const entries = await Promise.all(
    SEED_IMAGES.map(async (name) => {
      if (dryRun) return [name, `image-dry-run-${name}`] as const
      const { filename, svg } = seedImageFile(name)
      const asset = await client.assets.upload('image', Buffer.from(svg), {
        filename,
        contentType: 'image/svg+xml',
      })
      return [name, asset._id] as const
    }),
  )
  return Object.fromEntries(entries) as Record<SeedImage, string>
}

const images = await uploadImages()
const documents = seedDocuments((name) => images[name])
const manifest = await client.getDocument<SeedManifest>(MANIFEST_ID)
const candidates = documents.flatMap(({ _id }) => [_id, `drafts.${_id}`])
// `raw`: drafts included (the default perspective only returns published documents).
const existing = await client.fetch<string[]>(
  '*[_id in $ids]._id',
  { ids: candidates },
  { perspective: 'raw' },
)
const plan = planSeed(documents, manifest ?? null, mode, new Set(existing))

log(`[seed] ${projectId}/${dataset} · mode ${mode}${dryRun ? ' · dry run' : ''}`)
log(`[seed] ${documents.length} documents, ${SEED_IMAGES.length} images`)
log(`[seed] new documents: ${list(plan.created)}`)
if (mode === 'missing') log(`[seed] new fields: ${list(plan.filled)}`)
if (mode === 'sync') log(`[seed] deleted (removed from seed.data.ts): ${list(plan.removed)}`)

if (!dryRun) {
  // One transaction: the dataset gets the whole seed or nothing.
  await client.mutate<Record<string, unknown>>(plan.mutations)
  log('[seed] done: open the Studio to see the content.')
}
