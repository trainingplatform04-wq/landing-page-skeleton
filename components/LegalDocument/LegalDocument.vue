<script setup lang="ts">
import { useLegal } from '~/composables/useLegal/useLegal'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

const props = defineProps<{ type: 'imprintPage' | 'privacyPage' }>()

// A legal page's content: rendered on the server only (its page never hydrates it), so its
// data and code stay out of the page's first JavaScript.
const legal = await useLegal(props.type)

usePageMeta(legal.seo)
</script>

<template>
  <LegalContent :title="legal.title" :body="legal.body" :updated-at="legal.updatedAt" />
</template>
