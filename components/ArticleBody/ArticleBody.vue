<script setup lang="ts">
import type { RichText } from '~/types/content.types'

defineProps<{ toc: Array<{ id: string; text: string }>; body: RichText }>()

const { t } = useI18n()
// The progress bar, the current heading, the video and the share buttons come from
// ArticleEnhancer, which finds this HTML by its `data-` attributes. Without JavaScript the
// article still reads in full; the table of contents opens with no script (`<details>`).
</script>

<template>
  <section data-section="article-body" class="pb-10 md:pb-14">
    <div
      class="mx-auto w-[calc(100%-2rem)] max-w-[760px] md:w-[calc(100%-3rem)]"
      :class="{
        'xl:grid xl:max-w-[1120px] xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-20': toc.length,
      }"
    >
      <template v-if="toc.length">
        <aside class="hidden xl:block">
          <div class="sticky top-24">
            <p class="mb-5 text-sm font-bold">{{ t('article.toc') }}</p>
            <ArticleToc :items="toc" />
          </div>
        </aside>
        <details class="disclosure group border-default mb-5 border-y xl:hidden">
          <summary
            class="focus-visible:outline-primary flex cursor-pointer list-none items-center justify-between py-4 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
          >
            {{ t('article.toc') }}
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </summary>
          <div class="pb-4">
            <ArticleToc :items="toc" />
          </div>
        </details>
      </template>

      <div class="min-w-0 xl:max-w-[68ch]">
        <div data-article-text class="text-[18px] leading-[1.7]">
          <ArticleText :value="body" />
        </div>

        <div class="border-default mt-10 flex flex-wrap items-center gap-3 border-b pb-8 text-sm">
          <span class="mr-auto w-full font-bold md:w-auto">{{ t('article.share.label') }}</span>
          <UButton
            data-share-copy
            color="neutral"
            variant="outline"
            icon="i-lucide-copy"
            :label="t('article.share.copy')"
          />
          <UButton
            data-share-native
            hidden
            color="neutral"
            variant="outline"
            icon="i-lucide-share-2"
            :label="t('article.share.native')"
          />
        </div>
      </div>
    </div>
  </section>
</template>
