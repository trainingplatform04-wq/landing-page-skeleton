import type { OptionalCategory } from '~/constants/consent.constants'

/** What the visitor allowed. Everything optional is off until they choose. */
export interface ConsentState {
  /** The visitor has answered the consent window (Accept, Reject or Settings). */
  decided: boolean
  statistics: boolean
  externalMedia: boolean
}

/**
 * The visitor's consent. On the server and until the consent window has run, nothing is
 * allowed, so nothing optional can load by mistake (GDPR, TDDDG §25). Only
 * `plugins/consent.client.ts` calls `record`, from the visitor's own choice.
 */
export function useConsent() {
  const state = useState<ConsentState>('consent', () => ({
    decided: false,
    statistics: false,
    externalMedia: false,
  }))

  return {
    state: readonly(state),
    allows: (category: OptionalCategory) => computed(() => state.value[category]),
    record: (choice: Record<OptionalCategory, boolean>) => {
      state.value = { decided: true, ...choice }
    },
  }
}
