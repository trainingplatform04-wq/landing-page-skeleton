/**
 * `node tests/webPerformance/summary.ts`: the PageSpeed Insights results as a Markdown table (one
 * row per page, mobile and desktop, each category against `webPerformance.config.ts`), for the
 * CI job summary and the pull request report. Reads `.web-performance/<form factor>/manifest.json`.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import budget from '../../webPerformance.config.ts'

type FormFactor = keyof typeof budget.formFactors
type Category = keyof (typeof budget.formFactors)['mobile']['categories']

interface ManifestEntry {
  url: string
  isRepresentativeRun: boolean
  jsonPath: string
}

interface Report {
  categories: Record<Category, { score: number | null }>
  audits: Record<string, { score: number | null }>
}

const FORM_FACTORS = Object.keys(budget.formFactors) as FormFactor[]
const CATEGORIES: Array<[Category, string]> = [
  ['performance', 'Perf'],
  ['accessibility', 'A11y'],
  ['best-practices', 'BP'],
  ['seo', 'SEO'],
]

/** The median run of every page, by path. */
function medianRuns(formFactor: FormFactor): Map<string, Report> {
  const manifest = join('.web-performance', formFactor, 'manifest.json')
  const runs = new Map<string, Report>()
  if (!existsSync(manifest)) return runs
  for (const entry of JSON.parse(readFileSync(manifest, 'utf8')) as ManifestEntry[]) {
    if (!entry.isRepresentativeRun) continue
    runs.set(new URL(entry.url).pathname, JSON.parse(readFileSync(entry.jsonPath, 'utf8')))
  }
  return runs
}

/** Whether every category and metric of this run meets the budget. */
function meetsBudget(report: Report, formFactor: FormFactor): boolean {
  const { categories, metrics } = budget.formFactors[formFactor]
  const score = (value: number | null | undefined) => Math.round((value ?? 0) * 100)
  return (
    Object.entries(categories).every(
      ([id, min]) => score(report.categories[id as Category]?.score) >= min,
    ) && Object.entries(metrics).every(([id, min]) => score(report.audits[id]?.score) >= min)
  )
}

const results = Object.fromEntries(FORM_FACTORS.map((ff) => [ff, medianRuns(ff)])) as Record<
  FormFactor,
  Map<string, Report>
>
const paths = [...new Set(FORM_FACTORS.flatMap((ff) => [...results[ff].keys()]))]

if (!paths.length) {
  process.stdout.write('_No web performance results (the audit did not run)._\n')
  process.exit(0)
}

const header = FORM_FACTORS.flatMap((ff) => CATEGORIES.map(([, label]) => `${ff} ${label}`))
const lines = [
  `| Page | ${header.join(' | ')} | Budget |`,
  `| --- | ${header.map(() => '---:').join(' | ')} | :---: |`,
]
let failing = 0
for (const path of paths) {
  const cells: string[] = []
  let ok = true
  for (const ff of FORM_FACTORS) {
    const report = results[ff].get(path)
    if (!report || !meetsBudget(report, ff)) ok = false
    const min = budget.formFactors[ff].categories
    for (const [id] of CATEGORIES) {
      const value = report ? Math.round((report.categories[id].score ?? 0) * 100) : null
      cells.push(value === null ? '–' : value >= min[id] ? `${value}` : `**${value}**`)
    }
  }
  if (!ok) failing++
  lines.push(`| \`${path}\` | ${cells.join(' | ')} | ${ok ? '✅' : '❌'} |`)
}

const verdict = failing
  ? `❌ ${failing} of ${paths.length} pages below the budget (bold: under the minimum; a metric can fail on its own).`
  : `✅ All ${paths.length} pages meet the budget.`
process.stdout.write(
  `${verdict}\n\n${lines.join('\n')}\n\nMinimums: \`webPerformance.config.ts\` · median of ${FORM_FACTORS.map((ff) => `${budget.runs[ff]} ${ff}`).join(', ')} run(s) per page.\n`,
)
