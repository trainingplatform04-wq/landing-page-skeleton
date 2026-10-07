import { defineCliConfig } from 'sanity/cli'

/** Sanity's own naming rules, checked up front for a readable error instead of a runtime crash. */
const ENV_RULES = {
  SANITY_STUDIO_PROJECT_ID: /^[a-z0-9-]+$/,
  SANITY_STUDIO_DATASET: /^~?[a-z0-9_-]{1,64}$/,
} as const

/**
 * CLI commands that serve or ship the Studio and therefore need real credentials.
 * Offline tooling (`schema extract`, `typegen`) evaluates this config in a worker
 * with no CLI arguments, so it stays credential-free, e.g. in CI.
 */
const COMMANDS_NEEDING_ENV = ['build', 'deploy', 'dev', 'start']

function assertEnv() {
  if (!COMMANDS_NEEDING_ENV.some((command) => process.argv.includes(command))) return
  const invalid = Object.entries(ENV_RULES)
    .filter(([name, pattern]) => !pattern.test(process.env[name] ?? ''))
    .map(([name]) => `${name}=${JSON.stringify(process.env[name] ?? '')}`)
  if (!invalid.length) return
  throw new Error(
    `[studio] Missing or invalid env: ${invalid.join(', ')}. See docs/deployment/DEPLOYMENT.md`,
  )
}

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },

  // `pnpm typegen` → schema.json → types/sanity.types.ts: the schema types groqd uses
  // to autocomplete and type the queries (the queries themselves are not scanned).
  schemaExtraction: {
    path: 'schema.json',
    enforceRequiredFields: true,
  },
  typegen: {
    path: [],
    schema: 'schema.json',
    generates: '../types/sanity.types.ts',
  },

  // Fail fast instead of serving or shipping a Studio bound to a missing or
  // invalid project/dataset (see COMMANDS_NEEDING_ENV).
  vite: (config) => {
    assertEnv()
    return config
  },
})
