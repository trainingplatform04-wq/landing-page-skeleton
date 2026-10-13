<script setup lang="ts">
import type { Image } from '~/types/content.types'

const props = defineProps<{
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
const breadcrumb = computed(() => [
  { label: t('article.breadcrumb'), to: props.magazineTo },
  ...(props.category ? [{ label: props.category.title, to: props.category.to }] : []),
])
// The cover is the page's largest image: it loads first; the author photo waits.
</script>

<template>
  <section data-section="article-hero" class="flex flex-col pt-8 pb-8 md:pt-12 md:pb-12 xl:pt-16">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[760px] md:w-[calc(100%-3rem)]">
      <UBreadcrumb
        :items="breadcrumb"
        :aria-label="t('article.breadcrumb')"
        separator-icon="i-lucide-chevron-right"
        class="mb-7"
        :ui="{ link: 'text-sm text-muted underline underline-offset-4 hover:text-primary' }"
      />

      <UBadge
        v-if="category"
        :label="category.title"
        color="neutral"
        variant="soft"
        class="bg-elevated text-highlighted rounded-xs px-3 py-1 text-xs font-bold uppercase"
      />
      <h1
        class="mt-4 text-[32px] leading-[1.05] font-black break-words hyphens-auto uppercase md:text-[40px] xl:text-[56px]"
      >
        {{ title }}
      </h1>
      <p class="text-muted mt-5 text-xl leading-8">{{ excerpt }}</p>

      <UUser
        v-if="author"
        :name="author.name"
        :avatar="
          author.photo
            ? { src: author.photo.url, alt: author.photo.alt, loading: 'lazy' }
            : undefined
        "
        size="lg"
        class="mt-6"
        :ui="{
          name: 'text-highlighted text-sm font-bold',
          description: 'text-muted text-xs leading-5',
        }"
      >
        <template #description>
          <span v-if="author.role">{{ author.role }}<span aria-hidden="true"> · </span></span>
          <time :datetime="dateTime">{{ date }}</time>
          <span aria-hidden="true"> · </span>
          <span class="whitespace-nowrap">{{ readingTime }}</span>
        </template>
      </UUser>
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
