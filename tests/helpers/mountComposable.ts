import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'

/**
 * Runs an async composable inside a real component setup (i18n, router and
 * async data need an active instance) and returns its result. `route` sets the
 * current URL (and with it the active locale).
 */
export async function mountComposable<T>(
  composable: () => Promise<T>,
  options: { route?: string } = {},
): Promise<T> {
  let result: T | undefined
  await mountSuspended(
    defineComponent({
      async setup() {
        result = await composable()
        return () => h('div')
      },
    }),
    options,
  )
  return result as T
}
