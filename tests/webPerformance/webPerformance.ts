/**
 * `pnpm web-performance --url=<base>`: the web performance gate, measured by Google PageSpeed Insights
 * (https://pagespeed.web.dev, its API v5): Google's servers audit every page of the site in every
 * language on a deployed URL, mobile and desktop, against `webPerformance.config.ts`.
 *
 * - Every page is measured once, all in parallel. A page with a score under `minimum` gets
 *   `confirmationRuns` more runs, and the median of each score decides: a one-off sample cannot
 *   block a PR, a real regression still does. Scores under `target` pass but are reported.
 *
 * - `PAGESPEED_API_KEY` (env): a Google Cloud API key with the PageSpeed Insights API enabled.
 *   Without it Google's anonymous quota is tiny and requests fail with 429.
 * - Deployed previews (dev, staging) are noindex on purpose: their SEO score is computed without
 *   the "page is crawlable" audit (PageSpeed cannot skip it); every other SEO audit counts.
 * - Reports: `.web-performance/<form factor>/` (Google's report JSON per run) and
 *   `.web-performance/results.json` (the median scores), read by `tests/webPerformance/summary.ts`.
 *
 * Run by pnpm: `node tests/webPerformance/webPerformance.ts` (Node strips the types).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { LOCALES } from '../../constants/i18n.constants.ts'
import { ROUTE_PATHS } from '../../constants/routes.constants.ts'
import budget from '../../webPerformance.config.ts'

type FormFactor = (typeof budget.formFactors)[number]

/** The median scores (0–100) of one page on one form factor, by category and metric id. */
export interface PageResult {
  formFactor: FormFactor
  path: string
  runs: number
  scores: Record<string, number>
}

interface AuditRef {
  id: string
  weight: number
}

interface Report {
  categories: Record<string, { score: number | null; auditRefs: AuditRef[] }>
  audits: Record<string, { score: number | null; numericValue?: number }>
}

const API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
/** Audits left out of the SEO score on noindex previews. */
const NOINDEX_AUDITS = new Set(['is-crawlable'])
/**
 * Google's default quota for this API: 30 requests per minute per Google Cloud project. Requests
 * go out in parallel up to that, then wait for the next minute window.
 */
const REQUESTS_PER_MINUTE = 30
const ATTEMPTS = 4
const MINUTE = 60_000

const sentAt: number[] = []
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Waits until one more request fits in Google's per-minute quota, then books it. */
async function quotaSlot(): Promise<void> {
  for (;;) {
    const now = Date.now()
    while (sentAt.length && now - sentAt[0]! >= MINUTE) sentAt.shift()
    if (sentAt.length < REQUESTS_PER_MINUTE) {
      sentAt.push(now)
      return
    }
    await sleep(MINUTE - (now - sentAt[0]!) + 100)
  }
}

const base = process.argv.find((arg) => arg.startsWith('--url='))?.slice('--url='.length)
const key = process.env.PAGESPEED_API_KEY
if (!base) {
  process.stderr.write('Usage: pnpm web-performance --url=<deployed base URL>\n')
  process.exit(2)
}
if (!key) process.stderr.write('PAGESPEED_API_KEY is not set: Google may refuse requests (429).\n')

/** Every page of the site in every language; pages with a slug belong to editors (as in smoke). */
function pagePaths(): string[] {
  return Object.entries(ROUTE_PATHS)
    .filter(([route]) => !route.endsWith('-slug'))
    .flatMap(([, paths]) =>
      LOCALES.map(({ code }, index) => {
        const path = paths[code]
        if (index === 0) return path
        return path === '/' ? `/${code}` : `/${code}${path}`
      }),
    )
}

/** One PageSpeed Insights run (Google's report); retried on Google's transient errors. */
async function runPageSpeed(url: string, formFactor: FormFactor): Promise<Report> {
  const query = new URLSearchParams({ url, strategy: formFactor })
  for (const category of budget.categories) query.append('category', category)
  if (key) query.set('key', key)
  for (let attempt = 1; ; attempt++) {
    await quotaSlot()
    const response = await fetch(`${API}?${query}`)
    if (response.ok)
      return ((await response.json()) as { lighthouseResult: Report }).lighthouseResult
    if (attempt >= ATTEMPTS || ![429, 500, 502, 503].includes(response.status)) {
      throw new Error(
        `PageSpeed ${response.status} for ${url} (${formFactor}): ${await response.text()}`,
      )
    }
    // Quota (429): the next minute window; Google's transient errors: a short pause.
    await sleep(response.status === 429 ? MINUTE : attempt * 5000)
  }
}

/** A category score 0–100; SEO without the audits a noindex preview fails on purpose. */
function categoryScore(report: Report, id: string): number {
  const category = report.categories[id]
  if (!category) return 0
  if (id !== 'seo') return Math.round((category.score ?? 0) * 100)
  const refs = category.auditRefs.filter((ref) => ref.weight > 0 && !NOINDEX_AUDITS.has(ref.id))
  const scored = refs.filter((ref) => report.audits[ref.id]?.score != null)
  const weight = scored.reduce((sum, ref) => sum + ref.weight, 0)
  const total = scored.reduce(
    (sum, ref) => sum + ref.weight * (report.audits[ref.id]!.score ?? 0),
    0,
  )
  return weight ? Math.round((total / weight) * 100) : 0
}

/** Runs tasks with at most `limit` in flight. */
async function pool<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = []
  let next = 0
  const worker = async () => {
    while (next < tasks.length) {
      const index = next++
      results[index] = await tasks[index]!()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

/** Every score the budget judges (0–100): the categories, then the performance metrics. */
function scoresOf(report: Report): Record<string, number> {
  const scores: Record<string, number> = {}
  for (const id of budget.categories) scores[id] = categoryScore(report, id)
  for (const id of budget.metrics) scores[id] = Math.round((report.audits[id]?.score ?? 0) * 100)
  return scores
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor((sorted.length - 1) / 2)]!
}

/** The median of each score over a page's runs. */
function medianScores(runs: Array<Record<string, number>>): Record<string, number> {
  return Object.fromEntries(
    Object.keys(runs[0]!).map((id) => [id, median(runs.map((scores) => scores[id]!))]),
  )
}

const belowMinimum = (scores: Record<string, number>) =>
  Object.values(scores).some((score) => score < budget.minimum)

interface Page {
  formFactor: FormFactor
  url: string
  reports: Report[]
}

/** Measures every page once more, all in parallel within Google's quota. */
async function measure(targets: Page[]): Promise<void> {
  const reports = await pool(
    targets.map((page) => () => runPageSpeed(page.url, page.formFactor)),
    REQUESTS_PER_MINUTE,
  )
  targets.forEach((page, index) => page.reports.push(reports[index]!))
}

const urls = pagePaths().map((path) => `${base.replace(/\/$/, '')}${path}`)
const pages: Page[] = budget.formFactors.flatMap((formFactor) =>
  urls.map((url) => ({ formFactor, url, reports: [] })),
)

process.stdout.write(
  `PageSpeed Insights · ${urls.length} pages · ${budget.formFactors.join(' + ')} · ${pages.length} runs
`,
)
await measure(pages)

const suspects = pages.filter((page) => belowMinimum(scoresOf(page.reports[0]!)))
if (suspects.length) {
  process.stdout.write(
    `${suspects.length} page(s) under ${budget.minimum}: ${budget.confirmationRuns} confirmation run(s) each
`,
  )
  for (let run = 0; run < budget.confirmationRuns; run++) await measure(suspects)
}

rmSync('.web-performance', { recursive: true, force: true })
const results: PageResult[] = []
for (const page of pages) {
  const dir = join('.web-performance', page.formFactor)
  mkdirSync(dir, { recursive: true })
  const path = new URL(page.url).pathname
  page.reports.forEach((report, run) => {
    // The SEO score as the budget sees it (noindex audit left out), as in the PR report.
    report.categories.seo!.score = categoryScore(report, 'seo') / 100
    writeFileSync(
      join(dir, `${path.replace(/\W+/g, '_') || 'root'}-${run + 1}.json`),
      JSON.stringify(report),
    )
  })
  results.push({
    formFactor: page.formFactor,
    path,
    runs: page.reports.length,
    scores: medianScores(page.reports.map(scoresOf)),
  })
}
writeFileSync(join('.web-performance', 'results.json'), JSON.stringify(results, null, 2))

const label = ({ formFactor, path }: PageResult) => `${formFactor} ${path}`
const failures = results.flatMap((result) =>
  Object.entries(result.scores)
    .filter(([, score]) => score < budget.minimum)
    .map(([id, score]) => `${label(result)} · ${id} ${score} < ${budget.minimum}`),
)
const belowTarget = results.flatMap((result) =>
  Object.entries(result.scores)
    .filter(([, score]) => score >= budget.minimum && score < budget.target)
    .map(([id, score]) => `${label(result)} · ${id} ${score} < ${budget.target}`),
)

if (belowTarget.length) {
  process.stdout.write(
    `\nBelow the ${budget.target} target (passes, to improve):\n${belowTarget.map((f) => `  ⚠ ${f}`).join('\n')}\n`,
  )
}
if (failures.length) {
  process.stderr.write(
    `\nUnder the ${budget.minimum} minimum (webPerformance.config.ts):\n${failures.map((f) => `  ✘ ${f}`).join('\n')}\n`,
  )
  process.exit(1)
}
process.stdout.write(`\n✔ Every page meets the ${budget.minimum} minimum on PageSpeed Insights.\n`)
