import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

/**
 * Design gate (tests/visual/design.spec.ts), run through tests/visual/design.ts:
 * capture reads the Lovable prototype only; verify also builds and serves our app (production
 * build, as the client sees it: no dev-server compilation or reloads) on its own port, on the
 * developer's `.env` (the staging dataset, seeded with the design content).
 */
const APP_PORT = 3200
const capture = process.env.DESIGN_MODE === 'capture'

export default defineConfig({
  testDir: '.',
  testMatch: 'design.spec.ts',
  timeout: 90_000,
  workers: capture ? 1 : undefined,
  // Capture writes the prototype's stable screenshots as baselines; verify never updates them.
  updateSnapshots: capture ? 'all' : 'none',
  // Baselines live in the changeset: docs/design/changes/<change>/baseline/<name>.
  snapshotPathTemplate: `{testDir}/../../docs/design/changes/${process.env.DESIGN_CHANGE}/baseline/{arg}{ext}`,
  reporter: [['list'], ['html', { outputFolder: '../../playwright-report/design', open: 'never' }]],
  outputDir: '../../test-results/design',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${APP_PORT}`,
    deviceScaleFactor: 1,
  },
  webServer: capture
    ? undefined
    : {
        // A Nuxt production server does not read .env by itself: Node loads it.
        command: 'pnpm exec nuxt build && node --env-file=.env .output/server/index.mjs',
        // The repository root: from tests/visual/, Nuxt would find no app.
        cwd: fileURLToPath(new URL('../..', import.meta.url)),
        port: APP_PORT,
        timeout: 300_000,
        reuseExistingServer: false,
        env: { PORT: String(APP_PORT), NITRO_PRESET: 'node-server' },
      },
})
