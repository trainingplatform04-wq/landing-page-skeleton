/**
 * The PageSpeed Insights budget of every page, mobile and desktop (rules: CODING_STANDARDS §7.1).
 * Each page template is measured once, in the default language: the budget holds for every page.
 * `target`: what every page aims for; `minimum`: below it, a score blocks the PR. One run per
 * page on mobile and one on desktop decides.
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
  /**
   * Google runs PageSpeed on machines of different speeds (Lighthouse's benchmark index), and a
   * slow one lowers the scores of the same page. A run on a machine under this index is made again,
   * up to `slowMachineReruns` times; the run from the fastest machine counts.
   */
  minimumBenchmarkIndex: number
  slowMachineReruns: number
  /** PageSpeed strategies: `mobile` (throttled phone) and `desktop`. */
  formFactors: Array<'mobile' | 'desktop'>
  /**
   * Pages with a slug belong to editors and share one template, so the audit takes one published
   * example of each such template, in the default language (from the development seed, which the
   * Feature deployment reads). Both documents stay published on Development, or every pull
   * request's Web performance fails.
   */
  slugPages: string[]
  categories: Category[]
  metrics: Metric[]
}

export default {
  target: 90,
  minimum: 80,
  minimumBenchmarkIndex: 600,
  slowMachineReruns: 3,
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
