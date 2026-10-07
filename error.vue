<script setup lang="ts">
import { useSiteHead } from '~/composables/useSiteHead/useSiteHead'

import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const translatedError = computed(() => {
  const kind = props.error.status === 404 ? 'notFound' : 'server'
  return {
    status: props.error.status,
    statusText: t(`errors.${kind}.title`),
    message: t(`errors.${kind}.message`),
  }
})

useSiteHead()
useSeoMeta({ title: () => translatedError.value.statusText })
</script>

<template>
  <UApp>
    <UError
      :error="translatedError"
      :clear="{ label: t('errors.backHome') }"
      :redirect="localePath('index')"
    />
  </UApp>
</template>
