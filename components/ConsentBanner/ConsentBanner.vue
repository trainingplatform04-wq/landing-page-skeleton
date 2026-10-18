<script setup lang="ts">
import {
  CONSENT_COOKIE,
  CONSENT_QUEUE,
  CONSENT_REVISION,
  offeredCategories,
} from '~/constants/consent.constants'
import { consentQueueScript } from '~/utils/consent/consent.utils'

const { t } = useI18n()
const { public: config } = useRuntimeConfig()
const description = computed(() =>
  t(
    offeredCategories(config.gtmId).includes('statistics')
      ? 'consent.description'
      : 'consent.descriptionNoStatistics',
  ),
)
const localePath = useLocalePath()

// Server HTML, so it paints with the page instead of becoming a late "largest element". Shown
// until the visitor has chosen for the current revision; plugins/consent.client.ts removes it.
const stored = useCookie<{ revision?: number } | null>(CONSENT_COOKIE, { readonly: true })
const answered = computed(() => stored.value?.revision === CONSENT_REVISION)

useHead(() =>
  answered.value
    ? {}
    : { script: [{ key: 'consent-queue', innerHTML: consentQueueScript(CONSENT_QUEUE) }] },
)
</script>

<template>
  <div
    v-if="!answered"
    id="consent-banner"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
    data-nosnippet
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      class="bg-default ring-default w-full max-w-md rounded-lg p-6 shadow-xl ring"
    >
      <h2 id="consent-title" class="text-highlighted text-lg font-bold">
        {{ t('consent.title') }}
      </h2>
      <p id="consent-description" class="text-muted mt-3 text-sm leading-6">
        {{ description }}
      </p>
      <div class="mt-5 grid grid-cols-2 gap-3">
        <UButton
          data-consent="accept-all"
          color="neutral"
          variant="solid"
          class="justify-center"
          :label="t('consent.acceptAll')"
        />
        <UButton
          data-consent="reject-all"
          color="neutral"
          variant="solid"
          class="justify-center"
          :label="t('consent.rejectAll')"
        />
        <UButton
          data-consent="settings"
          color="neutral"
          variant="outline"
          class="col-span-2 justify-center"
          :label="t('consent.settings')"
        />
      </div>
      <p class="text-muted mt-4 flex gap-4 text-xs">
        <ULink :to="localePath('privacy')" class="underline underline-offset-4">
          {{ t('footer.privacy') }}
        </ULink>
        <ULink :to="localePath('imprint')" class="underline underline-offset-4">
          {{ t('footer.imprint') }}
        </ULink>
      </p>
    </section>
  </div>
</template>
