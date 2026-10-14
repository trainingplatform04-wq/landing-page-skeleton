<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { AnalyticsEvent } from '~/constants/analytics.constants'
import type { Cta } from '~/types/content.types'

defineProps<{
  cta: Cta
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  /** The event a click sends (with consent to statistics): `cta_click` unless a page says otherwise. */
  track?: AnalyticsEvent
}>()
</script>

<template>
  <UButton
    :label="cta.label"
    :to="cta.to"
    :target="cta.external && cta.to.startsWith('https://') ? '_blank' : undefined"
    :size="size"
    :variant="variant"
    :data-track="track ?? 'cta_click'"
    :data-track-label="cta.label"
  />
</template>
