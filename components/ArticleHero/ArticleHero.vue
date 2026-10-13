<script setup lang="ts">
import type { Image } from '~/types/content.types'

defineProps<{
  title: string
  excerpt: string
  magazineTo: string
  category?: { title: string; to: string }
  author?: { name: string; role?: string; photo?: Image }
  date: string
  dateTime: string
  readingTime: string
  cover?: Image
}>()

const { t } = useI18n()
// The cover is the page's largest image: it loads first; the author photo waits.
</script>

<template>
  <section data-section="article-hero" class="flex flex-col pt-8 pb-8 md:pt-12 md:pb-12 xl:pt-16">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[760px] md:w-[calc(100%-3rem)]">
      <nav :aria-label="t('article.breadcrumb')" class="text-muted mb-7 text-sm">
        <ol class="flex flex-wrap items-center gap-2">
          <li>
            <ULink :to="magazineTo" class="hover:text-primary underline underline-offset-4">
              {{ t('article.breadcrumb') }}
            </ULink>
          </li>
          <li v-if="category" class="flex items-center gap-2">
            <UIcon name="i-lucide-chevron-right" class="size-3" aria-hidden="true" />
            <ULink :to="category.to" class="hover:text-primary underline underline-offset-4">
              {{ category.title }}
            </ULink>
          </li>
        </ol>
      </nav>

      <UBadge
        v-if="category"
        :label="category.title"
        color="primary"
        variant="soft"
        class="rounded-xs px-3 py-1 text-xs font-bold uppercase"
      />
      <h1
        class="mt-4 text-[32px] leading-[1.05] font-black break-words hyphens-auto uppercase md:text-[40px] xl:text-[56px]"
      >
        {{ title }}
      </h1>
      <p class="text-muted mt-5 text-xl leading-8">{{ excerpt }}</p>

      <div v-if="author" class="mt-6 flex items-center gap-3">
        <NuxtImg
          v-if="author.photo"
          :src="author.photo.url"
          :alt="author.photo.alt"
          width="40"
          height="40"
          format="webp"
          loading="lazy"
          class="size-10 shrink-0 rounded-full object-cover object-[center_35%]"
        />
        <div class="text-muted min-w-0 text-xs leading-5">
          <p class="text-highlighted text-sm font-bold">{{ author.name }}</p>
          <p>
            <span v-if="author.role">{{ author.role }}<span aria-hidden="true"> · </span></span>
            <time :datetime="dateTime">{{ date }}</time>
            <span aria-hidden="true"> · </span>
            <span class="whitespace-nowrap">{{ readingTime }}</span>
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="cover"
      class="mt-8 w-full md:mx-auto md:mt-10 md:w-[calc(100%-3rem)] md:max-w-[1120px] xl:mt-12"
    >
      <NuxtImg
        :src="cover.url"
        :alt="cover.alt"
        width="1120"
        height="630"
        sizes="sm:100vw xl:1120px"
        format="webp"
        fetchpriority="high"
        :preload="{ fetchPriority: 'high' }"
        class="aspect-video w-full object-cover object-[center_35%] md:rounded-lg"
      />
    </div>
  </section>
</template>
