import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, type Page, test } from '@playwright/test'

/**
 * Design gate (docs/design/DESIGN_WORKFLOW.md §13). One test per section × locale × width of a
 * design changeset, described by its `verify.json`. Playwright only ever renders **our** app;
 * the Lovable prototype is read through the Lovable MCP server, never opened in a browser.
 *
 * - capture (`pnpm design:capture <change>`): screenshots every listed section of our app into
 *   the changeset's `baseline/`. The human compares them with the Lovable preview; once they
 *   approve, the baselines are committed.
 * - verify (`pnpm design:verify <change>`, before every PR): renders the same sections and
 *   compares them with the approved baselines, pixel by pixel, within the changeset's tolerance.
 */
interface SectionSpec {
  name: string
  /** Defaults to `[data-section="<name>"]`. */
  selector?: string
}

interface VerifySpec {
  app: { paths: Record<string, string> }
  sections: SectionSpec[]
  widths: number[]
  tolerance: { maxDiffPixelRatio: number; threshold: number }
}

const CHANGE = process.env.DESIGN_CHANGE ?? ''
const MODE = process.env.DESIGN_MODE === 'capture' ? 'capture' : 'verify'
const CHANGE_DIR = join(process.cwd(), 'docs/design/changes', CHANGE)
const spec = JSON.parse(readFileSync(join(CHANGE_DIR, 'verify.json'), 'utf8')) as VerifySpec

const selectorOf = ({ name, selector }: SectionSpec) => selector ?? `[data-section="${name}"]`
const baselineName = (section: string, locale: string, width: number) =>
  // Dashes only: Playwright turns other separators of snapshot names into dashes.
  `${section}-${locale}-${width}.png`

/**
 * Same rendering every time: fonts loaded, no motion, no caret, lazy images loaded, and the
 * sticky header kept in place, so it never covers the section being shot.
 */
async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' +
      'header{position:static!important}',
  })
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight)
    await document.fonts.ready
    await Promise.all(
      [...document.images].map((image) =>
        image.complete ? null : new Promise((done) => image.addEventListener('load', done)),
      ),
    )
    window.scrollTo(0, 0)
  })
}

test.describe.configure({ mode: MODE === 'capture' ? 'serial' : 'parallel' })

/** The browser language decides redirects (`/` → `/en`): each locale is rendered in its own. */
const BROWSER_LOCALES: Record<string, string> = { de: 'de-DE', en: 'en-US' }

for (const locale of Object.keys(spec.app.paths)) {
  test.describe(locale, () => {
    test.use({ locale: BROWSER_LOCALES[locale] ?? locale })

    for (const width of spec.widths) {
      for (const section of spec.sections) {
        const name = baselineName(section.name, locale, width)

        test(`${section.name} · ${locale} · ${width}`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 })

          if (MODE === 'verify') {
            expect(existsSync(join(CHANGE_DIR, 'baseline', name)), `baseline ${name}`).toBe(true)
          }
          await page.goto(spec.app.paths[locale]!, { waitUntil: 'networkidle' })
          await settle(page)
          const target = page.locator(selectorOf(section)).first()
          await expect(target, `section "${section.name}" (${MODE})`).toBeVisible()

          // Both modes use Playwright's stable screenshot (two identical frames in a row): capture
          // writes it as the baseline (updateSnapshots: 'all'), verify compares with it.
          await expect(target).toHaveScreenshot(name, {
            animations: 'disabled',
            maxDiffPixelRatio: spec.tolerance.maxDiffPixelRatio,
            threshold: spec.tolerance.threshold,
          })
        })
      }
    }
  })
}
