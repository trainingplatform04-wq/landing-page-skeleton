<script setup lang="ts">
import { useLegal } from '~/composables/useLegal/useLegal'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

const props = defineProps<{ type: 'imprintPage' | 'privacyPage' }>()

const legal = await useLegal(props.type)

usePageMeta(legal.seo)
</script>

<template>
  <div>
    <LegalContent :title="legal.title" :body="legal.body" :updated-at="legal.updatedAt" />
    <UContainer v-if="type === 'privacyPage'" class="pb-16">
      <CookieTable />
    </UContainer>
  </div>
</template>
