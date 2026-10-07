import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * pnpm is pinned twice in package.json: `packageManager` (read by pnpm ≤ 10, Corepack,
 * Vercel) and `devEngines.packageManager` (read by pnpm ≥ 11 and pnpm/action-setup,
 * and makes `npm install` fail). Both must name the same version.
 */
const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
  packageManager?: string
  devEngines?: { packageManager?: { name?: string; version?: string; onFail?: string } }
}

describe('package manager', () => {
  it('pins the same pnpm version in packageManager and devEngines', () => {
    const devEngine = manifest.devEngines?.packageManager

    expect(devEngine?.name).toBe('pnpm')
    expect(devEngine?.onFail).toBe('download')
    expect(manifest.packageManager).toBe(`pnpm@${devEngine?.version}`)
  })

  it.each(['package-lock.json', 'yarn.lock', 'studio/package-lock.json'])(
    'has no foreign lockfile %s',
    (lockfile) => {
      expect(existsSync(join(ROOT, lockfile))).toBe(false)
    },
  )
})
