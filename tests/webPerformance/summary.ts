/**
 * `node tests/webPerformance/summary.ts`: the PageSpeed Insights results as a Markdown table (one
 * row per page, mobile and desktop, each category's median score), for the CI job summary and the
 * pull request report. Reads `.web-performance/results.json` (tests/webPerformance/webPerformance.ts).
 *
 * ✅ every score meets the target · 🟡 passes the minimum, under the target · ❌ under the minimum.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import budget, { type Category } from '../../webPerformance.config.ts'
import type { PageResult } from './webPerformance.ts'

const RESULTS = join('.web-performance', 'results.json')
const LABELS: Record<Category, string> = {
  performance: 'Perf',
  accessibility: 'A11y',
  'best-practices': 'BP',
  seo: 'SEO',
}

if (!existsSync(RESULTS)) {
  process.stdout.write('_No web performance results (the audit did not run)._\n')
  process.exit(0)
}

const results = JSON.parse(readFileSync(RESULTS, 'utf8')) as PageResult[]
const find = (formFactor: string, path: string) =>
  results.find((result) => result.formFactor === formFactor && result.path === path)
const paths = [...new Set(results.map(({ path }) => path))]

/** A score cell: bold under the minimum, italic under the target. */
function cell(score: number | undefined): string {
  if (score === undefined) return '–'
  if (score < budget.minimum) return `**${score}**`
  return score < budget.target ? `_${score}_` : `${score}`
}

const header = budget.formFactors.flatMap((ff) =>
  budget.categories.map((id) => `${ff} ${LABELS[id]}`),
)
const lines = [
  `| Page | ${header.join(' | ')} | Result |`,
  `| --- | ${header.map(() => '---:').join(' | ')} | :---: |`,
]
const count = { failing: 0, belowTarget: 0 }
for (const path of paths) {
  const pageResults = budget.formFactors.map((ff) => find(ff, path))
  // Every score counts, the performance metrics included (a metric can fail on its own).
  const lowest = Math.min(
    ...pageResults.flatMap((result) => (result ? Object.values(result.scores) : [0])),
  )
  const status = lowest < budget.minimum ? '❌' : lowest < budget.target ? '🟡' : '✅'
  if (status === '❌') count.failing++
  if (status === '🟡') count.belowTarget++
  const cells = pageResults.flatMap((result) =>
    budget.categories.map((id) => cell(result?.scores[id])),
  )
  lines.push(`| \`${path}\` | ${cells.join(' | ')} | ${status} |`)
}

const verdict = count.failing
  ? `❌ ${count.failing} of ${paths.length} pages under the ${budget.minimum} minimum.`
  : count.belowTarget
    ? `🟡 All ${paths.length} pages pass the ${budget.minimum} minimum; ${count.belowTarget} under the ${budget.target} target.`
    : `✅ All ${paths.length} pages meet the ${budget.target} target.`
process.stdout.write(
  `${verdict}\n\n${lines.join('\n')}\n\n` +
    `Target ${budget.target}, minimum ${budget.minimum} (\`webPerformance.config.ts\`), for every category and performance metric · **bold**: under the minimum · _italic_: under the target · median of 1 + ${budget.confirmationRuns} runs for pages under the minimum.\n`,
)
