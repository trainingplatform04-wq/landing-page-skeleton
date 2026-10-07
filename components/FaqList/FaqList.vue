<script setup lang="ts">
import type { FaqItem } from '~/types/content.types'

const props = defineProps<{ items: FaqItem[] }>()

const accordionItems = computed(() =>
  props.items.map(({ id, question, answer }) => ({ value: id, label: question, answer })),
)
</script>

<template>
  <UAccordion :items="accordionItems" type="multiple">
    <template #body="{ item }">
      <RichText :value="item.answer" />
    </template>
  </UAccordion>
</template>
