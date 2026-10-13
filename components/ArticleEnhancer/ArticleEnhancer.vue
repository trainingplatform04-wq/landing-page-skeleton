<script setup lang="ts">
import { ARTICLE_SLUGS_STATE } from '~/constants/article.constants'

/**
 * The article's interactions, added to the server-rendered article (ArticleContent never
 * hydrates): the reading progress bar, the current heading in the table of contents, the video
 * player after the click, and the share buttons with their toast. It finds the article's HTML
 * by its `data-` attributes; the only data it carries is the article's slug per language.
 */

const { t } = useI18n()
const slugs = useState<Record<string, { slug: string }>>(ARTICLE_SLUGS_STATE)
const setI18nParams = useSetI18nParams()
// The switcher links this article's own slug in the other language (set by ArticleContent).
if (slugs.value) setI18nParams(slugs.value)

const progress = ref(0)
const toast = ref('')
const header = ref(65)
let toastTimer: ReturnType<typeof setTimeout> | undefined
let frame = 0

const TOAST_MS = 4000
/** A heading is "being read" once its top passes this line below the header. */
const CURRENT_LINE = 120

function notify(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), TOAST_MS)
}

function update() {
  const text = document.querySelector<HTMLElement>('[data-article-text]')
  if (!text) return
  header.value = document.querySelector('header')?.getBoundingClientRect().height ?? header.value
  const { top, height } = text.getBoundingClientRect()
  const span = height - (window.innerHeight - header.value)
  progress.value = span <= 0 ? 1 : Math.min(1, Math.max(0, (header.value - top) / span))

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

function loadVideo(trigger: Element) {
  const box = trigger.closest<HTMLElement>('[data-video]')
  if (!box?.dataset.video) return
  const player = document.createElement('iframe')
  player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.video)}?autoplay=1`
  player.title = box.dataset.videoTitle ?? ''
  player.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  player.referrerPolicy = 'strict-origin-when-cross-origin'
  player.allowFullscreen = true
  player.className = 'h-full w-full border-0'
  box.replaceChildren(player)
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    notify(t('article.share.copied'))
  } catch {
    notify(t('article.share.copyFailed'))
  }
}

async function share() {
  try {
    await navigator.share({ title: document.title, url: window.location.href })
  } catch (error) {
    // Closing the share sheet is not an error.
    if (!(error instanceof DOMException && error.name === 'AbortError'))
      notify(t('article.share.failed'))
  }
}

function onClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return
  const video = event.target.closest('[data-video-load]')
  if (video) {
    event.preventDefault()
    loadVideo(video)
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
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClick)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  cancelAnimationFrame(frame)
  clearTimeout(toastTimer)
})
</script>

<template>
  <div>
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

    <Transition
      enter-from-class="translate-y-4 opacity-0"
      enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
      leave-to-class="opacity-0"
      leave-active-class="transition duration-200 ease-out motion-reduce:transition-none"
    >
      <div
        v-if="toast"
        role="status"
        class="border-default bg-default fixed bottom-6 left-1/2 z-[60] flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg"
      >
        <UIcon name="i-lucide-check" class="text-primary size-4 shrink-0" aria-hidden="true" />
        <span>{{ toast }}</span>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          :aria-label="t('article.share.dismiss')"
          @click="toast = ''"
        />
      </div>
    </Transition>
  </div>
</template>
