<script setup lang="ts">
import type { RichText } from '~/types/content.types'

defineProps<{
  title: string
  body: RichText
  /** Already formatted: "5. Oktober 2026". */
  updatedAt?: string
}>()

const { t } = useI18n()
</script>

<template>
  <UContainer>
    <UPageHeader :title="title" />
    <UPageBody>
      <RichText :value="body" />
      <p v-if="updatedAt" class="text-muted mt-8 text-sm">
        {{ t('legal.updatedAt', { date: updatedAt }) }}
      </p>
    </UPageBody>
  </UContainer>
</template>
