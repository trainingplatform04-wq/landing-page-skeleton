import { flushPromises } from '@vue/test-utils'

/**
 * Reads the head tags Nuxt actually rendered into `document.head`, after the
 * head manager has flushed. Lets specs assert real output instead of mocking
 * `useHead`/`useSeoMeta`.
 */
export async function renderedHead() {
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 0))

  const attr = (selector: string, name: string) =>
    document.head.querySelector(selector)?.getAttribute(name) ?? undefined

  return {
    title: document.title,
    lang: document.documentElement.getAttribute('lang') ?? undefined,
    meta: (name: string) => attr(`meta[name="${name}"]`, 'content'),
    property: (property: string) => attr(`meta[property="${property}"]`, 'content'),
    links: (rel: string) =>
      [...document.head.querySelectorAll(`link[rel="${rel}"]`)].map((link) => ({
        hreflang: link.getAttribute('hreflang') ?? undefined,
        href: link.getAttribute('href') ?? undefined,
      })),
  }
}
