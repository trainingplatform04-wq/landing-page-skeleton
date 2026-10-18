/**
 * The PageSpeed Insights budget of every page, mobile and desktop (rules: CODING_STANDARDS §7.1).
 * Each page template is measured once, in the default language: the budget holds for every page.
 * `target`: what every page aims for; `minimum`: below it, a score blocks the PR. The median of
 * `runs` decides; a page under the minimum gets `confirmationRuns` more, so noise never blocks.
 * Raising a number is free; lowering one is a Tech Lead decision recorded in the PR.
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
  /** Runs of every page; the median of each score is judged. */
  runs: number
  /** Extra runs for a page whose median is below the minimum; the median of all its runs decides. */
  confirmationRuns: number
  /** PageSpeed strategies: `mobile` (throttled phone) and `desktop`. */
  formFactors: Array<'mobile' | 'desktop'>
  /**
   * Pages with a slug belong to editors and share one template, so the audit takes one published
   * example of each such template, in the default language (from the development seed, which the
   * Feature deployment reads).
   */
  slugPages: string[]
  categories: Category[]
  metrics: Metric[]
}

export default {
  target: 90,
  minimum: 80,
  runs: 3,
  confirmationRuns: 2,
  formFactors: ['mobile', 'desktop'],
  slugPages: ['/angebote/personal-training', '/magazin/protein-ohne-pulver'],
  categories: ['performance', 'accessibility', 'best-practices', 'seo'],
  metrics: [
    'first-contentful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
  ],
} satisfies WebPerformanceBudget
