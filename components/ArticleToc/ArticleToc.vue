<script setup lang="ts">
defineProps<{ items: Array<{ id: string; text: string }> }>()

const { t } = useI18n()
// ArticleEnhancer marks the heading being read with `aria-current` while the visitor scrolls.
</script>

<template>
  <nav :aria-label="t('article.toc')" class="space-y-1">
    <a
      v-for="item in items"
      :key="item.id"
      :href="`#${item.id}`"
      data-toc-link
      class="border-default text-muted hover:text-primary aria-[current]:border-primary aria-[current]:text-primary focus-visible:outline-primary block border-l-2 py-2 pl-4 text-sm leading-6 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 aria-[current]:font-bold motion-reduce:transition-none"
    >
      {{ item.text }}
    </a>
  </nav>
</template>
