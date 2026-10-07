import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        // Pure functions: plain Node, no Nuxt boot.
        resolve: { alias: { '~': fileURLToPath(new URL('.', import.meta.url)) } },
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            'utils/**/*.spec.ts',
            'studio/utils/**/*.spec.ts',
            'tests/orchestration/**/*.spec.ts',
          ],
        },
      },
      await defineVitestProject({
        // Components and composables: real Nuxt runtime (i18n, Nuxt UI, async data).
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['components/**/*.spec.ts', 'composables/**/*.spec.ts'],
          hookTimeout: 60_000,
        },
      }),
    ],
    coverage: {
      provider: 'v8',
      include: ['components/**', 'composables/**', 'utils/**', 'studio/utils/**'],
      exclude: ['**/*.spec.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
