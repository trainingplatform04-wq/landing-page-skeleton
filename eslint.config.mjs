import simpleImportSort from 'eslint-plugin-simple-import-sort'

import withNuxt from './.nuxt/eslint.config.mjs'

// The architecture rules of docs/conventions/ARCHITECTURE.md that a machine can check.
const RESTRICTED_IMPORT_PATHS = [
  {
    name: '#imports',
    message: 'Vue/Nuxt APIs are auto-imported; import project code from its `~/` file.',
  },
]
const RESTRICTED_IMPORT_PATTERNS = [
  { group: ['../*'], message: 'Use the `~/` alias instead of parent-relative imports.' },
]

const DATA_FETCHING_IN_VIEW = [
  'useAsyncData',
  'useLazyAsyncData',
  'useFetch',
  'useSanity',
  'useSanityQuery',
].map((name) => ({
  selector: `CallExpression[callee.name='${name}']`,
  message: `${name}() is not allowed in views. Wrap data access in a composable (composables/).`,
}))

export default withNuxt(
  {
    ignores: ['types/sanity.types.ts', 'studio/dist/**', 'studio/.sanity/**', 'studio/schema.json'],
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // An empty list or a missing value is handled, not asserted away.
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use a composable wrapping useAsyncData instead.' },
        { name: '$fetch', message: 'Use a composable wrapping useAsyncData instead.' },
      ],
      'no-restricted-imports': [
        'error',
        { paths: RESTRICTED_IMPORT_PATHS, patterns: RESTRICTED_IMPORT_PATTERNS },
      ],
      'simple-import-sort/exports': 'error',
      // ① side effects, node:, Vue/Nuxt/libraries ② project (~/, ~~/, #app) ③ type-only
      // imports (the plugin marks them with a trailing \u0000) ④ siblings (./).
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\u0000', '^node:', '^@?\\w'], ['^~', '^#'], ['^[^.].*\\u0000$'], ['^\\.']],
        },
      ],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      // Prettier writes void elements as `<input />`: agree with it.
      'vue/html-self-closing': ['warn', { html: { void: 'always' } }],
    },
  },
  {
    files: ['components/**/*.vue', 'layouts/**/*.vue', 'pages/**/*.vue', 'app.vue', 'error.vue'],
    rules: {
      'no-restricted-syntax': ['error', ...DATA_FETCHING_IN_VIEW],
      // Views get plain props (types/content.types.ts); the CMS shape stays in composables.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...RESTRICTED_IMPORT_PATHS,
            {
              name: '~/types/sanity.types',
              message: 'Views receive plain props; map the CMS data in a composable.',
            },
          ],
          patterns: RESTRICTED_IMPORT_PATTERNS,
        },
      ],
    },
  },
  {
    // One door to the CMS: page composables call useCmsQuery, never the Sanity client.
    files: ['composables/**/*.ts'],
    ignores: ['composables/useCmsQuery/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='useSanity']",
          message: 'Query the CMS with useCmsQuery (composables/useCmsQuery).',
        },
      ],
    },
  },
  {
    // Loaded before the `~/` alias exists (modules/, with nuxt.config.ts) or run outside Nuxt
    // (Playwright, plain Node): relative imports only.
    files: ['modules/**/*.ts', 'tests/e2e/**/*.ts', 'tests/webPerformance/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // No server code in this frontend layer (CLAUDE.md § 4).
    files: ['server/**', 'api/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'Program', message: 'No server code: this project is a frontend layer.' },
      ],
    },
  },
  {
    // The Studio is its own workspace (Vite, `sanity exec`) without the `~/` alias: it reaches the
    // shared constants with relative imports.
    files: ['studio/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { paths: RESTRICTED_IMPORT_PATHS }],
    },
  },
  {
    // The seed is a Node command-line script, not app code: it downloads the demo pictures
    // (`fetch`) to upload them to Sanity. The "data only through composables" rule is the app's.
    files: ['studio/seed/**/*.ts'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
  {
    // Specs build partial documents and assert values they just created.
    files: ['**/*.spec.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // A Node command-line script calling Google's PageSpeed Insights API, not app code.
    files: ['tests/webPerformance/webPerformance.ts'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
)
