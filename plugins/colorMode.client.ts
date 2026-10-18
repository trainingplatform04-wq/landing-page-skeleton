import { COLOR_MODE_COOKIE } from '~/constants/consent.constants'

/**
 * The color-mode module stores `system` (follow the device) on the first visit. Only a scheme the
 * visitor picked is kept (TDDDG §25: storage for a function they asked for), so that default is
 * removed; without a cookie the module follows the device anyway.
 */
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  watch(
    () => colorMode.preference,
    (preference) => {
      if (preference !== 'system') return
      // After the module's own write of the same tick.
      void nextTick(() => {
        document.cookie = `${COLOR_MODE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
      })
    },
    { immediate: true },
  )
})
