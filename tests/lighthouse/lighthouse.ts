/**
 * `pnpm lighthouse [mobile|desktop] [--skip-build|--build-only] [--shard=<k>/<n>] [--url=<base>]`:
 * the web performance gate.
 *
 * Lighthouse (through Lighthouse CI) audits every page of the site in every language and fails
 * when a category or a performance metric of the median run scores below its minimum in
 * `lighthouse.config.ts` (the budget, the only place thresholds live).
 *
 * - Default: a production build of this commit, the developer's `.env` content (staging) and
 *   the production robots settings (`NUXT_SITE_ENV=production`, local only, never deployed),
 *   so every SEO audit counts. `--skip-build` reuses `.output/`; `--build-only` stops after the
 *   build (CI builds once, then audits in parallel jobs).
 * - `--shard=<k>/<n>`: audits the k-th of n equal shares of the pages (one CI job each).
 * - `--url=<base>`: audits a deployed site (the staging check after a deploy). Staging is
 *   noindex on purpose, so there the "page is crawlable" audit is skipped.
 *
 * Reports: `.lighthouseci/<form factor>/` (HTML and JSON per run). Run by pnpm:
 * `node tests/lighthouse/lighthouse.ts` (Node strips the types).
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { chromium } from '@playwright/test'

import { LOCALES } from '../../constants/i18n.constants.ts'
import { ROUTE_PATHS } from '../../constants/routes.constants.ts'
import budget from '../../lighthouse.config.ts'

type FormFactor = keyof typeof budget.formFactors

const PORT = '3300'
const FORM_FACTORS = Object.keys(budget.formFactors) as FormFactor[]

const args = process.argv.slice(2)
const requested = args.find((arg) => !arg.startsWith('--'))
const remote = args.find((arg) => arg.startsWith('--url='))?.slice('--url='.length)
const skipBuild = args.includes('--skip-build') || Boolean(remote)
const buildOnly = args.includes('--build-only')
const shard = args
  .find((arg) => arg.startsWith('--shard='))
  ?.slice('--shard='.length)
  .split('/')
  .map(Number)

const validShard = !shard || (shard.length === 2 && shard[0]! >= 1 && shard[0]! <= shard[1]!)
if ((requested && !FORM_FACTORS.includes(requested as FormFactor)) || !validShard) {
  process.stderr.write(
    `Usage: pnpm lighthouse [${FORM_FACTORS.join('|')}] [--skip-build|--build-only] [--shard=<k>/<n>] [--url=<base>]\n`,
  )
  process.exit(2)
}

/** Every page of the site in every language; pages with a slug belong to editors (as in smoke). */
function pagePaths(): string[] {
  return Object.entries(ROUTE_PATHS)
    .filter(([route]) => !route.endsWith('-slug'))
    .flatMap(([, paths]) =>
      LOCALES.map(({ code }, index) => {
        const path = paths[code]
        // The default language has no prefix (`prefix_except_default`).
        if (index === 0) return path
        return path === '/' ? `/${code}` : `/${code}${path}`
      }),
    )
}

/** The k-th of n equal shares of the pages (`--shard=k/n`), or every page. */
function inShard<T>(items: T[]): T[] {
  if (!shard) return items
  const [k, n] = shard as [number, number]
  const size = Math.ceil(items.length / n)
  return items.slice((k - 1) * size, k * size)
}

/** Lighthouse CI's assertions from the budget: scores 0–100 become its 0–1 `minScore`. */
function assertions(formFactor: FormFactor) {
  const { categories, metrics } = budget.formFactors[formFactor]
  const rule = (min: number) => ['error', { minScore: min / 100, aggregationMethod: 'median' }]
  return Object.fromEntries([
    ...Object.entries(categories).map(([id, min]) => [`categories:${id}`, rule(min)]),
    ...Object.entries(metrics).map(([id, min]) => [id, rule(min)]),
  ])
}

// Production robots settings for the local build and server only: never deployed.
const env = { ...process.env, NUXT_SITE_ENV: 'production', NITRO_PRESET: 'node-server', PORT }
const require = createRequire(import.meta.url)

/** Runs a Node script; returns whether it succeeded. */
function run(script: string, scriptArgs: string[]): boolean {
  return (
    spawnSync(process.execPath, [script, ...scriptArgs], { stdio: 'inherit', env }).status === 0
  )
}

if (
  !skipBuild &&
  !run(join(dirname(require.resolve('nuxt/package.json')), 'bin/nuxt.mjs'), ['build'])
) {
  process.exit(1)
}
if (buildOnly) process.exit(0)

const base = remote ?? `http://localhost:${PORT}`
const urls = inShard(pagePaths()).map((path) => `${base}${path}`)
// The Chromium Playwright installs: the same browser locally and in CI.
const chromePath = chromium.executablePath()

// Every form factor runs, so one run reports every failing page; the exit code sums them up.
const failed: FormFactor[] = []
for (const formFactor of requested ? [requested as FormFactor] : FORM_FACTORS) {
  const outputDir = join('.lighthouseci', shard ? `${formFactor}-${shard[0]}` : formFactor)
  rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })
  const config = {
    ci: {
      collect: {
        url: urls,
        numberOfRuns: budget.runs,
        chromePath,
        ...(!remote && {
          startServerCommand: 'node --env-file-if-exists=.env .output/server/index.mjs',
          startServerReadyPattern: 'Listening on',
        }),
        settings: {
          ...(formFactor === 'desktop' && { preset: 'desktop' }),
          // Staging is noindex on purpose: only production is indexable.
          ...(remote && { skipAudits: ['is-crawlable'] }),
          chromeFlags: '--headless=new --no-sandbox',
        },
      },
      assert: { assertions: assertions(formFactor) },
      upload: { target: 'filesystem', outputDir },
    },
  }
  const configPath = join(outputDir, 'lighthouserc.json')
  writeFileSync(configPath, JSON.stringify(config, null, 2))
  process.stdout.write(
    `\nLighthouse · ${formFactor} · ${urls.length} pages × ${budget.runs} runs\n`,
  )
  if (!run(require.resolve('@lhci/cli/src/cli.js'), ['autorun', `--config=${configPath}`])) {
    failed.push(formFactor)
  }
}

if (failed.length) {
  process.stderr.write(`
Lighthouse budget not met: ${failed.join(', ')} (lighthouse.config.ts)
`)
  process.exit(1)
}
