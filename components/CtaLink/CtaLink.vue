<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { Cta } from '~/types/content.types'

defineProps<{
  cta: Cta
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}>()
</script>

<template>
  <UButton
    :label="cta.label"
    :to="cta.to"
    :target="cta.external && cta.to.startsWith('https://') ? '_blank' : undefined"
    :size="size"
    :variant="variant"
  />
</template>
