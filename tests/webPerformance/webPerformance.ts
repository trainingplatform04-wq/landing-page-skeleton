/**
 * `pnpm web-performance --url=<base>`: the web performance gate, measured by Google PageSpeed Insights
 * (https://pagespeed.web.dev, its API v5): Google's servers audit each page template once on a
 * deployed URL, mobile and desktop, against `webPerformance.config.ts`: every page in the default
 * language (the other languages render the same templates) and one example per slug template.
 *
 * - Every page is visited twice first (warm-up), then measured once on mobile and once on desktop,
 *   all in parallel within Google's quota. A score under `minimum` blocks; scores under `target`
 *   pass but are reported.
 * - A run made on a PageSpeed machine slower than `minimumBenchmarkIndex` is run again, up to
 *   `slowMachineReruns` times: the same page scores 98 on a fast machine and under 80 on a slow
 *   one, so such a run says nothing about the code. If every try lands on a slow machine, the run
 *   from the fastest one counts.
 * - A run Google cannot complete (quota, a server error, a Lighthouse runtime error such as
 *   `NO_FCP`) is retried; a page with no completed run is reported as not measured and fails the
 *   gate at the end, after every other page has been measured.
 *
 * - `PAGESPEED_API_KEY` (env): a Google Cloud API key with the PageSpeed Insights API enabled.
 *   Without it Google's anonymous quota is tiny and requests fail with 429.
 * - Deployed previews (Feature, Development) are noindex on purpose: their SEO score is computed without
 *   the "page is crawlable" audit (PageSpeed cannot skip it); every other SEO audit counts.
 * - Reports: `.web-performance/<form factor>/` (Google's report JSON per run) and
 *   `.web-performance/results.json` (the scores), read by `tests/webPerformance/summary.ts`.
 *
 * Run by pnpm: `node tests/webPerformance/webPerformance.ts` (Node strips the types).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { DEFAULT_LOCALE } from '../../constants/i18n.constants.ts'
import { ROUTE_PATHS } from '../../constants/routes.constants.ts'
import budget from '../../webPerformance.config.ts'

type FormFactor = (typeof budget.formFactors)[number]

/**
 * The scores (0–100) of one page on one form factor, by category and metric id. A page that could
 * not be measured has no scores and the reason in `error`.
 */
export interface PageResult {
  formFactor: FormFactor
  path: string
  measured: boolean
  scores: Record<string, number>
  /** Times the run was made again because Google measured it on a slow machine. */
  slowReruns: number
  error?: string
}

interface AuditRef {
  id: string
  weight: number
}

interface Report {
  categories: Record<string, { score: number | null; auditRefs: AuditRef[] }>
  audits: Record<string, { score: number | null; numericValue?: number }>
  /** The speed of the machine Google measured on (Lighthouse's benchmark index). */
  environment?: { benchmarkIndex?: number }
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
/** Google's transient errors: quota (429) and server errors. */
const RETRY_STATUSES = [429, 500, 502, 503]
/** A Lighthouse runtime error (e.g. `NO_FCP`): answered as 400, but the next run often passes. */
const LIGHTHOUSE_ERROR = /Lighthouse returned error|\bNO_FCP\b/i
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

/**
 * Each page template once: every page in the default language (unprefixed URL), and for templates
 * with a slug (their pages belong to editors), the one example of `budget.slugPages`.
 */
function pagePaths(): string[] {
  const pages = Object.entries(ROUTE_PATHS)
    .filter(([route]) => !route.endsWith('-slug'))
    .map(([, paths]) => paths[DEFAULT_LOCALE])
  return [...pages, ...budget.slugPages]
}

/** The error message of a failed PageSpeed response, or its body. */
function errorMessage(body: string): string {
  try {
    return (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? body
  } catch {
    return body
  }
}

/** Every run gets its own URL: PageSpeed returns its cached report for a URL it measured recently. */
let runCount = 0
const freshUrl = (url: string) =>
  `${url}${url.includes('?') ? '&' : '?'}wp=${Date.now()}-${++runCount}`

const machineSpeed = (report: Report) => report.environment?.benchmarkIndex ?? 0

/**
 * One PageSpeed Insights run (Google's report, measured fresh) on a machine at least as fast as
 * `minimumBenchmarkIndex`: a run on a slower one is made again, up to `slowMachineReruns` times,
 * and the run from the fastest machine counts.
 */
async function measuredRun(
  url: string,
  formFactor: FormFactor,
): Promise<{ report: Report; slowReruns: number }> {
  let report = await runPageSpeed(url, formFactor)
  let slowReruns = 0
  while (
    machineSpeed(report) < budget.minimumBenchmarkIndex &&
    slowReruns < budget.slowMachineReruns
  ) {
    slowReruns++
    const next = await runPageSpeed(url, formFactor)
    if (machineSpeed(next) > machineSpeed(report)) report = next
  }
  return { report, slowReruns }
}

/**
 * One PageSpeed Insights run (Google's report, measured fresh); retried on Google's transient
 * errors and on Lighthouse runtime errors.
 */
async function runPageSpeed(url: string, formFactor: FormFactor): Promise<Report> {
  const query = new URLSearchParams({ url: freshUrl(url), strategy: formFactor })
  for (const category of budget.categories) query.append('category', category)
  if (key) query.set('key', key)
  for (let attempt = 1; ; attempt++) {
    await quotaSlot()
    const response = await fetch(`${API}?${query}`)
    if (response.ok)
      return ((await response.json()) as { lighthouseResult: Report }).lighthouseResult
    const message = errorMessage(await response.text())
    const retryable =
      RETRY_STATUSES.includes(response.status) ||
      (response.status === 400 && LIGHTHOUSE_ERROR.test(message))
    if (attempt >= ATTEMPTS || !retryable)
      throw new Error(`PageSpeed ${response.status}: ${message}`)
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

interface Page {
  formFactor: FormFactor
  url: string
  report?: Report
  slowReruns: number
  /** Why the run failed; reported when the page could not be measured. */
  error?: string
}

/**
 * Measures every page once, all in parallel within Google's quota. A run that still fails after
 * its retries is logged on the page; the other pages go on.
 */
async function measure(targets: Page[]): Promise<void> {
  const tasks = targets.map((page) => async () => {
    try {
      const { report, slowReruns } = await measuredRun(page.url, page.formFactor)
      page.report = report
      page.slowReruns = slowReruns
    } catch (error) {
      page.error = error instanceof Error ? error.message : String(error)
      process.stderr.write(`${page.formFactor} ${page.url}: ${page.error}\n`)
    }
  })
  await pool(tasks, REQUESTS_PER_MINUTE)
}

const urls = pagePaths().map((path) => `${base.replace(/\/$/, '')}${path}`)
const pages: Page[] = budget.formFactors.flatMap((formFactor) =>
  urls.map((url) => ({ formFactor, url, slowReruns: 0 })),
)

/**
 * Two plain visits per page before measuring: a fresh deployment answers its very first
 * requests slowly (cold function, cold image cache), which no visitor of a live site sees.
 */
async function warmUp(targets: string[]): Promise<void> {
  await Promise.all(
    targets.map(async (url) => {
      for (let visit = 0; visit < 2; visit++) await fetch(url).catch(() => undefined)
    }),
  )
}

process.stdout.write(
  `PageSpeed Insights · ${urls.length} pages · ${budget.formFactors.join(' + ')} · one run each\n`,
)
await warmUp(urls)
await measure(pages)

rmSync('.web-performance', { recursive: true, force: true })
const results: PageResult[] = []
for (const page of pages) {
  const dir = join('.web-performance', page.formFactor)
  mkdirSync(dir, { recursive: true })
  const path = new URL(page.url).pathname
  const { report, slowReruns, error } = page
  if (!report) {
    results.push({
      formFactor: page.formFactor,
      path,
      measured: false,
      scores: {},
      slowReruns,
      error,
    })
    continue
  }
  // The SEO score as the budget sees it (noindex audit left out), as in the PR report.
  report.categories.seo!.score = categoryScore(report, 'seo') / 100
  writeFileSync(join(dir, `${path.replace(/\W+/g, '_') || 'root'}.json`), JSON.stringify(report))
  results.push({
    formFactor: page.formFactor,
    path,
    measured: true,
    scores: scoresOf(report),
    slowReruns,
  })
}
writeFileSync(join('.web-performance', 'results.json'), JSON.stringify(results, null, 2))

const label = ({ formFactor, path }: PageResult) => `${formFactor} ${path}`
const failures = results.flatMap((result) =>
  result.measured
    ? Object.entries(result.scores)
        .filter(([, score]) => score < budget.minimum)
        .map(([id, score]) => `${label(result)} · ${id} ${score} < ${budget.minimum}`)
    : [`${label(result)} · could not be measured: ${result.error}`],
)
const belowTarget = results.flatMap((result) =>
  Object.entries(result.scores)
    .filter(([, score]) => score >= budget.minimum && score < budget.target)
    .map(([id, score]) => `${label(result)} · ${id} ${score} < ${budget.target}`),
)

const slowReruns = results.reduce((sum, result) => sum + result.slowReruns, 0)
if (slowReruns) {
  process.stdout.write(
    `\n${slowReruns} run(s) made again: measured on a PageSpeed machine under benchmark index ${budget.minimumBenchmarkIndex}.\n`,
  )
}
if (belowTarget.length) {
  process.stdout.write(
    `\nBelow the ${budget.target} target (passes, to improve):\n${belowTarget.map((f) => `  ⚠ ${f}`).join('\n')}\n`,
  )
}
if (failures.length) {
  process.stderr.write(
    `\nUnder the ${budget.minimum} minimum (webPerformance.config.ts) or not measured:\n${failures.map((f) => `  ✘ ${f}`).join('\n')}\n`,
  )
  process.exit(1)
}
process.stdout.write(`\n✔ Every page meets the ${budget.minimum} minimum on PageSpeed Insights.\n`)
