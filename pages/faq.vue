<script setup lang="ts">
import { useFaq } from '~/composables/useFaq/useFaq'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

const faq = await useFaq()
const { t } = useI18n()

usePageMeta(faq.seo)
</script>

<template>
  <UContainer>
    <UPageHeader :title="faq.title" :description="faq.intro" />

    <UPageBody>
      <UEmpty v-if="!faq.items.length" icon="i-lucide-circle-help" :title="t('faq.empty')" />
      <FaqList v-else :items="faq.items" />
    </UPageBody>
  </UContainer>
</template>
