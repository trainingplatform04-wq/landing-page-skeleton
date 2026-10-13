<script setup lang="ts">
import { PortableText, type PortableTextComponents } from '@portabletext/vue'

import type { RichText } from '~/types/content.types'

defineProps<{ value: RichText }>()

const { t } = useI18n()
const ULink = resolveComponent('ULink')
const NuxtImg = resolveComponent('NuxtImg')
const UIcon = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')

/**
 * The video is a link to YouTube until ArticleEnhancer turns the click into the embedded player
 * (youtube-nocookie.com): nothing from YouTube loads before the click.
 */
const video = (videoId: string, title: string) =>
  h(
    'div',
    {
      'data-video': videoId,
      'data-video-title': title,
      class: 'bg-inverted text-inverted my-8 aspect-video overflow-hidden rounded-lg',
    },
    h(
      'div',
      {
        class:
          'flex h-full flex-col items-center justify-center gap-2 px-4 py-3 text-center md:gap-4',
      },
      [
        h(UIcon, {
          name: 'i-lucide-play',
          class: 'text-primary size-7 md:size-10',
          'aria-hidden': 'true',
        }),
        h(
          'p',
          { class: 'max-w-sm text-xl leading-tight font-black uppercase md:text-[28px]' },
          title,
        ),
        h('p', { class: 'text-xs opacity-70 md:text-sm' }, t('article.video.consent')),
        h(UButton, {
          to: `https://www.youtube.com/watch?v=${videoId}`,
          target: '_blank',
          size: 'sm',
          icon: 'i-lucide-play',
          label: t('article.video.load'),
          'data-video-load': '',
        }),
      ],
    ),
  )

const components: PortableTextComponents = {
  block: {
    normal: (_, { slots }) => h('p', { class: 'my-6 first:mt-0' }, slots.default?.()),
    h2: ({ value }, { slots }) =>
      h(
        'h2',
        {
          id: 'anchor' in value ? String(value.anchor) : undefined,
          class:
            'mt-10 mb-5 scroll-mt-26 text-[28px] leading-[1.1] font-black break-words hyphens-auto uppercase md:text-[32px] xl:text-[36px]',
        },
        slots.default?.(),
      ),
    h3: (_, { slots }) =>
      h(
        'h3',
        {
          class:
            'mt-8 mb-4 scroll-mt-26 text-2xl leading-tight font-black break-words hyphens-auto uppercase md:text-[28px]',
        },
        slots.default?.(),
      ),
  },
  list: {
    bullet: (_, { slots }) =>
      h(
        'ul',
        { class: 'marker:text-primary my-6 list-disc space-y-3 pl-6 marker:font-bold' },
        slots.default?.(),
      ),
    number: (_, { slots }) =>
      h(
        'ol',
        { class: 'marker:text-primary my-6 list-decimal space-y-3 pl-6 marker:font-bold' },
        slots.default?.(),
      ),
  },
  marks: {
    link: ({ value }, { slots }) =>
      value.href
        ? h(
            ULink,
            {
              to: value.href,
              target: value.external && value.href.startsWith('https://') ? '_blank' : undefined,
              class: 'text-primary underline underline-offset-4',
            },
            slots.default,
          )
        : slots.default?.(),
  },
  types: {
    coachTip: ({ value }) =>
      h('aside', { class: 'border-primary bg-elevated my-8 border-l-4 p-5 md:p-6' }, [
        h('p', { class: 'mb-2 flex items-center gap-2 text-sm font-bold' }, [
          h(UIcon, {
            name: 'i-lucide-lightbulb',
            class: 'text-primary size-5',
            'aria-hidden': 'true',
          }),
          t('article.coachTip'),
        ]),
        h('p', { class: 'text-base leading-7' }, value.text),
      ]),
    pullQuote: ({ value }) =>
      h('figure', { class: 'border-default my-9 border-y py-7' }, [
        h(
          'span',
          {
            class: 'text-primary block h-10 text-7xl leading-none font-black',
            'aria-hidden': 'true',
          },
          '“',
        ),
        h(
          'blockquote',
          { class: 'mt-3 text-[26px] leading-tight font-black uppercase md:text-[32px]' },
          value.text,
        ),
        value.attribution
          ? h('figcaption', { class: 'text-muted mt-4 text-sm' }, value.attribution)
          : null,
      ]),
    figure: ({ value }) =>
      value.image?.url
        ? h('figure', { class: 'my-7' }, [
            h(NuxtImg, {
              src: value.image.url,
              alt: value.image.alt ?? '',
              width: 1080,
              height: 720,
              sizes: 'sm:100vw md:720px',
              format: 'webp',
              loading: 'lazy',
              class: 'aspect-3/2 w-full rounded-lg object-cover',
            }),
            value.caption
              ? h('figcaption', { class: 'text-muted mt-3 text-sm' }, value.caption)
              : null,
          ])
        : null,
    youtubeVideo: ({ value }) => (value.videoId ? video(value.videoId, value.title ?? '') : null),
  },
}
</script>

<template>
  <PortableText :value="value" :components="components" />
</template>
