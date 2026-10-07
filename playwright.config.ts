import { defineConfig, devices } from '@playwright/test'

import { FIXTURE_CMS_ENV, SANITY_MOCK_URL } from './tests/e2e/sanity/fixtureCms.ts'

// Set PLAYWRIGHT_BASE_URL to test a deployed environment (post-deploy smoke)
// instead of booting a local server.
const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL

// Local runs: the app on its own port (never reuses your `npm run dev`), reading
// fixture content from a local GROQ server instead of the live CMS
// (tests/e2e/sanity/server.ts). Deterministic, no seed, no editor content needed.
const APP_PORT = 3100

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: remoteBaseUrl || `http://localhost:${APP_PORT}`,
    // A German browser by default, matching the default locale (`/` is never redirected).
    locale: 'de-DE',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: remoteBaseUrl
    ? undefined
    : [
        {
          command: 'node tests/e2e/sanity/server.ts',
          url: `${SANITY_MOCK_URL}/health`,
        },
        {
          command: process.env.CI ? 'npm run preview' : `npx nuxt dev --port ${APP_PORT}`,
          port: APP_PORT,
          env: {
            PORT: String(APP_PORT),
            ...FIXTURE_CMS_ENV,
          },
        },
      ],
})
