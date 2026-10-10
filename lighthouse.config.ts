/**
 * The web performance budget: the minimum Lighthouse score (0–100) of every KPI, on every page
 * of the site, in every language. `pnpm lighthouse` and the CI job "Lighthouse" fail when the
 * median of `runs` runs of any page scores below its minimum (tests/lighthouse/lighthouse.ts).
 *
 * Scores, not raw values: Lighthouse maps each metric to a 0–100 score with its own curve per
 * form factor (https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).
 * For reference, a score of 90 is Lighthouse's "good" point: mobile FCP 1.8 s, LCP 2.5 s,
 * TBT 200 ms, Speed Index 3.4 s; desktop FCP 0.9 s, LCP 1.2 s, TBT 150 ms, Speed Index 1.3 s;
 * CLS 0.1 on both. 95 asks for clearly better than these.
 *
 * Raise a minimum freely; lowering one is a decision for the Tech Lead, recorded in the PR.
 */

/** Lighthouse categories: the four grades of the report. */
export interface CategoryBudget {
  performance: number
  accessibility: number
  'best-practices': number
  seo: number
}

/** The metrics behind the Performance grade (Lighthouse audit ids). */
export interface MetricBudget {
  'first-contentful-paint': number
  'largest-contentful-paint': number
  'total-blocking-time': number
  'cumulative-layout-shift': number
  'speed-index': number
}

export interface LighthouseBudget {
  /**
   * Runs per page and form factor; the median run is judged. Mobile scores move ±3–5 points
   * between runs (simulated slow 4G): 3 runs. Desktop scores barely move: 1 run.
   */
  runs: Record<'mobile' | 'desktop', number>
  /** Minimum scores per form factor: `mobile` is Lighthouse's throttled phone, `desktop` its preset. */
  formFactors: Record<'mobile' | 'desktop', { categories: CategoryBudget; metrics: MetricBudget }>
}

/** Every performance metric at the same minimum. */
const metrics = (min: number): MetricBudget => ({
  'first-contentful-paint': min,
  'largest-contentful-paint': min,
  'total-blocking-time': min,
  'cumulative-layout-shift': min,
  'speed-index': min,
})

export default {
  runs: { mobile: 3, desktop: 1 },
  formFactors: {
    // Mobile performance is simulated on a slow 4G phone and moves a few points between runs:
    // 90 is Google's "good" line, a stable gate (decided by the owner, 2026-10-10).
    mobile: {
      categories: { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 },
      metrics: metrics(90),
    },
    desktop: {
      categories: { performance: 95, accessibility: 95, 'best-practices': 95, seo: 95 },
      metrics: metrics(95),
    },
  },
} satisfies LighthouseBudget
