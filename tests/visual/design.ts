/**
 * `pnpm design:capture <change>` · `pnpm design:verify <change>` (docs/design/DESIGN_WORKFLOW.md §13).
 * Sets the mode and the changeset for the Playwright design gate, the same on every OS.
 * Run by pnpm: `node tests/visual/design.ts` (Node strips the types).
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const [mode, change, ...rest] = process.argv.slice(2)

if (!['capture', 'verify'].includes(mode ?? '') || !change) {
  process.stderr.write('Usage: pnpm design:capture <change> | pnpm design:verify <change>\n')
  process.exit(2)
}

const spec = join('docs/design/changes', change, 'verify.json')
if (!existsSync(spec)) {
  process.stderr.write(`Missing ${spec} (template: docs/design/changes/_template/verify.json)\n`)
  process.exit(2)
}

// Playwright's CLI through Node, without a shell: arguments such as `-g "hero · de"` arrive intact on every OS.
const cli = createRequire(import.meta.url).resolve('@playwright/test/cli')
const result = spawnSync(
  process.execPath,
  [cli, 'test', '--config', 'tests/visual/playwright.config.ts', ...rest],
  { stdio: 'inherit', env: { ...process.env, DESIGN_MODE: mode, DESIGN_CHANGE: change } },
)
process.exit(result.status ?? 1)
