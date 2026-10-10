<script setup lang="ts">
import type { MagazineTab, PostCard } from '~/types/content.types'

defineProps<{
  tabs: MagazineTab[]
  posts: PostCard[]
  /** Page links, the first page at index 0; empty for a single page. */
  pages: string[]
  page: number
  allTo: string
  /** A category is selected: an empty list offers the link back to all articles. */
  filtered: boolean
  /** The featured block shows articles: an empty grid is then not "no articles". */
  hasFeatured: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <section data-section="magazine-grid" class="py-10 md:py-14 xl:py-16">
    <UContainer>
      <nav
        :aria-label="t('magazine.categoriesLabel')"
        class="mb-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <UButton
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          :label="tab.label"
          :variant="tab.active ? 'solid' : 'outline'"
          :color="tab.active ? 'primary' : 'neutral'"
          :aria-current="tab.active ? 'page' : undefined"
          class="h-10 shrink-0 rounded-full px-5 font-bold"
        />
      </nav>

      <div v-if="posts.length" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
      </div>
      <div
        v-else-if="!hasFeatured"
        class="border-default flex min-h-64 flex-col items-center justify-center gap-3 border-y py-12 text-center"
      >
        <p class="text-muted">{{ filtered ? t('magazine.empty') : t('magazine.none') }}</p>
        <UButton v-if="filtered" :to="allTo" :label="t('magazine.showAll')" variant="link" />
      </div>

      <UPagination
        v-if="pages.length > 1"
        :page="page"
        :total="pages.length"
        :items-per-page="1"
        :to="(target: number) => pages[target - 1]"
        :aria-label="t('magazine.paginationLabel')"
        class="mt-10 flex justify-center"
      />
    </UContainer>
  </section>
</template>
