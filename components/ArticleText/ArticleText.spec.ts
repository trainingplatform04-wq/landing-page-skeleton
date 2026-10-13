import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ArticleText from './ArticleText.vue'

const block = (key: string, text: string, extra: Record<string, unknown> = {}) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
  ...extra,
})

const body = [
  block('b0', 'How much protein you need', { style: 'h2', anchor: 'how-much' }),
  { _type: 'coachTip', _key: 'b1', text: 'Cook twice.' },
  { _type: 'pullQuote', _key: 'b2', text: 'Protein is a habit.', attribution: 'Jonas Weber' },
  {
    _type: 'figure',
    _key: 'b3',
    image: { url: '/basics.jpg', alt: 'Six basics' },
    caption: 'Six basics, endless meals.',
  },
  { _type: 'youtubeVideo', _key: 'b4', videoId: 'M7lc1UVf-VE', title: 'Three lunches' },
]

describe('ArticleText', () => {
  it('gives the H2s their anchor ids', async () => {
    const wrapper = await mountSuspended(ArticleText, { props: { value: body } })

    expect(wrapper.find('h2').attributes('id')).toBe('how-much')
  })

  it('renders the coach tip, the pull quote and the figure with its caption', async () => {
    const wrapper = await mountSuspended(ArticleText, { props: { value: body } })

    expect(wrapper.find('aside').text()).toContain('Coach-Tipp')
    expect(wrapper.find('aside').text()).toContain('Cook twice.')
    expect(wrapper.find('blockquote').text()).toBe('Protein is a habit.')
    expect(wrapper.text()).toContain('Jonas Weber')
    expect(wrapper.find('img[alt="Six basics"]').attributes('loading')).toBe('lazy')
    expect(wrapper.text()).toContain('Six basics, endless meals.')
  })

  it('shows the video as a link to YouTube: no player and nothing loaded before the click', async () => {
    const wrapper = await mountSuspended(ArticleText, { props: { value: body } })

    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.find('[data-video]').attributes('data-video')).toBe('M7lc1UVf-VE')
    expect(wrapper.find('[data-video-load]').attributes('href')).toBe(
      'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    )
    expect(wrapper.text()).toContain('Beim Abspielen werden Daten an YouTube gesendet.')
  })
})
