import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ArticleHero from './ArticleHero.vue'

const props = {
  title: 'Protein without powder',
  excerpt: 'Five meals ready in 15 minutes.',
  magazineTo: '/en/magazine',
  category: { title: 'Nutrition', to: '/en/magazine?category=nutrition' },
  author: { name: 'Jonas Weber', role: 'Nutrition coach' },
  date: '21 Sep 2026',
  dateTime: '2026-09-21T06:00:00Z',
  readingTime: '2 min read',
  cover: { url: '/cover.jpg', alt: 'A bowl' },
}

describe('ArticleHero', () => {
  it('shows the breadcrumb, the title as the only h1, the lead and the author row', async () => {
    const wrapper = await mountSuspended(ArticleHero, { props })

    const crumbs = wrapper.findAll('nav a')
    expect(crumbs.map((link) => link.attributes('href'))).toEqual([
      '/en/magazine',
      '/en/magazine?category=nutrition',
    ])
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Protein without powder')
    expect(wrapper.text()).toContain('Five meals ready in 15 minutes.')
    expect(wrapper.text()).toContain('Jonas Weber')
    expect(wrapper.text()).toContain('Nutrition coach')
    expect(wrapper.find('time').attributes('datetime')).toBe('2026-09-21T06:00:00Z')
  })

  it('loads the cover first', async () => {
    const wrapper = await mountSuspended(ArticleHero, { props })

    const cover = wrapper.find('img[alt="A bowl"]')
    expect(cover.attributes('fetchpriority')).toBe('high')
    expect(cover.attributes('loading')).not.toBe('lazy')
  })

  it('loads the author photo after the cover', async () => {
    const wrapper = await mountSuspended(ArticleHero, {
      props: { ...props, author: { ...props.author, photo: { url: '/jonas.jpg', alt: 'Jonas' } } },
    })

    expect(wrapper.find('img[alt="Jonas"]').attributes('loading')).toBe('lazy')
  })

  it('hides the breadcrumb, the badge, the author row and the cover when they are missing', async () => {
    const wrapper = await mountSuspended(ArticleHero, {
      props: { ...props, category: undefined, author: undefined, cover: undefined },
    })

    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Nutrition')
    expect(wrapper.find('time').exists()).toBe(false)
    expect(wrapper.find('img').exists()).toBe(false)
  })
})
