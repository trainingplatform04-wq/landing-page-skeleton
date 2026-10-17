<script setup lang="ts">
import { useAnalytics } from '~/composables/useAnalytics/useAnalytics'
import { useArticleSlugs } from '~/composables/useArticleSlugs/useArticleSlugs'
import { useConsent } from '~/composables/useConsent/useConsent'

/**
 * The article's interactions, added to the server-rendered article (ArticleContent never
 * hydrates): the reading progress bar, the current heading in the table of contents, the video
 * player after the click (or at once with consent to external media), the share buttons with
 * their toast (Nuxt UI `useToast`), and the article's analytics events. It finds the article's HTML
 * by its `data-` attributes; the only data it carries is the article's slug per language.
 */

const { t } = useI18n()
const slugs = useArticleSlugs()
const setI18nParams = useSetI18nParams()
// The switcher links this article's own slug in the other language (set by ArticleContent).
if (slugs.value) setI18nParams(slugs.value)

const toast = useToast()
const progress = ref(0)
/** The sticky header's height until it is measured: the progress bar sits right below it. */
const HEADER_HEIGHT = 65
const header = ref(HEADER_HEIGHT)
let frame = 0

/** A heading is "being read" once its top passes this line below the header. */
const CURRENT_LINE = 120

const notify = (title: string, icon = 'i-lucide-check') => toast.add({ title, icon })
const { track } = useAnalytics()
const externalMedia = useConsent().allows('externalMedia')
let readToEnd = false

function update() {
  const text = document.querySelector<HTMLElement>('[data-article-text]')
  if (!text) return
  header.value = document.querySelector('header')?.getBoundingClientRect().height ?? header.value
  const { top, height } = text.getBoundingClientRect()
  const span = height - (window.innerHeight - header.value)
  progress.value = span <= 0 ? 1 : Math.min(1, Math.max(0, (header.value - top) / span))
  if (progress.value === 1 && !readToEnd) {
    readToEnd = true
    track('article_read', { article: window.location.pathname })
  }

  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')]
  const read = links.filter((link) => {
    const heading = document.getElementById(link.hash.slice(1))
    return heading && heading.getBoundingClientRect().top <= CURRENT_LINE
  })
  const current = read.at(-1)?.hash ?? links[0]?.hash
  for (const link of links) {
    if (link.hash === current) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  }
}

const schedule = () => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(update)
}

/**
 * Replaces a video poster with the player (youtube-nocookie.com). `play`: the visitor clicked it,
 * so it starts at once; otherwise it was loaded because they allowed external media.
 */
function loadVideo(box: HTMLElement, play: boolean) {
  if (!box.dataset.video) return
  const player = document.createElement('iframe')
  player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.video)}${play ? '?autoplay=1' : ''}`
  player.title = box.dataset.videoTitle ?? ''
  player.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  player.referrerPolicy = 'strict-origin-when-cross-origin'
  player.allowFullscreen = true
  player.className = 'h-full w-full border-0'
  box.replaceChildren(player)
  track('video_load', { video: box.dataset.video })
}

const loadAllVideos = () => {
  for (const box of document.querySelectorAll<HTMLElement>('[data-video]')) {
    if (!box.querySelector('iframe')) loadVideo(box, false)
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    notify(t('article.share.copied'))
    track('share', { method: 'copy' })
  } catch {
    notify(t('article.share.copyFailed'), 'i-lucide-circle-alert')
  }
}

async function share() {
  try {
    await navigator.share({ title: document.title, url: window.location.href })
    track('share', { method: 'native' })
  } catch (error) {
    // Closing the share sheet is not an error.
    if (!(error instanceof DOMException && error.name === 'AbortError'))
      notify(t('article.share.failed'), 'i-lucide-circle-alert')
  }
}

function onClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return
  const box = event.target.closest('[data-video-load]')?.closest<HTMLElement>('[data-video]')
  if (box) {
    event.preventDefault()
    loadVideo(box, true)
    return
  }
  if (event.target.closest('[data-share-copy]')) return void copyLink()
  if (event.target.closest('[data-share-native]')) return void share()
}

onMounted(() => {
  if (typeof navigator.share === 'function') {
    for (const button of document.querySelectorAll<HTMLElement>('[data-share-native]'))
      button.hidden = false
  }
  document.addEventListener('click', onClick)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  update()
  // With consent to external media, videos load directly (and as soon as it is given).
  watch(externalMedia, (allowed) => allowed && loadAllVideos(), { immediate: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClick)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div
    role="progressbar"
    :aria-label="t('article.progress')"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(progress * 100)"
    class="pointer-events-none fixed left-0 z-50 h-[3px] w-full"
    :style="{ top: `${header}px` }"
  >
    <div
      class="bg-primary h-full w-full origin-left"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>
