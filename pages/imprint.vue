<script setup lang="ts">
import { useLegal } from '~/composables/useLegal/useLegal'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

const legal = await useLegal('imprintPage')

usePageMeta(legal.seo)
</script>

<template>
  <LegalContent :title="legal.title" :body="legal.body" :updated-at="legal.updatedAt" />
</template>
