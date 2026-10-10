/**
 * The web performance budget, measured by Google PageSpeed Insights on a deployed URL, on every
 * page of the site in every language, mobile and desktop (tests/webPerformance/webPerformance.ts).
 *
 * - `target` (90): what every page aims for. Pages between `minimum` and `target` pass but are
 *   flagged "below target" in the PR report: improve them.
 * - `minimum` (80): the gate. Any category or performance metric below it blocks the PR.
 *
 * Scores, not raw values: PageSpeed Insights maps each metric to a 0–100 score with its own curve
 * per form factor (https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).
 * A score of 90 is Google's "good" point: mobile FCP 1.8 s, LCP 2.5 s, TBT 200 ms, Speed Index
 * 3.4 s; desktop FCP 0.9 s, LCP 1.2 s, TBT 150 ms, Speed Index 1.3 s; CLS 0.1 on both.
 *
 * A single PageSpeed run moves 10–25 points on an unchanged page (measured on this site): every
 * page is measured once, and a page below the minimum gets `confirmationRuns` more runs; the
 * median decides, so a one-off sample cannot block a PR and a real regression still does.
 *
 * Raise the numbers freely; lowering one is a decision for the Tech Lead, recorded in the PR.
 */

/** The four categories of the PageSpeed Insights report. */
export type Category = 'performance' | 'accessibility' | 'best-practices' | 'seo'

/** The metrics behind the Performance grade (PageSpeed Insights audit ids). */
export type Metric =
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'total-blocking-time'
  | 'cumulative-layout-shift'
  | 'speed-index'

export interface WebPerformanceBudget {
  /** Score every page aims for (0–100). */
  target: number
  /** Score below which the PR is blocked (0–100), for every category and metric. */
  minimum: number
  /** Extra runs for a page below the minimum; the median of all its runs decides. */
  confirmationRuns: number
  /** PageSpeed strategies: `mobile` (throttled phone) and `desktop`. */
  formFactors: Array<'mobile' | 'desktop'>
  categories: Category[]
  metrics: Metric[]
}

export default {
  target: 90,
  // Decided by the owner (2026-10-10): 90+ is the aim, 80 blocks.
  minimum: 80,
  confirmationRuns: 2,
  formFactors: ['mobile', 'desktop'],
  categories: ['performance', 'accessibility', 'best-practices', 'seo'],
  metrics: [
    'first-contentful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
  ],
} satisfies WebPerformanceBudget
