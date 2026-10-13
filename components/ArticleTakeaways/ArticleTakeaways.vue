<script setup lang="ts">
defineProps<{ items: string[] }>()

const { t } = useI18n()
</script>

<template>
  <section v-if="items.length" data-section="article-takeaways" class="pb-8 md:pb-12">
    <div
      class="border-primary/15 bg-primary/5 mx-auto w-[calc(100%-2rem)] max-w-[760px] rounded-lg border p-6 md:w-[calc(100%-3rem)] md:p-8"
    >
      <h2 class="flex items-center gap-2 text-base font-bold">
        <UIcon name="i-lucide-list-checks" class="text-primary size-5" aria-hidden="true" />
        {{ t('article.takeaways') }}
      </h2>
      <ul class="mt-5 space-y-3">
        <li v-for="item in items" :key="item" class="flex items-start gap-3 text-[15px] leading-6">
          <UIcon
            name="i-lucide-check"
            class="text-primary mt-1 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
