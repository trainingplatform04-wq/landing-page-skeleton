import { mountComposable } from '~~/tests/helpers/mountComposable'

/**
 * Runs a page composable that throws its 404/503 (rendered by error.vue) and returns
 * the thrown error, or `undefined` when it didn't throw.
 */
export function thrownBy(composable: () => Promise<unknown>, route?: string) {
  return mountComposable(
    async () => {
      try {
        await composable()
      } catch (error) {
        return error
      }
    },
    { route },
  )
}
