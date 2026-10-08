import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, type Page, test } from '@playwright/test'

/**
 * Design gate (docs/design/DESIGN_WORKFLOW.md §13). One test per section × locale × width of a
 * design changeset, described by its `verify.json`:
 *
 * - capture (`pnpm design:capture <change>`, at gate D2): screenshots every section of the
 *   approved Lovable prototype into the changeset's `baseline/`, and lists the pictures each
 *   section shows in `pictures.json` (address, alt text, locale). No picture is stored in the
 *   repository: the seed downloads them from there and uploads them to Sanity.
 * - verify (`pnpm design:verify <change>`, before the PR): renders the same sections of our Nuxt
 *   app and compares them with the baselines, pixel by pixel, within the changeset's tolerance.
 */
interface SectionSpec {
  name: string
  /** Defaults to `[data-section="<name>"]`. */
  selector?: string
}

interface VerifySpec {
  reference: { baseUrl: string; paths: Record<string, string> }
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

/** Same rendering on both sides: fonts loaded, no motion, no caret, lazy images loaded. */
async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
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

/** The pictures a section shows: where they come from and their alt text (no file is stored). */
async function listPictures(page: Page, section: SectionSpec, locale: string) {
  const pictures = await page.locator(`${selectorOf(section)} img`).evaluateAll((images) =>
    images.map((image) => ({
      source: (image as HTMLImageElement).currentSrc,
      alt: (image as HTMLImageElement).alt,
    })),
  )
  return pictures.map((picture, position) => ({
    section: section.name,
    position: position + 1,
    locale,
    ...picture,
  }))
}

test.describe.configure({ mode: MODE === 'capture' ? 'serial' : 'parallel' })

const pictureIndex: unknown[] = []

/** The browser language decides redirects (`/` → `/en`): each locale is rendered in its own. */
const BROWSER_LOCALES: Record<string, string> = { de: 'de-DE', en: 'en-US' }

for (const locale of Object.keys(spec.reference.paths)) {
  test.describe(locale, () => {
    test.use({ locale: BROWSER_LOCALES[locale] ?? locale })

    for (const width of spec.widths) {
      for (const section of spec.sections) {
        const name = baselineName(section.name, locale, width)

        test(`${section.name} · ${locale} · ${width}`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 })

          const capture = MODE === 'capture'
          if (!capture) {
            expect(existsSync(join(CHANGE_DIR, 'baseline', name)), `baseline ${name}`).toBe(true)
          }
          await page.goto(
            capture
              ? `${spec.reference.baseUrl}${spec.reference.paths[locale]}`
              : spec.app.paths[locale]!,
            { waitUntil: 'networkidle' },
          )
          await settle(page)
          const target = page.locator(selectorOf(section)).first()
          await expect(target, `section "${section.name}" (${MODE})`).toBeVisible()

          // Pictures are the same at every width: take them once, from the widest.
          if (capture && width === Math.max(...spec.widths)) {
            pictureIndex.push(...(await listPictures(page, section, locale)))
          }

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

test.afterAll(() => {
  if (MODE !== 'capture' || !pictureIndex.length) return
  writeFileSync(join(CHANGE_DIR, 'pictures.json'), `${JSON.stringify(pictureIndex, null, 2)}\n`)
})
