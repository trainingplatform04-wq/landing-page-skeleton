import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ArticleEnhancer from './ArticleEnhancer.vue'

/** The server-rendered article the enhancer works on (ArticleBody and ArticleText). */
function article() {
  document.body.innerHTML = `
    <div data-article-text>
      <h2 id="first">First</h2>
      <div data-video="M7lc1UVf-VE" data-video-title="Three lunches">
        <a data-video-load href="https://www.youtube.com/watch?v=M7lc1UVf-VE">Load video</a>
      </div>
    </div>
    <a data-toc-link href="#first">First</a>
    <button data-share-copy>Copy link</button>
    <button data-share-native hidden>Share</button>`
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('ArticleEnhancer', () => {
  it('shows the reading progress bar', async () => {
    article()
    const wrapper = await mountSuspended(ArticleEnhancer)

    const bar = wrapper.find('[role="progressbar"]')
    expect(bar.attributes('aria-label')).toBe('Lesefortschritt des Artikels')
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuemax')).toBe('100')
  })

  it('marks the first heading as current at the top of the article', async () => {
    article()
    await mountSuspended(ArticleEnhancer)

    expect(document.querySelector('[data-toc-link]')?.getAttribute('aria-current')).toBe('location')
  })

  it('replaces the video poster with the privacy-friendly player on click', async () => {
    article()
    await mountSuspended(ArticleEnhancer)

    document.querySelector<HTMLElement>('[data-video-load]')!.click()

    const player = document.querySelector('iframe')
    expect(player?.src).toBe('https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=1')
    expect(player?.title).toBe('Three lunches')
  })

  it('copies the link and confirms it in a toast', async () => {
    article()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    await mountSuspended(ArticleEnhancer)

    document.querySelector<HTMLElement>('[data-share-copy]')!.click()
    await vi.waitFor(() =>
      expect(useToast().toasts.value.at(-1)).toMatchObject({ title: 'Link kopiert' }),
    )

    expect(writeText).toHaveBeenCalledWith(window.location.href)
  })

  it('shows the native share button only where the browser can share', async () => {
    article()
    vi.stubGlobal('navigator', { ...navigator, share: vi.fn() })
    await mountSuspended(ArticleEnhancer)

    expect(document.querySelector<HTMLElement>('[data-share-native]')!.hidden).toBe(false)
  })
})
