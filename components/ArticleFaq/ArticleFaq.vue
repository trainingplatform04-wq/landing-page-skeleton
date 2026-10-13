<script setup lang="ts">
defineProps<{ items: Array<{ question: string; answer: string }> }>()

const { t } = useI18n()
// Native `<details>`: opens and closes without JavaScript; several can be open at once.
</script>

<template>
  <section v-if="items.length" data-section="article-faq" class="pb-12 md:pb-16">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[760px] md:w-[calc(100%-3rem)]">
      <h2
        class="mb-7 text-[32px] leading-tight font-black break-words hyphens-auto uppercase md:text-4xl"
      >
        {{ t('article.faq') }}
      </h2>
      <div class="border-default border-t">
        <details v-for="item in items" :key="item.question" class="group border-default border-b">
          <summary
            class="focus-visible:outline-primary flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[18px] leading-7 font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
          >
            {{ item.question }}
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </summary>
          <p class="text-muted pr-6 pb-5 text-base leading-7">{{ item.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>
