/**
 * Production build for the E2E suite (`pnpm build:e2e`, CI and local gates).
 *
 * The sitemap reads Sanity at build time, so the build gets the same fixture CMS as the
 * app at runtime (tests/e2e/sanity/server.ts): E2E stays hermetic and never depends on
 * staging content or availability. Deployments build with `vercel build` instead.
 *
 * Run by pnpm: `node tests/e2e/build.ts` (Node strips the types).
 */
import { execSync, spawn } from 'node:child_process'
import { get } from 'node:http'

import { FIXTURE_CMS_ENV, SANITY_MOCK_URL } from './sanity/fixtureCms.ts'

const isUp = () =>
  new Promise<boolean>((resolve) => {
    get(`${SANITY_MOCK_URL}/health`, (response) => resolve(response.statusCode === 200)).on(
      'error',
      () => resolve(false),
    )
  })

async function waitUntilUp(attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (await isUp()) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Fixture CMS did not start on ${SANITY_MOCK_URL}`)
}

const server = spawn(process.execPath, ['tests/e2e/sanity/server.ts'], { stdio: 'inherit' })

try {
  await waitUntilUp()
  execSync('pnpm exec nuxt build', {
    stdio: 'inherit',
    env: { ...process.env, ...FIXTURE_CMS_ENV },
  })
} finally {
  server.kill()
}
