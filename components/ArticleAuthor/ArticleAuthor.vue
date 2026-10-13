<script setup lang="ts">
import type { Image } from '~/types/content.types'

defineProps<{
  author: { name: string; firstName: string; role?: string; bio?: string; photo?: Image }
  magazineTo: string
}>()

const { t } = useI18n()
</script>

<template>
  <section data-section="article-author" class="pb-14 md:pb-20">
    <UCard
      variant="outline"
      class="mx-auto w-[calc(100%-2rem)] max-w-[760px] md:w-[calc(100%-3rem)]"
      :ui="{
        body: 'flex flex-col items-center gap-6 p-6 text-center sm:p-6 md:flex-row md:items-start md:p-8 md:text-left',
      }"
    >
      <NuxtImg
        v-if="author.photo"
        :src="author.photo.url"
        :alt="author.name"
        width="96"
        height="96"
        format="webp"
        loading="lazy"
        class="size-24 shrink-0 rounded-full object-cover object-[center_35%]"
      />
      <div class="min-w-0">
        <p class="text-muted text-xs font-semibold">{{ t('article.writtenBy') }}</p>
        <h2 class="mt-2 text-[32px] leading-none font-black break-words uppercase">
          {{ author.name }}
        </h2>
        <p v-if="author.role" class="text-primary mt-2 text-sm font-semibold">{{ author.role }}</p>
        <p v-if="author.bio" class="text-muted mt-4 text-sm leading-6">{{ author.bio }}</p>
        <ULink
          :to="magazineTo"
          class="hover:text-primary mt-5 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
        >
          {{ t('article.moreFrom', { name: author.firstName }) }}
          <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
        </ULink>
      </div>
    </UCard>
  </section>
</template>
