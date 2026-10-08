import simpleImportSort from 'eslint-plugin-simple-import-sort'

import withNuxt from './.nuxt/eslint.config.mjs'

// Architecture rules live here (enforced), not only in docs (hoped for).
// See docs/conventions/ARCHITECTURE.md.
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
      'no-console': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use a composable wrapping useAsyncData instead.' },
        { name: '$fetch', message: 'Use a composable wrapping useAsyncData instead.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '#imports',
              message: 'Vue/Nuxt APIs are auto-imported; import project code from its `~/` file.',
            },
          ],
          patterns: [
            { group: ['../*'], message: 'Use the `~/` alias instead of parent-relative imports.' },
          ],
        },
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
            {
              name: '#imports',
              message: 'Vue/Nuxt APIs are auto-imported; import project code from its `~/` file.',
            },
            {
              name: '~/types/sanity.types',
              message: 'Views receive plain props; map the CMS data in a composable.',
            },
          ],
          patterns: [
            { group: ['../*'], message: 'Use the `~/` alias instead of parent-relative imports.' },
          ],
        },
      ],
    },
  },
  {
    // Loaded with nuxt.config.ts, before the `~/` alias exists: relative imports only.
    files: ['modules/**/*.ts'],
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
    // The Studio is a separate workspace that consumes the shared locale list.
    files: ['studio/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
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
)
