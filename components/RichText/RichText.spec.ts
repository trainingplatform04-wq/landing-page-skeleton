import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import RichText from './RichText.vue'

const block = (value: string, marks: string[] = [], markDefs: object[] = []) => ({
  _type: 'block',
  _key: value,
  style: 'normal',
  markDefs,
  children: [{ _type: 'span', _key: `${value}-span`, text: value, marks }],
})

const link = (key: string, href?: string, external = false) => ({
  _type: 'link',
  _key: key,
  href,
  external,
})

describe('RichText', () => {
  it('renders paragraphs', async () => {
    const wrapper = await mountSuspended(RichText, { props: { value: [block('Hello.')] } })

    expect(wrapper.find('p').text()).toBe('Hello.')
  })

  it('renders a resolved link, and a link without address as plain text', async () => {
    const wrapper = await mountSuspended(RichText, {
      props: {
        value: [
          block('Contact', ['m1'], [link('m1', '/kontakt')]),
          block('Gone', ['m2'], [link('m2')]),
        ],
      },
    })

    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.find('a').attributes('href')).toBe('/kontakt')
    expect(wrapper.text()).toContain('Gone')
  })

  it('opens an external website in a new tab', async () => {
    const wrapper = await mountSuspended(RichText, {
      props: { value: [block('Partner', ['m1'], [link('m1', 'https://example.com', true)])] },
    })

    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('renders images with their alternative text', async () => {
    const image = {
      _type: 'accessibleImage',
      _key: 'i1',
      url: 'https://cdn.sanity.io/x.jpg',
      alt: 'Gym',
    }
    const wrapper = await mountSuspended(RichText, { props: { value: [image] } })

    expect(wrapper.find('img').attributes('alt')).toBe('Gym')
  })

  it('renders nothing without text', async () => {
    const wrapper = await mountSuspended(RichText, { props: { value: [] } })

    expect(wrapper.text()).toBe('')
  })
})
