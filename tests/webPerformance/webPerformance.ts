/**
 * `pnpm web-performance --url=<base>`: the web performance gate, measured by Google PageSpeed Insights
 * (https://pagespeed.web.dev, its API v5): Google's servers audit every page of the site in every
 * language on a deployed URL, mobile and desktop, and the median run of each page must meet the
 * budget in `webPerformance.config.ts` (every category and every performance metric).
 *
 * - `PAGESPEED_API_KEY` (env): a Google Cloud API key with the PageSpeed Insights API enabled.
 *   Without it Google's anonymous quota is tiny and requests fail with 429.
 * - Deployed previews (dev, staging) are noindex on purpose: their SEO score is computed without
 *   the "page is crawlable" audit (PageSpeed cannot skip it); every other SEO audit counts.
 * - Reports: `.web-performance/<form factor>/` (Google's report JSON per run and a manifest),
 *   read by `tests/webPerformance/summary.ts`.
 *
 * Run by pnpm: `node tests/webPerformance/webPerformance.ts` (Node strips the types).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { LOCALES } from '../../constants/i18n.constants.ts'
import { ROUTE_PATHS } from '../../constants/routes.constants.ts'
import budget from '../../webPerformance.config.ts'

type FormFactor = keyof typeof budget.formFactors

interface AuditRef {
  id: string
  weight: number
}

interface Report {
  categories: Record<string, { score: number | null; auditRefs: AuditRef[] }>
  audits: Record<string, { score: number | null; numericValue?: number }>
}

const API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
/** Audits left out of the SEO score on noindex previews. */
const NOINDEX_AUDITS = new Set(['is-crawlable'])
/**
 * Google's default quota for this API: 30 requests per minute per Google Cloud project. Requests
 * go out in parallel up to that, then wait for the next minute (28 for 14 pages × 2 = one minute).
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
  for (const category of CATEGORIES) query.append('category', category)
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

const formFactors = Object.keys(budget.formFactors) as FormFactor[]
const urls = pagePaths().map((path) => `${base.replace(/\/$/, '')}${path}`)
const jobs = formFactors.flatMap((formFactor) =>
  urls.flatMap((url) =>
    Array.from({ length: budget.runs[formFactor] }, (_, run) => ({ formFactor, url, run })),
  ),
)

process.stdout.write(
  `PageSpeed Insights · ${urls.length} pages · ${formFactors.map((ff) => `${ff} × ${budget.runs[ff]}`).join(', ')} · ${jobs.length} runs\n`,
)
const reports = await pool(
  jobs.map((job) => () => runPageSpeed(job.url, job.formFactor)),
  REQUESTS_PER_MINUTE,
)

const failures: string[] = []
for (const formFactor of formFactors) {
  const dir = join('.web-performance', formFactor)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const manifest: Array<{ url: string; isRepresentativeRun: boolean; jsonPath: string }> = []
  const { categories, metrics } = budget.formFactors[formFactor]

  for (const url of urls) {
    const runs = jobs
      .map((job, index) => ({ job, report: reports[index]! }))
      .filter(({ job }) => job.formFactor === formFactor && job.url === url)
    // The median run by performance score is the page's result.
    const sorted = [...runs].sort(
      (a, b) => categoryScore(a.report, 'performance') - categoryScore(b.report, 'performance'),
    )
    const median = sorted[Math.floor((sorted.length - 1) / 2)]!
    runs.forEach(({ job, report }) => {
      // The SEO score as the budget sees it (noindex audit left out), for the summary table.
      report.categories.seo!.score = categoryScore(report, 'seo') / 100
      const jsonPath = join(
        dir,
        `${new URL(url).pathname.replace(/\W+/g, '_') || 'root'}-${job.run + 1}.json`,
      )
      writeFileSync(jsonPath, JSON.stringify(report))
      manifest.push({ url, isRepresentativeRun: report === median.report, jsonPath })
    })

    const report = median.report
    for (const [id, min] of Object.entries(categories)) {
      const score = categoryScore(report, id)
      if (score < min)
        failures.push(`${formFactor} ${new URL(url).pathname} · ${id} ${score} < ${min}`)
    }
    for (const [id, min] of Object.entries(metrics)) {
      const score = Math.round((report.audits[id]?.score ?? 0) * 100)
      if (score < min)
        failures.push(`${formFactor} ${new URL(url).pathname} · ${id} ${score} < ${min}`)
    }
  }
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))
}

if (failures.length) {
  process.stderr.write(
    `\nBudget not met (webPerformance.config.ts):\n${failures.map((f) => `  ✘ ${f}`).join('\n')}\n`,
  )
  process.exit(1)
}
process.stdout.write('\n✔ Every page meets the budget on PageSpeed Insights.\n')
