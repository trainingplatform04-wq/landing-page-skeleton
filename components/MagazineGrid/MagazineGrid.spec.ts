import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import MagazineGrid from './MagazineGrid.vue'

const tabs = [
  { label: 'All', to: '/en/magazine', active: false },
  { label: 'Training', to: '/en/magazine?category=training', active: true },
]

const post = {
  id: 'p1',
  title: 'Morning mobility',
  excerpt: 'Wake up your hips.',
  to: '/en/magazine/morning-mobility',
  date: '7 Sep 2026',
  dateTime: '2026-09-07',
  readingTime: '1 min read',
}

const props = {
  tabs,
  posts: [post],
  pages: [],
  page: 1,
  allTo: '/en/magazine',
  filtered: true,
  hasFeatured: false,
}

describe('MagazineGrid', () => {
  it('links every category and marks the active one', async () => {
    const wrapper = await mountSuspended(MagazineGrid, { props, route: '/en/magazine' })
    const links = wrapper.findAll('nav a')

    expect(links.map((link) => [link.text(), link.attributes('href')])).toEqual([
      ['All', '/en/magazine'],
      ['Training', '/en/magazine?category=training'],
    ])
    expect(links[1]?.attributes('aria-current')).toBe('page')
    expect(wrapper.text()).toContain('Morning mobility')
  })

  it('offers all articles when the category has none', async () => {
    const wrapper = await mountSuspended(MagazineGrid, {
      props: { ...props, posts: [] },
      route: '/en/magazine',
    })

    expect(wrapper.text()).toContain('No articles in this category yet.')
    expect(wrapper.find('a[href="/en/magazine"]').exists()).toBe(true)
  })

  it('says there are no articles yet when the magazine is empty', async () => {
    const wrapper = await mountSuspended(MagazineGrid, {
      props: { ...props, posts: [], filtered: false },
      route: '/en/magazine',
    })

    expect(wrapper.text()).toContain('No articles yet.')
    expect(wrapper.text()).not.toContain('All articles')
  })

  it('paginates with links when there is more than one page', async () => {
    const wrapper = await mountSuspended(MagazineGrid, {
      props: { ...props, pages: ['/en/magazine', '/en/magazine?page=2'] },
      route: '/en/magazine',
    })

    expect(wrapper.find('a[href="/en/magazine?page=2"]').exists()).toBe(true)
  })
})
