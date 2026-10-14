<script setup lang="ts">
import type { PostCard } from '~/types/content.types'

defineProps<{ posts: PostCard[] }>()

const { t } = useI18n()
const article = useRoute().path
</script>

<template>
  <section
    v-if="posts.length"
    data-section="article-related"
    class="border-default border-t pt-10 pb-14 md:pt-14 md:pb-20"
  >
    <UContainer>
      <h2 class="mb-7 text-4xl leading-none font-black uppercase md:text-5xl">
        {{ t('article.related') }}
      </h2>
      <div
        class="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible xl:grid-cols-3"
      >
        <div
          v-for="(post, index) in posts"
          :key="post.id"
          class="w-[85%] shrink-0 snap-start md:w-auto"
          :class="{ 'md:hidden xl:block': index === 2 }"
          data-track="related_click"
          :data-track-target="post.to"
          :data-track-article="article"
        >
          <PostCard :post="post" />
        </div>
      </div>
    </UContainer>
  </section>
</template>
