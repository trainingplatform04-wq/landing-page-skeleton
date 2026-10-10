<script setup lang="ts">
import type { PostCard } from '~/types/content.types'

const props = withDefaults(
  defineProps<{
    post: PostCard
    /** `large` and `compact` open the magazine; `grid` lists the others. */
    variant?: 'large' | 'compact' | 'grid'
  }>(),
  { variant: 'grid' },
)

const large = computed(() => props.variant === 'large')
const compact = computed(() => props.variant === 'compact')
</script>

<template>
  <article class="h-full min-w-0">
    <ULink
      :to="post.to"
      class="group border-default bg-default text-default focus-visible:outline-primary flex h-full min-w-0 flex-col overflow-hidden rounded-lg border transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      :class="{ 'flex-row md:flex-col': compact }"
    >
      <div
        class="aspect-16/10 shrink-0 overflow-hidden"
        :class="{
          'm-3 aspect-square w-24 self-start rounded-sm md:m-0 md:aspect-16/10 md:w-full md:rounded-none':
            compact,
        }"
      >
        <NuxtImg
          v-if="post.image"
          :src="post.image.url"
          :alt="post.image.alt"
          width="640"
          height="400"
          :sizes="large ? 'sm:100vw xl:900px' : 'sm:100vw md:50vw xl:440px'"
          class="h-full w-full object-cover object-[center_35%] transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div
        class="flex min-w-0 flex-1 flex-col p-6"
        :class="{ 'md:p-8 xl:p-9': large, 'py-3 pr-3 pl-0 md:p-5': compact }"
      >
        <UBadge
          v-if="post.category"
          :label="post.category"
          color="primary"
          variant="soft"
          class="w-fit rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase"
        />
        <h2
          class="group-hover:text-primary mt-3 text-[28px] leading-[1.05] font-black break-words hyphens-auto uppercase transition-colors duration-300 motion-reduce:transition-none"
          :class="{ 'text-4xl md:text-5xl': large, 'mt-2 text-2xl md:text-[28px]': compact }"
        >
          {{ post.title }}
        </h2>
        <p
          v-if="!compact"
          class="text-muted mt-3 text-sm leading-6"
          :class="{ 'line-clamp-2': !large }"
        >
          {{ post.excerpt }}
        </p>

        <div
          class="text-muted mt-auto flex items-center gap-2 pt-5 text-[11px] leading-5"
          :class="{ 'gap-3 text-xs': large, 'pt-3 text-[10px]': compact }"
        >
          <NuxtImg
            v-if="post.author?.photo"
            :src="post.author.photo.url"
            :alt="post.author.photo.alt"
            :width="large ? 32 : 24"
            :height="large ? 32 : 24"
            class="size-6 shrink-0 rounded-full object-cover object-[center_35%]"
            :class="{ 'size-8': large }"
          />
          <p class="min-w-0">
            <span v-if="post.author" class="text-highlighted font-semibold">{{
              post.author.name
            }}</span>
            <span v-if="post.author" aria-hidden="true"> · </span>
            <time :datetime="post.dateTime">{{ post.date }}</time>
            <span aria-hidden="true"> · </span>
            <span class="whitespace-nowrap">{{ post.readingTime }}</span>
          </p>
        </div>
      </div>
    </ULink>
  </article>
</template>
